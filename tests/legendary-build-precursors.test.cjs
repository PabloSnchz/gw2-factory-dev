// MIG-2d (BL-043): build de js/legendary-precursors.js, sin red.
// La prueba fuerte: arma una fuente con las recetas que ya están en
// js/legendary-recipes.js y js/legendary-precursors.js (más una receta que nadie
// usa), corre el build contra js/legendary-data.js y exige las mismas 907 entradas.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BUILD = path.join(ROOT, 'tools', 'legendary', 'build_legendary_precursors.py');
const CATALOG = path.join(ROOT, 'js', 'legendary-data.js');

const dirs = [];
function tmp() { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'leg-pre-')); dirs.push(d); return d; }
test.after(() => dirs.forEach(d => fs.rmSync(d, { recursive: true, force: true })));
function py(args) { return spawnSync('python3', args, { encoding: 'utf8' }); }
function load(file, name) {
  const sb = { console: { info() {} } }; sb.window = sb;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sb, { filename: file });
  return JSON.parse(JSON.stringify({ byItem: sb[name].byItem, counts: sb[name].counts, totalItems: sb[name].totalItems }));
}
function api(file) {
  const sb = {}; sb.window = sb;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sb, { filename: file });
  return sb.LegendaryPrecursors;
}

const recipes = load(path.join(ROOT, 'js', 'legendary-recipes.js'), 'LegendaryRecipes');
const current = load(path.join(ROOT, 'js', 'legendary-precursors.js'), 'LegendaryPrecursors');

function ings(list) { return list.map(i => ({ item_id: String(i.itemId), count: i.count, name: i.name })); }

// Fuente equivalente a crafty_legend, reconstruida desde los dos contratos versionados.
function sourceFromContracts() {
  const out = [];
  Object.values(recipes.byItem).forEach(e => {
    if (e.dataStatus !== 'recipe') return;
    out.push({ output_id: String(e.recipeId), output_count: e.outputCount, disciplines: e.disciplines, type: e.craftType, ingredients: ings(e.ingredients) });
  });
  Object.keys(current.byItem).forEach(id => {
    const e = current.byItem[id];
    if (e.dataStatus === 'material') return;
    out.push({ output_id: id, name: e.name, output_count: e.outputCount, disciplines: e.disciplines, type: e.craftType, ingredients: ings(e.ingredients) });
  });
  // Una receta que no cuelga de ninguna legendaria: no entra.
  out.push({ output_id: '999999', name: 'Suelta', output_count: 1, disciplines: [], type: 'crafting', ingredients: [{ item_id: '19721', count: 1, name: 'Glob of Ectoplasm' }] });
  return { recipes: out.sort((a, b) => Number(a.output_id) - Number(b.output_id)) };
}

function run(dir, src) {
  const s = path.join(dir, 'src.json'); fs.writeFileSync(s, JSON.stringify(src));
  const out = path.join(dir, 'p.js');
  return { r: py([BUILD, '--source', s, '--catalog', CATALOG, '--out', out]), out };
}

test('el build migrado reproduce las 907 entradas de js/legendary-precursors.js', () => {
  const { r, out } = run(tmp(), sourceFromContracts());
  assert.equal(r.status, 0, r.stderr);
  const rebuilt = load(out, 'LegendaryPrecursors');
  assert.equal(rebuilt.totalItems, 907);
  assert.deepEqual(rebuilt.counts, { recipe: 467, material: 436, vendor: 4 });
  assert.deepEqual(rebuilt.counts, current.counts);
  assert.deepEqual(rebuilt.byItem, current.byItem);
  assert.equal(rebuilt.byItem['999999'], undefined, 'lo que no cuelga del catálogo no entra');
  assert.match(r.stdout, /Listo: 907 precursores/);
  assert.match(r.stdout, /hojas=436 aristas sin id=2/);
});

test('el archivo generado conserva la forma que usa la app y da crédito a la fuente', () => {
  const { out } = run(tmp(), sourceFromContracts());
  const P = api(out);
  assert.equal(P.get(0).name, 'Relic (any)', 'id 0: el primer nombre de la fuente');
  assert.equal(P.has('0'), true);
  assert.equal(P.get(30684), null, 'las legendarias del catálogo viven en legendary-recipes.js');
  assert.equal(P.has(30684), false);
  const edge = P.get(101540).ingredients.find(i => i.itemId === 0);
  assert.deepEqual(JSON.parse(JSON.stringify(edge)), { itemId: 0, count: 1, name: 'Relic (any)' });
  const vendors = Object.keys(P.byItem).filter(k => P.byItem[k].dataStatus === 'vendor');
  assert.equal(vendors.length, 4);
  vendors.forEach(k => assert.equal(P.byItem[k].craftType, 'vendor'));
  const txt = fs.readFileSync(out, 'utf8');
  assert.match(txt, /crafty_legend .*\n.*licencia MIT/);
  assert.match(txt, /\/\/     101540  1 x Relic \(any\)/);
  assert.match(txt, /\/\/     109686  500 x Testimony of Castoran Heroics/);
  assert.doesNotMatch(txt, /cl_recipes\.json/);
});

test('un nombre perdido o una salida repetida frenan el build', () => {
  const dir = tmp();
  const sinNombre = sourceFromContracts();
  sinNombre.recipes.forEach(r => r.ingredients.forEach(i => { if (i.item_id === '9443') i.name = ''; }));
  let x = run(dir, sinNombre).r;
  assert.equal(x.status, 1);
  assert.match(x.stderr, /^BuildError: 1 entradas sin nombre: \[9443\]/);

  const dup = sourceFromContracts(); dup.recipes.push(Object.assign({}, dup.recipes[5]));
  x = run(dir, dup).r;
  assert.equal(x.status, 1);
  assert.match(x.stderr, /^BuildError: la fuente repite la salida/);

  x = py([BUILD, '--source', path.join(dir, 'no.json'), '--out', path.join(dir, 'z.js')]);
  assert.equal(x.status, 1);
  assert.match(x.stderr, /^BuildError: falta .*primero correr fetch_recipes_source\.py/);
});

test('el nombre de una receta de la fuente gana sobre el de ingrediente', () => {
  const src = sourceFromContracts();
  const id = Object.keys(current.byItem).find(k => current.byItem[k].dataStatus === 'recipe');
  src.recipes.find(r => r.output_id === id).name = 'Nombre de receta';
  const { r, out } = run(tmp(), src);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(api(out).get(id).name, 'Nombre de receta');
  delete src.recipes.find(r => r.output_id === id).name;
  const sinNombre = run(tmp(), src);
  assert.equal(api(sinNombre.out).get(id).name, current.byItem[id].name, 'sin nombre de receta, el de ingrediente');
});
