// BL-084 EQ-0 sonda (solo lectura, descartable): estructura de una ficha de build de Snow Crows (equipo y notas).
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const strip = (s) => s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
(async () => {
  const url = 'https://snowcrows.com/builds/raids/engineer/power-mechanist-rifle';
  const r = await fetch(url, UA);
  const h = strip(await r.text());
  console.log('status', r.status, 'len', h.length);
  // atributos de datos con ids (armory embeds y similares)
  const attrs = {};
  for (const m of h.matchAll(/(data-[a-z-]+)="([^"]{0,80})"/g)) { (attrs[m[1]] = attrs[m[1]] || []).push(m[2]); }
  Object.keys(attrs).forEach((k) => console.log('ATTR', k, attrs[k].length, JSON.stringify(attrs[k].slice(0, 12))));
  // títulos de secciones y desplegables
  const heads = [...h.matchAll(/<(h[1-4]|summary|button)[^>]*>([\s\S]{0,200}?)<\/\1>/g)].map((m) => m[1] + ':' + m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter((x) => x.length > 4);
  console.log('HEADS', heads.length); heads.slice(0, 80).forEach((x) => console.log('  ' + x));
  // alrededor de "Skill Notes" y "Equipment Notes"
  for (const k of ['Skill Notes', 'Equipment Notes', 'Relic Notes', 'Trait Notes', 'Superior Rune of', 'Relic of']) {
    const i = h.indexOf(k); console.log('\n==== ' + k + ' @' + i);
    if (i > 0) console.log(h.slice(Math.max(0, i - 1200), i + 600).replace(/\s+/g, ' ').slice(0, 1800));
  }
})();
