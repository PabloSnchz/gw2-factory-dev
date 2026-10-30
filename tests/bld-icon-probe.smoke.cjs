// BLD-ICON sonda (se borra al cerrar). Pasada 4: lo veo en texto. Decodifica PNG (8 bits, sin entrelazado) y dibuja cada
// ícono como arte ASCII (alfa y brillo), para comparar con la captura de Pablo (pestaña del Almacén de builds).
// A) los 3 íconos de objetos de plantillas (API). B) texturas de interfaz por id en assets.gw2dat.com cerca de esos ids
// (la pestaña salió el mismo día, 2019-10-29): solo las chicas y con transparencia.
'use strict';
const zlib = require('zlib');
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; sonda de icono)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function png(buf) {
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  let p = 8, w = 0, h = 0, bd = 0, ct = 0, il = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), d = buf.slice(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bd = d[8]; ct = d[9]; il = d[12]; }
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const ch = { 0: 1, 2: 3, 4: 2, 6: 4 }[ct];
  if (bd !== 8 || !ch || il) return { w, h, ct, unsupported: true };
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * ch, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.slice(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? out[y * stride + x - ch] : 0, b = y ? out[(y - 1) * stride + x] : 0, c = x >= ch && y ? out[(y - 1) * stride + x - ch] : 0;
      let v = row[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[y * stride + x] = v & 255;
    }
  }
  const px = (x, y) => { const i = y * stride + x * ch; const r = out[i], g = ch >= 3 ? out[i + 1] : r, bl = ch >= 3 ? out[i + 2] : r; const al = ch === 4 ? out[i + 3] : ch === 2 ? out[i + 1] : 255; return [r, g, bl, al]; };
  return { w, h, ct, px };
}
function art(im, cols) {
  const sx = im.w / cols, rows = Math.round(im.h / sx / 2), sy = im.h / rows, L = ' .:-=+*#%@', lines = [];
  let trans = 0, n = 0;
  for (let y = 0; y < rows; y++) {
    let s = '';
    for (let x = 0; x < cols; x++) {
      const [r, g, b, a] = im.px(Math.min(im.w - 1, Math.floor(x * sx + sx / 2)), Math.min(im.h - 1, Math.floor(y * sy + sy / 2)));
      const v = ((r + g + b) / 3) * (a / 255); n++; if (a < 40) trans++;
      s += L[Math.min(9, Math.floor(v / 25.6))];
    }
    lines.push('|' + s + '|');
  }
  return { text: lines.join('\n'), trans: trans / n };
}
async function get(u) { try { const r = await fetch(u, UA); return { st: r.status, b: r.ok ? Buffer.from(await r.arrayBuffer()) : null }; } catch (e) { return { st: 'ERR', b: null }; } }
(async () => {
  const A = { 2215699: 'https://render.guildwars2.com/file/A7C0D0FAA827F5FA014DEE499FA71676093E29C4/2215699.png',
    2215700: 'https://render.guildwars2.com/file/DA2B54C2B7F9F1804DAEB0F4A8E44A4459A20B04/2215700.png',
    2215701: 'https://render.guildwars2.com/file/A615CE6395B4345715EEFA5BD242F54CE3E72EAA/2215701.png' };
  for (const id of Object.keys(A)) {
    const r = await get(A[id]); const im = r.b && png(r.b);
    console.log('API', id, r.st, im ? im.w + 'x' + im.h + ' ct' + im.ct : '-');
    if (im && im.px) console.log(art(im, 32).text);
  }
  const t0 = await get('https://assets.gw2dat.com/2215700.png');
  console.log('GW2DAT prueba', t0.st, t0.b ? t0.b.length : 0);
  if (!t0.b) return;
  const hits = [];
  for (let id = 2215560; id <= 2215840; id++) {
    const r = await get('https://assets.gw2dat.com/' + id + '.png');
    if (!r.b) continue;
    let im = null; try { im = png(r.b); } catch (_) {}
    if (!im || !im.px || im.w > 64 || im.h > 64 || im.w < 16) continue;
    const a = art(im, 24);
    if (a.trans < 0.25) continue;
    hits.push({ id, im, a });
    await sleep(40);
  }
  console.log('CANDIDATOS', hits.length, hits.map((h) => h.id + '(' + h.im.w + ')').join(' '));
  hits.slice(0, 14).forEach((h) => console.log('ID', h.id, h.im.w + 'x' + h.im.h, 'transp ' + Math.round(h.a.trans * 100) + '%\n' + h.a.text));
})();
