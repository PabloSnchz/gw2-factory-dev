// BL-084 EQ-0 sonda 2 (solo lectura, descartable): (a) la API oficial da en castellano lo que Snow Crows marca con ids;
// (b) qué bloques tiene la ficha (títulos de desplegables, tablas, pestañas) sin copiar texto.
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const strip = (s) => s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
const j = async (u) => (await fetch(u)).json();
(async () => {
  const A = 'https://api.guildwars2.com/v2/';
  const items = await j(A + 'items?ids=100916,74978,81167,48087,24615&lang=es');
  items.forEach((i) => console.log('ITEM', i.id, i.type, '|', i.name, '|', (i.description || '').slice(0, 120).replace(/\s+/g, ' '), '|', JSON.stringify((i.details && (i.details.bonuses || i.details.infix_upgrade)) || '').slice(0, 220)));
  const st = await j(A + 'itemstats/1077?lang=es'); console.log('STAT', st.id, st.name, JSON.stringify(st.attributes));
  const sk = await j(A + 'skills?ids=5805,6161&lang=es'); sk.forEach((s) => console.log('SKILL', s.id, s.name, '|', (s.description || '').slice(0, 140)));
  const tr = await j(A + 'traits?ids=2279&lang=es'); tr.forEach((s) => console.log('TRAIT', s.id, s.name, '|', (s.description || '').slice(0, 140)));
  const url = 'https://snowcrows.com/builds/raids/engineer/power-mechanist-rifle';
  const h = strip(await (await fetch(url, UA)).text());
  const exp = [...h.matchAll(/fa-plus'\\?"?\s*\\?"?\][^>]*><\/i>([^<]{2,60})</g)].map((m) => m[1].trim());
  const exp2 = [...h.matchAll(/'fa-plus'"><\/i>([^<]{2,60})</g)].map((m) => m[1].trim());
  console.log('EXPANDERS', JSON.stringify(exp.concat(exp2)));
  const ths = [...h.matchAll(/<th[^>]*>([^<]{2,60})<\/th>/g)].map((m) => m[1].trim());
  console.log('TH', JSON.stringify([...new Set(ths)]));
  const h3 = [...h.matchAll(/<h[23][^>]*>([^<]{2,60})<\/h[23]>/g)].map((m) => m[1].trim());
  console.log('H23', JSON.stringify(h3));
  const tabs = [...h.matchAll(/href="#([a-z-]{3,30})"/g)].map((m) => m[1]);
  console.log('ANCHORS', JSON.stringify([...new Set(tabs)]));
  const embeds = {}; for (const m of h.matchAll(/data-armory-embed="([a-z]+)"/g)) embeds[m[1]] = (embeds[m[1]] || 0) + 1;
  console.log('EMBEDS', JSON.stringify(embeds));
  const sk2 = [...h.matchAll(/data-armory-embed="skills" data-armory-ids="([\d,]+)"/g)].map((m) => m[1]);
  console.log('SKILLIDS', sk2.length, JSON.stringify([...new Set(sk2)].slice(0, 40)));
})();
