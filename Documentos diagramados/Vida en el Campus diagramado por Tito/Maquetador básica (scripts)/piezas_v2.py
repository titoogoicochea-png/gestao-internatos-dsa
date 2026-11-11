#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""La tabla consolidada por dimensión, para el maquetador.

Es el formato que pidió Tito: dimensión · subdimensión · criterio · evidencia ·
detalle · puntuación, una fila por evidencia. Las celdas de dimensión,
subdimensión, criterio y puntaje no se repiten en cada fila: se escriben una vez
y se deja correr la celda hacia abajo, que en un impreso es simplemente no
dibujar el filete que las separaría.

Cuando la tabla pasa de página se repite la cabecera y también los rótulos de
dimensión y subdimensión que vienen cortados, porque una página que empieza con
columnas en blanco no se puede leer sola.

Las celdas combinadas se respetan: el filete horizontal de cada columna se dibuja
solo donde esa columna empieza una celda nueva —la dimensión una vez, la
subdimensión en cada bloque, el criterio y su puntuación en cada criterio, y la
evidencia y el detalle en cada fila—. Todos los filetes que sí van, van bien
marcados.
"""
import fitz
import diseno as D
import diseno_form as DF
import piezas as P
from compositor import F

# el reparto de columnas, el del modelo
COLS = (0.128, 0.147, 0.176, 0.222, 0.222, 0.105)
CU = 7.6               # cuerpo de las celdas
INTER = 9.6            # su interlínea
PAD = 4.0
CAB_ALTO = 26.0
FILETE = (0.60, 0.67, 0.78)    # más marcado que el de serie, que se perdía
GROSOR = 0.7
CONT = {"es": " (cont.)", "pt": " (cont.)"}


def anchos():
    return [DF.ANCHO * f for f in COLS]


def _bordes():
    xs = [DF.X0]
    for a in anchos():
        xs.append(xs[-1] + a)
    return xs


def _lineas(txt, col, cuerpo=CU, base="light"):
    return P.lineas_de(txt, cuerpo, anchos()[col] - 12, base)


def construye(d, bloques, rot, lang):
    """Las filas de la tabla: una por evidencia, cada una con su celda de origen."""
    dim = (f"{rot['dimension'].capitalize()} {d['n']}\n"
           f"{d['corto'].capitalize()}\n[{d['puntos']}]")
    filas = []
    for s_, (rotulo, crits, puntos) in enumerate(bloques):
        sub = f"{rotulo}\n[{puntos}]"
        for c_, c in enumerate(crits):
            for k, ev in enumerate(c["evidencias"]):
                filas.append(dict(
                    dim=dim if not filas else None,
                    sub=sub if (c_ == 0 and k == 0) else None,
                    crit=c["enunciado"] if k == 0 else None,
                    pts=str(c["puntos"]) if k == 0 else None,
                    ev=ev[0], det=ev[1],
                    abre_sub=(c_ == 0 and k == 0),
                    abre_crit=(k == 0),
                    sub_id=s_, crit_id=(s_, c_),
                    sub_txt=sub, dim_txt=dim))
    return filas


def _lineas_de(txt, col, cuerpo=CU, base="light"):
    if not txt:
        return 0
    return sum(len(_lineas(t, col, cuerpo, base)) for t in txt.split("\n"))


def _alto_de(n):
    return n * INTER + PAD * 2


def _alto(fila, dim=None, sub=None):
    """Lo que pide una fila por sí sola: su evidencia y su detalle.

    Lo que viene de una celda combinada —el criterio, la subdimensión, la
    dimensión— no se cobra aquí: se reparte después entre todas las filas de su
    celda, que es lo que evita que la primera fila salga altísima y vacía.
    """
    n = max(1, _lineas_de(fila["ev"], 3), _lineas_de(fila["det"], 4))
    if dim:
        n = max(n, _lineas_de(dim, 0, 7.4, "bold"))
    if sub:
        n = max(n, _lineas_de(sub, 1, 7.2, "bold"))
    return _alto_de(n)


def reparte(filas, altos, clave, texto_de, col, cuerpo, base="bold"):
    """Da a cada celda combinada el alto que necesita, repartido entre sus filas."""
    i = 0
    while i < len(filas):
        j = i + 1
        while j < len(filas) and filas[j][clave] == filas[i][clave]:
            j += 1
        txt = texto_de(filas[i])
        if txt:
            pide = _alto_de(_lineas_de(txt, col, cuerpo, base))
            tiene = sum(altos[i:j])
            if pide > tiene:
                extra = (pide - tiene) / (j - i)
                for k in range(i, j):
                    altos[k] += extra
        i = j
    return altos


def cabecera(libro, rotulos, pal):
    osc, med, cla = pal
    xs = _bordes()
    y = libro.y
    pg = libro.pagina
    pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + CAB_ALTO), fill=med, color=None)
    for c, r in enumerate(rotulos):
        ls = []
        for t in r.split("\n"):
            ls += [l for l, _ in P.partir(P.trozos(t, "bold"), 6.8,
                                          lambda _: anchos()[c] - 10, "bold")]
        yy = y + (CAB_ALTO - len(ls) * 8.6) / 2 + 6.4
        for l in ls:
            ancho = sum(F(e).text_length(t, 6.8) for pal_ in l for t, e in pal_) + \
                F("bold").text_length(" ", 6.8) * (len(l) - 1)
            x = xs[c] + (anchos()[c] - ancho) / 2
            for pal_ in l:
                for t, e in pal_:
                    libro.escribe(x, yy, t, "montsemi", 6.8, (1, 1, 1))
                    x += F("montsemi").text_length(t, 6.8)
                x += F("montsemi").text_length(" ", 6.8)
            yy += 8.6
    P.reticula(pg, y, CAB_ALTO, xs, color=med, grosor=0.6)
    libro.y = y + CAB_ALTO


def tabla(libro, d, bloques, rot, lang):
    """Pinta la dimensión entera, repartiéndola en las páginas que haga falta."""
    pal = DF.PALETA[d["color"]]
    osc, med, cla = pal
    xs = _bordes()
    rotulos = ENCABEZADOS[lang]
    filas = construye(d, bloques, rot, lang)

    # ── los altos: la evidencia manda, y lo combinado se reparte ──────────
    altos = [_alto(f) for f in filas]
    reparte(filas, altos, "crit_id", lambda f: f["crit"], 2, CU, "light")
    reparte(filas, altos, "sub_id", lambda f: f["sub"], 1, 7.2)
    reparte(filas, altos, "dim_txt", lambda f: f["dim"], 0, 7.4)

    # ── y con ellos, el reparto en páginas ────────────────────────────────
    # Se reparte por criterios, no por filas: un criterio es una celda combinada
    # y partirlo deja su enunciado escrito en un trozo demasiado bajo, saliéndose
    # de la celda. Si no cabe entero, pasa entero.
    grupos = []
    i = 0
    while i < len(filas):
        j = i + 1
        while j < len(filas) and filas[j]["crit_id"] == filas[i]["crit_id"]:
            j += 1
        grupos.append(list(range(i, j)))
        i = j

    paginas, actual = [], []
    cabecera(libro, rotulos, pal)
    y = libro.y
    pagina_entera = D.BASE_ULTIMA - (D.BASE_PRIMERA + CAB_ALTO)
    for grupo in grupos:
        alto_grupo = sum(altos[k] for k in grupo)
        if actual and y + alto_grupo > D.BASE_ULTIMA and alto_grupo <= pagina_entera:
            paginas.append(actual)
            actual, y = [], D.BASE_PRIMERA + CAB_ALTO
        for k in grupo:
            fila = filas[k]
            cont = not actual and paginas
            dim_txt = fila["dim"] or (fila["dim_txt"] + CONT[lang] if cont else None)
            sub_txt = fila["sub"] or (fila["sub_txt"] + CONT[lang] if cont else None)
            alto = altos[k]
            if y + alto > D.BASE_ULTIMA and actual:
                paginas.append(actual)
                actual, y = [], D.BASE_PRIMERA + CAB_ALTO
                dim_txt = fila["dim_txt"] + CONT[lang]
                sub_txt = fila["sub_txt"] + CONT[lang]
            # una página que empieza repite rótulos más largos: la fila crece
            if not actual:
                alto = max(alto, _alto(fila, dim_txt, sub_txt))
            actual.append((k, alto, dim_txt, sub_txt))
            y += alto
    if actual:
        paginas.append(actual)

    # ── y ahora se pinta, página a página ─────────────────────────────────
    for n, pagina in enumerate(paginas):
        if n:
            libro.nueva()
            cabecera(libro, rotulos, pal)
        y0 = libro.y
        pinta_pagina(libro, pagina, filas, xs, pal, y0)
    libro.y += 2
    total(libro, d, rot, pal)
    libro.y += 14


def pinta_pagina(libro, pagina, filas, xs, pal, y0):
    osc, med, cla = pal
    pg = libro.pagina
    y = y0
    tramos = []                       # (y, alto) de cada fila de esta página
    for i, alto, dim_txt, sub_txt in pagina:
        tramos.append((y, alto))
        y += alto
    fin = y

    # fondos y filetes verticales
    for (yy, alto) in tramos:
        for c in (0, 1):
            pg.draw_rect(fitz.Rect(xs[c], yy, xs[c + 1], yy + alto), fill=cla,
                         color=None)
    for c in range(7):
        pg.draw_line((xs[c], y0), (xs[c], fin), color=FILETE, width=GROSOR)

    # filetes horizontales: cada columna rompe donde empieza su celda
    pg.draw_line((DF.X0, y0), (DF.X1, y0), color=FILETE, width=GROSOR)
    pg.draw_line((DF.X0, fin), (DF.X1, fin), color=FILETE, width=GROSOR)
    for k, (i, alto, dim_txt, sub_txt) in enumerate(pagina):
        if not k:
            continue
        fila = filas[i]
        yy = tramos[k][0]
        if fila["abre_sub"]:
            desde = xs[1]
        elif fila["abre_crit"]:
            desde = xs[2]
        else:
            desde = xs[3]
        pg.draw_line((desde, yy), (xs[5], yy), color=FILETE, width=GROSOR)
        if fila["abre_crit"]:
            pg.draw_line((xs[5], yy), (xs[6], yy), color=FILETE, width=GROSOR)

    # textos
    for k, (i, alto, dim_txt, sub_txt) in enumerate(pagina):
        fila = filas[i]
        yy = tramos[k][0]
        if dim_txt:
            _pinta(libro, dim_txt, 0, 7.4, osc, xs, yy, "bold")
        if sub_txt:
            _pinta(libro, sub_txt, 1, 7.2, osc, xs, yy, "bold")
        if fila["crit"]:
            _pinta(libro, fila["crit"], 2, CU, DF.GRIS, xs, yy)
        _pinta(libro, fila["ev"], 3, CU, DF.GRIS, xs, yy)
        _pinta(libro, fila["det"], 4, CU, DF.GRIS, xs, yy)

    # la puntuación, centrada en la celda combinada del criterio
    k = 0
    while k < len(pagina):
        fila = filas[pagina[k][0]]
        j = k + 1
        while j < len(pagina) and filas[pagina[j][0]]["crit_id"] == fila["crit_id"]:
            j += 1
        if fila["pts"]:
            arriba = tramos[k][0]
            abajo = tramos[j - 1][0] + tramos[j - 1][1]
            cuerpo = 9.0
            w = F("bold").text_length(fila["pts"], cuerpo)
            libro.escribe(xs[5] + (anchos()[5] - w) / 2,
                          (arriba + abajo) / 2 + cuerpo * 0.36, fila["pts"],
                          "bold", cuerpo, osc)
        k = j
    libro.y = fin


def _pinta(libro, txt, col, cuerpo, color, xs, y, base="light"):
    yy = y + PAD + cuerpo
    for t in txt.split("\n"):
        yy = P.pinta_lineas(libro, _lineas(t, col, cuerpo, base), xs[col] + 6, yy,
                            cuerpo, INTER, color, base)


def total(libro, d, rot, pal):
    """La fila de cierre: el puntaje máximo de la dimensión."""
    osc, med, cla = pal
    xs = _bordes()
    alto = 20.0
    if libro.y + alto > D.BASE_ULTIMA:
        libro.nueva()
    y = libro.y
    pg = libro.pagina
    pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + alto), fill=osc, color=None)
    etiqueta = (f"{rot['total']} {rot['dimension']} {d['n']} — {d['corto']}  ·  "
                f"{len(d['criterios'])} {rot['criterios'].lower()}")
    libro.escribe(DF.X0 + 8, y + 13.4, etiqueta, "montsemi", 8.4, (1, 1, 1))
    cifra = str(d["puntos"])
    cuerpo = 10.0
    w = F("montsemi").text_length(cifra, cuerpo)
    libro.escribe(xs[5] + (anchos()[5] - w) / 2, y + alto / 2 + cuerpo * 0.36,
                  cifra, "montsemi", cuerpo, (1, 1, 1))
    P.reticula(pg, y, alto, [DF.X0, xs[5], DF.X1], color=osc, grosor=GROSOR)
    libro.y = y + alto


ENCABEZADOS = {
    "es": ("Dimensión\n(Puntuación máxima)", "Subdimensión\n(Puntuación máxima)",
           "Criterios de Revisión", "Evidencias", "Detalle", "Puntuación\nmáxima"),
    "pt": ("Dimensão\n(Pontuação máxima)", "Subdimensão\n(Pontuação máxima)",
           "Critérios de Revisão", "Evidências", "Detalhe", "Pontuação\nmáxima"),
}

ENTRADA = {
 "es": "Cada dimensión se presenta en una sola tabla. A la izquierda, la dimensión "
       "y la subdimensión con su puntuación entre corchetes; después, el criterio de "
       "revisión, las evidencias que lo sustentan, el detalle que se espera de cada "
       "una y el puntaje máximo del criterio.",
 "pt": "Cada dimensão apresenta-se numa só tabela. À esquerda, a dimensão e a "
       "subdimensão com a sua pontuação entre colchetes; depois, o critério de "
       "revisão, as evidências que o sustentam, o detalhe que se espera de cada uma "
       "e a pontuação máxima do critério.",
}


# ── el resumen de puntuación, al cierre de la Sección III ──────────────────
RESUMEN = {
 "es": dict(titulo="RESUMEN DE PUNTUACIÓN",
            cols=("Dimensión", "Subdim.", "Criterios", "Puntuación\nmáxima",
                  "Puntos\nobtenidos", "%\nalcanzado"),
            total="TOTAL GENERAL",
            pie="Las dos últimas columnas se completan en la evaluación. El porcentaje "
                "alcanzado resulta de dividir los puntos obtenidos por la puntuación "
                "máxima de cada dimensión, y el general, por los 600 puntos del "
                "instrumento."),
 "pt": dict(titulo="RESUMO DA PONTUAÇÃO",
            cols=("Dimensão", "Subdim.", "Critérios", "Pontuação\nmáxima",
                  "Pontos\nobtidos", "%\nalcançado"),
            total="TOTAL GERAL",
            pie="As duas últimas colunas preenchem-se na avaliação. O percentual "
                "alcançado resulta de dividir os pontos obtidos pela pontuação máxima "
                "de cada dimensão e, o geral, pelos 600 pontos do instrumento."),
}

# chip · nombre · subdim · criterios · máxima · obtenidos · porcentaje
RES_COLS = (30.0, 170.0, 52.0, 52.0, 62.0, 48.0, 42.0)
RES_ALTO = 26.0


def resumen(libro, dims, bloques_de, rot, lang):
    """Las cinco dimensiones con sus puntos, y el total del instrumento.

    Cierra la Sección III porque es donde el lector acaba de recorrer las cinco
    tablas y necesita volver a verlas juntas.
    """
    R = RESUMEN[lang]
    inst = DF.PALETA[0]
    xs = [DF.X0]
    for a in RES_COLS:
        xs.append(xs[-1] + a)
    alto_total = RES_ALTO * (len(dims) + 2) + 54
    if libro.y + alto_total > D.BASE_ULTIMA:
        libro.nueva()
    libro.y += 10
    P.banda(libro, R["titulo"], inst, cuerpo=10.5, cola_minima=alto_total)
    libro.y += 10

    pg = libro.pagina
    y = libro.y
    pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + RES_ALTO), fill=inst[1], color=None)
    for c, rotulo in enumerate(R["cols"]):
        ls = rotulo.split("\n")
        yy = y + (RES_ALTO - len(ls) * 8.6) / 2 + 6.4
        for l in ls:
            w = F("montsemi").text_length(l, 7.0)
            x = xs[c + 1] + (RES_COLS[c + 1] - w) / 2 if c else xs[1] + 6
            libro.escribe(x, yy, l, "montsemi", 7.0, (1, 1, 1))
            yy += 8.6
    P.reticula(pg, y, RES_ALTO, xs, color=inst[1], grosor=GROSOR)
    y += RES_ALTO

    def cifra(txt, col, yy, color, cuerpo=9.0, fuente="bold"):
        w = F(fuente).text_length(txt, cuerpo)
        libro.escribe(xs[col] + (RES_COLS[col] - w) / 2, yy + RES_ALTO / 2 + cuerpo * 0.36,
                      txt, fuente, cuerpo, color)

    for d in dims:
        osc, med, cla = DF.PALETA[d["color"]]
        pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + RES_ALTO), fill=cla, color=None)
        pg.draw_rect(fitz.Rect(DF.X0, y, xs[1], y + RES_ALTO), fill=med, color=None)
        cifra(str(d["n"]), 0, y, (1, 1, 1), 11, "montsemi")
        libro.escribe(xs[1] + 8, y + RES_ALTO / 2 + 3.2,
                      d["corto"].capitalize(), "montsemi", 8.4, osc)
        cifra(str(len(bloques_de(d, lang))), 2, y, osc)
        cifra(str(len(d["criterios"])), 3, y, osc)
        cifra(str(d["puntos"]), 4, y, osc, 10)
        P.reticula(pg, y, RES_ALTO, xs, color=DF.FILETE, grosor=GROSOR)
        y += RES_ALTO

    osc, med, cla = inst
    pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + RES_ALTO), fill=osc, color=None)
    libro.escribe(xs[1] + 8, y + RES_ALTO / 2 + 3.4, R["total"], "montsemi", 8.6,
                  (1, 1, 1))
    cifra(str(sum(len(bloques_de(d, lang)) for d in dims)), 2, y, (1, 1, 1))
    cifra(str(sum(len(d["criterios"]) for d in dims)), 3, y, (1, 1, 1))
    cifra(str(sum(d["puntos"] for d in dims)), 4, y, (1, 1, 1), 10)
    P.reticula(pg, y, RES_ALTO, [DF.X0] + xs[1:], color=osc, grosor=GROSOR)
    libro.y = y + RES_ALTO + 12
    P.pinta_lineas(libro, P.lineas_de(R["pie"], 8.4, DF.ANCHO, "lightitalic"),
                   DF.X0, libro.y, 8.4, 10.6, DF.GRIS_CLARO, "lightitalic",
                   justificar=True, disp=DF.ANCHO)
