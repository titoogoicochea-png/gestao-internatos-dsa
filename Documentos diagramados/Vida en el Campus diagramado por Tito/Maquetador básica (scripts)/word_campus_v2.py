#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Segunda versión del Formulario de Vida en el Campus en Word.

Cambia respecto de la primera: no lleva sumario; la Sección III va directa a una
tabla consolidada por dimensión —dimensión, subdimensión, criterio, evidencia,
detalle y puntuación, el formato que pidió Tito—; salen las Secciones IV, V y
VI; y cierra con la contraportada, con el logotipo rehecho.

Reutiliza el motor de la primera versión (word_campus.py): la retícula, las
bandas, el recuadro de orientación y los créditos son los mismos.

Uso: python3 word_campus_v2.py <es|pt> <salida.docx>
"""
import sys, os, importlib
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION

import diseno_form as DF
import bloques_campus as BL
import word_campus as W
from word_campus import (CAJA, hx, sombrea, bordes, margen_celda, sin_espacio,
                         corre, rico, fija, repite_cabecera, mide, cabecera,
                         banda_seccion, nota, parrafo, estilos, portada,
                         portadilla, creditos, parte_rotulo, actualiza_campos,
                         ROTULO_F, NEGRA_F, CUERPO_F, MONT_F, GRIS, GRIS_CLARO)

AQUI = os.path.dirname(os.path.abspath(__file__))

# El reparto de columnas, medido sobre el modelo que mandó Tito y retocado: con
# el 8,7% de origen, «Puntuación» se partía en tres líneas en su cabecera, y la
# subdimensión cortaba «Acompañamiento» por la mitad.
COLS = (0.112, 0.147, 0.178, 0.226, 0.232, 0.105)

ENTRADA = {
 "es": "Cada dimensión se presenta en una sola tabla. A la izquierda, la "
       "dimensión y la subdimensión con su puntuación entre corchetes; después, "
       "el criterio de revisión, las evidencias que lo sustentan, el detalle que "
       "se espera de cada una y el puntaje máximo del criterio.",
 "pt": "Cada dimensão apresenta-se numa só tabela. À esquerda, a dimensão e a "
       "subdimensão com a sua pontuação entre colchetes; depois, o critério de "
       "revisão, as evidências que o sustentam, o detalhe que se espera de cada "
       "uma e a pontuação máxima do critério.",
}

ENCABEZADOS = {
    "es": ("Dimensión\n(Puntuación máxima)", "Subdimensión\n(Puntuación máxima)",
           "Criterios de Revisión", "Evidencias", "Detalle", "Puntuación\nmáxima"),
    "pt": ("Dimensão\n(Pontuação máxima)", "Subdimensão\n(Pontuação máxima)",
           "Critérios de Revisão", "Evidências", "Detalhe", "Pontuação\nmáxima"),
}


def celda_texto(celda, texto, cuerpo=7.6, color=GRIS, negrita=False,
                centrada=False, fuente=None, interlinea=9.6):
    p = celda.paragraphs[0]
    sin_espacio(p, 0, 0, interlinea)
    if centrada:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    primera = True
    for linea in texto.split("\n"):
        if not primera:
            p = celda.add_paragraph()
            sin_espacio(p, 0, 0, interlinea)
            if centrada:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        primera = False
        corre(p, linea, fuente or (NEGRA_F if negrita else CUERPO_F), cuerpo,
              color, negrita=negrita)


def tabla_dimension(doc, dim, lang, rot):
    """La dimensión entera en una tabla: una fila por evidencia.

    Las celdas de dimensión, subdimensión, criterio y puntuación se combinan
    hacia abajo, de modo que cada una se escribe una sola vez y se ve de qué
    bloque viene cada evidencia.
    """
    osc, med, cla = [hx(c) for c in DF.PALETA[dim["color"]]]
    bloques = BL.de(dim, lang)
    filas = sum(len(c["evidencias"]) for _, crits, _ in bloques for c in crits)
    anchos = [CAJA * f for f in COLS]
    t = doc.add_table(rows=filas + 1, cols=6)
    t.autofit = False
    t.alignment = WD_TABLE_ALIGNMENT.LEFT

    for c, rotulo in enumerate(ENCABEZADOS[lang]):
        celda = t.cell(0, c)
        sombrea(celda._tc, med)
        bordes(celda._tc, color=med, grosor=6)
        margen_celda(celda._tc, izq=60, der=60, sup=60, inf=60)
        celda_texto(celda, rotulo, 7.2, "FFFFFF", negrita=True, centrada=True,
                    fuente=ROTULO_F)
    repite_cabecera(t.rows[0])

    i = 1
    for rotulo, crits, puntos in bloques:
        primera_sub = i
        for c in crits:
            primera_crit = i
            for k, ev in enumerate(c["evidencias"]):
                for col in range(6):
                    celda = t.cell(i, col)
                    bordes(celda._tc, color=cla if col < 2 else "C9D6E8", grosor=4)
                    margen_celda(celda._tc, izq=60, der=60, sup=55, inf=55)
                    if col < 2:
                        sombrea(celda._tc, cla)
                if k == 0:
                    celda_texto(t.cell(i, 2), c["enunciado"], 7.6, GRIS)
                    celda_texto(t.cell(i, 5), str(c["puntos"]), 9, osc,
                                negrita=True, centrada=True)
                celda_texto(t.cell(i, 3), ev[0], 7.6, GRIS)
                celda_texto(t.cell(i, 4), ev[1], 7.6, GRIS)
                i += 1
            if i - primera_crit > 1:
                t.cell(primera_crit, 2).merge(t.cell(i - 1, 2))
                t.cell(primera_crit, 5).merge(t.cell(i - 1, 5))
        celda_texto(t.cell(primera_sub, 1), f"{rotulo}\n[{puntos}]", 7.2, osc,
                    negrita=True)
        if i - primera_sub > 1:
            t.cell(primera_sub, 1).merge(t.cell(i - 1, 1))
    celda_texto(t.cell(1, 0),
                f"{rot['dimension'].capitalize()} {dim['n']}\n{dim['corto'].capitalize()}"
                f"\n[{dim['puntos']}]", 7.8, osc, negrita=True)
    if filas > 1:
        t.cell(1, 0).merge(t.cell(filas, 0))
    fija(t, anchos, junta=True, sangria=60)
    return t


def componer(doc, DOC, T, lang):
    INST = DF.PALETA[0]
    ROT = DOC.ROTULOS

    def seccion_md(md, firma=False, cuerpo=10, interlinea=13.4):
        lineas = md.strip().split("\n")
        rot, titulo = parte_rotulo(lineas[0].lstrip("# ").strip())
        banda_seccion(doc, rot, titulo, INST)
        cuerpo_md(doc, "\n".join(lineas[1:]), INST, firma, cuerpo, interlinea)
        doc.add_page_break()

    def cuerpo_md(doc_, md, pal, firma=False, cuerpo=10, interlinea=13.4):
        bloques = [b.strip() for b in md.split("\n\n") if b.strip()]
        for s in bloques:
            if s.startswith("## "):
                p = doc_.add_paragraph(style="Heading 2")
                sin_espacio(p, 12, 6, interlinea + 4.5)
                corre(p, s[3:].strip(), ROTULO_F, cuerpo + 2.5, hx(pal[1]))
            elif firma and s.startswith("**Pr."):
                for i, linea in enumerate(s.split("\n")):
                    parrafo(doc_, linea.strip(), cuerpo, GRIS, justificar=False,
                            antes=16 if i == 0 else 0, despues=0,
                            interlinea=interlinea)
            else:
                parrafo(doc_, " ".join(s.split()), cuerpo, GRIS, despues=5,
                        interlinea=interlinea)

    seccion_md(DOC.JUSTIFICACION)
    # la presentación lleva cuerpo y entrelínea algo mayores: así llena la
    # página en vez de dejar un tercio en blanco
    seccion_md(DOC.PRESENTACION, firma=True, cuerpo=10.8, interlinea=15.3)
    seccion_md(DOC.SECCION_I)

    rot, titulo = parte_rotulo(DOC.TITULOS["s2"])
    banda_seccion(doc, rot, titulo, INST)
    parrafo(doc, DOC.SECCION_II_ENTRADA, 9.6, GRIS_CLARO, despues=10,
            interlinea=12.6)
    for d in DOC.DIMENSIONES:
        pal = DF.PALETA[d["color"]]
        banda = W.banda(doc, f"{ROT['dimension']} {d['n']} — {d['corto']}", pal,
                        cola=f"{d['puntos']} {ROT['puntos'].lower()}  ·  "
                             f"{len(d['criterios'])} {ROT['criterios'].lower()}",
                        cuerpo=10.5)
        desde = len(doc.paragraphs)
        cuerpo_md(doc, d["descripcion"], pal)
        # la banda y su texto arrastran al recuadro: así la orientación no se
        # queda sola en una página
        banda.paragraph_format.keep_with_next = True
        for p in doc.paragraphs[desde:]:
            p.paragraph_format.keep_with_next = True
        nota(doc, d["orientacion"], pal)
    doc.add_page_break()

    rot, titulo = parte_rotulo(DOC.TITULOS["s3"])
    banda_seccion(doc, rot, titulo, INST)
    parrafo(doc, ENTRADA[lang], 9.6, GRIS_CLARO, despues=10, interlinea=12.6)
    for k, d in enumerate(DOC.DIMENSIONES):
        if k:
            doc.add_page_break()
        tabla_dimension(doc, d, lang, ROT)


def main():
    lang, salida = sys.argv[1], sys.argv[2]
    DOC = importlib.import_module("doc_" + lang)
    T = importlib.import_module("textos")
    doc = Document()
    estilos(doc)
    doc.settings.odd_and_even_pages_header_footer = True
    portada(doc, os.path.join(AQUI, f"port_campus_{lang}.jpg"))

    frente = doc.add_section(WD_SECTION.NEW_PAGE)
    mide(frente)
    for cab in (frente.header, frente.even_page_header):
        cab.is_linked_to_previous = False
    logo = os.path.join(AQUI, f"logo_doc_{lang}.png")
    portadilla(doc, DOC, T, lang, logo)
    creditos(doc, T, lang)

    sec = doc.add_section(WD_SECTION.NEW_PAGE)
    mide(sec)
    for cab in (sec.header, sec.even_page_header):
        cab.is_linked_to_previous = False
    cabecera(sec, " ".join(x[0] for x in DOC.CABECERA).strip(),
             [(x[0], x[1] == "montxbold") for x in DOC.CABECERA])
    componer(doc, DOC, T, lang)

    # la contraportada, a sangre y sin folio
    fin = doc.add_section(WD_SECTION.NEW_PAGE)
    mide(fin, margenes=False)
    for cab in (fin.header, fin.even_page_header):
        cab.is_linked_to_previous = False
    p = doc.add_paragraph(); sin_espacio(p)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(os.path.join(AQUI, f"ppt/contra_{lang}.jpg"),
                            width=Pt(W.PAG_ANCHO), height=Pt(W.PAG_ALTO))

    actualiza_campos(doc)
    doc.save(salida)
    print(f"  ✓ {os.path.basename(salida)} · {os.path.getsize(salida)/1e6:.1f} MB")


if __name__ == "__main__":
    main()
