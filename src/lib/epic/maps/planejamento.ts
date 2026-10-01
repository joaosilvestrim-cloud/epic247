// Mapa de Planejamento v1.0 — texto transcrito do documento
// "EPIC247 2.0 — Mapa de Planejamento v1.0" (pasta 08).

import type { DimensionalMapConfig } from "./types";

export const PLANEJAMENTO: DimensionalMapConfig = {
  kind: "dimensional",
  mapType: "planejamento",
  mapVersion: "1.0",
  scoringVersion: "1.0",
  resultCopyVersion: "1.0",
  title: "Mapa de Planejamento",
  disclaimer:
    "Este Mapa EPIC é uma autoavaliação educativa e comportamental. Não é instrumento clínico, psicológico ou diagnóstico.",
  estimatedMinutes: "3 a 4 minutos",
  axes: [
    { key: "direcao", label: "Direção" },
    { key: "realidade", label: "Realidade" },
    { key: "prioridade", label: "Prioridade" },
    { key: "progresso", label: "Progresso" },
    { key: "adaptacao", label: "Adaptação" },
  ],
  questions: [
    { id: "P1", axis: "direcao", reverse: false, text: "Tenho metas importantes que parecem claras na minha cabeça, mas não consigo traduzi-las em um resultado específico." },
    { id: "P2", axis: "direcao", reverse: false, text: "Às vezes começo a planejar antes de definir exatamente o que quero alcançar e por que isso importa." },
    { id: "P3", axis: "direcao", reverse: true, text: "Consigo descrever meu objetivo principal de forma concreta, com um resultado que eu reconheceria quando acontecesse." },
    { id: "P4", axis: "realidade", reverse: false, text: "Faço planos sem considerar com clareza as restrições, recursos e condições reais disponíveis hoje." },
    { id: "P5", axis: "realidade", reverse: false, text: "Subestimo o tempo, esforço ou recursos necessários para executar o que planejei." },
    { id: "P6", axis: "realidade", reverse: true, text: "Antes de definir uma rota, costumo mapear o que tenho, o que falta e quais obstáculos são previsíveis." },
    { id: "P7", axis: "prioridade", reverse: false, text: "Tenho mais prioridades simultâneas do que consigo sustentar bem." },
    { id: "P8", axis: "prioridade", reverse: false, text: "Quando tudo parece importante, tenho dificuldade de escolher o que deve vir primeiro." },
    { id: "P9", axis: "prioridade", reverse: true, text: "Consigo proteger uma prioridade principal mesmo quando surgem novas demandas ou oportunidades." },
    { id: "P10", axis: "progresso", reverse: false, text: "Tenho objetivos em andamento, mas não acompanho de forma consistente se estou realmente avançando." },
    { id: "P11", axis: "progresso", reverse: false, text: "Percebo tarde demais que um plano não está funcionando porque não defini sinais simples de progresso." },
    { id: "P12", axis: "progresso", reverse: true, text: "Tenho alguma forma simples de verificar execução, qualidade ou progresso real sem transformar tudo em controle excessivo." },
    { id: "P13", axis: "adaptacao", reverse: false, text: "Quando meu plano original deixa de funcionar, tenho dificuldade de ajustar a rota sem sentir que todo o planejamento falhou." },
    { id: "P14", axis: "adaptacao", reverse: false, text: "Costumo insistir no plano por mais tempo do que deveria porque não defini alternativas ou gatilhos de mudança." },
    { id: "P15", axis: "adaptacao", reverse: true, text: "Consigo revisar o plano, aprender com o que aconteceu e escolher uma nova rota sem perder o objetivo principal de vista." },
  ],
  profiles: {
    direcao: {
      editorialName: "O Navegador sem Destino",
      title: "Seu principal ponto de fricção hoje parece estar na Direção.",
      interpretation:
        "Suas respostas sugerem que existe vontade de avançar, mas o destino ainda pode estar amplo, abstrato ou pouco mensurável. Quando o resultado não está claro, o planejamento tende a produzir atividade sem critério suficiente para dizer o que realmente conta como avanço.",
      recognition:
        "Você pode ter uma agenda cheia de movimento e ainda não saber exatamente o que precisa estar diferente ao final do caminho.",
      firstMove: "Complete três frases: “Eu quero…”, “isso importa porque…”, “vou saber que avancei quando…”.",
    },
    realidade: {
      editorialName: "O Otimista Operacional",
      title: "Seu principal ponto de fricção hoje parece estar na Realidade.",
      interpretation:
        "Seu mapa sugere que o plano pode estar sendo construído mais a partir do cenário desejado do que das condições atuais. Recursos, restrições, dependências e obstáculos não tornam o objetivo menor. Tornam a rota mais honesta e executável.",
      recognition:
        "O plano funciona muito bem até encontrar a agenda, o orçamento, o tempo ou as dependências reais.",
      firstMove:
        "Escolha um objetivo e liste quatro coisas: recursos disponíveis, restrições, obstáculos previsíveis e uma premissa que você está assumindo como verdadeira.",
    },
    prioridade: {
      editorialName: "O Colecionador de Prioridades",
      title: "Seu principal ponto de fricção hoje parece estar na Prioridade.",
      interpretation:
        "Suas respostas sugerem que o problema pode não ser falta de objetivos, mas excesso de competição entre eles. Quando muitas coisas recebem status de prioridade, nenhuma recebe proteção suficiente para avançar com consistência.",
      recognition: "Se tudo é prioridade, sua agenda acaba decidindo por você.",
      firstMove:
        "Escolha uma única prioridade para os próximos 7 dias e escreva explicitamente o que ficará em segundo plano para protegê-la.",
    },
    progresso: {
      editorialName: "O Ocupado sem Painel",
      title: "Seu principal ponto de fricção hoje parece estar no Progresso.",
      interpretation:
        "Seu mapa sugere que existe execução, mas pouca visibilidade sobre se o esforço está produzindo o resultado esperado. Sem indicadores simples, a sensação de estar ocupado pode substituir a leitura de progresso real.",
      recognition: "Você sabe o quanto trabalhou. Talvez saiba menos sobre o quanto avançou.",
      firstMove:
        "Escolha um objetivo e defina apenas um indicador de execução e um indicador de resultado para acompanhar durante 7 dias.",
    },
    adaptacao: {
      editorialName: "O Fiel ao Plano",
      title: "Seu principal ponto de fricção hoje parece estar na Adaptação.",
      interpretation:
        "Suas respostas sugerem que mudar a rota pode estar sendo confundido com abandonar o objetivo. Planejamento dinâmico exige distinguir compromisso com o resultado de apego à estratégia original.",
      recognition: "Talvez você esteja tentando salvar o plano quando deveria estar protegendo o objetivo.",
      firstMove:
        "Escolha um plano atual e escreva: “qual evidência me faria ajustar a rota?” e “qual alternativa eu testaria primeiro?”.",
    },
  },
  dualMessage:
    "Seu mapa mostra duas fricções muito próximas: {A} e {B}. Isso faz sentido porque planejamento funciona como sistema. Direção sem prioridade dispersa; prioridade sem realidade sobrecarrega; execução sem indicadores esconde progresso; plano sem revisão vira rigidez.",
  closingPhrase:
    "Talvez você não precise de um plano mais completo. Precise de uma rota clara o bastante para começar e flexível o bastante para sobreviver à realidade.",
  ctaPlan: "Quero meu Plano EPIC Planejamento de 7 dias.",
  ctaKit: "Conhecer o Kit Planejamento.",
  related: [
    { dimension: "autoconhecimento", when: "quando a pessoa ainda não sabe se o objetivo é realmente dela." },
    { dimension: "mentalidade", when: "quando excesso de análise transforma planejamento em refúgio." },
    { dimension: "coragem", when: "quando a rota está clara, mas risco, exposição ou consequência impedem o passo." },
    { dimension: "acao", when: "quando existe plano executável, mas o próximo passo não acontece." },
    { dimension: "inteligencia", when: "quando a pessoa precisa adaptar a estratégia a feedback e imprevistos do caminho." },
  ],
};
