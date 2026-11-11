# -*- coding: utf-8 -*-
"""Formulario de Vida en el Campus — Educación Básica, versión en español.

Es el documento rector: el portugués lo traduce. La arquitectura es la misma
que la del instrumento de Educación Superior —cinco dimensiones, cuarenta y
cinco criterios, seiscientos puntos—, para que los dos niveles se puedan
comparar; lo que cambia es el sujeto. Allí el residente es un adulto joven que
pacta; aquí es un menor de edad cuya familia delega el cuidado, y el peso se
desplaza hacia la protección.
"""

NIVEL = "EDUCACIÓN BÁSICA"
TITULO = ["FORMULARIO DE", "VIDA EN EL CAMPUS", "EN LOS INTERNADOS", "ADVENTISTAS"]
CITA_PORTADILLA = (
    "«El internado de educación básica es la casa que una familia confía: se evalúa por el cuidado que devuelve.»")
CABECERA = [("VIDA EN EL CAMPUS", "montxbold"),
            (" EN LOS INTERNADOS ADVENTISTAS", "mont")]

ROTULOS = dict(
    evidencias="EVIDENCIAS", detalle="DETALLE",
    documentos="DOCUMENTOS EN PDF / ANEXO", puntos="PUNTOS",
    nivel="NIVEL DE LOGRO", observacion="OBSERVACIÓN",
    criterio="CRITERIO", total="TOTAL", continua="(continúa)",
    criterios="CRITERIOS", dimension="DIMENSIÓN",
    mapa="LAS CINCO DIMENSIONES DE LA EVALUACIÓN",
    mapa_pie="Cada dimensión se evalúa por separado y abre con su propio color. "
             "El total general del instrumento es de 600 puntos repartidos en "
             "45 criterios.",
    meta="META DE VIVENCIA PERCIBIDA",
)

TITULOS = dict(
    s1="SECCIÓN I: VIDA EN EL CAMPUS EN EL CONTEXTO DE LOS INTERNADOS ADVENTISTAS",
    s2="SECCIÓN II: DIMENSIONES DE EVALUACIÓN",
    s3="SECCIÓN III: EVALUACIÓN",
    evaluacion="3. Evaluación de la calidad por dimensión",
    evaluacion_entrada="Cada dimensión abre con su propio color y su total de puntos. "
                       "Dentro de ella, cada criterio ocupa un bloque: la banda lleva su "
                       "número, su enunciado y su puntaje máximo; debajo van las "
                       "evidencias y, al pie, la casilla que marca la comisión.",
)

COLUMNAS = ("CÓMO SE LEE CADA CRITERIO", [
  ("EVIDENCIAS", "Qué hay que reunir",
   "Los documentos y registros que la institución debe presentar para ese criterio. "
   "Un criterio sin evidencia se califica como No Atiende."),
  ("DETALLE", "Qué se espera de cada evidencia",
   "Alcance, periodicidad, muestra o formato: lo que convierte un documento genérico "
   "en una prueba verificable."),
  ("DOCUMENTOS", "Cómo se entrega",
   "El archivo en PDF o el anexo concreto que la comisión revisará en la "
   "autoevaluación y en la visita."),
  ("NIVEL DE LOGRO", "Lo que marca el evaluador",
   "Una sola casilla por criterio, con el rango de puntos de cada nivel. El puntaje "
   "de la evaluación in situ es el que se consolida."),
  ("OBSERVACIÓN", "Por qué se decidió así",
   "El fundamento del nivel asignado y lo que falta para alcanzar el siguiente. Es "
   "la base del plan de mejora."),
])

JUSTIFICACION = """# JUSTIFICACIÓN Y RELEVANCIA

## Un instrumento que desarrolla lo que la acreditación resume

El Formulario de Acreditación de Internados evalúa el colegio completo en seis
dimensiones y 1.485 puntos, y dedica a la vida residencial su Dimensión 6, con
250 puntos. Esa dimensión es un resumen: cabe en nueve páginas porque tiene que
convivir con la gestión pedagógica, las finanzas y la infraestructura de toda la
institución. Lo que sigue aquí es su desarrollo. No sustituye a la acreditación
ni la repite: toma el mismo territorio y lo mira con el detalle que no cabía
allí, porque en un internado de educación básica la vida residencial no es una
dimensión más del colegio, es el colegio durante veinte de cada veinticuatro
horas.

La diferencia no es de extensión, es de consecuencia. Un colegio con internado
recibe a un menor de edad y asume, por delegación de su familia, lo que esa
familia haría si el hijo durmiera en su casa: despertarlo, alimentarlo, cuidarlo
cuando se enferma, acompañarlo cuando tiene miedo, corregirlo cuando se equivoca
y responder por él ante la ley. Ninguna de esas obligaciones se cumple con buena
voluntad: se cumplen con equipo, con procedimiento y con registro.

## Qué se evalúa aquí

Cinco dimensiones, cuarenta y cinco criterios y seiscientos puntos. El equipo
que acompaña al residente; los espacios y la rutina en que vive; la vida
espiritual del campus; la salud, el bienestar emocional y la protección del
menor; y la recreación, la cultura y el vínculo con su familia. Son las mismas
cinco del instrumento de Educación Superior, de modo que los dos niveles se
pueden leer en paralelo, pero el peso está repartido de otra manera: aquí la
protección pesa ciento cuarenta puntos y la autonomía cede su lugar a la
responsabilidad creciente.

## Un alumno interno es un menor confiado

Esta es la premisa que ordena todo el instrumento. El residente de educación
básica no firma su matrícula, no decide su horario, no elige a sus compañeros de
cuarto y no puede marcharse si algo le incomoda. Su consentimiento no sustituye
al de su familia y su silencio no equivale a su conformidad. De ahí que varios
criterios que en el nivel superior preguntan si la institución pacta, aquí
pregunten si la institución supervisa, registra y responde.

Eso no convierte al internado en un régimen de vigilancia. La educación
adventista nunca entendió la disciplina como control: «todo verdadero educador,
al llamar la atención de un alumno por una falta, lo hará de tal modo que el
estudiante pueda sentirse animado a hacer lo mejor posible» (*Consejos para los
maestros, padres y alumnos*, 2007, p. 264). Lo que el instrumento busca es la
combinación difícil: una casa segura donde, además, se crece.

## Cada criterio pide evidencia

Ningún criterio se satisface con una declaración de intenciones. Cada uno nombra
los documentos que la institución debe presentar, qué se espera de cada uno
—alcance, periodicidad, muestra, formato— y cómo se entrega. Un criterio sin
evidencia se califica como No Atiende, aunque la práctica exista: lo que no deja
rastro no se puede acompañar cuando cambia el equipo, y en la preceptoría el
equipo cambia.

## La vivencia percibida

Cada dimensión cierra con una meta de vivencia percibida, tomada de los índices
ILE e IVC que el Referencial describe. Es el contraste entre lo que la
institución documenta y lo que el residente dice vivir. Cuando las dos cifras
coinciden, hay calidad. Cuando no, hay trabajo por hacer, y conviene saberlo
antes de que la familia lo diga retirando al hijo.

## Alcance regional

Este es un **instrumento de aplicación regional**, elaborado para los ocho
países de la División Sudamericana. Los criterios legales, sanitarios y
laborales se interpretan conforme a la legislación vigente en cada país, y las
referencias a la protección de niños y adolescentes, a los órganos de garantía
de derechos y a las obligaciones de notificación se expresan de forma genérica:
cada Unión o institución presenta el documento equivalente en su territorio. La
equivalencia no rebaja la exigencia: la traduce.
"""

PRESENTACION = """# PRESENTACIÓN

## Palabra del Director de Educación de la División Sudamericana

La educación adventista ha desempeñado un papel fundamental en la formación de
niños y adolescentes comprometidos con Dios, con la Iglesia y con la sociedad. A
lo largo de los años, nuestros procesos de evaluación y acreditación han
fortalecido la excelencia académica, la gestión institucional, los servicios y la
fidelidad a la misión que nos identifica como colegios adventistas.

Al mismo tiempo, reconocemos que una parte esencial de la experiencia educativa
ocurre más allá de las aulas. En los internados adventistas, los estudiantes
viven, construyen amistades, ejercitan su responsabilidad, desarrollan hábitos,
maduran su fe y aprenden a convivir en comunidad. Es en ese ambiente donde muchos
descubren su vocación, consolidan valores y desarrollan competencias de liderazgo
que influirán en su servicio a la Iglesia y a la sociedad a lo largo de toda la
vida.

Este instrumento fue desarrollado para valorar y fortalecer esa dimensión de la
formación adventista. Su propósito no es repetir procesos ya existentes, sino
ofrecer una visión más amplia de la experiencia educacional, considerando los
diversos espacios y actividades que componen la vida en el campus. Residencias,
comedores, capillas, áreas deportivas, programas espirituales, iniciativas
misioneras y momentos de convivencia se vuelven, así, elementos intencionalmente
observados como parte del proceso educativo integral.

Una característica importante de este formulario es reconocer que el internado
de educación básica recibe a un menor de edad confiado por su familia. Por eso el
instrumento valora las prácticas que protegen, acompañan y forman: la presencia
del adulto, la claridad del procedimiento, el cuidado de la salud y del bienestar
emocional, y la alianza con los padres. Busca evaluar no solo lo que la
institución planifica y organiza, sino también la experiencia efectivamente
vivida por los residentes y el impacto de esa experiencia en su desarrollo
humano, espiritual y profesional.

Nuestro deseo es que este proceso contribuya a fortalecer aún más los internados
adventistas como comunidades formativas intencionales, donde la fe es vivida, el
carácter es moldeado y la misión es aprendida en lo cotidiano. Que cada campus
sea reconocido no solo por la calidad de sus programas académicos, sino también
por su capacidad de preparar mujeres y hombres para liderar, servir y testimoniar
con excelencia en todas las áreas de actuación a las cuales Dios los llame.

**Pr. Antonio Marcos Alves**
Director de Educación
División Sudamericana de la Iglesia Adventista del Séptimo Día
"""

SECCION_I = """# SECCIÓN I: VIDA EN EL CAMPUS EN EL CONTEXTO DE LOS INTERNADOS ADVENTISTAS

## La casa que una familia confía

Toda la filosofía adventista de la educación descansa sobre una convicción que
no admite recortes: la verdadera educación consiste en «el desarrollo armonioso
de las facultades físicas, mentales y espirituales» (*La educación*, 2008,
p. 13), y su objetivo último es restaurar en el ser humano la imagen de su
Hacedor, «cuerpo, espíritu y alma, para que se pudiese realizar el propósito
divino de su creación» (*La educación*, 2008, p. 15-16). Si eso es cierto, el
aula no alcanza. Un colegio con internado educa también mientras el estudiante
duerme, come, discute con un compañero, se enferma a medianoche o echa de menos
su casa.

En educación básica esa afirmación tiene además un peso jurídico y moral que no
conviene suavizar. El internado no recibe a un adulto que eligió vivir allí:
recibe a un niño o a un adolescente que su familia confió a la institución. La
casa, por un tiempo, es esta. Y una casa se juzga por el cuidado que devuelve.

## El modelo de Nazaret

Ellen G. White presenta el arreglo original de la educación como una norma que
no caduca: «El método de educación instituido al principio del mundo debía ser
para el hombre el modelo durante todo el tiempo subsiguiente» (*La educación*,
2008, p. 20). Ese modelo no separaba el estudio de la vida: el hogar, el
trabajo, la naturaleza y el culto formaban una sola experiencia formativa.

El internado adventista es, en el fondo, un intento de reconstruir esa unidad
dentro de una institución moderna. Por eso no puede evaluarse como se evalúa un
servicio de hospedaje escolar. Lo que se mide aquí no es la comodidad del
alojamiento, sino la coherencia de un ambiente completo: si la residencia, el
comedor, la capilla, la enfermería, la cancha y la tarde del sábado dicen lo
mismo que dice el aula.

## Para qué fueron creados nuestros internados

Los internados adventistas no nacieron como una solución logística para familias
que viven lejos. Nacieron como ambientes formativos intencionales. White escribió
que los lugares «donde se reúnen jóvenes en busca de preparación para el servicio
de Dios deben acercarse lo más posible al modelo divino» (*Testimonios selectos,
tomo 2*, 2007, p. 434), y que uno de los grandes objetivos de nuestras escuelas
es «la preparación de jóvenes para que se empeñen en el servicio de nuestras
instituciones, así como en los varios ramos de la obra del evangelio»
(*La educación*, 2008, p. 126).

De ahí se sigue algo que este instrumento toma en serio: un internado adventista
que funcione bien en lo operativo y no forme discípulos ha fallado en lo que lo
justifica. Y a la inversa, un internado con mucha programación espiritual y una
residencia descuidada tampoco cumple, porque en la cosmovisión adventista el
cuerpo y el alma no se atienden por separado.

## La comunidad es el método

La vida en el campus no es el escenario de la formación: es su instrumento. Los
estudiantes de un internado, escribió White, «no deben vivir como átomos
independientes, sino como hilos que se entrelazan en la composición de un
tejido» (*Testimonios selectos, tomo 2*, 2007, p. 158-159). El conflicto con un
compañero de cuarto, el turno de limpieza, la mesa compartida y la convivencia
obligada con quien uno no habría elegido enseñan lo que ninguna asignatura
enseña.

Esa misma comunidad, sin embargo, puede volverse asfixiante. White advirtió que
«cuanto más estrechas, más exclusivas y más artificiales sean las condiciones en
que el estudiante vive, tanto más fuerte será la impresión del mundo
circundante» (*La educación*, 2008, p. 213). Un internado cerrado sobre sí mismo
amplifica todo lo que ocurre dentro, lo bueno y lo malo. Por eso el instrumento
pregunta por la salida programada, por el vínculo con la familia y por el
contacto con la comunidad local: no son concesiones al ocio, son válvulas que
una comunidad intensa necesita para no enfermarse.

## Un menor en formación, no un adulto pequeño

La pedagogía adventista nunca trató al estudiante como una masa uniforme: «cada
niño tiene su individualidad, y el educador debe estudiar esa individualidad con
cuidado» (*La educación*, 2008, p. 232). En un internado de educación básica eso
significa que la franja etaria manda. No se acompaña igual a un alumno de once
años que a uno de diecisiete; no duermen las mismas horas, no toleran la misma
distancia de su casa, no entienden del mismo modo una norma ni una corrección.

El instrumento traduce esa diferencia en criterios concretos: dormitorios y
rutinas organizados por edad, supervisión proporcional, responsabilidades que
crecen con el curso y una participación real —orientada, no decorativa— en la
vida de la residencia. La meta declarada de la educación adventista es formar
personas «que piensen, y no que simplemente reflejen el pensamiento de otros»
(*La educación*, 2008, p. 17-18), y eso empieza mucho antes de la mayoría de
edad.

## La fe que se vive, no la que se exige

El internado es, para muchos estudiantes, el lugar donde la fe deja de ser la de
sus padres y empieza a ser la suya. Ese tránsito no se produce por acumulación de
actividades. White pidió que los cultos se condujeran «con vida espiritual,
reverencia y atractivo», evitando «el formalismo y la monotonía» (*Testimonios
selectos, tomo 2*, 2007, p. 160-161). Un culto obligatorio y vacío no es neutro:
enseña que la religión es un trámite.

Por eso este instrumento no cuenta cultos: pregunta por su conducción, por el
protagonismo del estudiante en ellos, por el acompañamiento pastoral individual,
por los pequeños grupos y por lo que ocurre el sábado, que es el día en que la
identidad adventista se vive o se simula. Y pide que la decisión de fe —el
bautismo, la clase bíblica— esté acompañada de la familia, porque en educación
básica la institución no sustituye a los padres en lo que es suyo.

## Cuidar y proteger son parte de la misión

Hay una franja del cuidado que no admite matices. Un internado que recibe
menores debe poder demostrar qué hace cuando un residente se enferma, se
accidenta, entra en crisis emocional, es maltratado por un compañero o es herido
por un adulto. Eso exige enfermería con responsable técnico, protocolos escritos,
control de la medicación, atención psicológica accesible, canales de denuncia que
el estudiante conozca y use, verificación de antecedentes del personal y una ruta
de notificación a los órganos de garantía de derechos.

Nada de esto compite con la formación espiritual: la sostiene. Un estudiante que
no se siente seguro no aprende ni cree; aprende a sobrevivir. Y la corrección,
cuando hace falta, sigue siendo formativa y no punitiva, en la línea que ya se
citó: que el estudiante «pueda sentirse animado a hacer lo mejor posible»
(*Consejos para los maestros, padres y alumnos*, 2007, p. 264).

## El trabajo, la naturaleza y el tiempo libre también forman

La educación adventista sostuvo siempre que la ocupación física es parte de la
formación y no un adorno: «ningún hombre ni mujer se degrada por el trabajo
honrado; lo que degrada es la ociosidad y la egoísta dependencia» (*La
educación*, 2008, p. 215), y la enseñanza práctica «debe desarrollar hábitos de
exactitud y perfección» hasta que los jóvenes «sean señores y no esclavos del
trabajo» (*La educación*, 2008, p. 222).

A eso se suma el ambiente. «Dios rodeó a los niños y jóvenes con Su maravillosa
creación a fin de despertar su interés y revelarles a su Creador» (*La
educación*, 2008, p. 100). Un campus con árboles, huerto y espacio para correr no
es un lujo: es parte del método. Y el tiempo libre —el deporte, la música, el
arte, el fin de semana— no es el hueco entre dos actividades formativas; es
donde el residente descansa, se reencuentra con su familia y descubre lo que le
gusta.

## La alianza con la familia

«Padres y maestros deben trabajar en armonía para el bien de los hijos»
(*Consejos para los maestros, padres y alumnos*, 2007, p. 87). En educación
básica esa frase deja de ser un consejo y se vuelve una condición de
funcionamiento. La familia no entregó a su hijo: delegó su cuidado, y conserva
la autoridad sobre lo esencial.

El instrumento pide, por eso, un acuerdo formativo escrito entre institución,
familia y estudiante; una comunicación regular y verdadera, no solo la llamada
cuando hay un problema; un programa de acogida y formación de padres; y
constancia de que la familia es informada y consultada en las decisiones que le
corresponden. Un internado que se comunica con los padres únicamente para cobrar
o para reportar faltas ha roto la alianza que lo sostiene.

## Qué significa, entonces, evaluar la vida en el campus

Significa preguntar por cada uno de esos lugares lo mismo que se pregunta por el
aula: qué se propone, quién responde, con qué evidencia se sostiene y cómo lo
vive el estudiante. Las cinco dimensiones que siguen ordenan esa pregunta. No
son categorías administrativas: son las cinco respuestas que un internado de
educación básica debe poder dar sobre la casa que una familia le confió.
"""

SECCION_II_ENTRADA = (
    "Las cinco dimensiones que siguen no son categorías administrativas: son las "
    "cinco preguntas que un internado de educación básica debe poder responder "
    "sobre la vida que ocurre en su campus. Cada una se describe aquí —qué "
    "evalúa, por qué importa y qué mira— y se aplica después, criterio por "
    "criterio, en la Sección III."
)

from crit_es import DIMENSIONES   # noqa: E402  (los 45 criterios, en su módulo)
