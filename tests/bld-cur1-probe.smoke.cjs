// CUR-1 sonda (se borra al cerrar): muestra la forma real del HTML de Snow Crows (bench y ficha) y MetaBattle
// para escribir el lector semanal contra datos de verdad. Solo lectura, 3 páginas, con pausa.
'use strict';
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; sonda CUR-1)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sq = (s) => s.replace(/\s+/g, ' ');
async function get(u) { try { const r = await fetch(u, UA); return { st: r.status, h: await r.text() }; } catch (e) { return { st: 'ERR ' + e.message, h: '' }; } }
(async () => {
  const b = await get('https://snowcrows.com/en/benchmarks');
  const h = b.h;
  const re = /href="(?:https:\/\/snowcrows\.com)?\/(?:en\/)?builds\/raids\/[a-z]+\/[^"]+"[^>]*line-clamp-1/g;
  const idx = []; let m; while ((m = re.exec(h))) idx.push(m.index);
  console.log('BENCH', b.st, h.length, 'filas', idx.length);
  if (idx.length > 2) {
    const a = h.lastIndexOf('<tr', idx[1]); const z = h.indexOf('</tr>', idx[1]);
    console.log('FILA2 tr', a, z);
    console.log(sq(h.slice(a > 0 && idx[1] - a < 6000 ? a : idx[1] - 1500, z > 0 && z - idx[1] < 6000 ? z + 5 : idx[1] + 3000)).slice(0, 5200));
    console.log('---ENTRE-1-2', idx[1] - idx[0]);
    console.log('---HEAD', sq(h.slice(Math.max(0, idx[0] - 2500), idx[0] - 1500)).slice(0, 1200));
  }
  await sleep(1500);
  const s = await get('https://snowcrows.com/builds/raids/guardian/power-dragonhunter-radiance-spear-greatsword');
  const codes = [...new Set([...s.h.matchAll(/\[&(?:amp;)?(DQ[A-Za-z0-9+/]{40,}={0,2})\]/g)].map((x) => x[1]))];
  const wt = s.h.match(/writeText\('\[&(?:amp;)?(DQ[A-Za-z0-9+/]+={0,2})\]'\)/);
  const t = s.h.replace(/<[^>]+>/g, ' ');
  const up = t.match(/Updated\s+([A-Z][a-z]{2,8}\.?\s+\d{1,2},\s+\d{4})/);
  console.log('SC', s.st, s.h.length, 'codigos', codes.length, 'writeText', !!wt, 'updated', up && up[1]);
  const ui = t.indexOf('Updated'); console.log('SC-UPD', sq(t.slice(Math.max(0, ui - 300), ui + 200)).slice(0, 500));
  await sleep(1500);
  const g = await get('https://metabattle.com/wiki/Build:Willbender_-_Radiant_Swordbender_Roamer');
  const mc = [...new Set([...g.h.matchAll(/\[&(?:amp;)?(DQ[A-Za-z0-9+/]{40,}={0,2})\]/g)].map((x) => x[1]))];
  const tt = g.h.replace(/<[^>]+>/g, ' ');
  console.log('MB', g.st, g.h.length, 'codigos', mc.length, mc.join(' '));
  console.log('MB-PATCH', (tt.match(/up to date for the [^.]{0,40}patch/g) || []).slice(0, 3).join(' | '));
  const li = tt.search(/last (edited|modified)/i); console.log('MB-EDIT', li, sq(tt.slice(Math.max(0, li - 100), li + 200)));
})();
