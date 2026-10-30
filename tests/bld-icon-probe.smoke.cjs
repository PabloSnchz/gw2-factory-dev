// BLD-ICON sonda (se borra al cerrar): la wiki no responde a Actions (RUN-217/219). Pasada 3: los objetos oficiales de
// plantillas (Build Storage Expansion 92206 y sus vecinos del 2019-10-29) traen ícono por la API (render.guildwars2.com).
// Imprime nombre e ícono, y la versión 32 px en base64 (para mirarla yo antes de proponerla).
'use strict';
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; sonda de icono)' } };
(async () => {
  const ids = []; for (let i = 92190; i <= 92225; i++) ids.push(i);
  const r = await fetch('https://api.guildwars2.com/v2/items?lang=en&ids=' + ids.join(','), UA);
  const items = r.ok ? await r.json() : [];
  console.log('ITEMS', r.status, items.length);
  const pick = [];
  items.forEach((it) => {
    console.log('IT', it.id, it.name, it.type, it.icon);
    if (/template|storage|build/i.test(it.name)) pick.push(it);
  });
  const done = new Set();
  for (const it of pick) {
    const m = /render\.guildwars2\.com\/file\/([0-9A-F]+)\/(\d+)\.png/.exec(it.icon || '');
    if (!m || done.has(m[2])) continue;
    done.add(m[2]);
    try {
      const x = await fetch('https://icons-gw2.darthmaim-cdn.com/' + m[1] + '/' + m[2] + '-32px.png', UA);
      const b = Buffer.from(await x.arrayBuffer());
      console.log('B64', it.id, m[2], x.status, b.length, b.toString('base64'));
    } catch (e) { console.log('B64', it.id, 'ERR', e.message); }
  }
})();
