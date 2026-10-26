'use strict';
// Sonda temporal TOP-2 v2 (BL-070 paso 5). Solo lee el repo. Se borra después de leer OUT-095.
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const R = path.join(__dirname, '..');
const rd = (p) => { try { return fs.readFileSync(path.join(R, p), 'utf8'); } catch (_) { return ''; } };

test('sonda TOP-2 v2: tests que miran confirm/alert/prompt de app.js o settings-manager.js', () => {
  const t = fs.readdirSync(path.join(R, 'tests')).filter(f => /\.c?js$/.test(f) && !f.startsWith('zz-'));
  for (const f of t) {
    const s = rd('tests/' + f);
    if (!/settings-manager|app\.js/.test(s)) continue;
    const hits = s.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /confirm|alert\s*\(|prompt|restoreSafetySnapshot|clearApiCache|__settingsWired/.test(l));
    if (!hits.length) continue;
    console.log('F|' + f + '|' + hits.length);
    hits.slice(0, 14).forEach(([n, l]) => console.log('  ' + n + '|' + l.trim().slice(0, 150)));
  }
  const sm = rd('js/settings-manager.js');
  console.log('SM-EXPORTS', (sm.match(/window\.\w+\s*=|root\.\w+\s*=|SettingsManager\s*=\s*\{[^}]*\}/g) || []).join(' || ').slice(0, 600));
  console.log('SM-FUNCS', (sm.match(/(async\s+)?function\s+\w+/g) || []).join(', '));
  console.log('SM-VERSION', (sm.match(/v\d+\.\d+\.\d+|Versi[oó]n:\s*[\d.]+/g) || []).slice(0, 4).join(' '));
  const ix = rd('index.html');
  console.log('IX-SM', (ix.match(/settings-manager\.js\?v=[\d.]+/) || [''])[0], 'IX-APP', (ix.match(/app\.js\?v=[\d.]+/) || [''])[0]);
  const users = fs.readdirSync(path.join(R, 'js')).filter(f => f.endsWith('.js') && /restoreSafetySnapshot/.test(rd('js/' + f)));
  console.log('USERS-restoreSafetySnapshot', users.join(','));
});
