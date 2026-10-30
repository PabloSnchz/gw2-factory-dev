// BL-084 EQ-6: desplegables de notas de la ficha (js/bld-notes.js) y assets/data/builds/notes.json. Sin red.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
globalThis.GNBldShow = require('../js/bld-show.js');
globalThis.GNBldItems = require('../js/bld-items.js');
const N = require('../js/bld-notes.js');
const P = N._pure;
const RG = 'https://render.guildwars2.com/file/';
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/notes.json'), 'utf8'));
const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/builds/catalog.json'), 'utf8'));

const REF = { skills: { 13021: { id: 13021, name: 'Retirada <b>', icon: RG + 'k1.png', description: '<c=@reminder>Te</c> cura.' } },
  traits: { 1510: { id: 1510, name: 'Golpe preciso', icon: RG + 't1.png', description: 'Más daño.' } } };
const VIEW = { land: [REF.skills[13021], null, null, null, { id: 5, name: 'Élite', icon: RG + 'k5.png', description: 'Grande.' }],
  specs: [{ traits: [REF.traits[1510], null, null] }, { traits: [null, null, null] }, { traits: [REF.traits[1510], null, null] }] };
const GEAR = { rune: { id: 24836, name: 'Runa del erudito', icon: RG + 'r.png', bonuses: ['+25 de potencia', '+10 % de daño'] },
  armor: [{ item: { id: 1, name: 'Visor' }, rune: null }], trinkets: [], relic: { id: 100, name: 'Reliquia de Fuego', icon: RG + 'rel.png', effect: 'Quema.' },
  amulet: null, extras: [], sets: [{ hands: [{ item: { id: 2, name: 'Espada' }, sigils: [{ id: 24615, name: 'Sigilo de fuerza', icon: RG + 's.png', buff: 'Poder.' },
    { id: 9, name: '#9', missing: true }] }] }] };

test('versión en la cabecera, en modules.json antes de la ficha; sin estado guardado', () => {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'bld-notes.js'), 'utf8');
  assert.match(src, /Versión: 1\.1\.0 /);
  assert.equal(N.version, '1.1.0');
  assert.doesNotMatch(src, /localStorage\./);
  const mods = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'modules.json'), 'utf8')).routes['#/builds'].map((m) => m.src);
  assert.ok(mods.indexOf('js/bld-notes.js') >= 0 && mods.indexOf('js/bld-notes.js') < mods.indexOf('js/bld-sheet.js'));
});

test('notes.json: forma fija; cada nota es de una build que existe, con párrafos y referencias válidas', () => {
  assert.equal(DATA.version, 1);
  assert.equal(typeof DATA.notes, 'object');
  const ids = new Set(CAT.builds.map((b) => b.id));
  for (const [id, n] of Object.entries(DATA.notes)) {
    assert.ok(ids.has(id), 'nota de una build que no está: ' + id);
    if (n.patch) assert.match(n.patch, /^\d{4}-\d{2}-\d{2}$/);
    for (const k of Object.keys(n)) assert.ok(['patch', 'review', 'skills', 'traits', 'gear', 'relic', 'concepts', 'opener', 'loop', 'cc'].includes(k), id + ': ' + k);
    for (const k of ['skills', 'traits', 'gear', 'relic']) {
      if (!n[k]) continue;
      assert.ok(Array.isArray(n[k]) && n[k].every((p) => typeof p === 'string' && p.trim()), id + '.' + k);
      n[k].forEach((p) => assert.doesNotMatch(p.replace(P.TOKEN, ''), /[{}<>]/, id + '.' + k + ': solo texto y {s|t|i:ID}'));
    }
  }
});

test('párrafo: texto escapado y {s|t|i:ID} con ícono y nombre oficial; lo desconocido queda como #ID', () => {
  const look = P.lookup(REF, GEAR);
  const h = P.para('Usá {s:13021} con {t:1510} y {i:24836}; {i:77} <x>', look);
  assert.match(h, /<span class="bld-ntr"><img[^>]*src="https:\/\/render\.guildwars2\.com\/file\/k1\.png"[^>]*><b>Retirada &lt;b&gt;<\/b><\/span>/);
  assert.match(h, /<b>Golpe preciso<\/b>/);
  assert.match(h, /<b>Runa del erudito<\/b>/);
  assert.match(h, /<b>#77<\/b> &lt;x&gt;<\/p>$/);
  assert.equal(P.itemsOf(GEAR)[9], undefined, 'lo que la API no tiene no se usa');
});

test('EQ-7: inline() es el párrafo sin <p>, con las mismas referencias', () => {
  const t = 'Usá {s:13021} y {i:24836} <y>';
  const h = N.inline(t, REF, GEAR);
  assert.equal('<p>' + h + '</p>', P.para(t, P.lookup(REF, GEAR)));
  assert.match(h, /<b>Runa del erudito<\/b>/);
  assert.doesNotMatch(h, /<p>/);
  assert.equal(N.inline('{s:1}', null, null), '<b>#1</b>');
});

test('descripción oficial: barra, rasgos elegidos sin repetir, runa con bonos numerados y sigilos, amuleto, reliquia', () => {
  const sk = P.official('skills', VIEW, GEAR);
  assert.deepEqual(sk.map((x) => x.name), ['Retirada <b>', 'Élite']);
  assert.deepEqual(sk[0].lines, ['Te cura.']);
  assert.deepEqual(P.official('traits', VIEW, GEAR).map((x) => x.name), ['Golpe preciso'], 'una sola vez aunque esté en dos líneas');
  const g = P.official('gear', VIEW, GEAR);
  assert.deepEqual(g.map((x) => x.name), ['Runa del erudito', 'Sigilo de fuerza']);
  assert.deepEqual(g[0].lines, ['(1) +25 de potencia', '(2) +10 % de daño']);
  assert.deepEqual(P.official('relic', VIEW, GEAR)[0].lines, ['Quema.']);
  const pvp = P.official('gear', VIEW, { amulet: { id: 8, name: 'Amuleto de berserker', attrs: [['Power', 1200], ['Precision', 900]] } });
  assert.deepEqual(pvp[0].lines, ['Potencia 1200, Precisión 900']);
  assert.deepEqual(P.official('relic', VIEW, null), []);
});

test('HTML: desplegables cerrados, nota con su parche y aviso de revisión; sin nota, «en preparación»; mientras carga, lo dice', () => {
  const note = { patch: '2026-09-29', review: true, skills: ['Abrí con {s:13021}.'] };
  const h = N.html({ keys: ['skills', 'traits'], note, loaded: true, ref: REF, view: VIEW, gear: GEAR });
  assert.match(h, /^<div class="bld-nts"><details class="bld-nt" data-note="skills"><summary>Notas de habilidades<\/summary>/);
  assert.doesNotMatch(h, /<details[^>]* open/, 'cerrados, como en Snow Crows');
  assert.match(h, /Notas de Shiruvana · revisadas para el parche 29\/09\/2026/);
  assert.match(h, /para revisar: la build cambió/);
  assert.match(h, /<p>Abrí con <span class="bld-ntr">/);
  assert.match(h, /<summary>Notas de rasgos <small>\(en preparación\)<\/small><\/summary>[\s\S]*Nota en preparación\./);
  assert.match(h, /Descripción oficial · API de Guild Wars 2 en castellano/);
  assert.match(h, /<b>Golpe preciso<\/b><span>Más daño\.<\/span>/);
  const wait = N.html({ keys: ['gear'], loaded: false, gear: GEAR });
  assert.match(wait, /role="status">Buscando mis notas…/);
  assert.match(wait, /<summary>Notas de equipo<\/summary>/);
  assert.equal(N.html({ keys: ['nada'] }), '');
  assert.match(N.html({ keys: ['relic'], loaded: true, gear: GEAR }), /<b>Reliquia de Fuego<\/b><span>Quema\.<\/span>/);
});

test('load: un pedido por visita sin caché del navegador; si falla, se puede reintentar y no deja la ficha esperando', async () => {
  N._test.reset();
  let n = 0;
  const ok = async (u, o) => { n++; assert.equal(u, 'assets/data/builds/notes.json'); assert.equal(o.cache, 'no-cache'); return { ok: true, json: async () => ({ notes: { x: { skills: ['a'] } } }) }; };
  assert.equal(N.loaded(), false);
  await N.load({ fetch: ok });
  await N.load({ fetch: ok });
  assert.equal(n, 1);
  assert.deepEqual(N.noteSync('x'), { skills: ['a'] });
  assert.equal(N.noteSync('y'), null);
  N._test.reset();
  await assert.rejects(N.load({ fetch: async () => ({ ok: false, status: 404 }) }), /404/);
  assert.equal(N.loaded(), true, 'falló: la ficha muestra «en preparación», no se queda buscando');
  await N.load({ fetch: ok });
  assert.equal(N.noteSync('x').skills[0], 'a');
  N._test.reset();
});

test('CSS: tokens de los temas, foco visible', () => {
  assert.doesNotMatch(P.CSS, /:\s*#[0-9a-fA-F]{3,8}/);
  assert.match(P.CSS, /\.bld-nt>summary:focus-visible\{outline:2px solid var\(--gn-mod\)/);
});
