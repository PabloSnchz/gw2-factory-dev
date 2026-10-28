// BL-082 BLD-1: Builds, panel y rutas (js/bld-view.js). Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'bld-view.js'), 'utf8');
function load() {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'js/bld-view.js' });
  return sb.GNBld;
}
const V = load();
const P = V._pure;
const same = (a, b, m) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, m);

test('versión en la cabecera y en el código', () => {
  assert.match(SRC, /\* Versión: 1\.1\.0 /);
  assert.equal(V.version, '1.1.0');
});

test('rutas: pestañas, enlace para compartir y rutas ajenas', () => {
  same(P.parseHash('#/builds'), { tab: 'lib', arg: '' });
  same(P.parseHash('#/builds/editor'), { tab: 'editor', arg: '' });
  same(P.parseHash('#/builds/mis'), { tab: 'mine', arg: '' });
  same(P.parseHash('#/builds/importar'), { tab: 'import', arg: '' });
  same(P.parseHash('#/builds/c/DQUA%2BAA%3D'), { tab: 'import', arg: 'DQUA+AA=' });
  same(P.parseHash('#/builds/raro'), { tab: 'lib', arg: '' });
  assert.equal(P.parseHash('#/buildsx'), null);
  assert.equal(P.parseHash('#/cards'), null);
  assert.equal(P.parseHash(''), null);
  same(P.parseHash('#/builds/c/%E0%A4%A'), { tab: 'import', arg: '' }, 'un enlace roto no rompe');
});

test('ida y vuelta de las rutas', () => {
  P.TABS.forEach((t) => assert.equal(P.parseHash(P.hashFor(t.id)).tab, t.id));
  assert.equal(P.hashFor('lib'), '#/builds');
  assert.equal(P.hashFor('editor', 'DQ+/='), '#/builds/editor/DQ%2B%2F%3D');
});

test('enlace para compartir: el código viaja en la ruta, sin corchetes', () => {
  const u = P.shareUrl('[&DQUAAA+/=]', 'https://x.github.io/gw2/');
  assert.equal(u, 'https://x.github.io/gw2/#/builds/c/DQUAAA%2B%2F%3D');
  same(P.parseHash(u.slice(u.indexOf('#'))), { tab: 'import', arg: 'DQUAAA+/=' });
});

test('vista: 4 pestañas accesibles, una sola seleccionada, panel nombrado', () => {
  const h = P.viewHTML({ tab: 'editor' });
  const tabs = h.match(/role="tab"/g) || [];
  assert.equal(tabs.length, 4);
  assert.equal((h.match(/aria-selected="true"/g) || []).length, 1);
  assert.match(h, /id="bldTab-editor"[^>]*aria-selected="true"[^>]*tabindex="0"/);
  assert.match(h, /role="tabpanel" aria-labelledby="bldTab-editor"/);
  assert.match(h, /id="bldTitle"/);
  same(P.TABS.map((t) => t.label), ['Biblioteca', 'Editor', 'Mis builds', 'Importar']);
});

test('escape de todo lo que se muestra', () => {
  assert.equal(P.esc('<img onerror="x">\'&'), '&lt;img onerror=&quot;x&quot;&gt;&#39;&amp;');
  assert.doesNotMatch(P.viewHTML({ tab: 'lib', sub: '<script>' }), /<script>/);
});

test('CSS: solo tokens de los themes y foco visible', () => {
  assert.match(P.CSS, /focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(P.CSS, /prefers-reduced-motion/);
  assert.match(P.CSS, /min-height:44px/);
});

test('sin documento no rompe y register no falla', () => {
  assert.doesNotThrow(() => V.register('lib', { render() {} }));
});
