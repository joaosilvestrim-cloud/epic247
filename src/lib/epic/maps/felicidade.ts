// Mapa de Felicidade v1.0 — texto transcrito do documento
// "EPIC247 2.0 — Mapa de Felicidade v1.0" (pasta 08). Baseado no modelo
// PERMA. O percentual 50/10/40 do material legado NÃO é usado (doc §16).

import type { DimensionalMapConfig } from "./types";

export const FELICIDADE: DimensionalMapConfig = {
  kind: "dimensional",
  mapType: "felicidade",
  mapVersion: "1.0",
  scoringVersion: "1.0",
  resultCopyVersion: "1.0",
  title: "Mapa de Felicidade",
  disclaimer:
    "Este Mapa EPIC é uma autoavaliação educativa e comportamental. Não é instrumento clínico, psicológico ou diagnóstico.",
  estimatedMinutes: "3 a 4 minutos",
  axes: [
    { key: "emocoes_positivas", label: "Emoções Positivas" },
    { key: "engajamento", label: "Engajamento" },
    { key: "relacoes", label: "Relações" },
    { key: "significado", label: "Significado" },
    { key: "realizacao", label: "Realização" },
  ],
  questions: [
    { id: "F1", axis: "emocoes_positivas", reverse: false, text: "Ao longo de uma semana comum, percebo poucos momentos genuínos de prazer, leveza ou apreciação." },
    { id: "F2", axis: "emocoes_positivas", reverse: false, text: "Mesmo quando algo bom acontece, costumo passar rapidamente para a próxima preocupação ou obrigação sem realmente aproveitar." },
    { id: "F3", axis: "emocoes_positivas", reverse: true, text: "Consigo perceber e saborear pequenos momentos positivos no cotidiano sem precisar que algo extraordinário aconteça." },
    { id: "F4", axis: "engajamento", reverse: false, text: "Passo grande parte da semana apenas cumprindo tarefas, sem me sentir realmente absorvido ou interessado pelo que estou fazendo." },
    { id: "F5", axis: "engajamento", reverse: false, text: "Tenho poucos momentos em que perco a noção do tempo porque estou envolvido em algo que me mobiliza de verdade." },
    { id: "F6", axis: "engajamento", reverse: true, text: "Existem atividades na minha rotina que desafiam minhas capacidades e me fazem sentir presente e envolvido." },
    { id: "F7", axis: "relacoes", reverse: false, text: "Tenho pessoas ao meu redor, mas nem sempre sinto que posso dividir o que realmente importa para mim." },
    { id: "F8", axis: "relacoes", reverse: false, text: "Minha rotina frequentemente reduz o tempo e a qualidade de presença que dedico às relações importantes." },
    { id: "F9", axis: "relacoes", reverse: true, text: "Tenho relações em que existe troca, confiança e sensação real de conexão." },
    { id: "F10", axis: "significado", reverse: false, text: "Às vezes tenho dificuldade de enxergar por que aquilo que faço importa além de simplesmente cumprir responsabilidades." },
    { id: "F11", axis: "significado", reverse: false, text: "Posso estar avançando em objetivos sem sentir que eles estão conectados a algo maior ou verdadeiramente relevante para mim." },
    { id: "F12", axis: "significado", reverse: true, text: "Consigo perceber como parte importante da minha rotina se conecta a valores, pessoas, contribuição ou algo que considero significativo." },
    { id: "F13", axis: "realizacao", reverse: false, text: "Mesmo quando concluo coisas importantes, tenho dificuldade de reconhecer progresso ou sentir satisfação antes de pensar na próxima meta." },
    { id: "F14", axis: "realizacao", reverse: false, text: "Tenho a sensação de estar sempre correndo atrás e raramente de estar avançando." },
    { id: "F15", axis: "realizacao", reverse: true, text: "Consigo reconhecer conquistas e progresso sem precisar que tudo esteja concluído ou perfeito." },
  ],
  profiles: {
    emocoes_positivas: {
      editorialName: "O Adiador do Agora",
      title: "Seu principal ponto de fricção hoje parece estar nas Emoções Positivas.",
      interpretation:
        "Suas respostas sugerem que a vida pode estar sendo vivida com a sensação de que o prazer, a leveza ou a satisfação sempre começam depois. O problema não é ausência de grandes acontecimentos. Pode ser falta de espaço para perceber e saborear o que já acontece de bom no cotidiano.",
      recognition:
        "Você pode estar usando o presente como corredor para chegar a um futuro onde finalmente pretende viver.",
      firstMove:
        "Durante 7 dias, escolha um momento positivo por dia e permaneça deliberadamente alguns segundos nele antes de passar para a próxima tarefa. Registre apenas o que aconteceu e o que você percebeu.",
    },
    engajamento: {
      editorialName: "O Funcional",
      title: "Seu principal ponto de fricção hoje parece estar no Engajamento.",
      interpretation:
        "Seu mapa sugere que sua rotina pode estar eficiente o suficiente para funcionar, mas pobre em experiências que realmente capturam atenção, curiosidade ou envolvimento. A vida segue, mas pouco do que acontece exige presença inteira.",
      recognition: "Você pode estar ocupado quase o tempo todo e envolvido de verdade em muito pouco.",
      firstMove:
        "Identifique uma atividade da última semana em que se sentiu mais presente, curioso ou absorvido. Pergunte o que havia nela: desafio, autonomia, criação, aprendizado, contato humano ou outra característica.",
    },
    relacoes: {
      editorialName: "O Cercado",
      title: "Seu principal ponto de fricção hoje parece estar nas Relações.",
      interpretation:
        "Suas respostas sugerem que quantidade de contatos e qualidade de conexão podem não estar andando juntas. É possível estar cercado de pessoas, conversas e obrigações relacionais e ainda sentir pouca troca, presença ou intimidade real.",
      recognition: "Talvez você não esteja sozinho. Talvez esteja pouco acompanhado de verdade.",
      firstMove:
        "Escolha uma relação importante e crie uma pequena interação sem função prática: uma conversa, mensagem, encontro ou gesto cujo único objetivo seja presença e conexão.",
    },
    significado: {
      editorialName: "O Desconectado",
      title: "Seu principal ponto de fricção hoje parece estar no Significado.",
      interpretation:
        "Seu resultado sugere que talvez você esteja fazendo muito sem conseguir responder com clareza por que aquilo importa. Significado não exige uma missão grandiosa. Pode aparecer na relação entre o que você faz, quem isso serve, quais valores protege e que tipo de vida ajuda a construir.",
      recognition:
        "Você pode estar avançando e, ao mesmo tempo, se perguntando para onde isso tudo está levando.",
      firstMove:
        "Escolha uma atividade relevante da sua rotina e complete três frases: “isso importa para mim porque…”, “isso ajuda quem ou o quê?”, “se eu parasse de fazer isso, o que perderia sentido?”.",
    },
    realizacao: {
      editorialName: "O Inacabado",
      title: "Seu principal ponto de fricção hoje parece estar na Realização.",
      interpretation:
        "Suas respostas sugerem dificuldade de registrar progresso como progresso. Metas concluídas podem virar rapidamente piso para a próxima cobrança, fazendo com que a experiência subjetiva seja sempre de insuficiência, mesmo quando existe avanço real.",
      recognition: "Você pode estar produzindo resultados sem permitir que eles contem como resultado.",
      firstMove:
        "Liste três avanços dos últimos 90 dias que normalmente descartaria como pequenos ou incompletos. Para cada um, registre o que ele exigiu de você e o que agora existe que antes não existia.",
    },
  },
  dualMessage:
    "Seu mapa mostra duas fricções muito próximas: {A} e {B}. Isso faz sentido porque felicidade funciona como sistema: relações influenciam emoções, significado influencia engajamento e realização afeta a forma como percebemos o caminho.",
  closingPhrase:
    "Talvez você não precise esperar a vida melhorar para começar a vivê-la melhor. Precisa descobrir qual parte da experiência ficou pequena demais no caminho.",
  ctaPlan: "Quero meu Plano EPIC Felicidade de 7 dias.",
  ctaKit: "Conhecer o Kit Felicidade.",
  safetyNote:
    "Este Mapa observa a qualidade da sua experiência cotidiana. Se existe sofrimento persistente, intenso ou que atrapalha sua vida de forma relevante, procure avaliação profissional.",
  related: [
    { dimension: "energia", when: "quando a pessoa quer viver melhor, mas está exausta demais para sentir presença ou prazer." },
    { dimension: "autoconhecimento", when: "quando existe baixa clareza sobre desejos, valores e direção." },
    { dimension: "amor", when: "quando pertencimento, vínculo e intimidade aparecem como centro da tensão." },
    { dimension: "planejamento", when: "quando a pessoa sabe o que importa, mas a rotina não reserva espaço para isso." },
    { dimension: "excelencia", when: "quando cobrança por desempenho impede reconhecer progresso e satisfação." },
  ],
};
