#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Compone el Formulario de Vida en el Campus con el sistema de diseño del Referencial.

La portada se estampa del JPEG compuesto por portada_campus.py; la portadilla, los
créditos y la contraportada se clonan del documento que Beulah diagramó y se les
cambia solo el texto. El cuerpo se compone desde doc_<lang>.py, que es la fuente
autorizada de este documento.

Uso: python3 maqueta_campus.py <es|pt> <jpg portada> <salida>
"""
import sys, os, re, importlib, fitz
import diseno as D
import diseno_form as DF
import textos as T
import textos_form as TF
import piezas as P
from compositor import Libro, F, trozos, partir, solo_entradilla

LANG, PORTADA, SALIDA = sys.argv[1], sys.argv[2], sys.argv[3]
DOC = importlib.import_module("doc_" + LANG)
ROT = DOC.ROTULOS
BEULAH = ("/Users/titogoicocheam/aplicativos-titoia/gestao-internatos-dsa/"
          "Documentos diagramados/Diagramados por Marquinhos/")
FRENTE = BEULAH + ("Referencial Gestión Internados - Ed Básica Esp - Completo.pdf"
                   if LANG == "es" else
                   "Referencial Gestão Internatos - Ed Básica_Port - Completo.pdf")
INST = DF.PALETA[0]
# los criterios llegan a dos cifras: 26 pt dejaban el número pegado al enunciado
DF.NUM_ANCHO = 32.0
# la consolidación tiene cuatro columnas en blanco: con el mínimo de serie, el
# nombre de la dimensión quedaba en tres líneas
P.RELLENO_MIN = 76.0


def pal_de(d):
    return DF.PALETA[d["color"]]


# ── furniture ──────────────────────────────────────────────────────────────
def cabecera(doc, idx, titulo):
    """Folio corrido: par a la izquierda con la marca, impar a la derecha con el
    título de la sección. El mismo del Referencial."""
    pg = doc[idx]
    azul, nar = [], []
    if idx % 2 == 0:
        x = D.CAB_IZQ
        azul.append(((x, D.CAB_BASE), str(idx), "bold", 11))
        x += F("bold").text_length(str(idx) + "    ", 11)
        for txt, fnt in DOC.CABECERA:
            nar.append(((x, D.CAB_BASE), txt, fnt, 11))
            x += F(fnt).text_length(txt, 11)
    else:
        folio = str(idx)
        wf = F("bold").text_length(folio, 11)
        xf = D.CAB_DER - wf
        azul.append(((xf, D.CAB_BASE), folio, "bold", 11))
        t = titulo
        while t and F("light").text_length(t, 11) > 330:
            t = t[:-1]
        if t != titulo:
            t = t.rstrip() + "…"
        nar.append(((xf - 13.4 - F("light").text_length(t, 11), D.CAB_BASE), t, "light", 11))
    for lote, color in ((azul, D.AZUL), (nar, D.NARANJA)):
        tw = fitz.TextWriter(pg.rect)
        for punto, txt, fnt, cu in lote:
            tw.append(punto, txt, font=F(fnt), fontsize=cu)
        tw.write_text(pg, color=color)


def parrafo(libro, texto, cuerpo=10.0, inter=13.4, color=DF.GRIS, base="light",
            sangria=0.0, justificar=True):
    disp = DF.ANCHO
    runs = solo_entradilla(trozos(texto, base))
    lineas = partir(runs, cuerpo, lambda n: disp - (sangria if n == 0 else 0), base)
    caben = int((D.BASE_ULTIMA - libro.y) // inter) + 1
    total = len(lineas)
    corte = total
    if caben < total:
        corte = caben
        if total - corte < 2:
            corte = total - 2
        if corte < 2:
            libro.nueva()
            corte = total
    for n, (pals, natural) in enumerate(lineas):
        if n == corte:
            libro.nueva()
        elif libro.y > D.BASE_ULTIMA:
            libro.nueva()
        x0 = DF.X0 + (sangria if n == 0 else 0)
        sep = F(base).text_length(" ", cuerpo)
        if justificar and n < len(lineas) - 1 and len(pals) > 1:
            sep = (DF.X1 - x0 - natural) / (len(pals) - 1)
        x = x0
        for pal in pals:
            for txt, est in pal:
                libro.escribe(x, libro.y, txt, est, cuerpo, color)
                x += F(est).text_length(txt, cuerpo)
            x += sep
        libro.y += inter


def nota(libro, texto, pal):
    osc, med, cla = pal
    disp = DF.ANCHO - 26
    lineas = P.lineas_de(texto, 8.6, disp, entradilla=True)
    h = len(lineas) * 10.6 + 17
    if libro.y + h > D.BASE_ULTIMA:
        libro.nueva()
    y = libro.y
    libro.pagina.draw_rect(fitz.Rect(DF.X0, y, DF.X1, y + h), fill=cla, color=None)
    libro.pagina.draw_rect(fitz.Rect(DF.X0, y, DF.X0 + 3.2, y + h), fill=med, color=None)
    P.pinta_lineas(libro, lineas, DF.X0 + 13, y + 16, 8.6, 10.6, DF.GRIS,
                   justificar=True, disp=disp)
    libro.y = y + h + 13


def cuerpo_md(libro, md, pal, firma=False):
    """Markdown sencillo: solo ## y párrafos. La firma va sin justificar."""
    bloques = [b.strip() for b in md.split("\n\n") if b.strip()]
    for k, s in enumerate(bloques):
        if s.startswith("## "):
            libro.y += 10
            sigue = " ".join(bloques[k + 1].split()) if k + 1 < len(bloques) else ""
            n = len(P.lineas_de(sigue, 10, DF.ANCHO))
            if libro.y + 17 + 13.4 * min(3, n) > D.BASE_ULTIMA:
                libro.nueva()
            parrafo(libro, s[3:].strip(), 13, 17, pal[1], "montsemi", justificar=False)
            libro.y += 7
        elif firma and s.startswith("**Pr."):
            libro.y += 12
            for linea in s.split("\n"):
                parrafo(libro, linea.strip(), 10, 13.0, DF.GRIS, justificar=False)
        else:
            parrafo(libro, " ".join(s.split()), 10, 13.4)
            libro.y += 5


def niveles_de(puntos):
    """☐ AP 15 / ☐ AA 12-14 / ☐ PA 8-11 / ☐ NA 0-7, con la regla 75% / 50%."""
    import math
    aa = math.ceil(0.75 * puntos)
    pa = math.ceil(0.50 * puntos)
    return [f"☐ AP {puntos}",
            f"☐ AA {aa}-{puntos - 1}  ____",
            f"☐ PA {pa}-{aa - 1}  ____",
            f"☐ NA 0-{pa - 1}  ____"]


def bloques(libro, items, pal):
    """Renderiza la lista de tuplas de una sección: h3, h4, p, tabla y nota."""
    for tipo, *resto in items:
        if tipo == "h3":
            libro.y += 6
            P.banda(libro, resto[0], pal, cuerpo=10.5, cola_minima=90)
            libro.y += 10
        elif tipo == "h4":
            libro.y += 6
            if libro.y + 120 > D.BASE_ULTIMA:
                libro.nueva()
            parrafo(libro, resto[0], 11, 14.5, pal[0], "montsemi", justificar=False)
            libro.y += 5
        elif tipo == "p":
            parrafo(libro, resto[0], 10, 13.4)
            libro.y += 5
        elif tipo == "tabla":
            P.tabla(libro, resto[0], pal, primera_negrita=False)
        elif tipo == "nota":
            nota(libro, resto[0], pal)


def meta_tabla(libro, d, pal):
    """La meta de vivencia percibida con que cierra cada dimensión."""
    filas = [[{"t": f"**{ROT['meta']} (ILE/IVC) — {d['nombre']}**", "bg": None}]]
    for num, frase in d["meta"]:
        filas.append([{"t": f"**Crit. {num}**", "bg": None},
                      {"t": f"*{frase}*", "bg": None}])
    libro.y += 4
    P.tabla(libro, filas, pal, cuerpo=8.6, primera_negrita=True)


def componer():
    libro = Libro()
    libro.indice = []
    libro.titulos = {}
    estado = {"sec": ""}

    def marca(p0):
        for p in range(p0, libro.doc.page_count):
            libro.titulos.setdefault(p, estado["sec"])

    def abre(titulo, rotulo=None, nivel=1, cola=None, pal=INST):
        estado["sec"] = titulo if rotulo is None else f"{rotulo}: {titulo}"
        P.apertura(libro, rotulo, titulo, pal, cola=cola)
        libro.indice.append((nivel, estado["sec"], libro.doc.page_count - 1))
        marca(libro.doc.page_count - 1)

    def seccion_md(md, pal=INST, firma=False):
        lineas = md.strip().split("\n")
        titulo = lineas[0].lstrip("# ").strip()
        rot, resto = parte_rotulo(titulo)
        abre(resto, rot, 1, pal=pal)
        cuerpo_md(libro, "\n".join(lineas[1:]), pal, firma=firma)
        marca(0)

    # ── frente del cuerpo ───────────────────────────────────────────────────
    seccion_md(DOC.JUSTIFICACION)
    seccion_md(DOC.PRESENTACION, firma=True)
    seccion_md(DOC.SECCION_I)

    # ── Sección II: las dimensiones descritas ───────────────────────────────
    rot, resto = parte_rotulo(DOC.TITULOS["s2"])
    abre(resto, rot, 1)
    libro.y += 2
    parrafo(libro, DOC.SECCION_II_ENTRADA, 9.6, 12.6, DF.GRIS_CLARO, "lightitalic")
    libro.y += 12
    for d in DOC.DIMENSIONES:
        pal = pal_de(d)
        P.banda(libro, f"{ROT['dimension']} {d['n']} — {d['nombre']}", pal,
                cola=f"{d['puntos']} {ROT['puntos'].lower()}", cuerpo=10.5,
                cola_minima=120)
        libro.indice.append((2, f"{ROT['dimension']} {d['n']} — {d['nombre']}",
                             libro.doc.page_count - 1))
        libro.y += 12
        cuerpo_md(libro, d["descripcion"], pal)
        libro.y += 2
        nota(libro, d["orientacion"], pal)
    marca(0)

    # ── Sección III ─────────────────────────────────────────────────────────
    rot, resto = parte_rotulo(DOC.TITULOS["s3"])
    abre(resto, rot, 1)
    P.mapa(libro, [(d["n"], d["corto"], str(d["puntos"]),
                    str(len(d["criterios"])), pal_de(d)) for d in DOC.DIMENSIONES], ROT)
    titulo_col, filas_col = DOC.COLUMNAS
    P.secciones(libro, titulo_col, filas_col, INST)
    marca(0)

    for items in (DOC.SECCION_III_INFO, DOC.SECCION_III_ESCALA):
        libro.indice.append((3, items[0][1], libro.doc.page_count - 1))
        bloques(libro, items, INST)

    libro.y += 6
    P.banda(libro, DOC.TITULOS["evaluacion"], INST, cuerpo=10.5, cola_minima=110)
    libro.indice.append((3, DOC.TITULOS["evaluacion"], libro.doc.page_count - 1))
    libro.y += 10
    parrafo(libro, DOC.TITULOS["evaluacion_entrada"], 9.6, 12.6, DF.GRIS_CLARO,
            "lightitalic")
    libro.y += 6
    marca(0)

    for d in DOC.DIMENSIONES:
        pal = pal_de(d)
        estado["sec"] = f"{ROT['dimension']} {d['n']} — {d['nombre']}"
        P.apertura(libro, f"{ROT['dimension']} {d['n']}", d["nombre"], pal,
                   cola=f"{d['puntos']} {ROT['puntos'].lower()}  ·  "
                        f"{len(d['criterios'])} {ROT['criterios'].lower()}")
        libro.indice.append((2, estado["sec"], libro.doc.page_count - 1))
        marca(libro.doc.page_count - 1)
        nota(libro, d["orientacion"], pal)
        for k, c in enumerate(d["criterios"]):
            if k:
                libro.y += 8
            P.criterio(libro, str(c["num"]), c["enunciado"], c["evidencias"],
                       str(c["puntos"]), niveles_de(c["puntos"]), pal, ROT)
        meta_tabla(libro, d, pal)
        libro.y += 2
        P.banda(libro, f"{ROT['total']} {ROT['dimension']} {d['n']} — {d['corto']}:  "
                       f"{d['puntos']} {ROT['puntos'].lower()}  ·  "
                       f"{len(d['criterios'])} {ROT['criterios'].lower()}",
                pal, fondo=0, cuerpo=9.5, cola_minima=0, desborde=42)
        libro.y += 14
        marca(0)

    # ── Secciones IV, V y VI ────────────────────────────────────────────────
    for clave, items in (("s4", DOC.SECCION_IV), ("s5", DOC.SECCION_V),
                         ("s6", DOC.SECCION_VI)):
        rot, resto = parte_rotulo(DOC.TITULOS[clave])
        abre(resto, rot, 1)
        bloques(libro, items, INST)
        marca(0)

    libro.volcar()
    return libro


def parte_rotulo(txt):
    for sep in (":", "—"):
        if sep in txt:
            a, b = txt.split(sep, 1)
            if len(a) < 30:
                return a.strip(), b.strip()
    return None, txt


# ── sumario ────────────────────────────────────────────────────────────────
def construir_sumario(entradas, desfase, pal):
    libro = Libro()
    enlaces = []
    P.apertura(libro, None, T.SUMARIO[LANG], pal)
    libro.y += 2
    libro.escribe(DF.X0, libro.y, T.PISTA[LANG], "lightitalic", 9, DF.GRIS_CLARO)
    libro.y += 24.0
    for k, (nivel, texto, pag) in enumerate(entradas):
        if libro.y > D.BASE_ULTIMA - 10:
            libro.volcar(); libro.nueva(con_cabecera=False, base=D.BASE_PRIMERA)
        if nivel == 1 and k:
            libro.y += 13.0
        x = {1: 62.4, 2: 72.0, 3: 88.0}[nivel]
        destino = pag + desfase
        num = str(destino)
        cu = {1: 11.5, 2: 10.5, 3: 9.5}[nivel]
        base = {1: "bold", 2: "bold", 3: "light"}[nivel]
        color = {1: D.AZUL, 2: pal[1], 3: DF.GRIS}[nivel]
        wn = F("light").text_length(num, cu)
        punto = F("light").text_length(".", cu)
        tope = D.SUM_DER - wn - 14 - x
        lineas = [ln for ln, _ in partir(trozos(texto, base), cu, lambda _: tope, base)]
        y0 = libro.y
        for j, pals in enumerate(lineas):
            if libro.y > D.BASE_ULTIMA - 10:
                libro.volcar(); libro.nueva(con_cabecera=False, base=D.BASE_PRIMERA)
                y0 = libro.y
            xx = x if j == 0 else x + 12
            for pal_ in pals:
                for txt, est in pal_:
                    libro.escribe(xx, libro.y, txt, est, cu, color)
                    xx += F(est).text_length(txt, cu)
                xx += F(base).text_length(" ", cu)
            if j == len(lineas) - 1:
                hueco = (D.SUM_DER - wn - 3) - (xx + 1)
                if hueco > punto:
                    libro.escribe(xx + 1, libro.y, "." * int(hueco / punto), "light",
                                  cu, DF.GRIS_CLARO)
                libro.escribe(D.SUM_DER - wn, libro.y, num, "light", cu, DF.GRIS)
                enlaces.append((libro.doc.page_count - 1,
                                fitz.Rect(x - 2, y0 - 11, D.SUM_DER + 2, libro.y + 3.5),
                                destino))
            libro.y += cu + 3.6
    libro.volcar()
    return libro.doc, enlaces


REMAPEO = ((b"<00a0>", b"<0020>"), (b"<2010>", b"<002d>"), (b"<2219>", b"<00b7>"),
           (b"<0248>", b"<00c3>"))


def normalizar_espacios(ruta):
    doc = fitz.open(ruta)
    tocados = 0
    for x in range(1, doc.xref_length()):
        try:
            if doc.xref_get_key(x, "Type")[1] != "/Font":
                continue
            nom = doc.xref_get_key(x, "BaseFont")[1] or ""
        except Exception:
            continue
        if not re.search(r"(Lato|Montserrat|Niconne|OpenSans)", nom):
            continue
        tu = doc.xref_get_key(x, "ToUnicode")
        if tu[0] != "xref":
            continue
        ref = int(tu[1].split()[0])
        flujo = doc.xref_stream(ref)
        if not flujo:
            continue
        nuevo = flujo
        for a, b in REMAPEO:
            nuevo = nuevo.replace(a, b)
        if nuevo != flujo:
            doc.update_stream(ref, nuevo)
            tocados += 1
    doc.saveIncr() if doc.can_save_incrementally() else doc.save(ruta + ".tmp")
    doc.close()
    if os.path.exists(ruta + ".tmp"):
        os.replace(ruta + ".tmp", ruta)
    print(f"  · ToUnicode normalizado en {tocados} fuentes")


def main():
    print("  componiendo el cuerpo…")
    libro = componer()
    print(f"  ✓ cuerpo: {libro.doc.page_count} páginas · {len(libro.indice)} entradas")

    n = 2
    for _ in range(5):
        desfase = 3 + n
        sumario, enlaces = construir_sumario(libro.indice, desfase, INST)
        if sumario.page_count == n:
            break
        n = sumario.page_count
    print(f"  ✓ índice: {n} páginas · desfase {desfase}")

    # el título de la portadilla sale de este documento, no del Formulario
    TF.TITULO[LANG] = DOC.TITULO
    frente = fitz.open(FRENTE)
    final = fitz.open()
    caja = frente[0].get_image_rects(frente[0].get_images(full=True)[0][0])[0]
    cub = final.new_page(width=frente[0].rect.width, height=frente[0].rect.height)
    cub.insert_image(caja, filename=PORTADA)
    final.insert_pdf(frente, from_page=1, to_page=2)
    import frente_form as FF
    FF.rehacer_portadilla(final, 1, LANG)
    FF.rehacer_creditos(final, 2, LANG)
    final.insert_pdf(sumario)
    final.insert_pdf(libro.doc)
    final.insert_pdf(frente, from_page=frente.page_count - 1)

    for p in range(libro.doc.page_count):
        idx = desfase + p
        if p in libro.sin_folio:
            continue
        cabecera(final, idx, libro.titulos.get(p, ""))
    for pag, rect, destino in enlaces:
        final[3 + pag].insert_link({"kind": fitz.LINK_GOTO, "from": rect,
                                    "page": destino, "to": fitz.Point(0, 0)})
    final.save(SALIDA, garbage=3, deflate=True)
    normalizar_espacios(SALIDA)
    print(f"  ✓ {SALIDA} · {fitz.open(SALIDA).page_count} páginas")


if __name__ == "__main__":
    main()
