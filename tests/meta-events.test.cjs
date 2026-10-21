// BL-034 — Datos de Meta & Eventos: esquema válido y horarios de Janthir Wilds / Visions of Eternity.
// Horarios verificados en al menos 3 fuentes (LES-026): wiki oficial (Event timers), GuildJen,
// Le Bus Magique, buildop, Aeronef y Convergence Corp.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const raw = fs.readFileSync(path.join(ROOT, 'assets/meta-events.json'), 'utf8').replace(/^\uFEFF/, '');
const metas = JSON.parse(raw);
const byId = Object.fromEntries(metas.map(m => [m.id, m]));

// Claves de EXP_MAP en js/meta.js: toda expansión del JSON tiene que normalizarse (ícono y color).
const metaJs = fs.readFileSync(path.join(ROOT, 'js/meta.js'), 'utf8');
const expBlock = metaJs.match(/const EXP_MAP = \{([\s\S]*?)\};/)[1];
const EXP_KEYS = new Set([...expBlock.matchAll(/'([^']+)'\s*:/g)].map(m => m[1]));

// Opciones del filtro "Tipo" en index.html.
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const typeSelect = indexHtml.match(/<select id="metaType">([\s\S]*?)<\/select>/)[1];
const TYPE_OPTIONS = [...typeSelect.matchAll(/value="([^"]+)"/g)].map(m => m[1]);

function every(start, hours) {
  const [h, m] = start.split(':').map(Number);
  const out = [];
  for (let t = h * 60 + m; t < 1440; t += hours * 60) {
    out.push(String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'));
  }
  return out;
}

test('esquema: ids únicos, campos obligatorios y ventanas HH:MM ordenadas', () => {
  const ids = new Set();
  for (const m of metas) {
    assert.ok(!ids.has(m.id), `id duplicado: ${m.id}`);
    ids.add(m.id);
    for (const k of ['id', 'name', 'type', 'expansion', 'map', 'wiki', 'chat']) {
      assert.equal(typeof m[k], 'string', `${m.id}: ${k}`);
      assert.ok(m[k].length > 0, `${m.id}: ${k} vacío`);
    }
    assert.match(m.chat, /^\[&[A-Za-z0-9+/]+=*\]$/, `${m.id}: chat link`);
    assert.match(m.wiki, /^https:\/\//, `${m.id}: wiki`);
    assert.ok(Array.isArray(m.windowsUTC), `${m.id}: windowsUTC`);
    for (const w of m.windowsUTC) assert.match(w, /^([01]\d|2[0-3]):[0-5]\d$/, `${m.id}: ${w}`);
    assert.deepEqual([...m.windowsUTC].sort(), m.windowsUTC, `${m.id}: ventanas desordenadas`);
    assert.equal(new Set(m.windowsUTC).size, m.windowsUTC.length, `${m.id}: ventanas repetidas`);
    assert.ok(Number.isInteger(m.durationMin) && m.durationMin > 0, `${m.id}: durationMin`);
    assert.equal(typeof m.api, 'object', `${m.id}: api`);
  }
});

test('toda expansión se normaliza con EXP_MAP de meta.js', () => {
  for (const m of metas) {
    assert.ok(EXP_KEYS.has(m.expansion.toLowerCase()), `${m.id}: expansión sin mapear "${m.expansion}"`);
  }
});

test('el filtro "Convergence" de index.html encuentra las convergencias', () => {
  assert.ok(TYPE_OPTIONS.includes('convergence'));
  const conv = metas.filter(m => m.type === 'convergence').map(m => m.id).sort();
  assert.deepEqual(conv, ['convergence_mount_balrior', 'convergence_nexus_of_eternity', 'convergences']);
});

const EXPECTED = {
  // Janthir Wilds
  of_mists_and_monsters:         { expansion: 'Janthir', windows: every('00:30', 2), chat: '[&BCoPAAA=]' },
  a_titanic_voyage:              { expansion: 'Janthir', windows: every('01:20', 2), chat: '[&BGEPAAA=]' },
  convergence_mount_balrior:     { expansion: 'Janthir', windows: every('00:00', 3), chat: '[&BK4OAAA=]' },
  // Visions of Eternity
  secrets_of_the_weald:          { expansion: 'Visions of Eternity', windows: every('01:40', 2), chat: '[&BJ4PAAA=]' },
  hammerhart_rumble:             { expansion: 'Visions of Eternity', windows: every('00:40', 2), chat: '[&BJEPAAA=]' },
  shackles_of_the_ancients:      { expansion: 'Visions of Eternity', windows: every('01:10', 2), chat: '[&BP8PAAA=]' },
  depths_of_cruelty:             { expansion: 'Visions of Eternity', windows: every('02:00', 3), chat: '[&BDYQAAA=]' },
  convergence_nexus_of_eternity: { expansion: 'Visions of Eternity', windows: every('01:00', 3), chat: '[&BDYQAAA=]' },
  // SotO: la convergencia genérica es Nayos Exterior
  convergences:                  { expansion: 'SotO', windows: every('01:30', 3), chat: '[&BB8OAAA=]' }
};

for (const [id, exp] of Object.entries(EXPECTED)) {
  test(`horarios de ${id}`, () => {
    const m = byId[id];
    assert.ok(m, `falta ${id}`);
    assert.equal(m.expansion, exp.expansion);
    assert.deepEqual(m.windowsUTC, exp.windows);
    assert.equal(m.chat, exp.chat);
    assert.match(m.wiki, /^https:\/\/wiki\.guildwars2\.com\/wiki\//);
  });
}

test('cobertura mínima: 3 entradas de Janthir y 5 de Visions of Eternity', () => {
  assert.ok(metas.filter(m => m.expansion === 'Janthir').length >= 3);
  assert.ok(metas.filter(m => m.expansion === 'Visions of Eternity').length >= 5);
});
