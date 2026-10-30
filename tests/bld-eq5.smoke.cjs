// Sonda BL-084 EQ-5 (se borra al terminar): forma real de las armas y la mecánica de profesión en /v2/professions?v=latest.
'use strict';
const API = 'https://api.guildwars2.com';
async function j(u) { const r = await fetch(API + u); return r.json(); }
(async () => {
  for (const p of ['Elementalist', 'Thief', 'Engineer', 'Mesmer', 'Revenant', 'Ranger', 'Necromancer', 'Guardian', 'Warrior']) {
    const x = await j('/v2/professions/' + p + '?v=latest&lang=es');
    const ws = Object.keys(x.weapons || {});
    const keys = new Set();
    ws.forEach((w) => (x.weapons[w].skills || []).forEach((s) => Object.keys(s).forEach((k) => keys.add(k))));
    const prof = (x.skills || []).filter((s) => s.type === 'Profession');
    const types = {}; (x.skills || []).forEach((s) => { types[s.type] = (types[s.type] || 0) + 1; });
    console.log('##', p, '| armas:', ws.join(','), '| claves:', [...keys].join(','), '| tipos:', JSON.stringify(types));
    console.log('  ej', ws[0], JSON.stringify(x.weapons[ws[0]]).slice(0, 300));
    console.log('  Profession', prof.length, JSON.stringify(prof.slice(0, 14)));
    if (p === 'Thief') console.log('  Daga:', JSON.stringify(x.weapons.Dagger.skills));
    if (p === 'Elementalist') console.log('  Cetro:', JSON.stringify(x.weapons.Scepter.skills).slice(0, 500));
  }
  const sk = await j('/v2/skills?ids=5491,5492,13132&lang=es');
  console.log('skills:', JSON.stringify(sk.map((s) => ({ id: s.id, name: s.name, slot: s.slot, type: s.type, att: s.attunement, spec: s.specialization, wt: s.weapon_type }))));
})().catch((e) => { console.error(e); process.exit(1); });
