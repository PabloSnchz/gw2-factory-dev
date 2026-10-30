// Canal de recursos (.github/scripts/factory-asset.cjs). Sin red: el que baja se inyecta.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const A = require('./factory-asset.cjs');

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]), Buffer.from('IHDR'),
  Buffer.from([0, 0, 0, 32, 0, 0, 0, 32, 8, 6, 0, 0, 0]), Buffer.alloc(20)]);
function repo() { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'asset-')); fs.mkdirSync(path.join(d, 'factory/assets'), { recursive: true }); return d; }
function put(d, n, obj) { fs.writeFileSync(path.join(d, 'factory/assets/ASSET-' + n + '.json'), JSON.stringify(obj)); }
const now = () => 't0';

test('valida host, ruta, cantidad y que no pise archivos', () => {
  assert.deepEqual(A.validate({ id: 'ASSET-001', files: [{ url: 'https://assets.gw2dat.com/1.png', path: 'assets/icons/1.png' }] }), []);
  const bad = A.validate({ id: 'X', files: [
    { url: 'http://assets.gw2dat.com/1.png', path: 'assets/icons/1.png' },
    { url: 'https://evil.example/1.png', path: 'assets/icons/2.png' },
    { url: 'https://assets.gw2dat.com/1.png', path: 'js/app.js' },
    { url: 'https://assets.gw2dat.com/1.png', path: 'assets/icons/../../index.html' }] });
  assert.equal(bad.length, 5);
  const d = repo(); fs.mkdirSync(path.join(d, 'assets/icons'), { recursive: true }); fs.writeFileSync(path.join(d, 'assets/icons/9.png'), 'x');
  assert.match(A.validate({ id: 'ASSET-002', files: [{ url: 'https://assets.gw2dat.com/9.png', path: 'assets/icons/9.png' }] }, d).join(), /ya existe/);
});

test('baja, verifica la firma PNG y escribe el archivo y el resultado', async () => {
  const d = repo();
  put(d, '001', { id: 'ASSET-001', summary: 'ícono', files: [{ url: 'https://assets.gw2dat.com/156720.png', path: 'assets/icons/156720.png',
    sha256: crypto.createHash('sha256').update(PNG).digest('hex') }] });
  const res = await A.processAll(d, async () => PNG, now);
  assert.deepEqual(res[0].written, ['assets/icons/156720.png']);
  assert.ok(fs.readFileSync(path.join(d, 'assets/icons/156720.png')).equals(PNG));
  const md = fs.readFileSync(path.join(d, 'factory/assets/ASSET-001.md'), 'utf8');
  assert.match(md, /APLICADO/);
  assert.match(md, /32×32/);
  assert.deepEqual(A.pending(d), [], 'con su resultado escrito, ya no está pendiente');
});

test('todo o nada: si un archivo no es lo que dice, no escribe ninguno', async () => {
  const d = repo();
  put(d, '002', { id: 'ASSET-002', files: [
    { url: 'https://assets.gw2dat.com/1.png', path: 'assets/icons/a.png' },
    { url: 'https://assets.gw2dat.com/2.png', path: 'assets/icons/b.png' }] });
  const res = await A.processAll(d, async (u) => (u.endsWith('1.png') ? PNG : Buffer.from('<!DOCTYPE html>')), now);
  assert.equal(res[0].written.length, 0);
  assert.ok(!fs.existsSync(path.join(d, 'assets/icons/a.png')));
  assert.match(fs.readFileSync(path.join(d, 'factory/assets/ASSET-002.md'), 'utf8'), /RECHAZADO[\s\S]*no es un PNG real/);
});

test('rechaza sha256 distinto, archivos grandes y errores de red', async () => {
  assert.match(A.check({ path: 'assets/icons/a.png', sha256: '0'.repeat(64) }, PNG), /sha256 distinto/);
  assert.match(A.check({ path: 'assets/icons/a.png' }, Buffer.concat([PNG, Buffer.alloc(A.MAX_BYTES)])), /pesa/);
  const d = repo();
  put(d, '003', { id: 'ASSET-003', files: [{ url: 'https://assets.gw2dat.com/1.png', path: 'assets/icons/c.png' }] });
  const res = await A.processAll(d, async () => { throw new Error('HTTP 404'); }, now);
  assert.match(res[0].errs.join(), /no pude bajarlo \(HTTP 404\)/);
});
