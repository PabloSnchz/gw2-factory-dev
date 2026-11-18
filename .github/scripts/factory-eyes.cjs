// factory-eyes.cjs — BL-095 CF-2 (Shiruvana). Mis ojos.
// Lee factory/eyes/EYE-NNN.json sin respuesta, saca capturas con
// Cloudflare Browser Run (plan gratis: 10 min/día, 1 pedido cada 10 s) y deja
// factory/eyes/EYE-NNN-K.png + factory/eyes/EYE-NNN.md.
// Alcance (DEC-051, Pablo 2026-11-18): puedo MIRAR cualquier sitio público —
// DEV, PRD, el resto del ecosistema y sitios de afuera—. Mirar no es tocar:
// esto solo saca fotos, nunca escribe en ningún repo ni sitio.
// `path` = atajo relativo a DEV; `url` = cualquier http(s) público.
// Seguridad: sin credenciales en la URL ni direcciones locales/privadas;
// máximo 4 capturas por pedido; el token llega por variable de entorno y
// nunca se imprime.
'use strict';
const fs = require('fs');
const path = require('path');

const BASE = 'https://pablosnchz.github.io/gw2-factory-dev/';
const DIR = 'factory/eyes';
const MAX_SHOTS = 4;
const GAP_MS = 11000;
const DEVICES = {
  celular: { width: 390, height: 844 },
  compu: { width: 1366, height: 900 },
};
const WAITS = ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'];

// Devuelve la URL normalizada o null si no es un sitio público http(s).
function publicUrl(raw) {
  if (typeof raw !== 'string' || raw.length > 2000 || /\s/.test(raw)) return null;
  let u;
  try { u = new URL(raw); } catch (e) { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if (u.username || u.password) return null;
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!h.includes('.') && !h.includes(':')) return null;
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return null;
  if (/^(0|10|127)\./.test(h) || /^169\.254\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)) return null;
  if (h.includes(':')) return null; // IPv6 literal: no la necesito
  return u.href;
}

function validate(req, file) {
  const errs = [];
  const m = /^EYE-(\d{3,})\.json$/.exec(path.basename(file));
  if (!m) errs.push('nombre de archivo inválido');
  if (!req || typeof req !== 'object') return { errs: ['no es un objeto JSON'], shots: [] };
  if (m && req.id !== 'EYE-' + m[1]) errs.push('id no coincide con el archivo');
  const shots = Array.isArray(req.shots) ? req.shots : [];
  if (shots.length < 1 || shots.length > MAX_SHOTS) errs.push('shots debe tener entre 1 y ' + MAX_SHOTS);
  const out = [];
  shots.forEach((s, i) => {
    s = s && typeof s === 'object' ? s : {};
    const p = typeof s.path === 'string' ? s.path : '';
    let url = BASE + p;
    if (s.url !== undefined) {
      if (s.path !== undefined) errs.push('shot ' + (i + 1) + ': usar path o url, no los dos');
      url = publicUrl(s.url);
      if (!url) errs.push('shot ' + (i + 1) + ': url inválida (solo http/https públicos, sin credenciales)');
    } else if (!/^[A-Za-z0-9._\-\/#?=&]*$/.test(p) || p.includes('..') || p.includes('//') || p.startsWith('/')) {
      errs.push('shot ' + (i + 1) + ': path inválido');
    }
    const device = s.device || 'celular';
    if (!Object.prototype.hasOwnProperty.call(DEVICES, device)) errs.push('shot ' + (i + 1) + ': device debe ser celular o compu');
    const wait = s.wait || 'networkidle0';
    if (!WAITS.includes(wait)) errs.push('shot ' + (i + 1) + ': wait inválido');
    out.push({ url, device, viewport: DEVICES[device], fullPage: s.fullPage === true, wait, note: typeof s.note === 'string' ? s.note.slice(0, 200) : '' });
  });
  return { errs, shots: out };
}

function pending(root) {
  const dir = path.join(root, DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => /^EYE-\d{3,}\.json$/.test(f))
    .filter((f) => !fs.existsSync(path.join(dir, f.replace(/\.json$/, '.md'))))
    .sort();
}

function body(shot) {
  return {
    url: shot.url,
    viewport: shot.viewport,
    screenshotOptions: { type: 'png', fullPage: shot.fullPage },
    gotoOptions: { waitUntil: shot.wait, timeout: 45000 },
  };
}

async function shoot(shot, env, fetchImpl) {
  const uri = 'https://api.cloudflare.com/client/v4/accounts/' + env.account + '/browser-run/screenshot';
  for (let intento = 1; intento <= 2; intento++) {
    const r = await fetchImpl(uri, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body(shot)),
    });
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const ms = r.headers.get('x-browser-ms-used') || '';
    if (r.ok && ct.startsWith('image/')) {
      return { ok: true, ms, bytes: Buffer.from(await r.arrayBuffer()) };
    }
    const txt = (await r.text()).slice(0, 500);
    if (r.status === 429 && intento === 1) {
      const ra = Math.min(parseInt(r.headers.get('retry-after') || '12', 10) || 12, 30);
      await env.sleep(ra * 1000);
      continue;
    }
    return { ok: false, status: r.status, ms, error: txt.split(env.token).join('***') };
  }
  return { ok: false, status: 429, error: 'límite de pedidos' };
}

async function run(root, env, fetchImpl) {
  const files = [];
  const list = pending(root);
  for (const f of list) {
    const id = f.replace(/\.json$/, '');
    const abs = path.join(root, DIR, f);
    let req = null;
    try { req = JSON.parse(fs.readFileSync(abs, 'utf8')); } catch (e) { req = null; }
    const { errs, shots } = validate(req, abs);
    const lines = ['# ' + id + ' — capturas', '', 'Fecha: ' + new Date().toISOString(), ''];
    if (errs.length) {
      lines.push('Estado: RECHAZADO', '', ...errs.map((e) => '- ' + e));
    } else {
      let okCount = 0;
      let msTotal = 0;
      for (let i = 0; i < shots.length; i++) {
        if (i > 0) await env.sleep(GAP_MS);
        const s = shots[i];
        const res = await shoot(s, env, fetchImpl);
        const tag = s.device + ' ' + s.viewport.width + 'x' + s.viewport.height + (s.fullPage ? ' página completa' : '');
        if (res.ok) {
          const name = id + '-' + (i + 1) + '.png';
          fs.writeFileSync(path.join(root, DIR, name), res.bytes);
          files.push(DIR + '/' + name);
          okCount++;
          msTotal += parseFloat(res.ms) || 0;
          lines.push('- ' + (i + 1) + '. OK · ' + tag + ' · ' + s.url + ' · ' + name + ' · ' + Math.round(parseFloat(res.ms) || 0) + ' ms' + (s.note ? ' · ' + s.note : ''));
        } else {
          lines.push('- ' + (i + 1) + '. FALLÓ · ' + tag + ' · ' + s.url + ' · HTTP ' + res.status + ' · ' + String(res.error).replace(/\s+/g, ' '));
        }
      }
      lines.splice(4, 0, 'Estado: ' + (okCount === shots.length ? 'OK' : okCount ? 'PARCIAL' : 'FALLÓ') + ' (' + okCount + '/' + shots.length + ') · navegador usado: ' + Math.round(msTotal) + ' ms', '');
    }
    fs.writeFileSync(path.join(root, DIR, id + '.md'), lines.join('\n') + '\n');
    files.push(DIR + '/' + id + '.md');
  }
  return files;
}

module.exports = { validate, publicUrl, pending, body, shoot, run, BASE, DEVICES, MAX_SHOTS };

if (require.main === module) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID || '';
  const token = process.env.CLOUDFLARE_API_TOKEN || '';
  if (!/^[0-9a-fA-F]{32}$/.test(account) || token.length < 20) {
    console.error('Faltan los secretos CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN');
    process.exit(1);
  }
  const env = { account, token, sleep: (ms) => new Promise((r) => setTimeout(r, ms)) };
  run(process.cwd(), env, fetch).then((files) => {
    const list = path.join(process.env.RUNNER_TEMP || '.', 'factory-eyes-files.txt');
    fs.writeFileSync(list, files.join('\n') + (files.length ? '\n' : ''));
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'count=' + files.length + '\n');
    console.log('Archivos: ' + files.length);
  }).catch((e) => { console.error(String((e && e.message) || e).split(token).join('***')); process.exit(1); });
}
