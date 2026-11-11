#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lo propio del Formulario de Acreditación: rótulos, cabecera y justificación.

Lo que comparte con el Referencial —administración, uniones, rectores, bloques
de autoría— se toma de textos.py, que es la misma fuente que usó el maquetador
de los Referenciales.
"""

TITULO = {
    "es": ["FORMULARIO DE", "ACREDITACIÓN", "DE INTERNADOS", "ADVENTISTAS"],
    "pt": ["FORMULÁRIO DE", "ACREDITAÇÃO", "DE INTERNATOS", "ADVENTISTAS"],
}

# cabecera corrida del verso, en tres tramos (el del medio va en ExtraBold)
CABECERA = {
    "pt": [("FORMULÁRIO DE", "mont"), (" ACREDITAÇÃO DE INTERNATOS ", "montxbold"),
           ("ADVENTISTAS", "mont")],
    "es": [("FORMULARIO DE", "mont"), (" ACREDITACIÓN DE INTERNADOS ", "montxbold"),
           ("ADVENTISTAS", "mont")],
}

CITA = {
    "es": "“Acreditar un internado no es clasificarlo: es asegurarle a cada "
          "estudiante que la casa donde vive lo cuida.”",
    "pt": "“Acreditar um internato não é classificá-lo: é assegurar a cada "
          "estudante que a casa onde vive cuida dele.”",
}

ROTULOS = {
    "es": dict(evidencias="EVIDENCIAS", detalle="DETALLE",
               documentos="DOCUMENTOS EN PDF / ANEXO", puntos="PUNTOS",
               nivel="NIVEL DE LOGRO", observacion="OBSERVACIÓN",
               criterio="CRITERIO", meta="META DE VIVENCIA PERCIBIDA",
               orientacion="Orientación al evaluador",
               total="TOTAL", continua="(continúa)",
               criterios="CRITERIOS", dimension="DIMENSIÓN",
               mapa="LAS SEIS DIMENSIONES DE LA EVALUACIÓN",
               mapa_pie="Cada dimensión se evalúa por separado y abre con su propio color. "
                        "El total general del instrumento es de 1.485 puntos "
                        "repartidos en 115 criterios."),
    "pt": dict(evidencias="EVIDÊNCIAS", detalle="DETALHE",
               documentos="DOCUMENTOS EM PDF / ANEXO", puntos="PONTOS",
               nivel="NÍVEL DE ALCANCE", observacion="OBSERVAÇÃO",
               criterio="CRITÉRIO", meta="META DE VIVÊNCIA PERCEBIDA",
               orientacion="Orientação ao avaliador",
               total="TOTAL", continua="(continua)",
               criterios="CRITÉRIOS", dimension="DIMENSÃO",
               mapa="AS SEIS DIMENSÕES DA AVALIAÇÃO",
               mapa_pie="Cada dimensão é avaliada em separado e abre com a sua própria cor. "
                        "O total geral do instrumento é de 1.485 pontos "
                        "repartidos em 115 critérios."),
}

# Qué trae cada sección: va en la portadilla del instrumento, que si no se
# quedaba con un cuarto de página en blanco.
SECCIONES = {
 "es": ("CÓMO ESTÁ ORGANIZADO ESTE FORMULARIO", [
  ("SECCIÓN I", "Información general",
   "Datos de la institución evaluada, propósito y alcance del instrumento, instrucciones "
   "de uso y composición de la comisión evaluadora."),
  ("SECCIÓN II", "Criterios de aprobación y puntaje",
   "La escala de logro por criterio, la equivalencia en puntos y la clasificación que "
   "determina la decisión de acreditación."),
  ("SECCIÓN III", "Evaluación de calidad",
   "El cuerpo del instrumento: seis dimensiones, veintidós subdimensiones y ciento quince "
   "criterios, cada uno con sus evidencias y su meta de vivencia percibida."),
  ("SECCIÓN IV", "Dimensiones de evaluación y calificación final",
   "El traslado de los puntajes obtenidos en cada dimensión y el resultado general de la "
   "institución."),
  ("SECCIÓN V", "Conclusión técnica",
   "Fortalezas identificadas, oportunidades de mejora críticas con su plazo, observaciones "
   "por dimensión y decisión final de la comisión."),
  ("SECCIÓN VI", "Firmas",
   "La suscripción del resultado por los integrantes de la comisión evaluadora."),
 ]),
 "pt": ("COMO ESTÁ ORGANIZADO ESTE FORMULÁRIO", [
  ("SEÇÃO I", "Informação geral",
   "Dados da instituição avaliada, propósito e alcance do instrumento, instruções de uso e "
   "composição da comissão avaliadora."),
  ("SEÇÃO II", "Critérios de aprovação e pontuação",
   "A escala de alcance por critério, a equivalência em pontos e a classificação que "
   "determina a decisão de acreditação."),
  ("SEÇÃO III", "Avaliação da qualidade",
   "O corpo do instrumento: seis dimensões, vinte e duas subdimensões e cento e quinze "
   "critérios, cada um com as suas evidências e a sua meta de vivência percebida."),
  ("SEÇÃO IV", "Dimensões de avaliação e classificação final",
   "A transferência das pontuações obtidas em cada dimensão e o resultado geral da "
   "instituição."),
  ("SEÇÃO V", "Conclusão técnica",
   "Forças identificadas, oportunidades de melhoria críticas com o seu prazo, observações "
   "por dimensão e decisão final da comissão."),
  ("SEÇÃO VI", "Assinaturas",
   "A subscrição do resultado pelos integrantes da comissão avaliadora."),
 ]),
}

# La leyenda del bloque de criterio: va bajo el mapa de dimensiones, en la
# apertura de la Sección III, que es donde empieza a usarse el instrumento.
COLUMNAS = {
 "es": ("CÓMO SE LEE CADA CRITERIO",
        "Cada criterio ocupa un bloque. La banda de color lleva su número, su enunciado y "
        "su puntaje máximo; debajo van las evidencias que lo sustentan y, al pie, la "
        "casilla que marca la comisión.", [
  ("EVIDENCIAS", "Qué hay que reunir",
   "Los documentos y registros que la institución debe presentar para ese criterio. "
   "Un criterio sin evidencia se califica como No Atiende."),
  ("DETALLE", "Qué se espera de cada evidencia",
   "Alcance, periodicidad, muestra o formato: lo que convierte un documento genérico en "
   "una prueba verificable."),
  ("DOCUMENTOS", "Cómo se entrega",
   "El archivo en PDF o el anexo concreto que la comisión revisará en la autoevaluación "
   "y en la visita."),
  ("NIVEL DE LOGRO", "Lo que marca el evaluador",
   "Una sola casilla por criterio, con el rango de puntos de cada nivel. El puntaje de la "
   "evaluación in situ es el que se consolida."),
  ("OBSERVACIÓN", "Por qué se decidió así",
   "El fundamento del nivel asignado y lo que falta para alcanzar el siguiente. Es la "
   "base del plan de mejora."),
 ]),
 "pt": ("COMO SE LÊ CADA CRITÉRIO",
        "Cada critério ocupa um bloco. A faixa de cor leva o seu número, o seu enunciado e "
        "a sua pontuação máxima; abaixo vão as evidências que o sustentam e, ao pé, a "
        "casa que a comissão assinala.", [
  ("EVIDÊNCIAS", "O que é preciso reunir",
   "Os documentos e registros que a instituição deve apresentar para esse critério. "
   "Um critério sem evidência é classificado como Não Atende."),
  ("DETALHE", "O que se espera de cada evidência",
   "Alcance, periodicidade, amostra ou formato: o que transforma um documento genérico "
   "numa prova verificável."),
  ("DOCUMENTOS", "Como se entrega",
   "O arquivo em PDF ou o anexo concreto que a comissão revisará na autoavaliação e na "
   "visita."),
  ("NÍVEL DE ALCANCE", "O que o avaliador assinala",
   "Uma só casa por critério, com a faixa de pontos de cada nível. A pontuação da "
   "avaliação in situ é a que se consolida."),
  ("OBSERVAÇÃO", "Por que se decidiu assim",
   "O fundamento do nível atribuído e o que falta para alcançar o seguinte. É a base do "
   "plano de melhoria."),
 ]),
}

JUSTIFICACION = {
"es": """# JUSTIFICACIÓN Y RELEVANCIA

## Por qué el internado necesita un instrumento propio

La educación adventista evalúa la calidad de sus instituciones desde hace décadas, y lo
hace bien: hay criterios, hay evidencias y hay una cultura de revisión periódica que ha
sostenido el nivel de la red. Pero todos esos instrumentos fueron pensados para la
jornada escolar —el aula, el currículo, la gestión académica, la infraestructura
docente—, y describen a la institución mientras el estudiante está en clase. En un
internado, eso deja fuera la mayor parte de lo que forma.

Un residente pasa en el campus alrededor de veinte horas de cada veinticuatro. Come
allí, duerme allí, estudia allí, se enferma allí, discute con sus compañeros allí y,
sobre todo, allí vive su fe o la pierde. Las horas que no transcurren en el aula no son
el margen de la formación: son su mayor parte. Un instrumento que no las mire puede
acreditar como excelente a una institución cuya residencia está mal atendida, y ese
silencio tiene consecuencias reales sobre adolescentes y jóvenes que viven lejos de su
casa.

## Qué mide este formulario

Este instrumento traduce a criterios verificables los principios del *Referencial para
la Gestión de Internados Adventistas*. Está organizado en **seis dimensiones, veintidós
subdimensiones y ciento quince criterios**, con un total de **1.485 puntos**. Las cinco
primeras dimensiones evalúan a la institución como institución educativa: su identidad
confesional, su liderazgo, su gestión pedagógica, sus recursos y la convivencia que
promueve. La sexta —Vida en el Campus, doscientos cincuenta puntos— evalúa la casa: el
equipo residencial, los espacios y la rutina, la vida espiritual, la salud y la
protección del residente, y lo que ocurre en el tiempo libre.

Cada criterio pide evidencia. No se puntúa una intención ni una declaración de
principios: se puntúa un documento, un registro, una fotografía fechada, una planilla de
asistencia, un acta. Un criterio sin evidencia se califica como **No Atiende**, aunque la
práctica exista. Esa severidad es deliberada: lo que no se registra no se puede
sostener en el tiempo ni transferir al equipo que venga después.

## La vivencia percibida

Hay una decisión metodológica que atraviesa todo el instrumento y conviene explicarla.
Cada subdimensión cierra con una **meta de vivencia percibida**, expresada en primera
persona y en la voz del estudiante, y referida a los índices ILE e IVC del Referencial.
No es un criterio puntuable más: es el contraste entre lo que la institución documenta y
lo que el residente experimenta.

Una institución puede presentar el plan de cuidado espiritual completo y bien archivado,
y aun así recibir de sus estudiantes la respuesta de que los cultos no les dicen nada.
Las dos cosas son información, y la segunda es la que importa. El formulario obliga a
mirarlas juntas.

## Alcance regional

Este es un **instrumento de aplicación regional**, elaborado para los ocho países de la
División Sudamericana. Los criterios legales, fiscales, sanitarios y de evaluación del
aprendizaje se interpretan conforme a la legislación y la nomenclatura vigentes en cada
país; las referencias a organismos de gobierno, registros fiscales, certificaciones y
niveles de enseñanza están expresadas de forma genérica, y cada Unión o Campo presenta el
documento equivalente en su territorio. La equivalencia no rebaja la exigencia: la
traduce.

## Para qué sirve el resultado

La acreditación no termina con una clasificación. Termina con un retrato verificable de
dónde está cada internado, con las fortalezas que debe conservar y con las oportunidades
de mejora críticas, cada una con un plazo. El propósito de acreditar un internado
adventista no es ordenarlo en una lista, sino asegurar que la casa donde viven nuestros
estudiantes cuide de ellos tan bien como la escuela donde estudian.
""",

"pt": """# JUSTIFICATIVA E RELEVÂNCIA

## Por que o internato precisa de um instrumento próprio

A educação adventista avalia a qualidade de suas instituições há décadas, e o faz bem:
há critérios, há evidências e há uma cultura de revisão periódica que sustentou o nível
da rede. Mas todos esses instrumentos foram pensados para a jornada escolar —a sala de
aula, o currículo, a gestão acadêmica, a infraestrutura docente— e descrevem a
instituição enquanto o estudante está em aula. Num internato, isso deixa de fora a maior
parte daquilo que forma.

Um residente passa no campus cerca de vinte horas de cada vinte e quatro. Come ali,
dorme ali, estuda ali, adoece ali, discute com os colegas ali e, sobretudo, ali vive a
sua fé ou a perde. As horas que não transcorrem na sala de aula não são a margem da
formação: são a sua maior parte. Um instrumento que não as observe pode acreditar como
excelente uma instituição cuja residência está malcuidada, e esse silêncio tem
consequências reais sobre adolescentes e jovens que vivem longe de casa.

## O que este formulário mede

Este instrumento traduz em critérios verificáveis os princípios do *Referencial para a
Gestão de Internatos Adventistas*. Está organizado em **seis dimensões, vinte e duas
subdimensões e cento e quinze critérios**, com um total de **1.485 pontos**. As cinco
primeiras dimensões avaliam a instituição como instituição educativa: sua identidade
confessional, sua liderança, sua gestão pedagógica, seus recursos e a convivência que
promove. A sexta —Vida no Campus, duzentos e cinquenta pontos— avalia a casa: a equipe
residencial, os espaços e a rotina, a vida espiritual, a saúde e a proteção do residente,
e o que acontece no tempo livre.

Cada critério pede evidência. Não se pontua uma intenção nem uma declaração de
princípios: pontua-se um documento, um registro, uma fotografia datada, uma lista de
presença, uma ata. Um critério sem evidência é classificado como **Não Atende**, ainda
que a prática exista. Esse rigor é deliberado: o que não se registra não se sustenta no
tempo nem se transfere à equipe que vier depois.

## A vivência percebida

Há uma decisão metodológica que atravessa todo o instrumento e convém explicá-la. Cada
subdimensão encerra com uma **meta de vivência percebida**, expressa na primeira pessoa e
na voz do estudante, e referida aos índices ILE e IVC do Referencial. Não é mais um
critério pontuável: é o contraste entre o que a instituição documenta e o que o residente
experimenta.

Uma instituição pode apresentar o plano de cuidado espiritual completo e bem arquivado e,
ainda assim, receber de seus estudantes a resposta de que os cultos não lhes dizem nada.
As duas coisas são informação, e a segunda é a que importa. O formulário obriga a
olhá-las juntas.

## Alcance regional

Este é um **instrumento de aplicação regional**, elaborado para os oito países da Divisão
Sul-Americana. Os critérios legais, fiscais, sanitários e de avaliação da aprendizagem
interpretam-se conforme a legislação e a nomenclatura vigentes em cada país; as
referências a órgãos de governo, registros fiscais, certificações e níveis de ensino
estão expressas de forma genérica, e cada União ou Campo apresenta o documento
equivalente em seu território. A equivalência não reduz a exigência: traduz-a.

## Para que serve o resultado

A acreditação não termina com uma classificação. Termina com um retrato verificável de
onde está cada internato, com as forças que deve conservar e com as oportunidades de
melhoria críticas, cada uma com um prazo. O propósito de acreditar um internato
adventista não é ordená-lo numa lista, mas assegurar que a casa onde vivem os nossos
estudantes cuide deles tão bem quanto a escola onde estudam.
""",
}
