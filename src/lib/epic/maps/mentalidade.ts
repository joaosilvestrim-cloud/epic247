// Mapa de Mentalidade v1.0 — texto transcrito do documento
// "EPIC247 2.0 — Mapa de Mentalidade v1.0" (pasta 08).

import type { DimensionalMapConfig } from "./types";

export const MENTALIDADE: DimensionalMapConfig = {
  kind: "dimensional",
  mapType: "mentalidade",
  mapVersion: "1.0",
  scoringVersion: "1.0",
  resultCopyVersion: "1.0",
  title: "Mapa de Mentalidade",
  disclaimer:
    "Este Mapa EPIC é uma autoavaliação educativa e comportamental. Não é instrumento clínico, psicológico ou diagnóstico.",
  estimatedMinutes: "3 a 4 minutos",
  axes: [
    { key: "analise", label: "Excesso de Análise" },
    { key: "crencas", label: "Crenças Operacionais" },
    { key: "erro", label: "Medo do Erro" },
    { key: "autoprotecao", label: "Autoproteção" },
    { key: "reatividade", label: "Reatividade" },
  ],
  questions: [
    { id: "M1", axis: "analise", reverse: false, text: "Antes de tomar decisões importantes, costumo simular tantos cenários que fico mais confuso do que claro." },
    { id: "M2", axis: "analise", reverse: false, text: "Continuo buscando informação mesmo quando já tenho o suficiente para dar um próximo passo razoável." },
    { id: "M3", axis: "analise", reverse: true, text: "Consigo reconhecer quando pensar mais deixou de melhorar a decisão e passou apenas a adiá-la." },
    { id: "M4", axis: "crencas", reverse: false, text: "Existem situações em que penso “isso não é para mim”, “eu não sou esse tipo de pessoa” ou algo semelhante antes mesmo de testar." },
    { id: "M5", axis: "crencas", reverse: false, text: "Minhas expectativas sobre quem eu deveria ser influenciam fortemente o que tento e o que evito." },
    { id: "M6", axis: "crencas", reverse: true, text: "Consigo tratar minhas crenças como hipóteses que podem ser testadas, e não como verdades definitivas sobre mim." },
    { id: "M7", axis: "erro", reverse: false, text: "Quando existe chance de errar publicamente, tendo a adiar, preparar mais ou reduzir minha exposição." },
    { id: "M8", axis: "erro", reverse: false, text: "Um erro costuma afetar minha percepção sobre minha própria capacidade mais do que eu gostaria." },
    { id: "M9", axis: "erro", reverse: true, text: "Consigo separar “isso não funcionou” de “eu não sou capaz”." },
    { id: "M10", axis: "autoprotecao", reverse: false, text: "Às vezes encontro argumentos muito convincentes para não fazer justamente aquilo que me deixaria mais exposto ou vulnerável." },
    { id: "M11", axis: "autoprotecao", reverse: false, text: "Percebo que parte da minha procrastinação ou desistência aparece quando existe risco de julgamento, vergonha ou sensação de não ser suficiente." },
    { id: "M12", axis: "autoprotecao", reverse: true, text: "Consigo perceber quando um argumento racional está realmente protegendo uma necessidade legítima e quando está apenas protegendo minha imagem ou conforto." },
    { id: "M13", axis: "reatividade", reverse: false, text: "Quando algo me contraria, pressiona ou frustra, respondo antes de conseguir organizar o que realmente penso." },
    { id: "M14", axis: "reatividade", reverse: false, text: "Em situações de estresse, tenho dificuldade de criar espaço entre o impulso inicial e a decisão que tomo." },
    { id: "M15", axis: "reatividade", reverse: true, text: "Consigo fazer uma pequena pausa antes de responder a situações importantes, especialmente quando estou emocionalmente ativado." },
  ],
  profiles: {
    analise: {
      editorialName: "O Simulador",
      title: "Seu principal ponto de fricção hoje parece estar no Excesso de Análise.",
      interpretation:
        "Suas respostas sugerem que pensar está sendo usado até depois do ponto em que gera clareza. Simular cenários, prever riscos e buscar mais informação pode dar sensação de controle, mas também prolongar a distância entre decisão e experiência real.",
      recognition:
        "Talvez você não precise pensar melhor. Talvez precise descobrir em que momento pensar mais deixou de ajudar.",
      firstMove:
        "Escolha uma decisão atual e escreva duas colunas: “o que já sei” e “o que só descobrirei agindo”.",
    },
    crencas: {
      editorialName: "O Definido",
      title: "Seu principal ponto de fricção hoje parece estar nas Crenças Operacionais.",
      interpretation:
        "Seu mapa sugere que algumas interpretações sobre quem você é podem estar funcionando como regras invisíveis. Elas influenciam o que tenta, o que evita e o que considera possível antes que a realidade tenha chance de responder.",
      recognition: "Às vezes a frase ‘eu sou assim’ encerra uma experiência antes mesmo de ela começar.",
      firstMove:
        "Escolha uma crença recorrente sobre você e reescreva como hipótese: “Até hoje, em algumas situações, eu tenho agido como se…”. Depois observe o que muda.",
    },
    erro: {
      editorialName: "O Provador",
      title: "Seu principal ponto de fricção hoje parece estar no Medo do Erro.",
      interpretation:
        "Suas respostas sugerem que errar pode estar carregando um significado maior do que apenas obter um resultado ruim. Quando erro vira ameaça à identidade, aprender custa mais e tentar fica mais pesado.",
      recognition:
        "Você pode estar tentando acertar não apenas para ter um bom resultado, mas para continuar acreditando que é capaz.",
      firstMove:
        "Pegue um erro recente e separe em três linhas: fato, interpretação e aprendizado. Não permita que a interpretação ocupe o lugar do fato.",
    },
    autoprotecao: {
      editorialName: "O Advogado Interno",
      title: "Seu principal ponto de fricção hoje parece estar na Autoproteção.",
      interpretation:
        "Seu resultado sugere que sua inteligência pode estar produzindo argumentos sofisticados para evitar desconforto, exposição ou risco à autoimagem. Isso não significa fraqueza. Significa que uma parte do sistema está tentando proteger você de alguma ameaça percebida.",
      recognition: "A justificativa pode ser racional e, ainda assim, estar servindo a um medo.",
      firstMove:
        "Diante de uma justificativa recorrente para adiar algo, complete: “Se eu fizesse isso, o que eu estaria arriscando sentir sobre mim ou sobre como os outros me veem?”.",
    },
    reatividade: {
      editorialName: "O Automático",
      title: "Seu principal ponto de fricção hoje parece estar na Reatividade.",
      interpretation:
        "Suas respostas sugerem pouco espaço entre estímulo e resposta em momentos de pressão. Quando esse espaço desaparece, decisões importantes podem ser tomadas mais para aliviar o momento do que para servir ao que realmente importa.",
      recognition: "Às vezes você só percebe o que realmente queria ter dito depois que já respondeu.",
      firstMove:
        "Escolha um gatilho cotidiano e defina uma pausa mínima antes de responder, mesmo que seja apenas uma respiração e a pergunta: “o que quero produzir com essa resposta?”.",
    },
  },
  dualMessage:
    "Seu mapa mostra duas fricções muito próximas: {A} e {B}. Isso faz sentido porque padrões mentais costumam operar em sequência: uma crença pode aumentar medo de erro; medo de erro pode gerar análise excessiva; análise pode virar autoproteção.",
  closingPhrase:
    "Talvez você não precise controlar melhor seus pensamentos. Precise perceber quais deles ainda merecem comandar suas decisões.",
  ctaPlan: "Quero meu Plano EPIC Mentalidade de 7 dias.",
  ctaKit: "Conhecer o Kit Mentalidade.",
  safetyNote:
    "Este Mapa ajuda a observar como você pensa e decide. Ele não substitui psicoterapia, avaliação profissional ou tratamento de saúde mental.",
  related: [
    { dimension: "energia", when: "quando sobrecarga física/mental reduz capacidade de decidir e executar." },
    { dimension: "autoconhecimento", when: "quando a pessoa não sabe se a decisão combina com quem é ou com o que deseja." },
    { dimension: "coragem", when: "quando a interpretação está clara, mas exposição, risco ou consequência impedem movimento." },
    { dimension: "acao", when: "quando a pessoa já compreendeu o padrão e ainda assim não transforma clareza em comportamento." },
    { dimension: "inteligencia", when: "quando a questão principal é aprender, adaptar e usar feedback depois da experiência." },
  ],
};
