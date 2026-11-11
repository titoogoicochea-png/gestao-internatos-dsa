# -*- coding: utf-8 -*-
"""Las subdimensiones: cómo se agrupan los criterios dentro de cada dimensión.

El instrumento se redactó por criterios correlativos, sin subdimensiones. La
tabla consolidada las pide, así que se toman las mismas agrupaciones que ya usa
la presentación (guion_campus.py): no son una invención nueva, y sus puntos
suman exactamente los de la dimensión.
"""

# (rótulo es, rótulo pt, números de criterio)
BLOQUES = {
 1: [("1.1 Dotación y cobertura", "1.1 Dotação e cobertura", [1]),
     ("1.2 Perfil y formación del equipo", "1.2 Perfil e formação da equipe", [2, 3]),
     ("1.3 Acompañamiento individual", "1.3 Acompanhamento individual", [4]),
     ("1.4 Cuidado del equipo y continuidad",
      "1.4 Cuidado da equipe e continuidade", [5, 6, 7, 8, 9])],
 2: [("2.1 Espacios y mantenimiento", "2.1 Espaços e manutenção", [10, 11]),
     ("2.2 Rutina y alimentación", "2.2 Rotina e alimentação", [12, 13]),
     ("2.3 Estudio, descanso y conectividad",
      "2.3 Estudo, descanso e conectividade", [14, 15]),
     ("2.4 Norma, gobierno y acceso", "2.4 Norma, governo e acesso", [16, 17, 18, 19])],
 3: [("3.1 Cultos y calendario espiritual",
      "3.1 Cultos e calendário espiritual", [20, 21]),
     ("3.2 Pequeños grupos y mentoría", "3.2 Pequenos grupos e mentoria", [22, 23]),
     ("3.3 Vivencia sabática y protagonismo",
      "3.3 Vivência sabática e protagonismo", [24, 25]),
     ("3.4 Misión, fe y profesión", "3.4 Missão, fé e profissão", [26, 27, 28])],
 4: [("4.1 Atención de salud y psicológica",
      "4.1 Atendimento de saúde e psicológico", [29, 30]),
     ("4.2 Protocolos y seguridad del campus",
      "4.2 Protocolos e segurança do campus", [31, 32]),
     ("4.3 Protección integral", "4.3 Proteção integral", [33]),
     ("4.4 Prevención, formación y seguimiento",
      "4.4 Prevenção, formação e acompanhamento", [34, 35, 36, 37])],
 5: [("5.1 Deporte y actividad física", "5.1 Esporte e atividade física", [38]),
     ("5.2 Música, arte y cultura", "5.2 Música, arte e cultura", [39]),
     ("5.3 Tiempo libre y naturaleza", "5.3 Tempo livre e natureza", [40, 41]),
     ("5.4 Familia, comunidad e infraestructura",
      "5.4 Família, comunidade e infraestrutura", [42, 43, 44, 45])],
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
