#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Medidas y paleta del Formulario de Acreditación.

La retícula es la del Referencial (diseno.py): mismo papel, misma caja, mismo
folio corrido, para que los dos documentos sean la misma familia. Lo propio de
aquí es la paleta —una por dimensión, tomada tal cual del .docx que va a
aprobación— y las medidas del bloque de criterio.
"""
import diseno as D

X0, X1 = D.IZQ, 518.0
ANCHO = X1 - X0

# Cuerpo de texto del instrumento: más apretado que el del Referencial porque
# es un formulario, no una lectura seguida.
CU = 9.0
INTER = 11.0
CU_MENOR = 8.0
PAD = 4.6

# Bloque de criterio
CRIT_ALTO = 15.0           # alto mínimo de la banda del enunciado
CRIT_FILETE = 3.2          # el filete de color que abre la banda
NUM_ANCHO = 26.0           # columna del número de criterio
PTS_ANCHO = 40.0           # columna del puntaje, a la derecha de la banda
CASILLA = 6.4              # lado de la casilla de verificación

# Tres columnas de evidencia: evidencia, detalle, documentos
COLS = (0.335, 0.3325, 0.3325)


def _c(h):
    return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255)


# Paleta por dimensión, con los mismos valores del .docx: oscuro, medio, claro.
PALETA = {
    0: (_c("1F3864"), _c("2E75B6"), _c("EBF3FB")),   # institucional
    1: (_c("1F3864"), _c("2E75B6"), _c("E8EEF7")),   # identidad institucional
    2: (_c("12495A"), _c("1F7A94"), _c("E3F1F5")),   # liderazgo y gestión
    3: (_c("15503B"), _c("24805F"), _c("E4F2EC")),   # gestión pedagógica
    4: (_c("5C4410"), _c("8F6A16"), _c("F5EEDF")),   # gestión de recursos
    5: (_c("5C2530"), _c("8E3B4A"), _c("F6E9EC")),   # ciudadanía y convivencia
    6: (_c("392F63"), _c("5B4B93"), _c("ECE9F5")),   # vida en el campus
}

FILETE = _c("C9D6E8")        # filete de las tablas, neutro
GRIS = _c("3B3B3B")          # el gris del texto del .docx
GRIS_CLARO = _c("8A8A8A")
LINEA_RELLENO = _c("9BA7B8")  # la raya donde se escribe a mano
