// Datos de los Pact Supply Network Agents (BL-013, RSK-018). Corre con: node --test tests/*.test.cjs
// - La rotación cubre los 7 días de la semana, con un lugar por NPC y región.
// - Cada código de chat es un enlace de mapa válido de Guild Wars 2.
// - Puntos fijos verificados contra la wiki el 2026-10-21.
// - El bloque "schedule" (lector anterior) coincide con la rotación según el día de la semana.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const FILE = path.join(__dirname, '..', 'assets', 'data', 'psna-schedule.json');
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Un enlace de mapa es "[&" + base64(0x04 + id de 4 bytes) + "]".
function mapLinkId(code) {
  const m = /^\[&([A-Za-z0-9+/]{7}=)\]$/.exec(code);
  if (!m) return null;
  const buf = Buffer.from(m[1], 'base64');
  return buf.length === 5 && buf[0] === 0x04 ? buf.readUInt32LE(1) : null;
}

test('psna: la rotación tiene 7 días con 6 lugares cada uno', () => {
  assert.equal(data.resetUtcHour, 8);
  assert.equal(data.npcs.length, 6);
  assert.equal(data.regions.length, 6);
  assert.deepEqual(Object.keys(data.rotation).sort(), [...DAYS].sort());
  for (const d of DAYS) {
    const day = data.rotation[d];
    assert.equal(day.length, 6, d + ': no tiene 6 lugares');
    for (const wp of day) {
      assert.ok(wp.name && wp.name.trim(), d + ': lugar sin nombre');
      assert.ok(mapLinkId(wp.code), `${d} · ${wp.name}: código inválido ${wp.code}`);
    }
    assert.equal(new Set(day.map((w) => w.name)).size, 6, d + ': lugares repetidos');
  }
});

test('psna: puntos fijos verificados contra la wiki (2026-10-21)', () => {
  const at = (d, i) => data.rotation[d][i];
  assert.deepEqual(at('monday', 0), { name: 'Restoration Refuge', code: '[&BIcHAAA=]' });
  assert.equal(at('monday', 5).code, '[&BA8CAAA=]');
  assert.equal(at('tuesday', 0).name, 'Camp Resolve Waypoint');
  assert.equal(at('saturday', 0).name, 'Camp Resolve Waypoint');
  assert.equal(at('tuesday', 1).name, 'Desider Atum Waypoint');
  assert.equal(at('saturday', 1).name, "Gallant's Folly");
  assert.equal(at('sunday', 0).name, "Azarr's Arbor");
  assert.equal(at('wednesday', 2).name, 'Caer Shadowfain');
  assert.equal(at('thursday', 2).code, '[&BO4CAAA=]');
});

test('psna: el bloque schedule coincide con la rotación según el día de la semana', () => {
  assert.ok(Array.isArray(data.schedule) && data.schedule.length >= 7);
  for (const s of data.schedule) {
    const wd = DAYS[new Date(s.date + 'T12:00:00Z').getUTCDay()];
    assert.deepEqual(s.waypoints, data.rotation[wd], s.date + ' no coincide con ' + wd);
  }
});
