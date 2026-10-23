// Bienvenida 2.1.0 (WEL-2): «Seguí donde quedaste», «Tu Bóveda», permisos de Keys, copias y
// el flujo de orientación. Solo datos de este navegador; nada de un módulo en particular (DEC-032).
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'welcome-panel.js'), 'utf8');
const H = 36e5, D = 864e5, NOW = Date.parse('2026-10-23T12:00:00Z');
const ALL = ['account', 'wallet', 'progression', 'unlocks', 'inventories', 'tradingpost', 'characters'];

function el() {
  const n = { children: [], attrs: {}, hidden: false, listeners: {}, _html: '', textContent: '', className: '' };
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); if (k === 'hidden') n.hidden = true; };
  n.removeAttribute = (k) => { if (k === 'hidden') n.hidden = false; };
  n.appendChild = (c) => { c.parentNode = n; n.children.push(c); return c; };
  n.insertBefore = (c) => { c.parentNode = n; n.children.unshift(c); return c; };
  n.addEventListener = (t, f) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
  Object.defineProperty(n, 'firstChild', { get: () => n.children[0] || null });
  Object.defineProperty(n, 'innerHTML', { get: () => n._html, set: (v) => { n._html = v; } });
  n.querySelector = (s) => (s === '.panel__body' ? n.body : s === '.wl-head' ? n.children.find((c) => c.className === 'wl-head') || null : null);
  return n;
}

function load(store = {}) {
  const panel = el(); panel.body = el();
  const head = el();
  const doc = {}, win = {}, calls = [];
  const window = {
    console: { info() {}, warn() {}, log() {} },
    Storage: {
      STORAGE_KEYS: { ACCOUNT_KEYS: 'gn:account:keys', ACCOUNT_SELECTED: 'gn:account:selected', THEME: 'gn:theme' },
      get: (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
      set: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); },
    },
    SettingsManager: { exportAll: () => calls.push('export') },
    ThemeSelector: { openModal: () => calls.push('theme'), getThemes: () => [{ id: 'gato', name: 'Gato Negro' }, { id: 'nord', name: 'Nord' }] },
    location: { hash: '#/account/legendary-armory' },
    addEventListener: (t, f) => { win[t] = f; },
  };
  window.document = {
    readyState: 'complete', head,
    getElementById: (id) => (id === 'welcomePanel' ? panel : head.children.find((c) => c.id === id) || null),
    createElement: () => el(),
    addEventListener: (t, f) => { doc[t] = f; },
  };
  vm.runInNewContext(SRC, { window, Date, JSON, Promise });
  return { W: window.Welcome, P: window.Welcome._pure, store, panel, calls, doc, win };
}

const { P } = load();
const key = (label, value, perms) => (perms === undefined ? { label, value } : { label, value, perms });
// Los valores que vienen del módulo nacen en otro contexto de vm: se comparan por contenido.
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, msg);
const vault = (o) => Object.assign({ last: null, visits: {}, backupAt: 0 }, o);

test('los 7 permisos son los mismos que exige app.js al guardar una Key', () => {
  const app = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
  const block = app.slice(app.indexOf('REQUIRED_PERMISSIONS: ['), app.indexOf('],', app.indexOf('REQUIRED_PERMISSIONS: [')));
  const scopes = [...block.matchAll(/scope:\s*'([a-z]+)'/g)].map((m) => m[1]);
  same(P.SCOPES.map((s) => s.scope), scopes);
  for (const s of P.SCOPES) for (const id of s.mods) assert.ok(P.MODULES.some((m) => m.id === id), id);
});

test('estado de cada Key: completa, con permisos faltantes (y qué módulos quedan sin datos) o sin verificar', () => {
  assert.equal(P.keyStatus(key('a', 'A', ALL)).status, 'ok');
  const s = P.keyStatus(key('b', 'B', ALL.filter((x) => x !== 'inventories')));
  assert.equal(s.status, 'missing');
  same([...s.missing], ['inventarios']);
  same([...s.mods].sort(), ['armory', 'characters']);
  const u = P.keyStatus(key('c', 'C'));
  assert.equal(u.status, 'unknown', 'sin perms anotados no se sabe: nunca se la trata como mala');
});

test('copia de seguridad: sin registrar, al día (14 días) o vieja', () => {
  const m = (backupAt) => P.buildModel({ keys: [key('a', 'A', ALL)], vault: vault({ backupAt }), now: NOW }).backup;
  assert.equal(m(0).status, 'never');
  same(m(NOW - 3 * H), { status: 'ok', when: 'hace 3 h' });
  assert.equal(m(NOW - 14 * D).status, 'ok');
  same(m(NOW - 19 * D), { status: 'old', when: 'hace 19 días' });
});

test('tiempo relativo legible, sin horas del reloj', () => {
  same([0, 5 * 6e4, 2 * H, 30 * H, 3 * D].map(P.relTime), ['recién', 'hace 5 min', 'hace 2 h', 'ayer', 'hace 3 días']);
});

test('Seguí donde quedaste: último módulo y los 3 más usados, sin repetir el último ni ids desconocidos', () => {
  const v = vault({ last: { id: 'armory', at: NOW - 26 * H }, visits: { armory: 9, cards: 7, wv: 7, characters: 2, raids: 1, viejo: 99 } });
  const m = P.buildModel({ keys: [key('a', 'A', ALL)], vault: v, now: NOW });
  same(m.last, { id: 'armory', when: 'ayer' });
  same([...m.freq], ['cards', 'wv', 'characters']);
  const html = P.bodyHTML(m, []);
  assert.match(html, /class="wl-cont" href="#\/account\/legendary-armory"[^]*Última visita: ayer[^]*Continuar/);
  const vacio = P.bodyHTML(P.buildModel({ keys: [key('a', 'A', ALL)], now: NOW }), []);
  assert.match(vacio, /Todavía no anoté tus visitas/);
  assert.match(vacio, /wl-fq" href="#\/cards"/, 'sin historial sugiere por dónde empezar');
  assert.equal(P.buildModel({ keys: [key('a', 'A', ALL)], vault: vault({ last: { id: 'nada', at: NOW } }), now: NOW }).last, null);
});

test('Tu Bóveda: N de 4 listo, cada pendiente con su acción y el detalle de las Keys', () => {
  const keys = [key('Main', 'A', ALL), key('<Alt>', 'B', ALL.filter((x) => x !== 'inventories' && x !== 'characters')), key('Mula', 'C')];
  const m = P.buildModel({ keys, selected: 'B', vault: vault({ backupAt: NOW - 19 * D }), theme: { id: 'nord', name: 'Nord', count: 19 }, now: NOW });
  const html = P.headHTML(m) + P.bodyHTML(m, []);
  assert.match(html, /<b>2 de 4<\/b> listo/);
  assert.match(html, /--p:50%/);
  assert.match(html, /3 API Keys · <small>1 completa, 1 con permisos faltantes, 1 sin verificar/);
  assert.match(html, /<b>&lt;Alt&gt;<\/b>: le falta inventarios, personajes\. Sin eso quedan sin datos: Armería Legendaria, Inventario y Personajes/);
  assert.match(html, /<b>Mula<\/b>: no tengo sus permisos anotados/);
  assert.match(html, /la última fue hace 19 días<\/small><\/span><button[^>]*data-act="backup">Guardar copia/);
  assert.match(html, /Theme <b>Nord<\/b> · <small>19 disponibles[^]*data-act="theme">Cambiar/);
  assert.match(html, /Cuenta activa: <b>&lt;Alt&gt;<\/b>/);
  // Cabecera y módulos según la Key activa
  assert.match(html, /class="wl-pill is-warn" id="welcomeManageKeysBtn"[^>]*>[^]*?API Key <b>Revisar<\/b>/);
  assert.match(html, /class="wl-pill is-warn" data-act="backup"[^>]*>[^]*?Copia <b>hace 19 días<\/b>/);
  assert.match(html, /data-mod="armory"[^]*?Falta permiso<\/i>/);
  assert.match(html, /data-mod="characters"[^]*?Falta permiso<\/i>/);
  assert.doesNotMatch(html.match(/data-mod="cards"[^]*?<\/a>/)[0], /Falta permiso/);
  const todo = P.buildModel({ keys: [key('Main', 'A', ALL)], vault: vault({ backupAt: NOW - H }), now: NOW });
  const ok = P.headHTML(todo) + P.bodyHTML(todo, []);
  assert.match(ok, /<b>4 de 4<\/b> listo/);
  assert.match(ok, /1 API Key · <small>con los 7 permisos/);
  assert.match(ok, /class="wl-pill is-ok" id="welcomeManageKeysBtn"[^]*?<b>Activa<\/b>/);
  assert.doesNotMatch(ok, /Falta permiso|wl-keys/);
});

test('flujo de orientación: primero lo que se rompe, después lo que protege, después por dónde seguir', () => {
  const keys = [key('Main', 'A', ALL), key('Alt', 'B', ['account']), key('Mula', 'C')];
  const o = P.orientation(P.buildModel({ keys, vault: vault({ last: { id: 'cards', at: NOW - H } }), now: NOW }));
  same(o.map((x) => x.id), ['keys', 'backup', 'verify', 'continue']);
  same(o.map((x) => x.act || x.href), ['manage-keys', 'backup', 'manage-keys', '#/cards']);
  assert.equal(o[0].title, 'A la Key de Alt le faltan permisos');
  assert.equal(o[1].title, 'Todavía no registré ninguna copia en este navegador');
  const sano = P.orientation(P.buildModel({ keys: [key('Main', 'A', ALL)], vault: vault({ backupAt: NOW - D }), now: NOW }));
  assert.equal(sano.length, 0, 'si todo está en orden y no hay historial, no hay nada que pedirte');
  const vieja = P.orientation(P.buildModel({ keys: [key('Main', 'A', ALL)], vault: vault({ backupAt: NOW - 19 * D }), now: NOW }));
  same(vieja.map((x) => x.title), ['Tu última copia es de hace 19 días']);
  same(P.orientation(P.buildModel({ now: NOW })).map((x) => x.act), ['add-key']);
  for (const x of o) assert.doesNotMatch(x.title, /\b\d{1,2}:\d{2}\b|meta|evento|boss|agenda/i, 'DEC-032: ' + x.title);
});

test('memoria de la Bienvenida: anota el módulo (no la Bienvenida), cuenta una visita cada 30 min y la copia', () => {
  const { P: Q, store } = load();
  assert.equal(Q.moduleForHash('#/account/wizards-vault/objectives-dashboard').id, 'wv');
  assert.equal(Q.moduleForHash('#/account/accounts').id, 'accounts');
  assert.equal(Q.moduleForHash('#/welcome'), null);
  assert.equal(Q.moduleForHash('#/cardsx'), null);
  assert.equal(Q.trackVisit('#/welcome', NOW), null);
  Q.trackVisit('#/cards', NOW);
  Q.trackVisit('#/cards', NOW + 10 * 6e4);
  Q.trackVisit('#/meta', NOW + 20 * 6e4);
  Q.trackVisit('#/cards', NOW + 21 * 6e4);
  Q.trackVisit('#/cards', NOW + 60 * 6e4);
  const v = store['gn:global:welcome'];
  same(v.visits, { armory: 1, cards: 3, meta: 1 }, 'armory: el módulo abierto al cargar');
  same(v.last, { id: 'cards', at: NOW + 60 * 6e4 });
  Q.markBackup(NOW + 2 * H);
  assert.equal(store['gn:global:welcome'].backupAt, NOW + 2 * H);
  same(store['gn:global:welcome'].visits, { armory: 1, cards: 3, meta: 1 }, 'anotar la copia no borra las visitas');
  same(Object.keys(store['gn:global:welcome']).sort(), ['backupAt', 'last', 'v', 'visits'], 'solo ids de módulo y fechas');
});

test('al cargar anota el módulo abierto y escucha la navegación y el botón Backup de la cabecera', () => {
  const { store, win, doc } = load();
  assert.equal(store['gn:global:welcome'].last.id, 'armory');
  assert.equal(typeof win.hashchange, 'function');
  doc.click({ target: { closest: (s) => (s === '#exportSettingsBtn' ? {} : null) } });
  assert.ok(store['gn:global:welcome'].backupAt > 0, 'el Backup de la cabecera también cuenta como copia');
  const antes = store['gn:global:welcome'].backupAt;
  doc.click({ target: { closest: () => null } });
  assert.equal(store['gn:global:welcome'].backupAt, antes);
});

test('«Guardar copia» descarga con SettingsManager y la anota; «Cambiar» abre el selector de themes', () => {
  const { W, panel, calls, store } = load({ 'gn:account:keys': [key('Main', 'A', ALL)] });
  W.activate();
  const click = panel.listeners.click[0];
  const act = (a) => click({ target: { closest: () => ({ getAttribute: () => a }) }, preventDefault() {} });
  act('backup');
  same(calls, ['export']);
  assert.ok(store['gn:global:welcome'].backupAt > 0);
  assert.match(panel.body.innerHTML, /<b>4 de 4<\/b> listo/, 'se redibuja con la copia al día');
  act('theme');
  same(calls, ['export', 'theme']);
  assert.equal(W.orientation().length, 1, 'Welcome.orientation() usa los datos reales: queda «Continuar»');
  assert.equal(W.orientation()[0].id, 'continue');
});
