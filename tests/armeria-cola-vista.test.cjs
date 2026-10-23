// Armería (BL-064, ARM-3): «Mi cola» renovada y mi línea en la cabecera.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const JS = path.join(__dirname, '..', 'js');
const AVATAR = 'data:image/webp;base64,UklGRgAAAA';

function el(id) {
  const n = { id, _h: '', listeners: {}, textContent: '', attrs: {}, focused: false };
  Object.defineProperty(n, 'innerHTML', { get: () => n._h, set: (v) => { n._h = String(v); } });
  n.addEventListener = (t, f, cap) => { (n.listeners[t] = n.listeners[t] || []).push({ f, cap: !!cap }); };
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
  n.focus = () => { n.focused = true; };
  return n;
}

// Un tracker de mentira: cola, estado y las acciones que llama la vista.
function cargar(opts = {}) {
  const registro = {};
  const calls = [];
  const nodes = {};
  const body = { children: [], appendChild(c) { this.children.push(c); nodes[c.id] = c; } };
  const state = { queue: (opts.queue || []).slice() };
  const win = {
    console: { info() {}, log() {}, warn() {} },
    LegendaryTracker: {
      QUEUE_MAX: 5,
      registerRender(map) { registro.r = map; return true; },
      registerItemModal() { return true; },
      getOwnershipCounts() { return { tengo: 0, faltan: 206 }; },
      getQueue() { return state.queue.slice(); },
      getState() {
        return { mode: opts.mode || 'progress', token: opts.token === undefined ? 'KEY' : opts.token,
          loading: !!opts.loading, error: opts.error || null, owned: opts.owned || {} };
      },
      openItemModal(id) { calls.push(['open', String(id)]); },
      toggleQueue(id) {
        calls.push(['toggle', String(id)]);
        const i = state.queue.indexOf(Number(id));
        if (i === -1) return { ok: false };
        state.queue.splice(i, 1);
        return { ok: true, added: false };
      },
      setMode(m) { calls.push(['setMode', m]); }
    }
  };
  if (opts.avatar !== undefined) win.Shiruvana = { AVATAR: opts.avatar };
  win.window = win;
  win.document = { getElementById: (id) => nodes[id] || null, createElement: () => el(''), head: { appendChild() {} }, body };
  win.setTimeout = setTimeout;
  const ctx = vm.createContext(win);
  vm.runInContext(fs.readFileSync(path.join(JS, 'legendary-data.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(JS, 'render-catologo.js'), 'utf8'), ctx);
  nodes.legendaryModeContent = el('legendaryModeContent');
  return { r: registro.r, items: win.LegendaryCatalog.items, calls, nodes, state, A: win.LegendaryCatalogUI._arm };
}
const rows = (h) => [...h.matchAll(/<li class="arm-qrow" data-qid="(\d+)"( data-top="1")?>/g)];

test('Mi cola: lista numerada en el orden de la cola, sin los filtros del catálogo', () => {
  const q = [30703, 30684, 30689, 30698];
  const x = cargar({ queue: q, owned: { 30689: 1 } });
  const h = x.r.filterBar({}, x.items);
  assert.match(h, /data-arm-tab="progress" aria-current="page">Mi cola<span>4 de 5<\/span>/);
  assert.doesNotMatch(h, /lt-filter-bar|data-ftype=|armSearch/, 'en la cola no hay filtros ni buscador');
  assert.match(h, /<section class="arm-qview" aria-labelledby="armQTitle"><h3 class="arm-sec" id="armQTitle">Tu cola <span>· 4 de 5<\/span><\/h3><ol class="arm-qlist">/);
  const r = rows(h);
  assert.deepEqual(r.map((m) => Number(m[1])), q, 'el orden es el de la cola, no el alfabético');
  assert.deepEqual(r.map((m) => !!m[2]), [true, true, true, false], 'las 3 primeras, destacadas');
  assert.match(h, /<span class="arm-qpos" aria-hidden="true">1<\/span>/);
  assert.match(h, /<b class="arm-qname">Colmilloescarcha<\/b><p class="arm-cmeta">[^]*?Hacha · Gen 1 · Clásico<\/p>/);
  assert.match(h, /data-arm-qopen="30703">Ver receta y materiales<\/button>/);
  assert.match(h, /data-arm-qrm="30703" aria-label="Quitar [^"]+ de tu cola">Quitar<\/button>/);
  assert.match(h, /data-qid="30689"[^]*?<span class="arm-own">✓ La tengo<\/span>/);
  assert.match(h, /<p class="arm-note">Te queda 1 lugar\. Sumá legendarias desde el catálogo con «\+ A la cola»\./);
  assert.doesNotMatch(h, /lt-queue-row|Cola de crafteo/, 'mis filas no se confunden con las del panel viejo');
});

test('Mi cola: vacía, con lugares, completa; ids que ya no están en el catálogo se saltan', () => {
  const v = cargar({ queue: [] });
  const h = v.r.filterBar({}, v.items);
  assert.match(h, /Tu cola <span>· 0 de 5<\/span>/);
  assert.match(h, /<p>Tu cola está vacía\.<\/p><p>Sumá hasta 5 legendarias desde el catálogo con «\+ A la cola»: acá las tenés a mano, con su receta\.<\/p><button type="button" class="arm-btn arm-btn--pri" data-arm-tab="catalog">Ir al catálogo<\/button>/);
  const dos = cargar({ queue: [999999999, 30684, 30703] });
  const h2 = dos.r.filterBar({}, dos.items);
  assert.equal(rows(h2).length, 2);
  assert.doesNotMatch(h2, /999999999/);
  assert.match(h2, /Te quedan 3 lugares\./);
  assert.match(h2, /≈ Precio de referencia del bazar del 2026-10-02, no en vivo\./);
  const llena = cargar({ queue: [30684, 30703, 30689, 30698, 30704] });
  assert.match(llena.r.filterBar({}, llena.items), /Tu cola está completa: para sumar otra, quitá una\./);
  const sinPrecio = cargar({ queue: [30684], owned: { 30684: 1 } });
  assert.doesNotMatch(sinPrecio.r.filterBar({}, sinPrecio.items), /Precio de referencia/, 'sin precios a la vista, sin la nota');
});

test('Ver receta abre la ficha; Quitar saca de la cola, repinta, avisa y deja el foco en su lugar', () => {
  const x = cargar({ queue: [30684, 30703, 30689] });
  x.r.filterBar({}, x.items);
  const c = x.nodes.legendaryModeContent;
  const click = c.listeners.click[0].f;
  const btn = (k, v) => ({ getAttribute: (a) => (a === k ? v : null), parentNode: c });
  click({ target: btn('data-arm-qopen', '30703') });
  const q2 = el('q2'); const q3 = el('q3');
  c.querySelectorAll = (sel) => (sel === '[data-arm-qrm]' ? [q2, q3] : []);
  c.querySelector = () => null;
  click({ target: btn('data-arm-qrm', '30703') });
  assert.deepEqual(JSON.parse(JSON.stringify(x.calls)), [['open', '30703'], ['toggle', '30703'], ['setMode', 'progress']]);
  assert.deepEqual(x.state.queue, [30684, 30689]);
  assert.equal(q3.focused, true, 'el foco va al «Quitar» que quedó en el mismo lugar');
  const live = x.nodes.armLive;
  assert.equal(live.textContent, 'Quitaste Amanecer de tu cola. Quedan 2.');
  assert.deepEqual(live.attrs, { role: 'status', 'aria-live': 'polite' });
  // La última: el foco cae en el «Quitar» anterior; sin ninguno, en «Ir al catálogo».
  c.querySelectorAll = () => [q2];
  click({ target: btn('data-arm-qrm', '30689') });
  assert.equal(q2.focused, true);
  assert.equal(live.textContent, 'Quitaste Eternidad de tu cola. Queda 1.');
  const ir = el('ir');
  c.querySelectorAll = () => [];
  c.querySelector = (sel) => (sel === '[data-arm-tab="catalog"].arm-btn' ? ir : null);
  click({ target: btn('data-arm-qrm', '30684') });
  assert.equal(ir.focused, true);
  const n = x.calls.length;
  click({ target: btn('data-arm-qrm', '12345') });
  assert.equal(x.calls.length, n + 1, 'si no estaba, no repinto');
});

test('mi línea: una sola, sobre la Armería, y nada cuando la cabecera ya lo dice', () => {
  const { A } = cargar();
  const sum = (owned, queue) => ({ total: 206, owned, queue, max: 5 });
  const st = (o) => Object.assign({ token: 'K', loading: false, error: null }, o);
  assert.equal(A.voice(st(), sum(34, 2)), 'Tenés 34 de 206. En tu cola hay 2: abrí una para ver qué materiales te faltan.');
  assert.equal(A.voice(st(), sum(34, 1)), 'Tenés 34 de 206. En tu cola hay 1: abrí una para ver qué materiales te faltan.');
  assert.equal(A.voice(st(), sum(0, 0)), 'Tenés 0 de 206. Abrí cualquier legendaria y sumala a tu cola: te muestro la receta y lo que te falta.');
  assert.match(A.voice(st(), sum(206, 0)), /^Tenés las 206\. /);
  assert.equal(A.voice(st({ token: null }), sum(0, 0)), '');
  assert.equal(A.voice(st({ loading: true }), sum(0, 0)), '');
  assert.equal(A.voice(null, sum(0, 0)), '');
  assert.equal(A.voice(st({ error: 'Error: HTTP 403 requires scope unlocks' }), sum(0, 0)),
    'Tu Key no me deja ver tu armería: le falta el permiso «desbloqueos». Te explico cómo arreglarlo en Inicio.');
  assert.equal(A.voice(st({ error: 'HTTP 500' }), sum(0, 0)),
    'No pude leer tu armería. Probá «↻ Actualizar» en un rato; si sigue, revisá tu Key en Inicio.');
  for (const t of [A.voice(st(), sum(3, 2)), A.voice(st(), sum(3, 0))]) {
    assert.doesNotMatch(t, /evento|meta|timer|oro|te conviene|precio/i, 'N1–N2: nada de recomendaciones ni otros módulos');
  }
});

test('mi línea en la cabecera: con mi avatar si está, una vez, y en las dos pestañas', () => {
  const x = cargar({ queue: [30684], avatar: AVATAR, mode: 'catalog' });
  const h = x.r.filterBar({}, x.items);
  assert.equal((h.match(/class="arm-voice"/g) || []).length, 1);
  assert.match(h, /<\/div><aside class="arm-voice" aria-label="Shiruvana"><img src="data:image\/webp;base64,UklGRgAAAA" alt="" width="32" height="32"><p><b>Shiruvana<\/b> · Tenés 0 de 206\. En tu cola hay 1: [^<]+<\/p><\/aside><\/section>/);
  const p = cargar({ queue: [], avatar: 'javascript:alert(1)' });
  const hp = p.r.filterBar({}, p.items);
  assert.match(hp, /<aside class="arm-voice" aria-label="Shiruvana"><p><b>Shiruvana<\/b> · /, 'un avatar que no es una imagen no entra');
  assert.doesNotMatch(cargar({ token: null }).r.filterBar({}, x.items), /arm-voice/);
});

test('estilos: el panel viejo queda oculto, mi línea no va en el celular, 44 px y sin colores fijos en el texto', () => {
  const { A } = cargar();
  const css = A.CSS;
  assert.match(css, /\.arm-qview~\*\{display:none!important\}/);
  assert.match(css, /@media \(max-width:900px\)\{\.arm-filters[^\n]*\.arm-voice\{display:none\}\}/);
  assert.match(css, /@media \(max-width:900px\)\{[^\n]*\.arm-tab,\.arm-btn,\.arm-search\{min-height:44px\}/);
  assert.match(css, /@media \(max-width:560px\)\{\.arm-qrow\{flex-wrap:wrap\}\.arm-qacts\{width:100%\}/);
  assert.match(css, /\.arm-qrow\[data-top\]\{border-left-color:#E545CA\}/);
  assert.doesNotMatch(css, /(?:^|[;{])color:#/);
});
