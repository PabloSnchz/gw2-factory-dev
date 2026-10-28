// RUN-201 (BL-082 fix): en Node la API responde JSON; en el navegador llega HTML. ¿Quién envuelve fetch? Sonda temporal.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const files = ['index.html'].concat(fs.readdirSync(path.join(root, 'js')).filter(f => /\.js$/.test(f)).map(f => 'js/' + f));
const re = /(window|root|self|globalThis)\.fetch\s*=|\bfetch\s*=\s*function|serviceWorker|api\.guildwars2\.com['"]?\s*[,;)]|GW2_API|API_BASE|apiBase|\/v2\/'\s*\+|proxy/i;
files.forEach(f => {
  const L = fs.readFileSync(path.join(root, f), 'utf8').split('\n');
  L.forEach((l, i) => { if (re.test(l)) console.log(f + ':' + (i + 1) + ': ' + l.trim().slice(0, 220)); });
});
console.log('## modules.json');
console.log(fs.readFileSync(path.join(root, 'js', 'modules.json'), 'utf8'));
console.log('## index.html scripts');
fs.readFileSync(path.join(root, 'index.html'), 'utf8').split('\n').forEach((l, i) => { if (/<script|<base|http-equiv|Content-Security/i.test(l)) console.log((i + 1) + ': ' + l.trim().slice(0, 220)); });
