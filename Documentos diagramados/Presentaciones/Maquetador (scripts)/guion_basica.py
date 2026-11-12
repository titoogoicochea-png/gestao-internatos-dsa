# -*- coding: utf-8 -*-
"""El guion de la presentación de Vida en el Campus — Educación Básica.

Hereda de `guion_campus` todo lo que no cambia —rótulos, paleta, textos de la
anatomía y de la escala— y sobrescribe lo que sí: el título, la frase, el mapa,
el esquema, las cinco dimensiones y el cierre. Las láminas de anatomía, escala
y clasificación no se montan: Tito las quitó de la presentación de Superior y
aquí tampoco van.
"""
import copy
from guion_campus import (COMUN as _COMUN, ROTULOS, PALETA,  # noqa: F401
                          ESCALA_COLORES, DECISION_COLORES,
                          CAMPUS as _CAMPUS)

COMUN = copy.deepcopy(_COMUN)
COMUN["es"]["nivel"] = "EDUCACIÓN BÁSICA"
COMUN["pt"]["nivel"] = "EDUCAÇÃO BÁSICA"

CAMPUS = copy.deepcopy(_CAMPUS)
CAMPUS["es"].update(
    titulo=["FORMULARIO DE", "VIDA EN EL CAMPUS", "EN LOS INTERNADOS", "ADVENTISTAS"],
    dim_titulo="Cinco dimensiones: las condiciones de la casa y la vida que ocurre en ella",
    dim_cifras="5 dimensiones  ·  45 criterios  ·  600 puntos  ·  4 niveles de logro",
    dim_corte=2,
    dim_grupos=[["LAS CONDICIONES DE LA CASA",
                 "Dimensiones 1 y 2  ·  240 puntos  ·  18 criterios"],
                ["LA VIDA QUE OCURRE EN ELLA",
                 "Dimensiones 3 a 5  ·  360 puntos  ·  27 criterios"]],
    dim_pie="Ninguna dimensión evalúa la calidad académica ni la gestión del colegio: "
            "eso ya lo hace el Formulario de Acreditación de Internados. Este "
            "instrumento desarrolla su Dimensión 6 y produce un resultado propio.")
CAMPUS["pt"].update(
    titulo=["FORMULÁRIO DE", "VIDA NO CAMPUS", "NOS INTERNATOS", "ADVENTISTAS"],
    dim_titulo="Cinco dimensões: as condições da casa e a vida que acontece nela",
    dim_cifras="5 dimensões  ·  45 critérios  ·  600 pontos  ·  4 níveis de alcance",
    dim_corte=2,
    dim_grupos=[["AS CONDIÇÕES DA CASA",
                 "Dimensões 1 e 2  ·  240 pontos  ·  18 critérios"],
                ["A VIDA QUE ACONTECE NELA",
                 "Dimensões 3 a 5  ·  360 pontos  ·  27 critérios"]],
    dim_pie="Nenhuma dimensão avalia a qualidade acadêmica nem a gestão do colégio: "
            "isso já é feito pelo Formulário de Acreditação de Internatos. Este "
            "instrumento desenvolve a sua Dimensão 6 e produz um resultado próprio.")

FRASE = {
 "es": dict(
   rotulo="LA IDEA QUE SOSTIENE TODO EL INSTRUMENTO",
   cita="«El internado de educación básica es la casa que una familia confía: se evalúa por el cuidado que devuelve.»",
   pie="El Formulario de Acreditación ya evalúa el colegio entero y dedica a la vida "
       "residencial una dimensión de 250 puntos. Este instrumento la desarrolla, "
       "porque aquí el residente es un menor de edad y el cuidado es delegado."),
 "pt": dict(
   rotulo="A IDEIA QUE SUSTENTA TODO O INSTRUMENTO",
   cita="«O internato de educação básica é a casa que uma família confia: avalia-se pelo cuidado que devolve.»",
   pie="O Formulário de Acreditação já avalia o colégio inteiro e dedica à vida "
       "residencial uma dimensão de 250 pontos. Este instrumento a desenvolve, "
       "porque aqui o residente é um menor de idade e o cuidado é delegado."),
}

ESQUEMA = {
 "es": dict(
   rotulo="ESQUEMA INTEGRADO DEL INSTRUMENTO",
   titulo="Las cinco dimensiones, de un vistazo",
   dimension="Dimensión",
   trazabilidad="El equipo acompaña · los espacios sostienen · la fe se vive · "
                "la protección responde · la familia sigue presente.",
   secciones="LAS DEMÁS SECCIONES · I Vida en el campus: marco bíblico y filosófico  ·  "
             "II Dimensiones de evaluación  ·  III Evaluación y resumen de puntuación",
   cifras=[["5", "dimensiones"], ["45", "criterios"], ["600", "puntos"],
           ["4", "niveles"], ["2", "idiomas"], ["8", "países"]]),
 "pt": dict(
   rotulo="ESQUEMA INTEGRADO DO INSTRUMENTO",
   titulo="As cinco dimensões, num relance",
   dimension="Dimensão",
   trazabilidad="A equipe acompanha · os espaços sustentam · a fé é vivida · "
                "a proteção responde · a família segue presente.",
   secciones="AS DEMAIS SEÇÕES · I Vida no campus: marco bíblico e filosófico  ·  "
             "II Dimensões de avaliação  ·  III Avaliação e resumo da pontuação",
   cifras=[["5", "dimensões"], ["45", "critérios"], ["600", "pontos"],
           ["4", "níveis"], ["2", "idiomas"], ["8", "países"]]),
}

CIERRE = {
 "es": dict(
   gracias="GRACIAS",
   rotulo="FORMULARIO DE VIDA EN EL CAMPUS EN LOS INTERNADOS ADVENTISTAS · EDUCACIÓN BÁSICA",
   cita="«Una casa se evalúa por el cuidado que devuelve.»",
   pie="Instrumento de aplicación regional para los ocho países de la División "
       "Sudamericana, en español y portugués.",
   datos=[["5", "dimensiones"], ["45", "criterios"], ["600", "puntos"], ["26", "páginas"]]),
 "pt": dict(
   gracias="OBRIGADO",
   rotulo="FORMULÁRIO DE VIDA NO CAMPUS NOS INTERNATOS ADVENTISTAS · EDUCAÇÃO BÁSICA",
   cita="«Uma casa avalia-se pelo cuidado que devolve.»",
   pie="Instrumento de aplicação regional para os oito países da Divisão "
       "Sul-Americana, em espanhol e português.",
   datos=[["5", "dimensões"], ["45", "critérios"], ["600", "pontos"], ["25", "páginas"]]),
}

DIMENSIONES = {
 "es": [
  dict(num="1", clave="EQUIPO", nombre="EQUIPO RESIDENCIAL Y PRECEPTORÍA",
       puntos="120", criterios="9",
       pregunta="¿Hay adultos preparados, verificados y suficientes junto al menor?",
       partes=[["1.1 Dotación y cobertura · 15 puntos",
                "Equipo dimensionado para la población real, con las veinticuatro horas cubiertas, incluidas la madrugada y el fin de semana."],
               ["1.2 Idoneidad y verificación · 30 puntos",
                "Membresía, formación compatible con el acompañamiento de menores y verificación de antecedentes de todo el que entra a una residencia."],
               ["1.3 Formación y acompañamiento individual · 30 puntos",
                "Capacitación en crisis, protección y primeros auxilios, y un adulto de referencia para cada residente, con registro."],
               ["1.4 Cuidado del equipo y continuidad · 45 puntos",
                "Descanso, apoyo emocional, reuniones de equipo, traspaso cuando alguien se va y una dirección que responde por la residencia."]],
       claves=[["El punto ciego", "Nadie evalúa quién responde a las tres de la mañana"],
               ["Lo que se olvida", "El perímetro: cocina, limpieza, portería y voluntarios también entran"]],
       idea="Un campus con instalaciones excelentes y sin equipo suficiente es un alojamiento. Lo que hace internado a un internado son los adultos."),
  dict(num="2", clave="ESPACIOS", nombre="ESPACIOS, RUTINA Y CONVIVENCIA",
       puntos="120", criterios="9",
       pregunta="¿La casa y el horario sostienen al residente o solo lo contienen?",
       partes=[["2.1 Espacios y mantenimiento · 30 puntos",
                "Habitabilidad, dormitorios por edad y por sexo, sanitarios suficientes y un plan de limpieza con registro de ejecución."],
               ["2.2 Rutina y alimentación · 30 puntos",
                "Rutina escrita por franja etaria, horas de sueño respetadas y minuta firmada por nutricionista, con las restricciones atendidas."],
               ["2.3 Estudio y conectividad · 30 puntos",
                "Estudio supervisado, acompañamiento del rendimiento y un uso de dispositivos que protege el descanso sin cortar a la familia."],
               ["2.4 Norma, reclamo y participación · 30 puntos",
                "Reglamento conocido antes de matricular, medidas proporcionales, canal de reclamo y representación estudiantil con atribuciones."]],
       claves=[["El punto ciego", "El horario de sueño se declara y casi nunca se verifica"],
               ["Lo que se olvida", "Explicar la norma no es negociarla: es educarla"]],
       idea="La norma de un internado de menores no se negocia, pero sí se explica. La diferencia entre explicar e imponer es educativa."),
  dict(num="3", clave="ESPÍRITU", nombre="VIDA ESPIRITUAL EN EL CAMPUS",
       puntos="120", criterios="9",
       pregunta="¿La fe se vive aquí o solo se cumple?",
       partes=[["3.1 Culto y sábado · 35 puntos",
                "Plan espiritual anual, cultos conducidos con vida y un sábado que de verdad se distingue del resto de la semana."],
               ["3.2 Acompañamiento pastoral y pequeños grupos · 30 puntos",
                "Capellanía accesible, atención individual con confidencialidad y grupos o mentoría con periodicidad definida."],
               ["3.3 Formación bíblica y misión · 25 puntos",
                "Clases bíblicas, decisiones de fe acompañadas por la familia y servicio a la comunidad con seguridad por edad."],
               ["3.4 Protagonismo, espacios e índice · 30 puntos",
                "Residentes que dirigen y predican, espacios espirituales abiertos y el IVC aplicado y analizado."]],
       claves=[["El punto ciego", "Se cuentan los cultos y no se pregunta cómo se conducen"],
               ["Lo que se olvida", "El bautismo de un menor se acompaña con sus padres"]],
       idea="Un culto obligatorio y vacío no es neutro: enseña que la religión es un trámite."),
  dict(num="4", clave="PROTECCIÓN", nombre="SALUD, BIENESTAR Y PROTECCIÓN DEL MENOR",
       puntos="140", criterios="10",
       pregunta="¿Qué hace la institución cuando algo le pasa a un menor?",
       partes=[["4.1 Salud y medicación · 35 puntos",
                "Responsable técnico habilitado, ficha de salud individual y un procedimiento de guarda y administración de medicamentos."],
               ["4.2 Atención psicológica y seguridad · 30 puntos",
                "Psicólogo accesible con criterios de derivación, control de acceso al campus y régimen documentado de salidas y traslados."],
               ["4.3 Emergencias y protección · 30 puntos",
                "Plan de evacuación con simulacros, y política escrita de protección con un canal de denuncia que el residente conoce."],
               ["4.4 Notificación, prevención y seguimiento · 45 puntos",
                "Ruta a los órganos de garantía de derechos, prevención del acoso, el ILE aplicado y el acompañamiento de quien entra y de quien se va."]],
       claves=[["El punto ciego", "Un canal de denuncia que solo existe en el manual no protege"],
               ["Lo que se olvida", "Sin seguridad no hay formación: hay supervivencia"]],
       idea="Es la dimensión que más pesa, y la única razón es que el residente es menor de edad."),
  dict(num="5", clave="FAMILIA", nombre="RECREACIÓN, CULTURA Y VÍNCULO CON LA FAMILIA",
       puntos="100", criterios="8",
       pregunta="¿Qué hace el internado con el tiempo libre y con la nostalgia?",
       partes=[["5.1 Deporte y cultura · 30 puntos",
                "Práctica deportiva con orientación profesional, y música, arte y cultura con participación efectiva de los residentes."],
               ["5.2 Naturaleza y tiempo libre · 30 puntos",
                "Contacto con la creación, trabajo formativo por edad y fines de semana con programación intencional y descanso real."],
               ["5.3 Acuerdo y comunicación con la familia · 20 puntos",
                "Acuerdo formativo tripartito firmado y comunicación regular, no solo la llamada cuando hay un problema."],
               ["5.4 Formación de padres y visitas · 20 puntos",
                "Programa de acogida y formación de familias, y un régimen de visitas y retorno a casa definido y registrado."]],
       claves=[["El punto ciego", "Se mide cuánto se comunica y no por qué se comunica"],
               ["Lo que se olvida", "La familia no entregó a su hijo: delegó su cuidado"]],
       idea="Un internado que se comunica con los padres solo para cobrar o para reportar faltas ya rompió la alianza que lo sostiene."),
 ],
 "pt": [
  dict(num="1", clave="EQUIPE", nombre="EQUIPE RESIDENCIAL E PRECEPTORIA",
       puntos="120", criterios="9",
       pregunta="Há adultos preparados, verificados e suficientes junto ao menor?",
       partes=[["1.1 Dotação e cobertura · 15 pontos",
                "Equipe dimensionada para a população real, com as vinte e quatro horas cobertas, incluídas a madrugada e o fim de semana."],
               ["1.2 Idoneidade e verificação · 30 pontos",
                "Membresia, formação compatível com o acompanhamento de menores e verificação de antecedentes de todos que entram numa residência."],
               ["1.3 Formação e acompanhamento individual · 30 pontos",
                "Capacitação em crises, proteção e primeiros socorros, e um adulto de referência para cada residente, com registro."],
               ["1.4 Cuidado da equipe e continuidade · 45 pontos",
                "Descanso, apoio emocional, reuniões de equipe, transferência quando alguém sai e uma direção que responde pela residência."]],
       claves=[["O ponto cego", "Ninguém avalia quem responde às três da manhã"],
               ["O que se esquece", "O perímetro: cozinha, limpeza, portaria e voluntários também entram"]],
       idea="Um campus com instalações excelentes e sem equipe suficiente é um alojamento. O que faz de um internato um internato são os adultos."),
  dict(num="2", clave="ESPAÇOS", nombre="ESPAÇOS, ROTINA E CONVIVÊNCIA",
       puntos="120", criterios="9",
       pregunta="A casa e o horário sustentam o residente ou apenas o contêm?",
       partes=[["2.1 Espaços e manutenção · 30 pontos",
                "Habitabilidade, dormitórios por idade e por sexo, sanitários suficientes e um plano de limpeza com registro de execução."],
               ["2.2 Rotina e alimentação · 30 pontos",
                "Rotina escrita por faixa etária, horas de sono respeitadas e cardápio assinado por nutricionista, com as restrições atendidas."],
               ["2.3 Estudo e conectividade · 30 pontos",
                "Estudo supervisionado, acompanhamento do rendimento e um uso de dispositivos que protege o descanso sem cortar a família."],
               ["2.4 Norma, reclamação e participação · 30 pontos",
                "Regulamento conhecido antes da matrícula, medidas proporcionais, canal de reclamação e representação estudantil com atribuições."]],
       claves=[["O ponto cego", "O horário de sono é declarado e quase nunca verificado"],
               ["O que se esquece", "Explicar a norma não é negociá-la: é educá-la"]],
       idea="A norma de um internato de menores não se negocia, mas explica-se. A diferença entre explicar e impor é educativa."),
  dict(num="3", clave="ESPÍRITO", nombre="VIDA ESPIRITUAL NO CAMPUS",
       puntos="120", criterios="9",
       pregunta="A fé é vivida aqui ou apenas cumprida?",
       partes=[["3.1 Culto e sábado · 35 pontos",
                "Plano espiritual anual, cultos conduzidos com vida e um sábado que de fato se distingue do resto da semana."],
               ["3.2 Acompanhamento pastoral e pequenos grupos · 30 pontos",
                "Capelania acessível, atendimento individual com confidencialidade e grupos ou mentoria com periodicidade definida."],
               ["3.3 Formação bíblica e missão · 25 pontos",
                "Classes bíblicas, decisões de fé acompanhadas pela família e serviço à comunidade com segurança por idade."],
               ["3.4 Protagonismo, espaços e índice · 30 pontos",
                "Residentes que dirigem e pregam, espaços espirituais abertos e o IVC aplicado e analisado."]],
       claves=[["O ponto cego", "Contam-se os cultos e não se pergunta como são conduzidos"],
               ["O que se esquece", "O batismo de um menor é acompanhado com os seus pais"]],
       idea="Um culto obrigatório e vazio não é neutro: ensina que a religião é um trâmite."),
  dict(num="4", clave="PROTEÇÃO", nombre="SAÚDE, BEM-ESTAR E PROTEÇÃO DO MENOR",
       puntos="140", criterios="10",
       pregunta="O que a instituição faz quando algo acontece com um menor?",
       partes=[["4.1 Saúde e medicação · 35 pontos",
                "Responsável técnico habilitado, ficha de saúde individual e um procedimento de guarda e administração de medicamentos."],
               ["4.2 Atendimento psicológico e segurança · 30 pontos",
                "Psicólogo acessível com critérios de encaminhamento, controle de acesso ao campus e regime documentado de saídas e deslocamentos."],
               ["4.3 Emergências e proteção · 30 pontos",
                "Plano de evacuação com simulados, e política escrita de proteção com um canal de denúncia que o residente conhece."],
               ["4.4 Notificação, prevenção e acompanhamento · 45 pontos",
                "Rota aos órgãos de garantia de direitos, prevenção do assédio, o ILE aplicado e o acompanhamento de quem entra e de quem sai."]],
       claves=[["O ponto cego", "Um canal de denúncia que só existe no manual não protege"],
               ["O que se esquece", "Sem segurança não há formação: há sobrevivência"]],
       idea="É a dimensão que mais pesa, e a única razão é que o residente é menor de idade."),
  dict(num="5", clave="FAMÍLIA", nombre="RECREAÇÃO, CULTURA E VÍNCULO COM A FAMÍLIA",
       puntos="100", criterios="8",
       pregunta="O que o internato faz com o tempo livre e com a saudade?",
       partes=[["5.1 Esporte e cultura · 30 pontos",
                "Prática esportiva com orientação profissional, e música, arte e cultura com participação efetiva dos residentes."],
               ["5.2 Natureza e tempo livre · 30 pontos",
                "Contato com a criação, trabalho formativo por idade e fins de semana com programação intencional e descanso real."],
               ["5.3 Acordo e comunicação com a família · 20 pontos",
                "Acordo formativo tripartite assinado e comunicação regular, não apenas a ligação quando há um problema."],
               ["5.4 Formação de pais e visitas · 20 pontos",
                "Programa de acolhimento e formação de famílias, e um regime de visitas e retorno a casa definido e registrado."]],
       claves=[["O ponto cego", "Mede-se quanto se comunica e não por que se comunica"],
               ["O que se esquece", "A família não entregou o seu filho: delegou o seu cuidado"]],
       idea="Um internato que se comunica com os pais só para cobrar ou para relatar faltas já rompeu a aliança que o sustenta."),
 ],
}
