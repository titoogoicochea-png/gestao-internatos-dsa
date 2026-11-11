#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Las láminas de las dos presentaciones."""
from PIL import Image, ImageDraw
from laminas import (W, H, MARGEN, F, escribe, ancho, envuelve, parrafo, lienzo,
                     velo, fondo_portada, regla_tricolor, pie_division, estampa,
                     sombra, AZUL, AZUL_HONDO, NOCHE, CIAN, NARANJA, BLANCO,
                     HUESO, GRIS, GRIS_CLARO, DIMENSIONES)

CAJA = W - 2 * MARGEN


# ── 1 · portada ────────────────────────────────────────────────────────────
def portada(cubierta, t, com, sello=None, y0=1430):
    lam = fondo_portada(cubierta, y0, izquierda=0.68)
    d = ImageDraw.Draw(lam)
    x = MARGEN
    escribe(d, x, 250, com["propuesta"], "semi", 28, CIAN, track=7)
    escribe(d, x, 348, t["titulo"][0], "mont", 52, BLANCO, track=1.2)
    y = 460
    for ln in t["titulo"][1:3]:
        escribe(d, x, y, ln, "xbold", 104, BLANCO, track=-3)
        y += 118
    escribe(d, x, y, t["titulo"][3], "mont", 86, BLANCO, track=0.6)
    regla_tricolor(d, x, y + 56, 430, 11)
    escribe(d, x, y + 136, com["nivel"], "semi", 40, NARANJA, track=3)
    pie_division(d, x, H - 118, com["division"])
    escribe(d, W - MARGEN, H - 118, com["anio"], "semi", 34, CIAN, track=4, anclaje="rs")
    if sello:
        estampa(lam, sello, (W - MARGEN - 10, 236, 250))
    return lam


def sello_acreditacion(ruta, lado=620):
    """Recorta el sello de la portada del Formulario y lo deja con alfa."""
    im = Image.open(ruta).convert("RGB")
    esc = im.width / 1783
    cx, cy, r = 1562 * esc, 302 * esc, 118 * esc
    caja = (round(cx - r - 6), round(cy - r - 6), round(cx + r + 6), round(cy + r + 6))
    rec = im.crop(caja).resize((lado, lado), Image.LANCZOS)
    mask = Image.new("L", (lado, lado), 0)
    ImageDraw.Draw(mask).ellipse([4, 4, lado - 5, lado - 5], fill=255)
    out = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    out.paste(rec, (0, 0), mask)
    return out


# ── 2 · esquema ────────────────────────────────────────────────────────────
def _cabeza(d, rotulo, titulo, color_rot=CIAN, color_tit=AZUL, y=150):
    escribe(d, MARGEN, y, rotulo, "semi", 25, color_rot, track=6.5)
    parrafo(d, MARGEN, y + 86, titulo, "xbold", 62, color_tit, CAJA, 74)
    return y + 86 + 74 * len(envuelve(d, titulo, "xbold", 62, CAJA))


def esquema_capitulos(t, com):
    lam = lienzo()
    d = ImageDraw.Draw(lam)
    d.rectangle([0, 0, W, 16], fill=AZUL)
    regla_tricolor(d, 0, 0, 760, 16)
    _cabeza(d, t["esquema_rotulo"], t["esquema_titulo"])
    y, alto = 356, 112
    for k, (num, nombre, preg) in enumerate(t["capitulos"]):
        c = DIMENSIONES[k % 6][1]
        d.rounded_rectangle([MARGEN, y, W - MARGEN, y + alto - 16], radius=10,
                            fill=(248, 250, 253))
        d.rectangle([MARGEN, y, MARGEN + 9, y + alto - 16], fill=c)
        escribe(d, MARGEN + 78, y + 62, num, "xbold", 44, c, anclaje="cs")
        escribe(d, MARGEN + 142, y + 48, nombre, "semi", 31, AZUL)
        escribe(d, MARGEN + 142, y + 84, preg, "cursiva", 27, GRIS)
        y += alto
    y += 14
    for rot, txt in t["anexos"]:
        escribe(d, MARGEN, y + 26, rot, "semi", 23, NARANJA, track=4)
        escribe(d, MARGEN + 230, y + 26, txt, "light", 27, GRIS)
        y += 46
    return lam


def esquema_secciones(t, com):
    lam = lienzo()
    d = ImageDraw.Draw(lam)
    d.rectangle([0, 0, W, 16], fill=AZUL)
    regla_tricolor(d, 0, 0, 760, 16)
    _cabeza(d, t["esquema_rotulo"], t["esquema_titulo"])
    y, alto = 362, 128
    for k, (num, nombre, glosa) in enumerate(t["secciones"]):
        c = DIMENSIONES[0][1] if k != 2 else AZUL
        d.line([(MARGEN, y), (W - MARGEN, y)], fill=(222, 230, 240), width=2)
        escribe(d, MARGEN + 10, y + 56, num, "xbold", 40, c)
        escribe(d, MARGEN + 150, y + 52, nombre, "semi", 32, AZUL)
        parrafo(d, MARGEN + 150, y + 92, glosa, "light", 26, GRIS, CAJA - 170, 32)
        y += alto
    d.line([(MARGEN, y), (W - MARGEN, y)], fill=(222, 230, 240), width=2)
    parrafo(d, MARGEN, y + 54, t["esquema_pie"], "cursiva", 25, GRIS_CLARO, CAJA, 32)
    return lam


# ── 3 · portadilla ─────────────────────────────────────────────────────────
def portadilla(t, com, cita, logo):
    lam = lienzo()
    d = ImageDraw.Draw(lam)
    escribe(d, W - MARGEN, 160, com["division"][0], "medium", 26, CIAN, track=9,
            anclaje="rs")
    escribe(d, W - MARGEN, 204, com["division"][1], "semi", 26, CIAN, anclaje="rs")
    x, y = MARGEN, 420
    escribe(d, x, y, t["titulo"][0], "mont", 46, AZUL, track=1)
    y += 112
    for ln in t["titulo"][1:3]:
        escribe(d, x, y, ln, "xbold", 92, AZUL, track=-2.4)
        y += 104
    escribe(d, x, y, t["titulo"][3], "mont", 76, AZUL, track=0.4)
    regla_tricolor(d, x, y + 50, 380, 10)
    escribe(d, x, y + 124, com["nivel"], "semi", 36, NARANJA, track=3)
    estampa(lam, cita, (x + 4, H - 300, 980))
    estampa(lam, logo, (W - MARGEN, H - 150, 420), anclaje="rb")
    return lam


# ── láminas de fondo ───────────────────────────────────────────────────────
def cifra(t, com):
    lam = Image.new("RGB", (W, H), NOCHE)
    d = ImageDraw.Draw(lam)
    velo(lam, (0, 0, W, H), AZUL_HONDO, 0.0, 0.75)
    regla_tricolor(d, 0, 0, 760, 14)
    escribe(d, MARGEN, 250, t["cifra_titulo"].upper(), "semi", 25, CIAN, track=6.5)
    escribe(d, MARGEN, 620, t["cifra_numero"], "xbold", 420, BLANCO, track=-14)
    w = ancho(d, t["cifra_numero"], "xbold", 420, -14)
    escribe(d, MARGEN + w + 46, 560, t["cifra_de"], "mont", 62, NARANJA)
    regla_tricolor(d, MARGEN + w + 50, 600, 330, 9)
    parrafo(d, MARGEN + w + 46, 700, t["cifra_texto"], "light", 32,
            HUESO, W - MARGEN - (MARGEN + w + 46), 44)
    parrafo(d, MARGEN, 1210, t["cifra_remate"], "semi", 34, CIAN, CAJA, 46)
    return lam


def tarjetas(t, com):
    lam = lienzo()
    d = ImageDraw.Draw(lam)
    d.rectangle([0, 0, W, 16], fill=AZUL)
    regla_tricolor(d, 0, 0, 760, 16)
    _cabeza(d, t["dim_rotulo"], t["dim_titulo"])
    anchoc = (CAJA - 3 * 34) / 4
    for k, (nombre, txt) in enumerate(t["dimensiones"]):
        x = MARGEN + k * (anchoc + 34)
        osc, med, cla = DIMENSIONES[k]
        sombra(lam, (x, 424, x + anchoc, 1232))
        d.rounded_rectangle([x, 424, x + anchoc, 1232], radius=14, fill=cla)
        d.rounded_rectangle([x, 424, x + anchoc, 464], radius=14, fill=med)
        d.rectangle([x, 444, x + anchoc, 464], fill=med)
        escribe(d, x + 40, 596, str(k + 1), "xbold", 86, med)
        parrafo(d, x + 40, 708, nombre, "semi", 44, osc, anchoc - 80, 54)
        parrafo(d, x + 40, 826, txt, "light", 29, (60, 70, 86), anchoc - 80, 42)
    return lam


def indices(t, com):
    lam = Image.new("RGB", (W, H), NOCHE)
    d = ImageDraw.Draw(lam)
    velo(lam, (0, 0, W, H), AZUL_HONDO, 0.0, 0.7)
    regla_tricolor(d, 0, 0, 760, 14)
    _cabeza(d, t["ind_rotulo"], t["ind_titulo"], CIAN, BLANCO)
    parrafo(d, MARGEN, 420, t["ind_texto"], "light", 31, HUESO, CAJA - 380, 44)
    y = 610
    for sigla, nombre, txt in t["indices"]:
        d.rounded_rectangle([MARGEN, y, W - MARGEN, y + 300], radius=16,
                            outline=(60, 96, 170), width=3)
        escribe(d, MARGEN + 70, y + 190, sigla, "xbold", 132, CIAN, track=-3)
        escribe(d, MARGEN + 430, y + 104, nombre, "semi", 40, BLANCO)
        parrafo(d, MARGEN + 430, y + 172, txt, "light", 29, HUESO,
                CAJA - 500, 42)
        y += 346
    return lam


def mapa_dimensiones(t, com):
    lam = lienzo()
    d = ImageDraw.Draw(lam)
    d.rectangle([0, 0, W, 16], fill=AZUL)
    regla_tricolor(d, 0, 0, 760, 16)
    _cabeza(d, t["dim_rotulo"], t["dim_titulo"])
    y, alto = 432, 126
    for k, (num, nombre, pts, crit) in enumerate(t["dimensiones"]):
        osc, med, cla = DIMENSIONES[k]
        d.rounded_rectangle([MARGEN, y, W - MARGEN, y + alto - 14], radius=10, fill=cla)
        d.rounded_rectangle([MARGEN, y, MARGEN + 126, y + alto - 14], radius=10, fill=med)
        d.rectangle([MARGEN + 108, y, MARGEN + 126, y + alto - 14], fill=med)
        escribe(d, MARGEN + 63, y + 76, num, "xbold", 56, BLANCO, anclaje="cs")
        escribe(d, MARGEN + 176, y + 72, nombre, "semi", 38, osc)
        # la barra es proporcional a los puntos; la cifra va detrás, no encima
        x0b = MARGEN + 1180
        largo = 520 * int(pts) / 430
        d.rounded_rectangle([x0b, y + 46, x0b + largo, y + 66], radius=10, fill=med)
        escribe(d, W - MARGEN - 26, y + 58, f"{pts} pts", "semi", 30, osc, anclaje="rs")
        escribe(d, W - MARGEN - 26, y + 94, f"{crit} crit.", "mont", 24,
                (124, 136, 156), anclaje="rs")
        y += alto
    parrafo(d, MARGEN, y + 56, t["dim_pie"], "light", 27, GRIS, CAJA, 38)
    return lam


def anatomia(t, com):
    """Un criterio de verdad, con una glosa dentro de cada parte."""
    lam = lienzo()
    d = ImageDraw.Draw(lam)
    d.rectangle([0, 0, W, 16], fill=AZUL)
    regla_tricolor(d, 0, 0, 760, 16)
    _cabeza(d, t["anat_rotulo"], t["anat_titulo"])
    osc, med, cla = DIMENSIONES[0]
    x0, x1, y = MARGEN, W - MARGEN, 430
    paso = CAJA / 3

    d.rectangle([x0, y, x1, y + 120], fill=cla)
    d.rectangle([x0, y, x0 + 20, y + 120], fill=osc)
    escribe(d, x0 + 68, y + 78, "1", "semi", 56, osc)
    escribe(d, x0 + 172, y + 76, t["anat_enunciado"], "negra", 37, (46, 58, 78))
    escribe(d, x1 - 44, y + 76, t["anat_puntos"], "mont", 34, osc, anclaje="rs")
    y += 120

    d.rectangle([x0, y, x1, y + 62], fill=med)
    for k in range(3):
        escribe(d, x0 + 44 + k * paso, y + 40, t["anatomia"][k][0], "semi", 25,
                BLANCO, track=2.5)
    y += 62

    d.rectangle([x0, y, x1, y + 250], outline=(198, 212, 232), width=2)
    for k in range(3):
        xx = x0 + 44 + k * paso
        parrafo(d, xx, y + 62, t["anatomia"][k][1], "semi", 31, osc, paso - 88, 44)
        parrafo(d, xx, y + 144, t["anat_glosas"][k], "light", 26, (96, 108, 128),
                paso - 88, 36)
    for k in (1, 2):
        d.line([(x0 + k * paso, y), (x0 + k * paso, y + 250)],
               fill=(198, 212, 232), width=2)
    y += 250

    ETQ = 420
    d.rectangle([x0, y, x1, y + 92], fill=cla, outline=(198, 212, 232), width=2)
    escribe(d, x0 + 44, y + 58, t["anatomia"][3][0], "semi", 26, osc, track=2.5)
    d.line([(x0 + ETQ, y), (x0 + ETQ, y + 92)], fill=(198, 212, 232), width=2)
    xx = x0 + ETQ + 60
    for s in ("AP", "AA", "PA", "NA"):
        d.rectangle([xx, y + 30, xx + 30, y + 60], outline=osc, width=3)
        escribe(d, xx + 46, y + 58, s, "libro", 30, (70, 82, 100))
        xx += 250
    escribe(d, x1 - 44, y + 58, t["anatomia"][3][1], "cursiva", 26,
            (120, 132, 150), anclaje="rs")
    y += 92

    d.rectangle([x0, y, x1, y + 92], outline=(198, 212, 232), width=2)
    escribe(d, x0 + 44, y + 58, t["anatomia"][4][0], "semi", 26, GRIS_CLARO, track=2.5)
    d.line([(x0 + ETQ, y), (x0 + ETQ, y + 92)], fill=(198, 212, 232), width=2)
    d.line([(x0 + ETQ + 50, y + 62), (x1 - 440, y + 62)], fill=(170, 185, 205), width=2)
    escribe(d, x1 - 44, y + 58, t["anatomia"][4][1], "cursiva", 26,
            (120, 132, 150), anclaje="rs")
    y += 92
    parrafo(d, MARGEN, y + 74, t["anat_pie"], "light", 29, GRIS, CAJA, 40)
    return lam


def escala(t, com):
    lam = lienzo()
    d = ImageDraw.Draw(lam)
    d.rectangle([0, 0, W, 16], fill=AZUL)
    regla_tricolor(d, 0, 0, 760, 16)
    _cabeza(d, t["escala_rotulo"], t["escala_titulo"])
    colores = (DIMENSIONES[0][1], DIMENSIONES[1][1], NARANJA, (140, 150, 168))
    anchoc = (CAJA - 3 * 30) / 4
    for k, (sigla, nombre, glosa, pct) in enumerate(t["escala"]):
        x = MARGEN + k * (anchoc + 30)
        c = colores[k]
        sombra(lam, (x, 428, x + anchoc, 1216))
        d.rounded_rectangle([x, 428, x + anchoc, 1216], radius=14, fill=(250, 251, 253))
        d.rounded_rectangle([x, 428, x + anchoc, 622], radius=14, fill=c)
        d.rectangle([x, 590, x + anchoc, 622], fill=c)
        escribe(d, x + anchoc / 2, 566, sigla, "xbold", 104, BLANCO, anclaje="cs")
        parrafo(d, x + 36, 714, nombre, "semi", 34, c, anchoc - 72, 46)
        parrafo(d, x + 36, 848, glosa, "light", 28, (70, 82, 100), anchoc - 72, 40)
        escribe(d, x + 36, 1164, pct, "xbold", 50, c)
    return lam


def meta(t, com):
    lam = Image.new("RGB", (W, H), NOCHE)
    d = ImageDraw.Draw(lam)
    velo(lam, (0, 0, W, H), AZUL_HONDO, 0.0, 0.7)
    regla_tricolor(d, 0, 0, 760, 14)
    _cabeza(d, t["meta_rotulo"], t["meta_titulo"], CIAN, BLANCO)
    parrafo(d, MARGEN, 440, t["meta_texto"], "light", 32, HUESO, CAJA - 120, 46)
    y = 700
    d.rectangle([MARGEN, y, MARGEN + 10, y + 210], fill=CIAN)
    parrafo(d, MARGEN + 56, y + 84, t["meta_cita"], "script", 62, CIAN, CAJA - 200, 86)
    parrafo(d, MARGEN, 1130, t["meta_pie"], "light", 28, (178, 196, 222), CAJA - 120, 40)
    return lam


def decision(t, com):
    lam = lienzo()
    d = ImageDraw.Draw(lam)
    d.rectangle([0, 0, W, 16], fill=AZUL)
    regla_tricolor(d, 0, 0, 760, 16)
    _cabeza(d, t["dec_rotulo"], t["dec_titulo"])
    colores = [(0x1F, 0x7A, 0x94), (0x24, 0x80, 0x5F), (0x8F, 0x6A, 0x16),
               (0x8E, 0x3B, 0x4A), (0x5C, 0x25, 0x30)]
    y, alto = 440, 118
    for k, (letra, nombre, pct, dec) in enumerate(t["decision"]):
        c = colores[k]
        d.rounded_rectangle([MARGEN, y, W - MARGEN, y + alto - 14], radius=10,
                            fill=(248, 250, 253))
        d.rounded_rectangle([MARGEN, y, MARGEN + 104, y + alto - 14], radius=10, fill=c)
        d.rectangle([MARGEN + 86, y, MARGEN + 104, y + alto - 14], fill=c)
        escribe(d, MARGEN + 52, y + 72, letra, "xbold", 54, BLANCO, anclaje="cs")
        escribe(d, MARGEN + 150, y + 66, nombre, "semi", 34, c)
        escribe(d, MARGEN + 900, y + 66, pct, "mont", 30, (70, 82, 100))
        escribe(d, W - MARGEN - 30, y + 66, dec, "light", 29, (70, 82, 100), anclaje="rs")
        y += alto
    parrafo(d, MARGEN, y + 58, t["dec_pie"], "semi", 27, NARANJA, CAJA, 38)
    return lam


def cierre(t, com, cubierta, y0=1320):
    lam = fondo_portada(cubierta, y0, espejo=True, izquierda=0.80, general=0.34)
    d = ImageDraw.Draw(lam)
    escribe(d, MARGEN, 236, t["cierre_rotulo"], "semi", 25, CIAN, track=6.5)
    parrafo(d, MARGEN, 344, t["cierre_titulo"], "xbold", 70, BLANCO, CAJA - 260, 88)
    parrafo(d, MARGEN, 530, t["cierre_texto"], "light", 32, HUESO, CAJA - 420, 46)
    x = MARGEN
    for num, rot in t["cierre_datos"]:
        escribe(d, x, 930, num, "xbold", 104, CIAN, track=-2)
        escribe(d, x, 986, rot, "semi", 28, HUESO, track=2)
        x += 372
    regla_tricolor(d, MARGEN, 1066, 430, 10)
    parrafo(d, MARGEN, 1142, t["cierre_remate"], "cursiva", 28, (186, 204, 228),
            CAJA - 380, 40)
    pie_division(d, W - MARGEN, H - 110, com["division"], (150, 172, 205), 26,
                 anclaje="rs")
    return lam
