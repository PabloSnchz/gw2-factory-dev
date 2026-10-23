// BL-057 / MET-1 — Meta & Eventos 4.0.0: lógica de la pantalla nueva (Ahora, agenda, catálogo).
// Carga js/meta.js en un contexto mínimo y prueba las funciones puras de Meta._pure con los datos reales.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js/meta.js'), 'utf8');
const metas = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/meta-events.json'), 'utf8').replace(/^\uFEFF/, ''));
const byId = Object.fromEntries(metas.map((m) => [m.id, m]));

function load() {
  const noop = () => {};
  const document = { querySelector: () => null, querySelectorAll: () => [], addEventListener: noop, createElement: () => ({ style: {} }), body: {} };
  const window = { addEventListener: noop };
  vm.runInNewContext(SRC, { window, document, Storage: { STORAGE_KEYS: {} }, console, setTimeout, clearTimeout, setInterval, clearInterval });
  return window.Meta;
}
const Meta = load();
const P = Meta._pure;
const at = (iso) => new Date(iso);
const flagsOk = (wb, mc) => ({ state: 'ok', worldbosses: new Set(wb || []), mapchests: new Set(mc || []) });

test('versión 4.0.0 y API pública', () => {
  assert.equal(Meta.version, '4.0.0');
  for (const k of ['refresh', 'snapshot', '_expansionOptions']) assert.equal(typeof Meta[k], 'function', k);
  for (const k of ['instanceAt', 'startsWithin', 'agendaOf', 'matches', 'typeCounts', 'expCounts', 'groupByExp', 'doneOf', 'hasDrop', 'fold', 'nextResetUTC']) {
    assert.equal(typeof P[k], 'function', k);
  }
});

test('instanceAt: en curso, pronto (≤ 20 min), más tarde y sin horario', () => {
  const m = { windowsUTC: ['01:00', '13:00'], durationMin: 20 };
  let i = P.instanceAt(m, at('2026-10-22T13:05:30Z'));
  assert.equal(i.state, 'active');
  assert.equal(i.mins, 15, 'quedan 14,5 min: redondea hacia arriba');
  assert.equal(+i.end, +at('2026-10-22T13:20:00Z'));
  i = P.instanceAt(m, at('2026-10-22T12:40:00Z'));
  assert.equal(i.state, 'soon');
  assert.equal(i.mins, 20);
  i = P.instanceAt(m, at('2026-10-22T12:39:00Z'));
  assert.equal(i.state, 'later');
  assert.equal(i.mins, 21);
  assert.equal(P.instanceAt({ windowsUTC: [] }, at('2026-10-22T12:00:00Z')).state, 'none');
  i = P.instanceAt(m, at('2026-10-22T13:30:00Z'));
  assert.deepEqual(i.upcoming.map((d) => d.toISOString()), ['2026-10-23T01:00:00.000Z', '2026-10-23T13:00:00.000Z', '2026-10-24T01:00:00.000Z']);
});

test('BL-041: una meta que empezó antes de las 00:00 UTC sigue «en curso» después', () => {
  const m = { windowsUTC: ['23:40'], durationMin: 35 };
  const i = P.instanceAt(m, at('2026-10-23T00:10:00Z'));
  assert.equal(i.state, 'active');
  assert.equal(i.mins, 5);
  assert.equal(+i.start, +at('2026-10-22T23:40:00Z'));
  // Con datos reales: una meta con ventana ≥ 23:30 UTC que cruce la medianoche.
  const late = metas.find((x) => x.windowsUTC.some((w) => w >= '23:30') && x.durationMin >= 20);
  if (late) {
    const w = late.windowsUTC.filter((x) => x >= '23:30').pop();
    const [h, mm] = w.split(':').map(Number);
    const startMs = Date.UTC(2026, 9, 22, h, mm);
    const after = new Date(Date.UTC(2026, 9, 23) + 60000);
    if (startMs + late.durationMin * 60000 > +after) assert.equal(P.instanceAt(late, after).state, 'active', late.id);
  }
});

test('agenda de 3 h: por hora local, en orden, sin el que ya está en curso', () => {
  const now = at('2026-10-22T23:37:00Z');
  const ag = P.agendaOf(metas, now, 3);
  const flat = ag.flatMap((g) => g.slots.map((s) => +s.at));
  assert.ok(flat.length > 0);
  assert.deepEqual(flat, [...flat].sort((a, b) => a - b), 'en orden de tiempo');
  assert.ok(flat.every((t) => t > +now && t <= +now + 3 * 3600000), 'dentro de las 3 h');
  for (const g of ag) {
    assert.equal(g.count, g.slots.reduce((n, s) => n + s.ids.length, 0));
    assert.ok(g.slots.every((s) => new Date(+s.at).getHours() === new Date(+g.slots[0].at).getHours()), 'una hora local por grupo');
  }
  const total = ag.reduce((n, g) => n + g.count, 0);
  const expected = metas.reduce((n, m) => n + P.startsWithin(m, now, 3).length, 0);
  assert.equal(total, expected);
  // El Viaje Titánico empezó 23:15 y está en curso: su próximo inicio es 01:15, no 23:15.
  const ids = ag.flatMap((g) => g.slots.filter((s) => s.ids.includes('a_titanic_voyage')).map((s) => s.at.toISOString()));
  assert.ok(!ids.includes('2026-10-22T23:15:00.000Z'));
});

test('«hecho hoy» honesto: solo lo que la API informa y solo con datos válidos', () => {
  const tracked = metas.filter((m) => m.api && (m.api.worldBossId || m.api.mapChestId));
  assert.equal(tracked.length, 19, '13 jefes del mundo + 6 cofres de mapa');
  const shat = byId.the_shatterer;
  assert.equal(P.doneOf(shat, flagsOk([shat.api.worldBossId])), true);
  assert.equal(P.doneOf(shat, flagsOk([])), false);
  for (const st of ['none', 'loading', 'noperm', 'error']) assert.equal(P.doneOf(shat, { state: st, worldbosses: new Set(), mapchests: new Set() }), null, st);
  assert.equal(P.doneOf(shat, null), null);
  const untracked = metas.find((m) => !(m.api && (m.api.worldBossId || m.api.mapChestId)));
  assert.equal(P.doneOf(untracked, flagsOk(['x'])), null, 'sin seguimiento → no se sabe, no «pendiente»');
});

test('filtros: búsqueda sin tildes, tipo, expansión, próxima hora, pendientes, ocultar hechas, solo con drop', () => {
  const now = at('2026-10-22T23:37:00Z');
  const flags = flagsOk([byId.the_shatterer.api.worldBossId]);
  const rows = metas.map((m) => ({ meta: m, inst: P.instanceAt(m, now), done: P.doneOf(m, flags) }));
  const count = (f) => rows.filter((r) => P.matches(r, Object.assign({ q: '', type: '', exp: '', when: 'all', hideDone: false, onlyDrop: false }, f))).length;
  assert.equal(count({}), 49);
  assert.equal(P.fold('Ásolador ÑANDÚ'), 'asolador nandu');
  assert.equal(count({ q: 'ASOLADOR' }), count({ q: 'asolador' }));
  assert.ok(count({ q: 'asolador' }) >= 1);
  assert.ok(count({ q: 'titanico' }) >= 1, 'sin tilde encuentra «Titánico»');
  assert.equal(count({ q: 'titanico' }), count({ q: 'Titánico' }));
  assert.equal(count({ type: 'temple' }), 5);
  assert.equal(count({ exp: 'Janthir' }), metas.filter((m) => m.expansion === 'Janthir').length);
  assert.equal(count({ when: 'pending' }), 18, '19 seguidas − 1 hecha');
  assert.equal(count({ hideDone: true }), 48);
  assert.equal(count({ onlyDrop: true }), metas.filter((m) => m.highlightItemId).length);
  const hour = count({ when: 'hour' });
  assert.ok(hour > 0 && hour < 49);
  assert.equal(count({ when: 'pending' }), rows.filter((r) => r.done === false).length);
});

test('tipos y expansiones salen de los datos (sin «Fractal» vacío) y suman 49', () => {
  const t = P.typeCounts(metas);
  assert.equal(t.reduce((n, x) => n + x.n, 0), 49);
  assert.ok(!t.some((x) => /fractal/i.test(x.value + x.label)));
  assert.deepEqual(Object.fromEntries(t.map((x) => [x.value, x.n])), { meta: 17, worldboss: 15, event: 7, temple: 5, convergence: 3, global: 1, instance: 1 });
  assert.ok(t.every((x) => x.label && x.label !== x.value), 'etiquetas en español');
  const e = P.expCounts(metas);
  assert.equal(e.reduce((n, x) => n + x.n, 0), 49);
  assert.equal(e[e.length - 1].label, 'Visions of Eternity');
});

test('grupos por expansión: en orden de salida, en curso primero, templos aparte al final', () => {
  const now = at('2026-10-22T23:37:00Z');
  const rows = metas.map((m) => ({ meta: m, inst: P.instanceAt(m, now), done: null }));
  const g = P.groupByExp(rows);
  assert.equal(g[g.length - 1].label, 'Sin horario fijo');
  assert.equal(g[g.length - 1].rows.length, 5);
  assert.equal(g.reduce((n, x) => n + x.rows.length, 0), 49);
  const rank = { active: 0, soon: 1, later: 2, none: 3 };
  for (const x of g) {
    const r = x.rows.map((y) => rank[y.inst.state]);
    assert.deepEqual(r, [...r].sort((a, b) => a - b), x.label);
  }
  assert.equal(+P.nextResetUTC(now), Date.UTC(2026, 9, 23));
});

test('pantalla: se mantiene la vista previa de drops; se va la vista compacta', () => {
  assert.match(SRC, /data-preview/);
  assert.match(SRC, /inf-prev/);
  assert.match(SRC, /'Escape'/);
  assert.match(SRC, /'Enter'/);
  assert.match(SRC, /assets\/meta-drops\.json/);
  assert.ok(!/Vista compacta/.test(SRC.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')), 'sin «Vista compacta»');
  assert.ok(!/\bconfirm\(/.test(SRC), 'sin confirm()');
  assert.match(SRC, /gn:meta-rendered/);
});
