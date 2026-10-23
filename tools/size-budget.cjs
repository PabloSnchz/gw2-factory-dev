#!/usr/bin/env node
// Presupuesto de tamaño de la Bóveda (DEC-035 FP-6, BL-065).
// Versión: 1.0.0
//
// Zonas (1 KB = 1024 bytes; aplica a index.html, js/*.js y css/**/*.css):
//   saludable   ≤ 40 KB            — el presupuesto. Se publica entero.
//   advertencia > 40 KB y ≤ 48 KB  — registrado en tools/size-budget.json con motivo;
//                                    puede cambiar pero no pasar 48 KB; se achica al renovarlo.
//   congelado   > 48 KB            — registrado con su base (medida al congelar) y su techo;
//                                    no crece: tamaño ≤ techo ≤ base. Si se achica más de
//                                    1 KB por debajo del techo, el techo baja (trinquete).
//   excepción   cualquier tamaño   — solo datos generados por herramientas (tools/legendary),
//                                    con motivo; no se editan a mano.
// Las listas son exactas: entrar o salir de una zona se registra en el mismo cambio.
//
// Uso: node tools/size-budget.cjs [raíz]  → tabla en Markdown y errores.
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const CONFIG = 'tools/size-budget.json';

function walk(dir, re, rel, out) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), re, r, out);
    else if (re.test(e.name)) out.push(r);
  }
  return out;
}

// Archivos de la app que entran en el presupuesto, con su tamaño en bytes.
function files(root) {
  const list = [];
  if (fs.existsSync(path.join(root, 'index.html'))) list.push('index.html');
  fs.existsSync(path.join(root, 'js')) && fs.readdirSync(path.join(root, 'js'))
    .filter((f) => /\.js$/.test(f)).forEach((f) => list.push('js/' + f));
  walk(path.join(root, 'css'), /\.css$/, 'css', list);
  return list.sort().map((p) => ({ path: p, bytes: fs.statSync(path.join(root, p)).size }));
}

function kb(n) { return (n / 1024).toFixed(1) + ' KB'; }

function check(root, cfg) {
  cfg = cfg || JSON.parse(fs.readFileSync(path.join(root, CONFIG), 'utf8'));
  const OK = cfg.saludable, MAX = cfg.limite, SLACK = cfg.holgura;
  const frozen = cfg.congelados || {}, warn = cfg.advertencia || {}, exc = cfg.excepciones || {};
  const errors = [];
  const rows = files(root).map((f) => {
    const p = f.path, b = f.bytes;
    if (exc[p]) return Object.assign({ zone: 'excepción' }, f);
    if (b <= OK) {
      if (frozen[p] || warn[p]) errors.push(p + ': ya está en el presupuesto (' + kb(b) + '): sacalo de la lista de ' + (frozen[p] ? 'congelados' : 'advertencia'));
      return Object.assign({ zone: 'saludable' }, f);
    }
    if (b <= MAX) {
      if (frozen[p]) errors.push(p + ': bajó de 48 KB (' + kb(b) + '): pasalo de congelados a advertencia');
      else if (!warn[p]) errors.push(p + ': pasa los 40 KB (' + kb(b) + ') sin estar registrado: achicalo o registralo en advertencia con motivo');
      return Object.assign({ zone: 'advertencia' }, f);
    }
    const fz = frozen[p];
    if (!fz) {
      errors.push(p + ': pasa los 48 KB (' + kb(b) + ') y no está congelado: ningún archivo nuevo o en advertencia puede pasar los 48 KB');
    } else {
      if (!(fz.techo <= fz.base)) errors.push(p + ': el techo (' + fz.techo + ') no puede superar la base (' + fz.base + ')');
      if (b > fz.techo) errors.push(p + ': creció a ' + b + ' bytes y su techo es ' + fz.techo + ' (congelado: no crece; extraé lo nuevo a un archivo aparte)');
      else if (fz.techo - b > SLACK) errors.push(p + ': se achicó a ' + b + ' bytes: bajá su techo a ' + b + ' (trinquete)');
    }
    return Object.assign({ zone: 'congelado', techo: fz ? fz.techo : null }, f);
  });
  const seen = new Set(rows.map((r) => r.path));
  [['congelados', frozen], ['advertencia', warn], ['excepciones', exc]].forEach(([name, list]) =>
    Object.keys(list).forEach((p) => { if (!seen.has(p)) errors.push(p + ': figura en ' + name + ' pero no existe'); }));
  return { rows, errors };
}

function table(res) {
  const order = { 'congelado': 0, 'advertencia': 1, 'excepción': 2, 'saludable': 3 };
  const rows = res.rows.slice().sort((a, b) => order[a.zone] - order[b.zone] || b.bytes - a.bytes);
  const L = ['| Archivo | Tamaño | Zona | Techo |', '|---|---|---|---|'];
  rows.filter((r) => r.zone !== 'saludable').forEach((r) =>
    L.push('| `' + r.path + '` | ' + kb(r.bytes) + ' | ' + r.zone + ' | ' + (r.techo ? kb(r.techo) : '—') + ' |'));
  const n = (z) => rows.filter((r) => r.zone === z).length;
  L.push('', 'Total ' + rows.length + ': saludable ' + n('saludable') + ', advertencia ' + n('advertencia') +
    ', congelado ' + n('congelado') + ', excepción ' + n('excepción') + '. Errores: ' + res.errors.length + '.');
  res.errors.forEach((e) => L.push('- ' + e));
  return L.join('\n');
}

module.exports = { files, check, table, CONFIG };

if (require.main === module) {
  const res = check(path.resolve(process.argv[2] || '.'));
  console.log(table(res));
  process.exitCode = res.errors.length ? 1 : 0;
}
