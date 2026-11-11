#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Los activos de imagen de la presentación de Vida en el Campus.

Son tres por idioma: el fondo de portada y el de cierre, recortados a 16:9 del
arte de la portada del documento, y el sello recortado del mismo arte. El
logotipo blanco se reaprovecha del juego anterior.
"""
import os
from PIL import Image, ImageDraw
from laminas import fondo_portada

AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(AQUI, "ppt")

# el sello de este documento está algo más arriba y es mayor que el del
# Formulario: estas son las medidas de portada_campus.sello(), sobre 1783 px
SELLO_CX, SELLO_CY, SELLO_R = 1556, 306, 122


def sello(ruta, lado=620):
    """Recorta el sello de la portada y lo deja circular, con alfa."""
    im = Image.open(ruta).convert("RGB")
    esc = im.width / 1783
    cx, cy, r = SELLO_CX * esc, SELLO_CY * esc, (SELLO_R + 6) * esc
    rec = im.crop((round(cx - r), round(cy - r), round(cx + r), round(cy + r)))
    rec = rec.resize((lado, lado), Image.LANCZOS)
    mask = Image.new("L", (lado, lado), 0)
    ImageDraw.Draw(mask).ellipse([4, 4, lado - 5, lado - 5], fill=255)
    out = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    out.paste(rec, (0, 0), mask)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    for lang in ("es", "pt"):
        cub = os.path.join(AQUI, f"port_campus_{lang}.jpg")
        if not os.path.exists(cub):
            raise SystemExit(f"  ✗ falta la portada {cub}")
        # el arte se recorta por debajo del título, que va rasterizado en el JPEG
        fondo_portada(cub, 1430, izquierda=0.68).save(
            f"{OUT}/fondo_portada_cam_{lang}.jpg", quality=92)
        fondo_portada(cub, 1320, espejo=True, izquierda=0.80, general=0.34).save(
            f"{OUT}/fondo_cierre_cam_{lang}.jpg", quality=92)
        sello(cub).save(f"{OUT}/sello_cam_{lang}.png")
        print(f"  ✓ activos de {lang}")


if __name__ == "__main__":
    main()
