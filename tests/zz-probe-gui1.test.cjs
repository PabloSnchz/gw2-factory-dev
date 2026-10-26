// Sonda BL-071 GUI-1 (se borra después): qué guarda la Bóveda, adónde habla y qué hacen la copia y la caché.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return ''; } };
const JS = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f)).map((f) => 'js/' + f);
const out = [];
const body = (src, name, n) => { const i = src.indexOf(name); return i < 0 ? '(no está)' : src.slice(i, i + (n || 1200)).replace(/\n\s*/g, ' ⏎ '); };

test('sonda GUI-1', () => {
  // 1) Qué mecanismos de guardado usa cada archivo
  const mech = { localStorage: /localStorage\./g, sessionStorage: /sessionStorage\./g, indexedDB: /indexedDB/g, cachesAPI: /caches\.(open|delete|keys)/g, cookie: /document\.cookie/g };
  Object.keys(mech).forEach((k) => {
    const who = JS.map((f) => [f, (read(f).match(mech[k]) || []).length]).filter((x) => x[1]);
    out.push('MECH ' + k + ': ' + who.map((x) => x[0].slice(3) + '=' + x[1]).join(' '));
  });
  // 2) Claves crudas (sin gn:) que se escriben a pelo
  const raw = new Set();
  JS.forEach((f) => [...read(f).matchAll(/(?:localStorage|sessionStorage)\.setItem\(\s*['"`]([^'"`]+)['"`]/g)].forEach((m) => raw.add(f.slice(3) + ':' + m[1])));
  out.push('RAWSET ' + [...raw].join(' | '));
  // 3) Hosts externos
  const hosts = {};
  JS.concat(['index.html']).forEach((f) => [...read(f).matchAll(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)].forEach((m) => {
    const h = m[1].toLowerCase(); (hosts[h] = hosts[h] || new Set()).add(f.replace(/^js\//, ''));
  }));
  Object.keys(hosts).sort().forEach((h) => out.push('HOST ' + h + ' <- ' + [...hosts[h]].slice(0, 8).join(',')));
  // 4) Analytics: qué eventos se mandan
  const ev = new Set();
  JS.concat(['index.html']).forEach((f) => [...read(f).matchAll(/gtag\(\s*['"]event['"]\s*,\s*['"`]([^'"`]+)/g)].forEach((m) => ev.add(m[1])));
  out.push('GA_EVENTS ' + [...ev].join(' '));
  const an = JS.filter((f) => /analytics/i.test(f));
  out.push('GA_FILES ' + an.join(' '));
  an.forEach((f) => out.push('GA_SRC ' + f + ': ' + read(f).slice(0, 1500).replace(/\n\s*/g, ' ⏎ ')));
  const I = read('index.html');
  out.push('GA_INDEX ' + body(I, '<script id="ga-loader">', 1400));
  // 5) Copia de ajustes y caché
  const sm = read('js/settings-manager.js');
  out.push('SM_EXPORT ' + body(sm, 'function exportAll', 1500));
  out.push('SM_CLEAR ' + body(sm, 'function clearApiCache', 1500));
  out.push('SM_CLEARNOW ' + body(sm, 'function clearNow', 1200));
  // 6) Llavero: qué guarda y dónde
  ['js/acc-vault-edit.js', 'js/acc-vault-view.js', 'js/acc-view.js', 'js/acc-vault.js'].forEach((f) => {
    const s = read(f);
    const lines = s.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /localStorage|sessionStorage|vault2|lastFile|accounts:cards|achmeta|setItem|removeItem/.test(l));
    lines.slice(0, 10).forEach(([i, l]) => out.push('VAULT ' + f.slice(3) + ':' + i + ' ' + l.trim().slice(0, 180)));
  });
  // 7) Claves que se guardan con prefijo y su escritor (gn: y accounts:)
  const writers = {};
  JS.forEach((f) => [...read(f).matchAll(/['"`]((?:gn:|accounts:)[a-zA-Z0-9:_.-]+)['"`]/g)].forEach((m) => {
    (writers[m[1]] = writers[m[1]] || new Set()).add(f.slice(3).replace(/\.js$/, ''));
  }));
  out.push('KEYS ' + Object.keys(writers).sort().map((k) => k + '[' + [...writers[k]].slice(0, 4).join(',') + ']').join(' '));
  // 8) La API Key: ¿cómo se manda?
  const apiLines = [];
  JS.forEach((f) => read(f).split('\n').forEach((l, i) => { if (/access_token=|Authorization/.test(l)) apiLines.push(f.slice(3) + ':' + (i + 1)); }));
  out.push('TOKEN_USE ' + apiLines.length + ' ' + apiLines.slice(0, 20).join(' '));
  // 9) privacy.html: quién la enlaza y cómo
  JS.concat(['index.html']).forEach((f) => read(f).split('\n').forEach((l, i) => { if (/privacy\.html/.test(l)) out.push('PRIVREF ' + f + ':' + (i + 1) + ' ' + l.trim().slice(0, 220)); }));
  ['tests/welcome-view.test.cjs'].forEach((f) => read(f).split('\n').forEach((l, i) => { if (/privacy/.test(l)) out.push('PRIVTEST ' + f + ':' + (i + 1) + ' ' + l.trim().slice(0, 220)); }));
  console.log(out.join('\n'));
});
