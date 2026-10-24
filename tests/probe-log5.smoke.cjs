// Sonda de la Factory (BL-067, LOG-5). Solo lee y escribe en la salida: no afirma nada.
// Corre con: node tests/probe-log5.smoke.cjs (canal de diagnóstico, RUN-012). Se borra después.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const out = [];
const log = (s) => out.push(s);

// 1) Quién nombra lo que se retira.
const WORDS = ['achievements-theme', 'AchTheme', 'a-card', 'showLegendaryTracker', 'Tracker de legendarias', 'achAsidePanel', 'ach-badge'];
function walk(dir, acc) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const p = dir ? dir + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!['.git', 'node_modules', 'assets', 'factory'].includes(e.name)) walk(p, acc); }
    else if (/\.(js|cjs|mjs|html|css|json|md|yml|yaml)$/.test(e.name)) acc.push(p);
  }
  return acc;
}
log('## Quién nombra lo que se retira');
for (const f of walk('', [])) {
  let s;
  try { s = read(f); } catch (e) { continue; }
  if (WORDS.some((w) => s.includes(w))) log(f + ': ' + WORDS.filter((w) => s.includes(w)).map((w) => w + '×' + (s.split(w).length - 1)).join(', '));
}

// 2) Contraste de los colores de Logros en los 19 themes, con la guarda de la Bienvenida.
function loadWelcome() {
  const noop = () => {};
  const document = { readyState: 'loading', addEventListener: noop, getElementById: () => null, querySelector: () => null,
    querySelectorAll: () => [], createElement: () => ({ setAttribute: noop, appendChild: noop }) };
  const window = { document, console: { info: noop, warn: noop, log: noop }, location: { hash: '' }, addEventListener: noop,
    Storage: { STORAGE_KEYS: {}, get: () => null, set: noop } };
  vm.runInNewContext(read('js/welcome-panel.js'), { window, Date, JSON, Promise, Math });
  return window.Welcome._pure;
}
const W = loadWelcome();
const THEMES_DIR = path.join(ROOT, 'css', 'themes');
function readTheme(file) {
  const css = fs.readFileSync(path.join(THEMES_DIR, file), 'utf8');
  const block = css.slice(css.indexOf('{') + 1, css.indexOf('}'));
  const t = {};
  block.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
  return t;
}
const over = (c, b) => [0, 1, 2].map((i) => c[i] * c[3] + b[i] * (1 - c[3])).concat(1);
const themes = fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith('.css')).sort();
log('\n## Contraste (themes: ' + themes.length + ')');
const KEYS = ['--tx-1', '--tx-2', '--acc-1', '--color-amber'];
const rows = [];
themes.forEach((f) => {
  const tk = readTheme(f);
  const eff = Object.assign({}, tk, W.contrastFixes(tk) || {});
  const p = (k, fb) => W.parseColor(eff[k] || fb);
  const bg0 = over(p('--bg-0'), [255, 255, 255, 1]);
  const bg1 = over(p('--bg-1') || p('--bg-0'), bg0);
  const bg2 = over(p('--bg-2') || p('--bg-1'), bg1);
  const hero = over([232, 163, 61, 0.10], bg1);
  const S = { bg0, bg1, bg2, hero };
  const r = [f.replace('.css', '')];
  KEYS.forEach((k) => {
    const c = p(k, k === '--color-amber' ? '#F2B94B' : null);
    if (!c) { r.push(k + ':?'); return; }
    const vals = Object.keys(S).map((s) => s + '=' + W.contrast(over(c, S[s]), S[s]).toFixed(2));
    r.push(k + '[' + vals.join(' ') + ']');
  });
  // Barras (gráfico, 3:1 sobre --bg-2): verde y dorado.
  ['--color-green', '--color-amber'].forEach((k) => {
    const c = p(k, k === '--color-green' ? '#3CC48A' : '#F2B94B');
    r.push('bar' + k.slice(7) + '/bg2=' + W.contrast(over(c, bg2), bg2).toFixed(2));
  });
  r.push('fixes=' + Object.keys(W.contrastFixes(tk) || {}).join('|'));
  rows.push(r.join(' '));
});
rows.forEach(log);
console.log(out.join('\n'));
