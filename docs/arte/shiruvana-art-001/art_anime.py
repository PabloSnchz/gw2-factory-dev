"""SHIRUVANA-ART-001 — «EVOLVING», variante anime. Reutiliza la escena de art.py
y le suma: cielo con rayos, contorno de tinta, sombreado en dos tonos (cel), ojos anime,
brillo de pelo, destellos de 4 puntas y subtítulo 進化中 («evolucionando»)."""
import math, random, sys, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import art as A
from art import R, hx, AMB, ARC, TUR, OBS

INK = '#120A24'

def star(r, x, y, s, fill, im=None):
    """Destello de 4 puntas (coordenadas de escena)."""
    w = s * .22
    r.poly([(x, y - s), (x + w, y - w), (x + s, y), (x + w, y + w), (x, y + s), (x - w, y + w), (x - s, y), (x - w, y - w)], fill, im)

def backdrop(r):
    # cielo: índigo arriba, violeta-magenta en el horizonte
    l = r.layer(); r.ell(900, 1250, 1500, 900, ('#5B2A9E', 150), l); r.ell(900, 1300, 900, 420, ('#C0479E', 90), l); r.comp(l, 160)
    # rayos desde el gato
    l = r.layer(); cx, cy = 900, 760
    for i in range(36):
        a0 = i * math.tau / 36; a1 = a0 + math.tau / 72
        R2 = 3200
        r.poly([(cx, cy), (cx + math.cos(a0) * R2, cy + math.sin(a0) * R2), (cx + math.cos(a1) * R2, cy + math.sin(a1) * R2)], ('#9B7BFF', 26), l)
    r.comp(l)
    # halo detrás del gato
    l = r.layer(); r.ell(900, 700, 640, 640, ('#B9A4FF', 70), l); r.comp(l, 60)
    l = r.layer(); r.ell(900, 700, 560, 560, ('#000000', 0), l)
    d = r.d(l); a, b = r.p(340, 140), r.p(1460, 1260); d.ellipse([a, b], outline=hx('#CBB9FF', 110), width=max(1, int(4 * r.k)))
    r.comp(l)
    # líneas de velocidad en los bordes
    rnd = random.Random(5); l = r.layer()
    for _ in range(90):
        a = rnd.uniform(0, math.tau); r0 = rnd.uniform(1050, 1400); ln = rnd.uniform(200, 700)
        r.line([(cx + math.cos(a) * r0, cy + math.sin(a) * r0), (cx + math.cos(a) * (r0 + ln), cy + math.sin(a) * (r0 + ln))], rnd.uniform(1.5, 4), ('#FFFFFF', rnd.randint(25, 60)), l)
    r.comp(l)
    # piso
    l = r.layer(); vp = (900, 1050)
    for i in range(-16, 17):
        x = 900 + i * 210
        r.line([(vp[0] + (x - vp[0]) * (1300 - vp[1]) / (1500 - vp[1]), 1300), (x, 1500)], 2.4, ('#E58BFF', 50), l)
    for y in (1300, 1335, 1380, 1440):
        r.line([(-1400, y), (3400, y)], 2.4, ('#E58BFF', 45 if y > 1300 else 90), l)
    r.comp(l)
    l = r.layer(); r.ell(900, 1305, 560, 40, ('#000000', 170), l); r.ell(300, 1302, 150, 22, ('#000000', 150), l); r.ell(1570, 1302, 170, 24, ('#000000', 150), l); r.comp(l, 12)

def cat_eye_sparkles(r):
    for x in (750, 1050):
        star(r, x - 22, 760, 34, '#FFFFFF'); r.ell(x + 26, 850, 10, 10, ('#FFFFFF', 220))

def anime_eye(r, x, y, sx, sy, iris, iris_l, im):
    r.ell(x, y, sx, sy, '#FFFFFF', im)
    r.ell(x, y + sy * .08, sx * .78, sy * .9, iris, im)
    r.ell(x, y + sy * .42, sx * .62, sy * .42, iris_l, im)
    r.ell(x, y + sy * .05, sx * .34, sy * .45, '#0B0A14', im)
    r.ell(x - sx * .32, y - sy * .32, sx * .3, sx * .3, '#FFFFFF', im)
    r.ell(x + sx * .3, y + sy * .38, sx * .14, sx * .14, '#FFFFFF', im)
    # pestaña superior gruesa con "ala"
    r.line([(x - sx * 1.12, y - sy * .25), (x - sx * .4, y - sy * 1.0), (x + sx * .5, y - sy * .98), (x + sx * 1.2, y - sy * .45)], sx * .32, INK, im, smooth=True)
    r.line([(x - sx * .6, y + sy * .95), (x + sx * .5, y + sy * .95)], sx * .1, (INK, 160), im)

def faces(r, im):
    # Shiruvana: tapar los ojos chicos y dibujar ojos anime
    for x in (1530, 1574):
        r.ell(x, 388, 17, 13, '#F3C4A8', im)
    anime_eye(r, 1528, 394, 14, 17, '#3B6EA8', '#7FB6F0', im)
    anime_eye(r, 1576, 394, 13, 16.5, '#3B6EA8', '#7FB6F0', im)
    # brillo de pelo (banda anime)
    r.line([(1520, 330), (1556, 306), (1600, 302), (1634, 322)], 9, '#F8E1A6', im, smooth=True)
    r.line([(1662, 370), (1700, 420), (1708, 480)], 6, '#F3D18C', im, smooth=True)
    # Pablo
    for x in (300, 346):
        r.ell(x, 477, 16, 12, '#E2AE8A', im)
    anime_eye(r, 300, 480, 11, 12, '#5A3A22', '#8A6040', im)
    anime_eye(r, 346, 480, 11, 12, '#5A3A22', '#8A6040', im)
    r.line([(264, 386), (310, 370), (360, 380)], 7, '#5C5C6E', im, smooth=True)

def characters(r):
    keep = r.img; layer = r.layer(); r.img = layer
    A.pablo(r); A.shiruvana(r); faces(r, layer)
    r.img = keep
    a = layer.getchannel('A').point(lambda v: 255 if v > 90 else 0)
    k = r.k
    # contorno de tinta
    size = max(3, int(5 * k) | 1)
    ol = a.filter(ImageFilter.MaxFilter(size))
    ink = Image.new('RGBA', layer.size, hx(INK)); ink.putalpha(ol); keep.alpha_composite(ink)
    keep.alpha_composite(layer)
    # cel: sombra dura a la derecha, luz a la izquierda-arriba
    dx = max(2, int(16 * k))
    sh = ImageChops.multiply(a, ImageChops.invert(ImageChops.offset(a, -dx, 0)))
    shade = Image.new('RGBA', layer.size, hx('#2A0E4A', 0)); shade.putalpha(sh.point(lambda v: v * 95 // 255)); keep.alpha_composite(shade)
    hl = ImageChops.multiply(a, ImageChops.invert(ImageChops.offset(a, max(1, int(6 * k)), max(1, int(6 * k)))))
    lit = Image.new('RGBA', layer.size, hx('#FFF4E0', 0)); lit.putalpha(hl.point(lambda v: v * 80 // 255)); keep.alpha_composite(lit)

def sparkles(r, seed=21):
    rnd = random.Random(seed); l = r.layer(); g = r.layer()
    for _ in range(26):
        x, y, s = rnd.uniform(-100, 1900), rnd.uniform(60, 1150), rnd.uniform(8, 22)
        c = rnd.choice(['#FFFFFF', '#FFE2A0', '#CBB9FF', '#9FF0EC'])
        if 1420 < x < 1800 and y > 500: continue  # no tapar el panel ni el cajón «40 KB»
        star(r, x, y, s, (c, 230), l); r.ell(x, y, s * 1.4, s * 1.4, (c, 90), g)
    r.comp(g, 6); r.comp(l)

def scene(r, humans=True):
    backdrop(r); A.motes(r, n=110, seed=13); A.cat(r)
    if humans: A.vision_line(r)
    A.eyes(r); cat_eye_sparkles(r)
    if humans:
        characters(r); A.beam_and_sparks(r)
    sparkles(r)

def title(r, cx, y, size):
    # sombra de tinta detrás del título
    l = r.layer(); r.text((cx + size * .05, y + size * .06), 'EVOLVING', size, (INK, 255), spacing=size * .16, bold=size * .09, im=l); r.img.alpha_composite(l)
    A.title_block(r, cx, y, size)
    r.text((cx, y - size * .92), '進化中', size * .36, TUR, spacing=size * .3, bold=size * .012)

def render(name, W, H, ox, oy, k, humans=True, t=None):
    r = R(W, H)
    # cielo anime más profundo
    top, bot = hx('#1A0F3A'), hx('#0B0716')
    g = Image.new('RGBA', (1, 256))
    for yy in range(256):
        tt = yy / 255; g.putpixel((0, yy), tuple(int(top[i] * (1 - tt) + bot[i] * tt) for i in range(3)) + (255,))
    r.img = g.resize((r.W, r.H))
    r.tf(ox, oy, k); scene(r, humans)
    if t: title(r, *t)
    out = r.final(W, H); os.makedirs(A.OUT, exist_ok=True); out.save(f'{A.OUT}/{name}', optimize=True); print(name, out.size)

if __name__ == '__main__':
    which = sys.argv[1:] or ['v', 'd', 's', 'i']
    if 'v' in which: render('evolving-anime-1080x2400.png', 1080, 2400, 20, 510, .578, t=(540, 1520, 128))
    if 'd' in which: render('evolving-anime-1920x1080.png', 1920, 1080, 420, -52, .6, t=(960, 880, 92))
    if 's' in which: render('evolving-anime-1200x630.png', 1200, 630, -14, -16, .405, t=(955, 290, 66))
    if 'i' in which: render('evolving-anime-icono-1024.png', 1024, 1024, -190, -118, .78, humans=False)
