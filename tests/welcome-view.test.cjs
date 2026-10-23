// Pantalla de Bienvenida 2.x (BL-058, propuesta WEL-0b aprobada; frontera DEC-032).
// Estructura y frontera; «Tu Bóveda» y «Seguí donde quedaste» en tests/welcome-vault.test.cjs.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'welcome-panel.js'), 'utf8');
const NEWS = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'welcome-news.json'), 'utf8'));

// Nodo mínimo: lo justo para que el módulo cargue y se dibuje.
function el(tag) {
  const n = { tag, children: [], attrs: {}, hidden: false, listeners: {}, _html: '', textContent: '', parentNode: null, className: '' };
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); if (k === 'hidden') n.hidden = true; };
  n.removeAttribute = (k) => { delete n.attrs[k]; if (k === 'hidden') n.hidden = false; };
  n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
  n.appendChild = (c) => { if (c.parentNode) c.parentNode.children.splice(c.parentNode.children.indexOf(c), 1); c.parentNode = n; n.children.push(c); return c; };
  n.insertBefore = (c, ref) => { c.parentNode = n; const i = ref ? n.children.indexOf(ref) : -1; if (i < 0) n.children.push(c); else n.children.splice(i, 0, c); return c; };
  n.addEventListener = (t, f) => { (n.listeners[t] = n.listeners[t] || []).push(f); };
  Object.defineProperty(n, 'firstChild', { get: () => n.children[0] || null });
  Object.defineProperty(n, 'innerHTML', { get: () => n._html, set: (v) => { n._html = v; n.children = []; } });
  n.querySelector = (sel) => {
    if (sel === '.panel__body') return n.body || null;
    if (sel === '#welcomeTitle' || sel === '.panel__title') return n.title || null;
    if (sel === '.wl-head') return n.children.find((c) => c.className === 'wl-head') || null;
    if (sel === '[data-wl-slot="title"]') return /data-wl-slot="title"/.test(n._html) ? (n.slot = n.slot || el('div')) : null;
    if (sel === '[data-wl-sub]') return /data-wl-sub/.test(n._html) ? (n.sub = n.sub || el('div')) : null;
    return null;
  };
  return n;
}

function load({ keys = null, selected = null, news = NEWS } = {}) {
  const panel = el('section');
  panel.title = el('h2'); panel.title.textContent = 'Bienvenido a la Bóveda';
  panel.body = el('div');
  panel.appendChild(panel.title); panel.appendChild(panel.body);
  const keysModal = el('div'); keysModal.hidden = true;
  keysModal.querySelector = () => null;
  const head = el('head');
  const byId = { welcomePanel: panel, keysModal };
  const docListeners = {};
  const fetched = [];
  const window = {
    console: { info() {}, log() {} },
    Storage: {
      STORAGE_KEYS: { ACCOUNT_KEYS: 'gn:account:keys', ACCOUNT_SELECTED: 'gn:account:selected' },
      get: (k) => (k === 'gn:account:keys' ? keys : k === 'gn:account:selected' ? selected : null),
    },
    fetch: (url) => { fetched.push(url); return Promise.resolve({ ok: true, json: () => Promise.resolve(news) }); },
    addEventListener() {},
  };
  window.document = {
    readyState: 'complete', head,
    getElementById: (id) => byId[id] || head.children.find((c) => c.id === id) || null,
    createElement: (t) => el(t),
    addEventListener: (t, f) => { (docListeners[t] = docListeners[t] || []).push(f); },
  };
  vm.runInNewContext(SRC, { window, Date, Promise, JSON });
  return { W: window.Welcome, panel, keysModal, head, fetched, docListeners };
}

const P = load().W._pure;
const tick = () => new Promise((r) => setImmediate(r));

test('sin API Key: tres pasos, «Agregar API Key» con su id y los módulos marcados Con Key / Sin Key', () => {
  const m = P.buildModel({ keys: null });
  assert.equal(m.state, 'new');
  const html = P.headHTML(m) + P.bodyHTML(m, []);
  assert.match(html, /Empezá en tres pasos/);
  assert.equal((html.match(/class="wl-step( is-on)?"/g) || []).length, 3);
  assert.equal((html.match(/id="welcomeAddKeyBtn"/g) || []).length, 1);
  assert.match(html, /href="https:\/\/account\.arena\.net\/applications"/);
  assert.match(html, /API Key <b>sin cargar<\/b>/);
  assert.match(html, /data-mod="meta"[^]*?wl-tag--free">Sin Key/);
  assert.equal((html.match(/wl-tag--key">Con Key/g) || []).length, 7, 'Cuentas no necesita Key');
});

test('con API Key: saludo con la cuenta activa, botones de Keys y Cuentas, sin los tres pasos', () => {
  const keys = [{ label: 'Pablin.1234', value: 'AAA' }, { label: 'Alt', value: 'BBB' }];
  const m = P.buildModel({ keys, selected: 'BBB' });
  assert.deepEqual([m.state, m.keyCount, m.activeLabel], ['back', 2, 'Alt']);
  const html = P.headHTML(m) + P.bodyHTML(m, []);
  assert.match(html, /cuenta activa <b>Alt<\/b>/);
  assert.match(html, /id="welcomeManageKeysBtn"/);
  assert.match(html, /id="welcomeAccountsBtn" href="#\/account\/accounts"/);
  assert.match(html, /Cuentas <b>2<\/b>/);
  assert.doesNotMatch(html, /Empezá en tres pasos|welcomeAddKeyBtn/);
  assert.equal(P.buildModel({ keys, selected: 'ZZZ' }).activeLabel, 'Pablin.1234', 'sin selección válida, la primera');
  assert.equal(P.buildModel({ keys: [{ value: 'X', label: '  ' }] }).activeLabel, 'sin nombre');
});

test('los 9 módulos de la barra lateral, en orden y con su ruta real', () => {
  const html = P.bodyHTML(P.buildModel({ keys: [{ value: 'k', label: 'a' }] }), []);
  const hrefs = [...html.matchAll(/class="wl-mod" href="([^"]+)"/g)].map((x) => x[1]);
  assert.deepEqual(hrefs, ['#/cards', '#/meta', '#/account/legendary-armory', '#/account/achievements',
    '#/account/wizards-vault', '#/activities', '#/account/raids', '#/account/characters', '#/account/accounts']);
  const sidebar = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const h of hrefs) assert.ok(sidebar.includes('class="side-nav__link" href="' + h + '"'), h + ' existe en la barra lateral');
  for (const m of P.MODULES) assert.ok(fs.existsSync(path.join(ROOT, m.icon)), m.icon);
});

test('Frontera con los módulos (DEC-032): la Bienvenida no lee datos de Metas ni muestra horarios', () => {
  assert.doesNotMatch(SRC, /meta-events|meta-drops|Meta\._pure|gn:meta|MetaTheme|getWallet|achievements\.json|api\.guildwars2\.com/);
  const html = P.headHTML(P.buildModel({ keys: [{ value: 'k', label: 'a' }] })) +
    P.bodyHTML(P.buildModel({ keys: [{ value: 'k', label: 'a' }] }), P.pickNews(NEWS.items, Date.parse('2026-10-23T12:00:00Z')));
  assert.doesNotMatch(html, /\b\d{1,2}:\d{2}\b/, 'ninguna hora');
  assert.doesNotMatch(html, /Reset (diario|semanal)|Ahora en Tyria|en curso|Tequatl|waypoint/i);
  for (const n of NEWS.items) assert.doesNotMatch(n.title + ' ' + n.text, /\b\d{1,2}:\d{2}\b|en curso|world boss/i, 'novedad: ' + n.title);
});

test('novedades: las 3 más nuevas, con «NUEVO» solo durante 14 días', () => {
  const now = Date.parse('2026-11-05T12:00:00Z'); // 13 días después del 23/10
  const n = P.pickNews(NEWS.items, now);
  assert.equal(n.length, 3);
  assert.equal(n[0].title, 'Metas y Eventos renovado');
  assert.equal(n[0].when, '23/10');
  assert.equal(n[0].isNew, true);
  assert.equal(n[1].isNew, false, 'la del 22/10 ya tiene 14,5 días');
  assert.equal(P.pickNews([{ date: '2026-10-01', title: 'vieja' }, { date: '2026-10-20', title: 'nueva' }])[0].title, 'nueva', 'ordena aunque el archivo venga desordenado');
  assert.equal(P.pickNews(null).length, 0);
  assert.equal(P.pickNews([{ title: 'sin fecha' }, { date: '2026-10-01' }]).length, 0, 'descarta lo incompleto');
  const html = P.bodyHTML(P.buildModel({}), []);
  assert.match(html, /Por ahora no hay novedades/);
  assert.match(P.bodyHTML(P.buildModel({}), null), /Cargando novedades/);
  for (const it of NEWS.items) assert.ok(P.MODULES.some((m) => m.id === it.module), 'módulo conocido: ' + it.module);
});

test('guías y ayuda: guía de usuario, guía avanzada y Discord', () => {
  const html = P.bodyHTML(P.buildModel({}), []);
  assert.match(html, /href="docs\/user-guide\.html"/);
  assert.match(html, /href="docs\/user-guide-avanzado\.html"/);
  assert.match(html, /Guía de usuario[^]*Guía avanzada[^]*¿Algo no anda\?/);
  for (const f of ['docs/user-guide.html', 'docs/user-guide-avanzado.html', 'privacy.html']) assert.ok(fs.existsSync(path.join(ROOT, f)), f);
});

test('escapa lo que escribe el jugador (nombre de la Key)', () => {
  const html = P.headHTML(P.buildModel({ keys: [{ value: 'k', label: '<img src=x onerror=alert(1)>' }] }));
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test('GDS: sin estilos en línea ni onmouseover; solo tokens salvo la bio oficial', () => {
  assert.doesNotMatch(SRC, /onmouseover|onmouseout|onclick=/);
  assert.doesNotMatch(SRC, /var\(--tx-1\)fff|#E1306C|#555555|Gist/);
  const html = P.headHTML(P.buildModel({})) + P.bodyHTML(P.buildModel({}), []);
  const styles = [...html.matchAll(/style="([^"]*)"/g)].map((x) => x[1]);
  assert.ok(styles.every((s) => /^--[xp]:[^;]+$/.test(s)), 'los únicos estilos en línea son variables (color del módulo, avance): ' + styles.find((s) => !/^--[xp]:[^;]+$/.test(s)));
  const hex = new Set((P.CSS.match(/#[0-9A-Fa-f]{6}\b/g) || []).map((h) => h.toUpperCase()));
  assert.deepEqual([...hex].sort(), ['#232A3A', '#5A3DDB', '#F4F6FA', '#FFFFFF'], 'solo los colores oficiales de la bio');
  assert.match(P.CSS, /prefers-reduced-motion/);
  assert.match(P.CSS, /:focus-visible/);
  assert.match(P.CSS, /@media \(max-width:720px\)/);
});

test('activate dibuja la cabecera fuera del cuerpo (mi voz va arriba del cuerpo) y carga las novedades', async () => {
  const { W, panel, head, fetched } = load({ keys: [{ value: 'k', label: 'Pablin' }], selected: 'k' });
  W.activate();
  assert.equal(panel.hidden, false);
  assert.equal(panel.children[0].className, 'wl-head', 'la cabecera queda primera en el panel');
  assert.equal(panel.title.textContent, 'La Bóveda del Gato Negro');
  assert.equal(panel.title.parentNode, panel.children[0].slot, 'el título vive dentro de la cabecera');
  assert.match(panel.body.innerHTML, /¿Qué puedo hacer aquí\?/);
  assert.equal(head.children.filter((c) => c.id === 'wl-css').length, 1);
  assert.deepEqual(fetched, ['assets/welcome-news.json']);
  await tick(); await tick();
  assert.match(panel.body.innerHTML, /Metas y Eventos renovado/);
  W.activate(); W.refresh();
  assert.equal(head.children.filter((c) => c.id === 'wl-css').length, 1, 'el CSS se agrega una sola vez');
  assert.equal(fetched.length, 1, 'las novedades se piden una sola vez');
  W.deactivate();
  assert.equal(panel.hidden, true);
});

test('«Agregar API Key» y «API Key» abren el modal de Keys; cambiar de cuenta redibuja', () => {
  const { W, panel, keysModal, docListeners } = load({ keys: [{ value: 'k', label: 'A' }], selected: 'k' });
  W.activate();
  const click = panel.listeners.click[0];
  const btn = { getAttribute: () => 'manage-keys' };
  let prevented = false;
  click({ target: { closest: () => btn }, preventDefault: () => { prevented = true; } });
  assert.equal(keysModal.hidden, false);
  assert.equal(prevented, true);
  assert.doesNotThrow(() => click({ target: { closest: () => null } }));
  panel.body.innerHTML = '';
  docListeners['gn:tokenchange'][0]();
  assert.match(panel.body.innerHTML, /wl-mods/);
});

test('API pública compatible con 1.4.0 y versión en el encabezado', () => {
  const { W } = load();
  for (const k of ['initOnce', 'activate', 'deactivate', 'Route', '_debug']) assert.ok(W[k], k);
  assert.equal(W.Route.path, 'welcome');
  const v = SRC.match(/Versión: (2\.\d+\.\d+)/);
  assert.ok(v, 'versión 2.x en el encabezado');
  assert.equal(W.version, v[1], 'la versión del encabezado coincide con Welcome.version');
});
