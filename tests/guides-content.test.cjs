// Contenido de las guías (BL-071, D3): las guías no pueden separarse de la app.
// GUI-2: «Primeros pasos» (docs/user-guide.html). GUI-3 y GUI-4: «Guía por módulo» (docs/user-guide-avanzado.html),
// con los 10 módulos de la Bienvenida, Keys y Ajustes. GUI-5: las tres páginas se leen en los 19 themes.
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

test('Primeros pasos: los 7 permisos son obligatorios y el correo es el de la Bienvenida', () => {
  assert.match(G, /Tienen que estar los 7: si falta alguno, la Bóveda no guarda la Key y te dice cuál\./);
  assert.doesNotMatch(G, /igual anda/, 'la puerta de app.js rechaza la Key si falta un permiso');
  const email = read('js/welcome-panel.js').match(/email: '([^']+)'/)[1];
  assert.ok(G.includes('<a href="mailto:' + email + '">' + email + '</a>'), 'el correo de la Bienvenida (decisión de Pablo)');
  assert.doesNotMatch(G, /contacto@/);
});

// ---------------------------------------------------------------------------------------------
// GUI-3 y GUI-4: «Guía por módulo» (docs/user-guide-avanzado.html). Cada sección es la del módulo real.
const A = read('docs/user-guide-avanzado.html');
const JS = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f)).map((f) => read('js/' + f)).join('\n');
const EXTRA = ['keys', 'settings']; // Keys y Ajustes no son módulos de la barra lateral: van al final
const sections = () => [...A.matchAll(/<section class="modsec" id="mod-(\w+)"([^>]*)>([\s\S]*?)<\/section>/g)]
  .map((m) => ({ id: m[1], attrs: m[2], body: m[3] }));

test('Guía por módulo: Inicio, los 10 módulos en el orden de la barra lateral, Keys y Ajustes', () => {
  const ids = sections().map((s) => s.id);
  assert.deepEqual(ids, ['home'].concat(MODULES.map((m) => m.id), EXTRA));
  const toc = [...A.matchAll(/<li><a href="#mod-(\w+)">/g)].map((m) => m[1]);
  assert.deepEqual(toc, ids, 'el índice lleva a cada sección');
  assert.doesNotMatch(A, /próximamente|class="soon"/, 'ya no queda nada por escribir');
});

test('Guía por módulo: cada módulo tiene el nombre, la ruta, el ícono y el color reales', () => {
  for (const s of sections().filter((x) => MODULES.some((m) => m.id === x.id))) {
    const m = MODULES.find((x) => x.id === s.id);
    assert.equal(s.attrs, ' style="--x:' + m.color + '"', s.id + ': color');
    assert.ok(s.body.includes('<h2>' + m.name + '</h2>'), s.id + ': nombre');
    assert.ok(s.body.includes('href="../index.html' + m.href + '"'), s.id + ': ruta');
    assert.ok(s.body.includes('<img src="../' + m.icon + '"'), s.id + ': ícono');
    assert.ok(fs.existsSync(path.join(ROOT, m.icon)), m.icon);
    const tag = m.free ? 'Sin Key' : (m.local ? 'En tu PC' : 'Con Key');
    assert.ok(s.body.includes('<i class="tag">' + tag + '</i>'), s.id + ': ' + tag);
  }
  assert.ok(sections()[0].body.includes('href="../index.html#/welcome"'), 'Inicio lleva a la Bienvenida');
});

test('Guía por módulo: las cuatro preguntas y los permisos de cada sección son los de SCOPES', () => {
  for (const s of sections()) {
    ['Para qué sirve', 'Cómo se usa', 'Qué permisos pide', 'Qué guarda en tu navegador']
      .forEach((h) => assert.ok(s.body.includes('<h3>' + h + '</h3>'), s.id + ': ' + h));
    const chips = [...s.body.matchAll(/<ul class="chips">([\s\S]*?)<\/ul>/g)].flatMap((u) => [...u[1].matchAll(/<code>(\w+)<\/code>/g)].map((c) => c[1]));
    const want = s.id === 'keys' ? SCOPES.map((x) => x.scope)
      : (s.id === 'home' || s.id === 'settings') ? [] : SCOPES.filter((x) => x.mods.includes(s.id)).map((x) => x.scope);
    assert.deepEqual(chips, want, s.id + ': permisos');
  }
});

test('Guía por módulo: toda clave que nombra existe en js/ y la API Key solo aparece en Keys', () => {
  const keys = [...A.matchAll(/<code>((?:gn:|accounts:|gw2_|wv:season:|inv_dashboard_)[a-zA-Z0-9:_.-]*)<\/code>/g)].map((m) => m[1]);
  assert.ok(keys.length >= 20, 'nombra las claves de cada módulo');
  keys.forEach((k) => assert.ok(JS.includes("'" + k) || JS.includes('"' + k) || JS.includes('`' + k), k + ' no existe en js/'));
  for (const s of sections()) {
    assert.ok(/<ul class="keys">\s*<li><code>/.test(s.body) || /<p class="none">Nada propio/.test(s.body), s.id + ': dice qué guarda');
    if (s.id !== 'keys') assert.doesNotMatch(s.body, /<code>(gn:account:keys|gw2_keys)<\/code>/, s.id + ': la Key es de la sección Keys');
  }
  const k = sections().find((s) => s.id === 'keys').body;
  assert.match(k, /<code>gn:account:keys<\/code>.*<strong>sin cifrar<\/strong>/, 'Keys dice que se guardan sin cifrar');
  assert.match(k, /si falta alguno, no la guarda y te dice cuál/);
  const a = sections().find((s) => s.id === 'accounts').body;
  assert.match(a, /<code>accounts:vault2<\/code>.*contraseña no se guarda nunca/, 'el Llavero va cifrado y la contraseña no se guarda');
  assert.match(sections().find((s) => s.id === 'settings').body, /Lleva tus API Keys sin cifrar/);
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
  const ext = A.match(/<a [^>]*href="https:\/\/[^"]+"[^>]*>/g) || [];
  ext.forEach((x) => assert.match(x, /target="_blank" rel="noopener"/, x));
  assert.equal((A.match(/\(se abre en otra pestaña\)/g) || []).length, ext.length);
});

// ---------------------------------------------------------------------------------------------
// GUI-5: las dos guías y la privacidad se leen en los 19 themes (texto 4.5:1, foco 3:1). Usan los tokens del theme
// tal cual (sin la guarda de la app), así que se miden sobre los tres fondos: página, tarjeta y código.
test('Guías y privacidad: en los 19 themes el texto llega a 4.5:1 y el foco a 3:1', () => {
  const TD = path.join(ROOT, 'css', 'themes');
  const themes = fs.readdirSync(TD).filter((f) => f.endsWith('.css'));
  assert.equal(themes.length, 19);
  const rgb = (v) => {
    v = String(v || '').trim();
    let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) { const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]; return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1); }
    m = v.match(/^rgba?\(([^)]+)\)$/i);
    if (m) { const p = m[1].split(',').map((x) => parseFloat(x)); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    return null;
  };
  const over = (c, bg) => [0, 1, 2].map((i) => c[i] * c[3] + bg[i] * (1 - c[3])).concat(1);
  const lum = (c) => { const a = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const fails = [];
  themes.forEach((f) => {
    const css = fs.readFileSync(path.join(TD, f), 'utf8'), t = {};
    css.slice(css.indexOf('{') + 1, css.indexOf('}')).replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (_, k, v) => { t[k] = v.trim(); return ''; });
    ['--bg-0', '--bg-1', '--bg-2', '--tx-1', '--tx-2', '--acc-1'].forEach((k) => assert.ok(rgb(t[k]), f + ': ' + k + ' sin un color que se pueda medir'));
    const page = over(rgb(t['--bg-0']), [255, 255, 255, 1]);
    const card = over(rgb(t['--bg-1']), page);
    const bgs = { 'página': page, tarjeta: card, 'código': over(rgb(t['--bg-2']), card) };
    ['--tx-1', '--tx-2'].forEach((k) => Object.keys(bgs).forEach((n) => {
      const r = cr(over(rgb(t[k]), bgs[n]), bgs[n]);
      if (r < 4.5) fails.push(f + ' ' + k + ' sobre ' + n + ' ' + r.toFixed(2));
    }));
    const r = cr(over(rgb(t['--acc-1']), page), page);
    if (r < 3) fails.push(f + ' foco (--acc-1) ' + r.toFixed(2));
  });
  assert.deepEqual(fails, []);
  for (const f of ['docs/user-guide.html', 'docs/user-guide-avanzado.html', 'privacy.html']) {
    const s = read(f);
    assert.match(s, /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/, f + ': se adapta al celular');
    const style = s.slice(s.indexOf('<style>'), s.indexOf('</style>'));
    assert.match(style, /@media \(max-width: 600px\)/, f + ': tiene su diseño de celular');
    assert.match(style, /color: var\(--tx-2/, f + ': el texto sale del theme');
  }
});
