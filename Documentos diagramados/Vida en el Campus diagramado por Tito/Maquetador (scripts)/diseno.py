#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""El sistema de diseño del Referencial, medido sobre el diagramado de Básica.

Todas las cifras salen de `get_text("dict")` sobre el PDF de Beulah: posiciones
de origen, cuerpos, interlineados y colores. No hay ninguna inventada.
"""

PAGINA = (581.1, 779.5)

# Caja de texto
IZQ, DER = 62.36, 522.0
SANGRIA = 19.84              # primera línea de párrafo: 82.2
CITA_IZQ, CITA_DER = 96.4, 499.1
LISTA_IZQ, LISTA_COLG = 82.2, 97.7

# Flujo vertical
BASE_PRIMERA = 98.0          # primera línea de una página corriente
BASE_ULTIMA = 722.0
INTERLINEA = 16.0

# Colores
AZUL = (0x0F / 255, 0x32 / 255, 0x82 / 255)
CIAN = (0x0A / 255, 0xB4 / 255, 0xD2 / 255)
NARANJA = (0xF0 / 255, 0x82 / 255, 0x5A / 255)
GRIS = (0x99 / 255, 0x99 / 255, 0x99 / 255)
GRIS_AZUL = (0x9F / 255, 0xAD / 255, 0xCD / 255)
NEGRO = (0, 0, 0)
BLANCO = (1, 1, 1)
GRIS_TEXTO = (0x4D / 255, 0x4D / 255, 0x4D / 255)

# Tablas (medidas en el Anexo A)
TB_BANDA = (0.078, 0.275, 0.588)
TB_BORDE_CAB = (0.424, 0.824, 0.894)
TB_BORDE = (0.616, 0.882, 0.929)
TB_CEBRA = (0.914, 0.974, 0.984)

# Cabecera corrida
CAB_BASE = 60.25
CAB_IZQ = 62.36
CAB_DER = 518.7

# Apertura de capítulo
CAP_X = 177.0
# «Capítulo I» va siempre 32 pt por encima de la primera línea del título,
# no en un alto fijo: con títulos de dos o tres líneas se montaba encima.
CAP_ETIQUETA_SOBRE = 32.0
CAP_TITULO_CENTRO = 128.7    # bloque centrado vertical, interlínea 32
CAP_TITULO_INTER = 32.0
CAP_PREGUNTA_BASE = 261.0    # Lato-Black 13 azul, en IZQ
CAP_CUERPO_BASE = 290.0

# Apertura de anexo
ANX_CUADRO = (48.3, 53.1, 102.4, 107.1)
ANX_MARCO = (44.8, 49.6, 105.9, 110.7)
ANX_BASE = 94.8
# La inicial va centrada en el cuadro y el resto arranca siempre en el mismo
# sitio, ya fuera de él: así lo hace el original con A, R y S por igual.
ANX_CENTRO = 75.35
ANX_RESTO_X = 105.87
ANX_CUERPO_BASE = 210.0

# Referencias
REF_CUERPO = 9.0
REF_INTERLINEA = 10.8
REF_ENTRE = 15.1
REF_COLGANTE = 11.4

# Sumario
SUM_NIVELES = {1: 62.4, 2: 76.5, 3: 90.7}
SUM_DER = 515.9
