// BLD-ICON sonda (se borra al cerrar). Pasada 7: 156720/156721 (ícono de esquina del módulo BuildsManager de Blish HUD,
// probable pestaña «Build» del Panel del héroe) y sus vecinos chicos, en ASCII (alfa y brillo), contra la captura de Pablo:
// un cuadrado detrás y un hexágono claro delante. Imprime el base64 de 156720 si mide 64 px o menos.
'use strict';
const zlib = require('zlib');
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; sonda de icono)' } };
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
  for (let y = 0; y < rows; y++) {
    let s = '';
    for (let x = 0; x < cols; x++) {
      const [r, g, b, a] = im.px(Math.min(im.w - 1, Math.floor(x * sx + sx / 2)), Math.min(im.h - 1, Math.floor(y * sy + sy / 2)));
      s += L[Math.min(9, Math.floor(((r + g + b) / 3) * (a / 255) / 25.6))];
    }
    lines.push('|' + s + '|');
  }
  return lines.join('\n');
}
async function get(u) { try { const r = await fetch(u, UA); return { st: r.status, b: r.ok ? Buffer.from(await r.arrayBuffer()) : null }; } catch (e) { return { st: 'ERR', b: null }; } }
(async () => {
  const ids = [156720, 156721]; for (let id = 156700; id <= 156745; id++) if (ids.indexOf(id) < 0) ids.push(id);
  const res = {};
  for (let k = 0; k < ids.length; k += 8) {
    await Promise.all(ids.slice(k, k + 8).map(async (id) => { res[id] = await get('https://assets.gw2dat.com/' + id + '.png'); }));
  }
  ids.forEach((id) => {
    const r = res[id]; let im = null; try { im = r.b && png(r.b); } catch (_) {}
    if (!im || !im.px) { if (id < 156722 && id > 156719) console.log('ID', id, r.st, 'sin imagen'); return; }
    if (id !== 156720 && id !== 156721 && (im.w > 64 || im.h > 64)) return;
    console.log('ID', id, im.w + 'x' + im.h, 'ct' + im.ct, r.b.length + ' B');
    console.log(art(im, id === 156720 || id === 156721 ? 32 : 16));
    if (id === 156720 && r.b.length < 6000) console.log('B64 156720 ' + r.b.toString('base64'));
  });
})();
