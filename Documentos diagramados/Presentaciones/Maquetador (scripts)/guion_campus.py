#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""El guion de la presentación del Formulario de Vida en el Campus.

Mismo esquema que la del Formulario de Acreditación —portada, la idea, el mapa,
el esquema integrado, una lámina por dimensión, la anatomía del criterio, la
escala, la vivencia percibida, la clasificación y el cierre—, con cinco
dimensiones en vez de seis.

Los nombres, los puntos y los criterios salen de doc_es.py / doc_pt.py, que son
la fuente del documento; las preguntas, las glosas y las ideas están escritas
para la sala.
"""

# Paleta saturada, en el orden de los colores que el documento da a cada
# dimensión: cian, oliva, violeta, verde azulado y carmín.
PALETA = [
    ((0x08, 0x33, 0x44), (0x0E, 0x74, 0x90), (0xE0, 0xF2, 0xF7)),
    ((0x36, 0x53, 0x14), (0x4D, 0x7C, 0x0F), (0xEF, 0xF5, 0xE2)),
    ((0x3B, 0x07, 0x64), (0x6D, 0x28, 0xD9), (0xEE, 0xE9, 0xFB)),
    ((0x04, 0x2F, 0x2E), (0x0F, 0x76, 0x6E), (0xE0, 0xF2, 0xF0)),
    ((0x4C, 0x05, 0x19), (0xBE, 0x12, 0x3C), (0xFC, 0xE7, 0xEC)),
]

# Las rampas de la escala y de la clasificación: de lo logrado a lo insuficiente.
# No salen de la paleta de dimensiones, que aquí solo tiene cinco colores y
# repetía tonos en niveles distintos.
ESCALA_COLORES = [(0x0F, 0x76, 0x6E), (0x0E, 0x74, 0x90), (0x8F, 0x6A, 0x16),
                  (140, 150, 168)]
DECISION_COLORES = [(0x0F, 0x76, 0x6E), (0x0E, 0x74, 0x90), (0x8F, 0x6A, 0x16),
                    (0xBE, 0x12, 0x3C), (0x4C, 0x05, 0x19)]

COMUN = {
    "es": dict(division=("DIVISIÓN SUDAMERICANA", "Departamento de Educación"),
               nivel="EDUCACIÓN SUPERIOR", anio="2026",
               propuesta="PROPUESTA PARA APROBACIÓN"),
    "pt": dict(division=("DIVISÃO SUL-AMERICANA", "Departamento de Educação"),
               nivel="EDUCAÇÃO SUPERIOR", anio="2026",
               propuesta="PROPOSTA PARA APROVAÇÃO"),
}

ROTULOS = {"es": dict(claves="EN CLAVE", idea="LA IDEA QUE DEJA ESTA DIMENSIÓN",
                      contiene="LO QUE EVALÚA", capitulo="Dimensión"),
           "pt": dict(claves="EM CHAVE", idea="A IDEIA QUE ESTA DIMENSÃO DEIXA",
                      contiene="O QUE AVALIA", capitulo="Dimensão")}

DIMENSIONES = {
 "es": [
  dict(num="1", clave="EQUIPO", nombre="EQUIPO RESIDENCIAL Y PRECEPTORÍA",
       puntos="120", criterios="9",
       pregunta="¿Hay adultos preparados y suficientes que acompañan al residente?",
       partes=[("1.1 Dotación y cobertura · 15 puntos",
                "Equipo dimensionado para la población real, con turnos cubiertos, "
                "incluidos el nocturno y el fin de semana."),
               ("1.2 Perfil y formación · 30 puntos",
                "Membresía, formación denominacional y capacitación en lo que de "
                "verdad van a enfrentar: crisis, conflictos y primeros auxilios."),
               ("1.3 Acompañamiento individual · 15 puntos",
                "Cada residente con un adulto de referencia que lo conoce por su "
                "nombre, y registro de ese seguimiento."),
               ("1.4 Cuidado del equipo y continuidad · 60 puntos",
                "Descanso, apoyo emocional, coordinación entre áreas, evaluación de "
                "desempeño y traspaso cuando alguien se va.")],
       claves=[("El punto ciego", "Nadie evalúa quién responde a las tres de la mañana"),
               ("Lo que se olvida", "Un equipo agotado no acompaña: solo vigila")],
       idea="Un campus con instalaciones excelentes y sin equipo suficiente es un "
            "alojamiento. Lo que hace internado a un internato son los adultos."),
  dict(num="2", clave="ESPACIOS", nombre="ESPACIOS, RUTINA Y AUTONOMÍA",
       puntos="130", criterios="10",
       pregunta="¿Los espacios, la rutina y las normas sostienen una vida adulta, sana y estudiosa?",
       partes=[("2.1 Espacios y mantenimiento · 30 puntos",
                "Dormitorios y áreas comunes adecuados, con plan de mantenimiento "
                "verificado y canal de reparaciones que responde."),
               ("2.2 Rutina y alimentación · 30 puntos",
                "Una rutina publicada y compatible con prácticas y laboratorios, y un "
                "menú firmado por profesional habilitado."),
               ("2.3 Estudio, descanso y conectividad · 25 puntos",
                "Espacios diferenciados y una política de dispositivos que protege el "
                "descanso nocturno."),
               ("2.4 Norma, gobierno y acceso · 45 puntos",
                "Reglamento suscrito con debido proceso, consejo de residentes con "
                "respuesta institucional, accesibilidad y condiciones contractuales.")],
       claves=[("Lo propio de superior", "La norma no se impone: se pacta con un adulto"),
               ("El dato duro", "El horario de silencio es una decisión académica")],
       idea="La rutina de un internado universitario no se calca de la del colegio: "
            "tiene que convivir con la carga académica y con la autonomía."),
  dict(num="3", clave="ESPÍRITU", nombre="VIDA ESPIRITUAL EN EL CAMPUS",
       puntos="120", criterios="9",
       pregunta="¿La fe se vive en el campus de un modo que el residente reconoce como propio?",
       partes=[("3.1 Cultos y calendario espiritual · 35 puntos",
                "Cultos de residencia planificados y evaluados, Semana de Oración y "
                "calendario propio del residencial."),
               ("3.2 Pequeños grupos y mentoría · 30 puntos",
                "Grupos con liderazgo formado y mentoría espiritual individual "
                "accesible, con capellanía disponible."),
               ("3.3 Vivencia sabática y protagonismo · 25 puntos",
                "Una propuesta para todo el sábado y residentes con función real en "
                "la iglesia del campus."),
               ("3.4 Misión, fe y profesión · 30 puntos",
                "Proyectos de servicio, integración entre fe y carrera, y medición "
                "de la satisfacción espiritual.")],
       claves=[("El cambio de criterio", "No se mide asistencia: se mide calidad y voz propia"),
               ("La evidencia", "La fe forzada produce presencia sin adhesión")],
       idea="Esta es la dimensión que justifica la existencia del internado "
            "adventista. Si falla, lo demás es un alojamiento digno."),
  dict(num="4", clave="CUIDADO", nombre="SALUD, BIENESTAR Y PROTECCIÓN",
       puntos="120", criterios="9",
       pregunta="¿Están protegidas su salud, su estabilidad emocional y su integridad?",
       partes=[("4.1 Atención de salud y psicológica · 35 puntos",
                "Ficha, medicación y red asistencial; y atención psicológica "
                "profesional, accesible y confidencial."),
               ("4.2 Protocolos y seguridad del campus · 30 puntos",
                "Qué se hace ante una emergencia médica, una crisis o un accidente, "
                "y un plan de evacuación que se ensaya."),
               ("4.3 Protección integral · 15 puntos",
                "Política contra el abuso, el acoso y la violencia, con canal de "
                "denuncia que el residente puede usar."),
               ("4.4 Prevención, formación y seguimiento · 40 puntos",
                "Promoción de la salud, primeros auxilios, registro de incidentes y "
                "seguimiento de la salud mental.")],
       claves=[("La realidad", "A las dos de la mañana, la institución es el único recurso"),
               ("La prueba", "Un protocolo que nadie sabe aplicar no existe")],
       idea="Proteger al residente no es un requisito legal que se cumple: es la "
            "forma más concreta en que una institución adventista muestra lo que cree."),
  dict(num="5", clave="VÍNCULO", nombre="RECREACIÓN, CULTURA Y VÍNCULO",
       puntos="110", criterios="8",
       pregunta="¿El tiempo libre forma, y la familia y la comunidad siguen presentes?",
       partes=[("5.1 Deporte y actividad física · 15 puntos",
                "Un programa con horarios, espacios y responsables, también el fin "
                "de semana."),
               ("5.2 Música, arte y cultura · 15 puntos",
                "Coros, conjuntos, teatro y artes visuales con participación real de "
                "los residentes."),
               ("5.3 Tiempo libre y naturaleza · 30 puntos",
                "Una oferta publicada para el sábado por la tarde y el domingo, y el "
                "entorno natural usado como recurso formativo."),
               ("5.4 Familia, comunidad e infraestructura · 50 puntos",
                "Comunicación ordenada con las familias, servicio junto a la iglesia "
                "local, instalaciones en uso y acompañamiento del egreso.")],
       claves=[("El vacío", "Un campus que no organiza el tiempo libre lo entrega a la pantalla"),
               ("El límite", "Sin comunidad fuera, el campus se vuelve un mundo cerrado")],
       idea="Entre el final de la clase y el silencio nocturno no hay tiempo vacío: "
            "hay currículo en otro horario."),
 ],
 "pt": [
  dict(num="1", clave="EQUIPE", nombre="EQUIPE RESIDENCIAL E PRECEPTORIA",
       puntos="120", criterios="9",
       pregunta="Há adultos preparados e suficientes que acompanham o residente?",
       partes=[("1.1 Dotação e cobertura · 15 pontos",
                "Equipe dimensionada para a população real, com turnos cobertos, "
                "inclusive o noturno e o fim de semana."),
               ("1.2 Perfil e formação · 30 pontos",
                "Membresia, formação denominacional e capacitação naquilo que de fato "
                "vão enfrentar: crises, conflitos e primeiros socorros."),
               ("1.3 Acompanhamento individual · 15 pontos",
                "Cada residente com um adulto de referência que o conhece pelo nome, e "
                "registro desse acompanhamento."),
               ("1.4 Cuidado da equipe e continuidade · 60 pontos",
                "Descanso, apoio emocional, coordenação entre áreas, avaliação de "
                "desempenho e transferência quando alguém sai.")],
       claves=[("O ponto cego", "Ninguém avalia quem responde às três da manhã"),
               ("O que se esquece", "Uma equipe esgotada não acompanha: apenas vigia")],
       idea="Um campus com instalações excelentes e sem equipe suficiente é um "
            "alojamento. O que faz de um internato um internato são os adultos."),
  dict(num="2", clave="ESPAÇOS", nombre="ESPAÇOS, ROTINA E AUTONOMIA",
       puntos="130", criterios="10",
       pregunta="Os espaços, a rotina e as normas sustentam uma vida adulta, sadia e estudiosa?",
       partes=[("2.1 Espaços e manutenção · 30 pontos",
                "Dormitórios e áreas comuns adequados, com plano de manutenção "
                "verificado e canal de reparos que responde."),
               ("2.2 Rotina e alimentação · 30 pontos",
                "Uma rotina publicada e compatível com práticas e laboratórios, e um "
                "cardápio assinado por profissional habilitado."),
               ("2.3 Estudo, descanso e conectividade · 25 pontos",
                "Espaços diferenciados e uma política de dispositivos que protege o "
                "descanso noturno."),
               ("2.4 Norma, governo e acesso · 45 pontos",
                "Regulamento subscrito com devido processo, conselho de residentes com "
                "resposta institucional, acessibilidade e condições contratuais.")],
       claves=[("O próprio do superior", "A norma não se impõe: pactua-se com um adulto"),
               ("O dado duro", "O horário de silêncio é uma decisão acadêmica")],
       idea="A rotina de um internato universitário não se decalca da do colégio: tem "
            "de conviver com a carga acadêmica e com a autonomia."),
  dict(num="3", clave="ESPÍRITO", nombre="VIDA ESPIRITUAL NO CAMPUS",
       puntos="120", criterios="9",
       pregunta="A fé é vivida no campus de um modo que o residente reconhece como próprio?",
       partes=[("3.1 Cultos e calendário espiritual · 35 pontos",
                "Cultos de residência planejados e avaliados, Semana de Oração e "
                "calendário próprio do residencial."),
               ("3.2 Pequenos grupos e mentoria · 30 pontos",
                "Grupos com liderança formada e mentoria espiritual individual "
                "acessível, com capelania disponível."),
               ("3.3 Vivência sabática e protagonismo · 25 pontos",
                "Uma proposta para todo o sábado e residentes com função real na igreja "
                "do campus."),
               ("3.4 Missão, fé e profissão · 30 pontos",
                "Projetos de serviço, integração entre fé e curso, e medição da "
                "satisfação espiritual.")],
       claves=[("A mudança de critério", "Não se mede frequência: mede-se qualidade e voz própria"),
               ("A evidência", "A fé forçada produz presença sem adesão")],
       idea="Esta é a dimensão que justifica a existência do internato adventista. Se "
            "falha, o resto é um alojamento digno."),
  dict(num="4", clave="CUIDADO", nombre="SAÚDE, BEM-ESTAR E PROTEÇÃO",
       puntos="120", criterios="9",
       pregunta="Estão protegidas a sua saúde, a sua estabilidade emocional e a sua integridade?",
       partes=[("4.1 Atendimento de saúde e psicológico · 35 pontos",
                "Ficha, medicação e rede assistencial; e atendimento psicológico "
                "profissional, acessível e confidencial."),
               ("4.2 Protocolos e segurança do campus · 30 pontos",
                "O que se faz diante de uma emergência médica, uma crise ou um "
                "acidente, e um plano de evacuação que se ensaia."),
               ("4.3 Proteção integral · 15 pontos",
                "Política contra o abuso, o assédio e a violência, com canal de "
                "denúncia que o residente pode usar."),
               ("4.4 Prevenção, formação e acompanhamento · 40 pontos",
                "Promoção da saúde, primeiros socorros, registro de incidentes e "
                "acompanhamento da saúde mental.")],
       claves=[("A realidade", "Às duas da manhã, a instituição é o único recurso"),
               ("A prova", "Um protocolo que ninguém sabe aplicar não existe")],
       idea="Proteger o residente não é um requisito legal que se cumpre: é a forma "
            "mais concreta pela qual uma instituição adventista mostra o que crê."),
  dict(num="5", clave="VÍNCULO", nombre="RECREAÇÃO, CULTURA E VÍNCULO",
       puntos="110", criterios="8",
       pregunta="O tempo livre forma, e a família e a comunidade seguem presentes?",
       partes=[("5.1 Esporte e atividade física · 15 pontos",
                "Um programa com horários, espaços e responsáveis, também no fim de "
                "semana."),
               ("5.2 Música, arte e cultura · 15 pontos",
                "Corais, conjuntos, teatro e artes visuais com participação real dos "
                "residentes."),
               ("5.3 Tempo livre e natureza · 30 pontos",
                "Uma oferta publicada para o sábado à tarde e o domingo, e o entorno "
                "natural usado como recurso formativo."),
               ("5.4 Família, comunidade e infraestrutura · 50 pontos",
                "Comunicação ordenada com as famílias, serviço junto à igreja local, "
                "instalações em uso e acompanhamento da saída.")],
       claves=[("O vazio", "Um campus que não organiza o tempo livre entrega-o à tela"),
               ("O limite", "Sem comunidade fora, o campus torna-se um mundo fechado")],
       idea="Entre o fim da aula e o silêncio noturno não há tempo vazio: há currículo "
            "em outro horário."),
 ],
}

ESQUEMA = {
 "es": dict(
   rotulo="ESQUEMA INTEGRADO DEL INSTRUMENTO",
   titulo="Las cinco dimensiones, de un vistazo",
   dimension="Dimensión",
   trazabilidad="El equipo acompaña · los espacios sostienen · la fe se vive · "
                "el cuidado protege · el vínculo abre la casa al mundo.",
   secciones="LAS DEMÁS SECCIONES · I Vida en el campus: marco bíblico y filosófico  ·  "
             "II Dimensiones de evaluación  ·  IV Puntuación final  ·  "
             "V Conclusión técnica  ·  VI Firmas",
   cifras=[("5", "dimensiones"), ("45", "criterios"), ("600", "puntos"),
           ("4", "niveles"), ("2", "idiomas"), ("8", "países")]),
 "pt": dict(
   rotulo="ESQUEMA INTEGRADO DO INSTRUMENTO",
   titulo="As cinco dimensões, num relance",
   dimension="Dimensão",
   trazabilidad="A equipe acompanha · os espaços sustentam · a fé é vivida · "
                "o cuidado protege · o vínculo abre a casa ao mundo.",
   secciones="AS DEMAIS SEÇÕES · I Vida no campus: marco bíblico e filosófico  ·  "
             "II Dimensões de avaliação  ·  IV Pontuação final  ·  "
             "V Conclusão técnica  ·  VI Assinaturas",
   cifras=[("5", "dimensões"), ("45", "critérios"), ("600", "pontos"),
           ("4", "níveis"), ("2", "idiomas"), ("8", "países")]),
}

FRASE = {
 "es": dict(rotulo="LA IDEA QUE SOSTIENE TODO EL INSTRUMENTO",
            cita="«Un internado no es una escuela con dormitorio: es una casa, y "
                 "una casa se evalúa por cómo cuida a quien vive en ella.»",
            pie="El sistema de acreditación de la educación superior ya examina la "
                "institución. Este instrumento mira lo que aquel no alcanza: las veinte "
                "horas de cada veinticuatro que el residente pasa en el campus."),
 "pt": dict(rotulo="A IDEIA QUE SUSTENTA TODO O INSTRUMENTO",
            cita="«Um internato não é uma escola com dormitório: é uma casa, e uma "
                 "casa avalia-se por como cuida de quem vive nela.»",
            pie="O sistema de acreditação da educação superior já examina a instituição. "
                "Este instrumento olha o que aquele não alcança: as vinte horas de cada "
                "vinte e quatro que o residente passa no campus."),
}

CIERRE = {
 "es": dict(gracias="GRACIAS",
            rotulo="FORMULARIO DE VIDA EN EL CAMPUS EN LOS INTERNADOS ADVENTISTAS · EDUCACIÓN SUPERIOR",
            cita="«Una casa se evalúa por cómo cuida a quien vive en ella.»",
            pie="Instrumento de aplicación regional para los ocho países de la División "
                "Sudamericana, en español y portugués.",
            datos=[("5", "dimensiones"), ("45", "criterios"), ("600", "puntos"),
                   ("43", "páginas")]),
 "pt": dict(gracias="OBRIGADO",
            rotulo="FORMULÁRIO DE VIDA NO CAMPUS NOS INTERNATOS ADVENTISTAS · EDUCAÇÃO SUPERIOR",
            cita="«Uma casa avalia-se por como cuida de quem vive nela.»",
            pie="Instrumento de aplicação regional para os oito países da Divisão "
                "Sul-Americana, em espanhol e português.",
            datos=[("5", "dimensões"), ("45", "critérios"), ("600", "pontos"),
                   ("43", "páginas")]),
}

CAMPUS = {
 "es": dict(
  titulo=["FORMULARIO DE", "VIDA EN EL CAMPUS", "EN LOS INTERNADOS", "ADVENTISTAS"],
  dim_titulo="Cinco dimensiones: las condiciones de la casa y la vida que ocurre en ella",
  dim_cifras="5 dimensiones  ·  45 criterios  ·  600 puntos  ·  4 niveles de logro",
  dim_corte=2,
  dim_grupos=[("LAS CONDICIONES DE LA CASA", "Dimensiones 1 y 2  ·  250 puntos  ·  19 criterios"),
              ("LA VIDA QUE OCURRE EN ELLA", "Dimensiones 3 a 5  ·  350 puntos  ·  26 criterios")],
  dim_pie="Ninguna dimensión evalúa la calidad académica ni la gestión institucional: "
          "eso ya lo hace el sistema de acreditación de la educación superior. Este "
          "instrumento se aplica por separado y produce un resultado propio.",
  anat_rotulo="CÓMO SE LEE CADA CRITERIO",
  anat_titulo="Un bloque, cinco respuestas",
  anat_enunciado="Enunciado del criterio",
  anat_puntos="15 puntos",
  anatomia=[
    ("EVIDENCIAS", "Qué hay que reunir"),
    ("DETALLE", "Qué se espera de cada una"),
    ("DOCUMENTOS", "Cómo se entrega"),
    ("NIVEL DE LOGRO", "Una sola casilla por criterio"),
    ("OBSERVACIÓN", "El fundamento de la decisión"),
  ],
  anat_glosas=[
    "Los documentos y registros que la institución debe presentar. Sin evidencia, "
    "el criterio se califica como No Atiende, aunque la práctica exista.",
    "Alcance, periodicidad, muestra o formato: lo que convierte un documento "
    "genérico en una prueba verificable.",
    "El archivo en PDF o el anexo concreto que la comisión revisará en la "
    "autoevaluación y en la visita.",
  ],
  anat_pie="Los 45 criterios del instrumento tienen exactamente esta forma. El "
           "evaluador no interpreta: verifica, marca y fundamenta.",
  escala_rotulo="SECCIÓN III · ESCALA DE LOGRO",
  escala_titulo="Cuatro niveles, un solo criterio: la evidencia",
  escala=[
    ("AP", "Atiende Plenamente", "Todas las evidencias, con calidad alta y vivencia confirmada",
     "100%"),
    ("AA", "Atiende Adecuadamente", "Al menos el 75% de las evidencias, con calidad razonable",
     "75–99%"),
    ("PA", "Atiende Parcialmente", "Entre el 50% y el 74%; faltan evidencias o calidad",
     "50–74%"),
    ("NA", "No Atiende", "Menos del 50% de las evidencias", "0–49%"),
  ],
  meta_rotulo="LA DECISIÓN QUE ATRAVIESA EL INSTRUMENTO",
  meta_titulo="La vivencia percibida",
  meta_texto="Cada dimensión cierra con una meta expresada en primera persona y en la "
             "voz del residente, referida a los índices ILE e IVC del Referencial. No "
             "es un criterio puntuable más: es el contraste entre lo que la institución "
             "documenta y lo que el estudiante experimenta.",
  meta_cita="“Los cultos de la residencia me dicen algo y me preparo para ellos.”",
  meta_pie="Una institución puede presentar el plan de cuidado espiritual completo y "
           "bien archivado y recibir de sus propios residentes la respuesta contraria. "
           "Las dos cosas son información, y la segunda es la que importa.",
  dec_rotulo="SECCIÓN IV · CLASIFICACIÓN",
  dec_titulo="La decisión sobre la vida en el campus",
  decision=[
    ("A", "Excelente", "90% a 100%", "Aprobado"),
    ("B", "Muy bueno", "80% a 89%", "Aprobado"),
    ("C", "Satisfactorio", "70% a 79%", "Aprobado con observaciones"),
    ("R", "Requiere mejoras", "60% a 69%", "No aprobado; plan de mejora con plazos"),
    ("I", "Insuficiente", "Menos de 60%", "No aprobado"),
  ],
  dec_pie="Criterio mínimo: alcanzar al menos el 80% del puntaje total y no obtener "
          "menos del 70% en ninguna dimensión. Un campus no compensa una residencia "
          "insegura con un buen programa deportivo.",
 ),
 "pt": dict(
  titulo=["FORMULÁRIO DE", "VIDA NO CAMPUS", "NOS INTERNATOS", "ADVENTISTAS"],
  dim_titulo="Cinco dimensões: as condições da casa e a vida que acontece nela",
  dim_cifras="5 dimensões  ·  45 critérios  ·  600 pontos  ·  4 níveis de alcance",
  dim_corte=2,
  dim_grupos=[("AS CONDIÇÕES DA CASA", "Dimensões 1 e 2  ·  250 pontos  ·  19 critérios"),
              ("A VIDA QUE ACONTECE NELA", "Dimensões 3 a 5  ·  350 pontos  ·  26 critérios")],
  dim_pie="Nenhuma dimensão avalia a qualidade acadêmica nem a gestão institucional: "
          "isso já o faz o sistema de acreditação da educação superior. Este instrumento "
          "aplica-se em separado e produz um resultado próprio.",
  anat_rotulo="COMO SE LÊ CADA CRITÉRIO",
  anat_titulo="Um bloco, cinco respostas",
  anat_enunciado="Enunciado do critério",
  anat_puntos="15 pontos",
  anatomia=[
    ("EVIDÊNCIAS", "O que é preciso reunir"),
    ("DETALHE", "O que se espera de cada uma"),
    ("DOCUMENTOS", "Como se entrega"),
    ("NÍVEL DE ALCANCE", "Uma só casa por critério"),
    ("OBSERVAÇÃO", "O fundamento da decisão"),
  ],
  anat_glosas=[
    "Os documentos e registros que a instituição deve apresentar. Sem evidência, o "
    "critério é classificado como Não Atende, ainda que a prática exista.",
    "Alcance, periodicidade, amostra ou formato: o que transforma um documento "
    "genérico numa prova verificável.",
    "O arquivo em PDF ou o anexo concreto que a comissão revisará na autoavaliação "
    "e na visita.",
  ],
  anat_pie="Os 45 critérios do instrumento têm exatamente esta forma. O avaliador não "
           "interpreta: verifica, assinala e fundamenta.",
  escala_rotulo="SEÇÃO III · ESCALA DE ALCANCE",
  escala_titulo="Quatro níveis, um só critério: a evidência",
  escala=[
    ("AP", "Atende Plenamente", "Todas as evidências, com qualidade alta e vivência confirmada",
     "100%"),
    ("AA", "Atende Adequadamente", "Ao menos 75% das evidências, com qualidade razoável",
     "75–99%"),
    ("PA", "Atende Parcialmente", "Entre 50% e 74%; faltam evidências ou qualidade",
     "50–74%"),
    ("NA", "Não Atende", "Menos de 50% das evidências", "0–49%"),
  ],
  meta_rotulo="A DECISÃO QUE ATRAVESSA O INSTRUMENTO",
  meta_titulo="A vivência percebida",
  meta_texto="Cada dimensão encerra com uma meta expressa na primeira pessoa e na voz "
             "do residente, referida aos índices ILE e IVC do Referencial. Não é mais um "
             "critério pontuável: é o contraste entre o que a instituição documenta e o "
             "que o estudante experimenta.",
  meta_cita="“Os cultos da residência me dizem algo e eu me preparo para eles.”",
  meta_pie="Uma instituição pode apresentar o plano de cuidado espiritual completo e bem "
           "arquivado e receber dos seus próprios residentes a resposta contrária. As "
           "duas coisas são informação, e a segunda é a que importa.",
  dec_rotulo="SEÇÃO IV · CLASSIFICAÇÃO",
  dec_titulo="A decisão sobre a vida no campus",
  decision=[
    ("A", "Excelente", "90% a 100%", "Aprovado"),
    ("B", "Muito bom", "80% a 89%", "Aprovado"),
    ("C", "Satisfatório", "70% a 79%", "Aprovado com observações"),
    ("R", "Requer melhorias", "60% a 69%", "Não aprovado; plano de melhoria com prazos"),
    ("I", "Insuficiente", "Menos de 60%", "Não aprovado"),
  ],
  dec_pie="Critério mínimo: alcançar ao menos 80% da pontuação total e não obter menos "
          "de 70% em nenhuma dimensão. Um campus não compensa uma residência insegura "
          "com um bom programa esportivo.",
 ),
}
