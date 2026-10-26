// Sonda BL-071 GUI-0 (se borra después): censo de las guías, la privacidad y lo que dicen contra la app de hoy.
'use strict';
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return null; } };
const out = [];
const walk = (d) => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (/^(\.git|node_modules|factory|ai-memory|tools)$/.test(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);

test('sonda GUI-0', () => {
  const GUIDES = ['docs/user-guide.html', 'docs/user-guide-avanzado.html', 'docs/user-guide-avanzado.md', 'privacy.html', 'docs/PRIVACIDAD.md'];
  const TERMS = ['Strike', 'Gist', 'Asistente', 'Thief', 'Home Nodes', 'Heredad', 'Llavero', 'Armería', 'Raids', 'Bienvenida', 'v6.', 'gw2-wallet-ligero',
    'Backup', 'Sincronizar', 'inventory/dashboard', 'Profile Card', 'gn:apiKeys', 'Analytics', 'contacto@'];
  const EMO = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B1B}]/gu;
  GUIDES.forEach((g) => {
    const t = read(g);
    if (t == null) { out.push('## ' + g + ' NO EXISTE'); return; }
    const h2 = (t.match(/<h2[^>]*>([\s\S]*?)<\/h2>|^## (.*)$/gm) || []).length;
    out.push('## ' + g + ' bytes=' + Buffer.byteLength(t) + ' secciones=' + h2 + ' emojis=' + (t.match(EMO) || []).length);
    out.push(TERMS.map((w) => { const n = t.split(w).length - 1; return n ? w + '=' + n : ''; }).filter(Boolean).join(' · '));
  });
  // ¿Quién enlaza a cada archivo?
  const files = walk('.').filter((f) => /\.(html|js|cjs|md|json)$/.test(f) && !/^tests\/zz-probe/.test(f));
  ['user-guide.html', 'user-guide-avanzado.html', 'user-guide-avanzado.md', 'privacy.html', 'PRIVACIDAD.md'].forEach((n) => {
    const who = files.filter((f) => !f.endsWith(n) && (read(f) || '').includes(n));
    out.push('REF ' + n + ': ' + (who.join(', ') || '(nadie)'));
  });
  // Claves reales del almacenamiento
  const st = read('js/storage.js') || '';
  const keys = [...st.matchAll(/['"](gn:[a-z0-9:_-]+)['"]/gi)].map((m) => m[1]);
  out.push('STORAGE ' + [...new Set(keys)].join(' '));
  const all = files.filter((f) => /^js\//.test(f)).map((f) => read(f) || '').join('\n');
  const used = [...new Set([...all.matchAll(/['"`]((?:gn:|accounts:)[a-zA-Z0-9:_.-]+)['"`]/g)].map((m) => m[1]))].sort();
  out.push('KEYS_JS (' + used.length + ') ' + used.join(' '));
  // Analytics
  const I = read('index.html') || '';
  const ga = I.slice(I.indexOf('Google tag'), I.indexOf('Google tag') + 600);
  out.push('GA_INDEX ' + ga.replace(/\s+/g, ' ').slice(0, 600));
  const sm = read('js/settings-manager.js') || '';
  out.push('SM_ANALYTICS ' + (sm.match(/.{0,80}[Aa]nalytics.{0,80}/g) || []).slice(0, 4).join(' | '));
  // Permisos por módulo que ya conoce la Bienvenida
  const wp = read('js/welcome-panel.js') || '';
  const perm = wp.match(/[A-Z_]*PERM[A-Z_]*\s*=\s*\{[\s\S]{0,900}?\};/);
  out.push('WELCOME_PERMS ' + (perm ? perm[0].replace(/\s+/g, ' ') : '(no encontrado)'));
  wp.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /perm|scope/i.test(l)).slice(0, 12)
    .forEach(([i, l]) => out.push('WP ' + i + ': ' + l.trim().slice(0, 200)));
  const mods = wp.match(/var MODULES = \[[\s\S]*?\];/);
  out.push('WELCOME_MODULES ' + (mods ? mods[0].replace(/\s+/g, ' ').slice(0, 1600) : '(no encontrado)'));
  console.log(out.join('\n'));
});
