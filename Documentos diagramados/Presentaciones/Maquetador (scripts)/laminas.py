#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""El sistema de láminas de las presentaciones, con la tipografía del documento.

Ni Montserrat ni Lato están instaladas en el sistema, así que una presentación
con texto nativo se vería con otras fuentes en cualquier ordenador. Cada lámina
se compone aquí con los archivos de fuente reales y se monta como imagen a
sangre: así se ve igual en PowerPoint, en Keynote y en el proyector de la sala.
"""
import os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
LATO = os.path.join(AQUI, "lato")
MONT = ("/Users/titogoicocheam/Library/CloudStorage/OneDrive-Adventistas/"
        "Núcleo Estratégico Educacional - DSA/Traducción estudios bíblicos/transfonts")

FUENTES = {
    "xbold": os.path.join(MONT, "Montserrat-ExtraBold.ttf"),
    "bold": os.path.join(MONT, "Montserrat-Bold.ttf"),
    "semi": os.path.join(LATO, "Montserrat-SemiBold.ttf"),
    "medium": os.path.join(MONT, "Montserrat-Medium.ttf"),
    "mont": os.path.join(LATO, "Montserrat-Regular.ttf"),
    "light": os.path.join(LATO, "Lato-Light.ttf"),
    "libro": os.path.join(LATO, "Lato-Regular.ttf"),
    "negra": os.path.join(LATO, "Lato-Bold.ttf"),
    "cursiva": os.path.join(LATO, "Lato-LightItalic.ttf"),
    "script": os.path.join(LATO, "Niconne-Regular.ttf"),
}

W, H = 2560, 1440
MARGEN = 150

AZUL = (15, 50, 130)
AZUL_HONDO = (10, 32, 78)
NOCHE = (7, 23, 58)
CIAN = (10, 180, 210)
NARANJA = (240, 130, 90)
BLANCO = (255, 255, 255)
HUESO = (232, 240, 250)
GRIS = (90, 100, 118)
GRIS_CLARO = (150, 162, 180)

# la paleta de las seis dimensiones, la misma del instrumento
DIMENSIONES = [
    ((0x1F, 0x38, 0x64), (0x2E, 0x75, 0xB6), (0xE8, 0xEE, 0xF7)),
    ((0x12, 0x49, 0x5A), (0x1F, 0x7A, 0x94), (0xE3, 0xF1, 0xF5)),
    ((0x15, 0x50, 0x3B), (0x24, 0x80, 0x5F), (0xE4, 0xF2, 0xEC)),
    ((0x5C, 0x44, 0x10), (0x8F, 0x6A, 0x16), (0xF5, 0xEE, 0xDF)),
    ((0x5C, 0x25, 0x30), (0x8E, 0x3B, 0x4A), (0xF6, 0xE9, 0xEC)),
    ((0x39, 0x2F, 0x63), (0x5B, 0x4B, 0x93), (0xEC, 0xE9, 0xF5)),
]

_cache = {}


def F(nombre, size):
    clave = (nombre, round(size))
    if clave not in _cache:
        _cache[clave] = ImageFont.truetype(FUENTES[nombre], round(size))
    return _cache[clave]


# ── texto ──────────────────────────────────────────────────────────────────
def ancho(d, txt, fuente, size, track=0.0):
    f = F(fuente, size)
    return sum(d.textlength(c, font=f) for c in txt) + track * max(0, len(txt) - 1)


def escribe(d, x, y, txt, fuente, size, color, track=0.0, anclaje="ls"):
    """`anclaje` sigue a PIL salvo en la x: 'c' centra y 'r' alinea a la derecha."""
    f = F(fuente, size)
    w = ancho(d, txt, fuente, size, track)
    if anclaje[0] == "c":
        x -= w / 2
    elif anclaje[0] == "r":
        x -= w
    for c in txt:
        d.text((x, y), c, font=f, fill=color, anchor="l" + anclaje[-1])
        x += d.textlength(c, font=f) + track
    return w


def envuelve(d, txt, fuente, size, limite, track=0.0):
    out, act = [], ""
    for p in txt.split(" "):
        cand = (act + " " + p).strip()
        if act and ancho(d, cand, fuente, size, track) > limite:
            out.append(act); act = p
        else:
            act = cand
    if act:
        out.append(act)
    return out


def parrafo(d, x, y, txt, fuente, size, color, limite, interlinea, track=0.0,
            anclaje="ls"):
    for ln in envuelve(d, txt, fuente, size, limite, track):
        escribe(d, x, y, ln, fuente, size, color, track, anclaje)
        y += interlinea
    return y


# ── fondos y adornos ───────────────────────────────────────────────────────
def lienzo(color=BLANCO):
    return Image.new("RGB", (W, H), color)


def velo(im, caja, color, a0, a1, vertical=True):
    """Degrada una tinta sobre la imagen: de a0 a a1 de opacidad."""
    x0, y0, x1, y1 = caja
    w, h = x1 - x0, y1 - y0
    cap = Image.new("L", (1, h) if vertical else (w, 1))
    px = cap.load()
    n = h if vertical else w
    for i in range(n):
        v = a0 + (a1 - a0) * i / max(1, n - 1)
        px[(0, i) if vertical else (i, 0)] = int(v * 255)
    cap = cap.resize((w, h))
    im.paste(Image.new("RGB", (w, h), color), (x0, y0), cap)


def fondo_portada(cubierta, y0=1500, espejo=False, izquierda=0.0, general=0.0):
    """El arte de la portada, recompuesto a 16:9.

    El rótulo de la División va rasterizado dentro del JPEG, hacia y≈2850 de la
    imagen escalada: el recorte no debe llegar hasta él o sale repetido.
    """
    im = Image.open(cubierta).convert("RGB")
    g = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    y0 = max(0, min(y0, g.height - H))
    lam = g.crop((0, y0, W, y0 + H))
    if espejo:
        lam = lam.transpose(Image.FLIP_LEFT_RIGHT)
    if general:
        velo(lam, (0, 0, W, H), NOCHE, general, general)
    velo(lam, (0, 0, W, int(H * 0.52)), NOCHE, 0.72, 0.0)
    if izquierda:
        velo(lam, (0, 0, int(W * 0.66), H), NOCHE, izquierda, 0.0, vertical=False)
    velo(lam, (0, int(H * 0.82), W, H), NOCHE, 0.0, 0.40)
    return lam


def regla_tricolor(d, x, y, largo, grosor=10, hueco=0):
    tramo = (largo - 2 * hueco) / 3
    for k, c in enumerate(((19, 54, 118), (6, 180, 204), (245, 129, 92))):
        a = x + k * (tramo + hueco)
        d.rectangle([a, y, a + tramo, y + grosor], fill=c)


def pie_division(d, x, y, lineas, color=HUESO, size=30, anclaje="ls"):
    escribe(d, x, y, lineas[0], "medium", size, color, track=size * 0.14,
            anclaje=anclaje)
    escribe(d, x, y + size * 1.35, lineas[1], "medium", size * 0.82, color,
            track=size * 0.03, anclaje=anclaje)


def estampa(lam, ruta, caja, anclaje="lt"):
    """Pega un PNG con alfa ajustándolo a lo ancho de `caja`."""
    im = Image.open(ruta).convert("RGBA")
    x, y, w = caja
    h = round(im.height * w / im.width)
    im = im.resize((round(w), h), Image.LANCZOS)
    if anclaje[0] == "r":
        x -= w
    if anclaje[1] == "b":
        y -= h
    lam.paste(im, (round(x), round(y)), im)
    return h


def sombra(lam, caja, radio=26, opacidad=0.18):
    x0, y0, x1, y1 = caja
    capa = Image.new("L", (W, H), 0)
    ImageDraw.Draw(capa).rounded_rectangle([x0 + 6, y0 + 10, x1 + 6, y1 + 12],
                                           radius=radio, fill=int(opacidad * 255))
    capa = capa.filter(ImageFilter.GaussianBlur(14))
    lam.paste(Image.new("RGB", (W, H), (20, 35, 70)), (0, 0), capa)
