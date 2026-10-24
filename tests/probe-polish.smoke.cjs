// Sonda de la Factory (CAM-POLISH-001). Solo lee y escribe en la salida: no afirma nada.
// Corre con el canal de diagnóstico (RUN-015). Se borra después.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const out = [];
const log = (s) => out.push(s);

const main = read('css/main.css');
// 1) Variables de :root en main.css (las que no define el theme).
const rootVars = {};
main.replace(/:root\s*\{([^}]*)\}/g, (_, b) => { b.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (m, k, v) => { rootVars[k] = v.trim(); return m; }); return _; });
log('## :root de main.css (superficies, bordes, sombras)');
Object.keys(rootVars).filter((k) => /^--(bg|bd|elev|glow|shadow|radius|card|surface)/.test(k)).forEach((k) => log(k + ': ' + rootVars[k]));

// 2) Reglas que tocan los paneles de la Cámara y de Logros o .panel en main.css.
log('\n## Reglas de main.css para .panel, #wvPanel, #achievementsPanel, .main, body');
main.replace(/([^{}]+)\{([^}]*)\}/g, (m, sel, body) => {
  const s = sel.trim();
  if (/(^|[\s,])\.panel\b(?![-_])|#wvPanel|#achievementsPanel|#wvTabShop|#wvPDPanel|(^|,)\s*body\b|\.col-main/.test(s) && /background|border|box-shadow/.test(body)) {
    log(s.replace(/\s+/g, ' ').slice(0, 160) + ' { ' + body.replace(/\s+/g, ' ').trim().slice(0, 260) + ' }');
  }
  return m;
});

// 3) Por theme: superficies efectivas.
const THEMES_DIR = path.join(ROOT, 'css', 'themes');
function hex(v) {
  v = String(v || '').trim();
  let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) { let h = m[1]; if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1); }
  m = v.match(/^rgba?\(([^)]+)\)$/i);
  if (m) { const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
  return null;
}
const over = (c, b) => [0, 1, 2].map((i) => c[i] * c[3] + b[i] * (1 - c[3])).concat(1);
const lum = (c) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
log('\n## Por theme: panel (--bg-1) contra tarjeta y borde');
log('theme | bg-0 | bg-1 | bg-2 | bd-1 | bd-2 | bg1/bg0 | bg2/bg1 | bd1/bg1 | bd2/bg1 | define');
fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith('.css')).sort().forEach((f) => {
  const css = fs.readFileSync(path.join(THEMES_DIR, f), 'utf8');
  const t = {};
  css.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (m, k, v) => { t[k] = v.trim(); return m; });
  const eff = Object.assign({}, rootVars, t);
  const res = (k) => { let v = eff[k]; for (let i = 0; i < 4 && v && /^var\(/.test(v); i++) { const m = v.match(/^var\((--[\w-]+)(?:,\s*([^)]+))?\)$/); v = m ? (eff[m[1]] || m[2]) : null; } return v; };
  const bg0 = over(hex(res('--bg-0')) || [0, 0, 0, 1], [255, 255, 255, 1]);
  const bg1 = over(hex(res('--bg-1')) || bg0, bg0);
  const bg2 = over(hex(res('--bg-2')) || bg1, bg1);
  const bd1 = over(hex(res('--bd-1')) || bg1, bg1);
  const bd2 = over(hex(res('--bd-2')) || bg1, bg1);
  log([f.replace('.css', ''), res('--bg-0'), res('--bg-1'), res('--bg-2'), res('--bd-1'), res('--bd-2'),
    ratio(bg1, bg0).toFixed(2), ratio(bg2, bg1).toFixed(2), ratio(bd1, bg1).toFixed(2), ratio(bd2, bg1).toFixed(2),
    Object.keys(t).filter((k) => /^--(bg-2|bd-1|bd-2|elev|glow)/.test(k)).join(' ')].join(' | '));
});
console.log(out.join('\n'));
