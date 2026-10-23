#!/usr/bin/env python3
"""Vistas previas de infusiones y drops de Metas y Eventos, servidas desde La Bóveda (BL-057, MET-1b).

Por qué: 8 de las 10 vistas previas apuntaban a imágenes de wiki.guildwars2.com que no cargan
dentro de La Bóveda; las 2 que andaban eran archivos propios (assets/gifanim/). Este script
baja cada imagen una vez (en CI, que tiene red) y la deja en assets/previews/<metaId>.webp:

  - WebP con todos los cuadros y los mismos tiempos (la animación no cambia);
  - como mucho 720x520, el doble de lo que muestra la ventanita (.inf-prev img: 360x260),
    así se ve nítida en pantallas de alta densidad;
  - valida cada salida y escribe el informe en tools/meta-previews/REPORTE.md, porque la
    Factory no puede leer los logs de CI (RSK-016).

Uso:
  python3 build_previews.py --list                    # manifiesto en JSON (sin Pillow)
  python3 build_previews.py --out assets/previews --report tools/meta-previews/REPORTE.md
  python3 build_previews.py --source-dir DIR ...      # sin red: usa DIR/<metaId>.<ext>

Las imágenes son de la Guild Wars 2 Wiki (© ArenaNet), usadas sin fines comerciales según los
Content Terms of Use de ArenaNet; el informe guarda el origen de cada una.
"""
import argparse
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request

MAX_W, MAX_H = 720, 520
QUALITY = 80
UA = 'GatoNegroBoveda/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; vistas previas de Metas y Eventos)'

# metaId -> origen. Una ruta relativa es un archivo de este repo; una URL se baja.
SOURCES = {
    'octovine': 'https://wiki.guildwars2.com/images/2/22/Vial_of_Liquid_Aurillium.jpg',
    'chak_gerent': 'https://wiki.guildwars2.com/images/a/ae/Chak_Animation_8.gif',
    'pinata': 'assets/gifanim/confeti.gif',
    'dragons_end': 'https://wiki.guildwars2.com/images/2/29/Echo_of_the_Dragonvoid_infusion.jpg',
    'drakkar': 'https://wiki.guildwars2.com/images/1/1b/Winter%27s_Heart_Infusion_Eyes.jpg',
    'drizzlewood_north': 'https://wiki.guildwars2.com/images/3/38/Frost_Legion_Infusion.jpg',
    'vinewrath': 'https://wiki.guildwars2.com/images/e/e6/QB_Animation_7.gif',
    'death_branded_shatterer': 'https://wiki.guildwars2.com/images/4/46/Crystal_Infusion.jpg',
    'dragonstorm': 'https://wiki.guildwars2.com/images/0/01/Primordus_Left_Eye_Infusion.jpg',
    'secrets_of_the_weald': 'assets/gifanim/burbuja.gif',
}


def out_name(meta_id):
    return meta_id + '.webp'


def is_url(src):
    return src.startswith('http://') or src.startswith('https://')


def candidates(url):
    """La dirección de la imagen y, de respaldo, Special:FilePath con el mismo nombre de archivo."""
    name = url.rstrip('/').split('/')[-1]
    return [url, 'https://wiki.guildwars2.com/wiki/Special:FilePath/' + name]


def download(url, tries=2):
    last = None
    for cand in candidates(url):
        for i in range(tries):
            try:
                req = urllib.request.Request(cand, headers={'User-Agent': UA, 'Accept': 'image/*'})
                with urllib.request.urlopen(req, timeout=25) as r:
                    data = r.read()
                    ctype = r.headers.get('Content-Type', '')
                if not ctype.startswith('image/'):
                    raise ValueError('no es una imagen: ' + ctype)
                return data, cand, 'HTTP 200 ' + ctype
            except urllib.error.HTTPError as e:
                last = '%s -> HTTP %s' % (cand, e.code)
                if e.code in (403, 404):
                    break
            except Exception as e:  # red, tiempo, contenido
                last = '%s -> %s' % (cand, e)
            time.sleep(2 * (i + 1))
    raise RuntimeError(last or 'sin respuesta')


def fit(w, h):
    k = min(1.0, MAX_W / float(w), MAX_H / float(h))
    return max(1, int(round(w * k))), max(1, int(round(h * k)))


def convert(data):
    """Devuelve (webp_bytes, info) con todos los cuadros y sus tiempos."""
    from PIL import Image, ImageSequence
    im = Image.open(io.BytesIO(data))
    w, h = im.size
    nw, nh = fit(w, h)
    frames, durations = [], []
    for fr in ImageSequence.Iterator(im):
        f = fr.convert('RGBA')
        if (nw, nh) != (w, h):
            f = f.resize((nw, nh), Image.LANCZOS)
        frames.append(f)
        durations.append(int(fr.info.get('duration', im.info.get('duration', 100)) or 100))
    buf = io.BytesIO()
    if len(frames) > 1:
        frames[0].save(buf, 'WEBP', save_all=True, append_images=frames[1:], duration=durations,
                       loop=int(im.info.get('loop', 0) or 0), quality=QUALITY, method=6, minimize_size=True)
    else:
        frames[0].save(buf, 'WEBP', quality=QUALITY + 2, method=6)
    info = {'src_size': [w, h], 'size': [nw, nh], 'frames': len(frames),
            'duration_ms': sum(durations) if len(frames) > 1 else 0}
    return buf.getvalue(), info


def validate(webp, info):
    from PIL import Image
    if webp[:4] != b'RIFF' or webp[8:12] != b'WEBP':
        raise ValueError('la salida no es WebP')
    im = Image.open(io.BytesIO(webp))
    n = getattr(im, 'n_frames', 1)
    if n != info['frames']:
        raise ValueError('cuadros: %d en vez de %d' % (n, info['frames']))
    if list(im.size) != list(info['size']) or im.size[0] > MAX_W or im.size[1] > MAX_H:
        raise ValueError('tamaño inesperado %s' % (im.size,))
    if n > 1:
        total = 0
        for i in range(n):
            im.seek(i)
            im.load()
            total += int(im.info.get('duration', 0))
        if abs(total - info['duration_ms']) > n:
            raise ValueError('duración: %d ms en vez de %d ms' % (total, info['duration_ms']))


def kb(n):
    return '%.1f MB' % (n / 1048576.0) if n >= 1048576 else '%.0f KB' % (n / 1024.0)


def build(root, out_dir, source_dir=None):
    os.makedirs(out_dir, exist_ok=True)
    rows = []
    for meta_id, src in SOURCES.items():
        row = {'id': meta_id, 'src': src, 'ok': False}
        try:
            if source_dir:
                found = [f for f in os.listdir(source_dir) if f.rsplit('.', 1)[0] == meta_id]
                if not found:
                    raise RuntimeError('no está en ' + source_dir)
                with open(os.path.join(source_dir, found[0]), 'rb') as fh:
                    data = fh.read()
                row['how'] = 'archivo de prueba'
            elif is_url(src):
                data, used, how = download(src)
                row['how'] = how + ('' if used == src else ' (por Special:FilePath)')
            else:
                with open(os.path.join(root, src), 'rb') as fh:
                    data = fh.read()
                row['how'] = 'archivo de La Bóveda'
            webp, info = convert(data)
            validate(webp, info)
            with open(os.path.join(out_dir, out_name(meta_id)), 'wb') as f:
                f.write(webp)
            row.update(ok=True, before=len(data), after=len(webp), **info)
        except Exception as e:
            row['error'] = str(e) or e.__class__.__name__
        rows.append(row)
    return rows


def report(rows):
    ok = [r for r in rows if r['ok']]
    before = sum(r['before'] for r in ok)
    after = sum(r['after'] for r in ok)
    L = ['# Vistas previas de Metas y Eventos (MET-1b)', '',
         'Generado por `.github/workflows/meta-previews.yml` con `build_previews.py`. No editar a mano.', '',
         'RESULTADO: %d de %d listas en `assets/previews/`; %s -> %s.' % (len(ok), len(rows), kb(before), kb(after)), '',
         '| meta | origen | cómo | antes | después | tamaño | cuadros | duración |',
         '|---|---|---|---|---|---|---|---|']
    for r in rows:
        if r['ok']:
            L.append('| %s | %s | %s | %s | %s | %dx%d -> %dx%d | %d | %s |' % (
                r['id'], r['src'], r['how'], kb(r['before']), kb(r['after']),
                r['src_size'][0], r['src_size'][1], r['size'][0], r['size'][1], r['frames'],
                ('%.1f s' % (r['duration_ms'] / 1000.0)) if r['frames'] > 1 else '—'))
        else:
            L.append('| %s | %s | FALLÓ: %s | | | | | |' % (r['id'], r['src'], r['error'].replace('|', '/')))
    L += ['', 'Imágenes de la Guild Wars 2 Wiki y de La Bóveda; © ArenaNet. Uso sin fines comerciales '
          'según los Content Terms of Use de ArenaNet.', '']
    return '\n'.join(L)


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--root', default='.')
    ap.add_argument('--out', default='assets/previews')
    ap.add_argument('--report', default='tools/meta-previews/REPORTE.md')
    ap.add_argument('--source-dir')
    a = ap.parse_args(argv)
    if a.list:
        print(json.dumps({k: {'src': v, 'out': 'assets/previews/' + out_name(k)} for k, v in SOURCES.items()},
                         ensure_ascii=False, indent=2))
        return 0
    rows = build(a.root, a.out, a.source_dir)
    text = report(rows)
    os.makedirs(os.path.dirname(a.report) or '.', exist_ok=True)
    with open(a.report, 'w', encoding='utf-8') as f:
        f.write(text)
    print(text)
    return 0


if __name__ == '__main__':
    sys.exit(main())
