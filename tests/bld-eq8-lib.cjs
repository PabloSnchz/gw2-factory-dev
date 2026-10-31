// Sonda BL-084 EQ-8 (se borra al terminar): datos oficiales en castellano de las builds PvE para escribir las notas.
// Cada tests/bld-eq8-N.smoke.cjs llama a esta función con N: imprime las builds PvE 3N..3N+2 del catálogo.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require(path.join(ROOT, 'js/bld-code.js'));
const R = require(path.join(ROOT, 'js/bld-ref.js'));
const API = 'https://api.guildwars2.com';

function plain(s, n) {
  s = String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return n && s.length > n ? s.slice(0, n - 1) + '…' : s;
}
async function items(ids) {
  ids = [...new Set(ids.filter(Boolean))];
  if (!ids.length) return {};
  const r = await fetch(API + '/v2/items?ids=' + ids.join(',') + '&lang=es');
  const j = await r.json();
  const m = {};
  (Array.isArray(j) ? j : []).forEach((x) => { m[x.id] = x; });
  return m;
}

module.exports = async function (n, per) {
  per = per || 3;
  const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));
  const gear = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/gear.json'), 'utf8')).gear;
  const pve = cat.builds.filter((b) => b.mode === 'pve').slice(n * per, n * per + per);
  for (const b of pve) {
    const L = [];
    try {
      const code = GNBldCode.decode(b.code);
      const ref = await R.load(code.profession);
      const v = R.resolve(code, ref);
      const elite = v.specs[2] && v.specs[2].elite ? v.specs[2].id : 0;
      L.push('### ' + b.id);
      L.push('roles=' + (b.roles || []).join(',') + ' dmg=' + b.damage + ' boon=' + (b.boon || '') + ' armas=' + (b.weapons || []).join('/') + ' dif=' + b.difficulty);
      v.specs.forEach((s) => {
        L.push('ESP ' + s.id + ' ' + s.name + (s.elite ? ' (élite)' : ''));
        s.traits.forEach((t) => { if (t) L.push('  t' + t.id + ' ' + t.name + ': ' + plain(t.description, 170)); });
      });
      ['curación', 'u1', 'u2', 'u3', 'élite'].forEach((nm, i) => {
        const s = v.land[i];
        if (s) L.push('B ' + nm + ' s' + s.id + ' ' + s.name + ': ' + plain(s.description, 150));
      });
      if (v.legends) L.push('LEY ' + v.legends.land.map((l) => l ? (l.name + ' [swap ' + l.swap + ' cur ' + l.heal + ' ut ' + (l.utilities || []).join('/') + ' el ' + l.elite + ']') : '-').join(' | '));
      if (v.pets) L.push('PET ' + v.pets.land.map((p) => p ? p.id + ' ' + p.name : '-').join(' | '));
      const mech = ref.prof.filter((p) => { const s = ref.skills[p[0]]; return s && (!s.spec || s.spec === elite); })
        .map((p) => p[1].replace('Profession_', 'F') + ' s' + p[0] + ' ' + ref.skills[p[0]].name);
      if (mech.length) L.push('MEC ' + mech.join(' · '));
      v.weapons.forEach((w) => {
        const x = ref.weapons[w.key];
        if (!x) return;
        const ss = x.skills.map((s) => {
          const k = ref.skills[s[0]];
          return s[1].replace('Weapon_', '') + (s[3] ? s[3].slice(0, 2) : '') + (s[2] ? '(' + s[2].slice(0, 3) + ')' : '') + ' s' + s[0] + ' ' + (k ? k.name : '?');
        });
        L.push('ARMA ' + w.name + ': ' + ss.join(' · '));
      });
      if (v.overrides && v.overrides.length) L.push('VAR ' + v.overrides.map((s) => 's' + s.id + ' ' + s.name).join(' · '));
      const g = gear[b.id];
      if (g) {
        const sig = [];
        (g.weapons || []).forEach((w) => (w[4] || []).forEach((x) => sig.push(x)));
        const it = await items([g.rune, g.relic, g.food, g.utility].concat(sig));
        const rune = it[g.rune];
        if (rune) L.push('RUNA i' + rune.id + ' ' + rune.name + ': ' + ((rune.details && rune.details.bonuses) || []).map((x, i) => '(' + (i + 1) + ') ' + plain(x, 90)).join(' '));
        const rel = it[g.relic];
        if (rel) L.push('RELIQUIA i' + rel.id + ' ' + rel.name + ': ' + plain(rel.description || (rel.details && rel.details.description), 220));
        [...new Set(sig)].forEach((id) => { const s = it[id]; if (s) L.push('SELLO i' + id + ' ' + s.name + ': ' + plain((s.details && s.details.infix_upgrade && s.details.infix_upgrade.buff && s.details.infix_upgrade.buff.description) || s.description, 130)); });
        ['food', 'utility'].forEach((k) => { const s = it[g[k]]; if (s) L.push(k.toUpperCase() + ' ' + s.name); });
      } else L.push('(sin equipo en gear.json)');
    } catch (e) {
      L.push('### ' + b.id + ' ERROR ' + e.message);
    }
    console.log(L.join('\n'));
  }
};
