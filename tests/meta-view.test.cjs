// BL-057 / MET-1 — Meta & Eventos 4.0.x: lógica de la pantalla nueva (Ahora, agenda, catálogo).
// Carga js/meta.js en un contexto mínimo y prueba las funciones puras de Meta._pure con los datos reales.
// MET-1c (4.0.1, DEC-031): vistas previas desde assets/previews/ y estado «Sin vista previa» limpio.
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

test('versión 4.0.x y API pública', () => {
  assert.equal(Meta.version, Meta._view ? '4.0.1' : '4.0.0');
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

// ---------------------------------------------------------------------------------------------
// MET-1c (DEC-031): vistas previas desde La Bóveda y estado «Sin vista previa» limpio.
// ---------------------------------------------------------------------------------------------
const drops = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/meta-drops.json'), 'utf8').replace(/^\uFEFF/, ''));
const skip1c = !Meta._view && 'meta.js todavía 4.0.0';

test('meta-drops.json: 8 vistas previas locales en assets/previews/ y 2 marcadas como faltantes', () => {
  const ok = [], missing = [];
  for (const d of drops) {
    const it = (d.items || [])[0] || {};
    assert.ok(!/^https?:/i.test(it.preview || ''), d.metaId + ': la vista previa no sale de internet');
    if (it.previewMissing) { missing.push(d.metaId); assert.equal(it.preview, '', d.metaId); continue; }
    if (!it.preview) continue;
    ok.push(d.metaId);
    assert.equal(it.preview, 'assets/previews/' + d.metaId + '.webp', d.metaId);
    assert.ok(fs.existsSync(path.join(ROOT, it.preview)), 'existe ' + it.preview);
  }
  assert.deepEqual(ok.sort(), ['death_branded_shatterer', 'dragonstorm', 'drakkar', 'drizzlewood_north', 'octovine', 'pinata', 'secrets_of_the_weald', 'vinewrath']);
  assert.deepEqual(missing.sort(), ['chak_gerent', 'dragons_end']);
});

test('meta.js pide meta-drops.json nuevo (?v=2.6.0) para no servir las direcciones viejas', { skip: skip1c }, () => {
  assert.match(SRC, /assets\/meta-drops\.json\?v=2\.6\.0/);
});

test('previewOf: ok, falta (DEC-031), no aplica y la que no cargó', { skip: skip1c }, () => {
  const V = Meta._view;
  assert.deepEqual(V.previewOf({ preview: 'assets/previews/a.webp' }), { state: 'ok', url: 'assets/previews/a.webp' });
  assert.deepEqual(V.previewOf({ preview: '', previewMissing: true }), { state: 'missing', url: '' });
  assert.deepEqual(V.previewOf({ preview: '' }), { state: 'none', url: '' });
  assert.deepEqual(V.previewOf(null), { state: 'none', url: '' });
  V.badPreviews.add('assets/previews/rota.webp');
  assert.deepEqual(V.previewOf({ preview: 'assets/previews/rota.webp' }), { state: 'missing', url: '' });
  V.badPreviews.delete('assets/previews/rota.webp');
});

test('tarjeta: «Vista previa» si hay archivo, «Sin vista previa» si falta, nada si no aplica', { skip: skip1c }, () => {
  const V = Meta._view;
  const ok = V.dropHTML({ highlightItemId: null, _extItems: [{ itemName: 'Queen Bee Infusion', preview: 'assets/previews/vinewrath.webp' }] });
  assert.match(ok, /data-preview="assets\/previews\/vinewrath\.webp"/);
  assert.match(ok, /data-pv="ok"/);
  assert.match(ok, /mt-drop--prev/);
  assert.match(ok, />Vista previa</);
  const miss = V.dropHTML({ highlightItemId: null, _extItems: [{ itemName: 'Chak Infusion', preview: '', previewMissing: true }] });
  assert.match(miss, /data-preview=""/);
  assert.match(miss, /data-pv="missing"/);
  assert.match(miss, /mt-drop--nopv/);
  assert.match(miss, /Sin vista previa/);
  assert.match(miss, /aria-label="Sin vista previa de Chak Infusion"/);
  assert.doesNotMatch(miss, /mt-drop--prev/);
  const none = V.dropHTML({ highlightItemId: null, _extItems: [{ itemName: 'Algo', preview: '' }] });
  assert.doesNotMatch(none, /data-preview|vista previa/i);
});

// DOM mínimo para la ventanita: lo justo que usan showPreview, place y markMissing.
function fakeDom() {
  const all = [];
  class El {
    constructor(tag) { this.tagName = tag.toUpperCase(); this.attrs = {}; this.children = []; this.style = {}; this.html = ''; this.parentNode = null;
      const cls = new Set(); this.classList = { add: (...c) => c.forEach((x) => cls.add(x)), remove: (...c) => c.forEach((x) => cls.delete(x)), contains: (c) => cls.has(c) };
      Object.defineProperty(this, 'className', { get: () => [...cls].join(' '), set: (v) => { cls.clear(); String(v).split(/\s+/).filter(Boolean).forEach((x) => cls.add(x)); } }); }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
    hasAttribute(k) { return k in this.attrs; }
    appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
    removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; }
    set innerHTML(v) { this.html = v; this.children = []; }
    get innerHTML() { return this.html + this.children.map((c) => '<' + c.tagName.toLowerCase() + '>').join(''); }
    querySelector(sel) { const k = sel.replace('.', ''); return (this.sub || {})[k] || null; }
    getBoundingClientRect() { return { left: 10, top: 300 }; }
    get offsetHeight() { return 100; }
  }
  const body = new El('body');
  const document = { body, createElement: (t) => { const e = new El(t); all.push(e); return e; }, querySelector: () => null, querySelectorAll: () => targets, addEventListener: () => {} };
  const targets = [];
  return { El, document, body, all, targets };
}
function loadWithDom(dom) {
  const window = { addEventListener: () => {}, scrollX: 0, scrollY: 0 };
  const warns = [];
  vm.runInNewContext(SRC, { window, document: dom.document, Storage: { STORAGE_KEYS: {} }, console: { info() {}, warn: (...a) => warns.push(a.join(' ')), error() {}, log() {} }, setTimeout, clearTimeout, setInterval, clearInterval });
  return { Meta: window.Meta, warns };
}
function target(dom, url, pv, name) {
  const t = new dom.El('div');
  t.setAttribute('data-preview', url); t.setAttribute('data-pv', pv);
  const n = new dom.El('span'); n.textContent = name; const h = new dom.El('span'); h.textContent = 'Vista previa';
  t.sub = { 'mt-dname': n, 'mt-dhint': h };
  t.classList.add('mt-drop', pv === 'ok' ? 'mt-drop--prev' : 'mt-drop--nopv');
  dom.targets.push(t);
  return t;
}

test('ventanita sin archivo: «Sin vista previa» con el nombre, sin <img> ni texto alternativo', { skip: skip1c }, () => {
  const dom = fakeDom();
  const { Meta: M } = loadWithDom(dom);
  const t = target(dom, '', 'missing', 'Chak Infusion');
  M._view.showPreview(t, null);
  const pop = dom.body.children[0];
  assert.ok(pop, 'se abre');
  assert.match(pop.innerHTML, /Sin vista previa/);
  assert.match(pop.innerHTML, /Chak Infusion/);
  assert.doesNotMatch(pop.innerHTML, /<img/);
  M._view.hidePreview(true);
  assert.equal(dom.body.children.length, 0, 'se cierra');
});

test('ventanita con archivo: «Cargando…» sin texto alternativo, después la imagen; si falla, «Sin vista previa» y la tarjeta cambia', { skip: skip1c }, () => {
  const dom = fakeDom();
  const { Meta: M, warns } = loadWithDom(dom);
  const url = 'assets/previews/vinewrath.webp';
  const t = target(dom, url, 'ok', 'Queen Bee Infusion');
  M._view.showPreview(t, null);
  let pop = dom.body.children[0];
  const img = pop.children.find((c) => c.tagName === 'IMG');
  assert.ok(img, 'pide la imagen');
  assert.equal(img.src, url);
  assert.equal(img.alt, '', 'mientras carga no hay texto alternativo a la vista');
  assert.ok(pop.classList.contains('is-loading'));
  assert.match(pop.html, /Cargando vista previa/);
  img.onload();
  assert.ok(!pop.classList.contains('is-loading'));
  assert.equal(img.alt, 'Vista previa: Queen Bee Infusion');
  M._view.hidePreview(true);

  M._view.showPreview(t, null);
  pop = dom.body.children[0];
  const img2 = pop.children.find((c) => c.tagName === 'IMG');
  img2.onerror();
  assert.match(pop.innerHTML, /Sin vista previa/);
  assert.match(pop.innerHTML, /Queen Bee Infusion/);
  assert.doesNotMatch(pop.innerHTML, /<img/, 'la imagen rota se va');
  assert.ok(M._view.badPreviews.has(url));
  assert.equal(t.getAttribute('data-pv'), 'missing');
  assert.ok(t.classList.contains('mt-drop--nopv') && !t.classList.contains('mt-drop--prev'));
  assert.equal(t.sub['mt-dhint'].textContent, 'Sin vista previa');
  assert.ok(warns.some((w) => w.includes(url)), 'deja el diagnóstico en la consola');
  M._view.hidePreview(true);
  M._view.showPreview(t, null);
  assert.doesNotMatch(dom.body.children[0].innerHTML, /<img/, 'la próxima vez ya no la pide');
});
