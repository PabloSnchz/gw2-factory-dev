'use strict';
// Sonda GUI-5 (BL-071): enlaces a las copias viejas, Gist en docs, textos de «Guías» y contraste de las guías. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const cut = (l) => l.trim().replace(/\s+/g, ' ').slice(0, 200);
function walk(d, out) {
  for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = d ? d + '/' + e.name : e.name;
    if (e.isDirectory()) walk(p, out); else if (/\.(js|cjs|html|md|json|yml|css)$/.test(e.name)) out.push(p);
  }
  return out;
}
test('sonda GUI-5', () => {
  const all = walk('', []);
  for (const f of all) {
    if (f.startsWith('factory/') || f.startsWith('ai-memory/')) continue;
    const s = rd(f);
    s.split('\n').forEach((l, i) => {
      if (/user-guide-avanzado\.md|PRIVACIDAD\.md/.test(l)) console.log('LINKMD ' + f + ':' + (i + 1) + ' ' + cut(l));
    });
  }
  rd('docs/BRIEFING.md').split('\n').forEach((l, i) => { if (/gist/i.test(l)) console.log('BRIEF ' + (i + 1) + ' ' + cut(l)); });
  const idx = rd('index.html');
  idx.split('\n').forEach((l, i) => { if (/user-guide|Guía|guideModal|guideLink/.test(l)) console.log('IDX ' + (i + 1) + ' ' + cut(l)); });
  console.log('IDXSIZE ' + Buffer.byteLength(idx));
  rd('js/welcome-panel.js').split('\n').forEach((l, i) => { if (/guide|Guía/.test(l)) console.log('WEL ' + (i + 1) + ' ' + cut(l)); });
  rd('tests/welcome-view.test.cjs').split('\n').forEach((l, i) => { if (/guide|Guía|guía/.test(l)) console.log('WELT ' + (i + 1) + ' ' + cut(l)); });
  for (const f of ['js/shiruvana-places.js', 'js/gn-topbar.js', 'js/sidebar-nav.js', 'tests/shiruvana-places.test.cjs', 'tests/gn-topbar.test.cjs', 'tests/index-identity.test.cjs']) {
    rd(f).split('\n').forEach((l, i) => { if (/user-guide|Guía (básica|avanzada|de usuario)|guía avanzada|guía básica/i.test(l)) console.log('REF ' + f + ':' + (i + 1) + ' ' + cut(l)); });
  }
  for (const k of ['gn:wallet:snapshots', 'gn:wallet:state', 'gn:converter:state', 'gn:wallet:hidezero', 'gn:wv:season', 'gn:wv:shop:view', 'gn:wv:last_tab']) {
    const w = [];
    for (const f of fs.readdirSync(path.join(ROOT, 'js'))) {
      const s = rd('js/' + f);
      if (s.includes(k) || (k === 'gn:wallet:snapshots' && /WALLET_SNAPSHOTS/.test(s)) || (k === 'gn:wallet:state' && /WALLET_STATE/.test(s))) w.push(f);
    }
    console.log('USE ' + k + ' ' + w.join(','));
  }
  // Contraste de las guías: texto tx-1/tx-2 sobre bg-0, bg-1 y bg-2 de cada theme, con los tokens tal cual.
  const hex = (v) => { v = (v || '').trim(); const m = v.match(/^#([0-9a-f]{3,8})$/i); if (!m) return null; let h = m[1]; if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const lum = (c) => { const a = c.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const TD = path.join(ROOT, 'css', 'themes');
  for (const f of fs.readdirSync(TD).filter((x) => x.endsWith('.css')).sort()) {
    const css = fs.readFileSync(path.join(TD, f), 'utf8'), t = {};
    css.slice(css.indexOf('{') + 1, css.indexOf('}')).replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
    const row = [];
    for (const tx of ['--tx-1', '--tx-2']) for (const bg of ['--bg-0', '--bg-1', '--bg-2']) {
      const a = hex(t[tx]), b = hex(t[bg]);
      row.push(tx.slice(2) + '/' + bg.slice(2) + '=' + (a && b ? cr(a, b).toFixed(2) : '?(' + t[tx] + '|' + t[bg] + ')'));
    }
    const a1 = hex(t['--acc-1']), b0 = hex(t['--bg-0']);
    row.push('acc1/bg0=' + (a1 && b0 ? cr(a1, b0).toFixed(2) : '?'));
    console.log('CR ' + f + ' ' + row.join(' '));
  }
});
