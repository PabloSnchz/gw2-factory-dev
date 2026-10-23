// Diagnóstico de la Factory (BL-066, LES-031). Lo corre factory-diagnose.yml.
// La Factory no lee CI (RSK-016): pide correr tests concretos con
// factory/diagnose/RUN-NNN.json y el resultado queda en OUT-NNN.md.
// Solo lectura: no modifica nada del repo salvo el OUT. Solo archivos de tests/.
//
// RUN-NNN.json: { "id": "RUN-001", "summary": "...", "tests": ["tests/a.test.js", ...] }
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DIR = 'factory/diagnose';
const RUN_RE = /^RUN-(\d{3,})\.json$/;
const TEST_RE = /^tests\/[\w.-]+\.(test|smoke)\.(c?js)$/;
const MAX_TESTS = 10;
const MAX_OUT = 12000;

function pending(root) {
  const dir = path.join(root, DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => RUN_RE.test(f) && !fs.existsSync(path.join(dir, f.replace(RUN_RE, 'OUT-$1.md'))))
    .sort((a, b) => Number(RUN_RE.exec(a)[1]) - Number(RUN_RE.exec(b)[1]))
    .map((f) => DIR + '/' + f);
}

function validate(req) {
  if (!req || typeof req !== 'object' || Array.isArray(req)) return ['el pedido no es un objeto'];
  const errs = [];
  if (!/^RUN-\d{3,}$/.test(String(req.id || ''))) errs.push('id inválido (se espera RUN-NNN)');
  if (!Array.isArray(req.tests) || !req.tests.length) return errs.concat('tests vacío');
  if (req.tests.length > MAX_TESTS) errs.push('demasiados tests (' + req.tests.length + ' > ' + MAX_TESTS + ')');
  req.tests.forEach((t) => { if (!TEST_RE.test(String(t))) errs.push('test no permitido: ' + String(t)); });
  return errs;
}

// Recorta por el medio: el principio dice qué corrió y el final, el resumen.
function clip(s) {
  s = String(s || '');
  if (s.length <= MAX_OUT) return s;
  const h = Math.floor(MAX_OUT / 2);
  return s.slice(0, h) + '\n[… ' + (s.length - MAX_OUT) + ' caracteres recortados …]\n' + s.slice(-h);
}

function runOne(root, t) {
  if (!fs.existsSync(path.join(root, t))) return { test: t, status: null, out: 'no existe' };
  const env = Object.assign({}, process.env);
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, [t], { cwd: root, env, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024 });
  return { test: t, status: r.status, out: clip(String(r.stdout || '') + String(r.stderr || '')) };
}

function report(req, errs, runs, when) {
  const id = req && /^RUN-\d{3,}$/.test(String(req.id || '')) ? req.id : 'RUN-???';
  const L = ['# OUT de ' + id, '', '- Fecha: ' + when];
  if (req && typeof req.summary === 'string') L.push('- Pedido: ' + req.summary.replace(/\s+/g, ' ').trim());
  L.push('- Node: ' + process.version, '');
  if (errs.length) {
    L.push('Pedido rechazado, no se corrió nada:', '');
    errs.forEach((e) => L.push('- ' + e));
  } else {
    runs.forEach((r) => {
      L.push('## ' + r.test + ' — ' + (r.status === 0 ? 'PASA' : r.status === null ? 'NO CORRIÓ' : 'FALLA (código ' + r.status + ')'), '');
      L.push('````text', r.out.replace(/````/g, '``\u200b``'), '````', '');
    });
  }
  return L.join('\n') + '\n';
}

function processAll(root, now) {
  now = now || (() => new Date().toISOString());
  return pending(root).map((rf) => {
    let req = null;
    let errs;
    try { req = JSON.parse(fs.readFileSync(path.join(root, rf), 'utf8')); errs = validate(req); }
    catch (e) { errs = ['no pude leer el pedido: ' + e.message]; }
    const runs = errs.length ? [] : req.tests.map((t) => runOne(root, t));
    const out = rf.replace(/RUN-(\d+)\.json$/, 'OUT-$1.md');
    fs.writeFileSync(path.join(root, out), report(req, errs, runs, now()), 'utf8');
    return out;
  });
}

module.exports = { pending, validate, clip, runOne, report, processAll, MAX_OUT, MAX_TESTS };

if (require.main === module) {
  const outs = processAll(process.cwd());
  const tmp = process.env.RUNNER_TEMP || require('node:os').tmpdir();
  fs.writeFileSync(path.join(tmp, 'factory-diagnose-files.txt'), outs.join('\n') + (outs.length ? '\n' : ''));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'count=' + outs.length + '\n');
  console.log(outs.length ? outs.join('\n') : 'Sin pedidos pendientes.');
}
