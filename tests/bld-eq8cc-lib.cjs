// Sonda BL-084 EQ-8 (se borra al terminar): qué habilidades de cada build PvE controlan (rompen la barra de desafío),
// con los datos oficiales de /v2/skills (facts). Cada tests/bld-eq8cc-N.smoke.cjs imprime 6 builds.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require(path.join(ROOT, 'js/bld-code.js'));
const R = require(path.join(ROOT, 'js/bld-ref.js'));
const API = 'https://api.guildwars2.com';
const CC = /aturd|atont|derrib|rechaz|atrac|atra[eí]|lanzam|miedo|flot|hund|provoc|ruptura|desaf[ií]o|stun|daze|knock|pull|launch|fear|float|sink|taunt|defiance/i;

async function skills(ids) {
  ids = [...new Set(ids.filter(Boolean))];
  const out = [];
  for (let i = 0; i < ids.length; i += 150) {
    const r = await fetch(API + '/v2/skills?ids=' + ids.slice(i, i + 150).join(',') + '&lang=es');
    const j = await r.json();
    if (Array.isArray(j)) out.push(...j);
  }
  return out;
}

module.exports = async function (n, per) {
  per = per || 6;
  const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));
  const pve = cat.builds.filter((b) => b.mode === 'pve').slice(n * per, n * per + per);
  let first = true;
  for (const b of pve) {
    const L = ['### ' + b.id];
    try {
      const code = GNBldCode.decode(b.code);
      const ref = await R.load(code.profession);
      const v = R.resolve(code, ref);
      const elite = v.specs[2] && v.specs[2].elite ? v.specs[2].id : 0;
      if (first) { const tf = Object.values(ref.skills).length; L.push('(ref skills ' + tf + ')'); first = false; }
      L.push('palette land=' + code.skills.land.join(',') + ' weapons(code)=' + code.weapons.join(','));
      const ids = v.land.filter(Boolean).map((s) => s.id);
      ref.prof.forEach((p) => { const s = ref.skills[p[0]]; if (s && (!s.spec || s.spec === elite)) ids.push(p[0]); });
      const wk = (b.weapons || []);
      wk.forEach((w) => {
        const x = ref.weapons[w];
        if (!x) { L.push('sin arma en ref: ' + w); return; }
        x.skills.forEach((s) => ids.push(s[0]));
        L.push('ARMA ' + w + ': ' + x.skills.map((s) => s[1].replace('Weapon_', '') + (s[3] ? s[3].slice(0, 2) : '') + (s[2] ? '(' + s[2].slice(0, 3) + ')' : '') + ' s' + s[0] + ' ' + ((ref.skills[s[0]] || {}).name || '?')).join(' · '));
      });
      if (v.legends) v.legends.land.forEach((l) => { if (l) ids.push(l.heal, l.elite, ...(l.utilities || [])); });
      const sk = await skills(ids);
      const types = {};
      sk.forEach((s) => (s.facts || []).forEach((f) => { types[f.type] = 1; }));
      if (n === 0 && b === pve[0]) L.push('fact types: ' + Object.keys(types).join(','));
      sk.forEach((s) => {
        const fx = (s.facts || []).filter((f) => f.type === 'Defiance_Break' || CC.test(String(f.text || '') + ' ' + String(f.status || '')));
        if (!fx.length) return;
        const rec = (s.facts || []).find((f) => f.type === 'Recharge');
        L.push('s' + s.id + ' ' + s.name + ' [' + (s.slot || '') + (s.attunement ? ' ' + s.attunement : '') + ']: ' +
          fx.map((f) => (f.status || f.text || f.type) + (f.value != null ? ' ' + f.value : '') + (f.duration != null ? ' ' + f.duration + 's' : '')).join(', ') +
          (rec ? ' · rec ' + rec.value : ''));
      });
    } catch (e) {
      L.push('ERROR ' + e.message);
    }
    console.log(L.join('\n'));
  }
};
