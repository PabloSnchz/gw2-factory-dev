// Sonda temporal BL-092 BV-4: contexto de cada pantalla vacía (texto y reglas CSS). Se borra después de RUN-293.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const CL = ['cv-empty', 'achc-empty', 'arm-empty', 'lt-empty-state', 'wn-empty', 'wd3-empty', 'mt-empty', 'wvd-empty', 'wvo-empty', 'wvp-empty', 'wvs-empty', 'cx-empty'];
const files = fs.readdirSync(path.join(ROOT, 'js')).filter((x) => /\.js$/.test(x)).map((f) => 'js/' + f)
  .concat(['index.html', 'css/main.css', 'css/theme-polish.css']);
for (const c of CL) {
  console.log('== ' + c);
  let n = 0;
  for (const f of files) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    let i = -1;
    while ((i = s.indexOf(c, i + 1)) >= 0 && n < 6) {
      n++;
      console.log('  ' + f + ': ' + s.slice(Math.max(0, i - 110), i + 150).replace(/\s+/g, ' '));
    }
  }
}
