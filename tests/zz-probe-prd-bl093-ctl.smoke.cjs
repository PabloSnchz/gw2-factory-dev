// Sonda temporal: control del pasaje BL-093 en PRD (gw2-wallet-ligero 987fad7) contra DEV f2f72e0. Se borra después.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const PRD = '987fad7f8f236dd283dcf22124158ea3cfe185dc', BASE = '6dca6a951884bdcd6e34005f13ac46d15ddc4b28', DEV = 'f2f72e07793e212d530f9cdb8a20ca5b4c703b37';
const h = { 'User-Agent': 'gw2-factory', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) h.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
const j = async (u) => (await fetch(u, { headers: h })).json();
async function tree(repo, sha) {
  const t = await j('https://api.github.com/repos/PabloSnchz/' + repo + '/git/trees/' + sha + '?recursive=1');
  const o = {}; (t.tree || []).forEach((x) => { if (x.type === 'blob') o[x.path] = x.sha; });
  return { o, truncated: t.truncated, n: Object.keys(o).length };
}
(async () => {
  const c = await j('https://api.github.com/repos/PabloSnchz/gw2-wallet-ligero/commits/main');
  console.log('PRD main', c.sha, (c.commit && c.commit.message || '').slice(0, 120), 'padres', (c.parents || []).map((p) => p.sha.slice(0, 7)).join(','));
  const rb = await j('https://api.github.com/repos/PabloSnchz/gw2-wallet-ligero/branches/rollback%2Fpre-bl-093');
  console.log('rollback/pre-bl-093', rb.commit && rb.commit.sha);
  const prd = await tree('gw2-wallet-ligero', PRD), base = await tree('gw2-wallet-ligero', BASE), dev = await tree('gw2-factory-dev', DEV);
  console.log('arboles', prd.n, base.n, dev.n, 'truncados', prd.truncated, base.truncated, dev.truncated);
  const man = fs.readFileSync(path.join(ROOT, 'factory/promote/BL-093.txt'), 'utf8').split('\n').filter((l) => /^C /.test(l)).map((l) => l.slice(2).trim());
  let ok = 0;
  man.forEach((p) => { const e = prd.o[p] === dev.o[p]; if (e) ok++; console.log((e ? 'IGUAL  ' : 'DISTINTO ') + p + ' ' + (prd.o[p] || '-').slice(0, 7) + ' / dev ' + (dev.o[p] || '-').slice(0, 7)); });
  console.log('manifiesto', ok + '/' + man.length);
  const fuera = Object.keys({ ...prd.o, ...base.o }).filter((p) => !man.includes(p) && prd.o[p] !== base.o[p]);
  console.log('cambios fuera del manifiesto', fuera.length, fuera.join(', '));
  for (const p of ['js/analytics.js', 'assets/meta-drops.json', 'assets/data/builds/watch.json', '.github/workflows/github-metrics-to-ga4.yml']) console.log('intacto', p, prd.o[p] === base.o[p]);
  const runs = await j('https://api.github.com/repos/PabloSnchz/gw2-wallet-ligero/actions/runs?per_page=5');
  (runs.workflow_runs || []).forEach((r) => console.log('run', r.name, r.head_sha.slice(0, 7), r.status, r.conclusion, r.created_at));
  for (const u of ['index.html', 'css/universo.css', 'css/themes/gato.css?v=2.0.0', 'js/theme-selector.js?v=1.3.0', 'js/escena-kit.js?v=1.0.0']) {
    try {
      const r = await fetch('https://pablosnchz.github.io/gw2-wallet-ligero/' + u + (u.includes('?') ? '&' : '?') + 'x=' + Date.now());
      const t = await r.text();
      const v = (t.match(/Versión: ?([\d.]+)/) || [])[1] || '';
      const extra = u === 'index.html' ? ' universo?v=' + ((t.match(/universo\.css\?v=([\d.]+)/) || [])[1]) + ' gato?v=' + ((t.match(/gato\.css\?v=([\d.]+)/) || [])[1]) + ' theme-color ' + ((t.match(/theme-color" content="([^"]+)/) || [])[1]) : '';
      console.log('sitio', u, r.status, t.length, v, extra);
    } catch (e) { console.log('sitio', u, 'ERROR', e.message); }
  }
})().catch((e) => console.log('ERROR', e && e.message));
