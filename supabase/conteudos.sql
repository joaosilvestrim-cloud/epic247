-- EPIC247 — Calendario de Conteudo (gerado da planilha). Rode no SQL Editor.
-- Recria a tabela com TODAS as colunas e reimporta os conteudos.
drop table if exists public.conteudos cascade;
create table public.conteudos (
  id uuid primary key default gen_random_uuid(),
  semana text,
  data date, dia text, horario text, tipo text, formato text,
  nomenclatura text, nome text not null, story_num text,
  status text not null default 'a_produzir',
  link text, legenda text, hashtags text, notas text,
  anexos jsonb not null default '[]',
  ordem int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conteudos_data_idx on public.conteudos (data);
create index if not exists conteudos_status_idx on public.conteudos (status);
alter table public.conteudos enable row level security;

insert into public.conteudos (ordem, semana, data, dia, horario, tipo, formato, nomenclatura, nome, story_num, status, link, legenda, hashtags, notas) values
(1, NULL, '2026-07-06', 'Seg', '08:00', 'Carrossel', NULL, 'C00', 'C00 · Quem é Ju · Apresentação', NULL, 'entregue', NULL, 'Bom te encontrar aqui.

Eu sou a Ju. Engenheira de formação, mestre em Administração. Há mais de 15 anos atendo pessoas inteligentes que sabem o que precisam fazer e mesmo assim não fazem.

Dessa observação clínica nasceu o Protocolo EPIC247: um sistema sequencial de transformação pessoal aplicada. Não é mais um método de produtividade. É infraestrutura comportamental construída a partir de ciência, prática e padrão real.

Nas próximas 8 semanas vou compartilhar aqui o que aprendi nesses 15 anos. Sem hype. Sem fórmula mágica. Com método.

Se você é o tipo de pessoa que coleciona conhecimento e não consegue aplicar, esse perfil é pra você.

Fica.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(2, NULL, '2026-07-08', 'Qua', '08:00', 'Carrossel', NULL, 'C01', 'C01 · 7 sinais de Trava Mental Racional', NULL, 'entregue', NULL, '7 sinais de que você tem Trava Mental Racional.

Não é diagnóstico clínico. É um padrão de comportamento que afeta pessoas inteligentes que sabem o que fazer e mesmo assim não fazem.

Se você se reconheceu em mais de 4, você não é a exceção. É a maioria. E isso pode mudar.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(3, NULL, '2026-08-10', 'Seg', '08:00', 'Carrossel', NULL, 'C01', 'C01 · 7 sinais Trava Mental (REPOST)', NULL, 'repost', NULL, 'Voltando aos 7 sinais.

Um mês depois, com olhar novo. Qual você não tinha visto na primeira leitura?', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(4, NULL, '2026-07-10', 'Sex', '19:00', 'Carrossel', NULL, 'C02', 'C02 · Dia na vida de Realizador Travado', NULL, 'entregue', NULL, 'Como é um dia na vida de um Realizador Travado.

Ele acorda com 47 ideias na cabeça. Vai pro trabalho, executa 12% delas. Volta pra casa exausto. Reúne forças. Lê mais um livro de produtividade.

No outro dia, repete.

Se você se reconheceu, salva esse post. E manda pra alguém.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(5, NULL, '2026-07-13', 'Seg', '08:00', 'Carrossel', NULL, 'C03', 'C03 · O ciclo que mantém você exausto', NULL, 'entregue', NULL, 'Existe um ciclo silencioso por trás da sua exaustão.

Ele não te grita. Não dá nome a si mesmo. Ele só consome sua energia, dia após dia, até que o tanque vazio vire estado normal.

Quando você entende o ciclo, você quebra ele. Quando não entende, vira parte dele.

Vamos lá.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(6, NULL, '2026-08-05', 'Qua', '08:00', 'Carrossel', NULL, 'C04', 'C04 · Os 5 Drenos (REPOST)', NULL, 'repost', NULL, 'Voltando aos 5 drenos.

Muita gente nova chegou aqui essa semana. Se você é uma delas, esse é o ponto de partida.

Qual é o seu dominante?', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(7, NULL, '2026-07-06', 'Seg', '12:30', 'Carrossel', NULL, 'C04', 'C04 · Os 5 Drenos de Energia', NULL, 'entregue', NULL, 'Qual dos 5 drenos está sugando sua energia agora?

A maioria das pessoas trata cansaço como um problema único: "estou exausto". Mas o cansaço tem 5 origens distintas, e cada uma exige uma intervenção diferente.

Nesse carrossel você vai entender quais são os 5 drenos e qual é o seu dominante. Em 90 segundos.

Faça o diagnóstico no link da bio.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(8, NULL, '2026-07-15', 'Qua', '08:00', 'Carrossel', NULL, 'C05', 'C05 · O que Robert Sapolsky descobriu sobre estresse', NULL, 'entregue', NULL, 'O que Robert Sapolsky descobriu sobre o estresse — e por que isso muda tudo.

Depois de 30 anos estudando babuínos no Quênia, ele identificou um padrão que se aplica a executivos brasileiros.

A ciência por trás do cansaço crônico.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(9, NULL, '2026-08-24', 'Seg', '08:00', 'Carrossel', NULL, 'C06', 'C06 · Simone Biles (REPOST)', NULL, 'repost', NULL, 'Quase 2 meses depois. Voltando à história da Simone Biles.

É a metáfora mais precisa que conheço pra explicar o que acontece com você.

Ela parou em Tóquio. Você está parando há anos, em silêncio.

Lê com calma. E me diz se ressoou.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(10, NULL, '2026-07-17', 'Sex', '19:00', 'Carrossel', NULL, 'C06', 'C06 · Simone Biles parou na maior Olimpíada da história', NULL, 'entregue', NULL, 'Quando Simone Biles parou nos Jogos de Tóquio, o mundo chamou de fraqueza.

A ciência chamou de sabedoria.

O que aconteceu ali aconteceu também com você — só que em escala menor, em silêncio, e todo dia.

Vamos entender.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(11, NULL, '2026-07-21', 'Ter', '19:00', 'Carrossel', NULL, 'C07', 'C07 · 6 conselhos de coach que não funcionam', NULL, 'entregue', NULL, '6 conselhos de coach que NÃO funcionam pra Realizador Travado.

Não é polêmica. É observação clínica.

Certos conselhos funcionam pra um tipo de pessoa. E quando você aplica no tipo errado, você não muda — você se culpa.

Vamos separar.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(12, NULL, '2026-07-27', 'Seg', '08:00', 'Carrossel', NULL, 'C08', 'C08 · 4 princípios que mudam como você executa', NULL, 'entregue', NULL, '4 princípios que mudam como você executa.

Não são mantras. Não são frases motivacionais. São observações comportamentais que, quando aplicadas, reorganizam silenciosamente sua relação com ação.

Lê o carrossel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(13, NULL, '2026-07-29', 'Qua', '08:00', 'Carrossel', NULL, 'C09', 'C09 · A Viagem em 10 etapas', NULL, 'entregue', NULL, 'A Viagem em 10 etapas. O mapa completo do método EPIC247.

Não é guia pra autoajuda. É infraestrutura aplicada à transformação humana — testada em mais de 1500 pessoas nos últimos 15 anos.

Entende como funciona.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(14, NULL, '2026-08-17', 'Seg', '08:00', 'Carrossel', NULL, 'C09', 'C09 · A Viagem em 10 etapas (REPOST)', NULL, 'repost', NULL, 'Voltando ao mapa do método EPIC247.

Muita gente perguntou esse mês: como funciona o método? Aqui está o mapa completo das 10 etapas.

Qual etapa você está agora?', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(15, NULL, '2026-07-23', 'Qui', '12:30', 'Carrossel', NULL, 'C10', 'C10 · O que você acha que é preguiça e é biologia', NULL, 'entregue', NULL, 'Aquilo que você chama de preguiça, em 70% dos casos é biologia.

Não é desculpa. É mecanismo.

E quando você entende qual mecanismo está em jogo, você para de brigar com si mesmo e começa a trabalhar com seu corpo.

Lê o carrossel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(16, NULL, '2026-08-03', 'Seg', '08:00', 'Carrossel', NULL, 'NC01', 'FAQ do Realizador Travado', NULL, 'entregue', NULL, '"As 7 perguntas que toda pessoa inteligente trava em fazer pra si mesma.

Perguntas que parecem simples — e quando aceitas responder com honestidade, mudam tudo.

Lê o carrossel. Comenta a que mais te atingiu."


Salva esse post pra quando você for se cobrar de novo. Comenta qual pergunta é a mais sua.', NULL, NULL),
(17, NULL, '2026-08-05', 'Qua', '20:00', 'Carrossel', NULL, 'NC02', '5 mitos sobre energia', NULL, 'entregue', NULL, '"5 mitos sobre energia que ninguém para pra desmontar.

Mitos que parecem verdade porque foram repetidos tantas vezes.

Vamos desmontar."

Qual mito você ainda acreditava? Comenta o número. Salva pra revisitar.', NULL, NULL),
(18, NULL, '2026-08-10', 'Seg', '20:00', 'Carrossel', NULL, 'NC03', 'Primeiros depoimentos · Parte 1', NULL, 'a_produzir', NULL, '"30 dias depois. As primeiras pessoas que aplicaram o método estão começando a falar.

Vamos ouvir."

Esses são os primeiros relatos. Tem mais chegando. Comenta se quer continuar vendo.', NULL, NULL),
(19, NULL, '2026-08-17', 'Seg', '20:00', 'Carrossel', NULL, 'NC04', 'Os 4 estágios do Realizador Travado', NULL, 'entregue', NULL, '"Os 4 estágios do Realizador Travado.

Observação clínica de 15 anos: pessoas inteligentes que travam passam por estágios previsíveis antes de finalmente destravar.

Em qual estágio você está?"

Realizador Travado não é identidade fixa. É um estágio. Todo estágio tem saída.', NULL, NULL),
(20, NULL, '2026-08-21', 'Sex', '19:00', 'Carrossel', NULL, 'NC05', 'Depoimentos compilados · Parte 2', NULL, 'a_produzir', NULL, '"Mais histórias. Mais transformações.

Quem viu de perto começa a ver de longe também."

Comportamento muda quando identidade muda. Identidade muda quando aplica. Aplicar começa com diagnóstico.', NULL, NULL),
(21, NULL, '2026-08-24', 'Seg', '20:00', 'Carrossel', NULL, 'NC06', 'Como funciona o EPIC247 na prática', NULL, 'entregue', NULL, '"Como funciona o EPIC247 na prática.

Não é curso de vídeo. Não é método de produtividade. Não é PDF com 100 páginas.

É outra coisa. E essa diferença muda como você vai aplicar.

Lê o carrossel."

Esse é o método inteiro, sem floreio. Salva pra consultar quando estiver na dúvida.', NULL, NULL),
(22, NULL, '2026-08-29', 'Sáb', '11:00', 'Carrossel', NULL, 'NC07', 'Convite forte ao programa', NULL, 'entregue', NULL, '"Se você chegou até aqui, é porque algo tocou.

8 semanas. 50+ conteúdos. 3 lives. Centenas de mensagens.

E você ainda está aqui — porque sabe que precisa de algo mais profundo.

O programa abre próxima semana. Vagas limitadas. Detalhes no link da bio."

Esse é o fim de um ciclo. E começo de outro. Se sentiu que esse outro é pra você, link na bio. Te vejo do outro lado.', NULL, NULL),
(23, NULL, '2026-08-13', 'Qui', '20:00', 'LIVE', NULL, 'LIVE #1', 'LIVE #1 · Os 5 Drenos ao vivo (Ju)', NULL, 'a_produzir', NULL, 'Hoje, 20h. Live com a Ju.

Tema: Os 5 Drenos de Energia. Vamos passar por cada um, falar dos sintomas que você ignora, e responder perguntas ao vivo.

Duração: 60 minutos.

Me avisa nos comentários: qual dreno você quer entender melhor?', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(24, NULL, '2026-08-20', 'Qui', '20:00', 'LIVE', NULL, 'LIVE #2', 'LIVE #2 · Trava Mental Racional (Ju)', NULL, 'a_produzir', NULL, 'Hoje, 20h. Live com a Ju.

Tema: Trava Mental Racional. Vamos falar dos 7 sinais, os 4 estágios, e como começar a destravar — sem fórmulas mágicas.

Duração: 60 minutos.

Me manda agora nos comentários: qual é a sua maior trava hoje?', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(25, NULL, '2026-08-27', 'Qui', '20:00', 'LIVE', NULL, 'LIVE #3', 'LIVE #3 · Próximos passos (Ju)', NULL, 'a_produzir', NULL, 'Última live do ciclo. Hoje, 20h.

Tema: Próximos passos. Vamos consolidar o que aprendemos nessas 8 semanas e abrir o caminho pra quem quer ir mais fundo.

Duração: 75 minutos.

Última chance de tirar dúvidas com a Ju ao vivo.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(26, NULL, '2026-08-12', 'Qua', '08:00', 'Post de Texto', NULL, 'FA04', 'FA04 · Você não precisa de mais inspiração.', NULL, 'entregue', NULL, 'Você não precisa de mais inspiração. Você precisa de mais infraestrutura.

Inspiração é o combustível. Mas combustível sem motor não anda.

A maioria das pessoas inteligentes tem uma biblioteca inteira de inspiração: livros, podcasts, palestras, episódios.

E continua não saindo do lugar.

Não é falta de inspiração. É falta de sistema.

Sistema que sustenta a ação no dia ruim. No dia que a inspiração não aparece. No dia que a motivação está em outro lugar.

Infraestrutura é o que faz o método funcionar quando a vontade falha.

E é exatamente isso que você não tem.

Não porque não merece. Porque ninguém te ensinou a construir.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(27, NULL, '2026-08-19', 'Qua', '08:00', 'Post de Texto', NULL, 'FA06', 'FA06 · Identidade antes de comportamento.', NULL, 'entregue', NULL, 'Você não vai conseguir manter um hábito que pertence a uma identidade que você não acredita ter.

Por isso a maioria das mudanças não pega.

Você tenta acordar cedo, mas se vê como uma pessoa que dorme tarde.
Você tenta correr, mas se vê como uma pessoa que não faz exercício.
Você tenta meditar, mas se vê como uma pessoa que tem cabeça muito agitada.

O comportamento tenta brigar com a identidade. E a identidade sempre vence.

A pergunta certa não é "o que eu deveria fazer?"

É "que tipo de pessoa eu estou me tornando?"

Depois que você responde isso com honestidade, as ações começam a alinhar.

Mas se você fica só na ação, sem rever a identidade, você fica preso no ciclo.

Identidade antes de comportamento.

Não como mantra. Como sequência prática.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(28, NULL, '2026-08-26', 'Qua', '08:00', 'Post de Texto', NULL, 'FA08', 'FA08 · Nunca vai ser a hora perfeita. A hora é essa.', NULL, 'entregue', NULL, 'Você está esperando a hora perfeita.

Quando o trabalho desacelerar. Quando os filhos crescerem. Quando você tiver mais energia. Quando ler mais um livro. Quando o ano novo chegar. Quando se sentir pronto.

A hora perfeita é uma mentira que se conta pra si mesmo.

Não pra te enganar — pra te proteger. Da exposição. Do esforço. Do desconforto. Da possibilidade de falhar.

Mas o preço dessa proteção é alto. É a sua vida que você não vive enquanto espera.

A hora perfeita não existe. Nunca existiu. Nem pra você, nem pra ninguém.

A hora que existe é essa. Imperfeita. Incerta. Real.

E ela é suficiente.

Não porque está tudo pronto. Mas porque esperar não vai te deixar mais pronto.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(29, NULL, '2026-08-08', 'Sáb', '11:00', 'Post de Texto', NULL, 'FA02', 'FA02 · Sem combustível, nada anda.', NULL, 'entregue', NULL, 'Segunda de manhã. Você acorda exausto.

Não dormiu mal. Dormiu mal por dentro. O corpo deitou. A cabeça não.

Você vai pra cozinha, faz o café, abre o notebook. Tenta começar a planilha que prometeu entregar hoje.

As palavras embaralham. O texto não flui. Você relê três vezes o mesmo parágrafo e continua sem entender.

Não é falta de inteligência. É falta de combustível.

O cérebro consome 20% da energia do corpo. Quando o corpo está em débito, o cérebro vira o primeiro a entregar os pontos.

A gente foi ensinado a tratar o cansaço como obstáculo a vencer. Como se fosse uma fraqueza de caráter a ser superada com café e força de vontade.

Não é.

É um sinal biológico de que o tanque está vazio.

E com tanque vazio, nada anda. Nenhuma decisão difícil. Nenhuma execução consistente. Nenhuma mudança de vida.

Não é metáfora. É biologia.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(30, NULL, '2026-08-07', 'Sex', '19:00', 'Post de Texto', NULL, 'FA01', 'FA01 · Você está na garagem. A chave está na sua mão.', NULL, 'entregue', NULL, 'Quarta-feira, 23h47.

Você abre o documento pela quinta vez naquele mês. Não pra editar. Pra ver se ainda está lá.

Está.

Você sabe exatamente o que precisa fazer. Tem o método. Tem o tempo. Tem as referências sublinhadas.

O que não tem é a ação.

A diferença entre quem chega e quem espera não está no que sabe. Está no segundo entre saber e fazer.

Esse segundo se chama coragem. E é desconfortável de propósito.

A maioria das pessoas inteligentes passa anos nesse segundo. Acumulando cursos. Refinando o plano. Esperando "mais um pouquinho" de clareza.

O carro está parado. O endereço está no GPS. A mala está no porta-malas.

A chave está na sua mão.

Não no método. Não na próxima leitura. Não na hora perfeita.

Na sua mão. Agora.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(31, NULL, '2026-08-11', 'Ter', '19:00', 'Post de Texto', NULL, 'FA03', 'FA03 · Você não está cansado porque é fraco.', NULL, 'entregue', NULL, 'Você não está cansado porque é fraco.

Essa frase precisa entrar antes de qualquer conversa sobre disciplina, mentalidade ou rotina.

Porque enquanto você acredita que o problema é seu caráter, você não vai investigar a causa real.

E a causa real, na maioria das vezes, não tem nada a ver com fraqueza.

Tem a ver com:

— Um sistema nervoso em alerta constante
— Sono de má qualidade há semanas, talvez meses
— Alimentação que mantém glicemia em montanha-russa
— Movimento ausente do dia
— Conexão social esvaziada

Nada disso é fraqueza. Tudo isso é fisiologia.

E fisiologia se trata. Mas só se trata depois que você para de tratar como falha de caráter.

A culpa não vai te fazer mudar. A culpa vai te fazer adiar.

E você já adiou demais.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(32, NULL, '2026-08-18', 'Ter', '19:00', 'Post de Texto', NULL, 'FA05', 'FA05 · Mínimo viável vence ideal abandonado.', NULL, 'entregue', NULL, 'Sexta-feira, 17h22. Você decide que segunda vai começar uma nova rotina.

5h da manhã. Meditação. Exercício. Café da manhã saudável. Bullet journal. 30 min de leitura. Banho frio.

No papel, ficou lindo.

Na segunda às 5h, você ouve o despertador e... volta a dormir.

Isso não é fracasso. É previsível.

O ideal abandonado é uma das marcas registradas do Realizador Travado: planos lindos no papel que duram 3 dias na prática.

A solução não é mais força de vontade. É menos ambição na rotina.

Mínimo viável vence ideal abandonado.

3 minutos de meditação feitos todos os dias valem mais do que 30 minutos feitos uma vez no mês.

A matemática não engana: consistência baixa supera intensidade isolada.

Mas pra fazer essa conta, você precisa engolir o ego.

E essa é a parte difícil.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(33, NULL, '2026-08-25', 'Ter', '19:00', 'Post de Texto', NULL, 'FA07', 'FA07 · Subtrair também é estratégia.', NULL, 'entregue', NULL, 'A gente foi ensinado a adicionar.

Mais método. Mais ferramenta. Mais hábito. Mais rotina. Mais leitura. Mais conhecimento.

Você tenta de tudo e o problema não resolve.

Às vezes não é o que falta. É o que sobra.

O email que você não responde mas que ocupa sua cabeça.
A conversa que você não termina mas que volta toda noite.
O compromisso que você assumiu por fraqueza e que agora te suga.
A decisão que você adiou mas que continua consumindo energia silenciosa.

Tudo isso ocupa espaço. E espaço ocupado não pode receber o novo.

Subtrair também é estratégia.

Às vezes não é mais ação que você precisa. É menos peso.

O que você precisa parar de carregar pra finalmente começar a andar?', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(34, NULL, '2026-08-28', 'Sex', '19:00', 'Post de Texto', NULL, 'FA09', 'FA09 · 98% dos brasileiros se dizem cansados.', NULL, 'entregue', NULL, '98% dos brasileiros se dizem cansados.

Isso não é coincidência. Não é fraqueza de geração. Não é falta de café.

É consequência objetiva de um modelo de vida que ninguém te ensinou a sustentar.

A gente herdou rotinas dos nossos pais. Eles trabalhavam 8h e voltavam pra casa pra descansar. Os smartphones não existiam. A pressão de produtividade não era 24/7.

Nós herdamos as rotinas, mas não o contexto.

E quando você aplica uma rotina velha num contexto novo, ela quebra. E você se culpa.

Você não está cansado porque é fraco.
Não está esgotado porque falta disciplina.
Não está travado porque não quer o suficiente.

Você está cansado porque o mundo virou objetivamente pesado demais — e ninguém te ensinou a aliviar.

A primeira coisa que precisa mudar é parar de levar isso pessoalmente.

A segunda é começar a tratar.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(35, NULL, '2026-07-07', 'Ter', '19:00', 'Reels', 'Reel com Ju', 'F09', 'F09 · Você sabe muito, planeja bem', NULL, 'a_produzir', NULL, 'Você sabe muito. Planeja bem. E mesmo assim não sai do lugar.

A conta não fecha. Você não é preguiçoso. Não é desorganizado. Tem repertório, tem método, tem intenção.

O problema é outro. E não é mental.

Veja o reel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 09 · REEL · "VOCÊ SABE MUITO, PLANEJA BEM"
Tempo: 30 a 45s
Tom: Plano fechado. Pausa no "uma semana. Talvez duas." Olhar firme.

HOOK (decore exato)
"Se você sabe muito, planeja bem e mesmo assim não sai do lugar, esse vídeo é pra você."

BULLETS (fluido)
Você lê livros, faz cursos, compra planners
Tenta rotinas matinais, baixa apps de hábito
Funciona por uma semana. Talvez duas. E desmorona.
Você não desmorona porque é fraco. Não desmorona porque falta disciplina.
Desmorona porque está tentando construir uma vida diferente em cima de uma fundação sem energia.
FECHO (decore exato)
"Mais inspiração não resolve falta de combustível."

CTA (decore exato)
"Comenta INFRA que eu te mando o diagnóstico que mostra qual é o seu Dreno principal."

NOTA DE ATUAÇÃO
Não sorrir. Tom firme do início ao fim. Olhar fixo. Sem música de fundo.'),
(36, NULL, '2026-07-14', 'Ter', '19:00', 'Reels', 'Reel com Ju', 'F10', 'F10 · Por que você acorda cansado mesmo dormindo 8h', NULL, 'a_produzir', NULL, 'Por que você acorda cansado mesmo dormindo 8 horas.

A conta não é sobre quantas horas. É sobre o que acontece nelas.

Sono sem qualidade é descanso sem restauração.

Veja o reel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 10 · REEL · "POR QUE VOCÊ ACORDA CANSADO MESMO DORMINDO 8H"
Tempo: 45 a 60s
Tom: Educacional. Pausa após cada frase científica.

HOOK (decore exato)
"Por que você acorda cansado mesmo dormindo 8 horas. Em 60 segundos."

BULLETS (fluido)
Existe uma diferença entre dormir e descansar
Sono não é descanso. É manutenção.
Enquanto você dorme, o cérebro ativa o sistema glinfático. Ele limpa resíduos metabólicos do dia.
O corpo libera hormônios que reparam tecidos. O sistema imunológico consolida defesas. O cérebro consolida memórias.
Tudo isso só acontece dormindo. Nada disso em vigília.
Sono ruim não é descanso incompleto. É manutenção adiada.
FECHO (decore exato)
"E manutenção adiada cobra a fatura. Sempre."

CTA (decore exato)
"Salva esse vídeo. Quando for dormir hoje, lembra: você não está descansando, está fazendo manutenção."

NOTA DE ATUAÇÃO
Tom de professora. Mais devagar que outros Reels. Densidade alta.'),
(37, NULL, '2026-07-16', 'Qui', '12:30', 'Reels', 'Reel com Ju', 'F11', 'F11 · 98% dos brasileiros se dizem cansados', NULL, 'a_produzir', NULL, '98% dos brasileiros se dizem cansados. Não é coincidência.

Isso não é fraqueza de geração. É consequência objetiva de um modelo de vida que ninguém ensinou a sustentar.

Veja o reel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 11 · REEL · "98% DOS BRASILEIROS SE DIZEM CANSADOS"
Tempo: 30 a 45s
Tom: Autoridade. Voz firme. Dado em destaque na pós (98% animado).

HOOK (decore exato)
"98% dos brasileiros se dizem cansados. Isso não é coincidência."

BULLETS (fluido)
Em 2019, a Organização Mundial da Saúde incluiu o burnout na Classificação Internacional de Doenças
Não como metáfora. Como diagnóstico real, com código.
Pesquisa do Ibope: 98% dos brasileiros se dizem cansados. Noventa e oito por cento.
Não é coincidência. É o resultado de um estilo de vida que extrai mais do sistema do que repõe.
Você não está cansado porque é fraco.
FECHO (decore exato)
"Está cansado porque o mundo ficou objetivamente pesado demais. E a ciência concorda."

CTA (decore exato)
"Comenta os números que mais te chamaram atenção."

NOTA DE ATUAÇÃO
Pausa em cada número. Voz firme, sem dramatização. Olhar fixo.'),
(38, NULL, '2026-07-09', 'Qui', '12:30', 'Reels', 'Reel com Ju', 'F12', 'F12 · Há 15 anos eu atendo pessoas com a mesma queixa', NULL, 'a_produzir', NULL, 'Há 15 anos eu atendo pessoas com a mesma queixa.

Diferentes idades. Diferentes profissões. Diferentes histórias.

Mas a queixa, na essência, é sempre a mesma.

Vou te contar.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 12 · REEL · "HÁ 15 ANOS EU ATENDO PESSOAS COM A MESMA QUEIXA"
Tempo: 30 a 45s
Tom: Íntimo, professoral. Mais devagar. Bom para construir confiança.

HOOK (decore exato)
"Há 15 anos eu atendo pessoas com a mesma queixa. E levei tempo pra entender o padrão."

BULLETS (fluido)
Por anos eu vi pessoas brilhantes, com cursos feitos, livros lidos, planos bonitos
E nada saía do lugar
Eu tratava como questão mental: mentalidade, crenças, padrões. Resultado parcial, inconsistente.
Até perceber o que tinha ficado invisível
O que parecia problema mental era sintoma de uma fundação biológica que não tinha sido construída
Foi nesse ponto que nasceu o Protocolo EPIC247
Dez módulos sequenciais. Na ordem em que o organismo humano realmente precisa.
FECHO (decore exato)
"Pra que a mudança seja sustentável."

CTA (decore exato)
"Quer saber qual é o seu ponto de partida? Diagnóstico no link da bio."

NOTA DE ATUAÇÃO
Tom de revelação. Pausa antes de "Até perceber o que tinha ficado invisível". Vulnerabilidade leve em "levei tempo".'),
(39, NULL, '2026-07-18', 'Sáb', '11:00', 'Reels', 'Reel com Ju', 'F13', 'F13 · Era 23h15 quando Cris abriu o Google Doc', NULL, 'a_produzir', NULL, 'Era 23h15 quando Cris abriu o Google Doc.

O documento dele tinha 47 páginas de planejamento. 5 anos de notas. Toda a estratégia que faltava pra mudar de vida.

E Cris fechou sem mudar uma palavra. De novo.

Veja o que ele descobriu depois.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 13 · REEL · "ERA 23H15 QUANDO CRIS ABRIU O GOOGLE DOC"
Tempo: 45 a 60s
Tom: Contar como conversa. Voz mais baixa, mais íntima.

HOOK (decore exato)
"Era 23h15 quando Cris abriu o Google Doc pela quarta vez naquele mês."

BULLETS (fluido)
Cris tem 38 anos. Carreira invejável. Um projeto de negócio guardado num Google Doc.
Última edição: março do ano passado.
Não abriu pra trabalhar. Abriu pra ver se ainda estava lá.
Estava.
"Amanhã eu começo de verdade." Pra si mesmo. Como da última vez.
Cris não era preguiçoso. Era excepcionalmente capaz de entender o problema e igualmente capaz de não fazer nada com esse entendimento.
FECHO (decore exato)
"Cris achava que o problema era energia. Estava certo sobre o sintoma. E completamente errado sobre a causa."

CTA (decore exato)
"Comenta CRIS se você se reconhece. Eu mando a continuação da história."

NOTA DE ATUAÇÃO
Voz quase sussurrada em "Estava." Pausa de 1 segundo. Storytelling clássico. Vai ser o Reel mais salvo da conta se executado bem.'),
(40, NULL, '2026-07-22', 'Qua', '08:00', 'Reels', 'Reel com Ju', 'F14', 'F14 · Eu não vou te dizer pra acordar 5 da manhã', NULL, 'a_produzir', NULL, 'Eu não vou te dizer pra acordar 5 da manhã.

Se esse fosse o problema, você já teria resolvido — já comprou despertador, já tentou, já desistiu.

O problema é outro.

Veja o reel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 14 · REEL · "EU NÃO VOU TE DIZER PRA ACORDAR 5 DA MANHÃ"
Tempo: 30s
Tom: Provocação. Posicionamento. Sem rancor, com firmeza.

HOOK (decore exato)
"Eu não vou te dizer pra acordar 5 da manhã."

BULLETS (fluido)
Não vou te dizer pra tomar banho gelado
Não vou te dizer pra meditar 20 minutos por dia
Não vou te dizer pra fazer journaling com gratidão
Vou te dizer uma coisa: nada disso resolve falta de combustível
E você está sem combustível
FECHO (decore exato)
"Antes de qualquer ritual da moda, o corpo precisa estar online."

CTA (decore exato)
"Comenta CORPO e eu te mando o diagnóstico que mostra onde começar."

NOTA DE ATUAÇÃO
Provocação sem agressividade. Tom de "eu não vou te enrolar, vou te falar a verdade".'),
(41, NULL, '2026-07-31', 'Sex', '19:00', 'Reels', 'Reel com Ju', 'F15', 'F15 · Toda viagem começa no posto de gasolina', NULL, 'a_produzir', NULL, 'Toda viagem começa no posto de gasolina.

Sem combustível, nada anda — não é metáfora. É biologia.

Veja o reel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 15 · REEL · "TODA VIAGEM COMEÇA NO POSTO DE GASOLINA"
Tempo: 45s
Tom: Didático, professoral, sem pressa. Reel evergreen.

HOOK (decore exato)
"Toda viagem começa no posto de gasolina."

BULLETS (fluido)
Não no GPS. Não na mala. Não no roteiro.
No combustível.
Você pode ter o destino mais bonito do mundo traçado. A mala mais bem organizada. O carro mais confortável.
Mas sem combustível, você não sai do lugar.
Pior: você acha que vai. Liga o carro, ele pega. Dá dois quarteirões. E para.
É isso que acontece quando você tenta transformar sua vida sem primeiro cuidar da energia.
Conhecimento sem energia é peso. Plano sem energia é frustração. Intenção sem energia vira culpa acumulada.
FECHO (decore exato)
"Por isso o método começa por energia. Não por mentalidade. Não por planejamento. Por combustível."

CTA (decore exato)
"Comenta COMBUSTÍVEL e eu te mando o ponto exato de onde começar."

NOTA DE ATUAÇÃO
Tom calmo. Sem pressa. Sentir cada metáfora. Pausa entre "Conhecimento sem energia é peso" e a próxima frase.'),
(42, NULL, '2026-07-20', 'Seg', '08:00', 'Reels', 'Reel com Ju', 'F16', 'F16 · Você não está cansado porque é fraco', NULL, 'a_produzir', NULL, 'Você não está cansado porque é fraco.

Essa frase precisa entrar antes de qualquer conversa sobre disciplina, mentalidade ou rotina.

Porque enquanto você acredita que o problema é seu caráter, você não vai investigar a causa real.

Veja o reel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 16 · REEL · "VOCÊ NÃO ESTÁ CANSADO PORQUE É FRACO"
Tempo: 30 a 40s
Tom: Alívio + autoridade. Tom de quem traz a verdade científica.

HOOK (decore exato)
"Você não está cansado porque é fraco."

BULLETS (fluido)
Não está esgotado porque falta disciplina
Não está travado porque não quer o suficiente
Você é humano vivendo numa era redesenhada para drenar energia de forma sistemática
A OMS reconhece. Sapolsky, neurocientista de Stanford, mostrou. Os dados do INSS confirmam.
O sistema nervoso humano foi feito pra ameaça aguda. Não crônica.
E o leão moderno nunca vai embora.
FECHO (decore exato)
"O corpo não distingue. Responde igual. Drena igual."

CTA (decore exato)
"Salva esse vídeo. Manda pra alguém que precisa ouvir isso."

NOTA DE ATUAÇÃO
Tom de alívio no hook (como quem traz boa notícia). Depois firmeza nos dados. Olhar firme.'),
(43, NULL, '2026-07-24', 'Sex', '19:00', 'Reels', 'Reel com Ju', 'F17', 'F17 · Mais um curso não vai resolver', NULL, 'a_produzir', NULL, 'Mais um curso não vai resolver. Mais um livro não vai resolver. Mais um app de produtividade não vai resolver.

Nada disso vai resolver porque o problema não está no que falta saber.

Veja o reel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 17 · REEL · "MAIS UM CURSO NÃO VAI RESOLVER"
Tempo: 30 a 40s
Tom: Provocação. Filtro de audiência. Posicionamento.

HOOK (decore exato)
"Mais um curso não vai resolver o seu problema."

BULLETS (fluido)
Mais um livro também não
Mais um app de hábito também não
Mais uma rotina matinal copiada do influencer americano também não
Não porque o conteúdo é ruim
Porque você está tentando construir em cima de uma fundação sem energia
E construção em cima de fundação ruim sempre desmorona
A diferença é só quando
FECHO (decore exato)
"Resolva a fundação. O resto fica fácil."

CTA (decore exato)
"Comenta FUNDAÇÃO e eu te mostro o primeiro passo."

NOTA DE ATUAÇÃO
Provocação calma. Quase resignação. "Eu já vi essa cena muitas vezes". Sem julgamento.'),
(44, NULL, '2026-07-28', 'Ter', '19:00', 'Reels', 'Reel com Ju', 'F18', 'F18 · Identidade antes de comportamento', NULL, 'a_produzir', NULL, 'Identidade antes de comportamento.

Você não vai conseguir manter um hábito que pertence a uma identidade que você não acredita ter.

Veja o reel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 18 · REEL · "IDENTIDADE ANTES DE COMPORTAMENTO"
Tempo: 40s
Tom: Professoral. Ensina um princípio que parece simples mas é poderoso.

HOOK (decore exato)
"Existe uma diferença entre quem tenta dormir melhor e quem cuida do próprio sono."

BULLETS (fluido)
Parece a mesma coisa. Não é.
Quem tenta dormir melhor faz uma rotina por 2 semanas e abandona
Quem cuida do próprio sono construiu uma identidade
Identidade não desmorona em 14 dias
No método EPIC, isso é o terceiro princípio: identidade antes de comportamento
Você muda quem você acredita ser. Os comportamentos seguem naturalmente.
FECHO (decore exato)
"Regras externas são frágeis. Identidade é robusta."

CTA (decore exato)
"Comenta IDENTIDADE e eu te mando o exercício prático."

NOTA DE ATUAÇÃO
Tom de revelação suave. Pausa após "Parece a mesma coisa. Não é."'),
(45, NULL, '2026-07-30', 'Qui', '12:30', 'Reels', 'Reel com Ju', 'F19', 'F19 · Mínimo viável vence ideal abandonado', NULL, 'a_produzir', NULL, 'Mínimo viável vence ideal abandonado.

Uma das coisas mais difíceis de aceitar pra Realizador Travado: o feito é melhor que o perfeito.

Veja o reel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 19 · REEL · "MÍNIMO VIÁVEL VENCE IDEAL ABANDONADO"
Tempo: 30s
Tom: Direto, provocativo, princípio prático.

HOOK (decore exato)
"Uma rotina de 3 minutos executada todo dia bate uma rotina de 1 hora executada uma vez por semana."

BULLETS (fluido)
Sempre.
Não porque 3 minutos seja suficiente para transformar a vida
Mas porque consistência é o ativo real
E consistência só existe quando o padrão é sustentável
O ideal abandonado é o inimigo do mínimo viável aplicado.
FECHO (decore exato)
"Mínimo viável vence ideal abandonado. Sempre."

CTA (decore exato)
"Salva esse vídeo. Lê de novo na próxima vez que você for planejar a ''rotina perfeita''."

NOTA DE ATUAÇÃO
"Sempre" pausado, com força. Tom de princípio cravado.'),
(46, NULL, '2026-08-01', 'Sáb', '11:00', 'Reels', 'Reel com Ju', 'F20', 'F20 · Você está na garagem', NULL, 'a_produzir', NULL, 'Você está na garagem. A chave está na sua mão.

O que você está esperando?

Veja o reel.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', 'FOLHA 20 · REEL · "VOCÊ ESTÁ NA GARAGEM"
Tempo: 30s
Tom: Metafórico. Pode ter B-roll de carro na pós. Tom contemplativo.

HOOK (decore exato)
"Você está na garagem."

BULLETS (fluido)
O carro está parado. A mala está no porta-malas. O endereço está no GPS.
Você sabe pra onde vai. Tem o que precisa.
E ainda assim há uma pausa.
Um segundo de silêncio entre a intenção e o movimento.
Nesse segundo mora tudo: a expectativa, o medo, a dúvida, a esperança.
A consciência de que uma vez que você girar a chave, alguma coisa vai mudar.
FECHO (decore exato)
"Nunca vai ser a hora perfeita. A hora é essa. Imperfeita, incerta, real."

CTA (decore exato)
"Gire a chave. Diagnóstico no link da bio."

NOTA DE ATUAÇÃO
Tom mais lento. Como se Ju estivesse contemplando junto com o espectador. Voz quase em prece no fecho.'),
(47, NULL, '2026-08-15', 'Sáb', '11:00', 'Reels', 'Reel com Ju - Live', 'Reel', 'Reel · Recorte da Live #1', NULL, 'a_produzir', NULL, 'Recorte da live de quinta. O momento que mais ressoou foi esse:

[trecho da live]

A live inteira está no IGTV (ou no link da bio).', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(48, NULL, '2026-08-14', 'Sex', '19:00', 'Reels', 'Reel com Ju', 'Reel', 'Reel · Resposta a comentário comum', NULL, 'a_produzir', NULL, 'Recebi essa pergunta umas 47 vezes essa semana:

"Ju, e se eu já tentei tudo e nada funciona?"

Resposta:', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(49, NULL, '2026-08-22', 'Sáb', '11:00', 'Reels', 'Reel com Ju - Live', 'Reel', 'Reel · Recorte da Live #2', NULL, 'a_produzir', NULL, 'Recorte da live de quinta. O insight que mais salvaram foi esse:

[trecho da live]

A live inteira está no IGTV.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(50, NULL, '2026-07-11', 'Sáb', '11:00', 'Reels', 'Reel sem rosto', 'S01', 'S01 · Você é a pessoa que...', NULL, 'validar', NULL, 'Você é a pessoa que sabe tudo sobre produtividade e não consegue terminar o que começou.

O problema não é falta de método.

É falta de combustível.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(51, NULL, '2026-08-04', 'Ter', '19:00', 'Reels', 'Reel sem rosto', 'S02', 'S02 · A cafeína das 18h', NULL, 'validar', NULL, 'A cafeína das 18h não te mantém acordado por escolha. Ela te mantém acordado por reação química.

E essa diferença muda tudo.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(52, NULL, '2026-08-06', 'Qui', '12:30', 'Reels', 'Reel sem rosto', 'S03', 'S03 · Você está na garagem (narrado)', NULL, 'validar', NULL, 'Você está na garagem.

O carro está parado. A mala está no porta-malas. O endereço está no GPS.

O que você está esperando?', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(53, NULL, '2026-07-25', 'Sáb', '11:00', 'Reels', 'Reel sem rosto', 'S04', 'S04 · Coisas que não vão resolver seu cansaço', NULL, 'validar', NULL, 'Coisas que NÃO vão resolver seu cansaço:

— Café
— Acordar mais cedo
— Ler mais um livro
— Forçar disciplina

Veja o que vai.', '#EPIC247 #ProtocoloEPIC247 #RealizadorTravado #EngenhariaComportamental', NULL),
(54, NULL, '2026-07-06', 'Seg', '08:00', 'Stories', 'Vídeo Ju', 'S01 · Apresentação Ju', 'Oi. Eu sou a Ju. Bom te encontrar aqui.', '1 de 5', 'a_produzir', NULL, 'FOLHA S01 · DIA 1 · APRESENTAÇÃO
Quantidade de stories: 5 stories da Ju
Tom: Próximo, sem maquiagem pesada, ambiente real. Tom de quem está chegando e quer conversar.

STORY 1
Oi.
Eu sou a Ju.
[PAUSA]
Se você chegou aqui agora, deixa eu te contar o que esse perfil é.
E o que ele não é.
Em 5 stories.', NULL, 'DIA 1 — APRESENTAÇÃO
Objetivo: quem é a Ju, o que ela faz aqui, por que vale a pena seguir.

Story 1 · [JU GRAVA]
Ela em plano médio, sem maquiagem pesada, ambiente real (escritório ou sala).

"Oi. Eu sou a Ju. Se você chegou aqui agora, deixa eu te contar o que esse perfil é. E o que ele não é. Em 5 stories."'),
(55, NULL, '2026-07-06', 'Seg', '11:00', 'Stories', 'Vídeo Ju', 'S01 · Apresentação Ju', 'Engenheira. 15 anos de prática clínica. Criadora do EPIC247.', '2 de 5', 'a_produzir', NULL, 'STORY 2
Eu sou psicóloga há mais de 15 anos.
Passei a maior parte da minha carreira atendendo pessoas inteligentes que sabiam tudo.
[PAUSA]
E mesmo assim, não saíam do lugar.', NULL, 'Story 2 · [JU GRAVA]
"Eu sou psicóloga há mais de 15 anos. Passei a maior parte da minha carreira atendendo pessoas inteligentes que sabiam tudo. E mesmo assim, não saíam do lugar."'),
(56, NULL, '2026-07-06', 'Seg', '13:30', 'Stories', 'Vídeo Ju', 'S01 · Apresentação Ju', 'Criei um método chamado Protocolo EPIC247. Vou te explicar nas próximas semanas.', '3 de 5', 'a_produzir', NULL, 'STORY 3
Criei um método chamado Protocolo EPIC247.
Dez módulos. Sequenciais.
Pra quem está cansado de saber muito e executar pouco.', NULL, 'Story 3 · [JU GRAVA]
"Criei um método chamado Protocolo EPIC247. Dez módulos. Sequenciais. Pra quem está cansado de saber muito e executar pouco."'),
(57, NULL, '2026-07-06', 'Seg', '17:30', 'Stories', 'Vídeo Ju', 'S01 · Apresentação Ju', 'Aqui não tem motivação rápida nem hype. Tem ciência aplicada à transformação real.', '4 de 5', 'a_produzir', NULL, 'STORY 4
Aqui não tem motivação rápida.
Não tem frase de espelho.
Não tem hype.
[PAUSA]
Tem ciência. Tem mecanismo. Tem prática.', NULL, 'Story 4 · [JU GRAVA]
"Aqui não tem motivação rápida. Não tem frase de espelho. Não tem hype. Tem ciência. Tem mecanismo. Tem prática."'),
(58, NULL, '2026-07-06', 'Seg', '20:00', 'Stories', 'Vídeo Ju', 'S01 · Apresentação Ju', 'Se isso te interessa, fica. Vamos andar juntos. — Ju', '5 de 5', 'a_produzir', NULL, 'STORY 5
Se isso te interessa, fica.
Se você procurava outra coisa, sem problema.
[PAUSA LONGA]
Material errado pra pessoa errada é frustração pros dois lados.', NULL, 'Story 5 · [JU GRAVA]
"Se isso te interessa, fica. Se você procurava outra coisa, sem problema. Material errado pra pessoa errada é frustração pros dois lados."'),
(59, NULL, '2026-07-06', 'Seg', '20:00', 'Stories', 'Enquete', 'S01 · Apresentação Ju', 'Se isso te interessa, fica. Vamos andar juntos. — Ju', '6', 'entregue', NULL, NULL, NULL, 'Pergunta: Você é a pessoa que sabe muito e executa pouco?

Sim, exatamente eu
Mais ou menos
Conheço alguém assim'),
(60, NULL, '2026-07-06', 'Seg', '20:00', 'Stories', 'Texto', 'S01 · Apresentação Ju', 'Se isso te interessa, fica. Vamos andar juntos. — Ju', '7', 'entregue', NULL, NULL, NULL, 'Bem-vindo ao EPIC247.
O que você vai encontrar aqui nos próximos dias.
(continua amanhã)'),
(61, NULL, '2026-07-07', 'Ter', '08:00', 'Stories', 'Texto', 'S02 · O que esperar', 'Bom dia. O que esperar das próximas 8 semanas.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Continuando de ontem.
Nas próximas semanas, você vai ver aqui:'),
(62, NULL, '2026-07-07', 'Ter', '11:00', 'Stories', 'Texto', 'S02 · O que esperar', 'Conteúdo denso, sem rodeio. Foco em causa, não sintoma.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Ciência aplicada sobre energia, sono, alimentação, movimento.'),
(63, NULL, '2026-07-07', 'Ter', '13:30', 'Stories', 'Texto', 'S02 · O que esperar', 'Sem promessas mágicas. Mas com respostas que funcionam.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Diagnóstico dos 5 Drenos que mais sugam sua energia.'),
(64, NULL, '2026-07-07', 'Ter', '17:30', 'Stories', 'Texto', 'S02 · O que esperar', 'Você quer ENTENDER por que trava ou APLICAR pra destravar? Entender / Aplicar / Ambos', '4 de 5', 'entregue', NULL, NULL, NULL, 'Casos reais (sem nome, com permissão) de pessoas que travaram e destravaram.'),
(65, NULL, '2026-07-07', 'Ter', '20:00', 'Stories', 'Texto', 'S02 · O que esperar', 'Última coisa: você não precisa concordar com tudo. Só preciso que pense.', '5 de 5', 'entregue', NULL, NULL, NULL, 'Trechos do método EPIC247. Sem floreio. Direto.'),
(66, NULL, '2026-07-07', 'Ter', '20:00', 'Stories', 'Vídeo Ju', 'S02 · O que esperar', 'Última coisa: você não precisa concordar com tudo. Só preciso que pense.', '6', 'a_produzir', NULL, 'FOLHA S02 · DIA 2 · O QUE VOCÊ VAI ENCONTRAR AQUI
Quantidade de stories da Ju: 1 story
Tom: Confiança, leveza, professora explicando o conteúdo do semestre.

STORY 6
E uma coisa que eu prometo:
sempre que eu te disser alguma coisa,
vou te dar o motivo.
[PAUSA]
Aqui não tem porque sim.
Aqui tem mecanismo.', NULL, 'Story 6 · [JU GRAVA]
Ela falando para câmera.

"E uma coisa que eu prometo: sempre que eu te disser alguma coisa, vou te dar o motivo. Aqui não tem ''porque sim''. Aqui tem mecanismo."'),
(67, NULL, '2026-07-07', 'Ter', '20:00', 'Stories', 'Caixa Perg.', 'S02 · O que esperar', 'Última coisa: você não precisa concordar com tudo. Só preciso que pense.', '7', 'entregue', NULL, NULL, NULL, 'Story 7 · [INTERATIVO — Caixa de perguntas]
Pergunta na caixa:

Antes de continuarmos, me conta: o que mais te trava hoje?'),
(68, NULL, '2026-07-07', 'Ter', '20:00', 'Stories', 'Texto', 'S02 · O que esperar', 'Última coisa: você não precisa concordar com tudo. Só preciso que pense.', '8', 'entregue', NULL, NULL, NULL, 'Amanhã eu volto com algo que talvez te incomode um pouco.
(E é proposital.)'),
(69, NULL, '2026-07-08', 'Qua', '08:00', 'Stories', 'Vídeo Ju', 'S03 · Provocação e posicionamento', 'Hoje vou começar com uma pergunta desconfortável.', '1 de 5', 'a_produzir', NULL, 'FOLHA S03 · DIA 3 · PROVOCAÇÃO E POSICIONAMENTO
Quantidade de stories da Ju: 3 stories
Tom: Firme, direto, sem medo de incomodar.

STORY 7
Hoje eu vou te dizer uma coisa que provavelmente vai te incomodar.
[PAUSA]
E eu quero que incomode.
Porque o que incomoda tem chance de mudar.', NULL, 'DIA 3 — PROVOCAÇÃO E POSICIONAMENTO
Objetivo: plantar a tese central, filtrar audiência, atrair quem é fit.

Story 1 · [JU GRAVA]
"Hoje eu vou te dizer uma coisa que provavelmente vai te incomodar. E eu quero que incomode. Porque o que incomoda tem chance de mudar."'),
(70, NULL, '2026-07-08', 'Qua', '11:00', 'Stories', 'Vídeo Ju', 'S03 · Provocação e posicionamento', 'Você sabe muito sobre o que precisa fazer e mesmo assim não faz?', '2 de 5', 'a_produzir', NULL, 'STORY 8
Você não está cansado porque é fraco.
[PAUSA]
Está cansado porque está tentando construir uma vida nova
em cima de uma fundação sem energia.', NULL, 'Story 2 · [JU GRAVA]
"Você não está cansado porque é fraco. Está cansado porque está tentando construir uma vida nova em cima de uma fundação sem energia."'),
(71, NULL, '2026-07-08', 'Qua', '13:30', 'Stories', 'Vídeo Ju', 'S03 · Provocação e posicionamento', 'Se reconheceu? Sim, exatamente / Mais ou menos / Não me reconheço', '3 de 5', 'a_produzir', NULL, 'STORY 9
Não adianta mais um curso.
Não adianta mais um app.
Não adianta mais um planner.
[PAUSA LONGA]
Você não precisa de mais inspiração.
Precisa de infraestrutura.', NULL, 'Story 3 · [JU GRAVA]
"Não adianta mais um curso. Não adianta mais um app. Não adianta mais um planner. Você não precisa de mais inspiração. Precisa de infraestrutura."'),
(72, NULL, '2026-07-08', 'Qua', '17:30', 'Stories', 'Texto', 'S03 · Provocação e posicionamento', 'Se respondeu ''Sim, exatamente'', esse perfil é pra você. Se ''não'', talvez não. E tá tudo bem.', '4 de 5', 'entregue', NULL, NULL, NULL, '"Conhecimento sem energia é peso.
Plano sem energia é frustração.
Intenção sem energia vira culpa acumulada."
JU FERREIRA'),
(73, NULL, '2026-07-08', 'Qua', '20:00', 'Stories', 'Interativo', 'S03 · Provocação e posicionamento', 'Amanhã vou abrir a caixa pra ouvir vocês. Vai ter espaço pra ser real.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Story 5 · [INTERATIVO — Slider de emoji]
Pergunta: O quanto essa frase te tocou?
Emoji slider: 🤔'),
(74, NULL, '2026-07-08', 'Qua', '20:00', 'Stories', 'Vídeo Ju', 'S03 · Provocação e posicionamento', 'Amanhã vou abrir a caixa pra ouvir vocês. Vai ter espaço pra ser real.', '6', 'a_produzir', NULL, 'STORY 10 (segue após enquete interativa)
Se isso te tocou, salva esse story.
Amanhã eu te mostro o que fazer com esse incômodo.', NULL, 'Story 6 · [JU GRAVA]
"Se isso te tocou, salva esse story. Amanhã eu te mostro o que fazer com esse incômodo."'),
(75, NULL, '2026-07-08', 'Qua', '20:00', 'Stories', 'Texto', 'S03 · Provocação e posicionamento', 'Amanhã vou abrir a caixa pra ouvir vocês. Vai ter espaço pra ser real.', '7', 'entregue', NULL, NULL, NULL, 'Não se mede progresso por quanto você sabe.
Se mede por quanto você executa.
E execução depende de energia.'),
(76, NULL, '2026-07-09', 'Qui', '08:00', 'Stories', 'Vídeo Ju', 'S04 · Caixa de perguntas aberta', 'Hoje é dia de você falar. Vou abrir a caixa.', '1 de 5', 'a_produzir', NULL, 'FOLHA S04 · DIA 4 · CAIXA DE PERGUNTAS
Quantidade de stories da Ju: 3 stories
Tom: Convite genuíno, sem urgência.

STORY 11
Hoje é dia de vocês falarem.
Eu quero entender o que está acontecendo com vocês de verdade.', NULL, 'DIA 4 — CAIXA DE PERGUNTAS
Objetivo: abrir relacionamento bidirecional, gerar conteúdo para amanhã, entender objeções reais.

Story 1 · [JU GRAVA]
"Hoje é dia de vocês falarem. Eu quero entender o que está acontecendo com vocês de verdade."'),
(77, NULL, '2026-07-09', 'Qui', '11:00', 'Stories', 'Caixa Perg.', 'S04 · Caixa de perguntas aberta', 'Manda sua maior dúvida sobre cansaço. Anônimo. Sem filtro.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Story 2 · [INTERATIVO — Caixa de perguntas]
Pergunta na caixa:

Qual a coisa que você mais sabe que precisa fazer, e mesmo assim não faz?'),
(78, NULL, '2026-07-09', 'Qui', '13:30', 'Stories', 'Vídeo Ju', 'S04 · Caixa de perguntas aberta', 'Já chegaram 40 perguntas. Tem padrão. Amanhã eu respondo as 3 mais comuns.', '3 de 5', 'a_produzir', NULL, '"STORY 12 (após abrir caixa de perguntas)
Manda sem medo.
Anônimo.
Pode ser bobo, pode ser grande, pode ser específico.
[PAUSA]
Eu leio tudo."', NULL, 'Story 3 · [JU GRAVA]
"Manda sem medo. Anônimo. Pode ser bobo, pode ser grande, pode ser específico. Eu leio tudo."'),
(79, NULL, '2026-07-09', 'Qui', '17:30', 'Stories', 'Texto', 'S04 · Caixa de perguntas aberta', 'Caixa ainda aberta. Manda a sua agora.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Você não precisa ter resposta pra fazer pergunta.
Pergunta bem feita já é metade do caminho.'),
(80, NULL, '2026-07-09', 'Qui', '20:00', 'Stories', 'Enquete', 'S04 · Caixa de perguntas aberta', 'Última hora. Caixa fecha à meia-noite. Manda.', '5 de 5', 'entregue', NULL, NULL, NULL, 'Pergunta: Sua maior dificuldade hoje é:

Começar
Continuar'),
(81, NULL, '2026-07-09', 'Qui', '17:30', 'Stories', 'Vídeo Ju', 'S04 · Caixa de perguntas aberta', 'Caixa ainda aberta. Manda a sua agora.', '6', 'a_produzir', NULL, '"STORY 13
Amanhã eu volto e respondo as melhores.
Em vídeo.
Direto.
Sem floreio."', NULL, 'Story 6 · [JU GRAVA]
"Amanhã eu volto e respondo as melhores. Em vídeo. Direto. Sem floreio."'),
(82, NULL, '2026-07-09', 'Qui', '20:00', 'Stories', 'Texto', 'S04 · Caixa de perguntas aberta', 'Última hora. Caixa fecha à meia-noite. Manda.', '7', 'entregue', NULL, NULL, NULL, 'CAIXA AINDA ABERTA →
[seta apontando pro próximo story]'),
(83, NULL, '2026-07-09', 'Qui', '20:00', 'Stories', 'Caixa Perg.', 'S04 · Caixa de perguntas aberta', 'Última hora. Caixa fecha à meia-noite. Manda.', '8', 'entregue', NULL, NULL, NULL, 'Story 8 · [INTERATIVO — Caixa de perguntas]
(mesma caixa repetida, garante mais respostas)'),
(84, NULL, '2026-07-10', 'Sex', '08:00', 'Stories', 'Vídeo Ju', 'S05 · Respostas da caixa', 'Recebi 87 perguntas. Vou responder as 3 mais comuns.', '1 de 5', 'a_produzir', NULL, 'FOLHA S05 · DIA 5 · RESPOSTAS DA CAIXA
Quantidade de stories da Ju: 5 stories
Tom: Mentora respondendo paciente. Voz de quem já viu essas perguntas mil vezes e ainda tem respeito por elas.

STORY 14
Recebi muitas perguntas ontem.
Vou responder as 3 mais frequentes em vídeo.
Curto e direto.', NULL, 'DIA 5 — RESPOSTAS
Objetivo: entregar valor real respondendo perguntas. Constrói autoridade e gera afinidade.

Story 1 · [JU GRAVA]
"Recebi muitas perguntas ontem. Vou responder as 3 mais frequentes em vídeo. Curto e direto."'),
(85, NULL, '2026-07-10', 'Sex', '11:00', 'Stories', 'Vídeo Ju', 'S05 · Respostas da caixa', '1. ''Por que tô cansado mesmo dormindo 8h?''', '2 de 5', 'a_produzir', NULL, 'STORY 15 (mostra print da pergunta)
Pergunta: como começar quando eu já comecei 10 vezes e parei?
[PAUSA]
Resposta direta: muda o tamanho do começo.
Você está começando grande. E grande não dura.
O começo certo é tão pequeno que parece ridículo.
[PAUSA LONGA]
Mínimo viável vence ideal abandonado.
Sempre.', NULL, 'Story 2 · [JU GRAVA — print da pergunta + resposta]
Print da pergunta de seguidor (anônimo).

"Como começar quando eu já comecei 10 vezes e parei?"

"Resposta direta: muda o tamanho do começo. Você está começando grande. E grande não dura. O começo certo é tão pequeno que parece ridículo. Mínimo viável vence ideal abandonado. Sempre."'),
(86, NULL, '2026-07-10', 'Sex', '13:30', 'Stories', 'Vídeo Ju', 'S05 · Respostas da caixa', '2. ''Como começar quando já tô esgotado?''', '3 de 5', 'a_produzir', NULL, 'STORY 16 (mostra print)
Pergunta: tô exausta, não sei mais o que fazer.
[PAUSA]
Resposta: provavelmente o caminho é parar antes de começar.
Não no sentido de desistir.
No sentido de cuidar do tanque antes de pôr o pé na estrada.
Esgotamento não se resolve com mais esforço.', NULL, 'Story 3 · [JU GRAVA — print + resposta]
Pergunta: "Tô exausta. Não sei mais o que fazer."

"Resposta: provavelmente o caminho é parar antes de começar. Não no sentido de desistir. No sentido de cuidar do tanque antes de pôr o pé na estrada. Esgotamento não se resolve com mais esforço."'),
(87, NULL, '2026-07-10', 'Sex', '17:30', 'Stories', 'Vídeo Ju', 'S05 · Respostas da caixa', '3. ''Vale a pena tentar de novo se já falhei várias vezes?''', '4 de 5', 'a_produzir', NULL, 'STORY 17 (mostra print)
Pergunta: meu problema é foco, não consigo terminar nada.
[PAUSA]
Resposta: foco fragmentado raramente é falta de força mental.
É geralmente sintoma de sono ruim, alimentação instável e excesso de tela.
Trate a base, o foco vem junto.
Sem isso, nenhuma técnica de foco sustenta.', NULL, 'Story 4 · [JU GRAVA — print + resposta]
Pergunta: "Meu problema é foco. Não consigo terminar nada."

"Resposta: foco fragmentado raramente é falta de força mental. É geralmente sintoma de sono ruim, alimentação instável e excesso de tela. Trate a base, o foco vem junto. Sem isso, nenhuma técnica de foco sustenta."'),
(88, NULL, '2026-07-10', 'Sex', '20:00', 'Stories', 'Texto', 'S05 · Respostas da caixa', 'Tem respostas que doem antes de aliviar. Esse é o trabalho.', '5 de 5', 'entregue', NULL, NULL, NULL, 'Quem leu até aqui já entendeu.
A maioria das técnicas falha porque ataca o sintoma.
Não a causa.'),
(89, NULL, '2026-07-10', 'Sex', '20:00', 'Stories', 'Vídeo Ju', 'S05 · Respostas da caixa', 'Tem respostas que doem antes de aliviar. Esse é o trabalho.', '6', 'a_produzir', NULL, 'STORY 18
Mandem mais perguntas sempre que quiserem.
Esse canal fica aberto.', NULL, 'Story 6 · [JU GRAVA]
"Mandem mais perguntas sempre que quiserem. Esse canal fica aberto."'),
(90, NULL, '2026-07-10', 'Sex', '20:00', 'Stories', 'Enquete', 'S05 · Respostas da caixa', 'Tem respostas que doem antes de aliviar. Esse é o trabalho.', '7', 'entregue', NULL, NULL, NULL, 'Pergunta: Quer mais dias de respostas?

Sim, semanal
Sim, quinzenal'),
(91, NULL, '2026-07-11', 'Sáb', '08:00', 'Stories', 'Vídeo Ju', 'S06 · Bastidores', 'Sábado. Bastidor. Atendi essa semana uma pessoa que me marcou. Vou contar (anônimo).', '1 de 5', 'a_produzir', NULL, 'FOLHA S06 · DIA 6 · BASTIDORES
Quantidade de stories da Ju: 4 stories
Tom: Casa, leveza, sem performance. Pode estar com avental de café, sem maquiagem cheia.

STORY 19
Hoje é dia de bastidor.
Vou te mostrar como é uma manhã real minha.
Sem filtro.', NULL, 'DIA 6 — BASTIDORES (humanização)
Objetivo: mostrar a Ju como pessoa real. Realizador Travado confia em quem parece humano, não em quem parece guru.

Story 1 · [JU GRAVA]
Ambiente real: cozinha, escritório, varanda.

"Hoje é dia de bastidor. Vou te mostrar como é uma manhã real minha. Sem filtro."'),
(92, NULL, '2026-07-11', 'Sáb', '11:00', 'Stories', 'Vídeo Ju', 'S06 · Bastidores', 'Ela tinha 11 cursos pagos. Aplicado: 1. Idade 36. Sintoma: paralisia decisional.', '2 de 5', 'a_produzir', NULL, 'STORY 20 (com xícara de café na mão)
Sim, eu tomo café.
Não, eu não acordo às 5.
Sim, eu tomo banho quente.
Não, eu não medito 1 hora por dia.', NULL, 'Story 2 · [JU GRAVA — foto da xícara, do café]
"Sim, eu tomo café. Não, eu não acordo às 5. Sim, eu tomo banho quente. Não, eu não medito 1 hora por dia."'),
(93, NULL, '2026-07-11', 'Sáb', '13:30', 'Stories', 'Vídeo Ju', 'S06 · Bastidores', 'Primeira sessão: 30 minutos justificando os 11. Como ''investimento futuro''.', '3 de 5', 'a_produzir', NULL, 'STORY 21
Eu pratico o que ensino.
Mas pratico em escala humana.
[PAUSA]
Pratico em escala de pessoa real, com filho, agenda, cansaço, fim de semana com gente.', NULL, 'Story 3 · [JU GRAVA]
"Eu pratico o que ensino, mas pratico em escala humana. Pratico em escala de pessoa real, com filho, agenda, cansaço, fim de semana com gente."'),
(94, NULL, '2026-07-11', 'Sáb', '17:30', 'Stories', 'Texto', 'S06 · Bastidores', 'Eu disse: ''esses cursos são proteção contra desconforto''. Ela chorou.', '4 de 5', 'entregue', NULL, NULL, NULL, '"Coerência não é perfeição.
É consistência possível."'),
(95, NULL, '2026-07-11', 'Sáb', '20:00', 'Stories', 'Vídeo Ju', 'S06 · Bastidores', 'Aquilo que parecia compromisso era defesa. Você já fez isso?', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Story 5 · [JU GRAVA — gravando o ambiente de trabalho dela]
"Esse é o canto onde eu escrevo. Aqui nasceu o Protocolo EPIC247. Sem trilha sonora, sem hype, sem mesa de R$10 mil."'),
(96, NULL, '2026-07-11', 'Sáb', '20:00', 'Stories', 'Vídeo Ju', 'S06 · Bastidores', 'Aquilo que parecia compromisso era defesa. Você já fez isso?', '6', 'a_produzir', NULL, 'STORY 22
Eu acredito numa coisa:
o método precisa funcionar pra pessoa real.
Na vida real.
[PAUSA LONGA]
Senão é só fantasia.', NULL, 'Story 6 · [JU GRAVA]
"Eu acredito numa coisa: o método precisa funcionar pra pessoa real, na vida real. Senão é só fantasia."'),
(97, NULL, '2026-07-11', 'Sáb', '20:00', 'Stories', 'Enquete', 'S06 · Bastidores', 'Aquilo que parecia compromisso era defesa. Você já fez isso?', '7', 'entregue', NULL, NULL, NULL, 'Pergunta: Você quer mais dias de bastidor?

Quero, é o que mais gosto
Prefiro conteúdo de método'),
(98, NULL, '2026-07-11', 'Sáb', '20:00', 'Stories', 'Texto', 'S06 · Bastidores', 'Aquilo que parecia compromisso era defesa. Você já fez isso?', '8', 'entregue', NULL, NULL, NULL, 'Amanhã eu volto com algo prático.
Diagnóstico curto. Pra você descobrir onde está agora.'),
(99, NULL, '2026-07-12', 'Dom', '08:00', 'Stories', 'Vídeo Ju', 'S07 · Convite ao quiz', 'Domingo. Hora do diagnóstico. Já fez o quiz dos 5 drenos?', '1 de 5', 'a_produzir', NULL, 'FOLHA S07 · DIA 7 · CONVITE AO QUIZ
Quantidade de stories da Ju: 4 stories
Tom: Convite firme, sem manipulação. Como amiga oferecendo algo que de fato ajuda.

STORY 23
Hoje eu vou te oferecer algo que já ajudou muita gente
a entender de onde começar.', NULL, 'DIA 7 — CONVITE AO QUIZ
Objetivo: primeiro CTA forte da semana. Quem se interessou vira lead via quiz.

Story 1 · [JU GRAVA]
"Hoje eu vou te oferecer algo que já ajudou muita gente a entender de onde começar."'),
(100, NULL, '2026-07-12', 'Dom', '11:00', 'Stories', 'Vídeo Ju', 'S07 · Convite ao quiz', '90 segundos. Resposta imediata. [link sticker pro quiz]', '2 de 5', 'a_produzir', NULL, 'STORY 24
É o Diagnóstico dos 5 Drenos.
Quinze perguntas. Dois minutos.
[PAUSA]
Você descobre qual dos 5 está sugando mais energia agora.', NULL, 'Story 2 · [JU GRAVA]
"É o Diagnóstico dos 5 Drenos. Quinze perguntas. Dois minutos. Você descobre qual dos 5 está sugando mais energia agora."'),
(101, NULL, '2026-07-12', 'Dom', '13:30', 'Stories', 'Texto', 'S07 · Convite ao quiz', 'Qual você acha que é seu dreno dominante? Sono / Glicose / Estresse / Sedentarismo / Solidão', '3 de 5', 'entregue', NULL, NULL, NULL, 'Sono Quebrado
Combustível Errado
Cortisol Crônico
Atenção Sequestrada
Corpo Parado'),
(102, NULL, '2026-07-12', 'Dom', '17:30', 'Stories', 'Texto', 'S07 · Convite ao quiz', 'Quem fez essa semana, me conta o resultado nos comentários.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Um deles é o seu dominante.
Saber qual é muda onde você começa.'),
(103, NULL, '2026-07-12', 'Dom', '20:00', 'Stories', 'Vídeo Ju', 'S07 · Convite ao quiz', 'Última chance da semana de fazer o quiz. [link sticker]', '5 de 5', 'a_produzir', NULL, 'STORY 25
É grátis. Sem pegadinha.
Você responde e recebe o relatório completo do seu dreno por email.
Em segundos.', NULL, 'Story 5 · [JU GRAVA]
"É grátis. Sem pegadinha. Você responde e recebe o relatório completo do seu dreno por e-mail. Em segundos."'),
(104, NULL, '2026-07-12', 'Dom', '20:00', 'Stories', 'Link Sticker', 'S07 · Convite ao quiz', 'Última chance da semana de fazer o quiz. [link sticker]', '6', 'entregue', NULL, NULL, NULL, 'Texto sobre o sticker:

FAZER MEU DIAGNÓSTICO →
[link para quiz]'),
(105, NULL, '2026-07-12', 'Dom', '20:00', 'Stories', 'Vídeo Ju', 'S07 · Convite ao quiz', 'Última chance da semana de fazer o quiz. [link sticker]', '7', 'a_produzir', NULL, 'STORY 26
Faz hoje.
Não amanhã.
Não na semana que vem.
Agora.
[PAUSA LONGA]
Porque diagnóstico só funciona quando você usa.', NULL, 'Story 7 · [JU GRAVA]
"Faz hoje. Não amanhã. Não na semana que vem. Agora. Porque diagnóstico só funciona quando você usa."'),
(106, NULL, '2026-07-12', 'Dom', '20:00', 'Stories', 'Texto', 'S07 · Convite ao quiz', 'Última chance da semana de fazer o quiz. [link sticker]', '8', 'entregue', NULL, NULL, NULL, 'Quem fizer hoje recebe o relatório completo até a noite.
Link no story anterior. E na bio.'),
(107, NULL, '2026-07-13', 'Seg', '08:00', 'Stories', 'Vídeo Ju', 'S08 · Os 5 Drenos parte 1', 'Começando a apresentar os 5 drenos. Hoje os 2 primeiros.', '1 de 5', 'a_produzir', NULL, 'FOLHA S08 · DIA 8 · APRESENTAÇÃO DOS 5 DRENOS (PARTE 1)
Quantidade de stories da Ju: 4 stories
Tom: Professora apresentando o conteúdo. Densidade e clareza.

STORY 27
Pra quem não fez o diagnóstico ontem,
hoje eu vou apresentar os 5 drenos um por um.
Pra você ir reconhecendo.', NULL, 'DIA 8 — OS 5 DRENOS APRESENTADOS
Objetivo: quem não fez o quiz ontem, vê os 5 drenos hoje no detalhe. Dispara segunda onda de quizzes.

Story 1 · [JU GRAVA]
"Pra quem não fez o diagnóstico ontem, hoje eu vou apresentar os 5 drenos um por um. Pra você ir reconhecendo."'),
(108, NULL, '2026-07-13', 'Seg', '11:00', 'Stories', 'Texto', 'S08 · Os 5 Drenos parte 1', 'Dreno 1: Sobrecarga Cognitiva. Sintomas que você atribui a outras coisas.', '2 de 5', 'entregue', NULL, NULL, NULL, 'DRENO 1
SONO QUEBRADO
Seu corpo deita, mas não restaura.'),
(109, NULL, '2026-07-13', 'Seg', '13:30', 'Stories', 'Vídeo Ju', 'S08 · Os 5 Drenos parte 1', 'Dreno 2: Privação de Sono. Não é só quantas horas. É qualidade.', '3 de 5', 'a_produzir', NULL, 'STORY 28 (após slide visual do Dreno 1)
Sono Quebrado não é só dormir pouco.
É dormir e não restaurar.
Acorda cansado, café pra começar, irritação à toa, fadiga decisional.', NULL, 'Story 3 · [JU GRAVA]
"Sono Quebrado não é só dormir pouco. É dormir e não restaurar. Acorda cansado, café pra começar, irritação à toa, fadiga decisional."'),
(110, NULL, '2026-07-13', 'Seg', '17:30', 'Stories', 'Texto', 'S08 · Os 5 Drenos parte 1', 'Você se reconhece em algum? Dreno 1 / Dreno 2 / Ambos / Nenhum', '4 de 5', 'entregue', NULL, NULL, NULL, 'DRENO 2
COMBUSTÍVEL ERRADO
Você come, mas não nutre.'),
(111, NULL, '2026-07-13', 'Seg', '20:00', 'Stories', 'Vídeo Ju', 'S08 · Os 5 Drenos parte 1', 'Amanhã: drenos 3, 4 e 5. E uma enquete pra você dizer qual é o seu.', '5 de 5', 'a_produzir', NULL, 'STORY 29 (após slide visual do Dreno 2)
Combustível Errado é alimentação que desestabiliza.
Pico e queda de glicemia, vontade de doce no fim da tarde,
mau humor que parece personalidade.', NULL, 'Story 5 · [JU GRAVA]
"Combustível Errado é alimentação que desestabiliza. Pico e queda de glicemia, vontade de doce no fim da tarde, mau humor que parece personalidade."'),
(112, NULL, '2026-07-13', 'Seg', '20:00', 'Stories', 'Texto', 'S08 · Os 5 Drenos parte 1', 'Amanhã: drenos 3, 4 e 5. E uma enquete pra você dizer qual é o seu.', '6', 'entregue', NULL, NULL, NULL, 'DRENO 3
CORTISOL CRÔNICO
Seu sistema não desliga.'),
(113, NULL, '2026-07-13', 'Seg', '20:00', 'Stories', 'Vídeo Ju', 'S08 · Os 5 Drenos parte 1', 'Amanhã: drenos 3, 4 e 5. E uma enquete pra você dizer qual é o seu.', '7', 'a_produzir', NULL, 'STORY 30 (após slide visual do Dreno 3)
Cortisol Crônico é estresse que virou padrão.
Mente acelerada, mandíbula travada,
sono interrompido por pensar em problema.', NULL, 'Story 7 · [JU GRAVA]
"Cortisol Crônico é estresse que virou padrão. Mente acelerada, mandíbula travada, sono interrompido por pensar em problema."'),
(114, NULL, '2026-07-13', 'Seg', '20:00', 'Stories', 'Link Sticker', 'S08 · Os 5 Drenos parte 1', 'Amanhã: drenos 3, 4 e 5. E uma enquete pra você dizer qual é o seu.', '8', 'entregue', NULL, NULL, NULL, 'Continua nos próximos stories. Mas se já reconheceu o seu, vai direto pro diagnóstico.
FAZER DIAGNÓSTICO →'),
(115, NULL, '2026-07-14', 'Ter', '08:00', 'Stories', 'Vídeo Ju', 'S09 · Os 5 Drenos parte 2', 'Continuando os 5 drenos. Hoje os 3 últimos.', '1 de 5', 'a_produzir', NULL, 'FOLHA S09 · DIA 9 · APRESENTAÇÃO DOS 5 DRENOS (PARTE 2)
Quantidade de stories da Ju: 3 stories
Tom: Continuação da aula. Mesma energia do dia 8.

STORY 31
Continuando os 5 Drenos.
Hoje os dois últimos.
E uma enquete.', NULL, 'DIA 9 — OS 5 DRENOS, PARTE 2 + ENQUETE
Objetivo: terminar a apresentação dos drenos. Engajar com enquete que vira segmentação.

Story 1 · [JU GRAVA]
"Continuando os 5 Drenos. Hoje os dois últimos. E uma enquete."'),
(116, NULL, '2026-07-14', 'Ter', '11:00', 'Stories', 'Texto', 'S09 · Os 5 Drenos parte 2', 'Dreno 3: Dispersão Emocional. Vamos falar sobre.', '2 de 5', 'entregue', NULL, NULL, NULL, 'DRENO 4
ATENÇÃO SEQUESTRADA
Sua mente nunca está onde você está.'),
(117, NULL, '2026-07-14', 'Ter', '13:30', 'Stories', 'Vídeo Ju', 'S09 · Os 5 Drenos parte 2', 'Dreno 4: Sedentarismo Crônico. Subestimado, fundamental.', '3 de 5', 'a_produzir', NULL, 'STORY 32 (após slide do Dreno 4)
Atenção Sequestrada é foco fragmentado por excesso de tela.
Você abre 15 abas, fecha 12.
[PAUSA]
Sente que o dia passou e você não viveu.', NULL, 'Story 3 · [JU GRAVA]
"Atenção Sequestrada é foco fragmentado por excesso de tela. Você abre 15 abas, fecha 12, sente que o dia passou e não viveu."'),
(118, NULL, '2026-07-14', 'Ter', '17:30', 'Stories', 'Texto', 'S09 · Os 5 Drenos parte 2', 'Dreno 5: Isolamento Social. Mais comum do que parece.', '4 de 5', 'entregue', NULL, NULL, NULL, 'DRENO 5
CORPO PARADO
Seu corpo virou cenário do seu trabalho.'),
(119, NULL, '2026-07-14', 'Ter', '20:00', 'Stories', 'Vídeo Ju', 'S09 · Os 5 Drenos parte 2', 'Qual é o seu dreno dominante? Sono / Glicose / Estresse / Sedentarismo / Solidão', '5 de 5', 'a_produzir', NULL, 'STORY 33 (após slide do Dreno 5)
Corpo Parado é sedentarismo crônico.
Cansaço só de subir escada.
Ansiedade que sobe sem motivo.
[PAUSA]
Procrastinação que parece mental e é fisiológica.', NULL, 'Story 5 · [JU GRAVA]
"Corpo Parado é sedentarismo crônico. Cansaço só de subir escada. Ansiedade que sobe sem motivo. Procrastinação que parece mental e é fisiológica."'),
(120, NULL, '2026-07-14', 'Ter', '20:00', 'Stories', 'Enquete', 'S09 · Os 5 Drenos parte 2', 'Qual é o seu dreno dominante? Sono / Glicose / Estresse / Sedentarismo / Solidão', '6', 'entregue', NULL, NULL, NULL, 'Pergunta: Qual você acha que é o seu dreno dominante?

Sono
Combustível
Cortisol
Atenção
Corpo Parado
(Use enquete múltipla se Instagram permitir, ou rotacione)'),
(121, NULL, '2026-07-14', 'Ter', '20:00', 'Stories', 'Vídeo Ju', 'S09 · Os 5 Drenos parte 2', 'Qual é o seu dreno dominante? Sono / Glicose / Estresse / Sedentarismo / Solidão', '7', 'a_produzir', NULL, 'STORY 34 (após enquete)
Acertar o palpite ou não, não importa.
O que importa é descobrir com método.
[PAUSA LONGA]
Faz o diagnóstico.', NULL, 'Story 7 · [JU GRAVA]
"Acertar o palpite ou não, não importa. O que importa é descobrir com método. Faz o diagnóstico."'),
(122, NULL, '2026-07-14', 'Ter', '20:00', 'Stories', 'Link Sticker', 'S09 · Os 5 Drenos parte 2', 'Qual é o seu dreno dominante? Sono / Glicose / Estresse / Sedentarismo / Solidão', '8', 'entregue', NULL, NULL, NULL, 'FAZER MEU DIAGNÓSTICO →'),
(123, NULL, '2026-07-15', 'Qua', '08:00', 'Stories', 'Vídeo Ju', 'S10 · Ciência do cansaço', 'Hoje vou compartilhar ciência pura. Sem traduzir demais.', '1 de 5', 'a_produzir', NULL, 'FOLHA S10 · DIA 10 · A CIÊNCIA DO CANSAÇO
Quantidade de stories da Ju: 3 stories
Tom: Autoridade, mas com calor humano. Cientista que se importa, não palestrante distante.

STORY 35
Hoje eu vou te mostrar dados que mudam como você enxerga seu próprio cansaço.', NULL, 'DIA 10 — A CIÊNCIA DO CANSAÇO
Objetivo: ancorar autoridade. Quem ainda está em dúvida sobre seriedade do método, decide hoje.

Story 1 · [JU GRAVA]
"Hoje eu vou te mostrar dados que mudam como você enxerga seu próprio cansaço."'),
(124, NULL, '2026-07-15', 'Qua', '11:00', 'Stories', 'Texto', 'S10 · Ciência do cansaço', 'Cortisol crônico explicado em 3 minutos.', '2 de 5', 'entregue', NULL, NULL, NULL, '98%
dos brasileiros se dizem cansados.'),
(125, NULL, '2026-07-15', 'Qua', '13:30', 'Stories', 'Vídeo Ju', 'S10 · Ciência do cansaço', 'Por que o sono perdido não se recupera.', '3 de 5', 'a_produzir', NULL, 'STORY 36 (após slide 98%)
Isso não é coincidência.
[PAUSA]
É consequência de um modelo de vida
que tira mais do sistema do que repõe.', NULL, 'Story 3 · [JU GRAVA]
"Isso não é coincidência. É consequência de um modelo de vida que tira mais do sistema do que repõe."'),
(126, NULL, '2026-07-15', 'Qua', '17:30', 'Stories', 'Texto', 'S10 · Ciência do cansaço', 'O papel da inflamação silenciosa.', '4 de 5', 'entregue', NULL, NULL, NULL, '9,3%
da população brasileira tem Transtorno de Ansiedade Generalizada.
A maior prevalência do mundo. (Fonte: OMS)'),
(127, NULL, '2026-07-15', 'Qua', '20:00', 'Stories', 'Texto', 'S10 · Ciência do cansaço', 'Salva esses vídeos. Você vai querer revisitar.', '5 de 5', 'entregue', NULL, NULL, NULL, '30%
dos trabalhadores brasileiros sofrem de burnout.
(Fonte: International Stress Management Association Brasil)'),
(128, NULL, '2026-07-15', 'Qua', '20:00', 'Stories', 'Vídeo Ju', 'S10 · Ciência do cansaço', 'Salva esses vídeos. Você vai querer revisitar.', '6', 'a_produzir', NULL, '"STORY 37
Robert Sapolsky, neurocientista de Stanford, mostrou:
nosso sistema nervoso foi feito pra ameaça aguda.
Não crônica.', NULL, 'Story 6 · [JU GRAVA]
"Robert Sapolsky, neurocientista de Stanford, mostrou: nosso sistema nervoso foi feito pra ameaça aguda. Não crônica."'),
(129, NULL, '2026-07-15', 'Qua', '20:00', 'Stories', 'Vídeo Ju', 'S10 · Ciência do cansaço', 'Salva esses vídeos. Você vai querer revisitar.', '7', 'a_produzir', NULL, 'STORY 37 A

O leão moderno nunca vai embora.
Está no e-mail.
Na reunião.
Na sensação de devendo.
[PAUSA]
O corpo responde igual.
Drena igual."', NULL, 'Story 7 · [JU GRAVA]
"O leão moderno nunca vai embora. Está no e-mail. Na reunião. Na sensação de devendo. O corpo responde igual. Drena igual."'),
(130, NULL, '2026-07-15', 'Qua', '20:00', 'Stories', 'Texto', 'S10 · Ciência do cansaço', 'Salva esses vídeos. Você vai querer revisitar.', '8', 'entregue', NULL, NULL, NULL, 'Você não está cansado porque é fraco.
Está assim porque o mundo ficou pesado demais.
E a ciência concorda.'),
(131, NULL, '2026-07-16', 'Qui', '08:00', 'Stories', 'Vídeo Ju', 'S11 · Caso real Cris parte 1', 'Vou te contar uma história real. Cris, 34 anos.', '1 de 5', 'a_produzir', NULL, 'FOLHA S11 · DIA 11 · CASO REAL (CRIS) - PARTE 1
Quantidade de stories da Ju: 6 stories
Tom: Storytelling. Voz mais baixa, mais íntima. Pausa real entre os blocos da história.

STORY 38
Hoje eu vou te contar a história de alguém.
Detalhes alterados pra privacidade.
Núcleo verdadeiro.', NULL, 'DIA 11 — CASO REAL (CRIS)
Objetivo: vender pelo storytelling. Realizador Travado se reconhece em Cris.

Story 1 · [JU GRAVA]
"Hoje eu vou te contar a história de alguém. Detalhes alterados pra privacidade. Núcleo verdadeiro."'),
(132, NULL, '2026-07-16', 'Qui', '11:00', 'Stories', 'Vídeo Ju', 'S11 · Caso real Cris parte 1', '47 páginas de planejamento. Zero execução. 5 anos travado.', '2 de 5', 'a_produzir', NULL, 'STORY 39
Cris tem 38 anos.
Carreira invejável.
Um projeto de negócio guardado num Google Doc.
Com última edição em março do ano passado.', NULL, 'Story 2 · [JU GRAVA]
"Cris tem 38 anos. Carreira invejável. Um projeto de negócio guardado num Google Doc com última edição em março do ano passado."'),
(133, NULL, '2026-07-16', 'Qui', '13:30', 'Stories', 'Vídeo Ju', 'S11 · Caso real Cris parte 1', 'Veio até mim: ''Ju, sei o que tenho que fazer. Não faço.''', '3 de 5', 'a_produzir', NULL, 'STORY 40
Era 23h15 de uma terça.
Cris abriu o Google Doc pela quarta vez naquele mês.
[PAUSA]
Não pra trabalhar.
Só pra ver se ainda estava lá.', NULL, 'Story 3 · [JU GRAVA]
"Era 23h15 de uma terça. Cris abriu o Google Doc pela quarta vez naquele mês. Não pra trabalhar. Só pra ver se ainda estava lá."'),
(134, NULL, '2026-07-16', 'Qui', '17:30', 'Stories', 'Texto', 'S11 · Caso real Cris parte 1', 'Identifiquei o dreno dominante em 20 minutos. Não era o que ele achava.', '4 de 5', 'entregue', NULL, NULL, NULL, '[ — quote]
"Estava."
(Cris)'),
(135, NULL, '2026-07-16', 'Qui', '20:00', 'Stories', 'Vídeo Ju', 'S11 · Caso real Cris parte 1', 'Amanhã eu termino a história. Vai te impactar.', '5 de 5', 'a_produzir', NULL, 'STORY 41 (após card "Estava")
"Amanhã eu começo de verdade."
Pra si mesmo.
Como da última vez.', NULL, 'Story 5 · [JU GRAVA]
"''Amanhã eu começo de verdade.'' Pra si mesmo. Como da última vez."'),
(136, NULL, '2026-07-16', 'Qui', '20:00', 'Stories', 'Vídeo Ju', 'S11 · Caso real Cris parte 1', 'Amanhã eu termino a história. Vai te impactar.', '6', 'a_produzir', NULL, 'STORY 42
Cris não era preguiçoso.
Era excepcionalmente capaz de entender o problema.
[PAUSA LONGA]
E igualmente capaz de não fazer nada com esse entendimento.', NULL, 'Story 6 · [JU GRAVA]
"Cris não era preguiçoso. Era excepcionalmente capaz de entender o problema. E igualmente capaz de não fazer nada com esse entendimento."'),
(137, NULL, '2026-07-16', 'Qui', '20:00', 'Stories', 'Vídeo Ju', 'S11 · Caso real Cris parte 1', 'Amanhã eu termino a história. Vai te impactar.', '7', 'a_produzir', NULL, 'STORY 43
Cris achava que o problema era energia.
[PAUSA]
Estava certo sobre o sintoma.
E completamente errado sobre a causa.', NULL, 'Story 7 · [JU GRAVA]
"Cris achava que o problema era energia. Estava certo sobre o sintoma. E completamente errado sobre a causa."'),
(138, NULL, '2026-07-16', 'Qui', '20:00', 'Stories', 'Caixa Perg.', 'S11 · Caso real Cris parte 1', 'Amanhã eu termino a história. Vai te impactar.', '8', 'entregue', NULL, NULL, NULL, 'Story 8 · [INTERATIVO — Caixa de perguntas]
Pergunta: Você se reconhece em Cris?

(caixa de resposta livre)'),
(139, NULL, '2026-07-17', 'Sex', '08:00', 'Stories', 'Vídeo Ju', 'S12 · Caso real Cris parte 2', 'Continuando Cris. Identificamos: privação de sono crônica.', '1 de 5', 'a_produzir', NULL, 'FOLHA S12 · DIA 12 · CRIS PARTE 2 (SOLUÇÃO)
Quantidade de stories da Ju: 4 stories
Tom: Resolução. Tom muda de melancolia da história para luz no fim.

STORY 44
Ontem eu te contei sobre Cris.
Hoje eu termino a história.', NULL, 'DIA 12 — A SOLUÇÃO QUE FUNCIONOU PARA CRIS
Objetivo: fechar o arco da história. Antecipa a oferta do dia 13/14.

Story 1 · [JU GRAVA]
"Ontem eu te contei sobre Cris. Hoje eu termino a história."'),
(140, NULL, '2026-07-17', 'Sex', '11:00', 'Stories', 'Vídeo Ju', 'S12 · Caso real Cris parte 2', 'Mudamos UMA coisa. Não tudo. UMA coisa que protegeu o sono.', '2 de 5', 'a_produzir', NULL, 'STORY 45
Cris achava que precisava de mais método.
Mais foco.
Mais disciplina.
[PAUSA]
E foi exatamente o oposto que funcionou.', NULL, 'Story 2 · [JU GRAVA]
"Cris achava que precisava de mais método. Mais foco. Mais disciplina. E foi exatamente o oposto que funcionou."'),
(141, NULL, '2026-07-17', 'Sex', '13:30', 'Stories', 'Vídeo Ju', 'S12 · Caso real Cris parte 2', 'Em 6 semanas: Cris tinha começado o projeto.', '3 de 5', 'a_produzir', NULL, 'STORY 46
Cris começou pelo corpo.
Não pela cabeça.
Não pelo planejamento.
Não pela mentalidade.
[PAUSA LONGA]
Pelo combustível.', NULL, 'Story 3 · [JU GRAVA]
"Cris começou pelo corpo. Não pela cabeça. Não pelo planejamento. Não pela mentalidade. Pelo combustível."'),
(142, NULL, '2026-07-17', 'Sex', '17:30', 'Stories', 'Texto', 'S12 · Caso real Cris parte 2', 'Em 6 meses: entregue. E reconfigurado como pessoa.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Sono que restaura.
Alimentação que nutre.
Movimento que ativa.
Regulação que funciona.'),
(143, NULL, '2026-07-17', 'Sex', '20:00', 'Stories', 'Vídeo Ju', 'S12 · Caso real Cris parte 2', 'O destrave começou por DENTRO. O resto foi consequência.', '5 de 5', 'a_produzir', NULL, 'STORY 47
Em algumas semanas,
o Google Doc deixou de ser símbolo de derrota.
Voltou a ser projeto.', NULL, 'Story 5 · [JU GRAVA]
"Em algumas semanas, o Google Doc deixou de ser símbolo de derrota. Voltou a ser projeto."'),
(144, NULL, '2026-07-17', 'Sex', '20:00', 'Stories', 'Vídeo Ju', 'S12 · Caso real Cris parte 2', 'O destrave começou por DENTRO. O resto foi consequência.', '6', 'a_produzir', NULL, 'STORY 47 A
Não porque Cris achou disciplina nova.
Porque com o tanque cheio,
o que antes parecia montanha virou inclinação suportável.', NULL, 'Story 6 · [JU GRAVA]
"Não porque Cris achou disciplina nova. Porque com o tanque cheio, o que antes parecia montanha virou inclinação suportável."'),
(145, NULL, '2026-07-17', 'Sex', '20:00', 'Stories', 'Texto', 'S12 · Caso real Cris parte 2', 'O destrave começou por DENTRO. O resto foi consequência.', '7', 'entregue', NULL, NULL, NULL, 'Quem aplica método na ordem certa, vê resultado.
Ordem certa começa pela energia.'),
(146, NULL, '2026-07-17', 'Sex', '20:00', 'Stories', 'Vídeo Ju', 'S12 · Caso real Cris parte 2', 'O destrave começou por DENTRO. O resto foi consequência.', '8', 'a_produzir', NULL, 'STORY 48
Amanhã eu vou te oferecer
o ponto exato onde Cris começou.
E onde você pode começar também.', NULL, 'Story 8 · [JU GRAVA]
"Amanhã eu vou te oferecer o ponto exato onde Cris começou. E onde você pode começar também."'),
(147, NULL, '2026-07-18', 'Sáb', '08:00', 'Stories', 'Vídeo Ju', 'S13 · Primeiro convite ao Módulo Energia', 'Sábado. Hora de te convidar.', '1 de 5', 'a_produzir', NULL, 'FOLHA S13 · DIA 13 · PRIMEIRO CONVITE AO MÓDULO ENERGIA
Quantidade de stories da Ju: 5 stories
Tom: Oferta direta, sem hype. Quem está aquecido, compra. Quem não está, sem problema.

STORY 49
Hoje eu vou abrir uma janela.
Por 72 horas, você consegue entrar no Módulo Energia,
primeiro do Protocolo EPIC247, por R$97.', NULL, 'DIA 13 — PRIMEIRO CONVITE AO MÓDULO ENERGIA
Objetivo: primeira oferta direta. Quem está aquecido, compra.

Story 1 · [JU GRAVA]
"Hoje eu vou abrir uma janela. Por 72 horas, você consegue entrar no Módulo Energia, primeiro do Protocolo EPIC247, por R$97."'),
(148, NULL, '2026-07-18', 'Sáb', '11:00', 'Stories', 'Vídeo Ju', 'S13 · Primeiro convite ao Módulo Energia', 'Conheça o Módulo Energia. 8 semanas. Aplicado, não teórico.', '2 de 5', 'a_produzir', NULL, 'STORY 50
O Módulo Energia é onde Cris começou.
É onde a maioria das pessoas que destrava começa.
[PAUSA]
Porque sem energia,
nenhum outro módulo do método sustenta.', NULL, 'Story 2 · [JU GRAVA]
"O Módulo Energia é onde Cris começou. É onde a maioria das pessoas que destrava começa. Porque sem energia, nenhum outro módulo do método sustenta."'),
(149, NULL, '2026-07-18', 'Sáb', '13:30', 'Stories', 'Texto', 'S13 · Primeiro convite ao Módulo Energia', 'Detalhes: [link sticker pra página]', '3 de 5', 'entregue', NULL, NULL, NULL, '[— caixa visual]
O QUE ESTÁ DENTRO:
→ Manual de Energia Vital
→ Workbook prático
→ Livro Energia completo
→ Acesso vitalício
→ Garantia de 14 dias'),
(150, NULL, '2026-07-18', 'Sáb', '17:30', 'Stories', 'Vídeo Ju', 'S13 · Primeiro convite ao Módulo Energia', 'Vagas limitadas no próximo ciclo. Lista de espera no link.', '4 de 5', 'a_produzir', NULL, 'STORY 51
Não é curso de vídeo.
É infraestrutura.
Manual denso, exercícios práticos, livro de aprofundamento.
[PAUSA]
Tudo pra quem quer construir base,
não só consumir conteúdo.', NULL, 'Story 4 · [JU GRAVA]
"Não é curso de vídeo. É infraestrutura. Manual denso, exercícios práticos, livro de aprofundamento. Tudo pra quem quer construir base, não só consumir conteúdo."'),
(151, NULL, '2026-07-18', 'Sáb', '20:00', 'Stories', 'Texto', 'S13 · Primeiro convite ao Módulo Energia', 'Quem está na lista é avisado primeiro quando abre.', '5 de 5', 'entregue', NULL, NULL, NULL, 'R$97
Pagamento único.
Janela: 72 horas.'),
(152, NULL, '2026-07-18', 'Sáb', '20:00', 'Stories', 'Vídeo Ju', 'S13 · Primeiro convite ao Módulo Energia', 'Quem está na lista é avisado primeiro quando abre.', '6', 'a_produzir', NULL, 'STORY 52
Garantia incondicional de 14 dias.
Se não for pra você, devolvo.
Sem pergunta. Sem letra miúda.
[PAUSA LONGA]
O risco é meu. Não seu.', NULL, 'Story 6 · [JU GRAVA]
"Garantia incondicional de 14 dias. Se não for pra você, devolvo. Sem pergunta. Sem letra miúda. O risco é meu, não seu."'),
(153, NULL, '2026-07-18', 'Sáb', '20:00', 'Stories', 'Link Sticker', 'S13 · Primeiro convite ao Módulo Energia', 'Quem está na lista é avisado primeiro quando abre.', '7', 'entregue', NULL, NULL, NULL, 'QUERO O MÓDULO ENERGIA →
[link para a página de venda]'),
(154, NULL, '2026-07-18', 'Sáb', '20:00', 'Stories', 'Vídeo Ju', 'S13 · Primeiro convite ao Módulo Energia', 'Quem está na lista é avisado primeiro quando abre.', '8', 'a_produzir', NULL, 'STORY 53
Quem comprar hoje recebe acesso imediato.
Pode começar à noite.', NULL, 'Story 8 · [JU GRAVA]
"Quem comprar hoje recebe acesso imediato. Pode começar à noite."'),
(155, NULL, '2026-07-19', 'Dom', '08:00', 'Stories', 'Vídeo Ju', 'S14 · Reforço da oferta', 'Domingo. Última chance dessa janela específica de pré-vendas.', '1 de 5', 'a_produzir', NULL, 'FOLHA S14 · DIA 14 · REFORÇO DA OFERTA + URGÊNCIA REAL
Quantidade de stories da Ju: 4 stories
Tom: Calmo, sem manipulação. Apenas escassez verdadeira. Tom de "está aí, decide".

STORY 54
Lembrete:
a janela de R$97 fecha em 48 horas.
Depois, volta pro preço cheio.', NULL, 'DIA 14 — REFORÇO DA OFERTA + URGÊNCIA REAL
Objetivo: reforçar quem está em dúvida. Sem manipulação. Apenas escassez real.

Story 1 · [JU GRAVA]
"Lembrete: a janela de R$97 fecha em 48h. Depois, volta pro preço cheio."'),
(156, NULL, '2026-07-19', 'Dom', '11:00', 'Stories', 'Texto', 'S14 · Reforço da oferta', 'Não é truque de marketing. É limite real de capacidade.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Você não precisa estar pronto.
Não precisa estar certo.
Não precisa ter respondido todas as perguntas.'),
(157, NULL, '2026-07-19', 'Dom', '13:30', 'Stories', 'Texto', 'S14 · Reforço da oferta', 'Quem quer ser avisado primeiro: link na bio.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Precisa apenas de uma coisa que só você pode dar a si mesmo.
A decisão de partir.'),
(158, NULL, '2026-07-19', 'Dom', '17:30', 'Stories', 'Vídeo Ju', 'S14 · Reforço da oferta', 'Não consigo aceitar todo mundo. 40 vagas reais.', '4 de 5', 'a_produzir', NULL, 'STORY 55
Algumas das pessoas mais inteligentes que eu conheço
passaram 5 anos lendo sobre transformação.
[PAUSA]
E não começaram porque esperavam o momento perfeito.', NULL, 'Story 4 · [JU GRAVA]
"Algumas das pessoas mais inteligentes que eu conheço passaram 5 anos lendo sobre transformação. E não começaram porque esperavam o momento perfeito."'),
(159, NULL, '2026-07-19', 'Dom', '20:00', 'Stories', 'Vídeo Ju', 'S14 · Reforço da oferta', 'Amanhã começa uma semana intensa. Bloqueia tempo pra acompanhar.', '5 de 5', 'a_produzir', NULL, 'STORY 56
Nunca vai ser a hora perfeita.
[PAUSA LONGA]
A hora é essa.
Imperfeita, incerta, real.', NULL, 'Story 5 · [JU GRAVA]
"Nunca vai ser a hora perfeita. A hora é essa. Imperfeita, incerta, real."'),
(160, NULL, '2026-07-19', 'Dom', '20:00', 'Stories', 'Caixa Perg.', 'S14 · Reforço da oferta', 'Amanhã começa uma semana intensa. Bloqueia tempo pra acompanhar.', '6', 'entregue', NULL, NULL, NULL, 'Story 6 · [INTERATIVO — Caixa de perguntas]
Pergunta: O que ainda te trava de começar?

(caixa aberta para objeções reais)'),
(161, NULL, '2026-07-19', 'Dom', '20:00', 'Stories', 'Vídeo Ju', 'S14 · Reforço da oferta', 'Amanhã começa uma semana intensa. Bloqueia tempo pra acompanhar.', '7', 'a_produzir', NULL, 'STORY 57
Manda o que está te travando.
Eu respondo no story de amanhã.
[PAUSA]
Sem julgamento.', NULL, 'Story 7 · [JU GRAVA]
"Manda o que está te travando. Eu respondo no story de amanhã. Sem julgamento."'),
(162, NULL, '2026-07-19', 'Dom', '20:00', 'Stories', 'Link Sticker', 'S14 · Reforço da oferta', 'Amanhã começa uma semana intensa. Bloqueia tempo pra acompanhar.', '8', 'entregue', NULL, NULL, NULL, 'ENTRAR NO MÓDULO ENERGIA →
[link para a página de venda]
Janela fecha em 48h.'),
(163, NULL, '2026-07-20', 'Seg', '08:00', 'Stories', 'Texto', 'S15 · Provocação que ninguém faz', 'Hoje começa semana de provocações. Quem topar, fica.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Hoje começa uma semana de provocações. Vou fazer perguntas que você talvez nunca tenha feito pra si mesmo. Quem topar, fica.'),
(164, NULL, '2026-07-20', 'Seg', '11:00', 'Stories', 'Vídeo Ju', 'S15 · Provocação que ninguém faz', 'Pergunta inicial: por que tudo que você sabe ainda não tá sendo suficiente?', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Pergunta inicial: por que tudo que você sabe ainda não tá sendo suficiente? (vídeo 25s)'),
(165, NULL, '2026-07-20', 'Seg', '13:30', 'Stories', 'Caixa Perg.', 'S15 · Provocação que ninguém faz', 'Conta: qual a pergunta que você evita fazer pra si mesmo?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Me conta: qual a pergunta que você evita fazer a si mesmo?'),
(166, NULL, '2026-07-20', 'Seg', '17:30', 'Stories', 'Repost Feed', 'S15 · Provocação que ninguém faz', 'Saiu no feed agora. O reel mais difícil que já gravei.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'Saiu no feed agora. O reel mais difícil que já gravei. Vai com calma.'),
(167, NULL, '2026-07-20', 'Seg', '20:00', 'Stories', 'Texto', 'S15 · Provocação que ninguém faz', 'Pergunta da noite. Se você tivesse as últimas 8 semanas livres, o que mudaria?', '5 de 5', 'entregue', NULL, NULL, NULL, 'Pergunta da noite. Se você tivesse as últimas 8 semanas livres, o que mudaria? Honestidade, não fantasia.'),
(168, NULL, '2026-07-21', 'Ter', '08:00', 'Stories', 'Texto', 'S16 · Coach que não funciona', 'Hoje no feed: 6 conselhos de coach que NÃO funcionam pra Realizador Travado.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Hoje no feed: 6 conselhos de coach que NÃO funcionam pra Realizador Travado. Não é polêmica. É observação clínica.'),
(169, NULL, '2026-07-21', 'Ter', '11:00', 'Stories', 'Texto', 'S16 · Coach que não funciona', 'Esses conselhos têm 1 coisa em comum: foram desenhados pra outro tipo de pessoa.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Esses conselhos têm em comum 1 coisa: foram desenhados pra outro tipo de pessoa. E você acreditou que serviam.'),
(170, NULL, '2026-07-21', 'Ter', '13:30', 'Stories', 'Enquete', 'S16 · Coach que não funciona', 'Qual conselho mais te frustrou? (1) Acordar 5h (2) Visualize sucesso (3) Atitude positiva (4) Saia do conforto', '3 de 5', 'entregue', NULL, NULL, NULL, 'Qual conselho mais te frustrou? (1) Acorda 5h (2) Visualize o sucesso (3) Atitude positiva (4) Saia da zona de conforto'),
(171, NULL, '2026-07-21', 'Ter', '17:30', 'Stories', 'Repost Feed', 'S16 · Coach que não funciona', 'Vai no feed e lê com calma. Comenta o que mais te atingiu.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'Vai no feed e lê com calma. Comenta o que mais te atingiu.'),
(172, NULL, '2026-07-21', 'Ter', '20:00', 'Stories', 'Vídeo Ju', 'S16 · Coach que não funciona', 'Não é que esses conselhos são errados. É que foram aplicados na pessoa errada.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Não é que esses conselhos são errados. É que eles foram aplicados na pessoa errada. E essa pessoa é você. (vídeo 30s)'),
(173, NULL, '2026-07-22', 'Qua', '08:00', 'Stories', 'Vídeo Ju', 'S17 · Caixa aberta', 'Quero ouvir vocês hoje. Vou abrir a caixa.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Quero ouvir vocês hoje. Vou abrir a caixa. (vídeo 20s)'),
(174, NULL, '2026-07-22', 'Qua', '11:00', 'Stories', 'Caixa Perg.', 'S17 · Caixa aberta', 'Qual conselho de produtividade mais te frustrou? Anônimo. Manda.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Qual conselho de produtividade mais te frustrou? Anônimo. Manda.'),
(175, NULL, '2026-07-22', 'Qua', '13:30', 'Stories', 'Texto', 'S17 · Caixa aberta', 'Já recebi 80+ respostas. Tem padrão. Compartilho mais tarde.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Já recebi mais de 80 respostas. Tem padrão. Vou compartilhar mais tarde.'),
(176, NULL, '2026-07-22', 'Qua', '17:30', 'Stories', 'Texto', 'S17 · Caixa aberta', 'Os 3 mais citados: (1) Acordar mais cedo (2) Fazer journaling (3) Disciplina é tudo.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Os 3 conselhos mais citados foram: (1) Acordar mais cedo (2) Fazer journaling (3) Disciplina é tudo. Veja o que tenho a dizer sobre cada um.'),
(177, NULL, '2026-07-22', 'Qua', '20:00', 'Stories', 'Vídeo Ju', 'S17 · Caixa aberta', 'Por que esses 3 falham no Realizador Travado: você executa por força, não por sistema.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Por que esses 3 falham no Realizador Travado: você executa por força, não por sistema. Vou explicar amanhã. (vídeo 35s)'),
(178, NULL, '2026-07-23', 'Qui', '08:00', 'Stories', 'Texto', 'S18 · Preguiça é biologia', 'Spoiler do post de hoje: aquilo que você chama de preguiça é biologia.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Spoiler do post de hoje: aquilo que você chama de preguiça, na maioria dos casos, é biologia respondendo. Não é caráter.'),
(179, NULL, '2026-07-23', 'Qui', '11:00', 'Stories', 'Texto', 'S18 · Preguiça é biologia', 'Mecanismo: glicose baixa + cortisol alto + sono fragmentado = modo conservação.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Mecanismo simplificado: glicose baixa + cortisol alto + sono fragmentado = sistema entra em modo conservação. Você chama de preguiça. Seu corpo chama de sobrevivência.'),
(180, NULL, '2026-07-23', 'Qui', '13:30', 'Stories', 'Enquete', 'S18 · Preguiça é biologia', 'Você já se chamou de preguiçoso essa semana? Sim / Não', '3 de 5', 'entregue', NULL, NULL, NULL, 'Você já se chamou de preguiçoso/a essa semana? Sim / Não'),
(181, NULL, '2026-07-23', 'Qui', '17:30', 'Stories', 'Repost Feed', 'S18 · Preguiça é biologia', 'Carrossel saiu no feed. Lê com calma. 8 slides.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'O carrossel saiu no feed. Lê com calma. Tem 8 slides.'),
(182, NULL, '2026-07-23', 'Qui', '20:00', 'Stories', 'Vídeo Ju', 'S18 · Preguiça é biologia', 'Parar de se chamar de preguiçoso é o primeiro passo pra investigar de verdade.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Parar de se chamar de preguiçoso/a é o primeiro passo pra investigar de verdade. A culpa atrasa o diagnóstico. (vídeo 30s)'),
(183, NULL, '2026-07-24', 'Sex', '08:00', 'Stories', 'Texto', 'S19 · Peso dos cursos não terminados', 'Sexta. Quero falar do peso emocional dos cursos não terminados.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Sexta-feira. Quero falar de uma coisa que ninguém fala: o peso emocional dos cursos não terminados.'),
(184, NULL, '2026-07-24', 'Sex', '11:00', 'Stories', 'Vídeo Ju', 'S19 · Peso dos cursos não terminados', 'Cada curso comprado e não aplicado é boleto silencioso pra sua autoestima.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Cada curso comprado e não aplicado é um boleto silencioso pra sua autoestima. Acumula. (vídeo 25s)'),
(185, NULL, '2026-07-24', 'Sex', '13:30', 'Stories', 'Caixa Perg.', 'S19 · Peso dos cursos não terminados', 'Quantos cursos comprados nos últimos 24 meses? Quantos terminou?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Conta aqui: quantos cursos comprados nos últimos 24 meses? Quantos você terminou?'),
(186, NULL, '2026-07-24', 'Sex', '17:30', 'Stories', 'Texto', 'S19 · Peso dos cursos não terminados', 'Comum: comprei 4, terminei 1. Comprei 7, terminei 0. Você não tá sozinho.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Comum recebermos: comprei 4, terminei 1. Comprei 7, terminei 0. Você não tá sozinho. Mas isso precisa parar.'),
(187, NULL, '2026-07-24', 'Sex', '20:00', 'Stories', 'Texto', 'S19 · Peso dos cursos não terminados', 'Reflexão: antes do próximo curso, pergunta - ''se não conseguir aplicar esse, o que digo amanhã?''', '5 de 5', 'entregue', NULL, NULL, NULL, 'Reflexão de sexta. Antes de comprar o próximo curso, pergunta: "se eu não conseguir aplicar esse, o que dizer pra mim mesmo amanhã?" Se a resposta for ruim, NÃO COMPRE.'),
(188, NULL, '2026-07-25', 'Sáb', '08:00', 'Stories', 'Vídeo Ju', 'S20 · Bastidor caso da semana', 'Sábado de bastidor. Atendi essa semana uma pessoa que me marcou.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Sábado. Dia de bastidor. Atendi essa semana uma pessoa que me marcou. Vou contar. (vídeo 30s, anônimo)'),
(189, NULL, '2026-07-25', 'Sáb', '11:00', 'Stories', 'Texto', 'S20 · Bastidor caso da semana', 'Ela tinha 14 cursos pagos. Aplicado: 0. Idade 38. Paralisia decisional crônica.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Ela tinha 14 cursos pagos. Aplicado: 0. Idade: 38. Sintoma: paralisia decisional crônica.'),
(190, NULL, '2026-07-25', 'Sáb', '13:30', 'Stories', 'Texto', 'S20 · Bastidor caso da semana', 'Primeira sessão: 40min justificando os 14 cursos como ''informação valiosa''.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Primeira sessão: ela passou 40 minutos justificando os 14 cursos. Apresentando como "informação valiosa pro futuro."'),
(191, NULL, '2026-07-25', 'Sáb', '17:30', 'Stories', 'Texto', 'S20 · Bastidor caso da semana', 'Eu disse: ''esses cursos são defesa contra desconforto de não saber se você é capaz.''', '4 de 5', 'entregue', NULL, NULL, NULL, 'Eu disse: "esses cursos são uma defesa contra o desconforto de não saber se você é capaz." Ela chorou.'),
(192, NULL, '2026-07-25', 'Sáb', '20:00', 'Stories', 'Vídeo Ju', 'S20 · Bastidor caso da semana', 'Aquilo que parecia compromisso, era proteção. Você já fez isso?', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Aquilo que parecia compromisso com aprendizado, era proteção contra falha. Você já fez isso? (vídeo 35s)'),
(193, NULL, '2026-07-26', 'Dom', '08:00', 'Stories', 'Texto', 'S21 · Convite ao quiz', 'Domingo. Hora de pausar provocação e dar ferramenta concreta.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Domingo. Hora de pausar a provocação e dar uma ferramenta concreta.'),
(194, NULL, '2026-07-26', 'Dom', '11:00', 'Stories', 'Link Sticker', 'S21 · Convite ao quiz', 'Já fez o diagnóstico dos 5 Drenos? 90 segundos. [link]', '2 de 5', 'entregue', NULL, NULL, NULL, 'Já fez o diagnóstico dos 5 Drenos? Leva 90 segundos. [link sticker para quiz]'),
(195, NULL, '2026-07-26', 'Dom', '13:30', 'Stories', 'Texto', 'S21 · Convite ao quiz', 'Quem fez essa semana, me conta o dreno nos comentários. Tem padrão.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Quem fez essa semana, me conta o dreno dominante nos comentários. Tem padrão que estou observando.'),
(196, NULL, '2026-07-26', 'Dom', '17:30', 'Stories', 'Vídeo Ju', 'S21 · Convite ao quiz', 'O resultado do quiz não é veredito. É ponto de partida. Não treme.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'O resultado do quiz não é um veredito. É um ponto de partida. Não treme. (vídeo 20s)'),
(197, NULL, '2026-07-26', 'Dom', '20:00', 'Stories', 'Link Sticker', 'S21 · Convite ao quiz', 'Última chance da semana. Amanhã nova fase. [link]', '5 de 5', 'entregue', NULL, NULL, NULL, 'Última chance da semana de fazer o quiz. Amanhã começa uma nova fase de conteúdo. [link sticker]'),
(198, NULL, '2026-07-27', 'Seg', '08:00', 'Stories', 'Texto', 'S22 · 4 princípios na prática', 'Saiu no feed: 4 princípios que mudam como você executa.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Saiu no feed: os 4 princípios que mudam como você executa. Não são frases motivacionais. São observações comportamentais.'),
(199, NULL, '2026-07-27', 'Seg', '11:00', 'Stories', 'Texto', 'S22 · 4 princípios na prática', 'Princípio 1: você não muda comportamento. Você muda contexto.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Princípio 1: você não muda comportamento. Você muda contexto. O resto é consequência.'),
(200, NULL, '2026-07-27', 'Seg', '13:30', 'Stories', 'Enquete', 'S22 · 4 princípios na prática', 'Qual princípio mais te chamou atenção? Comenta o número (1, 2, 3 ou 4)', '3 de 5', 'entregue', NULL, NULL, NULL, 'Qual princípio mais te chamou atenção? Comenta o número (1, 2, 3 ou 4)'),
(201, NULL, '2026-07-27', 'Seg', '17:30', 'Stories', 'Repost Feed', 'S22 · 4 princípios na prática', 'Volta no carrossel. Esses 4 são fundação.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'Volta no carrossel. Lê de novo. Esses 4 princípios são fundação pra tudo.'),
(202, NULL, '2026-07-27', 'Seg', '20:00', 'Stories', 'Vídeo Ju', 'S22 · 4 princípios na prática', 'Quem aplicar UM princípio em 7 dias, manda DM contando o resultado.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Quem aplicar UM princípio nos próximos 7 dias, manda DM contando o resultado. Eu leio todos. (vídeo 25s)'),
(203, NULL, '2026-07-28', 'Ter', '08:00', 'Stories', 'Texto', 'S23 · Identidade antes de comportamento', 'Reel hoje: identidade antes de comportamento. Sem esse, você fica em ''executar mais''.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Reel de hoje: identidade antes de comportamento. Se você pular esse, mostra que ainda tá na fase de "executar mais".'),
(204, NULL, '2026-07-28', 'Ter', '11:00', 'Stories', 'Vídeo Ju', 'S23 · Identidade antes de comportamento', 'A pergunta certa não é ''o que devo fazer?'' É ''que tipo de pessoa estou me tornando?''', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'A pergunta certa não é "o que devo fazer?" É "que tipo de pessoa estou me tornando?" (vídeo 30s)'),
(205, NULL, '2026-07-28', 'Ter', '13:30', 'Stories', 'Caixa Perg.', 'S23 · Identidade antes de comportamento', 'Caixa: descreva-se em 5 palavras hoje. E em 5 palavras daqui 1 ano.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Hoje a caixa é: "se você tivesse que se descrever em 5 palavras hoje, e em 5 palavras daqui a 1 ano, quais seriam?"'),
(206, NULL, '2026-07-28', 'Ter', '17:30', 'Stories', 'Texto', 'S23 · Identidade antes de comportamento', 'Recebi 50+ respostas. A palavra que se repete: ENERGIA.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Recebi 50+ respostas. A maior diferença está na palavra ENERGIA. Quase todos colocam "energia" na lista de 1 ano à frente.'),
(207, NULL, '2026-07-28', 'Ter', '20:00', 'Stories', 'Vídeo Ju', 'S23 · Identidade antes de comportamento', 'Você não vai manter hábito de identidade que não acredita ter. Não brigue. Use.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Você não vai conseguir manter um hábito que pertence a uma identidade que você não acredita ter. Não brigue com isso. Use isso. (vídeo 30s)'),
(208, NULL, '2026-07-29', 'Qua', '08:00', 'Stories', 'Texto', 'S24 · Mapa do EPIC247', 'Hoje saiu o mapa COMPLETO do método. Carrossel C09.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Hoje saiu no feed o mapa COMPLETO do método EPIC247. 10 etapas. Carrossel C09.'),
(209, NULL, '2026-07-29', 'Qua', '11:00', 'Stories', 'Vídeo Ju', 'S24 · Mapa do EPIC247', 'Por que 10 etapas? Cada uma resolve uma camada. Pular etapas = recidiva.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Por que 10 etapas? Cada etapa resolve uma camada diferente do problema. Pular etapas = recidiva garantida. (vídeo 30s)'),
(210, NULL, '2026-07-29', 'Qua', '13:30', 'Stories', 'Enquete', 'S24 · Mapa do EPIC247', 'Em qual etapa você se vê? (1-3) Energia/Mentalidade/Auto (4-6) Felicidade/Plano/Coragem (7-10) Ação/Inteligência/Excelência/Amor', '3 de 5', 'entregue', NULL, NULL, NULL, 'Em qual etapa você se vê hoje? (1-3) Energia/Mentalidade/Autoconhecimento (4-6) Felicidade/Planejamento/Coragem (7-10) Ação/Inteligência/Excelência/Amor'),
(211, NULL, '2026-07-29', 'Qua', '17:30', 'Stories', 'Repost Feed', 'S24 · Mapa do EPIC247', 'Volta no carrossel. Identifica sua etapa. Salva.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'Volta no carrossel. Identifica sua etapa. Salva pra revisitar.'),
(212, NULL, '2026-07-29', 'Qua', '20:00', 'Stories', 'Texto', 'S24 · Mapa do EPIC247', 'Vou abrir vagas próximas semanas. Quem quer ser avisado, comenta SIM.', '5 de 5', 'entregue', NULL, NULL, NULL, 'Vou abrir vagas pra o próximo ciclo nas próximas semanas. Quem quer ser avisado primeiro, comenta SIM no carrossel.'),
(213, NULL, '2026-07-30', 'Qui', '08:00', 'Stories', 'Vídeo Ju', 'S25 · Mínimo viável', 'Reel hoje: mínimo viável vence ideal abandonado. Vai doer.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Reel de hoje: mínimo viável vence ideal abandonado. Se você é Realizador Travado, essa frase vai doer. (vídeo 20s)'),
(214, NULL, '2026-07-30', 'Qui', '11:00', 'Stories', 'Texto', 'S25 · Mínimo viável', '3 minutos/dia > 30 minutos uma vez/mês. Consistência baixa supera intensidade isolada.', '2 de 5', 'entregue', NULL, NULL, NULL, 'A matemática não engana: 3 minutos por dia > 30 minutos uma vez por mês. Consistência baixa supera intensidade isolada.'),
(215, NULL, '2026-07-30', 'Qui', '13:30', 'Stories', 'Caixa Perg.', 'S25 · Mínimo viável', 'Conta: qual hábito tentou (e abandonou) por ser AMBICIOSO demais?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Conta aqui: qual hábito você tentou (e abandonou) por ter sido AMBICIOSO demais?'),
(216, NULL, '2026-07-30', 'Qui', '17:30', 'Stories', 'Texto', 'S25 · Mínimo viável', 'Mais comuns: meditação (queria 20min). Exercício (queria 1h). Leitura (queria 30pg). Padrão.', '4 de 5', 'entregue', NULL, NULL, NULL, 'As respostas mais comuns: meditação (queria 20min, fazia 0). Exercício (queria 1h, fazia 0). Leitura (queria 30 páginas, lia 0). Padrão claro.'),
(217, NULL, '2026-07-30', 'Qui', '20:00', 'Stories', 'Vídeo Ju', 'S25 · Mínimo viável', 'Pra essa semana: corta seu ideal pela metade. Aplica essa versão por 7 dias.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Pra essa semana: corta seu ideal pela metade. Depois pela metade de novo. Aplica essa versão por 7 dias. Cumprida, conversamos. (vídeo 25s)'),
(218, NULL, '2026-07-31', 'Sex', '08:00', 'Stories', 'Vídeo Ju', 'S26 · Energia é tudo', 'Toda viagem começa no posto de gasolina. Reel mais didático que gravei.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Toda viagem começa no posto de gasolina. Saiu no feed. Reel mais didático que já gravei. (vídeo 15s)'),
(219, NULL, '2026-07-31', 'Sex', '11:00', 'Stories', 'Texto', 'S26 · Energia é tudo', 'Sem combustível, nada anda. Não é metáfora. É biologia. Glicose, oxigênio, ATP.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Sem combustível, nada anda. Não é metáfora. É biologia. Glicose, oxigênio, ATP. Sem isso, seu cérebro racional desliga.'),
(220, NULL, '2026-07-31', 'Sex', '13:30', 'Stories', 'Enquete', 'S26 · Energia é tudo', 'Sua energia hoje, de 1 a 10? (E sabe o porquê do número?)', '3 de 5', 'entregue', NULL, NULL, NULL, 'Sua energia hoje, de 1 a 10? (E você sabe o porquê do número?)'),
(221, NULL, '2026-07-31', 'Sex', '17:30', 'Stories', 'Texto', 'S26 · Energia é tudo', 'Maioria respondeu 4-6. Mediana 5. Por que aceitamos viver com 5?', '4 de 5', 'entregue', NULL, NULL, NULL, 'Maioria respondeu entre 4 e 6. Mediana 5. A pergunta importante: por que aceitamos viver com 5 quando podemos viver com 8?'),
(222, NULL, '2026-07-31', 'Sex', '20:00', 'Stories', 'Vídeo Ju', 'S26 · Energia é tudo', 'Energia não é privilégio. É infraestrutura. E infraestrutura se constrói.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Energia não é privilégio. É infraestrutura. E infraestrutura se constrói. (vídeo 30s)'),
(223, NULL, '2026-08-01', 'Sáb', '08:00', 'Stories', 'Vídeo Ju', 'S27 · Você está na garagem', 'Sábado. Quero te fazer uma reflexão. Reel no feed.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Sábado de manhã. Quero te fazer uma reflexão. Reel saiu no feed. (vídeo 20s)'),
(224, NULL, '2026-08-01', 'Sáb', '11:00', 'Stories', 'Texto', 'S27 · Você está na garagem', 'Você está na garagem. Carro parado. GPS pronto. Mala no porta-malas. O que espera?', '2 de 5', 'entregue', NULL, NULL, NULL, 'Você está na garagem. O carro está parado. O endereço está no GPS. A mala está no porta-malas. O que está esperando?'),
(225, NULL, '2026-08-01', 'Sáb', '13:30', 'Stories', 'Caixa Perg.', 'S27 · Você está na garagem', 'Manda: o que está te impedindo de girar a chave?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Manda: o que está te impedindo de girar a chave?'),
(226, NULL, '2026-08-01', 'Sáb', '17:30', 'Stories', 'Texto', 'S27 · Você está na garagem', '80+ respostas. Padrão: ''medo de descobrir que não sou capaz''. É exatamente o que prende.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Recebi 80+ respostas. Padrão: "medo de descobrir que não sou capaz". É exatamente o que prende.'),
(227, NULL, '2026-08-01', 'Sáb', '20:00', 'Stories', 'Vídeo Ju', 'S27 · Você está na garagem', 'Quem nunca girou a chave, vive achando que talvez. Talvez é o pior lugar pra viver.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Quem nunca girou a chave, nunca soube. Quem nunca soube, vive achando que talvez. E talvez é o pior lugar do mundo pra viver. (vídeo 35s)'),
(228, NULL, '2026-08-02', 'Dom', '08:00', 'Stories', 'Texto', 'S28 · Pré-convite Módulo Energia', 'Domingo. Quero te avisar antes da próxima semana.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Domingo. Quero te avisar uma coisa antes da próxima semana.'),
(229, NULL, '2026-08-02', 'Dom', '11:00', 'Stories', 'Vídeo Ju', 'S28 · Pré-convite Módulo Energia', 'Próximo mês: vou abrir vagas pro Módulo Energia. Lista de espera é avisada primeiro.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Próximo mês: vou abrir vagas pro Módulo Energia (módulo 1 do EPIC247). Quem está na lista de espera é avisado primeiro. (vídeo 25s)'),
(230, NULL, '2026-08-02', 'Dom', '13:30', 'Stories', 'Link Sticker', 'S28 · Pré-convite Módulo Energia', 'Pra entrar na lista, faz o diagnóstico no link [LS]. Prioridade + pré-venda.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Pra entrar na lista, faz o diagnóstico dos 5 Drenos no link [link sticker]. Quem está na lista, tem preço de pré-venda e prioridade.'),
(231, NULL, '2026-08-02', 'Dom', '17:30', 'Stories', 'Texto', 'S28 · Pré-convite Módulo Energia', 'Não é truque. É limite real. 40 vagas no próximo ciclo.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Não é truque de marketing. É limite real de capacidade de acompanhamento. Vou aceitar 40 pessoas no próximo ciclo.'),
(232, NULL, '2026-08-02', 'Dom', '20:00', 'Stories', 'Link Sticker', 'S28 · Pré-convite Módulo Energia', 'Última chance hoje. Lista no link. [LS]', '5 de 5', 'entregue', NULL, NULL, NULL, 'Última chance hoje. Lista de espera no link da bio. Amanhã começa uma semana intensa de conteúdo. [link sticker]'),
(233, NULL, '2026-08-03', 'Seg', '08:00', 'Stories', 'Texto', 'S29 · Abertura da semana', 'Nova semana. Quem está há semanas comigo, segura.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Nova semana, nova fase. Vamos pra dentro do método. Quem está há semanas comigo, segura.'),
(234, NULL, '2026-08-03', 'Seg', '11:00', 'Stories', 'Vídeo Ju', 'S29 · Abertura da semana', 'Próximas 4 semanas: mais cases, mais ciência, 3 LIVES. Anota: 13/8, 20/8, 27/8.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'As próximas 4 semanas: mais cases reais, mais ciência aplicada, 3 lives ao vivo. Anota: 13/8, 20/8, 27/8. (vídeo 30s)'),
(235, NULL, '2026-08-03', 'Seg', '13:30', 'Stories', 'Enquete', 'S29 · Abertura da semana', 'Você participa das lives? Sim ao vivo / Só depois / Não sei', '3 de 5', 'entregue', NULL, NULL, NULL, 'Você consegue participar das lives? Sim, ao vivo / Só assisto depois / Não sei ainda'),
(236, NULL, '2026-08-03', 'Seg', '17:30', 'Stories', 'Texto', 'S29 · Abertura da semana', 'Saiu no feed: F20, ''Você está na garagem''. Lê com calma.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Saiu no feed: Reel F20, "Você está na garagem". O reel que mais me afeta gravar. Lê com calma.'),
(237, NULL, '2026-08-03', 'Seg', '20:00', 'Stories', 'Vídeo Ju', 'S29 · Abertura da semana', 'Hoje começou um ciclo. Ciclos só transformam quem entra.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Hoje começou um ciclo. E ciclos só transformam quem entra. (vídeo 20s)'),
(238, NULL, '2026-08-04', 'Ter', '08:00', 'Stories', 'Texto', 'S30 · Cafeína', 'Reel sem rosto: Cafeína das 18h. Curto, importante.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Reel sem rosto saiu no feed. Cafeína das 18h. Curto mas importante.'),
(239, NULL, '2026-08-04', 'Ter', '11:00', 'Stories', 'Texto', 'S30 · Cafeína', 'Cafeína das 18h ainda ativa às 24h. Você acha que descansa. Cérebro em alerta.', '2 de 5', 'entregue', NULL, NULL, NULL, 'A cafeína que você toma às 18h ainda está ativa às 24h. Você acha que está descansando. Seu cérebro está em alerta.'),
(240, NULL, '2026-08-04', 'Ter', '13:30', 'Stories', 'Enquete', 'S30 · Cafeína', 'Último café do dia? Antes 12h / 12-15h / Depois 15h / Antes de dormir', '3 de 5', 'entregue', NULL, NULL, NULL, 'A que horas você toma seu último café? Antes das 12h / Entre 12h-15h / Depois das 15h / Antes de dormir'),
(241, NULL, '2026-08-04', 'Ter', '17:30', 'Stories', 'Texto', 'S30 · Cafeína', '47% respondeu ''Depois das 15h''. Esse grupo reclama ''não desligar a noite''. Conexão direta.', '4 de 5', 'entregue', NULL, NULL, NULL, '47% responderam "Depois das 15h". Esse é o grupo que reclama de "não conseguir desligar a cabeça à noite". Conexão direta.'),
(242, NULL, '2026-08-04', 'Ter', '20:00', 'Stories', 'Vídeo Ju', 'S30 · Cafeína', 'Teste: corta café depois das 14h por 7 dias. Não notar diferença, eu pago o café.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Teste: corte cafeína depois das 14h por 7 dias. Se não notar diferença, eu pago seu café. (humor) (vídeo 25s)'),
(243, NULL, '2026-08-05', 'Qua', '08:00', 'Stories', 'Repost Feed', 'S31 · Repost 5 Drenos', 'Republicando 5 Drenos hoje. Muita gente nova chegou. Esse é o ponto de partida.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Republicando os 5 Drenos hoje. Tem muita gente nova que chegou esse mês. Esse é o ponto de partida.'),
(244, NULL, '2026-08-05', 'Qua', '11:00', 'Stories', 'Link Sticker', 'S31 · Repost 5 Drenos', 'Não fez o quiz? Faz agora. 90 segundos. [LS]', '2 de 5', 'entregue', NULL, NULL, NULL, 'Não fez o quiz ainda? Faz agora. 90 segundos. [link sticker]'),
(245, NULL, '2026-08-05', 'Qua', '13:30', 'Stories', 'Enquete', 'S31 · Repost 5 Drenos', 'Qual é o seu dominante? Sono / Glicose / Estresse / Sedentarismo / Solidão', '3 de 5', 'entregue', NULL, NULL, NULL, 'Qual é o seu dreno dominante? Sono / Glicose / Estresse / Sedentarismo / Solidão'),
(246, NULL, '2026-08-05', 'Qua', '17:30', 'Stories', 'Texto', 'S31 · Repost 5 Drenos', 'Mais votados: 1º Sono. 2º Estresse. 3º Glicose. Padrão claro do ICP brasileiro.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Os mais votados: 1º Sono. 2º Estresse. 3º Glicose. Tem padrão: o ICP brasileiro tem perfil claro.'),
(247, NULL, '2026-08-05', 'Qua', '20:00', 'Stories', 'Vídeo Ju', 'S31 · Repost 5 Drenos', 'À noite: carrossel novo. 5 mitos sobre energia. Lê depois e me diz qual ainda acreditava.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Outro carrossel novo hoje: 5 mitos sobre energia. Lê e me diz qual ainda achava verdade. (vídeo 20s)'),
(248, NULL, '2026-08-06', 'Qui', '08:00', 'Stories', 'Vídeo Ju', 'S32 · Garagem narrado', 'Reel narrado no feed. Versão cinematográfica. Fone no ouvido.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Reel sem rosto narrado no feed. Versão mais cinematográfica do "Você está na garagem". Fone no ouvido.'),
(249, NULL, '2026-08-06', 'Qui', '11:00', 'Stories', 'Texto', 'S32 · Garagem narrado', 'Esse reel foi pensado pra te alcançar quando você está sozinho/a com você mesmo/a.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Esse reel é diferente. Faz aos 23h, com luz baixa. Ele foi pensado pra te alcançar quando você está sozinho/a com você mesmo/a.'),
(250, NULL, '2026-08-06', 'Qui', '13:30', 'Stories', 'Caixa Perg.', 'S32 · Garagem narrado', 'Conta: o que sentiu vendo? Sem filtro.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Conta: o que você sentiu vendo? Sem filtro.'),
(251, NULL, '2026-08-06', 'Qui', '17:30', 'Stories', 'Texto', 'S32 · Garagem narrado', 'Recebi mensagens emocionadas. Tem gente chorando. Tem gente decidindo girar a chave hoje.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Recebi mensagens emocionadas. Tem gente chorando. Tem gente decidindo girar a chave hoje. Eu leio tudo.'),
(252, NULL, '2026-08-06', 'Qui', '20:00', 'Stories', 'Vídeo Ju', 'S32 · Garagem narrado', 'Se algum reel meu vai mudar algo em você, esse é provavelmente esse. Veja com calma.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Se algum reel meu vai mudar algo em você, esse é provavelmente esse. Veja com calma. (vídeo 20s)'),
(253, NULL, '2026-08-07', 'Sex', '08:00', 'Stories', 'Texto', 'S33 · FA01 garagem', 'Sexta. Post de Texto no feed. Frase única, legenda Lisa Cron.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Sexta-feira. Saiu no feed um Post de Texto. Frase única. Legenda longa em formato Lisa Cron.'),
(254, NULL, '2026-08-07', 'Sex', '11:00', 'Stories', 'Texto', 'S33 · FA01 garagem', '''Você está na garagem. A chave está na sua mão.'' Descrição literal do que você sente.', '2 de 5', 'entregue', NULL, NULL, NULL, '"Você está na garagem. A chave está na sua mão." Não é metáfora. É descrição literal de uma porção grande do que você sente.'),
(255, NULL, '2026-08-07', 'Sex', '13:30', 'Stories', 'Enquete', 'S33 · FA01 garagem', 'Se reconheceu na cena? Quarta às 23h47, abrindo o documento. Totalmente / Parcial / Não', '3 de 5', 'entregue', NULL, NULL, NULL, 'Você se reconheceu na cena? (Quarta às 23h47, abrindo o documento de novo) Totalmente / Parcialmente / Não me reconheço'),
(256, NULL, '2026-08-07', 'Sex', '17:30', 'Stories', 'Repost Feed', 'S33 · FA01 garagem', 'Volta no post. Lê a legenda inteira.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'Volta no post. Lê a legenda inteira. Vai te marcar.'),
(257, NULL, '2026-08-07', 'Sex', '20:00', 'Stories', 'Vídeo Ju', 'S33 · FA01 garagem', 'Coragem não é ausência de medo. É presença da ação apesar do medo.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'A coragem não é a ausência de medo. É a presença da ação apesar do medo. Sexta-feira boa pra te lembrar disso. (vídeo 25s)'),
(258, NULL, '2026-08-08', 'Sáb', '08:00', 'Stories', 'Texto', 'S34 · FA02 combustível', 'Sábado. Post de Texto: ''Sem combustível, nada anda.'' Vai com calma.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Sábado. Post de Texto no feed: "Sem combustível, nada anda." Vai com calma na legenda.'),
(259, NULL, '2026-08-08', 'Sáb', '11:00', 'Stories', 'Vídeo Ju', 'S34 · FA02 combustível', 'Segunda de manhã. Notebook aberto. Palavras embaralham. Não é burrice. É tanque vazio.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Bom dia de segunda. Você abre o notebook. As palavras embaralham. Você não é burro/a. Tá sem combustível. (vídeo 25s)'),
(260, NULL, '2026-08-08', 'Sáb', '13:30', 'Stories', 'Enquete', 'S34 · FA02 combustível', 'Como acordou hoje? Restaurado/a / OK / Cansado/a / Exausto/a', '3 de 5', 'entregue', NULL, NULL, NULL, 'Como você acordou hoje? Restaurado/a / OK / Cansado/a / Exausto/a'),
(261, NULL, '2026-08-08', 'Sáb', '17:30', 'Stories', 'Texto', 'S34 · FA02 combustível', 'Maioria: Cansado/a ou Exausto/a. Sábado. Quando supostamente é descanso. Não bate.', '4 de 5', 'entregue', NULL, NULL, NULL, 'A maioria respondeu "Cansado/a" ou "Exausto/a". Sábado. Quando supostamente é dia de descanso. Algo não bate.'),
(262, NULL, '2026-08-08', 'Sáb', '20:00', 'Stories', 'Vídeo Ju', 'S34 · FA02 combustível', 'O cansaço não é da segunda. É de décadas. Só se trata com infraestrutura, não energético.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'O cansaço não é da segunda-feira. É das décadas. E só se trata com infraestrutura, não com energético. (vídeo 30s)'),
(263, NULL, '2026-08-09', 'Dom', '08:00', 'Stories', 'Texto', 'S35 · Recap + bastidor', 'Domingo. Sem feed. Vou recapitular e mostrar bastidor.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Domingo. Sem post no feed hoje. Só stories. Vou aproveitar pra recapitular e mostrar bastidor.'),
(264, NULL, '2026-08-09', 'Dom', '11:00', 'Stories', 'Vídeo Ju', 'S35 · Recap + bastidor', 'Trabalhei 47h essa semana. 14 pacientes. 9 reels. Hoje, NADA. Parte do plano.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Essa semana eu trabalhei 47 horas. Atendi 14 pacientes. Gravei 9 reels. Hoje, faço NADA. E é parte do plano. (vídeo 25s)'),
(265, NULL, '2026-08-09', 'Dom', '13:30', 'Stories', 'Texto', 'S35 · Recap + bastidor', 'Pra Realizador Travado: descansar sem culpa é habilidade. Hoje vou treinar a minha.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Pra Realizador Travado: descansar sem culpa é uma habilidade que precisa ser treinada. Hoje vou treinar a minha. Você devia treinar a sua.'),
(266, NULL, '2026-08-09', 'Dom', '17:30', 'Stories', 'Caixa Perg.', 'S35 · Recap + bastidor', 'Caixa: o que gostaria que eu trouxesse próxima semana? Tema, dúvida, formato.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Caixa: o que você gostaria que eu trouxesse na próxima semana? Tema, dúvida, formato.'),
(267, NULL, '2026-08-09', 'Dom', '20:00', 'Stories', 'Texto', 'S35 · Recap + bastidor', 'Amanhã começa semana com LIVE quinta 20h. Tema: 5 Drenos. Bloqueia.', '5 de 5', 'entregue', NULL, NULL, NULL, 'Amanhã começa uma semana com LIVE quinta-feira 20h. Anota. Vai ser sobre os 5 Drenos. Trazendo a Ju ao vivo.'),
(268, NULL, '2026-08-10', 'Seg', '08:00', 'Stories', 'Repost Feed', 'S36 · Repost 7 sinais', 'Republicando 7 sinais hoje. Quem chegou esse mês, esse é o post fundador.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Republicando "7 sinais de Trava Mental Racional" hoje. Quem chegou esse mês, esse é o post fundador.'),
(269, NULL, '2026-08-10', 'Seg', '11:00', 'Stories', 'Texto', 'S36 · Repost 7 sinais', 'À noite: carrossel NOVO. Primeiros Depoimentos. Pessoas reais, 30 dias aplicando.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Mais tarde sai um carrossel NOVO: "Primeiros Depoimentos". Pessoas reais que aplicaram o método nos primeiros 30 dias.'),
(270, NULL, '2026-08-10', 'Seg', '13:30', 'Stories', 'Enquete', 'S36 · Repost 7 sinais', 'Quantos dos 7 sinais você se reconheceu? 0-2 / 3-4 / 5-6 / Todos', '3 de 5', 'entregue', NULL, NULL, NULL, 'Quantos dos 7 sinais você se reconheceu? 0-2 / 3-4 / 5-6 / Todos'),
(271, NULL, '2026-08-10', 'Seg', '17:30', 'Stories', 'Texto', 'S36 · Repost 7 sinais', '71% marcaram ''5-6'' ou ''Todos''. Você não é exceção. É maioria. E é reconfortante.', '4 de 5', 'entregue', NULL, NULL, NULL, '71% marcaram "5-6" ou "Todos". Você não é a exceção. Você é a maioria. E isso é estranhamente reconfortante.'),
(272, NULL, '2026-08-10', 'Seg', '20:00', 'Stories', 'Vídeo Ju', 'S36 · Repost 7 sinais', 'Depoimentos novos no feed. Lê e diz qual te atingiu mais.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Depoimentos novos hoje no feed. Vai ler. E me diz qual mais te atingiu. (vídeo 20s)'),
(273, NULL, '2026-08-11', 'Ter', '08:00', 'Stories', 'Texto', 'S37 · FA03 não está cansado', 'Post de Texto: ''Você não está cansado porque é fraco.'' Leia inteiro.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Post de Texto hoje: "Você não está cansado porque é fraco." Legenda longa. Leia inteiro.'),
(274, NULL, '2026-08-11', 'Ter', '11:00', 'Stories', 'Vídeo Ju', 'S37 · FA03 não está cansado', 'Essa frase precisa entrar ANTES de conversa sobre disciplina. Senão você briga com você mesmo.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Essa frase precisa entrar ANTES de qualquer conversa sobre disciplina. Senão você vai brigar com você mesmo a vida toda. (vídeo 30s)'),
(275, NULL, '2026-08-11', 'Ter', '13:30', 'Stories', 'Enquete', 'S37 · FA03 não está cansado', 'Já se chamou de fraco/a no último mês? Sim / Não', '3 de 5', 'entregue', NULL, NULL, NULL, 'Você já se chamou de fraco/a no último mês? Sim / Não'),
(276, NULL, '2026-08-11', 'Ter', '17:30', 'Stories', 'Texto', 'S37 · FA03 não está cansado', '84% respondeu ''Sim''. Primeira coisa que precisa mudar: não a rotina, a linguagem interna.', '4 de 5', 'entregue', NULL, NULL, NULL, '84% responderam "Sim". E essa é a primeira coisa que precisa mudar. Não a rotina. A linguagem interna.'),
(277, NULL, '2026-08-11', 'Ter', '20:00', 'Stories', 'Vídeo Ju', 'S37 · FA03 não está cansado', 'Quinta tem live 20h. 5 Drenos ao vivo. Reserva o horário.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Quinta tem live às 20h. Tema: Os 5 Drenos ao vivo. Tira dúvida ao vivo. Reserva o horário. (vídeo 20s)'),
(278, NULL, '2026-08-12', 'Qua', '08:00', 'Stories', 'Texto', 'S38 · FA04 infraestrutura', 'Outro Post de Texto: ''Você não precisa de mais inspiração. Precisa de infraestrutura.''', '1 de 5', 'entregue', NULL, NULL, NULL, 'Outro Post de Texto: "Você não precisa de mais inspiração. Precisa de infraestrutura."'),
(279, NULL, '2026-08-12', 'Qua', '11:00', 'Stories', 'Vídeo Ju', 'S38 · FA04 infraestrutura', 'Inspiração é combustível. Infraestrutura é motor. Sem motor, combustível derrama.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Inspiração é combustível. Infraestrutura é motor. Sem motor, combustível derrama. Sem combustível, motor para. Você precisa dos dois. (vídeo 30s)'),
(280, NULL, '2026-08-12', 'Qua', '13:30', 'Stories', 'Caixa Perg.', 'S38 · FA04 infraestrutura', 'Caixa: qual a primeira pergunta que quer fazer pra mim na live amanhã?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Caixa: qual é a primeira pergunta que você quer fazer pra mim na live de amanhã?'),
(281, NULL, '2026-08-12', 'Qua', '17:30', 'Stories', 'Texto', 'S38 · FA04 infraestrutura', 'Já chegaram 40 perguntas. Separo as comuns pra responder primeiro. Manda a sua.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Já chegaram 40 perguntas. Vou separar as mais comuns pra responder primeiro. Manda a sua.'),
(282, NULL, '2026-08-12', 'Qua', '20:00', 'Stories', 'Link Sticker', 'S38 · FA04 infraestrutura', 'Amanhã 20h. Live ao vivo. Lembrete: [LS]', '5 de 5', 'entregue', NULL, NULL, NULL, 'Amanhã 20h. Live ao vivo. Lembrete: [link sticker]. Reserva agora.'),
(283, NULL, '2026-08-13', 'Qui', '08:00', 'Stories', 'Vídeo Ju', 'S39 · LIVE #1 5 Drenos', 'HOJE. 20h. Live com Ju. Tema: 5 Drenos ao vivo. 60min. Tira dúvida.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'HOJE. 20h. Live com a Ju. Tema: Os 5 Drenos ao vivo. Duração: 60min. Tira dúvida. (vídeo 20s)'),
(284, NULL, '2026-08-13', 'Qui', '11:00', 'Stories', 'Link Sticker', 'S39 · LIVE #1 5 Drenos', 'Reserva no calendário: 20h hoje. [LS pro lembrete]', '2 de 5', 'entregue', NULL, NULL, NULL, 'Reserva no calendário: 20h. Hoje. Live no perfil. [link sticker pro lembrete]'),
(285, NULL, '2026-08-13', 'Qui', '13:30', 'Stories', 'Enquete', 'S39 · LIVE #1 5 Drenos', 'Vai assistir ao vivo ou depois? Ao vivo / Vou tentar / Não dá hoje', '3 de 5', 'entregue', NULL, NULL, NULL, 'Vai assistir ao vivo ou depois? Ao vivo / Vou tentar / Não dá hoje'),
(286, NULL, '2026-08-13', 'Qui', '17:30', 'Stories', 'Texto', 'S39 · LIVE #1 5 Drenos', 'Em 3 horas começamos. Anota uma pergunta. Vou responder ao vivo.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Em 3 horas começamos. Anota uma pergunta sua. Vou responder algumas ao vivo.'),
(287, NULL, '2026-08-13', 'Qui', '20:00', 'Stories', 'Vídeo Ju', 'S39 · LIVE #1 5 Drenos', 'Ao vivo agora. Entra.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Ao vivo agora. Entra. [live]'),
(288, NULL, '2026-08-14', 'Sex', '08:00', 'Stories', 'Vídeo Ju', 'S40 · Resposta a comentário', 'Ontem na live, uma pergunta repetiu: ''Ju, e se eu já tentei tudo?'' Vou responder no feed hoje.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Ontem na live, uma pergunta repetiu MUITAS vezes: "Ju, e se eu já tentei tudo?" Vou responder hoje no feed. (vídeo 25s)'),
(289, NULL, '2026-08-14', 'Sex', '11:00', 'Stories', 'Texto', 'S40 · Resposta a comentário', 'Spoiler: você não tentou TUDO. Tentou MUITAS COISAS NA SEQUÊNCIA ERRADA. Diferença abissal.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Spoiler da resposta: você não tentou TUDO. Tentou MUITAS COISAS NA SEQUÊNCIA ERRADA. Diferença é abismal.'),
(290, NULL, '2026-08-14', 'Sex', '13:30', 'Stories', 'Caixa Perg.', 'S40 · Resposta a comentário', 'Caixa: qual coisa você ''já tentou''? Separo os 10 comuns pra mostrar onde a sequência falhou.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Caixa: qual coisa você "já tentou"? Vou separar os 10 mais comuns pra mostrar onde a sequência falhou.'),
(291, NULL, '2026-08-14', 'Sex', '17:30', 'Stories', 'Repost Feed', 'S40 · Resposta a comentário', 'Reel no feed. Resposta completa. Lê com calma.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'Reel saiu no feed. Resposta completa. Lê com calma.'),
(292, NULL, '2026-08-14', 'Sex', '20:00', 'Stories', 'Vídeo Ju', 'S40 · Resposta a comentário', 'Amanhã: recorte da live de ontem. Momento mais salvado.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Amanhã: recorte da live de ontem. O momento que mais salvaram. (vídeo 15s)'),
(293, NULL, '2026-08-15', 'Sáb', '08:00', 'Stories', 'Texto', 'S41 · Recorte Live #1', 'Sábado. Recorte da live no feed. Insight mais ressoante: ''Dreno dominante não é o pior. É o mais visível.''', '1 de 5', 'entregue', NULL, NULL, NULL, 'Sábado. Recorte da live no feed hoje. O insight que mais ressoou: "O dreno dominante não é o pior. É o mais visível."'),
(294, NULL, '2026-08-15', 'Sáb', '11:00', 'Stories', 'Vídeo Ju', 'S41 · Recorte Live #1', 'Por que importa? Você foca no que VÊ. O que CAUSA está escondido. Diagnóstico bom encontra o invisível.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Por que isso importa? Porque você foca no que VÊ. E o que CAUSA está escondido. Diagnóstico bom encontra o invisível. (vídeo 30s)'),
(295, NULL, '2026-08-15', 'Sáb', '13:30', 'Stories', 'Enquete', 'S41 · Recorte Live #1', 'Assistiu a live de quinta? Sim ao vivo / Sim depois / Não vi', '3 de 5', 'entregue', NULL, NULL, NULL, 'Você assistiu a live de quinta? Sim, ao vivo / Sim, depois / Não vi ainda'),
(296, NULL, '2026-08-15', 'Sáb', '17:30', 'Stories', 'Repost Feed', 'S41 · Recorte Live #1', 'Quem não viu, está no IGTV. Bloqueia 60min do domingo.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'Quem não viu, está no IGTV. Bloqueia 60 minutos do seu domingo pra assistir.'),
(297, NULL, '2026-08-15', 'Sáb', '20:00', 'Stories', 'Vídeo Ju', 'S41 · Recorte Live #1', 'Próxima live: quinta 20h. Trava Mental Racional. Reserva.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Próxima live: quinta 20h. Tema: Trava Mental Racional. Reserva. (vídeo 15s)'),
(298, NULL, '2026-08-16', 'Dom', '08:00', 'Stories', 'Texto', 'S42 · Reflexão + planos', 'Domingo. Sem feed. Stories pra fechar a semana.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Domingo. Sem feed hoje. Stories pra fechar a semana com presença.'),
(299, NULL, '2026-08-16', 'Dom', '11:00', 'Stories', 'Vídeo Ju', 'S42 · Reflexão + planos', 'Essa semana teve live, 3 carrosséis, 2 posts texto, 1 reel. Denso. Vou descansar de propósito hoje.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Essa semana teve live, 3 carrosséis, 2 posts de texto, 1 reel. Foi denso. Vou descansar de propósito hoje. (vídeo 25s)'),
(300, NULL, '2026-08-16', 'Dom', '13:30', 'Stories', 'Caixa Perg.', 'S42 · Reflexão + planos', 'Caixa: o que fez essa semana que NÃO faria há 30 dias?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Caixa: o que você fez essa semana que NÃO faria há 30 dias?'),
(301, NULL, '2026-08-16', 'Dom', '17:30', 'Stories', 'Texto', 'S42 · Reflexão + planos', '60+ respostas. Comuns: ''Cortei cafeína'', ''Dormi sem celular'', ''Não comprei outro curso'', ''Pedi ajuda''.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Recebi 60+ respostas. Os mais comuns: "Cortei cafeína à tarde", "Dormi sem celular", "Não comprei outro curso", "Pedi ajuda". Pequenas, mas reais.'),
(302, NULL, '2026-08-16', 'Dom', '20:00', 'Stories', 'Texto', 'S42 · Reflexão + planos', 'Amanhã: semana com live de novo. Quinta 20h. Tema: Trava Mental Racional. Bloqueia.', '5 de 5', 'entregue', NULL, NULL, NULL, 'Amanhã começa uma semana com live de novo. Quinta 20h. Tema: Trava Mental Racional. Bloqueia o horário.'),
(303, NULL, '2026-08-17', 'Seg', '08:00', 'Stories', 'Repost Feed', 'S43 · Repost A Viagem', 'Republicando A Viagem em 10 etapas. Quem não viu, ESSE é o mapa do método.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Republicando A Viagem em 10 etapas. Carrossel C09. Quem ainda não viu, ESSE é o mapa do método.'),
(304, NULL, '2026-08-17', 'Seg', '11:00', 'Stories', 'Texto', 'S43 · Repost A Viagem', 'À noite: carrossel NOVO. 4 estágios do Realizador Travado. Você está em um dos 4.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Hoje à noite: carrossel NOVO. "Os 4 estágios do Realizador Travado." Sneak peek: ninguém é a exceção. Você está em um dos 4.'),
(305, NULL, '2026-08-17', 'Seg', '13:30', 'Stories', 'Enquete', 'S43 · Repost A Viagem', 'Em qual etapa do EPIC247 você se vê hoje? Energia / Mentalidade / Auto / Felicidade / Plano / Coragem / Ação / Inteligência / Excelência / Amor', '3 de 5', 'entregue', NULL, NULL, NULL, 'Em qual etapa do EPIC247 você se vê hoje? Energia / Mentalidade / Autoconhecimento / Felicidade / Planejamento / Coragem / Ação / Inteligência / Excelência / Amor'),
(306, NULL, '2026-08-17', 'Seg', '17:30', 'Stories', 'Texto', 'S43 · Repost A Viagem', 'Mais comum: Energia (62%). É exatamente onde método começa.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Mais comum: Energia (62%). É exatamente onde o método começa. Por algum motivo, todos sabem onde travaram.'),
(307, NULL, '2026-08-17', 'Seg', '20:00', 'Stories', 'Vídeo Ju', 'S43 · Repost A Viagem', 'Saiu agora: 4 estágios. Vai conferir e diz qual é o seu.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Acabou de sair: 4 estágios do Realizador Travado. Vai conferir e me diz qual é o seu. (vídeo 15s)'),
(308, NULL, '2026-08-18', 'Ter', '08:00', 'Stories', 'Texto', 'S44 · FA05 mínimo viável', 'Post de Texto: ''Mínimo viável vence ideal abandonado.'' Sexta 17h22, você decide acordar 5h. Cena familiar?', '1 de 5', 'entregue', NULL, NULL, NULL, 'Post de Texto hoje: "Mínimo viável vence ideal abandonado." Sexta-feira 17h22, você decide acordar 5h na segunda. Cena familiar?'),
(309, NULL, '2026-08-18', 'Ter', '11:00', 'Stories', 'Vídeo Ju', 'S44 · FA05 mínimo viável', 'O ideal abandonado é marca registrada do Realizador Travado. Planos lindos, 3 dias na prática.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'O ideal abandonado é a marca registrada do Realizador Travado. Planos lindos no papel, 3 dias na prática. (vídeo 25s)'),
(310, NULL, '2026-08-18', 'Ter', '13:30', 'Stories', 'Enquete', 'S44 · FA05 mínimo viável', 'Quantas vezes esse ano ''começou segunda'' e não passou de quarta?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Quantas vezes esse ano você "começou segunda" e não passou de quarta?'),
(311, NULL, '2026-08-18', 'Ter', '17:30', 'Stories', 'Texto', 'S44 · FA05 mínimo viável', 'Maioria: 3-10 vezes. Esse padrão se rompe diminuindo ambição inicial. Não aumentando força.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Maioria respondeu entre 3 e 10 vezes. Esse padrão se rompe quando você diminui ambição inicial. Não quando aumenta força de vontade.'),
(312, NULL, '2026-08-18', 'Ter', '20:00', 'Stories', 'Vídeo Ju', 'S44 · FA05 mínimo viável', 'Quinta tem live: Trava Mental Racional ao vivo. Reserva.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Quinta tem live: Trava Mental Racional ao vivo. Tira dúvida sobre seus padrões. Reserva o horário. (vídeo 20s)'),
(313, NULL, '2026-08-19', 'Qua', '08:00', 'Stories', 'Texto', 'S45 · FA06 identidade', 'Post de Texto: ''Identidade antes de comportamento.'' Sequência prática, não mantra.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Post de Texto hoje: "Identidade antes de comportamento." Sequência prática, não mantra.'),
(314, NULL, '2026-08-19', 'Qua', '11:00', 'Stories', 'Vídeo Ju', 'S45 · FA06 identidade', 'Você não mantém hábito de identidade que não acredita ter. Esse é o problema raiz.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Você não vai manter um hábito que pertence a uma identidade que você não acredita ter. Esse é o problema raiz. (vídeo 30s)'),
(315, NULL, '2026-08-19', 'Qua', '13:30', 'Stories', 'Caixa Perg.', 'S45 · FA06 identidade', 'Caixa: qual identidade você QUER mas não se PERMITE assumir?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Caixa: qual identidade você quer mas não se permite assumir?'),
(316, NULL, '2026-08-19', 'Qua', '17:30', 'Stories', 'Texto', 'S45 · FA06 identidade', 'Comuns: ''Pessoa que termina o que começa''. ''Disciplinada''. ''Em paz''. Todas começam com permissão.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Respostas mais comuns: "Pessoa que termina o que começa". "Pessoa disciplinada". "Pessoa em paz". Todas começam com PERMISSÃO interna.'),
(317, NULL, '2026-08-19', 'Qua', '20:00', 'Stories', 'Vídeo Ju', 'S45 · FA06 identidade', 'Amanhã live 20h. Aprofundamos essa permissão na prática.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Amanhã, live. 20h. Vamos aprofundar essa permissão na prática. (vídeo 15s)'),
(318, NULL, '2026-08-20', 'Qui', '08:00', 'Stories', 'Vídeo Ju', 'S46 · LIVE #2 Trava Mental', 'HOJE. 20h. Live #2 com Ju. Tema: Trava Mental Racional. 60min. Reserva.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'HOJE. 20h. Live #2 com a Ju. Tema: Trava Mental Racional. Duração: 60min. Reserva. (vídeo 20s)'),
(319, NULL, '2026-08-20', 'Qui', '11:00', 'Stories', 'Link Sticker', 'S46 · LIVE #2 Trava Mental', 'Lembrete: hoje 20h. [LS pro alarme]', '2 de 5', 'entregue', NULL, NULL, NULL, 'Lembrete: hoje 20h. Live no perfil. [link sticker pro alarme]'),
(320, NULL, '2026-08-20', 'Qui', '13:30', 'Stories', 'Caixa Perg.', 'S46 · LIVE #2 Trava Mental', 'Caixa: qual a maior trava que quer entender hoje?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Caixa: qual é a maior trava que você quer entender hoje?'),
(321, NULL, '2026-08-20', 'Qui', '17:30', 'Stories', 'Texto', 'S46 · LIVE #2 Trava Mental', '90+ perguntas pra live. Vou puxar 8-10 ao vivo. Manda a sua.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Recebi 90+ perguntas pra live. Vou puxar 8-10 ao vivo. Manda a sua se ainda não mandou.'),
(322, NULL, '2026-08-20', 'Qui', '20:00', 'Stories', 'Vídeo Ju', 'S46 · LIVE #2 Trava Mental', 'Começamos agora. Entra.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Começamos agora. Entra. [live]'),
(323, NULL, '2026-08-21', 'Sex', '08:00', 'Stories', 'Texto', 'S47 · Depoimentos parte 2', 'Hoje no feed: depoimentos compilados parte 2. Pessoas com 60 dias aplicando.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Hoje no feed: depoimentos compilados parte 2. Pessoas com 60 dias de aplicação. As transformações se aprofundaram.'),
(324, NULL, '2026-08-21', 'Sex', '11:00', 'Stories', 'Vídeo Ju', 'S47 · Depoimentos parte 2', 'Diferença entre 30 e 60 dias é gigante. 30: mudou comportamento. 60: mudou IDENTIDADE.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'A diferença entre 30 dias e 60 dias é gigante. Aos 30, mudou o comportamento. Aos 60, mudou a IDENTIDADE. (vídeo 30s)'),
(325, NULL, '2026-08-21', 'Sex', '13:30', 'Stories', 'Enquete', 'S47 · Depoimentos parte 2', 'Você já se vê com identidade nova que constrói? Sim parcialmente / Ainda não / Não sei', '3 de 5', 'entregue', NULL, NULL, NULL, 'Você já se vê com uma identidade nova que está construindo? Sim, parcialmente / Não, ainda não / Não sei dizer'),
(326, NULL, '2026-08-21', 'Sex', '17:30', 'Stories', 'Repost Feed', 'S47 · Depoimentos parte 2', 'Volta no carrossel. Lê com calma. Tem coisa preciosa.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'Volta no carrossel de depoimentos. Lê com calma. Tem coisa preciosa lá.'),
(327, NULL, '2026-08-21', 'Sex', '20:00', 'Stories', 'Vídeo Ju', 'S47 · Depoimentos parte 2', 'Amanhã: recorte da live de ontem. Anota o que mais salvaram.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Amanhã: recorte da live de ontem. Anota o que mais salvaram. (vídeo 15s)'),
(328, NULL, '2026-08-22', 'Sáb', '08:00', 'Stories', 'Texto', 'S48 · Recorte Live #2', 'Sábado. Recorte da Live #2 no feed. Insight mais salvado: ''Trava não é falha. É proteção.''', '1 de 5', 'entregue', NULL, NULL, NULL, 'Sábado. Recorte da Live #2 no feed. O insight mais salvado: "Trava não é falha. É proteção. Entender contra o que se protege é metade do destrave."'),
(329, NULL, '2026-08-22', 'Sáb', '11:00', 'Stories', 'Vídeo Ju', 'S48 · Recorte Live #2', 'Você se protege contra: exposição, vulnerabilidade, decepção, fracasso. Faz sentido. Preço alto.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Você se protege contra: exposição, vulnerabilidade, decepção, fracasso. Faz sentido. Mas o preço é alto. (vídeo 30s)'),
(330, NULL, '2026-08-22', 'Sáb', '13:30', 'Stories', 'Enquete', 'S48 · Recorte Live #2', 'Assistiu a Live #2? Sim ao vivo / Sim depois / Ainda não', '3 de 5', 'entregue', NULL, NULL, NULL, 'Você assistiu a Live #2? Sim, ao vivo / Sim, depois / Ainda não'),
(331, NULL, '2026-08-22', 'Sáb', '17:30', 'Stories', 'Repost Feed', 'S48 · Recorte Live #2', 'Quem perdeu, IGTV. Vale 60min do sábado.', '4 de 5', 'a_produzir', NULL, NULL, NULL, 'Quem perdeu, está no IGTV. Vale 60 min do seu sábado.'),
(332, NULL, '2026-08-22', 'Sáb', '20:00', 'Stories', 'Vídeo Ju', 'S48 · Recorte Live #2', 'Próxima live: quinta 20h. ÚLTIMA. Tema: Próximos passos. Reserva.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Próxima live: quinta 20h. ÚLTIMA do ciclo. Tema: Próximos passos. Reserva agora. (vídeo 20s)'),
(333, NULL, '2026-08-23', 'Dom', '08:00', 'Stories', 'Texto', 'S49 · Sneak peek última semana', 'Domingo. Penúltimo domingo do ciclo. Amanhã ÚLTIMA semana de conteúdo.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Domingo. Penúltimo domingo do ciclo. Amanhã começa a ÚLTIMA semana de conteúdo dessa série.'),
(334, NULL, '2026-08-23', 'Dom', '11:00', 'Stories', 'Vídeo Ju', 'S49 · Sneak peek última semana', 'Próxima semana: mais 3 Posts Texto, último carrossel, ÚLTIMA live, convite final. Anota.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Próxima semana: mais 3 Posts de Texto, último carrossel, ÚLTIMA live, e o convite final ao programa. Anota. (vídeo 25s)'),
(335, NULL, '2026-08-23', 'Dom', '13:30', 'Stories', 'Caixa Perg.', 'S49 · Sneak peek última semana', 'Caixa: o que quer levar dessas 8 semanas pra sua vida real?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Caixa: o que você quer levar dessas 8 semanas pra sua vida real?'),
(336, NULL, '2026-08-23', 'Dom', '17:30', 'Stories', 'Texto', 'S49 · Sneak peek última semana', 'Mensagens emocionantes. Padrão: ''Aprendi a parar de me culpar.'' Esse é o destrave inicial.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Recebi mensagens emocionantes. Padrão: "Aprendi a parar de me culpar." Esse é o destrave inicial. Daí pra frente, fica mais fácil.'),
(337, NULL, '2026-08-23', 'Dom', '20:00', 'Stories', 'Texto', 'S49 · Sneak peek última semana', 'Amanhã: começo da última semana. Live quinta 20h. ÚLTIMA chance ao vivo.', '5 de 5', 'entregue', NULL, NULL, NULL, 'Amanhã: começo da última semana. Live quinta 20h. ÚLTIMA chance ao vivo. Anota.'),
(338, NULL, '2026-08-24', 'Seg', '08:00', 'Stories', 'Repost Feed', 'S50 · Repost Simone Biles', 'Republicando ''Simone Biles parou''. 2 meses depois. Sente diferente lendo agora?', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'Republicando "Simone Biles parou na maior Olimpíada da história". 2 meses depois. O que você sente lendo agora é diferente?'),
(339, NULL, '2026-08-24', 'Seg', '11:00', 'Stories', 'Texto', 'S50 · Repost Simone Biles', 'À noite: carrossel ''Como funciona EPIC247 na prática''. Pra quem quer entender antes da decisão.', '2 de 5', 'entregue', NULL, NULL, NULL, 'Hoje à noite: carrossel "Como funciona o EPIC247 na prática". Pra quem quer entender o método em detalhes antes da decisão.'),
(340, NULL, '2026-08-24', 'Seg', '13:30', 'Stories', 'Enquete', 'S50 · Repost Simone Biles', 'Está considerando próximo ciclo do EPIC247? Sim decidido / Considerando / Ainda não / Não vou agora', '3 de 5', 'entregue', NULL, NULL, NULL, 'Você está considerando entrar no próximo ciclo do EPIC247? Sim, decidido / Considerando / Ainda não / Não vou agora'),
(341, NULL, '2026-08-24', 'Seg', '17:30', 'Stories', 'Texto', 'S50 · Repost Simone Biles', '47% ''Considerando''. É onde se decide. Quinta tem live final pra te ajudar.', '4 de 5', 'entregue', NULL, NULL, NULL, '47% responderam "Considerando". É exatamente onde se decide. Quinta tem live final pra te ajudar a decidir.'),
(342, NULL, '2026-08-24', 'Seg', '20:00', 'Stories', 'Vídeo Ju', 'S50 · Repost Simone Biles', 'Carrossel ''Como funciona EPIC247'' acabou de sair. Lê com calma.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'O carrossel "Como funciona o EPIC247 na prática" acabou de sair. Lê com calma. (vídeo 15s)'),
(343, NULL, '2026-08-25', 'Ter', '08:00', 'Stories', 'Texto', 'S51 · FA07 subtrair', 'Post de Texto: ''Subtrair também é estratégia.'' Foi ensinado a adicionar. Sempre.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Post de Texto: "Subtrair também é estratégia." A gente foi ensinado a adicionar. Sempre adicionar. Mais método, mais curso.'),
(344, NULL, '2026-08-25', 'Ter', '11:00', 'Stories', 'Vídeo Ju', 'S51 · FA07 subtrair', 'Às vezes não é mais ação. É menos peso. Email não respondido. Conversa não terminada. Compromisso por fraqueza.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Às vezes não é mais ação que você precisa. É menos peso. O email não respondido. A conversa não terminada. O compromisso assumido por fraqueza. (vídeo 30s)'),
(345, NULL, '2026-08-25', 'Ter', '13:30', 'Stories', 'Caixa Perg.', 'S51 · FA07 subtrair', 'Caixa: o que precisa PARAR de carregar pra finalmente andar?', '3 de 5', 'entregue', NULL, NULL, NULL, 'Caixa: o que você precisa PARAR de carregar pra finalmente começar a andar?'),
(346, NULL, '2026-08-25', 'Ter', '17:30', 'Stories', 'Texto', 'S51 · FA07 subtrair', 'Comuns: ''Culpa pelos cursos não terminados''. ''Expectativa de ser quem não sou''. ''Obrigação de provar''.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Respostas mais comuns: "A culpa pelos cursos não terminados". "A expectativa de ser quem não sou". "A obrigação de provar algo aos outros".'),
(347, NULL, '2026-08-25', 'Ter', '20:00', 'Stories', 'Vídeo Ju', 'S51 · FA07 subtrair', 'Live quinta 20h. ÚLTIMA. Tema: Próximos passos.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Live quinta 20h. ÚLTIMA. Tema: Próximos passos. Anota. (vídeo 15s)'),
(348, NULL, '2026-08-26', 'Qua', '08:00', 'Stories', 'Texto', 'S52 · FA08 hora perfeita', 'Post de Texto: ''Nunca vai ser a hora perfeita. A hora é essa. Imperfeita, incerta, real.''', '1 de 5', 'entregue', NULL, NULL, NULL, 'Post de Texto hoje: "Nunca vai ser a hora perfeita. A hora é essa. Imperfeita, incerta, real."'),
(349, NULL, '2026-08-26', 'Qua', '11:00', 'Stories', 'Vídeo Ju', 'S52 · FA08 hora perfeita', 'Espera: trabalho desacelerar. Filhos crescerem. Mais energia. Ano novo chegar. PARE.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Você está esperando: quando o trabalho desacelerar. Quando os filhos crescerem. Quando você tiver mais energia. Quando o ano novo chegar. Pare. (vídeo 30s)'),
(350, NULL, '2026-08-26', 'Qua', '13:30', 'Stories', 'Enquete', 'S52 · FA08 hora perfeita', 'Espera ''a hora certa'' pra decisão importante há quanto tempo? <6 meses / 1-2 anos / 3-5 anos / >5 anos', '3 de 5', 'entregue', NULL, NULL, NULL, 'Você está esperando "a hora certa" pra alguma decisão importante há quanto tempo? Menos de 6 meses / 1-2 anos / 3-5 anos / Mais de 5 anos'),
(351, NULL, '2026-08-26', 'Qua', '17:30', 'Stories', 'Texto', 'S52 · FA08 hora perfeita', '51% ''1-2 anos'' ou mais. Hora certa não existe. Existe a hora real. É essa.', '4 de 5', 'entregue', NULL, NULL, NULL, '51% responderam "1-2 anos" ou mais. A hora certa não existe. Existe a hora real. E é essa.'),
(352, NULL, '2026-08-26', 'Qua', '20:00', 'Stories', 'Vídeo Ju', 'S52 · FA08 hora perfeita', 'Amanhã: live FINAL. 20h. Última chance ao vivo.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Amanhã: live FINAL do ciclo. 20h. Última chance ao vivo. (vídeo 15s)'),
(353, NULL, '2026-08-27', 'Qui', '08:00', 'Stories', 'Vídeo Ju', 'S53 · LIVE #3 Próximos passos', 'HOJE. 20h. ÚLTIMA live do ciclo. Tema: Próximos passos. 75min. Vai ser denso.', '1 de 5', 'a_produzir', NULL, NULL, NULL, 'HOJE. 20h. ÚLTIMA live do ciclo. Tema: Próximos passos. Duração: 75min. Vai ser pesado. (vídeo 25s)'),
(354, NULL, '2026-08-27', 'Qui', '11:00', 'Stories', 'Link Sticker', 'S53 · LIVE #3 Próximos passos', 'Lembrete: 20h hoje. Live final. [LS pro alarme]', '2 de 5', 'entregue', NULL, NULL, NULL, 'Lembrete: 20h hoje. Live final no perfil. [link sticker pro alarme]'),
(355, NULL, '2026-08-27', 'Qui', '13:30', 'Stories', 'Caixa Perg.', 'S53 · LIVE #3 Próximos passos', 'Caixa: última chance de pergunta. Manda agora.', '3 de 5', 'entregue', NULL, NULL, NULL, 'Caixa: última chance de mandar pergunta pra live. Manda agora.'),
(356, NULL, '2026-08-27', 'Qui', '17:30', 'Stories', 'Texto', 'S53 · LIVE #3 Próximos passos', 'Em 3 horas. Anota uma decisão pra tomar nessa live. Vou te ajudar ao vivo.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Em 3 horas. Anota uma decisão que você quer tomar nessa live. Eu vou te ajudar a tomar ao vivo.'),
(357, NULL, '2026-08-27', 'Qui', '20:00', 'Stories', 'Vídeo Ju', 'S53 · LIVE #3 Próximos passos', 'Começamos agora. Entra. Vai ser denso.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Começamos agora. Entra. Vai ser denso. [live]'),
(358, NULL, '2026-08-28', 'Sex', '08:00', 'Stories', 'Texto', 'S54 · FA09 98% cansados', 'Sexta. Post de Texto: ''98% dos brasileiros se dizem cansados. Não é coincidência.''', '1 de 5', 'entregue', NULL, NULL, NULL, 'Sexta-feira. Post de Texto: "98% dos brasileiros se dizem cansados. Não é coincidência."'),
(359, NULL, '2026-08-28', 'Sex', '11:00', 'Stories', 'Vídeo Ju', 'S54 · FA09 98% cansados', 'Não é fraqueza de geração. Não é falta de café. É consequência de modelo de vida.', '2 de 5', 'a_produzir', NULL, NULL, NULL, 'Não é fraqueza de geração. Não é falta de café. É consequência objetiva de modelo de vida que ninguém ensinou a sustentar. (vídeo 30s)'),
(360, NULL, '2026-08-28', 'Sex', '13:30', 'Stories', 'Enquete', 'S54 · FA09 98% cansados', 'Acredita que pode mudar essa estatística no seu caso? Sim posso / Talvez / Difícil / Não sei', '3 de 5', 'entregue', NULL, NULL, NULL, 'Você acredita que pode mudar essa estatística no seu caso? Sim, posso / Talvez / Acho difícil / Não sei'),
(361, NULL, '2026-08-28', 'Sex', '17:30', 'Stories', 'Texto', 'S54 · FA09 98% cansados', 'Maioria ''Sim, posso''. Terreno fértil. Quando sai do ''Não sei'', planta.', '4 de 5', 'entregue', NULL, NULL, NULL, 'Maioria respondeu "Sim, posso". Esse é o terreno fértil. Quando você sai do "Não sei", pode plantar.'),
(362, NULL, '2026-08-28', 'Sex', '20:00', 'Stories', 'Vídeo Ju', 'S54 · FA09 98% cansados', 'Amanhã: convite final do ciclo. Quem tem terreno pronto, vai querer ver.', '5 de 5', 'a_produzir', NULL, NULL, NULL, 'Amanhã: convite final do ciclo. Quem está com o terreno pronto, vai querer ver. (vídeo 20s)'),
(363, NULL, '2026-08-29', 'Sáb', '08:00', 'Stories', 'Texto', 'S55 · Convite final', 'Sábado. Último post do ciclo. Carrossel: Convite forte ao programa.', '1 de 5', 'entregue', NULL, NULL, NULL, 'Sábado. Último post do ciclo no feed. Carrossel: "Convite forte ao programa".'),
(364, NULL, '2026-08-29', 'Sáb', '11:00', 'Stories', 'Vídeo Ju', 'S55 · Convite final', '8 semanas. 50+ conteúdos. 3 lives. Centenas de mensagens. Se chegou até aqui, algo tocou.', '2 de 5', 'a_produzir', NULL, NULL, NULL, '8 semanas. 50+ conteúdos. 3 lives. Centenas de mensagens. Se você chegou até aqui, alguma coisa tocou. (vídeo 30s)'),
(365, NULL, '2026-08-29', 'Sáb', '13:30', 'Stories', 'Link Sticker', 'S55 · Convite final', 'Vagas pro próximo ciclo: ABERTAS HOJE. [LS pra página]', '3 de 5', 'entregue', NULL, NULL, NULL, 'Vagas pro próximo ciclo: ABERTAS HOJE. [link sticker pra página de vendas]'),
(366, NULL, '2026-08-29', 'Sáb', '17:30', 'Stories', 'Texto', 'S55 · Convite final', '40 vagas. Lista de espera tem 230 pessoas. Lista tem prioridade nas próximas horas.', '4 de 5', 'entregue', NULL, NULL, NULL, '40 vagas. Lista de espera tem 230 pessoas. Quem está na lista, tem prioridade nas próximas horas.'),
(367, NULL, '2026-08-29', 'Sáb', '20:00', 'Stories', 'Link Sticker', 'S55 · Convite final', 'Última chance hoje. [LS]. Te vejo do outro lado. — Ju', '5 de 5', 'entregue', NULL, NULL, NULL, 'Última chance hoje. [link sticker]. Te vejo do outro lado. — Ju'),
(368, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F01', 'FOLHA F01 · "EM QUANTO TEMPO EU VEJO RESULTADO?"', NULL, 'a_produzir', NULL, 'PARTE B · 12 FOLHAS DE FAQ EM VÍDEO
Vídeos curtos (30 a 60s cada). Servem para FAQ da página, stories de "respondendo dúvida" e anúncios de retargeting.

Padrão de gravação: olhar direto na lente. Tom de mentora respondendo. Naturalidade.

FOLHA F01 · "EM QUANTO TEMPO EU VEJO RESULTADO?"
Tempo: 30 a 45s
Tom: Direto, honesto, sem promessa exagerada.

Em quanto tempo você vê resultado.
Resposta honesta.
[PAUSA]
A maioria das pessoas relata mudanças perceptíveis
entre 7 e 14 dias de aplicação consistente.
[PAUSA]
Consolidação real acontece entre 30 e 60 dias.
[PAUSA LONGA]
Não é mágica. É consequência de aplicar o que o material entrega
durante o tempo que ele precisa.
Quem aplica, vê.
Quem não aplica, não vê.
É simples assim.', NULL, NULL),
(369, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F02', 'FOLHA F02 · "QUANTO TEMPO POR DIA EU PRECISO?"', NULL, 'a_produzir', NULL, 'FOLHA F02 · "QUANTO TEMPO POR DIA EU PRECISO?"
Tempo: 25 a 35s
Tom: Casual, leve.

Quanto tempo por dia você precisa.
[PAUSA]
Entre 20 e 30 minutos por sessão.
[PAUSA]
O Manual e o Workbook foram desenhados em blocos curtos.
Intencionalmente.
[PAUSA LONGA]
Mínimo viável vence ideal abandonado.
Esse é um dos princípios do método.', NULL, NULL),
(370, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F03', 'FOLHA F03 · "ISSO SUBSTITUI TERAPIA?"', NULL, 'a_produzir', NULL, 'FOLHA F03 · "ISSO SUBSTITUI TERAPIA?"
Tempo: 30 a 45s
Tom: Firme, sério. Não brincar com essa.

Esse material substitui terapia ou acompanhamento médico?
[PAUSA LONGA]
Não.
Em nenhuma hipótese.
[PAUSA]
O Módulo Energia é material educacional
baseado em ciência e prática clínica.
Voltado a pessoas funcionais
que querem otimizar energia e execução.
[PAUSA]
Se você apresenta sintomas persistentes e intensos
de ansiedade, depressão ou burnout,
procura acompanhamento profissional.
[PAUSA]
Esse material complementa.
Não substitui.', NULL, NULL),
(371, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F04', 'FOLHA F04 · "E SE EU JÁ TENTEI TUDO?"', NULL, 'a_produzir', NULL, 'FOLHA F04 · "E SE EU JÁ TENTEI TUDO?"
Tempo: 35 a 45s
Tom: Acolhedor, mas firme. Olhar direto na lente.

"E se eu já tentei tudo?"
[PAUSA]
A diferença aqui é que você não começa pela cabeça.
Começa pelo corpo.
[PAUSA LONGA]
Tudo que você tentou antes
pode ter falhado por uma única razão:
estava sendo construído em cima de uma fundação sem energia.
[PAUSA]
Construa a fundação primeiro.
O resto fica mais fácil do que você imagina.', NULL, NULL),
(372, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F05', 'FOLHA F05 · "POR QUE O MÉTODO COMEÇA POR ENERGIA, NÃO POR MENTALIDADE?"', NULL, 'a_produzir', NULL, 'FOLHA F05 · "POR QUE O MÉTODO COMEÇA POR ENERGIA, NÃO POR MENTALIDADE?"
Tempo: 45 a 60s
Tom: Professora explicando lógica do método.

Por que o Protocolo começa por Energia, e não por Mentalidade.
Pergunta boa.
[PAUSA]
Energia não é o módulo mais importante.
Mas é o primeiro porque sem ele,
nenhum dos outros se sustenta.
[PAUSA]
Mentalidade exige capacidade cognitiva.
Capacidade cognitiva exige sistema nervoso regulado.
Sistema nervoso regulado exige sono, alimentação e movimento adequados.
[PAUSA LONGA]
Você não conserta o motor de um carro com o motor desligado.
Precisa de energia para fazer qualquer coisa.
Inclusive para mudar.', NULL, NULL),
(373, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F06', 'FOLHA F06 · "FUNCIONA PRA QUEM TEM ROTINA CAÓTICA?"', NULL, 'a_produzir', NULL, 'FOLHA F06 · "FUNCIONA PRA QUEM TEM ROTINA CAÓTICA?"
Tempo: 25 a 35s
Tom: Reconfortante, prático.

Funciona pra quem tem rotina caótica?
[PAUSA]
Funciona principalmente pra quem tem rotina caótica.
[PAUSA LONGA]
O método foi desenhado pra pessoas com rotina real.
Ocupada. Imperfeita.
Funciona exatamente porque cabe em rotina caótica.', NULL, NULL),
(374, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F07', 'FOLHA F07 · "SOU PAI / MÃE OCUPADO. FUNCIONA PRA MIM?"', NULL, 'a_produzir', NULL, 'FOLHA F07 · "SOU PAI / MÃE OCUPADO. FUNCIONA PRA MIM?"
Tempo: 30 a 40s
Tom: Empático, pessoal.

Sou pai ou mãe ocupado. Funciona pra mim?
[PAUSA]
Eu sou.
Sei o que é tentar caber transformação pessoal
entre fralda, reunião e jantar.
[PAUSA LONGA]
O Módulo Energia foi desenhado pra caber em sessões de 20 minutos.
Sem rotina monástica.
Sem precisar acordar antes do mundo acordar.
[PAUSA]
Funciona pra quem tem responsabilidade real.', NULL, NULL),
(375, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F08', 'FOLHA F08 · "O WORKBOOK É DIFÍCIL DE FAZER?"', NULL, 'a_produzir', NULL, 'FOLHA F08 · "O WORKBOOK É DIFÍCIL DE FAZER?"
Tempo: 25 a 35s
Tom: Tranquilizador, direto.

O Workbook é difícil de fazer?
[PAUSA]
Não.
[PAUSA]
São 5 exercícios práticos com entrega observável.
Não é "reflita sobre".
É "faça isso esta semana e registre o resultado".
[PAUSA LONGA]
Sessões de 20 a 30 minutos. Sem interrupção. Aplicação imediata.', NULL, NULL),
(376, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F09', 'FOLHA F09 · "VALE A PENA O LIVRO FÍSICO OU O DIGITAL BASTA?"', NULL, 'a_produzir', NULL, 'FOLHA F09 · "VALE A PENA O LIVRO FÍSICO OU O DIGITAL BASTA?"
Tempo: 30 a 40s
Tom: Honesto, sem empurrar venda.

Vale a pena o livro físico ou o digital basta?
[PAUSA]
Vai depender de você.
[PAUSA]
Se você assimila melhor lendo no papel,
sem tela, sem distração, sem notificação,
o físico vale.
[PAUSA]
Se você só vai ler no metrô,
o digital resolve.
[PAUSA LONGA]
Ambos têm exatamente o mesmo conteúdo.', NULL, NULL),
(377, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F010', 'FOLHA F10 · "QUAL A DIFERENÇA PRA OUTROS MÉTODOS QUE EU JÁ VI?"', NULL, 'a_produzir', NULL, 'FOLHA F10 · "QUAL A DIFERENÇA PRA OUTROS MÉTODOS QUE EU JÁ VI?"
Tempo: 45 a 60s
Tom: Direta, sem agressividade com concorrentes.

Qual a diferença pra outros métodos?
[PAUSA]
Três coisas.
[PAUSA]
Um.
Esse método começa pelo corpo.
A maioria começa pela mentalidade.
E falha porque tenta mudar atitude em cima de fisiologia desregulada.
[PAUSA]
Dois.
É sequencial.
Dez módulos em uma ordem específica.
Não buffet. Sequência.
[PAUSA]
Três.
Tem ciência atrás.
Não é opinião. É mecanismo.
[PAUSA LONGA]
Quando você entende o mecanismo, executa diferente.', NULL, NULL),
(378, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F011', 'FOLHA F11 · "COMO SEI SE SOU UM REALIZADOR TRAVADO?"', NULL, 'a_produzir', NULL, 'FOLHA F11 · "COMO SEI SE SOU UM REALIZADOR TRAVADO?"
Tempo: 35 a 45s
Tom: Diagnóstico íntimo.

Como você sabe se é um Realizador Travado?
[PAUSA]
Você reconhece quando vê os sinais.
[PAUSA]
Sabe muito. Lê muito. Planeja muito.
Mas o projeto continua parado.
A meta continua não cumprida.
A decisão continua sendo adiada.
[PAUSA LONGA]
Não por falta de inteligência.
Por excesso de análise e falta de combustível.
[PAUSA]
Se isso ressoou, esse material foi feito pra você.', NULL, NULL),
(379, 'x', NULL, NULL, NULL, 'Stories', 'Vídeo Ju', 'F012', 'FOLHA F12 · "E SE EU NÃO CONSEGUIR APLICAR?"', NULL, 'a_produzir', NULL, 'FOLHA F12 · "E SE EU NÃO CONSEGUIR APLICAR?"
Tempo: 30 a 40s
Tom: Acolhedor, mas firme. Sem fazer culpa.

E se você não conseguir aplicar?
[PAUSA]
Você tem 14 dias pra testar.
Se sentir que não é pra você, recupera o dinheiro.
Sem pergunta.
[PAUSA LONGA]
Mas se você comprou e travou,
manda mensagem aqui pelo Instagram.
Eu respondo.
Travar é dado.
Dado vira ajuste.
Ajuste destrava.', NULL, NULL);

notify pgrst, 'reload schema';