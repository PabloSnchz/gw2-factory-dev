// BL-075 SHE-3 (DEC-038): qué módulos me pasan su mensaje para el globo y cuáles siguen escribiéndolo adentro.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
const FALLBACK = "else if (msg && root.Shiruvana && typeof root.Shiruvana.voice === 'function') box.appendChild(root.Shiruvana.voice({ kind: msg.kind, text: msg.text }));";
const SPEAK = {
  'ach-view.js': ['logros', 'tus logros (API oficial)', true],
  'act-view.js': ['actividades', 'tus Actividades (API oficial) y los relojes del juego', true],
  'act-week.js': ['semana', 'tus personajes (API oficial) y lo que confirmaste', false],
  'home-view.js': ['heredad', 'tus nodos (API oficial) y lo que marcaste', true],
  'inv-view.js': ['inventario', 'tu banco (API oficial)', true],
  'raids-view.js': ['raids', 'tus raids de esta semana (API oficial)', true],
  'wv-view.js': ['camara', 'tu Cámara del Brujo (API oficial)', true]
};

test('cada módulo me pasa su mensaje con su pantalla y de dónde lo sé, y sin mi globo escribe como siempre', () => {
  Object.keys(SPEAK).forEach((f) => {
    const [mod, src, key] = SPEAK[f], s = read(f);
    const call = "if (msg && root.ShvBubble && root.ShvBubble.speak) root.ShvBubble.speak(box, msg, { module: '" + mod + "', source: '" + src + "'" + (key ? ', key: key' : '') + ' }); ' + FALLBACK;
    assert.equal(s.split(call).length - 1, 1, f + ': una sola llamada, con el respaldo de siempre en la misma línea');
    assert.equal(s.split('root.Shiruvana.voice(').length - 1, 1, f + ': no habla por otro lado');
  });
  const mods = Object.values(SPEAK).map((x) => x[0]);
  assert.equal(new Set(mods).size, mods.length, 'cada pantalla con su nombre: uno por visita a cada una');
});

test('los módulos con ventanas o avisos críticos siguen escribiendo adentro (DEC-038 D3)', () => {
  ['acc-view.js', 'raids-sheet.js', 'converter-modal.js', 'shiruvana-places.js', 'meta-theme.js'].forEach((f) => {
    assert.ok(!/ShvBubble/.test(read(f)), f + ' no usa el globo');
  });
});
