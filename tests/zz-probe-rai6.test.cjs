// Sonda temporal de RAI-6 (BL-070): contraste de cada color de texto de raids-view y raids-sheet en los 19 themes.
// No falla nunca: informa. Se borra después de RUN-039.
'use strict';
const test = require('node:test');
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
  vm.runInContext(read('js/gn-surface.js'), ctx);
  vm.runInContext(read('js/gn-frame.js'), ctx);
  vm.runInContext(read('js/raids-view.js'), ctx);
  vm.runInContext(read('js/raids-sheet.js'), ctx);
  return win;
}
test('sonda', () => {
  const W = load();
  const P = W.GNSurface._pure;
  const out = [];
  const decls = [];
  for (const [name, css] of [['view', W.RaidsView._pure.CSS], ['sheet', W.RaidsSheet._pure.CSS]]) {
    css.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel, body) => {
      body.replace(/(?:^|;)\s*color\s*:\s*([^;}]+)/g, (mm, v) => { decls.push({ f: name, sel: sel.trim().slice(-70), v: v.trim() }); return mm; });
      return m;
    });
  }
  out.push('declaraciones de color: ' + decls.length);
  decls.forEach((d) => out.push('  ' + d.f + ' | ' + d.sel + ' | ' + d.v));
  const MOD = '#F47C7C';
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
  const fails = {};
  for (const { id, tokens } of THEMES) {
    const sf = P.surfaces(tokens);
    if (!sf) { out.push(id + ': sin superficies'); continue; }
    const fx = W.GNFrame._pure.guardFixes(W.GNSurface.surfaceTokens(tokens), P);
    const eff = Object.assign({}, tokens, sf, fx);
    const bg0 = P.over(P.parse(tokens['--bg-0']), [255, 255, 255, 1]);
    const S = { bg0, tray: P.parse(sf['--gn-tray']), card: P.parse(sf['--bg-1']), track: P.parse(sf['--bg-2']) };
    S.hero = P.over([0xF4, 0x7C, 0x7C, 0.12], S.tray);
    for (const d of decls) {
      const raw = resolve(d.v, eff);
      const c = P.parse(raw);
      if (!c) { (fails['NOPARSE ' + d.v] = fails['NOPARSE ' + d.v] || []).push(id + ':' + raw); continue; }
      const bad = [];
      for (const [k, b] of Object.entries(S)) {
        const r = P.contrast(P.over(c, b), b);
        if (r < 4.5) bad.push(k + ' ' + r.toFixed(2));
      }
      if (bad.length) { const key = d.f + ' | ' + d.sel + ' | ' + d.v; (fails[key] = fails[key] || []).push(id + ' [' + bad.join(', ') + ']'); }
    }
  }
  out.push('--- fallas (color < 4.5 sobre alguna superficie) ---');
  for (const [k, v] of Object.entries(fails)) { out.push(k + '  (' + v.length + ' themes)'); v.forEach((x) => out.push('    ' + x)); }
  out.push('themes: ' + THEMES.map((t) => t.id).join(', '));
  console.log('PROBE-BEGIN\n' + out.join('\n') + '\nPROBE-END');
});
