// Privacidad (BL-071 GUI-1 y GUI-5): privacy.html dice lo que la Bóveda hace de verdad con tus datos.
// Si la app empieza a guardar algo con otro nombre o a cargar algo de otro sitio, esto lo avisa.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const P = read('privacy.html');
const I = read('index.html');
const JS = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f)).map((f) => read('js/' + f)).join('\n');
const ANET = '© 2014 ArenaNet, LLC. All rights reserved. NCSOFT, the interlocking NC logo, ArenaNet, Guild Wars, Guild Wars Factions, ' +
  'Guild Wars Nightfall, Guild Wars: Eye of the North, Guild Wars 2, and all associated logos and designs are trademarks or registered ' +
  'trademarks of NCSOFT Corporation. All other trademarks are the property of their respective owners.';

// Las claves que nombran la privacidad y la «Guía por módulo». Además de gn:, accounts: y gw2_, la Cámara usa wv:season: y el
// Multicuenta inv_dashboard_ (GUI-5).
const KEY_RE = /<code>((?:gn:|accounts:|gw2_|wv:season:|inv_dashboard_)[a-zA-Z0-9:_.-]*)<\/code>/g;
const keysOf = (html) => [...html.matchAll(KEY_RE)].map((m) => m[1]);
const RETIRED_SYNC = /^gn:github:/; // el rastro de la sincronización retirada: se nombra, pero nadie lo usa

// ¿La usa un módulo de verdad? No alcanza con que aparezca en js/storage.js (la lista de nombres) ni en
// js/settings-manager.js (copia y restauración): tiene que leerla o escribirla un módulo, por su nombre, por la
// constante de Storage.STORAGE_KEYS o por su nombre viejo, que Storage traduce.
function usedByModule(k) {
  const st = read('js/storage.js');
  const names = [...st.matchAll(/^\s*([A-Z_]+):\s*'([^']+)'/gm)].filter((m) => m[2] === k).map((m) => m[1]);
  const legacy = [...st.matchAll(/\{ from: '([^']+)',\s*to: '([^']+)' \}/g)].filter((m) => m[2] === k).map((m) => m[1]);
  const prefix = /[:_]$/.test(k);
  const pats = (prefix ? ["'" + k, '"' + k, '`' + k] : ["'" + k + "'", '"' + k + '"', '`' + k + '`'])
    .concat(names.map((n) => 'STORAGE_KEYS.' + n), names.map((n) => "'" + n + "'"), legacy.map((x) => "'" + x + "'"));
  return fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f) && f !== 'storage.js' && f !== 'settings-manager.js')
    .some((f) => { const s = read('js/' + f); return pats.some((p) => s.includes(p)); });
}

test('cada clave que nombra la usa de verdad un módulo de la Bóveda', () => {
  const keys = keysOf(P);
  assert.ok(keys.length >= 30, 'nombra las claves reales (' + keys.length + ')');
  keys.filter((k) => !RETIRED_SYNC.test(k)).forEach((k) => assert.ok(usedByModule(k), k + ': ningún módulo la usa'));
  ['gn:account:keys', 'accounts:vault2', 'gn:accounts:cards', 'gn:activities:week', 'gn:homestead:owned', 'gn:raids:marks', 'gn:theme',
    'gn:global:welcome', 'wv:season:current', 'inv_dashboard_selected_items'].forEach((k) => assert.ok(keys.indexOf(k) >= 0, 'falta ' + k));
  const sync = P.slice(P.indexOf('Gist antes de que se retirara') - 200);
  keys.filter((k) => RETIRED_SYNC.test(k)).forEach((k) => assert.ok(sync.includes('<code>' + k + '</code>'), k + ' solo en el aviso de la sincronización retirada'));
});

test('la privacidad nombra todo lo que la «Guía por módulo» dice que se guarda', () => {
  const guide = keysOf(read('docs/user-guide-avanzado.html'));
  assert.ok(guide.length >= 20);
  const priv = new Set(keysOf(P));
  guide.forEach((k) => assert.ok(priv.has(k), k + ' está en la guía y no en la privacidad'));
});

test('no promete lo que no existe', () => {
  assert.doesNotMatch(P, /gn:apiKeys|gn:selectedKey|gn:settings|gn:accountsData|gn:accountsMeta|wvSeason_v/, 'claves inventadas');
  // GUI-5: claves que se nombraban y ningún módulo usa (gn:achievements es un evento, no una clave guardada).
  assert.doesNotMatch(P, /<code>(gn:achievements|gn:converter:state|gn:wallet:state|gn:wallet:snapshots|gn:meta:hecho_hoy|gn:activities:stones|gn:inventory:selected_items|gn:wv:season)<\/code>/, 'claves que no usa nadie');
  assert.doesNotMatch(P, /Todo con el prefijo/, 'no todo empieza con gn:');
  assert.doesNotMatch(P, /Configuraci[oó]n\s*(→|&rarr;)\s*Analytics|localStorage\.clear|Sincronizar|Subir configuraci/, 'opciones que no existen');
  assert.doesNotMatch(P, /storage\.js v|gw2-wallet-ligero\/issues"[^>]*>issue/, 'detalles internos viejos');
  assert.equal((P.match(/Gist/g) || []).length, 1, 'Gist solo en el aviso de lo que quedó de la sincronización retirada');
  assert.match(P, /Gist antes de que se retirara/);
});

test('cada sitio que index.html carga solo está en la tabla', () => {
  const hosts = new Set();
  [...I.matchAll(/<(?:link|script)\b[^>]*(?:href|src)="https:\/\/([^/"]+)/g), ...I.matchAll(/\.src = 'https:\/\/([^/']+)/g)]
    .forEach((m) => hosts.add(m[1]));
  assert.ok(hosts.size >= 4, 'encontró los sitios (' + [...hosts].join(', ') + ')');
  const table = P.slice(P.indexOf('Adónde se conecta'), P.indexOf('Qué guarda la Bóveda'));
  hosts.forEach((h) => assert.ok(table.includes('<code>' + h + '</code>'), h + ' no figura en la tabla'));
  assert.match(table, /<code>api\.guildwars2\.com<\/code>/);
  assert.match(table, /Solo en la Bóveda pública/, 'Analytics solo en producción (DEC-006)');
  const ga = I.slice(I.indexOf('<script id="ga-loader">'), I.indexOf('</script>', I.indexOf('<script id="ga-loader">')));
  assert.match(ga, /gw2-wallet-ligero/, 'index.html carga Analytics solo en producción');
});

test('dice lo importante: Keys sin cifrar, Llavero cifrado, la copia lleva las Keys y cómo borrar todo', () => {
  assert.match(P, /Sin cifrar<\/strong>/);
  assert.match(P, /PBKDF2 con 600\.000 iteraciones y AES-GCM/);
  assert.match(P, /La contraseña no se guarda/);
  assert.match(P, /Incluye tus API Keys sin cifrar<\/strong>/);
  assert.match(P, /borrar los datos del sitio<\/strong>/);
  assert.match(P, /Actualizada el \d{1,2} de [a-z]+ de 20\d\d/);
});

test('aviso legal, sitio no oficial, sin emojis y enlaces que avisan', () => {
  assert.match(P, /<title>Privacidad · Bóveda del Gato Negro · sitio de la comunidad de Guild Wars 2 \(no oficial\)<\/title>/);
  assert.ok(P.indexOf('<p lang="en">' + ANET + '</p>') > 0, 'el aviso de ArenaNet, tal cual');
  assert.doesNotMatch(P, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B1B}]/u, 'sin emojis');
  const ext = P.match(/<a [^>]*href="https:\/\/[^"]+"[^>]*>/g) || [];
  assert.ok(ext.length >= 2);
  ext.forEach((a) => assert.match(a, /target="_blank" rel="noopener"/, a));
  assert.equal((P.match(/\(se abre en otra pestaña\)/g) || []).length, ext.length);
  assert.match(P, /<a href="https:\/\/discord\.gg\/ZGNsfsqyKe"/, 'Discord primero (D5)');
  const email = read('js/welcome-panel.js').match(/email: '([^']+)'/)[1];
  assert.ok(P.includes('<a href="mailto:' + email + '">' + email + '</a>'), 'el correo de la Bienvenida (decisión de Pablo, GUI-4)');
});

test('piel: el theme del jugador, colores del theme y foco visible', () => {
  const style = P.slice(P.indexOf('<style>'), P.indexOf('</style>'));
  const loose = style.replace(/var\([^)]*\)/g, '').match(/#[0-9a-fA-F]{3,6}\b/g);
  assert.equal(loose, null, 'colores fijos: ' + loose);
  assert.match(style, /a:focus-visible \{ outline: 2px solid var\(--acc-1/);
  assert.match(P, /<link rel="icon" type="image\/svg\+xml" href="assets\/brand\/gato-negro\.svg"\/>/);
  const script = P.match(/<script>([\s\S]*?)<\/script>/)[1];
  const run = (stored) => {
    const link = { href: '' }, attrs = {};
    vm.runInNewContext(script, {
      document: { getElementById: (id) => (id === 'themeStylesheet' ? link : null), documentElement: { setAttribute: (k, v) => { attrs[k] = v; } } },
      localStorage: { getItem: (k) => (k in stored ? stored[k] : null) }, JSON,
    });
    return [link.href, attrs['data-theme']];
  };
  assert.deepEqual(run({ 'gn:theme': 'nord' }), ['css/themes/nord.css?v=1.0.0', 'nord']);
  assert.deepEqual(run({}), ['css/themes/gato.css?v=1.0.0', 'gato']);
  assert.equal(run({ 'gn:theme': '../../x' })[1], 'gato');
});

test('se llega desde el pie y desde la Bienvenida', () => {
  const foot = I.slice(I.indexOf('<footer'), I.indexOf('</footer>'));
  assert.match(foot, /<a href="privacy\.html">Privacidad<\/a>/);
  assert.match(read('js/welcome-panel.js'), /privacy: 'privacy\.html'/);
});
