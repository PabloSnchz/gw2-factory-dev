// BL-057 / MET-2 — meta-theme.js 2.1.x: cabecera de Metas y Eventos como la propuesta MET-0
// (Local, Servidor, resets con cuenta regresiva, «Hoy en tu cuenta» con barra) y mi voz sobre lo que está en curso.
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
const hm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');

// Snapshot como el de Meta.snapshot() de meta.js 4.x.
function snap(state, rows) { return { flags: { state, lastHuman: '21:30' }, rows }; }
function row(id, o) { return Object.assign({ id, name: id, type: 'meta', chat: '[&BNABAAA=]', state: 'later', mins: 90, start: at('2026-10-23T12:00:00Z'), tracked: false, done: null, pinned: false }, o); }
// 13 jefes del mundo + 6 cofres de mapa; los primeros `done` hechos.
const tracked19 = (done) => Array.from({ length: 19 }, (_, i) => row('t' + i, { type: i < 13 ? 'worldboss' : 'meta', tracked: true, done: i < done }));
const untracked = (n) => Array.from({ length: n }, (_, i) => row('u' + i));

test('versión 2.1.0 y API pública', () => {
  assert.equal(MT.version, '2.1.0');
  assert.equal(typeof MT.refresh, 'function');
  for (const k of ['countdown', 'minsText', 'nextDailyReset', 'nextWeeklyReset', 'headerData', 'todayStats', 'todayView', 'whyText', 'pickVoice', 'headHTML']) assert.equal(typeof P[k], 'function', k);
});

test('cuentas regresivas como en la propuesta: «23 min», «3 d 7 h»', () => {
  assert.equal(P.countdown(0), 'ahora');
  assert.equal(P.countdown(40 * 1000), '40 s');
  assert.equal(P.countdown(23 * 60000 + 30000), '23 min');
  assert.equal(P.countdown((5 * 3600 + 7 * 60) * 1000), '5 h 7 min');
  assert.equal(P.countdown(5 * 3600 * 1000), '5 h');
  assert.equal(P.countdown((3 * 86400 + 7 * 3600 + 50 * 60) * 1000), '3 d 7 h');
  assert.equal(P.minsText(13), '13 min');
  assert.equal(P.minsText(125), '2 h 5 min');
});

test('resets: diario 00:00 UTC y semanal lunes 07:30 UTC', () => {
  assert.equal(P.nextDailyReset(at('2026-10-23T23:59:00Z')).toISOString(), '2026-10-24T00:00:00.000Z');
  // 2026-10-23 es viernes.
  assert.equal(P.nextWeeklyReset(at('2026-10-23T03:00:00Z')).toISOString(), '2026-10-26T07:30:00.000Z');
  assert.equal(P.nextWeeklyReset(at('2026-10-26T07:29:00Z')).toISOString(), '2026-10-26T07:30:00.000Z');
  assert.equal(P.nextWeeklyReset(at('2026-10-26T07:30:00Z')).toISOString(), '2026-11-02T07:30:00.000Z');
});

test('botones de la cabecera: Local, Servidor UTC y resets; el reset cercano se resalta', () => {
  const now = at('2026-10-22T23:37:00Z');
  const d = P.headerData(now);
  assert.equal(d.local, hm(now));
  assert.equal(d.server, '23:37 UTC');
  assert.equal(d.daily, 'en 23 min');
  assert.equal(d.dailySoon, true);
  assert.equal(d.weekly, 'en 3 d 7 h');
  assert.equal(d.weeklySoon, false);
  const noon = P.headerData(at('2026-10-22T12:00:00Z'));
  assert.equal(noon.dailySoon, false);
  assert.equal(noon.daily, 'en 12 h');
  assert.equal(P.headerData(at('2026-10-25T08:00:00Z')).weeklySoon, true, 'domingo: falta menos de un día para el semanal');
});

test('«Hoy en tu cuenta»: N de 19 que puedo seguir por la API, sin 0 falsos, y «¿Por qué 19?»', () => {
  const rows = tracked19(6).concat(untracked(30));
  const st = P.todayStats(snap('ok', rows));
  assert.deepEqual([st.done, st.total, st.pending, st.all, st.bosses, st.chests], [6, 19, 13, 49, 13, 6]);
  assert.deepEqual(P.todayView(st), { val: '6 de 19 que puedo seguir por la API', pct: 32 });
  for (const s of ['loading', 'noperm', 'error', 'none']) {
    const v = P.todayView(P.todayStats(snap(s, rows)));
    assert.doesNotMatch(v.val, /^0 de/, s + ': nunca un 0 falso');
    assert.equal(v.pct, 0, s);
  }
  assert.equal(P.todayStats(snap('noperm', rows)).pending, null);
  assert.equal(P.whyText(st), 'La API de GW2 solo me dice qué jefes del mundo (13) y cofres de mapa (6) hiciste hoy. Las otras 30 metas no las informa: no las marco ni como hechas ni como pendientes.');
});

test('mi voz cerca del reset: la meta pendiente en curso, con nombre en negrita y waypoint (como la propuesta)', () => {
  const late = at('2026-10-23T23:37:00Z');
  const rows = tracked19(18).map((r, i) => (i === 18 ? Object.assign(r, { id: 'modniir_ulgoth', name: 'Ulgoth', type: 'worldboss', state: 'active', mins: 13, chat: '[&BLEAAAA=]' }) : r));
  const v = P.pickVoice(snap('ok', rows), late);
  assert.equal(v.kind, 'advierte');
  assert.equal(v.label, 'Shiruvana advierte');
  assert.equal(v.text, 'Faltan 23 min para el reset diario. Ulgoth está en curso y termina en 13 min: es el último jefe del mundo que te cuenta para hoy y todavía no lo hiciste. El waypoint está a un clic.');
  assert.deepEqual(v.parts[1], { b: 'Ulgoth' }, 'el nombre va en negrita');
  assert.equal(v.wp, '[&BLEAAAA=]');
  // Varias pendientes: prefiere la que termina antes del reset.
  const many = tracked19(10).map((r, i) => (i === 15 ? Object.assign(r, { name: 'Larga', state: 'active', mins: 50 }) : i === 16 ? Object.assign(r, { name: 'Corta', state: 'active', mins: 10 }) : r));
  const w = P.pickVoice(snap('ok', many), late);
  assert.match(w.text, /Corta está en curso y termina en 10 min: te quedan 9 para hoy/);
  // Día completo: el reset cerca no asusta.
  assert.equal(P.pickVoice(snap('ok', tracked19(19)), late).kind, 'saluda');
  // Sin ninguna en curso: aviso general del reset.
  assert.match(P.pickVoice(snap('ok', tracked19(10)), late).text, /^Faltan 23 min para el reset diario y te quedan 9 metas que la API sigue/);
});

test('mi voz durante el día: fijada > pendiente en curso > lo que está en curso > lo que empieza; después permiso y día completo', () => {
  const mid = at('2026-10-23T15:00:00Z');
  const pinSoon = row('tequatl', { name: 'Tequatl el Sombrío', pinned: true, state: 'soon', mins: 12, start: at('2026-10-23T15:12:00Z') });
  let v = P.pickVoice(snap('ok', tracked19(5).concat([pinSoon])), mid);
  assert.equal(v.kind, 'recomienda');
  assert.equal(v.text, 'Tu fijada Tequatl el Sombrío empieza a las ' + hm(pinSoon.start) + ', en 12 min. El waypoint está a un clic.');
  const pinOn = row('karka', { name: 'Reina Karka', pinned: true, state: 'active', mins: 15 });
  assert.match(P.pickVoice(snap('ok', [pinSoon, pinOn]), mid).text, /^Tu fijada Reina Karka está en curso y termina en 15 min/, 'la fijada en curso va primero');
  assert.equal(P.pickVoice(snap('ok', [Object.assign({}, pinOn, { done: true, tracked: true })]), mid).label, 'Shiruvana te cuenta', 'una fijada hecha no se recomienda: solo informo que está en curso');

  const pend = tracked19(3).map((r, i) => (i === 4 ? Object.assign(r, { name: 'Megadestructor', type: 'worldboss', state: 'active', mins: 9 }) : r));
  v = P.pickVoice(snap('ok', pend), mid);
  assert.equal(v.kind, 'advierte');
  assert.equal(v.text, 'Megadestructor está en curso y termina en 9 min. Hoy todavía no lo hiciste. El waypoint está a un clic.');

  const two = [row('a', { name: 'Octohiedra', state: 'active', mins: 18 }), row('b', { name: 'Furienredadera', state: 'active', mins: 6, chat: '' })];
  v = P.pickVoice(snap('none', two), mid);
  assert.equal(v.label, 'Shiruvana te cuenta');
  assert.equal(v.text, 'Hay 2 metas en curso. La que termina primero es Furienredadera, en 6 min.');
  assert.equal(v.wp, '', 'sin waypoint no ofrezco el botón');
  assert.equal(P.pickVoice(snap('none', [two[0]]), mid).text, 'Octohiedra está en curso y termina en 18 min. El waypoint está a un clic.');

  const soon = row('c', { name: 'Tequatl', state: 'soon', mins: 7, start: at('2026-10-23T15:07:00Z') });
  assert.equal(P.pickVoice(snap('none', [soon]), mid).text, 'En 7 min empieza Tequatl (' + hm(soon.start) + '). El waypoint está a un clic.');

  assert.match(P.pickVoice(snap('noperm', tracked19(0)), mid).text, /progression/);
  v = P.pickVoice(snap('ok', tracked19(19)), mid);
  assert.equal(v.kind, 'saluda');
  assert.match(v.text, /las 19 metas/);
  assert.equal(P.pickVoice(snap('ok', tracked19(3)), mid), null, 'nada en curso ni por empezar: no hablo de más');
  assert.equal(P.pickVoice(null, mid), null);
});

test('cabecera: los cuatro botones, «Hoy en tu cuenta» con barra, Actualizar y «¿Por qué 19?»; íconos locales, sin estilos en línea', () => {
  const h = P.headHTML();
  for (const k of ['local', 'server', 'daily', 'weekly']) assert.match(h, new RegExp('data-mh-pill="' + k + '"[\\s\\S]*?id="mh-' + k + '"'), k);
  for (const t of ['Local', 'Servidor', 'Reset diario', 'Reset semanal', 'Hoy en tu cuenta', '↻ Actualizar', '¿Por qué 19?', 'Horarios en tu hora local']) assert.ok(h.includes(t), t);
  assert.match(h, /role="progressbar"/);
  assert.match(h, /id="mhWhy" hidden/);
  assert.doesNotMatch(h, /style="/, 'sin estilos en línea');
  assert.doesNotMatch(h, /https?:\/\//, 'íconos de La Bóveda, no de internet');
  for (const icon of (h.match(/assets\/icons\/[^"]+/g) || [])) assert.ok(fs.existsSync(path.join(ROOT, icon)), 'existe ' + icon);
});

test('código: sin la 1.x, mi voz por Shiruvana.voice y mis textos como texto (nunca HTML)', () => {
  const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /migrateStatusBadges|\.m-card|\.meta-card|style\.cssText/);
  assert.match(code, /Shiruvana\.voice\(/);
  assert.match(code, /gn:meta-rendered/);
  assert.match(code, /Meta\.snapshot\(\)/);
  assert.match(code, /b\.textContent = x\.b/, 'la negrita se arma con textContent');
  assert.doesNotMatch(code, /innerHTML\s*=\s*[^;]*(m\.text|x\.b|m\.parts)/);
});
