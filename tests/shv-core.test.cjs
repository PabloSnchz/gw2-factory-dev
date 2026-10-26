// BL-059 SHV-1: el formato común de lo que observo (js/shv-core.js) y la línea «Lo sé por» de mi voz.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, msg);

// DOM mínimo: crear nodos, leer clases y atributos, buscar por clase.
function makeDoc() {
  const byId = {};
  function el(tag) {
    const node = {
      tagName: tag.toUpperCase(), children: [], attrs: {}, className: '', textContent: '', parentNode: null,
      appendChild(c) { c.parentNode = this; this.children.push(c); if (c.id) byId[c.id] = c; return c; },
      setAttribute(k, v) { this.attrs[k] = String(v); },
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      querySelector(sel) { return all(this).slice(1).find((n) => (' ' + n.className + ' ').includes(' ' + sel.slice(1) + ' ')) || null; },
    };
    return node;
  }
  return { head: el('head'), documentElement: el('html'), createElement: el, getElementById: (id) => byId[id] || null };
}
const all = (node) => [node].concat(...node.children.map(all));
const find = (node, cls) => all(node).find((n) => (' ' + n.className + ' ').includes(' ' + cls + ' '));

function load() {
  const window = { console: { info() {} } };
  vm.runInNewContext(read('js/shiruvana.js'), { window, globalThis: {} });
  vm.runInNewContext(read('js/shv-core.js'), { window, globalThis: {} });
  return window;
}

const OBS = { module: 'cartera', id: 'x', priority: 'media', kind: 'recomienda', text: 'Hola', basis: { source: 'tu Cartera', at: null } };

test('sin fundamento, sin módulo o sin texto no hablo', () => {
  const C = load().ShvCore;
  assert.equal(C.observation({ ...OBS, basis: null }), null);
  assert.equal(C.observation({ ...OBS, basis: { source: '' } }), null);
  assert.equal(C.observation({ ...OBS, module: '' }), null);
  assert.equal(C.observation({ ...OBS, text: [] }), null);
  assert.equal(C.observation(null), null);
});

test('normaliza: tipo y prioridad desconocidos caen en «explica» y «baja»; el texto siempre es una lista', () => {
  const C = load().ShvCore;
  same(C.observation({ module: 'm', text: 'a', kind: 'grita', priority: 'urgente', basis: { source: 's', at: 'ayer' } }),
    { module: 'm', id: 'm', priority: 'baja', kind: 'explica', text: ['a'], action: null, basis: { source: 's', at: null } });
  same(C.observation({ ...OBS, action: { label: 'Ir', act: 'go' } }).action, { label: 'Ir', act: 'go', href: null });
  assert.equal(C.observation({ ...OBS, action: { act: 'go' } }).action, null, 'una acción sin rótulo no se muestra');
});

test('una sola por lugar: gana la de mayor prioridad y, a igual prioridad, la primera', () => {
  const C = load().ShvCore;
  const list = [
    { ...OBS, id: 'b1', priority: 'baja' },
    { ...OBS, id: 'm1', priority: 'media' },
    { ...OBS, id: 'sin', priority: 'alta', basis: null },
    { ...OBS, id: 'm2', priority: 'media' },
  ];
  assert.equal(C.pick(list).id, 'm1');
  assert.equal(C.pick([...list, { ...OBS, id: 'a1', priority: 'alta' }]).id, 'a1');
  assert.equal(C.pick([]), null);
  assert.equal(C.pick(null), null);
});

test('cuándo: hoy, ayer, fecha o «en este navegador» si no hay hora', () => {
  const C = load().ShvCore;
  const now = new Date(2026, 9, 26, 15, 0).getTime();
  assert.equal(C.when(new Date(2026, 9, 26, 14, 5).getTime(), now), 'hoy 14:05');
  assert.equal(C.when(new Date(2026, 9, 25, 9, 30).getTime(), now), 'ayer 09:30');
  assert.equal(C.when(new Date(2026, 9, 3, 18, 0).getTime(), now), '03/10 18:00');
  assert.equal(C.when(null, now), 'en este navegador');
  assert.equal(C.when(NaN, now), 'en este navegador');
  assert.equal(C.basisText({ source: 'tu Cartera', at: new Date(2026, 9, 26, 14, 5).getTime() }, now), 'tu Cartera · hoy 14:05');
  assert.equal(C.basisText(null), '');
});

test('mi voz dibuja «Lo sé por: …» como texto, y sin basis no agrega la línea', () => {
  const w = load();
  const doc = makeDoc();
  const box = w.Shiruvana.voice({ kind: 'explica', text: 'x', basis: '<b>tu Cartera</b> · hoy 14:05', doc });
  assert.equal(find(box, 'shv-voice__basis').textContent, 'Lo sé por: <b>tu Cartera</b> · hoy 14:05');
  assert.equal(find(w.Shiruvana.voice({ kind: 'explica', text: 'x', doc }), 'shv-voice__basis'), undefined);
  assert.match(w.Shiruvana.CSS, /\.shv-voice__basis\{[^}]*color:var\(--tx-2/);
  assert.equal(w.Shiruvana.version, '1.1.0');
});

test('render: voz + fundamento + botón que atiende el módulo dueño (o enlace)', () => {
  const w = load();
  const doc = makeDoc();
  const el = w.ShvCore.render({ ...OBS, action: { label: 'Revisar Keys', act: 'keys' } }, { doc });
  assert.equal(el.getAttribute('data-shv-obs'), 'cartera:x');
  assert.equal(el.getAttribute('data-voice'), 'recomienda');
  assert.equal(find(el, 'shv-voice__basis').textContent, 'Lo sé por: tu Cartera · en este navegador');
  const btn = find(el, 'shv-obs__btn');
  assert.equal(btn.tagName, 'BUTTON');
  assert.equal(btn.getAttribute('data-shv-act'), 'keys');
  assert.equal(btn.textContent, 'Revisar Keys');
  assert.ok(doc.getElementById('shv-core-css'), 'agrega sus estilos una vez');
  const link = find(w.ShvCore.render({ ...OBS, action: { label: 'Guía', href: 'docs/user-guide.html' } }, { doc }), 'shv-obs__btn');
  assert.equal(link.tagName, 'A');
  assert.equal(link.getAttribute('href'), 'docs/user-guide.html');
  assert.equal(w.ShvCore.render({ ...OBS, basis: null }, { doc }), null, 'sin fundamento no dibujo nada');
  assert.ok(find(el, 'shv-voice__avatar'), 'con avatar por defecto');
  assert.equal(find(w.ShvCore.render(OBS, { doc, avatar: false }), 'shv-voice__avatar'), undefined, 'segundo mensaje sin avatar');
});

test('estilos solo con colores del theme y sin HTML armado a mano', () => {
  const src = read('js/shv-core.js');
  const C = load().ShvCore;
  assert.equal(C.CSS.match(/#[0-9a-fA-F]{3,8}\b/g), null);
  assert.ok(!/innerHTML/.test(src), 'el texto entra como texto');
  assert.ok(!/localStorage|Storage\.set|fetch\(|GW2Api/.test(src), 'no guarda ni pide nada');
});

test('el manifiesto carga shv-core antes que shv-wallet', () => {
  const list = JSON.parse(read('js/modules.json')).modules.map((m) => m.src);
  const a = list.indexOf('js/shv-core.js'), b = list.indexOf('js/shv-wallet.js');
  assert.ok(a >= 0 && b > a, 'shv-core.js y después shv-wallet.js');
});
