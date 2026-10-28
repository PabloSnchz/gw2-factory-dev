// BL-082 BLD-4 y BLD-6: ficha (js/bld-show.js), Importar (js/bld-import.js) y Mis builds (js/bld-store.js). Sin red.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
globalThis.GNBldCode = require('../js/bld-code.js');
const S = require('../js/bld-show.js');
const I = require('../js/bld-import.js');
const T = require('../js/bld-store.js');
const THIEF = '[&DQUAAAAAAAAkDyQPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLwBVAAA=]';
const GUARD = '[&DQEbNxAZKgoDAQMBihKKEv4S/hJ6FnoWtRIAAAAAAAAAAAAAAAAAAAAAAAA=]';

test('versiones en la cabecera', () => {
  for (const [f, m] of [['bld-show.js', S], ['bld-import.js', I], ['bld-store.js', T]]) {
    assert.match(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), /Versión: 1\.0\.0 /, f);
    assert.equal(m.version, '1.0.0');
  }
});

const VIEW = { profession: 5, profName: 'Ladrón', profIcon: 'https://render.guildwars2.com/file/X/1.png',
  specs: [{ id: 1, name: 'Artes <b>', icon: '', elite: false, traits: [{ id: 1, name: 'R1', icon: '', description: '<c=@x>hola</c>' }, null, null], minor: [] },
    { id: 0 }, { id: 58, name: 'Francotirador', icon: '', elite: true, traits: [null, null, null], minor: [] }],
  land: [{ id: 1, name: 'Cura', icon: 'javascript:alert(1)' }, null, null, null, null], water: [null, null, null, null, null],
  pets: null, legends: null, weapons: [{ id: 47, name: 'Daga' }], overrides: [] };

test('ficha: líneas, barra, armas, validación y acciones; todo escapado', () => {
  const h = S.detailHTML(VIEW, { code: THIEF, checks: [{ level: 'err', msg: '<x>' }] });
  assert.match(h, /Artes &lt;b&gt;/);
  assert.match(h, /title="hola"/, 'las etiquetas del juego se sacan de la descripción');
  assert.match(h, /Línea 2 vacía/);
  assert.match(h, /élite/);
  assert.match(h, /Daga/);
  assert.match(h, /✗ &lt;x&gt;/);
  assert.doesNotMatch(h, /javascript:/, 'solo íconos de render.guildwars2.com o del repo');
  assert.doesNotMatch(h, /Bajo el agua/, 'sin barra de agua si está vacía');
  for (const a of ['copy', 'share', 'gw2skills', 'save', 'edit']) assert.match(h, new RegExp('data-bld-act="' + a + '"'));
  assert.match(S.detailHTML(VIEW, { checks: [] }), /✓ Válida/);
});

test('importar: acepta el código del juego y rechaza lo demás con un mensaje claro', () => {
  assert.equal(I._pure.parseAny(THIEF).ok, true);
  assert.equal(I._pure.parseAny('  ' + GUARD + ' ').build.profession, 1);
  const bad = I._pure.parseAny('AE2:xxx');
  assert.equal(bad.ok, false, 'AE2 sin su módulo: no se adivina');
  assert.match(I._pure.formHTML(), /<label for="bldImpText">/);
});

test('importar: resuelve con bld-ref (simulado) y muestra la validación', async () => {
  let painted = '';
  const host = { innerHTML: '', querySelector: (sel) => (sel === '#bldImpOut' ? { set innerHTML(v) { painted = v; } } : null) };
  let loaded = 0;
  const ctx = { host, ref: { load: async (p) => { loaded = p; return {}; }, resolve: () => VIEW, check: () => [{ level: 'warn', msg: 'aviso' }] }, toast() {} };
  globalThis.GNBldShow = S;
  I._pure.read(ctx, 'cualquier cosa');
  assert.match(painted, /role="alert"/);
  assert.match(painted, /no parece un código del juego/);
  await I._pure.read(ctx, THIEF);
  assert.equal(loaded, 5, 'pide los datos de la profesión del código');
  assert.match(painted, /Francotirador/);
  assert.match(painted, /! aviso/);
  assert.match(painted, /data-bld-act="copy"/);
  const dup = '[&DQg1OSc5AjkAAAAAmQEAAJkBAAAAAJkBAAAAAAAAAAAAAAAAAAAAAAAAAAA=]';
  await I._pure.read(ctx, dup);
  assert.match(painted, /La misma habilidad está dos veces en la barra: el juego no carga ese código/);
  ctx.ref.load = async () => { throw new Error('sin red.'); };
  await I._pure.read(ctx, THIEF);
  assert.match(painted, /no pude traer los nombres: sin red\./);
  delete globalThis.GNBldShow;
});

test('Mis builds: guarda, no duplica, edita, duplica y borra; valida el código', () => {
  const mem = new Map();
  globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)) };
  assert.equal(T.list().length, 0);
  const a = T.save({ code: THIEF, title: '  Ladrón rifle  ', notes: 'x'.repeat(2000) });
  assert.ok(a.ok && !a.dup);
  assert.equal(T.get(a.id).title, 'Ladrón rifle');
  assert.equal(T.get(a.id).notes.length, 1000);
  assert.equal(T.get(a.id).profession, 5);
  assert.ok(T.save({ code: THIEF }).dup, 'el mismo código no se guarda dos veces');
  assert.equal(T.save({ code: 'hola' }).ok, false);
  const b = T.save({ code: GUARD });
  assert.equal(T.get(b.id).title, 'Guardián · mía');
  assert.ok(T.update(a.id, { title: 'Nuevo', code: GUARD }).ok);
  assert.equal(T.get(a.id).profession, 1);
  assert.equal(T.update(a.id, { code: 'x' }).ok, false);
  const c = T.duplicate(b.id);
  assert.ok(c.ok);
  assert.equal(T.get(c.id).title, 'Guardián · mía (copia)');
  assert.equal(T.list().length, 3);
  assert.ok(T.remove(c.id).ok);
  assert.equal(T.remove('nada').ok, false);
  assert.equal(JSON.parse(mem.get('gn:builds:mine')).length, 2, 'clave gn: para que viaje en el respaldo');
  mem.set('gn:builds:mine', '{roto');
  assert.deepEqual(T.list(), [], 'datos rotos: lista vacía, no rompe');
  delete globalThis.localStorage;
});

test('acciones: copiar y guardar desde la ficha avisan con un mensaje', async () => {
  const msgs = [];
  const prevNav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText: async () => {} } }, configurable: true, writable: true });
  const ctx = { toast: (m, k) => msgs.push(k + ':' + m), shareUrl: (c) => 'u#' + c, store: { save: () => ({ ok: true, dup: false }) }, go: (t, a) => msgs.push('go:' + t + ':' + a) };
  await S.act('copy', () => ({ code: THIEF }), ctx);
  await S.act('share', () => ({ code: THIEF }), ctx);
  S.act('save', () => ({ code: THIEF, title: 't' }), ctx);
  S.act('edit', () => ({ code: THIEF }), ctx);
  assert.match(msgs[0], /^ok:Código copiado/);
  assert.match(msgs[1], /^ok:Enlace copiado/);
  assert.equal(msgs[2], 'ok:Guardada en Mis builds.');
  assert.equal(msgs[3], 'go:editor:' + THIEF.slice(2, -1));
  if (prevNav) Object.defineProperty(globalThis, 'navigator', prevNav); else delete globalThis.navigator;
});
