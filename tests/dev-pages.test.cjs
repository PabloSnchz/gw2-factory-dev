// MIG-2e (BL-043): qué publica DEV en GitHub Pages y qué no se versiona.
// La app sí (index.html, js, css, assets); la memoria, los tests, las herramientas
// de datos (tools), el canal de parches (factory, DEC-035) y los workflows no. Si
// alguien toca el workflow y se le escapa una carpeta, o excluye de más y la app
// queda sin js, falla acá.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const WORKFLOW = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'dev-pages.yml'), 'utf8');
const NO_SE_PUBLICA = ['ai-memory', 'tests', 'tools', 'factory'];

function pathsIgnore(yml) {
  const m = yml.match(/paths-ignore:\n((?:\s+- .+\n)+)/);
  assert.ok(m, 'el workflow tiene paths-ignore');
  return m[1].split('\n').map(l => l.trim().replace(/^- /, '').replace(/^'|'$/g, '')).filter(Boolean);
}
function rsyncLine(yml) {
  const lines = yml.split('\n').map(l => l.trim()).filter(l => l.startsWith('rsync '));
  assert.equal(lines.length, 1, 'una sola línea rsync');
  return lines[0];
}
function excludes(line) { return [...line.matchAll(/--exclude '([^']+)'/g)].map(m => m[1]); }

test('un cambio solo en memoria, tests, herramientas o parches no dispara publicación', () => {
  const ignore = pathsIgnore(WORKFLOW);
  NO_SE_PUBLICA.forEach(d => assert.ok(ignore.includes(d + '/**'), d + '/** en paths-ignore'));
  assert.ok(ignore.includes('**.md'));
  ['js/**', 'css/**', 'assets/**', 'index.html'].forEach(p => assert.ok(!ignore.includes(p), p + ' sí publica'));
  assert.match(WORKFLOW, /\n  workflow_dispatch:\n/, 'factory-patch lo dispara a mano');
});

test('el sitio publicado excluye memoria, tests, herramientas, parches y workflows, y nada de la app', () => {
  const ex = excludes(rsyncLine(WORKFLOW));
  NO_SE_PUBLICA.concat(['.git', '.github', '_site']).forEach(d => assert.ok(ex.includes(d), 'excluye ' + d));
  ['js', 'css', 'assets', 'index.html', 'privacy.html', 'docs'].forEach(d => assert.ok(!ex.includes(d), 'publica ' + d));
  assert.match(WORKFLOW, /test -f _site\/index\.html/);
});

test('con rsync de verdad, el sitio armado tiene la app y no tools ni factory', { skip: spawnSync('rsync', ['--version']).status !== 0 && 'sin rsync' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dev-pages-'));
  try {
    const files = ['index.html', 'js/app.js', 'css/a.css', 'assets/icons/x.png', 'tools/legendary/build.py',
      'tools/legendary/.work/raw.json', 'ai-memory/status.md', 'tests/a.test.cjs', '.github/workflows/w.yml', '.gitignore',
      'factory/patches/PATCH-001.json'];
    files.forEach(f => { fs.mkdirSync(path.join(dir, path.dirname(f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), 'x'); });
    const run = WORKFLOW.match(/run: \|\n((?:\s{10}.+\n)+)/)[1].split('\n').map(l => l.trim()).filter(Boolean).join('\n');
    const r = spawnSync('bash', ['-euc', run], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const site = p => fs.existsSync(path.join(dir, '_site', p));
    ['index.html', 'js/app.js', 'css/a.css', 'assets/icons/x.png', '.nojekyll'].forEach(p => assert.ok(site(p), 'publica ' + p));
    ['tools', 'ai-memory', 'tests', '.github', '.gitignore', '_site', 'factory'].forEach(p => assert.ok(!site(p), 'no publica ' + p));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('las cachés de tools/legendary no se versionan', () => {
  const lines = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8').split('\n').map(l => l.trim());
  assert.ok(lines.includes('tools/legendary/.work/'));
  assert.ok(lines.includes('__pycache__/'));
  ['js/', 'tools/', 'tools/legendary/', '*.js', '*.py'].forEach(p => assert.ok(!lines.includes(p), p + ' se versiona'));
});
