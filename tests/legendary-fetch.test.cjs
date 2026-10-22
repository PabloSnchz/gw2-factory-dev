// MIG-2a (BL-043): tools/legendary/fetch_legendary_items.py, sin red.
// Usa una caché de prueba en un directorio temporal y --offline: en CI nunca
// se llama a la API de GW2. Requiere python3 (viene en ubuntu-latest).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', 'tools', 'legendary', 'fetch_legendary_items.py');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'leg-fetch-')); }
function write(dir, name, data) { fs.writeFileSync(path.join(dir, name), JSON.stringify(data)); }
function run(cache, out, extra) {
  return spawnSync('python3', [SCRIPT, '--offline', '--cache-dir', cache, '--out', out].concat(extra || []), { encoding: 'utf8' });
}

const EN = [
  { id: 30684, name: 'Frostfang', icon: 'https://render.guildwars2.com/file/A/456009.png', type: 'Weapon', details: { type: 'Axe' } },
  { id: 80248, name: "Perfected Envoy Helmet", icon: 'https://render.guildwars2.com/file/B/1.png', type: 'Armor', details: { type: 'Helm', weight_class: 'Heavy' } },
  { id: 91048, name: 'Legendary Relic', icon: 'https://render.guildwars2.com/file/C/2.png', type: 'Relic' }
];
const ES = [
  { id: 30684, name: 'Colmilloescarcha' },
  { id: 80248, name: 'Yelmo de enviado perfeccionado' },
  { id: 91048, name: '' }
];

test('python3 está disponible (sin él no hay cómo regenerar la Armería)', () => {
  const r = spawnSync('python3', ['--version'], { encoding: 'utf8' });
  assert.equal(r.status, 0, 'falta python3 en el entorno de tests');
});

test('arma el snapshot con la forma exacta que consume el build', () => {
  const cache = tmp(); const out = path.join(tmp(), 'snap.json');
  write(cache, 'armory.json', [30684, 80248, 91048]);
  write(cache, 'items-en-1.json', EN);
  write(cache, 'items-es-1.json', ES);
  const r = run(cache, out);
  assert.equal(r.status, 0, r.stderr);
  const snap = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.deepEqual(Object.keys(snap), ['30684', '80248', '91048']);
  assert.deepEqual(snap['30684'], {
    id: 30684, name_en: 'Frostfang', name_es: 'Colmilloescarcha',
    icon: 'https://render.guildwars2.com/file/A/456009.png', type: 'Weapon', details: { type: 'Axe' }
  });
  assert.deepEqual(snap['80248'].details, { type: 'Helm', weight_class: 'Heavy' });
  assert.deepEqual(snap['91048'].details, {}, 'sin details queda un objeto vacío');
  assert.match(r.stdout, /Legendary Armory: 3 ids/);
  assert.match(r.stdout, /AVISO: 1 sin nombre en español/);
});

test('--offline sin caché falla de forma controlada, sin salir a la red', () => {
  const r = run(tmp(), path.join(tmp(), 'snap.json'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^FetchError: sin red \(--offline\) y falta armory\.json/);
  assert.match(r.stderr, /pedido: https:\/\/api\.guildwars2\.com\/v2\/legendaryarmory\)/);
});

test('el pedido en español lleva &lang=es (sin eso volverían los nombres en inglés)', () => {
  const cache = tmp();
  write(cache, 'armory.json', [30684, 80248]);
  write(cache, 'items-en-1.json', EN.slice(0, 2));
  const r = run(cache, path.join(tmp(), 's.json'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /falta items-es-1\.json .*\(pedido: https:\/\/api\.guildwars2\.com\/v2\/items\?ids=30684,80248&lang=es\)/);
});

test('un id pedido que no vuelve es un fallo, no una baja del catálogo', () => {
  const cache = tmp(); const out = path.join(tmp(), 'snap.json');
  write(cache, 'armory.json', [30684, 80248, 91048]);
  write(cache, 'items-en-1.json', EN.slice(0, 2));
  write(cache, 'items-es-1.json', ES);
  const r = run(cache, out);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^FetchError: lang=en: 1 de 3 ids pedidos no volvieron\. Primeros: \[91048\]/);
  assert.equal(fs.existsSync(out), false, 'no escribe un snapshot incompleto');
});

test('una respuesta que no es lista se rechaza', () => {
  const cache = tmp();
  write(cache, 'armory.json', [30684]);
  write(cache, 'items-en-1.json', { text: 'too many ids' });
  const r = run(cache, path.join(tmp(), 's.json'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^FetchError: \/v2\/items\?lang=en lote 1: se esperaba una lista, vino dict/);
});

test('pide de a 200 ids: 205 legendarias son 2 lotes por idioma', () => {
  const cache = tmp(); const out = path.join(tmp(), 'snap.json');
  const ids = Array.from({ length: 205 }, (_, i) => 100000 + i);
  const en = ids.map(id => ({ id, name: 'Item ' + id, icon: '', type: 'Weapon', details: { type: 'Sword' } }));
  const es = ids.map(id => ({ id, name: 'Objeto ' + id }));
  write(cache, 'armory.json', ids);
  write(cache, 'items-en-1.json', en.slice(0, 200));
  write(cache, 'items-en-2.json', en.slice(200));
  write(cache, 'items-es-1.json', es.slice(0, 200));
  write(cache, 'items-es-2.json', es.slice(200));
  const r = run(cache, out);
  assert.equal(r.status, 0, r.stderr);
  const snap = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.equal(Object.keys(snap).length, 205);
  assert.equal(snap['100204'].name_es, 'Objeto 100204');
});
