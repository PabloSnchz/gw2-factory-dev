// Cálculo del día del PSNA en js/activities.js (BL-013, RSK-018). Corre con: node --test tests/*.test.cjs
// Extrae la función pura psnaPickDay (bloque PSNA-DAY) y la prueba contra los datos publicados:
// - la ubicación cambia a las 08:00 UTC y depende solo del día de la semana;
// - sin rotación usa la fecha exacta y después el mismo día de la semana;
// - sin datos devuelve null (el panel muestra "sin datos", nunca un día equivocado);
// - la app lee solo el archivo propio, nunca el repo de producción.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'activities.js'), 'utf8');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'data', 'psna-schedule.json'), 'utf8'));

const block = SRC.match(/\/\/ PSNA-DAY:BEGIN[\s\S]*?\/\/ PSNA-DAY:END/);
const pick = block ? new Function(block[0] + '\nreturn psnaPickDay;')() : null;
const fns = block ? new Function(block[0] + '\nreturn { psnaNextChange, psnaDayText };')() : {};
const at = (iso) => new Date(iso);
const first = (r) => r && r.waypoints[0].name;

test('psna-day: activities.js tiene la función pura psnaPickDay', () => {
  assert.ok(block, 'falta el bloque PSNA-DAY:BEGIN … PSNA-DAY:END');
  assert.equal(typeof pick, 'function');
});

test('psna-day: el día cambia a las 08:00 UTC', () => {
  // 2026-10-21 es miércoles: Town of Prosperity desde las 08:00 UTC; antes sigue el martes (Camp Resolve).
  assert.equal(first(pick(DATA, at('2026-10-21T07:59:59Z'))), 'Camp Resolve Waypoint');
  assert.equal(pick(DATA, at('2026-10-21T07:59:59Z')).weekday, 'tuesday');
  assert.equal(first(pick(DATA, at('2026-10-21T08:00:00Z'))), 'Town of Prosperity');
  assert.equal(pick(DATA, at('2026-10-21T08:00:00Z')).date, '2026-10-21');
});

test('psna-day: coincide con la tabla de la wiki (octubre y enero de 2026)', () => {
  // Plantilla "Pact Supply Network Agent table" de la wiki: cada fila es el día que empieza a las 08:00 UTC.
  // La copia de octubre y la de enero coinciden con la rotación por día de la semana.
  const wiki = {
    '2026-10-18': ["Azarr's Arbor", 'Mabon Waypoint'],
    '2026-10-19': ['Restoration Refuge', 'Lionguard Waystation Waypoint'],
    '2026-10-20': ['Camp Resolve Waypoint', 'Desider Atum Waypoint'],
    '2026-10-21': ['Town of Prosperity', 'Swampwatch Post'],
    '2026-10-22': ['Blue Oasis', 'Seraph Protectors'],
    '2026-10-23': ['Repair Station', 'Breth Ayahusasca'],
    '2026-10-24': ['Camp Resolve Waypoint', "Gallant's Folly"],
    '2026-10-25': ["Azarr's Arbor", 'Mabon Waypoint'],
    '2026-01-24': ['Camp Resolve Waypoint', "Gallant's Folly"],
    '2026-01-26': ['Restoration Refuge', 'Lionguard Waystation Waypoint'],
    '2026-01-27': ['Camp Resolve Waypoint', 'Desider Atum Waypoint'],
  };
  for (const [date, names] of Object.entries(wiki)) {
    const r = pick(DATA, at(date + 'T12:00:00Z'));
    assert.deepEqual([r.waypoints[0].name, r.waypoints[1].name], names, 'fila ' + date);
  }
});

test('psna-day: depende solo del día de la semana (semana siguiente y otro año)', () => {
  const a = pick(DATA, at('2026-10-22T12:00:00Z'));
  assert.deepEqual(pick(DATA, at('2026-10-29T12:00:00Z')).waypoints, a.waypoints);
  assert.deepEqual(pick(DATA, at('2027-03-18T12:00:00Z')).waypoints, a.waypoints); // jueves
  assert.equal(pick(DATA, at('2027-03-18T12:00:00Z')).source, 'rotation');
});

test('psna-day: sin rotación usa la fecha exacta y después el mismo día de la semana', () => {
  const sched = { schedule: DATA.schedule };
  assert.equal(pick(sched, at('2026-10-22T12:00:00Z')).source, 'date');
  const r = pick(sched, at('2027-01-07T12:00:00Z')); // jueves sin fecha exacta
  assert.equal(r.source, 'weekday');
  assert.equal(first(r), 'Blue Oasis');
});

test('psna-day: sin datos devuelve null en lugar de un día equivocado', () => {
  assert.equal(pick(null, at('2026-10-22T12:00:00Z')), null);
  assert.equal(pick({ schedule: [] }, at('2026-10-22T12:00:00Z')), null);
  assert.equal(pick({ rotation: { monday: [] } }, at('2026-10-22T12:00:00Z')), null);
  assert.equal(pick(DATA, new Date('x')), null);
  // Hay datos, pero no del día pedido: tampoco se inventa (jueves pedido, solo hay un lunes).
  const monday = { schedule: [{ date: '2026-10-19', waypoints: DATA.rotation.monday }] };
  assert.equal(pick(monday, at('2026-10-22T12:00:00Z')), null);
  // Un día incompleto (5 lugares) no se muestra.
  const partial = { rotation: { thursday: DATA.rotation.thursday.slice(0, 5) } };
  assert.equal(pick(partial, at('2026-10-22T12:00:00Z')), null);
});

test('psna-day: sin resetUtcHour en el archivo, el cambio es a las 08:00 UTC', () => {
  const noHour = { rotation: DATA.rotation };
  assert.equal(pick(noHour, at('2026-10-22T07:59:00Z')).weekday, 'wednesday');
  assert.equal(pick(noHour, at('2026-10-22T08:00:00Z')).weekday, 'thursday');
});

test('psna-day: el respaldo embebido es la misma rotación del archivo de datos', () => {
  const m = SRC.match(/var FALLBACK_PSNA_DATA = (\{[\s\S]*?\n  \});/);
  assert.ok(m, 'falta FALLBACK_PSNA_DATA');
  const fb = new Function('return ' + m[1])();
  assert.equal(fb.resetUtcHour, DATA.resetUtcHour);
  assert.deepEqual(JSON.parse(JSON.stringify(fb.rotation)), DATA.rotation);
});

test('psna-day: lee solo el archivo propio, no el repo de producción', () => {
  assert.doesNotMatch(SRC, /gw2-wallet-ligero/);
  assert.match(SRC, /PSNA_DATA_PATHS:\s*\[\s*'assets\/data\/psna-schedule\.json'\s*\]/);
  assert.doesNotMatch(SRC, /url\.startsWith\('assets\/'\)/);
});

test('psna-day: el próximo cambio es a las 08:00 UTC de hoy o de mañana (BL-044)', () => {
  const nx = fns.psnaNextChange;
  assert.equal(nx(DATA, at('2026-10-21T07:59:00Z')).toISOString(), '2026-10-21T08:00:00.000Z');
  assert.equal(nx(DATA, at('2026-10-21T08:00:00Z')).toISOString(), '2026-10-22T08:00:00.000Z');
  assert.equal(nx(DATA, at('2026-10-21T22:14:00Z')).toISOString(), '2026-10-22T08:00:00.000Z');
  assert.equal(nx(null, at('2026-10-21T03:00:00Z')).toISOString(), '2026-10-21T08:00:00.000Z');
  assert.equal(nx(DATA, new Date('x')), null);
});

test('psna-day: el panel dice de qué día son los lugares y cuándo cambian (BL-044)', () => {
  const now = at('2026-10-21T22:14:00Z');
  const day = pick(DATA, now);
  const txt = fns.psnaDayText(day, fns.psnaNextChange(DATA, now), now);
  assert.equal(txt, 'Lugares del miércoles 21/10 · cambian en 9 h 46 min (08:00 UTC)');
  const early = at('2026-10-21T07:15:00Z');
  assert.equal(fns.psnaDayText(pick(DATA, early), fns.psnaNextChange(DATA, early), early),
    'Lugares del martes 20/10 · cambian en 45 min (08:00 UTC)');
  assert.equal(fns.psnaDayText(null, null, now), '');
});

test('psna-day: el panel muestra el texto del día y se actualiza solo en el cambio (BL-044)', () => {
  assert.match(SRC, /psnaDayText\(day, next, now\)/);
  assert.match(SRC, /state\._psnaTimer = setTimeout/);
  assert.match(SRC, /clearTimeout\(state\._psnaTimer\)/);
});

// ---- Panel renovado (BL-048) ------------------------------------------------
// Ejecuta el renderPSNA real (bloque "8. RENDERIZADO PSNA") con un DOM mínimo.
test('psna-day: cuánto falta se escribe en horas y minutos (BL-048)', () => {
  const f = new Function(block[0] + '\nreturn psnaFalta;')();
  assert.equal(f(at('2026-10-22T08:00:00Z'), at('2026-10-21T22:38:00Z')), '9 h 22 min');
  assert.equal(f(at('2026-10-22T08:00:00Z'), at('2026-10-22T06:55:00Z')), '1 h 05 min');
  assert.equal(f(at('2026-10-22T08:00:00Z'), at('2026-10-22T07:15:00Z')), '45 min');
  assert.equal(f(null, at('2026-10-22T07:15:00Z')), '');
});

function renderAt(iso, chats) {
  const r = SRC.match(/  \/\/ 8\. RENDERIZADO PSNA[\s\S]*?(?=  \/\/ =+\n  \/\/ 9\. )/);
  assert.ok(r, 'falta el bloque 8. RENDERIZADO PSNA');
  const els = {};
  const el = () => ({ innerHTML: '', disabled: false, title: '', querySelectorAll: () => [] });
  ['#psnaGrid', '#psnaStatus', '#psnaCopyAll'].forEach((k) => { els[k] = el(); });
  const head = [];
  const document = { getElementById: (id) => head.find((n) => n.id === id) || null,
    createElement: () => ({}), head: { appendChild: (n) => head.push(n) } };
  const RealDate = Date;
  const FakeDate = function (...a) { return a.length ? new RealDate(...a) : new RealDate(iso); };
  FakeDate.UTC = RealDate.UTC;
  const now = new RealDate(iso);
  const DATA2 = DATA;
  const day = pick(DATA2, now);
  const list = day.waypoints.map((w, i) => ({ region: 'R' + i, npc: 'N' + i, name: w.name, wpName: w.name,
    chat: chats ? chats[i] : w.code }));
  const state = { active: true, daily: { psna: list, psnaData: DATA2, psnaDay: day } };
  const esc = (x) => String(x == null ? '' : x).replace(/[&<>"']/g, (m) => '&#' + m.charCodeAt(0) + ';');
  const timers = [];
  const run = new Function('$', 'esc', 'state', 'document', 'LOG', 'copyToClipboard', 'Date', 'setInterval', 'clearInterval',
    block[0] + '\n' + r[0] + '\nrenderPSNA();');
  run((k) => els[k] || null, esc, state, document, '[t]', () => {}, FakeDate,
    (fn, ms) => { timers.push(ms); return 1; }, () => {});
  return { grid: els['#psnaGrid'].innerHTML, status: els['#psnaStatus'].innerHTML, copyAll: els['#psnaCopyAll'],
    style: head.find((n) => n.id === 'psnaStyle'), timers };
}

test('psna-day: cada lugar es un botón con el ícono local del waypoint, no "WP" (BL-048)', () => {
  const out = renderAt('2026-10-21T22:38:00Z');
  const buttons = out.grid.match(/<button type="button" class="psna-wp"/g) || [];
  assert.equal(buttons.length, 6);
  assert.equal((out.grid.match(/src="assets\/icons\/733330\.png"/g) || []).length, 6);
  assert.doesNotMatch(out.grid, /alt="WP"/);
  assert.doesNotMatch(SRC, /wiki\.guildwars2\.com\/images\/thumb\/d\/d2\/Waypoint/);
  assert.match(out.grid, /Town of Prosperity/);
  assert.match(out.grid, /aria-label="Copiar waypoint de Town of Prosperity"/);
  assert.equal((out.grid.match(/>Copiar<\/span>/g) || []).length, 6);
  // El ícono existe en el repo (se sirve desde GitHub Pages, no de la wiki).
  assert.ok(fs.existsSync(path.join(ROOT, 'assets', 'icons', '733330.png')), 'falta assets/icons/733330.png');
});

test('psna-day: el día y la cuenta regresiva se ven en grande y corren solos (BL-048)', () => {
  const out = renderAt('2026-10-21T22:38:00Z');
  assert.match(out.status, /class="psna-day"/);
  assert.match(out.status, /<strong class="psna-day__name">Miércoles 21\/10<\/strong>/);
  assert.match(out.status, /<strong class="psna-day__count" data-psna-falta>9 h 22 min<\/strong>/);
  assert.match(out.status, /08:00 UTC · /);
  assert.match(out.status, /aria-label="Lugares del miércoles 21\/10 · cambian en 9 h 22 min \(08:00 UTC\)"/);
  assert.match(out.status, /6\/6 waypoints/);
  assert.deepEqual(out.timers, [30000]);
  assert.ok(out.style && /\.psna-wp:focus-visible/.test(out.style.textContent), 'faltan los estilos con foco visible');
  assert.match(SRC, /clearInterval\(state\._psnaTick\); state\._psnaTick = null;/);
});

test('psna-day: un lugar sin código queda deshabilitado y se avisa (BL-048)', () => {
  const out = renderAt('2026-10-21T22:38:00Z', ['[&a]', '', '[&c]', '[&d]', '[&e]', '[&f]']);
  assert.equal((out.grid.match(/ disabled>/g) || []).length, 1);
  assert.match(out.grid, />Sin código<\/span>/);
  assert.match(out.status, /5\/6 waypoints/);
  const none = renderAt('2026-10-21T22:38:00Z', ['', '', '', '', '', '']);
  assert.equal(none.copyAll.disabled, true);
  assert.match(none.status, /Ningún waypoint disponible/);
});
