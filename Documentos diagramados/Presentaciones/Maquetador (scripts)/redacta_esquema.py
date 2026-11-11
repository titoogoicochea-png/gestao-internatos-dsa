#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lámina 3 del Referencial: la columna responde su pregunta, no la indiza.

Antes cada columna era un listado de contenidos en cuerpo 7,5. Ahora lleva dos
frases que responden la pregunta del capítulo, y toda la columna sube de cuerpo
—rótulo, «Capítulo N», pregunta y respuesta— porque la letra tenía que leerse
desde el fondo de la sala. La escala se mantiene: el rótulo manda, la pregunta
es el gancho y la respuesta el cuerpo; solo se ha desplazado hacia arriba.

Las siete respuestas arrancan a la misma altura, que es la que deja la pregunta
más larga de las siete. Centrarlas en el hueco se probó y queda peor: abre un
agujero entre la pregunta y el párrafo, distinto en cada columna. El sobrante
cae al pie, dentro del panel de color, donde no se nota. Y el panel se recorta
hasta la respuesta más larga: con el texto breve, los 804 px de antes dejaban
un tercio de columna vacío.

Uso: python3 redacta_esquema.py <es|pt> <entrada.pptx> <salida.pptx>
"""
import sys, copy, importlib
from pptx import Presentation
from PIL import ImageFont

LANG, ENTRADA, SALIDA = sys.argv[1], sys.argv[2], sys.argv[3]
T = importlib.import_module("textos_" + LANG)
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
FUENTES = "/Users/titogoicocheam/Library/Fonts/"

# cuerpos nuevos, en centésimas de punto (antes: 79 · 71 · 79 · 75)
ROTULO, CAPITULO, PREGUNTA, RESPUESTA = 1050, 850, 1100, 1100
INTER_PREGUNTA, INTER_RESPUESTA = 1400, 1430

Y_ROTULO, Y_CAPITULO, Y_PREGUNTA = 448, 486, 528
AIRE = 30.0        # entre la pregunta y la respuesta
PIE_PANEL = 1120.0 # el panel acaba en 1136; se le deja un respiro
MERMA = 40.0       # PowerPoint parte la línea antes que PIL: se mide más justo
SUELO = 34.0       # lo que respira el panel por debajo de la última línea


def medidor(archivo, cuerpo):
    f = ImageFont.truetype(FUENTES + archivo, int(cuerpo / 100 / 0.375))

    def lineas(texto, ancho):
        n, actual = 0, ""
        for palabra in texto.split():
            prueba = (actual + " " + palabra).strip()
            if f.getlength(prueba) <= ancho:
                actual = prueba
            else:
                n, actual = n + 1, palabra
        return n + (1 if actual else 0)
    return lineas


def viste(elemento, cuerpo, interlinea=None, texto=None):
    """Cambia cuerpo, interlínea y texto de un cuadro de una sola tirada."""
    for rpr in elemento.iter(f"{A}rPr"):
        rpr.set("sz", str(cuerpo))
    if interlinea is not None:
        for spc in elemento.iter(f"{A}spcPts"):
            spc.set("val", str(interlinea))
    if texto is not None:
        elemento.find(f".//{A}t").text = texto


def coloca(elemento, px, y=None, alto=None):
    xfrm = elemento.find(f".//{A}xfrm")
    if y is not None:
        xfrm.find(f"{A}off").set("y", str(int(y * px)))
    if alto is not None:
        xfrm.find(f"{A}ext").set("cy", str(int(alto * px)))


def main():
    prs = Presentation(ENTRADA)
    lam = prs.slides[2]
    px = prs.slide_width / 2560
    arbol = lam.shapes._spTree

    def en(y_esperada, ancho):
        return sorted((sh for sh in lam.shapes
                       if sh.has_text_frame
                       and abs(sh.width / px - ancho) < 2
                       and abs(sh.top / px - y_esperada) < 3),
                      key=lambda s: s.left)

    rotulos = en(Y_ROTULO, 297)
    capitulos = en(Y_CAPITULO, 297)
    preguntas = en(Y_PREGUNTA, 285)
    assert len(rotulos) == len(capitulos) == len(preguntas) == 7

    # las viñetas: los cuadros de 281 px que cuelgan bajo la pregunta
    columnas = {}
    for sh in lam.shapes:
        if sh.has_text_frame and abs(sh.width / px - 281) < 2 and sh.top / px > 600:
            columnas.setdefault(round(sh.left / px), []).append(sh)
    izquierdas = sorted(columnas)
    assert len(izquierdas) == 7, izquierdas

    # 1 · el encabezado de la columna sube de cuerpo
    mide_pregunta = medidor("Lato-LightItalic.ttf", PREGUNTA)
    alto_pregunta = 0.0
    for sh in rotulos:
        viste(sh._element, ROTULO)
    for sh in capitulos:
        viste(sh._element, CAPITULO)
    for sh in preguntas:
        viste(sh._element, PREGUNTA, INTER_PREGUNTA)
        n = mide_pregunta(sh.text_frame.text, 285 - MERMA)
        alto = n * INTER_PREGUNTA / 100 / 0.375
        coloca(sh._element, px, alto=alto)
        alto_pregunta = max(alto_pregunta, alto)

    # 2 · un solo cuadro de prosa por columna, centrado en lo que queda
    arranque = Y_PREGUNTA + alto_pregunta + AIRE
    hueco = PIE_PANEL - arranque
    altos = {}
    mide = medidor("Lato-Light.ttf", RESPUESTA)
    print(f"  pregunta: {round(alto_pregunta)} px · hueco para la respuesta: "
          f"{round(hueco)} px desde y={round(arranque)}")
    for n, x in enumerate(izquierdas, start=1):
        grupo = sorted(columnas[x], key=lambda s: s.top)
        molde = copy.deepcopy(grupo[0]._element)
        for sh in grupo:
            arbol.remove(sh._element)

        texto = T.RESPUESTAS[n]
        filas = mide(texto, 281 - MERMA)
        alto = filas * INTER_RESPUESTA / 100 / 0.375
        assert alto <= hueco, (n, alto, hueco)
        viste(molde, RESPUESTA, INTER_RESPUESTA, texto)
        coloca(molde, px, y=arranque, alto=alto)
        altos[n] = alto
        arbol.append(molde)
        print(f"  cap. {n}: {len(texto)} car. · {filas} líneas · "
              f"{round(alto)} px")

    # 3 · el panel se recorta hasta donde llega la columna más larga
    fondo = arranque + max(altos.values()) + SUELO
    paneles = [sh for sh in lam.shapes
               if not sh.has_text_frame or not sh.text_frame.text]
    paneles = [sh for sh in paneles
               if abs(sh.width / px - 313) < 2 and abs(sh.top / px - 332) < 3]
    assert len(paneles) == 7, len(paneles)
    for sh in paneles:
        coloca(sh._element, px, alto=fondo - 332)
    print(f"  panel: 332 → {round(fondo)} (antes 1136)")

    prs.save(SALIDA)
    print("✓", SALIDA)


if __name__ == "__main__":
    main()
