// Cámara del Brujo (BL-064, CAM-3): el menú «Gestionar» de la Tienda.
// Acciones masivas con confirmación y «Deshacer» durante 10 segundos (js/wv-shop-manage.js).
// Corre con: node --test tests/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'wv-shop-manage.js'), 'utf8');
const J = (v) => JSON.parse(JSON.stringify(v));

function load() {
  const timers = [];
  const win = {
    console: { info() {} }, Promise, Object, Array, String, Number, JSON,
    setInterval: (f) => { timers.push(f); return timers.length; },
    clearInterval: (id) => { timers[id - 1] = null; }
  };
  win.window = win;
  vm.runInContext(SRC, vm.createContext(win));
  return { M: win.WVShopManage, timers };
}

// Un host para la barra de deshacer, con sus dos hijos.
function undoHost() {
  const kids = { '[data-wvs-undo]': { listeners: [], addEventListener(t, f) { this.listeners.push(f); } }, '[data-wvs-left]': { textContent: '' } };
  return { _h: '', get innerHTML() { return this._h; }, set innerHTML(v) { this._h = v; }, querySelector: (s) => kids[s] || null, kids };
}

function ctxFor(opts = {}) {
  const calls = [];
  const pins = J(opts.pins || { 'AAAA…ZZZZ': { 1: 1, 2: 1 }, 'BBBB…YYYY': { 2: 1 }, 'CCCC…XXXX': {} });
  const ok = () => Promise.resolve();
  const store = {
    getPinned: (y, s, fp) => Object.assign({}, pins[fp] || {}),
    setPinned: (y, s, fp, p) => { calls.push(['setPinned', fp, J(p)]); Object.keys(p).forEach((k) => { pins[fp] = pins[fp] || {}; pins[fp][k] = 1; }); return ok(); },
    delPinned: (y, s, fp, ids) => { calls.push(['delPinned', fp, J(ids)]); ids.forEach((k) => { delete (pins[fp] || {})[k]; }); return opts.delFails ? Promise.reject(new Error('cuota')) : ok(); },
    setMarks: (y, s, fp, p) => { calls.push(['setMarks', fp, J(p)]); return ok(); }
  };
  const state = {
    merged: [
      { id: 1, purchased: 3, purchase_limit: 3 }, { id: 2, purchased: 1, purchase_limit: 5 },
      { id: 3, purchased: 0, purchase_limit: 2 }, { id: 4, purchased: 9, purchase_limit: null }
    ],
    marks: opts.marks || { 1: 2, 2: 6, 3: 1, 4: 5 }, pinned: { 1: true, 2: true }
  };
  const ctx = {
    state, fp: 'AAAA…ZZZZ', store, season: { year: 26, seq: 1 },
    accounts: [{ fp: 'AAAA…ZZZZ' }, { fp: 'BBBB…YYYY' }, { fp: 'CCCC…XXXX' }],
    render: () => calls.push(['render']), reload: () => calls.push(['reload']),
    undoHost: undoHost(), toast: (k, m) => calls.push(['toast', k, m]),
    confirm: (m) => { calls.push(['confirm', m]); return opts.answer !== false; }
  };
  return { ctx, calls, pins };
}
const tick = () => new Promise((r) => setTimeout(r, 5));

test('versión 1.0.0 y las tres acciones, la peligrosa separada y en rojo', () => {
  const { M } = load();
  assert.match(SRC, /\* Versión: 1\.0\.0 /);
  assert.deepEqual(J(M.ACTIONS).map((a) => a.id), ['sync', 'copy', 'clear']);
  const h = M.menuHTML();
  assert.match(h, /^<button type="button" role="menuitem" data-wvs-act="sync">Ajustar marcas a la API<small>Quita lo que el juego ya registró<\/small><\/button>/);
  assert.match(h, /data-wvs-act="copy">Copiar mis fijados a las otras cuentas<small>Agrega, no borra · pide confirmación<\/small>/);
  assert.match(h, /<hr><button type="button" role="menuitem" data-wvs-act="clear" class="wvs-danger">Quitar fijados de todas las cuentas…/);
  assert.equal(M._pure.UNDO_SECONDS, 10);
});

test('planes: ajustar recorta lo que la API ya vio; copiar solo agrega; quitar saca una foto', () => {
  const { M } = load();
  const P = M._pure;
  const rows = [{ id: 1, purchased: 3, purchase_limit: 3 }, { id: 2, purchased: 1, purchase_limit: 5 }, { id: 3, purchased: 0, purchase_limit: 2 }, { id: 4, purchased: 9, purchase_limit: null }];
  assert.deepEqual(J(P.planSync(rows, { 1: 2, 2: 6, 3: 1, 4: 5 })), { patch: { 1: 0, 2: 4 }, before: { 1: 2, 2: 6 }, count: 2 });
  assert.equal(P.planSync(rows, { 3: 2 }).count, 0, 'marca que todavía entra: no se toca');
  assert.deepEqual(J(P.planCopy({ 1: 1, 2: 1, 9: 0 }, 'A', { A: { 1: 1 }, B: { 2: 1 }, C: {} })), { ids: ['1', '2'], byFp: { B: ['1'], C: ['1', '2'] }, total: 3, accounts: 2 });
  assert.deepEqual(J(P.planClear({ A: { 1: 1, 2: 0 }, B: {}, C: { 5: 1 } })), { byFp: { A: ['1'], C: ['5'] }, total: 2, accounts: 2 });
});

test('Ajustar marcas: escribe, redibuja y ofrece deshacer con las marcas de antes', async () => {
  const { M, timers } = load();
  const { ctx, calls } = ctxFor();
  assert.equal(await M.run('sync', ctx), true);
  assert.deepEqual(calls.slice(0, 2), [['setMarks', 'AAAA…ZZZZ', { 1: 0, 2: 4 }], ['render']]);
  assert.deepEqual(J(ctx.state.marks), { 1: 0, 2: 4, 3: 1, 4: 5 });
  assert.match(ctx.undoHost.innerHTML, /^<div class="wvs-undo" role="status"><span>Ajusté 2 marcas a lo que ya registró la API\.<\/span><button type="button" class="wvs-btn" data-wvs-undo>Deshacer<\/button><small data-wvs-left>10 s<\/small><\/div>$/);
  ctx.undoHost.kids['[data-wvs-undo]'].listeners[0]();
  await tick();
  assert.deepEqual(calls.slice(2), [['setMarks', 'AAAA…ZZZZ', { 1: 2, 2: 6 }], ['reload'], ['toast', 'success', 'Listo: lo deshice']]);
  assert.equal(ctx.undoHost.innerHTML, '', 'la barra se va al deshacer');
  assert.equal(timers[0], null, 'y su reloj se detiene');
  const nada = ctxFor({ marks: { 3: 1 } });
  assert.equal(await M.run('sync', nada.ctx), false);
  assert.deepEqual(nada.calls, [['toast', 'info', 'No hay marcas para ajustar: la API no registró nada nuevo']]);
});

test('Copiar fijados: confirma, agrega solo lo que falta y se puede deshacer', async () => {
  const { M } = load();
  let { ctx, calls, pins } = ctxFor();
  assert.equal(await M.run('copy', ctx), true);
  assert.equal(calls[0][0], 'confirm');
  assert.match(calls[0][1], /^¿Copiar tus 2 fijados a 2 cuentas más\?\n\nSolo se agregan: no se borra nada\. Vas a poder deshacerlo durante 10 segundos\.$/);
  assert.deepEqual(calls.slice(1, 3), [['setPinned', 'BBBB…YYYY', { 1: true }], ['setPinned', 'CCCC…XXXX', { 1: true, 2: true }]]);
  assert.deepEqual(calls[3], ['toast', 'success', 'Copié 3 fijados a 2 cuentas']);
  ctx.undoHost.kids['[data-wvs-undo]'].listeners[0]();
  await tick();
  assert.deepEqual(J(pins), { 'AAAA…ZZZZ': { 1: 1, 2: 1 }, 'BBBB…YYYY': { 2: 1 }, 'CCCC…XXXX': {} }, 'deshacer saca solo lo agregado');

  ({ ctx, calls } = ctxFor({ answer: false }));
  assert.equal(await M.run('copy', ctx), false);
  assert.deepEqual(calls.map((c) => c[0]), ['confirm'], 'si decís que no, no se escribe nada');

  ({ ctx, calls } = ctxFor({ pins: { 'AAAA…ZZZZ': { 1: 1 }, 'BBBB…YYYY': { 1: 1 }, 'CCCC…XXXX': { 1: 1, 7: 1 } } }));
  assert.equal(await M.run('copy', ctx), false);
  assert.deepEqual(calls, [['toast', 'info', 'Las otras cuentas ya tienen todos tus fijados']]);
});

test('Quitar fijados de todas las cuentas: confirma, quita, y «Deshacer» los devuelve tal cual', async () => {
  const { M, timers } = load();
  const { ctx, calls, pins } = ctxFor();
  assert.equal(await M.run('clear', ctx), true);
  assert.match(calls[0][1], /^¿Quitar 3 fijados de 2 cuentas en esta temporada\?\n\nVas a poder deshacerlo durante 10 segundos\.$/);
  assert.deepEqual(calls.slice(1, 4), [['delPinned', 'AAAA…ZZZZ', ['1', '2']], ['delPinned', 'BBBB…YYYY', ['2']], ['render']]);
  assert.deepEqual(J(ctx.state.pinned), {}, 'la cuenta que estás mirando queda sin fijados en pantalla');
  assert.match(ctx.undoHost.innerHTML, /<span>Quité 3 fijados de 2 cuentas\.<\/span>/);
  for (let i = 0; i < 3; i++) timers[0]();
  assert.equal(ctx.undoHost.kids['[data-wvs-left]'].textContent, '7 s', 'cuenta regresiva');
  ctx.undoHost.kids['[data-wvs-undo]'].listeners[0]();
  await tick();
  assert.deepEqual(J(pins), { 'AAAA…ZZZZ': { 1: 1, 2: 1 }, 'BBBB…YYYY': { 2: 1 }, 'CCCC…XXXX': {} });
  assert.deepEqual(calls.slice(-2), [['reload'], ['toast', 'success', 'Listo: lo deshice']]);
});

test('el «Deshacer» vence a los 10 segundos', async () => {
  const { M, timers } = load();
  const { ctx } = ctxFor();
  await M.run('clear', ctx);
  for (let i = 0; i < 10; i++) if (timers[0]) timers[0]();
  assert.equal(ctx.undoHost.innerHTML, '');
  assert.equal(timers[0], null);
});

test('errores: sin almacén no hace nada; si falla a mitad, avisa y relee', async () => {
  const { M } = load();
  let { ctx, calls } = ctxFor();
  ctx.store = null;
  assert.equal(await M.run('clear', ctx), false);
  assert.deepEqual(calls, [['toast', 'error', 'No pude abrir las marcas de esta temporada']]);
  ({ ctx, calls } = ctxFor({ delFails: true }));
  assert.equal(await M.run('clear', ctx), false);
  assert.deepEqual(calls.slice(-2), [['toast', 'error', 'No se pudo completar: cuota'], ['reload']]);
  assert.equal(ctx.undoHost.innerHTML, '', 'sin deshacer falso');
  assert.equal(await M.run('nada', ctx), false);
});
