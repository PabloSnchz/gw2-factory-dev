// BL-057 / MET-1b — las vistas previas de infusiones y drops se sirven desde La Bóveda.
// tools/meta-previews/build_previews.py baja (en CI) las imágenes de la wiki y convierte las 10
// a WebP en assets/previews/, con todos los cuadros y tiempos y como mucho 720x520.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'tools/meta-previews/build_previews.py');
const PY = process.platform === 'win32' ? 'python' : 'python3';
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/^\uFEFF/, '');
const py = (args, opts) => spawnSync(PY, args, Object.assign({ encoding: 'utf8', cwd: ROOT }, opts));
const hasPillow = py(['-c', 'import PIL.features as f, sys; sys.exit(0 if f.check("webp") else 1)']).status === 0;

test('el manifiesto cubre exactamente las metas con vista previa', () => {
  const r = py([SCRIPT, '--list']);
  assert.equal(r.status, 0, r.stderr);
  const list = JSON.parse(r.stdout);
  const drops = JSON.parse(read('assets/meta-drops.json'));
  const withPreview = drops.filter((d) => d.items && d.items[0] && d.items[0].preview).map((d) => d.metaId).sort();
  assert.deepEqual(Object.keys(list).sort(), withPreview);
  assert.equal(withPreview.length, 10);
  const metas = new Set(JSON.parse(read('assets/meta-events.json')).map((m) => m.id));
  for (const [id, v] of Object.entries(list)) {
    assert.ok(metas.has(id), id + ' existe en meta-events.json');
    assert.equal(v.out, 'assets/previews/' + id + '.webp');
    assert.ok(/^https:\/\/wiki\.guildwars2\.com\/images\//.test(v.src) || fs.existsSync(path.join(ROOT, v.src)), id + ': origen ' + v.src);
  }
});

test('convierte sin perder cuadros ni tiempos, achica a 720x520 y sigue si una falla', { skip: !hasPillow && 'sin Pillow con WebP' }, () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mtprev-'));
  const src = path.join(tmp, 'src'); fs.mkdirSync(src);
  const gen = [
    'from PIL import Image', 'import sys, json', 'd = sys.argv[1]', 'ids = json.loads(sys.argv[2])',
    'def anim(p, w, h, n):',
    '    fr = [Image.new("RGB", (w, h), (i * 8 % 256, 40, 200 - i * 5 % 200)) for i in range(n)]',
    '    fr[0].save(p, save_all=True, append_images=fr[1:], duration=[40 + (i % 3) * 30 for i in range(n)], loop=0)',
    'for k, i in enumerate(ids):',
    '    if i == "drakkar": continue',
    '    if k % 3 == 0: anim(d + "/" + i + ".gif", 900, 700, 24)',
    '    elif k % 3 == 1: Image.new("RGB", (1200, 400), (10, 120, 30)).save(d + "/" + i + ".jpg", quality=90)',
    '    else: anim(d + "/" + i + ".gif", 200, 100, 5)',
  ].join('\n');
  const ids = Object.keys(JSON.parse(py([SCRIPT, '--list']).stdout));
  const g = py(['-c', gen, src, JSON.stringify(ids)]);
  assert.equal(g.status, 0, g.stderr);
  const out = path.join(tmp, 'out'), rep = path.join(tmp, 'REPORTE.md');
  const r = py([SCRIPT, '--source-dir', src, '--out', out, '--report', rep]);
  assert.equal(r.status, 0, r.stderr);
  const text = fs.readFileSync(rep, 'utf8');
  assert.match(text, /RESULTADO: 9 de 10 listas/);
  assert.match(text, /\| drakkar \| .* \| FALLÓ: /);
  assert.ok(!fs.existsSync(path.join(out, 'drakkar.webp')), 'lo que falla no deja archivo');
  const check = [
    'from PIL import Image', 'import sys, json', 'res = {}',
    'for p in sys.argv[1:]:',
    '    im = Image.open(p); n = getattr(im, "n_frames", 1); t = 0',
    '    for i in range(n): im.seek(i); im.load(); t += im.info.get("duration", 0) if n > 1 else 0',
    '    res[p.split("/")[-1]] = [im.format, im.size[0], im.size[1], n, t]',
    'print(json.dumps(res))',
  ].join('\n');
  const files = ids.filter((i) => i !== 'drakkar').map((i) => path.join(out, i + '.webp'));
  const c = py(['-c', check, ...files]);
  assert.equal(c.status, 0, c.stderr);
  const res = JSON.parse(c.stdout);
  ids.forEach((id, k) => {
    if (id === 'drakkar') return;
    const [fmt, w, h, n, t] = res[id + '.webp'];
    assert.equal(fmt, 'WEBP', id);
    assert.ok(w <= 720 && h <= 520, id + ' ' + w + 'x' + h);
    if (k % 3 === 0) {
      assert.deepEqual([w, h, n], [669, 520, 24], id + ': proporción y cuadros');
      assert.equal(t, Array.from({ length: 24 }, (_, i) => 40 + (i % 3) * 30).reduce((a, b) => a + b), id + ': tiempos');
    } else if (k % 3 === 1) assert.deepEqual([w, h, n], [720, 240, 1], id);
    else assert.deepEqual([w, h, n], [200, 100, 5], id + ': no agranda');
  });
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('workflow: se dispara con la herramienta, no consigo mismo, y guarda imágenes e informe', () => {
  const y = read('.github/workflows/meta-previews.yml');
  assert.match(y, /- 'tools\/meta-previews\/\*\*'/);
  assert.match(y, /- '!tools\/meta-previews\/REPORTE\.md'/);
  assert.match(y, /contents: write/);
  assert.match(y, /github\.repository == 'PabloSnchz\/gw2-factory-dev'/);
  assert.match(y, /build_previews\.py --out assets\/previews --report tools\/meta-previews\/REPORTE\.md/);
  assert.match(y, /git add assets\/previews tools\/meta-previews\/REPORTE\.md/);
  assert.ok(!/assets\/gifanim/.test(y.replace(/#.*$/gm, '')), 'no borra ni toca los originales');
});
