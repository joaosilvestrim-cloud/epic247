# Mapa de Fricção: viés da pontuação e proposta de correção

Para aprovação de Ju e Luiz. Nada muda no site até essa aprovação.

## O problema

Cada alternativa do Mapa dá +3 para uma dimensão e +1 para outra. Algumas
dimensões aparecem em mais alternativas do que outras. Autoconhecimento é
principal em 5 alternativas e secundária em 3, espalhadas por 6 das 7
perguntas. Inteligência é principal em 3 e nunca secundária.

Resultado: a soma simples favorece quem aparece mais. Simulamos todas as
78.125 combinações possíveis de respostas. Se as pessoas respondessem ao
acaso, Autoconhecimento seria o resultado de 20,1% delas e Mentalidade de
3,1%. O esperado seria 10% para cada.

Dois efeitos colaterais:

- Mentalidade quase nunca ganha. Mesmo quem escolhe sempre a alternativa de
  Mentalidade recebe outra dimensão em 20% dos casos.
- Empate é comum: 22% das combinações terminam empatadas em primeiro.

## A proposta (pontuação 1.1)

Manter as perguntas, as alternativas e os pesos +3/+1 exatamente como estão.
Mudar só a comparação no fim: em vez de comparar os pontos brutos, comparar
quanto cada dimensão pontuou **acima do que ela costuma pontuar**.

Exemplo: Autoconhecimento costuma somar 3,6 pontos. Inteligência costuma
somar 1,8. Se as duas somarem 6, Inteligência se destacou muito mais. A
pontuação relativa enxerga isso.

Tecnicamente é a nota padronizada (pontos menos a média, divididos pelo
desvio padrão). A média e o desvio vêm só do questionário, não de dados de
pessoas. Por isso a regra é fixa e auditável.

## O que muda nos números

| Dimensão | Hoje, ao acaso | Proposta, ao acaso | Fricção clara, hoje | Fricção clara, proposta |
|---|---|---|---|---|
| Energia | 12,4% | 10,3% | 100% | 100% |
| Mentalidade | 3,1% | 9,5% | 80% | 100% |
| Autoconhecimento | 20,1% | 11,4% | 100% | 100% |
| Felicidade | 9,9% | 9,7% | 100% | 100% |
| Planejamento | 5,0% | 8,9% | 100% | 100% |
| Coragem | 12,8% | 9,6% | 100% | 100% |
| Ação | 15,3% | 10,4% | 100% | 100% |
| Inteligência | 4,5% | 9,9% | 94,4% | 99,7% |
| Excelência | 11,6% | 10,5% | 100% | 100% |
| Amor | 5,2% | 9,6% | 100% | 100% |

"Fricção clara" simula alguém que, em cada pergunta, escolhe a alternativa
da sua dimensão quando ela existe. É a checagem de que a correção não
atrapalha quem tem um sinal forte.

Empates em primeiro caem de 22% para 0,5%. "Muito próximos" passa a ser
diferença menor que 0,4 desvio padrão, o equivalente ao "1 ponto" de hoje.
Com isso, 35% dos resultados seriam "muito próximos" (hoje 33%) e o texto de
resultado duplo continua aparecendo com a mesma frequência.

## Alternativa mais simples (não recomendada)

Dividir os pontos pelo máximo possível de cada dimensão. É fácil de explicar,
mas corrige menos: a faixa fica entre 6,7% e 12,8%.

## Cuidados

- Pessoas reais não respondem ao acaso. A simulação mede o viés da régua,
  não o perfil do público. Com 200 ou mais resultados reais, vale olhar a
  distribuição no /admin/epic/mapas antes de concluir algo sobre o público.
- Resultados já gerados guardam a versão de pontuação. Quem voltar a um
  resultado antigo continua vendo exatamente o mesmo.
- Na Onda 1 só Energia e Ação têm Mapa próprio. Com qualquer régua, cerca de
  80% dos resultados da Fricção apontam para uma dimensão ainda sem Mapa. A
  página de resultado já trata isso.

## Para ativar

Em `src/lib/epic/maps/friccao.ts`, trocar `scoringVersion: "1.0"` por
`"1.1"`. Os testes em `engine.test.ts` já cobrem as duas versões.
