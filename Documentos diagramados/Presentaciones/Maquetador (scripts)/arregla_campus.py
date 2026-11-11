#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tres arreglos en la presentación de Vida en el Campus.

1. La frase de la lámina 2, que Tito reescribió: la casa pasa a ser un hogar.
2. La lámina 4 deja de indizar las subdimensiones y describe cada dimensión,
   con la columna entera subida de cuerpo —el índice iba en 7,5 y no se leía—.
3. Salen las láminas 10, 11 y 12 (anatomía del criterio, escala y
   clasificación) y se renumera el pie de todas las que quedan.

El cuerpo de la descripción queda en 11 pt, el mismo del Referencial: con 12
la descripción más larga pedía trece líneas y solo caben doce, y acortarla
más le quitaba el remate, que es lo que la hace valer la pena.

Uso: python3 arregla_campus.py <es|pt> <entrada.pptx> <salida.pptx>
"""
import sys, re, copy, importlib
from pptx import Presentation
from PIL import ImageFont

LANG, ENTRADA, SALIDA = sys.argv[1], sys.argv[2], sys.argv[3]
D = importlib.import_module("dims_" + LANG)
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
FUENTES = "/Users/titogoicocheam/Library/Fonts/"

NOMBRE, CIFRAS, CUERPO = 1050, 900, 1100      # antes: 79 · 75 · 75
INTER_NOMBRE, INTER_CIFRAS, INTER_CUERPO = 1300, 1150, 1430
Y_NOMBRE = 440.0
AIRE_CIFRAS, AIRE_CUERPO = 10.0, 26.0
PIE_PANEL = 1070.0      # el panel acaba en 1092
MERMA = 45.0            # PowerPoint parte la línea antes que PIL
SUELO = 34.0            # lo que respira el panel bajo la última línea
# Las tres que salen se buscan por su título, no por su número: en portugués
# Tito ya las había borrado a mano y quitar la décima se llevaba el cierre.
FUERA = {"es": ("CÓMO SE LEE CADA CRITERIO", "ESCALA DE LOGRO", "CLASIFICACIÓN"),
         "pt": ("COMO SE LÊ CADA CRITÉRIO", "ESCALA DE ALCANCE", "CLASSIFICAÇÃO")}


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


def viste(elemento, cuerpo=None, interlinea=None, texto=None):
    if cuerpo is not None:
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


def quita_laminas(prs, marcas):
    """python-pptx no borra láminas: hay que sacarlas de la lista y soltar su
    relación. Se buscan por el rótulo que llevan en la banda de título."""
    fuera = [n for n, lam in enumerate(prs.slides)
             if any(m in sh.text_frame.text.upper()
                    for sh in lam.shapes if sh.has_text_frame
                    for m in marcas)]
    assert len(fuera) in (0, 3), [n + 1 for n in fuera]
    ids = prs.slides._sldIdLst
    for n in sorted(fuera, reverse=True):
        entrada = list(ids)[n]
        prs.part.drop_rel(entrada.rId)
        ids.remove(entrada)
    return fuera


def frase(prs):
    """La cita en Niconne de la lámina 2, que es la que da identidad."""
    lam = prs.slides[1]
    citas = [sh for sh in lam.shapes if sh.has_text_frame
             for r in sh.text_frame.paragraphs[0].runs
             if r.font.name == "Niconne"]
    assert len(citas) == 1, len(citas)
    viste(citas[0]._element, texto=D.FRASE)
    print("  lámina 2 ·", D.FRASE[:52], "…")


def esquema(prs, px):
    """Las cinco columnas de la lámina 4."""
    lam = prs.slides[3]
    arbol = lam.shapes._spTree

    def en(y, ancho):
        return sorted((sh for sh in lam.shapes
                       if sh.has_text_frame
                       and abs(sh.width / px - ancho) < 2
                       and abs(sh.top / px - y) < 3), key=lambda s: s.left)

    nombres, cifras = en(Y_NOMBRE, 426), en(474, 426)
    assert len(nombres) == len(cifras) == 5, (len(nombres), len(cifras))

    # el índice: los cuadros de 410 px que cuelgan bajo las cifras
    columnas = {}
    for sh in lam.shapes:
        if sh.has_text_frame and abs(sh.width / px - 410) < 2 and sh.top / px > 495:
            columnas.setdefault(round(sh.left / px), []).append(sh)
    izquierdas = sorted(columnas)
    assert len(izquierdas) == 5, izquierdas

    # 1 · encabezado: el nombre manda, las cifras van por debajo
    mide_nombre = medidor("Montserrat-SemiBold.ttf", NOMBRE)
    alto_nombre = 0.0
    for sh in nombres:
        viste(sh._element, NOMBRE, INTER_NOMBRE)
        alto = mide_nombre(sh.text_frame.text, 426 - MERMA) * INTER_NOMBRE / 100 / 0.375
        coloca(sh._element, px, alto=alto)
        alto_nombre = max(alto_nombre, alto)
    y_cifras = Y_NOMBRE + alto_nombre + AIRE_CIFRAS
    for sh in cifras:
        viste(sh._element, CIFRAS)
        coloca(sh._element, px, y=y_cifras, alto=INTER_CIFRAS / 100 / 0.375)

    # 2 · un solo cuadro de prosa por columna
    arranque = y_cifras + INTER_CIFRAS / 100 / 0.375 + AIRE_CUERPO
    hueco = PIE_PANEL - arranque
    mide = medidor("Lato-Light.ttf", CUERPO)
    altos = []
    print(f"  lámina 4 · nombre {round(alto_nombre)} px · cuerpo desde "
          f"y={round(arranque)}, hueco {round(hueco)} px")
    for n, x in enumerate(izquierdas, start=1):
        grupo = sorted(columnas[x], key=lambda s: s.top)
        molde = copy.deepcopy(grupo[0]._element)
        for sh in grupo:
            arbol.remove(sh._element)
        texto = D.DESCRIPCION[n]
        filas = mide(texto, 410 - MERMA)
        alto = filas * INTER_CUERPO / 100 / 0.375
        assert alto <= hueco, (n, alto, hueco)
        viste(molde, CUERPO, INTER_CUERPO, texto)
        coloca(molde, px, y=arranque, alto=alto)
        altos.append(alto)
        arbol.append(molde)
        print(f"    dim. {n}: {len(texto)} car. · {filas} líneas · {round(alto)} px")

    # el panel se recorta hasta la descripción más larga
    fondo = arranque + max(altos) + SUELO
    paneles = [sh for sh in lam.shapes
               if abs(sh.width / px - 442) < 2 and abs(sh.top / px - 330) < 3]
    assert len(paneles) == 5, len(paneles)
    for sh in paneles:
        coloca(sh._element, px, alto=fondo - 330)
    print(f"    panel: 330 → {round(fondo)} (antes 1092)")


def renumera(prs):
    """El pie decía «/ 13» en todas: hay que rehacerlo con las que quedan."""
    total = len(prs.slides)
    patron = re.compile(r"^\s*\d+\s*/\s*\d+\s*$")
    for n, lam in enumerate(prs.slides, start=1):
        for sh in lam.shapes:
            if sh.has_text_frame and patron.match(sh.text_frame.text):
                viste(sh._element, texto=f"{n:02d} / {total:02d}")
    print(f"  pie renumerado sobre {total} láminas")


def main():
    prs = Presentation(ENTRADA)
    px = prs.slide_width / 2560
    frase(prs)
    esquema(prs, px)
    sobran = quita_laminas(prs, FUERA[LANG])
    print(f"  fuera las láminas {[n + 1 for n in sobran]}" if sobran
          else "  las láminas 10-12 ya no estaban")
    renumera(prs)
    prs.save(SALIDA)
    print("✓", SALIDA)


if __name__ == "__main__":
    main()
