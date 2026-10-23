// Canal de parches (DEC-035, BL-065, FP-1). Corre con: node --test .github/scripts/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const P = require('./apply-patch.cjs');

const HTML = '<head>\n<meta name="viewport" content="width=device-width">\n<script src="js/a.js"></script>\n</head>\n';
const SHA = P.blobSha(HTML);
const patchOf = (ops, extra) => Object.assign({ id: 'PATCH-001', summary: 'prueba',
  files: [{ path: 'index.html', base_sha: SHA, ops }] }, extra || {});
const reader = (files) => (p) => (Object.prototype.hasOwnProperty.call(files, p) ? files[p] : null);

test('blobSha es el sha de git (el que muestra GitHub)', () => {
  assert.equal(P.blobSha(''), 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391');
  assert.equal(P.blobSha('hello world\n'), '3b18e512dba79e4c8300dd08aeb37f8e728b8dad');
  assert.equal(P.blobSha(Buffer.from('ñ', 'utf8')), P.blobSha('ñ'), 'bytes, no caracteres');
  // Oráculo independiente: «ñ» son 2 bytes en UTF-8 (las tildes de la Bóveda).
  const crypto = require('node:crypto');
  const ref = crypto.createHash('sha1').update('blob 2\0ñ').digest('hex');
  assert.equal(P.blobSha('ñ'), ref);
  assert.equal(P.blobSha(Buffer.from('ñ', 'utf8')), ref);
});

test('insert_before e insert_after quedan del lado correcto del ancla', () => {
  assert.equal(P.applyOps('[A]', [{ op: 'insert_after', anchor: 'A', text: 'x' }]), '[Ax]');
  assert.equal(P.applyOps('[A]', [{ op: 'insert_before', anchor: 'A', text: 'x' }]), '[xA]');
  assert.equal(P.applyOps('[A]', [{ op: 'replace', anchor: 'A', text: 'x' }]), '[x]');
  assert.equal(P.applyOps('[A]', [{ op: 'delete', anchor: 'A' }]), '[]');
});

test('las cuatro operaciones, en orden y sobre el resultado anterior', () => {
  const out = P.applyOps(HTML, [
    { op: 'replace', anchor: 'width=device-width"', text: 'width=device-width, viewport-fit=cover"' },
    { op: 'insert_after', anchor: '<script src="js/a.js"></script>\n', text: '<script src="js/boot.js"></script>\n' },
    { op: 'insert_before', anchor: '</head>', text: '<!-- fin -->\n' },
    { op: 'delete', anchor: '<script src="js/a.js"></script>\n' }
  ]);
  assert.equal(out, '<head>\n<meta name="viewport" content="width=device-width, viewport-fit=cover">\n' +
    '<script src="js/boot.js"></script>\n<!-- fin -->\n</head>\n');
});

test('ancla única: 0 o 2 apariciones rechazan, también si se solapan', () => {
  assert.throws(() => P.applyOps(HTML, [{ op: 'delete', anchor: 'no-existe' }]), /aparece 0 veces/);
  assert.throws(() => P.applyOps(HTML, [{ op: 'replace', anchor: 'script', text: 'x' }]), /aparece 2 veces/);
  assert.equal(P.count('aaa', 'aa'), 2);
  // La segunda operación ve el resultado de la primera: ahora el ancla aparece dos veces.
  assert.throws(() => P.applyOps(HTML, [
    { op: 'insert_after', anchor: '<head>\n', text: '</head>\n' },
    { op: 'delete', anchor: '</head>' }
  ]), /ops\[1\] \(delete\): el ancla aparece 2 veces/);
});

test('el texto es literal: ni $& ni $1 ni regex', () => {
  const out = P.applyOps('a.b', [{ op: 'replace', anchor: 'a.b', text: '$& $1 $$ $`' }]);
  assert.equal(out, '$& $1 $$ $`');
  assert.throws(() => P.applyOps('axb', [{ op: 'delete', anchor: 'a.b' }]), /aparece 0 veces/);
});

test('un parche que no cambia nada se rechaza', () => {
  assert.throws(() => P.applyOps(HTML, [{ op: 'replace', anchor: '</head>', text: '</head>' }]), /no cambian el archivo/);
});

test('rutas: solo la app y la documentación; nunca .github, .git, absolutas ni con ..', () => {
  ['index.html', 'js/meta.js', 'css/themes/x.css', 'docs/a.md', 'ai-memory/status.md', 'CHANGELOG.md'].forEach((p) =>
    assert.equal(P.safePath(p), '', p));
  const bad = { '.github/workflows/x.yml': /fuera/, '.git/config': /fuera/, 'factory/patches/PATCH-002.json': /fuera/,
    '/etc/passwd': /absoluta/, 'C:/x': /absoluta/, 'js/../.github/x': /normalizada/, './index.html': /normalizada/,
    'js//a.js': /normalizada/, 'js\\a.js': /caracteres/, '': /vacía/, 'js/a\0.js': /caracteres/, 'package.json': /fuera/ };
  Object.keys(bad).forEach((p) => assert.match(P.safePath(p), bad[p], JSON.stringify(p)));
  assert.match(P.safePath(undefined), /vacía/);
});

test('forma del parche: id, summary, sha, ops conocidas y límites', () => {
  assert.deepEqual(P.validate(patchOf([{ op: 'delete', anchor: 'x' }])), []);
  assert.deepEqual(P.validate(null), ['el parche no es un objeto']);
  assert.deepEqual(P.validate([]), ['el parche no es un objeto']);
  const e = (p) => P.validate(p).join(' | ');
  assert.match(e(patchOf([{ op: 'delete', anchor: 'x' }], { id: 'PATCH-1' })), /id inválido/);
  assert.match(e(patchOf([{ op: 'delete', anchor: 'x' }], { summary: '  ' })), /falta summary/);
  assert.match(e({ id: 'PATCH-001', summary: 's', files: [] }), /files vacío/);
  assert.match(e({ id: 'PATCH-001', summary: 's', files: [null] }), /no es un objeto/);
  assert.match(e({ id: 'PATCH-001', summary: 's', files: [{ path: 'index.html', base_sha: 'abc', ops: [{ op: 'delete', anchor: 'x' }] }] }), /base_sha inválido/);
  assert.match(e({ id: 'PATCH-001', summary: 's', files: [{ path: 'index.html', base_sha: SHA.toUpperCase(), ops: [{ op: 'delete', anchor: 'x' }] }] }), /base_sha inválido/);
  assert.match(e(patchOf([])), /ops vacío/);
  assert.match(e(patchOf([{ op: 'regex', anchor: 'x', text: 'y' }])), /op desconocida/);
  assert.match(e(patchOf([null])), /op desconocida/);
  assert.match(e(patchOf([{ op: 'replace', anchor: '', text: 'y' }])), /anchor vacío/);
  assert.match(e(patchOf([{ op: 'replace', anchor: 'x' }])), /falta text/);
  assert.match(e(patchOf([{ op: 'insert_after', anchor: 'x', text: '' }])), /text vacío/);
  assert.deepEqual(P.validate(patchOf([{ op: 'replace', anchor: 'x', text: '' }])), [], 'replace por vacío es válido');
  assert.match(e(patchOf([{ op: 'delete', anchor: 'x', text: 'y' }])), /delete no lleva text/);
  const two = patchOf([{ op: 'delete', anchor: 'x' }]);
  two.files.push(Object.assign({}, two.files[0]));
  assert.match(e(two), /index\.html repetido/);
  const many = Array.from({ length: P.MAX_OPS + 1 }, () => ({ op: 'delete', anchor: 'x' }));
  assert.match(e(patchOf(many)), /demasiadas operaciones \(51 > 50\)/);
  assert.deepEqual(P.validate(patchOf(many.slice(1))), [], '50 entran');
  assert.match(e(patchOf([{ op: 'delete', anchor: 'x' }], { files: [{ path: '.github/x', base_sha: SHA, ops: [{ op: 'delete', anchor: 'x' }] }] })), /fuera/);
});

test('sha base: un parche sobre otra versión, o ya aplicado, se rechaza', () => {
  const p = patchOf([{ op: 'insert_before', anchor: '</head>', text: '<x>\n' }]);
  const ok = P.plan(p, reader({ 'index.html': HTML }));
  assert.equal(ok.ok, true);
  assert.equal(ok.files[0].before, SHA);
  assert.equal(ok.files[0].after, P.blobSha(ok.files[0].content));
  assert.equal(ok.files[0].bytes, Buffer.byteLength(ok.files[0].content));
  const again = P.plan(p, reader({ 'index.html': ok.files[0].content }));
  assert.equal(again.ok, false);
  assert.match(again.errors[0], /index\.html: el archivo cambió \(sha [0-9a-f]{40}, el parche espera /);
  assert.match(P.plan(p, reader({})).errors[0], /index\.html: no existe/);
  assert.match(P.plan(patchOf([]), reader({ 'index.html': HTML })).errors[0], /ops vacío/);
});

test('todo o nada: si falla el segundo archivo, el primero tampoco cambia', () => {
  const css = 'a{}\n';
  const p = { id: 'PATCH-002', summary: 'dos archivos', files: [
    { path: 'index.html', base_sha: SHA, ops: [{ op: 'insert_before', anchor: '</head>', text: '<x>\n' }] },
    { path: 'css/a.css', base_sha: P.blobSha(css), ops: [{ op: 'delete', anchor: 'b{}' }] }] };
  const r = P.plan(p, reader({ 'index.html': HTML, 'css/a.css': css }));
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /^css\/a\.css: ops\[0\] \(delete\): el ancla aparece 0 veces/);
  assert.equal(r.files, undefined, 'no devuelve nada para escribir');
});

test('RESULT: aplicado con blobs, rechazado con el motivo', () => {
  const p = patchOf([{ op: 'insert_before', anchor: '</head>', text: '<x>\n' }]);
  const ok = P.plan(p, reader({ 'index.html': HTML }));
  const md = P.result(p, ok, '2026-10-23T19:00:00Z');
  assert.match(md, /^# RESULT de PATCH-001\n\n- Fecha: 2026-10-23T19:00:00Z\n- Estado: APLICADO\n- Resumen: prueba\n/);
  assert.match(md, new RegExp('\\| `index\\.html` \\| `' + SHA + '` \\| `' + ok.files[0].after + '` \\| ' + ok.files[0].bytes + ' \\|'));
  const no = P.result(p, { ok: false, errors: ['motivo A', 'motivo B'] }, 'x');
  assert.match(no, /- Estado: RECHAZADO\n- Resumen: prueba\n\nNingún archivo cambió\. Motivo:\n\n- motivo A\n- motivo B\n$/);
  assert.match(P.result(null, { ok: false, errors: ['m'] }, 'x'), /^# RESULT de PATCH-\?\?\?\n/);
  assert.match(P.result({ id: 'PATCH-003', summary: 'dos\nlíneas  aquí' }, { ok: false, errors: ['m'] }, 'x'), /- Resumen: dos líneas aquí\n/);
});

function tmpRepo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fp1-'));
  Object.keys(files).forEach((p) => {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), files[p]);
  });
  return root;
}

test('run: aplica, escribe el archivo y el RESULT junto al parche', () => {
  const p = patchOf([{ op: 'replace', anchor: 'width=device-width"', text: 'width=device-width, viewport-fit=cover"' }]);
  const root = tmpRepo({ 'index.html': HTML, 'factory/patches/PATCH-001.json': JSON.stringify(p) });
  const r = P.run('factory/patches/PATCH-001.json', root);
  assert.equal(r.outcome.ok, true);
  assert.equal(r.resultFile, 'factory/patches/RESULT-001.md');
  assert.match(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), /viewport-fit=cover/);
  assert.match(fs.readFileSync(path.join(root, r.resultFile), 'utf8'), /Estado: APLICADO/);
  // Reenviar el mismo parche no lo aplica dos veces.
  const again = P.run('factory/patches/PATCH-001.json', root);
  assert.equal(again.outcome.ok, false);
  assert.match(fs.readFileSync(path.join(root, again.resultFile), 'utf8'), /Estado: RECHAZADO[\s\S]*el archivo cambió/);
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8').split('viewport-fit').length, 2);
});

test('run: rechazado no toca nada; JSON roto también deja RESULT', () => {
  const p = patchOf([{ op: 'delete', anchor: 'no-existe' }]);
  const root = tmpRepo({ 'index.html': HTML, 'factory/patches/PATCH-001.json': JSON.stringify(p),
    'factory/patches/PATCH-002.json': '{ roto' });
  assert.equal(P.run('factory/patches/PATCH-001.json', root).outcome.ok, false);
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), HTML);
  const r = P.run('factory/patches/PATCH-002.json', root);
  assert.equal(r.outcome.ok, false);
  assert.match(fs.readFileSync(path.join(root, 'factory/patches/RESULT-002.md'), 'utf8'),
    /# RESULT de PATCH-\?\?\?[\s\S]*RECHAZADO[\s\S]*no pude leer el parche/);
  assert.match(fs.readFileSync(path.join(root, 'factory/patches/RESULT-001.md'), 'utf8'), /aparece 0 veces/);
});

test('línea de comandos: código de salida y uso', () => {
  const script = path.join(__dirname, 'apply-patch.cjs');
  const p = patchOf([{ op: 'insert_before', anchor: '</head>', text: '<x>\n' }]);
  const root = tmpRepo({ 'index.html': HTML, 'factory/patches/PATCH-001.json': JSON.stringify(p) });
  assert.match(execFileSync('node', [script, 'factory/patches/PATCH-001.json', root]).toString(), /APLICADO/);
  assert.throws(() => execFileSync('node', [script, 'factory/patches/PATCH-001.json', root], { stdio: 'pipe' }),
    (e) => e.status === 1 && /RECHAZADO/.test(String(e.stdout)));
  assert.throws(() => execFileSync('node', [script, 'otro/PATCH-001.json', root], { stdio: 'pipe' }),
    (e) => e.status === 2 && /Uso:/.test(String(e.stderr)));
});
