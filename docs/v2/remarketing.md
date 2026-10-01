# Públicos de remarketing no Meta

Como montar, no Gerenciador de Anúncios, os públicos que o Modelo Financeiro
(§10, fase 3) e o Funis e Automações (§12, §20 e §42) pedem. O site já envia
os eventos. Aqui está só o que escolher em "Públicos personalizados → Site".

## Eventos que o site envia

| No Meta | Quando acontece | Parâmetros úteis |
|---|---|---|
| PageView | qualquer página | URL |
| `ViewMapEntry` (personalizado) | abriu a tela de um Mapa | `map_type` |
| `StartMap` (personalizado) | clicou em "Começar" no Mapa | `map_type` |
| CompleteRegistration | concluiu um Mapa | `map_type` |
| Lead | deixou o e-mail depois do resultado | `map_type` |
| ViewContent | viu a oferta de Plano, Kit ou Protocolo | `content_ids` (ex.: `plan_energia`) |
| InitiateCheckout | clicou para comprar | `content_ids`, `value` |
| Purchase | compra aprovada (pela Conversions API, do servidor) | `content_ids`, `content_category`, `value` |
| Contact | candidatura à Mentoria | |

O mesmo `event_id` vai do navegador e do servidor, e o Meta não conta duas
vezes. A compra vem do servidor depois do webhook da Kiwify, então aparece
mesmo com bloqueador de anúncio.

## Públicos

1. **Visitou o site** (30 dias): PageView.
2. **Começou um Mapa e parou** (14 dias): `StartMap`, excluindo CompleteRegistration.
   Mensagem: retomar a descoberta, sem pressionar compra (Matriz, AUT_MAP_ABANDON_ANON).
3. **Concluiu um Mapa sem deixar e-mail** (30 dias): CompleteRegistration, excluindo Lead.
   Mensagem do Funis §12: "Você já descobriu onde está a fricção. Agora transforme esse resultado em movimento."
4. **Concluiu o Mapa de uma dimensão** (30 dias): CompleteRegistration com `map_type` igual a `energia`, `acao`...
   Serve para o anúncio de Plano ou Kit daquela dimensão.
5. **Viu oferta e não comprou** (14 dias): ViewContent com `content_ids` do produto, excluindo Purchase do mesmo produto.
6. **Comprou Plano, ainda sem Kit** (60 dias): Purchase com `content_category` começando por `plan`, excluindo Purchase com `kit`.
7. **Comprou Kit, ainda sem Protocolo** (90 dias): Purchase com `content_category` começando por `kit`, excluindo Purchase de `protocol`.

## Exclusões obrigatórias (Funis §42 e Matriz)

- Toda campanha de um produto exclui quem já comprou esse produto (Purchase com o `content_ids` dele).
- Campanhas de Plano e Kit excluem quem comprou o Protocolo (`content_ids` = `protocol`).
- Campanhas de conversão excluem clientes da Mentoria (`content_ids` = `mentoring`).

## Lembrete

Criativo específico leva para a experiência específica: anúncio de Energia vai
para `/mapas/energia`, anúncio amplo para `/mapa`. Os links de cada peça saem
prontos do Banco de ideias no admin, já com as utm.
