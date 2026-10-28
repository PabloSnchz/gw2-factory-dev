// BL-078 UNI-7b (guardián de D3): con GNKit cargado, toda pestaña role="tab" de los módulos renovados lleva su ícono
// del juego; sin GNKit, ninguna (cada módulo se ve como antes). Si se agrega una pestaña sin ícono, esto falla.
// Corre con: node --test tests/*.test.cjs
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const T = Date.parse('2026-10-28T00:30:00Z');
const RCAT = JSON.parse(read('assets/data/raids/catalog.json'));

function sandbox(files, kit) {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  (kit ? ['js/gn-kit.js'] : []).concat(files).forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  return sb;
}
// Cada pestaña: { label, icon } (icon = el src del ícono de GNKit, o null).
function tabs(h) {
  const out = [], re = /<(\w+)([^>]*role="tab"[^>]*)>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = re.exec(h))) {
    const ic = /<img class="gk-ic" src="([^"]+)"/.exec(m[3]);
    out.push({ label: m[3].replace(/<[^>]+>/g, '').trim(), icon: ic ? ic[1] : null });
  }
  return out;
}

const MODULES = {
  Raids: [['Alas', 'Encuentros'], (kit) => { const V = sandbox(['js/raids-view.js'], kit).RaidsView._pure; return V.viewHTML(V.buildModel(RCAT, { hasToken: false, loaded: true }, {}), T); }],
  Actividades: [['Hoy', 'Semana'], (kit) => { const V = sandbox(['js/act-model.js', 'js/act-view.js'], kit).ActView._pure; return V.viewHTML(V.buildModel({}, {}, {}, T)); }],
  Heredad: [['Nodos y gatos', 'Glifos', 'Decoraciones'], (kit) => { const V = sandbox(['js/home-view.js'], kit).HomeView._pure;
    return V.viewHTML(V.buildModel({}, {}, {}, T), { tabs: [['glyphs', 'Glifos'], ['decor', 'Decoraciones']], tab: 'nodes', html: '' }); }],
  'Cámara del Brujo': [['Objetivos', 'Tienda', 'Todas las cuentas'], (kit) => { const V = sandbox(['js/wv-view.js'], kit).WVView._pure;
    return V.headHTML({ season: 'x', aa: null, aaNote: '', daily: null, weekly: null, spent: null, view: { tab: 'objectives', sub: 'daily' }, counts: {}, ready: 0, pinned: 0,
      accounts: 0, whyOpen: false, accountsSub: 'weekly', dailyLeft: '1 h', weeklyLeft: '4 d', now: T }); }],
  Cuentas: [['Mis cuentas', 'Llavero'], (kit) => { const sb = sandbox(['js/acc-model.js', 'js/acc-view.js'], kit);
    return sb.AccView._pure.viewHTML({ cat: JSON.parse(read('assets/data/accounts/catalog.json')), M: sb.AccModel._pure, cards: [], active: '', activeName: '',
      ui: { tab: 'mine', type: 'all', q: '' }, loading: false, readAt: 0, now: T }); }],
  'Ficha de Raids': [['Recompensas', 'Cómo se pelea'], (kit) => { const sb = sandbox(['js/raids-view.js', 'js/raids-sheet.js'], kit), S = sb.RaidsSheet._pure;
    return S.sheetHTML(S.sheetModel(RCAT, JSON.parse(read('assets/data/raids/rewards.json')), 'greer',
      { loaded: true, hasToken: true, raids: [], achs: [], wallet: [], marks: [] }, sb.RaidsView._pure.stateOf), {}, null, 'rew'); }]
};

test('con GNKit, cada pestaña de los módulos renovados lleva su ícono, y el ícono existe en el repo', () => {
  Object.entries(MODULES).forEach(([mod, [labels, html]]) => {
    const t = tabs(html(true));
    assert.deepEqual(t.map((x) => x.label), labels, mod + ': las pestañas');
    t.forEach((x) => {
      assert.ok(x.icon, mod + ' · ' + x.label + ': sin ícono');
      assert.ok(fs.existsSync(path.join(ROOT, x.icon)), mod + ' · ' + x.label + ': ' + x.icon + ' no existe');
    });
  });
});

test('sin GNKit, ninguna pestaña dibuja el ícono (cada módulo se ve como antes)', () => {
  Object.entries(MODULES).forEach(([mod, [labels, html]]) => {
    const t = tabs(html(false));
    assert.deepEqual(t.map((x) => x.label), labels, mod);
    assert.ok(t.every((x) => !x.icon), mod);
  });
});

test('UNI-7b: Cuentas y la ficha de Raids, con la elección de Pablo (2026-10-28)', () => {
  const src = (mod) => tabs(MODULES[mod][1](true)).map((x) => x.icon.replace('assets/icons/', ''));
  assert.deepEqual(src('Cuentas'), ['578844.png', 'Cuentas/LLave.png']);
  assert.deepEqual(src('Ficha de Raids'), ['Cuentas/255373.png', '784370.png']);
});
