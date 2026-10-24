"""SHIRUVANA-ART-001 — «EVOLVING» (concepto A+B). Render vectorial con PIL (supersampling)."""
import math, random, sys, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

FONT = os.environ.get('FONT', '/usr/share/fonts/noto-cjk/NotoSansCJKjp-Regular.otf')
SS = 2
OUT = os.environ.get('OUT', 'out')

def hx(h, a=255):
    h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

def C(fill):
    return hx(*fill) if isinstance(fill, tuple) else hx(fill)

OBS = '#0F1117'; SURF = '#232A3A'; ARC = '#7B5CFF'; AMB = '#F2B94B'; TUR = '#2C9398'; VIO = '#442283'; BLUE = '#2C4A7A'
TX2 = '#A9B0C4'

def catmull(pts, closed=True, n=10):
    out = []; L = len(pts)
    rng = range(L) if closed else range(L - 1)
    for i in rng:
        p0 = pts[(i - 1) % L] if (closed or i > 0) else pts[i]
        p1 = pts[i]; p2 = pts[(i + 1) % L]
        p3 = pts[(i + 2) % L] if (closed or i + 2 < L) else p2
        for t in range(n):
            t /= n; t2 = t * t; t3 = t2 * t
            out.append(tuple(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3) for k in (0, 1)))
    if not closed: out.append(pts[-1])
    return out

def cubic(p0, p1, p2, p3, n=12):
    r = []
    for i in range(n + 1):
        t = i / n; u = 1 - t
        r.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0], u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
    return r

# Silueta oficial: M8 25V12l3-5 3 4h4l3-4 3 5v13c0 1-1 2-2 2H10c-1 0-2-1-2-2z  (u=50, origen 100,-50)
def U(x, y): return (100 + 50 * x, -50 + 50 * y)
CAT = [U(8, 25), U(8, 12), U(11, 7), U(14, 11), U(18, 11), U(21, 7), U(24, 12), U(24, 25)]
CAT += cubic(U(24, 25), U(24, 26), U(23, 27), U(22, 27))[1:]
CAT += [U(10, 27)] + cubic(U(10, 27), U(9, 27), U(8, 26), U(8, 25))[1:-1]

class R:
    def __init__(s, W, H):
        s.W, s.H = W * SS, H * SS
        top, bot = hx('#151826'), hx('#0A0B10')
        g = Image.new('RGBA', (1, 256))
        for y in range(256):
            t = y / 255; g.putpixel((0, y), tuple(int(top[i] * (1 - t) + bot[i] * t) for i in range(3)) + (255,))
        s.img = g.resize((s.W, s.H))
    def tf(s, ox, oy, k): s.ox, s.oy, s.k = ox * SS, oy * SS, k * SS
    def p(s, x, y): return (s.ox + x * s.k, s.oy + y * s.k)
    def P(s, pts): return [s.p(*q) for q in pts]
    def layer(s): return Image.new('RGBA', (s.W, s.H), (0, 0, 0, 0))
    def comp(s, l, blur=0):
        if blur: l = l.filter(ImageFilter.GaussianBlur(blur * s.k))
        s.img.alpha_composite(l)
    def d(s, im=None): return ImageDraw.Draw(im if im is not None else s.img, 'RGBA')
    def poly(s, pts, fill, im=None, smooth=False):
        s.d(im).polygon(s.P(catmull(pts) if smooth else pts), fill=C(fill))
    def ell(s, cx, cy, rx, ry, fill, im=None):
        a, b = s.p(cx - rx, cy - ry), s.p(cx + rx, cy + ry)
        s.d(im).ellipse([a, b], fill=C(fill))
    def line(s, pts, w, fill, im=None, smooth=False, caps=True):
        q = s.P(catmull(pts, closed=False) if smooth else pts)
        c = C(fill); d = s.d(im)
        d.line(q, fill=c, width=max(1, int(w * s.k)), joint='curve')
        if caps:
            rr = w * s.k / 2
            for pt in (q[0], q[-1]): d.ellipse([pt[0] - rr, pt[1] - rr, pt[0] + rr, pt[1] + rr], fill=c)
    def limb(s, a, b, wa, wb, fill, im=None):
        ang = math.atan2(b[1] - a[1], b[0] - a[0]) + math.pi / 2
        ca, sa = math.cos(ang), math.sin(ang)
        pts = [(a[0] + ca * wa / 2, a[1] + sa * wa / 2), (b[0] + ca * wb / 2, b[1] + sa * wb / 2), (b[0] - ca * wb / 2, b[1] - sa * wb / 2), (a[0] - ca * wa / 2, a[1] - sa * wa / 2)]
        s.poly(pts, fill, im); s.ell(a[0], a[1], wa / 2, wa / 2, fill, im); s.ell(b[0], b[1], wb / 2, wb / 2, fill, im)
    def text(s, xy_px, txt, size, fill, spacing=0, bold=0, anchor='mm', im=None):
        f = ImageFont.truetype(FONT, int(size * SS)); d = s.d(im); c = C(fill)
        ws = [d.textlength(ch, font=f) for ch in txt]; tot = sum(ws) + spacing * SS * (len(txt) - 1)
        x = xy_px[0] * SS - (tot / 2 if anchor[0] == 'm' else 0)
        for ch, w in zip(txt, ws):
            d.text((x, xy_px[1] * SS), ch, font=f, fill=c, anchor='l' + anchor[1], stroke_width=int(bold * SS), stroke_fill=c)
            x += w + spacing * SS
    def text_scene(s, x, y, txt, size, fill):
        f = ImageFont.truetype(FONT, max(6, int(size * s.k))); px = s.p(x, y)
        s.d().text(px, txt, font=f, fill=C(fill), anchor='mm', stroke_width=max(1, int(size * s.k * .05)), stroke_fill=C(fill))
    def final(s, W, H): return s.img.resize((W, H), Image.LANCZOS).convert('RGB')

# ---------------------------------------------------------------- escena
def backdrop(r):
    l = r.layer(); r.ell(900, 760, 820, 700, (ARC, 95), l); r.ell(900, 820, 460, 420, (ARC, 70), l); r.comp(l, 180)
    l = r.layer(); vp = (900, 1050)
    for i in range(-16, 17):
        x = 900 + i * 210
        a = (vp[0] + (x - vp[0]) * (1300 - vp[1]) / (1500 - vp[1]), 1300)
        r.line([a, (x, 1500)], 2, (ARC, 38), l)
    for y in (1300, 1335, 1380, 1440):
        r.line([(-1400, y), (3400, y)], 2, (ARC, 30 if y > 1300 else 60), l)
    r.comp(l)
    l = r.layer(); r.ell(900, 1305, 560, 40, ('#000000', 170), l); r.ell(300, 1302, 150, 22, ('#000000', 150), l); r.ell(1570, 1302, 170, 24, ('#000000', 150), l); r.comp(l, 12)

def cat(r, seed=7):
    rnd = random.Random(seed)
    mask = Image.new('L', (r.W, r.H), 0); ImageDraw.Draw(mask).polygon(r.P(CAT), fill=255)
    def bx(y): return 1000 + (y - 800) * 0.25
    solid, wire = [], []
    for cy in range(300, 1300, 50):
        j = rnd.choice([-50, 0, 0, 0, 50])
        for cx in range(500, 1300, 50):
            (solid if cx + 25 < bx(cy) + j else wire).append((cx, cy))
    sset = set(solid)
    edge = [c for c in wire if (c[0] - 50, c[1]) in sset and mask.getpixel(tuple(int(v) for v in r.p(c[0] + 25, c[1] + 25))) > 0]
    l = r.layer()
    for cx, cy in solid: r.poly([(cx, cy), (cx + 51, cy), (cx + 51, cy + 51), (cx, cy + 51)], '#07080C', l)
    l.putalpha(ImageChops.multiply(l.getchannel('A'), mask)); r.comp(l)
    l = r.layer()
    for cx, cy in wire: r.poly([(cx, cy), (cx + 50, cy), (cx + 50, cy + 50), (cx, cy + 50)], (ARC, 26), l)
    for x in range(500, 1301, 50): r.line([(x, 280), (x, 1320)], 2.2, (ARC, 150), l, caps=False)
    for y in range(300, 1301, 50): r.line([(480, y), (1320, y)], 2.2, (ARC, 150), l, caps=False)
    wm = Image.new('L', (r.W, r.H), 0); dm = ImageDraw.Draw(wm)
    for cx, cy in wire: dm.rectangle([r.p(cx, cy), r.p(cx + 50, cy + 50)], fill=255)
    l.putalpha(ImageChops.multiply(l.getchannel('A'), ImageChops.multiply(mask, wm))); r.comp(l)
    l = r.layer(); r.line(CAT + [CAT[0]], 10, (ARC, 160), l); r.comp(l, 10)
    l = r.layer(); r.line(CAT + [CAT[0]], 3.2, ('#A897FF', 230), l); r.comp(l)
    l = r.layer(); g = r.layer()
    for cx, cy in edge:
        if rnd.random() < .45:
            dx, dy = rnd.uniform(10, 34), rnd.uniform(-26, -6)
            q = [(cx + dx, cy + dy), (cx + dx + 46, cy + dy), (cx + dx + 46, cy + dy + 46), (cx + dx, cy + dy + 46)]
            r.poly(q, '#0B0C12', l); r.line(q + [q[0]], 2.5, ('#B4A6FF', 230), l); r.line(q + [q[0]], 7, (ARC, 200), g)
    r.comp(g, 8); r.comp(l)

def eyes(r):
    l = r.layer(); r.ell(750, 800, 150, 170, (AMB, 120), l); r.ell(1050, 800, 150, 170, (AMB, 120), l); r.comp(l, 45)
    for x in (750, 1050):
        r.ell(x, 800, 80, 110, AMB); r.ell(x - 14, 772, 34, 46, ('#FFE2A0', 200))

def blueprint_cat(r, cx, cy, sc, ang, im):
    ca, sa = math.cos(ang), math.sin(ang)
    def T(p):
        x, y = (p[0] - 900) * sc, (p[1] - 800) * sc
        return (cx + x * ca - y * sa, cy + x * sa + y * ca)
    r.line([T(p) for p in CAT + [CAT[0]]], 2.4, ('#CFE1FF', 235), im)
    for p in ((750, 800), (1050, 800)):
        q = T(p); r.ell(q[0], q[1], 4, 5.5, ('#CFE1FF', 235), im)

def rect_rot(cx, cy, w, h, ang):
    ca, sa = math.cos(ang), math.sin(ang)
    return [(cx + x * ca - y * sa, cy + x * sa + y * ca) for x, y in ((-w/2, -h/2), (w/2, -h/2), (w/2, h/2), (-w/2, h/2))]

def pablo(r):
    SK, SKD, SH, JE, JED = '#E2AE8A', '#C48D6C', '#17181D', '#2B3A55', '#202C44'
    r.limb((278, 900), (270, 1095), 74, 58, JED); r.limb((270, 1095), (264, 1268), 58, 46, JED)
    r.limb((332, 900), (346, 1095), 74, 58, JE); r.limb((346, 1095), (356, 1268), 58, 46, JE)
    r.poly([(222, 1262), (300, 1258), (306, 1300), (214, 1300)], '#101116', smooth=True)
    r.poly([(328, 1262), (392, 1262), (418, 1290), (414, 1302), (326, 1302)], '#121318', smooth=True)
    r.limb((222, 625), (196, 742), 50, 40, SH)
    r.limb((198, 735), (180, 800), 38, 32, SKD)
    r.poly([(222, 600), (268, 590), (300, 602), (340, 590), (384, 600), (408, 676), (382, 692), (382, 915), (300, 925), (220, 915), (220, 692), (196, 676)], SH, smooth=True)
    r.poly([(382, 640), (382, 915), (350, 920), (360, 700)], ('#0E0F13', 255))
    r.line([(268, 594), (300, 610), (338, 594)], 7, '#24262E', smooth=True)
    tl = r.layer(); blueprint_cat(r, 300, 690, .075, 0, tl); r.comp(tl)
    pl = rect_rot(268, 790, 210, 146, -0.21)
    l = r.layer(); r.poly(pl, (BLUE, 120), l); r.comp(l, 14)
    l = r.layer(); r.poly(pl, (BLUE, 255), l)
    for i in range(1, 7):
        a = pl[0][0] + (pl[1][0] - pl[0][0]) * i / 7, pl[0][1] + (pl[1][1] - pl[0][1]) * i / 7
        b = pl[3][0] + (pl[2][0] - pl[3][0]) * i / 7, pl[3][1] + (pl[2][1] - pl[3][1]) * i / 7
        r.line([a, b], 1.2, ('#9EC0F0', 70), l, caps=False)
    r.line(pl + [pl[0]], 3, ('#9EC0F0', 255), l)
    blueprint_cat(r, 268, 790, .12, -0.21, l)
    r.comp(l)
    r.ell(176, 806, 20, 18, SK)
    r.poly([(280, 540), (330, 540), (334, 604), (276, 604)], SKD)
    r.ell(305, 480, 64, 80, SK)
    r.ell(246, 492, 12, 19, SKD)
    r.poly([(242, 486), (240, 436), (262, 404), (262, 446), (252, 470)], '#55565C', smooth=True)
    r.poly([(240, 446), (236, 404), (256, 376), (300, 362), (348, 368), (376, 392), (380, 428), (366, 418), (334, 410), (296, 414), (262, 428), (250, 452)], '#2A2A30', smooth=True)
    for a, b in (((262, 392), (330, 372)), ((280, 402), (352, 386)), ((300, 410), (366, 400))):
        r.line([a, ((a[0] + b[0]) / 2, min(a[1], b[1]) - 8), b], 3, ('#4D4D58', 220), smooth=True)
    r.poly([(250, 488), (252, 530), (272, 566), (306, 586), (344, 576), (366, 544), (370, 506), (356, 520), (336, 532), (306, 534), (282, 522), (264, 500)], '#3A3431', smooth=True)
    r.poly([(286, 556), (310, 548), (340, 552), (356, 560), (340, 578), (308, 584), (290, 572)], '#96969B', smooth=True)
    for a in ((292, 562), (304, 570), (330, 566), (344, 560)):
        r.line([a, (a[0] + 4, a[1] + 12)], 2, ('#6E6A68', 200))
    r.poly([(300, 524), (322, 518), (354, 522), (350, 532), (322, 530), (302, 534)], '#2C2624', smooth=True)
    r.ell(330, 541, 15, 5, '#B5706A')
    for x in (300, 346):
        r.ell(x, 478, 12, 7, '#F4ECE6'); r.ell(x + 2, 478, 6.5, 6.5, '#4A3020'); r.ell(x + 3, 476, 2.2, 2.2, '#FFFFFF')
        r.line([(x - 13, 474), (x, 470), (x + 12, 473)], 2.4, '#3A2A22', smooth=True)
    r.line([(284, 458), (300, 452), (316, 456)], 6, '#26211E', smooth=True)
    r.line([(334, 455), (350, 450), (364, 455)], 6, '#26211E', smooth=True)
    r.line([(336, 484), (348, 508), (338, 512)], 3, SKD, smooth=True)
    r.limb((382, 616), (418, 590), 50, 46, SH)
    r.limb((414, 594), (452, 556), 40, 34, SK)
    r.limb((452, 556), (494, 498), 34, 30, SK)
    r.ell(498, 492, 22, 20, SK)
    r.line([(506, 484), (536, 452)], 11, SK)
    r.ell(493, 501, 10, 8, SKD)

def shiruvana(r):
    SK, SKD = '#F3C4A8', '#DDA48A'
    HAIR, HAIRL, HAIRD = '#D9A65B', '#F0C77A', '#A8743F'
    r.poly([(1452, 1200), (1690, 1200), (1690, 1302), (1452, 1302)], '#1B2030')
    r.line([(1452, 1200), (1690, 1200), (1690, 1302), (1452, 1302), (1452, 1200)], 3, '#323B57')
    r.line([(1452, 1251), (1690, 1251)], 2, '#2A3149', caps=False)
    r.text_scene(1571, 1226, '40 KB', 30, AMB)
    l = r.layer(); r.poly([(1452, 1196), (1690, 1196), (1690, 1204), (1452, 1204)], (ARC, 120), l); r.comp(l, 6)
    r.poly([(1606, 316), (1676, 322), (1722, 392), (1720, 482), (1700, 566), (1672, 616), (1678, 540), (1670, 452), (1640, 384)], HAIR, smooth=True)
    for off in (0, 18):
        r.line([(1646 + off * .3, 352), (1694 + off * .5, 420 + off), (1690 + off * .2, 520 + off)], 3, (HAIRL, 200), smooth=True)
    r.ell(1586, 362, 78, 88, HAIRD)
    r.limb((1540, 790), (1526, 992), 70, 54, '#1A1533'); r.limb((1526, 992), (1520, 1172), 54, 40, '#1A1533')
    r.limb((1596, 790), (1606, 992), 70, 54, '#221C40'); r.limb((1606, 992), (1616, 1172), 54, 40, '#221C40')
    r.poly([(1480, 1166), (1548, 1162), (1552, 1200), (1470, 1200)], '#0B0C12', smooth=True)
    r.poly([(1590, 1166), (1650, 1164), (1662, 1200), (1586, 1200)], '#0B0C12', smooth=True)
    r.limb((1632, 522), (1668, 648), 40, 32, SKD); r.limb((1668, 648), (1660, 712), 32, 28, SKD)
    hp = rect_rot(1738, 600, 150, 104, 0.12)
    l = r.layer(); r.poly(hp, (TUR, 140), l); r.comp(l, 24)
    l = r.layer(); r.poly(hp, (TUR, 70), l); r.line(hp + [hp[0]], 3, ('#7FE3E0', 230), l)
    for i, w in enumerate((90, 60, 76, 40)):
        y = 568 + i * 20; r.line([(1686 + i * 2.4, y + i * 1.5), (1686 + w + i * 2.4, y + 9 + i * 1.5)], 5, ('#9FF0EC', 190 - i * 30), l)
    r.comp(l)
    r.ell(1660, 716, 17, 16, SK)
    r.poly([(1494, 508), (1540, 498), (1590, 498), (1636, 508), (1642, 566), (1612, 690), (1628, 790), (1504, 790), (1520, 690), (1488, 566)], VIO, smooth=True)
    r.poly([(1612, 540), (1640, 560), (1612, 690), (1626, 788), (1596, 790), (1598, 690)], '#331967', smooth=True)
    r.poly([(1530, 500), (1600, 500), (1588, 528), (1565, 538), (1542, 528)], SK, smooth=True)
    r.poly([(1504, 766), (1628, 766), (1628, 784), (1504, 784)], TUR)
    r.ell(1566, 775, 12, 12, AMB)
    r.poly([(1546, 440), (1586, 440), (1590, 506), (1542, 506)], SKD)
    r.ell(1565, 380, 58, 74, SK)
    r.ell(1616, 392, 10, 16, SKD)
    r.ell(1617, 418, 5, 7, '#6FBF73')
    r.poly([(1504, 372), (1506, 322), (1538, 292), (1590, 286), (1632, 310), (1646, 360), (1628, 342), (1596, 326), (1556, 332), (1528, 352), (1516, 392)], HAIR, smooth=True)
    r.poly([(1508, 360), (1494, 420), (1500, 470), (1514, 440), (1518, 384)], HAIR, smooth=True)
    for a, b, c in (((1526, 330), (1570, 306), (1622, 318)), ((1516, 360), (1548, 326), (1600, 316))):
        r.line([a, b, c], 3, (HAIRL, 220), smooth=True)
    for x in (1530, 1574):
        r.ell(x, 390, 12, 8, '#FBF4F0'); r.ell(x - 2, 391, 7.5, 8, '#3B6EA8'); r.ell(x - 2, 391, 3.6, 4, '#10131C'); r.ell(x, 388, 2, 2, '#FFFFFF')
        r.line([(x - 13, 386), (x - 2, 381), (x + 12, 385)], 3, '#2A1A14', smooth=True)
    r.line([(1516, 372), (1530, 366), (1544, 370)], 3, '#9A6A3A', smooth=True)
    r.line([(1562, 370), (1576, 366), (1590, 371)], 3, '#9A6A3A', smooth=True)
    r.line([(1548, 398), (1542, 418), (1550, 420)], 2.6, SKD, smooth=True)
    r.poly([(1532, 434), (1546, 429), (1560, 433), (1547, 441)], '#C2404A', smooth=True)
    l = r.layer(); r.ell(1522, 414, 14, 8, ('#F08C8C', 70), l); r.ell(1584, 414, 14, 8, ('#F08C8C', 60), l); r.comp(l, 5)
    r.limb((1500, 520), (1434, 430), 44, 36, SK)
    r.limb((1434, 430), (1388, 352), 36, 30, SK)
    r.line([(1392, 352), (1300, 390)], 13, '#2A2F44')
    r.line([(1330, 378), (1300, 390)], 13, TUR)
    r.ell(1386, 350, 22, 22, SK)

def beam_and_sparks(r, seed=3):
    rnd = random.Random(seed)
    tip, hit = (1300, 390), (1228, 430)
    l = r.layer(); r.line([tip, hit], 22, (TUR, 200), l); r.ell(*hit, 60, 60, (AMB, 170), l); r.comp(l, 18)
    r.line([tip, hit], 5, ('#E6FFFD', 255))
    r.ell(*hit, 11, 11, '#FFF3D2')
    l = r.layer(); g = r.layer()
    for _ in range(26):
        a = rnd.uniform(-math.pi, math.pi * .2); dd = rnd.uniform(20, 120); ln = rnd.uniform(8, 26)
        x, y = hit[0] + math.cos(a) * dd, hit[1] + math.sin(a) * dd
        r.line([(x, y), (x + math.cos(a) * ln, y + math.sin(a) * ln)], 3, (AMB, 255), l)
        r.line([(x, y), (x + math.cos(a) * ln, y + math.sin(a) * ln)], 8, (AMB, 160), g)
    r.comp(g, 6); r.comp(l)
    l = r.layer(); g = r.layer()
    for cx, cy, sz, an in ((1330, 300, 34, .3), (1372, 262, 26, -.4), (1290, 268, 30, .7), (1408, 300, 20, .1)):
        q = rect_rot(cx, cy, sz, sz, an)
        r.poly(q, '#0B0C12', l); r.line(q + [q[0]], 2.4, ('#B4A6FF', 240), l); r.line(q + [q[0]], 7, (ARC, 210), g)
    r.comp(g, 7); r.comp(l)

def vision_line(r):
    pts = cubic((540, 446), (700, 180), (1020, 150), (1206, 404), 40)
    l = r.layer(); g = r.layer()
    for i, p in enumerate(pts[1:-2]):
        if i % 2 == 0:
            r.ell(p[0], p[1], 4.2, 4.2, ('#9EC0F0', 200), l); r.ell(p[0], p[1], 8, 8, ('#9EC0F0', 110), g)
    r.comp(g, 6); r.comp(l)

def motes(r, n=70, seed=11, box=(-100, 100, 1900, 1300)):
    rnd = random.Random(seed); l = r.layer(); g = r.layer()
    for _ in range(n):
        x, y = rnd.uniform(box[0], box[2]), rnd.uniform(box[1], box[3])
        c = AMB if rnd.random() < .25 else '#A897FF'; s = rnd.uniform(1.5, 4.5)
        r.ell(x, y, s, s, (c, rnd.randint(90, 200)), l); r.ell(x, y, s * 3, s * 3, (c, 60), g)
    r.comp(g, 4); r.comp(l)

def scene(r, humans=True):
    backdrop(r); motes(r); cat(r)
    if humans: vision_line(r)
    eyes(r)
    if humans:
        pablo(r); shiruvana(r); beam_and_sparks(r)

def brand(r, x, y, s):
    d = r.d(); k = s / 32 * SS; X = lambda u: x * SS + u * k; Y = lambda v: y * SS + v * k
    d.rounded_rectangle([X(1), Y(1), X(31), Y(31)], radius=8 * k, fill=hx(SURF), outline=hx(ARC), width=max(1, int(k)))
    pts = [(8, 25), (8, 12), (11, 7), (14, 11), (18, 11), (21, 7), (24, 12), (24, 25)] + cubic((24, 25), (24, 26), (23, 27), (22, 27))[1:] + [(10, 27)] + cubic((10, 27), (9, 27), (8, 26), (8, 25))[1:-1]
    d.polygon([(X(a), Y(b)) for a, b in pts], fill=hx(OBS))
    for cx in (13, 19): d.ellipse([X(cx - 1.6), Y(17 - 2.2), X(cx + 1.6), Y(17 + 2.2)], fill=hx(AMB))

def title_block(r, cx, y, size):
    l = r.layer()
    r.text((cx, y), 'EVOLVING', size, (AMB, 255), spacing=size * .16, bold=size * .045, im=l)
    r.img.alpha_composite(l.filter(ImageFilter.GaussianBlur(size * SS * .22)))
    r.img.alpha_composite(l)
    bw, bh, by = size * 4.2, max(4, size * .05), y + size * .78
    d = r.d(); x0 = (cx - bw / 2) * SS
    d.rounded_rectangle([x0, by * SS, x0 + bw * SS, (by + bh) * SS], radius=bh * SS / 2, fill=hx(SURF))
    d.rounded_rectangle([x0, by * SS, x0 + bw * .62 * SS, (by + bh) * SS], radius=bh * SS / 2, fill=hx(ARC))
    hxp = x0 + bw * .62 * SS; cy = (by + bh / 2) * SS
    g = r.layer(); ImageDraw.Draw(g).ellipse([hxp - bh * 2 * SS, cy - bh * 2 * SS, hxp + bh * 2 * SS, cy + bh * 2 * SS], fill=hx(AMB, 220))
    r.img.alpha_composite(g.filter(ImageFilter.GaussianBlur(bh * SS * 1.2)))
    r.d().ellipse([hxp - bh * SS, cy - bh * SS, hxp + bh * SS, cy + bh * SS], fill=hx('#FFE2A0'))
    fs = size * .2; sy = by + size * .55
    f = ImageFont.truetype(FONT, int(fs * SS)); t = 'GATO NEGRO FACTORY  ·  BUILDING THE VAULT'
    tw = sum(r.d().textlength(c, font=f) for c in t) / SS + fs * .18 * (len(t) - 1)
    bs = fs * 1.5; total = bs + fs * .8 + tw; x1 = cx - total / 2
    brand(r, x1, sy - bs / 2, bs)
    r.text((x1 + bs + fs * .8, sy), t, fs, TX2, spacing=fs * .18, bold=fs * .02, anchor='lm')

def render(name, W, H, ox, oy, k, humans=True, title=None):
    r = R(W, H); r.tf(ox, oy, k); scene(r, humans)
    if title: title_block(r, *title)
    out = r.final(W, H); os.makedirs(OUT, exist_ok=True); out.save(f'{OUT}/{name}', optimize=True); print(name, out.size)

if __name__ == '__main__':
    which = sys.argv[1:] or ['v', 'd', 's', 'i']
    if 'v' in which: render('evolving-1080x2400.png', 1080, 2400, 20, 510, .578, title=(540, 1520, 128))
    if 'd' in which: render('evolving-1920x1080.png', 1920, 1080, 420, -52, .6, title=(960, 880, 92))
    if 's' in which: render('evolving-1200x630.png', 1200, 630, -14, -16, .405, title=(955, 280, 66))
    if 'i' in which: render('evolving-icono-1024.png', 1024, 1024, -190, -118, .78, humans=False)
