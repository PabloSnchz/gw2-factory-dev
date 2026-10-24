// Sonda temporal de BL-070 RAI-1 (no la corre app-checks; la pide factory-diagnose).
// Mide la API oficial: alas de /v2/raids, monedas de raids y categorías de logros de raids.
// Solo lectura, sin claves. Se borra al terminar RAI-1.
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

async function all(ep, lang) {
  const ids = await get('/v2/' + ep);
  if (!Array.isArray(ids)) return [];
  const out = [];
  for (let i = 0; i < ids.length; i += 200) {
    const part = await get('/v2/' + ep + '?lang=' + lang + '&ids=' + ids.slice(i, i + 200).join(','));
    if (Array.isArray(part)) out.push(...part);
  }
  return out;
}

(async () => {
  console.log('## /v2/raids');
  const raids = await get('/v2/raids?ids=all');
  (raids || []).forEach((r) => r.wings.forEach((w) => {
    console.log(r.id + ' > ' + w.id + ': ' + w.events.map((e) => e.id + '(' + e.type + ')').join(', '));
  }));

  console.log('\n## monedas');
  const RE = /magnetite|gaeting|insight|prophet|raid|astral/i;
  const curEn = await all('currencies', 'en');
  const curEs = await all('currencies', 'es');
  const esName = Object.fromEntries(curEs.map((c) => [c.id, c.name]));
  curEn.filter((c) => RE.test(c.name)).forEach((c) => {
    console.log(c.id + ' | ' + c.name + ' | ' + esName[c.id] + ' | ' + c.icon);
  });

  console.log('\n## categorías de logros (raid|strike|weekly)');
  const cats = await all('achievements/categories', 'en');
  cats.filter((c) => /raid|strike|weekly|balrior|glade|nexus/i.test(c.name)).forEach((c) => {
    const ids = (c.achievements || []).map((a) => (typeof a === 'object' ? a.id : a));
    console.log(c.id + ' | ' + c.name + ' | ' + ids.length + ' | ' + ids.join(','));
  });

  console.log('\n## grupos de logros');
  const groups = await all('achievements/groups', 'en');
  groups.filter((g) => /raid|strike/i.test(g.name)).forEach((g) => console.log(g.id + ' | ' + g.name + ' | cats ' + g.categories.join(',')));
})();
