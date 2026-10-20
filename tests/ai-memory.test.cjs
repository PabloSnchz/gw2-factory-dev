// Chequeos de la memoria oficial de la Factory (BL-006, LES-008). Corren con: node --test tests/*.test.cjs
// - Archivos obligatorios presentes.
// - Todos los .md en UTF-8 válido y sin BOM.
// - Todo enlace relativo de memory-index.md apunta a un archivo que existe.
// - status.md tiene las claves que lee el panel (DEC-009).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const MEM = path.join(__dirname, '..', 'ai-memory');
const REQUIRED = ['status.md', 'backlog.md', 'memory-index.md', 'roadmap.md', 'risks.md'];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const mdFiles = walk(MEM).filter((p) => p.endsWith('.md'));

test('existen los archivos obligatorios de ai-memory', () => {
  for (const f of REQUIRED) assert.ok(fs.existsSync(path.join(MEM, f)), 'falta ai-memory/' + f);
});

test('todos los .md de ai-memory están en UTF-8 válido y sin BOM', () => {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  assert.ok(mdFiles.length >= REQUIRED.length);
  for (const p of mdFiles) {
    const buf = fs.readFileSync(p);
    const rel = path.relative(MEM, p);
    assert.ok(!(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf), rel + ' empieza con BOM');
    assert.doesNotThrow(() => decoder.decode(buf), rel + ' no es UTF-8 válido');
  }
});

test('los enlaces de memory-index.md apuntan a archivos que existen', () => {
  const index = fs.readFileSync(path.join(MEM, 'memory-index.md'), 'utf8');
  const links = [...index.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]).filter((l) => !/^[a-z]+:/i.test(l));
  assert.ok(links.length > 0, 'memory-index.md no tiene enlaces');
  for (const l of links) {
    const target = path.join(MEM, l.split('#')[0]);
    assert.ok(fs.existsSync(target), 'enlace roto en memory-index.md: ' + l);
  }
});

test('status.md tiene las claves que lee el panel', () => {
  const status = fs.readFileSync(path.join(MEM, 'status.md'), 'utf8');
  for (const key of ['Estado', 'Tarea actual', 'Motivo', 'Etapa actual', 'Próxima acción']) {
    assert.match(status, new RegExp('^' + key + ': \\S', 'm'), 'status.md sin "' + key + ':"');
  }
});
