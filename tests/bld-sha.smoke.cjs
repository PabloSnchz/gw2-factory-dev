// BL-082: blob sha (como git) y tamaño de archivos que la Factory va a parchear; más líneas pedidas. Solo lectura.
const fs = require('fs');
const crypto = require('crypto');
const files = ['index.html', 'js/sidebar-nav.js', 'tests/sidebar-nav.test.cjs', 'js/settings-manager.js', 'js/gn-kit.js', 'tests/gn-kit.test.cjs',
  'tests/gn-kit-tabs.test.cjs', 'tests/gn-kit-icons.test.cjs', 'js/welcome-panel.js', 'tests/welcome-view.test.cjs', 'tools/size-budget.json',
  'ai-memory/status.md', 'ai-memory/backlog.md', 'js/modules.json', 'js/bld-view.js', 'js/storage.js'];
files.forEach((f) => {
  try {
    const b = fs.readFileSync(f);
    const sha = crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob ' + b.length + '\0'), b])).digest('hex');
    console.log(sha, b.length, f);
  } catch (e) { console.log('NO EXISTE', f); }
});
function lines(file, a, b) {
  const L = fs.readFileSync(file, 'utf8').split('\n');
  console.log('\n## ' + file + ' ' + a + '-' + b);
  for (let j = a - 1; j < Math.min(b, L.length); j++) console.log((j + 1) + ': ' + L[j].slice(0, 220));
}
lines('js/settings-manager.js', 156, 172);
lines('js/settings-manager.js', 532, 566);
