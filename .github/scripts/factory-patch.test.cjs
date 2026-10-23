// Ejecutor y workflow del canal de parches (DEC-035, BL-065, FP-2).
// Corre con: node --test .github/scripts/*.test.cjs
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const AP = require('./apply-patch.cjs');
const F = require('./factory-patch.cjs');

const JS = 'window.A = 1;\n';
const MD = '# Doc\n\nuno\n';

function repo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fp2-'));
  Object.keys(files).forEach((p) => {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), files[p]);
  });
  return root;
}
const read = (root, p) => fs.readFileSync(path.join(root, p), 'utf8');
const has = (root, p) => fs.existsSync(path.join(root, p));
const patch = (n, file, base, ops) => JSON.stringify({ id: 'PATCH-' + n, summary: 'prueba ' + n,
  files: [{ path: file, base_sha: AP.blobSha(base), ops }] });
// Dependencias de mentira: la suite y node --check responden lo que diga el test.
function fakes(o) {
  const calls = { suite: 0, check: [] };
  const states = (o && o.suite) || [{ ok: true, fails: 0 }];
  return { calls, deps: {
    now: () => '2026-10-23T19:30:00Z',
    suite: () => states[Math.min(calls.suite++, states.length - 1)],
    jsCheck: (root, files) => { calls.check.push(files.slice()); return (o && o.check) ? o.check(root, files) : []; }
  } };
}

test('pendientes: solo PATCH-NNN.json sin RESULT, en orden numérico', () => {
  const root = repo({ 'factory/patches/PATCH-010.json': '{}', 'factory/patches/PATCH-009.json': '{}',
    'factory/patches/PATCH-1000.json': '{}', 'factory/patches/PATCH-002.json': '{}', 'factory/patches/RESULT-002.md': 'x',
    'factory/patches/PATCH-01.json': '{}', 'factory/patches/README.md': 'x', 'factory/patches/PATCH-003.json.bak': '{}' });
  assert.deepEqual(F.pending(root), ['factory/patches/PATCH-009.json', 'factory/patches/PATCH-010.json', 'factory/patches/PATCH-1000.json']);
  assert.deepEqual(F.pending(repo({ 'index.html': 'x' })), [], 'sin carpeta, nada');
  // Orden por número, no alfabético: «1000» va después de «999».
  assert.deepEqual(F.pending(repo({ 'factory/patches/PATCH-1000.json': '{}', 'factory/patches/PATCH-999.json': '{}' })),
    ['factory/patches/PATCH-999.json', 'factory/patches/PATCH-1000.json']);
});

test('la suite se compara con el estado que dejó el parche anterior', () => {
  // Base en rojo; el 001 la arregla (verde); el 002 la rompe: se rechaza el 002.
  const v2 = '# Doc\n\ndos\n';
  const root = repo({ 'docs/a.md': MD,
    'factory/patches/PATCH-001.json': patch('001', 'docs/a.md', MD, [{ op: 'replace', anchor: 'uno', text: 'dos' }]),
    'factory/patches/PATCH-002.json': patch('002', 'docs/a.md', v2, [{ op: 'replace', anchor: 'dos', text: 'tres' }]) });
  const run = F.processAll(root, fakes({ suite: [{ ok: false, fails: 1 }, { ok: true, fails: 0 }, { ok: false, fails: 4 }] }).deps);
  assert.deepEqual(run.results.map((r) => r.ok), [true, false]);
  assert.equal(read(root, 'docs/a.md'), v2);
  assert.match(read(root, 'factory/patches/RESULT-002.md'), /pasaba y con el parche falla \(4 fallas\)/);
});

test('DEV se republica solo si cambia algo que dev-pages publica', () => {
  assert.equal(F.needsPages([]), false);
  assert.equal(F.needsPages(['docs/a.md', 'ai-memory/status.md', 'tests/a.test.cjs', 'tools/x.py', 'README.md']), false);
  ['index.html', 'js/meta.js', 'css/a.css', 'assets/a.json', 'docs/a.html'].forEach((p) =>
    assert.equal(F.needsPages(['docs/a.md', p]), true, p));
});

test('rechazo por sha base: no toca nada, no corre la suite y deja RESULT', () => {
  const root = repo({ 'docs/a.md': MD, 'factory/patches/PATCH-001.json': patch('001', 'docs/a.md', 'otra versión\n',
    [{ op: 'replace', anchor: 'uno', text: 'dos' }]) });
  const f = fakes();
  const run = F.processAll(root, f.deps);
  assert.deepEqual(run, { files: [], results: [{ id: 'PATCH-001', result: 'factory/patches/RESULT-001.md', ok: false }], pages: false });
  assert.equal(read(root, 'docs/a.md'), MD);
  assert.equal(f.calls.suite, 0, 'un rechazo en el plan no gasta la suite');
  const md = read(root, 'factory/patches/RESULT-001.md');
  assert.match(md, /^# RESULT de PATCH-001\n\n- Fecha: 2026-10-23T19:30:00Z\n- Estado: RECHAZADO\n/);
  assert.match(md, /docs\/a\.md: el archivo cambió/);
  assert.deepEqual(F.pending(root), [], 'con RESULT ya no está pendiente');
});

test('rechazo por ancla ambigua y por ruta protegida', () => {
  const root = repo({ 'docs/a.md': 'uno uno\n', '.github/workflows/w.yml': 'on: push\n',
    'factory/patches/PATCH-001.json': patch('001', 'docs/a.md', 'uno uno\n', [{ op: 'replace', anchor: 'uno', text: 'dos' }]),
    'factory/patches/PATCH-002.json': patch('002', '.github/workflows/w.yml', 'on: push\n', [{ op: 'delete', anchor: 'push' }]) });
  const run = F.processAll(root, fakes().deps);
  assert.deepEqual(run.results.map((r) => r.ok), [false, false]);
  assert.match(read(root, 'factory/patches/RESULT-001.md'), /el ancla aparece 2 veces/);
  assert.match(read(root, 'factory/patches/RESULT-002.md'), /ruta fuera de lo que el canal puede tocar \(\.github\/workflows\/w\.yml\)/);
  assert.equal(read(root, '.github/workflows/w.yml'), 'on: push\n');
  assert.equal(read(root, 'docs/a.md'), 'uno uno\n');
});

test('JSON roto: RESULT rechazado y sigue con el próximo', () => {
  const root = repo({ 'docs/a.md': MD, 'factory/patches/PATCH-001.json': '{ roto',
    'factory/patches/PATCH-002.json': patch('002', 'docs/a.md', MD, [{ op: 'replace', anchor: 'uno', text: 'dos' }]) });
  const run = F.processAll(root, fakes().deps);
  assert.deepEqual(run.results.map((r) => r.ok), [false, true]);
  assert.match(read(root, 'factory/patches/RESULT-001.md'), /no pude leer el parche/);
  assert.equal(read(root, 'docs/a.md'), '# Doc\n\ndos\n');
});

test('aplicado: escribe, valida con node --check y la suite, y anota el estado', () => {
  const root = repo({ 'js/a.js': JS, 'factory/patches/PATCH-001.json': patch('001', 'js/a.js', JS,
    [{ op: 'insert_after', anchor: 'window.A = 1;\n', text: 'window.B = 2;\n' }]) });
  const f = fakes();
  const run = F.processAll(root, f.deps);
  assert.deepEqual(run, { files: ['js/a.js'], results: [{ id: 'PATCH-001', result: 'factory/patches/RESULT-001.md', ok: true }], pages: true });
  assert.equal(read(root, 'js/a.js'), JS + 'window.B = 2;\n');
  assert.deepEqual(f.calls.check, [['js/a.js']]);
  assert.equal(f.calls.suite, 2, 'antes y después');
  const md = read(root, 'factory/patches/RESULT-001.md');
  assert.match(md, /- Estado: APLICADO\n/);
  assert.match(md, new RegExp('`' + AP.blobSha(JS) + '` \\| `' + AP.blobSha(JS + 'window.B = 2;\n') + '`'));
  assert.match(md, /\n- Suite de tests: verde antes y después\.\n$/);
});

test('node --check falla: restaura byte a byte y rechaza, sin correr la suite de después', () => {
  const root = repo({ 'js/a.js': JS, 'factory/patches/PATCH-001.json': patch('001', 'js/a.js', JS,
    [{ op: 'replace', anchor: 'window.A = 1;', text: 'window.A = (;' }]) });
  const f = fakes({ check: () => ['node --check js/a.js: SyntaxError'] });
  const run = F.processAll(root, f.deps);
  assert.equal(run.results[0].ok, false);
  assert.deepEqual(run.files, []);
  assert.equal(run.pages, false);
  assert.equal(read(root, 'js/a.js'), JS);
  assert.equal(f.calls.suite, 1, 'solo la de antes');
  assert.match(read(root, 'factory/patches/RESULT-001.md'), /RECHAZADO[\s\S]*- node --check js\/a\.js: SyntaxError\n$/);
});

test('la suite pasaba y con el parche falla: restaura y rechaza', () => {
  const root = repo({ 'js/a.js': JS, 'factory/patches/PATCH-001.json': patch('001', 'js/a.js', JS,
    [{ op: 'replace', anchor: '1', text: '2' }]) });
  const run = F.processAll(root, fakes({ suite: [{ ok: true, fails: 0 }, { ok: false, fails: 3 }] }).deps);
  assert.equal(run.results[0].ok, false);
  assert.equal(read(root, 'js/a.js'), JS);
  assert.match(read(root, 'factory/patches/RESULT-001.md'), /la suite de tests pasaba y con el parche falla \(3 fallas\)/);
});

test('la suite ya estaba en rojo: no culpa al parche y lo anota', () => {
  const root = repo({ 'js/a.js': JS, 'factory/patches/PATCH-001.json': patch('001', 'js/a.js', JS,
    [{ op: 'replace', anchor: '1', text: '2' }]) });
  const run = F.processAll(root, fakes({ suite: [{ ok: false, fails: 2 }, { ok: false, fails: 2 }] }).deps);
  assert.equal(run.results[0].ok, true);
  assert.match(read(root, 'factory/patches/RESULT-001.md'),
    /ya estaba en rojo antes del parche \(2 fallas\); el parche no rompió ningún archivo nuevo y pasó node --check\./);
});

test('suite en rojo: si el parche rompe una prueba que antes pasaba, se rechaza igual', () => {
  const root = repo({ 'js/a.js': JS, 'factory/patches/PATCH-001.json': patch('001', 'js/a.js', JS,
    [{ op: 'replace', anchor: '1', text: '2' }]) });
  const base = { ok: false, fails: 1, failing: ['tests/a.test.cjs: vieja'] };
  const after = { ok: false, fails: 2, failing: ['tests/a.test.cjs: vieja', 'tests/b.test.cjs: nueva'] };
  const run = F.processAll(root, fakes({ suite: [base, after] }).deps);
  assert.equal(run.results[0].ok, false);
  assert.equal(read(root, 'js/a.js'), JS);
  assert.match(read(root, 'factory/patches/RESULT-001.md'),
    /con el parche fallan archivos de tests que antes pasaban: tests\/b\.test\.cjs: nueva\n/);
  // Las mismas fallas de antes: se aplica y el RESULT las nombra.
  const root2 = repo({ 'js/a.js': JS, 'factory/patches/PATCH-001.json': patch('001', 'js/a.js', JS,
    [{ op: 'replace', anchor: '1', text: '2' }]) });
  assert.equal(F.processAll(root2, fakes({ suite: [base, base] }).deps).results[0].ok, true);
  assert.match(read(root2, 'factory/patches/RESULT-001.md'), /en rojo antes del parche \(1 fallas: tests\/a\.test\.cjs: vieja\)/);
  assert.deepEqual(F.newFailures(base, after), ['tests/b.test.cjs: nueva']);
  assert.deepEqual(F.newFailures({ ok: false, fails: null }, { ok: false, fails: null }), []);
});

test('TAP: cuenta las fallas y las nombra por archivo, sin subpruebas ni repetidos', () => {
  const tap = ['TAP version 13', '# Subtest: pasa', 'ok 1 - pasa', '# Subtest: falla A', 'not ok 2 - falla A', '  ---',
    "  location: '/home/runner/work/x/x/tests/bad.test.cjs:1:47'", '  ...', '# Subtest: grupo', 'not ok 3 - grupo',
    '    not ok 1 - hija', "      location: '/r/tests/hija.test.cjs:2:1'", "  location: '/r/tests/grupo.test.cjs:1:1'",
    '# Subtest: tests/crash.smoke.js', 'not ok 4 - tests/crash.smoke.js', '  ---',
    "  location: '/r/tests/crash.smoke.js:1:1'", 'not ok 5 - suelta # SKIP',
    'not ok 6 - tests/crash.smoke.js', "  location: '/r/tests/crash.smoke.js:1:1'", '1..6', '# pass 1', '# fail 4'].join('\n');
  assert.deepEqual(F.parseTap(tap), { fails: 4, failing: ['tests/bad.test.cjs: falla A', 'tests/grupo.test.cjs: grupo',
    'tests/crash.smoke.js', 'suelta'] });
  assert.deepEqual(F.parseTap('sin resumen'), { fails: null, failing: [] });
  assert.equal(F.describe({ fails: null, failing: [] }), '? fallas');
  const many = Array.from({ length: 12 }, (_, i) => 'f' + i);
  assert.equal(F.describe({ fails: 12, failing: many }), '12 fallas: ' + many.slice(0, 10).join(', ') + '…');
});

test('suite de verdad con node --test: verde, roja y archivo que revienta', () => {
  const ok = repo({ 'tests/a.test.cjs': "require('node:test')('ok', () => {});\n" });
  assert.deepEqual(F.suite(ok), { ok: true, fails: 0, failing: [] });
  const bad = repo({ 'tests/a.test.cjs': "const t = require('node:test'); t('ok', () => {}); t('rota', () => { throw new Error('x'); });\n",
    'tests/b.smoke.js': "throw new Error('boom');\n" });
  const s = F.suite(bad);
  assert.equal(s.ok, false);
  assert.equal(s.fails, 2);
  assert.deepEqual(s.failing.sort(), ['tests/a.test.cjs: rota', 'tests/b.smoke.js']);
});

test('dos parches encadenados: el segundo parte del resultado del primero', () => {
  const v2 = '# Doc\n\ndos\n';
  const root = repo({ 'docs/a.md': MD,
    'factory/patches/PATCH-001.json': patch('001', 'docs/a.md', MD, [{ op: 'replace', anchor: 'uno', text: 'dos' }]),
    'factory/patches/PATCH-002.json': patch('002', 'docs/a.md', v2, [{ op: 'insert_after', anchor: 'dos', text: ' y tres' }]) });
  const f = fakes();
  const run = F.processAll(root, f.deps);
  assert.deepEqual(run.results.map((r) => r.ok), [true, true]);
  assert.deepEqual(run.files, ['docs/a.md'], 'sin repetidos');
  assert.equal(read(root, 'docs/a.md'), '# Doc\n\ndos y tres\n');
  assert.equal(f.calls.suite, 3, 'una base y una después de cada parche');
  // Reprocesar no hace nada: los dos tienen RESULT.
  assert.deepEqual(F.processAll(root, f.deps).results, []);
});

test('lo preparado para el commit tiene que ser exactamente lo esperado', () => {
  const run = { files: ['index.html'], results: [{ id: 'PATCH-001', result: 'factory/patches/RESULT-001.md', ok: true }] };
  assert.deepEqual(F.verifyStaged(['index.html', 'factory/patches/RESULT-001.md'], run), []);
  assert.deepEqual(F.verifyStaged(['index.html', 'js/otro.js'], run), ['js/otro.js']);
  assert.deepEqual(F.verifyStaged(['.github/workflows/x.yml'], run), ['.github/workflows/x.yml']);
  const forged = { files: ['.github/workflows/x.yml', 'factory/patches/PATCH-002.json'], results: [] };
  assert.deepEqual(F.verifyStaged(['.github/workflows/x.yml', 'factory/patches/PATCH-002.json'], forged),
    ['.github/workflows/x.yml', 'factory/patches/PATCH-002.json'], 'aunque la lista venga adulterada');
});

test('mensaje del commit: ids y resultados, sin texto del parche', () => {
  const m = F.message({ results: [{ id: 'PATCH-001', result: 'factory/patches/RESULT-001.md', ok: false },
    { id: 'PATCH-002', result: 'factory/patches/RESULT-002.md', ok: true }] });
  assert.equal(m, 'factory-patch: PATCH-001 rechazado, PATCH-002 aplicado\n\nCanal de parches (DEC-035). ' +
    'Detalle en factory/patches/RESULT-001.md, factory/patches/RESULT-002.md.\n');
});

test('node --check de verdad: detecta un error de sintaxis y deja pasar lo sano', () => {
  const root = repo({ 'js/ok.js': JS, 'js/mal.js': 'window.A = (;\n', 'docs/a.md': MD });
  assert.deepEqual(F.jsCheck(root, ['js/ok.js', 'docs/a.md']), []);
  const e = F.jsCheck(root, ['js/ok.js', 'js/mal.js']);
  assert.equal(e.length, 1);
  assert.match(e[0], /^node --check js\/mal\.js: SyntaxError/);
});

test('línea de comandos: escribe la lista, el mensaje y las salidas para el workflow', () => {
  const root = repo({ 'docs/a.md': MD, 'tests/x.test.cjs': "require('node:test')('ok', () => {});\n",
    'factory/patches/PATCH-001.json': patch('001', 'docs/a.md', MD, [{ op: 'replace', anchor: 'uno', text: 'dos' }]),
    'factory/patches/PATCH-002.json': patch('002', 'docs/a.md', 'vieja\n', [{ op: 'replace', anchor: 'uno', text: 'dos' }]) });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fp2-tmp-'));
  const out = path.join(tmp, 'out.txt');
  const script = path.join(__dirname, 'factory-patch.cjs');
  const env = Object.assign({}, process.env, { RUNNER_TEMP: tmp, GITHUB_OUTPUT: out });
  const log = execFileSync(process.execPath, [script], { cwd: root, env }).toString();
  assert.match(log, /PATCH-001: APLICADO[\s\S]*PATCH-002: RECHAZADO/);
  assert.equal(fs.readFileSync(out, 'utf8'), 'count=2\npages=false\n');
  assert.equal(fs.readFileSync(path.join(tmp, 'factory-patch-files.txt'), 'utf8'),
    'docs/a.md\nfactory/patches/RESULT-001.md\nfactory/patches/RESULT-002.md\n');
  assert.match(fs.readFileSync(path.join(tmp, 'factory-patch-msg.txt'), 'utf8'), /^factory-patch: PATCH-001 aplicado, PATCH-002 rechazado\n/);
  assert.match(read(root, 'factory/patches/RESULT-001.md'), /Suite de tests: verde antes y después/);
  const ok = execFileSync(process.execPath, [script, '--verify-staged'], { cwd: root, env,
    input: 'docs/a.md\nfactory/patches/RESULT-001.md\n' }).toString();
  assert.match(ok, /OK: 2 archivos esperados/);
  assert.throws(() => execFileSync(process.execPath, [script, '--verify-staged'], { cwd: root, env, stdio: 'pipe',
    input: 'docs/a.md\n.github/workflows/x.yml\n' }), (e) => e.status === 1 && /Cambios no esperados: \.github\/workflows\/x\.yml/.test(String(e.stderr)));
  const none = execFileSync(process.execPath, [script], { cwd: root, env }).toString();
  assert.match(none, /Sin parches pendientes\./);
  assert.equal(fs.readFileSync(out, 'utf8'), 'count=2\npages=false\ncount=0\npages=false\n');
});

// El workflow: guardas que no pueden perderse en una edición futura.
const WF = fs.readFileSync(path.join(__dirname, '..', 'workflows', 'factory-patch.yml'), 'utf8');

test('workflow: solo DEV, solo el dueño, en serie, con permisos mínimos', () => {
  assert.match(WF, /github\.repository == 'PabloSnchz\/gw2-factory-dev' &&\n\s+github\.actor == github\.repository_owner/);
  assert.match(WF, /\npermissions:\n  contents: write\n  actions: write\n\n/);
  assert.match(WF, /\nconcurrency:\n  group: factory-patch\n  cancel-in-progress: false\n/);
  assert.match(WF, /paths:\n\s+- 'factory\/patches\/PATCH-\*\.json'/);
  assert.match(WF, /ref: main\n/, 'parte del main actual, no del commit que lo disparó');
  assert.match(WF, /timeout-minutes: 15/);
  assert.doesNotMatch(WF, /pull_request|issue|secrets\./);
});

test('workflow: nada del evento entra a un comando; verifica antes del commit; republica DEV', () => {
  const runs = WF.split('\n').filter((l) => /\$\{\{/.test(l));
  assert.deepEqual(runs.map((l) => l.trim()), ["GH_TOKEN: ${{ github.token }}"], 'la única expresión es el token, en env');
  const commit = WF.slice(WF.indexOf('- name: Commit del resultado'), WF.indexOf('- name: Republicar DEV'));
  assert.ok(commit.indexOf('--verify-staged') < commit.indexOf('git commit'), 'verifica antes de commitear');
  assert.doesNotMatch(commit, /git add (-A|\.|--all)/, 'nunca agrega todo');
  assert.match(commit, /if: steps\.apply\.outputs\.count != '0'/);
  assert.match(WF, /node --test \.github\/scripts\/apply-patch\.test\.cjs \.github\/scripts\/factory-patch\.test\.cjs/);
  assert.match(WF, /if: steps\.apply\.outputs\.pages == 'true'[\s\S]*gh workflow run dev-pages\.yml --ref main/);
});
