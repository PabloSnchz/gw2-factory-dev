// Sonda temporal ACT-7 (BL-070): qué depende de js/activities.js y js/activities-theme.js. Se borra después de leer OUT. Imprime, no comprueba.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');

const RE = /activities(-theme)?\.js|\bActivities\b|ActivitiesTheme|activitiesTheme|psnaPanel|homeNodesContainer|actTab|weeklyStones|_debug|act-legacy|activitiesPanel|ACTIVITIES_|gn:activities|psna-schedule|PSNA/;

function scan(rel) {
  const p = path.join(ROOT, rel);
  const L = fs.readFileSync(p, 'utf8').split('\n'), hits = [];
  L.forEach((l, i) => { if (RE.test(l)) hits.push((i + 1) + ': ' + l.trim().slice(0, 230)); });
  return hits;
}

test('sonda: quién nombra lo viejo de Actividades', () => {
  const out = [];
  ['js', 'tests', 'css', 'tools'].forEach((d) => {
    const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach((e) => {
      const rel = dir + '/' + e.name;
      if (e.isDirectory()) { if (!/legacy|node_modules/.test(rel)) walk(rel); return; }
      if (!/\.(c?js|css|json)$/.test(e.name) || /zz-probe/.test(e.name) || rel === 'js/activities.js' || rel === 'js/activities-theme.js') return;
      const h = scan(rel);
      if (h.length) out.push('## ' + rel + ' (' + h.length + ')\n' + h.slice(0, 30).join('\n'));
    });
    walk(d);
  });
  ['index.html'].forEach((f) => { const h = scan(f); out.push('## ' + f + ' (' + h.length + ')\n' + h.join('\n')); });
  console.log(out.join('\n'));
});

test('sonda: qué expone y qué escribe lo viejo', () => {
  ['js/activities.js', 'js/activities-theme.js'].forEach((f) => {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8'), L = s.split('\n');
    console.log('## ' + f + ' ' + Buffer.byteLength(s) + ' B, ' + L.length + ' líneas');
    L.forEach((l, i) => {
      if (/window\.\w+\s*=|root\.\w+\s*=|global\w*\.\w+\s*=|getElementById\(|addEventListener\(['"]gn|dispatchEvent|Storage\.|STORAGE_KEYS|localStorage|psna|PSNA|Version|VERSION|function render\w*|createElement\('section|id ?= ?['"]/.test(l)) console.log((i + 1) + ': ' + l.trim().slice(0, 200));
    });
  });
});

test('sonda: router, boot, gn-frame y presupuesto', () => {
  ['js/router.js', 'js/boot.js', 'js/gn-frame.js', 'js/app.js', 'js/storage.js', 'tools/size-budget.json', 'js/act-view.js', 'js/act-week.js'].forEach((f) => {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) return console.log('## ' + f + ' NO EXISTE');
    const h = scan(f);
    console.log('## ' + f + ' (' + fs.statSync(p).size + ' B)\n' + h.slice(0, 60).join('\n'));
  });
});
