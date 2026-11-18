// Sonda BL-092 BV-6b (se borra después): qué tiñe cada panel de módulo y cómo se llaman los paneles.
'use strict';
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
test('tintes de paneles y cabeceras', () => {
  const html = read('index.html');
  for (const m of html.matchAll(/<(section|div|article)[^>]*class="[^"]*\bpanel\b[^"]*"[^>]*>/g)) {
    const id = (m[0].match(/id="([^"]+)"/) || [])[1];
    console.log('PANEL-HTML ' + (id || '(sin id)') + ' :: ' + m[0].slice(0, 140));
  }
  const files = ['css/main.css', 'css/theme-polish.css'].concat(fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f)).map((f) => 'js/' + f));
  for (const f of files) {
    const src = read(f);
    const re = /([^{}\n'"]{2,200})\{([^{}]*background[^{}]*)\}/g;
    let m, n = 0;
    while ((m = re.exec(src)) && n < 25) {
      const sel = m[1].trim();
      const bg = (m[2].match(/background(?:-image)?\s*:\s*[^;'"]+/g) || []).join(' | ');
      if (!/color-mix|gradient|rgba\(/.test(bg)) continue;
      if (!/hero|head|top|Panel|panel|wrap|root|Root|banner|shell/i.test(sel)) continue;
      n++;
      console.log('TINTE ' + f + ' :: ' + sel.slice(-120) + ' => ' + bg.slice(0, 220));
    }
  }
  // dónde se dibujan los paneles por JS (id de panel en las vistas)
  for (const f of files.filter((x) => x.startsWith('js/'))) {
    const ids = new Set([...read(f).matchAll(/#([a-zA-Z]+Panel)\b/g)].map((x) => x[1]));
    if (ids.size) console.log('IDS ' + f + ': ' + [...ids].join(' '));
  }
});
