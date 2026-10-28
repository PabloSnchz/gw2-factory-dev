// BL-082: muestra las líneas de memoria a actualizar (solo lectura).
const fs = require('fs');
const show = (f, re, ctx) => {
  const L = fs.readFileSync(f, 'utf8').split('\n');
  console.log('### ' + f + ' (' + L.length + ' líneas)');
  L.forEach((l, i) => { if (re.test(l)) for (let j = Math.max(0, i - ctx); j <= Math.min(L.length - 1, i + ctx); j++) console.log((j + 1) + ': ' + L[j].slice(0, 400)); });
};
const head = (f, n) => { console.log('### HEAD ' + f); fs.readFileSync(f, 'utf8').split('\n').slice(0, n).forEach((l, i) => console.log((i + 1) + ': ' + l.slice(0, 300))); };
head('ai-memory/status.md', 30);
show('ai-memory/status.md', /BL-082/, 0);
show('ai-memory/backlog.md', /BL-082/, 1);
console.log('### features'); console.log(fs.readdirSync('ai-memory/features').slice(-6).join('\n'));
console.log('### decisions'); console.log(fs.readdirSync('ai-memory/decisions').slice(-6).join('\n'));
console.log('### lessons'); console.log(fs.readdirSync('ai-memory/lessons').slice(-4).join('\n'));
