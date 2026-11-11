#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Portada del Formulario de Vida en el Campus para Educación Básica.

Es la misma composición que la de Superior, con una diferencia que ahorra
trabajo: el arte de básica ya trae «EDUCACIÓN BÁSICA» rasterizado, así que no
hay que reconstruir el rótulo de nivel —en Superior sí hubo que rehacerlo—.
Y el arte portugués de básica es el mismo tamaño que el español (1783 × 2389),
no la reducción a 1621 del arte de Superior, de modo que las medidas del
portugués se igualan a las del español.

Uso: python3 portada_basica.py <es|pt> <jpg salida>
"""
import sys
import portada_form as PF

PF.PT.update(ancho=1783, x0=446, medida=1478, banda=905)

import portada_campus as PC   # noqa: E402  (después de ajustar las medidas)

if __name__ == "__main__":
    PC.main()
