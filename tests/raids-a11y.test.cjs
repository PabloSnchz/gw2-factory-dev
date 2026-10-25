// Raids en los 19 themes (BL-070, RAI-6): cada color de texto de js/raids-view.js y js/raids-sheet.js
// llega a 4.5:1 sobre las superficies reales donde se pinta, con el marco común (gn-surface y la guarda de
// gn-frame sobre #raidTrackerPanel). El acento y el color del módulo no se usan como texto: los enlaces van
// con --gn-link, que gn-surface calcula legible. Teclado, lector de pantalla, celular y movimiento reducido.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const TD = path.join(ROOT, 'css', 'themes');
function readTheme(file) {
  const css = fs.readFileSync(path.join(TD, file), 'utf8');
  const t = {};
  css.slice(css.indexOf('{') + 1, css.indexOf('}')).replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
  return t;
}
const THEMES = fs.readdirSync(TD).filter((f) => f.endsWith('.css')).sort().map((f) => ({ id: f.replace(/\.css$/, ''), tokens: readTheme(f) }));

function load() {
  const win = { console: { info() {}, warn() {} }, Math, JSON, Object, Array, String, Number, isNaN, parseInt, parseFloat, setTimeout: () => 0, clearTimeout() {} };
  win.window = win;
  const ctx = vm.createContext(win);
  ['js/gn-surface.js', 'js/gn-frame.js', 'js/raids-view.js', 'js/raids-sheet.js'].forEach((f) => vm.runInContext(read(f), ctx, { filename: f }));
  return win;
}
const W = load();
const P = W.GNSurface._pure;
const MOD = '#F47C7C';

// Cada declaración `color:` de las dos hojas, con su selector.
function decls() {
  const out = [];
  [['view', W.RaidsView._pure.CSS], ['sheet', W.RaidsSheet._pure.CSS]].forEach(([f, css]) => {
    css.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel, body) => {
      body.replace(/(?:^|;)\s*color\s*:\s*([^;}]+)/g, (mm, v) => { out.push({ f, sel: sel.trim(), v: v.trim() }); return mm; });
      return m;
    });
  });
  return out;
}
const DECLS = decls();

// Dónde se pinta cada texto. Por defecto: sobre la tarjeta, la bandeja del panel y las cajas en --bg-0
// (indicadores, píldoras, etiquetas, consejos, mecánicas). Cabeceras: además sobre el degradé del módulo.
// Pista (--bg-2): solo el botón apretado del filtro y el rombo de las filas sin ícono.
const HERO = /^\.(rv-title h2|rv-title p|rv-err|rs-t h2|rs-t>p)$/;
const TRACK = /^\.(rv-seg button\[aria-pressed=true\]|rs-ri--g)$/;
function where(sel) {
  if (TRACK.test(sel)) return ['track'];
  if (HERO.test(sel)) return ['hero', 'card', 'tray'];
  return ['bg0', 'tray', 'card'];
}
function resolve(v, eff) {
  let s = v.replace('!important', '').trim();
  for (let i = 0; i < 4; i++) {
    const m = s.match(/^var\((--[\w-]+)(?:,\s*(.+))?\)$/);
    if (!m) break;
    if (m[1] === '--rv-mod' || m[1] === '--rs-mod' || m[1] === '--gn-mod') { s = MOD; break; }
    s = eff[m[1]] || (m[2] || '').trim();
  }
  return s;
}

test('las dos hojas declaran sus colores de texto y ninguno es el acento ni el color del módulo', () => {
  assert.ok(DECLS.length >= 60, 'se leyeron ' + DECLS.length + ' declaraciones');
  const bad = DECLS.filter((d) => /^var\(--(acc-1|rv-mod|rs-mod|gn-mod)\b/.test(d.v));
  assert.deepEqual(bad.map((d) => d.f + ' ' + d.sel + ' ' + d.v), [], 'el acento y el color del módulo no son texto: los enlaces van con --gn-link');
  assert.ok(DECLS.filter((d) => /--gn-link/.test(d.v)).length >= 4, 'enlaces, rareza y «marcado por vos» con --gn-link');
});

test('en los 19 themes cada texto de Raids llega a 4.5:1 sobre las superficies donde se pinta', () => {
  assert.equal(THEMES.length, 19, THEMES.map((t) => t.id).join(', '));
  const fails = [];
  for (const { id, tokens } of THEMES) {
    const sf = P.surfaces(tokens);
    assert.ok(sf, id + ': el theme trae lo mínimo');
    const fx = W.GNFrame._pure.guardFixes(W.GNSurface.surfaceTokens(tokens), P);
    const eff = Object.assign({}, tokens, sf, fx);
    const S = {
      bg0: P.over(P.parse(tokens['--bg-0']), [255, 255, 255, 1]),
      tray: P.parse(sf['--gn-tray']), card: P.parse(sf['--bg-1']), track: P.parse(sf['--bg-2']),
    };
    S.hero = P.over([0xF4, 0x7C, 0x7C, 0.12], S.tray);
    for (const d of DECLS) {
      if (d.v === 'inherit') continue;
      const c = P.parse(resolve(d.v, eff));
      assert.ok(c, id + ' ' + d.sel + ': se puede leer ' + d.v);
      for (const k of where(d.sel)) {
        const r = P.contrast(P.over(c, S[k]), S[k]);
        if (r < 4.5) fails.push(id + ' ' + d.f + ' ' + d.sel + ' sobre ' + k + ' ' + r.toFixed(2));
      }
    }
  }
  assert.deepEqual(fails, []);
});

test('el marco común cubre a Raids: superficies y guarda sobre #raidTrackerPanel, con el color del módulo', () => {
  const p = W.GNFrame._pure.PANELS.find((x) => x.id === 'raidTrackerPanel');
  assert.ok(p, 'raidTrackerPanel está en el marco común');
  assert.equal(p.color, MOD);
  assert.match(W.RaidsView._pure.CSS, /#rvRoot\{--rv-mod:var\(--gn-mod,#F47C7C\)\}/);
  assert.match(W.RaidsSheet._pure.CSS, /#rsRoot\{--rs-mod:var\(--gn-mod,#F47C7C\)\}/);
});

test('teclado y lector de pantalla: pestañas, foco visible, regiones nombradas y estados con texto', () => {
  const V = W.RaidsView._pure, S = W.RaidsSheet._pure;
  const cat = JSON.parse(read('assets/data/raids/catalog.json'));
  const h = V.viewHTML(V.buildModel(cat, { loaded: true, hasToken: true, raids: [], achs: [], wallet: [], marks: [] }, { tab: 'wings' }), Date.UTC(2026, 9, 19, 12));
  assert.match(h, /role="tablist" aria-label="Secciones de Raids"/);
  assert.match(h, /id="rvTab-wings"[^>]*aria-selected="true"[^>]*aria-controls="rvPanel" tabindex="0"/);
  assert.match(h, /id="rvTab-enc"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
  assert.match(h, /id="rvPanel" role="tabpanel" aria-labelledby="rvTab-wings"/);
  assert.match(h, /<section class="rv-wing" aria-labelledby="rvG-/, 'cada ala es una región con su título');
  assert.match(h, /<span class="rv-sr">, ver ficha<\/span>/, 'cada fila dice que abre la ficha');
  assert.match(h, /role="group" aria-label="Mostrar"/);
  assert.match(h, /aria-pressed="true"/);
  assert.match(h, /aria-label="Dificultad \d de 5"/, 'la dificultad se lee, no solo se ve');
  assert.doesNotMatch(h, /<img(?![^>]*alt="")[^>]*>/, 'los íconos son decorativos: el nombre va en texto');
  const tabs = S.sheetHTML(S.sheetModel(cat, JSON.parse(read('assets/data/raids/rewards.json')), 'greer', { hasToken: false }, V.stateOf), {}, null, 'rew');
  assert.match(tabs, /role="tablist" aria-label="Secciones de la ficha"/);
  assert.match(tabs, /id="rsTab-rew" data-rs-tab="rew" aria-selected="true" aria-controls="rsPaneRew" tabindex="0"/);
  assert.match(tabs, /<h2 id="rsTitle" tabindex="-1">/, 'el foco va al título al abrir');
  assert.match(tabs, /<nav class="rs-bar" aria-label="Ficha del encuentro">/);
  [V.CSS, S.CSS].forEach((css) => {
    assert.match(css, /button:focus-visible[^{]*\{outline:2px solid var\(--acc-1\)/);
    assert.doesNotMatch(css.replace(/\.rs-t h2:focus\{outline:none\}/, ''), /outline:\s*(none|0)\b/, 'nadie quita el contorno (salvo el título que recibe el foco por código)');
  });
});

test('celular y movimiento reducido: 44 px y sin animaciones', () => {
  const V = W.RaidsView._pure.CSS, S = W.RaidsSheet._pure.CSS;
  assert.match(V, /@media \(max-width:900px\)[\s\S]*\.rv-tabs \[role=tab\],\.rv-seg button,\.rv-btn\{min-height:44px\}/);
  assert.match(S, /@media \(max-width:720px\)[\s\S]*\.rs-btn\{min-height:44px\}/);
  assert.match(S, /\.rs-tabs \[role=tab\]\{[^}]*min-height:44px/);
  assert.match(V, /@media \(prefers-reduced-motion:reduce\)\{#rvRoot \*\{transition:none!important;animation:none!important\}\}/);
  assert.match(S, /@media \(prefers-reduced-motion:reduce\)\{#rsRoot \*\{transition:none!important;animation:none!important\}\}/);
});

test('sin restos de Strikes: ni archivo, ni panel, ni módulo en el router', () => {
  assert.ok(!fs.existsSync(path.join(ROOT, 'js', 'strike-tracker.js')));
  assert.doesNotMatch(read('index.html'), /strikeTrackerPanel|strike-tracker\.js/);
  const router = read('js/router.js');
  assert.doesNotMatch(router.slice(router.indexOf('MODULOS_CON_LATCH = ['), router.indexOf('];', router.indexOf('MODULOS_CON_LATCH = ['))), /StrikeTracker/);
  assert.match(router, /h === '#\/account\/strikes'\) \{\n\s*showPanel\('raidTrackerPanel'\)/, 'el marcador viejo lleva a Raids');
});
