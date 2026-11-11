#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""La contraportada, con el logotipo rehecho.

El logotipo de la contraportada que diagramó Beulah está roto en portugués: el
subconjunto de fuente embebido perdió glifos y el rótulo sale «Adveńtısta». Aquí
se repinta el fondo donde estaba y se estampa el logotipo bueno, el de la
portadilla, que sí viene en vectores completos y solo hay que reapilar —en la
portadilla la «A» va a la izquierda del rótulo y en la contraportada encima—.

Uso: python3 contraportada.py <es|pt> <png salida>
"""
import sys, os
import fitz
import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
BEULAH = ("/Users/titogoicocheam/aplicativos-titoia/gestao-internatos-dsa/"
          "Documentos diagramados/Diagramados por Marquinhos/")
FUENTE = {
    "es": BEULAH + "Referencial Gestión Internados - Ed Básica Esp - Completo.pdf",
    "pt": BEULAH + "Referencial Gestão Internatos - Ed Básica_Port - Completo.pdf",
}
LOGO_PORTADILLA = fitz.Rect(396.0, 693.0, 521.0, 725.0)   # el bueno, en vectores
LOGO_CONTRA = (233.8, 351.4, 347.5, 427.9)                # el roto, el que se tapa
DPI = 220


def piezas(lang, dpi=900):
    """Separa el logotipo de la portadilla en símbolo y rótulo, ya en blanco."""
    doc = fitz.open(FUENTE[lang])
    pm = doc[1].get_pixmap(dpi=dpi, clip=LOGO_PORTADILLA)
    a = np.asarray(Image.frombytes("RGB", (pm.width, pm.height), pm.samples)).astype(np.int16)
    tinta = 255 - a.min(axis=2)
    ys, xs = np.nonzero(tinta > 28)
    tinta = tinta[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    # la columna vacía más ancha separa la «A» del rótulo
    vacias = (tinta.max(axis=0) < 20)
    mejor, largo, k = None, 0, 0
    for i, v in enumerate(vacias):
        if v:
            k += 1
            if k > largo:
                largo, mejor = k, i
        else:
            k = 0
    # `mejor` es la última columna del hueco más ancho: el símbolo acaba donde
    # el hueco empieza y el rótulo arranca justo después
    inicio_hueco = mejor - largo + 1
    def blanca(t):
        alfa = np.clip(t.astype(np.float32) * 1.18, 0, 255).astype(np.uint8)
        return Image.fromarray(np.dstack([np.full(alfa.shape + (3,), 255, np.uint8),
                                          alfa]), "RGBA")
    return blanca(tinta[:, :inicio_hueco]), blanca(tinta[:, mejor + 1:])


def apila(simbolo, rotulo, ancho_px, hueco=0.17):
    """La «A» centrada encima y el rótulo debajo, como en la contraportada."""
    w_r = ancho_px
    h_r = round(rotulo.height * w_r / rotulo.width)
    rotulo = rotulo.resize((w_r, h_r), Image.LANCZOS)
    w_s = round(w_r * 0.46)
    h_s = round(simbolo.height * w_s / simbolo.width)
    simbolo = simbolo.resize((w_s, h_s), Image.LANCZOS)
    sep = round(h_r * hueco)
    out = Image.new("RGBA", (w_r, h_s + sep + h_r), (0, 0, 0, 0))
    out.paste(simbolo, ((w_r - w_s) // 2, 0), simbolo)
    out.paste(rotulo, (0, h_s + sep), rotulo)
    return out


def repinta(im, caja, margen=6):
    """Borra el logotipo viejo interpolando el degradado del fondo."""
    x0, y0, x1, y1 = [round(v) for v in caja]
    x0 -= margen; y0 -= margen; x1 += margen; y1 += margen
    px = im.load()
    ya, yb = y0 - 3, y1 + 3
    for x in range(x0, x1):
        ca, cb = px[x, ya], px[x, yb]
        for y in range(y0, y1):
            t = (y - ya) / (yb - ya)
            px[x, y] = tuple(round(a + (b - a) * t) for a, b in zip(ca, cb))


def main():
    lang, salida = sys.argv[1], sys.argv[2]
    doc = fitz.open(FUENTE[lang])
    pg = doc[doc.page_count - 1]
    pm = pg.get_pixmap(dpi=DPI)
    im = Image.frombytes("RGB", (pm.width, pm.height), pm.samples)
    esc = DPI / 72
    repinta(im, [v * esc for v in LOGO_CONTRA])
    simbolo, rotulo = piezas(lang)
    logo = apila(simbolo, rotulo, round((LOGO_CONTRA[2] - LOGO_CONTRA[0]) * esc))
    x = round((im.width - logo.width) / 2)
    y = round(LOGO_CONTRA[1] * esc)
    im.paste(logo, (x, y), logo)
    im.save(salida, quality=95)
    print(f"  ✓ {os.path.basename(salida)} · {im.size} · logotipo {logo.size} en ({x}, {y})")


if __name__ == "__main__":
    main()
