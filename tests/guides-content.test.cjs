// Contenido de las guías (BL-071, D3): las guías no pueden separarse de la app.
// GUI-2: «Primeros pasos» (docs/user-guide.html). La «Guía por módulo» se suma en GUI-3 y GUI-4.
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
