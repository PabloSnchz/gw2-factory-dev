// Sonda temporal ACT-5 (BL-070): se borra después de leer OUT. Imprime, no comprueba.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');

test('sonda: tests y archivos que nombran módulos, paneles y nodos', () => {
  const RE = /MODULES|m[oó]dulos|length, ?(9|10|6)\b|'accounts'|homestead|Heredad|Home Nodes|home:nodes|showPanel|navAC|LINK_ID|VIEW\b|ALIAS|mobileGroups|more\b.*length|icon.*exist|existsSync/;
  const dirs = ['tests'];
  dirs.forEach((d) => fs.readdirSync(path.join(ROOT, d)).filter((f) => /\.(c?js)$/.test(f) && !/zz-probe/.test(f)).forEach((f) => {
    const L = fs.readFileSync(path.join(ROOT, d, f), 'utf8').split('\n');
    const hits = [];
    L.forEach((l, i) => { if (RE.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 200)); });
    if (hits.length && /welcome|sidebar|router|index|gn-frame|gn-shell|hb106|idea61|legacy|t19c|activ|act-|psna/.test(f)) console.log('## ' + f + '\n' + hits.slice(0, 40).join('\n'));
  }));
  ['js/gn-frame.js', 'js/gn-shell.js', 'js/storage.js', 'js/boot.js'].forEach((f) => {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) return console.log('## ' + f + ' NO EXISTE');
    const L = fs.readFileSync(p, 'utf8').split('\n'), hits = [];
    L.forEach((l, i) => { if (/activitiesPanel|raidTrackerPanel|HOME_NODES|home_nodes|PANELS|register|MIRROR|gn:activities/.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 220)); });
    console.log('## ' + f + ' (' + fs.statSync(p).size + ' B)\n' + hits.slice(0, 40).join('\n'));
  });
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n');
  idx.forEach((l, i) => { if (/<section id=|<main|class="layout|col-main/.test(l)) console.log('index ' + (i + 1) + ': ' + l.trim().slice(0, 200)); });
});

const ITEMS = [81853, 81852, 78468, 68091, 73798, 68495, 67842, 67290, 78019, 66769, 44884, 87324, 79217, 92035, 86297, 48804, 93686, 78549,
  87132, 89786, 68090, 67234, 92361, 78582, 79063, 86786, 91777, 68093, 79085, 79260, 80450, 79646, 87889, 48875, 68096, 90773, 88828, 68098,
  68089, 68094, 81696, 68095, 79898, 68097, 81115, 94286, 43902, 93503, 68092, 49825, 79903, 68367, 91060, 81594, 92427, 88979,
  104400, 104442, 104426, 104278, 104484, 104437, 96952, 101965, 103184, 105913];

async function get(u) {
  const r = await fetch('https://api.guildwars2.com' + u);
  return { status: r.status, body: r.ok ? await r.json() : await r.text() };
}

test('sonda: API de la casa', async () => {
  const n = await get('/v2/home/nodes?ids=all');
  console.log('NODES ' + n.status + ' ' + JSON.stringify(n.body));
  for (const lang of ['es', 'en']) {
    const c = await get('/v2/home/cats?ids=all&lang=' + lang);
    console.log('CATS-' + lang + ' ' + c.status + ' ' + JSON.stringify(c.body));
  }
  for (const lang of ['es', 'en']) {
    const out = [];
    for (let i = 0; i < ITEMS.length; i += 150) {
      const r = await get('/v2/items?lang=' + lang + '&ids=' + ITEMS.slice(i, i + 150).join(','));
      (Array.isArray(r.body) ? r.body : []).forEach((it) => out.push([it.id, it.name, it.type, it.details && it.details.type, it.icon, it.rarity, (it.description || '').slice(0, 90)]));
    }
    console.log('ITEMS-' + lang + ' ' + out.length + '\n' + out.map((x) => JSON.stringify(x)).join('\n'));
  }
  const h = await get('/v2/homestead');
  console.log('HOMESTEAD ' + h.status + ' ' + JSON.stringify(h.body).slice(0, 300));
});
