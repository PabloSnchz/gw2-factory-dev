// Canal de recursos de la Factory (BL-082 BLD-ICON). La Factory no puede subir binarios por la API que usa:
// pide un ícono oficial con factory/assets/ASSET-NNN.json y este script lo baja, lo verifica y lo deja en assets/icons/.
// El resultado (ok o motivo del rechazo, con tamaño y sha256) queda en factory/assets/ASSET-NNN.md.
//
// ASSET-NNN.json: { "id": "ASSET-001", "summary": "...", "files": [ { "url": "https://...", "path": "assets/icons/x.png",
//                   "sha256": "opcional" } ] }
// Reglas (todo o nada): solo https de hosts de recursos de Guild Wars 2; solo PNG/WebP/GIF/JPG reales (firma);
// hasta 5 archivos de 300 KB; solo assets/icons/ (sin subir de carpeta); no pisa un archivo que ya existe.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DIR = 'factory/assets';
const REQ_RE = /^ASSET-(\d{3,})\.json$/;
const HOSTS = ['render.guildwars2.com', 'assets.gw2dat.com', 'wiki.guildwars2.com', 'wiki-en.guildwars2.com', 'icons-gw2.darthmaim-cdn.com'];
const PATH_RE = /^assets\/icons\/(?:[A-Za-z0-9_-]+\/)?[A-Za-z0-9_.-]+\.(png|webp|gif|jpg)$/;
const MAX_FILES = 5;
const MAX_BYTES = 300 * 1024;

function pending(root) {
  const dir = path.join(root, DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => REQ_RE.test(f) && !fs.existsSync(path.join(dir, f.replace(/\.json$/, '.md'))))
    .sort((a, b) => Number(REQ_RE.exec(a)[1]) - Number(REQ_RE.exec(b)[1])).map((f) => DIR + '/' + f);
}

function validate(req, root) {
  if (!req || typeof req !== 'object' || Array.isArray(req)) return ['el pedido no es un objeto'];
  const errs = [];
  if (!/^ASSET-\d{3,}$/.test(String(req.id || ''))) errs.push('id inválido (se espera ASSET-NNN)');
  if (!Array.isArray(req.files) || !req.files.length) return errs.concat('files vacío');
  if (req.files.length > MAX_FILES) errs.push('demasiados archivos (' + req.files.length + ' > ' + MAX_FILES + ')');
  const seen = {};
  req.files.forEach((f, i) => {
    const w = 'files[' + i + ']';
    if (!f || typeof f !== 'object') { errs.push(w + ': no es un objeto'); return; }
    let u = null;
    try { u = new URL(String(f.url || '')); } catch (_) { errs.push(w + ': url inválida'); }
    if (u && (u.protocol !== 'https:' || HOSTS.indexOf(u.hostname) < 0)) errs.push(w + ': host no permitido (' + (u && u.hostname) + ')');
    const p = String(f.path || '');
    if (!PATH_RE.test(p) || p.indexOf('..') >= 0) errs.push(w + ': ruta no permitida (' + p + ')');
    else if (seen[p]) errs.push(w + ': ruta repetida');
    else if (root && fs.existsSync(path.join(root, p))) errs.push(w + ': ' + p + ' ya existe (no piso archivos)');
    seen[p] = true;
    if (f.sha256 != null && !/^[0-9a-f]{64}$/.test(String(f.sha256))) errs.push(w + ': sha256 inválido');
  });
  return errs;
}

// Firma real del archivo según su extensión.
function kindOf(buf) {
  if (buf.length > 8 && buf.readUInt32BE(0) === 0x89504e47) return 'png';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buf.length > 6 && buf.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  return '';
}
function pngSize(buf) { return kindOf(buf) === 'png' ? { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) } : null; }

function check(f, buf) {
  if (!buf || !buf.length) return 'vino vacío';
  if (buf.length > MAX_BYTES) return 'pesa ' + buf.length + ' B (máximo ' + MAX_BYTES + ')';
  const want = String(f.path).split('.').pop();
  const got = kindOf(buf);
  if (got !== want) return 'no es un ' + want.toUpperCase() + ' real (firma: ' + (got || 'desconocida') + ')';
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (f.sha256 && f.sha256 !== sha) return 'sha256 distinto (' + sha + ')';
  return '';
}

async function fetchBuf(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; canal de recursos)' }, redirect: 'error' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}

function report(req, errs, done, when) {
  const id = req && /^ASSET-\d{3,}$/.test(String(req.id || '')) ? req.id : 'ASSET-???';
  const L = ['# Resultado de ' + id, '', '- Fecha: ' + when, '- Estado: ' + (errs.length ? 'RECHAZADO' : 'APLICADO')];
  if (req && typeof req.summary === 'string') L.push('- Pedido: ' + req.summary.replace(/\s+/g, ' ').trim());
  L.push('');
  if (errs.length) { L.push('No se escribió nada. Motivo:', ''); errs.forEach((e) => L.push('- ' + e)); }
  else {
    L.push('| Archivo | Origen | Bytes | Tamaño | sha256 |', '|---|---|---|---|---|');
    done.forEach((d) => L.push('| `' + d.path + '` | ' + d.url + ' | ' + d.bytes + ' | ' + (d.size ? d.size.w + '×' + d.size.h : '—') + ' | `' + d.sha + '` |'));
  }
  return L.join('\n') + '\n';
}

// fetcher(url) → Buffer (inyectable para los tests).
async function processOne(root, rf, fetcher, now) {
  let req = null, errs = [];
  const done = [];
  try { req = JSON.parse(fs.readFileSync(path.join(root, rf), 'utf8')); errs = validate(req, root); }
  catch (e) { errs = ['no pude leer el pedido: ' + e.message]; }
  const bufs = [];
  if (!errs.length) {
    for (const f of req.files) {
      try {
        const buf = await fetcher(f.url);
        const bad = check(f, buf);
        if (bad) errs.push(f.path + ': ' + bad); else bufs.push({ f, buf });
      } catch (e) { errs.push(f.path + ': no pude bajarlo (' + e.message + ')'); }
    }
  }
  if (!errs.length) {
    bufs.forEach(({ f, buf }) => {
      const abs = path.join(root, f.path);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, buf);
      done.push({ path: f.path, url: f.url, bytes: buf.length, size: pngSize(buf), sha: crypto.createHash('sha256').update(buf).digest('hex') });
    });
  }
  const out = rf.replace(/\.json$/, '.md');
  fs.writeFileSync(path.join(root, out), report(req, errs, done, now()));
  return { out, written: done.map((d) => d.path), errs };
}

async function processAll(root, fetcher, now) {
  now = now || (() => new Date().toISOString());
  const res = [];
  for (const rf of pending(root)) res.push(await processOne(root, rf, fetcher || fetchBuf, now));
  return res;
}

module.exports = { pending, validate, kindOf, check, report, processOne, processAll, HOSTS, PATH_RE, MAX_BYTES };

if (require.main === module) {
  processAll(process.cwd()).then((res) => {
    const files = res.flatMap((r) => [r.out].concat(r.written));
    const tmp = process.env.RUNNER_TEMP || require('node:os').tmpdir();
    fs.writeFileSync(path.join(tmp, 'factory-asset-files.txt'), files.join('\n') + (files.length ? '\n' : ''));
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'count=' + res.length + '\n');
    console.log(res.length ? res.map((r) => r.out + (r.errs.length ? ' RECHAZADO' : ' APLICADO')).join('\n') : 'Sin pedidos pendientes.');
  }).catch((e) => { console.error(e); process.exit(1); });
}
