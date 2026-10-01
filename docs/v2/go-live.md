# EPIC247 2.0: como colocar no ar

Este é o roteiro da virada do site do Ciclo 1 para o 2.0. O site atual fica
no ar até a virada. Os dados do Ciclo 1 (schema `public`) não são tocados.
O 2.0 grava tudo no schema `v2`.

## 1. Decisões que ainda não são técnicas

Nada disto impede a virada técnica, mas define o que aparece no site.

- **Textos pendentes.** Todo texto marcado com `pendente()` aparece só no
  staging, com a faixa "rascunho". Em produção ele some, e e-mails de
  marketing em rascunho não são enviados. Lista completa: `grep -rn "pendente(" src/lib/epic`.
- **Revisão jurídica.** Privacidade e Termos estão em rascunho. Faltam razão
  social, CNPJ e encarregado de dados. O e-mail de checkout abandonado sai
  sem aceite de marketing (legítimo interesse): confirmar com o jurídico.
- **Mapa de Fricção.** A correção de viés (pontuação 1.1) está pronta e
  desligada. Ver `docs/v2/vies-mapa-friccao.md`.
- **Dimensões publicadas.** Na Onda 1, Energia e Ação. Controlado em
  `src/lib/epic/dimensions.ts` (status de página e de Mapa).

## 2. Variáveis na Vercel (ambiente Production)

| Variável | Valor | Observação |
|---|---|---|
| `NEXT_PUBLIC_EPIC_ENV` | `production` | Liga indexação, esconde rascunhos, exige assinatura nos webhooks |
| `NEXT_PUBLIC_SITE_URL` | `https://epic247.com.br` | Links dos e-mails |
| `DATABASE_URL` | pooler do Supabase, porta 6543 | O mesmo do staging, já com a senha nova (ver item 8) |
| `EPIC_DB_SCHEMA` | `v2` | Staging usa `v2_staging` |
| `EPIC_SECRET` | texto aleatório longo | Assina links de descadastro e de acesso ao Plano. Nunca trocar depois: invalida os links já enviados |
| `CRON_SECRET` | texto aleatório longo | O mesmo vai no agendador (item 5) |
| `KIWIFY_WEBHOOK_TOKEN` | token do webhook na Kiwify | Sem ele, produção recusa todo webhook |
| `RESEND_API_KEY` | já existe | |
| `RESEND_WEBHOOK_SECRET` | `whsec_...` do Resend | Item 4 |
| `EMAIL_FROM` | `EPIC247 <contato@epic247.com.br>` | |
| `EPIC_EMAIL_MODE` | `live` | Começar com `simulate` no dia da virada e trocar depois do teste |
| `EPIC_EMAIL_ALLOWLIST` | e-mails da equipe | Só vale no modo `simulate`: esses recebem de verdade |
| `EPIC_TEAM_EMAIL` | e-mail da equipe | Aviso de candidatura à Mentoria e de contato |
| `ADMIN_PASSWORD` | já existe | Mesma senha para /admin e /admin/epic |
| Supabase, Meta e GA4 | já existem | Pixel e tags continuam na aba Marketing do /admin |

Gerar segredos: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`

**Homologação (ambiente Preview da Vercel).** Cada push na branch `v2` gera
um preview em `epic247-git-v2-joao-silvestrims-projects.vercel.app`, fechado
pelo login da Vercel. Para ele funcionar por inteiro (Mapas, captura, admin),
cadastrar no ambiente **Preview**: `DATABASE_URL`, `EPIC_DB_SCHEMA=v2_staging`,
`EPIC_SECRET`, `CRON_SECRET`, `EPIC_EMAIL_MODE=simulate` e
`EPIC_EMAIL_ALLOWLIST` com os e-mails da equipe. Não cadastrar
`NEXT_PUBLIC_EPIC_ENV` no Preview: sem ela o site mostra os rascunhos e não
entra no Google.

## 3. Banco

```bash
EPIC_DB_SCHEMA=v2 node scripts/v2-migrate.mjs
```

Cria o schema `v2`, as tabelas, o catálogo de produtos e as configurações.
Rodar de novo não reaplica nada.

Leads do Ciclo 1 (opcional, recomendado):

```bash
EPIC_DB_SCHEMA=v2 node scripts/v2-importar-ciclo1.mjs
APLICAR=1 EPIC_DB_SCHEMA=v2 node scripts/v2-importar-ciclo1.mjs
```

O primeiro comando só simula. Entram como lead identificado, sem aceite de
marketing (o Ciclo 1 não pedia esse aceite).

## 4. Kiwify e Resend

**Kiwify, para cada produto que for à venda:**

1. Criar o produto na Kiwify com o preço do catálogo.
2. No /admin/epic/produtos: colar o link do checkout e o ID do produto,
   marcar Ativo e salvar. Sem link, a página mostra lista de espera.
3. O site acrescenta sozinho `sck` (quem compra) e `src` (de qual Mapa veio).

**Webhook da Kiwify** (uma vez, vale para todos os produtos):

- URL: `https://epic247.com.br/api/v2/webhooks/kiwify`
- Eventos: compra aprovada, reembolso, chargeback, carrinho abandonado,
  boleto gerado, pix gerado, compra recusada.
- Copiar o token para `KIWIFY_WEBHOOK_TOKEN`.

Compra de produto sem ID cadastrado fica como "falhou" em /admin/epic/vendas.
Cadastre o ID e clique em Reprocessar: nada se perde.

**Webhook do Resend:**

- URL: `https://epic247.com.br/api/v2/webhooks/resend`
- Eventos: `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`.
- Copiar o signing secret para `RESEND_WEBHOOK_SECRET`.

E-mail que volta (bounce) é bloqueado para novos envios. Marcar como spam
vale como descadastro.

## 5. Agendador da fila de e-mails

Rodar uma vez no SQL Editor do Supabase o conteúdo de
`supabase/v2/cron-producao.sql.example`, trocando `<CRON_SECRET>`.
Ele chama `/api/v2/cron/disparar` a cada 10 minutos.

## 6. Ordem da virada

0. QA automático verde contra o staging: `npm run qa` (59 verificações de
   Mapa, identidade, compra, webhook repetido, supressão, reembolso,
   chargeback e eventos). Ele cria e apaga os próprios dados e recusa rodar
   no schema `v2`.
1. Variáveis da Vercel configuradas (item 2), com `EPIC_EMAIL_MODE=simulate`.
2. Banco migrado (item 3).
3. Merge da branch `v2` na `main`. A Vercel publica sozinha.
4. Teste de fumaça, em aba anônima:
   - Home, uma dimensão, `/mapa` até o fim, resultado, captura de e-mail.
   - `/mapas/energia` até o fim e o resultado.
   - `/ig`, `/quiz` e `/oto` redirecionam.
   - /admin/epic mostra a visita e o Mapa. Em E-mails, a entrega aparece como "simulado".
5. Uma compra real do Plano (R$ 29) com um e-mail da equipe. Conferir em
   /admin/epic/vendas e o acesso ao Plano. Reembolsar pela Kiwify e conferir
   que o acesso foi revogado.
6. Agendador ligado (item 5). Webhooks configurados (item 4).
7. `EPIC_EMAIL_MODE=live` e redeploy.

## 7. Se der errado

- **Site:** na Vercel, Deployments, promover o deploy anterior (Instant
  Rollback). Volta o Ciclo 1 em segundos. O banco não precisa voltar: o
  Ciclo 1 usa `public` e o 2.0 usa `v2`.
- **E-mails:** `EPIC_EMAIL_MODE=simulate` e redeploy. A fila continua
  registrando, nada sai. Ou desligar o agendador (`select cron.unschedule('epic-disparar-fila');`).
- **Compras:** os webhooks ficam gravados mesmo se o processamento falhar.
  Reprocessar em /admin/epic/vendas.

## 8. Segurança, antes da virada

- Trocar a senha do banco no Supabase (ela passou por conversa) e atualizar
  `DATABASE_URL` no `.env.local` e na Vercel.
- O merge da `v2` também leva a correção de segurança do Next (16.3.8). A
  `main` hoje está numa versão com vulnerabilidade crítica conhecida.
