// Sonda temporal ACT-7 (BL-070), segunda lectura: tests que leen lo viejo y forma de psna-schedule.json. Se borra después de leer OUT.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');

test('sonda: tests que nombran lo viejo de Actividades (solo nombre y cuántas líneas)', () => {
  const RE = /activities(-theme)?\.js|\bActivities\b|ActivitiesTheme|psnaPanel|psnaGrid|homeNodesContainer|PSNA-DAY|actTab/;
  fs.readdirSync(path.join(ROOT, 'tests')).filter((f) => /\.(c?js)$/.test(f) && !/zz-probe/.test(f)).forEach((f) => {
    const L = fs.readFileSync(path.join(ROOT, 'tests', f), 'utf8').split('\n'), hits = [];
    L.forEach((l, i) => { if (RE.test(l)) hits.push(i + 1); });
    if (hits.length) {
      const first = L[hits[0] - 1].trim().slice(0, 140);
      console.log(f + ' | ' + hits.length + ' | líneas ' + hits.slice(0, 12).join(',') + ' | ' + first);
    }
  });
});

test('sonda: psna-schedule.json y la ventana del índice', () => {
  const p = path.join(ROOT, 'assets/data/psna-schedule.json');
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  console.log('PSNA ' + fs.statSync(p).size + ' B claves ' + Object.keys(d).join(','));
  console.log('resetUtcHour ' + d.resetUtcHour + ' rotation ' + (d.rotation ? Object.keys(d.rotation).join(',') : 'no'));
  if (d.rotation) console.log('lunes ' + JSON.stringify(d.rotation.monday));
  const rest = Object.assign({}, d); delete rest.rotation; delete rest.schedule;
  console.log('resto ' + JSON.stringify(rest).slice(0, 600));
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n');
  idx.forEach((l, i) => { if (/activities|psna|homeNodes/i.test(l)) console.log('index ' + (i + 1) + ': ' + l.trim().slice(0, 220)); });
  const sb = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/size-budget.json'), 'utf8'));
  console.log('budget ' + JSON.stringify(sb).slice(0, 1500));
});
