# -*- coding: utf-8 -*-
"""Las cinco dimensiones del Formulario de Vida en el Campus — Educación Básica.

Mismo armazón que el instrumento de Educación Superior: cinco dimensiones,
cuarenta y cinco criterios, seiscientos puntos. El reparto cambia, porque el
sujeto cambia: la protección del menor sube a ciento cuarenta puntos y la
autonomía deja su sitio a la responsabilidad creciente y al vínculo con la
familia.
"""

DIMENSIONES = [
 dict(
  corto="EQUIPO RESIDENCIAL Y PRECEPTORÍA",
  n=1, color=2, puntos=120,
  nombre="EQUIPO RESIDENCIAL Y PRECEPTORÍA",
  descripcion="""La primera condición de un internado de educación básica no es su edificio:
son los adultos que viven en él. Un campus con instalaciones excelentes y sin
equipo suficiente es un alojamiento; un campus modesto con un equipo presente,
formado y verificado es un internado.

Esta dimensión evalúa quién acompaña al menor. Mira si el equipo cubre las
veinticuatro horas —incluida la madrugada y el fin de semana, que es cuando la
institución suele quedar vacía de autoridades—; si sus integrantes tienen el
perfil espiritual y profesional que el acompañamiento de niños y adolescentes
exige; si la institución verificó sus antecedentes antes de contratarlos; y si
cada residente tiene un adulto de referencia que lo conoce por su nombre.

La proporción importa tanto como la presencia, y aquí importa el doble. Un
internado puede declarar que cuenta con preceptores y, aun así, dejar una
residencia entera de adolescentes a cargo de una sola persona durante la noche.
Por eso se pide el cuadro del equipo con nombres, funciones y escala de turnos,
junto con la población real del período y su distribución por edad y por sexo.

El perímetro del equipo es más ancho de lo que parece: también tienen contacto
diario con los residentes la cocina, la limpieza, la portería, el transporte y
los voluntarios. La verificación de antecedentes y la formación en protección
alcanzan a cualquiera que entre a una residencia.

Y mira si la institución cuida a quienes cuidan. La preceptoría desgasta y rota,
y un equipo agotado no acompaña, solo vigila: Maslach y Jackson (1981)
describieron ese agotamiento como cansancio emocional, despersonalización del
trato y pérdida de sentido, las tres cosas que un residente percibe de inmediato.
Por eso se pide también qué ocurre cuando alguien del equipo se va, porque con
cada salida se pierde lo que esa persona sabía de los residentes que acompañaba.

Y pregunta por la línea de mando: quién autoriza una salida imprevista, quién
llama a la familia a medianoche y quién responde ante la dirección del colegio
por lo que pasó anoche en la residencia.""",
  orientacion="**Orientación al evaluador.** Verifique la relación entre el tamaño del equipo "
              "y la población residente real por franja etaria, no la declarada en el plan. "
              "Pregunte quién responde a las tres de la mañana de un domingo y pida el "
              "documento que lo establece. Pida los comprobantes de verificación de "
              "antecedentes de todo el personal con acceso a las residencias, sin excepción.",
  meta=[(1, "«Siempre hay un adulto disponible cuando lo necesito, también de noche.» (ref. ILE ítem 8)"),
        (4, "«Hay una persona en el internado que me conoce y a quien puedo recurrir.» (ref. IVC ítem 6)"),
        (8, "«Percibo que la institución cuida también de quienes trabajan conmigo.» (ref. IVC ítem 13)")],
  criterios=[
   dict(num=1, puntos=15,
    enunciado="La institución cuenta con un equipo residencial dimensionado para la población atendida, con cobertura presencial en las veinticuatro horas, incluidos la madrugada y los fines de semana.",
    evidencias=[
     ("Cuadro del equipo residencial con nombres, funciones, escala de turnos y residencia atendida.",
      "Indicar la proporción de adultos por residente y la población real del período, desglosada por edad y por sexo.", ""),
     ("Contratos y registro de jornada del equipo residencial.",
      "Presentar el registro de los últimos tres meses, no el modelo de contrato.", ""),
     ("Declaración de cobertura nocturna y de fin de semana con responsable identificado.",
      "Debe nombrar a la persona de guardia en cada franja y el modo de contacto inmediato.", ""),
    ]),
   dict(num=2, puntos=15,
    enunciado="La institución verifica los antecedentes de todo integrante del equipo con acceso a las residencias antes de su contratación y de forma periódica.",
    evidencias=[
     ("Certificados de antecedentes penales y, donde exista, del registro de protección de niños y adolescentes.",
      "Debe cubrir a la totalidad del personal con acceso a residencias, incluidos servicios tercerizados y voluntarios.", ""),
     ("Procedimiento escrito de verificación, con responsable y periodicidad de renovación.",
      "Indicar cada cuánto se renueva y qué ocurre cuando un antecedente aparece.", ""),
     ("Registro de la última verificación realizada, con fecha y firma del responsable.",
      "Presentar la planilla consolidada del período en curso.", ""),
    ]),
   dict(num=3, puntos=15,
    enunciado="Los integrantes del equipo residencial son miembros de la Iglesia Adventista del Séptimo Día en plena comunión y poseen formación compatible con el acompañamiento de niños y adolescentes.",
    evidencias=[
     ("Declaración de membresía firmada por la capellanía o por el pastor distrital.",
      "Indicar la iglesia de cada integrante y la fecha de la declaración.", ""),
     ("Listado del equipo con su formación académica y denominacional.",
      "Adjuntar títulos, certificados o registro institucional de los cursos realizados.", ""),
     ("Perfil de cargo del preceptor o coordinador residencial, aprobado por la institución.",
      "Debe explicitar requisitos espirituales, académicos y de experiencia con menores.", ""),
    ]),
   dict(num=4, puntos=15,
    enunciado="La institución ejecuta un plan de formación inicial y continuada del equipo residencial, con contenidos propios del cuidado de menores.",
    evidencias=[
     ("Plan de formación con contenidos, carga horaria y cronograma.",
      "Debe incluir filosofía adventista de la educación, primeros auxilios, salud mental del adolescente, mediación de conflictos, cuidado pastoral, protección integral y ruta de notificación.", ""),
     ("Registro de participación del equipo en las formaciones de los últimos dos años.",
      "Listas de presencia y certificados, con el porcentaje del equipo alcanzado.", ""),
     ("Inducción documentada para los integrantes que ingresan durante el año lectivo.",
      "Presentar el guion de inducción y el registro de la última realizada.", ""),
    ]),
   dict(num=5, puntos=15,
    enunciado="Cada residente cuenta con un integrante del equipo como referencia, y el acompañamiento individual queda registrado.",
    evidencias=[
     ("Asignación nominal de residentes por preceptor de referencia, vigente en el período.",
      "Debe cubrir a la totalidad de la población residente y respetar la franja etaria.", ""),
     ("Registro de entrevistas y seguimiento individual, con criterios de confidencialidad.",
      "Presentar el instrumento de registro y una muestra anonimizada del semestre en curso.", ""),
     ("Procedimiento de derivación cuando el acompañamiento excede la competencia del preceptor.",
      "Indicar a quién se deriva, en qué plazo y con qué registro, incluida la comunicación a la familia.", ""),
    ]),
   dict(num=6, puntos=15,
    enunciado="La institución cuida la salud ocupacional y el descanso del equipo residencial, y acompaña el desgaste propio de la función.",
    evidencias=[
     ("Escala de turnos con descansos y francos efectivamente concedidos en los últimos seis meses.",
      "Debe permitir verificar horas de trabajo consecutivas y descanso semanal real.", ""),
     ("Registro del acompañamiento ofrecido al equipo: supervisión, apoyo psicológico o pastoral.",
      "Indicar periodicidad, responsable y cobertura alcanzada.", ""),
     ("Evaluación del clima y del desgaste del equipo residencial.",
      "Presentar el instrumento aplicado, sus resultados y las medidas adoptadas.", ""),
    ]),
   dict(num=7, puntos=10,
    enunciado="La institución documenta la continuidad del acompañamiento cuando un integrante del equipo deja su función.",
    evidencias=[
     ("Procedimiento escrito de traspaso de casos activos, con resguardo de la confidencialidad.",
      "Debe indicar qué se transfiere, a quién y en qué plazo.", ""),
     ("Registro del último traspaso realizado.",
      "Presentar el acta o formulario firmado por quien entrega y por quien recibe.", ""),
    ]),
   dict(num=8, puntos=10,
    enunciado="El equipo residencial participa de instancias regulares de planificación y evaluación de la vida residencial.",
    evidencias=[
     ("Actas de las reuniones del equipo residencial del período en curso.",
      "Al menos una reunión mensual, con pauta, asistentes y decisiones registradas.", ""),
     ("Plan anual de la vida residencial con responsables y plazos.",
      "Debe mostrar las decisiones que nacieron de esas reuniones.", ""),
    ]),
   dict(num=9, puntos=10,
    enunciado="La dirección del internado integra la estructura de gestión del colegio y responde formalmente por la vida residencial.",
    evidencias=[
     ("Organigrama institucional con la posición y las atribuciones de la dirección del internado.",
      "Debe mostrar la línea de reporte a la dirección general del colegio.", ""),
     ("Acto de designación del responsable del internado, vigente en el período.",
      "Indicar fecha, instancia que lo designó y alcance de sus atribuciones.", ""),
    ]),
  ]),
 dict(
  corto="ESPACIOS, RUTINA Y CONVIVENCIA",
  n=2, color=4, puntos=120,
  nombre="ESPACIOS, RUTINA Y CONVIVENCIA",
  descripcion="""La casa donde se vive y el reloj que la gobierna. Esta dimensión evalúa las
condiciones materiales de la residencia y el modo en que el día está organizado:
dormitorios por edad y por sexo, sanitarios suficientes, comedor, espacios de
estudio, mantenimiento y limpieza, horario de sueño adecuado a la franja etaria,
alimentación supervisada por profesional habilitado y un régimen de uso de
dispositivos que proteja el descanso sin aislar al residente de su familia.

Mira también la norma: si existe un reglamento escrito, si el residente y su
familia lo conocen antes de matricularse, si las medidas disciplinarias están
tipificadas y son proporcionales, y si hay un canal por el cual un estudiante
puede reclamar sin temor. La norma de un internado de menores no se negocia,
pero sí se explica, y la diferencia entre explicar y simplemente imponer es
educativa.

Y pregunta por la participación. Que el residente sea menor no significa que no
tenga voz: significa que su voz se ejerce orientada. Una representación
estudiantil con atribuciones reales en la vida cotidiana de la residencia es
formación ciudadana, no una concesión.

Y mira el detalle que suele decidirlo todo: el horario de sueño. Un adolescente
que duerme seis horas no rinde en clase, se irrita con sus compañeros y enferma
más; el internado es uno de los pocos lugares donde ese horario puede
garantizarse de verdad, y por eso aquí se verifica y no se declara.""",
  orientacion="**Orientación al evaluador.** Recorra las residencias sin aviso previo y en "
              "horario de uso. Compruebe la separación por edad y por sexo, el estado real "
              "de los sanitarios y el cumplimiento del horario de sueño. Pregunte a los "
              "residentes cómo se enteraron del reglamento y qué hacen cuando quieren "
              "reclamar algo.",
  meta=[(10, "«El lugar donde vivo está limpio, cuidado y es cómodo.» (ref. ILE ítem 9)"),
        (13, "«La comida del internado es buena y suficiente.» (ref. ILE ítem 10)"),
        (17, "«Tengo a quién reclamar cuando algo no está bien, y sé que me escuchan.» (ref. IVC ítem 12)")],
  criterios=[
   dict(num=10, puntos=15,
    enunciado="Las residencias cumplen los estándares mínimos de habitabilidad y están organizadas por franja etaria y por sexo.",
    evidencias=[
     ("Planta de las residencias con capacidad por habitación, superficie y distribución por edad y sexo.",
      "Indicar la ocupación real del período y la relación entre residentes y sanitarios.", ""),
     ("Registro fotográfico fechado de dormitorios, sanitarios y áreas comunes.",
      "Debe corresponder al período en curso y cubrir todas las residencias en uso.", ""),
     ("Habilitación sanitaria o de funcionamiento vigente, conforme a la legislación del país.",
      "Presentar el documento con su fecha de vencimiento.", ""),
    ]),
   dict(num=11, puntos=15,
    enunciado="La institución mantiene un plan de limpieza, mantenimiento y reposición de las residencias, con registro de ejecución.",
    evidencias=[
     ("Plan de limpieza y mantenimiento con frecuencias, responsables y áreas cubiertas.",
      "Debe distinguir lo que hace el personal y lo que corresponde al residente según su edad.", ""),
     ("Registro de ejecución de los últimos tres meses.",
      "Planillas firmadas o sistema de control, no el plan repetido.", ""),
     ("Registro de solicitudes de reparación con fecha de apertura y de solución.",
      "Indicar el plazo medio de atención del período.", ""),
    ]),
   dict(num=12, puntos=15,
    enunciado="La rutina diaria está establecida por escrito, respeta las horas de sueño propias de cada franja etaria y es conocida por el residente y su familia.",
    evidencias=[
     ("Rutina diaria y semanal aprobada por la dirección, diferenciada por franja etaria.",
      "Debe explicitar hora de levantarse, de estudio, de culto, de comidas y de silencio.", ""),
     ("Constancia de entrega de la rutina al residente y a su familia al inicio del año lectivo.",
      "Presentar el comprobante firmado o el registro de envío.", ""),
     ("Registro de supervisión del cumplimiento del horario de silencio nocturno.",
      "Muestra del último mes, con responsable identificado por turno.", ""),
    ]),
   dict(num=13, puntos=15,
    enunciado="La alimentación es planificada por profesional habilitado, atiende las necesidades nutricionales de la edad y contempla restricciones alimentarias documentadas.",
    evidencias=[
     ("Minuta mensual firmada por nutricionista con registro profesional vigente.",
      "Debe corresponder al período en curso e indicar el aporte por franja etaria.", ""),
     ("Registro de residentes con restricción alimentaria o necesidad especial y su atención efectiva.",
      "Indicar cómo se identifica al residente en el comedor y quién responde por ello.", ""),
     ("Control sanitario de la cocina y del comedor.",
      "Habilitación vigente, control de manipuladores y registro de la última inspección.", ""),
    ]),
   dict(num=14, puntos=15,
    enunciado="La institución garantiza tiempo y espacio de estudio supervisado, adecuados a la carga escolar de cada curso.",
    evidencias=[
     ("Horario de estudio supervisado con responsable por franja etaria.",
      "Indicar la duración diaria y el espacio físico destinado.", ""),
     ("Registro de acompañamiento del rendimiento escolar de los residentes.",
      "Debe mostrar la articulación entre la preceptoría y la coordinación pedagógica.", ""),
     ("Plan de apoyo para residentes con dificultad de aprendizaje.",
      "Presentar el procedimiento y una muestra anonimizada del período.", ""),
    ]),
   dict(num=15, puntos=15,
    enunciado="El uso de dispositivos y el acceso a internet están regulados de modo que protejan el descanso y el estudio sin impedir el contacto con la familia.",
    evidencias=[
     ("Política de uso de dispositivos y de conectividad, aprobada por la dirección.",
      "Debe diferenciar por franja etaria y prever horarios de contacto con la familia.", ""),
     ("Constancia de que la política fue informada al residente y a su familia.",
      "Comprobante firmado en la matrícula o registro de comunicación.", ""),
     ("Medidas técnicas de protección en la red institucional.",
      "Filtros de contenido, registro de incidentes y responsable técnico.", ""),
    ]),
   dict(num=16, puntos=10,
    enunciado="El internado cuenta con un reglamento escrito, con medidas disciplinarias tipificadas y proporcionales, conocido por el residente y su familia antes de la matrícula.",
    evidencias=[
     ("Reglamento del internado vigente, aprobado por la instancia competente.",
      "Debe tipificar faltas, medidas, instancias de aplicación y derecho de defensa.", ""),
     ("Comprobante de entrega y aceptación del reglamento, firmado por la familia.",
      "Correspondiente a la matrícula del período en curso.", ""),
    ]),
   dict(num=17, puntos=10,
    enunciado="Existe un canal de reclamo y sugerencia accesible al residente, con registro y respuesta documentada.",
    evidencias=[
     ("Descripción del canal, su ubicación física o digital y su responsable.",
      "Debe garantizar que el residente pueda usarlo sin pasar por quien es objeto del reclamo.", ""),
     ("Registro de reclamos recibidos y de las respuestas dadas en el período.",
      "Muestra anonimizada, con plazos de respuesta.", ""),
    ]),
   dict(num=18, puntos=10,
    enunciado="Los residentes participan de forma orientada en la organización de la vida residencial, con atribuciones definidas según su edad.",
    evidencias=[
     ("Documento que define la representación estudiantil del internado y sus atribuciones.",
      "Debe indicar cómo se eligen los representantes y con qué periodicidad.", ""),
     ("Actas de las reuniones de los representantes con el equipo residencial.",
      "Al menos dos por semestre, con decisiones registradas.", ""),
    ]),
  ]),
 dict(
  corto="VIDA ESPIRITUAL EN EL CAMPUS",
  n=3, color=6, puntos=120,
  nombre="VIDA ESPIRITUAL EN EL CAMPUS",
  descripcion="""Para muchos residentes, el internado es el lugar donde la fe deja de ser la de
sus padres y empieza a ser la suya. Esta dimensión evalúa si el campus facilita
ese tránsito o si lo sustituye por una agenda de actividades obligatorias.

Mira el calendario espiritual —cultos, semanas de oración, sábado, programas
denominacionales— y, sobre todo, cómo se conduce: White pidió que los cultos se
condujeran «con vida espiritual, reverencia y atractivo», evitando «el
formalismo y la monotonía» (*Testimonios selectos, tomo 2*, 2007, p. 160-161).
Mira el acompañamiento pastoral individual, los pequeños grupos y la mentoría,
que son el lugar donde una duda se puede decir en voz baja.

Y mira dos cosas propias de la educación básica. La primera es el protagonismo:
un adolescente que dirige un culto, canta, predica o coordina un grupo aprende
lo que no aprende escuchando. La segunda es la familia: la decisión de fe
—la clase bíblica, el bautismo— se acompaña con los padres, porque la
institución no sustituye a la familia en lo que le pertenece.

Nada de esto se mide contando asistencias. Se mide preguntando qué recuerda el
residente de la última semana de oración y quién lo acompañó cuando tuvo una
duda.""",
  orientacion="**Orientación al evaluador.** Asista a un culto y a un sábado completo antes "
              "de leer el calendario. Pregunte a los residentes quién dirigió el último "
              "culto y de qué se habló. Verifique que la preparación bautismal cuente con "
              "autorización y acompañamiento de la familia, documentados.",
  meta=[(19, "«Los cultos del internado me ayudan y no me resultan una obligación vacía.» (ref. ILE ítem 6)"),
        (22, "«Tengo con quién hablar de mis dudas espirituales.» (ref. ILE ítem 5)"),
        (25, "«Tengo lugar y voz en la programación espiritual del campus.» (ref. IVC ítem 14)")],
  criterios=[
   dict(num=19, puntos=20,
    enunciado="La institución ejecuta un plan espiritual anual para la vida residencial, con cultos diarios conducidos con participación de los residentes.",
    evidencias=[
     ("Plan espiritual anual del internado, aprobado por la capellanía y la dirección.",
      "Debe indicar objetivos, responsables, periodicidad y articulación con el calendario del colegio.", ""),
     ("Registro de los cultos realizados en el período, con tema y responsable.",
      "Muestra de al menos un mes, indicando qué proporción fue conducida por residentes.", ""),
     ("Evaluación de la programación espiritual por parte de los residentes.",
      "Instrumento aplicado, resultados y ajustes derivados de ellos.", ""),
    ]),
   dict(num=20, puntos=15,
    enunciado="El sábado tiene una programación propia, diferenciada del resto de la semana, que articula culto, descanso y servicio.",
    evidencias=[
     ("Programación sabática tipo y del último trimestre.",
      "Debe mostrar la diferencia real con un día ordinario, incluida la preparación del viernes.", ""),
     ("Registro de participación de los residentes en la iglesia del campus o del distrito.",
      "Indicar la proporción de residentes alcanzada.", ""),
    ]),
   dict(num=21, puntos=15,
    enunciado="La capellanía ofrece acompañamiento pastoral individual accesible a los residentes, con registro y resguardo de la confidencialidad.",
    evidencias=[
     ("Designación del capellán o responsable pastoral del internado, con su carga horaria.",
      "Indicar su disponibilidad efectiva en la residencia y los horarios de atención.", ""),
     ("Registro de atenciones pastorales individuales del período.",
      "Muestra anonimizada, con criterios explícitos de confidencialidad y de derivación.", ""),
     ("Procedimiento de derivación entre capellanía, psicología y preceptoría.",
      "Debe indicar en qué casos se deriva y cómo se informa a la familia.", ""),
    ]),
   dict(num=22, puntos=15,
    enunciado="Los residentes participan de pequeños grupos o de un programa de mentoría espiritual con periodicidad definida.",
    evidencias=[
     ("Organización de los pequeños grupos o de la mentoría, con líderes y periodicidad.",
      "Indicar la proporción de residentes que participa y el criterio de formación de los grupos.", ""),
     ("Registro de encuentros del período en curso.",
      "Al menos los dos últimos meses, con asistencia y tema.", ""),
     ("Formación ofrecida a los líderes de grupo, sean del equipo o residentes.",
      "Presentar contenido, carga horaria y lista de participantes.", ""),
    ]),
   dict(num=23, puntos=15,
    enunciado="La institución ofrece formación bíblica sistemática y acompaña las decisiones de fe junto con la familia del residente.",
    evidencias=[
     ("Programa de clases bíblicas o de preparación bautismal del período.",
      "Indicar responsable, periodicidad y número de participantes.", ""),
     ("Autorización y acompañamiento de la familia en las decisiones de bautismo.",
      "Presentar el modelo de autorización y el registro de las decisiones del período.", ""),
    ]),
   dict(num=24, puntos=10,
    enunciado="Los residentes participan de iniciativas misioneras y de servicio a la comunidad, adecuadas a su edad.",
    evidencias=[
     ("Plan de actividades misioneras y de servicio del período, con medidas de seguridad por franja etaria.",
      "Indicar destino, acompañamiento adulto y autorización familiar.", ""),
     ("Registro de las actividades realizadas y de la participación de los residentes.",
      "Con fotografías o actas y la proporción de residentes alcanzada.", ""),
    ]),
   dict(num=25, puntos=10,
    enunciado="Los residentes ejercen protagonismo en la programación espiritual: dirigen, predican, cantan o coordinan con acompañamiento del equipo.",
    evidencias=[
     ("Escala de participación de residentes en la programación espiritual del período.",
      "Debe nombrar a los residentes y la función que ejercieron.", ""),
     ("Registro de la preparación ofrecida a esos residentes.",
      "Ensayos, orientación pastoral o formación específica.", ""),
    ]),
   dict(num=26, puntos=10,
    enunciado="El campus cuenta con espacios destinados a la vida espiritual, accesibles a los residentes fuera del horario de programación.",
    evidencias=[
     ("Identificación de los espacios espirituales del campus y su régimen de uso.",
      "Capilla, sala de oración o equivalente, con horarios de acceso libre.", ""),
     ("Registro fotográfico fechado y estado de conservación.",
      "Debe corresponder al período en curso.", ""),
    ]),
   dict(num=27, puntos=10,
    enunciado="La institución aplica y analiza el Índice de Alineamiento Valorativo Confesional (IVC) entre los residentes.",
    evidencias=[
     ("Instrumento aplicado y ficha técnica de la aplicación.",
      "Indicar fecha, tasa de respuesta y garantía de anonimato.", ""),
     ("Informe de resultados y plan de acción derivado.",
      "Debe identificar las subdimensiones más frágiles y las medidas adoptadas.", ""),
    ]),
  ]),
 dict(
  corto="SALUD, BIENESTAR Y PROTECCIÓN",
  n=4, color=3, puntos=140,
  nombre="SALUD, BIENESTAR EMOCIONAL Y PROTECCIÓN DEL MENOR",
  descripcion="""Es la dimensión que más pesa, y la única razón es que el residente es menor de
edad. Lo que aquí se evalúa no admite grados de intención: o la institución
puede demostrar qué hace cuando un estudiante se enferma, se accidenta, entra en
crisis o es herido por alguien, o no puede.

Mira la atención de salud —responsable técnico habilitado, control de la
medicación, historia clínica, convenio con el servicio del territorio—, la
atención psicológica accesible y el protocolo de salud mental para los cuadros
que la adolescencia trae: ansiedad, autolesión, trastornos del sueño y de la
alimentación, ideación suicida. Mira la seguridad del campus: control de acceso,
salidas autorizadas, traslados, plan de emergencia y simulacros.

Y mira la protección en sentido estricto: política escrita de protección de
niños y adolescentes, canal de denuncia que el residente conoce, ruta de
notificación a los órganos de garantía de derechos de su país, y registro de lo
actuado. Un internado que no puede mostrar esa ruta no está protegiendo: está
confiando en que no ocurra. Y pide que el residente conozca esa ruta: un canal
que solo existe en el manual no protege a nadie.""",
  orientacion="**Orientación al evaluador.** Pida la ruta de notificación y pregunte al "
              "equipo, por separado, qué haría ante una sospecha de maltrato: la respuesta "
              "oral revela si el protocolo existe o solo está impreso. Verifique el control "
              "de la medicación en el armario, no en la planilla, y pregunte a los "
              "residentes si saben a quién acudir y si creen que serían escuchados.",
  meta=[(28, "«Cuando me enfermo, el internado me atiende bien y avisa a mi familia.» (ref. ILE ítem 11)"),
        (31, "«Me siento seguro en el lugar donde vivo y circulo dentro del campus.» (ref. IVC ítem 11)"),
        (34, "«Confío en que la institución sabe cómo actuar cuando ocurre algo grave.» (ref. IVC ítem 12)")],
  criterios=[
   dict(num=28, puntos=20,
    enunciado="La institución cuenta con atención de salud accesible al residente, con responsable técnico habilitado y registro clínico individual.",
    evidencias=[
     ("Designación del responsable de salud con registro profesional vigente y carga horaria.",
      "Indicar la cobertura en horario nocturno y de fin de semana.", ""),
     ("Ficha de salud individual de cada residente, con autorización familiar de atención.",
      "Debe incluir antecedentes, alergias, vacunas y contacto de emergencia.", ""),
     ("Registro de atenciones del período y de la comunicación a la familia.",
      "Muestra anonimizada del último trimestre, con plazo de aviso a los padres.", ""),
    ]),
   dict(num=29, puntos=15,
    enunciado="La administración y la guarda de medicamentos siguen un procedimiento escrito, bajo responsabilidad identificada.",
    evidencias=[
     ("Procedimiento de guarda y administración de medicación, con responsable por turno.",
      "Debe prever prescripción vigente, autorización familiar y registro de cada dosis.", ""),
     ("Planilla de administración de los últimos treinta días.",
      "Con identificación del residente, el medicamento, la hora y quién administró.", ""),
     ("Registro del control de existencias y de la disposición de medicamentos vencidos.",
      "Presentar el último inventario firmado.", ""),
    ]),
   dict(num=30, puntos=15,
    enunciado="Existe atención psicológica accesible al residente, con criterios de derivación, confidencialidad y comunicación a la familia.",
    evidencias=[
     ("Designación del psicólogo escolar con registro profesional y carga horaria destinada al internado.",
      "Indicar la modalidad de acceso del residente a la atención.", ""),
     ("Procedimiento de derivación entre preceptoría, capellanía y psicología.",
      "Debe indicar plazos, responsables y cuándo se informa a la familia.", ""),
     ("Registro de atenciones del período, anonimizado.",
      "Con número de residentes atendidos y motivos agrupados por categoría.", ""),
    ]),
   dict(num=31, puntos=15,
    enunciado="El campus cuenta con control de acceso y con un régimen documentado de salidas, visitas y traslados de los residentes.",
    evidencias=[
     ("Procedimiento de control de acceso al campus y a las residencias.",
      "Debe indicar quién puede entrar, con qué identificación y con qué registro.", ""),
     ("Registro de salidas y retornos del período, con autorización familiar.",
      "Muestra del último mes, indicando responsable de la autorización y del acompañamiento.", ""),
     ("Procedimiento de traslado de residentes, incluidos los de emergencia.",
      "Vehículo, conductor habilitado, seguro vigente y aviso a la familia.", ""),
    ]),
   dict(num=32, puntos=15,
    enunciado="La institución cuenta con plan de emergencia y evacuación, con simulacros realizados y equipamiento verificado.",
    evidencias=[
     ("Plan de emergencia y evacuación de las residencias, aprobado y señalizado.",
      "Debe prever el horario nocturno y la presencia de residentes con necesidades específicas.", ""),
     ("Registro de los simulacros realizados en los últimos doce meses.",
      "Con fecha, participantes, tiempo de evacuación y mejoras identificadas.", ""),
     ("Verificación de extintores, alarmas, iluminación de emergencia y salidas.",
      "Presentar el último informe técnico con su vigencia.", ""),
    ]),
   dict(num=33, puntos=15,
    enunciado="La institución mantiene una política escrita de protección de niños y adolescentes, con canal de denuncia conocido por el residente.",
    evidencias=[
     ("Política de protección integral aprobada por la instancia competente.",
      "Debe definir conductas prohibidas, obligaciones del adulto y consecuencias.", ""),
     ("Descripción del canal de denuncia, su acceso y su responsable.",
      "Debe permitir denunciar a un adulto de la institución sin pasar por él.", ""),
     ("Evidencia de divulgación del canal a los residentes y a las familias.",
      "Material usado, fecha y cobertura de la divulgación.", ""),
    ]),
   dict(num=34, puntos=15,
    enunciado="Existe una ruta documentada de notificación a los órganos de garantía de derechos, con registro de lo actuado.",
    evidencias=[
     ("Flujo de notificación conforme a la legislación del país, con plazos y responsables.",
      "Debe nombrar el órgano competente y el modo de contacto.", ""),
     ("Registro de los casos notificados en los últimos dos años y de su seguimiento.",
      "Anonimizado, indicando fecha de la notificación y desenlace.", ""),
     ("Constancia de que el equipo fue formado en esa ruta.",
      "Lista de participantes y fecha de la última formación.", ""),
    ]),
   dict(num=35, puntos=10,
    enunciado="La institución desarrolla acciones de prevención del acoso entre pares y acompaña los casos identificados.",
    evidencias=[
     ("Programa de prevención del acoso y la violencia entre residentes.",
      "Indicar contenidos, periodicidad y franjas etarias alcanzadas.", ""),
     ("Registro de los casos identificados y de las medidas adoptadas.",
      "Anonimizado, con acompañamiento posterior de las partes involucradas.", ""),
    ]),
   dict(num=36, puntos=10,
    enunciado="La institución aplica y analiza el Índice de Brecha Espiritual (ILE) y usa sus resultados en el plan de mejora.",
    evidencias=[
     ("Instrumento aplicado y ficha técnica de la aplicación.",
      "Indicar fecha, tasa de respuesta y garantía de anonimato.", ""),
     ("Informe de resultados con los ítems de mayor brecha y el plan derivado.",
      "Debe mostrar medidas con responsable y plazo.", ""),
    ]),
   dict(num=37, puntos=10,
    enunciado="La institución acompaña la adaptación del residente que ingresa y el proceso de quien se retira durante el año lectivo.",
    evidencias=[
     ("Programa de acogida y acompañamiento de los primeros sesenta días.",
      "Debe indicar responsable, actividades y seguimiento individual.", ""),
     ("Registro de los retiros ocurridos en el período, con su motivo y el contacto con la familia.",
      "Anonimizado, con el análisis institucional de las causas.", ""),
    ]),
  ]),
 dict(
  corto="RECREACIÓN, CULTURA Y FAMILIA",
  n=5, color=5, puntos=100,
  nombre="RECREACIÓN, CULTURA Y VÍNCULO CON LA FAMILIA",
  descripcion="""Lo que el internado hace con el tiempo libre y con la nostalgia. Esta dimensión
evalúa el deporte y la actividad física, la música, el arte y la cultura, el
contacto con la naturaleza y el uso del fin de semana; y evalúa, sobre todo, la
alianza con la familia, que en educación básica no es un complemento sino una
condición de funcionamiento.

El trabajo y el contacto con la creación no son relleno: «ningún hombre ni mujer
se degrada por el trabajo honrado; lo que degrada es la ociosidad y la egoísta
dependencia» (*La educación*, 2008, p. 215), y «Dios rodeó a los niños y jóvenes
con Su maravillosa creación a fin de despertar su interés y revelarles a su
Creador» (*La educación*, 2008, p. 100). Un campus con huerto, árboles y espacio
para correr forma de un modo que ninguna charla sustituye.

Y mira la familia: el acuerdo formativo escrito entre institución, familia y
estudiante; la comunicación regular y no solo la llamada cuando hay un problema;
el programa de acogida y formación de padres; y el régimen de visitas y de
retorno a casa. «Padres y maestros deben trabajar en armonía para el bien de los
hijos» (*Consejos para los maestros, padres y alumnos*, 2007, p. 87). Un
internado que se comunica con la familia solo para cobrar o para informar una
falta ya rompió el acuerdo que lo sostiene.""",
  orientacion="**Orientación al evaluador.** Pregunte a un residente cuándo habló por última "
              "vez con su familia y cómo. Pida el registro de comunicaciones del último "
              "trimestre y compruebe cuántas fueron por un motivo que no era disciplinario. "
              "Recorra las instalaciones deportivas y los espacios de arte en horario de uso, "
              "no vacíos.",
  meta=[(38, "«Tengo tiempo y lugar para hacer deporte y moverme.» (ref. ILE ítem 12)"),
        (41, "«Aprovecho bien el tiempo libre y los fines de semana.» (ref. ILE ítem 14)"),
        (43, "«Mi familia sabe cómo estoy y la institución se comunica con ella.» (ref. IVC ítem 6)")],
  criterios=[
   dict(num=38, puntos=15,
    enunciado="La institución ofrece práctica deportiva y actividad física regular, con orientación profesional y espacios adecuados.",
    evidencias=[
     ("Programa deportivo del período con responsable habilitado y carga horaria.",
      "Indicar las modalidades ofrecidas y la proporción de residentes que participa.", ""),
     ("Inventario y estado de las instalaciones y del material deportivo.",
      "Con registro fotográfico fechado del período en curso.", ""),
    ]),
   dict(num=39, puntos=15,
    enunciado="La institución ofrece formación y práctica en música, arte y cultura, con participación efectiva de los residentes.",
    evidencias=[
     ("Programa de música, arte y cultura del período, con responsables.",
      "Indicar grupos existentes, ensayos y presentaciones realizadas.", ""),
     ("Registro de participación de los residentes y de las presentaciones del período.",
      "Con la proporción de residentes alcanzada.", ""),
    ]),
   dict(num=40, puntos=15,
    enunciado="El campus ofrece contacto regular con la naturaleza y actividades de trabajo formativo adecuadas a la edad.",
    evidencias=[
     ("Descripción de las áreas verdes, huertos o espacios naturales en uso formativo.",
      "Con registro fotográfico fechado y su régimen de acceso.", ""),
     ("Plan de actividades de trabajo formativo por franja etaria, con medidas de seguridad.",
      "Debe distinguir trabajo formativo de tarea de mantenimiento y respetar la legislación laboral de menores.", ""),
    ]),
   dict(num=41, puntos=15,
    enunciado="El fin de semana y el tiempo libre tienen programación intencional, con alternativas y descanso real.",
    evidencias=[
     ("Programación de los fines de semana del último trimestre.",
      "Debe mostrar alternativas y no una única actividad obligatoria.", ""),
     ("Registro de participación y de la evaluación que hicieron los residentes.",
      "Instrumento aplicado y ajustes derivados.", ""),
    ]),
   dict(num=42, puntos=10,
    enunciado="Existe un acuerdo formativo escrito entre la institución, la familia y el residente, firmado al inicio del vínculo.",
    evidencias=[
     ("Modelo del acuerdo formativo tripartito, con los compromisos de cada parte.",
      "Debe explicitar lo que la institución asume, lo que la familia conserva y lo que se espera del residente.", ""),
     ("Muestra de acuerdos firmados en la matrícula del período en curso.",
      "Anonimizada, con la proporción de familias que lo firmó.", ""),
    ]),
   dict(num=43, puntos=10,
    enunciado="La institución mantiene comunicación regular con la familia sobre la vida del residente, y no solo ante incidentes.",
    evidencias=[
     ("Plan de comunicación con las familias, con canales y periodicidad.",
      "Debe prever informes de rutina y no únicamente avisos disciplinarios o de cobranza.", ""),
     ("Registro de las comunicaciones del último trimestre.",
      "Indicar cuántas fueron de rutina y cuántas por incidente.", ""),
    ]),
   dict(num=44, puntos=10,
    enunciado="La institución ejecuta un programa de acogida y formación de padres de residentes.",
    evidencias=[
     ("Programa de acogida y formación de familias del período, con temas y responsables.",
      "Indicar modalidad, frecuencia y cobertura alcanzada.", ""),
     ("Registro de los encuentros realizados y de la participación de las familias.",
      "Listas o registros de acceso, con la proporción de familias alcanzada.", ""),
    ]),
   dict(num=45, puntos=10,
    enunciado="El régimen de visitas y de retorno a casa está definido por escrito y se cumple con registro.",
    evidencias=[
     ("Régimen de visitas y de salidas a casa, aprobado y comunicado a las familias.",
      "Debe indicar frecuencia, autorizaciones requeridas y responsables del acompañamiento.", ""),
     ("Registro de visitas y de retornos del último trimestre.",
      "Con identificación del visitante y su vínculo con el residente.", ""),
    ]),
  ]),
]
