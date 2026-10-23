// BL-057 / MET-2 — meta-theme.js 2.0.0: cabecera de Metas y Eventos (relojes, resets, «Hoy en tu cuenta») y mi voz.
// Carga js/meta-theme.js en un contexto mínimo y prueba sus reglas puras (MetaTheme._pure).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js/meta-theme.js'), 'utf8');

function load() {
  const noop = () => {};
  const document = { readyState: 'complete', hidden: false, head: { appendChild: noop }, documentElement: { appendChild: noop },
    getElementById: () => null, querySelector: () => null, createElement: () => ({ style: {} }), addEventListener: noop };
  const window = { document, addEventListener: noop };
  vm.runInNewContext(SRC, { window, document, console, setInterval, clearInterval, setTimeout, clearTimeout });
  return window.MetaTheme;
}
const MT = load();
const P = MT._pure;
const at = (iso) => new Date(iso);

// Snapshot como el de Meta.snapshot() de meta.js 4.x.
function snap(state, rows) { return { flags: { state, lastHuman: '21:30' }, rows }; }
function row(id, o) { return Object.assign({ id, name: id, chat: '[&BNABAAA=]', state: 'later', mins: 90, start: at('2026-10-23T12:00:00Z'), tracked: false, done: null, pinned: false }, o); }
const tracked19 = (done) => Array.from({ length: 19 }, (_, i) => row('t' + i, { tracked: true, done: i < done }));

test('versión 2.0.0 y API pública', () => {
  assert.equal(MT.version, '2.0.0');
  assert.equal(typeof MT.refresh, 'function');
  for (const k of ['clock', 'countdown', 'minsText', 'nextDailyReset', 'nextWeeklyReset', 'todayStats', 'todayView', 'pickVoice', 'headHTML']) assert.equal(typeof P[k], 'function', k);
});

test('relojes y cuentas regresivas legibles', () => {
  assert.equal(P.clock(at('2026-10-23T03:04:05Z'), true), '03:04:05');
  assert.equal(P.countdown(0), 'ahora');
  assert.equal(P.countdown(40 * 1000), '40 s');
  assert.equal(P.countdown((12 * 60 + 5) * 1000), '12 min 05 s');
  assert.equal(P.countdown((5 * 3600 + 7 * 60 + 30) * 1000), '5 h 07 min');
  assert.equal(P.countdown((2 * 86400 + 3 * 3600) * 1000), '2 d 03 h');
  assert.equal(P.minsText(45), '45 min');
  assert.equal(P.minsText(125), '2 h 05 min');
  assert.equal(P.minsText(60), '1 h');
});

test('reset diario a las 00:00 UTC y semanal los lunes 07:30 UTC', () => {
  assert.equal(P.nextDailyReset(at('2026-10-23T23:59:00Z')).toISOString(), '2026-10-24T00:00:00.000Z');
  assert.equal(P.nextDailyReset(at('2026-10-24T00:00:00Z')).toISOString(), '2026-10-25T00:00:00.000Z');
  // 2026-10-23 es viernes.
  assert.equal(P.nextWeeklyReset(at('2026-10-23T03:00:00Z')).toISOString(), '2026-10-26T07:30:00.000Z');
  assert.equal(P.nextWeeklyReset(at('2026-10-26T07:29:00Z')).toISOString(), '2026-10-26T07:30:00.000Z', 'lunes antes de la hora');
  assert.equal(P.nextWeeklyReset(at('2026-10-26T07:30:00Z')).toISOString(), '2026-11-02T07:30:00.000Z', 'lunes a la hora: la semana que viene');
});

test('«Hoy en tu cuenta» cuenta solo lo que la API sigue y dice la verdad en cada estado', () => {
  const rows = tracked19(6).concat([row('x', { tracked: false, done: null }), row('y', { tracked: false, done: null })]);
  const st = P.todayStats(snap('ok', rows));
  assert.deepEqual([st.done, st.total, st.pending], [6, 19, 13]);
  assert.deepEqual(P.todayView(st), { val: '6 de 19', pct: 32, note: '13 pendientes · leído 21:30' });
  assert.equal(P.todayView(P.todayStats(snap('ok', tracked19(19)))).note, 'todo hecho · leído 21:30');
  assert.equal(P.todayStats(snap('noperm', rows)).pending, null, 'sin permiso no hay pendientes inventados');
  for (const s of ['loading', 'noperm', 'error', 'none']) {
    const v = P.todayView(P.todayStats(snap(s, rows)));
    assert.notEqual(v.val, '0 de 19', s + ': nunca un 0 falso');
    assert.ok(v.note.length > 0, s);
  }
  assert.equal(P.todayView(P.todayStats(null)).note, 'Elegí una cuenta para verlo');
});

test('mi voz: reset cerca con pendientes > fijada > permiso > día completo; si no, nada', () => {
  const late = at('2026-10-23T23:20:00Z'), mid = at('2026-10-23T15:00:00Z');
  const pinSoon = row('tequatl', { name: 'Tequatl el Sombrío', pinned: true, state: 'soon', mins: 12, start: at('2026-10-23T15:12:00Z') });
  let v = P.pickVoice(snap('ok', tracked19(5).concat([pinSoon])), late);
  assert.equal(v.kind, 'advierte');
  assert.match(v.text, /^Faltan 40 min para el reset diario y te quedan 14 metas/);
  v = P.pickVoice(snap('ok', tracked19(5).concat([pinSoon])), mid);
  assert.equal(v.kind, 'recomienda');
  const hm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  assert.equal(v.text, 'Tu fijada «Tequatl el Sombrío» empieza a las ' + hm(pinSoon.start) + ', en 12 min. Waypoint [&BNABAAA=].');
  const pinOn = row('karka', { name: 'Reina Karka', pinned: true, state: 'active', mins: 15 });
  v = P.pickVoice(snap('ok', [pinSoon, pinOn]), mid);
  assert.match(v.text, /«Reina Karka» está en curso: termina en 15 min/, 'la que está en curso va primero aunque falte más');
  assert.equal(P.pickVoice(snap('ok', [Object.assign({}, pinOn, { done: true })]), mid), null, 'una fijada ya hecha no se anuncia');
  v = P.pickVoice(snap('noperm', tracked19(0)), mid);
  assert.equal(v.kind, 'explica');
  assert.match(v.text, /progression/);
  v = P.pickVoice(snap('ok', tracked19(19)), mid);
  assert.equal(v.kind, 'saluda');
  assert.match(v.text, /las 19 metas/);
  assert.equal(P.pickVoice(snap('ok', tracked19(19)), late).kind, 'saluda', 'sin pendientes, el reset no asusta');
  assert.equal(P.pickVoice(snap('ok', tracked19(3)), mid), null, 'un día normal: no hablo de más');
  assert.equal(P.pickVoice(snap('none', tracked19(0)), late), null, 'sin cuenta no hay pendientes que avisar');
  assert.equal(P.pickVoice(null, mid), null);
});

test('cabecera: relojes, resets y «Hoy en tu cuenta», con íconos locales y sin estilos en línea', () => {
  const h = P.headHTML();
  for (const id of ['mhUtc', 'mhLocal', 'mhDaily', 'mhWeekly', 'mhToday', 'mhTodayBar', 'mhTodayNote']) assert.match(h, new RegExp('id="' + id + '"'), id);
  for (const t of ['Hora del servidor', 'Tu hora', 'Reset diario', 'Reset semanal', 'Hoy en tu cuenta', '↻ Actualizar']) assert.ok(h.includes(t), t);
  assert.doesNotMatch(h, /style="/, 'sin estilos en línea');
  assert.doesNotMatch(h, /https?:\/\//, 'íconos de La Bóveda, no de internet');
  for (const icon of (h.match(/assets\/icons\/[^"]+/g) || [])) assert.ok(fs.existsSync(path.join(ROOT, icon)), 'existe ' + icon);
});

test('código: sin la 1.x (migraciones, emojis de estado, estilos en línea) y mi voz por Shiruvana.voice', () => {
  const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /migrateStatusBadges|\.m-card|\.meta-card|style\.cssText/);
  assert.doesNotMatch(code, /[✅⏰💎📦🟢🟡🔵📅]/u);
  assert.match(code, /Shiruvana\.voice\(/);
  assert.match(code, /gn:meta-rendered/);
  assert.match(code, /Meta\.snapshot\(\)/);
  assert.doesNotMatch(code, /innerHTML\s*=\s*[^;]*msg\.text/, 'mi texto entra como texto, no como HTML');
});
