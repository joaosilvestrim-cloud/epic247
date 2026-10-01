// Mapa de Amor v1.0 — texto transcrito do documento
// "EPIC247 2.0 — Mapa de Amor v1.0" (pasta 08). "Amor 2.0" e claims sobre
// micro-momentos não são publicados como ciência estabelecida (doc §16).

import type { DimensionalMapConfig } from "./types";

export const AMOR: DimensionalMapConfig = {
  kind: "dimensional",
  mapType: "amor",
  mapVersion: "1.0",
  scoringVersion: "1.0",
  resultCopyVersion: "1.0",
  title: "Mapa de Amor",
  disclaimer:
    "Este Mapa EPIC é uma autoavaliação educativa e comportamental. Não é instrumento clínico, psicológico ou diagnóstico.",
  estimatedMinutes: "3 a 4 minutos",
  axes: [
    { key: "conexao", label: "Conexão" },
    { key: "presenca", label: "Presença" },
    { key: "relacao_consigo", label: "Relação Consigo" },
    { key: "pertencimento", label: "Pertencimento" },
    { key: "expansao", label: "Expansão" },
  ],
  questions: [
    { id: "AM1", axis: "conexao", reverse: false, text: "Tenho pessoas importantes na minha vida, mas às vezes sinto que nossas conversas permanecem mais funcionais do que realmente próximas." },
    { id: "AM2", axis: "conexao", reverse: false, text: "Evito conversas honestas porque temo gerar desconforto, conflito ou mudar a forma como alguém me vê." },
    { id: "AM3", axis: "conexao", reverse: true, text: "Consigo demonstrar afeto, reconhecimento, necessidade ou vulnerabilidade de forma proporcional com pessoas em quem confio." },
    { id: "AM4", axis: "presenca", reverse: false, text: "Mesmo quando estou com alguém importante, minha atenção continua dividida entre tela, demandas, pensamentos ou outras preocupações." },
    { id: "AM5", axis: "presenca", reverse: false, text: "Passam dias em que quase não tenho um momento de conexão real, sem pressa, multitarefa ou distração." },
    { id: "AM6", axis: "presenca", reverse: true, text: "Consigo criar pequenos momentos de presença total com pessoas importantes no meu cotidiano." },
    { id: "AM7", axis: "relacao_consigo", reverse: false, text: "Sou mais duro comigo diante de erros e imperfeições do que seria com alguém de quem gosto." },
    { id: "AM8", axis: "relacao_consigo", reverse: false, text: "Tenho dificuldade de reconhecer qualidades, avanços ou partes da minha história sem imediatamente diminuir, ironizar ou corrigir o elogio." },
    { id: "AM9", axis: "relacao_consigo", reverse: true, text: "Consigo tratar minhas falhas com responsabilidade sem transformar erro em ataque à minha própria dignidade." },
    { id: "AM10", axis: "pertencimento", reverse: false, text: "Em alguns ambientes ou relações importantes, sinto que preciso editar partes de mim para continuar pertencendo." },
    { id: "AM11", axis: "pertencimento", reverse: false, text: "Mesmo cercado de pessoas, às vezes sinto pouca sensação de vínculo, reciprocidade ou lugar real." },
    { id: "AM12", axis: "pertencimento", reverse: true, text: "Tenho ao menos algumas relações ou espaços em que consigo ser inteiro sem precisar apenas funcionar, agradar ou performar." },
    { id: "AM13", axis: "expansao", reverse: false, text: "Tenho dificuldade de transformar aquilo que aprendi, conquistei ou sei fazer em algo que também beneficie outras pessoas." },
    { id: "AM14", axis: "expansao", reverse: false, text: "Minha rotina está tão orientada a resolver, entregar e cumprir que sobra pouco espaço para entusiasmo, generosidade ou celebração." },
    { id: "AM15", axis: "expansao", reverse: true, text: "Consigo perceber formas concretas de compartilhar presença, conhecimento, cuidado ou contribuição sem precisar transformar isso em obrigação." },
  ],
  profiles: {
    conexao: {
      editorialName: "O Funcionalmente Próximo",
      title: "Seu principal ponto de fricção hoje parece estar na Conexão.",
      interpretation:
        "Suas respostas sugerem que existem relações importantes, mas talvez falte espaço para troca mais verdadeira, afeto explícito, vulnerabilidade ou conversas que ultrapassem organização, rotina e obrigação. Estar perto não é necessariamente sentir-se conectado.",
      recognition:
        "Você pode falar com alguém todos os dias e ainda assim sentir falta de uma conversa em que realmente esteve ali.",
      firstMove:
        "Escolha uma pessoa segura e faça uma pergunta que você normalmente não faria no piloto automático: “como você está de verdade com isso?”. Depois escute sem consertar.",
    },
    presenca: {
      editorialName: "O Presente Ausente",
      title: "Seu principal ponto de fricção hoje parece estar na Presença.",
      interpretation:
        "Seu mapa sugere que o principal desgaste pode não estar na falta de pessoas, mas na falta de disponibilidade real quando elas estão diante de você. A vida pode estar cheia de contatos e pobre em presença.",
      recognition:
        "Seu corpo está na conversa, mas uma parte da sua atenção continua respondendo à vida inteira ao mesmo tempo.",
      firstMove:
        "Crie hoje um único micro-momento de presença total com alguém: alguns minutos sem tela, sem corrigir, sem antecipar a próxima tarefa. Apenas olhar, escutar e responder ao que está acontecendo ali.",
    },
    relacao_consigo: {
      editorialName: "O Juiz Interno",
      title: "Seu principal ponto de fricção hoje parece estar na Relação Consigo.",
      interpretation:
        "Suas respostas sugerem que a relação mais exigente da sua vida pode estar sendo aquela que você mantém consigo. Responsabilidade não exige humilhação interna. Autocompaixão, aqui, não significa passar a mão na cabeça. Significa conseguir corrigir sem se reduzir.",
      recognition:
        "Você pode aceitar imperfeições em quem ama e tratar as próprias como prova de que ainda não é suficiente.",
      firstMove:
        "Escolha um erro ou falha recente e escreva como você falaria sobre isso com alguém que respeita e quer ajudar. Depois leia o texto novamente trocando o nome dessa pessoa pelo seu.",
    },
    pertencimento: {
      editorialName: "O Adaptado Demais",
      title: "Seu principal ponto de fricção hoje parece estar no Pertencimento.",
      interpretation:
        "Seu mapa sugere que parte do custo relacional pode estar vindo da necessidade de se editar para caber. Pertencimento não é ser aceito em qualquer ambiente. É ter espaços em que você não precise desaparecer para continuar fazendo parte.",
      recognition:
        "Talvez você esteja cercado de gente e ainda assim precise deixar pedaços seus do lado de fora para permanecer ali.",
      firstMove:
        "Identifique uma relação ou espaço em que você se sente mais inteiro e outro em que mais se reduz. Não mude nada ainda. Apenas observe qual comportamento seu é diferente em cada um.",
    },
    expansao: {
      editorialName: "O Realizado Isolado",
      title: "Seu principal ponto de fricção hoje parece estar na Expansão.",
      interpretation:
        "Suas respostas sugerem que parte do que você aprendeu, construiu ou conquistou pode estar permanecendo concentrada apenas em desempenho individual. No fechamento do EPIC, transformação ganha outra dimensão quando também vira compartilhamento, contribuição, entusiasmo e significado para além de si.",
      recognition:
        "Talvez você já tenha conquistado coisas importantes e ainda esteja procurando o que fazer com a pessoa que se tornou.",
      firstMove:
        "Escolha uma habilidade, experiência ou aprendizado que hoje é seu e pergunte: “qual é a menor forma de isso melhorar a vida de alguém nesta semana?”. Pode ser uma conversa, uma ajuda, um texto, um conselho ou uma presença.",
    },
  },
  dualMessage:
    "Seu mapa mostra duas fricções muito próximas: {A} e {B}. Isso faz sentido porque vínculo funciona como sistema. Presença sustenta conexão; relação consigo influencia pertencimento; pertencimento abre espaço para contribuição e expansão.",
  closingPhrase:
    "Talvez a chegada não seja apenas conquistar o que você queria. Talvez seja conseguir habitar a própria vida com mais presença, vínculo e respeito por quem você se tornou.",
  ctaPlan: "Quero meu Plano EPIC Amor de 7 dias.",
  ctaKit: "Conhecer o Kit Amor.",
  safetyNote:
    "Este Mapa não indica se uma relação deve terminar, continuar ou ser reparada. Em relações inseguras, coercitivas ou abusivas, reaproximação pode não ser adequada: priorize sua segurança e procure apoio especializado.",
  related: [
    { dimension: "autoconhecimento", when: "quando a pessoa ainda está tentando entender quem é e o que deseja." },
    { dimension: "felicidade", when: "quando há vínculo, mas falta prazer, significado ou realização mais ampla." },
    { dimension: "mentalidade", when: "quando interpretações rígidas e autocrítica dominam a relação consigo." },
    { dimension: "coragem", when: "quando existe uma conversa ou posicionamento necessário, mas medo de consequência impede a ação." },
    { dimension: "inteligencia", when: "quando o desafio central é regular emoção e reparar relações durante turbulência." },
  ],
};
