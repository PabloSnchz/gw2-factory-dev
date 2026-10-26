'use strict';
// Sonda temporal TOP-2 v3 (BL-070 paso 5). Copia el repo a una carpeta temporal, le aplica
// PATCH-146 (rechazado) y corre hb104 e idea50 para ver la falla. No escribe en el repo.
// Se borra después de leer OUT-096.
const test = require('node:test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const R = path.join(__dirname, '..');

test('sonda TOP-2 v3: hb104 e idea50 con PATCH-146 aplicado en una copia', () => {
  const T = fs.mkdtempSync(path.join(os.tmpdir(), 'top2-'));
  fs.cpSync(R, T, { recursive: true, filter: (s) => !/[\\/]\.git([\\/]|$)/.test(s) && !/zz-probe/.test(s) });
  const P = JSON.parse(fs.readFileSync(path.join(R, 'factory/patches/PATCH-146.json'), 'utf8'));
  for (const f of P.files) {
    const p = path.join(T, f.path);
    let s = fs.readFileSync(p, 'utf8');
    for (const o of f.ops) {
      const n = s.split(o.anchor).length - 1;
      if (n !== 1) console.log('ANCLA ' + f.path + ' x' + n + ' | ' + o.anchor.slice(0, 80));
      s = s.replace(o.anchor, o.text);
    }
    fs.writeFileSync(p, s);
  }
  for (const t of ['tests/hb104-confirm-antes-de-escribir.test.js', 'tests/idea50-boton-cache.test.js']) {
    const r = cp.spawnSync(process.execPath, [t], { cwd: T, encoding: 'utf8', timeout: 60000 });
    const out = (r.stdout || '') + '\n' + (r.stderr || '');
    const lines = out.split('\n').filter((l) => /FAIL|fail|Error|error|assert|expected|actual|✗|not ok|  at /i.test(l));
    console.log('==== ' + t + ' exit ' + r.status);
    console.log(lines.slice(0, 40).join('\n').slice(0, 5000));
  }
});
