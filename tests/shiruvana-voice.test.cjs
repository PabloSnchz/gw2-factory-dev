// Mi voz en La Bóveda (DEC-025): avatar oficial, rótulo visible, texto seguro y colores del theme activo.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'shiruvana.js'), 'utf8');

// DOM mínimo: lo justo para construir y leer el mensaje.
function makeDoc() {
  const byId = {};
  function el(tag) {
    const node = {
      tagName: tag.toUpperCase(), children: [], attrs: {}, className: '', textContent: '',
      appendChild(c) { this.children.push(c); if (c.id) byId[c.id] = c; return c; },
      setAttribute(k, v) { this.attrs[k] = String(v); },
      getAttribute(k) { return this.attrs[k]; },
    };
    return node;
  }
  const head = el('head');
  return { head, documentElement: el('html'), createElement: el, getElementById: (id) => byId[id] || null };
}

function load() {
  const window = {};
  vm.runInNewContext(SRC, { window, globalThis: {} });
  return window.Shiruvana;
}
const all = (node) => [node].concat(...node.children.map(all));
const find = (node, cls) => all(node).find((n) => (' ' + n.className + ' ').includes(' ' + cls + ' '));

test('el mensaje lleva mi avatar oficial, decorativo, y mi rótulo visible', () => {
  const S = load();
  const doc = makeDoc();
  const box = S.voice({ kind: 'saluda', text: 'Hola', doc });
  const img = find(box, 'shv-voice__avatar');
  assert.ok(img, 'tiene avatar');
  assert.match(img.src, /^data:image\/webp;base64,UklGR/);
  assert.equal(img.alt, '');
  assert.equal(img.width, 48);
  assert.equal(find(box, 'shv-voice__label').textContent, 'Shiruvana');
  assert.equal(box.tagName, 'ASIDE');
});

test('es el mismo avatar que aprobó Pablo para el panel', () => {
  const S = load();
  const panelVoice = path.join(__dirname, '..', '..', 'dash', 'gds', 'voice.js');
  if (!fs.existsSync(panelVoice)) return; // solo se compara donde está la copia del panel
  const m = fs.readFileSync(panelVoice, 'utf8').match(/SHIRUVANA_AVATAR = '([^']+)'/);
  assert.equal(S.AVATAR, m[1]);
});

test('un avatar por sección: los mensajes siguientes van sin imagen', () => {
  const S = load();
  const box = S.voice({ kind: 'explica', text: 'Segundo', avatar: false, doc: makeDoc() });
  assert.equal(find(box, 'shv-voice__avatar'), undefined);
  assert.match(box.className, /shv-voice--compact/);
});

test('el texto entra como texto: no se puede inyectar HTML', () => {
  const S = load();
  const box = S.voice({ kind: 'advierte', text: ['<img src=x onerror=alert(1)>', 'Dos'], doc: makeDoc() });
  const body = find(box, 'shv-voice__body');
  assert.equal(body.children.length, 2);
  assert.equal(body.children[0].textContent, '<img src=x onerror=alert(1)>');
  assert.ok(!SRC.includes('innerHTML'), 'el componente no usa innerHTML');
});

test('tipos: rótulo por tipo, tipo desconocido cae en "explica" y tamaño grande de 56 px', () => {
  const S = load();
  const doc = makeDoc();
  assert.equal(find(S.voice({ kind: 'recomienda', text: 'x', doc }), 'shv-voice__label').textContent, 'Shiruvana te recomienda');
  assert.equal(S.voice({ kind: 'cualquiera', text: 'x', doc }).getAttribute('data-voice'), 'explica');
  assert.equal(find(S.voice({ kind: 'saluda', text: 'x', size: 'lg', doc }), 'shv-voice__avatar').width, 56);
});

test('los estilos se agregan una sola vez y solo usan colores del theme activo', () => {
  const S = load();
  const doc = makeDoc();
  S.voice({ text: 'a', doc });
  S.voice({ text: 'b', doc });
  assert.equal(doc.head.children.filter((c) => c.id === 'shiruvana-voice-css').length, 1);
  assert.equal(S.CSS.match(/#[0-9a-fA-F]{3,8}\b/g), null, 'sin colores fijos: todo sale de var(--…)');
  for (const v of ['--text', '--acc-1', '--bg-1', '--tx-2']) assert.ok(S.CSS.includes('var(' + v), v);
});
