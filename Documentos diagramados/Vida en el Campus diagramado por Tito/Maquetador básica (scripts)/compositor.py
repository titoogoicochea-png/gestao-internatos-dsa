#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Motor de composición: fuentes, texto en línea, partido de líneas y páginas.

Separado del contenido para poder probarlo solo. Las medidas vienen de diseno.py,
que a su vez las tomó del documento diagramado por Beulah.
"""
import os, re, fitz
import diseno as D

LATO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lato")
MONT = ("/Users/titogoicocheam/Library/CloudStorage/OneDrive-Adventistas/"
        "Núcleo Estratégico Educacional - DSA/Traducción estudios bíblicos/transfonts")

FUENTES = {
    "light": os.path.join(LATO, "Lato-Light.ttf"),
    "lightitalic": os.path.join(LATO, "Lato-LightItalic.ttf"),
    "regular": os.path.join(LATO, "Lato-Regular.ttf"),
    "italic": os.path.join(LATO, "Lato-Italic.ttf"),
    "bold": os.path.join(LATO, "Lato-Bold.ttf"),
    "bolditalic": os.path.join(LATO, "Lato-BoldItalic.ttf"),
    "black": os.path.join(LATO, "Lato-Black.ttf"),
    # Montserrat en sus pesos reales, instanciados de la variable de Google:
    # sustituir la Regular por la Medium cambiaba el color del texto en página.
    "mont": os.path.join(LATO, "Montserrat-Regular.ttf"),
    # Alkaline, la script de la cita de portadilla, es comercial y del PDF
    # solo viene un subconjunto sin E, y ni ó. Niconne es la libre más
    # cercana: monolineal, ligera y de la misma redondez.
    "script": os.path.join(LATO, "Niconne-Regular.ttf"),
    "montmed": os.path.join(LATO, "Mont-500.ttf"),
    "montsemi": os.path.join(LATO, "Montserrat-SemiBold.ttf"),
    "montbold": os.path.join(MONT, "Montserrat-Bold.ttf"),
    "montxbold": os.path.join(MONT, "Montserrat-ExtraBold.ttf"),
    # El logotipo de la Iglesia va en una tipografía propia que no tenemos; la
    # más próxima de las libres es Open Sans con el eje de anchura en 75, que
    # reproduce el ancho y la altura de caja del original casi exactamente.
    "ossans": os.path.join(LATO, "OpenSans-Cond.ttf"),
}
_cache = {}


def F(nombre):
    if nombre not in _cache:
        ruta = FUENTES[nombre]
        if not os.path.exists(ruta):
            raise SystemExit(f"  ✗ falta la fuente {ruta}")
        _cache[nombre] = fitz.Font(fontfile=ruta)
    return _cache[nombre]


# ── texto en línea ─────────────────────────────────────────────────────────
def tipografia(texto):
    """Comillas rectas → curvas y apóstrofo tipográfico, como hizo InDesign."""
    out, abierta = [], True
    for ch in texto:
        if ch == '"':
            out.append("\u201c" if abierta else "\u201d"); abierta = not abierta
        elif ch == "'":
            out.append("\u2019")
        else:
            out.append(ch)
            if ch in "\n\t":
                abierta = True
    return "".join(out)


MARCAS = re.compile(r"(\*\*\*.+?\*\*\*|\*\*.+?\*\*|\*[^*\n]+?\*|_[^_\n]+?_)", re.S)


def trozos(texto, base="light"):
    """Parte un texto markdown en (cadena, estilo). `base` manda el peso normal."""
    # dentro de una cita en cursiva, el énfasis vuelve a la redonda
    negrita = {"light": "bold", "regular": "bold", "bold": "bold", "black": "black",
               "lightitalic": "bolditalic", "italic": "bolditalic",
               "bolditalic": "bolditalic",
               # Montserrat solo se usa en rótulos: el énfasis no cambia de peso
               "mont": "montsemi", "montmed": "montsemi", "montsemi": "montbold",
               "montbold": "montxbold", "montxbold": "montxbold"}[base]
    cursiva = {"light": "lightitalic", "regular": "italic", "bold": "bolditalic",
               "black": "bolditalic", "lightitalic": "light", "italic": "regular",
               "bolditalic": "bold", "mont": "mont", "montmed": "montmed",
               "montsemi": "montsemi", "montbold": "montbold",
               "montxbold": "montxbold"}[base]
    ambas = "bolditalic"
    out = []
    for p in MARCAS.split(tipografia(texto)):
        if not p:
            continue
        if p.startswith("***") and p.endswith("***"):
            out.append((p[3:-3], ambas))
        elif p.startswith("**") and p.endswith("**"):
            out.append((p[2:-2], negrita))
        elif len(p) > 1 and p[0] in "*_" and p[-1] == p[0]:
            out.append((p[1:-1], cursiva))
        else:
            out.append((p, base))
    return [(t, e) for t, e in out if t]


def solo_entradilla(runs):
    """Deja la negrita únicamente cuando abre el párrafo.

    En el cuerpo, resaltar un título largo a media frase pesa demasiado; la
    negrita de entradilla («Registro.», «Pr. Antonio Marcos Alves») sí ayuda.
    """
    out = []
    for i, (texto, estilo) in enumerate(runs):
        if i > 0 and estilo in ("bold", "bolditalic"):
            estilo = "lightitalic" if estilo == "bolditalic" else "light"
        out.append((texto, estilo))
    return out


def palabras(runs):
    """Agrupa los trozos en palabras.

    Una palabra puede cambiar de estilo por dentro —«*Educação*,» es cursiva y
    luego redonda sin espacio—, así que cada una es una lista de (texto, estilo).
    """
    out, actual = [], []
    for texto, estilo in runs:
        for pieza in re.split(r"(\s+)", texto):
            if not pieza:
                continue
            if pieza.isspace():
                if actual:
                    out.append(actual); actual = []
            elif actual and actual[-1][1] == estilo:
                actual[-1] = (actual[-1][0] + pieza, estilo)
            else:
                actual.append((pieza, estilo))
    if actual:
        out.append(actual)
    return out


def ancho(palabra, cuerpo):
    return sum(F(e).text_length(t, cuerpo) for t, e in palabra)


# ── páginas ────────────────────────────────────────────────────────────────
class Libro:
    """Acumula páginas y el texto pendiente de volcar en cada una."""

    def __init__(self):
        self.doc = fitz.open()
        self.pend = []          # [(punto, texto, fuente, cuerpo, color)]
        self.pagina = None
        self.y = D.BASE_PRIMERA
        self.indice = []        # entradas del sumario: (nivel, texto, nº de página)
        self.cabecera = None    # título corrido del recto
        self.sin_folio = set()

    def nueva(self, con_cabecera=True, base=None):
        self.volcar()
        self.pagina = self.doc.new_page(width=D.PAGINA[0], height=D.PAGINA[1])
        self.y = D.BASE_PRIMERA if base is None else base
        if not con_cabecera:
            self.sin_folio.add(self.doc.page_count - 1)
        return self.pagina

    def escribe(self, x, y, texto, estilo, cuerpo, color):
        if texto:
            self.pend.append(((x, y), texto, estilo, cuerpo, color))

    def volcar(self):
        """Un TextWriter por color: si no, cada texto deja su propio recurso."""
        if not self.pagina or not self.pend:
            self.pend = []
            return
        porcolor = {}
        for punto, texto, estilo, cuerpo, color in self.pend:
            porcolor.setdefault(color, []).append((punto, texto, estilo, cuerpo))
        for color, items in porcolor.items():
            tw = fitz.TextWriter(self.pagina.rect)
            for punto, texto, estilo, cuerpo in items:
                tw.append(punto, texto, font=F(estilo), fontsize=cuerpo)
            tw.write_text(self.pagina, color=color)
        self.pend = []

    def hueco(self, alto):
        """Reserva alto vertical; abre página si no cabe."""
        if self.y + alto > D.BASE_ULTIMA:
            self.nueva()
            return True
        return False

    def salto(self, alto):
        self.y += alto


def partir(runs, cuerpo, anchos, base="light"):
    """Parte en líneas. `anchos` es una función nº de línea → ancho disponible.

    Devuelve [(palabras, ancho_natural_sin_espacios, nº de espacios)].
    """
    esp = F(base).text_length(" ", cuerpo)
    lineas, actual, w = [], [], 0.0
    for pal in palabras(runs):
        wp = ancho(pal, cuerpo)
        extra = esp if actual else 0.0
        if actual and w + extra + wp > anchos(len(lineas)) + 0.01:
            lineas.append((actual, w))
            actual, w = [pal], wp
        else:
            actual.append(pal)
            w += extra + wp
    if actual:
        lineas.append((actual, w))
    return [(ps, w - esp * (len(ps) - 1)) for ps, w in lineas]
