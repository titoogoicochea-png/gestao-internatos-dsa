#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""La lámina 4 de la presentación de básica, con el mismo arreglo que la de Superior.

Tito pidió allí que la columna no listara las subdimensiones sino que
describiera la dimensión, y que la letra subiera para que se leyera. Aquí se
reaprovecha `arregla_campus`, que hace exactamente eso: solo se le cambia el
módulo de textos y se le dice que no hay láminas 10-12 que quitar ni frase que
sustituir —la frase de básica ya está puesta desde el guion—.

Uso: python3 arregla_basica.py <es|pt> <entrada.pptx> <salida.pptx>
"""
import sys
import arregla_campus as A

A.D = __import__("dims_bas_" + sys.argv[1])
A.FUERA = {"es": (), "pt": ()}
A.frase = lambda prs: None          # la frase ya es la de básica

if __name__ == "__main__":
    A.LANG, A.ENTRADA, A.SALIDA = sys.argv[1], sys.argv[2], sys.argv[3]
    A.main()
