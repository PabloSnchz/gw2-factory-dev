// Sonda BL-084 EQ-8 WvW/PvP (se borra al terminar): datos oficiales en castellano de builds puntuales para escribir mis
// notas: rasgos, barra, leyendas/mascotas, armas del equipo, runa, reliquia, sigilos y qué habilidades controlan o dan
// estabilidad (facts de /v2/skills). Cada tests/bld-eq8w-N.smoke.cjs le pasa una lista de ids.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require(path.join(ROOT, 'js/bld-code.js'));
const R = require(path.join(ROOT, 'js/bld-ref.js'));
const API = 'https://api.guildwars2.com';
const CC = /aturd|atont|derrib|rechaz|atra[eí]|lanzam|miedo|flot|hund|provoc|inmoviliz|estabilidad|stun|daze|knock|pull|launch|fear|float|sink|taunt|immobil|stability|defiance/i;

function plain(s, n) {
  s = String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return n && s.length > n ? s.slice(0, n - 1) + '…' : s;
}
async function get(kind, ids) {
  ids = [...new Set(ids.filter(Boolean))];
  const m = {};
  for (let i = 0; i < ids.length; i += 150) {
    const r = await fetch(API + '/v2/' + kind + '?ids=' + ids.slice(i, i + 150).join(',') + '&lang=es');
    const j = await r.json();
    (Array.isArray(j) ? j : []).forEach((x) => { m[x.id] = x; });
  }
  return m;
}

// El tipo de arma de cada pieza del equipo ([juego, mano, item, stat, sigilos]) sale de /v2/items.
const WT = { LongBow: 'Longbow', ShortBow: 'Shortbow', Harpoon: 'Spear' };
async function gearWeapons(g, ref) {
  const out = [];
  if (!g || !g.weapons) return out;
  const it = await get('items', g.weapons.map((w) => w[2]));
  g.weapons.forEach((w) => {
    const t = it[w[2]] && it[w[2]].details && it[w[2]].details.type;
    const k = ref.weapons[t] ? t : ref.weapons[WT[t]] ? WT[t] : Object.keys(ref.weapons).find((x) => x.toLowerCase() === String(t).toLowerCase());
    out.push({ set: w[0], hand: w[1], type: t, key: k });
  });
  return out;
}

module.exports = async function (ids, opt) {
  opt = opt || {};
  const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));
  const gear = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/gear.json'), 'utf8')).gear;
  for (const id of ids) {
    const b = cat.builds.find((x) => x.id === id);
    const L = ['### ' + id];
    try {
      const code = GNBldCode.decode(b.code);
      const ref = await R.load(code.profession);
      const v = R.resolve(code, ref);
      const elite = v.specs[2] && v.specs[2].elite ? v.specs[2].id : 0;
      L.push('modo=' + b.mode + '/' + (b.sub || '') + ' roles=' + (b.roles || []).join(',') + ' dmg=' + b.damage + ' armas(cat)=' + (b.weapons || []).join('/') + ' dif=' + b.difficulty + ' parche=' + b.patch);
      v.specs.forEach((s) => {
        L.push('ESP ' + s.name + (s.elite ? ' (élite)' : ''));
        s.traits.forEach((t) => { if (t) L.push('  t' + t.id + ' ' + t.name + ': ' + plain(t.description, 140)); });
      });
      const sids = [];
      ['cur', 'u1', 'u2', 'u3', 'él'].forEach((nm, i) => {
        const s = v.land[i];
        if (s) { sids.push(s.id); L.push('B ' + nm + ' s' + s.id + ' ' + s.name + ': ' + plain(s.description, 120)); }
      });
      if (v.legends) {
        L.push('LEY ' + v.legends.land.map((l) => l ? l.name + ' [cur ' + l.heal + ' ut ' + (l.utilities || []).join('/') + ' él ' + l.elite + ']' : '-').join(' | '));
        v.legends.land.forEach((l) => { if (l) sids.push(l.heal, l.elite, ...(l.utilities || [])); });
      }
      if (v.pets) L.push('PET ' + v.pets.land.map((p) => p ? p.id + ' ' + p.name : '-').join(' | '));
      const mech = ref.prof.filter((p) => { const s = ref.skills[p[0]]; return s && (!s.spec || s.spec === elite); });
      mech.forEach((p) => sids.push(p[0]));
      if (mech.length) L.push('MEC ' + mech.map((p) => p[1].replace('Profession_', 'F') + ' s' + p[0] + ' ' + ref.skills[p[0]].name).join(' · '));
      const g = gear[id];
      const wk = new Set((b.weapons || []).concat(v.weapons.map((w) => w.key)));
      const gw = await gearWeapons(g, ref);
      gw.forEach((w) => { if (w.key) wk.add(w.key); });
      if (gw.length) L.push('ARMAS-EQ ' + gw.map((w) => 'J' + w.set + w.hand + ' ' + w.type + (w.key ? '' : '(?)')).join(' · '));
      wk.forEach((k) => {
        const x = ref.weapons[k];
        if (!x) return;
        x.skills.forEach((s) => sids.push(s[0]));
        L.push('ARMA ' + k + ': ' + x.skills.map((s) => s[1].replace('Weapon_', '') + (s[3] ? s[3].slice(0, 2) : '') + (s[2] ? '(' + s[2].slice(0, 3) + ')' : '') + ' s' + s[0] + ' ' + ((ref.skills[s[0]] || {}).name || '?')).join(' · '));
      });
      if (opt.only === 'weapons') {
        const sk0 = await get('skills', [...wk].filter((k) => ref.weapons[k]).flatMap((k) => ref.weapons[k].skills.map((s) => s[0])));
        const cc0 = [];
        Object.values(sk0).forEach((s) => {
          const fx = (s.facts || []).filter((f) => f.type === 'Defiance_Break' || CC.test(String(f.text || '') + ' ' + String(f.status || '')));
          if (fx.length) cc0.push('s' + s.id + ' ' + s.name + ': ' + fx.map((f) => (f.status || f.text || f.type) + (f.apply_count ? ' x' + f.apply_count : '') + (f.duration != null ? ' ' + f.duration + 's' : '')).join(', '));
        });
        if (cc0.length) L.push('CC-ARMAS ' + cc0.join(' | '));
        L.splice(1, L.length, ...L.filter((x) => /^(ARMA|CC-ARMAS)/.test(x)));
        console.log(L.join('\n'));
        continue;
      }
      if (g) {
        L.push('GEAR ' + JSON.stringify({ weapons: g.weapons, rune: g.rune, relic: g.relic, amulet: g.amulet, food: g.food, utility: g.utility }));
        const sig = [];
        (g.weapons || []).forEach((w) => (w[4] || []).forEach((x) => sig.push(x)));
        const it = await get('items', [g.rune, g.relic, g.food, g.utility].concat(sig));
        const rune = it[g.rune];
        if (rune) L.push('RUNA i' + rune.id + ' ' + rune.name + ': ' + ((rune.details && rune.details.bonuses) || []).map((x, i) => '(' + (i + 1) + ') ' + plain(x, 80)).join(' '));
        const rel = it[g.relic];
        if (rel) L.push('RELIQUIA i' + rel.id + ' ' + rel.name + ': ' + plain(rel.description || (rel.details && rel.details.description), 200));
        [...new Set(sig)].forEach((x) => { const s = it[x]; if (s) L.push('SELLO i' + x + ' ' + s.name + ': ' + plain((s.details && s.details.infix_upgrade && s.details.infix_upgrade.buff && s.details.infix_upgrade.buff.description) || s.description, 110)); });
        ['food', 'utility'].forEach((k) => { const s = it[g[k]]; if (s) L.push(k.toUpperCase() + ' i' + s.id + ' ' + s.name); });
        if (g.amulet) { const a = await get('pvp/amulets', [g.amulet]); if (a[g.amulet]) L.push('AMULETO ' + a[g.amulet].name + ' ' + JSON.stringify(a[g.amulet].attributes)); }
      } else L.push('(sin equipo en gear.json)');
      const sk = await get('skills', sids);
      const cc = [];
      Object.values(sk).forEach((s) => {
        const fx = (s.facts || []).filter((f) => f.type === 'Defiance_Break' || CC.test(String(f.text || '') + ' ' + String(f.status || '')));
        if (!fx.length) return;
        const rec = (s.facts || []).find((f) => f.type === 'Recharge');
        cc.push('s' + s.id + ' ' + s.name + ': ' + fx.map((f) => (f.status || f.text || f.type) + (f.apply_count ? ' x' + f.apply_count : '') + (f.value != null ? ' ' + f.value : '') + (f.duration != null ? ' ' + f.duration + 's' : '')).join(', ') + (rec ? ' · rec ' + rec.value : ''));
      });
      if (cc.length) L.push('CC ' + cc.join(' | '));
    } catch (e) {
      L.push('ERROR ' + e.message);
    }
    console.log(L.join('\n'));
  }
};
