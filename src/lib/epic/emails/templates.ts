// Modelos de e-mail das automações (Funis §12-23, Matriz de Automações).
// Tom (Funis §33): humano, direto, inteligente, aplicável. Sem urgência
// falsa, sem "última chance", sem afirmar que o sistema sabe o que a pessoa
// sente. Estrutura: Cena → Tensão → Insight → Movimento.
//
// `aprovado: false` = rascunho. Em produção, rascunho de prioridade >= 3
// não é enviado (RF-095). Transacionais (1 e 2) saem mesmo em rascunho,
// porque a pessoa pediu: o miolo deles vem de copy aprovada dos Mapas.

import type { BlocoEmail } from "./layout";

export interface DadosEmail {
  nome: string | null;
  dimensaoNome?: string;
  mapa?: {
    nome: string; // "Mapa de Energia" / "Mapa de Fricção"
    titulo: string;
    interpretacao: string;
    primeiroMovimento: string;
    reconhecimento?: string;
    padraoNome?: string;
    nomeEditorial?: string | null;
    secundarioNome?: string;
    resultadoUrl: string;
    friccao: boolean;
    relacionadas?: { nome: string; quando: string; url: string }[];
    ferramenta?: string | null;
    fechamento?: string;
  };
  mapaUrl?: string;
  planoUrl?: string | null;
  planoPronto?: boolean;
  planoOfertaUrl?: string | null;
  kitUrl?: string | null;
  produtoNome?: string;
  checkoutUrl?: string | null;
  protocoloUrl: string;
  mentoriaUrl: string;
  mapaFriccaoUrl: string;
  ideiasUrl: string;
}

export interface EmailPronto {
  assunto: string;
  preheader: string;
  blocos: BlocoEmail[];
  aprovado: boolean;
}

const ola = (d: DadosEmail) => (d.nome ? `Olá, ${d.nome}.` : "Olá.");
const t = (texto: string): BlocoEmail => ({ tipo: "texto", texto });
const destaque = (texto: string): BlocoEmail => ({ tipo: "destaque", texto });
const citacao = (texto: string): BlocoEmail => ({ tipo: "citacao", texto });
const botao = (texto: string, href: string): BlocoEmail => ({ tipo: "botao", texto, href });
const pequeno = (texto: string): BlocoEmail => ({ tipo: "pequeno", texto });
const lista = (itens: string[]): BlocoEmail => ({ tipo: "lista", itens });
const se = <T,>(cond: unknown, ...b: T[]): T[] => (cond ? b : []);

const AVISO_MAPA =
  "O Mapa EPIC é uma ferramenta educativa de autoavaliação. Ele sugere onde vale olhar primeiro e não substitui avaliação profissional.";

export const TEMPLATES: Record<string, (d: DadosEmail) => EmailPronto> = {
  // ─────────────── Mapas ───────────────
  map_result: (d) => {
    const m = d.mapa!;
    return {
      assunto: m.friccao ? `Seu ponto de fricção hoje: ${d.dimensaoNome}` : `Seu ${m.nome}`,
      preheader: m.titulo,
      aprovado: false,
      blocos: [
        t(ola(d)),
        t(`Aqui está o seu ${m.nome}, para você guardar e voltar quando quiser.`),
        destaque(m.titulo),
        ...se(m.reconhecimento, citacao(m.reconhecimento!)),
        t(m.interpretacao),
        t("Seu primeiro movimento:"),
        destaque(m.primeiroMovimento),
        botao("Ver meu mapa completo", m.resultadoUrl),
        ...se(
          m.friccao && d.mapaUrl,
          t(`O próximo passo é entender o que está acontecendo dentro de ${d.dimensaoNome}.`),
          botao(`Fazer o Mapa de ${d.dimensaoNome}`, d.mapaUrl!)
        ),
        ...se(
          !m.friccao && d.planoOfertaUrl,
          t(`Se quiser transformar isso em 7 dias de prática, o Plano EPIC ${d.dimensaoNome} é personalizado a partir das suas respostas.`),
          botao(`Quero meu Plano EPIC ${d.dimensaoNome}`, d.planoOfertaUrl!)
        ),
        pequeno(AVISO_MAPA),
      ],
    };
  },

  nurture_reconhecimento: (d) => {
    const m = d.mapa!;
    return {
      assunto: `Onde ${m.padraoNome?.toLowerCase()} aparece no seu dia`,
      preheader: m.reconhecimento ?? "",
      aprovado: false,
      blocos: [
        t(ola(d)),
        t(`Ontem o seu ${m.nome} apontou ${m.padraoNome} como principal ponto de fricção. Hoje a ideia é só perceber onde isso aparece.`),
        citacao(m.reconhecimento ?? ""),
        t("Não precisa mudar nada ainda. Repare em um momento de hoje em que essa frase pareceu verdade. Só isso já muda a forma de olhar."),
        ...se(d.planoOfertaUrl, botao("Conhecer o Plano de 7 dias", d.planoOfertaUrl!)),
      ],
    };
  },

  nurture_mecanismo: (d) => {
    const m = d.mapa!;
    return {
      assunto: `Por que ${m.padraoNome?.toLowerCase()} se mantém`,
      preheader: "Entender antes de se cobrar.",
      aprovado: false,
      blocos: [
        t(ola(d)),
        t("Padrões não se mantêm por falta de força de vontade. Eles se mantêm porque, de algum jeito, funcionam no curto prazo."),
        t(m.interpretacao),
        ...se(m.secundarioNome, t(`No seu mapa, ${m.secundarioNome} apareceu logo atrás. As duas áreas costumam se alimentar.`)),
        t("Entender o mecanismo é o que permite mudar sem depender de uma motivação que não dura."),
        ...se(d.planoOfertaUrl, botao("Transformar em prática com o Plano", d.planoOfertaUrl!)),
        ...se(!d.planoOfertaUrl && d.kitUrl, botao(`Conhecer o Kit ${d.dimensaoNome}`, d.kitUrl!)),
      ],
    };
  },

  nurture_ferramenta: (d) => {
    const m = d.mapa!;
    return {
      assunto: "Uma ferramenta para esta semana",
      preheader: "Pequena o bastante para acontecer.",
      aprovado: false,
      blocos: [
        t(ola(d)),
        t("Uma ferramenta simples, ligada ao seu padrão. Pequena de propósito."),
        destaque(m.ferramenta ?? m.primeiroMovimento),
        t("Faça uma vez antes de decidir se funciona para você."),
        ...se(
          d.kitUrl,
          t(`O Kit ${d.dimensaoNome} reúne Manual, Workbook e as ferramentas para trabalhar ${d.dimensaoNome?.toLowerCase()} com profundidade.`),
          botao(`Conhecer o Kit ${d.dimensaoNome}`, d.kitUrl!)
        ),
      ],
    };
  },

  nurture_integracao: (d) => {
    const m = d.mapa!;
    return {
      assunto: `${d.dimensaoNome} não existe sozinha`,
      preheader: "10 dimensões. Um sistema.",
      aprovado: false,
      blocos: [
        t(ola(d)),
        t(`Às vezes a fricção que aparece em ${d.dimensaoNome?.toLowerCase()} está sendo alimentada por outra dimensão.`),
        ...se(
          m.relacionadas?.length,
          lista((m.relacionadas ?? []).slice(0, 3).map((r) => `${r.nome}: ${r.quando}`))
        ),
        t("Você pode começar por uma dimensão específica. Mas algumas mudanças exigem olhar o sistema inteiro."),
        botao("Conhecer o Protocolo EPIC247", d.protocoloUrl),
      ],
    };
  },

  map_abandon: (d) => ({
    assunto: `Seu ${d.mapa?.nome ?? "Mapa"} ficou pela metade`,
    preheader: "Pode continuar de onde parou.",
    aprovado: true, // mensagem-base da Matriz de Automações
    blocos: [
      t(ola(d)),
      t(`Você começou seu ${d.mapa?.nome ?? "Mapa"} e parou no caminho. Se ainda fizer sentido, pode continuar de onde parou.`),
      ...se(d.mapaUrl, botao("Continuar meu Mapa", d.mapaUrl!)),
    ],
  }),

  // ─────────────── Plano ───────────────
  plan_delivery: (d) => ({
    assunto: d.planoPronto ? `Seu Plano EPIC ${d.dimensaoNome} está pronto` : `Falta um passo para o seu Plano EPIC ${d.dimensaoNome}`,
    preheader: "Personalizado a partir das suas respostas.",
    aprovado: false,
    blocos: d.planoPronto
      ? [
          t(ola(d)),
          t(`Seu Plano EPIC ${d.dimensaoNome} de 7 dias está pronto. Ele foi personalizado a partir das suas respostas no Mapa.`),
          botao("Abrir meu Plano", d.planoUrl!),
          t("Como usar: um dia de cada vez, sem tentar compensar o que ficou para trás. No dia 7, você revisa o que fica."),
          pequeno("Guarde este e-mail: o link acima é o seu acesso ao Plano."),
        ]
      : [
          t(ola(d)),
          t(`Obrigado pela compra. Para personalizar o seu Plano EPIC ${d.dimensaoNome}, precisamos das suas respostas no Mapa.`),
          t("São 15 afirmações, de 3 a 4 minutos. Assim que você concluir, o Plano fica pronto e chega no seu e-mail."),
          ...se(d.mapaUrl, botao(`Fazer o Mapa de ${d.dimensaoNome}`, d.mapaUrl!)),
        ],
  }),
  plan_ready: (d) => ({
    assunto: `Seu Plano EPIC ${d.dimensaoNome} está pronto`,
    preheader: "Personalizado a partir das suas respostas.",
    aprovado: false,
    blocos: [
      t(ola(d)),
      t("Recebemos suas respostas. O seu Plano de 7 dias já está pronto."),
      botao("Abrir meu Plano", d.planoUrl!),
    ],
  }),
  plan_d2: (d) => ({
    assunto: "Dia 2: o padrão a observar",
    preheader: "Antes de mudar, perceber.",
    aprovado: false,
    blocos: [
      t(ola(d)),
      t("Hoje o Plano pede só uma coisa: perceber onde o padrão aparece. Observar ainda não é agir, mas é o que torna a ação possível."),
      ...se(d.planoUrl, botao("Ver o dia 2 do meu Plano", d.planoUrl!)),
    ],
  }),
  plan_d4: (d) => ({
    assunto: "Dia 4: hora do primeiro movimento",
    preheader: "Pequeno o bastante para acontecer.",
    aprovado: false,
    blocos: [
      t(ola(d)),
      t("Chegou o primeiro movimento do seu Plano. Ele é pequeno de propósito: o objetivo é acontecer, não impressionar."),
      t("Se um dia falhar, volte no seguinte sem tentar compensar."),
      ...se(d.planoUrl, botao("Ver o dia 4 do meu Plano", d.planoUrl!)),
    ],
  }),
  plan_d7: (d) => ({
    assunto: "O que você descobriu nesses 7 dias?",
    preheader: "Revisão do seu Plano.",
    aprovado: false,
    blocos: [
      t(ola(d)),
      destaque("O que você descobriu nesses 7 dias?"),
      t("Antes de decidir o que fica, responda as perguntas de revisão do seu Plano. Elas mostram o que funcionou e o que travou."),
      ...se(d.planoUrl, botao("Fazer a revisão do dia 7", d.planoUrl!)),
      ...se(
        d.kitUrl,
        t(`Se quiser ir mais fundo em ${d.dimensaoNome?.toLowerCase()}, o Kit reúne Manual, Workbook e ferramentas práticas.`),
        botao(`Aprofundar com o Kit ${d.dimensaoNome}`, d.kitUrl!)
      ),
    ],
  }),

  // ─────────────── Kit ───────────────
  kit_delivery: (d) => ({
    assunto: `Seu Kit ${d.dimensaoNome} chegou`,
    preheader: "Por onde começar.",
    aprovado: false,
    blocos: [
      t(ola(d)),
      t(`Seu acesso ao Kit ${d.dimensaoNome} foi enviado pela plataforma de pagamento, no e-mail da compra.`),
      t("Uma sugestão de ordem: leia o Manual primeiro, para entender o mecanismo. Depois abra o Workbook e faça um exercício por dia."),
    ],
  }),
  kit_d2: (d) => ({
    assunto: "Por onde começar o seu Kit",
    preheader: "Um exercício por dia basta.",
    aprovado: false,
    blocos: [t(ola(d)), t("Se ainda não abriu o Workbook, comece pelo primeiro exercício. Ele leva poucos minutos e é a base dos outros.")],
  }),
  kit_d5: (d) => ({
    assunto: `A ferramenta-chave de ${d.dimensaoNome}`,
    preheader: "A que mais faz diferença.",
    aprovado: false,
    blocos: [t(ola(d)), t(`De tudo que está no Kit ${d.dimensaoNome}, a ferramenta que costuma fazer mais diferença é a que você repete. Escolha uma e use por uma semana.`)],
  }),
  kit_d9: (d) => ({
    assunto: `${d.dimensaoNome} conversa com outras dimensões`,
    preheader: "Infraestrutura humana.",
    aprovado: false,
    blocos: [t(ola(d)), t("Depois de alguns dias com o Kit, é comum perceber que parte da fricção vem de outra dimensão. Isso não é desvio: é o sistema aparecendo."), botao("Fazer o Mapa de Fricção", d.mapaFriccaoUrl)],
  }),
  kit_d14: (d) => ({
    assunto: "10 dimensões. Um sistema.",
    preheader: "O Protocolo EPIC247.",
    aprovado: false,
    blocos: [t(ola(d)), t("Você começou por uma dimensão. Algumas mudanças pedem o sistema inteiro: as 10 dimensões em sequência, com Manuais, Workbooks e mapa de progresso."), botao("Conhecer o Protocolo", d.protocoloUrl)],
  }),

  // ─────────────── Protocolo ───────────────
  protocol_welcome: (d) => ({
    assunto: "Bem-vindo ao Protocolo EPIC247",
    preheader: "Como navegar.",
    aprovado: false,
    blocos: [t(ola(d)), t("Seu acesso ao Protocolo foi enviado pela plataforma de pagamento, no e-mail da compra."), t("As 10 dimensões têm uma sequência recomendada. Mas você não precisa começar pela primeira: comece onde a sua vida está pedindo atenção.")],
  }),
  protocol_d1: (d) => ({
    assunto: "Por onde começar o Protocolo",
    preheader: "Use os seus Mapas.",
    aprovado: false,
    blocos: [
      t(ola(d)),
      ...se(d.dimensaoNome, t(`Seu Mapa mais recente apontou ${d.dimensaoNome}. Comece pelo módulo dessa dimensão.`)),
      ...se(!d.dimensaoNome, t("Se ainda não fez, o Mapa de Fricção mostra por qual dimensão começar."), botao("Fazer o Mapa de Fricção", d.mapaFriccaoUrl)),
    ],
  }),
  protocol_d4: (d) => ({ assunto: "Ritmo, não maratona", preheader: "Um módulo de cada vez.", aprovado: false, blocos: [t(ola(d)), t("O Protocolo funciona melhor em ritmo constante do que em maratona. Um módulo por semana é um bom ritmo.")] }),
  protocol_d10: (d) => ({ assunto: "Como está indo?", preheader: "Check-in.", aprovado: false, blocos: [t(ola(d)), t("Dez dias de Protocolo. O que já mudou, mesmo que pouco? Se algo travou, responda este e-mail contando.")] }),
  protocol_d21: (d) => ({ assunto: "Progresso e travas", preheader: "Três semanas.", aprovado: false, blocos: [t(ola(d)), t("Três semanas. Vale olhar duas coisas: o que você manteve sem esforço e onde voltou ao automático. As duas respostas ensinam.")] }),
  protocol_d30: (d) => ({
    assunto: "Um passo a mais, se fizer sentido",
    preheader: "Mentoria EPIC.",
    aprovado: false,
    blocos: [t(ola(d)), t("Para algumas pessoas, o próximo passo é acompanhamento individual. A Mentoria EPIC tem poucas vagas, por capacidade real da Ju."), botao("Conhecer a Mentoria", d.mentoriaUrl)],
  }),

  // ─────────────── Mentoria ───────────────
  mentoring_interest: (d) => ({
    assunto: "Recebemos seu interesse na Mentoria EPIC",
    preheader: "Próximos passos.",
    aprovado: false,
    blocos: [t(ola(d)), t("Recebemos o seu interesse na Mentoria EPIC Individual. A equipe vai ler o que você escreveu e responder em até dois dias úteis com os próximos passos.")],
  }),
  mentoring_waitlist: (d) => ({
    assunto: "Você está na lista de espera da Mentoria",
    preheader: "Transparência sobre as vagas.",
    aprovado: false,
    blocos: [t(ola(d)), t("As vagas da Mentoria estão preenchidas neste ciclo. A limitação é real: é a capacidade da Ju de acompanhar cada pessoa com qualidade."), t("Você está na lista de espera. Avisamos quando uma vaga abrir, sem prometer antes da hora.")],
  }),
  mentoring_welcome: (d) => ({
    assunto: "Bem-vindo à Mentoria EPIC",
    preheader: "Onboarding.",
    aprovado: false,
    blocos: [t(ola(d)), t("Sua vaga na Mentoria está confirmada. Nos próximos dias você recebe o convite para o diagnóstico inicial e o primeiro encontro.")],
  }),

  // ─────────────── Checkout abandonado (sem urgência falsa) ───────────────
  checkout_t1h: (d) => ({
    assunto: `Ficou alguma dúvida sobre o ${d.produtoNome}?`,
    preheader: "O link continua aqui.",
    aprovado: false,
    blocos: [t(ola(d)), t(`Vimos que você começou a compra do ${d.produtoNome} e não terminou. Se foi algo no pagamento, o link continua funcionando.`), ...se(d.checkoutUrl, botao("Voltar para o checkout", d.checkoutUrl!))],
  }),
  checkout_t24h: (d) => ({
    assunto: `O que o ${d.produtoNome} entrega`,
    preheader: "Para decidir com calma.",
    aprovado: false,
    blocos: [t(ola(d)), t(`Se a dúvida é o que vem no ${d.produtoNome}, a página do produto explica tudo. Decidir com calma é melhor do que decidir com pressa.`), ...se(d.checkoutUrl, botao("Rever o produto", d.checkoutUrl!))],
  }),
  checkout_t72h: (d) => ({
    assunto: "Uma última lembrança",
    preheader: "Depois disso, não insistimos.",
    aprovado: false,
    blocos: [t(ola(d)), t(`Esta é a última mensagem sobre o ${d.produtoNome}. Se não for o momento, tudo bem: o conteúdo gratuito continua disponível.`), botao("Ver ideias gratuitas", d.ideiasUrl)],
  }),

  // ─────────────── Reativação ───────────────
  inactive_1: (d) => ({ assunto: "Uma pergunta", preheader: "Sem pressa para responder.", aprovado: false, blocos: [t(ola(d)), destaque("Tem alguma decisão que você já tomou por dentro, mas ainda não transformou em realidade?"), t("Se a resposta veio rápido, talvez valha olhar para ela.")] }),
  inactive_2: (d) => ({ assunto: "Um Mapa novo", preheader: "Em 2 minutos.", aprovado: false, blocos: [t(ola(d)), t("A vida muda, e o ponto de fricção também. O Mapa de Fricção leva dois minutos e mostra onde está o seu hoje."), botao("Fazer o Mapa de Fricção", d.mapaFriccaoUrl)] }),
  inactive_3: (d) => ({ assunto: "Onde está sua fricção hoje?", preheader: "Último e-mail desta série.", aprovado: false, blocos: [t(ola(d)), t("Faz um tempo que não nos falamos. Se ainda fizer sentido, comece de novo por onde a sua vida está pedindo atenção."), botao("Descobrir meu ponto de fricção", d.mapaFriccaoUrl)] }),

  newsletter_welcome: (d) => ({
    assunto: "Bem-vindo à newsletter do EPIC247",
    preheader: "Ideias para viver melhor.",
    aprovado: false,
    blocos: [t(ola(d)), t("Obrigado por assinar. A newsletter traz ideias, histórias e ferramentas para viver melhor, sem avalanche de e-mails."), botao("Começar pelas ideias", d.ideiasUrl)],
  }),
};
