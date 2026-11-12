#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Monta las dos presentaciones del Referencial — Educación Básica.

Once láminas: portada · la idea · el esquema lógico de los siete capítulos ·
una lámina por capítulo · el cierre. El Referencial no lleva sello: ese es del
instrumento de acreditación.

Uso: python3 hacer_ppt_ref_bas.py
"""
import os
from pptx import Presentation
from pptx.util import Emu
import diapos as D
import guion_ref_bas as G
from editable import ANCHO_EMU, ALTO_EMU
from hacer_ppt_campus import numera

AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(AQUI, "ppt")
DESTINO = ("/Users/titogoicocheam/aplicativos-titoia/gestao-internatos-dsa/"
           "Documentos diagramados/Presentaciones")
NOMBRES = {"es": "Referencial Gestión de Internados — Ed Básica (ES).pptx",
           "pt": "Referencial Gestão de Internatos — Ed Básica (PT).pptx"}
TOTAL = 11


def nueva():
    prs = Presentation()
    prs.slide_width, prs.slide_height = Emu(ANCHO_EMU), Emu(ALTO_EMU)
    return prs


def referencial(lang):
    t, com, rot = G.REF[lang], G.COMUN[lang], G.ROT[lang]
    caps = G.CAPITULOS[lang]
    logo = f"{OUT}/logo_blanco_{lang}.png"
    prs = nueva()
    vacia = prs.slide_layouts[6]
    S = lambda: prs.slides.add_slide(vacia)

    D.portada_ref(S(), t, com, f"{OUT}/fondo_portada_cam_{lang}.jpg", logo)
    D.frase_texto(S(), G.FRASE[lang], com, 2, TOTAL)
    D.esquema_sistemico(S(), caps, G.ESQUEMA[lang], com)
    for k, c in enumerate(caps):
        D.capitulo(S(), c, k, rot, com, 4 + k, TOTAL, logo,
                   c["glosas"], c["claves"], rot)
    D.cierre_texto(S(), G.CIERRE[lang], com, f"{OUT}/fondo_cierre_cam_{lang}.jpg",
                   logo, TOTAL, TOTAL, sube_pie=86)

    numera(prs)
    prs.core_properties.title = ("Referencial para la Gestión de Internados "
                                 "Adventistas — Educación Básica")
    prs.core_properties.author = "División Sudamericana · Departamento de Educación"
    ruta = os.path.join(DESTINO, NOMBRES[lang])
    prs.save(ruta)
    print(f"  ✓ {NOMBRES[lang][:48]:48s} {len(prs.slides._sldIdLst)} láminas · "
          f"{os.path.getsize(ruta)/1e6:.1f} MB")


if __name__ == "__main__":
    for lang in ("es", "pt"):
        referencial(lang)
