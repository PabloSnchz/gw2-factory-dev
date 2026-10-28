// RUN-202 (BL-082 UI): íconos oficiales de profesiones y élites para la propuesta de interfaz. Sonda temporal.
const fs = require('fs');
const path = require('path');
const A = 'https://api.guildwars2.com';
const j = async (u) => (await fetch(A + u)).json();
(async () => {
  const profs = await j('/v2/professions?ids=all&lang=es&v=latest');
  for (const p of profs) {
    console.log('P', p.id, p.name, p.icon, p.icon_big);
    const specs = await j('/v2/specializations?ids=' + p.specializations.join(',') + '&lang=es');
    specs.forEach((s) => console.log('S', p.id, s.id, s.elite ? 'E' : '-', s.name, s.icon, s.profession_icon || '', s.profession_icon_big || '', s.background));
  }
  const dir = path.join(__dirname, '..', 'assets', 'icons', 'professions');
  for (const f of fs.readdirSync(dir)) {
    const b = fs.readFileSync(path.join(dir, f));
    console.log('L', f, b.length, require('crypto').createHash('sha1').update(b).digest('hex').slice(0, 10));
  }
  for (const p of profs) {
    try { const b = Buffer.from(await (await fetch(p.icon_big)).arrayBuffer()); console.log('H', p.id, require('crypto').createHash('sha1').update(b).digest('hex').slice(0, 10), b.length); } catch (e) { console.log('H', p.id, 'ERR', e.message); }
  }
})();
