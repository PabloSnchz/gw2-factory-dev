'use strict';
// Sonda temporal TOP-0 v3 (BL-070 paso 5). Solo lee el repo. Se borra después de leer OUT-091.
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const R = path.join(__dirname, '..');
const rd = (p) => { try { return fs.readFileSync(path.join(R, p), 'utf8'); } catch (_) { return ''; } };
const lines = (p, re) => rd(p).split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => re.test(l));

test('sonda v3: clases de los avisos en todo el CSS', () => {
  const css = ['css/main.css', 'css/theme-polish.css'].concat(fs.readdirSync(path.join(R, 'css/themes')).map(f => 'css/themes/' + f));
  for (const c of css) lines(c, /toast--|toast__|toastIn/).forEach(([n, l]) => console.log('CSS|' + c + ':' + n + '|' + l.trim().slice(0, 160)));
  const a = rd('js/app.js');
  console.log('APP-CLASS', (a.match(/toast--['"]?\s*\+?\s*\w*/g) || []).join(' '));
});

test('sonda v3: quién depende de Gist', () => {
  const files = fs.readdirSync(path.join(R, 'js')).filter(f => f.endsWith('.js'));
  for (const f of files) {
    const hits = lines('js/' + f, /GistSync|gist-sync|gistSync|gn:gist|syncGist/);
    if (hits.length) console.log('GIST|' + f + '|' + hits.length + '|' + hits.slice(0, 4).map(([n, l]) => n + ':' + l.trim().slice(0, 90)).join(' || '));
  }
  const t = fs.readdirSync(path.join(R, 'tests')).filter(f => /\.c?js$/.test(f) && !f.startsWith('zz-'));
  for (const f of t) { const s = rd('tests/' + f); const n = (s.match(/gist/gi) || []).length; if (n) console.log('GIST-TEST|' + f + '|' + n); }
  const ix = rd('index.html');
  console.log('INDEX-GIST', (ix.match(/gist/gi) || []).length, 'script', /gist-sync\.js/.test(ix));
  const b = rd('tools/size-budget.json');
  console.log('BUDGET-GIST', /gist/.test(b), 'BUDGET-SETTINGS', /settings-manager/.test(b), 'BUDGET-APP', /app\.js/.test(b), 'BUDGET-API', /api-gw2/.test(b));
});

test('sonda v3: diálogos nativos, línea por línea', () => {
  for (const f of ['js/api-gw2.js', 'js/app.js', 'js/gist-sync.js', 'js/settings-manager.js']) {
    lines(f, /(^|[^\w.])(confirm|alert|prompt)\s*\(/).forEach(([n, l]) => console.log('NATIVE|' + f + ':' + n + '|' + l.trim().slice(0, 150)));
  }
});

test('sonda v3: modales que crea el js', () => {
  for (const f of ['js/converter-modal.js', 'js/theme-selector.js', 'js/raid-tracker.js', 'js/sidebar-nav.js', 'js/inv-sheet.js']) {
    const hits = lines(f, /role=["']dialog|'role',\s*'dialog'|modal__dialog|Escape|aria-modal|\.focus\(/);
    console.log('MODAL|' + f + '|' + hits.length + '|' + hits.slice(0, 5).map(([n, l]) => n + ':' + l.trim().slice(0, 80)).join(' || '));
  }
  const ix = rd('index.html');
  console.log('INDEX-RAID', /raid-tracker\.js/.test(ix), 'CONVERTER', /converter-modal\.js/.test(ix), 'THEMESEL', /theme-selector\.js/.test(ix));
  const a = rd('js/app.js');
  console.log('APP-KEYSMODAL', lines('js/app.js', /keysModal|Escape|focus\(/).slice(0, 8).map(([n, l]) => n + ':' + l.trim().slice(0, 80)).join(' || '));
  console.log('APP-VERSION', (a.match(/v\d+\.\d+\.\d+/) || [''])[0], 'TITLE', (ix.match(/<title>[^<]*/) || [''])[0]);
});
