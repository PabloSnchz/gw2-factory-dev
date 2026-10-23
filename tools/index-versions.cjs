#!/usr/bin/env node
// Inventario de versiones de la Bóveda (RSK-020, DEC-035 FP-5).
// Versión: 1.0.0
//
// index.html pide cada script con ?v=X para que el navegador baje la versión nueva.
// Si X queda atrás de la versión real del archivo, el navegador puede seguir usando
// la copia vieja (hace falta Ctrl+F5). Este módulo compara, para cada <script> local
// de index.html y cada módulo de js/modules.json, el ?v pedido con la versión que el
// archivo declara en su cabecera.
//
// Uso: node tools/index-versions.cjs [raíz]  → tabla en Markdown.
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const HEAD = 3000; // la versión se busca solo en la cabecera del archivo
const RULES = [
  /Versi[oó]n\s*:?\s*v?(\d+\.\d+(?:\.\d+)?)\b/i, // «Versión: 1.2.3», «@version 1.2.3»
  /^[ \t]*\*?[ \t]*v(\d+\.\d+\.\d+)\b/m,         // « * v1.2.3 (fecha)» o «  v1.2.3»
  /\b[\w-]+\.js v(\d+\.\d+\.\d+)\b/,             // «app.js v2.8.0» (el aviso de consola)
];

// Versión declarada en la cabecera, o null si no declara ninguna.
function fileVersion(text) {
  const head = String(text || '').slice(0, HEAD);
  for (const re of RULES) {
    const m = re.exec(head);
    if (m) return m[1];
  }
  return null;
}

// «1.2» y «1.2.0» son la misma versión.
function same(a, b) {
  const n = (v) => String(v).split('.').concat(['0', '0']).slice(0, 3).map(Number).join('.');
  return n(a) === n(b);
}

// <script ... src="js/x.js?v=1.2.3"> locales de index.html, en orden.
function scriptTags(html) {
  const out = [];
  const re = /<script\b([^>]*)\bsrc="(js\/[^"?]+)(?:\?v=([^"]*))?"([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1] + ' ' + m[4];
    out.push({
      src: m[2],
      v: m[3] === undefined ? null : m[3],
      defer: /\bdefer\b/.test(attrs),
      line: html.slice(0, m.index).split('\n').length,
    });
  }
  return out;
}

function classify(root, src, v) {
  const f = path.join(root, src);
  if (!fs.existsSync(f)) return { status: 'falta', file: null };
  const file = fileVersion(fs.readFileSync(f, 'utf8'));
  if (file === null) return { status: 'sin-version', file };
  if (v === null) return { status: 'sin-v', file };
  return { status: same(v, file) ? 'ok' : 'atrasada', file };
}

function inventory(root) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const rows = scriptTags(html).map((t) => Object.assign({ from: 'index.html' }, t, classify(root, t.src, t.v)));
  const mf = path.join(root, 'js', 'modules.json');
  if (fs.existsSync(mf)) {
    const list = (JSON.parse(fs.readFileSync(mf, 'utf8')).modules) || [];
    list.forEach((m) => rows.push(Object.assign({ from: 'modules.json', src: m.src, v: m.v, defer: null, line: null }, classify(root, m.src, m.v))));
  }
  return rows;
}

function table(rows) {
  const count = (s) => rows.filter((r) => r.status === s).length;
  const L = [
    '| Origen | Script | ?v pedido | Versión del archivo | Estado |',
    '|---|---|---|---|---|',
  ];
  rows.forEach((r) => L.push('| ' + r.from + (r.line ? ':' + r.line : '') + ' | `' + r.src + '` | ' + (r.v === null ? '—' : r.v) +
    ' | ' + (r.file === null ? '—' : r.file) + ' | ' + r.status + ' |'));
  L.push('', 'Total ' + rows.length + ': ok ' + count('ok') + ', atrasada ' + count('atrasada') + ', sin-version ' + count('sin-version') +
    ', sin-v ' + count('sin-v') + ', falta ' + count('falta') + '.');
  return L.join('\n');
}

module.exports = { fileVersion, same, scriptTags, inventory, table };

if (require.main === module) {
  console.log(table(inventory(path.resolve(process.argv[2] || '.'))));
}
