// Presupuesto de tamaño (DEC-035 FP-6): saludable ≤ 40 KB, advertencia ≤ 48 KB,
// congelado > 48 KB (no crece, el techo solo baja), excepciones = datos generados.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const S = require('../tools/size-budget.cjs');

const ROOT = path.join(__dirname, '..');
const K = 1024;

test('la Bóveda cumple su presupuesto de tamaño', () => {
  const res = S.check(ROOT);
  assert.deepEqual(res.errors, [], '\n' + res.errors.join('\n'));
});

test('el presupuesto es el de DEC-035: 40 KB, techo de advertencia 48 KB, trinquete de 1 KB', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, S.CONFIG), 'utf8'));
  assert.equal(cfg.saludable, 40 * K);
  assert.equal(cfg.limite, 48 * K);
  assert.equal(cfg.holgura, 1 * K);
  Object.entries(cfg.congelados).forEach(([p, f]) => assert.ok(f.techo <= f.base, p + ': techo ≤ base'));
  Object.entries(cfg.excepciones).forEach(([p, e]) => {
    assert.match(p, /^js\/legendary-(data|recipes|precursors)\.js$/, 'solo datos generados son excepción');
    assert.ok(String(e.motivo || '').length > 10, p + ': excepción con motivo');
  });
  Object.entries(cfg.advertencia).forEach(([p, w]) => assert.ok(String(w.nota || '').length > 10, p + ': advertencia con motivo'));
});

// Repo de juguete para probar cada regla por separado.
function repo(sizes, cfg) {
  const R = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-'));
  fs.mkdirSync(path.join(R, 'js')); fs.mkdirSync(path.join(R, 'css', 'themes'), { recursive: true });
  Object.entries(sizes).forEach(([p, n]) => fs.writeFileSync(path.join(R, p), 'x'.repeat(n)));
  return S.check(R, Object.assign({ saludable: 40 * K, limite: 48 * K, holgura: K, congelados: {}, advertencia: {}, excepciones: {} }, cfg));
}
const errs = (sizes, cfg) => repo(sizes, cfg).errors;

test('zonas: incluye index.html, js/*.js y css/**/*.css; ignora lo demás', () => {
  const r = repo({ 'index.html': 10, 'js/a.js': 40 * K, 'js/b.js': 40 * K + 1, 'js/m.json': 99 * K, 'css/themes/t.css': 60 * K, 'js/d.js': 90 * K },
    { advertencia: { 'js/b.js': { nota: 'x' } }, congelados: { 'css/themes/t.css': { base: 60 * K, techo: 60 * K } }, excepciones: { 'js/d.js': { motivo: 'datos' } } });
  assert.deepEqual(r.rows.map((x) => [x.path, x.zone]), [
    ['css/themes/t.css', 'congelado'], ['index.html', 'saludable'], ['js/a.js', 'saludable'], ['js/b.js', 'advertencia'], ['js/d.js', 'excepción']]);
  assert.deepEqual(r.errors, []);
  assert.match(S.table(r), /Total 5: saludable 2, advertencia 1, congelado 1, excepción 1\. Errores: 0\./);
});

test('advertencia: entrar sin registrar falla; pasar 48 KB falla; volver a 40 KB obliga a sacarlo', () => {
  assert.match(errs({ 'js/a.js': 41 * K }).join(), /pasa los 40 KB .* sin estar registrado/);
  assert.match(errs({ 'js/a.js': 48 * K + 1 }, { advertencia: { 'js/a.js': {} } }).join(), /pasa los 48 KB .* no está congelado/);
  assert.match(errs({ 'js/a.js': 30 * K }, { advertencia: { 'js/a.js': {} } }).join(), /ya está en el presupuesto .* advertencia/);
  assert.deepEqual(errs({ 'js/a.js': 48 * K }, { advertencia: { 'js/a.js': {} } }), [], '48 KB justos es advertencia');
});

test('congelado: no crece, el techo baja con el archivo y nunca supera la base', () => {
  const fz = (techo, base) => ({ congelados: { 'js/a.js': { base: base || 60 * K, techo } } });
  assert.deepEqual(errs({ 'js/a.js': 60 * K }, fz(60 * K)), []);
  assert.match(errs({ 'js/a.js': 60 * K + 1 }, fz(60 * K)).join(), /creció a 61441 bytes y su techo es 61440/);
  assert.deepEqual(errs({ 'js/a.js': 59 * K }, fz(60 * K)), [], 'dentro de la holgura de 1 KB');
  assert.match(errs({ 'js/a.js': 59 * K - 1 }, fz(60 * K)).join(), /se achicó a 60415 bytes: bajá su techo a 60415/);
  assert.match(errs({ 'js/a.js': 60 * K }, fz(61 * K, 60 * K)).join(), /el techo \(62464\) no puede superar la base \(61440\)/);
  assert.match(errs({ 'js/a.js': 45 * K }, fz(60 * K)).join(), /bajó de 48 KB .* pasalo de congelados a advertencia/);
  assert.match(errs({ 'js/a.js': 10 * K }, fz(60 * K)).join(), /ya está en el presupuesto .* congelados/);
  assert.match(errs({ 'js/n.js': 50 * K }).join(), /js\/n\.js: pasa los 48 KB/);
});

test('excepciones: sin límite; cualquier lista con un archivo que no existe falla', () => {
  assert.deepEqual(errs({ 'js/d.js': 300 * K }, { excepciones: { 'js/d.js': { motivo: 'x' } } }), []);
  const e = errs({}, { congelados: { 'js/x.js': { base: 1, techo: 1 } }, advertencia: { 'js/y.js': {} }, excepciones: { 'js/z.js': {} } });
  assert.deepEqual(e, ['js/x.js: figura en congelados pero no existe', 'js/y.js: figura en advertencia pero no existe', 'js/z.js: figura en excepciones pero no existe']);
});
