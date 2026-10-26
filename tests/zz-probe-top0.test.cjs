'use strict';
// Sonda temporal TOP-0 (BL-070 paso 5). Solo lee el repo. Se borra después de leer OUT-090 (v2: sin el censo js, ya leído en OUT-089).
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const R = path.join(__dirname, '..');
const rd = (p) => { try { return fs.readFileSync(path.join(R, p), 'utf8'); } catch (_) { return ''; } };
const EMO = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu;
const cnt = (s, re) => (s.match(re) || []).length;

test('sonda: censo de diálogos, avisos y bloqueos por archivo js', () => {
  const files = fs.readdirSync(path.join(R, 'js')).filter(f => f.endsWith('.js')).sort();
  console.log('JSFILES', files.length);
  for (const f of files) {
    const s = rd('js/' + f);
    const row = {
      toast: cnt(s, /\btoast\?*\.?\(|window\.toast\?\.\(/g),
      alert: cnt(s, /(^|[^\w.])alert\s*\(/g),
      confirm: cnt(s, /(^|[^\w.])confirm\s*\(/g),
      prompt: cnt(s, /(^|[^\w.])prompt\s*\(/g),
      modalCls: cnt(s, /modal__dialog|['"]modal['"]|class="modal"/g),
      dialogEl: cnt(s, /<dialog|createElement\(['"]dialog|showModal\(/g),
      roleDialog: cnt(s, /role=["']dialog|'role',\s*'dialog'|"role",\s*"dialog"/g),
      ownToast: cnt(s, /class(Name)?\s*=\s*['"][^'"]*(toast|snackbar|notice)/gi),
      emoji: cnt(s, EMO),
      hexColor: cnt(s, /#[0-9a-fA-F]{6}\b/g)
    };
    const any = Object.values(row).some(v => v > 0);
    if (any && (process.env.P5ALL || f >= 'wv-objectives-ui')) console.log('JS|' + f + '|' + s.length + '|' + JSON.stringify(row));
  }
});

test('sonda: index.html (cabecera, pie, modales y scripts en línea)', () => {
  const s = rd('index.html');
  console.log('INDEX', s.length);
  const ids = s.match(/id="[^"]+Modal"/g) || [];
  console.log('MODALS', JSON.stringify(ids));
  console.log('INLINE-SCRIPTS', cnt(s, /<script>(?![^<]*src)/g), 'STYLE-ATTR', cnt(s, /style="/g), 'EMOJI', cnt(s, EMO), 'ONMOUSE', cnt(s, /onmouse/g));
  const h = s.slice(s.indexOf('<header class="an-header'), s.indexOf('</header>') + 9);
  console.log('HEADER-LEN', h.length, 'LINKS', cnt(h, /<a /g), 'BUTTONS', cnt(h, /<button/g), 'SELECTS', cnt(h, /<select/g), 'IMG', JSON.stringify(h.match(/src="[^"]+"/g)));
  console.log('HEADER-TITLES', JSON.stringify((h.match(/title="[^"]+"/g) || [])));
  const fo = s.slice(s.indexOf('<footer'), s.indexOf('</footer>') + 9);
  console.log('FOOTER', fo.replace(/\s+/g, ' '));
});

test('sonda: CSS de cabecera, modales, avisos y pie', () => {
  const css = ['css/main.css', 'css/theme-polish.css'];
  try { fs.readdirSync(path.join(R, 'css')).forEach(f => { if (f.endsWith('.css') && !css.includes('css/' + f)) css.push('css/' + f); }); } catch (_) {}
  for (const c of css) {
    const s = rd(c);
    if (!s) continue;
    const re = /([^{}]*\b(modal|toast|site-footer|footer-|an-header|an-util|an-sep|brand-)[^{}]*)\{([^{}]*)\}/g;
    let m, n = 0, out = [];
    while ((m = re.exec(s))) { n++; if (out.join('').length < 2400) out.push(m[1].trim().replace(/\s+/g, ' ') + '{' + m[3].trim().replace(/\s+/g, ' ').slice(0, 220) + '}'); }
    console.log('CSS|' + c + '|' + s.length + '|reglas ' + n);
    out.forEach(x => console.log('  ' + x));
  }
  const themes = fs.readdirSync(path.join(R, 'css/themes')).filter(f => f.endsWith('.css'));
  let tm = 0; themes.forEach(f => { tm += cnt(rd('css/themes/' + f), /modal|toast|footer|an-header/g); });
  console.log('THEMES', themes.length, 'menciones', tm);
});

test('sonda: cargador, guías, gist y ajustes', () => {
  const b = rd('js/boot.js');
  console.log('BOOT', (b.match(/[^\n]*\b30\b[^\n]*/g) || []).slice(0, 6).join(' || '));
  const man = JSON.parse(rd('js/modules.json'));
  console.log('MANIFEST', JSON.stringify(Object.keys(man)), (man.modules || man).length);
  ['docs/user-guide.html', 'docs/user-guide-avanzado.html'].forEach(p => {
    const s = rd(p);
    console.log('GUIDE|' + p + '|' + s.length + '|strikes ' + cnt(s, /[Ss]trike/g) + '|asistente ' + cnt(s, /asistente/gi) + '|gist ' + cnt(s, /[Gg]ist/g) + '|heredad ' + cnt(s, /[Hh]eredad/g) + '|llavero ' + cnt(s, /[Ll]lavero/g) + '|fecha ' + JSON.stringify((s.match(/20\d\d-\d\d-\d\d/g) || []).slice(-3)));
  });
  const files = fs.readdirSync(path.join(R, 'js')).filter(f => f.endsWith('.js'));
  for (const id of ['syncGistBtn', 'gistSyncModal', 'exportSettingsBtn', 'importSettingsBtn', 'clearCacheBtn', 'guideLink', 'keysMenuBtn', 'keySelectGlobal', 'converterModal', 'toasts']) {
    const who = files.filter(f => rd('js/' + f).includes(id));
    console.log('USES|' + id + '|' + who.join(','));
  }
  const g = rd('js/gist-sync.js');
  console.log('GIST', g.length, (g.match(/[^\n]*display[^\n]*/g) || []).slice(0, 4).join(' || '));
  const sm = rd('js/settings-manager.js');
  console.log('SETTINGS', sm.length, 'alert', cnt(sm, /alert\(/g), 'confirm', cnt(sm, /confirm\(/g), 'toast', cnt(sm, /toast/g));
  const cm = rd('js/converter-modal.js');
  console.log('CONVERTER', cm.length, JSON.stringify((cm.match(/id[=:]\s*['"][^'"]+['"]/g) || []).slice(0, 12)));
  const tr = rd('js/app.js');
  const i = tr.indexOf('// Toasts global');
  if (process.env.P5ALL) console.log('APP-TOAST', tr.slice(i, i + 2600).replace(/\s+/g, ' '));
});
