'use strict';
// Sonda temporal TOP-4 (BL-070 paso 5). Solo lee el repo. Se borra después de leer OUT-100.
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const R = path.join(__dirname, '..');
const rd = (p) => { try { return fs.readFileSync(path.join(R, p), 'utf8'); } catch (_) { return ''; } };
const cut = (s, n) => s.replace(/\s+/g, ' ').trim().slice(0, n);
// Palabras exactas de Gist: no «registro».
const RE = /gist-sync|GistSync|gistSync|syncGist|gistSync|gistUnlock|gistUpload|gistDownload|gistSaveToken|gistClearToken|gistStatus|gistAction|ghToken|ghPassword|ghUnlock|\bGist\b|gn:gist|GIST_|api\.github\.com\/gists/;

function lines(f) { return rd(f).split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => RE.test(l)); }

test('sonda TOP-4: dónde está Gist', () => {
  for (const dir of ['js', 'tests', 'tools', 'css', 'docs']) {
    let files = [];
    try { files = fs.readdirSync(path.join(R, dir)).filter((f) => /\.(c?js|json|css|html|md)$/.test(f)); } catch (_) {}
    for (const f of files) {
      const p = dir + '/' + f;
      if (/zz-probe/.test(f)) continue;
      const h = lines(p);
      if (h.length) console.log('F|' + p + '|' + h.length + '|' + h.slice(0, 5).map(([n, l]) => n + ':' + cut(l, 90)).join(' || '));
    }
  }
  const ix = rd('index.html'), L = ix.split('\n');
  const marks = [];
  L.forEach((l, i) => { if (RE.test(l) || /<script>|<\/script>|<!-- Modal|<!-- Script/.test(l)) marks.push((i + 1) + ':' + cut(l, 80)); });
  console.log('INDEX ' + Buffer.byteLength(ix) + '\n  ' + marks.join('\n  '));
  const st = rd('js/storage.js');
  console.log('STORAGE ' + (st.match(/[A-Z_]*GIST[A-Z_]*\s*:\s*'[^']+'/g) || []).join(', '));
  const g = rd('js/gist-sync.js');
  console.log('GISTSYNC ' + Buffer.byteLength(g) + ' keys: ' + [...new Set(g.match(/'(gn:[^']+|gist[^']*)'/g) || [])].join(', ').slice(0, 600));
  console.log('BUDGET ' + /gist-sync/.test(rd('tools/size-budget.json')));
});
