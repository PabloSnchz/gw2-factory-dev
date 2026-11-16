// Sonda temporal BL-088: producción 13efe64 contra DEV (commit fijo c8ddd29) y contra la base 73d1b09. Se borra después.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const H = { 'User-Agent': 'gw2-factory', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) H.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
const get = async (u) => (await fetch('https://api.github.com/repos/PabloSnchz/' + u, { headers: H })).json();
async function tree(repo, sha) { const t = await get(repo + '/git/trees/' + sha + '?recursive=1'); const o = {}; (t.tree || []).forEach((x) => { if (x.type === 'blob') o[x.path] = x.sha; }); return { o, trunc: t.truncated }; }
(async () => {
  const DEV = 'c8ddd2987bdcc3d71f7f922687dcba6eaddf5c4f', PRD = '13efe64af09af5867c95cf8e55d84a377c9268a8', BASE = '73d1b09dc77876f7f382c9d561f090e9cbaa1d7d';
  const head = await get('gw2-wallet-ligero/commits/main');
  console.log('PRD main HEAD', head.sha, '·', (head.commit && head.commit.message || '').split('\n')[0]);
  const c = await get('gw2-wallet-ligero/commits/' + PRD);
  console.log('commit', PRD.slice(0, 7), 'padre', (c.parents || []).map((p) => p.sha.slice(0, 7)).join(','), 'archivos', (c.files || []).length, '·', (c.commit && c.commit.message || '').split('\n')[0]);
  const rb = await get('gw2-wallet-ligero/branches/rollback%2Fpre-bl-088');
  console.log('rollback/pre-bl-088 =', rb.commit && rb.commit.sha);
  const man = fs.readFileSync(path.join(ROOT, 'factory/promote/BL-088.txt'), 'utf8').split('\n').filter((l) => /^C /.test(l)).map((l) => l.slice(2).trim());
  const [d, p, b] = await Promise.all([tree('gw2-factory-dev', DEV), tree('gw2-wallet-ligero', PRD), tree('gw2-wallet-ligero', BASE)]);
  console.log('truncados', d.trunc, p.trunc, b.trunc);
  let ok = 0; const bad = [];
  man.forEach((f) => { if (p.o[f] && p.o[f] === d.o[f]) ok++; else bad.push(f + ' prd=' + (p.o[f] || '—').slice(0, 7) + ' dev=' + (d.o[f] || '—').slice(0, 7)); });
  console.log('manifiesto', man.length, 'iguales a DEV', ok, 'distintos', bad.length); bad.forEach((x) => console.log('  ' + x));
  const changed = Object.keys(Object.assign({}, p.o, b.o)).filter((f) => p.o[f] !== b.o[f]);
  const extra = changed.filter((f) => man.indexOf(f) < 0);
  console.log('cambiados contra la base', changed.length, '· fuera del manifiesto', extra.length, extra.join(', '));
  const SHIP = /^(index\.html|privacy\.html|js\/|css\/|assets\/|docs\/user-guide)/;
  const diff = Object.keys(d.o).filter((f) => SHIP.test(f) && p.o[f] !== d.o[f]);
  console.log('publicables distintos DEV vs PRD (esperados: analytics.js, meta-drops.json, watch.json):', diff.join(', '));
  ['js/analytics.js', 'assets/meta-drops.json', 'assets/data/builds/watch.json'].forEach((f) => console.log('  intacto en PRD', f, p.o[f] === b.o[f]));
  const runs = await get('gw2-wallet-ligero/actions/runs?per_page=5');
  (runs.workflow_runs || []).forEach((r) => console.log('run', r.name, r.event, r.status, r.conclusion, r.head_sha.slice(0, 7), r.created_at));
  const pages = await get('gw2-wallet-ligero/pages/builds/latest');
  console.log('pages', pages.status, pages.commit && pages.commit.slice(0, 7), pages.updated_at, pages.message || '');
  for (const f of ['js/modules.json', 'index.html']) {
    try { const r = await fetch('https://pablosnchz.github.io/gw2-wallet-ligero/' + f + '?t=' + Date.now()); const t = await r.text();
      console.log('sitio', f, r.status, f === 'js/modules.json' ? (t.match(/bld-sheet\.js", "v": "([\d.]+)"/) || [])[1] : (t.match(/shiruvana\.js\?v=([\d.]+)/) || [])[1]); } catch (e) { console.log('sitio', f, 'ERROR', e.message); }
  }
})().catch((e) => console.log('ERROR', e && e.message));
