// Mapa de Coragem v1.0 — texto transcrito do documento
// "EPIC247 2.0 — Mapa de Coragem v1.0" (pasta 08).

import type { DimensionalMapConfig } from "./types";

export const CORAGEM: DimensionalMapConfig = {
  kind: "dimensional",
  mapType: "coragem",
  mapVersion: "1.0",
  scoringVersion: "1.0",
  resultCopyVersion: "1.0",
  title: "Mapa de Coragem",
  disclaimer:
    "Este Mapa EPIC é uma autoavaliação educativa e comportamental. Não é instrumento clínico, psicológico ou diagnóstico.",
  estimatedMinutes: "3 a 4 minutos",
  axes: [
    { key: "decisao", label: "Decisão" },
    { key: "consequencia", label: "Consequência" },
    { key: "exposicao", label: "Exposição" },
    { key: "incerteza", label: "Incerteza" },
    { key: "travessia", label: "Travessia" },
  ],
  questions: [
    { id: "C1", axis: "decisao", reverse: false, text: "Tenho uma decisão importante que continuo tratando como dúvida, mesmo percebendo que internamente já sei o que quero." },
    { id: "C2", axis: "decisao", reverse: false, text: "Adio decisões relevantes porque continuo procurando mais clareza, validação ou informação antes de assumir uma escolha." },
    { id: "C3", axis: "decisao", reverse: true, text: "Quando uma decisão está madura para mim, consigo reconhecê-la como decisão mesmo sem sentir certeza absoluta." },
    { id: "C4", axis: "consequencia", reverse: false, text: "Evito agir porque temo decepcionar, desagradar ou provocar mudanças em relações importantes." },
    { id: "C5", axis: "consequencia", reverse: false, text: "Mesmo quando sei o que quero, fico preso imaginando tudo o que posso perder se seguir essa decisão." },
    { id: "C6", axis: "consequencia", reverse: true, text: "Consigo considerar as consequências de uma decisão sem permitir que elas apaguem completamente o que eu quero ou preciso fazer." },
    { id: "C7", axis: "exposicao", reverse: false, text: "Fico mais propenso a adiar quando a decisão me coloca em evidência ou abre espaço para julgamento de outras pessoas." },
    { id: "C8", axis: "exposicao", reverse: false, text: "Tenho dificuldade de mostrar algo inacabado, dizer o que penso, pedir o que preciso ou me posicionar quando isso pode afetar a imagem que os outros têm de mim." },
    { id: "C9", axis: "exposicao", reverse: true, text: "Consigo me expor de forma proporcional ao que a situação exige, mesmo sentindo desconforto." },
    { id: "C10", axis: "incerteza", reverse: false, text: "Preciso sentir que tenho garantias suficientes antes de assumir riscos importantes." },
    { id: "C11", axis: "incerteza", reverse: false, text: "Quando não consigo prever o resultado, minha tendência é adiar a decisão ou tentar controlar mais variáveis." },
    { id: "C12", axis: "incerteza", reverse: true, text: "Consigo agir com informação suficiente, mesmo quando não existe garantia de que o resultado será o que espero." },
    { id: "C13", axis: "travessia", reverse: false, text: "Mesmo depois de decidir, demoro a executar o primeiro gesto que torna a decisão real." },
    { id: "C14", axis: "travessia", reverse: false, text: "No momento de agir, meu medo cresce e eu encontro uma forma razoável de voltar para o planejamento, espera ou adiamento." },
    { id: "C15", axis: "travessia", reverse: true, text: "Quando percebo que já decidi, consigo transformar essa decisão em uma pequena ação concreta antes que a hesitação volte a crescer." },
  ],
  profiles: {
    decisao: {
      editorialName: "O Quase Decidido",
      title: "Seu principal ponto de fricção hoje parece estar na Decisão.",
      interpretation:
        "Suas respostas sugerem que talvez o problema não seja falta de informação, mas dificuldade de admitir que uma escolha já amadureceu internamente. Continuar chamando de dúvida o que já se parece com decisão pode preservar conforto no curto prazo, mas prolonga a imobilidade.",
      recognition:
        "Você pode estar pedindo mais clareza para uma decisão que já está clara o bastante para exigir movimento.",
      firstMove:
        "Escreva em uma frase: “Se eu parasse de chamar isso de dúvida, qual decisão eu teria de admitir que já tomei?” Não execute ainda. Primeiro nomeie com precisão.",
    },
    consequencia: {
      editorialName: "O Protetor",
      title: "Seu principal ponto de fricção hoje parece estar nas Consequências.",
      interpretation:
        "Seu mapa sugere que parte importante da hesitação pode vir do que a decisão muda em relações, papéis, expectativas ou segurança construída. O medo aqui não está apenas no ato. Está no que pode precisar ser reorganizado depois dele.",
      recognition:
        "Você pode saber o que quer e ainda assim se sentir responsável por proteger todos os impactos da sua escolha.",
      firstMove:
        "Divida uma folha em duas colunas: “o que posso influenciar” e “o que não posso controlar”. Coloque cada consequência imaginada em uma delas.",
    },
    exposicao: {
      editorialName: "O Invisível",
      title: "Seu principal ponto de fricção hoje parece estar na Exposição.",
      interpretation:
        "Suas respostas sugerem que agir pode significar ser visto, julgado, contestado ou simplesmente deixar de caber na imagem que outras pessoas já construíram sobre você. Às vezes, não é a tarefa que assusta. É o fato de ela tornar você visível.",
      recognition:
        "Enquanto está apenas na sua cabeça, ninguém pode rejeitar, criticar ou interpretar o que você quer fazer.",
      firstMove:
        "Escolha uma microexposição segura e proporcional, como compartilhar uma ideia, pedir feedback, enviar uma mensagem ou dizer sua posição a uma pessoa de confiança.",
    },
    incerteza: {
      editorialName: "O Garantidor",
      title: "Seu principal ponto de fricção hoje parece estar na Incerteza.",
      interpretation:
        "Seu mapa sugere que a busca por segurança pode estar ficando maior do que a quantidade de segurança que a decisão realmente permite. Algumas escolhas importantes não oferecem prova prévia. Exigem informação suficiente, estratégia e disposição para responder ao que aparecer.",
      recognition:
        "Você não precisa de certeza para agir, mas talvez esteja tratando certeza como pré-requisito.",
      firstMove:
        "Liste três riscos reais da decisão e, para cada um, escreva uma ação de prevenção ou reparo possível. O objetivo é transformar medo difuso em risco nomeado.",
    },
    travessia: {
      editorialName: "O Hesitante",
      title: "Seu principal ponto de fricção hoje parece estar na Travessia.",
      interpretation:
        "Suas respostas sugerem que a decisão pode já existir, mas falta o gesto que a transforma em realidade. Esse instante costuma concentrar desconforto porque, depois do primeiro passo, algumas possibilidades deixam de ser apenas imaginárias.",
      recognition:
        "Você já decidiu por dentro, mas ainda não fez nada que torne impossível fingir que a decisão não existe.",
      firstMove:
        "Identifique uma microação irreversível, mas proporcional e segura, que transforme intenção em movimento: enviar uma mensagem, marcar uma conversa, abrir uma inscrição, reservar um horário ou criar um primeiro compromisso real.",
    },
  },
  dualMessage:
    "Seu mapa mostra duas fricções muito próximas: {A} e {B}. Isso faz sentido porque coragem raramente trava em um único ponto. Uma decisão pode estar clara e ainda assim esbarrar em exposição, consequência ou incerteza.",
  closingPhrase:
    "Talvez você não precise de mais certeza. Talvez precise descobrir o que, exatamente, está tentando proteger antes de girar a chave.",
  ctaPlan: "Quero meu Plano EPIC Coragem de 7 dias.",
  ctaKit: "Conhecer o Kit Coragem.",
  safetyNote:
    "Se a sua decisão envolve risco físico, violência, coerção, abuso, segurança jurídica ou outra situação de alto impacto, não use este Mapa como estímulo para agir sozinho. Busque apoio adequado antes de qualquer passo.",
  related: [
    { dimension: "autoconhecimento", when: "quando a pessoa ainda não sabe o que quer de verdade." },
    { dimension: "mentalidade", when: "quando ruminação, catastrofização ou exigência de certeza dominam." },
    { dimension: "planejamento", when: "quando a decisão existe, mas não há caminho executável." },
    { dimension: "acao", when: "quando a escolha está assumida e o problema passa a ser começar ou sustentar." },
    { dimension: "amor", when: "quando vínculo, pertencimento, agradar ou medo de perder relações pesam mais que o risco da decisão em si." },
  ],
};
