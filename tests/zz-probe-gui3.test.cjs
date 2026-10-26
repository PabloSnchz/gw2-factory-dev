'use strict';
// Sonda GUI-3 (BL-071): qué hace cada módulo de la parte 1 y qué guarda. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const one = (s) => s.replace(/\r?\n/g, ' ⏎ ').replace(/\s+/g, ' ');

test('sonda GUI-3', () => {
  const FILES = ['js/welcome-panel.js', 'js/wallet-dashboard.js', 'js/wallet-theme.js', 'js/converter-modal.js',
    'js/meta.js', 'js/meta-theme.js', 'js/wv-view.js', 'js/wizards-vault.js', 'js/wv-shop-ui.js', 'js/wv-season-storage.js',
    'js/act-view.js', 'js/act-week.js', 'js/act-psna.js', 'js/act-model.js', 'js/home-view.js', 'js/home-extra.js'];
  for (const f of FILES) {
    let s; try { s = rd(f); } catch (e) { console.log('HEAD ' + f + ' (no está)'); continue; }
    const m = s.match(/^[\s\S]*?\*\//);
    console.log('HEAD ' + f + ' ' + s.length + 'B: ' + one((m ? m[0] : s.slice(0, 1500)).slice(0, 3200)));
    const keys = new Set();
    for (const k of s.matchAll(/['"`]((?:gn:|accounts:|gw2_)[\w:.-]*)['"`]/g)) keys.add(k[1]);
    console.log('KEYS ' + f + ' ' + [...keys].join(' '));
    const ui = new Set();
    for (const k of s.matchAll(/(?:textContent\s*=|title\s*=|aria-label=|>)\s*['"]?([A-ZÁÉÍÓÚ¿][^<>'"\n]{3,60})['"<]/g)) ui.add(k[1].trim());
    console.log('UI ' + f + ' ' + [...ui].slice(0, 70).join(' | '));
  }
  const st = rd('js/storage.js');
  const lines = st.split('\n');
  lines.forEach((l, i) => { if (/(gn:(wallet|meta|wv|activities|homestead|global|converter)|STORAGE KEY|KEYS\s*=)/.test(l)) console.log('ST ' + (i + 1) + ' ' + l.trim().slice(0, 200)); });
  for (const f of ['js/router.js', 'js/sidebar-nav.js']) {
    rd(f).split('\n').forEach((l, i) => { if (/(Inicio|#\/welcome|#\/home|'#\/'|homestead|Bienvenida)/.test(l)) console.log('NAV ' + f + ':' + (i + 1) + ' ' + l.trim().slice(0, 180)); });
  }
});
