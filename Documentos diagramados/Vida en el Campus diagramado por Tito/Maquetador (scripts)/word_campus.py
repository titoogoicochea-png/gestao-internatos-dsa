#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""El Formulario de Vida en el Campus en Word, con el diseño del diagramado.

No es una conversión del PDF: se compone desde doc_<lang>.py, la misma fuente
que usó el maquetador, de modo que el texto es idéntico y el diseño se traduce
a lo que Word sabe hacer —misma página de 205 × 275 mm, misma caja, mismos
colores por dimensión, mismas bandas y el criterio como un bloque de tabla—.

Lo que no puede ser nativo va como imagen: la portada, que es arte a sangre.
Todo lo demás es texto y tablas que se pueden editar.

Uso: python3 word_campus.py <es|pt> <salida.docx>
"""
import sys, os, importlib, copy
from docx import Document
from docx.shared import Pt, Mm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import diseno_form as DF

AQUI = os.path.dirname(os.path.abspath(__file__))

# ── la página del diagramado ───────────────────────────────────────────────
PAG_ANCHO, PAG_ALTO = 581.1, 779.5          # puntos, los del PDF
IZQ, DER = 62.36, 581.1 - 518.0             # márgenes izquierdo y derecho
SUP, INF = 88.0, 49.5
CAJA = 518.0 - 62.36                        # 455.64 pt de ancho de texto

# Los nombres tienen que ser familias instaladas de verdad, no estilos: pedir
# «Lato Light» trae la Hairline, y «Montserrat» o «Montserrat SemiBold» traen la
# Thin, porque la Montserrat del sistema es variable y su instancia por defecto
# es esa. De ahí que el cuerpo vaya en Lato Regular y no en la Light del
# diagramado: es el peso más próximo que se resuelve igual en todas partes.
TITULO_F = "Montserrat ExtraBold"
ROTULO_F = "Montserrat Medium"
MONT_F = "Montserrat Medium"
CUERPO_F = "Lato"
NEGRA_F = "Lato"
SCRIPT_F = "Niconne"

GRIS = "3B3B3B"
GRIS_CLARO = "8A8A8A"
AZUL = "0F3282"
NARANJA = "F0825A"
FILETE = "C9D6E8"


def hx(c):
    """De la terna 0–1 de diseno_form al hexadecimal que quiere Word."""
    return "".join(f"{round(v * 255):02X}" for v in c)


# ── utilidades de bajo nivel ───────────────────────────────────────────────
def _el(etiqueta, **attrs):
    e = OxmlElement(etiqueta)
    for k, v in attrs.items():
        e.set(qn("w:" + k), str(v))
    return e


def sombrea(elemento, color):
    """Relleno de un párrafo o de una celda."""
    pr = elemento.get_or_add_tcPr() if elemento.tag.endswith("}tc") else \
        elemento.get_or_add_pPr()
    pr.append(_el("w:shd", val="clear", color="auto", fill=color))


def bordes(tc, color=FILETE, grosor=4, lados="tblr", izq_color=None, izq_grosor=None):
    """Filetes de una celda, en octavos de punto."""
    pr = tc.get_or_add_tcPr()
    b = OxmlElement("w:tcBorders")
    nombres = {"t": "top", "b": "bottom", "l": "left", "r": "right"}
    for k, n in nombres.items():
        e = _el("w:" + n, val="single" if k in lados else "nil",
                sz=grosor, space=0, color=color)
        if k == "l" and izq_color:
            e.set(qn("w:color"), izq_color)
            e.set(qn("w:sz"), str(izq_grosor or grosor))
            e.set(qn("w:val"), "single")
        b.append(e)
    pr.append(b)


def margen_celda(tc, izq=70, der=70, sup=40, inf=40):
    pr = tc.get_or_add_tcPr()
    m = OxmlElement("w:tcMar")
    for n, v in (("top", sup), ("left", izq), ("bottom", inf), ("right", der)):
        m.append(_el("w:" + n, w=v, type="dxa"))
    pr.append(m)


def sin_espacio(p, antes=0, despues=0, interlinea=None):
    pf = p.paragraph_format
    pf.space_before = Pt(antes)
    pf.space_after = Pt(despues)
    if interlinea:
        pf.line_spacing = Pt(interlinea)
    return p


def corre(p, texto, fuente=CUERPO_F, cuerpo=10, color=GRIS, negrita=False,
          cursiva=False, versal=False):
    r = p.add_run(texto)
    r.font.name = fuente
    r.font.size = Pt(cuerpo)
    r.font.color.rgb = RGBColor.from_string(color)
    r.bold = negrita
    r.italic = cursiva
    rpr = r._element.get_or_add_rPr()
    for et in ("rFonts",):
        f = rpr.find(qn("w:" + et))
        if f is None:
            f = OxmlElement("w:rFonts"); rpr.append(f)
        for a in ("ascii", "hAnsi", "cs", "eastAsia"):
            f.set(qn("w:" + a), fuente)
    if versal:
        rpr.append(_el("w:spacing", val=20))
    return r


MARCAS = ("***", "**", "*")


def rico(p, texto, fuente=CUERPO_F, cuerpo=10, color=GRIS, negra=NEGRA_F):
    """Escribe markdown sencillo: **negrita** y *cursiva*."""
    import re
    partes = re.split(r"(\*\*\*.+?\*\*\*|\*\*.+?\*\*|\*[^*\n]+?\*)", texto, flags=re.S)
    for t in partes:
        if not t:
            continue
        if t.startswith("***") and t.endswith("***"):
            corre(p, t[3:-3], negra, cuerpo, color, negrita=True, cursiva=True)
        elif t.startswith("**") and t.endswith("**"):
            corre(p, t[2:-2], negra, cuerpo, color, negrita=True)
        elif t.startswith("*") and t.endswith("*") and len(t) > 2:
            corre(p, t[1:-1], fuente, cuerpo, color, cursiva=True)
        else:
            corre(p, t, fuente, cuerpo, color)
    return p


# ── la página ──────────────────────────────────────────────────────────────
def mide(sec, margenes=True):
    sec.page_width, sec.page_height = Pt(PAG_ANCHO), Pt(PAG_ALTO)
    if margenes:
        sec.left_margin, sec.right_margin = Pt(IZQ), Pt(DER)
        sec.top_margin, sec.bottom_margin = Pt(SUP), Pt(INF)
        sec.header_distance, sec.footer_distance = Pt(42), Pt(24)
    else:
        for a in ("left_margin", "right_margin", "top_margin", "bottom_margin",
                  "header_distance", "footer_distance", "gutter"):
            setattr(sec, a, Pt(0))


def campo(p, instruccion):
    """Un campo de Word —PAGE, TOC—, que se actualiza al abrir el documento."""
    r = p.add_run()
    r._element.append(_el("w:fldChar", fldCharType="begin"))
    t = OxmlElement("w:instrText")
    t.set(qn("xml:space"), "preserve")
    t.text = instruccion
    r2 = p.add_run(); r2._element.append(t)
    r3 = p.add_run(); r3._element.append(_el("w:fldChar", fldCharType="separate"))
    r4 = p.add_run("1")
    r5 = p.add_run(); r5._element.append(_el("w:fldChar", fldCharType="end"))
    return r4


def cabecera(sec, titulo, verso):
    """El folio corrido: par a la izquierda con la marca, impar con el título."""
    for cab, par in ((sec.even_page_header, True), (sec.header, False)):
        p = cab.paragraphs[0]
        sin_espacio(p)
        pf = p.paragraph_format
        # el estilo Header trae un tabulador centrado y otro a la derecha: con
        # ellos el folio se iba al centro de la página
        ppr = p._p.get_or_add_pPr()
        viejos = ppr.find(qn("w:tabs"))
        if viejos is not None:
            ppr.remove(viejos)
        pf.left_indent = Pt(0)
        pf.right_indent = Pt(0)
        # sin tabuladores: el verso se alinea a la izquierda y el recto a la
        # derecha. Un tabulador a la derecha dependía del estilo Header y no
        # llegaba al margen.
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT if par else WD_ALIGN_PARAGRAPH.RIGHT
        if par:
            r = campo(p, " PAGE ")
            r.font.name, r.font.size = NEGRA_F, Pt(8.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor.from_string(AZUL)
            corre(p, "    ", MONT_F, 8.5, NARANJA)
            for txt, neg in verso:
                corre(p, txt, MONT_F, 8.5, NARANJA, negrita=neg)
        else:
            corre(p, titulo + "    ", CUERPO_F, 8.5, NARANJA)
            r = campo(p, " PAGE ")
            r.font.name, r.font.size = NEGRA_F, Pt(8.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor.from_string(AZUL)


# ── piezas del diseño ──────────────────────────────────────────────────────
def banda_seccion(doc, rotulo, titulo, pal, cola=None, nivel=1):
    """La apertura de sección o de dimensión: bloque de color, título en blanco."""
    osc, med, cla = [hx(c) for c in pal]
    if rotulo or cola:
        p = doc.add_paragraph()
        sin_espacio(p, 10, 0, 13)
        sombrea(p._p, osc)
        p.paragraph_format.tab_stops.add_tab_stop(Pt(CAJA - 12), WD_TAB_ALIGNMENT.RIGHT)
        p.paragraph_format.left_indent = Pt(12)
        p.paragraph_format.right_indent = Pt(12)
        corre(p, rotulo or "", ROTULO_F, 9, "FFFFFF", versal=True)
        if cola:
            corre(p, "\t" + cola, MONT_F, 8.5, "FFFFFF")
    p = doc.add_paragraph(style=f"Heading {nivel}")
    sin_espacio(p, 0 if (rotulo or cola) else 10, 14, 26)
    sombrea(p._p, osc)
    p.paragraph_format.left_indent = Pt(12)
    p.paragraph_format.right_indent = Pt(12)
    corre(p, titulo, TITULO_F, 20, "FFFFFF")
    return p


def banda(doc, texto, pal, cola=None, fondo=1, cuerpo=10.5, nivel=2):
    """Banda menor: subtítulo de bloque o total de dimensión."""
    col = hx(pal[fondo])
    p = doc.add_paragraph(style=f"Heading {nivel}") if nivel else doc.add_paragraph()
    sin_espacio(p, 10, 8, cuerpo + 5)
    sombrea(p._p, col)
    p.paragraph_format.left_indent = Pt(10)
    p.paragraph_format.right_indent = Pt(10)
    # la cifra va en línea y no en un tabulador a la derecha: con un nombre
    # largo el tabulador la empujaba a una segunda línea, suelta
    corre(p, texto, ROTULO_F, cuerpo, "FFFFFF")
    if cola:
        corre(p, "   ·   " + cola, MONT_F, 8.5, "FFFFFF")
    return p


def parrafo(doc, texto, cuerpo=10, color=GRIS, justificar=True, antes=0, despues=5,
            fuente=CUERPO_F, interlinea=13.4):
    p = doc.add_paragraph()
    sin_espacio(p, antes, despues, interlinea)
    if justificar:
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    rico(p, texto, fuente, cuerpo, color)
    return p


def nota(doc, texto, pal):
    """El recuadro de orientación al evaluador: fondo claro y filete de color."""
    osc, med, cla = [hx(c) for c in pal]
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    t.autofit = False
    celda = t.cell(0, 0)
    celda.width = Pt(CAJA)
    sombrea(celda._tc, cla)
    bordes(celda._tc, color=cla, lados="tbr", izq_color=med, izq_grosor=24)
    margen_celda(celda._tc, izq=150, der=150, sup=110, inf=110)
    p = celda.paragraphs[0]
    sin_espacio(p, 0, 0, 11)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    rico(p, texto, CUERPO_F, 8.6, GRIS)
    fija(t, [CAJA], junta=True, sangria=150)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return t


# ── tablas ─────────────────────────────────────────────────────────────────
def anchos_de(filas, ncol):
    """Reparte el ancho como lo hace el diagramado: a cada columna lo que pide,
    con un mínimo para las que solo se rellenan a mano."""
    RELLENO = 76.0
    peso, minimo = [], []
    for c in range(ncol):
        largo = max((len(f[c]) if c < len(f) else 0) for f in filas) or 1
        vacia = all(not (f[c].strip() if c < len(f) else "") for f in filas[1:])
        peso.append(max(largo, 8))
        minimo.append(RELLENO if vacia else 46.0)
    total = sum(peso)
    anchos = [max(minimo[c], CAJA * peso[c] / total) for c in range(ncol)]
    k = CAJA / sum(anchos)
    return [a * k for a in anchos]


def tabla(doc, filas, pal, cuerpo=9.0, cabecera_negrita=True):
    """Tabla con la cabecera en el color medio y cebrado en el claro."""
    osc, med, cla = [hx(c) for c in pal]
    ncol = max(len(f) for f in filas)
    textos = [[(c["t"] if isinstance(c, dict) else c) for c in f] for f in filas]
    anchos = anchos_de(textos, ncol)
    t = doc.add_table(rows=len(filas), cols=ncol)
    t.autofit = False
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    repite_cabecera(t.rows[0])
    for i, fila in enumerate(textos):
        for c in range(ncol):
            celda = t.cell(i, c)
            celda.width = Pt(anchos[c])
            margen_celda(celda._tc, izq=90, der=90, sup=60, inf=60)
            if i == 0:
                sombrea(celda._tc, med)
                bordes(celda._tc, color=med, grosor=6)
            else:
                if i % 2 == 0:
                    sombrea(celda._tc, cla)
                bordes(celda._tc)
            p = celda.paragraphs[0]
            sin_espacio(p, 0, 0, cuerpo + 2)
            txt = fila[c] if c < len(fila) else ""
            rico(p, txt, CUERPO_F, cuerpo - (0.6 if i == 0 else 0),
                 "FFFFFF" if i == 0 else GRIS)
            if i == 0 and cabecera_negrita:
                for r in p.runs:
                    r.bold = True
                    r.font.name = NEGRA_F
    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    return t


def fija(t, anchos, junta=False, sangria=0):
    """Fija el ancho de la tabla en Word.

    No basta con `autofit = False` ni con poner el ancho de cada celda: si la
    tabla no declara `tblW`, `tblInd` y un `tblLayout` fijo, y si la rejilla no
    trae las mismas medidas, Word la reparte a su gusto y se sale del margen.
    Con `junta` se le prohíbe además partir una fila entre dos páginas.

    `sangria` es el margen izquierdo de la primera celda, en vigésimos de punto:
    Word coloca el filete de la tabla ese tanto a la izquierda del margen, así
    que hay que devolvérselo o la tabla no cuadra con el texto de al lado.
    """
    total = sum(anchos)
    pr = t._tbl.tblPr
    for etiqueta in ("tblW", "tblLayout", "tblInd"):
        viejo = pr.find(qn("w:" + etiqueta))
        if viejo is not None:
            pr.remove(viejo)
    pr.append(_el("w:tblW", w=int(total * 20), type="dxa"))
    pr.append(_el("w:tblLayout", type="fixed"))
    pr.append(_el("w:tblInd", w=int(sangria), type="dxa"))
    rejilla = t._tbl.find(qn("w:tblGrid"))
    if rejilla is not None:
        t._tbl.remove(rejilla)
    rejilla = OxmlElement("w:tblGrid")
    for a in anchos:
        rejilla.append(_el("w:gridCol", w=int(a * 20)))
    pr.addnext(rejilla)
    for fila in t.rows:
        if junta:
            fila._tr.get_or_add_trPr().append(_el("w:cantSplit", val="true"))
        for c, celda in enumerate(fila.cells):
            if c < len(anchos):
                celda.width = Pt(anchos[c])
    return t


def pega(t, salvo_ultima=True):
    """Mantiene la tabla entera en una página: cada párrafo arrastra al siguiente."""
    filas = list(t.rows)
    for i, fila in enumerate(filas):
        if salvo_ultima and i == len(filas) - 1:
            continue
        for celda in fila.cells:
            for p in celda.paragraphs:
                p.paragraph_format.keep_with_next = True


def repite_cabecera(fila):
    pr = fila._tr.get_or_add_trPr()
    pr.append(_el("w:tblHeader", val="true"))


# ── el bloque de criterio ──────────────────────────────────────────────────
def niveles_de(puntos):
    import math
    aa = math.ceil(0.75 * puntos)
    pa = math.ceil(0.50 * puntos)
    return [f"☐ AP {puntos}", f"☐ AA {aa}-{puntos - 1}  ____",
            f"☐ PA {pa}-{aa - 1}  ____", f"☐ NA 0-{pa - 1}  ____"]


def criterio(doc, num, enunciado, evidencias, puntos, pal, rot):
    """El criterio entero en una sola tabla: banda, evidencias y pie.

    En el diagramado son tres piezas apiladas; aquí van en una tabla de tres
    columnas con las filas combinadas donde hace falta, que es como Word
    mantiene los filetes alineados.
    """
    osc, med, cla = [hx(c) for c in pal]
    COL = (CAJA * 0.335, CAJA * 0.3325, CAJA * 0.3325)
    n = len(evidencias)
    # banda + cabecera + n evidencias + nivel de logro + observación
    t = doc.add_table(rows=4 + n, cols=3)
    t.autofit = False
    t.alignment = WD_TABLE_ALIGNMENT.LEFT

    # banda del enunciado: dos celdas, no un tabulador a la derecha. Con el
    # enunciado largo el tabulador se iba a la línea siguiente y la cifra
    # quedaba pegada al texto.
    PTS = 74.0
    fila = t.rows[0]
    izquierda = fila.cells[0].merge(fila.cells[1])
    izquierda.width = Pt(CAJA - PTS)
    derecha = fila.cells[2]
    derecha.width = Pt(PTS)
    sombrea(izquierda._tc, cla)
    sombrea(derecha._tc, cla)
    bordes(izquierda._tc, color=med, grosor=6, lados="tbl",
           izq_color=osc, izq_grosor=30)
    bordes(derecha._tc, color=med, grosor=6, lados="tbr")
    margen_celda(izquierda._tc, izq=110, der=40, sup=70, inf=70)
    margen_celda(derecha._tc, izq=0, der=110, sup=70, inf=70)
    p = izquierda.paragraphs[0]
    sin_espacio(p, 0, 0, 12)
    corre(p, f"{num}   ", ROTULO_F, 10.5, osc)
    corre(p, enunciado, NEGRA_F, 9.5, GRIS, negrita=True)
    p = derecha.paragraphs[0]
    sin_espacio(p, 0, 0, 12)
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    corre(p, f"{puntos} {rot['puntos'].lower()}", MONT_F, 8.5, osc)

    # cabecera de las tres columnas
    rotulos = (rot["evidencias"], rot["detalle"], rot["documentos"])
    for c in range(3):
        celda = t.cell(1, c)
        celda.width = Pt(COL[c])
        sombrea(celda._tc, med)
        bordes(celda._tc, color=med, grosor=6)
        margen_celda(celda._tc, izq=90, der=90, sup=40, inf=40)
        p = celda.paragraphs[0]
        sin_espacio(p, 0, 0, 9)
        corre(p, rotulos[c], ROTULO_F, 6.6, "FFFFFF", versal=True)

    # las evidencias
    for k, ev in enumerate(evidencias):
        for c in range(3):
            celda = t.cell(2 + k, c)
            celda.width = Pt(COL[c])
            if k % 2 == 1:
                sombrea(celda._tc, cla)
            bordes(celda._tc)
            margen_celda(celda._tc, izq=90, der=90, sup=60, inf=60)
            p = celda.paragraphs[0]
            sin_espacio(p, 0, 0, 11)
            corre(p, ev[c], CUERPO_F, 9, GRIS)

    # el pie: nivel de logro y observación
    ETQ = 92.0
    for k, (rotulo, contenido) in enumerate((
            (rot["nivel"], niveles_de(int(puntos))),
            (rot["observacion"], None))):
        f = t.rows[2 + n + k]
        izquierda = f.cells[0]
        izquierda.width = Pt(ETQ)
        derecha = f.cells[1].merge(f.cells[2])
        derecha.width = Pt(CAJA - ETQ)
        for celda in (izquierda, derecha):
            if k == 0:
                sombrea(celda._tc, cla)
            bordes(celda._tc)
            margen_celda(celda._tc, izq=90, der=90, sup=55, inf=55)
        p = izquierda.paragraphs[0]
        sin_espacio(p, 0, 0, 9)
        corre(p, rotulo, ROTULO_F, 6.6, osc if k == 0 else GRIS_CLARO, versal=True)
        p = derecha.paragraphs[0]
        sin_espacio(p, 0, 0, 10)
        if contenido:
            paso = (CAJA - ETQ - 52) / len(contenido)
            for j, nivel in enumerate(contenido):
                if j:
                    p.paragraph_format.tab_stops.add_tab_stop(Pt(paso * j))
                    corre(p, "\t", CUERPO_F, 7.2, GRIS)
                corre(p, nivel, NEGRA_F, 7.2, GRIS)
        else:
            corre(p, "." * 120, CUERPO_F, 7.6, "9BA7B8")
    # el criterio no se parte: ni una fila a caballo ni el pie en otra página
    fija(t, list(COL), junta=True, sangria=110)
    anchura_banda(t, PTS)
    pega(t)
    doc.add_paragraph().paragraph_format.space_after = Pt(8)
    return t


def anchura_banda(t, pts):
    """La banda y el pie llevan celdas combinadas: su ancho se declara aparte."""
    for fila, anchos in ((t.rows[0], (CAJA - pts, pts)),
                         (t.rows[-2], (92.0, CAJA - 92.0)),
                         (t.rows[-1], (92.0, CAJA - 92.0))):
        for c, celda in enumerate(fila.cells):
            if c < len(anchos):
                celda.width = Pt(anchos[c])


# ── el frente del documento ────────────────────────────────────────────────
def portada(doc, jpg):
    """El arte de portada, a sangre: es lo único que no puede ser nativo."""
    sec = doc.sections[0]
    mide(sec, margenes=False)
    p = doc.add_paragraph()
    sin_espacio(p)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(jpg, width=Pt(PAG_ANCHO), height=Pt(PAG_ALTO))


def portadilla(doc, DOC, T, lang, logo):
    """La portadilla blanca: División, título, nivel, la cita y el logotipo."""
    p = doc.add_paragraph(); sin_espacio(p, 0, 0, 12)
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    corre(p, "DIVISIÓN SUDAMERICANA" if lang == "es" else "DIVISÃO SUL-AMERICANA",
          ROTULO_F, 9, "0AB4D2", versal=True)
    p = doc.add_paragraph(); sin_espacio(p, 0, 70, 12)
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    corre(p, "Departamento de Educación" if lang == "es" else "Departamento de Educação",
          ROTULO_F, 9, "2E75B6")
    l1, l2, l3, l4 = DOC.TITULO
    p = doc.add_paragraph(); sin_espacio(p, 0, 6, 26)
    corre(p, l1, MONT_F, 19, "1F3864")
    for ln in (l2, l3):
        p = doc.add_paragraph(); sin_espacio(p, 0, 4, 36)
        corre(p, ln, TITULO_F, 28, "1F3864")
    p = doc.add_paragraph(); sin_espacio(p, 0, 16, 34)
    corre(p, l4, MONT_F, 26, "1F3864")
    regla(doc)
    p = doc.add_paragraph(); sin_espacio(p, 10, 90, 18)
    corre(p, DOC.NIVEL, ROTULO_F, 13, NARANJA)
    p = doc.add_paragraph(); sin_espacio(p, 0, 0, 17)
    corre(p, DOC.CITA_PORTADILLA, SCRIPT_F, 14, "0AB4D2")
    p = doc.add_paragraph(); sin_espacio(p, 150, 0)
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    if os.path.exists(logo):
        p.add_run().add_picture(logo, width=Pt(120))
    doc.add_page_break()


def regla(doc, largo=(0x1F3864, 0x0AB4D2, 0xF0825A), ancho=96.0):
    """La regla tricolor, como tres celdas de una tabla sin filetes."""
    t = doc.add_table(rows=1, cols=3)
    t.autofit = False
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    for c, col in enumerate(largo):
        celda = t.cell(0, c)
        celda.width = Pt(ancho / 3)
        sombrea(celda._tc, f"{col:06X}")
        bordes(celda._tc, lados="")
        margen_celda(celda._tc, izq=0, der=0, sup=0, inf=0)
        p = celda.paragraphs[0]
        sin_espacio(p, 0, 0, 3)
        corre(p, " ", CUERPO_F, 2.5, "FFFFFF")
    fija(t, [ancho / 3] * 3)
    return t


def creditos(doc, T, lang):
    """Los mismos créditos del diagramado, a dos columnas donde van a dos."""
    def linea(etiqueta, valor, cuerpo=8.0, antes=0):
        p = doc.add_paragraph(); sin_espacio(p, antes, 1.5, 10.4)
        corre(p, etiqueta + ": ", NEGRA_F, cuerpo, "000000", negrita=True)
        corre(p, valor, CUERPO_F, cuerpo, GRIS)

    p = doc.add_paragraph(); sin_espacio(p, 0, 2, 16)
    corre(p, "Iglesia Adventista del Séptimo Día" if lang == "es"
          else "Igreja Adventista do Sétimo Dia", NEGRA_F, 13, "1F3864", negrita=True)
    p = doc.add_paragraph(); sin_espacio(p, 0, 10, 12)
    corre(p, "DIVISIÓN SUDAMERICANA" if lang == "es" else "DIVISÃO SUL-AMERICANA",
          ROTULO_F, 8.5, "2E75B6", versal=True)
    for etiqueta, valor in T.ADMIN[lang]:
        linea(etiqueta, valor)
    for titulo, lista in ((T.CRED[lang]["uniones"], T.UNIONES[lang]),
                          (T.CRED[lang]["rectores"], T.RECTORES)):
        p = doc.add_paragraph(); sin_espacio(p, 9, 3, 11)
        corre(p, titulo, NEGRA_F, 8.4, "000000", negrita=True)
        dos_columnas(doc, lista)
    for etiqueta, cuerpo in T.bloques(lang):
        p = doc.add_paragraph(); sin_espacio(p, 9, 2, 11)
        corre(p, etiqueta, NEGRA_F, 8.4, "000000", negrita=True)
        p = doc.add_paragraph(); sin_espacio(p, 0, 0, 10.4)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        corre(p, cuerpo, CUERPO_F, 7.8, GRIS)
    doc.add_page_break()


def dos_columnas(doc, lista):
    """Una lista larga repartida en dos columnas, sin filetes.

    Es lo que hace el impreso con las uniones y los rectores; en una sola
    columna los créditos se iban a una segunda página casi vacía.
    """
    corte = (len(lista) + 1) // 2
    t = doc.add_table(rows=1, cols=2)
    t.autofit = False
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    for c, trozo in enumerate((lista[:corte], lista[corte:])):
        celda = t.cell(0, c)
        celda.width = Pt(CAJA / 2)
        bordes(celda._tc, lados="")
        margen_celda(celda._tc, izq=0, der=120 if c == 0 else 0, sup=0, inf=0)
        primero = True
        for etiqueta, valor in trozo:
            p = celda.paragraphs[0] if primero else celda.add_paragraph()
            primero = False
            sin_espacio(p, 0, 1.5, 10.2)
            corre(p, etiqueta + ": ", NEGRA_F, 7.8, "000000", negrita=True)
            corre(p, valor, CUERPO_F, 7.8, GRIS)
    fija(t, [CAJA / 2, CAJA / 2])
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return t


def sumario(doc, DOC, T, lang):
    banda_seccion(doc, None, T.SUMARIO[lang], DF.PALETA[0], nivel=1)
    p = doc.add_paragraph(); sin_espacio(p, 0, 12, 12)
    corre(p, T.PISTA[lang].replace("Haz clic en cualquier ítem para ir directamente a la sección.",
                                   "Actualiza el índice con F9 para ver la paginación.")
          if lang == "es" else
          "Atualize o sumário com F9 para ver a paginação.",
          CUERPO_F, 9, GRIS_CLARO, cursiva=True)
    p = doc.add_paragraph(); sin_espacio(p, 0, 0, 13)
    campo(p, r' TOC \o "1-2" \h \z \u ')
    doc.add_page_break()


# ── el cuerpo ──────────────────────────────────────────────────────────────
def cuerpo_md(doc, md, pal, firma=False):
    bloques = [b.strip() for b in md.split("\n\n") if b.strip()]
    for s in bloques:
        if s.startswith("## "):
            p = doc.add_paragraph(style="Heading 2")
            sin_espacio(p, 12, 6, 17)
            corre(p, s[3:].strip(), ROTULO_F, 12.5, hx(pal[1]))
        elif firma and s.startswith("**Pr."):
            for i, linea in enumerate(s.split("\n")):
                parrafo(doc, linea.strip(), 10, GRIS, justificar=False,
                        antes=10 if i == 0 else 0, despues=0, interlinea=13)
        else:
            parrafo(doc, " ".join(s.split()), 10, GRIS, despues=5)


def bloques_de(doc, items, pal):
    for tipo, *resto in items:
        if tipo == "h3":
            banda(doc, resto[0], pal, cuerpo=10.5, nivel=2)
        elif tipo == "h4":
            p = doc.add_paragraph(style="Heading 3")
            sin_espacio(p, 10, 5, 14.5)
            corre(p, resto[0], ROTULO_F, 11, hx(pal[0]))
        elif tipo == "p":
            parrafo(doc, resto[0])
        elif tipo == "tabla":
            tabla(doc, resto[0], pal)
        elif tipo == "nota":
            nota(doc, resto[0], pal)


def parte_rotulo(txt):
    for sep in (":", "—"):
        if sep in txt:
            a, b = txt.split(sep, 1)
            if len(a) < 30:
                return a.strip(), b.strip()
    return None, txt


def componer(doc, DOC, T, lang, logo):
    INST = DF.PALETA[0]
    ROT = DOC.ROTULOS

    def seccion_md(md, firma=False):
        lineas = md.strip().split("\n")
        rot, titulo = parte_rotulo(lineas[0].lstrip("# ").strip())
        banda_seccion(doc, rot, titulo, INST)
        cuerpo_md(doc, "\n".join(lineas[1:]), INST, firma=firma)
        doc.add_page_break()

    seccion_md(DOC.JUSTIFICACION)
    seccion_md(DOC.PRESENTACION, firma=True)
    seccion_md(DOC.SECCION_I)

    rot, titulo = parte_rotulo(DOC.TITULOS["s2"])
    banda_seccion(doc, rot, titulo, INST)
    parrafo(doc, DOC.SECCION_II_ENTRADA, 9.6, GRIS_CLARO, despues=10,
            interlinea=12.6)
    for d in DOC.DIMENSIONES:
        pal = DF.PALETA[d["color"]]
        # el nombre corto: el largo arrastraba la cifra a una segunda línea
        banda(doc, f"{ROT['dimension']} {d['n']} — {d['corto']}", pal,
              cola=f"{d['puntos']} {ROT['puntos'].lower()}  ·  "
                   f"{len(d['criterios'])} {ROT['criterios'].lower()}", cuerpo=10.5)
        cuerpo_md(doc, d["descripcion"], pal)
        nota(doc, d["orientacion"], pal)
    doc.add_page_break()

    rot, titulo = parte_rotulo(DOC.TITULOS["s3"])
    banda_seccion(doc, rot, titulo, INST)
    mapa(doc, DOC, ROT)
    bloques_de(doc, DOC.SECCION_III_INFO, INST)
    bloques_de(doc, DOC.SECCION_III_ESCALA, INST)
    banda(doc, DOC.TITULOS["evaluacion"], INST, cuerpo=10.5)
    parrafo(doc, DOC.TITULOS["evaluacion_entrada"], 9.6, GRIS_CLARO, despues=8,
            interlinea=12.6)

    for d in DOC.DIMENSIONES:
        pal = DF.PALETA[d["color"]]
        doc.add_page_break()
        banda_seccion(doc, f"{ROT['dimension']} {d['n']}", d["nombre"], pal,
                      cola=f"{d['puntos']} {ROT['puntos'].lower()}  ·  "
                           f"{len(d['criterios'])} {ROT['criterios'].lower()}")
        nota(doc, d["orientacion"], pal)
        for c in d["criterios"]:
            criterio(doc, str(c["num"]), c["enunciado"], c["evidencias"],
                     str(c["puntos"]), pal, ROT)
        filas = [[f"**{ROT['meta']} (ILE/IVC) — {d['nombre']}**"]]
        for num, frase in d["meta"]:
            filas.append([f"**Crit. {num}**", f"*{frase}*"])
        tabla(doc, filas, pal, cuerpo=8.6)
        banda(doc, f"{ROT['total']} {ROT['dimension']} {d['n']} — {d['corto']}:  "
                   f"{d['puntos']} {ROT['puntos'].lower()}  ·  "
                   f"{len(d['criterios'])} {ROT['criterios'].lower()}",
              pal, fondo=0, cuerpo=9.5, nivel=0)

    for clave, items in (("s4", DOC.SECCION_IV), ("s5", DOC.SECCION_V),
                         ("s6", DOC.SECCION_VI)):
        doc.add_page_break()
        rot, titulo = parte_rotulo(DOC.TITULOS[clave])
        banda_seccion(doc, rot, titulo, INST)
        bloques_de(doc, items, INST)


def mapa(doc, DOC, ROT):
    """Las cinco dimensiones de un vistazo, cada una con su color."""
    p = doc.add_paragraph(); sin_espacio(p, 2, 6, 12)
    corre(p, ROT["mapa"], ROTULO_F, 9, GRIS_CLARO, versal=True)
    t = doc.add_table(rows=len(DOC.DIMENSIONES), cols=3)
    t.autofit = False
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    for i, d in enumerate(DOC.DIMENSIONES):
        osc, med, cla = [hx(c) for c in DF.PALETA[d["color"]]]
        anchos = (34.0, CAJA - 34.0 - 78.0, 78.0)
        for c in range(3):
            celda = t.cell(i, c)
            celda.width = Pt(anchos[c])
            sombrea(celda._tc, med if c == 0 else cla)
            bordes(celda._tc, color=cla, lados="tb", grosor=10)
            margen_celda(celda._tc, izq=70, der=70, sup=70, inf=70)
            p = celda.paragraphs[0]
            sin_espacio(p, 0, 0, 14)
            if c == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                corre(p, str(d["n"]), TITULO_F, 12, "FFFFFF")
            elif c == 1:
                corre(p, d["corto"], ROTULO_F, 9.3, osc)
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                corre(p, f"{d['puntos']}  ·  {len(d['criterios'])}", MONT_F, 8.5, osc)
    fija(t, [34.0, CAJA - 34.0 - 78.0, 78.0], junta=True, sangria=70)
    p = doc.add_paragraph(); sin_espacio(p, 6, 12, 11.6)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    corre(p, ROT["mapa_pie"], CUERPO_F, 9, GRIS_CLARO, cursiva=True)


# ── estilos y montaje ──────────────────────────────────────────────────────
def actualiza_campos(doc):
    """Marca los campos como sucios: Word rellena el índice al abrir el archivo."""
    doc.settings.element.append(_el("w:updateFields", val="true"))


def estilos(doc):
    """Los encabezados existen para que el índice los recoja; el aspecto lo
    pone cada párrafo, no el estilo."""
    normal = doc.styles["Normal"]
    normal.font.name = CUERPO_F
    normal.font.size = Pt(10)
    normal.font.color.rgb = RGBColor.from_string(GRIS)
    for n in (1, 2, 3):
        st = doc.styles[f"Heading {n}"]
        st.font.name = ROTULO_F
        st.font.color.rgb = RGBColor.from_string(GRIS)
        st.font.bold = False
        st.paragraph_format.keep_with_next = True


def main():
    lang, salida = sys.argv[1], sys.argv[2]
    DOC = importlib.import_module("doc_" + lang)
    T = importlib.import_module("textos")
    doc = Document()
    estilos(doc)
    doc.settings.odd_and_even_pages_header_footer = True
    portada(doc, os.path.join(AQUI, f"port_campus_{lang}.jpg"))

    # el frente —portadilla, créditos e índice— no lleva folio, como el impreso
    frente = doc.add_section(WD_SECTION.NEW_PAGE)
    mide(frente)
    for cab in (frente.header, frente.even_page_header):
        cab.is_linked_to_previous = False
    logo = os.path.join(AQUI, f"logo_doc_{lang}.png")
    portadilla(doc, DOC, T, lang, logo)
    creditos(doc, T, lang)
    sumario(doc, DOC, T, lang)

    sec = doc.add_section(WD_SECTION.NEW_PAGE)
    mide(sec)
    for cab in (sec.header, sec.even_page_header):
        cab.is_linked_to_previous = False
    cabecera(sec, " ".join(x[0] for x in DOC.CABECERA).strip(),
             [(x[0], x[1] == "montxbold") for x in DOC.CABECERA])
    componer(doc, DOC, T, lang, logo)
    actualiza_campos(doc)
    doc.save(salida)
    print(f"  ✓ {os.path.basename(salida)} · {os.path.getsize(salida)/1e6:.1f} MB")


if __name__ == "__main__":
    main()
