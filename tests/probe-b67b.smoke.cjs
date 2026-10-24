// Sonda RUN-018 (BL-067 pasos 4–8): cabeceras, APIs públicas y eventos de los módulos a renovar. Se borra después.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
const cut = (s, n) => String(s).replace(/\s+/g, ' ').slice(0, n);
test('sonda', () => {
  const out = [];
  const files = ['js/activities.js', 'js/raid-tracker.js', 'js/strike-tracker.js', 'js/characters.js', 'js/characters-theme.js', 'js/inventory-hub.js', 'js/inventory-dashboard.js', 'js/accounts-panel.js'];
  files.forEach((f) => {
    const s = rd(f);
    out.push('## ' + f + ' ' + Buffer.byteLength(s) + ' B');
    const api = []; s.replace(/root\.(\w+)\s*=\s*\{([\s\S]{0,500}?)\};/g, (m, n, b) => { api.push(n + ': ' + cut(b.replace(/function\s*\([^)]*\)\s*\{[\s\S]*?\}/g, 'fn'), 260)); return m; });
    s.replace(/window\.(\w+)\s*=\s*\{([\s\S]{0,400}?)\};/g, (m, n, b) => { api.push(n + ': ' + cut(b, 200)); return m; });
    out.push('api: ' + (api.join(' | ') || '-'));
    const ev = new Set(); s.replace(/CustomEvent\(\s*['"]([\w:-]+)['"]/g, (m, e) => { ev.add(e); return m; }); out.push('emite: ' + [...ev].join(' '));
    const heads = []; s.split('\n').forEach((l) => { if (/panel__title|panel-head|<h2|<h1|insertAdjacentHTML\('afterbegin'/.test(l) && heads.length < 4) heads.push(cut(l, 170)); });
    out.push('cabecera: ' + heads.join(' ¶ '));
    const ids = []; s.replace(/getElementById\(['"](\w*Panel)['"]\)/g, (m, i) => { if (ids.indexOf(i) < 0) ids.push(i); return m; }); out.push('paneles: ' + ids.join(' '));
  });
  const html = rd('index.html');
  ['activitiesPanel', 'raidTrackerPanel', 'charactersPanel'].forEach((id) => {
    const i = html.indexOf('id="' + id + '"');
    out.push('--- ' + id + ' ' + (i < 0 ? 'NO ESTÁ EN index.html' : cut(html.slice(html.lastIndexOf('<', i), i + 700), 700)));
  });
  const sb = rd('tools/size-budget.json');
  out.push('--- size-budget: ' + cut(sb.split('\n').filter((l) => /activities|raid|strike|charact|inventory|accounts|index\.html/.test(l)).join(' ¶ '), 1200));
  console.log(out.join('\n'));
});
