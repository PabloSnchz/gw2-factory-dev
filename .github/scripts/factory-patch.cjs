// Ejecutor del canal de parches (DEC-035, BL-065, FP-2). Lo corre factory-patch.yml.
// Procesa TODOS los parches pendientes (PATCH-NNN.json sin RESULT-NNN.md) del main
// actual, en orden numérico. Así una corrida cancelada por la cola de GitHub no
// pierde nada: la siguiente los encuentra pendientes (idempotente).
//
// Por parche: plan (apply-patch.cjs: ancla única, sha base, todo o nada) → escribe →
// valida (node --check de los .js y la suite de tests) → si algo falla, restaura los
// archivos byte a byte y lo rechaza. El RESULT queda escrito siempre.
// La suite se compara contra sí misma antes del parche: si ya estaba en rojo, no
// culpa al parche (lo anota) y valida solo con node --check.
//
// No hace git: deja la lista de archivos a commitear, el mensaje y si hay que
// republicar DEV. `verifyStaged` comprueba que no se cuele nada más.
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const AP = require('./apply-patch.cjs');

const DIR = 'factory/patches';
const PATCH_RE = /^PATCH-(\d{3,})\.json$/;

function pending(root) {
  const dir = path.join(root, DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => PATCH_RE.test(f) && !fs.existsSync(path.join(dir, f.replace(PATCH_RE, 'RESULT-$1.md'))))
    .sort((a, b) => Number(PATCH_RE.exec(a)[1]) - Number(PATCH_RE.exec(b)[1]))
    .map((f) => DIR + '/' + f);
}

// Lo mismo que excluye dev-pages.yml (paths-ignore): si solo cambia eso, DEV no se republica.
function needsPages(paths) {
  return paths.some((p) => !/^(ai-memory|tests|tools)\//.test(p) && !/\.md$/.test(p));
}

function jsCheck(root, files) {
  const errs = [];
  files.filter((p) => /\.(c|m)?js$/.test(p)).forEach((p) => {
    const r = spawnSync(process.execPath, ['--check', path.join(root, p)], { encoding: 'utf8' });
    if (r.status !== 0) {
      const lines = String(r.stderr || '').split('\n').map((l) => l.trim()).filter(Boolean);
      errs.push('node --check ' + p + ': ' + (lines.find((l) => /Error\b/.test(l)) || lines[0] || 'falló'));
    }
  });
  return errs;
}

// Lee la salida TAP de node --test: cuántas fallas y cuáles, como «archivo: prueba».
// Las pruebas de primer nivel van sin sangría; el archivo sale de su `location:`
// (un archivo que revienta al cargar aparece con su ruta como nombre).
function parseTap(out) {
  const m = /^# fail (\d+)$/m.exec(out);
  const lines = out.split('\n');
  const failing = [];
  lines.forEach((l, i) => {
    const f = /^not ok \d+ - (.+?)(?: # .*)?$/.exec(l);
    if (!f) return;
    let file = '';
    for (let j = i + 1; j < lines.length && /^\s/.test(lines[j]); j++) {
      const loc = /^ {2}location: '.*?(tests\/[^:']+)/.exec(lines[j]);
      if (loc) { file = loc[1]; break; }
    }
    const id = file && file !== f[1] ? file + ': ' + f[1] : f[1];
    if (failing.indexOf(id) === -1) failing.push(id);
  });
  return { fails: m ? Number(m[1]) : null, failing };
}

// La misma suite que app-checks.yml, con salida TAP explícita (en Node 22 sin TTY ya es TAP;
// en Node 23+ no: así se lee igual en todos lados).
function suite(root) {
  // Sin NODE_TEST_CONTEXT: si este proceso corre dentro de node --test, el hijo heredaría
  // el modo «subproceso» y no imprimiría TAP.
  const env = Object.assign({}, process.env);
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync('bash', ['-c', 'shopt -s nullglob; node --test --test-reporter=tap tests/*.test.cjs tests/*.test.js tests/*.smoke.js'],
    { cwd: root, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const t = parseTap(String(r.stdout || '') + String(r.stderr || ''));
  return { ok: r.status === 0, fails: t.fails, failing: t.failing };
}

function describe(s) {
  const n = s.fails === null ? '?' : s.fails;
  const list = (s.failing || []).slice(0, 10);
  return n + ' fallas' + (list.length ? ': ' + list.join(', ') + ((s.failing.length > 10) ? '…' : '') : '');
}

// Archivos que fallan después y no fallaban antes.
function newFailures(base, after) {
  return (after.failing || []).filter((f) => (base.failing || []).indexOf(f) === -1);
}

function processAll(root, deps) {
  deps = Object.assign({ jsCheck, suite, now: () => new Date().toISOString() }, deps || {});
  const files = [];
  const results = [];
  let base = null; // estado de la suite antes del próximo parche; se mide recién si hace falta
  pending(root).forEach((pf) => {
    const id = path.basename(pf, '.json');
    let patch = null;
    let outcome;
    const notes = [];
    try {
      patch = JSON.parse(fs.readFileSync(path.join(root, pf), 'utf8'));
      outcome = AP.plan(patch, (p) => {
        const abs = path.join(root, p);
        return fs.existsSync(abs) ? fs.readFileSync(abs) : null;
      });
    } catch (e) {
      outcome = { ok: false, errors: ['no pude leer el parche: ' + e.message] };
    }
    if (outcome.ok) {
      if (!base) base = deps.suite(root);
      const backup = outcome.files.map((f) => ({ path: f.path, data: fs.readFileSync(path.join(root, f.path)) }));
      outcome.files.forEach((f) => fs.writeFileSync(path.join(root, f.path), f.content, 'utf8'));
      const touched = outcome.files.map((f) => f.path);
      let errs = deps.jsCheck(root, touched);
      let after = null;
      if (!errs.length) {
        after = deps.suite(root);
        const fresh = newFailures(base, after);
        if (base.ok && !after.ok) errs = ['la suite de tests pasaba y con el parche falla (' + describe(after) + ')'];
        else if (!after.ok && fresh.length) errs = ['con el parche fallan archivos de tests que antes pasaban: ' + fresh.join(', ')];
      }
      if (errs.length) {
        backup.forEach((b) => fs.writeFileSync(path.join(root, b.path), b.data));
        outcome = { ok: false, errors: errs };
      } else {
        notes.push(base.ok ? 'Suite de tests: verde antes y después.' :
          'Suite de tests: ya estaba en rojo antes del parche (' + describe(base) +
          '); el parche no rompió ningún archivo nuevo y pasó node --check.');
        base = after;
        touched.forEach((p) => { if (files.indexOf(p) === -1) files.push(p); });
      }
    }
    let md = AP.result(patch, outcome, deps.now());
    if (notes.length) md += '\n' + notes.map((n) => '- ' + n).join('\n') + '\n';
    const rf = pf.replace(/PATCH-(\d+)\.json$/, 'RESULT-$1.md');
    fs.writeFileSync(path.join(root, rf), md, 'utf8');
    results.push({ id, result: rf, ok: outcome.ok });
  });
  return { files, results, pages: needsPages(files) };
}

// Lo que se va a commitear tiene que ser exactamente lo esperado: RESULT nuevos y archivos parcheados.
function verifyStaged(staged, run) {
  const ok = new Set(run.files.concat(run.results.map((r) => r.result)));
  const extra = staged.filter((p) => p && !ok.has(p));
  const bad = staged.filter((p) => /^\.github\//.test(p) || (/^factory\//.test(p) && !/^factory\/patches\/RESULT-\d{3,}\.md$/.test(p)));
  return extra.concat(bad.filter((p) => extra.indexOf(p) === -1));
}

function message(run) {
  const head = 'factory-patch: ' + run.results.map((r) => r.id + (r.ok ? ' aplicado' : ' rechazado')).join(', ');
  return head + '\n\nCanal de parches (DEC-035). Detalle en ' + run.results.map((r) => r.result).join(', ') + '.\n';
}

module.exports = { pending, needsPages, jsCheck, parseTap, suite, describe, newFailures, processAll, verifyStaged, message };

if (require.main === module) {
  const root = process.cwd();
  const tmp = process.env.RUNNER_TEMP || require('node:os').tmpdir();
  if (process.argv[2] === '--verify-staged') {
    const run = JSON.parse(fs.readFileSync(path.join(tmp, 'factory-patch.json'), 'utf8'));
    const staged = fs.readFileSync(0, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
    const bad = verifyStaged(staged, run);
    if (bad.length) { console.error('Cambios no esperados: ' + bad.join(', ')); process.exit(1); }
    console.log('OK: ' + staged.length + ' archivos esperados');
    process.exit(0);
  }
  const run = processAll(root);
  fs.writeFileSync(path.join(tmp, 'factory-patch.json'), JSON.stringify(run));
  fs.writeFileSync(path.join(tmp, 'factory-patch-files.txt'), run.files.concat(run.results.map((r) => r.result)).join('\n') + '\n');
  fs.writeFileSync(path.join(tmp, 'factory-patch-msg.txt'), message(run));
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'count=' + run.results.length + '\npages=' + (run.pages ? 'true' : 'false') + '\n');
  }
  run.results.forEach((r) => console.log(r.id + ': ' + (r.ok ? 'APLICADO' : 'RECHAZADO') + ' → ' + r.result));
  if (!run.results.length) console.log('Sin parches pendientes.');
}
