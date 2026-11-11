#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Las piezas con que se arma el Formulario: bandas, tablas y bloques de criterio.

Todo se dibuja sobre la retícula del Referencial. El color lo pone la dimensión
en curso; el dibujo es siempre el mismo, para que las seis dimensiones se lean
como un solo sistema y no como seis diseños.
"""
import re, fitz
import diseno as D
import diseno_form as DF
from compositor import F, trozos, partir, palabras, ancho, solo_entradilla


def reticula(pg, y, alto, bordes, color=None, grosor=0.5):
    """El recuadro de una fila y sus separadores de columna.

    Todas las tablas del documento llevan la retícula completa: dejar filetes
    en unas filas sí y en otras no confunde la lectura, sobre todo en un
    impreso que se rellena a mano.
    """
    col = color or DF.FILETE
    pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + alto), color=col, width=grosor)
    for x in bordes[1:-1]:
        pg.draw_line((x, y), (x, y + alto), color=col, width=grosor)


# ── texto ──────────────────────────────────────────────────────────────────
def lineas_de(texto, cuerpo, disp, base="light", entradilla=False):
    """`entradilla` deja la negrita solo cuando abre el bloque."""
    runs = trozos(texto, base)
    if entradilla:
        runs = solo_entradilla(runs)
    return partir(runs, cuerpo, lambda _: disp, base)


def pinta_lineas(libro, lineas, x, y, cuerpo, interlinea, color, base="light",
                 justificar=False, disp=None):
    for n, (pals, natural) in enumerate(lineas):
        sep = F(base).text_length(" ", cuerpo)
        if justificar and disp and n < len(lineas) - 1 and len(pals) > 1:
            sep = (disp - natural) / (len(pals) - 1)
        xx = x
        for pal in pals:
            for txt, est in pal:
                libro.escribe(xx, y, txt, est, cuerpo, color)
                xx += F(est).text_length(txt, cuerpo)
            xx += sep
        y += interlinea
    return y


def alto_de(texto, cuerpo, disp, interlinea, base="light"):
    return len(lineas_de(texto, cuerpo, disp, base)) * interlinea


# ── aperturas ──────────────────────────────────────────────────────────────
def apertura(libro, rotulo, titulo, pal, sumario=None, nivel=1, cola=None,
             forzar=True, cola_minima=150.0):
    """Banda de color con el título en blanco encima.

    `rotulo` es la línea fina de encima («SECCIÓN III», «DIMENSIÓN 1»); puede
    faltar. `cola` es la cifra que va a la derecha del rótulo, como el total de
    puntos de la dimensión. Con `forzar` se abre página siempre; si no, la banda
    continúa en la página en curso cuando queda sitio para ella y para un buen
    trozo de lo que sigue —una banda sola al pie es un título huérfano—.
    """
    osc, med, cla = pal
    lineas_t = envolver(titulo, "montxbold", 26, DF.ANCHO - 44)
    alto_t = 62 + 30 * (len(lineas_t) - 1) + (16 if rotulo else 0)
    # el aire de encima (16) y el de debajo (34) también cuentan: sin ellos la
    # banda entraba justa y el rótulo que la sigue se iba a la página siguiente
    if forzar or libro.y + 16 + alto_t + 34 + cola_minima > D.BASE_ULTIMA:
        libro.nueva(base=D.BASE_PRIMERA)
    pg = libro.pagina
    lineas = lineas_t
    alto = alto_t
    # en página nueva la banda cuelga de 74; si continúa, deja aire sobre ella
    y0 = 74.0 if libro.y <= D.BASE_PRIMERA else libro.y + 16
    pg.draw_rect(fitz.Rect(DF.X0, y0, DF.X1, y0 + alto), fill=osc, color=None)
    pg.draw_rect(fitz.Rect(DF.X0, y0, DF.X0 + 7, y0 + alto), fill=med, color=None)
    y = y0 + 30
    if rotulo:
        libro.escribe(DF.X0 + 22, y, rotulo, "montsemi", 10.5, (1, 1, 1))
        if cola:
            w = F("mont").text_length(cola, 9.5)
            libro.escribe(DF.X1 - 22 - w, y, cola, "mont", 9.5, (1, 1, 1))
        y += 28
    else:
        y += 4
    for ln in lineas:
        libro.escribe(DF.X0 + 22, y, ln, "montxbold", 26, (1, 1, 1))
        y += 30
    libro.y = y0 + alto + 34
    if sumario is not None:
        sumario.append((nivel, titulo, libro.doc.page_count - 1))
    return pg


def envolver(titulo, fuente, cuerpo, limite):
    out, act = [], ""
    for p in titulo.split(" "):
        cand = (act + " " + p).strip()
        if act and F(fuente).text_length(cand, cuerpo) > limite:
            out.append(act); act = p
        else:
            act = cand
    if act:
        out.append(act)
    return out


def banda(libro, texto, pal, cola=None, cuerpo=11.5, fondo=1, alto=None,
          cola_minima=150.0, desborde=0.0):
    """Banda de subdimensión: fondo medio (1) u oscuro (0), texto en blanco."""
    col = pal[fondo]
    disp = DF.ANCHO - 22 - (F("mont").text_length(cola or "", 9.5) + 26 if cola else 16)
    lineas = envolver(texto, "montsemi", cuerpo, disp)
    h = alto or (len(lineas) * (cuerpo + 4) + 13)
    # con 46 pt cabía la banda y nada más: el título se quedaba solo al pie.
    # Las bandas de cierre no arrastran nada y admiten bajar del límite: antes
    # eso que dejarlas solas en una página en blanco.
    if libro.y + h + cola_minima > D.BASE_ULTIMA + desborde:
        libro.nueva()
    y = libro.y
    libro.pagina.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + h), fill=col, color=None)
    yy = y + (h - len(lineas) * (cuerpo + 4)) / 2 + cuerpo
    for ln in lineas:
        libro.escribe(DF.X0 + 11, yy, ln, "montsemi", cuerpo, (1, 1, 1))
        yy += cuerpo + 4
    if cola:
        w = F("mont").text_length(cola, 9.5)
        libro.escribe(DF.X1 - 11 - w, y + h / 2 + 3.4, cola, "mont", 9.5, (1, 1, 1))
    libro.y = y + h
    return y + h


def secciones(libro, titulo, filas, pal):
    """Qué trae cada sección del instrumento, en su portadilla."""
    osc, med, cla = pal
    libro.y += 8
    libro.escribe(DF.X0, libro.y, titulo, "montsemi", 9, DF.GRIS_CLARO)
    libro.y += 12
    ROT = 92.0
    for rotulo, nombre, glosa in filas:
        ls = lineas_de(glosa, 8.4, DF.ANCHO - ROT - 8)
        h = max(24.0, 12.0 + len(ls) * 10.0 + 6)
        if libro.y + h > D.BASE_ULTIMA:
            libro.nueva()
        y = libro.y
        libro.pagina.draw_line((DF.X0, y), (DF.X1, y), color=DF.FILETE, width=0.5)
        libro.escribe(DF.X0, y + 14, rotulo, "montsemi", 8.2, med)
        libro.escribe(DF.X0 + ROT, y + 14, nombre, "montsemi", 9.4, osc)
        pinta_lineas(libro, ls, DF.X0 + ROT, y + 26, 8.4, 10.0, DF.GRIS)
        libro.y = y + h
    libro.pagina.draw_line((DF.X0, libro.y), (DF.X1, libro.y), color=DF.FILETE, width=0.5)
    libro.y += 16


def mapa(libro, filas, rot):
    """Las seis dimensiones de un vistazo, cada una con su color.

    Ocupa la apertura de la Sección III, que si no se quedaba casi en blanco,
    y de paso dice de qué tamaño es cada parte antes de entrar en ella.
    """
    ALTO, CHIP = 36.0, 46.0
    libro.y += 6
    libro.escribe(DF.X0, libro.y, rot["mapa"], "montsemi", 9, DF.GRIS_CLARO)
    libro.y += 17
    for n, nombre, puntos, criterios, pal in filas:
        osc, med, cla = pal
        if libro.y + ALTO > D.BASE_ULTIMA:
            libro.nueva()
        y = libro.y
        pg = libro.pagina
        pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + ALTO - 4), fill=cla, color=None)
        pg.draw_rect(fitz.Rect(DF.X0, y, DF.X0 + CHIP, y + ALTO - 4), fill=med, color=None)
        w = F("montxbold").text_length(str(n), 16)
        libro.escribe(DF.X0 + CHIP / 2 - w / 2, y + 22, str(n), "montxbold", 16, (1, 1, 1))
        libro.escribe(DF.X0 + CHIP + 13, y + 21, nombre, "montsemi", 11, osc)
        cifra = f"{puntos}  ·  {criterios}"
        w = F("mont").text_length(cifra, 9)
        libro.escribe(DF.X1 - 13 - w, y + 21, cifra, "mont", 9, osc)
        libro.y = y + ALTO
    libro.y += 8
    pinta_lineas(libro, lineas_de(rot["mapa_pie"], 9, DF.ANCHO, "lightitalic"),
                 DF.X0, libro.y, 9, 11.6, DF.GRIS_CLARO, "lightitalic")
    libro.y += 30


# ── bloque de criterio ─────────────────────────────────────────────────────
CASILLA_RE = re.compile(r"^[☐☒\s]*")


def columnas_criterio(evidencias, rot=None):
    """Reparte el ancho entre evidencia, detalle y documentos según lo que pide
    cada criterio, con un mínimo para que ninguna quede como una tira.

    Con las tres iguales, la columna del detalle —casi siempre la más larga—
    imponía su número de líneas a toda la fila y los bloques salían altísimos.
    """
    MAX = 0.44
    # el mínimo de cada columna es el que necesita su propio rótulo: si no,
    # «DOCUMENTOS EN PDF / ANEXO» salía cortado contra el filete
    if rot:
        minimo = [(F("montsemi").text_length(rot[k], 6.6) + 15) / DF.ANCHO
                  for k in ("evidencias", "detalle", "documentos")]
    else:
        minimo = [0.235] * 3
    demanda = [sum(len(ev[c]) for ev in evidencias) or 1 for c in range(3)]
    total = sum(demanda)
    frac = [d / total for d in demanda]
    for _ in range(6):
        frac = [min(MAX, max(minimo[c], f)) for c, f in enumerate(frac)]
        s = sum(frac)
        frac = [f / s for f in frac]
    frac = [max(minimo[c], f) for c, f in enumerate(frac)]
    s = sum(frac)
    return [DF.ANCHO * f / s for f in frac]


def medidas_criterio(enunciado, evidencias, niveles, rot):
    """Alto de cada parte del bloque, sin pintar nada."""
    cols = columnas_criterio(evidencias, rot)
    len_enun = lineas_de(enunciado, 9.5, DF.ANCHO - DF.NUM_ANCHO - DF.PTS_ANCHO - 22, "bold")
    h_banda = max(DF.CRIT_ALTO, len(len_enun) * 12 + 9)
    filas = []
    for ev in evidencias:
        ls = [lineas_de(ev[c], DF.CU, cols[c] - 14) for c in range(3)]
        filas.append((ls, max(len(x) for x in ls) * DF.INTER + DF.PAD * 2))
    return len_enun, h_banda, filas, pie_alto(niveles, rot), cols


def alto_criterio(g, rot):
    """Lo que ocupa un criterio entero, para saber si cabe donde está."""
    _, h_banda, filas, h_pie, _ = medidas_criterio(
        g["enunciado"], g["evidencias"], g["niveles"], rot)
    return h_banda + 13.5 + sum(f[1] for f in filas) + h_pie + 10


def criterio(libro, num, enunciado, evidencias, puntos, niveles, pal, rot):
    """Un criterio entero: banda del enunciado, evidencias y pie de respuesta.

    Se mide antes de pintar para no partirlo a mitad; si no cabe entero y es
    corto, pasa de página. Si es largo de verdad, se parte por filas de
    evidencia y la cabecera se repite con la marca de continuación.
    """
    osc, med, cla = pal
    len_enun, h_banda, filas, h_pie, cols = medidas_criterio(
        enunciado, evidencias, niveles, rot)
    bordes = [DF.X0]
    for c in cols:
        bordes.append(bordes[-1] + c)

    H_CAB = 13.5                       # la cabecera de las tres columnas
    MINIMO_TROZO = 2                   # filas de evidencia por trozo
    total = h_banda + H_CAB + sum(f[1] for f in filas) + h_pie + 10
    pagina = D.BASE_ULTIMA - D.BASE_PRIMERA
    tope = D.BASE_ULTIMA + (DESBORDE if libro.y + total <= D.BASE_ULTIMA + DESBORDE else 0)
    corte = None
    if libro.y + total > tope:
        # ¿cuántas filas entrarían aquí, con su banda y su cabecera?
        sitio = tope - (libro.y + h_banda + H_CAB)
        caben, usado = 0, 0.0
        for _, alto_fila in filas:
            if usado + alto_fila > sitio:
                break
            usado += alto_fila
            caben += 1
        # Se parte solo si los dos trozos quedan dignos —con su cabecera y al
        # menos dos filas de evidencia cada uno— y si pasarlo entero dejaría un
        # hueco de verdad detrás. Un criterio recortado es feo; media página en
        # blanco, también.
        # si al otro lado quedara una sola fila, se adelanta el corte
        if len(filas) - caben < MINIMO_TROZO:
            caben = len(filas) - MINIMO_TROZO
        hueco = D.BASE_ULTIMA - libro.y
        if caben >= MINIMO_TROZO and hueco >= 215:
            corte = caben
        else:
            libro.nueva()

    def cabeza(cont=False):
        y = libro.y
        pg = libro.pagina
        pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + h_banda), fill=cla, color=None)
        pg.draw_rect(fitz.Rect(DF.X0, y, DF.X0 + DF.CRIT_FILETE, y + h_banda),
                     fill=osc, color=None)
        reticula(pg, y, h_banda, [DF.X0, DF.X1], color=med, grosor=0.6)
        libro.escribe(DF.X0 + 11, y + 11.5, num, "montsemi", 11, osc)
        yy = y + (h_banda - len(len_enun) * 12) / 2 + 9
        pinta_lineas(libro, len_enun, DF.X0 + DF.NUM_ANCHO, yy, 9.5, 12, DF.GRIS, "bold")
        etq = f"{puntos} {rot['puntos'].lower()}" if puntos else ""
        if cont:
            etq = rot["continua"]
        if etq:
            w = F("mont").text_length(etq, 8.5)
            libro.escribe(DF.X1 - 11 - w, y + h_banda / 2 + 3, etq, "mont", 8.5, osc)
        libro.y = y + h_banda
        # cabecera de las tres columnas
        rotulos = (rot["evidencias"], rot["detalle"], rot["documentos"])
        hc = 13.5
        y = libro.y
        pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + hc), fill=med, color=None)
        for c, r in enumerate(rotulos):
            libro.escribe(bordes[c] + 7, y + 9.4, r, "montsemi", 6.6, (1, 1, 1))
        reticula(pg, y, hc, bordes, color=med, grosor=0.6)
        libro.y = y + hc

    cabeza()
    for n, (ls, h) in enumerate(filas):
        # la última fila arrastra el pie: o entran las dos, o pasan juntas
        atado = h + (h_pie if n == len(filas) - 1 else 0)
        if n == corte or libro.y + atado > tope:
            libro.nueva()
            cabeza(cont=True)
        y = libro.y
        pg = libro.pagina
        if n % 2 == 1:
            pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + h), fill=cla, color=None)
        for c in range(3):
            pinta_lineas(libro, ls[c], bordes[c] + 7, y + DF.PAD + 7.2,
                         DF.CU, DF.INTER, DF.GRIS)
        reticula(pg, y, h, bordes)
        libro.y = y + h
    pie(libro, niveles, pal, rot, tope)
    libro.y += 20


def pie_alto(niveles, rot):
    return 15.0 + (13.5 if niveles else 0) + 15.0


def pie(libro, niveles, pal, rot, tope=None):
    """La línea de respuesta: nivel de logro con sus casillas y la observación."""
    osc, med, cla = pal
    # el rótulo manda: «NÍVEL DE ALCANCE» es más largo que «NIVEL DE LOGRO»
    ETQ = max(F("montsemi").text_length(rot[k], 6.6) for k in ("nivel", "observacion")) + 20
    if libro.y + pie_alto(niveles, rot) > (tope or D.BASE_ULTIMA):
        libro.nueva()
    pg = libro.pagina
    y = libro.y
    if niveles:
        pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + 15.0), fill=cla, color=None)
        libro.escribe(DF.X0 + 7, y + 10.4, rot["nivel"], "montsemi", 6.6, osc)
        x = DF.X0 + ETQ + 9        # que no se peguen al filete de la etiqueta
        hueco = (DF.X1 - 12 - x) / max(1, len(niveles))
        for n in niveles:
            txt = CASILLA_RE.sub("", n).strip()
            pg.draw_rect(fitz.Rect(x, y + 4.4, x + DF.CASILLA, y + 4.4 + DF.CASILLA),
                         color=osc, width=0.7)
            libro.escribe(x + DF.CASILLA + 4.5, y + 10.4, txt, "regular", 7.6, DF.GRIS)
            x += hueco
        reticula(pg, y, 15.0, [DF.X0, DF.X0 + ETQ, DF.X1])
        y += 15.0
    pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + 15.0), fill=(1, 1, 1), color=None)
    libro.escribe(DF.X0 + 7, y + 10.4, rot["observacion"], "montsemi", 6.6, DF.GRIS_CLARO)
    pg.draw_line((DF.X0 + ETQ + 6, y + 11.6), (DF.X1 - 6, y + 11.6),
                 color=DF.LINEA_RELLENO, width=0.5, dashes="[1 2] 0")
    reticula(pg, y, 15.0, [DF.X0, DF.X0 + ETQ, DF.X1])
    libro.y = y + 15.0


# ── tablas corrientes ──────────────────────────────────────────────────────
DESBORDE = 26.0        # lo que se le consiente ganar al margen de pie


def tabla(libro, filas, pal, cuerpo=DF.CU, primera_negrita=False):
    """Tabla con la cabecera en el color medio y cebrado en el claro."""
    osc, med, cla = pal
    ncol = max(len(f) for f in filas)
    cab, cuerpo_filas = filas[0], filas[1:]
    if len(filas) == 1:
        return cintillo(libro, cab, pal, cuerpo)
    anchos = reparto([[c["t"] for c in f] for f in filas], ncol, cuerpo)
    primeras = 0.0
    for fila in cuerpo_filas[:2]:
        ls = [lineas_de(fila[c]["t"] if c < len(fila) else "", cuerpo,
                        max(20.0, _reparto_cache(filas, ncol, cuerpo)[c] - 14))
              for c in range(ncol)]
        primeras += max(len(x) for x in ls) * DF.INTER + DF.PAD * 2
    bordes = [DF.X0]
    for a in anchos:
        bordes.append(bordes[-1] + a)

    def pinta_cab():
        ls = [lineas_de(cab[c]["t"] if c < len(cab) else "", cuerpo - 0.6,
                        anchos[c] - 14, "bold") for c in range(ncol)]
        h = max(16.0, max(len(x) for x in ls) * DF.INTER + 8)
        # la cabecera baja con las dos primeras filas: sola al pie no dice nada
        if libro.y + h + primeras > D.BASE_ULTIMA:
            libro.nueva()
        y = libro.y
        libro.pagina.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + h), fill=med, color=None)
        for c in range(ncol):
            pinta_lineas(libro, ls[c], bordes[c] + 7,
                         y + (h - len(ls[c]) * DF.INTER) / 2 + 7.6,
                         cuerpo - 0.6, DF.INTER, (1, 1, 1), "bold")
        reticula(libro.pagina, y, h, bordes, color=med, grosor=0.6)
        libro.y = y + h

    # una tabla que cabe entera en una página no se parte: antes se rompía
    # dejando una o dos filas sueltas con media página en blanco detrás
    altos = []
    for fila in cuerpo_filas:
        ls = [lineas_de(fila[c]["t"] if c < len(fila) else "", cuerpo,
                        anchos[c] - 14, "light") for c in range(ncol)]
        altos.append(max(len(x) for x in ls) * DF.INTER + DF.PAD * 2)
    alto_cab = max(16.0, max(len(lineas_de(cab[c]["t"] if c < len(cab) else "",
                                           cuerpo - 0.6, anchos[c] - 14, "bold"))
                             for c in range(ncol)) * DF.INTER + 8)
    entera = alto_cab + sum(altos)
    pagina = D.BASE_ULTIMA - D.BASE_PRIMERA
    limite = D.BASE_ULTIMA
    # Una tabla se parte —repetir la cabecera y seguir es lo normal— salvo que
    # el trozo que quedaría a un lado fuese tan corto que no justifique la
    # cabecera repetida: entonces se mueve entera, aunque deje blanco detrás.
    aprieta = False
    if D.BASE_ULTIMA < libro.y + entera <= D.BASE_ULTIMA + DESBORDE:
        # le faltan unos puntos para caber donde está: antes que mandarla a la
        # página siguiente y dejar el hueco, se le deja ganar algo del margen
        aprieta = True
    elif libro.y + entera > D.BASE_ULTIMA and entera <= pagina + DESBORDE:
        sitio, acc, caben = D.BASE_ULTIMA - (libro.y + alto_cab), 0.0, 0
        for h_ in altos:
            if acc + h_ > sitio:
                break
            acc += h_
            caben += 1
        if caben < 3 or len(altos) - caben < 3 or len(altos) <= 6:
            libro.nueva()
            aprieta = True

    pinta_cab()          # puede abrir página por su cuenta, así que va antes
    if aprieta:
        # el límite se fija con la cabecera ya puesta, no con su alto estimado:
        # medio punto de diferencia bastaba para partir la tabla por la última
        # fila y dejarla sola en la página siguiente
        limite = min(D.BASE_ULTIMA + DESBORDE + 2, libro.y + sum(altos) + 1)
    # los cortes se calculan ya con la cabecera puesta
    cortes, y = [], libro.y
    for n, h_ in enumerate(altos):
        if y + h_ > limite:
            cortes.append(n)
            y = D.BASE_PRIMERA + alto_cab
        y += h_
    # y el último trozo no se queda con una o dos filas sueltas
    if cortes and len(altos) - cortes[-1] < 3:
        anterior = cortes[-2] if len(cortes) > 1 else 0
        if len(altos) - 3 - anterior >= 2:
            cortes[-1] = len(altos) - 3

    for n, fila in enumerate(cuerpo_filas):
        oscura = fila[0].get("bg") in (rgb_hex(osc),)
        ls = []
        for c in range(ncol):
            t = fila[c]["t"] if c < len(fila) else ""
            base = "bold" if oscura or (primera_negrita and c == 0) else "light"
            ls.append(lineas_de(t, cuerpo, anchos[c] - 14, base))
        h = altos[n]
        if n in cortes or libro.y + h > limite:
            libro.nueva()
            pinta_cab()
        y = libro.y
        pg = libro.pagina
        if oscura:
            pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + h), fill=osc, color=None)
        elif n % 2 == 1:
            pg.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + h), fill=cla, color=None)
        for c in range(ncol):
            base = "bold" if oscura or (primera_negrita and c == 0) else "light"
            pinta_lineas(libro, ls[c], bordes[c] + 7, y + DF.PAD + 7.2,
                         cuerpo, DF.INTER, (1, 1, 1) if oscura else DF.GRIS, base)
        reticula(pg, y, h, bordes)
        libro.y = y + h
    libro.y += 12


def cintillo(libro, celdas, pal, cuerpo):
    """Una sola fila, como la de las cifras del instrumento: columnas iguales."""
    osc, med, cla = pal
    n = len(celdas)
    ancho_col = DF.ANCHO / n
    h = 18.0
    if libro.y + h > D.BASE_ULTIMA:
        libro.nueva()
    y = libro.y
    libro.pagina.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + h), fill=med, color=None)
    for c, celda in enumerate(celdas):
        t = re.sub(r"\*+", "", celda["t"]).strip()
        w = F("montsemi").text_length(t, cuerpo)
        libro.escribe(DF.X0 + ancho_col * (c + 0.5) - w / 2, y + 12.2, t,
                      "montsemi", cuerpo, (1, 1, 1))
        if c:
            libro.pagina.draw_line((DF.X0 + ancho_col * c, y + 4),
                                   (DF.X0 + ancho_col * c, y + h - 4),
                                   color=(1, 1, 1), width=0.5)
    libro.y = y + h + 12


_cache_reparto = {}


def _reparto_cache(filas, ncol, cuerpo):
    clave = (id(filas), ncol, cuerpo)
    if clave not in _cache_reparto:
        _cache_reparto[clave] = reparto([[c["t"] for c in f] for f in filas], ncol, cuerpo)
    return _cache_reparto[clave]


def rgb_hex(c):
    return "".join(f"{round(v*255):02X}" for v in c)


# Lo que se le garantiza a una columna que solo se rellena a mano. Con cuatro
# columnas vacías en una misma tabla, 112 pt se comían el ancho de la primera y
# los nombres salían en tres líneas; el documento lo baja al componer.
RELLENO_MIN = 112.0


def reparto(filas, ncol, cuerpo):
    """A cada columna su palabra más larga; el sobrante, según lo que pediría.

    Una columna que se rellena a mano —toda su parte de cuerpo vacía— no se
    puede repartir por el texto que trae, porque no trae ninguno: se le
    garantiza sitio para escribir.
    """
    PADC, RELLENO = 15.0, RELLENO_MIN
    minimo, deseado = [], []
    for c in range(ncol):
        mw = dw = 0.0
        for n, f in enumerate(filas):
            if c >= len(f):
                continue
            celda = trozos(f[c], "bold" if n == 0 else "light")
            dw = max(dw, ancho(celda, cuerpo))
            for pal in palabras(celda):
                mw = max(mw, ancho(pal, cuerpo))
        vacia = all(not (f[c].strip() if c < len(f) else "") for f in filas[1:])
        minimo.append(max(mw + PADC, RELLENO if vacia else 0))
        deseado.append(max(dw + PADC, mw + PADC, RELLENO if vacia else 0))
    disp = DF.ANCHO
    if sum(minimo) >= disp:
        tot = sum(minimo)
        return [disp * m / tot for m in minimo]
    anchos = list(minimo)
    resto = disp - sum(minimo)
    for _ in range(ncol + 2):
        hambre = {c: deseado[c] - anchos[c] for c in range(ncol)
                  if deseado[c] - anchos[c] > 0.01}
        if resto <= 0.01 or not hambre:
            break
        tot = sum(hambre.values())
        dado = 0.0
        for c, e in hambre.items():
            add = min(e, resto * e / tot)
            anchos[c] += add
            dado += add
        resto -= dado
    if resto > 0.01:
        anchos[max(range(ncol), key=lambda c: deseado[c])] += resto
    return anchos
