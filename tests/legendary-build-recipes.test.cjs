// MIG-2c (BL-043): fuente de recetas fijada y build de js/legendary-recipes.js, sin red.
// La prueba fuerte: arma una fuente con las recetas que ya están en
// js/legendary-recipes.js (más ruido que no es del catálogo), corre el build contra
// js/legendary-data.js y exige las mismas 206 entradas, campo por campo.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FETCH = path.join(ROOT, 'tools', 'legendary', 'fetch_recipes_source.py');
const BUILD = path.join(ROOT, 'tools', 'legendary', 'build_legendary_recipes.py');
const RECIPES = path.join(ROOT, 'js', 'legendary-recipes.js');
const CATALOG = path.join(ROOT, 'js', 'legendary-data.js');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'leg-rec-')); }
function py(args) { return spawnSync('python3', args, { encoding: 'utf8' }); }
function blob(buf) { return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob ' + buf.length + '\0'), buf])).digest('hex'); }
function load(file) {
  const sb = { console: { info() {} } }; sb.window = sb;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sb, { filename: file });
  return sb.LegendaryRecipes;
}
function plain(x) { return JSON.parse(JSON.stringify(x)); }

const current = load(RECIPES);

// Fuente equivalente a crafty_legend, reconstruida desde el contrato versionado.
function sourceFromContract() {
  const recipes = [];
  Object.keys(current.byItem).forEach(id => {
    const e = current.byItem[id];
    if (e.dataStatus !== 'recipe') return;
    recipes.push({ output_id: String(e.recipeId), output_count: e.outputCount, disciplines: e.disciplines.slice(), rating: 500, type: e.craftType,
      ingredients: e.ingredients.map(i => ({ item_id: String(i.itemId), count: i.count, name: i.name })) });
  });
  // Recetas que no son del catálogo (precursores, vendedores): el contrato las ignora.
  recipes.push({ output_id: '1', output_count: 1, disciplines: [], rating: 0, type: 'vendor', vendor: 'Miyani', ingredients: [{ item_id: '2', count: 1, name: 'X' }] });
  recipes.push({ output_id: '70000', output_count: 1, disciplines: ['Weaponsmith'], rating: 400, type: 'crafting', ingredients: [] });
  return { recipes: recipes.reverse() };
}

function writeSource(dir, obj) { const f = path.join(dir, 'src.json'); fs.writeFileSync(f, JSON.stringify(obj)); return f; }

test('el build migrado reproduce las 206 entradas de js/legendary-recipes.js', () => {
  const dir = tmp(); const out = path.join(dir, 'r.js');
  const r = py([BUILD, '--source', writeSource(dir, sourceFromContract()), '--catalog', CATALOG, '--out', out, '--generated', '2026-10-22 00:00:00 UTC']);
  assert.equal(r.status, 0, r.stderr);
  const rebuilt = load(out);
  assert.equal(rebuilt.totalItems, 206);
  assert.deepEqual(plain(rebuilt.byItem), plain(current.byItem));
  assert.deepEqual(plain(rebuilt.counts), plain(current.counts));
  assert.deepEqual(plain(rebuilt.counts), { craftType: { mystic_forge: 124, crafting: 18, none: 64 }, dataStatus: { recipe: 142, no_recipe: 63, placeholder: 1 } });
  assert.equal(rebuilt.generated, '2026-10-22 00:00:00 UTC');
  assert.equal(rebuilt.get('30684').recipeId, 30684, 'get() acepta el id como texto');
  assert.equal(rebuilt.get(1), null, 'una receta que no es del catálogo no entra');
  assert.match(r.stdout, /Listo: 206 legendarias/);
});

test('los textos que ve el jugador no nombran archivos internos', () => {
  const dir = tmp(); const out = path.join(dir, 'r.js');
  assert.equal(py([BUILD, '--source', writeSource(dir, sourceFromContract()), '--catalog', CATALOG, '--out', out]).status, 0);
  const R = load(out);
  const textos = [R.noRecipeNote, R.placeholder.note, R.describe(95093), R.describe(30684)];
  textos.forEach(t => assert.doesNotMatch(t, /\.json|\/v2\/|tools\//));
  assert.equal(R.placeholder.id, 95093);
  assert.equal(R.describe(95093), R.placeholder.note);
  assert.equal(R.describe(Object.keys(R.byItem).find(k => R.byItem[k].dataStatus === 'no_recipe')), R.noRecipeNote);
  assert.equal(R.describe(30684), 'Se hace en la Forja Mística.');
  const obsidian = Object.keys(R.byItem).find(k => R.byItem[k].craftType === 'crafting');
  assert.match(R.describe(obsidian), /^Se craftea con .+\.$/);
  assert.equal(R.describe(123), null);
  assert.match(fs.readFileSync(out, 'utf8'), /crafty_legend .*licencia MIT|licencia MIT/);
});

test('una legendaria con receta de vendedor o dos recetas para el mismo item frenan el build', () => {
  const dir = tmp();
  const src = sourceFromContract();
  src.recipes.find(x => x.output_id === '30684').type = 'vendor';
  let r = py([BUILD, '--source', writeSource(dir, src), '--catalog', CATALOG, '--out', path.join(dir, 'a.js')]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^BuildError: la legendaria 30684 tiene una receta de tipo 'vendor'/);
  const dup = sourceFromContract(); dup.recipes.push(Object.assign({}, dup.recipes[0]));
  r = py([BUILD, '--source', writeSource(dir, dup), '--catalog', CATALOG, '--out', path.join(dir, 'b.js')]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^BuildError: dos recetas para el item/);
  const doble = sourceFromContract();
  doble.recipes.find(x => x.output_id === '30684').output_count = 2;
  r = py([BUILD, '--source', writeSource(dir, doble), '--catalog', CATALOG, '--out', path.join(dir, 'd.js')]);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(load(path.join(dir, 'd.js')).get(30684).outputCount, 2, 'outputCount sale de la fuente');
  r = py([BUILD, '--source', path.join(dir, 'no.json'), '--out', path.join(dir, 'c.js')]);
  assert.match(r.stderr, /^BuildError: falta .*primero correr fetch_recipes_source\.py/);
});

test('la fuente queda fijada a crafty_legend a24d244 y su huella', () => {
  const src = fs.readFileSync(FETCH, 'utf8');
  assert.match(src, /SOURCE_REPO = "PieOrCake\/crafty_legend"/);
  assert.match(src, /SOURCE_COMMIT = "a24d24411f8e4cd49755c85e287758d993a07ec9"/);
  assert.match(src, /SOURCE_BLOB = "551cedfaa257f7bb3c7b4aa20509121202d2e3fd"/);
});

test('fetch: acepta un archivo con la huella correcta y lo valida', () => {
  const dir = tmp();
  const buf = Buffer.from(JSON.stringify({ recipes: [{ output_id: '1', type: 'crafting', ingredients: [{ item_id: '2', count: 3, name: 'X' }] }, { output_id: '5', type: 'mystic_forge', ingredients: [] }] }, null, 2) + '\n');
  const f = path.join(dir, 'in.json'); fs.writeFileSync(f, buf);
  const out = path.join(dir, 'out.json');
  const r = py([FETCH, '--from-file', f, '--commit', 'abc1234', '--blob', blob(buf), '--out', out]);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.readFileSync(out).equals(buf), 'se guarda tal cual, byte a byte');
  assert.match(r.stdout, /Fuente de recetas: 2 recetas \(crafting=1, mystic_forge=1\)/);
});

test('fetch: huella distinta, commit sin huella o forma rota fallan sin escribir', () => {
  const dir = tmp(); const out = path.join(dir, 'out.json');
  const ok = Buffer.from(JSON.stringify({ recipes: [{ output_id: '1', type: 'crafting', ingredients: [] }] }));
  const f = path.join(dir, 'in.json'); fs.writeFileSync(f, ok);
  let r = py([FETCH, '--from-file', f, '--out', out]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^SourceError: la huella no coincide: esperada 551cedfaa257f7bb3c7b4aa20509121202d2e3fd, llegó /);
  r = py([FETCH, '--from-file', f, '--commit', 'abc1234', '--out', out]);
  assert.match(r.stderr, /^SourceError: --commit distinto del fijado necesita --blob/);
  const casos = [
    [{ recetas: [] }, /no tiene una lista 'recipes'/],
    [{ recipes: [{ output_id: '1', type: 'crafting' }] }, /receta 0: faltan ingredients/],
    [{ recipes: [{ output_id: '1', type: 'crafting', ingredients: [] }, { output_id: 1, type: 'crafting', ingredients: [] }] }, /dos recetas para el mismo item 1/],
    [{ recipes: [{ output_id: '1', type: 'crafting', ingredients: [{ item_id: '2', count: 1 }] }] }, /un ingrediente no tiene name/]
  ];
  casos.forEach(([obj, re]) => {
    const b = Buffer.from(JSON.stringify(obj)); fs.writeFileSync(f, b);
    const x = py([FETCH, '--from-file', f, '--commit', 'abc', '--blob', blob(b), '--out', out]);
    assert.equal(x.status, 1);
    assert.match(x.stderr, re);
  });
  fs.writeFileSync(f, 'no es json');
  r = py([FETCH, '--from-file', f, '--commit', 'abc', '--blob', blob(Buffer.from('no es json')), '--out', out]);
  assert.match(r.stderr, /^SourceError: la fuente no es JSON válido/);
  assert.equal(fs.existsSync(out), false);
});
