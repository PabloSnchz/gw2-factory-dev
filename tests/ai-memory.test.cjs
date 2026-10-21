// Chequeos de la memoria oficial de la Factory (BL-006, LES-008). Corren con: node --test tests/*.test.cjs
// - Archivos obligatorios presentes.
// - Todos los .md en UTF-8 válido y sin BOM.
// - Todo enlace relativo de memory-index.md apunta a un archivo que existe.
// - status.md tiene las claves que lee el panel (DEC-009).
// - Límites de carga y formato de discovery (DEC-016, DEC-017).
// - Gobernanza de pendientes (DEC-018, DEC-019) y áreas de discovery (DEC-020).
// - Manifiesto de micro-ciclo con ≤ 3 archivos (DEC-021) y riesgo en pedidos nuevos (DEC-022).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const MEM = path.join(__dirname, '..', 'ai-memory');
const REQUIRED = ['status.md', 'backlog.md', 'memory-index.md', 'roadmap.md', 'risks.md', 'discovery.md', 'discovery-archive.md'];
const MAX_READY = 5;
const MAX_OPEN_DISC = 15;
const OPEN_STATES = ['PENDIENTE', 'ANALIZADO'];
const CLOSED_STATES = ['PROMOVIDO', 'ARCHIVADO', 'DESCARTADO'];
const MAX_OPEN_DECISIONS = 3;
const MAX_MANIFEST_FILES = 3;
const RISK_REQUIRED_FROM = '2026-10-21';
const AREAS = ['cartera', 'actividades y metas', 'legendarias', 'personajes', 'comercio', 'app', 'panel', 'infraestructura'];
const CLASS_RE = /^(?:\[[A-Z]+-\d{3}\]\s*)?(Decisi[oó]n|Acci[oó]n|Validaci[oó]n|Info):\s*\S/;

// Líneas "- ..." de una sección "## Título" de status.md.
function statusSection(title) {
  const m = read('status.md').match(new RegExp('^## ' + title + '\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))', 'm'));
  return m ? m[1].split('\n').filter((l) => /^- /.test(l)).map((l) => l.slice(2).trim()) : [];
}

// Pedidos de requests/ con su estado, tipo y secciones.
function requests() {
  const dir = path.join(MEM, 'requests');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /^REQ-\d{3}.*\.md$/.test(f)).map((f) => {
    const txt = fs.readFileSync(path.join(dir, f), 'utf8');
    const meta = (k) => ((txt.match(new RegExp('^- ' + k + ':\\s*(.*)$', 'mi')) || [])[1] || '').trim();
    return {
      file: f,
      abierta: /^ABIERTA/i.test(meta('Estado')),
      decision: /^decisi[oó]n/i.test(meta('Tipo')),
      justificada: /^##\s+Por qu[eé] te lo pregunto\s*$/mi.test(txt),
      fecha: meta('Fecha').slice(0, 10),
      conRiesgo: /^##\s+Riesgo\s*$/mi.test(txt),
    };
  });
}

function read(name) { return fs.readFileSync(path.join(MEM, name), 'utf8'); }

// Devuelve las líneas "- [BL-XXX] ..." de una sección "## NOMBRE" de backlog.md.
function backlogSection(name) {
  const m = read('backlog.md').match(new RegExp('^## ' + name + '\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))', 'm'));
  return m ? m[1].split('\n').filter((l) => /^- \[BL-\d{3}\]/.test(l)) : [];
}

// Parte un archivo de discovery en entradas { id, fields } a partir de "## DISC-XXX — título".
function discEntries(name) {
  return read(name).split(/^(?=## DISC-\d{3}\b)/m).filter((b) => b.startsWith('## DISC-')).map((b) => {
    const id = b.match(/^## (DISC-\d{3})/)[1];
    const fields = {};
    for (const m of b.matchAll(/^- ([A-ZÁÉÍÓÚa-záéíóúñ ]+?):[ \t]*(.*)$/gm)) fields[m[1].trim()] = m[2].trim();
    return { id, fields };
  });
}

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

test('READY del backlog no supera el límite de 5 tareas (DEC-016)', () => {
  const ready = backlogSection('READY');
  assert.ok(ready.length <= MAX_READY, `READY tiene ${ready.length} tareas (máximo ${MAX_READY}): ` + ready.map((l) => l.slice(2, 10)).join(' '));
});

test('discovery.md: formato válido y como máximo 15 oportunidades abiertas (DEC-016)', () => {
  const entries = discEntries('discovery.md');
  for (const { id, fields } of entries) {
    for (const f of ['Estado', 'Fecha', 'Última revisión', 'Fuente', 'Problema', 'Valor', 'Prioridad']) {
      assert.ok(f in fields, `${id} sin campo "${f}"`);
    }
    assert.ok([...OPEN_STATES, ...CLOSED_STATES].includes(fields.Estado), `${id}: estado inválido "${fields.Estado}"`);
    assert.match(fields.Prioridad, /^(ALTA|MEDIA|BAJA)\b/, `${id}: prioridad inválida`);
  }
  const open = entries.filter((e) => OPEN_STATES.includes(e.fields.Estado));
  assert.ok(open.length <= MAX_OPEN_DISC, `${open.length} oportunidades abiertas (máximo ${MAX_OPEN_DISC})`);
});

test('discovery-archive.md: toda salida tiene estado final, fecha, motivo y responsable', () => {
  for (const { id, fields } of discEntries('discovery-archive.md')) {
    assert.ok(CLOSED_STATES.includes(fields.Estado), `${id}: estado de archivo inválido "${fields.Estado}"`);
    for (const f of ['Fecha de salida', 'Motivo', 'Responsable']) {
      assert.ok(fields[f], `${id} archivada sin "${f}"`);
    }
  }
});

test('cada DISC aparece una sola vez entre discovery y su archivo', () => {
  const ids = [...discEntries('discovery.md'), ...discEntries('discovery-archive.md')].map((e) => e.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(dup, [], 'DISC duplicados: ' + dup.join(', '));
});

test('status.md: cada línea de "Esperando a Pablo" declara su clase (DEC-018, DEC-019)', () => {
  for (const l of statusSection('Esperando a Pablo')) {
    assert.match(l, CLASS_RE, 'línea sin clase (Decisión:, Acción:, Validación: o Info:): ' + l.slice(0, 80));
  }
});

test('pedidos de decisión abiertos: justificados y como máximo 3 (DEC-018, DEC-019)', () => {
  const open = requests().filter((r) => r.abierta && r.decision);
  for (const r of open) assert.ok(r.justificada, `${r.file}: decisión sin "## Por qué te lo pregunto"`);
  assert.ok(open.length <= MAX_OPEN_DECISIONS, `${open.length} decisiones abiertas para Pablo (máximo ${MAX_OPEN_DECISIONS})`);
});

test('backlog: cada tarea bloqueada declara su dueño (DEC-019)', () => {
  for (const l of backlogSection('BLOCKED')) {
    const m = l.match(/Bloqueado por (Pablo|Factory|entorno):/);
    assert.ok(m, 'BLOCKED sin dueño ("Bloqueado por Pablo|Factory|entorno:"): ' + l.slice(2, 12));
    if (m[1] !== 'Pablo') assert.doesNotMatch(l, /pablo/i, `${l.slice(2, 12)}: bloqueado por ${m[1]} no debe mencionar a Pablo (llegaría a su cola)`);
  }
});

test('discovery.md: cada idea abierta tiene un área válida (DEC-020)', () => {
  for (const { id, fields } of discEntries('discovery.md')) {
    if (!OPEN_STATES.includes(fields.Estado)) continue;
    assert.ok(AREAS.includes((fields['Área'] || '').toLowerCase()), `${id}: área inválida o ausente "${fields['Área'] || ''}"`);
  }
});

test('status.md: el manifiesto del micro-ciclo lista como máximo 3 archivos (DEC-021)', () => {
  const m = read('status.md').match(/^Archivos:\s*\n((?:- .*\n?)*)/m);
  if (!m) return;
  const files = m[1].split('\n').filter((l) => /^- \S/.test(l));
  assert.ok(files.length <= MAX_MANIFEST_FILES, `el manifiesto lista ${files.length} archivos (máximo ${MAX_MANIFEST_FILES}): dividir el micro-ciclo`);
});

test('pedidos de decisión abiertos desde el 2026-10-21 traen "## Riesgo" (DEC-022)', () => {
  for (const r of requests().filter((q) => q.abierta && q.decision && q.fecha >= RISK_REQUIRED_FROM)) {
    assert.ok(r.conRiesgo, `${r.file}: decisión sin "## Riesgo"`);
  }
});
