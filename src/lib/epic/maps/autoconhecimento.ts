// Mapa de Autoconhecimento v1.0 — texto transcrito do documento
// "EPIC247 2.0 — Mapa de Autoconhecimento v1.0" (pasta 08).

import type { DimensionalMapConfig } from "./types";

export const AUTOCONHECIMENTO: DimensionalMapConfig = {
  kind: "dimensional",
  mapType: "autoconhecimento",
  mapVersion: "1.0",
  scoringVersion: "1.0",
  resultCopyVersion: "1.0",
  title: "Mapa de Autoconhecimento",
  disclaimer:
    "Este Mapa EPIC é uma autoavaliação educativa e comportamental. Não é instrumento clínico, psicológico ou diagnóstico.",
  estimatedMinutes: "3 a 4 minutos",
  axes: [
    { key: "identidade", label: "Identidade" },
    { key: "valores", label: "Valores" },
    { key: "desejos", label: "Desejos" },
    { key: "limites", label: "Limites" },
    { key: "coerencia", label: "Coerência" },
  ],
  questions: [
    { id: "AC1", axis: "identidade", reverse: false, text: "Tenho dificuldade de responder quem sou hoje sem recorrer apenas aos meus papéis, profissão ou responsabilidades." },
    { id: "AC2", axis: "identidade", reverse: false, text: "Percebo que parte da imagem que tenho de mim foi construída mais por expectativa externa do que por escolha consciente." },
    { id: "AC3", axis: "identidade", reverse: true, text: "Consigo reconhecer características, padrões e prioridades que definem quem sou nesta fase da vida." },
    { id: "AC4", axis: "valores", reverse: false, text: "Às vezes tomo decisões importantes sem conseguir nomear quais valores estou tentando proteger." },
    { id: "AC5", axis: "valores", reverse: false, text: "Existem áreas da minha vida em que ajo de forma recorrente contra aquilo que digo ser importante para mim." },
    { id: "AC6", axis: "valores", reverse: true, text: "Quando preciso escolher entre duas opções difíceis, consigo usar meus valores como critério real de decisão." },
    { id: "AC7", axis: "desejos", reverse: false, text: "Tenho dificuldade de distinguir o que eu realmente quero do que aprendi que deveria querer." },
    { id: "AC8", axis: "desejos", reverse: false, text: "Algumas metas que persigo hoje parecem mais ligadas a validação, expectativa ou comparação do que a desejo genuíno." },
    { id: "AC9", axis: "desejos", reverse: true, text: "Consigo reconhecer com razoável clareza o que quero construir nesta próxima fase da minha vida." },
    { id: "AC10", axis: "limites", reverse: false, text: "Digo “sim” com frequência para evitar desconforto, desapontar alguém ou precisar me explicar." },
    { id: "AC11", axis: "limites", reverse: false, text: "Tenho dificuldade de identificar o que já não quero mais tolerar, sustentar ou carregar." },
    { id: "AC12", axis: "limites", reverse: true, text: "Consigo proteger tempo, energia e escolhas quando algo entra em conflito com o que considero importante." },
    { id: "AC13", axis: "coerencia", reverse: false, text: "Minha rotina atual está distante da pessoa que digo querer me tornar." },
    { id: "AC14", axis: "coerencia", reverse: false, text: "Existem partes relevantes da minha vida que continuo mantendo mais por hábito ou continuidade do que por escolha presente." },
    { id: "AC15", axis: "coerencia", reverse: true, text: "Minhas decisões cotidianas costumam refletir, de forma razoável, o que digo valorizar e desejar." },
  ],
  profiles: {
    identidade: {
      editorialName: "O Personagem",
      title: "Seu principal ponto de fricção hoje parece estar na Identidade.",
      interpretation:
        "Suas respostas sugerem que pode existir uma distância entre quem você é hoje e a forma como aprendeu a se apresentar, funcionar ou ser reconhecido. Papéis, profissão e expectativas podem estar ocupando tanto espaço que ficou mais difícil perceber o que existe por baixo deles.",
      recognition:
        "Talvez você saiba explicar muito bem o que faz, mas tenha mais dificuldade de dizer quem está se tornando.",
      firstMove:
        "Escreva duas listas curtas: “quem eu preciso ser para funcionar” e “quem eu percebo que sou quando não preciso provar nada”. Observe onde elas se encontram e onde se afastam.",
    },
    valores: {
      editorialName: "O Desalinhado",
      title: "Seu principal ponto de fricção hoje parece estar nos Valores.",
      interpretation:
        "Seu mapa sugere que parte da tensão pode vir menos de não saber o que fazer e mais de agir repetidamente contra critérios que, no fundo, são importantes para você. Quando valores não entram na decisão prática, a vida pode funcionar e ainda assim produzir sensação de desalinhamento.",
      recognition:
        "Você pode estar cumprindo prioridades que funcionam por fora e contradizem algo importante por dentro.",
      firstMove:
        "Escolha uma decisão recente que ainda incomoda e responda: “qual valor eu protegi?” e “qual valor eu sacrifiquei?”.",
    },
    desejos: {
      editorialName: "O Herdeiro",
      title: "Seu principal ponto de fricção hoje parece estar nos Desejos.",
      interpretation:
        "Suas respostas sugerem que alguns objetivos podem ter sido herdados de expectativas, comparação, validação ou de versões anteriores de você. Isso não significa que sejam falsos. Significa que talvez precisem ser escolhidos novamente de forma consciente.",
      recognition:
        "Talvez você esteja perseguindo algo que um dia fez sentido, sem ter parado para perguntar se ainda quer chegar lá.",
      firstMove:
        "Pegue três objetivos atuais e complete: “eu quero isso porque…”. Depois marque quais respostas falam de desejo próprio e quais falam de reconhecimento, obrigação ou expectativa.",
    },
    limites: {
      editorialName: "O Disponível",
      title: "Seu principal ponto de fricção hoje parece estar nos Limites.",
      interpretation:
        "Seu resultado sugere que proteger relações, responsabilidades ou expectativas pode estar custando espaço demais daquilo que também precisa ser protegido em você. Limite, aqui, não é afastamento. É critério sobre o que entra, o que permanece e o que deixa de caber.",
      recognition:
        "Você pode estar tão acostumado a ser disponível que só percebe o próprio limite quando já passou dele.",
      firstMove:
        "Identifique um “sim” recorrente que costuma gerar ressentimento, cansaço ou perda de prioridade. Antes de mudá-lo, escreva qual medo aparece quando imagina dizer “não”.",
    },
    coerencia: {
      editorialName: "O Dividido",
      title: "Seu principal ponto de fricção hoje parece estar na Coerência.",
      interpretation:
        "Suas respostas sugerem que existe uma diferença perceptível entre aquilo que você diz querer, valorizar ou se tornar e a estrutura real da sua rotina. Essa distância não é necessariamente hipocrisia ou falta de vontade. Pode ser sinal de que sua vida ainda está organizada para uma versão anterior de você.",
      recognition:
        "Talvez você não esteja sem direção. Talvez sua agenda ainda esteja obedecendo uma direção antiga.",
      firstMove:
        "Escolha uma semana comum e marque uma ação concreta que confirma a pessoa que você quer se tornar e uma que ainda reforça um padrão que pretende deixar para trás.",
    },
  },
  dualMessage:
    "Seu mapa mostra duas fricções muito próximas: {A} e {B}. Isso faz sentido porque Autoconhecimento funciona como sistema: a forma como você se vê influencia o que deseja, seus valores influenciam limites e tudo isso aparece na coerência da vida real.",
  closingPhrase:
    "Talvez você não precise descobrir uma versão secreta de si mesmo. Precisa perceber quais partes da sua vida ainda estão sendo decididas por uma versão que já mudou.",
  ctaPlan: "Quero meu Plano EPIC Autoconhecimento de 7 dias.",
  ctaKit: "Conhecer o Kit Autoconhecimento.",
  safetyNote:
    "Este Mapa ajuda você a se escutar melhor. Ele não substitui processos terapêuticos, aconselhamento profissional ou decisões complexas de vida, e não indica que alguma relação precise ser rompida.",
  related: [
    { dimension: "felicidade", when: "quando existe clareza de identidade, mas pouca presença, prazer, significado ou realização." },
    { dimension: "planejamento", when: "quando a pessoa sabe o que quer, mas ainda não estruturou uma rota." },
    { dimension: "coragem", when: "quando o desejo e a decisão estão claros, mas o custo de assumir essa escolha trava o movimento." },
    { dimension: "amor", when: "quando pertencimento, vínculo ou expectativa relacional pesam fortemente sobre identidade e limites." },
    { dimension: "mentalidade", when: "quando crenças rígidas e interpretações recorrentes distorcem a percepção de possibilidades." },
  ],
};
