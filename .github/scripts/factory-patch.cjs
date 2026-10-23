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

// La misma suite que app-checks.yml.
function suite(root) {
  const r = spawnSync('bash', ['-c', 'shopt -s nullglob; node --test tests/*.test.cjs tests/*.test.js tests/*.smoke.js'],
    { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const out = String(r.stdout || '') + String(r.stderr || '');
  const m = /ℹ fail (\d+)/.exec(out);
  return { ok: r.status === 0, fails: m ? Number(m[1]) : null };
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
        if (base.ok && !after.ok) errs = ['la suite de tests pasaba y con el parche falla (' + (after.fails === null ? '?' : after.fails) + ' fallas)'];
      }
      if (errs.length) {
        backup.forEach((b) => fs.writeFileSync(path.join(root, b.path), b.data));
        outcome = { ok: false, errors: errs };
      } else {
        notes.push(base.ok ? 'Suite de tests: verde antes y después.' :
          'Suite de tests: ya estaba en rojo antes del parche (' + (base.fails === null ? '?' : base.fails) +
          ' fallas); se validó con node --check.');
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

module.exports = { pending, needsPages, jsCheck, suite, processAll, verifyStaged, message };

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
