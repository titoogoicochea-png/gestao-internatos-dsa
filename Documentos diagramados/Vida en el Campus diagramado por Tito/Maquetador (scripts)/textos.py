#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Todo lo que cambia entre el portugués y el español, y entre básica y superior.

Las reescrituras del Anexo C son las mismas que usa el generador de los .docx:
el instrumento se publica aparte, así que las remisiones quedarían colgando.
"""

NIVELES = {
    ("pt", "basica"): "EDUCAÇÃO BÁSICA",
    ("pt", "superior"): "EDUCAÇÃO SUPERIOR",
    ("es", "basica"): "EDUCACIÓN BÁSICA",
    ("es", "superior"): "EDUCACIÓN SUPERIOR",
}

SUMARIO = {"pt": "SUMÁRIO", "es": "ÍNDICE"}

PISTA = {
    "pt": "Clique em qualquer item para ir diretamente à seção.",
    "es": "Haz clic en cualquier ítem para ir directamente a la sección.",
}

# cabecera corrida del verso, en tres tramos (el del medio va en ExtraBold)
CABECERA = {
    "pt": [("REFERENCIAL PARA", "mont"), (" GESTÃO DE INTERNATOS ", "montxbold"),
           ("ADVENTISTAS", "mont")],
    "es": [("REFERENCIAL PARA", "mont"), (" GESTIÓN DE INTERNADOS ", "montxbold"),
           ("ADVENTISTAS", "mont")],
}

CAPITULO = {"pt": "Capítulo", "es": "Capítulo"}

CITA = {
    "pt": "“O internato é uma comunidade formativa intencional onde a fé se vive, "
          "o caráter se forma e a missão se aprende.”",
    "es": "“El internado es una comunidad formativa intencional donde la fe se vive, "
          "el carácter se forma y la misión se aprende.”",
}

# Portadilla: qué texto sustituye a cuál. Lo que no aparece aquí no cambia
# («REFERENCIAL PARA» y «ADVENTISTAS» son iguales en los dos idiomas).
PORTADILLA = {
    "pt": {},
    "es": {"GESTÃO DE": "GESTIÓN DE", "INTERNATOS": "INTERNADOS",
           "D I V I S Ã O": "D I V I S I Ó N",
           "S U L - A M E R I C A N A": "S U D A M E R I C A N A",
           "Departamento de Educação": "Departamento de Educación"},
}

SIN_INSTRUMENTO = {
    "pt": [
        (r", e o Anexo C apresenta o Instrumento de Avaliação para a Acreditação de Internatos[^.]*\.",
         ". O Instrumento de Avaliação para a Acreditação é publicado separadamente, como *Formulário de Acreditação de Internatos da Divisão Sul-Americana*."),
        (r"Três anexos complementam o documento", "Dois anexos complementam o documento"),
        (r"no instrumento de acreditação \(Anexo C\)",
         "no *Formulário de Acreditação de Internatos da Divisão Sul-Americana*"),
        (r"do Instrumento de Acreditação \(Anexo C\)",
         "do *Formulário de Acreditação de Internatos da Divisão Sul-Americana*"),
        (r"é apresentado integralmente no \*\*Anexo C\*\* deste documento",
         "é apresentado integralmente no *Formulário de Acreditação de Internatos da Divisão Sul-Americana*, publicado como documento independente"),
    ],
    "es": [
        (r", y el Anexo C presenta el Instrumento de Evaluación para la Acreditación de Internados[^.]*\.",
         ". El Instrumento de Evaluación para la Acreditación se publica por separado, como *Formulario de Acreditación de Internados de la División Sudamericana*."),
        (r"Tres anexos complementan el documento", "Dos anexos complementan el documento"),
        (r"en el instrumento de acreditación \(Anexo C\)",
         "en el *Formulario de Acreditación de Internados de la División Sudamericana*"),
        (r"del Instrumento de Acreditación \(Anexo C\)",
         "del *Formulario de Acreditación de Internados de la División Sudamericana*"),
        (r"es presentado íntegramente en el \*\*Anexo C\*\* de este documento",
         "es presentado íntegramente en el *Formulario de Acreditación de Internados de la División Sudamericana*, publicado como documento independiente"),
    ],
}

# Créditos: lo que rodea a la lista de uniones o de rectores
CRED = {
    "pt": {"uniones": "Diretores de Departamento de Educação das Uniões",
           "rectores": "Reitores e Diretores das Instituições de Ensino Superior",
           "bloques": ["Direção geral", "Comitê central", "Direção autoral",
                       "Colaboradores autorais", "Projeto Gráfico e Capa"]},
    "es": {"uniones": "Directores de Departamento de Educación de las Uniones",
           "rectores": "Rectores y Directores de las Instituciones de Educación Superior",
           "bloques": ["Dirección general", "Comité central", "Dirección autoral",
                       "Colaboradores autorales", "Proyecto Gráfico y Portada"]},
}

COMITE = ("Antonio Marcos Alves, Carlos Alberto Ferri, Félix Wilfredo Terenzio, Herbert Cleber, "
          "Horacio Rizzo, Simei Martins, Wesley Sukowski, Gilberto Damasceno da Silva, Cédrik Sprotte")

COLABORADORES = (
    "Janice Oliveira Teixeira Freitas, Jenniffer Karollayne Gomes Aleoni, Danielle Arantes de "
    "Jesus, Flavia Rizzo, Malvina Ayelen Agüero, Cédrik Sprotte, Denison, Felippe de Amorim "
    "Ferreira, Carlos Alberto Ferri, Herbert Cleber, Gilberto Damasceno da Silva, Claudia "
    "Fernandes dos Santos Faustinoni, Félix Wilfredo Terenzio, Guilherme Saab Lanza, Ana "
    "Cecilia Briceño Sánchez, Simei Martins, Emerson Lemões Motta, Douglas de Souza Reis, "
    "Tito Goicochea Malaver")

# el cuerpo de cada bloque, en el mismo orden que los rótulos de CRED
CUERPOS = ["Antonio Marcos da Silva Alves", COMITE, "Tito Goicochea Malaver",
           COLABORADORES, "Marcos Santos – Beulah Design"]

RECTORES = [
    ("Gabriel Boleas", "Instituto Superior Adventista de Misiones"),
    ("Willian Branga", "Instituto Tecnológico Superior Adventista del Ecuador"),
    ("Jolivê Chaves", "Faculdade Adventista do Paraná"),
    ("Vanderson Costa", "Faculdade Adventista da Amazônia"),
    ("Martin Kuhn", "Centro Universitário Adventista de São Paulo"),
    ("Walter Murillo", "Universidad Peruana Unión"),
    ("Antonio Parra", "Universidad Adventista de Chile"),
    ("Everton Augusto Pinto", "Faculdades Adventistas de Minas Gerais"),
    ("Horacio Rizzo", "Universidad Adventista del Plata"),
    ("Alfredo Santa Cruz", "Universidad Adventista de Bolivia"),
    ("Rubens Silva", "Centro Universitário Adventista de Ensino do Nordeste"),
]


def bloques(lang):
    return list(zip(CRED[lang]["bloques"], CUERPOS))


NEED = {"pt": "Anilce Bittencourt Littke, Eleni Hosokawa Wordel, Selena Castelão Rivas, "
               "Tito Goicochea Malaver e Yessie Smirna Wandersleben Silva",
        "es": "Anilce Bittencourt Littke, Eleni Hosokawa Wordel, Selena Castelão Rivas, "
               "Tito Goicochea Malaver y Yessie Smirna Wandersleben Silva"}

ADMIN = {
    "pt": [("Presidente", "Stanley Arco"),
           ("Vice-presidentes", "Gabriel Cesano e Douglas Menslin"),
           ("Secretário", "Edward Heidinger"),
           ("Tesoureiro", "Edson Erthal de Medeiros"),
           ("Diretor de Educação", "Antonio Marcos da Silva Alves"),
           ("Diretores Associados", "Abel Apaza e Alexander Dutra"),
           ("Núcleo Estratégico Educacional (NEED)", NEED["pt"])],
    "es": [("Presidente", "Stanley Arco"),
           ("Vicepresidentes", "Gabriel Cesano y Douglas Menslin"),
           ("Secretario", "Edward Heidinger"),
           ("Tesorero", "Edson Erthal de Medeiros"),
           ("Director de Educación", "Antonio Marcos da Silva Alves"),
           ("Directores Asociados", "Abel Apaza y Alexander Dutra"),
           ("Núcleo Estratégico Educacional (NEED)", NEED["es"])],
}

_U = [("União Argentina", "Unión Argentina", "Juan José Treiyer"),
      ("União Boliviana", "Unión Boliviana", "Edimar Oliveira Júnior"),
      ("União Centro-Oeste Brasileira", "Unión Centro-Oeste Brasileña", "Irismar Prado Gonçalves"),
      ("União Chilena", "Unión Chilena", "Jorge Iturra Cañas"),
      ("União Central Brasileira", "Unión Central Brasileña", "Renato Lacerda"),
      ("União Equatoriana", "Unión Ecuatoriana", "Mabel Montecinos Bustos"),
      ("União Leste Brasileira", "Unión Este Brasileña", "Everton Agostinho de Souza"),
      ("União Nordeste Brasileira", "Unión Nordeste Brasileña", "Henilson Erthal de Albuquerque"),
      ("União Noroeste Brasileira", "Unión Noroeste Brasileña", "Marcos Antonio da Silva Gomes"),
      ("União Norte Brasileira", "Unión Norte Brasileña", "Fabiana Paulino Alexandre Retamero"),
      ("União Paraguaia", "Unión Paraguaya", "Marco Antônio Leal Góes"),
      ("União Peruana do Norte", "Unión Peruana del Norte", "Edgardo Muguerza Florián"),
      ("União Peruana do Sul", "Unión Peruana del Sur", "Carlos Corrales Ruiz"),
      ("União Sudeste Brasileira", "Unión Sudeste Brasileña", "Éder Fernandes Leal"),
      ("União Sul Brasileira", "Unión Sur Brasileña", "Harryson Kerschner Júlio dos Reis"),
      ("União Uruguaia", "Unión Uruguaya", "Vitor Oliveira Moretti")]

UNIONES = {"pt": [(a, c) for a, b, c in _U], "es": [(b, c) for a, b, c in _U]}


def lista_central(lang, nivel):
    """En básica van los departamentales de educación; en superior, los rectores."""
    if nivel == "superior":
        return CRED[lang]["rectores"], RECTORES
    return CRED[lang]["uniones"], UNIONES[lang]
