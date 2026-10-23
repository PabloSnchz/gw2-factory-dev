// tools/index-versions.cjs (RSK-020, DEC-035 FP-5): cómo lee versiones y etiquetas.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const T = require('../tools/index-versions.cjs');

test('lee la versión de las cuatro formas de cabecera que usa la Bóveda', () => {
  assert.equal(T.fileVersion("(function () {\n  console.info('%cGW2 Wallet app.js v2.8.0 — Bootstrap');"), '2.8.0');
  assert.equal(T.fileVersion('/*!\n * x.js\n * Versión: 2.1.1 (2026-10-23)\n */'), '2.1.1');
  assert.equal(T.fileVersion('/* Version: 1.2 */'), '1.2');
  assert.equal(T.fileVersion('/**\n * @version 3.0.0\n */'), '3.0.0');
  assert.equal(T.fileVersion('\uFEFF/*!\n * WV Theme — algo\n * v1.0.1 (2026-05-02)\n */'), '1.0.1');
  assert.equal(T.fileVersion('/*\n  Tema X\n  v1.4.2 (2026-05-02)\n*/'), '1.4.2');
  assert.equal(T.fileVersion('// sin cabecera\nconst a = "1.2.3";'), null, 'un número suelto no es una versión');
  assert.equal(T.fileVersion('x'.repeat(4000) + '\n// Versión: 9.9.9'), null, 'solo mira la cabecera');
});

test('1.2 y 1.2.0 son la misma versión; 1.2.1 no', () => {
  assert.ok(T.same('1.2', '1.2.0'));
  assert.ok(T.same('2.33.0', '2.33.0'));
  assert.ok(!T.same('1.2.1', '1.2.0'));
  assert.ok(!T.same('1.10.0', '1.1.0'));
});

test('encuentra los scripts locales con su ?v, defer y línea; ignora los de afuera', () => {
  const html = '<head>\n<script src="https://cdn/x.js"></script>\n<script src="js/a.js"></script>\n' +
    '<script defer src="js/b.js?v=1.0.0"></script>\n<script>inline()</script>\n</head>';
  assert.deepEqual(T.scriptTags(html), [
    { src: 'js/a.js', v: null, defer: false, line: 3 },
    { src: 'js/b.js', v: '1.0.0', defer: true, line: 4 },
  ]);
});

test('inventario: ok, atrasada, sin-version, sin-v, falta y los módulos de modules.json', () => {
  const R = fs.mkdtempSync(path.join(os.tmpdir(), 'iv-'));
  fs.mkdirSync(path.join(R, 'js'));
  const w = (f, s) => fs.writeFileSync(path.join(R, f), s);
  w('js/ok.js', '/* Versión: 1.2.0 */');
  w('js/old.js', '/* Versión: 2.0.0 */');
  w('js/none.js', '// nada');
  w('js/nov.js', '/* Versión: 1.0.0 */');
  w('js/mod.js', '/* Versión: 1.1.0 */');
  w('index.html', '<script src="js/ok.js?v=1.2"></script>\n<script defer src="js/old.js?v=1.9.0"></script>\n' +
    '<script src="js/none.js?v=1.0.0"></script>\n<script src="js/nov.js"></script>\n<script src="js/gone.js?v=1.0.0"></script>\n');
  w('js/modules.json', JSON.stringify({ modules: [{ src: 'js/mod.js', v: '1.0.0' }] }));
  const rows = T.inventory(R);
  assert.deepEqual(rows.map((r) => [r.from, r.src, r.status, r.file]), [
    ['index.html', 'js/ok.js', 'ok', '1.2.0'],
    ['index.html', 'js/old.js', 'atrasada', '2.0.0'],
    ['index.html', 'js/none.js', 'sin-version', null],
    ['index.html', 'js/nov.js', 'sin-v', '1.0.0'],
    ['index.html', 'js/gone.js', 'falta', null],
    ['modules.json', 'js/mod.js', 'atrasada', '1.1.0'],
  ]);
  const t = T.table(rows);
  assert.match(t, /\| index\.html:2 \| `js\/old\.js` \| 1\.9\.0 \| 2\.0\.0 \| atrasada \|/);
  assert.match(t, /Total 6: ok 1, atrasada 2, sin-version 1, sin-v 1, falta 1\./);
});
