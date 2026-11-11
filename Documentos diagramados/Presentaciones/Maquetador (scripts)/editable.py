#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Monta las presentaciones con formas y texto nativos: todo editable.

Se trabaja en el mismo lienzo de 2560 × 1440 que usan las láminas, y se
convierte a EMU al escribir; así las medidas son las mismas que las del diseño.
Solo el arte de portada, el logotipo y la cita en Alkaline van como imagen.
"""
import copy, os
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

W, H = 2560, 1440
ANCHO_EMU, ALTO_EMU = 12192000, 6858000
MARGEN = 150
CAJA = W - 2 * MARGEN

AZUL = (15, 50, 130)
NOCHE = (7, 23, 58)
CIAN = (10, 180, 210)
NARANJA = (240, 130, 90)
BLANCO = (255, 255, 255)
HUESO = (232, 240, 250)
GRIS = (90, 100, 118)
GRIS_CLARO = (150, 162, 180)
FILETE = (198, 212, 232)

DIMENSIONES = [
    ((0x1F, 0x38, 0x64), (0x2E, 0x75, 0xB6), (0xE8, 0xEE, 0xF7)),
    ((0x12, 0x49, 0x5A), (0x1F, 0x7A, 0x94), (0xE3, 0xF1, 0xF5)),
    ((0x15, 0x50, 0x3B), (0x24, 0x80, 0x5F), (0xE4, 0xF2, 0xEC)),
    ((0x5C, 0x44, 0x10), (0x8F, 0x6A, 0x16), (0xF5, 0xEE, 0xDF)),
    ((0x5C, 0x25, 0x30), (0x8E, 0x3B, 0x4A), (0xF6, 0xE9, 0xEC)),
    ((0x39, 0x2F, 0x63), (0x5B, 0x4B, 0x93), (0xEC, 0xE9, 0xF5)),
]

# el cuerpo en puntos: 1440 px son 540 pt de alto de diapositiva
PT = 0.375
TIPO = {"xbold": ("Montserrat ExtraBold", False), "bold": ("Montserrat", True),
        "semi": ("Montserrat SemiBold", False), "medium": ("Montserrat Medium", False),
        "mont": ("Montserrat", False), "light": ("Lato Light", False),
        "libro": ("Lato", False), "negra": ("Lato", True),
        "cursiva": ("Lato Light", False), "script": ("Niconne", False)}


def ex(v):
    return Emu(round(v / W * ANCHO_EMU))


def ey(v):
    return Emu(round(v / H * ALTO_EMU))


def C(t):
    return RGBColor(*t)


# ── formas ─────────────────────────────────────────────────────────────────
def rect(s, x, y, w, h, relleno=None, borde=None, grosor=2, redondo=0):
    forma = MSO_SHAPE.ROUNDED_RECTANGLE if redondo else MSO_SHAPE.RECTANGLE
    sh = s.shapes.add_shape(forma, ex(x), ey(y), ex(w), ey(h))
    if redondo:
        sh.adjustments[0] = redondo / min(w, h)
    if relleno:
        sh.fill.solid(); sh.fill.fore_color.rgb = C(relleno)
    else:
        sh.fill.background()
    if borde:
        sh.line.color.rgb = C(borde); sh.line.width = Pt(grosor * PT)
    else:
        sh.line.fill.background()
    sh.shadow.inherit = False
    sh.text_frame.text = ""
    return sh


def linea(s, x0, y0, x1, y1, color=FILETE, grosor=2):
    from pptx.util import Emu as E
    ln = s.shapes.add_connector(1, ex(x0), ey(y0), ex(x1), ey(y1))
    ln.line.color.rgb = C(color)
    ln.line.width = Pt(grosor * PT)
    return ln


def regla_tricolor(s, x, y, largo, grosor=10):
    tramo = largo / 3
    for k, c in enumerate(((19, 54, 118), (6, 180, 204), (245, 129, 92))):
        rect(s, x + k * tramo, y, tramo, grosor, relleno=c)


def imagen(s, ruta, x, y, w, h=None):
    if h is None:
        from PIL import Image
        im = Image.open(ruta)
        h = w * im.height / im.width
    return s.shapes.add_picture(ruta, ex(x), ey(y), ex(w), ey(h))


# ── texto ──────────────────────────────────────────────────────────────────
def texto(s, x, y, w, h, contenido, estilo="light", cuerpo=30, color=GRIS,
          alineacion="l", track=0.0, interlinea=None, vertical="t"):
    """Un cuadro de texto de verdad: se puede editar, mover y reescribir."""
    tb = s.shapes.add_textbox(ex(x), ey(y), ex(w), ey(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = {"t": MSO_ANCHOR.TOP, "m": MSO_ANCHOR.MIDDLE,
                          "b": MSO_ANCHOR.BOTTOM}[vertical]
    lineas = contenido if isinstance(contenido, list) else [contenido]
    for i, ln in enumerate(lineas):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER,
                       "r": PP_ALIGN.RIGHT}[alineacion]
        if interlinea:
            p.line_spacing = Pt(interlinea * PT)
        r = p.add_run()
        r.text = ln
        f = r.font
        nombre, negrita = TIPO[estilo]
        f.name = nombre
        f.bold = negrita
        f.italic = estilo == "cursiva"
        f.size = Pt(round(cuerpo * PT, 1))
        f.color.rgb = C(color)
        if track:
            r.font._rPr.set("spc", str(int(track * PT * 100)))
        # que la fuente valga también para el asiático y el símbolo
        for etiqueta in ("latin", "ea", "cs"):
            e = r.font._rPr.find(qn("a:" + etiqueta))
            if e is None:
                e = r.font._rPr.makeelement(qn("a:" + etiqueta), {})
                r.font._rPr.append(e)
            e.set("typeface", nombre)
    return tb


def nlineas(txt, estilo, cuerpo, ancho_px):
    """Cuántas líneas ocupará ese texto, medido con la fuente de verdad.

    python-pptx no mide nada: hay que preguntárselo a la propia fuente para que
    las cajas no se desborden.
    """
    from laminas import envuelve
    from PIL import ImageDraw, Image
    d = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    equiv = {"xbold": "xbold", "bold": "bold", "semi": "semi", "medium": "medium",
             "mont": "mont", "light": "light", "libro": "libro", "negra": "negra",
             "cursiva": "cursiva", "script": "script"}
    return max(1, len(envuelve(d, txt, equiv[estilo], cuerpo, ancho_px)))


def elipse(s, x, y, w, h, relleno=None, borde=None, grosor=2):
    sh = s.shapes.add_shape(MSO_SHAPE.OVAL, ex(x), ey(y), ex(w), ey(h))
    if relleno:
        sh.fill.solid(); sh.fill.fore_color.rgb = C(relleno)
    else:
        sh.fill.background()
    if borde:
        sh.line.color.rgb = C(borde); sh.line.width = Pt(grosor * PT)
    else:
        sh.line.fill.background()
    sh.shadow.inherit = False
    sh.text_frame.text = ""
    return sh


def pastilla(s, x, y, w, h, relleno):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ex(x), ey(y), ex(w), ey(h))
    sh.adjustments[0] = 0.5
    sh.fill.solid(); sh.fill.fore_color.rgb = C(relleno)
    sh.line.fill.background()
    sh.shadow.inherit = False
    sh.text_frame.text = ""
    return sh


def fondo(s, color):
    f = s.background.fill
    f.solid()
    f.fore_color.rgb = C(color)


def notas(s, txt):
    s.notes_slide.notes_text_frame.text = txt
