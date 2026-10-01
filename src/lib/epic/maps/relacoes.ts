// Relações úteis do resultado duplo, transcritas da seção "Resultado duplo"
// de cada documento de Mapa (pasta 08). Servem só para interpretação, sem
// afirmar causalidade. Geradas por script a partir dos documentos: não
// editar o texto sem nova versão do documento.

import type { DimensionId } from "../dimensions";

export interface RelacaoDupla {
  eixos: [string, string];
  texto: string;
}

export const RELACOES_DUPLAS: Record<DimensionId, RelacaoDupla[]> = {
  "energia": [
    {
      "eixos": [
        "sono",
        "alerta"
      ],
      "texto": "dificuldade de desligar pode coexistir com sensação de recuperação insuficiente."
    },
    {
      "eixos": [
        "atencao",
        "alerta"
      ],
      "texto": "fragmentação e sensação de urgência podem aparecer juntas."
    },
    {
      "eixos": [
        "combustivel",
        "sono"
      ],
      "texto": "oscilações de rotina podem aparecer simultaneamente."
    }
  ],
  "mentalidade": [
    {
      "eixos": [
        "analise",
        "erro"
      ],
      "texto": "pensar mais pode funcionar como tentativa de reduzir chance de falha."
    },
    {
      "eixos": [
        "crencas",
        "autoprotecao"
      ],
      "texto": "regras internas sobre identidade podem sustentar justificativas de evitação."
    },
    {
      "eixos": [
        "erro",
        "autoprotecao"
      ],
      "texto": "evitar exposição pode proteger autoimagem no curto prazo."
    },
    {
      "eixos": [
        "reatividade",
        "crencas"
      ],
      "texto": "respostas automáticas podem reforçar interpretações já conhecidas."
    },
    {
      "eixos": [
        "analise",
        "reatividade"
      ],
      "texto": "a pessoa pode oscilar entre pensar demais antes e reagir rápido quando pressionada."
    }
  ],
  "autoconhecimento": [
    {
      "eixos": [
        "identidade",
        "desejos"
      ],
      "texto": "uma autoimagem herdada pode coexistir com metas herdadas."
    },
    {
      "eixos": [
        "valores",
        "coerencia"
      ],
      "texto": "saber o que importa não garante que a rotina esteja organizada em torno disso."
    },
    {
      "eixos": [
        "desejos",
        "limites"
      ],
      "texto": "reconhecer o que quer pode exigir espaço que hoje está ocupado por obrigações e expectativas."
    },
    {
      "eixos": [
        "limites",
        "coerencia"
      ],
      "texto": "dificuldade de dizer “não” pode impedir a vida de refletir prioridades próprias."
    },
    {
      "eixos": [
        "identidade",
        "coerencia"
      ],
      "texto": "uma nova versão de si pode existir internamente antes de aparecer no cotidiano."
    }
  ],
  "felicidade": [
    {
      "eixos": [
        "emocoes_positivas",
        "realizacao"
      ],
      "texto": "a pessoa pode avançar sem saborear nem reconhecer progresso."
    },
    {
      "eixos": [
        "engajamento",
        "significado"
      ],
      "texto": "fazer muito sem envolvimento pode coexistir com pouca conexão com propósito."
    },
    {
      "eixos": [
        "relacoes",
        "emocoes_positivas"
      ],
      "texto": "baixa presença relacional pode reduzir experiências positivas cotidianas."
    },
    {
      "eixos": [
        "significado",
        "realizacao"
      ],
      "texto": "conquistas podem perder valor quando não se conectam ao que importa."
    },
    {
      "eixos": [
        "engajamento",
        "relacoes"
      ],
      "texto": "excesso de funcionamento pode reduzir presença tanto no trabalho quanto nos vínculos."
    }
  ],
  "planejamento": [
    {
      "eixos": [
        "direcao",
        "prioridade"
      ],
      "texto": "quando o resultado é pouco claro, tudo pode parecer igualmente importante."
    },
    {
      "eixos": [
        "realidade",
        "prioridade"
      ],
      "texto": "excesso de prioridades pode vir de um plano que ignora capacidade e restrições."
    },
    {
      "eixos": [
        "prioridade",
        "progresso"
      ],
      "texto": "sem foco claro, indicadores perdem utilidade."
    },
    {
      "eixos": [
        "progresso",
        "adaptacao"
      ],
      "texto": "sem medir, fica difícil saber quando ajustar."
    },
    {
      "eixos": [
        "realidade",
        "adaptacao"
      ],
      "texto": "restrições novas exigem revisão da rota, não abandono automático do objetivo."
    }
  ],
  "coragem": [
    {
      "eixos": [
        "decisao",
        "incerteza"
      ],
      "texto": "busca de certeza pode prolongar uma escolha que já amadureceu."
    },
    {
      "eixos": [
        "consequencia",
        "exposicao"
      ],
      "texto": "medo de julgamento pode se misturar com receio de impactar relações."
    },
    {
      "eixos": [
        "incerteza",
        "travessia"
      ],
      "texto": "ausência de garantia pode bloquear exatamente o primeiro gesto concreto."
    },
    {
      "eixos": [
        "decisao",
        "travessia"
      ],
      "texto": "a pessoa sabe o que quer, mas ainda não tornou a escolha real."
    },
    {
      "eixos": [
        "exposicao",
        "travessia"
      ],
      "texto": "o primeiro passo pode ser também o momento em que a pessoa passa a ser vista."
    }
  ],
  "acao": [
    {
      "eixos": [
        "inicio",
        "friccao"
      ],
      "texto": "preparação excessiva pode coexistir com exigência alta sobre o primeiro passo."
    },
    {
      "eixos": [
        "friccao",
        "distracao"
      ],
      "texto": "tarefas percebidas como difíceis podem tornar estímulos menores mais atraentes."
    },
    {
      "eixos": [
        "consistencia",
        "retomada"
      ],
      "texto": "ciclos de intensidade podem tornar qualquer quebra de sequência mais cara."
    },
    {
      "eixos": [
        "inicio",
        "distracao"
      ],
      "texto": "alternância pode começar antes mesmo de a ação ganhar profundidade."
    },
    {
      "eixos": [
        "distracao",
        "consistencia"
      ],
      "texto": "fragmentação pode dificultar a construção de ritmo."
    }
  ],
  "inteligencia": [
    {
      "eixos": [
        "realidade",
        "recuperacao"
      ],
      "texto": "dramatizar ou negar o fato pode prolongar o retorno."
    },
    {
      "eixos": [
        "recuperacao",
        "agencia_emocional"
      ],
      "texto": "pouca regulação pode tornar cada queda mais longa."
    },
    {
      "eixos": [
        "aprendizado",
        "adaptacao"
      ],
      "texto": "sem extrair informação, mudar a rota vira tentativa aleatória."
    },
    {
      "eixos": [
        "realidade",
        "aprendizado"
      ],
      "texto": "separar fato de interpretação ajuda a enxergar o que realmente pode ser aprendido."
    },
    {
      "eixos": [
        "agencia_emocional",
        "adaptacao"
      ],
      "texto": "decisões sob tempestade podem produzir mudanças impulsivas ou rigidez defensiva."
    }
  ],
  "excelencia": [
    {
      "eixos": [
        "padrao",
        "sustentabilidade"
      ],
      "texto": "exigência alta demais pode tornar qualidade dependente de esforço excessivo."
    },
    {
      "eixos": [
        "pratica",
        "feedback"
      ],
      "texto": "treino sem retorno pode reforçar padrões errados."
    },
    {
      "eixos": [
        "feedback",
        "refinamento"
      ],
      "texto": "receber retorno sem ajustar pouco muda a execução."
    },
    {
      "eixos": [
        "refinamento",
        "sustentabilidade"
      ],
      "texto": "melhoria contínua pode ser usada para simplificar e não apenas elevar esforço."
    },
    {
      "eixos": [
        "padrao",
        "feedback"
      ],
      "texto": "critérios claros ajudam a interpretar feedback sem transformar toda crítica em ameaça pessoal."
    }
  ],
  "amor": [
    {
      "eixos": [
        "conexao",
        "presenca"
      ],
      "texto": "contato frequente pode coexistir com pouca disponibilidade real."
    },
    {
      "eixos": [
        "relacao_consigo",
        "pertencimento"
      ],
      "texto": "autocobrança e medo de rejeição podem aumentar a tendência de se editar para caber."
    },
    {
      "eixos": [
        "pertencimento",
        "conexao"
      ],
      "texto": "estar incluído não garante sentir-se conhecido."
    },
    {
      "eixos": [
        "relacao_consigo",
        "expansao"
      ],
      "texto": "dificuldade de reconhecer o próprio valor pode dificultar compartilhar o que se tem para oferecer."
    },
    {
      "eixos": [
        "presenca",
        "expansao"
      ],
      "texto": "contribuição perde qualidade quando vira apenas mais uma tarefa."
    }
  ]
};

/** Relação prevista no documento para o par de eixos, em qualquer ordem. */
export function relacaoDoPar(mapa: DimensionId, a: string, b: string): string | null {
  return (
    RELACOES_DUPLAS[mapa].find((r) => (r.eixos[0] === a && r.eixos[1] === b) || (r.eixos[0] === b && r.eixos[1] === a))
      ?.texto ?? null
  );
}
