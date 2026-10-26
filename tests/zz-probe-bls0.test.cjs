'use strict';
// Sonda BLS-0 (BL-074): quién escribe los cachés grandes de localStorage. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const KEYS = ['items_cache_armory', 'items_cache_v1', 'ach_acc', 'commerce_listings', 'gw2_conv_cache', 'accounts:achmeta', 'ach_meta_v3', 'lastFile'];
test('sonda', () => {
  const dir = path.join(ROOT, 'js');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js')).sort()) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const k of KEYS) {
      let i = s.indexOf(k), n = 0;
      while (i >= 0 && n < 2) {
        console.log(f + ' [' + k + '] @' + i + ' ' + s.slice(Math.max(0, i - 120), i + 160).replace(/\s+/g, ' '));
        i = s.indexOf(k, i + 400); n++;
      }
    }
  }
  const a = fs.readFileSync(path.join(dir, 'api-gw2.js'), 'utf8');
  for (const re of [/function lsSet\b/, /function lsGet\b/, /function lsDel\b/, /indexedDB/, /TTL|ttl\s*[:=]/]) {
    const m = re.exec(a); if (m) console.log('API ' + re + ' @' + m.index + ' ' + a.slice(m.index, m.index + 600).replace(/\s+/g, ' '));
  }
  console.log('API size ' + a.length);
});
