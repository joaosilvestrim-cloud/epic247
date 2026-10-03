import type { DrenoId } from "./drenos";

export interface QuizOption {
  /** Texto exibido ao usuário. */
  texto: string;
  /** Peso de 0 a 3 atribuído ao Dreno da pergunta. */
  peso: 0 | 1 | 2 | 3;
}

export interface QuizQuestion {
  id: number;
  /** O Dreno que esta pergunta mede. */
  dreno: DrenoId;
  pergunta: string;
  /** 4 opções (a, b, c, d) com pesos de severidade crescente. */
  opcoes: [QuizOption, QuizOption, QuizOption, QuizOption];
}

// 15 perguntas — 3 por Dreno. Cada opção mapeia um peso (0–3) para o Dreno da pergunta.
// Máximo de 9 pontos por Dreno.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ── Sono Quebrado ──────────────────────────────────────────────
  {
    id: 1,
    dreno: "sono",
    pergunta: "Como você costuma acordar na maioria dos dias?",
    opcoes: [
      { texto: "Descansado e disposto, sem precisar de despertador.", peso: 0 },
      { texto: "Funcional, mas levo um tempo para 'engatar'.", peso: 1 },
      { texto: "Cansado, mesmo tendo dormido o suficiente em horas.", peso: 2 },
      { texto: "Exausto, como se não tivesse dormido.", peso: 3 },
    ],
  },
  {
    id: 2,
    dreno: "sono",
    pergunta: "Com que frequência você acorda no meio da noite?",
    opcoes: [
      { texto: "Quase nunca, durmo direto.", peso: 0 },
      { texto: "Às vezes, mas volto a dormir rápido.", peso: 1 },
      { texto: "Várias noites por semana.", peso: 2 },
      { texto: "Quase toda noite, e custo a voltar a dormir.", peso: 3 },
    ],
  },
  {
    id: 3,
    dreno: "sono",
    pergunta: "Seus horários de dormir e acordar são consistentes?",
    opcoes: [
      { texto: "Sim, são bem regulares todos os dias.", peso: 0 },
      { texto: "Razoavelmente, com pequenas variações.", peso: 1 },
      { texto: "Variam bastante entre semana e fim de semana.", peso: 2 },
      { texto: "São completamente imprevisíveis.", peso: 3 },
    ],
  },

  // ── Combustível Errado ─────────────────────────────────────────
  {
    id: 4,
    dreno: "combustivel",
    pergunta: "Como está sua energia depois das refeições?",
    opcoes: [
      { texto: "Estável e satisfeito.", peso: 0 },
      { texto: "Boa, com leve queda ocasional.", peso: 1 },
      { texto: "Sinto sono e queda de energia com frequência.", peso: 2 },
      { texto: "Quase sempre bate uma fadiga forte ('coma alimentar').", peso: 3 },
    ],
  },
  {
    id: 5,
    dreno: "combustivel",
    pergunta: "Com que frequência você sente fissura por açúcar ou cafeína à tarde?",
    opcoes: [
      { texto: "Raramente.", peso: 0 },
      { texto: "De vez em quando.", peso: 1 },
      { texto: "Quase todo dia.", peso: 2 },
      { texto: "Várias vezes ao dia, é um ciclo.", peso: 3 },
    ],
  },
  {
    id: 6,
    dreno: "combustivel",
    pergunta: "Como é a sua hidratação ao longo do dia?",
    opcoes: [
      { texto: "Bebo água com regularidade, fico bem hidratado.", peso: 0 },
      { texto: "Razoável, mas poderia melhorar.", peso: 1 },
      { texto: "Bebo pouca água, lembro só quando sinto sede.", peso: 2 },
      { texto: "Quase não bebo água, vivo à base de café/refri.", peso: 3 },
    ],
  },

  // ── Cortisol Crônico ───────────────────────────────────────────
  {
    id: 7,
    dreno: "cortisol",
    pergunta: "Como você descreveria seu nível de estresse na maioria dos dias?",
    opcoes: [
      { texto: "Tranquilo, lido bem com as demandas.", peso: 0 },
      { texto: "Moderado, mas sob controle.", peso: 1 },
      { texto: "Alto na maior parte do tempo.", peso: 2 },
      { texto: "Constante, sinto que nunca desligo.", peso: 3 },
    ],
  },
  {
    id: 8,
    dreno: "cortisol",
    pergunta: "Você consegue relaxar de verdade no fim do dia?",
    opcoes: [
      { texto: "Sim, desacelero sem dificuldade.", peso: 0 },
      { texto: "Geralmente sim, com algum esforço.", peso: 1 },
      { texto: "Tenho dificuldade, a mente continua acelerada.", peso: 2 },
      { texto: "Não consigo, fico em alerta o tempo todo.", peso: 3 },
    ],
  },
  {
    id: 9,
    dreno: "cortisol",
    pergunta: "Com que frequência você se sente sobrecarregado ou irritado?",
    opcoes: [
      { texto: "Raramente.", peso: 0 },
      { texto: "Algumas vezes por semana.", peso: 1 },
      { texto: "Quase todos os dias.", peso: 2 },
      { texto: "É o meu estado padrão.", peso: 3 },
    ],
  },

  // ── Atenção Sequestrada ────────────────────────────────────────
  {
    id: 10,
    dreno: "atencao",
    pergunta: "Quantas horas por dia você passa em telas (fora do trabalho essencial)?",
    opcoes: [
      { texto: "Menos de 1 hora.", peso: 0 },
      { texto: "Entre 1 e 3 horas.", peso: 1 },
      { texto: "Entre 3 e 5 horas.", peso: 2 },
      { texto: "Mais de 5 horas.", peso: 3 },
    ],
  },
  {
    id: 11,
    dreno: "atencao",
    pergunta: "Com que frequência você checa o celular sem motivo definido?",
    opcoes: [
      { texto: "Quase nunca, uso com intenção.", peso: 0 },
      { texto: "Algumas vezes por hora.", peso: 1 },
      { texto: "Constantemente, é quase automático.", peso: 2 },
      { texto: "Compulsivamente, não consigo evitar.", peso: 3 },
    ],
  },
  {
    id: 12,
    dreno: "atencao",
    pergunta: "Quanto tempo você consegue focar em uma tarefa sem se distrair?",
    opcoes: [
      { texto: "Mais de 45 minutos sem problema.", peso: 0 },
      { texto: "Cerca de 25 a 45 minutos.", peso: 1 },
      { texto: "Menos de 15 minutos.", peso: 2 },
      { texto: "Poucos minutos, me distraio o tempo todo.", peso: 3 },
    ],
  },

  // ── Corpo Parado ───────────────────────────────────────────────
  {
    id: 13,
    dreno: "movimento",
    pergunta: "Quantas vezes por semana você se movimenta de forma intencional?",
    opcoes: [
      { texto: "4 ou mais vezes.", peso: 0 },
      { texto: "2 a 3 vezes.", peso: 1 },
      { texto: "1 vez ou menos.", peso: 2 },
      { texto: "Praticamente nunca.", peso: 3 },
    ],
  },
  {
    id: 14,
    dreno: "movimento",
    pergunta: "Quanto tempo por dia você passa sentado?",
    opcoes: [
      { texto: "Menos de 4 horas, me movimento bastante.", peso: 0 },
      { texto: "Entre 4 e 6 horas.", peso: 1 },
      { texto: "Entre 6 e 9 horas.", peso: 2 },
      { texto: "Mais de 9 horas, fico parado quase o dia todo.", peso: 3 },
    ],
  },
  {
    id: 15,
    dreno: "movimento",
    pergunta: "Como está sua disposição física geral?",
    opcoes: [
      { texto: "Ótima, me sinto ágil e com energia.", peso: 0 },
      { texto: "Razoável.", peso: 1 },
      { texto: "Baixa, me canso fácil em esforços simples.", peso: 2 },
      { texto: "Muito baixa, sinto o corpo pesado e travado.", peso: 3 },
    ],
  },
];
