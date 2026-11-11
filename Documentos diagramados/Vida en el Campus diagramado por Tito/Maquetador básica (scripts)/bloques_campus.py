# -*- coding: utf-8 -*-
"""Las subdimensiones: cómo se agrupan los criterios dentro de cada dimensión.

El instrumento se redactó por criterios correlativos, sin subdimensiones. La
tabla consolidada las pide, así que se agrupan en cuatro bloques por dimensión,
siempre con criterios contiguos, y sus puntos suman exactamente los de la
dimensión.
"""

# (rótulo es, rótulo pt, números de criterio)
BLOQUES = {
 1: [("1.1 Dotación y cobertura", "1.1 Dotação e cobertura", [1]),
     ("1.2 Idoneidad y verificación", "1.2 Idoneidade e verificação", [2, 3]),
     ("1.3 Formación y acompañamiento individual",
      "1.3 Formação e acompanhamento individual", [4, 5]),
     ("1.4 Cuidado del equipo y continuidad",
      "1.4 Cuidado da equipe e continuidade", [6, 7, 8, 9])],
 2: [("2.1 Espacios y mantenimiento", "2.1 Espaços e manutenção", [10, 11]),
     ("2.2 Rutina y alimentación", "2.2 Rotina e alimentação", [12, 13]),
     ("2.3 Estudio y conectividad", "2.3 Estudo e conectividade", [14, 15]),
     ("2.4 Norma, reclamo y participación",
      "2.4 Norma, reclamação e participação", [16, 17, 18])],
 3: [("3.1 Culto y sábado", "3.1 Culto e sábado", [19, 20]),
     ("3.2 Acompañamiento pastoral y pequeños grupos",
      "3.2 Acompanhamento pastoral e pequenos grupos", [21, 22]),
     ("3.3 Formación bíblica y misión", "3.3 Formação bíblica e missão", [23, 24]),
     ("3.4 Protagonismo, espacios e índice",
      "3.4 Protagonismo, espaços e índice", [25, 26, 27])],
 4: [("4.1 Salud y medicación", "4.1 Saúde e medicação", [28, 29]),
     ("4.2 Atención psicológica y seguridad",
      "4.2 Atendimento psicológico e segurança", [30, 31]),
     ("4.3 Emergencias y protección", "4.3 Emergências e proteção", [32, 33]),
     ("4.4 Notificación, prevención y seguimiento",
      "4.4 Notificação, prevenção e acompanhamento", [34, 35, 36, 37])],
 5: [("5.1 Deporte y cultura", "5.1 Esporte e cultura", [38, 39]),
     ("5.2 Naturaleza y tiempo libre", "5.2 Natureza e tempo livre", [40, 41]),
     ("5.3 Acuerdo y comunicación con la familia",
      "5.3 Acordo e comunicação com a família", [42, 43]),
     ("5.4 Formación de padres y visitas",
      "5.4 Formação de pais e visitas", [44, 45])],
}


def de(dim, lang):
    """[(rótulo, [criterios], puntos)] de una dimensión, en su idioma."""
    i = 0 if lang == "es" else 1
    por_num = {c["num"]: c for c in dim["criterios"]}
    out = []
    for fila in BLOQUES[dim["n"]]:
        crits = [por_num[n] for n in fila[2]]
        out.append((fila[i], crits, sum(c["puntos"] for c in crits)))
    return out
