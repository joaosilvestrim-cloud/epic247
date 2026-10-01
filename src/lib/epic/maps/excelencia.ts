// Mapa de Excelência v1.0 — texto transcrito do documento
// "EPIC247 2.0 — Mapa de Excelência v1.0" (pasta 08).

import type { DimensionalMapConfig } from "./types";

export const EXCELENCIA: DimensionalMapConfig = {
  kind: "dimensional",
  mapType: "excelencia",
  mapVersion: "1.0",
  scoringVersion: "1.0",
  resultCopyVersion: "1.0",
  title: "Mapa de Excelência",
  disclaimer:
    "Este Mapa EPIC é uma autoavaliação educativa e comportamental. Não é instrumento clínico, psicológico ou diagnóstico.",
  estimatedMinutes: "3 a 4 minutos",
  axes: [
    { key: "padrao", label: "Padrão" },
    { key: "pratica", label: "Prática" },
    { key: "feedback", label: "Feedback" },
    { key: "refinamento", label: "Refinamento" },
    { key: "sustentabilidade", label: "Sustentabilidade" },
  ],
  questions: [
    { id: "EX1", axis: "padrao", reverse: false, text: "Tenho dificuldade de definir o que significa uma entrega “boa o suficiente” antes de começar." },
    { id: "EX2", axis: "padrao", reverse: false, text: "Às vezes aumento tanto meu padrão que termino atrasando, complicando ou abandonando uma entrega." },
    { id: "EX3", axis: "padrao", reverse: true, text: "Consigo diferenciar com clareza o que precisa estar apenas concluído, o que precisa estar bom e o que realmente merece nível excelente." },
    { id: "EX4", axis: "pratica", reverse: false, text: "Repito uma atividade muitas vezes sem definir exatamente qual habilidade estou tentando melhorar." },
    { id: "EX5", axis: "pratica", reverse: false, text: "Costumo praticar mais aquilo que já sei fazer bem do que aquilo que realmente precisa ser desenvolvido." },
    { id: "EX6", axis: "pratica", reverse: true, text: "Quando quero melhorar algo, consigo quebrar a habilidade em partes específicas e treinar uma delas com intenção." },
    { id: "EX7", axis: "feedback", reverse: false, text: "Continuo executando por longos períodos sem buscar sinais claros de onde estou acertando ou errando." },
    { id: "EX8", axis: "feedback", reverse: false, text: "Quando recebo feedback crítico, minha primeira reação tende a ser me defender, explicar ou desvalorizar a opinião." },
    { id: "EX9", axis: "feedback", reverse: true, text: "Consigo transformar feedback relevante em um ajuste concreto para a próxima tentativa." },
    { id: "EX10", axis: "refinamento", reverse: false, text: "Depois que algo funciona, tenho tendência a repetir do mesmo jeito por bastante tempo sem revisar se poderia funcionar melhor." },
    { id: "EX11", axis: "refinamento", reverse: false, text: "Minha atenção fica mais concentrada em concluir do que em aprender o que tornaria a próxima execução melhor." },
    { id: "EX12", axis: "refinamento", reverse: true, text: "Costumo fazer pequenas revisões após uma entrega para decidir o que manter, ajustar ou elevar na próxima vez." },
    { id: "EX13", axis: "sustentabilidade", reverse: false, text: "Para entregar em alto nível, frequentemente sinto que preciso gastar energia ou tempo além do que consigo sustentar." },
    { id: "EX14", axis: "sustentabilidade", reverse: false, text: "Tenho dificuldade de manter qualidade quando não estou em um período de alta motivação, pressão ou dedicação intensa." },
    { id: "EX15", axis: "sustentabilidade", reverse: true, text: "Consigo manter um padrão alto de qualidade sem transformar cada entrega em prova de valor pessoal ou esforço extremo." },
  ],
  profiles: {
    padrao: {
      editorialName: "O Perfeccionista Funcional",
      title: "Seu principal ponto de fricção hoje parece estar no Padrão.",
      interpretation:
        "Suas respostas sugerem que a busca por qualidade pode estar sem um critério claro de parada. Quando tudo merece excelência máxima, o padrão deixa de orientar e passa a pesar. Excelência exige saber onde elevar e onde simplesmente concluir bem.",
      recognition:
        "Você pode estar tentando entregar nível máximo em coisas que só precisavam estar bem resolvidas.",
      firstMove:
        "Escolha uma entrega atual e defina antes de continuar três critérios: mínimo aceitável, bom e excelente. Decida qual nível essa entrega realmente merece.",
    },
    pratica: {
      editorialName: "O Repetidor",
      title: "Seu principal ponto de fricção hoje parece estar na Prática.",
      interpretation:
        "Seu mapa sugere que existe experiência e repetição, mas talvez pouco treino deliberado. Fazer muitas vezes não garante melhorar. A evolução depende de saber qual sub-habilidade está sendo treinada e de entrar conscientemente numa zona de aprendizado.",
      recognition: "Você pode estar ficando mais experiente sem necessariamente ficar melhor.",
      firstMove:
        "Escolha uma habilidade importante e escreva: “qual parte específica dela, se eu melhorar 10%, teria maior impacto no resultado?”. Treine apenas essa parte numa sessão curta.",
    },
    feedback: {
      editorialName: "O Autossuficiente",
      title: "Seu principal ponto de fricção hoje parece estar no Feedback.",
      interpretation:
        "Suas respostas sugerem que talvez você esteja tentando melhorar com pouca informação externa ou objetiva sobre a qualidade da execução. Sem feedback, é fácil repetir o que já funciona parcialmente e também repetir erros invisíveis.",
      recognition:
        "Você pode estar avaliando sua evolução quase exclusivamente pelo esforço que fez, e não pela qualidade do retorno que recebeu.",
      firstMove:
        "Escolha uma entrega recente e peça uma única resposta objetiva a alguém relevante: “qual mudança aumentaria mais a qualidade disso?”.",
    },
    refinamento: {
      editorialName: "O Competente Estagnado",
      title: "Seu principal ponto de fricção hoje parece estar no Refinamento.",
      interpretation:
        "Seu mapa sugere que você consegue entregar, mas pode estar faltando um ciclo consciente de melhoria. Depois que algo funciona, o cérebro naturalmente tende a repetir. Excelência aparece quando a repetição ganha revisão e pequenos ajustes intencionais.",
      recognition:
        "Talvez você não esteja piorando. Mas também pode ter parado de aprender com o que já faz bem.",
      firstMove:
        "Ao terminar uma próxima entrega, responda apenas três perguntas: o que manter, o que ajustar, o que elevar.",
    },
    sustentabilidade: {
      editorialName: "O Herói da Entrega",
      title: "Seu principal ponto de fricção hoje parece estar na Sustentabilidade.",
      interpretation:
        "Suas respostas sugerem que qualidade pode estar dependendo de esforço extraordinário, pressão ou sacrifício recorrente. Isso produz boas entregas no curto prazo, mas não necessariamente uma cultura de excelência. Excelência sustentável precisa sobreviver à vida comum.",
      recognition:
        "Se toda boa entrega exige uma versão heroica de você, o sistema ainda não está excelente.",
      firstMove:
        "Escolha uma entrega recorrente e identifique uma melhoria de processo que permita manter qualidade usando menos improviso ou esforço extraordinário.",
    },
  },
  dualMessage:
    "Seu mapa mostra duas fricções muito próximas: {A} e {B}. Isso faz sentido porque excelência funciona como um sistema. Padrão sem feedback vira rigidez; prática sem refinamento vira repetição; qualidade sem sustentabilidade vira exaustão.",
  closingPhrase:
    "Talvez o próximo nível não exija que você se esforce mais. Talvez exija que você aprenda melhor com cada repetição.",
  ctaPlan: "Quero meu Plano EPIC Excelência de 7 dias.",
  ctaKit: "Conhecer o Kit Excelência.",
  related: [
    { dimension: "mentalidade", when: "quando a busca por qualidade é dominada por medo do erro ou identidade ameaçada." },
    { dimension: "planejamento", when: "quando não existe critério claro de resultado ou prioridade." },
    { dimension: "acao", when: "quando o problema principal ainda é começar ou manter consistência básica." },
    { dimension: "inteligencia", when: "quando feedback e imprevistos exigem adaptação antes de refinamento." },
    { dimension: "energia", when: "quando a qualidade depende de sobrecarga e não de um sistema sustentável." },
  ],
};
