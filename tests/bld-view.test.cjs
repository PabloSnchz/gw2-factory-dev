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
  assert.match(SRC, /\* Versión: 1\.2\.0 /);
  assert.equal(V.version, '1.2.0');
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

test('BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas', () => {
  const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));
  const WATCH = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/watch.json'), 'utf8'));
  globalThis.GNBldCode = require('../js/bld-code.js');
  const L = require('../js/bld-lib.js');
  const s = P.statsModel({ cat: CAT, watch: WATCH, mine: 3, lib: L._pure });
  assert.equal(s.builds, CAT.builds.length);
  assert.equal(s.cov.pve, 36);
  assert.equal(s.cov.wvw, 36);
  assert.equal(s.mine, 3);
  assert.equal(s.latest, '2026-09-29');
  assert.ok(s.old >= 0 && s.old < s.builds);
  const h = P.viewHTML({ tab: 'mine', stats: s });
  assert.match(h, /class="bld-hero"/);
  assert.match(h, /<img class="bld-ico" [^>]*width="56"/);
  assert.match(h, /<h2 id="bldTitle">Builds<\/h2>/);
  assert.equal((h.match(/class="bld-st"/g) || []).length, 4);
  assert.match(h, /Último parche de balance <b>29\/09\/2026<\/b>/);
  assert.match(h, /36 <span>PvE<\/span> · 36 <span>WvW<\/span>/);
  assert.match(h, /id="bldBadge-lib"><span class="bld-badge">104</, 'contador en Biblioteca');
  assert.match(h, /id="bldBadge-mine"><span class="bld-badge">3</, 'contador en Mis builds');
  assert.match(h, /id="bldBadge-editor"><\/span>/, 'sin contador en Editor');
  const empty = P.viewHTML({ tab: 'lib' });
  assert.match(empty, /cargando la biblioteca…/, 'sin catálogo: guiones, no números inventados');
  assert.doesNotMatch(empty, /Último parche de balance/);
  delete globalThis.GNBldCode;
});

test('BUI-4 menú ⋯ común: tocar afuera cierra los abiertos menos el tocado', () => {
  const a = { open: true }, b = { open: true };
  const p = { querySelectorAll: (sel) => (sel === '.bld-menu[open]' ? [a, b].filter((m) => m.open) : []) };
  assert.equal(P.closeMenus(p, b), 1);
  assert.deepEqual([a.open, b.open], [false, true]);
  assert.equal(P.closeMenus(p, null), 1);
  assert.equal(b.open, false);
  assert.equal(P.closeMenus(null), 0);
  assert.match(P.CSS, /\.bld-menu-l\{position:absolute/, 'el estilo del menú vive en el marco');
});

test('sin documento no rompe y register no falla', () => {
  assert.doesNotThrow(() => V.register('lib', { render() {} }));
});
