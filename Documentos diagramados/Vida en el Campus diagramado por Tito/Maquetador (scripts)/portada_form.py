# -*- coding: utf-8 -*-
"""Compone la portada del Formulario de Acreditación sobre el arte del Referencial.

El arte no lleva capa de texto: título, nivel y pie están rasterizados en el
JPEG. El único bloque que se rehace es el título —se borra reconstruyendo el
fondo, un azul de degradado muy suave que se interpola columna a columna entre
una fila limpia de encima y otra de debajo, y se vuelve a escribir con la
tipografía, el cuerpo y el tracking medidos sobre el original—. La regla
tricolor, el rótulo de nivel y el pie quedan intactos; el distintivo de
evaluación se añade en la banda libre que hay bajo el nivel.

Uso: python3 portada_form.py <es|pt> <a|b|c> <jpg salida>
"""
import sys, os, math
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
LATO = os.path.join(AQUI, "lato")
MONT = ("/Users/titogoicocheam/Library/CloudStorage/OneDrive-Adventistas/"
        "Núcleo Estratégico Educacional - DSA/Traducción estudios bíblicos/transfonts")
XBOLD = os.path.join(MONT, "Montserrat-ExtraBold.ttf")
SEMI = os.path.join(LATO, "Montserrat-SemiBold.ttf")
REG = os.path.join(LATO, "Montserrat-Regular.ttf")

BLANCO = (255, 255, 255)
NARANJA = (245, 129, 92)
CIAN = (6, 180, 204)
AZUL = (33, 79, 160)
ACERO = (120, 146, 184)
HUESO = (222, 236, 248)

# Medidas tomadas del arte español (1783 × 2389); el portugués es el mismo
# arte a escala 1621/1783, así que todo se multiplica por ESC.
ES = dict(jpeg="cov_es.jpeg", ancho=1783, x0=446, medida=1478, banda=905,
          titulo=("FORMULARIO DE", "ACREDITACIÓN", "DE INTERNADOS", "ADVENTISTAS"),
          escala=("AP", "AA", "PA", "NA"),
          cifras=("6 DIMENSIONES", "22 SUBDIMENSIONES", "115 CRITERIOS", "1.485 PUNTOS"),
          sello=("ACREDITACIÓN", "DIVISIÓN SUDAMERICANA"),
          pie="INSTRUMENTO DE EVALUACIÓN")
PT = dict(jpeg="cov_pt.jpeg", ancho=1621, x0=406, medida=1344, banda=823,
          titulo=("FORMULÁRIO DE", "ACREDITAÇÃO", "DE INTERNATOS", "ADVENTISTAS"),
          escala=("AP", "AA", "PA", "NA"),
          cifras=("6 DIMENSÕES", "22 SUBDIMENSÕES", "115 CRITÉRIOS", "1.485 PONTOS"),
          sello=("ACREDITAÇÃO", "DIVISÃO SUL-AMERICANA"),
          pie="INSTRUMENTO DE AVALIAÇÃO")

_med = ImageDraw.Draw(Image.new("RGB", (8, 8)))


def ancho(txt, f, track):
    return sum(_med.textlength(c, font=f) for c in txt) + track * (len(txt) - 1)


def track_para(txt, f, objetivo):
    return (objetivo - ancho(txt, f, 0)) / max(1, len(txt) - 1)


def escribir(d, txt, f, x, base, color, track):
    for c in txt:
        d.text((x, base), c, font=f, fill=color, anchor="ls")
        x += _med.textlength(c, font=f) + track
    return x - track


def reponer(px, caja, limpia):
    x0, y0, x1, y1 = caja
    ya, yb = limpia
    for x in range(x0, x1):
        ca, cb = px[x, ya], px[x, yb]
        for y in range(y0, y1):
            t = (y - ya) / (yb - ya)
            px[x, y] = tuple(round(a + (b - a) * t) for a, b in zip(ca, cb))


def main():
    lang, var, salida = sys.argv[1], sys.argv[2].lower(), sys.argv[3]
    M = ES if lang == "es" else PT
    esc = M["ancho"] / 1783
    E = lambda v: round(v * esc)
    im = Image.open(os.path.join(AQUI, M["jpeg"])).convert("RGB")
    d = ImageDraw.Draw(im)
    x0, medida = M["x0"], M["medida"]

    # ── el título ───────────────────────────────────────────────────────────
    reponer(im.load(), (E(380), E(168), M["ancho"] - E(40), E(690)), (E(166), E(694)))
    f_fina = ImageFont.truetype(REG, E(68))
    f_bold = ImageFont.truetype(XBOLD, E(117))
    f_adv = ImageFont.truetype(REG, E(116))
    l1, l2, l3, l4 = M["titulo"]
    tr = track_para(l3, f_bold, medida - x0)        # la línea larga llena la medida
    escribir(d, l1, f_fina, x0 + E(2), E(282), BLANCO, E(1.47))
    escribir(d, l2, f_bold, x0, E(437), BLANCO, tr)
    escribir(d, l3, f_bold, x0, E(556), BLANCO, tr)
    escribir(d, l4, f_adv, x0 - E(5), E(665), BLANCO, E(0.6))

    # ── el distintivo de evaluación ─────────────────────────────────────────
    {"a": escala, "b": sello, "c": cifras}[var](im, d, M, E, esc)

    im.save(salida, quality=95, subsampling=0)
    print(f"  ✓ {os.path.basename(salida)}  ({lang}, variante {var})")


# ── A · la escala de logro ──────────────────────────────────────────────────
def escala(im, d, M, E, esc):
    """Los cuatro niveles del instrumento, como un medidor bajo el nivel."""
    x0, y = M["x0"], M["banda"]
    largo, hueco, gr = E(620), E(10), E(10)
    tramo = (largo - 3 * hueco) / 4
    f = ImageFont.truetype(SEMI, E(25))
    barras = (AZUL, CIAN, NARANJA, ACERO)
    rotulos = ((124, 164, 238), CIAN, NARANJA, (164, 186, 214))
    for i, rot in enumerate(M["escala"]):
        a = x0 + i * (tramo + hueco)
        d.rectangle([a, y, a + tramo, y + gr - 1], fill=barras[i])
        escribir(d, rot, f, a + E(1), y + gr + E(34), rotulos[i], E(2.4))
    f2 = ImageFont.truetype(REG, E(25))
    escribir(d, M["pie"], f2, x0 + largo + E(46), y + gr + E(34), (196, 216, 238), E(3.6))


# ── B · el sello de acreditación ────────────────────────────────────────────
def sello(im, d, M, E, esc):
    """Un sello de línea, del mismo trazo de neón que el edificio del arte."""
    cx, cy, r = E(1562), E(302), E(108)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=CIAN, width=E(3))
    rr = r - E(12)
    d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=CIAN, width=E(1))
    d.line([(cx - E(38), cy + E(2)), (cx - E(10), cy + E(30)), (cx + E(43), cy - E(36))],
           fill=BLANCO, width=E(9), joint="curve")
    f = ImageFont.truetype(SEMI, E(19))
    anillo(im, M["sello"][0], f, cx, cy, r - E(28), "arriba", CIAN, E(2.4))
    anillo(im, M["sello"][1], f, cx, cy, r - E(28), "abajo", CIAN, E(2.4))


def anillo(im, txt, f, cx, cy, r, lado, color, track):
    """Rotula sobre un arco; el ángulo va en grados, 0 = a la derecha, y hacia abajo."""
    anchos = [_med.textlength(c, font=f) + track for c in txt]
    arco = math.degrees((sum(anchos) - track) / r)
    centro, signo = (-90, +1) if lado == "arriba" else (90, -1)
    ang = centro - signo * arco / 2
    for c, w in zip(txt, anchos):
        paso = math.degrees(w / r)
        th = ang + signo * paso / 2
        a = math.radians(th)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        giro = -(th + 90) if lado == "arriba" else -(th - 90)
        lad = round(max(w, f.size) * 3)
        s = Image.new("RGBA", (lad, lad), (0, 0, 0, 0))
        ImageDraw.Draw(s).text((lad / 2, lad / 2), c, font=f, fill=color + (255,), anchor="mm")
        s = s.rotate(giro, resample=Image.BICUBIC)
        im.paste(s, (round(x - lad / 2), round(y - lad / 2)), s)
        ang += signo * paso


# ── C · la cifra del instrumento ────────────────────────────────────────────
def cifras(im, d, M, E, esc):
    """Lo que mide el instrumento, dicho con sus propios números."""
    x0, y = M["x0"], M["banda"]
    f2 = ImageFont.truetype(REG, E(24))
    escribir(d, M["pie"], f2, x0, y - E(16), NARANJA, E(4.0))
    f = ImageFont.truetype(SEMI, E(27))
    fp = ImageFont.truetype(REG, E(27))
    x = x0
    for i, c in enumerate(M["cifras"]):
        if i:
            x = escribir(d, "·", fp, x + E(18), y + E(62), ACERO, 0) + E(18)
        x = escribir(d, c, f, x, y + E(62), HUESO if i % 2 == 0 else CIAN, E(2.2))
    largo = x - x0
    for yy in (y + E(18), y + E(88)):
        d.line([(x0, yy), (x0 + largo, yy)], fill=(96, 130, 180), width=E(2))


if __name__ == "__main__":
    main()
