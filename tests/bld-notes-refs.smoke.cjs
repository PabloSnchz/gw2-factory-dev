// BL-084 EQ-8: las referencias {s|t|i:ID} de assets/data/builds/notes.json existen de verdad (con red: API oficial).
// {s:ID} y {t:ID} tienen que ser habilidades y rasgos de la profesión de la build (lo que js/bld-ref.js trae);
// {i:ID}, un objeto del equipo de esa build (assets/data/builds/gear.json). Imprime cada referencia con su nombre
// oficial en castellano para revisar que dice lo que quise decir. Falla si alguna no resuelve.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require(path.join(ROOT, 'js/bld-code.js'));
const R = require(path.join(ROOT, 'js/bld-ref.js'));
const TOKEN = /\{([sti]):(\d+)\}/g;

function gearIds(g) {
  const s = new Set();
  if (!g) return s;
  [g.rune, g.relic, g.food, g.utility, g.jade, g.enrich, g.amulet].forEach((x) => x && s.add(x));
  (g.armor || []).concat(g.trinkets || []).forEach((r) => r && s.add(r[0]));
  (g.weapons || []).forEach((w) => { s.add(w[2]); (w[4] || []).forEach((x) => s.add(x)); });
  if (g.infusion) s.add(g.infusion[0]);
  return s;
}

(async () => {
  const notes = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/notes.json'), 'utf8')).notes;
  const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));
  const gear = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/gear.json'), 'utf8')).gear;
  const byId = {};
  cat.builds.forEach((b) => { byId[b.id] = b; });
  let bad = 0, total = 0;
  for (const [id, n] of Object.entries(notes)) {
    const b = byId[id];
    if (!b) { console.log('✗ ' + id + ': no está en el catálogo'); bad++; continue; }
    const ref = await R.load(GNBldCode.decode(b.code).profession);
    const gi = gearIds(gear[id]);
    const seen = {};
    const L = [];
    Object.keys(n).forEach((k) => {
      if (!Array.isArray(n[k])) return;
      n[k].forEach((p) => {
        let m;
        TOKEN.lastIndex = 0;
        while ((m = TOKEN.exec(p))) {
          const key = m[1] + m[2];
          if (seen[key]) continue;
          seen[key] = 1; total++;
          const x = m[1] === 's' ? ref.skills[m[2]] : m[1] === 't' ? ref.traits[m[2]] : null;
          if (m[1] === 'i') { if (gi.has(Number(m[2]))) L.push(key + ' ok'); else { L.push('✗ ' + key + ' no es del equipo'); bad++; } }
          else if (x) L.push(key + '=' + x.name);
          else { L.push('✗ ' + key + ' no existe para ' + ref.name); bad++; }
        }
      });
    });
    console.log('### ' + id + '\n' + L.join(' · '));
  }
  console.log('\nReferencias: ' + total + ' · sin resolver: ' + bad);
  if (bad) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });
