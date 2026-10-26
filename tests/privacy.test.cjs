// Privacidad (BL-071 GUI-1): privacy.html dice lo que la Bóveda hace de verdad con tus datos.
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

test('cada clave que nombra existe en el código de la Bóveda', () => {
  const keys = [...P.matchAll(/<code>((?:gn:|accounts:|gw2_)[a-zA-Z0-9:_.-]*)<\/code>/g)].map((m) => m[1]);
  assert.ok(keys.length >= 25, 'nombra las claves reales (' + keys.length + ')');
  keys.forEach((k) => assert.ok(JS.includes("'" + k) || JS.includes('"' + k) || JS.includes('`' + k), k + ' no existe en js/'));
  ['gn:account:keys', 'accounts:vault2', 'gn:accounts:cards', 'gn:activities:week', 'gn:homestead:owned', 'gn:raids:marks', 'gn:theme']
    .forEach((k) => assert.ok(keys.indexOf(k) >= 0, 'falta ' + k));
});

test('no promete lo que no existe', () => {
  assert.doesNotMatch(P, /gn:apiKeys|gn:selectedKey|gn:settings|gn:accountsData|gn:accountsMeta|wvSeason_v/, 'claves inventadas');
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
