'use strict';
// Sonda temporal TOP-5 (BL-070 paso 5): quién depende de la barra de arriba y del pie. Solo lee. Se borra después de OUT-104.
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const R = path.join(__dirname, '..');
function walk(d, out) {
  for (const f of fs.readdirSync(path.join(R, d))) {
    const p = d + '/' + f;
    if (/node_modules|\.git|zz-probe|legendary-(data|recipes|precursors)/.test(p)) continue;
    const st = fs.statSync(path.join(R, p));
    if (st.isDirectory()) walk(p, out); else if (/\.(c?js|css)$/.test(f)) out.push(p);
  }
  return out;
}
const PAT = /an-util|an-header|utilbar|brand-name|brand-compact|brand-logo|an-sep\b|an-home-link|an-link--keys|keysMenuBtn|guideLink|clearCacheBtn|exportSettingsBtn|importSettingsBtn|v6\.6\.2|<title|document\.title|Link in Bio|Pablin|profile\.png|site-footer|footer-(inner|mark|copy)|role="banner"|\bheader\b.*querySelector|querySelector\(['"]header/;
test('sonda TOP-5', () => {
  const files = walk('js', []).concat(walk('css', []), walk('tests', []), walk('tools', []));
  for (const f of files) {
    const L = fs.readFileSync(path.join(R, f), 'utf8').split('\n');
    const hits = [];
    L.forEach((l, i) => { if (PAT.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 140)); });
    if (/^tests\//.test(f) && /keySelectGlobal/.test(L.join('\n'))) hits.push('(usa keySelectGlobal)');
    if (hits.length) console.log('## ' + f + ' (' + hits.length + ')\n' + hits.slice(0, 14).join('\n'));
  }
  const sm = fs.readFileSync(path.join(R, 'js/settings-manager.js'), 'utf8');
  const i = sm.indexOf('clearCacheBtn');
  console.log('## SM clearCache\n' + sm.slice(i - 200, i + 1400));
});
