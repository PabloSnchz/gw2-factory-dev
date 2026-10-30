// BL-084 EQ-4: el equipo de la ficha en 3 tarjetas (js/bld-gearview.js). Sin red ni navegador.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
globalThis.GNBldShow = require('../js/bld-show.js');
globalThis.GNBldItems = require('../js/bld-items.js');
const GV = require('../js/bld-gearview.js');
const P = GV._pure;
const I = globalThis.GNBldItems;
const RG = 'https://render.guildwars2.com/file/';

// Una build de PvE armada a mano: 6 piezas ascendidas de Berserker con runa, 6 abalorios, reliquia, 2 juegos de armas,
// infusiones, comida y mejora. Las ids no importan: las referencias se pasan ya resueltas, como las deja bld-items.
const ENTRY = {
  armor: [[11, 161], [12, 161], [13, 161], [14, 161], [15, 161], [16, 161]],
  rune: 900,
  trinkets: [[21, 161], [22, 161], [23, 161], [24, 161], [25, 161], [26, 161]],
  relic: 950,
  weapons: [[1, 'm', 31, 161, [801, 802]], [2, 'm', 32, 161, [801]], [2, 'o', 33, 161, [803]]],
  infusion: [49432, 18], food: 91, utility: 92
};
function item(id, name, extra) { return Object.assign({ id, name, icon: RG + 'I/' + id + '.png', rarity: 'Ascended', type: 'Armor', sub: '' }, extra || {}); }
const REFS = {
  items: {
    11: item(11, 'Casco <b>raro</b>', { sub: 'Helm' }), 12: item(12, 'Hombreras', { sub: 'Shoulders' }), 13: item(13, 'Pecho', { sub: 'Coat' }),
    14: item(14, 'Guantes', { sub: 'Gloves' }), 15: item(15, 'Perneras', { sub: 'Leggings' }), 16: item(16, 'Botas', { sub: 'Boots', rarity: 'Legendary' }),
    21: item(21, 'Capa', { type: 'Back' }), 22: item(22, 'Acc 1', { type: 'Trinket', sub: 'Accessory' }), 23: item(23, 'Acc 2', { type: 'Trinket', sub: 'Accessory' }),
    24: item(24, 'Amuleto', { type: 'Trinket', sub: 'Amulet' }), 25: item(25, 'Anillo 1', { type: 'Trinket', sub: 'Ring' }), 26: item(26, 'Anillo 2', { type: 'Trinket', sub: 'Ring' }),
    31: item(31, 'Mandoble', { type: 'Weapon', sub: 'Greatsword' }), 32: item(32, 'Espada', { type: 'Weapon', sub: 'Sword' }), 33: item(33, 'Antorcha', { type: 'Weapon', sub: 'Torch' }),
    900: item(900, 'Runa superior del cazadragones', { type: 'UpgradeComponent', rarity: 'Exotic', bonuses: ['+25 de ferocidad', '+35 de potencia'] }),
    950: item(950, 'Reliquia del ladrón', { type: 'Relic', rarity: 'Exotic', desc: 'Tu daño aumenta.' }),
    801: item(801, 'Sello superior de fuerza', { type: 'UpgradeComponent', rarity: 'Exotic', buff: '+5 % de daño.' }),
    802: item(802, 'Sello superior de impacto', { type: 'UpgradeComponent', rarity: 'Exotic', buff: '+3 % de daño' }),
    49432: item(49432, 'Infusión de potencia', { type: 'UpgradeComponent' }),
    91: item(91, 'Pastel <script>', { type: 'Consumable', rarity: 'Fine', effect: '+100 de potencia' }),
    92: item(92, 'Piedra de afilar', { type: 'Consumable', rarity: 'Rare', effect: 'Conversión' })
  },
  stats: { 161: { id: 161, name: 'Berserker', attrs: ['Power', 'Precision', 'CritDamage'] } },
  amulets: {}
};

test('versión en la cabecera y en el objeto', () => {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'bld-gearview.js'), 'utf8');
  assert.match(src, /Versión: 1\.0\.0 /);
  assert.equal(GV.version, '1.0.0');
  assert.doesNotMatch(src, /localStorage/, 'sin estado guardado');
});

test('textos: lista con «y», atributos de la estadística y líneas oficiales (bonos numerados, efecto, descripción)', () => {
  assert.equal(P.andList(['a']), 'a');
  assert.equal(P.andList(['a', 'b', 'c']), 'a, b y c');
  assert.equal(P.statAttrs(REFS.stats[161]), 'potencia, precisión y ferocidad');
  assert.deepEqual(P.itemLines(REFS.items[900]), ['(1) +25 de ferocidad', '(2) +35 de potencia']);
  assert.deepEqual(P.itemLines({ buff: 'x', effect: 'x', desc: 'y' }), ['x', 'y'], 'sin repetir');
  assert.equal(P.rarityOf(REFS.items[16]), 'leg');
  assert.equal(P.rarityOf({ rarity: 'Rara' }), '');
});

test('tarjetas: Armadura (6), Abalorios y reliquia (7), Armas con juegos y «Otros»', () => {
  const v = I.sheet(ENTRY, REFS);
  const c = P.cards(v);
  assert.deepEqual(c.map((x) => [x.key, x.title, x.count]), [['armor', 'Armadura', 6], ['trinkets', 'Abalorios y reliquia', 7], ['weapons', 'Armas', 0]]);
  assert.deepEqual(c[0].groups[0].rows.map((r) => r.sub), ['Casco', 'Hombreras', 'Pecho', 'Guantes', 'Perneras', 'Botas']);
  assert.equal(c[0].groups[0].rows[0].main, 'Berserker', 'cada pieza muestra su estadística');
  assert.equal(c[0].groups[0].rows[0].ups[0].name, 'Runa superior del cazadragones', 'y su runa');
  assert.deepEqual(c[1].groups[0].rows.map((r) => r.sub), ['Espalda', 'Accesorio', 'Accesorio', 'Amuleto', 'Anillo', 'Anillo', 'Reliquia']);
  assert.deepEqual(c[2].groups.map((g) => g.label), ['Juego de armas 1', 'Juego de armas 2', 'Otros']);
  assert.equal(c[2].groups[0].rows[0].sub, 'Mandoble · Dos manos');
  assert.deepEqual(c[2].groups[0].rows[0].ups.map((u) => u.name), ['Sello superior de fuerza', 'Sello superior de impacto']);
  assert.equal(c[2].groups[1].rows[1].sub, 'Antorcha · Mano secundaria');
  assert.deepEqual(c[2].groups[2].rows.map((r) => r.sub), ['Infusiones ×18', 'Comida', 'Mejora']);
});

test('HTML: secciones con título, íconos oficiales con su rareza, descripción unida por aria-describedby, resumen y todo escapado', () => {
  const v = I.sheet(ENTRY, REFS);
  const h = GV.html(v, null);
  assert.deepEqual([...h.matchAll(/<section class="bld-gcard" aria-labelledby="bldG-(\w+)"><h5 id="bldG-\1">([^<]+)/g)].map((m) => m[2].trim()),
    ['Armadura', 'Abalorios y reliquia', 'Armas']);
  assert.match(h, /<h5 id="bldG-armor">Armadura <span>6 piezas<\/span><\/h5>/);
  assert.match(h, /<h5 id="bldG-trinkets">Abalorios y reliquia <span>7 piezas<\/span><\/h5>/);
  assert.match(h, /<h6>Otros<\/h6>/);
  assert.match(h, /<span class="bld-gico is-asc" title="ascendido"><img class="bld-gic" src="https:\/\/render\.guildwars2\.com\/file\/I\/11\.png" width="40"/);
  assert.match(h, /class="bld-gico is-leg" title="legendario"/);
  const tips = [...h.matchAll(/<li class="bld-gr" tabindex="0" aria-describedby="(bldTip-\d+)">/g)].map((m) => m[1]);
  const ids = [...h.matchAll(/role="tooltip" id="(bldTip-\d+)"/g)].map((m) => m[1]);
  assert.equal(tips.length, 6 + 7 + 3 + 3, 'cada objeto con descripción es alcanzable con Tab');
  assert.deepEqual(tips, ids, 'cada fila apunta a su propia descripción');
  assert.equal(new Set(ids).size, ids.length, 'ids únicos');
  assert.match(h, /<b>Berserker<\/b><span>Da potencia, precisión y ferocidad\.<\/span>/);
  assert.match(h, /<b>Runa superior del cazadragones<\/b><span>\(1\) \+25 de ferocidad<\/span><span>\(2\) \+35 de potencia<\/span>/);
  assert.match(h, /<em>Descripción oficial · API de Guild Wars 2 en castellano<\/em>/);
  assert.match(h, /<ul class="bld-gstats" aria-label="Resumen de estadísticas"><li class="bld-gchip"><b>Berserker<\/b> ×15 = potencia, precisión y ferocidad<\/li><\/ul>/);
  assert.match(h, /Escape la cierra/);
  assert.doesNotMatch(h, /<script>|<b>raro<\/b>/, 'lo que viene de la API se escapa');
  assert.match(h, /Pastel &lt;script&gt;/);
  assert.doesNotMatch(h, /<table/, 'ya no son tablas');
});

test('PvP: runa sola, amuleto con sus atributos y reliquia; sin piezas de armadura', () => {
  const v = I.sheet({ amulet: 7, rune: 900, relic: 950, weapons: [[1, 'm', 31, 0, [801]]] },
    { items: REFS.items, stats: {}, amulets: { 7: { id: 7, name: 'Amuleto de berserker', icon: RG + 'A/7.png', attrs: [['Power', 1200], ['Precision', 900]] } } });
  const c = P.cards(v);
  assert.deepEqual(c.map((x) => x.title), ['Runa', 'Amuleto y reliquia', 'Armas']);
  const h = GV.html(v, null);
  assert.match(h, /<b>Amuleto de berserker<\/b><small>Amuleto · Potencia 1200, Precisión 900<\/small>/);
  assert.doesNotMatch(h, /piezas<\/span>/, 'en PvP no se cuentan piezas');
  assert.equal(GV.html(null, null), '');
});

test('objetos que la API no tiene: el número, el aviso y un hueco en lugar del ícono', () => {
  const v = I.sheet({ armor: [[5, 0, 6]], weapons: [] }, { items: {}, stats: {}, amulets: {} });
  const h = GV.html(v, null);
  assert.match(h, /<b>#5<\/b>/);
  assert.match(h, /#6 <small>\(sin datos en la API\)<\/small>/);
  assert.match(h, /class="bld-ph bld-gic"/);
  assert.doesNotMatch(h, /<li class="bld-gr" tabindex/, 'sin descripción no hay nada que abrir');
});

test('Mis builds: avisa que el equipo es el de la build en que se basa', () => {
  const v = I.sheet(ENTRY, REFS);
  assert.match(GV.html(v, { mine: true, base: { name: 'Guardia <x>' } }), /^<p class="bld-muted bld-gsum">Equipo de la build en que se basa: <b>Guardia &lt;x&gt;<\/b>/);
});

test('Escape cierra la descripción sin mover el foco; al salir de la fila vuelve a estar disponible', () => {
  const cls = new Set();
  const row = { classList: { add: (c) => cls.add(c), remove: (c) => cls.delete(c), contains: (c) => cls.has(c) }, contains: (x) => x === inner };
  const inner = { closest: () => row };
  let stopped = 0;
  assert.equal(P.onKey({ key: 'Enter', target: inner }), false);
  assert.equal(P.onKey({ key: 'Escape', target: inner, stopPropagation: () => { stopped++; } }), true);
  assert.ok(cls.has('is-tipoff'));
  assert.equal(stopped, 1, 'Escape no cierra además otra cosa');
  assert.equal(P.onKey({ key: 'Escape', target: inner }), false, 'ya cerrada');
  assert.equal(P.onLeave({ target: inner, relatedTarget: inner }), false, 'moverse dentro de la fila no la reabre');
  assert.equal(P.onLeave({ target: inner, relatedTarget: null }), true);
  assert.equal(cls.has('is-tipoff'), false);
  assert.equal(P.onKey({ key: 'Escape', target: { closest: () => null } }), false);
  const on = [];
  const host = { addEventListener: (t) => on.push(t) };
  assert.equal(GV.wire(host), true);
  assert.equal(GV.wire(host), false, 'una sola vez por contenedor');
  assert.deepEqual(on, ['keydown', 'focusout', 'mouseout']);
});

test('CSS: tokens de los temas (la rareza solo con variable y respaldo), 3 columnas, 2 y 1 en el celular; descripción con hover y foco', () => {
  assert.doesNotMatch(P.CSS, /:\s*#[0-9a-fA-F]{3,8}/, 'sin colores fijos fuera de un var()');
  assert.match(P.CSS, /\.bld-gear\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(P.CSS, /@media \(max-width:1100px\)\{[^}]*\.bld-gear\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
  assert.match(P.CSS, /@media \(max-width:720px\)\{[^}]*\.bld-gear\{grid-template-columns:1fr\}/);
  assert.match(P.CSS, /\.bld-gr:hover>\.bld-gtip,#buildsPanel \.bld-gr:focus>\.bld-gtip\{display:block\}/);
  assert.match(P.CSS, /\.bld-gr\.is-tipoff>\.bld-gtip\{display:none\}/);
  assert.match(P.CSS, /\.bld-gr:focus-visible\{outline:2px solid var\(--gn-mod\)/, 'foco visible');
});

test('las builds reales: cada equipo de gear.json se pinta sin romperse, aun sin datos de la API', () => {
  const GEAR = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/gear.json'), 'utf8')).gear;
  const keys = Object.keys(GEAR);
  assert.ok(keys.length >= 90);
  const t0 = Date.now();
  keys.forEach((k) => {
    const h = GV.html(I.sheet(GEAR[k], null), null);
    assert.match(h, /<div class="bld-gear"><section class="bld-gcard"/, k);
    const ids = [...h.matchAll(/id="(bldTip-\d+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, k + ': ids únicos');
  });
  assert.ok(Date.now() - t0 < 2000, 'las ' + keys.length + ' fichas en menos de 2 s');
});
