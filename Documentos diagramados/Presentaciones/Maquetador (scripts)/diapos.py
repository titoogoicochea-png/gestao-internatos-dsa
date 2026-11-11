#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Las diapositivas, con formas y texto nativos."""
from editable import (W, H, MARGEN, CAJA, rect, linea, regla_tricolor, imagen,
                      texto, fondo, notas, nlineas, elipse, pastilla, AZUL, NOCHE, CIAN, NARANJA, BLANCO,
                      HUESO, GRIS, GRIS_CLARO, FILETE, DIMENSIONES)

OSC, MED, CLA = DIMENSIONES[0]


def _p(paleta, i):
    """Un color de la paleta, dé la vuelta si el instrumento trae menos de seis."""
    return paleta[i % len(paleta)]


def _barra(s):
    rect(s, 0, 0, W, 16, relleno=AZUL)
    regla_tricolor(s, 0, 0, 760, 16)


def _cabeza(s, rotulo, titulo, c_rot=CIAN, c_tit=AZUL, y=132):
    texto(s, MARGEN, y, CAJA, 50, rotulo, "semi", 25, c_rot, track=6.5)
    texto(s, MARGEN, y + 56, CAJA - 120, 180, titulo, "xbold", 62, c_tit,
          interlinea=74)


# ── 1 · portada ────────────────────────────────────────────────────────────
def portada(s, t, com, fondo_jpg, sello=None):
    imagen(s, fondo_jpg, 0, 0, W, H)
    texto(s, MARGEN, 214, CAJA, 50, com["propuesta"], "semi", 28, CIAN, track=7)
    texto(s, MARGEN, 296, CAJA, 70, t["titulo"][0], "mont", 52, BLANCO, track=1.2)
    texto(s, MARGEN - 6, 372, CAJA, 260, t["titulo"][1:3], "xbold", 104, BLANCO,
          track=-3, interlinea=118)
    texto(s, MARGEN - 4, 606, CAJA, 120, t["titulo"][3], "mont", 86, BLANCO, track=0.6)
    regla_tricolor(s, MARGEN, 742, 430, 11)
    texto(s, MARGEN, 802, CAJA, 60, com["nivel"], "semi", 40, NARANJA, track=3)
    texto(s, MARGEN, H - 166, 900, 50, com["division"][0], "medium", 30, HUESO, track=4.2)
    texto(s, MARGEN, H - 124, 900, 46, com["division"][1], "medium", 25, HUESO)
    texto(s, W - MARGEN - 300, H - 166, 300, 50, com["anio"], "semi", 34, CIAN,
          track=4, alineacion="r")
    if sello:
        imagen(s, sello, W - MARGEN - 250, 190, 250)
    notas(s, " ".join(t["titulo"]) + " · " + com["nivel"])


# ── 2 · esquema ────────────────────────────────────────────────────────────
def esquema_capitulos(s, t, com):
    fondo(s, BLANCO); _barra(s)
    _cabeza(s, t["esquema_rotulo"], t["esquema_titulo"])
    y, alto = 340, 116
    for k, (num, nombre, preg) in enumerate(t["capitulos"]):
        c = DIMENSIONES[k % 6][1]
        rect(s, MARGEN, y, CAJA, alto - 16, relleno=(248, 250, 253), redondo=10)
        rect(s, MARGEN, y, 9, alto - 16, relleno=c)
        texto(s, MARGEN + 34, y + 22, 90, 60, num, "xbold", 44, c, alineacion="c")
        texto(s, MARGEN + 150, y + 16, CAJA - 200, 50, nombre, "semi", 31, AZUL)
        texto(s, MARGEN + 150, y + 56, CAJA - 200, 44, preg, "cursiva", 27, GRIS)
        y += alto
    y += 16
    for rot, txt in t["anexos"]:
        texto(s, MARGEN, y, 240, 44, rot, "semi", 23, NARANJA, track=4)
        texto(s, MARGEN + 240, y - 4, CAJA - 240, 44, txt, "light", 27, GRIS)
        y += 50
    notas(s, "\n".join(f"{n} — {a}: {b}" for n, a, b in t["capitulos"]))


def esquema_secciones(s, t, com, paleta=None, n=3, total=15):
    p = paleta or DIMENSIONES
    osc, med, cla = _p(p, 1)
    fondo(s, (252, 252, 253))
    rect(s, 0, 0, W, 150, relleno=osc)
    regla_tricolor(s, 0, 0, 520, 12)
    texto(s, MARGEN, 38, CAJA, 70, t["esquema_titulo"], "xbold", 50, BLANCO,
          alineacion="c")
    ancho_p = 620
    pastilla(s, (W - ancho_p) / 2, 170, ancho_p, 52, med)
    texto(s, (W - ancho_p) / 2, 184, ancho_p, 44, t["esquema_rotulo"], "semi", 23,
          BLANCO, track=3, alineacion="c")
    y, alto = 290, 142
    for k, (num, nombre, glosa) in enumerate(t["secciones"]):
        destaca = k == 2
        c = _p(p, 5)[1] if destaca else med
        rect(s, MARGEN, y, CAJA, alto - 16, relleno=_p(p, 5)[2] if destaca else (248, 250, 253),
             redondo=8)
        rect(s, MARGEN, y, 8, alto - 16, relleno=c)
        texto(s, MARGEN + 36, y + 32, 120, 70, num, "xbold", 42, c)
        texto(s, MARGEN + 180, y + 26, CAJA - 220, 50, nombre, "semi", 33,
              _p(p, 5)[0] if destaca else osc)
        texto(s, MARGEN + 180, y + 72, CAJA - 240, 70, glosa, "light", 26,
              (86, 98, 118), interlinea=32)
        y += alto
    texto(s, MARGEN, y + 18, CAJA, 90, t["esquema_pie"], "cursiva", 26, GRIS_CLARO,
          interlinea=34)
    texto(s, W - MARGEN - 300, H - 74, 300, 44, f"{n:02d} / {total:02d}", "mont", 23,
          (150, 162, 180), alineacion="r")
    notas(s, "\n".join(f"{a} — {b}: {c}" for a, b, c in t["secciones"]))


# ── 3 · portadilla ─────────────────────────────────────────────────────────
def portadilla(s, t, com, cita, logo):
    fondo(s, BLANCO)
    texto(s, W - MARGEN - 900, 134, 900, 46, com["division"][0], "medium", 26, CIAN,
          track=9, alineacion="r")
    texto(s, W - MARGEN - 900, 180, 900, 46, com["division"][1], "semi", 26, CIAN,
          alineacion="r")
    texto(s, MARGEN, 372, CAJA, 70, t["titulo"][0], "mont", 46, AZUL, track=1)
    texto(s, MARGEN - 6, 466, CAJA, 230, t["titulo"][1:3], "xbold", 92, AZUL,
          track=-2.4, interlinea=104)
    texto(s, MARGEN - 4, 682, CAJA, 110, t["titulo"][3], "mont", 76, AZUL, track=0.4)
    regla_tricolor(s, MARGEN, 806, 380, 10)
    texto(s, MARGEN, 862, CAJA, 60, com["nivel"], "semi", 36, NARANJA, track=3)
    imagen(s, cita, MARGEN + 4, H - 390, 980)
    imagen(s, logo, W - MARGEN - 420, H - 238, 420)
    notas(s, " ".join(t["titulo"]))


# ── láminas de fondo ───────────────────────────────────────────────────────
def cifra(s, t, com):
    fondo(s, NOCHE)
    regla_tricolor(s, 0, 0, 760, 14)
    texto(s, MARGEN, 236, CAJA, 50, t["cifra_titulo"].upper(), "semi", 25, CIAN,
          track=6.5)
    texto(s, MARGEN, 330, 640, 400, t["cifra_numero"], "xbold", 420, BLANCO, track=-14)
    x = MARGEN + 560
    texto(s, x, 500, 900, 90, t["cifra_de"], "mont", 62, NARANJA)
    regla_tricolor(s, x, 606, 330, 9)
    texto(s, x, 668, W - MARGEN - x, 420, t["cifra_texto"], "light", 32, HUESO,
          interlinea=44)
    texto(s, MARGEN, 1180, CAJA, 110, t["cifra_remate"], "semi", 34, CIAN,
          interlinea=46)
    notas(s, t["cifra_texto"] + "\n" + t["cifra_remate"])


def tarjetas(s, t, com):
    fondo(s, BLANCO); _barra(s)
    _cabeza(s, t["dim_rotulo"], t["dim_titulo"])
    anchoc = (CAJA - 3 * 34) / 4
    for k, (nombre, txt) in enumerate(t["dimensiones"]):
        x = MARGEN + k * (anchoc + 34)
        osc, med, cla = DIMENSIONES[k]
        rect(s, x, 424, anchoc, 808, relleno=cla, redondo=14)
        rect(s, x, 424, anchoc, 40, relleno=med)
        texto(s, x + 40, 524, anchoc - 80, 110, str(k + 1), "xbold", 86, med)
        texto(s, x + 40, 664, anchoc - 80, 120, nombre, "semi", 44, osc)
        texto(s, x + 40, 790, anchoc - 80, 380, txt, "light", 29, (60, 70, 86),
              interlinea=42)
    notas(s, "\n".join(f"{a}: {b}" for a, b in t["dimensiones"]))


def indices(s, t, com):
    fondo(s, NOCHE)
    regla_tricolor(s, 0, 0, 760, 14)
    _cabeza(s, t["ind_rotulo"], t["ind_titulo"], CIAN, BLANCO)
    texto(s, MARGEN, 400, CAJA - 380, 150, t["ind_texto"], "light", 31, HUESO,
          interlinea=44)
    y = 606
    for sigla, nombre, txt in t["indices"]:
        rect(s, MARGEN, y, CAJA, 300, borde=(60, 96, 170), grosor=3, redondo=16)
        texto(s, MARGEN + 70, y + 72, 320, 160, sigla, "xbold", 132, CIAN, track=-3)
        texto(s, MARGEN + 430, y + 68, CAJA - 500, 60, nombre, "semi", 40, BLANCO)
        texto(s, MARGEN + 430, y + 140, CAJA - 500, 130, txt, "light", 29, HUESO,
              interlinea=42)
        y += 346
    notas(s, "\n".join(f"{a} — {b}: {c}" for a, b, c in t["indices"]))


def mapa_dimensiones(s, t, com, paleta=None):
    fondo(s, BLANCO); _barra(s)
    _cabeza(s, t["dim_rotulo"], t["dim_titulo"])
    y, alto = 432, 126
    for k, (num, nombre, pts, crit) in enumerate(t["dimensiones"]):
        osc, med, cla = (paleta or DIMENSIONES)[k]
        rect(s, MARGEN, y, CAJA, alto - 14, relleno=cla, redondo=10)
        rect(s, MARGEN, y, 126, alto - 14, relleno=med, redondo=10)
        rect(s, MARGEN + 100, y, 26, alto - 14, relleno=med)
        texto(s, MARGEN, y + 28, 126, 70, num, "xbold", 56, BLANCO, alineacion="c")
        texto(s, MARGEN + 176, y + 28, 900, 60, nombre, "semi", 38, osc)
        largo = 520 * int(pts) / 430
        rect(s, MARGEN + 1180, y + 42, largo, 20, relleno=med, redondo=9)
        texto(s, W - MARGEN - 426, y + 18, 400, 50, f"{pts} pts", "semi", 30, osc,
              alineacion="r")
        texto(s, W - MARGEN - 426, y + 60, 400, 44, f"{crit} crit.", "mont", 24,
              (124, 136, 156), alineacion="r")
        y += alto
    texto(s, MARGEN, y + 34, CAJA, 120, t["dim_pie"], "light", 27, GRIS, interlinea=38)
    notas(s, "\n".join(f"{n} {a}: {p}, {c}" for n, a, p, c in t["dimensiones"]))


def anatomia(s, t, com, paleta=None):
    fondo(s, BLANCO); _barra(s)
    _cabeza(s, t["anat_rotulo"], t["anat_titulo"])
    x0, x1, y = MARGEN, W - MARGEN, 430
    paso = CAJA / 3
    rect(s, x0, y, CAJA, 120, relleno=CLA)
    rect(s, x0, y, 20, 120, relleno=OSC)
    texto(s, x0 + 56, y + 30, 90, 70, "1", "semi", 56, OSC)
    texto(s, x0 + 172, y + 34, CAJA - 500, 60, t["anat_enunciado"], "negra", 37,
          (46, 58, 78))
    texto(s, x1 - 420, y + 34, 376, 60, t["anat_puntos"], "mont", 34, OSC,
          alineacion="r")
    y += 120
    rect(s, x0, y, CAJA, 62, relleno=MED)
    for k in range(3):
        texto(s, x0 + 44 + k * paso, y + 16, paso - 80, 44, t["anatomia"][k][0],
              "semi", 25, BLANCO, track=2.5)
    y += 62
    rect(s, x0, y, CAJA, 250, borde=FILETE, grosor=2)
    for k in range(3):
        xx = x0 + 44 + k * paso
        texto(s, xx, y + 32, paso - 88, 90, t["anatomia"][k][1], "semi", 31, OSC,
              interlinea=44)
        texto(s, xx, y + 118, paso - 88, 140, t["anat_glosas"][k], "light", 26,
              (96, 108, 128), interlinea=36)
    for k in (1, 2):
        linea(s, x0 + k * paso, y, x0 + k * paso, y + 250, FILETE, 2)
    y += 250
    ETQ = 420
    rect(s, x0, y, CAJA, 92, relleno=CLA, borde=FILETE, grosor=2)
    texto(s, x0 + 44, y + 30, 360, 44, t["anatomia"][3][0], "semi", 26, OSC, track=2.5)
    linea(s, x0 + ETQ, y, x0 + ETQ, y + 92, FILETE, 2)
    xx = x0 + ETQ + 60
    for sg in ("AP", "AA", "PA", "NA"):
        rect(s, xx, y + 30, 30, 30, borde=OSC, grosor=3)
        texto(s, xx + 46, y + 26, 150, 44, sg, "libro", 30, (70, 82, 100))
        xx += 250
    texto(s, x1 - 520, y + 30, 476, 44, t["anatomia"][3][1], "cursiva", 26,
          (120, 132, 150), alineacion="r")
    y += 92
    rect(s, x0, y, CAJA, 92, borde=FILETE, grosor=2)
    texto(s, x0 + 44, y + 30, 360, 44, t["anatomia"][4][0], "semi", 26, GRIS_CLARO,
          track=2.5)
    linea(s, x0 + ETQ, y, x0 + ETQ, y + 92, FILETE, 2)
    linea(s, x0 + ETQ + 50, y + 62, x1 - 460, y + 62, (170, 185, 205), 2)
    texto(s, x1 - 520, y + 30, 476, 44, t["anatomia"][4][1], "cursiva", 26,
          (120, 132, 150), alineacion="r")
    y += 92
    texto(s, MARGEN, y + 52, CAJA, 90, t["anat_pie"], "light", 29, GRIS, interlinea=40)
    notas(s, "\n".join(f"{a}: {b}" for a, b in t["anatomia"]))


def escala(s, t, com, paleta=None, colores=None):
    fondo(s, BLANCO); _barra(s)
    _cabeza(s, t["escala_rotulo"], t["escala_titulo"])
    p = paleta or DIMENSIONES
    # con menos de seis dimensiones la paleta se repetía y dos niveles salían
    # del mismo color: el guion puede dar su propia rampa
    colores = colores or (_p(p, 1)[1], _p(p, 5)[1], _p(p, 0)[1], (140, 150, 168))
    anchoc = (CAJA - 3 * 30) / 4
    for k, (sigla, nombre, glosa, pct) in enumerate(t["escala"]):
        x = MARGEN + k * (anchoc + 30)
        c = colores[k]
        rect(s, x, 428, anchoc, 788, relleno=(250, 251, 253), redondo=14)
        rect(s, x, 428, anchoc, 194, relleno=c, redondo=14)
        rect(s, x, 560, anchoc, 62, relleno=c)
        texto(s, x, 452, anchoc, 140, sigla, "xbold", 104, BLANCO, alineacion="c")
        texto(s, x + 36, 668, anchoc - 72, 120, nombre, "semi", 34, c, interlinea=46)
        texto(s, x + 36, 818, anchoc - 72, 260, glosa, "light", 28, (70, 82, 100),
              interlinea=40)
        texto(s, x + 36, 1126, anchoc - 72, 70, pct, "xbold", 50, c)
    notas(s, "\n".join(f"{a} {b} — {c} ({d})" for a, b, c, d in t["escala"]))


def meta(s, t, com):
    fondo(s, NOCHE)
    regla_tricolor(s, 0, 0, 760, 14)
    _cabeza(s, t["meta_rotulo"], t["meta_titulo"], CIAN, BLANCO)
    texto(s, MARGEN, 400, CAJA - 120, 180, t["meta_texto"], "light", 32, HUESO,
          interlinea=46)
    rect(s, MARGEN, 700, 10, 210, relleno=CIAN)
    texto(s, MARGEN + 56, 712, CAJA - 200, 200, t["meta_cita"], "script", 62, CIAN,
          interlinea=86)
    texto(s, MARGEN, 1100, CAJA - 120, 140, t["meta_pie"], "light", 28,
          (178, 196, 222), interlinea=40)
    notas(s, t["meta_texto"] + "\n" + t["meta_cita"] + "\n" + t["meta_pie"])


def decision(s, t, com, paleta=None, colores=None):
    fondo(s, BLANCO); _barra(s)
    _cabeza(s, t["dec_rotulo"], t["dec_titulo"])
    p = paleta or DIMENSIONES
    colores = colores or [_p(p, 5)[1], _p(p, 2)[1], _p(p, 0)[1], _p(p, 4)[1],
                          _p(p, 4)[0]]
    y, alto = 440, 124
    for k, (letra, nombre, pct, dec) in enumerate(t["decision"]):
        c = colores[k]
        rect(s, MARGEN, y, CAJA, alto - 14, relleno=(248, 250, 253), redondo=10)
        rect(s, MARGEN, y, 110, alto - 14, relleno=c, redondo=10)
        rect(s, MARGEN + 86, y, 24, alto - 14, relleno=c)
        texto(s, MARGEN, y + 26, 110, 70, letra, "xbold", 54, BLANCO, alineacion="c")
        texto(s, MARGEN + 160, y + 28, 760, 60, nombre, "semi", 34, c)
        texto(s, MARGEN + 920, y + 30, 400, 50, pct, "mont", 30, (70, 82, 100))
        texto(s, W - MARGEN - 930, y + 30, 900, 50, dec, "light", 29, (70, 82, 100),
              alineacion="r")
        y += alto
    texto(s, MARGEN, y + 36, CAJA, 90, t["dec_pie"], "semi", 27, NARANJA, interlinea=38)
    notas(s, "\n".join(f"{a} {b} {c} → {d}" for a, b, c, d in t["decision"]))


def cierre(s, t, com, fondo_jpg):
    imagen(s, fondo_jpg, 0, 0, W, H)
    texto(s, MARGEN, 222, CAJA, 50, t["cierre_rotulo"], "semi", 25, CIAN, track=6.5)
    texto(s, MARGEN, 286, CAJA - 260, 190, t["cierre_titulo"], "xbold", 70, BLANCO,
          interlinea=88)
    texto(s, MARGEN, 498, CAJA - 760, 230, t["cierre_texto"], "light", 32, HUESO,
          interlinea=46)
    x = MARGEN
    for num, rot in t["cierre_datos"]:
        texto(s, x, 842, 360, 104, num, "xbold", 104, CIAN, track=-2)
        texto(s, x, 982, 360, 50, rot, "semi", 28, HUESO, track=2)
        x += 372
    regla_tricolor(s, MARGEN, 1066, 430, 10)
    texto(s, MARGEN, 1118, CAJA - 820, 110, t["cierre_remate"], "cursiva", 28,
          (186, 204, 228), interlinea=40)
    texto(s, W - MARGEN - 900, H - 150, 900, 44, com["division"][0], "medium", 26,
          (150, 172, 205), track=3.6, alineacion="r")
    texto(s, W - MARGEN - 900, H - 112, 900, 40, com["division"][1], "medium", 22,
          (150, 172, 205), alineacion="r")
    notas(s, t["cierre_texto"] + "\n" + t["cierre_remate"])


# ══ el Referencial, rehecho ═══════════════════════════════════════════════
CAP = DIMENSIONES + [((0x0A, 0x55, 0x66), (0x0A, 0xA6, 0xC2), (0xE2, 0xF4, 0xF8))]


def pie_lamina(s, n, total, logo, color=(140, 152, 172)):
    """Logotipo a la izquierda y paginación a la derecha, en todas las láminas."""
    imagen(s, logo, MARGEN, H - 118, 236)
    texto(s, W - MARGEN - 300, H - 92, 300, 44, f"{n:02d} / {total:02d}", "mont", 24,
          color, alineacion="r")


def banda_titulo(s, titulo, rotulo, osc, med):
    """Banda superior con el título y, debajo, la pastilla del capítulo."""
    rect(s, 0, 0, W, 158, relleno=osc)
    regla_tricolor(s, 0, 0, 520, 12)
    texto(s, MARGEN, 40, CAJA, 70, titulo, "xbold", 50, BLANCO, alineacion="c")
    ancho_p = max(560, 26 * len(rotulo))
    pastilla(s, (W - ancho_p) / 2, 170, ancho_p, 52, med)
    texto(s, (W - ancho_p) / 2, 184, ancho_p, 44, rotulo, "semi", 23, BLANCO,
          track=3, alineacion="c")


def portada_ref(s, t, com, fondo_jpg, logo_blanco, sello=None):
    """Sin rótulo de propuesta ni año: el logotipo y el sello hablan por el documento."""
    imagen(s, fondo_jpg, 0, 0, W, H)
    texto(s, MARGEN, 300, CAJA, 70, t["titulo"][0], "mont", 52, BLANCO, track=1.2)
    texto(s, MARGEN - 6, 376, CAJA, 260, t["titulo"][1:3], "xbold", 104, BLANCO,
          track=-3, interlinea=118)
    texto(s, MARGEN - 4, 610, CAJA, 120, t["titulo"][3], "mont", 86, BLANCO, track=0.6)
    regla_tricolor(s, MARGEN, 746, 430, 11)
    texto(s, MARGEN, 806, CAJA, 60, com["nivel"], "semi", 40, NARANJA, track=3)
    texto(s, MARGEN, H - 166, 900, 50, com["division"][0], "medium", 30, HUESO, track=4.2)
    texto(s, MARGEN, H - 124, 900, 46, com["division"][1], "medium", 25, HUESO)
    imagen(s, logo_blanco, W - MARGEN - 420, H - 212, 420)
    if sello:
        imagen(s, sello, W - MARGEN - 260, 180, 260)


def frase(s, fr, com, cita_png):
    """La frase que da identidad al documento, sola en la lámina."""
    fondo(s, NOCHE)
    regla_tricolor(s, 0, 0, 760, 14)
    texto(s, MARGEN, 240, CAJA, 50, fr["rotulo"], "semi", 25, CIAN, track=6.5)
    rect(s, MARGEN, 400, 12, 420, relleno=CIAN)
    imagen(s, cita_png, MARGEN + 90, 430, 1860)
    texto(s, MARGEN + 90, 1030, CAJA - 300, 120, fr["pie"], "light", 30,
          (178, 196, 222), interlinea=42)
    texto(s, MARGEN, H - 150, 900, 44, com["division"][0], "medium", 24,
          (120, 146, 185), track=3.4)
    texto(s, W - MARGEN - 300, H - 92, 300, 44, "02 / 11", "mont", 24,
          (96, 120, 158), alineacion="r")
    notas(s, fr["pie"])


def esquema_sistemico(s, caps, esq, com):
    """Los siete capítulos de un vistazo, con su pregunta y su contenido."""
    fondo(s, (252, 250, 244))
    rect(s, 0, 0, W, 150, relleno=AZUL)
    regla_tricolor(s, 0, 0, 760, 14)
    texto(s, MARGEN, 46, CAJA, 70, esq["titulo"], "xbold", 50, BLANCO)
    texto(s, W - MARGEN - 900, 56, 900, 44, esq["rotulo"], "semi", 22, (150, 185, 235),
          track=5, alineacion="r")

    # la tira de flujo
    rect(s, MARGEN, 186, CAJA, 62, relleno=(242, 190, 60), redondo=14)
    ancho = CAJA / 7
    for k, c in enumerate(caps):
        texto(s, MARGEN + k * ancho, 202, ancho, 40, c["clave"], "semi", 22,
              (62, 48, 10), track=2, alineacion="c")
        if k:
            texto(s, MARGEN + k * ancho - 18, 200, 36, 40, "›", "mont", 26,
                  (120, 95, 20), alineacion="c")

    col = (CAJA - 6 * 12) / 7
    y0, INTER, CU = 280, 26, 20
    # el alto del cuerpo lo manda la columna más cargada
    def alto_preguntas(c):
        return nlineas(c["pregunta"], "cursiva", 21, col - 42) * 28
    def alto_partes(c):
        return sum(nlineas("· " + p, "light", CU, col - 48) * INTER + 14
                   for p in c["partes"])
    # la pregunta arranca en 248: los puntos empiezan donde acaba la más larga
    cab = 248 + max(alto_preguntas(c) for c in caps) + 26
    cuerpo = max(cab + max(alto_partes(c) for c in caps) + 26, 1108 - (y0 + 52))
    for k, c in enumerate(caps):
        osc, med, cla = CAP[k]
        x = MARGEN + k * (col + 12)
        rect(s, x, y0, col, 52, relleno=med)
        rect(s, x, y0 + 52, col, cuerpo, relleno=cla)
        texto(s, x, y0 + 76, col, 90, c["num"], "xbold", 62, med, alineacion="c")
        texto(s, x + 8, y0 + 168, col - 16, 50, c["clave"], "semi", 21, osc,
              track=1.2, alineacion="c")
        texto(s, x + 8, y0 + 206, col - 16, 36,
              f"{esq['capitulo']} {c['num']}", "cursiva", 19, (130, 140, 158),
              alineacion="c")
        texto(s, x + 14, y0 + 248, col - 28, 120, c["pregunta"], "cursiva", 21, med,
              interlinea=28, alineacion="c")
        yy = y0 + cab
        for p in c["partes"]:
            n = nlineas("· " + p, "light", CU, col - 48)
            texto(s, x + 16, yy, col - 32, n * INTER + 8, "· " + p, "light", CU,
                  (62, 72, 90), interlinea=INTER)
            yy += n * INTER + 14
    y = y0 + 52 + cuerpo + 22
    rect(s, MARGEN, y, CAJA, 48, relleno=(31, 56, 100))
    texto(s, MARGEN + 24, y + 12, CAJA - 48, 40, esq["anexos"], "semi", 22, BLANCO)
    texto(s, MARGEN, y + 64, CAJA, 40, esq["trazabilidad"], "cursiva", 21,
          (110, 122, 142))
    yy = y + 112
    anchoc = CAJA / max(1, len(esq["cifras"]))
    for k, (num, rot) in enumerate(esq["cifras"]):
        x = MARGEN + k * anchoc
        rect(s, x, yy, 92, 54, relleno=(242, 190, 60))
        texto(s, x, yy + 10, 92, 44, num, "xbold", 34, (62, 48, 10), alineacion="c")
        texto(s, x + 108, yy + 14, anchoc - 120, 44, rot, "semi", 23, (62, 72, 90))
    texto(s, W - MARGEN - 300, H - 64, 300, 40, "03 / 11", "mont", 22,
          (150, 162, 180), alineacion="r")
    notas(s, "\n".join(f"{c['num']} {c['nombre']} — {c['pregunta']}" for c in caps))


def capitulo(s, c, k, esq, com, n, total, logo_blanco, glosas, claves, rot,
             paleta=None):
    """Un capítulo por lámina: panel de color con lo que hay que retener y,
    a la derecha, lo que contiene con una glosa en cada parte."""
    osc, med, cla = (paleta or CAP)[k]
    fondo(s, (252, 252, 253))
    rect(s, 0, 0, W, 150, relleno=osc)
    regla_tricolor(s, 0, 0, 520, 12)
    texto(s, MARGEN, 38, CAJA, 70, c["nombre"], "xbold", 50, BLANCO, alineacion="c")

    # ── el panel de color: el número, la pregunta y las claves ────────────
    P = 880
    rect(s, 0, 150, P, H - 150, relleno=med)
    texto(s, 96, 212, P - 150, 44,
          f"{esq['capitulo']} {c['num'].upper()}  ·  {c['clave']}", "semi", 24,
          (255, 255, 255), track=4.5)
    texto(s, 86, 250, P - 120, 280, c["num"], "xbold", 228, (255, 255, 255), track=-5)
    rect(s, 96, 540, 96, 7, relleno=(255, 255, 255))
    texto(s, 96, 586, P - 180, 190, c["pregunta"], "cursiva", 33, (255, 255, 255),
          interlinea=46)
    y = 806
    texto(s, 96, y, P - 180, 40, rot["claves"], "semi", 22, cla, track=5)
    y += 54
    for etiqueta, dicho in claves:
        alto = nlineas(dicho, "light", 27, P - 260) * 36 + 70
        rect(s, 96, y, P - 176, alto, relleno=osc, redondo=8)
        rect(s, 96, y, 7, alto, relleno=cla)
        texto(s, 128, y + 18, P - 240, 36, etiqueta.upper(), "semi", 20, cla, track=3)
        texto(s, 128, y + 52, P - 240, alto - 60, dicho, "light", 27,
              (248, 250, 253), interlinea=36)
        y += alto + 18
    imagen(s, logo_blanco, 96, H - 196, 232)
    texto(s, 96, H - 104, P - 180, 44, com["division"][0], "medium", 22,
          (255, 255, 255), track=3.2)

    # ── lo que contiene, con su glosa ─────────────────────────────────────
    x0 = P + 94
    ancho = W - MARGEN - x0
    texto(s, x0 + 72, 212, ancho - 72, 44, esq["contiene"], "semi", 23, med, track=5)
    altos = [34 + nlineas(g, "light", 25, ancho - 200) * 33 + 40 for _, g in glosas]
    hueco = 14
    total_h = sum(altos) + hueco * (len(altos) - 1)
    y = 272 + max(0, (862 - total_h) / 2)
    for i, ((titulo, glosa), alto) in enumerate(zip(glosas, altos)):
        rect(s, x0 + 56, y, ancho - 56, alto, relleno=cla, redondo=8)
        rect(s, x0 + 56, y, 7, alto, relleno=med)
        elipse(s, x0 + 20, y + 24, 54, 54, relleno=med)
        texto(s, x0 + 20, y + 34, 54, 44, str(i + 1), "semi", 26, BLANCO,
              alineacion="c")
        texto(s, x0 + 100, y + 20, ancho - 180, 44, titulo, "semi", 28, osc)
        texto(s, x0 + 100, y + 60, ancho - 180, alto - 70, glosa, "light", 25,
              (74, 86, 106), interlinea=33)
        y += alto + hueco

    # ── la idea que deja ──────────────────────────────────────────────────
    yi = 1166
    rect(s, x0 + 56, yi, ancho - 56, 174, relleno=med, redondo=8)
    texto(s, x0 + 96, yi + 22, ancho - 160, 36, rot["idea"], "semi", 19, cla, track=4)
    texto(s, x0 + 96, yi + 62, ancho - 160, 112, c["idea"], "semi", 27,
          (255, 255, 255), interlinea=36)
    texto(s, W - MARGEN - 300, H - 74, 300, 44, f"{n:02d} / {total:02d}", "mont", 23,
          (160, 172, 190), alineacion="r")
    notas(s, f"{c['nombre']} — {c['pregunta']}\n" +
          "\n".join(f"{t}: {g}" for t, g in glosas) + "\n\n" + c["idea"])


def portadilla_pagina(s, t, com, cita, logo, n=11, total=11):
    """La portadilla del documento, reproducida como página.

    En el impreso todo cuelga de una página vertical; estirarlo a 16:9 deshacía
    la composición. Aquí se dibuja la página entera, a sus proporciones, con las
    medidas tomadas del PDF: 581,1 × 779,5 pt, caja desde x=113,37.
    """
    from laminas import ancho as _ancho
    from PIL import ImageDraw, Image
    _d = ImageDraw.Draw(Image.new("RGB", (8, 8)))

    fondo(s, (238, 242, 248))
    regla_tricolor(s, 0, 0, 520, 12)

    ALTO = 1250
    e = ALTO / 779.5                      # píxeles de lámina por punto de página
    ANCHO = 581.1 * e
    px0, py0 = (W - ANCHO) / 2, 96
    col = lambda v: px0 + v * e
    fil = lambda base, cuerpo: py0 + base * e - 0.80 * cuerpo

    rect(s, px0 + 9, py0 + 11, ANCHO, ALTO, relleno=(214, 221, 232))
    rect(s, px0, py0, ANCHO, ALTO, relleno=BLANCO)

    def trackeado(txt, estilo, cuerpo, medida):
        """El espaciado que hace que el texto ocupe lo mismo que en el impreso."""
        return (medida - _ancho(_d, txt, estilo, cuerpo, 0)) / max(1, len(txt) - 1)

    # la cabeza, justificada al margen del logotipo
    cu = 9.85 * e
    for k, (linea, x_ini) in enumerate(zip(com["division"], (306.13, 350.10))):
        tr = trackeado(linea, "medium", cu, (518.7 - x_ini) * e)
        texto(s, col(x_ini), fil(67.88 + k * 14.21, cu), (518.7 - x_ini) * e + 40,
              cu * 1.6, linea, "medium", cu, CIAN, track=tr)

    # el título
    c1 = 24.55 * e
    texto(s, col(113.37), fil(214.39, c1), ANCHO, c1 * 1.7, t["titulo"][0],
          "semi", c1, AZUL, track=trackeado(t["titulo"][0], "semi", c1, 257.75 * e))
    c2 = 51.11 * e
    for k, linea in enumerate(t["titulo"][1:3]):
        texto(s, col(113.37), fil(270.90 + k * 55.76, c2), ANCHO, c2 * 1.6, linea,
              "xbold", c2, AZUL, track=-1.6 * e)
    c3 = 39.93 * e
    texto(s, col(113.37), fil(375.31, c3), ANCHO, c3 * 1.6, t["titulo"][3],
          "mont", c3, AZUL, track=0.4 * e)

    # el filete tricolor y el nivel
    tramo = (305.8 - 114.5) * e / 3
    for k, c in enumerate(((15, 50, 130), (10, 180, 210), (240, 130, 90))):
        rect(s, col(114.5) + k * tramo, py0 + 400.4 * e, tramo, 3.1 * e, relleno=c)
    c4 = 18.11 * e
    texto(s, col(113.37), fil(438.05, c4), ANCHO, c4 * 1.7, com["nivel"], "semi", c4,
          NARANJA, track=trackeado(com["nivel"], "semi", c4, 192.45 * e))

    # la cita en Alkaline y el logotipo, los dos auténticos
    imagen(s, cita, col(114.5), py0 + 512 * e, (420.3 - 114.5) * e)
    imagen(s, logo, col(399.0), py0 + 694 * e, (519.0 - 399.0) * e)

    texto(s, W - MARGEN - 300, H - 74, 300, 44, f"{n:02d} / {total:02d}", "mont", 23,
          (150, 162, 180), alineacion="r")
    notas(s, " ".join(t["titulo"]) + " · " + com["nivel"])


def cierre_ref(s, ci, com, fondo_jpg, cita, logo_blanco, n=11, total=11):
    """El cierre: la frase que abrió la presentación vuelve a cerrarla."""
    imagen(s, fondo_jpg, 0, 0, W, H)
    texto(s, MARGEN, 214, CAJA - 300, 50, ci["rotulo"], "semi", 24, CIAN, track=5)
    texto(s, MARGEN - 8, 282, 1500, 230, ci["gracias"], "xbold", 170, BLANCO, track=-4)
    regla_tricolor(s, MARGEN, 540, 430, 11)
    imagen(s, cita, MARGEN, 620, 1180)
    x = MARGEN
    for num, rot in ci["datos"]:
        texto(s, x, 996, 300, 102, num, "xbold", 96, CIAN, track=-2)
        texto(s, x, 1122, 300, 50, rot, "semi", 27, HUESO, track=2)
        x += 300
    texto(s, MARGEN, 1238, 1500, 90, ci["pie"], "cursiva", 26, (186, 204, 228),
          interlinea=36)
    texto(s, W - MARGEN - 900, H - 236 - sube_pie, 900, 44, com["division"][0],
          "medium", 26, HUESO, track=3.6, alineacion="r")
    texto(s, W - MARGEN - 900, H - 196 - sube_pie, 900, 40, com["division"][1],
          "medium", 22, (176, 198, 226), alineacion="r")
    imagen(s, logo_blanco, W - MARGEN - 380, H - 148 - sube_pie, 380)
    texto(s, MARGEN, H - 74, 300, 44, f"{n:02d} / {total:02d}", "mont", 23,
          (140, 164, 200))
    notas(s, ci["gracias"] + "\n" + ci["pie"])


def frase_texto(s, fr, com, n, total):
    """La frase que da identidad, compuesta en la script del documento."""
    fondo(s, NOCHE)
    regla_tricolor(s, 0, 0, 760, 14)
    texto(s, MARGEN, 232, CAJA, 50, fr["rotulo"], "semi", 25, CIAN, track=6.5)
    rect(s, MARGEN, 378, 12, 520, relleno=CIAN)
    texto(s, MARGEN + 96, 396, CAJA - 200, 520, fr["cita"], "script", 96, CIAN,
          interlinea=128)
    texto(s, MARGEN + 96, 1012, CAJA - 300, 130, fr["pie"], "light", 31,
          (178, 196, 222), interlinea=44)
    texto(s, MARGEN, H - 150, 900, 44, com["division"][0], "medium", 24,
          (120, 146, 185), track=3.4)
    texto(s, W - MARGEN - 300, H - 92, 300, 44, f"{n:02d} / {total:02d}", "mont", 24,
          (96, 120, 158), alineacion="r")
    notas(s, fr["cita"] + "\n" + fr["pie"])


def cierre_texto(s, ci, com, fondo_jpg, logo_blanco, n, total, sube_pie=0):
    """El cierre del Formulario: la misma frase vuelve a cerrar.

    `sube_pie` levanta el bloque de la derecha —la División y el logotipo— para
    dejar libre la esquina inferior derecha. Hace falta cuando la paginación va
    ahí: de serie esta lámina la pone a la izquierda, bajo el logotipo.
    """
    imagen(s, fondo_jpg, 0, 0, W, H)
    texto(s, MARGEN, 214, CAJA - 300, 50, ci["rotulo"], "semi", 24, CIAN, track=5)
    texto(s, MARGEN - 8, 282, 1500, 230, ci["gracias"], "xbold", 170, BLANCO, track=-4)
    regla_tricolor(s, MARGEN, 540, 430, 11)
    texto(s, MARGEN, 600, 1340, 280, ci["cita"], "script", 60, (120, 226, 244),
          interlinea=84)
    x = MARGEN
    for num, rot in ci["datos"]:
        texto(s, x, 996, 330, 102, num, "xbold", 90, CIAN, track=-2)
        texto(s, x, 1122, 330, 50, rot, "semi", 26, HUESO, track=2)
        x += 330
    texto(s, MARGEN, 1238, 1500, 90, ci["pie"], "cursiva", 26, (186, 204, 228),
          interlinea=36)
    texto(s, W - MARGEN - 900, H - 236 - sube_pie, 900, 44, com["division"][0],
          "medium", 26, HUESO, track=3.6, alineacion="r")
    texto(s, W - MARGEN - 900, H - 196 - sube_pie, 900, 40, com["division"][1],
          "medium", 22, (176, 198, 226), alineacion="r")
    imagen(s, logo_blanco, W - MARGEN - 380, H - 148 - sube_pie, 380)
    texto(s, MARGEN, H - 74, 300, 44, f"{n:02d} / {total:02d}", "mont", 23,
          (140, 164, 200))
    notas(s, ci["gracias"] + "\n" + ci["cita"])


def mapa_detalle(s, t, com, dims, paleta, n, total):
    """Las seis dimensiones en detalle: qué trae cada una y cuánto pesa.

    Van en dos grupos, porque el instrumento se lee así: cinco dimensiones
    evalúan la gestión del internado y la sexta, la vida en el campus.
    """
    osc, med, cla = paleta[1]
    fondo(s, (252, 252, 253))
    rect(s, 0, 0, W, 150, relleno=(15, 50, 130))
    regla_tricolor(s, 0, 0, 520, 12)
    texto(s, MARGEN, 38, CAJA, 70, t["dim_titulo"], "xbold", 44, BLANCO,
          alineacion="c")
    ancho_p = 940
    pastilla(s, (W - ancho_p) / 2, 170, ancho_p, 52, (10, 180, 210))
    texto(s, (W - ancho_p) / 2, 184, ancho_p, 44, t["dim_cifras"], "semi", 23,
          (255, 255, 255), track=2, alineacion="c")

    def capitalizar(txt):
        return txt[:1] + txt[1:].lower()

    def subdims(c):
        return "  ·  ".join(p[0].split(" · ")[0].split(" ", 1)[1] for p in c["partes"])

    BARRA_X, BARRA_MAX = 1620, 420
    # la barra se escala a la dimensión más pesada del propio instrumento, y el
    # corte entre grupos lo declara el guion: no todos tienen seis dimensiones
    MAYOR = max(int(c["puntos"]) for c in dims)
    CORTE = t.get("dim_corte", 5)
    y = 268
    altos = [134 + (nlineas(subdims(c), "light", 21, 1380) - 1) * 28 for c in dims]

    def grupo(rotulo, detalle, color):
        nonlocal y
        rect(s, MARGEN, y, 7, 34, relleno=color)
        texto(s, MARGEN + 24, y + 2, 900, 40, rotulo, "semi", 24, color, track=4)
        texto(s, W - MARGEN - 900, y + 4, 900, 40, detalle, "mont", 23,
              (124, 136, 156), alineacion="r")
        y += 52

    grupo(*t["dim_grupos"][0], paleta[1][1])
    for k, c in enumerate(dims):
        if k == CORTE:
            y += 18
            grupo(*t["dim_grupos"][1], paleta[CORTE][1])
        o, m, l = paleta[k]
        alto = altos[k]
        rect(s, MARGEN, y, CAJA, alto - 14, relleno=l, redondo=8)
        rect(s, MARGEN, y, 108, alto - 14, relleno=m, redondo=8)
        rect(s, MARGEN + 90, y, 18, alto - 14, relleno=m)
        texto(s, MARGEN, y + (alto - 14) / 2 - 32, 108, 64, c["num"], "xbold", 46,
              BLANCO, alineacion="c")
        texto(s, MARGEN + 148, y + 24, 1400, 46, capitalizar(c["nombre"]), "semi",
              31, o)
        texto(s, MARGEN + 148, y + 70, 1380, 70, subdims(c), "light", 21,
              (112, 124, 144), interlinea=28)
        largo = BARRA_MAX * int(c["puntos"]) / MAYOR
        rect(s, BARRA_X, y + 44, largo, 18, relleno=m, redondo=9)
        texto(s, W - MARGEN - 420, y + 20, 400, 50, f"{c['puntos']} pts", "semi", 30,
              o, alineacion="r")
        texto(s, W - MARGEN - 420, y + 62, 400, 44,
              f"{c['criterios']} crit.  ·  {len(c['partes'])} subdim.", "mont", 21,
              (124, 136, 156), alineacion="r")
        y += alto
    texto(s, MARGEN, y + 30, CAJA, 90, t["dim_pie"], "light", 26, GRIS, interlinea=36)
    texto(s, W - MARGEN - 300, H - 74, 300, 44, f"{n:02d} / {total:02d}", "mont", 23,
          (150, 162, 180), alineacion="r")
    notas(s, "\n".join(f"{c['num']} {c['nombre']}: {c['puntos']} pts, "
                       f"{c['criterios']} criterios" for c in dims))


def esquema_dimensiones(s, dims, esq, paleta, n, total):
    """El contenido de las seis dimensiones integrado en una sola lámina."""
    fondo(s, (252, 250, 246))
    rect(s, 0, 0, W, 150, relleno=(15, 50, 130))
    regla_tricolor(s, 0, 0, 520, 12)
    texto(s, MARGEN, 44, CAJA, 70, esq["titulo"], "xbold", 48, BLANCO)
    texto(s, W - MARGEN - 900, 56, 900, 44, esq["rotulo"], "semi", 22,
          (150, 185, 235), track=5, alineacion="r")

    # la tira de flujo, con la palabra que resume cada dimensión
    N = len(dims)
    pastilla(s, MARGEN, 182, CAJA, 58, (242, 190, 60))
    ancho = CAJA / N
    for k, c in enumerate(dims):
        texto(s, MARGEN + k * ancho, 198, ancho, 40, c["clave"], "semi", 22,
              (62, 48, 10), track=2, alineacion="c")
        if k:
            texto(s, MARGEN + k * ancho - 18, 196, 36, 40, "›", "mont", 26,
                  (120, 95, 20), alineacion="c")

    col = (CAJA - (N - 1) * 12) / N
    y0, INTER, CU = 278, 26, 20

    def alto_partes(c):
        return sum(nlineas("· " + p[0], "light", CU, col - 48) * INTER + 12
                   for p in c["partes"])
    cab = 226
    cuerpo = max(cab + max(alto_partes(c) for c in dims) + 24, 1092 - (y0 + 52))

    for k, c in enumerate(dims):
        osc, med, cla = paleta[k]
        x = MARGEN + k * (col + 12)
        rect(s, x, y0, col, 52, relleno=med)
        rect(s, x, y0 + 52, col, cuerpo, relleno=cla)
        texto(s, x, y0 + 74, col, 90, c["num"], "xbold", 62, med, alineacion="c")
        texto(s, x + 8, y0 + 162, col - 16, 44, c["nombre"], "semi", 21, osc,
              interlinea=26, alineacion="c")
        texto(s, x + 8, y0 + 196, col - 16, 36,
              f"{c['puntos']} pts  ·  {c['criterios']} crit.", "mont", 20,
              (124, 136, 156), alineacion="c")
        yy = y0 + cab
        for p in c["partes"]:
            rotulo = p[0]
            nl = nlineas("· " + rotulo, "light", CU, col - 48)
            texto(s, x + 16, yy, col - 32, nl * INTER + 8, "· " + rotulo, "light",
                  CU, (62, 72, 90), interlinea=INTER)
            yy += nl * INTER + 12
    y = y0 + 52 + cuerpo + 20
    rect(s, MARGEN, y, CAJA, 48, relleno=(31, 56, 100))
    texto(s, MARGEN + 24, y + 12, CAJA - 48, 40, esq["secciones"], "semi", 21, BLANCO)
    texto(s, MARGEN, y + 64, CAJA, 40, esq["trazabilidad"], "cursiva", 21,
          (110, 122, 142))
    yy = y + 112
    anchoc = CAJA / max(1, len(esq["cifras"]))
    for k, (num, rot) in enumerate(esq["cifras"]):
        x = MARGEN + k * anchoc
        rect(s, x, yy, 124, 54, relleno=(242, 190, 60))
        texto(s, x, yy + 10, 124, 44, num, "xbold", 32, (62, 48, 10), alineacion="c")
        texto(s, x + 140, yy + 14, anchoc - 152, 44, rot, "semi", 22, (62, 72, 90))
    texto(s, W - MARGEN - 300, H - 52, 300, 40, f"{n:02d} / {total:02d}", "mont", 21,
          (150, 162, 180), alineacion="r")
    notas(s, "\n".join(f"{c['num']} {c['nombre']}: {c['puntos']} pts" for c in dims))
