#!/usr/bin/env node
// tools/legacy/census.cjs — censo de los tests del legado de QwenPaw contra DEV (MIG-4a, BL-043, DEC-029).
//
// Por qué existe: gw2-wallet-agents tiene ~90 archivos de tests (~1,1 MB). Copiarlos a
// mano pasando por la Factory es caro y propenso a errores. Este script corre en CI
// (.github/workflows/legacy-tests.yml): copia cada test del legado a una copia de DEV,
// lo corre ahí y también en el legado, y escribe un informe corto (CENSO.md). Con eso
// se decide, archivo por archivo, qué se migra, qué se adapta y qué se descarta.
//
// Los tests del legado NO usan node:test: son scripts que imprimen líneas "OK ..." o
// "FAIL ..." y algunos terminan con código 0 aunque fallen. Por eso se miran las dos
// señales: el código de salida y las líneas FAIL.
//
// Uso:
//   node tools/legacy/census.cjs --legacy <repo legado> --dev <repo DEV> --out <CENSO.md>
//        [--timeout <s>] [--jobs <n>] [--ref <commit del legado>]
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

// tests/_run-all.js (el agregador del legado) no entra: no termina en .test.js.
const TEST_RE = /(\.test\.js|\.smoke\.js|\.mjs)$/;
const COPY_EXCLUDE = new Set(['.git', 'node_modules', '_legacy', '_site']);

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i > 0 && i + 1 < process.argv.length ? process.argv[i + 1] : def;
}

function listTests(legacyDir) {
  const dir = path.join(legacyDir, 'tests');
  return fs.readdirSync(dir).filter(f => TEST_RE.test(f)).sort();
}

// Archivos de la app que un test nombra (js/x.js, css/x.css, index.html, assets/...).
function referencedFiles(src) {
  const out = new Set();
  for (const m of src.matchAll(/['"`/\\]((?:js|css|assets)\/[\w./-]+\.\w+|index\.html)['"`]/g)) out.add(m[1]);
  for (const m of src.matchAll(/['"`](js|css)['"`]\s*,\s*['"`]([\w.-]+\.\w+)['"`]/g)) out.add(m[1] + '/' + m[2]);
  return [...out].sort();
}

function sameFile(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return null;
  return fs.readFileSync(a).equals(fs.readFileSync(b));
}

// Cuenta líneas de veredicto. Una línea de resumen ("pass: 3 | FAIL: 0", "12 OK / 0 FAIL")
// no es una aserción: si tiene un número antes de FAIL, se usa como resumen.
function verdicts(output) {
  let ok = 0, fail = 0, summaryFail = null;
  for (const raw of output.split(/\r?\n/)) {
    const t = raw.trim();
    const s = t.match(/(\d+)\s*FAIL\b/i) || t.match(/FAIL:\s*(\d+)/i);
    if (s && /\d+\s*(OK|pass|aserciones?)\b|pass:\s*\d+/i.test(t)) { summaryFail = Number(s[1]); continue; }
    if (/^(OK|PASS)\b/i.test(t)) ok++;
    else if (/^FAIL\b/i.test(t)) fail++;
    else if (/^not ok\b/.test(t)) fail++;
  }
  if (summaryFail !== null && fail === 0) fail = summaryFail;
  return { ok, fail };
}

function classify(r) {
  if (r.timedOut) return 'TIEMPO';
  const m = r.output.match(/Cannot find module '([^']+)'/);
  if (m && !/^[./]/.test(m[1])) return 'DEPENDENCIA';
  if (r.code === 0 && r.fail > 0) return 'MIENTE';
  if (r.code === 0) return 'VERDE';
  return 'ROJO';
}

function lastLines(output, n) {
  return output.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(-n)
    .map(l => l.replace(/\|/g, '/').replace(/`/g, "'").slice(0, 160));
}

function runOne(cwd, file, timeoutMs) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [path.join('tests', file)], { cwd, env: { ...process.env, CI: '1' } });
    let output = '', timedOut = false;
    child.stdout.on('data', d => { output += d; });
    child.stderr.on('data', d => { output += d; });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
    child.on('close', code => {
      clearTimeout(timer);
      const v = verdicts(output);
      const r = { code: timedOut ? null : code, timedOut, output, ...v };
      r.state = classify(r);
      resolve(r);
    });
  });
}

async function pool(items, jobs, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() { while (next < items.length) { const i = next++; results[i] = await fn(items[i]); } }
  await Promise.all(Array.from({ length: Math.max(1, jobs) }, worker));
  return results;
}

function copyTree(src, dst) {
  fs.cpSync(src, dst, { recursive: true, filter: s => s === src || !COPY_EXCLUDE.has(path.basename(s)) });
}

async function census({ legacy, dev, timeoutMs = 60000, jobs = 4 }) {
  const files = listTests(legacy);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'censo-'));
  const devCopy = path.join(work, 'dev');
  try {
    copyTree(dev, devCopy);
    fs.mkdirSync(path.join(devCopy, 'tests'), { recursive: true });
    // Los tests del legado van al lado de los de DEV, con sus fixtures, sin pisar nada.
    for (const f of files) fs.copyFileSync(path.join(legacy, 'tests', f), path.join(devCopy, 'tests', f));
    const fx = path.join(legacy, 'tests', 'fixtures');
    if (fs.existsSync(fx)) fs.cpSync(fx, path.join(devCopy, 'tests', 'fixtures'), { recursive: true });
    return await pool(files, jobs, async f => {
      const src = fs.readFileSync(path.join(legacy, 'tests', f), 'utf8');
      const refs = referencedFiles(src);
      const changed = refs.filter(r => sameFile(path.join(legacy, r), path.join(dev, r)) === false);
      const missing = refs.filter(r => !fs.existsSync(path.join(dev, r)));
      const inLegacy = await runOne(legacy, f, timeoutMs);
      const inDev = await runOne(devCopy, f, timeoutMs);
      return { file: f, size: Buffer.byteLength(src), refs, changed, missing, legacy: inLegacy, dev: inDev };
    });
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

const STATES = ['VERDE', 'ROJO', 'MIENTE', 'TIEMPO', 'DEPENDENCIA'];

function report(rows, { ref = '', date = new Date().toISOString() } = {}) {
  const count = (k, s) => rows.filter(r => r[k].state === s).length;
  const L = [];
  L.push('# Censo de los tests del legado contra DEV');
  L.push('');
  L.push('Generado por `tools/legacy/census.cjs` en CI (`.github/workflows/legacy-tests.yml`). No editar a mano.');
  L.push('');
  L.push('- Fecha: ' + date);
  if (ref) L.push('- Legado: gw2-wallet-agents @ `' + ref.slice(0, 7) + '`');
  L.push('- Archivos: ' + rows.length);
  L.push('- En el legado: ' + STATES.map(s => s + ' ' + count('legacy', s)).join(' · '));
  L.push('- En DEV: ' + STATES.map(s => s + ' ' + count('dev', s)).join(' · '));
  L.push('');
  L.push('Estados: VERDE sale con 0 y sin FAIL · ROJO sale con error · MIENTE sale con 0 pero imprime FAIL · TIEMPO no terminó · DEPENDENCIA le falta un paquete.');
  L.push('');
  L.push('| Archivo | KB | Legado | DEV | OK/FAIL en DEV | Archivos de la app distintos en DEV | Faltan en DEV |');
  L.push('|---|---|---|---|---|---|---|');
  for (const r of rows) {
    L.push('| `' + r.file + '` | ' + (r.size / 1024).toFixed(1) + ' | ' + r.legacy.state + ' | ' + r.dev.state + ' | ' +
      r.dev.ok + '/' + r.dev.fail + ' | ' + (r.changed.join(', ') || '—') + ' | ' + (r.missing.join(', ') || '—') + ' |');
  }
  L.push('');
  L.push('## Salida de los que no están en VERDE en DEV');
  L.push('');
  for (const r of rows.filter(x => x.dev.state !== 'VERDE')) {
    L.push('### ' + r.file + ' — ' + r.dev.state + (r.dev.code !== null ? ' (código ' + r.dev.code + ')' : ''));
    L.push('');
    lastLines(r.dev.output, 6).forEach(l => L.push('    ' + l));
    L.push('');
  }
  return L.join('\n') + '\n';
}

// Lista de importación (tools/legacy/importar.txt): un archivo por línea; '#' comenta.
function readList(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map(l => l.replace(/#.*/, '').trim()).filter(Boolean);
}

// Una entrada de la lista es un test (nombre suelto, va a tests/) o una herramienta
// que un test necesita (tools/<archivo>.mjs|.cjs|.js, un solo nivel, va al mismo lugar).
const TOOL_RE = /^tools\/[\w.-]+\.(mjs|cjs|js)$/;
function entryPath(n) { return TOOL_RE.test(n) ? n : path.join('tests', n); }

// MIG-4b: copia a DEV los tests de la lista, desde el legado fijado, y los corre en DEV.
// Si alguno no queda en VERDE, no deja nada copiado y falla: a main solo llega lo que pasa.
async function importTests({ legacy, dev, list, timeoutMs = 60000 }) {
  const names = readList(list);
  const bad = names.filter(n => !TOOL_RE.test(n) && (!TEST_RE.test(n) || n !== path.basename(n)));
  if (bad.length) throw new Error('nombres no válidos en la lista: ' + bad.join(', '));
  const absent = names.filter(n => !fs.existsSync(path.join(legacy, entryPath(n))));
  if (absent.length) throw new Error('no están en el legado: ' + absent.join(', '));
  const copied = [], unchanged = [], written = [];
  for (const n of names) {
    const src = path.join(legacy, entryPath(n)), dst = path.join(dev, entryPath(n));
    if (sameFile(src, dst)) { unchanged.push(n); continue; }
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst); copied.push(n); written.push(dst);
  }
  const tests = names.filter(n => !TOOL_RE.test(n));
  const fx = path.join(legacy, 'tests', 'fixtures');
  const usesFixtures = tests.some(n => /fixtures/.test(fs.readFileSync(path.join(legacy, 'tests', n), 'utf8')));
  if (usesFixtures && fs.existsSync(fx)) {
    for (const f of fs.readdirSync(fx)) {
      const dst = path.join(dev, 'tests', 'fixtures', f);
      if (sameFile(path.join(fx, f), dst)) continue;
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(path.join(fx, f), dst); written.push(dst);
    }
  }
  const results = await pool(tests, 4, async n => ({ n, r: await runOne(dev, n, timeoutMs) }));
  const failed = results.filter(x => x.r.state !== 'VERDE');
  if (failed.length) {
    written.forEach(f => fs.rmSync(f, { force: true }));
    throw new Error('no pasan en DEV, no se importa nada: ' + failed.map(x => x.n + ' (' + x.r.state + ')').join(', '));
  }
  return { copied, unchanged };
}

module.exports = { listTests, referencedFiles, verdicts, classify, census, report, readList, importTests };

if (require.main === module && process.argv.includes('--import')) {
  importTests({ legacy: arg('--legacy'), dev: arg('--dev'), list: arg('--import'), timeoutMs: Number(arg('--timeout', '60')) * 1000 })
    .then(r => console.log('Importados: ' + r.copied.length + ' nuevos o cambiados, ' + r.unchanged.length + ' sin cambios'))
    .catch(e => { console.error('ImportError: ' + e.message); process.exit(1); });
} else if (require.main === module) {
  const legacy = arg('--legacy'), dev = arg('--dev'), out = arg('--out');
  if (!legacy || !dev || !out) {
    console.error('Uso: census.cjs --legacy <dir> --dev <dir> --out <archivo> [--timeout s] [--jobs n] [--ref sha]');
    console.error('     census.cjs --import <lista> --legacy <dir> --dev <dir> [--timeout s]');
    process.exit(2);
  }
  census({ legacy, dev, timeoutMs: Number(arg('--timeout', '60')) * 1000, jobs: Number(arg('--jobs', '4')) })
    .then(rows => {
      fs.writeFileSync(out, report(rows, { ref: arg('--ref', '') }));
      const v = rows.filter(r => r.dev.state === 'VERDE').length;
      console.log('Censo: ' + rows.length + ' archivos, ' + v + ' en VERDE contra DEV -> ' + out);
    })
    .catch(e => { console.error(e); process.exit(1); });
}
