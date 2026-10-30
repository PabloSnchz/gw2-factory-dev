// BL-084 EQ-7: «Cómo se juega» de la ficha (js/bld-play.js) y las claves concepts/opener/loop/cc de notes.json. Sin red.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
globalThis.GNBldShow = require('../js/bld-show.js');
globalThis.GNBldItems = require('../js/bld-items.js');
const NOTES = require('../js/bld-notes.js');
globalThis.GNBldNotes = NOTES;
const PL = require('../js/bld-play.js');
const P = PL._pure;
const RG = 'https://render.guildwars2.com/file/';
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/notes.json'), 'utf8'));

const REF = { skills: { 13021: { id: 13021, name: 'Retirada <b>', icon: RG + 'k1.png' }, 13026: { id: 13026, name: 'Golpe de sombra', icon: RG + 'k2.png' } },
  traits: { 1510: { id: 1510, name: 'Golpe preciso', icon: RG + 't1.png' } } };
const GEAR = { relic: { id: 100, name: 'Reliquia de Fuego', icon: RG + 'rel.png' }, armor: [], trinkets: [], sets: [], extras: [] };
const SRC = { name: 'Snow Crows', url: 'https://snowcrows.com/builds/raids/thief/x' };
const NOTE = { patch: '2026-09-29', concepts: ['Vivís de {t:1510}: pegá de flanco.'], opener: ['{s:13021}', '{s:13026} → {s:13021}'],
  loop: ['Repetí {s:13026} con la {i:100} lista.'], cc: ['Guardá {s:13021} para la barra <x>.'] };

test('versión en la cabecera, en modules.json después de las notas y antes de la ficha; sin estado guardado', () => {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'bld-play.js'), 'utf8');
  assert.match(src, /Versión: 1\.0\.0 /);
  assert.equal(PL.version, '1.0.0');
  assert.doesNotMatch(src, /localStorage\./);
  const mods = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).routes['#/builds'].map((m) => m.src);
  const i = mods.indexOf('js/bld-play.js');
  assert.ok(i > mods.indexOf('js/bld-notes.js') && i < mods.indexOf('js/bld-sheet.js'));
});

test('notes.json: concepts, opener, loop y cc son listas de textos con solo {s|t|i:ID}', () => {
  for (const [id, n] of Object.entries(DATA.notes)) {
    for (const k of PL.KEYS) {
      if (!n[k]) continue;
      assert.ok(Array.isArray(n[k]) && n[k].length && n[k].every((p) => typeof p === 'string' && p.trim()), id + '.' + k);
      n[k].forEach((p) => assert.doesNotMatch(p.replace(P.TOKEN, ''), /[{}<>]/, id + '.' + k + ': solo texto y {s|t|i:ID}'));
    }
  }
});

test('con nota: conceptos y control en párrafos, apertura y bucle numerados, íconos y nombres oficiales en línea', () => {
  const h = PL.html({ note: NOTE, loaded: true, ref: REF, gear: GEAR, source: SRC });
  assert.match(h, /^<div class="bld-play"><p class="bld-ntm"><small>Notas de Shiruvana · revisadas para el parche 29\/09\/2026<\/small><\/p>/);
  const order = ['concepts', 'opener', 'loop', 'cc'].map((k) => h.indexOf('data-play="' + k + '"'));
  assert.ok(order.every((x, j) => x > 0 && (j === 0 || x > order[j - 1])), 'en orden: conceptos, apertura, bucle, control');
  assert.match(h, /<h5 id="bldPl-opener">Apertura<\/h5><ol class="bld-pl-seq"><li><span class="bld-ntr"><img[^>]*src="https:\/\/render\.guildwars2\.com\/file\/k1\.png"[^>]*><b>Retirada &lt;b&gt;<\/b><\/span><\/li><li>/);
  assert.match(h, /aria-labelledby="bldPl-concepts"><h5 id="bldPl-concepts">Conceptos<\/h5><p>Vivís de <span class="bld-ntr">/);
  assert.match(h, /<b>Reliquia de Fuego<\/b>/);
  assert.match(h, /Control \(barra de desafío\)<\/h5><p>Guardá [\s\S]*&lt;x&gt;\.<\/p>/);
  assert.match(h, /La rotación completa, paso a paso, está en la guía original: <a href="https:\/\/snowcrows\.com\/builds\/raids\/thief\/x" target="_blank" rel="noopener">Snow Crows ↗<\/a>/);
  assert.doesNotMatch(h, /para revisar/);
  assert.match(PL.html({ note: Object.assign({ review: true }, NOTE), loaded: true }), /para revisar: la build cambió/);
});

test('partes vacías no se muestran; sin nada para jugar, «en preparación» con el enlace; mientras carga, lo dice', () => {
  const h = PL.html({ note: { patch: '2026-09-29', skills: ['x'], opener: ['  '], loop: ['{s:13026}'] }, loaded: true, ref: REF, source: SRC });
  assert.doesNotMatch(h, /data-play="(concepts|opener|cc)"/);
  assert.match(h, /data-play="loop"/);
  assert.equal(PL.hasPlay({ skills: ['solo notas de habilidades'] }), false);
  const none = PL.html({ note: { skills: ['x'] }, loaded: true, source: SRC });
  assert.match(none, /están en preparación\.<\/p><p class="bld-muted bld-pl-src">Mientras, la rotación completa está en la guía original: <a /);
  assert.match(PL.html({ note: null, loaded: true }), /en preparación\.<\/p>$/, 'sin fuente, sin enlace');
  assert.match(PL.html({ loaded: false }), /role="status">Buscando mis notas para jugarla…/);
});

test('sin bld-notes, el texto sigue escapado y las referencias quedan como #ID', () => {
  const save = globalThis.GNBldNotes;
  delete globalThis.GNBldNotes;
  assert.equal(P.inline('Usá {s:13021} <y>', REF, null), 'Usá <b>#13021</b> &lt;y&gt;');
  globalThis.GNBldNotes = save;
  assert.match(P.inline('Usá {s:13021}', REF, null), /<b>Retirada &lt;b&gt;<\/b>/);
});

test('CSS: tokens de los temas, foco visible', () => {
  assert.doesNotMatch(P.CSS, /:\s*#[0-9a-fA-F]{3,8}/);
  assert.match(P.CSS, /\.bld-pl-src a:focus-visible\{outline:2px solid var\(--gn-mod\)/);
});
