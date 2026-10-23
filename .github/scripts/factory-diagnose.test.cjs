// Diagnóstico de la Factory (BL-066). Corre con: node --test .github/scripts/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const D = require('./factory-diagnose.cjs');

function repo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'diag-'));
  Object.keys(files).forEach((p) => {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), files[p]);
  });
  return root;
}
const read = (root, p) => fs.readFileSync(path.join(root, p), 'utf8');
const now = () => '2026-10-23T20:00:00Z';

test('pedido válido: solo archivos de tests/, como mucho 10', () => {
  assert.deepEqual(D.validate({ id: 'RUN-001', tests: ['tests/a.test.js', 'tests/b.test.cjs', 'tests/c.smoke.js'] }), []);
  assert.deepEqual(D.validate(null), ['el pedido no es un objeto']);
  assert.match(D.validate({ id: 'RUN-1', tests: ['tests/a.test.js'] }).join(), /id inválido/);
  assert.match(D.validate({ id: 'RUN-001', tests: [] }).join(), /tests vacío/);
  ['js/app.js', '../x.test.js', 'tests/../js/a.test.js', 'tests/a.js', '.github/scripts/x.test.cjs', 'tests/sub/a.test.js', 'tests/a.test.js; rm -rf'].forEach((t) =>
    assert.match(D.validate({ id: 'RUN-001', tests: [t] }).join(), /test no permitido/, t));
  const many = Array.from({ length: 11 }, (_, i) => 'tests/t' + i + '.test.js');
  assert.match(D.validate({ id: 'RUN-001', tests: many }).join(), /demasiados tests \(11 > 10\)/);
  assert.deepEqual(D.validate({ id: 'RUN-001', tests: many.slice(1) }), []);
});

test('corre los tests de verdad y deja la salida completa con su estado', () => {
  const root = repo({
    'tests/ok.test.js': "console.log('  PASS  todo bien');\n",
    'tests/mal.test.js': "console.log('  FAIL  la seccion 6 -> inesperados: x.js');\nprocess.exit(1);\n",
    'factory/diagnose/RUN-001.json': JSON.stringify({ id: 'RUN-001', summary: 'prueba\nde dos', tests: ['tests/ok.test.js', 'tests/mal.test.js', 'tests/no.test.js'] })
  });
  assert.deepEqual(D.processAll(root, now), ['factory/diagnose/OUT-001.md']);
  const md = read(root, 'factory/diagnose/OUT-001.md');
  assert.match(md, /^# OUT de RUN-001\n\n- Fecha: 2026-10-23T20:00:00Z\n- Pedido: prueba de dos\n- Node: v\d+/);
  assert.match(md, /## tests\/ok\.test\.js — PASA\n\n````text\n  PASS  todo bien\n/);
  assert.match(md, /## tests\/mal\.test\.js — FALLA \(código 1\)\n\n````text\n  FAIL  la seccion 6 -> inesperados: x\.js\n/);
  assert.match(md, /## tests\/no\.test\.js — NO CORRIÓ\n\n````text\nno existe\n/);
  assert.deepEqual(D.pending(root), [], 'con OUT ya no está pendiente');
  assert.deepEqual(D.processAll(root, now), []);
});

test('pedido rechazado o JSON roto: OUT con el motivo, sin correr nada', () => {
  const root = repo({ 'tests/x.test.js': "require('fs').writeFileSync('corrio', '1');\n",
    'factory/diagnose/RUN-001.json': JSON.stringify({ id: 'RUN-001', tests: ['js/app.js', 'tests/x.test.js'] }),
    'factory/diagnose/RUN-002.json': '{ roto' });
  D.processAll(root, now);
  assert.match(read(root, 'factory/diagnose/OUT-001.md'), /Pedido rechazado, no se corrió nada:\n\n- test no permitido: js\/app\.js\n/);
  assert.match(read(root, 'factory/diagnose/OUT-002.md'), /^# OUT de RUN-\?\?\?[\s\S]*no pude leer el pedido/);
  assert.equal(fs.existsSync(path.join(root, 'corrio')), false);
});

test('pendientes en orden numérico; la salida larga se recorta por el medio', () => {
  const root = repo({ 'factory/diagnose/RUN-010.json': '{}', 'factory/diagnose/RUN-009.json': '{}',
    'factory/diagnose/OUT-009.md': 'x', 'factory/diagnose/RUN-1000.json': '{}', 'factory/diagnose/README.md': 'x' });
  assert.deepEqual(D.pending(root), ['factory/diagnose/RUN-010.json', 'factory/diagnose/RUN-1000.json']);
  assert.equal(D.clip('abc'), 'abc');
  const big = 'A'.repeat(D.MAX_OUT) + 'Z';
  const c = D.clip(big);
  assert.ok(c.startsWith('A'.repeat(D.MAX_OUT / 2)));
  assert.ok(c.endsWith('Z'));
  assert.match(c, /\[… 1 caracteres recortados …\]/);
});

test('la salida no puede cerrar el bloque de código del OUT', () => {
  const md = D.report({ id: 'RUN-001' }, [], [{ test: 'tests/a.test.js', status: 1, out: 'x\n````\n# título falso' }], 'f');
  assert.equal((md.match(/^````/gm) || []).length, 2);
});

const WF = fs.readFileSync(path.join(__dirname, '..', 'workflows', 'factory-diagnose.yml'), 'utf8');

test('workflow: solo DEV, solo el dueño, solo commitea OUT, nada del evento en comandos', () => {
  assert.match(WF, /github\.repository == 'PabloSnchz\/gw2-factory-dev' &&\n\s+github\.actor == github\.repository_owner/);
  assert.match(WF, /\npermissions:\n  contents: write\n\n/);
  assert.match(WF, /paths:\n\s+- 'factory\/diagnose\/RUN-\*\.json'/);
  assert.doesNotMatch(WF, /\$\{\{/, 'ninguna expresión');
  assert.match(WF, /grep -vE '\^factory\/diagnose\/OUT-\[0-9\]\{3,\}\\\.md\$'/);
  assert.doesNotMatch(WF, /git add (-A|\.|--all)/);
});
