// Mapa de Inteligência v1.0 — texto transcrito do documento
// "EPIC247 2.0 — Mapa de Inteligência v1.0" (pasta 08). Inteligência
// Artificial não gera score na v1.0 (doc §13): entra no Kit e no conteúdo.

import type { DimensionalMapConfig } from "./types";

export const INTELIGENCIA: DimensionalMapConfig = {
  kind: "dimensional",
  mapType: "inteligencia",
  mapVersion: "1.0",
  scoringVersion: "1.0",
  resultCopyVersion: "1.0",
  title: "Mapa de Inteligência",
  disclaimer:
    "Este Mapa EPIC é uma autoavaliação educativa e comportamental. Não é instrumento clínico, psicológico ou diagnóstico.",
  estimatedMinutes: "3 a 4 minutos",
  axes: [
    { key: "realidade", label: "Realidade" },
    { key: "recuperacao", label: "Recuperação" },
    { key: "aprendizado", label: "Aprendizado" },
    { key: "adaptacao", label: "Adaptação" },
    { key: "agencia_emocional", label: "Agência Emocional" },
  ],
  questions: [
    { id: "I1", axis: "realidade", reverse: false, text: "Quando algo dá errado, minha primeira reação costuma ser resistir ao fato, procurar culpados ou desejar que a situação fosse diferente." },
    { id: "I2", axis: "realidade", reverse: false, text: "Um obstáculo inesperado pode fazer com que eu interprete rapidamente que “isso não era para mim” ou que o plano inteiro perdeu sentido." },
    { id: "I3", axis: "realidade", reverse: true, text: "Consigo separar com relativa rapidez o fato objetivo da história que começo a contar sobre ele." },
    { id: "I4", axis: "recuperacao", reverse: false, text: "Depois de uma frustração, crítica, rejeição ou falha, demoro mais do que gostaria para voltar ao meu estado funcional." },
    { id: "I5", axis: "recuperacao", reverse: false, text: "Quando algo me abala, tenho tendência a me isolar, abandonar microações ou interromper completamente o que estava construindo." },
    { id: "I6", axis: "recuperacao", reverse: true, text: "Mesmo abalado, consigo encontrar uma próxima ação pequena que me ajuda a retornar ao caminho." },
    { id: "I7", axis: "aprendizado", reverse: false, text: "Quando algo não funciona, fico mais preso ao incômodo do resultado do que ao que ele pode me ensinar." },
    { id: "I8", axis: "aprendizado", reverse: false, text: "Tenho dificuldade de transformar crítica, erro ou frustração em informação útil para a próxima tentativa." },
    { id: "I9", axis: "aprendizado", reverse: true, text: "Consigo perguntar “o que isso está me mostrando?” sem precisar romantizar o problema ou fingir que gostei do que aconteceu." },
    { id: "I10", axis: "adaptacao", reverse: false, text: "Quando a rota original deixa de funcionar, tenho dificuldade de improvisar uma alternativa sem sentir que estou desistindo." },
    { id: "I11", axis: "adaptacao", reverse: false, text: "Mudanças inesperadas costumam me deixar preso por mais tempo tentando recuperar o plano anterior." },
    { id: "I12", axis: "adaptacao", reverse: true, text: "Consigo preservar o objetivo e mudar a estratégia quando a realidade mostra que outro caminho é necessário." },
    { id: "I13", axis: "agencia_emocional", reverse: false, text: "Em momentos de pressão emocional, costumo tomar decisões para aliviar o que estou sentindo agora, mesmo quando isso prejudica o que quero construir." },
    { id: "I14", axis: "agencia_emocional", reverse: false, text: "Tenho dificuldade de reconhecer o que estou sentindo antes que a emoção já tenha influenciado minha reação ou uma conversa importante." },
    { id: "I15", axis: "agencia_emocional", reverse: true, text: "Consigo perceber uma emoção forte, criar uma pequena pausa e escolher uma resposta que eu respeite depois." },
  ],
  profiles: {
    realidade: {
      editorialName: "O Intérprete",
      title: "Seu principal ponto de fricção hoje parece estar na Realidade.",
      interpretation:
        "Suas respostas sugerem que o primeiro desafio pode surgir no instante em que algo quebra a expectativa. O fato acontece, mas rapidamente ganha uma história maior: “deu errado”, “não era para mim”, “estraguei tudo”. Quando interpretação e realidade se misturam, fica mais difícil decidir o próximo passo.",
      recognition: "O obstáculo pode estar virando resposta final antes de virar informação.",
      firstMove:
        "Pegue um imprevisto recente e escreva duas linhas: “o que aconteceu de fato” e “o que eu concluí a partir disso”. Não tente melhorar nada ainda. Apenas separe fato de interpretação.",
    },
    recuperacao: {
      editorialName: "O Demorado para Voltar",
      title: "Seu principal ponto de fricção hoje parece estar na Recuperação.",
      interpretation:
        "Seu mapa sugere que o maior custo pode não estar no tombo, mas no tempo que ele continua ocupando depois. Resiliência, no EPIC247, não é ser forte o tempo todo. É conseguir recompor estado e encontrar uma próxima ação possível antes que uma frustração interrompa toda a viagem.",
      recognition: "Talvez você não caia mais do que os outros. Talvez demore mais para voltar.",
      firstMove:
        "Monte seu “estepe” pessoal com três recursos reais: uma pessoa que pode acionar, uma ação física simples que ajuda a recompor estado e uma microação que mantém o caminho vivo.",
    },
    aprendizado: {
      editorialName: "O Ferido pelo Resultado",
      title: "Seu principal ponto de fricção hoje parece estar no Aprendizado.",
      interpretation:
        "Suas respostas sugerem que resultados ruins podem estar sendo processados mais como vereditos do que como dados. Aprender não exige gostar do erro. Exige conseguir extrair informação suficiente para que a próxima tentativa não seja apenas repetição da anterior.",
      recognition: "Quando o resultado machuca demais, fica difícil escutar o que ele está tentando ensinar.",
      firstMove:
        "Escolha um episódio recente e responda: “o que eu repetiria?”, “o que eu mudaria?” e “o que só descobri porque tentei?”.",
    },
    adaptacao: {
      editorialName: "O Fiel à Rota",
      title: "Seu principal ponto de fricção hoje parece estar na Adaptação.",
      interpretation:
        "Seu resultado sugere que pode haver compromisso excessivo com a estratégia original. Adaptar não significa abandonar o objetivo. Significa reconhecer que a realidade mudou e que insistir no mesmo caminho pode ser menos inteligente do que preservar a direção por outra rota.",
      recognition:
        "Você pode estar tentando provar que o plano estava certo quando o que importa é continuar a viagem.",
      firstMove:
        "Diante de um plano travado, escreva três rotas alternativas que preservem o objetivo sem repetir exatamente a estratégia atual.",
    },
    agencia_emocional: {
      editorialName: "O Governado pelo Momento",
      title: "Seu principal ponto de fricção hoje parece estar na Agência Emocional.",
      interpretation:
        "Suas respostas sugerem que emoções intensas podem estar virando direção antes de virar informação. O objetivo do EPIC não é eliminar emoção. É reconhecê-la, regulá-la o suficiente para recuperar escolha e evitar decisões importantes no meio da tempestade.",
      recognition: "A emoção pode ser verdadeira sem precisar decidir sozinha o que você fará.",
      firstMove:
        "Quando perceber ativação forte, use três perguntas: “o que estou sentindo?”, “onde isso aparece no meu corpo?” e “qual ação inteligente continua possível apesar disso?”.",
    },
  },
  dualMessage:
    "Seu mapa mostra duas fricções muito próximas: {A} e {B}. Isso faz sentido porque Inteligência funciona como sistema de retorno. A forma como você interpreta o fato influencia sua emoção; a emoção influencia sua recuperação; recuperação influencia sua capacidade de aprender e adaptar.",
  closingPhrase:
    "Seu pneu vai furar em algum momento. O que define a viagem não é evitar todo imprevisto, mas construir um sistema para voltar, aprender e continuar.",
  ctaPlan: "Quero meu Plano EPIC Inteligência de 7 dias.",
  ctaKit: "Conhecer o Kit Inteligência.",
  safetyNote:
    "Este Mapa é uma ferramenta de reflexão cotidiana. Em situações de perda grave, trauma, violência, crise ou sofrimento intenso, voltar rápido não é obrigação: procure suporte profissional adequado.",
  related: [
    { dimension: "energia", when: "quando a recuperação está comprometida por falta de recurso físico ou mental." },
    { dimension: "mentalidade", when: "quando interpretações rígidas ou medo do erro dominam antes da aprendizagem." },
    { dimension: "planejamento", when: "quando não existe Plano B, recurso ou rota alternativa minimamente preparada." },
    { dimension: "acao", when: "quando a pessoa sabe como adaptar, mas não executa a próxima microação." },
    { dimension: "amor", when: "quando isolamento, vínculos ou falta de rede de apoio pesam sobre capacidade de retorno." },
  ],
};
