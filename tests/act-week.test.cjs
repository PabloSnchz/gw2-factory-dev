// Actividades, pestaña Semana (BL-070, ACT-4): js/act-week.js. Corre con: node --test tests/*.test.cjs
// La llave como señal (humano, «Plebeyo» y profesión, no filtro), mi voz, la guía de la comunidad, las piedras por
// moneda con la cartera, las marcas por cuenta y semana (sin leer la pantalla vieja, ACT-7c) y el contraste en los 19 themes.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SRC = read('js/act-week.js');
const MODEL = read('js/act-model.js');
const VIEW = read('js/act-view.js');
const CAT = JSON.parse(read('assets/data/activities/catalog.json'));
const DATA = JSON.parse(read('assets/data/activities/key-farm.json'));
const J = (x) => JSON.parse(JSON.stringify(x));
const DAY = 864e5;

function box(extra) {
  const sb = Object.assign({ console: { info() {}, warn() {} } }, extra || {});
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(MODEL, sb, { filename: 'act-model.js' });
  vm.runInContext(SRC, sb, { filename: 'act-week.js' });
  return sb;
}
const S0 = box();
const W = S0.ActWeek._pure, M = S0.ActModel._pure;
// Miércoles 2026-10-21 12:00 UTC; el reset semanal fue el lunes 19 a las 07:30.
const NOW = Date.UTC(2026, 9, 21, 12, 0);
const LYRA = { name: 'Lyra', level: 12, created: '2026-10-20T10:00:00Z', race: 'Human', profession: 'Thief', backstory: ['7-54', '21-105'] };
const NORN = { name: 'Brok', level: 11, created: '2026-10-20T11:00:00Z', race: 'Norn', profession: 'Warrior', backstory: ['1-2'] };

test('archivo: presupuesto, manifiesto después de act-view, sin emojis ni almacenamiento propio; datos verificados', () => {
  assert.ok(Buffer.byteLength(SRC) <= 40 * 1024);
  assert.match(SRC, /Versión: 1\.1\.0/);
  assert.doesNotMatch(SRC, /\bActivities\b|oldCount|migrated/, 'ACT-7c: no lee la pantalla vieja de Actividades');
  assert.equal(JSON.parse(read('js/modules.json')).modules.filter((m) => m.src === 'js/act-week.js')[0].v, '1.1.0');
  assert.doesNotMatch(SRC, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'sin emojis');
  assert.doesNotMatch(SRC, /localStorage|sessionStorage/, 'guarda solo por Storage');
  const man = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  assert.equal(man.indexOf('js/act-week.js'), man.indexOf('js/act-view.js') + 1);
  assert.doesNotMatch(read('index.html'), /act-week\.js/);
  // RUN-060: la clase social «Plebeyo» es la respuesta 21-105 de la pregunta 21; 5 profesiones con su ícono oficial.
  assert.equal(DATA.combo.race, 'Human');
  assert.deepEqual(J(DATA.combo.backstory), { question: 21, questionName: 'Clase social', answer: '21-105', name: 'Plebeyo' });
  assert.deepEqual(DATA.professions.map((p) => p.id), ['Elementalist', 'Guardian', 'Warrior', 'Revenant', 'Thief']);
  DATA.professions.forEach((p) => assert.match(p.icon, /^https:\/\/render\.guildwars2\.com\/file\//));
  assert.deepEqual(Object.keys(DATA.currencies).map(Number).sort((a, b) => a - b), CAT.leivas.offers.map((o) => o.currency).sort((a, b) => a - b));
  assert.equal(DATA.key.item, CAT.weeklyKey.item);
});

test('señal: raza, clase social y profesión suben la confianza; sin biografía es «sin datos», no «no»', () => {
  assert.deepEqual(J(W.signal(LYRA, DATA)), { human: true, commoner: true, combo: true, profession: 'Thief' });
  assert.deepEqual(J(W.signal(NORN, DATA)), { human: false, commoner: false, combo: false, profession: 'Warrior' });
  assert.equal(W.signal(Object.assign({}, LYRA, { backstory: undefined }), DATA).commoner, null);
  assert.equal(W.signal(Object.assign({}, LYRA, { backstory: undefined }), DATA).combo, false);
});

test('la llave: cualquier profesión cuenta; la combinación va primero y cambia mi voz', () => {
  const chars = [NORN, LYRA, { name: 'Vieja', level: 80, created: '2019-01-01T00:00:00Z', race: 'Human', backstory: ['21-105'] }];
  const k = M.weeklyKey(chars, NOW, 10);
  const km = W.keyModel(k, chars, DATA);
  assert.equal(km.state, 'probable');
  assert.deepEqual(J(km.chars.map((c) => c.name)), ['Lyra', 'Brok'], 'la vieja no cuenta; la combinación primero; el guerrero norn también cuenta');
  assert.equal(km.combo, true);
  const since = M.lastWeekly(NOW);
  assert.equal(W.keyVoice(km, DATA, since).text, 'La API no me dice si terminaste el capítulo de nivel 10, pero Lyra es humano, eligió «Plebeyo» y llegó a nivel 10 esta semana: es la combinación que usa la comunidad para farmear la llave. Si ya la sacaste, confirmalo y la cuento.');
  const solo = W.keyModel(M.weeklyKey([NORN], NOW, 10), [NORN], DATA);
  assert.equal(solo.combo, false);
  assert.match(W.keyVoice(solo, DATA, since).text, /^Brok llegó a nivel 10 esta semana\. La API no confirma el capítulo y no es la combinación de farmeo \(humano y «Plebeyo»\), así que no lo doy por hecho/);
  assert.match(W.keyVoice(W.keyModel(M.weeklyKey([], NOW, 10), [], DATA), DATA, since).text, /^No veo personajes nuevos de nivel 10 desde el reset del lunes 19\/10\. La llave de esta semana sigue disponible/);
  assert.match(W.keyVoice(W.keyModel(M.weeklyKey(chars, NOW, 10, true), chars, DATA), DATA, since).text, /ya la sacaste/);
  assert.equal(W.keyVoice(W.keyModel(M.weeklyKey(null, NOW, 10), null, DATA), DATA, since), null, 'sin datos no digo nada');
});

test('la llave en pantalla: ícono de la llave y de la profesión, señal en texto, confirmación y estados honestos', () => {
  const chars = [LYRA, NORN], since = M.lastWeekly(NOW);
  const base = { data: DATA, hasToken: true, loaded: true, weekly: 'lunes 07:30', since };
  const h = W.keyHTML(Object.assign({}, base, { key: W.keyModel(M.weeklyKey(chars, NOW, 10), chars, DATA) }));
  assert.match(h, /<img class="aw-kic" src="https:\/\/render\.guildwars2\.com\/file\/207BDD31BC494A07A0A1691705079100066D3F2F\/414998\.png"/);
  assert.match(h, /av-badge av-badge--pend">Muy probable</);
  assert.match(h, /F9EC00E23F630D6DB20CDA985592EC010E2A5705\/156641\.png.*<b>Lyra<\/b>/, 'ícono oficial del ladrón');
  assert.match(h, /aw-chip aw-chip--ok">Humano<\/span><span class="aw-chip aw-chip--ok">Plebeyo<\/span><span class="aw-chip">Ladrón<\/span><span class="aw-chip aw-chip--ok">Combinación de farmeo/);
  assert.match(h, /<b>Brok<\/b>.*aw-chip">Otra raza<\/span><span class="aw-chip">Otra clase social<\/span><span class="aw-chip">Guerrero</);
  assert.match(h, /data-aw-key="yes" aria-pressed="false">Ya la saqué<\/button><button type="button" class="av-btn" data-aw-key="no" aria-pressed="false">Todavía no</);
  assert.doesNotMatch(h, /data-aw-key="auto"/);
  assert.match(h, /id="awKeyVoice" class="aw-voice" aria-live="polite"/);
  const yes = W.keyHTML(Object.assign({}, base, { mark: true, key: W.keyModel(M.weeklyKey(chars, NOW, 10, true), chars, DATA) }));
  assert.match(yes, /av-badge--ok">Ya la sacaste</);
  assert.match(yes, /data-aw-key="yes" aria-pressed="true"/);
  assert.match(yes, /data-aw-key="auto">Que lo detecte solo</);
  const nokey = W.keyHTML(Object.assign({}, base, { hasToken: false, key: W.keyModel(M.weeklyKey(null, NOW, 10), null, DATA) }));
  assert.match(nokey, /av-badge--nd">Sin datos/);
  assert.doesNotMatch(nokey, /data-aw-key/, 'sin Key no hay qué confirmar');
});

test('la guía de la comunidad: humano «Plebeyo», 5 profesiones con su ícono (el ladrón, de la comunidad) y los pasos', () => {
  const h = W.guideHTML({ data: DATA });
  assert.match(h, /<small>Raza<\/small><b>Humano<\/b>/);
  assert.match(h, /<small>Clase social \(biografía\)<\/small><b>Plebeyo<\/b>/);
  assert.equal((h.match(/<li><img src="https:\/\/render\.guildwars2\.com/g) || []).length, 5);
  assert.match(h, /<span>Ladrón<small>la comunidad<\/small><\/span>/);
  assert.equal((h.match(/<ol class="aw-steps">/g) || []).length, 1);
  assert.equal((h.match(/<li>/g) || []).length, 5 + 5);
  assert.match(h, /Wiki oficial, «Key farming», y la experiencia de la comunidad/);
});

test('las piedras: una casilla por moneda, con lo que tenés; el oro en oro; sin Key, deshabilitadas', () => {
  const wallet = [{ id: 1, value: 123456 }, { id: 2, value: 5000 }, { id: 68, value: 400 }];
  const s = W.stones(CAT.leivas.offers, wallet, { 2: true }, DATA);
  assert.equal(s.bought, 1);
  assert.equal(W.stoneNote(s.rows[0]), 'cuesta 1 de oro · tenés 12 de oro');
  assert.equal(W.stoneNote(s.rows[1]), 'cuesta 7.000 de karma · tenés 5.000 de karma · te faltan 2.000 de karma');
  assert.equal(W.stoneNote(s.rows[3]), 'cuesta 10 de monedas antiguas · tenés 0 de monedas antiguas · te faltan 10 de monedas antiguas');
  assert.equal(W.stoneNote(W.stones(CAT.leivas.offers, null, {}, DATA).rows[4]), 'cuesta 10 de esquirlas de magnetita', 'sin cartera, solo el costo');
  const h = W.stonesHTML({ data: DATA, hasToken: true, weekly: 'lunes 07:30', stones: s });
  assert.equal((h.match(/class="aw-stone" data-aw-stone="/g) || []).length, 5);
  assert.match(h, /data-aw-stone="2" aria-pressed="true">.*<b>Con karma<\/b>.*<span class="av-sr">, comprada<\/span>/);
  assert.match(h, /1 de 5 compradas/);
  assert.match(h, /data-aw-wp="1">Copiar el punto de ruta de Piedra Arbórea/);
  const off = W.stonesHTML({ data: DATA, hasToken: false, stones: W.stones(CAT.leivas.offers, null, {}, DATA) });
  assert.equal((off.match(/aria-pressed="false" disabled>/g) || []).length, 5);
  const err = W.stonesHTML({ data: DATA, hasToken: true, migrated: true, walletState: 'error', stones: s });
  assert.match(err, /Marcá las que compraste: valen hasta el reset del lunes\. No pude leer tu cartera/);
  assert.doesNotMatch(err, /primeras casillas/, 'ACT-7c: el −/+ de antes ya no pasa');
});

test('CSS: solo el texto del theme, foco visible, 44 px y sin teñir el fondo del texto', () => {
  const keys = new Set();
  W.CSS.replace(/(?:^|[;{])\s*color\s*:\s*var\((--[\w-]+)/g, (m, k) => { keys.add(k); return m; });
  assert.deepEqual([...keys].sort(), ['--tx-1', '--tx-2']);
  assert.match(W.CSS, /\.aw-stone\{[^}]*min-height:44px/);
  assert.match(W.CSS, /\.aw-stone:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.doesNotMatch(W.CSS, /\.aw-chip[^{]*\{[^}]*background/);
});

test('en los 19 themes cada texto de la pestaña llega a 4.5:1 sobre las superficies donde se pinta', () => {
  const TD = path.join(ROOT, 'css', 'themes');
  const themes = fs.readdirSync(TD).filter((f) => f.endsWith('.css'));
  assert.equal(themes.length, 19);
  const sb = { console: { info() {}, warn() {} }, Math, JSON, Object, Array, String, Number, isNaN, parseInt, parseFloat, setTimeout: () => 0 };
  sb.window = sb;
  vm.createContext(sb);
  ['js/gn-surface.js', 'js/gn-frame.js'].forEach((f) => vm.runInContext(read(f), sb, { filename: f }));
  const G = sb.GNSurface._pure, fails = [];
  themes.forEach((f) => {
    const css = fs.readFileSync(path.join(TD, f), 'utf8'), t = {};
    css.slice(css.indexOf('{') + 1, css.indexOf('}')).replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
    const sf = G.surfaces(t), fx = sb.GNFrame._pure.guardFixes(sb.GNSurface.surfaceTokens(t), G), eff = Object.assign({}, t, sf, fx);
    const card = G.parse(sf['--bg-1']), bg0 = G.over(G.parse(t['--bg-0']), [255, 255, 255, 1]), bg2 = G.parse(sf['--bg-2']);
    ['--tx-1', '--tx-2'].forEach((k) => [['tarjeta', card], ['bg-0', bg0], ['botón apretado', bg2]].forEach(([n, s]) => {
      const r = G.contrast(G.over(G.parse(eff[k]), s), s);
      if (r < 4.5) fails.push(f + ' ' + k + ' sobre ' + n + ' ' + r.toFixed(2));
    }));
  });
  assert.deepEqual(fails, []);
});

test('act-view con act-week: Semana la dibuja este archivo y el indicador dice lo que confirmaste', () => {
  const sb = box();
  vm.runInContext(VIEW, sb, { filename: 'act-view.js' });
  const V = sb.ActView._pure;
  const d = { loaded: true, hasToken: true, unread: [], items: {}, crafting: [], chars: [LYRA], fractals: [], progress: [], stones: 2, keyMark: true };
  const m = V.buildModel(d, CAT, { tab: 'semana' }, NOW);
  assert.equal(m.key.state, 'claimed');
  assert.match(V.statsHTML(m), /<small>Llave semanal<\/small><b>Ya la sacaste<\/b><em>lo confirmaste vos<\/em>/);
  assert.match(V.statsHTML(V.buildModel(Object.assign({}, d, { keyMark: false }), CAT, {}, NOW)), /<b>Todavía no<\/b><em>lo confirmaste vos<\/em>/);
  sb.ActView.getSnapshot = () => ({ data: { hasToken: true, tk: 'T', chars: [LYRA] } });
  const h = V.viewHTML(m);
  assert.match(h, /id="awGuideT"/);
  assert.match(h, /id="awStT"/);
  assert.doesNotMatch(h, /avStonesSlot/, 'la tarjeta vieja de las piedras ya no se reubica');
});

// ------------------------------------------------------------------ humo
function boot(opts) {
  const store = {}, renders = [], voices = [];
  const els = {};
  const document = {
    head: { appendChild(n) { els[n.id] = n; } }, createElement: () => ({ id: '' }),
    getElementById: (id) => (id === 'awKeyVoice' ? (els.awKeyVoice = els.awKeyVoice || { children: [], get firstChild() { return this.children[0] || null; }, removeChild(c) { this.children = this.children.filter((x) => x !== c); }, appendChild(c) { this.children.push(c); } }) : els[id] || null),
  };
  const tk = opts.tk === undefined ? 'TOKEN-DE-PRUEBA' : opts.tk;
  const sb = box({
    document,
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve(J(DATA)) }),
    Storage: { get: (k) => (k in store ? JSON.parse(store[k]) : null), set: (k, v) => { store[k] = JSON.stringify(v); } },
    Activities: opts.legacy ? { _debug: () => ({ token: 'x', weeklyStones: 4 }) } : undefined,
    GW2Api: { getAccountWallet: () => { renders.push('wallet'); return Promise.resolve([{ id: 1, value: 20000 }]); } },
    Shiruvana: { voice: (m) => { voices.push(m.text); return { text: m.text }; } },
    navigator: { clipboard: { writeText: (t) => { renders.push('copy:' + t); return Promise.resolve(); } } },
  });
  sb.ActView = { getSnapshot: () => ({ data: tk ? { hasToken: true, tk, chars: opts.chars || [LYRA] } : { hasToken: false } }), render: () => renders.push('render'), _cat: () => CAT };
  return { sb, store, renders, voices };
}
const click = (attrs) => ({ target: { getAttribute: (k) => (k in attrs ? attrs[k] : null), parentNode: null } });

test('humo: marcar y desmarcar por cuenta y semana, sin guardar la Key y sin leer la pantalla vieja (ACT-7c)', async () => {
  const { sb, store, renders } = boot({ legacy: true });
  const A = sb.ActWeek, now = Date.now();
  assert.deepEqual(J(A.state(now)), { bought: 0 }, 'un Activities viejo con 4 piedras no se lee');
  assert.equal(A.onClick(click({ 'data-aw-stone': '1' })), true);
  assert.equal(A.onClick(click({ 'data-aw-stone': '2' })), true);
  assert.deepEqual(J(A.state(now)), { bought: 2 }, 'oro y karma');
  const raw = store[A._pure.STORE];
  assert.ok(raw && !raw.includes('TOKEN-DE-PRUEBA'), 'la Key nunca se guarda');
  assert.equal(A.onClick(click({ 'data-aw-stone': '1' })), true);
  assert.equal(A.state(now).bought, 1, 'desmarqué el oro');
  A.onClick(click({ 'data-aw-key': 'yes' }));
  assert.equal(A.state(now).keyMark, true);
  A.onClick(click({ 'data-aw-key': 'no' }));
  assert.equal(A.state(now).keyMark, false);
  A.onClick(click({ 'data-aw-key': 'auto' }));
  assert.equal(A.state(now).keyMark, undefined);
  assert.ok(renders.filter((r) => r === 'render').length >= 4, 'cada marca redibuja');
  assert.deepEqual(J(A.state(now + 7 * DAY)), { bought: 0 }, 'la semana que viene empieza en cero');
  assert.equal(A.onClick(click({ 'data-aw-wp': '1' })), true);
  await new Promise((r) => setTimeout(r, 10));
  assert.ok(renders.includes('copy:[&BGMNAAA=]'), 'copia el punto de ruta de Piedra Arbórea');
  assert.equal(A.onClick(click({ 'data-av': 'refresh' })), false, 'lo que no es suyo lo deja pasar');
});

test('humo: en Semana pide la cartera una vez, pone mi voz en la llave y sin Key no marca nada', async () => {
  // Lyra se crea entre el último reset semanal y ahora, así el humo no depende del día en que corre. Con la fecha fija
  // (2026-10-20) falló desde el reset del lunes 2026-10-26 07:30 UTC: Lyra ya era de la semana anterior.
  const now = Date.now(), since = Number(box().ActModel._pure.lastWeekly(now));
  const lyra = Object.assign({}, LYRA, { created: new Date(Math.floor((since + now) / 2)).toISOString() });
  const { sb, voices, renders } = boot({ chars: [lyra] });
  const A = sb.ActWeek, m = { tab: 'semana', hasToken: true, loaded: true, key: sb.ActModel._pure.weeklyKey([lyra], now, 10), clocks: { weekly: 'lunes 07:30' }, lastWeekly: sb.ActModel._pure.lastWeekly(Date.now()) };
  A.afterRender(Object.assign({}, m, { tab: 'hoy' }));
  assert.deepEqual(voices.concat(renders), [], 'fuera de Semana no hace nada');
  A.afterRender(m);
  await new Promise((r) => setTimeout(r, 20));
  A.afterRender(m);
  assert.ok(voices.some((v) => /Lyra es humano, eligió «Plebeyo»/.test(v)) || voices.some((v) => /Lyra/.test(v)), 'mi voz nombra a Lyra');
  assert.ok(renders.includes('render'), 'redibuja al llegar los datos y la cartera');
  assert.equal(renders.filter((r) => r === 'wallet').length, 1, 'la cartera, una sola vez');
  const h = A.html(m);
  assert.match(h, /tenés 2 de oro/, 'la cartera llegó');
  const n = boot({ tk: null });
  assert.equal(n.sb.ActWeek.state(Date.now()), null);
  n.sb.ActWeek.onClick(click({ 'data-aw-stone': '1' }));
  assert.deepEqual(Object.keys(n.store), [], 'sin Key no se guarda nada');
});
