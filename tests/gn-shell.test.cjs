// Un solo contenedor por módulo renovado (BL-070, pedido de Pablo del 2026-10-25): js/gn-shell.js.
// Corre con: node --test tests/*.test.cjs
// Vigila que cada regla apunte a lo que de verdad montan las vistas, que la cabecera deje de ser una caja,
// que el contenido tenga aire a los costados y que el degradado del módulo deje leer el texto en los 19 themes.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/gn-shell.js');

function load(extra) {
  const sb = Object.assign({ console: { info() {}, warn() {} } }, extra || {});
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(SRC, sb, { filename: 'gn-shell.js' });
  return sb;
}
const P = load().GNShell._pure;
const VIEWS = { raids: 'js/raids-view.js', inventory: 'js/inv-view.js', activities: 'js/act-view.js', achievements: 'js/ach-view.js', wv: 'js/wv-view.js',
  armory: ['js/render-catologo.js', 'js/legendary-tracker.js'] };
const viewSrc = (id) => [].concat(VIEWS[id]).map(read).join('\n');
const inner = (s) => s.panel + ' ' + s.head + (s.body ? ' ' + s.body : '');

test('versión, presupuesto y manifiesto: después de gn-frame.js, fuera de index.html, sin pedidos ni almacenamiento', () => {
  assert.match(SRC, /Versión: 1\.2\.0/);
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
  assert.doesNotMatch(SRC, /fetch\(|localStorage|sessionStorage|Storage\.set/);
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}]/u, 'sin emojis');
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.ok(man.includes('js/gn-shell.js'));
  assert.equal(man.indexOf('js/gn-shell.js'), man.indexOf('js/gn-frame.js') + 1, 'justo después del marco común');
  assert.doesNotMatch(read('index.html'), /gn-shell\.js/);
});

test('los 6 módulos renovados, cada uno con lo que su vista monta de verdad (si cambia, este test avisa)', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(P.SHELLS.map((s) => s.id))), Object.keys(VIEWS));
  P.SHELLS.forEach((s) => {
    const v = viewSrc(s.id);
    const panelId = s.panel.match(/^#(\w+)/)[1], cls = (s.panel.match(/\.([\w-]+)$/) || [])[1];
    assert.ok(v.includes(panelId), s.id + ': la vista usa #' + panelId);
    if (cls) assert.ok(v.includes("'" + cls + "'"), s.id + ': la vista pone la clase ' + cls);
    assert.ok(v.includes("'" + s.head.slice(1) + "'") || v.includes("'" + s.head + "'"), s.id + ': la vista crea ' + s.head);
    if (s.body) assert.ok(v.includes('id="' + s.body.slice(1) + '"'), s.id + ': la vista crea ' + s.body);
    assert.ok(v.includes(s.hero.slice(1) + '{'), s.id + ': la vista dibuja ' + s.hero);
  });
});

test('un solo contenedor: panel sin relleno y con el degradado; cabecera sin caja; contenido con 24 px (12 en el celular)', () => {
  P.SHELLS.forEach((s) => {
    const css = P.shellCSS(s).join('\n');
    assert.ok(css.includes(s.panel + '{padding:0 0 22px;background:linear-gradient(180deg,color-mix(in srgb,' + s.mod + ' 12%,transparent),transparent 300px),var(--gn-tray,var(--bg-1))}'), s.id + ': degradado en el panel');
    assert.ok(css.includes(s.panel + ' ' + s.hero + '{border:0;border-bottom:1px solid var(--bd-1);border-radius:0;background:none;box-shadow:none;'), s.id + ': la cabecera deja de ser una caja');
    assert.ok(css.includes(s.panel + '>:not(' + s.head + '),' + inner(s) + '>:not(' + s.hero + '){margin-left:24px;margin-right:24px}'), s.id + ': aire a los costados');
    if (s.body) assert.ok(css.includes(s.panel + ' ' + s.head + '{padding:0;margin:0}'), s.id + ': el cuerpo sin relleno, la cabecera a todo el ancho');
    assert.ok(P.CSS.includes(s.panel + ' ' + s.hero + '{padding:14px 12px 12px}'), s.id + ': en el celular');
  });
  assert.match(P.CSS, /@media \(max-width:900px\)\{/);
  // Lo que se ve en Cartera y Metas: nada de borde ni esquinas propias en la cabecera.
  assert.doesNotMatch(P.CSS, /hero\{[^}]*border:1px solid/);
});

test('PUL-1: la Armería con un solo contenedor, en su color de la barra lateral y solo cuando su cabecera está montada', () => {
  const a = P.SHELLS.filter((s) => s.id === 'armory')[0];
  assert.equal(a.panel, '#legendaryArmoryPanel:has(.arm-hero)');
  assert.match(read('js/render-catologo.js'), /var ARM_COLOR = '#E545CA';/);
  assert.match(read('js/welcome-panel.js'), /id: 'armory'[^}]*color: '#E545CA'/);
  assert.equal(a.hex, '#E545CA');
  assert.ok(P.CSS.includes('#legendaryArmoryPanel:has(.arm-hero) #legendaryArmoryBody #legendaryModeContent>:not(.arm-hero){margin-left:12px;margin-right:12px}'), 'en el celular');
});

test('PUL-2: el ícono de la cabecera igual en los 9 módulos, en el color de su botón de la barra lateral', () => {
  const W = read('js/welcome-panel.js');
  const SRCS = { cards: 'js/wallet-theme.js', meta: 'js/meta-theme.js', wv: 'js/wv-view.js', achievements: 'js/ach-view.js', raids: 'js/raids-view.js',
    activities: 'js/act-view.js', characters: 'js/inv-view.js', armory: 'js/render-catologo.js', homestead: 'js/home-view.js' };
  assert.deepEqual(JSON.parse(JSON.stringify(P.ICONS.map((i) => i.id))).sort(), Object.keys(SRCS).sort());
  P.ICONS.forEach((i) => {
    const m = W.match(new RegExp("id: '" + i.id + "'[^}]*color: '(#[0-9A-Fa-f]{6})'"));
    assert.ok(m, i.id + ': está en la barra lateral');
    assert.equal(i.color, m[1], i.id + ': el color de su botón');
    assert.ok(P.CSS.includes(i.sel + '{width:56px;height:56px;'), i.id + ': placa de 56 px');
    assert.ok(P.CSS.includes('background:var(--bg-0);box-shadow:0 0 0 1px var(--bd-2),0 0 18px color-mix(in srgb,' + i.color + ' 18%,transparent)'), i.id + ': el brillo de la Cartera en su color');
    const cls = i.sel.split(',')[0].split(' ').pop().split('>')[0].slice(1);
    assert.ok(read(SRCS[i.id]).includes(cls), i.id + ': la vista dibuja .' + cls);
  });
  assert.ok(P.CSS.includes('#metaPanel .mh-hico>img{width:44px;height:44px'), 'el ícono a 44 px dentro de la placa');
  assert.ok(P.CSS.includes('#rvRoot .rv-ico{width:56px;height:56px;padding:6px;box-sizing:border-box'), 'el ícono a 44 px con el relleno');
  assert.ok(P.CSS.includes('#hsRoot .hs-ico{width:40px;height:40px;padding:4px}'), 'en el celular, 40 px');
  // D1: el degradado y las pestañas en el color de la barra lateral.
  P.SHELLS.forEach((s) => {
    const i = P.ICONS.filter((x) => x.id === (s.id === 'inventory' ? 'characters' : s.id))[0];
    assert.ok(i, s.id);
    assert.equal(s.hex, i.color, s.id + ': el degradado en el color de la barra lateral');
  });
  assert.ok(P.CSS.includes('#achievementsPanel .achx-tabs [role=tab][aria-selected=true]{border-bottom-color:#6EA3FF}'));
  assert.ok(P.CSS.includes('#wvPanel .wvx-tabs [role=tab][aria-selected=true]{border-bottom-color:#15C3B7}'));
});

test('la cabecera de cada vista gana: las reglas pesan más que las de la vista', () => {
  // #id.clase .hero (1,2,0) contra .hero (0,1,0) de la vista, también dentro de su media query.
  P.SHELLS.forEach((s) => assert.match(s.panel, /^#\w+/));
});

// ------------------------------------------------------------------ contraste en los 19 themes
test('en los 19 themes el texto de la cabecera llega a 4.5:1 sobre el degradado más fuerte de cada módulo', () => {
  const TD = path.join(ROOT, 'css', 'themes');
  const themes = fs.readdirSync(TD).filter((f) => f.endsWith('.css'));
  assert.equal(themes.length, 19);
  const sb = { console: { info() {}, warn() {} }, Math, JSON, Object, Array, String, Number, isNaN, parseInt, parseFloat, setTimeout: () => 0 };
  sb.window = sb;
  vm.createContext(sb);
  ['js/gn-surface.js', 'js/gn-frame.js'].forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  const G = sb.GNSurface._pure;
  const fails = [];
  themes.forEach((f) => {
    const css = fs.readFileSync(path.join(TD, f), 'utf8'), t = {};
    css.slice(css.indexOf('{') + 1, css.indexOf('}')).replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
    const sf = G.surfaces(t);
    const tray = G.parse(sf['--gn-tray']);
    P.SHELLS.forEach((s) => {
      const c = G.parse(s.hex);
      const top = G.over([c[0], c[1], c[2], P.TINT / 100], tray);
      // Sin las correcciones de la guarda: el caso más exigente.
      ['--tx-1', '--tx-2'].forEach((k) => {
        const r = G.contrast(G.over(G.parse(t[k]), top), top);
        if (r < 4.5) fails.push(f + ' ' + s.id + ' ' + k + ' ' + r.toFixed(2));
      });
    });
  });
  assert.deepEqual(fails, []);
});

test('humo: pone su hoja una sola vez y no toca nada más', () => {
  const els = {};
  const head = { children: [], appendChild(n) { this.children.push(n); if (n.id) els[n.id] = n; } };
  const document = { readyState: 'complete', head, getElementById: (id) => els[id] || null, createElement: () => ({ id: '', textContent: '' }) };
  const sb = load({ document });
  assert.equal(head.children.length, 1);
  assert.equal(head.children[0].id, 'gn-shell-css');
  assert.equal(head.children[0].textContent, sb.GNShell._pure.CSS);
  vm.runInContext(SRC, sb, { filename: 'gn-shell.js' });
  assert.equal(head.children.length, 1, 'no la duplica');
});
