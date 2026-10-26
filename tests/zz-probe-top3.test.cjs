'use strict';
// Sonda temporal TOP-3 (BL-070 paso 5). Solo lee el repo. Se borra después de leer OUT-098.
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const R = path.join(__dirname, '..');
const rd = (p) => { try { return fs.readFileSync(path.join(R, p), 'utf8'); } catch (_) { return ''; } };
const cut = (s, n) => s.replace(/\s+/g, ' ').slice(0, n);

test('sonda TOP-3: ventanas, su CSS y quién las mide', () => {
  const css = rd('css/main.css');
  const re = /([^{}]*\.modal[^{}]*)\{([^{}]*)\}/g; let m; const out = [];
  while ((m = re.exec(css))) out.push(cut(m[1], 90) + '{' + cut(m[2], 160) + '}');
  console.log('MAINCSS-MODAL ' + out.length + '\n  ' + out.join('\n  ').slice(0, 2600));
  const tp = rd('css/theme-polish.css');
  const o2 = []; const re2 = /([^{}]*\.modal[^{}]*)\{([^{}]*)\}/g;
  while ((m = re2.exec(tp))) o2.push(cut(m[1], 80) + '{' + cut(m[2], 120) + '}');
  console.log('POLISH-MODAL ' + o2.length + '\n  ' + o2.join('\n  ').slice(0, 1200));
  const cm = rd('js/converter-modal.js'); const i = cm.indexOf("modal.setAttribute('role', 'dialog')");
  console.log('CONV ' + cut(cm.slice(i - 400, i + 1500), 1900));
  const ts = rd('js/theme-selector.js'); const j = ts.indexOf("modal.setAttribute('role', 'dialog')");
  console.log('THEME ' + cut(ts.slice(j - 300, j + 1500), 1800));
  const ix = rd('index.html');
  const k = ix.indexOf('<div id="keysModal"');
  console.log('KEYS-HTML-LEN ' + (ix.indexOf('<!-- Modal: Sincronización') - k));
  const t = fs.readdirSync(path.join(R, 'tests')).filter(f => /\.c?js$/.test(f) && !f.startsWith('zz-'));
  for (const f of t) {
    const s = rd('tests/' + f);
    const hits = s.split('\n').map((l, n) => [n + 1, l]).filter(([, l]) => /guideModal|guideLink|keysModal|kfLabel|preflight|access_token=|modal__dialog|modal__header|cx-modal|themeModal|onmouseover|5276ff/.test(l));
    if (hits.length) console.log('T|' + f + '|' + hits.length + '|' + hits.slice(0, 4).map(([n, l]) => n + ':' + cut(l, 110)).join(' || '));
  }
});
