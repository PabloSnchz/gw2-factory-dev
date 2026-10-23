// Canal de parches de la Factory (DEC-035, BL-065).
// Aplica un parche chico (factory/patches/PATCH-NNN.json) sobre archivos que
// no entran en una publicación de la Factory (LES-028).
//
// Reglas (todas o el parche entero se rechaza, sin tocar nada):
// - cada ancla aparece EXACTAMENTE una vez en el archivo, en el momento de aplicar su operación;
// - cada archivo declara el blob sha base esperado (`git hash-object`): si no
//   coincide, el parche se escribió sobre otra versión, o ya se aplicó;
// - todo o nada: se calcula en memoria y se escribe solo si todo pasó;
// - reemplazo literal: el texto nunca se interpreta (ni regex ni `$&`);
// - solo rutas de la app y la documentación; nunca `.github/`, `.git/` ni el propio canal;
// - el resultado se escribe en el repo (RESULT-NNN.md): la Factory no lee CI (RSK-016).
//
// Uso: node .github/scripts/apply-patch.cjs factory/patches/PATCH-001.json [raíz]
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const OPS = ['replace', 'insert_before', 'insert_after', 'delete'];
const MAX_OPS = 50;
const ID_RE = /^PATCH-\d{3,}$/;
const SHA_RE = /^[0-9a-f]{40}$/;
const ALLOWED = [/^index\.html$/, /^privacy\.html$/, /^CHANGELOG\.md$/, /^README\.md$/,
  /^js\//, /^css\//, /^assets\//, /^docs\//, /^tests\//, /^tools\//, /^ai-memory\//];

// El mismo sha que GitHub muestra para el archivo (blob de git).
function blobSha(content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(String(content), 'utf8');
  return crypto.createHash('sha1').update('blob ' + buf.length + '\0').update(buf).digest('hex');
}

function safePath(p) {
  if (typeof p !== 'string' || !p) return 'ruta vacía';
  if (p.indexOf('\\') !== -1 || p.indexOf('\0') !== -1) return 'ruta con caracteres no permitidos';
  if (path.posix.isAbsolute(p) || /^[a-zA-Z]:/.test(p)) return 'ruta absoluta';
  const parts = p.split('/');
  if (path.posix.normalize(p) !== p || parts.indexOf('..') !== -1 || parts.indexOf('.') !== -1) {
    return 'ruta no normalizada';
  }
  if (!ALLOWED.some((re) => re.test(p))) return 'ruta fuera de lo que el canal puede tocar';
  return '';
}

// Valida la forma del parche. Devuelve la lista de errores (vacía si está bien).
function validate(patch) {
  const errs = [];
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return ['el parche no es un objeto'];
  if (!ID_RE.test(String(patch.id || ''))) errs.push('id inválido (se espera PATCH-NNN)');
  if (typeof patch.summary !== 'string' || !patch.summary.trim()) errs.push('falta summary');
  if (!Array.isArray(patch.files) || !patch.files.length) return errs.concat('files vacío');
  const seen = {};
  let total = 0;
  patch.files.forEach((f, i) => {
    const where = 'files[' + i + ']';
    if (!f || typeof f !== 'object') { errs.push(where + ': no es un objeto'); return; }
    const bad = safePath(f.path);
    if (bad) errs.push(where + ': ' + bad + ' (' + String(f.path) + ')');
    if (seen[f.path]) errs.push(where + ': ' + f.path + ' repetido');
    seen[f.path] = true;
    if (!SHA_RE.test(String(f.base_sha || ''))) errs.push(where + ': base_sha inválido');
    if (!Array.isArray(f.ops) || !f.ops.length) { errs.push(where + ': ops vacío'); return; }
    total += f.ops.length;
    f.ops.forEach((o, j) => {
      const w = where + '.ops[' + j + ']';
      if (!o || OPS.indexOf(o.op) === -1) { errs.push(w + ': op desconocida'); return; }
      if (typeof o.anchor !== 'string' || !o.anchor) errs.push(w + ': anchor vacío');
      if (o.op === 'delete') {
        if (o.text !== undefined) errs.push(w + ': delete no lleva text');
      } else if (typeof o.text !== 'string') {
        errs.push(w + ': falta text');
      } else if (o.op !== 'replace' && !o.text) {
        errs.push(w + ': text vacío');
      }
    });
  });
  if (total > MAX_OPS) errs.push('demasiadas operaciones (' + total + ' > ' + MAX_OPS + ')');
  return errs;
}

// Cuenta apariciones, también las que se solapan («aa» en «aaa» son 2: ambigua).
function count(hay, needle) {
  let n = 0;
  let i = hay.indexOf(needle);
  while (i !== -1) { n++; i = hay.indexOf(needle, i + 1); }
  return n;
}

// Aplica las operaciones en orden, cada una sobre el resultado de la anterior.
function applyOps(content, ops) {
  let out = content;
  ops.forEach((o, j) => {
    const n = count(out, o.anchor);
    if (n !== 1) {
      throw new Error('ops[' + j + '] (' + o.op + '): el ancla aparece ' + n + ' veces; tiene que aparecer exactamente 1');
    }
    const i = out.indexOf(o.anchor);
    const a = out.slice(0, i);
    const b = out.slice(i + o.anchor.length);
    if (o.op === 'replace') out = a + o.text + b;
    else if (o.op === 'insert_before') out = a + o.text + o.anchor + b;
    else if (o.op === 'insert_after') out = a + o.anchor + o.text + b;
    else out = a + b;
  });
  if (out === content) throw new Error('las operaciones no cambian el archivo');
  return out;
}

// Calcula todo en memoria. `read(path)` devuelve el contenido o null si no existe.
function plan(patch, read) {
  const errs = validate(patch);
  if (errs.length) return { ok: false, errors: errs };
  const files = [];
  for (const f of patch.files) {
    const before = read(f.path);
    if (before === null || before === undefined) return { ok: false, errors: [f.path + ': no existe'] };
    const sha = blobSha(before);
    if (sha !== f.base_sha) {
      return { ok: false, errors: [f.path + ': el archivo cambió (sha ' + sha + ', el parche espera ' + f.base_sha + ')'] };
    }
    const text = Buffer.isBuffer(before) ? before.toString('utf8') : String(before);
    let after;
    try { after = applyOps(text, f.ops); } catch (e) { return { ok: false, errors: [f.path + ': ' + e.message] }; }
    files.push({ path: f.path, before: sha, after: blobSha(after), bytes: Buffer.byteLength(after, 'utf8'), content: after });
  }
  return { ok: true, files };
}

function result(patch, outcome, when) {
  const id = (patch && ID_RE.test(String(patch.id || ''))) ? patch.id : 'PATCH-???';
  const lines = ['# RESULT de ' + id, '', '- Fecha: ' + (when || new Date().toISOString()),
    '- Estado: ' + (outcome.ok ? 'APLICADO' : 'RECHAZADO')];
  if (patch && typeof patch.summary === 'string') lines.push('- Resumen: ' + patch.summary.replace(/\s+/g, ' ').trim());
  lines.push('');
  if (outcome.ok) {
    lines.push('| Archivo | Blob antes | Blob después | Bytes |', '|---|---|---|---|');
    outcome.files.forEach((f) => lines.push('| `' + f.path + '` | `' + f.before + '` | `' + f.after + '` | ' + f.bytes + ' |'));
  } else {
    lines.push('Ningún archivo cambió. Motivo:', '');
    outcome.errors.forEach((e) => lines.push('- ' + e));
  }
  return lines.join('\n') + '\n';
}

// Lee el parche, aplica todo o nada y escribe RESULT junto al parche.
function run(patchFile, root) {
  root = root || process.cwd();
  let patch = null;
  let outcome;
  try {
    patch = JSON.parse(fs.readFileSync(path.join(root, patchFile), 'utf8'));
    outcome = plan(patch, (p) => {
      const abs = path.join(root, p);
      return fs.existsSync(abs) ? fs.readFileSync(abs) : null;
    });
  } catch (e) {
    outcome = { ok: false, errors: ['no pude leer el parche: ' + e.message] };
  }
  if (outcome.ok) outcome.files.forEach((f) => fs.writeFileSync(path.join(root, f.path), f.content, 'utf8'));
  const resFile = patchFile.replace(/PATCH-(\d+)\.json$/, 'RESULT-$1.md');
  if (resFile !== patchFile) fs.writeFileSync(path.join(root, resFile), result(patch, outcome), 'utf8');
  return { outcome, resultFile: resFile !== patchFile ? resFile : null };
}

module.exports = { blobSha, safePath, validate, count, applyOps, plan, result, run, OPS, MAX_OPS };

if (require.main === module) {
  const file = process.argv[2];
  if (!file || !/^factory\/patches\/PATCH-\d{3,}\.json$/.test(file)) {
    console.error('Uso: node .github/scripts/apply-patch.cjs factory/patches/PATCH-NNN.json [raíz]');
    process.exit(2);
  }
  const r = run(file, process.argv[3]);
  console.log(r.outcome.ok ? 'APLICADO' : 'RECHAZADO: ' + r.outcome.errors.join(' | '));
  process.exit(r.outcome.ok ? 0 : 1);
}
