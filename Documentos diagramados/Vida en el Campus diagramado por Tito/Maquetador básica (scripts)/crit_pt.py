# -*- coding: utf-8 -*-
"""As cinco dimensões do Formulário de Vida no Campus — Educação Básica.

Tradução de `crit_es.py`, que é o documento reitor. Mesma armação do
instrumento de Educação Superior: cinco dimensões, quarenta e cinco critérios,
seiscentos pontos, com a proteção do menor em cento e quarenta.
"""

DIMENSIONES = [
 dict(
  corto="EQUIPE RESIDENCIAL E PRECEPTORIA",
  n=1, color=2, puntos=120,
  nombre="EQUIPE RESIDENCIAL E PRECEPTORIA",
  descripcion="""A primeira condição de um internato de educação básica não é o seu edifício:
são os adultos que vivem nele. Um campus com instalações excelentes e sem
equipe suficiente é um alojamento; um campus modesto com uma equipe presente,
formada e verificada é um internato.

Esta dimensão avalia quem acompanha o menor. Observa se a equipe cobre as vinte
e quatro horas —incluída a madrugada e o fim de semana, que é quando a
instituição costuma ficar vazia de autoridades—; se os seus integrantes têm o
perfil espiritual e profissional que o acompanhamento de crianças e adolescentes
exige; se a instituição verificou os seus antecedentes antes de contratá-los; e
se cada residente tem um adulto de referência que o conhece pelo nome.

A proporção importa tanto quanto a presença, e aqui importa em dobro. Um
internato pode declarar que conta com preceptores e, ainda assim, deixar uma
residência inteira de adolescentes a cargo de uma só pessoa durante a noite. Por
isso se pede o quadro da equipe com nomes, funções e escala de turnos, junto com
a população real do período e a sua distribuição por idade e por sexo.

O perímetro da equipe é mais largo do que parece: também têm contato diário com
os residentes a cozinha, a limpeza, a portaria, o transporte e os voluntários. A
verificação de antecedentes e a formação em proteção alcançam qualquer pessoa
que entre numa residência.

E observa se a instituição cuida de quem cuida. A preceptoria desgasta e tem
rotatividade alta, e uma equipe exausta não acompanha, apenas vigia: Maslach e
Jackson (1981) descreveram esse esgotamento como cansaço emocional,
despersonalização do trato e perda de sentido, as três coisas que um residente
percebe de imediato. Por isso se pede também o que acontece quando alguém da
equipe vai embora, porque a cada saída perde-se o que essa pessoa sabia dos
residentes que acompanhava.

E pergunta pela linha de comando: quem autoriza uma saída imprevista, quem liga
para a família à meia-noite e quem responde perante a direção do colégio pelo
que aconteceu ontem à noite na residência. Onde essa linha não está escrita, o
que há não é flexibilidade: é um vazio que aparece justamente quando algo dá
errado.""",
  orientacion="**Orientação ao avaliador.** Verifique a relação entre o tamanho da equipe "
              "e a população residente real por faixa etária, não a declarada no plano. "
              "Pergunte quem responde às três da manhã de um domingo e peça o documento "
              "que o estabelece. Peça os comprovantes de verificação de antecedentes de "
              "todo o pessoal com acesso às residências, sem exceção.",
  meta=[(1, "«Há sempre um adulto disponível quando preciso, também à noite.» (ref. ILE item 8)"),
        (4, "«Há uma pessoa no internato que me conhece e a quem posso recorrer.» (ref. IVC item 6)"),
        (8, "«Percebo que a instituição cuida também de quem trabalha comigo.» (ref. IVC item 13)")],
  criterios=[
   dict(num=1, puntos=15,
    enunciado="A instituição conta com uma equipe residencial dimensionada para a população atendida, com cobertura presencial nas vinte e quatro horas, incluídas a madrugada e os fins de semana.",
    evidencias=[
     ("Quadro da equipe residencial com nomes, funções, escala de turnos e residência atendida.",
      "Indicar a proporção de adultos por residente e a população real do período, desdobrada por idade e por sexo.", ""),
     ("Contratos e registro de jornada da equipe residencial.",
      "Apresentar o registro dos últimos três meses, não o modelo de contrato.", ""),
     ("Declaração de cobertura noturna e de fim de semana com responsável identificado.",
      "Deve nomear a pessoa de plantão em cada faixa e o modo de contato imediato.", ""),
    ]),
   dict(num=2, puntos=15,
    enunciado="A instituição verifica os antecedentes de todo integrante da equipe com acesso às residências antes da sua contratação e de forma periódica.",
    evidencias=[
     ("Certidões de antecedentes criminais e, onde exista, do registro de proteção de crianças e adolescentes.",
      "Deve cobrir a totalidade do pessoal com acesso a residências, incluídos serviços terceirizados e voluntários.", ""),
     ("Procedimento escrito de verificação, com responsável e periodicidade de renovação.",
      "Indicar de quanto em quanto tempo se renova e o que ocorre quando um antecedente aparece.", ""),
     ("Registro da última verificação realizada, com data e assinatura do responsável.",
      "Apresentar a planilha consolidada do período em curso.", ""),
    ]),
   dict(num=3, puntos=15,
    enunciado="Os integrantes da equipe residencial são membros da Igreja Adventista do Sétimo Dia em plena comunhão e possuem formação compatível com o acompanhamento de crianças e adolescentes.",
    evidencias=[
     ("Declaração de membresia assinada pela capelania ou pelo pastor distrital.",
      "Indicar a igreja de cada integrante e a data da declaração.", ""),
     ("Listagem da equipe com a sua formação acadêmica e denominacional.",
      "Anexar diplomas, certificados ou registro institucional dos cursos realizados.", ""),
     ("Perfil de cargo do preceptor ou coordenador residencial, aprovado pela instituição.",
      "Deve explicitar requisitos espirituais, acadêmicos e de experiência com menores.", ""),
    ]),
   dict(num=4, puntos=15,
    enunciado="A instituição executa um plano de formação inicial e continuada da equipe residencial, com conteúdos próprios do cuidado de menores.",
    evidencias=[
     ("Plano de formação com conteúdos, carga horária e cronograma.",
      "Deve incluir filosofia adventista da educação, primeiros socorros, saúde mental do adolescente, mediação de conflitos, cuidado pastoral, proteção integral e rota de notificação.", ""),
     ("Registro de participação da equipe nas formações dos últimos dois anos.",
      "Listas de presença e certificados, com o percentual da equipe alcançado.", ""),
     ("Integração documentada para os integrantes que ingressam durante o ano letivo.",
      "Apresentar o roteiro de integração e o registro da última realizada.", ""),
    ]),
   dict(num=5, puntos=15,
    enunciado="Cada residente conta com um integrante da equipe como referência, e o acompanhamento individual fica registrado.",
    evidencias=[
     ("Atribuição nominal de residentes por preceptor de referência, vigente no período.",
      "Deve cobrir a totalidade da população residente e respeitar a faixa etária.", ""),
     ("Registro de entrevistas e acompanhamento individual, com critérios de confidencialidade.",
      "Apresentar o instrumento de registro e uma amostra anonimizada do semestre em curso.", ""),
     ("Procedimento de encaminhamento quando o acompanhamento excede a competência do preceptor.",
      "Indicar para quem se encaminha, em que prazo e com que registro, incluída a comunicação à família.", ""),
    ]),
   dict(num=6, puntos=15,
    enunciado="A instituição cuida da saúde ocupacional e do descanso da equipe residencial, e acompanha o desgaste próprio da função.",
    evidencias=[
     ("Escala de turnos com descansos e folgas efetivamente concedidos nos últimos seis meses.",
      "Deve permitir verificar horas de trabalho consecutivas e descanso semanal real.", ""),
     ("Registro do acompanhamento oferecido à equipe: supervisão, apoio psicológico ou pastoral.",
      "Indicar periodicidade, responsável e cobertura alcançada.", ""),
     ("Avaliação do clima e do desgaste da equipe residencial.",
      "Apresentar o instrumento aplicado, os seus resultados e as medidas adotadas.", ""),
    ]),
   dict(num=7, puntos=10,
    enunciado="A instituição documenta a continuidade do acompanhamento quando um integrante da equipe deixa a sua função.",
    evidencias=[
     ("Procedimento escrito de transferência de casos ativos, com resguardo da confidencialidade.",
      "Deve indicar o que se transfere, para quem e em que prazo.", ""),
     ("Registro da última transferência realizada.",
      "Apresentar a ata ou formulário assinado por quem entrega e por quem recebe.", ""),
    ]),
   dict(num=8, puntos=10,
    enunciado="A equipe residencial participa de instâncias regulares de planejamento e avaliação da vida residencial.",
    evidencias=[
     ("Atas das reuniões da equipe residencial do período em curso.",
      "Ao menos uma reunião mensal, com pauta, presentes e decisões registradas.", ""),
     ("Plano anual da vida residencial com responsáveis e prazos.",
      "Deve mostrar as decisões que nasceram dessas reuniões.", ""),
    ]),
   dict(num=9, puntos=10,
    enunciado="A direção do internato integra a estrutura de gestão do colégio e responde formalmente pela vida residencial.",
    evidencias=[
     ("Organograma institucional com a posição e as atribuições da direção do internato.",
      "Deve mostrar a linha de reporte à direção geral do colégio.", ""),
     ("Ato de designação do responsável pelo internato, vigente no período.",
      "Indicar data, instância que o designou e alcance das suas atribuições.", ""),
    ]),
  ]),
 dict(
  corto="ESPAÇOS, ROTINA E CONVIVÊNCIA",
  n=2, color=4, puntos=120,
  nombre="ESPAÇOS, ROTINA E CONVIVÊNCIA",
  descripcion="""A casa onde se vive e o relógio que a governa. Esta dimensão avalia as
condições materiais da residência e o modo como o dia está organizado:
dormitórios por idade e por sexo, sanitários suficientes, refeitório, espaços de
estudo, manutenção e limpeza, horário de sono adequado à faixa etária,
alimentação supervisionada por profissional habilitado e um regime de uso de
dispositivos que proteja o descanso sem isolar o residente da sua família.

Observa também a norma: se existe um regulamento escrito, se o residente e a sua
família o conhecem antes de matricular-se, se as medidas disciplinares estão
tipificadas e são proporcionais, e se há um canal pelo qual um estudante pode
reclamar sem temor. A norma de um internato de menores não se negocia, mas
explica-se, e a diferença entre explicar e simplesmente impor é educativa.

E pergunta pela participação. Que o residente seja menor não significa que não
tenha voz: significa que a sua voz se exerce orientada. Uma representação
estudantil com atribuições reais na vida cotidiana da residência é formação
cidadã, não uma concessão.

E observa o detalhe que costuma decidir tudo: o horário de sono. Um adolescente
que dorme seis horas não rende em aula, irrita-se com os colegas e adoece mais;
o internato é um dos poucos lugares onde esse horário pode ser garantido de
verdade, e por isso aqui se verifica e não se declara.""",
  orientacion="**Orientação ao avaliador.** Percorra as residências sem aviso prévio e em "
              "horário de uso. Comprove a separação por idade e por sexo, o estado real "
              "dos sanitários e o cumprimento do horário de sono. Pergunte aos residentes "
              "como souberam do regulamento e o que fazem quando querem reclamar algo.",
  meta=[(10, "«O lugar onde moro está limpo, cuidado e é confortável.» (ref. ILE item 9)"),
        (13, "«A comida do internato é boa e suficiente.» (ref. ILE item 10)"),
        (17, "«Tenho a quem reclamar quando algo não está bem, e sei que me escutam.» (ref. IVC item 12)")],
  criterios=[
   dict(num=10, puntos=15,
    enunciado="As residências cumprem os padrões mínimos de habitabilidade e estão organizadas por faixa etária e por sexo.",
    evidencias=[
     ("Planta das residências com capacidade por quarto, área e distribuição por idade e sexo.",
      "Indicar a ocupação real do período e a relação entre residentes e sanitários.", ""),
     ("Registro fotográfico datado de dormitórios, sanitários e áreas comuns.",
      "Deve corresponder ao período em curso e cobrir todas as residências em uso.", ""),
     ("Alvará sanitário ou de funcionamento vigente, conforme a legislação do país.",
      "Apresentar o documento com a sua data de vencimento.", ""),
    ]),
   dict(num=11, puntos=15,
    enunciado="A instituição mantém um plano de limpeza, manutenção e reposição das residências, com registro de execução.",
    evidencias=[
     ("Plano de limpeza e manutenção com frequências, responsáveis e áreas cobertas.",
      "Deve distinguir o que faz o pessoal e o que cabe ao residente segundo a sua idade.", ""),
     ("Registro de execução dos últimos três meses.",
      "Planilhas assinadas ou sistema de controle, não o plano repetido.", ""),
     ("Registro de solicitações de reparo com data de abertura e de solução.",
      "Indicar o prazo médio de atendimento do período.", ""),
    ]),
   dict(num=12, puntos=15,
    enunciado="A rotina diária está estabelecida por escrito, respeita as horas de sono próprias de cada faixa etária e é conhecida pelo residente e pela sua família.",
    evidencias=[
     ("Rotina diária e semanal aprovada pela direção, diferenciada por faixa etária.",
      "Deve explicitar hora de levantar, de estudo, de culto, das refeições e de silêncio.", ""),
     ("Comprovante de entrega da rotina ao residente e à sua família no início do ano letivo.",
      "Apresentar o comprovante assinado ou o registro de envio.", ""),
     ("Registro de supervisão do cumprimento do horário de silêncio noturno.",
      "Amostra do último mês, com responsável identificado por turno.", ""),
    ]),
   dict(num=13, puntos=15,
    enunciado="A alimentação é planejada por profissional habilitado, atende às necessidades nutricionais da idade e contempla restrições alimentares documentadas.",
    evidencias=[
     ("Cardápio mensal assinado por nutricionista com registro profissional vigente.",
      "Deve corresponder ao período em curso e indicar o aporte por faixa etária.", ""),
     ("Registro de residentes com restrição alimentar ou necessidade especial e o seu atendimento efetivo.",
      "Indicar como se identifica o residente no refeitório e quem responde por isso.", ""),
     ("Controle sanitário da cozinha e do refeitório.",
      "Alvará vigente, controle de manipuladores e registro da última inspeção.", ""),
    ]),
   dict(num=14, puntos=15,
    enunciado="A instituição garante tempo e espaço de estudo supervisionado, adequados à carga escolar de cada série.",
    evidencias=[
     ("Horário de estudo supervisionado com responsável por faixa etária.",
      "Indicar a duração diária e o espaço físico destinado.", ""),
     ("Registro de acompanhamento do rendimento escolar dos residentes.",
      "Deve mostrar a articulação entre a preceptoria e a coordenação pedagógica.", ""),
     ("Plano de apoio para residentes com dificuldade de aprendizagem.",
      "Apresentar o procedimento e uma amostra anonimizada do período.", ""),
    ]),
   dict(num=15, puntos=15,
    enunciado="O uso de dispositivos e o acesso à internet estão regulados de modo que protejam o descanso e o estudo sem impedir o contato com a família.",
    evidencias=[
     ("Política de uso de dispositivos e de conectividade, aprovada pela direção.",
      "Deve diferenciar por faixa etária e prever horários de contato com a família.", ""),
     ("Comprovante de que a política foi informada ao residente e à sua família.",
      "Comprovante assinado na matrícula ou registro de comunicação.", ""),
     ("Medidas técnicas de proteção na rede institucional.",
      "Filtros de conteúdo, registro de incidentes e responsável técnico.", ""),
    ]),
   dict(num=16, puntos=10,
    enunciado="O internato conta com um regulamento escrito, com medidas disciplinares tipificadas e proporcionais, conhecido pelo residente e pela sua família antes da matrícula.",
    evidencias=[
     ("Regulamento do internato vigente, aprovado pela instância competente.",
      "Deve tipificar faltas, medidas, instâncias de aplicação e direito de defesa.", ""),
     ("Comprovante de entrega e aceitação do regulamento, assinado pela família.",
      "Correspondente à matrícula do período em curso.", ""),
    ]),
   dict(num=17, puntos=10,
    enunciado="Existe um canal de reclamação e sugestão acessível ao residente, com registro e resposta documentada.",
    evidencias=[
     ("Descrição do canal, a sua localização física ou digital e o seu responsável.",
      "Deve garantir que o residente possa usá-lo sem passar por quem é objeto da reclamação.", ""),
     ("Registro de reclamações recebidas e das respostas dadas no período.",
      "Amostra anonimizada, com prazos de resposta.", ""),
    ]),
   dict(num=18, puntos=10,
    enunciado="Os residentes participam de forma orientada na organização da vida residencial, com atribuições definidas conforme a sua idade.",
    evidencias=[
     ("Documento que define a representação estudantil do internato e as suas atribuições.",
      "Deve indicar como se elegem os representantes e com que periodicidade.", ""),
     ("Atas das reuniões dos representantes com a equipe residencial.",
      "Ao menos duas por semestre, com decisões registradas.", ""),
    ]),
  ]),
 dict(
  corto="VIDA ESPIRITUAL NO CAMPUS",
  n=3, color=6, puntos=120,
  nombre="VIDA ESPIRITUAL NO CAMPUS",
  descripcion="""Para muitos residentes, o internato é o lugar onde a fé deixa de ser a dos seus
pais e começa a ser a sua. Esta dimensão avalia se o campus facilita esse
trânsito ou se o substitui por uma agenda de atividades obrigatórias.

Observa o calendário espiritual —cultos, semanas de oração, sábado, programas
denominacionais— e, sobretudo, como é conduzido: White pediu que os cultos
fossem conduzidos «com vida espiritual, reverência e atratividade», evitando «o
formalismo e a monotonia» (*Testemunhos seletos, volume 2*, 2007, p. 160-161).
Observa o acompanhamento pastoral individual, os pequenos grupos e a mentoria,
que são o lugar onde uma dúvida pode ser dita em voz baixa.

E observa duas coisas próprias da educação básica. A primeira é o protagonismo:
um adolescente que dirige um culto, canta, prega ou coordena um grupo aprende o
que não aprende escutando. A segunda é a família: a decisão de fé —a classe
bíblica, o batismo— é acompanhada com os pais, porque a instituição não
substitui a família naquilo que lhe pertence.

Nada disso se mede contando presenças. Mede-se perguntando do que o residente se
lembra da última semana de oração e quem o acompanhou quando teve uma dúvida.""",
  orientacion="**Orientação ao avaliador.** Assista a um culto e a um sábado completo antes "
              "de ler o calendário. Pergunte aos residentes quem dirigiu o último culto e "
              "do que se falou. Verifique que a preparação batismal conte com autorização "
              "e acompanhamento da família, documentados.",
  meta=[(19, "«Os cultos do internato me ajudam e não são uma obrigação vazia.» (ref. ILE item 6)"),
        (22, "«Tenho com quem falar das minhas dúvidas espirituais.» (ref. ILE item 5)"),
        (25, "«Tenho lugar e voz na programação espiritual do campus.» (ref. IVC item 14)")],
  criterios=[
   dict(num=19, puntos=20,
    enunciado="A instituição executa um plano espiritual anual para a vida residencial, com cultos diários conduzidos com participação dos residentes.",
    evidencias=[
     ("Plano espiritual anual do internato, aprovado pela capelania e pela direção.",
      "Deve indicar objetivos, responsáveis, periodicidade e articulação com o calendário do colégio.", ""),
     ("Registro dos cultos realizados no período, com tema e responsável.",
      "Amostra de ao menos um mês, indicando que proporção foi conduzida por residentes.", ""),
     ("Avaliação da programação espiritual por parte dos residentes.",
      "Instrumento aplicado, resultados e ajustes derivados deles.", ""),
    ]),
   dict(num=20, puntos=15,
    enunciado="O sábado tem uma programação própria, diferenciada do resto da semana, que articula culto, descanso e serviço.",
    evidencias=[
     ("Programação sabática tipo e do último trimestre.",
      "Deve mostrar a diferença real com um dia comum, incluída a preparação da sexta-feira.", ""),
     ("Registro de participação dos residentes na igreja do campus ou do distrito.",
      "Indicar a proporção de residentes alcançada.", ""),
    ]),
   dict(num=21, puntos=15,
    enunciado="A capelania oferece acompanhamento pastoral individual acessível aos residentes, com registro e resguardo da confidencialidade.",
    evidencias=[
     ("Designação do capelão ou responsável pastoral do internato, com a sua carga horária.",
      "Indicar a sua disponibilidade efetiva na residência e os horários de atendimento.", ""),
     ("Registro de atendimentos pastorais individuais do período.",
      "Amostra anonimizada, com critérios explícitos de confidencialidade e de encaminhamento.", ""),
     ("Procedimento de encaminhamento entre capelania, psicologia e preceptoria.",
      "Deve indicar em que casos se encaminha e como se informa a família.", ""),
    ]),
   dict(num=22, puntos=15,
    enunciado="Os residentes participam de pequenos grupos ou de um programa de mentoria espiritual com periodicidade definida.",
    evidencias=[
     ("Organização dos pequenos grupos ou da mentoria, com líderes e periodicidade.",
      "Indicar a proporção de residentes que participa e o critério de formação dos grupos.", ""),
     ("Registro de encontros do período em curso.",
      "Ao menos os dois últimos meses, com presença e tema.", ""),
     ("Formação oferecida aos líderes de grupo, sejam da equipe ou residentes.",
      "Apresentar conteúdo, carga horária e lista de participantes.", ""),
    ]),
   dict(num=23, puntos=15,
    enunciado="A instituição oferece formação bíblica sistemática e acompanha as decisões de fé junto com a família do residente.",
    evidencias=[
     ("Programa de classes bíblicas ou de preparação batismal do período.",
      "Indicar responsável, periodicidade e número de participantes.", ""),
     ("Autorização e acompanhamento da família nas decisões de batismo.",
      "Apresentar o modelo de autorização e o registro das decisões do período.", ""),
    ]),
   dict(num=24, puntos=10,
    enunciado="Os residentes participam de iniciativas missionárias e de serviço à comunidade, adequadas à sua idade.",
    evidencias=[
     ("Plano de atividades missionárias e de serviço do período, com medidas de segurança por faixa etária.",
      "Indicar destino, acompanhamento adulto e autorização familiar.", ""),
     ("Registro das atividades realizadas e da participação dos residentes.",
      "Com fotografias ou atas e a proporção de residentes alcançada.", ""),
    ]),
   dict(num=25, puntos=10,
    enunciado="Os residentes exercem protagonismo na programação espiritual: dirigem, pregam, cantam ou coordenam com acompanhamento da equipe.",
    evidencias=[
     ("Escala de participação de residentes na programação espiritual do período.",
      "Deve nomear os residentes e a função que exerceram.", ""),
     ("Registro da preparação oferecida a esses residentes.",
      "Ensaios, orientação pastoral ou formação específica.", ""),
    ]),
   dict(num=26, puntos=10,
    enunciado="O campus conta com espaços destinados à vida espiritual, acessíveis aos residentes fora do horário de programação.",
    evidencias=[
     ("Identificação dos espaços espirituais do campus e o seu regime de uso.",
      "Capela, sala de oração ou equivalente, com horários de acesso livre.", ""),
     ("Registro fotográfico datado e estado de conservação.",
      "Deve corresponder ao período em curso.", ""),
    ]),
   dict(num=27, puntos=10,
    enunciado="A instituição aplica e analisa o Índice de Alinhamento Valorativo Confessional (IVC) entre os residentes.",
    evidencias=[
     ("Instrumento aplicado e ficha técnica da aplicação.",
      "Indicar data, taxa de resposta e garantia de anonimato.", ""),
     ("Relatório de resultados e plano de ação derivado.",
      "Deve identificar as subdimensões mais frágeis e as medidas adotadas.", ""),
    ]),
  ]),
 dict(
  corto="SAÚDE, BEM-ESTAR E PROTEÇÃO",
  n=4, color=3, puntos=140,
  nombre="SAÚDE, BEM-ESTAR EMOCIONAL E PROTEÇÃO DO MENOR",
  descripcion="""É a dimensão que mais pesa, e a única razão é que o residente é menor de idade.
O que aqui se avalia não admite graus de intenção: ou a instituição pode
demonstrar o que faz quando um estudante adoece, se acidenta, entra em crise ou
é ferido por alguém, ou não pode.

Observa o atendimento de saúde —responsável técnico habilitado, controle da
medicação, prontuário, convênio com o serviço do território—, o atendimento
psicológico acessível e o protocolo de saúde mental para os quadros que a
adolescência traz: ansiedade, automutilação, transtornos do sono e da
alimentação, ideação suicida. Observa a segurança do campus: controle de acesso,
saídas autorizadas, deslocamentos, plano de emergência e simulados.

E observa a proteção em sentido estrito: política escrita de proteção de
crianças e adolescentes, canal de denúncia que o residente conhece, rota de
notificação aos órgãos de garantia de direitos do seu país, e registro do que
foi feito. Um internato que não pode mostrar essa rota não está protegendo: está
confiando em que não aconteça. E pede que o residente conheça essa rota: um
canal que só existe no manual não protege ninguém.""",
  orientacion="**Orientação ao avaliador.** Peça a rota de notificação e pergunte à equipe, "
              "separadamente, o que faria diante de uma suspeita de maus-tratos: a resposta "
              "oral revela se o protocolo existe ou se apenas está impresso. Verifique o "
              "controle da medicação no armário, não na planilha, e pergunte aos residentes "
              "se sabem a quem recorrer e se acreditam que seriam escutados.",
  meta=[(28, "«Quando adoeço, o internato me atende bem e avisa a minha família.» (ref. ILE item 11)"),
        (31, "«Sinto-me seguro no lugar onde moro e circulo dentro do campus.» (ref. IVC item 11)"),
        (34, "«Confio em que a instituição sabe como agir quando acontece algo grave.» (ref. IVC item 12)")],
  criterios=[
   dict(num=28, puntos=20,
    enunciado="A instituição conta com atendimento de saúde acessível ao residente, com responsável técnico habilitado e registro clínico individual.",
    evidencias=[
     ("Designação do responsável de saúde com registro profissional vigente e carga horária.",
      "Indicar a cobertura em horário noturno e de fim de semana.", ""),
     ("Ficha de saúde individual de cada residente, com autorização familiar de atendimento.",
      "Deve incluir antecedentes, alergias, vacinas e contato de emergência.", ""),
     ("Registro de atendimentos do período e da comunicação à família.",
      "Amostra anonimizada do último trimestre, com prazo de aviso aos pais.", ""),
    ]),
   dict(num=29, puntos=15,
    enunciado="A administração e a guarda de medicamentos seguem um procedimento escrito, sob responsabilidade identificada.",
    evidencias=[
     ("Procedimento de guarda e administração de medicação, com responsável por turno.",
      "Deve prever prescrição vigente, autorização familiar e registro de cada dose.", ""),
     ("Planilha de administração dos últimos trinta dias.",
      "Com identificação do residente, o medicamento, a hora e quem administrou.", ""),
     ("Registro do controle de estoque e do descarte de medicamentos vencidos.",
      "Apresentar o último inventário assinado.", ""),
    ]),
   dict(num=30, puntos=15,
    enunciado="Existe atendimento psicológico acessível ao residente, com critérios de encaminhamento, confidencialidade e comunicação à família.",
    evidencias=[
     ("Designação do psicólogo escolar com registro profissional e carga horária destinada ao internato.",
      "Indicar a modalidade de acesso do residente ao atendimento.", ""),
     ("Procedimento de encaminhamento entre preceptoria, capelania e psicologia.",
      "Deve indicar prazos, responsáveis e quando se informa a família.", ""),
     ("Registro de atendimentos do período, anonimizado.",
      "Com número de residentes atendidos e motivos agrupados por categoria.", ""),
    ]),
   dict(num=31, puntos=15,
    enunciado="O campus conta com controle de acesso e com um regime documentado de saídas, visitas e deslocamentos dos residentes.",
    evidencias=[
     ("Procedimento de controle de acesso ao campus e às residências.",
      "Deve indicar quem pode entrar, com que identificação e com que registro.", ""),
     ("Registro de saídas e retornos do período, com autorização familiar.",
      "Amostra do último mês, indicando responsável pela autorização e pelo acompanhamento.", ""),
     ("Procedimento de deslocamento de residentes, incluídos os de emergência.",
      "Veículo, condutor habilitado, seguro vigente e aviso à família.", ""),
    ]),
   dict(num=32, puntos=15,
    enunciado="A instituição conta com plano de emergência e evacuação, com simulados realizados e equipamento verificado.",
    evidencias=[
     ("Plano de emergência e evacuação das residências, aprovado e sinalizado.",
      "Deve prever o horário noturno e a presença de residentes com necessidades específicas.", ""),
     ("Registro dos simulados realizados nos últimos doze meses.",
      "Com data, participantes, tempo de evacuação e melhorias identificadas.", ""),
     ("Verificação de extintores, alarmes, iluminação de emergência e saídas.",
      "Apresentar o último laudo técnico com a sua vigência.", ""),
    ]),
   dict(num=33, puntos=15,
    enunciado="A instituição mantém uma política escrita de proteção de crianças e adolescentes, com canal de denúncia conhecido pelo residente.",
    evidencias=[
     ("Política de proteção integral aprovada pela instância competente.",
      "Deve definir condutas proibidas, obrigações do adulto e consequências.", ""),
     ("Descrição do canal de denúncia, o seu acesso e o seu responsável.",
      "Deve permitir denunciar um adulto da instituição sem passar por ele.", ""),
     ("Evidência de divulgação do canal aos residentes e às famílias.",
      "Material usado, data e cobertura da divulgação.", ""),
    ]),
   dict(num=34, puntos=15,
    enunciado="Existe uma rota documentada de notificação aos órgãos de garantia de direitos, com registro do que foi feito.",
    evidencias=[
     ("Fluxo de notificação conforme a legislação do país, com prazos e responsáveis.",
      "Deve nomear o órgão competente e o modo de contato.", ""),
     ("Registro dos casos notificados nos últimos dois anos e do seu acompanhamento.",
      "Anonimizado, indicando data da notificação e desfecho.", ""),
     ("Comprovante de que a equipe foi formada nessa rota.",
      "Lista de participantes e data da última formação.", ""),
    ]),
   dict(num=35, puntos=10,
    enunciado="A instituição desenvolve ações de prevenção do assédio entre pares e acompanha os casos identificados.",
    evidencias=[
     ("Programa de prevenção do assédio e da violência entre residentes.",
      "Indicar conteúdos, periodicidade e faixas etárias alcançadas.", ""),
     ("Registro dos casos identificados e das medidas adotadas.",
      "Anonimizado, com acompanhamento posterior das partes envolvidas.", ""),
    ]),
   dict(num=36, puntos=10,
    enunciado="A instituição aplica e analisa o Índice de Lacuna Espiritual (ILE) e usa os seus resultados no plano de melhoria.",
    evidencias=[
     ("Instrumento aplicado e ficha técnica da aplicação.",
      "Indicar data, taxa de resposta e garantia de anonimato.", ""),
     ("Relatório de resultados com os itens de maior lacuna e o plano derivado.",
      "Deve mostrar medidas com responsável e prazo.", ""),
    ]),
   dict(num=37, puntos=10,
    enunciado="A instituição acompanha a adaptação do residente que ingressa e o processo de quem se retira durante o ano letivo.",
    evidencias=[
     ("Programa de acolhimento e acompanhamento dos primeiros sessenta dias.",
      "Deve indicar responsável, atividades e acompanhamento individual.", ""),
     ("Registro das saídas ocorridas no período, com o seu motivo e o contato com a família.",
      "Anonimizado, com a análise institucional das causas.", ""),
    ]),
  ]),
 dict(
  corto="RECREAÇÃO, CULTURA E FAMÍLIA",
  n=5, color=5, puntos=100,
  nombre="RECREAÇÃO, CULTURA E VÍNCULO COM A FAMÍLIA",
  descripcion="""O que o internato faz com o tempo livre e com a saudade. Esta dimensão avalia o
esporte e a atividade física, a música, a arte e a cultura, o contato com a
natureza e o uso do fim de semana; e avalia, sobretudo, a aliança com a família,
que na educação básica não é um complemento, mas uma condição de funcionamento.

O trabalho e o contato com a criação não são enchimento: «nenhum homem nem
mulher se degrada pelo trabalho honrado; o que degrada é a ociosidade e a
egoísta dependência» (*Educação*, 2008, p. 215), e «Deus cercou as crianças e os
jovens com Sua maravilhosa criação a fim de despertar seu interesse e
revelar-lhes o seu Criador» (*Educação*, 2008, p. 100). Um campus com horta,
árvores e espaço para correr forma de um modo que nenhuma palestra substitui.

E observa a família: o acordo formativo escrito entre instituição, família e
estudante; a comunicação regular e não apenas a ligação quando há um problema; o
programa de acolhimento e formação de pais; e o regime de visitas e de retorno a
casa. «Pais e professores devem trabalhar em harmonia para o bem dos filhos»
(*Conselhos aos Pais, Professores e Estudantes*, 2007, p. 87). Um internato que
se comunica com a família só para cobrar ou para informar uma falta já rompeu o
acordo que o sustenta.""",
  orientacion="**Orientação ao avaliador.** Pergunte a um residente quando falou pela "
              "última vez com a sua família e como. Peça o registro de comunicações do "
              "último trimestre e comprove quantas foram por um motivo que não era "
              "disciplinar. Percorra as instalações esportivas e os espaços de arte em "
              "horário de uso, não vazios.",
  meta=[(38, "«Tenho tempo e lugar para praticar esporte e me movimentar.» (ref. ILE item 12)"),
        (41, "«Aproveito bem o tempo livre e os fins de semana.» (ref. ILE item 14)"),
        (43, "«A minha família sabe como estou e a instituição se comunica com ela.» (ref. IVC item 6)")],
  criterios=[
   dict(num=38, puntos=15,
    enunciado="A instituição oferece prática esportiva e atividade física regular, com orientação profissional e espaços adequados.",
    evidencias=[
     ("Programa esportivo do período com responsável habilitado e carga horária.",
      "Indicar as modalidades oferecidas e a proporção de residentes que participa.", ""),
     ("Inventário e estado das instalações e do material esportivo.",
      "Com registro fotográfico datado do período em curso.", ""),
    ]),
   dict(num=39, puntos=15,
    enunciado="A instituição oferece formação e prática em música, arte e cultura, com participação efetiva dos residentes.",
    evidencias=[
     ("Programa de música, arte e cultura do período, com responsáveis.",
      "Indicar grupos existentes, ensaios e apresentações realizadas.", ""),
     ("Registro de participação dos residentes e das apresentações do período.",
      "Com a proporção de residentes alcançada.", ""),
    ]),
   dict(num=40, puntos=15,
    enunciado="O campus oferece contato regular com a natureza e atividades de trabalho formativo adequadas à idade.",
    evidencias=[
     ("Descrição das áreas verdes, hortas ou espaços naturais em uso formativo.",
      "Com registro fotográfico datado e o seu regime de acesso.", ""),
     ("Plano de atividades de trabalho formativo por faixa etária, com medidas de segurança.",
      "Deve distinguir trabalho formativo de tarefa de manutenção e respeitar a legislação trabalhista de menores.", ""),
    ]),
   dict(num=41, puntos=15,
    enunciado="O fim de semana e o tempo livre têm programação intencional, com alternativas e descanso real.",
    evidencias=[
     ("Programação dos fins de semana do último trimestre.",
      "Deve mostrar alternativas e não uma única atividade obrigatória.", ""),
     ("Registro de participação e da avaliação feita pelos residentes.",
      "Instrumento aplicado e ajustes derivados.", ""),
    ]),
   dict(num=42, puntos=10,
    enunciado="Existe um acordo formativo escrito entre a instituição, a família e o residente, assinado no início do vínculo.",
    evidencias=[
     ("Modelo do acordo formativo tripartite, com os compromissos de cada parte.",
      "Deve explicitar o que a instituição assume, o que a família conserva e o que se espera do residente.", ""),
     ("Amostra de acordos assinados na matrícula do período em curso.",
      "Anonimizada, com a proporção de famílias que o assinou.", ""),
    ]),
   dict(num=43, puntos=10,
    enunciado="A instituição mantém comunicação regular com a família sobre a vida do residente, e não apenas diante de incidentes.",
    evidencias=[
     ("Plano de comunicação com as famílias, com canais e periodicidade.",
      "Deve prever informes de rotina e não unicamente avisos disciplinares ou de cobrança.", ""),
     ("Registro das comunicações do último trimestre.",
      "Indicar quantas foram de rotina e quantas por incidente.", ""),
    ]),
   dict(num=44, puntos=10,
    enunciado="A instituição executa um programa de acolhimento e formação de pais de residentes.",
    evidencias=[
     ("Programa de acolhimento e formação de famílias do período, com temas e responsáveis.",
      "Indicar modalidade, frequência e cobertura alcançada.", ""),
     ("Registro dos encontros realizados e da participação das famílias.",
      "Listas ou registros de acesso, com a proporção de famílias alcançada.", ""),
    ]),
   dict(num=45, puntos=10,
    enunciado="O regime de visitas e de retorno a casa está definido por escrito e é cumprido com registro.",
    evidencias=[
     ("Regime de visitas e de saídas para casa, aprovado e comunicado às famílias.",
      "Deve indicar frequência, autorizações exigidas e responsáveis pelo acompanhamento.", ""),
     ("Registro de visitas e de retornos do último trimestre.",
      "Com identificação do visitante e o seu vínculo com o residente.", ""),
    ]),
  ]),
]
