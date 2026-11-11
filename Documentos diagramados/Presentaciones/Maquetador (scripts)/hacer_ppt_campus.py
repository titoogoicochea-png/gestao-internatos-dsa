#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Monta las dos presentaciones de Vida en el Campus, editables.

Mismo esquema que la del Formulario de Acreditación, con cinco dimensiones:
portada · la idea · el mapa · el esquema integrado · cinco láminas de dimensión ·
la anatomía del criterio · la escala · la clasificación · el cierre. Trece
láminas: la vivencia percibida vive en el documento y aquí sobraba.

Uso: python3 hacer_ppt_campus.py
"""
import os, re
from pptx import Presentation
from pptx.util import Emu
from pptx.enum.shapes import MSO_SHAPE
import diapos as D
import guion_campus as G
from editable import ANCHO_EMU, ALTO_EMU, texto, W, H, MARGEN

AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(AQUI, "ppt")
DESTINO = ("/Users/titogoicocheam/aplicativos-titoia/gestao-internatos-dsa/"
           "Documentos diagramados/Presentaciones")
NOMBRES = {"es": "Formulario de Vida en el Campus — Ed Superior (ES).pptx",
           "pt": "Formulário de Vida no Campus — Ed Superior (PT).pptx"}
TOTAL = 13

# Cada lámina la escribía a su manera —a H-52, a H-74, a H-92, y el cierre a la
# izquierda—. La numeración se rehace al final, en un solo sitio y siempre en la
# esquina inferior derecha. La portada no lleva: ahí abajo a la derecha está el
# logotipo.
FOLIO_Y = H - 78
FOLIO_RE = re.compile(r"^\s*\d{2}\s*/\s*\d{2}\s*$")
FOLIO_CLARO = (140, 164, 200)      # sobre lámina oscura
FOLIO_OSCURO = (150, 162, 180)     # sobre lámina clara


def nueva():
    prs = Presentation()
    prs.slide_width, prs.slide_height = Emu(ANCHO_EMU), Emu(ALTO_EMU)
    return prs


def numera(prs):
    """Rehace la paginación: una sola posición, abajo a la derecha.

    Se quita la que cada lámina trae de serie —cada una la ponía a su altura y
    el cierre la ponía a la izquierda— y se vuelve a escribir igual en todas.
    El color se hereda del folio que había; donde no había ninguno se decide
    por el tono de la lámina.
    """
    laminas = list(prs.slides)
    total = len(laminas)
    for k, s in enumerate(laminas, 1):
        color = None
        for sh in list(s.shapes):
            if sh.has_text_frame and FOLIO_RE.match(sh.text_frame.text or ""):
                try:
                    color = tuple(sh.text_frame.paragraphs[0].runs[0].font.color.rgb)
                except Exception:
                    color = None
                sh._element.getparent().remove(sh._element)
        if k == 1:
            continue
        if color is None:
            color = FOLIO_CLARO if oscura(s) else FOLIO_OSCURO
        texto(s, W - MARGEN - 300, FOLIO_Y, 300, 44, f"{k:02d} / {total:02d}",
              "mont", 23, color, alineacion="r")


def oscura(s):
    """¿La lámina tiene fondo oscuro? Lo dice el primer rectángulo a sangre."""
    for sh in s.shapes:
        if sh.shape_type == MSO_SHAPE.RECTANGLE and sh.width >= ANCHO_EMU * 0.99 \
                and sh.height >= ALTO_EMU * 0.99:
            try:
                r, g, b = tuple(sh.fill.fore_color.rgb)
                return r + g + b < 330
            except Exception:
                return False
        if sh.shape_type == 13:        # una imagen a sangre: fondo fotográfico
            if sh.width >= ANCHO_EMU * 0.99 and sh.height >= ALTO_EMU * 0.99:
                return True
    return False


def campus(lang):
    t, com = G.CAMPUS[lang], G.COMUN[lang]
    dims, rot, P = G.DIMENSIONES[lang], G.ROTULOS[lang], G.PALETA
    logo = f"{OUT}/logo_blanco_{lang}.png"
    prs = nueva()
    vacia = prs.slide_layouts[6]
    S = lambda: prs.slides.add_slide(vacia)

    D.portada_ref(S(), t, com, f"{OUT}/fondo_portada_cam_{lang}.jpg", logo,
                  f"{OUT}/sello_cam_{lang}.png")
    D.frase_texto(S(), G.FRASE[lang], com, 2, TOTAL)
    D.mapa_detalle(S(), t, com, dims, P, 3, TOTAL)
    D.esquema_dimensiones(S(), dims, G.ESQUEMA[lang], P, 4, TOTAL)
    for k, c in enumerate(dims):
        D.capitulo(S(), c, k, rot, com, 5 + k, TOTAL, logo,
                   c["partes"], c["claves"], rot, paleta=P)
    D.anatomia(S(), t, com, paleta=P)
    D.escala(S(), t, com, paleta=P, colores=G.ESCALA_COLORES)
    D.decision(S(), t, com, paleta=P, colores=G.DECISION_COLORES)
    # el logotipo sube: la paginación de esta presentación va abajo a la derecha
    D.cierre_texto(S(), G.CIERRE[lang], com, f"{OUT}/fondo_cierre_cam_{lang}.jpg",
                   logo, TOTAL, TOTAL, sube_pie=86)

    numera(prs)
    prs.core_properties.title = "Formulario de Vida en el Campus en los Internados Adventistas"
    prs.core_properties.author = "División Sudamericana · Departamento de Educación"
    ruta = os.path.join(DESTINO, NOMBRES[lang])
    prs.save(ruta)
    n = len(prs.slides._sldIdLst)
    print(f"  ✓ {NOMBRES[lang][:52]:52s} {n} láminas · "
          f"{os.path.getsize(ruta)/1e6:.1f} MB")
    return ruta


if __name__ == "__main__":
    os.makedirs(DESTINO, exist_ok=True)
    for lang in ("es", "pt"):
        campus(lang)
