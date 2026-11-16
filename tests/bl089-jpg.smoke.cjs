// RUN-290 (BL-089): antes de borrar los .jpg originales de las poses de La Guarida,
// busco cualquier referencia en los repos del ecosistema (texto, no binarios).
'use strict';
const H = { 'User-Agent': 'factory', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) H.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
const api = async u => { const r = await fetch('https://api.github.com' + u, { headers: H }); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); };
const raw = async (repo, sha) => { const r = await fetch('https://api.github.com/repos/PabloSnchz/' + repo + '/git/blobs/' + sha, { headers: Object.assign({}, H, { Accept: 'application/vnd.github.raw' }) }); return r.ok ? r.text() : ''; };
const REPOS = ['la-guarida', 'shiruvana', 'gw2-factory-dashboard', 'gw2-factory-dev', 'gw2-wallet-ligero', 'bio'];
const TXT = /\.(html?|css|js|cjs|mjs|json|md|ya?ml|txt|svg)$/i;
(async () => {
  const t = await api('/repos/PabloSnchz/la-guarida/git/trees/main?recursive=1');
  const jpgs = t.tree.filter(e => e.type === 'blob' && /\.(jpe?g)$/i.test(e.path));
  console.log('jpg en la-guarida:', jpgs.length);
  for (const j of jpgs) console.log('  ', j.path, j.size, j.sha);
  const names = jpgs.map(j => j.path.split('/').pop());
  let hits = 0;
  for (const repo of REPOS) {
    let tree;
    try { tree = await api('/repos/PabloSnchz/' + repo + '/git/trees/HEAD?recursive=1'); } catch (e) { console.log(repo, 'sin acceso', e.message); continue; }
    const files = tree.tree.filter(e => e.type === 'blob' && TXT.test(e.path) && e.size < 3e6 && !/^factory\/(diagnose|patches)\//.test(e.path) && !/^ai-memory\//.test(e.path) && !/^tests\/bl089-jpg/.test(e.path));
    let n = 0;
    for (const f of files) {
      const s = await raw(repo, f.sha);
      for (const nm of names) {
        const base = nm.replace(/\.jpe?g$/i, '');
        if (s.includes(nm) || new RegExp(base.replace(/[-]/g, '\\-') + '\\.jpe?g').test(s)) { console.log('REFERENCIA', repo, f.path, '->', nm); hits++; }
      }
      if (/brand\/shiruvana\/[^"'\s)]*\.jpe?g|\$\{[^}]*\}\.jpe?g|'\.jpg'|"\.jpg"/.test(s) && repo === 'la-guarida') { console.log('POSIBLE dinámica', repo, f.path); hits++; }
      n++;
    }
    console.log(repo, 'archivos de texto revisados', n);
  }
  console.log('referencias totales', hits);
})().catch(e => { console.error(e); process.exit(1); });
