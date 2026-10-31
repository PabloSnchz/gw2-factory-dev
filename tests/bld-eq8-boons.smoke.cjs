// Sonda BL-084 EQ-8 (se borra al terminar): cómo nombra la API en castellano cada bendición y estado (para que las notas
// usen el mismo nombre que el juego). Compara los facts Buff de las mismas habilidades en inglés y en castellano.
'use strict';
const API = 'https://api.guildwars2.com/v2/skills?ids=';
const IDS = [62655, 40915, 29965, 14355, 9143, 14403, 62967, 30189, 9102, 41714, 10213, 76746, 10544, 62530, 9093, 14516, 10232, 6161];
(async () => {
  const q = IDS.join(',');
  const [en, es] = await Promise.all(['en', 'es'].map((l) => fetch(API + q + '&lang=' + l).then((r) => r.json())));
  const byId = {};
  es.forEach((s) => { byId[s.id] = s; });
  const map = {};
  en.forEach((s) => {
    const e = byId[s.id];
    if (!e) return;
    console.log('s' + s.id + ' ' + s.name + ' = ' + e.name);
    (s.facts || []).forEach((f, i) => {
      const g = (e.facts || [])[i];
      if (f.status && g && g.status) map[f.status] = g.status;
    });
  });
  Object.keys(map).sort().forEach((k) => console.log(k + ' -> ' + map[k]));
})().catch((e) => { console.error(e); process.exit(1); });
