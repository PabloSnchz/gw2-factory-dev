// BL-078 UNI-7b: sonda temporal. Con GNKit cargado, lista cada role="tab" de los módulos renovados y si lleva ícono.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const T = Date.parse('2026-10-28T00:30:00Z');
function sandbox(files) {
  const sb = { console: { info() {}, warn() {} } };
  sb.window = sb;
  vm.createContext(sb);
  ['js/gn-kit.js'].concat(files).forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  return sb;
}
function tabs(h) {
  const out = [], re = /<(\w+)([^>]*role="tab"[^>]*)>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = re.exec(h))) out.push((m[3].includes('class="gk-ic"') ? 'ICON ' : 'SIN  ') + m[3].replace(/<[^>]+>/g, '').trim().slice(0, 40));
  return out;
}
const CASES = {
  raids: () => { const V = sandbox(['js/raids-view.js']).RaidsView._pure; return V.viewHTML(V.buildModel(JSON.parse(read('assets/data/raids/catalog.json')), { hasToken: false, loaded: true }, {}), T); },
  act: () => { const V = sandbox(['js/act-model.js', 'js/act-view.js']).ActView._pure; return V.viewHTML(V.buildModel({}, {}, {}, T)); },
  home: () => { const V = sandbox(['js/home-view.js']).HomeView._pure; return V.viewHTML(V.buildModel({}, {}, {}, T), { tabs: [['glyphs', 'Glifos'], ['decor', 'Decoraciones']], tab: 'nodes', html: '' }); },
  wv: () => { const V = sandbox(['js/wv-view.js']).WVView._pure; return V.headHTML({ season: 'x', aa: null, aaNote: '', daily: null, weekly: null, spent: null, view: { tab: 'objectives', sub: 'daily' }, counts: {}, ready: 0, pinned: 0, accounts: 0, whyOpen: false, accountsSub: 'weekly', dailyLeft: '1 h', weeklyLeft: '4 d', now: T }); },
  acc: () => { const sb = sandbox(['js/acc-model.js', 'js/acc-view.js']); const P = sb.AccView._pure; return P.viewHTML({ cat: JSON.parse(read('assets/data/accounts/catalog.json')), M: sb.AccModel._pure, cards: [], active: '', activeName: '', ui: { tab: 'mine', type: 'all', q: '' }, loading: false, readAt: 0, now: T }); },
  sheet: () => { const sb = sandbox(['js/raids-view.js', 'js/raids-sheet.js']); const S = sb.RaidsSheet._pure, V = sb.RaidsView._pure;
    const CAT = JSON.parse(read('assets/data/raids/catalog.json')), RW = JSON.parse(read('assets/data/raids/rewards.json'));
    return S.sheetHTML(S.sheetModel(CAT, RW, 'greer', { loaded: true, hasToken: true, raids: [], achs: [], wallet: [], marks: [] }, V.stateOf), {}, null, 'rew'); }
};

test('pestañas con GNKit', () => {
  Object.entries(CASES).forEach(([k, f]) => {
    try { console.log('## ' + k + '\n' + tabs(f()).join('\n')); } catch (e) { console.log('## ' + k + ' ERROR ' + (e && e.stack || e)); }
  });
  ['js/ach-view.js', 'js/inv-view.js', 'js/meta-theme.js', 'js/wallet-theme.js'].forEach((f) => {
    try { console.log('## fuente ' + f + ': role="tab" ' + (read(f).match(/role="tab"|role=\\"tab\\"|'tab'/g) || []).length); } catch (e) { console.log('## ' + f + ' no existe'); }
  });
});
