// Mapa de Fricção EPIC v1.0 — texto e pesos transcritos do documento
// "EPIC247 2.0 — Mapa de Fricção EPIC v1.0" (pasta 08). Não editar copy
// aqui sem nova versão do documento.

import type { FrictionMapConfig } from "./types";

export const FRICCAO: FrictionMapConfig = {
  kind: "friccao",
  mapType: "friccao",
  mapVersion: "1.0",
  // 1.1 = comparação relativa (proposta de correção de viés). Só vira a
  // versão ativa depois da aprovação de Ju e Luiz. Ver docs/v2/vies-mapa-friccao.md.
  scoringVersion: "1.0",
  scoringVersions: {
    "1.0": { comparacao: "bruta" },
    "1.1": { comparacao: "relativa", limiarProximo: 0.4 },
  },
  resultCopyVersion: "1.0",
  title: "Mapa de Fricção EPIC",
  disclaimer:
    "Este Mapa EPIC é uma ferramenta educativa de autoavaliação. Ele não é instrumento clínico, psicológico ou médico. O objetivo é orientar a melhor porta de entrada dentro das 10 dimensões do EPIC247.",
  estimatedMinutes: "2 minutos",
  primaryWeight: 3,
  secondaryWeight: 1,
  questions: [
    {
      id: 1,
      text: "Ao final de uma semana comum, qual situação mais se aproxima da sua realidade hoje?",
      options: [
        { id: "A", text: "Chego ao fim da semana sem energia para quase nada que seja meu.", primary: "energia", secondary: "felicidade" },
        { id: "B", text: "Fiz muitas coisas, mas continuo com a sensação de que não avancei no que realmente importa.", primary: "acao", secondary: "planejamento" },
        { id: "C", text: "Minha rotina funciona, mas não tenho certeza se ainda faz sentido para mim.", primary: "autoconhecimento", secondary: "felicidade" },
        { id: "D", text: "Passei boa parte da semana pensando em decisões que continuo sem tomar.", primary: "coragem", secondary: "mentalidade" },
        { id: "E", text: "Consigo avançar, mas tenho dificuldade de manter um ritmo que seja sustentável.", primary: "excelencia", secondary: "energia" },
      ],
    },
    {
      id: 2,
      text: "Quando pensa em uma mudança importante que gostaria de fazer, qual frase mais se aproxima de você?",
      options: [
        { id: "A", text: "Ainda não sei exatamente o que quero mudar ou para onde quero ir.", primary: "autoconhecimento", secondary: "felicidade" },
        { id: "B", text: "Sei o que quero, mas continuo planejando e reorganizando antes de começar.", primary: "planejamento", secondary: "acao" },
        { id: "C", text: "Já sei o que quero fazer, mas receio as consequências da decisão.", primary: "coragem", secondary: "mentalidade" },
        { id: "D", text: "A decisão está tomada, mas ainda não transformei isso em uma primeira ação concreta.", primary: "acao", secondary: "coragem" },
        { id: "E", text: "Já comecei, mas não consigo manter consistência suficiente para perceber progresso.", primary: "excelencia", secondary: "acao" },
      ],
    },
    {
      id: 3,
      text: "Quando algo importante não sai como você esperava, o que tende a acontecer primeiro?",
      options: [
        { id: "A", text: "Fico preso analisando o que deu errado e imaginando tudo que ainda pode dar errado.", primary: "mentalidade", secondary: "coragem" },
        { id: "B", text: "Tento entender rapidamente o que posso aprender e ajustar para a próxima tentativa.", primary: "inteligencia", secondary: "excelencia" },
        { id: "C", text: "Aumento meu nível de exigência e começo a achar que preciso fazer melhor antes de tentar de novo.", primary: "excelencia", secondary: "mentalidade" },
        { id: "D", text: "Perco vontade de continuar porque começo a questionar se aquilo ainda vale a pena.", primary: "felicidade", secondary: "autoconhecimento" },
        { id: "E", text: "Procuro apoio ou conversa porque sozinho tenho dificuldade de organizar o que estou sentindo e pensando.", primary: "amor", secondary: "autoconhecimento" },
      ],
    },
    {
      id: 4,
      text: "Quando precisa tomar uma decisão que pode mudar alguma coisa importante, qual é sua principal dificuldade?",
      options: [
        { id: "A", text: "Distinguir o que eu realmente quero do que esperam de mim.", primary: "autoconhecimento", secondary: "amor" },
        { id: "B", text: "Aceitar que posso decepcionar, desagradar ou mexer numa relação importante.", primary: "amor", secondary: "coragem" },
        { id: "C", text: "Agir sem ter certeza de que tudo vai dar certo.", primary: "coragem", secondary: "mentalidade" },
        { id: "D", text: "Escolher entre possibilidades porque continuo encontrando novos ângulos para analisar.", primary: "mentalidade", secondary: "planejamento" },
        { id: "E", text: "Transformar a decisão em passos concretos e uma sequência executável.", primary: "planejamento", secondary: "acao" },
      ],
    },
    {
      id: 5,
      text: "Quando você tem um objetivo claro, onde a execução costuma perder força?",
      options: [
        { id: "A", text: "Não consigo organizar prioridades e transformar intenção em um plano simples.", primary: "planejamento", secondary: "acao" },
        { id: "B", text: "Sei o próximo passo, mas adio o momento de começar.", primary: "acao", secondary: "mentalidade" },
        { id: "C", text: "Começo bem, mas perco consistência depois de alguns dias ou semanas.", primary: "excelencia", secondary: "acao" },
        { id: "D", text: "Minha energia não acompanha aquilo que planejei fazer.", primary: "energia", secondary: "excelencia" },
        { id: "E", text: "Quando surge algo inesperado, tenho dificuldade de rever a estratégia sem sentir que fracassei.", primary: "inteligencia", secondary: "mentalidade" },
      ],
    },
    {
      id: 6,
      text: "Quando finalmente sobra um pouco de tempo para você, o que costuma fazer mais falta?",
      options: [
        { id: "A", text: "Descansar de verdade e recuperar disposição.", primary: "energia", secondary: "felicidade" },
        { id: "B", text: "Entender melhor o que eu quero para a próxima fase da minha vida.", primary: "autoconhecimento", secondary: "felicidade" },
        { id: "C", text: "Fazer algo que me dê prazer, presença ou sensação de estar realmente vivendo.", primary: "felicidade", secondary: "energia" },
        { id: "D", text: "Estar com pessoas com quem eu possa ser inteiro, sem precisar apenas funcionar.", primary: "amor", secondary: "felicidade" },
        { id: "E", text: "Aprender, explorar ou experimentar algo novo que me tire do automático.", primary: "inteligencia", secondary: "autoconhecimento" },
      ],
    },
    {
      id: 7,
      text: "Se uma única coisa pudesse melhorar nos próximos 90 dias, qual mudança teria maior impacto na sua vida hoje?",
      options: [
        { id: "A", text: "Ter mais energia e disposição para sustentar minha rotina e o que quero construir.", primary: "energia", secondary: "excelencia" },
        { id: "B", text: "Ter mais clareza sobre quem sou, o que quero e o que ainda faz sentido.", primary: "autoconhecimento", secondary: "felicidade" },
        { id: "C", text: "Parar de adiar uma decisão ou movimento que sei que preciso fazer.", primary: "coragem", secondary: "acao" },
        { id: "D", text: "Transformar intenção em ação consistente e perceber progresso real.", primary: "acao", secondary: "excelencia" },
        { id: "E", text: "Viver com mais presença, conexão, prazer e sentido, e não apenas cumprir obrigações.", primary: "felicidade", secondary: "amor" },
      ],
    },
  ],
  results: {
    energia: {
      title: "Seu principal ponto de fricção hoje parece estar em Energia.",
      interpretation:
        "Suas respostas sugerem que o recurso disponível para sustentar sua rotina pode estar menor do que a demanda que você está tentando carregar. Antes de pedir mais disciplina, produtividade ou coragem de si mesmo, vale observar se existe combustível suficiente para aquilo que você quer construir.",
      firstMove:
        "Em que momento do dia sua energia costuma desaparecer antes de você chegar ao que é importante para você?",
      cta: "Aprofundar meu Mapa de Energia.",
    },
    mentalidade: {
      title: "Seu principal ponto de fricção hoje parece estar em Mentalidade.",
      interpretation:
        "Suas respostas sugerem que parte da fricção pode estar acontecendo antes da ação, na forma como você interpreta riscos, erros, possibilidades e expectativas. Pensar melhor não significa pensar mais. Às vezes significa perceber quando o pensamento deixou de ajudar e começou a impedir movimento.",
      firstMove:
        "Qual pensamento aparece com mais frequência imediatamente antes de você adiar, recuar ou complicar uma decisão?",
      cta: "Explorar Mentalidade no EPIC247.",
    },
    autoconhecimento: {
      title: "Seu principal ponto de fricção hoje parece estar em Autoconhecimento.",
      interpretation:
        "Talvez sua principal necessidade agora não seja fazer mais, mas entender melhor de onde está partindo. Quando identidade, desejos, valores e limites ficam pouco claros, é possível continuar funcionando muito bem e ainda assim caminhar numa direção que já não combina com você.",
      firstMove:
        "O que, na sua vida atual, ainda existe porque você quer e o que continua existindo porque um dia você quis?",
      cta: "Aprofundar meu Mapa de Autoconhecimento.",
    },
    felicidade: {
      title: "Seu principal ponto de fricção hoje parece estar em Felicidade.",
      interpretation:
        "Suas respostas sugerem uma distância entre funcionar e sentir que a vida está sendo vivida. Não significa que tudo esteja errado. Pode significar que realização, presença, prazer ou sentido estão ocupando menos espaço do que deveriam na forma como sua rotina foi construída.",
      firstMove:
        "O que existe hoje na sua agenda que mantém sua vida funcionando, mas quase nada que faça você sentir que está vivendo?",
      cta: "Explorar Felicidade no EPIC247.",
    },
    planejamento: {
      title: "Seu principal ponto de fricção hoje parece estar em Planejamento.",
      interpretation:
        "Você pode ter intenção suficiente, mas ainda faltar uma ponte clara entre o que deseja e o que precisa acontecer primeiro. Planejamento, aqui, não significa criar sistemas mais complexos. Significa reduzir ambiguidade, escolher prioridades e transformar direção em próximos passos executáveis.",
      firstMove: "Se você só pudesse avançar uma coisa nos próximos sete dias, qual deveria ser?",
      cta: "Explorar Planejamento no EPIC247.",
    },
    coragem: {
      title: "Seu principal ponto de fricção hoje parece estar em Coragem.",
      interpretation:
        "Suas respostas sugerem que talvez exista mais clareza do que movimento. A dificuldade pode não estar em descobrir o que fazer, mas em atravessar o desconforto, a exposição, o risco ou as consequências envolvidas em fazer.",
      firstMove:
        "Que decisão você continua chamando de dúvida porque assumir que já decidiu exigiria fazer alguma coisa?",
      cta: "Aprofundar meu Mapa de Coragem.",
    },
    acao: {
      title: "Seu principal ponto de fricção hoje parece estar em Ação.",
      interpretation:
        "Você pode saber o que quer, compreender o problema e até ter um plano razoável, mas ainda existir uma distância entre intenção e comportamento. A fricção aqui não é falta de informação. É transformar o que já está claro em uma primeira ação suficientemente simples para acontecer.",
      firstMove: "Qual é a menor ação concreta que colocaria você em movimento ainda hoje?",
      cta: "Aprofundar meu Mapa de Ação.",
    },
    inteligencia: {
      title: "Seu principal ponto de fricção hoje parece estar em Inteligência.",
      interpretation:
        "Suas respostas sugerem que o próximo avanço pode depender menos de insistir no mesmo caminho e mais de aprender, rever, testar e adaptar. Inteligência, no EPIC247, não é saber mais. É usar feedback, curiosidade e experiência para responder melhor ao que a realidade está mostrando.",
      firstMove:
        "O que a realidade já tentou ensinar a você mais de uma vez e você ainda está tentando resolver da mesma maneira?",
      cta: "Explorar Inteligência no EPIC247.",
    },
    excelencia: {
      title: "Seu principal ponto de fricção hoje parece estar em Excelência.",
      interpretation:
        "Talvez seu desafio não seja começar, mas sustentar uma prática boa o suficiente por tempo suficiente para produzir resultado. Excelência aqui não significa perfeição. Significa consistência, avaliação, ajuste e capacidade de continuar sem transformar cada oscilação em reinício.",
      firstMove:
        "Qual padrão mínimo, se mantido por 30 dias, produziria mais resultado do que seus ciclos atuais de intensidade e interrupção?",
      cta: "Explorar Excelência no EPIC247.",
    },
    amor: {
      title: "Seu principal ponto de fricção hoje parece estar em Amor.",
      interpretation:
        "Suas respostas sugerem que relações, pertencimento, limites, presença ou conexão podem estar influenciando mais suas decisões do que parece. Amor, no EPIC247, não é apenas vida romântica. É a infraestrutura relacional que sustenta ou restringe a forma como você vive.",
      firstMove:
        "Em quais relações você consegue ser inteiro e em quais sente que precisa funcionar, agradar ou se reduzir?",
      cta: "Explorar Amor no EPIC247.",
    },
  },
  dualMessage:
    "Seu mapa mostra duas fricções muito próximas: {A} e {B}. Isso não é um problema do resultado. É um sinal de que essas duas áreas provavelmente estão se alimentando.",
};
