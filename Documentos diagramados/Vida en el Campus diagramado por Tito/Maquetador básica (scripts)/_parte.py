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
