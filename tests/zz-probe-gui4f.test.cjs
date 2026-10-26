'use strict';
// Sonda GUI-4 (BL-071), lote f: puerta de permisos, claves guardadas y Ajustes. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const JS = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f));
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const cut = (l) => l.trim().replace(/\s+/g, ' ').slice(0, 170);
test('sonda GUI-4 f', () => {
  const app = rd('js/app.js').split('\n');
  app.forEach((l, i) => { if (/REQUIRED_PERMISSIONS|missingPerm|faltan? (el|los)? ?permiso|no la guardo|no se guard/i.test(l)) console.log('GATE app.js:' + (i + 1) + ' ' + cut(l)); });
  const KEYS = ['gn:achievements', 'gn:legendary:', 'gn:raids:marks', 'gn:raids:strike:view', 'gn:inventory:tab', 'inv_dashboard_',
    'gn:inventory:selected_items', 'gn:global:welcome_seen', 'gn:meta:hecho_hoy', 'gn:activities:stones', 'gn:activities:toggles', 'gn:theme'];
  for (const k of KEYS) {
    const hits = [];
    for (const f of JS) rd('js/' + f).split('\n').forEach((l, i) => { if (l.includes(k)) hits.push(f + ':' + (i + 1) + ' ' + cut(l)); });
    console.log('KEY ' + k + ' (' + hits.length + ')');
    hits.slice(0, 6).forEach((h) => console.log('   ' + h));
  }
  const sm = rd('js/settings-manager.js').split('\n');
  sm.forEach((l, i) => { if (/^\s*function (export|import|restore|clear)\w*|toast\(|var msg|'¿/.test(l)) console.log('SM:' + (i + 1) + ' ' + cut(l)); });
  for (const f of JS) { const s = rd('js/' + f); if (s.includes('arm-hero')) console.log('ARMHERO ' + f); }
  const lt = rd('js/legendary-tracker.js');
  const ui = new Set();
  for (const k of lt.matchAll(/(?:textContent\s*=|title\s*=|aria-label=|>)\s*['"]?([A-ZÁÉÍÓÚ¿«][^<>'"\n]{3,60})['"<]/g)) ui.add(k[1].trim());
  console.log('LTUI ' + [...ui].slice(0, 60).join(' | '));
});
