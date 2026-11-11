#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""El logotipo «Educación Adventista» para la portadilla del Word.

En el PDF la portadilla se clona del original y el logotipo viaja dentro; el
Word, en cambio, necesita el logotipo como imagen suelta. Se saca en vectores
de la portadilla que diagramó Beulah, a 900 dpi, y se conserva su color: el
alfa se toma de lo oscuro de cada píxel para que el antialias no deje borde.

Uso: python3 logo_doc.py <es|pt> <png salida>
"""
import sys
import fitz
import numpy as np
from PIL import Image

BEULAH = ("/Users/titogoicocheam/aplicativos-titoia/gestao-internatos-dsa/"
          "Documentos diagramados/Diagramados por Marquinhos/")
PORTADILLA = {
    "es": BEULAH + "Referencial Gestión Internados - Ed Básica Esp - Completo.pdf",
    "pt": BEULAH + "Referencial Gestão Internatos - Ed Básica_Port - Completo.pdf",
}
CAJA = fitz.Rect(396.0, 693.0, 521.0, 725.0)


def main():
    lang, salida = sys.argv[1], sys.argv[2]
    pm = fitz.open(PORTADILLA[lang])[1].get_pixmap(dpi=900, clip=CAJA)
    a = np.asarray(Image.frombytes("RGB", (pm.width, pm.height), pm.samples))
    tinta = 255 - a.min(axis=2)
    ys, xs = np.nonzero(tinta > 28)
    rec = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    alfa = np.clip((255 - rec.min(axis=2)).astype(np.float32) * 1.18, 0, 255)
    rgba = np.dstack([rec, alfa.astype(np.uint8)])
    im = Image.fromarray(rgba, "RGBA")
    im.save(salida)
    print(f"  ✓ {salida} · {im.width}×{im.height} px")


if __name__ == "__main__":
    main()
