// Sonda temporal: árbol de DEV (este checkout) contra el de PRD (gw2-wallet-ligero HEAD, API pública de GitHub). Se borra después.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..');
const blob = (b) => crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob ' + b.length + '\0'), b])).digest('hex');
let head = '';
try { head = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch (_) {}
console.log('DEV HEAD', head);
function walk(d, out) {
  for (const n of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    const p = d ? d + '/' + n.name : n.name;
    if (n.name === '.git' || n.name === 'node_modules') continue;
    if (n.isDirectory()) walk(p, out); else out[p] = blob(fs.readFileSync(path.join(ROOT, p)));
  }
  return out;
}
const dev = walk('', {});
(async () => {
  const h = { 'User-Agent': 'gw2-factory', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) h.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
  const c = await (await fetch('https://api.github.com/repos/PabloSnchz/gw2-wallet-ligero/commits/main', { headers: h })).json();
  console.log('PRD HEAD', c.sha, (c.commit && c.commit.message || '').slice(0, 80));
  const t = await (await fetch('https://api.github.com/repos/PabloSnchz/gw2-wallet-ligero/git/trees/' + c.sha + '?recursive=1', { headers: h })).json();
  console.log('PRD truncated', t.truncated, 'entries', (t.tree || []).length);
  const prd = {};
  (t.tree || []).forEach((x) => { if (x.type === 'blob') prd[x.path] = x.sha; });
  const SHIP = /^(index\.html|privacy\.html|js\/|css\/|assets\/|docs\/user-guide|\.github\/workflows\/builds-watch\.yml|\.github\/scripts\/bld-)/;
  const SKIP = /^(js\/analytics\.js|assets\/meta-drops\.json|assets\/data\/builds\/(watch|bench|catalog|gear)\.json)$/;
  const rows = { C_new: [], C_mod: [], prdOnly: [], same: 0, skipDiff: [] };
  Object.keys(dev).sort().forEach((p) => {
    if (!SHIP.test(p)) return;
    if (SKIP.test(p)) { if (prd[p] !== dev[p]) rows.skipDiff.push(p); return; }
    if (!prd[p]) rows.C_new.push(p + ' ' + dev[p]);
    else if (prd[p] !== dev[p]) rows.C_mod.push(p + ' ' + prd[p].slice(0, 7) + '→' + dev[p]);
    else rows.same++;
  });
  Object.keys(prd).sort().forEach((p) => { if (SHIP.test(p) && !dev[p]) rows.prdOnly.push(p + ' ' + prd[p].slice(0, 7)); });
  console.log('iguales', rows.same);
  console.log('NUEVOS', rows.C_new.length); rows.C_new.forEach((x) => console.log('  ' + x));
  console.log('MODIFICADOS', rows.C_mod.length); rows.C_mod.forEach((x) => console.log('  ' + x));
  console.log('SOLO EN PRD', rows.prdOnly.length); rows.prdOnly.forEach((x) => console.log('  ' + x));
  console.log('EXCLUIDOS distintos (versión PRD o datos de su vigía)', rows.skipDiff.join(', '));
  const gh = Object.keys(dev).filter((p) => /^\.github\//.test(p) && !SHIP.test(p) && prd[p] && prd[p] !== dev[p]);
  console.log('otros .github distintos (no se pasan):', gh.join(', ') || '—');
})().catch((e) => { console.log('ERROR', e && e.message); });
