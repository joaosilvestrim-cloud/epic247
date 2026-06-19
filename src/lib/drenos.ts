// Os 5 Drenos do EPIC247 — Módulo Energia.
// A ordem do array define a hierarquia fisiológica usada no desempate biológico:
// Sono > Combustível > Estresse (Cortisol) > Tela (Atenção) > Movimento.

export type DrenoId =
  | "sono"
  | "combustivel"
  | "cortisol"
  | "atencao"
  | "movimento";

export interface Dreno {
  id: DrenoId;
  nome: string;
  /** Posição na hierarquia fisiológica (menor = mais prioritário no desempate). */
  hierarquia: number;
  headline: string;
  descricao: string;
  /** Os "4 próximos passos práticos" entregues no relatório do lead. */
  passos: string[];
  /** Micro-hábito sugerido como Mínimo Viável na plataforma. */
  microHabito: string;
  cor: string;
}

export const DRENOS: Record<DrenoId, Dreno> = {
  sono: {
    id: "sono",
    nome: "Sono Quebrado",
    hierarquia: 1,
    headline: "Seu Dreno Dominante é o Sono Quebrado.",
    descricao:
      "Você não está sem disciplina — está operando com a bateria nunca totalmente recarregada. Quando o sono é fragmentado ou curto, o cérebro entra no dia com a função executiva comprometida. Não é preguiça: é hardware sem energia.",
    passos: [
      "Estabeleça um horário fixo para acordar, inclusive nos fins de semana, por 7 dias.",
      "Corte cafeína após as 15h — ela tem meia-vida de ~6 horas e sabota o sono profundo.",
      "Crie um ritual de desaceleração de 30 minutos sem telas antes de deitar.",
      "Exponha-se à luz natural nos primeiros 30 minutos do dia para ancorar o ritmo circadiano.",
    ],
    microHabito: "Cortar cafeína após as 15h",
    cor: "#6366f1",
  },
  combustivel: {
    id: "combustivel",
    nome: "Combustível Errado",
    hierarquia: 2,
    headline: "Seu Dreno Dominante é o Combustível Errado.",
    descricao:
      "Você abastece o corpo com o que dá pico e queda. Picos de glicose seguidos de quedas bruscas geram a sensação de fadiga, névoa mental e fissura por açúcar no meio da tarde. O problema não é falta de força de vontade: é instabilidade metabólica.",
    passos: [
      "Beba 500ml de água antes do café da manhã para reidratar após o jejum noturno.",
      "Inclua proteína na primeira refeição para estabilizar a glicemia do dia.",
      "Troque o lanche açucarado da tarde por uma fonte de gordura boa ou proteína.",
      "Não pule refeições — jejuns não planejados intensificam a queda de energia.",
    ],
    microHabito: "Beber 500ml de água antes do café da manhã",
    cor: "#10b981",
  },
  cortisol: {
    id: "cortisol",
    nome: "Cortisol Crônico",
    hierarquia: 3,
    headline: "Seu Dreno Dominante é o Cortisol Crônico.",
    descricao:
      "Seu corpo está preso no modo alerta. O estresse constante mantém o cortisol elevado, o que esgota a energia, prejudica o sono e dificulta a recuperação. Você está sempre 'ligado', mas nunca descansado.",
    passos: [
      "Faça 3 ciclos de respiração 4-7-8 ao acordar e antes de tarefas difíceis.",
      "Crie uma fronteira clara entre trabalho e descanso (um ritual de encerramento).",
      "Reduza estímulos de notícias e redes nas primeiras e últimas horas do dia.",
      "Agende micro-pausas de 5 minutos a cada 90 minutos de foco.",
    ],
    microHabito: "3 ciclos de respiração 4-7-8 ao acordar",
    cor: "#f59e0b",
  },
  atencao: {
    id: "atencao",
    nome: "Atenção Sequestrada",
    hierarquia: 4,
    headline: "Seu Dreno Dominante é a Atenção Sequestrada.",
    descricao:
      "Sua energia mental vaza pelas telas. A troca constante de contexto e o excesso de estímulo digital fragmentam o foco e geram fadiga decisional. Você termina o dia exausto, mesmo sem ter produzido o que queria.",
    passos: [
      "Comece o dia com 30 minutos sem celular — nada de tela antes de você decidir suas prioridades.",
      "Desative notificações não essenciais e agrupe as checagens de mensagens.",
      "Use blocos de foco de 25 a 50 minutos com o celular fora de alcance.",
      "Defina um horário de corte para telas à noite.",
    ],
    microHabito: "Primeiros 30 minutos do dia sem celular",
    cor: "#ec4899",
  },
  movimento: {
    id: "movimento",
    nome: "Corpo Parado",
    hierarquia: 5,
    headline: "Seu Dreno Dominante é o Corpo Parado.",
    descricao:
      "Seu corpo está estagnado e isso derruba sua energia. A falta de movimento reduz a circulação, a disposição e a clareza mental. O movimento não é só sobre estética — é o gerador de energia que está desligado.",
    passos: [
      "Faça uma caminhada de 10 minutos logo após uma refeição principal.",
      "A cada hora sentado, levante e movimente-se por 2 minutos.",
      "Inclua 5 minutos de mobilidade ao acordar para ativar o corpo.",
      "Escolha uma forma de movimento que você goste — consistência vence intensidade.",
    ],
    microHabito: "Caminhada de 10 minutos após uma refeição",
    cor: "#3b82f6",
  },
};

/** Lista ordenada pela hierarquia fisiológica (usada no desempate). */
export const DRENOS_POR_HIERARQUIA: Dreno[] = Object.values(DRENOS).sort(
  (a, b) => a.hierarquia - b.hierarquia
);
