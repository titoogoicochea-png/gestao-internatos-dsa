#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Portadilla y créditos del Formulario, sobre las páginas que diagramó Beulah.

Se clonan del documento original —así el logotipo institucional, la cita en
Alkaline y el arte son los auténticos— y se les cambia solo el texto. Hay que
redactar de verdad (un rectángulo blanco deja el texto viejo en la capa) y en
dos pasadas: primero todas las redacciones, después toda la escritura.
"""
import re, fitz
import diseno as D
import textos as T
import textos_form as TF
from compositor import F

MEDIDA = 467.17          # el borde derecho de la línea más larga del original
MARGEN_DER = 518.70      # el borde del logotipo «Educação Adventista»
SZ, PASO, PASO_L = 8.8, 12.8, 12.2
COL, GUT, X0ANCHO = 196.0, 15.0, 459.0


def _rgb(col):
    return ((col >> 16) / 255, ((col >> 8) & 255) / 255, (col & 255) / 255)


def _nat(txt, fuente, size):
    return F(fuente).text_length(txt, size)


def _trazar(tw, x, y, texto, fuente, size, track):
    for ch in texto:
        tw.append((x, y), ch, font=F(fuente), fontsize=size)
        x += F(fuente).text_length(ch, size) + track
    return x


def rehacer_portadilla(doc, idx, lang):
    """Cambia el título, pone el nivel y quita el año.

    Las dos líneas en ExtraBold se reducen hasta que la más larga ocupa la misma
    medida que «INTERNADOS» en el original: el bloque conserva su borde derecho.
    """
    pg = doc[idx]
    spans = [s for b in pg.get_text("dict")["blocks"] for l in b.get("lines", [])
             for s in l["spans"]]
    l1, l2, l3, _ = TF.TITULO[lang]
    viejas = {"REFERENCIAL PARA": l1}
    for s in spans:
        t = s["text"].strip()
        if s["font"] == "Montserrat-ExtraBold":
            viejas[t] = None               # se resuelven abajo, por orden
    bold = [s for s in spans if s["font"] == "Montserrat-ExtraBold"]
    bold.sort(key=lambda s: s["origin"][1])
    fina = next(s for s in spans if s["text"].strip() == "REFERENCIAL PARA")
    nivel = [s for s in spans if s["text"].strip() in T.NIVELES.values()]
    anio = [s for s in spans if re.fullmatch(r"\s*20\d\d\s*", s["text"])]
    # el rótulo de la División queda corto porque el año ocupaba su derecha;
    # al quitarlo hay que volver a justificarlo al margen, como en el Referencial
    cabeza = {}
    for s_ in spans:
        if s_["origin"][1] < 120 and s_["text"].strip() and s_ not in anio:
            cabeza.setdefault(round(s_["origin"][1], 1), []).append(s_)

    # ── una sola pasada de redacciones ──────────────────────────────────────
    # La caja se mide desde la línea base, no desde el bbox del span: el bbox
    # usa la caja de la fuente —con su descendente— y el de «INTERNADOS» se
    # solapaba con el de «ADVENTISTAS», que no se toca. apply_redactions borra
    # todo glifo cuyo cuadro roce la caja, y se llevaba la línea entera.
    for s in [fina] + bold:
        x0, _, x1, _ = s["bbox"]
        oy, sz = s["origin"][1], s["size"]
        pg.add_redact_annot(fitz.Rect(x0 - 1, oy - 0.92 * sz, x1 + 120, oy + 0.06 * sz),
                            fill=None)
    for s in nivel:
        pg.add_redact_annot(fitz.Rect(s["bbox"]) + (-1, -1.5, 120, 0.5), fill=None)
    for linea in cabeza.values():
        for s in linea:
            pg.add_redact_annot(fitz.Rect(s["bbox"]) + (-1, -1.5, 1, 1.5), fill=None)
    for s in anio:
        pg.add_redact_annot(fitz.Rect(s["bbox"]) + (0.5, -2, 2, 2), fill=None)
    if anio:
        for g in pg.get_drawings():
            r = g["rect"]
            if g["type"] == "s" and r.width < 2 and r.y1 < 110 and r.x0 > 380:
                pg.add_redact_annot(r + (-2, -2, 2, 2), fill=None)
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE,
                        graphics=fitz.PDF_REDACT_LINE_ART_REMOVE_IF_TOUCHED,
                        text=fitz.PDF_REDACT_TEXT_REMOVE)

    # ── y después, toda la escritura ────────────────────────────────────────
    azul = _rgb(bold[0]["color"])
    size0 = bold[0]["size"]
    # el tracking del original, como fracción del cuerpo
    viejo = bold[-1]["text"].strip()
    tr0 = ((bold[-1]["bbox"][2] - bold[-1]["bbox"][0]) - _nat(viejo, "montxbold", size0)) \
        / max(1, len(viejo) - 1)
    escala = min(1.0, (MEDIDA - bold[0]["bbox"][0]) /
                 max(_nat(t, "montxbold", size0) + tr0 * (len(t) - 1) for t in (l2, l3)))
    size = size0 * escala
    tw = fitz.TextWriter(pg.rect)
    _trazar(tw, fina["origin"][0], fina["origin"][1], l1, "montsemi", fina["size"],
            ((fina["bbox"][2] - fina["bbox"][0]) -
             _nat(fina["text"].strip(), "montsemi", fina["size"])) /
            max(1, len(fina["text"].strip()) - 1))
    for s, txt in zip(bold, (l2, l3)):
        _trazar(tw, s["origin"][0], s["origin"][1], txt, "montxbold", size, tr0 * escala)
    tw.write_text(pg, color=azul)

    for y_, linea in cabeza.items():
        linea.sort(key=lambda s: s["bbox"][0])
        corrimiento = MARGEN_DER - linea[-1]["bbox"][2]
        tw = fitz.TextWriter(pg.rect)
        for s in linea:
            txt = s["text"].rstrip()
            tr = ((s["bbox"][2] - s["bbox"][0]) - _nat(txt, "montmed", s["size"])) \
                / max(1, len(txt) - 1)
            _trazar(tw, s["origin"][0] + corrimiento, s["origin"][1], txt,
                    "montmed", s["size"], tr)
        tw.write_text(pg, color=_rgb(linea[0]["color"]))

    if nivel:
        s = nivel[0]
        tw = fitz.TextWriter(pg.rect)
        viejo = s["text"].strip()
        tr = ((s["bbox"][2] - s["bbox"][0]) - _nat(viejo, "montsemi", s["size"])) \
            / max(1, len(viejo) - 1)
        _trazar(tw, s["origin"][0], s["origin"][1], T.NIVELES[(lang, "superior")],
                "montsemi", s["size"], tr)
        tw.write_text(pg, color=_rgb(s["color"]))
    print(f"  ✓ portadilla: «{l2} {l3}» a {size:.1f} pt ({escala:.0%} del original)")


def rehacer_creditos(doc, idx, lang):
    """Los mismos créditos de los Referenciales: administración, uniones,
    rectores y los bloques de autoría, con las listas a dos columnas."""
    pg = doc[idx]
    arranque = None
    for b in pg.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            for s in l["spans"]:
                if s["text"].strip().startswith(("Presidente", "Presidente:")):
                    arranque = s["origin"]
    if not arranque:
        raise SystemExit("  ✗ no se localiza el bloque de créditos")
    x0, y0 = arranque
    pg.add_redact_annot(fitz.Rect(x0 - 10, y0 - 12, x0 + 2 * COL + GUT + 10,
                                  pg.rect.height - 18), fill=None)
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE,
                        graphics=fitz.PDF_REDACT_LINE_ART_NONE,
                        text=fitz.PDF_REDACT_TEXT_REMOVE)
    neg, gris = [], []

    def trocear(etiqueta, valor, x, ancho):
        piezas = [(w, "bold") for w in (etiqueta + ":").split(" ")]
        piezas += [(w, "light") for w in valor.split(" ")]
        filas, act, cx = [], [], x
        for pal, est in piezas:
            w = F(est).text_length(pal + " ", SZ)
            if cx + w > x + ancho and act:
                filas.append(act); act = []; cx = x + 8.0
            act.append((cx, pal, est))
            cx += w
        if act:
            filas.append(act)
        return filas

    def entrada(etiqueta, valor, x, y, ancho, paso=None):
        for fila in trocear(etiqueta, valor, x, ancho):
            for cx, pal, est in fila:
                (neg if est == "bold" else gris).append(((cx, y), pal))
            y += paso or PASO
        return y

    def dos_columnas(titulo, lista, y):
        neg.append(((x0, y), titulo))
        y += PASO + 2.0
        altos = [len(trocear(e, v, x0, COL)) for e, v in lista]
        total = sum(altos)
        acum, corte = 0, len(lista)
        for k, h in enumerate(altos):
            if acum + h > (total + 1) // 2:
                corte = k; break
            acum += h
        corte = max(1, corte)
        finales = []
        for k, col in enumerate((lista[:corte], lista[corte:])):
            cy = y
            for etiqueta, valor in col:
                cy = entrada(etiqueta, valor, x0 + k * (COL + GUT), cy, COL, PASO_L)
            finales.append(cy)
        return max(finales)

    y = y0 - 8.0
    for etiqueta, valor in T.ADMIN[lang]:
        y = entrada(etiqueta, valor, x0, y, 2 * COL + GUT)
    y += 8.0
    y = dos_columnas(T.CRED[lang]["uniones"], T.UNIONES[lang], y)
    y += 8.0
    y = dos_columnas(T.CRED[lang]["rectores"], T.RECTORES, y)
    y += 4.0
    for etiqueta, cuerpo in T.bloques(lang):
        y += 6.0
        neg.append(((x0, y), etiqueta))
        y += PASO
        x = x0
        for pal in cuerpo.split(" "):
            w = F("light").text_length(pal + " ", SZ)
            if x + w > X0ANCHO + 60:
                y += PASO
                x = x0
            gris.append(((x, y), pal))
            x += w
        y += PASO
    for lote, fuente, color in ((neg, "bold", D.NEGRO), (gris, "light", D.GRIS_TEXTO)):
        tw = fitz.TextWriter(pg.rect)
        for punto, txt in lote:
            tw.append(punto, txt, font=F(fuente), fontsize=SZ)
        tw.write_text(pg, color=color)
    print(f"  ✓ créditos: acaban en y={y:.0f} de {pg.rect.height:.0f}")
    return y
