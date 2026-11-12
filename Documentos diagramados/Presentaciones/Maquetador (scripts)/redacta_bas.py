#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""La lámina 3 del Referencial de básica, con el arreglo que Tito pidió en Superior.

Reaprovecha `redacta_esquema`, que cambia el listado de contenidos por una
redacción que responde la pregunta y sube el cuerpo de toda la columna. Solo se
le cambia el módulo de textos.

Uso: python3 redacta_bas.py <es|pt> <entrada.pptx> <salida.pptx>
"""
import sys, importlib
import redacta_esquema as R

if __name__ == "__main__":
    R.LANG, R.ENTRADA, R.SALIDA = sys.argv[1], sys.argv[2], sys.argv[3]
    R.T = importlib.import_module("textos_bas_" + sys.argv[1])
    R.main()
