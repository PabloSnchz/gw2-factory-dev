// Contenido de las guías (BL-071, D3): las guías no pueden separarse de la app.
// GUI-2: «Primeros pasos» (docs/user-guide.html). GUI-3: «Guía por módulo» (docs/user-guide-avanzado.html), parte 1;
// GUI-4 suma la parte 2 y pide los 10 módulos.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const G = read('docs/user-guide.html');

// MODULES y SCOPES reales, desde la Bienvenida.
function welcome() {
  const src = read('js/welcome-panel.js');
  const pick = (name) => {
    const m = src.match(new RegExp('var ' + name + ' = (\\[[\\s\\S]*?\\n  \\]);'));
    assert.ok(m, name + ' en welcome-panel.js');
    return JSON.parse(JSON.stringify(vm.runInNewContext('(' + m[1] + ')'))); // otro realm: se copia para comparar
  };
  return { MODULES: pick('MODULES'), SCOPES: pick('SCOPES') };
}
const { MODULES, SCOPES } = welcome();
const RETIRED = /Strike Tracker|Raid Tracker|Gist|Asistente|Profile Card|inventory\/dashboard|Home Nodes|Thief|Backup|v6\.\d/;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B1B}\u{FE0F}]/u;
const ANET = '© 2014 ArenaNet, LLC. All rights reserved. NCSOFT, the interlocking NC logo, ArenaNet, Guild Wars, Guild Wars Factions, ' +
  'Guild Wars Nightfall, Guild Wars: Eye of the North, Guild Wars 2, and all associated logos and designs are trademarks or registered ' +
  'trademarks of NCSOFT Corporation. All other trademarks are the property of their respective owners.';

test('Primeros pasos: los 10 módulos de la barra lateral, en orden, con su nombre, ruta e ícono reales', () => {
  const mods = [...G.matchAll(/<a class="mod" href="\.\.\/index\.html([^"]+)" style="--x:([^"]+)"><span class="plate"><img src="\.\.\/([^"]+)"[^>]*><\/span><span><b>([^<]+)<\/b>/g)]
    .map((m) => ({ href: m[1], color: m[2], icon: m[3], name: m[4] }));
  assert.deepEqual(mods, MODULES.map((m) => ({ href: m.href, color: m.color, icon: m.icon, name: m.name })));
  mods.forEach((m) => assert.ok(fs.existsSync(path.join(ROOT, m.icon)), m.icon));
  const free = MODULES.filter((m) => m.free).map((m) => m.name);
  assert.ok(free.length && free.every((n) => new RegExp(n + '<\\/b>[^]*?<i class="tag">Sin Key').test(G)), 'los que andan sin Key lo dicen');
});

test('Primeros pasos: la tabla de permisos es la de la Bienvenida (los 7, con sus módulos)', () => {
  const table = G.slice(G.indexOf('<th>Permiso</th>'), G.indexOf('</table>', G.indexOf('<th>Permiso</th>')));
  const rows = [...table.matchAll(/<tr><td><code>(\w+)<\/code><\/td><td>[^<]+<\/td><td>([^<]+)<\/td><\/tr>/g)].map((m) => [m[1], m[2]]);
  const name = (id) => MODULES.find((m) => m.id === id).name;
  assert.deepEqual(rows, SCOPES.map((s) => [s.scope, s.mods.map(name).join(', ')]));
  assert.match(G, /los <strong>7 permisos<\/strong>/);
  assert.match(G, /href="https:\/\/account\.arena\.net\/applications"/);
});

test('Primeros pasos: nada de la Bóveda vieja, sin emojis ni número de versión', () => {
  const text = G.replace(/<style>[\s\S]*?<\/style>|<script>[\s\S]*?<\/script>/g, '');
  const bad = text.match(RETIRED);
  assert.equal(bad, null, 'nombra algo retirado: ' + (bad && bad[0]));
  assert.doesNotMatch(G, EMOJI, 'sin emojis');
  assert.match(G, /Actualizada el \d{1,2} de [a-z]+ de 20\d\d/);
});

test('Primeros pasos: sitio no oficial, aviso de ArenaNet, enlaces que avisan y Discord primero', () => {
  assert.match(G, /<title>Primeros pasos · Bóveda del Gato Negro · sitio de la comunidad de Guild Wars 2 \(no oficial\)<\/title>/);
  assert.ok(G.indexOf('<p lang="en">' + ANET + '</p>') > 0, 'aviso de ArenaNet, tal cual');
  const ext = G.match(/<a [^>]*href="https:\/\/[^"]+"[^>]*>/g) || [];
  assert.ok(ext.length >= 7);
  ext.forEach((a) => assert.match(a, /target="_blank" rel="noopener"/, a));
  assert.equal((G.match(/\(se abre en otra pestaña\)/g) || []).length, ext.length);
  const com = G.slice(G.indexOf('id="comunidad"'));
  assert.ok(com.indexOf('discord.gg') < com.indexOf('github.com'), 'Discord antes que GitHub (D5)');
  assert.match(G, /href="\.\.\/privacy\.html"/);
  assert.match(G, /href="user-guide-avanzado\.html"/);
});

test('Primeros pasos: estilos accesibles (foco visible, 44 px en el celular)', () => {
  const style = G.slice(G.indexOf('<style>'), G.indexOf('</style>'));
  assert.match(style, /a:focus-visible \{ outline: 2px solid var\(--acc-1/);
  assert.match(style, /\.links a \{[^}]*min-height: 44px/);
  assert.match(style, /\.nav a \{[^}]*min-height: 44px/);
  const inline = [...G.matchAll(/style="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(inline.every((s) => /^--x:#[0-9A-F]{6}$/.test(s)), 'el único estilo en línea es el color del módulo: ' + inline.find((s) => !/^--x:#[0-9A-F]{6}$/.test(s)));
});

// ---------------------------------------------------------------------------------------------
// GUI-3: «Guía por módulo» (docs/user-guide-avanzado.html). Cada sección es la del módulo real.
const A = read('docs/user-guide-avanzado.html');
const JS = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f)).map((f) => read('js/' + f)).join('\n');
// Las que ya están escritas. GUI-4 suma el resto y pide los 10.
const WRITTEN = ['cards', 'meta', 'wv', 'activities', 'homestead'];
const sections = () => [...A.matchAll(/<section class="modsec" id="mod-(\w+)"([^>]*)>([\s\S]*?)<\/section>/g)]
  .map((m) => ({ id: m[1], attrs: m[2], body: m[3] }));

test('Guía por módulo: Inicio primero y después los módulos en el orden de la barra lateral', () => {
  const ids = sections().map((s) => s.id);
  assert.equal(ids[0], 'home', 'Inicio va primero');
  const order = MODULES.map((m) => m.id);
  const mods = ids.slice(1);
  WRITTEN.forEach((id) => assert.ok(mods.includes(id), 'falta la sección de ' + id));
  mods.forEach((id) => assert.ok(order.includes(id), id + ' no es un módulo de la Bienvenida'));
  assert.deepEqual(mods, order.filter((id) => mods.includes(id)), 'mismo orden que la barra lateral');
  const toc = [...A.matchAll(/<li><a href="#mod-(\w+)">/g)].map((m) => m[1]);
  assert.deepEqual(toc, ids, 'el índice lleva a cada sección');
});

test('Guía por módulo: cada sección tiene el nombre, la ruta, el ícono y el color reales', () => {
  for (const s of sections().slice(1)) {
    const m = MODULES.find((x) => x.id === s.id);
    assert.equal(s.attrs, ' style="--x:' + m.color + '"', s.id + ': color');
    assert.ok(s.body.includes('<h2>' + m.name + '</h2>'), s.id + ': nombre');
    assert.ok(s.body.includes('href="../index.html' + m.href + '"'), s.id + ': ruta');
    assert.ok(s.body.includes('<img src="../' + m.icon + '"'), s.id + ': ícono');
    assert.ok(fs.existsSync(path.join(ROOT, m.icon)), m.icon);
  }
  const home = sections()[0];
  assert.ok(home.body.includes('href="../index.html#/welcome"'), 'Inicio lleva a la Bienvenida');
});

test('Guía por módulo: las cuatro preguntas y los permisos de cada módulo son los de SCOPES', () => {
  for (const s of sections()) {
    ['Para qué sirve', 'Cómo se usa', 'Qué permisos pide', 'Qué guarda en tu navegador']
      .forEach((h) => assert.ok(s.body.includes('<h3>' + h + '</h3>'), s.id + ': ' + h));
    const chips = [...s.body.matchAll(/<ul class="chips">([\s\S]*?)<\/ul>/g)].flatMap((u) => [...u[1].matchAll(/<code>(\w+)<\/code>/g)].map((c) => c[1]));
    const want = s.id === 'home' ? [] : SCOPES.filter((x) => x.mods.includes(s.id)).map((x) => x.scope);
    assert.deepEqual(chips, want, s.id + ': permisos');
  }
});

test('Guía por módulo: toda clave que nombra existe en js/ y ninguna es la API Key', () => {
  const keys = [...A.matchAll(/<code>((?:gn:|accounts:|gw2_)[a-zA-Z0-9:_.-]*)<\/code>/g)].map((m) => m[1]);
  assert.ok(keys.length >= 10, 'nombra las claves de cada módulo');
  keys.forEach((k) => assert.ok(JS.includes("'" + k) || JS.includes('"' + k) || JS.includes('`' + k), k + ' no existe en js/'));
  for (const s of sections()) assert.ok(/<ul class="keys">\s*<li><code>/.test(s.body), s.id + ': dice qué guarda');
  assert.ok(!keys.includes('gn:account:keys') || /id="mod-keys"/.test(A), 'la Key solo aparece en la sección de Keys');
});

test('Guía por módulo: nada de la Bóveda vieja, sin emojis, aviso legal y estilos accesibles', () => {
  const text = A.replace(/<style>[\s\S]*?<\/style>|<script>[\s\S]*?<\/script>/g, '');
  const bad = text.match(RETIRED);
  assert.equal(bad, null, 'nombra algo retirado: ' + (bad && bad[0]));
  assert.doesNotMatch(A, EMOJI, 'sin emojis');
  assert.match(A, /Actualizada el \d{1,2} de [a-z]+ de 20\d\d/);
  assert.match(A, /<title>Guía por módulo · Bóveda del Gato Negro · sitio de la comunidad de Guild Wars 2 \(no oficial\)<\/title>/);
  assert.ok(A.indexOf('<p lang="en">' + ANET + '</p>') > 0, 'aviso de ArenaNet, tal cual');
  assert.match(A, /href="user-guide\.html"/);
  assert.match(A, /href="\.\.\/privacy\.html"/);
  const style = A.slice(A.indexOf('<style>'), A.indexOf('</style>'));
  assert.match(style, /a:focus-visible \{ outline: 2px solid var\(--acc-1/);
  assert.match(style, /\.plate \{ width: 56px; height: 56px/);
  assert.match(style, /\.toc a \{[^}]*min-height: 44px/);
  const inline = [...A.matchAll(/style="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(inline.every((s) => /^--x:#[0-9A-F]{6}$/.test(s)), 'el único estilo en línea es el color del módulo');
  (A.match(/<a [^>]*href="https:\/\/[^"]+"[^>]*>/g) || []).forEach((a) => assert.match(a, /target="_blank" rel="noopener"/, a));
});
