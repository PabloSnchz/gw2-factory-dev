// Sonda SHV-5 (BL-076): solo lee y escribe por consola. Se borra después de RUN-164.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return ''; } };
const count = (s, re) => (s.match(re) || []).length;

test('sonda SHV-5', () => {
  const files = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => f.endsWith('.js')).sort();
  const rows = [];
  for (const f of files) {
    const s = read('js/' + f);
    const voice = count(s, /Shiruvana\.voice\(|S\.voice\(|\.voice\(\{/g);
    const core = count(s, /ShvCore/g);
    const bub = count(s, /ShvBubble/g);
    const basis = count(s, /basis\s*:/g);
    const kinds = [...new Set((s.match(/kind\s*:\s*'([a-z]+)'/g) || []).map((k) => k.replace(/.*'([a-z]+)'/, '$1')))];
    if (voice || core || bub) rows.push(`VOZ ${f} bytes=${Buffer.byteLength(s)} voice=${voice} core=${core} bubble=${bub} basis=${basis} kinds=${kinds.join('/')}`);
  }
  rows.forEach((r) => console.log(r));
  const man = JSON.parse(read('js/modules.json'));
  console.log('MANIFIESTO', man.modules.length);
  for (const f of files) {
    const s = read('js/' + f);
    const m = s.match(/modules\.json[\s\S]{0,400}/);
    if (m && /(max|MAX|limit|LIMIT|> ?40|40)/.test(m[0])) console.log('CARGADOR', f, (s.match(/.{0,80}\b40\b.{0,80}/g) || []).slice(0, 4).join(' || '));
  }
  const idx = read('index.html');
  console.log('INDEX modules.json', (idx.match(/.{0,120}modules\.json.{0,200}/g) || []).slice(0, 3).join(' || '));
  const sm = read('js/settings-manager.js');
  console.log('SETTINGS shv', count(sm, /shv/g), 'version', (sm.match(/version[^\n]{0,60}3\.0[^\n]{0,40}/) || [''])[0]);
  const wv = files.filter((f) => /^wv-|camara|wizard/.test(f)).map((f) => f + ':' + count(read('js/' + f), /slice\(0, ?4\)|slice\(-4\)/g));
  console.log('CAMARA huella', wv.join(' '));
  const pl = read('js/shiruvana-places.js');
  console.log('BIENVENIDA cartera', count(pl, /ShvMemory|cartera|Cartera/g));
  const raids = files.filter((f) => /^raids/.test(f)).map((f) => f + ':' + count(read('js/' + f), /'success'|'hint'/g));
  console.log('RAIDS tipos', raids.join(' '));
  for (const k of ['achievements.js', 'inv-multi.js', 'act-view.js', 'act-week.js', 'wv-view.js', 'home-view.js', 'acc-view.js', 'meta-theme.js']) {
    const s = read('js/' + k);
    console.log('PUBLICA', k, 'getSnapshot=' + count(s, /getSnapshot/g), 'snapshot=' + count(s, /snapshot\s*[:(]/g), 'evento=' + (s.match(/'gn:[a-z-]+(-rendered|:changed|achievements)?'/g) || []).slice(0, 4).join(','));
  }
  const ts = fs.readdirSync(path.join(ROOT, 'tests')).length;
  console.log('TESTS', ts);
});
