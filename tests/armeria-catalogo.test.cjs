// Armería (BL-064, ARM-2): filtros en una fila, tarjetas nuevas, grilla adaptable y secciones por expansión.
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const JS = path.join(__dirname, '..', 'js');

function el(id) {
  const n = { id, _h: '', listeners: {}, textContent: '', value: '' };
  Object.defineProperty(n, 'innerHTML', { get: () => n._h, set: (v) => { n._h = String(v); } });
  n.addEventListener = (t, f, cap) => { (n.listeners[t] = n.listeners[t] || []).push({ f, cap: !!cap }); };
  return n;
}

function cargar(opts = {}) {
  const registro = {};
  const calls = [];
  const nodes = {};
  const win = {
    console: { info() {}, log() {}, warn() {} },
    LegendaryTracker: {
      QUEUE_MAX: 5,
      registerRender(map) { registro.r = map; return true; },
      registerItemModal() { return true; },
      getOwnershipCounts() { return opts.own || { tengo: 3, faltan: 203 }; },
      getQueue() { return (opts.queue || []).slice(); },
      getState() {
        return { mode: 'catalog', token: opts.token === undefined ? 'KEY' : opts.token, loading: false,
          error: opts.error || null, owned: opts.owned || {} };
      },
      setFilter(k, v) { calls.push(['setFilter', k, v]); return true; }
    }
  };
  win.window = win;
  win.document = { getElementById: (id) => nodes[id] || null, createElement: () => ({}), head: { appendChild() {} } };
  win.setTimeout = setTimeout;
  const ctx = vm.createContext(win);
  vm.runInContext(fs.readFileSync(path.join(JS, 'legendary-data.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(JS, 'render-catologo.js'), 'utf8'), ctx);
  ['legendaryModeContent', 'armGridHost', 'armSearchLive'].forEach((id) => { nodes[id] = el(id); });
  return { r: registro.r, items: win.LegendaryCatalog.items, calls, nodes, A: win.LegendaryCatalogUI._arm };
}
const bar = (html) => html.slice(html.indexOf('<div class="lt-filter-bar'));
const card = (html, id) => {
  const i = html.indexOf('<article class="card lt-item-card" data-id="' + id + '"');
  return i === -1 ? '' : html.slice(i, html.indexOf('</article>', i) + 10);
};

test('filtros: una sola fila, sin los rótulos crípticos, con «Todas / Las tengo / Me faltan»', () => {
  const x = cargar();
  const h = bar(x.r.filterBar({}, x.items));
  assert.equal((h.match(/class="lt-filter-bar arm-filters"/g) || []).length, 1);
  assert.doesNotMatch(h, />(Tipo|Gen|Exp|Yo):</);
  assert.match(h, /data-ftype="ownership" data-fvalue="" aria-pressed="true">Todas</);
  assert.match(h, /data-fvalue="tengo" aria-pressed="false">Las tengo · 3</);
  assert.match(h, /data-fvalue="faltan" aria-pressed="false">Me faltan · 203</);
  assert.match(h, /data-ftype="type" data-fvalue="weapon" aria-pressed="false">Arma \(57\)</);
  assert.doesNotMatch(h, /Limpiar/, 'sin filtros no hay «Limpiar»');
  // El tracker lee el atributo de e.target sin subir: un botón de filtro no puede tener elementos adentro.
  for (const m of h.matchAll(/<button[^>]*data-ftype[^>]*>([\s\S]*?)<\/button>/g)) assert.doesNotMatch(m[1], /</, m[1]);
});

test('filtros: el activo se marca y aparece «Limpiar»; expansión y generación son listas', () => {
  const x = cargar();
  const h = bar(x.r.filterBar({ type: 'armor', expansion: 'HoT', generation: '2', ownership: 'faltan' }, x.items));
  assert.match(h, /data-fvalue="armor" aria-pressed="true"/);
  assert.match(h, /data-fvalue="faltan" aria-pressed="true"/);
  assert.match(h, /data-fvalue="" aria-pressed="false">Todas</);
  assert.match(h, /<label for="armF-expansion">Expansión<\/label><select id="armF-expansion" class="arm-select" data-arm-filter="expansion"><option value="">Todas<\/option>/);
  assert.match(h, /<option value="HoT" data-ftype="expansion" data-fvalue="HoT" selected>Heart of Thorns \(\d+\)<\/option>/);
  assert.match(h, /<option value="2" data-ftype="generation" data-fvalue="2" selected>Gen 2 \(\d+\)<\/option>/);
  assert.equal((h.match(/ selected/g) || []).length, 2);
  assert.match(h, /data-action="clear-filters">✕ Limpiar<\/button>/);
});

test('las listas cambian el filtro por setFilter; un clic en una opción no llega al tracker', () => {
  const x = cargar();
  x.r.filterBar({}, x.items);
  const c = x.nodes.legendaryModeContent;
  assert.equal(c.listeners.change.length, 1);
  const sel = (k, v) => ({ value: v, getAttribute: (a) => (a === 'data-arm-filter' ? k : null) });
  c.listeners.change[0].f({ target: sel('expansion', 'JW') });
  c.listeners.change[0].f({ target: sel('generation', '') });
  c.listeners.change[0].f({ target: { value: 'x', getAttribute: () => null } });
  assert.deepEqual(JSON.parse(JSON.stringify(x.calls)), [['setFilter', 'expansion', 'JW'], ['setFilter', 'generation', '']]);
  const click = c.listeners.click[0];
  assert.equal(click.cap, true, 'en captura, antes que wireFilterBar');
  let stopped = 0;
  click.f({ target: { tagName: 'option', getAttribute: () => 'expansion' }, stopPropagation() { stopped++; } });
  click.f({ target: { tagName: 'SELECT', getAttribute: () => null }, stopPropagation() { stopped++; } });
  click.f({ target: { tagName: 'BUTTON', getAttribute: () => null, parentNode: c }, stopPropagation() { stopped++; } });
  assert.equal(stopped, 2);
});

test('tarjeta: artículo con el nombre como botón y la cola aparte; «La tengo» en vez de «PENDING»', () => {
  const x = cargar({ owned: { 30684: 1 }, queue: [30703] });
  const g = x.r.catalogGrid(x.items, { 30684: 1 });
  assert.doesNotMatch(g, /PENDING|lt-status-badge/);
  assert.doesNotMatch(g, /<button[^>]*>[^<]*<button/, 'nunca un botón dentro de otro');
  assert.doesNotMatch(g, /<div class="card lt-item-card/);
  const own = card(g, 30684);
  assert.match(own, /^<article class="card lt-item-card" data-id="30684" data-type="weapon" data-own="1">/);
  assert.match(own, /<img class="arm-cicon" src="[^"]+" width="44" height="44" alt=""/);
  assert.match(own, /<button type="button" class="arm-cname" title="Ver receta y materiales">Colmilloescarcha<\/button>/);
  assert.match(own, /Hacha · Gen 1<\/p>/);
  assert.match(own, /<span class="arm-own">✓ La tengo<\/span>/);
  assert.doesNotMatch(own, /data-card-queue|coin/, 'la que tengo no muestra precio ni «A la cola»');
  const q = card(g, 30703);
  assert.match(q, /data-q="1"/);
  assert.match(q, /data-card-queue="30703" aria-label="Quitar [^"]+ de tu cola" title="Quitar [^"]+ de tu cola">✓ En tu cola<\/button>/);
  const libre = x.items.find((it) => it.tpTradeable && it.tpSell > 0 && it.id !== 30684 && it.id !== 30703);
  const p = card(g, libre.id);
  assert.match(p, /<span class="lt-tp-badge arm-price" title="Precio de referencia del bazar del 2026-10-02, no en vivo">≈ <span class="coin coin--g">/);
  assert.match(p, /aria-label="Agregar [^"]+ a tu cola"[^>]*>\+ A la cola<\/button>/);
  const ligada = x.items.find((it) => !it.tpTradeable);
  assert.match(card(g, ligada.id), /<span class="arm-nosell">No se vende<\/span>/);
  assert.match(g, /<p class="arm-note">≈ Precio de referencia del bazar del 2026-10-02, no en vivo\.<\/p>/);
  assert.doesNotMatch(g, /font-size|color:#/, 'la tarjeta no trae estilos sueltos de texto');
});

test('tarjeta: qué es cada legendaria, en español', () => {
  const { A } = cargar();
  assert.equal(A.kind({ type: 'armor', subtype: 'heavy helm', generation: 3 }), 'Casco · Pesada · Gen 3');
  assert.equal(A.kind({ type: 'armor', subtype: 'light helmaquatic', generation: 2 }), 'Casco acuático · Ligera · Gen 2');
  assert.equal(A.kind({ type: 'weapon', subtype: 'greatsword', generation: 1 }), 'Mandoble · Gen 1');
  assert.equal(A.kind({ type: 'trinket', subtype: 'amulet', generation: 2 }), 'Amuleto · Gen 2');
  assert.equal(A.kind({ type: 'upgradecomponent', subtype: '', generation: null }), 'Componente');
  const { items } = cargar();
  for (const it of items) assert.doesNotMatch(A.kind(it), /\b(heavy|medium|light|helm|helmaquatic|shoulders|coat|gloves|leggings|boots|undefined)\b/, it.name + ': ' + A.kind(it));
});

test('secciones por expansión, en orden, con su avance (o sin él si no hay Key)', () => {
  const x = cargar({ owned: { 30684: 1, 30698: 1 } });
  const g = x.r.catalogGrid(x.items, { 30684: 1, 30698: 1 });
  const secs = [...g.matchAll(/<h3 class="arm-sec" id="armSec-(\w+)">([^<]+) <span>· ([^<]+)<\/span><\/h3>/g)];
  assert.deepEqual(secs.map((m) => m[1]), ['Core', 'HoT', 'PoF', 'EoD', 'SotO', 'JW', 'VoE']);
  assert.equal(secs[0][2], 'Clásico');
  assert.match(secs[0][3], /^tenés 2 de \d+$/);
  const total = secs.reduce((a, m) => a + Number(m[3].match(/de (\d+)/)[1]), 0);
  assert.equal(total, 206);
  assert.equal((g.match(/<section class="arm-section" aria-labelledby="armSec-/g) || []).length, 7);
  const sin = cargar({ token: null });
  assert.match(sin.r.catalogGrid(sin.items, {}), /id="armSec-JW">Janthir Wilds <span>· 2 legendarias<\/span>/);
  const err = cargar({ error: 'HTTP 500' });
  assert.doesNotMatch(err.r.catalogGrid(err.items, {}), /tenés 0/, 'si la API falló no digo que no tenés ninguna');
});

test('vacío: con filtros que no dejan nada, lo dice y sugiere «Limpiar»', () => {
  const x = cargar();
  assert.match(x.r.catalogGrid([], {}), /<div class="lt-empty-state arm-empty"><p>No hay legendarias con estos filtros\.<\/p><p>Probá con «✕ Limpiar»\.<\/p><\/div>/);
});

test('estilos: grilla adaptable, una columna en el teléfono, 44 px, foco visible y sin animar si se pide', () => {
  const { A } = cargar();
  const css = A.CSS;
  assert.match(css, /\.arm-grid\{display:grid;grid-template-columns:repeat\(auto-fill,minmax\(210px,1fr\)\)/);
  assert.match(css, /@media \(max-width:560px\)\{\.arm-grid\{grid-template-columns:1fr\}\}/);
  assert.match(css, /@media \(max-width:900px\)\{\.arm-filters\{flex-wrap:nowrap;overflow-x:auto[^\n]*\.arm-chip,\.arm-select,\.arm-qbtn\{min-height:44px\}/);
  assert.match(css, /\.arm-chip:focus-visible,\.arm-select:focus-visible,\.arm-cname:focus-visible,\.arm-qbtn:focus-visible\{outline:2px solid var\(--acc-1\)/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.lt-skeleton-card,\.lt-skeleton-card \*\{animation:none!important\}\}/);
  assert.doesNotMatch(css, /(?:^|[;{])color:#/);
  assert.doesNotMatch(css, /repeat\(5/);
});
