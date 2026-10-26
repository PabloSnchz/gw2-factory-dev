// Cargador de módulos nuevos (DEC-035, BL-065 FP-4). Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'boot.js'), 'utf8');

// Documento de mentira: scripts con atributos, head, eventos.
function fakeDoc(existing) {
  const scripts = (existing || []).map((src) => ({ getAttribute: (k) => (k === 'src' ? src : null) }));
  const events = [];
  const head = { appended: [], appendChild(n) { this.appended.push(n); scripts.push(n); } };
  return {
    head, events,
    getElementsByTagName: () => scripts,
    createElement: () => {
      const a = {};
      return { setAttribute: (k, v) => { a[k] = v; }, getAttribute: (k) => (k in a ? a[k] : null), attrs: a };
    },
    dispatchEvent: (e) => { events.push(e); return true; }
  };
}
function load(win) {
  win = Object.assign({ console: { warn() {}, info() {} } }, win || {});
  new Function('window', SRC)(win);
  return win;
}
const B = load().GNBoot;
const res = (status, body) => ({ ok: status === 200, status, json: async () => (typeof body === 'string' ? JSON.parse(body) : body) });

test('versión y manifiesto', () => {
  assert.equal(B.version, '1.1.0');
  assert.match(SRC, /\* Versión: 1\.1\.0\n/);
  assert.equal(B.manifest, 'js/modules.json');
});

test('el manifiesto del repo es válido y cada módulo existe', () => {
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8'));
  assert.equal(m.version, 1);
  const p = B.plan(m);
  assert.deepEqual(p.errors, []);
  for (const x of p.list) assert.ok(fs.existsSync(path.join(ROOT, x.src)), 'el módulo existe: ' + x.src);
});

test('plan: solo js/ propios con versión; malas entradas se saltean con motivo', () => {
  const p = B.plan({ modules: [
    { src: 'js/uno.js', v: '1.0.0' },
    { src: 'js/dos-b.js', v: '2.10.3' },
    { src: '../x.js', v: '1.0.0' },
    { src: 'https://evil.example/x.js', v: '1.0.0' },
    { src: 'js/sub/x.js', v: '1.0.0' },
    { src: 'js/Mayus.js', v: '1.0.0' },
    { src: 'js/boot.js', v: '1.0.0' },
    { src: 'js/tres.js', v: '1.0' },
    { src: 'js/uno.js', v: '1.0.1' },
    null
  ] });
  assert.deepEqual(p.list, [{ src: 'js/uno.js', v: '1.0.0' }, { src: 'js/dos-b.js', v: '2.10.3' }]);
  assert.deepEqual(p.errors, [
    'modules[2]: src no permitido (../x.js)',
    'modules[3]: src no permitido (https://evil.example/x.js)',
    'modules[4]: src no permitido (js/sub/x.js)',
    'modules[5]: src no permitido (js/Mayus.js)',
    'modules[6]: el cargador no se carga a sí mismo',
    'modules[7]: versión inválida en js/tres.js',
    'modules[8]: js/uno.js repetido',
    'modules[9]: no es un objeto'
  ]);
  assert.deepEqual(B.plan(null).errors, ['el manifiesto no tiene "modules"']);
  assert.deepEqual(B.plan({ modules: {} }).errors, ['el manifiesto no tiene "modules"']);
  const many = Array.from({ length: 41 }, (_, i) => ({ src: 'js/m' + i + '.js', v: '1.0.0' }));
  const q = B.plan({ modules: many });
  assert.equal(q.list.length, 40);
  assert.deepEqual(q.errors, ['modules[40]: más de 40 módulos']);
});

test('inyecta en orden, con versión, async=false, y no repite lo que ya está', () => {
  const doc = fakeDoc(['js/app.js?v=2.8.0', 'js/ya.js?v=0.1.0']);
  const added = B.inject(doc, [{ src: 'js/a.js', v: '1.2.3' }, { src: 'js/ya.js', v: '1.0.0' }, { src: 'js/b.js', v: '0.0.1' }]);
  assert.deepEqual(added, ['js/a.js', 'js/b.js']);
  assert.deepEqual(doc.head.appended.map((s) => s.src), ['js/a.js?v=1.2.3', 'js/b.js?v=0.0.1']);
  assert.ok(doc.head.appended.every((s) => s.async === false));
  assert.equal(doc.head.appended[0].getAttribute('data-gn-module'), 'js/a.js');
  assert.deepEqual(B.inject(doc, [{ src: 'js/a.js', v: '9.9.9' }]), [], 'una segunda carga no duplica');
  assert.equal(B.urlOf({ src: 'js/a.js', v: '1.0.0' }), 'js/a.js?v=1.0.0');
});

test('load: pide el manifiesto sin caché, carga y avisa con gn:boot-ready', async () => {
  const calls = [];
  const doc = fakeDoc([]);
  class CE { constructor(t, o) { this.type = t; this.detail = o.detail; } }
  const w = load({ GN_BOOT_MANUAL: true, CustomEvent: CE });
  const st = await w.GNBoot.load({ document: doc, fetch: async (u, o) => { calls.push([u, o]); return res(200, { modules: [{ src: 'js/a.js', v: '1.0.0' }, { src: 'x', v: '1' }] }); } });
  assert.deepEqual(calls, [['js/modules.json', { cache: 'no-cache' }]]);
  assert.equal(st.status, 'done');
  assert.deepEqual(st.loaded, ['js/a.js']);
  assert.deepEqual(st.errors, ['modules[1]: src no permitido (x)']);
  assert.equal(doc.events.length, 1);
  assert.equal(doc.events[0].type, 'gn:boot-ready');
  assert.deepEqual(doc.events[0].detail, { loaded: ['js/a.js'], errors: ['modules[1]: src no permitido (x)'] });
});

test('load nunca rompe la Bóveda: 404, JSON roto, fetch que falla o sin fetch', async () => {
  for (const [f, re] of [
    [async () => res(404, {}), /el manifiesto respondió 404/],
    [async () => res(200, '{ roto'), /JSON|Unexpected|Expected/],
    [async () => { throw new Error('sin red'); }, /sin red/],
    [async () => null, /respondió nada/]
  ]) {
    const w = load({ GN_BOOT_MANUAL: true });
    const doc = fakeDoc([]);
    const st = await w.GNBoot.load({ document: doc, fetch: f });
    assert.equal(st.status, 'done');
    assert.match(st.errors.join(' '), re);
    assert.deepEqual(doc.head.appended, []);
  }
  const w = load({ GN_BOOT_MANUAL: true });
  const st = await w.GNBoot.load({ document: fakeDoc([]), fetch: 'no' });
  assert.deepEqual(st.errors, ['sin fetch o sin documento']);
});

test('arranca solo en el navegador, una vez; con GN_BOOT_MANUAL o sin fetch, no', async () => {
  const calls = [];
  load({ document: fakeDoc([]), fetch: async (u) => { calls.push(u); return res(200, { modules: [] }); } });
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(calls, ['js/modules.json']);
  load({ document: fakeDoc([]), fetch: async (u) => { calls.push(u); return res(200, { modules: [] }); }, GN_BOOT_MANUAL: true });
  load({ document: fakeDoc([]) });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(calls.length, 1);
});
