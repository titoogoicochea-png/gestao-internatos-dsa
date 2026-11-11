# -*- coding: utf-8 -*-
"""Portada del Formulario de Vida en el Campus, sobre el arte del Referencial.

Es la portada del Formulario de Acreditación con dos cambios: el título, que se
recompone sobre el fondo reconstruido, y el logotipo «Educación Adventista», que
se trae en vectores de la portadilla que diagramó Beulah y se pasa a blanco para
que funcione sobre el azul. El sello, la regla tricolor, el rótulo de nivel y el
pie no se tocan.

Uso: python3 portada_campus.py <es|pt> <jpg salida>
"""
import sys, os
import fitz
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import portada_form as PF

AQUI = os.path.dirname(os.path.abspath(__file__))
BEULAH = ("/Users/titogoicocheam/aplicativos-titoia/gestao-internatos-dsa/"
          "Documentos diagramados/Diagramados por Marquinhos/")
PORTADILLA = {
    "es": BEULAH + "Referencial Gestión Internados - Ed Básica Esp - Completo.pdf",
    "pt": BEULAH + "Referencial Gestão Internatos - Ed Básica_Port - Completo.pdf",
}
# el logotipo en la portadilla, en puntos de página
LOGO_CAJA = fitz.Rect(396.0, 693.0, 521.0, 725.0)
PAGINA_ANCHO = 581.1
MARGEN_DER = 518.7          # el borde derecho del logotipo en la portadilla

TITULO = {
    "es": ("FORMULARIO DE", "VIDA EN EL CAMPUS", "EN LOS INTERNADOS", "ADVENTISTAS"),
    "pt": ("FORMULÁRIO DE", "VIDA NO CAMPUS", "NOS INTERNATOS", "ADVENTISTAS"),
}
SELLO = {
    "es": ("VIDA EN EL CAMPUS", "DIVISIÓN SUDAMERICANA"),
    "pt": ("VIDA NO CAMPUS", "DIVISÃO SUL-AMERICANA"),
}


def logotipo_blanco(lang, alto_px):
    """Saca el logotipo de la portadilla y lo deja blanco sobre transparente.

    El alfa sale de lo oscuro que es cada píxel, así que el antialias del
    original se conserva y el rótulo no queda con los bordes dentados.
    """
    doc = fitz.open(PORTADILLA[lang])
    pm = doc[1].get_pixmap(dpi=900, clip=LOGO_CAJA)
    im = Image.frombytes("RGB", (pm.width, pm.height), pm.samples)
    a = np.asarray(im).astype(np.int16)
    tinta = 255 - a.min(axis=2)                      # 0 = papel, 255 = trazo
    ys, xs = np.nonzero(tinta > 28)
    tinta = tinta[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    alfa = np.clip(tinta.astype(np.float32) * 1.18, 0, 255).astype(np.uint8)
    rgba = np.dstack([np.full(alfa.shape + (3,), 255, np.uint8), alfa])
    logo = Image.fromarray(rgba, "RGBA")
    ancho = round(logo.width * alto_px / logo.height)
    return logo.resize((ancho, alto_px), Image.LANCZOS)


def ajuste_bold(l2, l3, M, E, medida):
    """Cuerpo y tracking de las dos líneas en ExtraBold.

    El original llenaba la medida con «DE INTERNADOS» a 117 px y un tracking
    propio. Aquí las líneas son más largas, así que se conserva ese tracking
    como fracción del cuerpo y se reduce el cuerpo hasta que la línea más ancha
    vuelva a llenar la medida exacta: así el bloque mantiene su borde derecho y
    las letras no se tocan.
    """
    base = E(117)
    patron = PF.ES["titulo"][2]                  # «DE INTERNADOS», la del original
    f0 = ImageFont.truetype(PF.XBOLD, base)
    tr0 = PF.track_para(patron, f0, medida)
    k = tr0 / base
    ancho = []
    for linea in (l2, l3):
        f1 = ImageFont.truetype(PF.XBOLD, 100)
        ancho.append((PF.ancho(linea, f1, 0) / 100, len(linea) - 1))
    cuerpo = min(base, min(medida / (w + k * n) for w, n in ancho))
    return round(cuerpo), k * cuerpo


def sello(im, d, M, E):
    """El mismo sello de línea, con el rótulo más corto de este documento."""
    cx, cy, r = E(1556), E(306), E(122)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=PF.CIAN, width=E(3))
    rr = r - E(13)
    d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=PF.CIAN, width=E(1))
    d.line([(cx - E(40), cy + E(2)), (cx - E(10), cy + E(32)), (cx + E(45), cy - E(38))],
           fill=PF.BLANCO, width=E(9), joint="curve")
    arriba, abajo = M["sello"]
    radio = r - E(27)
    # el cuerpo del anillo se ajusta al rótulo más largo: no debe pasar de
    # media circunferencia, o las dos líneas se encuentran en los costados
    cuerpo = E(19)
    for _ in range(10):
        f = ImageFont.truetype(PF.SEMI, cuerpo)
        peor = max(PF.ancho(t, f, cuerpo * 0.12) for t in (arriba, abajo))
        if peor <= radio * 2.85 or cuerpo <= E(11):
            break
        cuerpo = max(E(11), round(cuerpo * 0.94))
    f = ImageFont.truetype(PF.SEMI, cuerpo)
    PF.anillo(im, arriba, f, cx, cy, radio, "arriba", PF.CIAN, cuerpo * 0.12)
    PF.anillo(im, abajo, f, cx, cy, radio, "abajo", PF.CIAN, cuerpo * 0.12)


def main():
    lang, salida = sys.argv[1], sys.argv[2]
    M = dict(PF.ES if lang == "es" else PF.PT)
    M["titulo"] = TITULO[lang]
    M["sello"] = SELLO[lang]
    esc = M["ancho"] / 1783
    E = lambda v: round(v * esc)
    im = Image.open(os.path.join(AQUI, M["jpeg"])).convert("RGB")
    d = ImageDraw.Draw(im)
    x0, medida = M["x0"], M["medida"]

    # ── el título, sobre el fondo reconstruido ──────────────────────────────
    PF.reponer(im.load(), (E(380), E(168), M["ancho"] - E(40), E(690)),
               (E(166), E(694)))
    f_fina = ImageFont.truetype(PF.REG, E(68))
    f_adv = ImageFont.truetype(PF.REG, E(116))
    l1, l2, l3, l4 = M["titulo"]
    cuerpo, tr = ajuste_bold(l2, l3, M, E, medida - x0)
    f_bold = ImageFont.truetype(PF.XBOLD, cuerpo)
    PF.escribir(d, l1, f_fina, x0 + E(2), E(282), PF.BLANCO, E(1.47))
    PF.escribir(d, l2, f_bold, x0, E(437), PF.BLANCO, tr)
    PF.escribir(d, l3, f_bold, x0, E(556), PF.BLANCO, tr)
    PF.escribir(d, l4, f_adv, x0 - E(5), E(665), PF.BLANCO, E(0.6))

    # ── el sello, con el rótulo de este documento ───────────────────────────
    sello(im, d, M, E)

    # ── el logotipo, en el pie derecho ──────────────────────────────────────
    pxpt = M["ancho"] / PAGINA_ANCHO
    alto = round(26.6 * pxpt)                     # el mismo cuerpo del original
    logo = logotipo_blanco(lang, alto)
    x = round(MARGEN_DER * pxpt) - logo.width
    y = round(697.0 * pxpt)                       # alineado con el pie izquierdo
    im.paste(logo, (x, y), logo)

    im.save(salida, quality=95, subsampling=0)
    print(f"  ✓ {os.path.basename(salida)} · logotipo {logo.width}×{logo.height} px "
          f"en ({x}, {y}) de {im.size}")


if __name__ == "__main__":
    main()
