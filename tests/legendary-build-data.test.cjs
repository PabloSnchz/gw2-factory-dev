// MIG-2b (BL-043): precios del Bazar y build de js/legendary-data.js, sin red.
// La prueba fuerte: reconstruye la entrada cruda desde el js/legendary-data.js
// versionado, corre el build y exige las mismas 206 legendarias, campo por campo
// y en el mismo orden. Así la clasificación (generación, expansión, subtipo) y
// los precios del generador migrado quedan atados a los datos que usa la app.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BUILD = path.join(ROOT, 'tools', 'legendary', 'build_legendary_data.py');
const PRICES = path.join(ROOT, 'tools', 'legendary', 'fetch_thematic_prices.py');
const DATA = path.join(ROOT, 'js', 'legendary-data.js');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'leg-build-')); }
function writeJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data)); return file; }
function py(args) { return spawnSync('python3', args, { encoding: 'utf8' }); }
function loadCatalog(file) {
  const sandbox = { console: { info() {} } };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  // JSON ida y vuelta: los objetos del otro contexto de vm tienen otro prototipo.
  return JSON.parse(JSON.stringify(sandbox.LegendaryCatalog));
}

const TYPE_BACK = { weapon: 'Weapon', armor: 'Armor', trinket: 'Trinket', back: 'Back', relic: 'Relic', upgradecomponent: 'UpgradeComponent' };

// Lo que la API habría devuelto para cada legendaria del catálogo versionado.
function rawFromCatalog(items) {
  const raw = {}; const prices = {};
  items.forEach(it => {
    let details = {};
    if (it.type === 'armor') {
      const [weight, kind] = it.subtype.split(' ');
      details = { type: kind, weight_class: weight };
    } else if (it.type === 'weapon' || it.type === 'trinket') {
      details = { type: it.subtype };
    }
    raw[String(it.id)] = { id: it.id, name_en: it.name, name_es: it.nameEs, icon: it.icon, type: TYPE_BACK[it.type], details };
    if (it.tpTradeable) prices[String(it.id)] = { buy: it.tpBuy, sell: it.tpSell, buy_listings: 1, sell_listings: 1, whitelisted: false };
  });
  // Desordenado a propósito: el build tiene que ordenar solo.
  const shuffled = {};
  Object.keys(raw).sort((a, b) => (Number(a) % 7) - (Number(b) % 7) || Number(b) - Number(a)).forEach(k => { shuffled[k] = raw[k]; });
  return { raw: shuffled, prices };
}

const current = loadCatalog(DATA);

test('el build migrado reproduce las 206 legendarias de js/legendary-data.js', () => {
  assert.equal(current.items.length, 206);
  const dir = tmp();
  const { raw, prices } = rawFromCatalog(current.items);
  const out = path.join(dir, 'legendary-data.js');
  const r = py([BUILD, '--with-prices', '--input', writeJSON(path.join(dir, 'items.json'), raw),
    '--prices', writeJSON(path.join(dir, 'prices.json'), prices), '--out', out, '--generated', '2026-10-22 00:00:00 UTC']);
  assert.equal(r.status, 0, r.stderr);
  const rebuilt = loadCatalog(out);
  assert.equal(rebuilt.totalItems, 206);
  assert.equal(rebuilt.generated, '2026-10-22 00:00:00 UTC');
  assert.deepEqual(rebuilt.items, current.items);
  const header = fs.readFileSync(out, 'utf8').split(' */')[0];
  assert.match(header, /Tipos: armor=132, back=4, relic=1, trinket=10, upgradecomponent=2, weapon=57/);
  assert.match(header, /39\/206 se venden en el Bazar/);
  assert.doesNotMatch(header, /SIN CLASIFICAR/);
  assert.match(r.stdout, /Listo: 206 legendarias/);
});

test('sin --with-prices no agrega campos de precio', () => {
  const dir = tmp();
  const { raw } = rawFromCatalog(current.items.slice(0, 3));
  const out = path.join(dir, 'd.js');
  const r = py([BUILD, '--input', writeJSON(path.join(dir, 'i.json'), raw), '--out', out]);
  assert.equal(r.status, 0, r.stderr);
  const cat = loadCatalog(out);
  assert.deepEqual(Object.keys(cat.items[0]), ['id', 'name', 'nameEs', 'icon', 'type', 'subtype', 'rarity', 'generation', 'expansion']);
  assert.match(cat.generated, /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d UTC$/);
});

test('una legendaria de un tipo nuevo queda marcada SIN CLASIFICAR, no escondida', () => {
  const dir = tmp();
  const raw = { 99999: { id: 99999, name_en: 'Legendary Gizmo', name_es: '', icon: '', type: 'Gizmo', details: {} } };
  const out = path.join(dir, 'd.js');
  const r = py([BUILD, '--input', writeJSON(path.join(dir, 'i.json'), raw), '--out', out]);
  assert.equal(r.status, 0, r.stderr);
  const cat = loadCatalog(out);
  assert.deepEqual(cat.items[0], { id: 99999, name: 'Legendary Gizmo', nameEs: 'Legendary Gizmo', icon: '', type: 'gizmo', subtype: '', rarity: 'Legendary', generation: null, expansion: null });
  assert.match(fs.readFileSync(out, 'utf8'), /SIN CLASIFICAR: generation=null 1\/1, expansion=null 1\/1/);
  assert.match(r.stdout, /Sin clasificar: generation=1, expansion=1/);
});

test('arma Gen 2 sin nombre conocido: HoT antes del id 76000, PoF después', () => {
  const dir = tmp();
  const raw = {
    72000: { id: 72000, name_en: 'Mystery Blade', name_es: 'Hoja', icon: '', type: 'Weapon', details: { type: 'Sword' } },
    80000: { id: 80000, name_en: 'Mystery Bow', name_es: 'Arco', icon: '', type: 'Weapon', details: { type: 'Longbow' } }
  };
  const out = path.join(dir, 'd.js');
  const r = py([BUILD, '--input', writeJSON(path.join(dir, 'i.json'), raw), '--out', out]);
  assert.equal(r.status, 0, r.stderr);
  const cat = loadCatalog(out);
  assert.deepEqual(cat.items.map(i => [i.id, i.generation, i.expansion, i.subtype]), [[72000, 2, 'HoT', 'sword'], [80000, 2, 'PoF', 'longbow']]);
});

test('--with-prices sin archivo de precios falla y no pisa el catálogo', () => {
  const dir = tmp();
  const out = path.join(dir, 'd.js');
  fs.writeFileSync(out, 'ORIGINAL');
  const r = py([BUILD, '--with-prices', '--input', writeJSON(path.join(dir, 'i.json'), {}), '--prices', path.join(dir, 'no.json'), '--out', out]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^BuildError: --with-prices y falta/);
  assert.equal(fs.readFileSync(out, 'utf8'), 'ORIGINAL');
});

test('un snapshot vacío falla y no escribe un catálogo vacío', () => {
  const dir = tmp();
  const out = path.join(dir, 'd.js');
  const r = py([BUILD, '--input', writeJSON(path.join(dir, 'i.json'), {}), '--out', out]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^BuildError: el snapshot no tiene legendarias/);
  assert.equal(fs.existsSync(out), false);
});

test('precios: lee la caché sin red y arma {id: {buy, sell, ...}}', () => {
  const dir = tmp(); const cache = tmp();
  const items = writeJSON(path.join(dir, 'items.json'), {
    30684: { id: 30684, name_en: 'Frostfang' }, 30685: { id: 30685, name_en: 'Kudzu' }, 1: { id: 1, name_en: '' }
  });
  writeJSON(path.join(cache, 'prices-1.json'), [
    { id: 30684, whitelisted: false, buys: { quantity: 12, unit_price: 21000000 }, sells: { quantity: 3, unit_price: 23000000 } },
    'NotFound'
  ]);
  const out = path.join(dir, 'prices.json');
  const r = py([PRICES, '--offline', '--cache-dir', cache, '--input', items, '--out', out]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(fs.readFileSync(out, 'utf8')), {
    30684: { buy: 21000000, sell: 23000000, buy_listings: 12, sell_listings: 3, whitelisted: false }
  });
  assert.match(r.stdout, /Precios del Bazar para 2 legendarias/);
  assert.match(r.stdout, /1 se venden en el Bazar; 1 ligadas a la cuenta/);
});

test('precios: sin caché y sin red falla, y sin snapshot avisa qué correr', () => {
  const dir = tmp();
  const items = writeJSON(path.join(dir, 'items.json'), { 30684: { id: 30684, name_en: 'Frostfang' } });
  let r = py([PRICES, '--offline', '--cache-dir', tmp(), '--input', items, '--out', path.join(dir, 'p.json')]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^FetchError: sin red \(--offline\) y falta prices-1\.json .*commerce\/prices\?ids=30684\)/);
  r = py([PRICES, '--offline', '--input', path.join(dir, 'no.json'), '--out', path.join(dir, 'p.json')]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^FetchError: falta .*no\.json: primero correr fetch_legendary_items\.py/);
});
