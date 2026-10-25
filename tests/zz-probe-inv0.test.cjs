// Sonda temporal INV-0 (BL-070): mide las categorías de materiales fijas de inventory-hub.js contra /v2/materials
// y los ítems de los sets del dashboard contra /v2/items. Nunca falla; se borra después de leer su salida.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const API = 'https://api.guildwars2.com';
async function j(u) { const r = await fetch(API + u); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }

test('sonda inv0', async () => {
  try {
    const src = fs.readFileSync(path.join(ROOT, 'js/inventory-hub.js'), 'utf8');
    const cats = [];
    src.replace(/\{ key: '(\w+)', label: '([^']+)', desc: '[^']*', ids: \[([\s\S]*?)\]\}/g, (m, k, l, ids) => {
      cats.push({ k, l, ids: ids.split(',').map((s) => Number(s.trim())).filter(Boolean) });
      return m;
    });
    const mats = await j('/v2/materials?ids=all&lang=es');
    console.log('MATCATS', JSON.stringify(mats.map((c) => ({ id: c.id, name: c.name, order: c.order, n: c.items.length }))));
    const where = new Map();
    mats.forEach((c) => c.items.forEach((i) => where.set(i, c.name)));
    const allIds = [...new Set(cats.flatMap((c) => c.ids))];
    const names = new Map();
    for (let i = 0; i < allIds.length; i += 150) {
      const part = await j('/v2/items?lang=es&ids=' + allIds.slice(i, i + 150).join(','));
      part.forEach((it) => names.set(it.id, it.name));
    }
    for (const c of cats) {
      const tally = {};
      c.ids.forEach((id) => { const w = where.get(id) || (names.has(id) ? 'NO-ES-MATERIAL' : 'NO-EXISTE'); tally[w] = (tally[w] || 0) + 1; });
      console.log('HUBCAT', c.k, c.l, c.ids.length, JSON.stringify(tally), 'ej:', c.ids.slice(0, 4).map((id) => id + '=' + (names.get(id) || '?')).join(' | '));
    }
    const sets = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/inventory-sets.json'), 'utf8'));
    const sIds = [];
    (sets.sets || []).forEach((s) => {
      (s.items || []).forEach((it) => sIds.push([s.id, it.id, it.name]));
      Object.entries(s.tiers || {}).forEach(([t, v]) => (v.items || []).forEach((it) => sIds.push([s.id + ':' + t, it.id, it.name])));
    });
    const got = new Map();
    const u = [...new Set(sIds.map((x) => x[1]))];
    for (let i = 0; i < u.length; i += 150) (await j('/v2/items?lang=es&ids=' + u.slice(i, i + 150).join(','))).forEach((it) => got.set(it.id, it.name));
    let bad = 0;
    sIds.forEach(([s, id, n]) => { const real = got.get(id); if (!real || real.toLowerCase() !== String(n).toLowerCase()) { bad++; console.log('SETDIFF', s, id, 'dice:', n, 'API:', real || 'NO-EXISTE'); } });
    console.log('SETS', (sets.sets || []).length, 'items', sIds.length, 'distintos', bad);
    const prof = await j('/v2/professions?ids=all&lang=es');
    console.log('PROF', prof.length, prof.map((p) => p.id + '=' + p.name + (p.icon_big ? ' big' : '')).join(' | '));
    const races = await j('/v2/races');
    console.log('RACES', JSON.stringify(races));
    const specs = await j('/v2/specializations?ids=all');
    console.log('SPECS elite', specs.filter((s) => s.elite).length, 'total', specs.length);
  } catch (e) { console.log('ERROR', e.message); }
});
