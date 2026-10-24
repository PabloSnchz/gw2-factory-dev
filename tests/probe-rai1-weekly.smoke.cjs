// Sonda temporal de BL-070 RAI-1 (no la corre app-checks; la pide factory-diagnose).
// Logros semanales de raids: ¿hay un objetivo por encuentro que sirva para marcar
// lo que /v2/account/raids no informa (gw2-api #148)? Solo lectura, sin claves.
'use strict';
const API = 'https://api.guildwars2.com';

async function get(p) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(API + p, { signal: AbortSignal.timeout(20000) });
      if (r.ok) return r.json();
      console.log('HTTP', r.status, p);
    } catch (e) { console.log('ERR', e.message, p); }
    await new Promise((s) => setTimeout(s, 1500));
  }
  return null;
}

(async () => {
  const ids = await get('/v2/achievements/categories');
  const cats = [];
  for (let i = 0; i < (ids || []).length; i += 200) {
    const part = await get('/v2/achievements/categories?ids=' + ids.slice(i, i + 200).join(','));
    if (Array.isArray(part)) cats.push(...part);
  }
  const weekly = cats.filter((c) => /weekly/i.test(c.name) && /raid|strike/i.test(c.name));
  for (const c of weekly) {
    const aids = (c.achievements || []).map((a) => (typeof a === 'object' ? a.id : a));
    console.log('## categoría ' + c.id + ' ' + c.name + ' (' + aids.length + ')');
    if (!aids.length) continue;
    const en = (await get('/v2/achievements?lang=en&ids=' + aids.join(','))) || [];
    const es = (await get('/v2/achievements?lang=es&ids=' + aids.join(','))) || [];
    const esById = Object.fromEntries(es.map((a) => [a.id, a]));
    for (const a of en) {
      const b = esById[a.id] || {};
      console.log('\n- ' + a.id + ' | ' + a.name + ' | ' + (b.name || '') + ' | flags ' + (a.flags || []).join(',') +
        ' | tiers ' + (a.tiers || []).map((t) => t.count).join('/') + ' | req: ' + String(a.requirement || '').slice(0, 90));
      (a.bits || []).forEach((bit, i) => {
        const bes = ((b.bits || [])[i] || {});
        console.log('  bit ' + i + ' ' + bit.type + (bit.id ? '#' + bit.id : '') + ' | ' + (bit.text || '') + ' | ' + (bes.text || ''));
      });
    }
  }
  if (!weekly.length) console.log('No hay categorías semanales de raids.');
})();
