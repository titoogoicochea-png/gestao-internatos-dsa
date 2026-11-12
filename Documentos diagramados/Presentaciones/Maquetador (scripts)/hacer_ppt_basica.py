#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Monta las dos presentaciones de Vida en el Campus — Educación Básica.

Diez láminas, las mismas que quedaron en la de Educación Superior después de
que Tito quitara la anatomía del criterio, la escala y la clasificación:
portada · la idea · el mapa · el esquema integrado · cinco de dimensión · el
cierre.

Uso: python3 hacer_ppt_basica.py
"""
import os
from pptx import Presentation
from pptx.util import Emu
import diapos as D
import guion_basica as G
from editable import ANCHO_EMU, ALTO_EMU
from hacer_ppt_campus import numera

AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(AQUI, "ppt")
DESTINO = ("/Users/titogoicocheam/aplicativos-titoia/gestao-internatos-dsa/"
           "Documentos diagramados/Presentaciones")
NOMBRES = {"es": "Formulario de Vida en el Campus — Ed Básica (ES).pptx",
           "pt": "Formulário de Vida no Campus — Ed Básica (PT).pptx"}
TOTAL = 10


def nueva():
    prs = Presentation()
    prs.slide_width, prs.slide_height = Emu(ANCHO_EMU), Emu(ALTO_EMU)
    return prs


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
    D.cierre_texto(S(), G.CIERRE[lang], com, f"{OUT}/fondo_cierre_cam_{lang}.jpg",
                   logo, TOTAL, TOTAL, sube_pie=86)

    numera(prs)
    prs.core_properties.title = ("Formulario de Vida en el Campus en los "
                                 "Internados Adventistas — Educación Básica")
    prs.core_properties.author = "División Sudamericana · Departamento de Educación"
    ruta = os.path.join(DESTINO, NOMBRES[lang])
    prs.save(ruta)
    print(f"  ✓ {NOMBRES[lang][:50]:50s} {len(prs.slides._sldIdLst)} láminas · "
          f"{os.path.getsize(ruta)/1e6:.1f} MB")
    return ruta


if __name__ == "__main__":
    for lang in ("es", "pt"):
        campus(lang)
