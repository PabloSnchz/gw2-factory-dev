// MIG-4a (BL-043, DEC-029): el censo de los tests del legado clasifica bien.
// Arma un "legado" y un "DEV" de juguete con tests que pasan, fallan, mienten
// (salen con 0 e imprimen FAIL), no terminan o piden un paquete que no está.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const C = require('../tools/legacy/census.cjs');

const dirs = [];
test.after(() => dirs.forEach(d => fs.rmSync(d, { recursive: true, force: true })));
function tree(files) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'censo-t-')); dirs.push(d);
  for (const [f, c] of Object.entries(files)) { fs.mkdirSync(path.join(d, path.dirname(f)), { recursive: true }); fs.writeFileSync(path.join(d, f), c); }
  return d;
}

const READ_X = "const fs=require('fs'),p=require('path');const v=fs.readFileSync(p.join(__dirname,'..','js','x.js'),'utf8').trim();";

test('verdicts: cuenta OK y FAIL por línea y entiende los resúmenes', () => {
  assert.deepEqual(C.verdicts('OK a\nok b\nFAIL c\nPASS d'), { ok: 3, fail: 1 });
  assert.deepEqual(C.verdicts('OK a\npass: 1 | FAIL: 2'), { ok: 1, fail: 2 }, 'resumen sin líneas FAIL');
  assert.deepEqual(C.verdicts('OK a\nFAIL b\n1 OK / 1 FAIL'), { ok: 1, fail: 1 }, 'el resumen no se cuenta dos veces');
  assert.deepEqual(C.verdicts('TODO 12 OK / 0 FAIL'), { ok: 0, fail: 0 });
  assert.deepEqual(C.verdicts('not ok 1 - x'), { ok: 0, fail: 1 });
});

test('classify: los cinco estados', () => {
  assert.equal(C.classify({ timedOut: true, output: '', code: null, fail: 0 }), 'TIEMPO');
  assert.equal(C.classify({ output: "Error: Cannot find module 'jsdom'", code: 1, fail: 0 }), 'DEPENDENCIA');
  assert.equal(C.classify({ output: "Error: Cannot find module '../js/nada.js'", code: 1, fail: 0 }), 'ROJO');
  assert.equal(C.classify({ output: '', code: 0, fail: 2 }), 'MIENTE');
  assert.equal(C.classify({ output: '', code: 0, fail: 0 }), 'VERDE');
  assert.equal(C.classify({ output: '', code: 1, fail: 0 }), 'ROJO');
});

test('referencedFiles: archivos de la app que nombra un test', () => {
  const src = "read('js/app.js'); path.join(ROOT, 'js', 'meta.js'); fs.readFileSync(R + '/index.html'); x('css/styles.css')";
  assert.deepEqual(C.referencedFiles(src), ['css/styles.css', 'index.html', 'js/app.js', 'js/meta.js']);
});

test('census + report: corre cada test en el legado y en una copia de DEV', async () => {
  const legacy = tree({
    'js/x.js': 'viejo',
    'tests/_run-all.js': 'process.exit(1)',
    'tests/fixtures/f.json': '{"a":1}',
    'tests/a-igual.test.js': "console.log('OK uno');",
    'tests/b-cambio.test.js': READ_X + "if(v==='viejo'){console.log('OK x')}else{console.log('FAIL x');process.exit(1)}",
    'tests/c-miente.test.js': "console.log('FAIL pero sigo');",
    'tests/d-cuelga.test.js': 'setInterval(()=>{},1000);',
    'tests/e-paquete.test.js': "require('jsdom');",
    'tests/f-fixture.test.js': "const j=require('./fixtures/f.json');if(j.a!==1)process.exit(1);console.log('OK fixture');",
    'tests/notas.md': 'no es un test',
    'js/solo-legado.js': 'x',
    'tests/g-solo-legado.test.js': "require('fs').readFileSync(require('path').join(__dirname,'..','js','solo-legado.js'));console.log('OK');"
  });
  const dev = tree({ 'js/x.js': 'nuevo', 'tests/propio.test.cjs': '' });
  const rows = await C.census({ legacy, dev, timeoutMs: 1500, jobs: 3 });
  const by = Object.fromEntries(rows.map(r => [r.file, r]));
  assert.deepEqual(Object.keys(by), ['a-igual.test.js', 'b-cambio.test.js', 'c-miente.test.js', 'd-cuelga.test.js', 'e-paquete.test.js', 'f-fixture.test.js', 'g-solo-legado.test.js']);
  assert.deepEqual(by['g-solo-legado.test.js'].missing, ['js/solo-legado.js']);
  assert.deepEqual(by['g-solo-legado.test.js'].changed, [], 'lo que falta no se cuenta como distinto');
  assert.equal(by['g-solo-legado.test.js'].dev.state, 'ROJO');
  assert.equal(by['a-igual.test.js'].dev.state, 'VERDE');
  assert.equal(by['b-cambio.test.js'].legacy.state, 'VERDE');
  assert.equal(by['b-cambio.test.js'].dev.state, 'ROJO');
  assert.deepEqual(by['b-cambio.test.js'].changed, ['js/x.js']);
  assert.equal(by['c-miente.test.js'].dev.state, 'MIENTE');
  assert.equal(by['d-cuelga.test.js'].dev.state, 'TIEMPO');
  assert.equal(by['e-paquete.test.js'].dev.state, 'DEPENDENCIA');
  assert.equal(by['f-fixture.test.js'].dev.state, 'VERDE', 'las fixtures viajan con los tests');
  assert.equal(fs.readFileSync(path.join(dev, 'js', 'x.js'), 'utf8'), 'nuevo', 'DEV no se toca: se trabaja en una copia');
  assert.equal(fs.existsSync(path.join(dev, 'tests', 'a-igual.test.js')), false);

  const md = C.report(rows, { ref: 'eb91075f3e6a', date: '2026-10-22' });
  assert.match(md, /- Legado: gw2-wallet-agents @ `eb91075`/);
  assert.match(md, /- En DEV: VERDE 2 · ROJO 2 · MIENTE 1 · TIEMPO 1 · DEPENDENCIA 1/);
  assert.match(md, /\| `b-cambio\.test\.js` \| [\d.]+ \| VERDE \| ROJO \| 0\/1 \| js\/x\.js \| — \|/);
  assert.match(md, /### b-cambio\.test\.js — ROJO \(código 1\)\n\n {4}FAIL x/);
  assert.doesNotMatch(md, /### a-igual/);
});
