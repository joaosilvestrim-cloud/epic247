# EPIC247 2.0

Site e plataforma do EPIC247: Mapas EPIC (Mapa de Fricção + 10 Mapas dimensionais),
páginas de dimensão, Plano EPIC 7 Dias, Kits, Protocolo, Mentoria, Ideias (CMS) e
admin próprio. Produção: <https://epic247.com.br>.

## Fontes de verdade

O código implementa os documentos do projeto. Quando houver dúvida, vale o documento:

| Assunto | Documento |
|---|---|
| Texto público, CTAs, microcopy | Copy Final do Site v1.0 (congelada em 02/10/2026). Cópia literal em `docs/v2/fontes/copy-final.txt` |
| Arquitetura e critérios de aceite | Blueprint de Desenvolvimento v1.2, Release Candidate RC1 |
| Comportamento obrigatório | Documento de Requisitos Funcionais v1.1 (RF-001 a RF-146) |
| Entrega interna e Meu EPIC | CR-01 Checkout Kiwify e Entrega Interna (+ Adendo CR-01A) |
| Produtos e preços | Produtos e Pricing v1.0 |
| Perguntas, scoring e resultados | Documentos individuais dos 11 Mapas |
| Campos e eventos | Modelo de Dados, Eventos e Campos CRM v1.1 (`docs/v2/dicionario-de-dados.md`) |
| Lifecycle e comunicações | Funis e Automações, Matriz de Automações |

## Stack

- **Next.js 16** (App Router, Server Actions, View Transitions) + React 19 + TypeScript + Tailwind 4.
- **Postgres do Supabase** acessado direto (`pg`), um schema por ambiente: `v2_staging` e `v2`.
- **Resend** para e-mail (transacional e marketing com consentimento separado).
- **Kiwify** como checkout e provedor de pagamento, atrás de um adapter (`src/lib/epic/pagamentos/kiwify.ts`).
- **Vercel** (funções em `gru1`, ao lado do banco em `sa-east-1`) e **pg_cron** para a fila de e-mails.

## Estrutura

```
src/app/(site)/          páginas públicas (Home, dimensões, Mapas, produtos, Ju, Ideias, Contato)
src/app/admin/epic/      admin oficial (painel, Mapas, leads, vendas, mídia, conteúdo, produtos,
                         e-mails, banco de ideias, CMS, caixa de entrada, Mentoria, Marketing)
src/app/api/v2/          APIs: Mapas, captura, checkout, webhooks (Kiwify, Resend), cron, contato
src/lib/epic/            domínio: dimensões, Mapas (engine + 11 Mapas), Plano, conteúdo, KPI
src/lib/epic/content/    texto público, conferido contra a Copy Final por teste
src/lib/epic/server/     acesso a banco, identidade, eventos, automações, compras
supabase/v2/             migrations numeradas (001 a 014)
docs/v2/                 go-live, dicionário de dados, remarketing, fontes
src/legacy/ciclo1/       legado do site anterior, só para o admin antigo (ver LEIAME.md)
```

## Rotas principais

`/` · `/dimensoes` · `/dimensoes/[dimensao]` · `/mapa` · `/mapas/[dimensao]` ·
`/mapas/[dimensao]/resultado/[token]` (noindex) · `/plano/[dimensao]` · `/kit/[dimensao]` ·
`/protocolo` · `/mentoria` · `/ju` · `/ideias` · `/contato` · `/privacidade` · `/termos` ·
`/admin` (redireciona para `/admin/epic`). Rotas legadas `/diagnostico` redirecionam (308).

Meu EPIC (CR-01 e CR-01A), área pessoal com entrada por link no e-mail, noindex e
sem cache: `/meu-epic` (Início) · `/meu-epic/mapas` · `/meu-epic/planos` e
`/meu-epic/planos/[id]` (com PDF) · `/meu-epic/produtos` (Kits e Protocolo) ·
`/meu-epic/conta` · `/meu-epic/entrar`. Depois do pagamento a Kiwify devolve para
`/compra/confirmada`. A Kiwify é só checkout: o acesso nasce no webhook aprovado
(`access_grants`) e cai no reembolso ou chargeback.

## Produtos

| Produto | Preço | Venda |
|---|---|---|
| Mapas EPIC | gratuito | sempre |
| Plano EPIC 7 Dias (por dimensão) | R$29 | só quando ativo, com checkout e com conteúdo da dimensão aprovado (`src/lib/epic/plano/liberacao.ts`) |
| Kit EPIC [Dimensão] | R$97 | ativo + checkout + material publicado da dimensão no Meu EPIC |
| Protocolo EPIC247 | R$497 | ativo + checkout + material publicado nas 10 dimensões |
| Mentoria EPIC Individual | R$1.997 (piloto) | sem checkout direto: interesse, revisão, vaga confirmada, link liberado no admin |

Preço, link de checkout e ativação ficam no admin (Produtos). Produto fora de venda
mostra "indisponível", fica fora do sitemap e com noindex.

## Rodar localmente

```bash
npm ci
cp .env.local.example .env.local   # preencher (EPIC_DB_SCHEMA=v2_staging)
npm run db:migrate                 # aplica supabase/v2/*.sql no schema do .env.local
npm run dev
```

Variáveis: `.env.local.example` lista todas, com ambiente e se são obrigatórias.

## Testes e QA

```bash
npm test          # testes unitários (engine dos Mapas, Plano, Kiwify, KPI, Mentoria, ofertas,
                  # sincronia com a Copy Final, isolamento do legado)
npm run build
npm run qa        # ponta a ponta contra um servidor local e o staging: Mapa, captura,
                  # checkout, webhook, reembolso, chargeback, supressão, multi-aparelho,
                  # Meu EPIC (entrada por link, Planos, PDF, Kit, Protocolo, acesso revogado)
npm run qa:admin  # ações do admin num navegador real (servidor local com senha de teste)
```

`npm run qa` recusa rodar contra o schema `v2` (produção). Detalhes de como subir o
servidor local para o `qa:admin` estão no cabeçalho de `scripts/v2-qa-admin.mjs`.

## Copy Final

O texto das 10 páginas de dimensão é gerado do documento congelado:

```bash
npm run copy:sync   # docs/v2/fontes/copy-final.txt -> src/lib/epic/content/copy-final/dimensoes.json
```

O teste `copy-final.test.ts` falha se o JSON e a fonte se separarem, ou se algum texto
dos módulos de conteúdo não existir literalmente na Copy Final.

## Deploy

- `v2` gera preview (homologação, schema `v2_staging`); `main` é produção (schema `v2`).
- Migrations novas vão para `v2` **antes** do código: `EPIC_DB_SCHEMA=v2 npm run db:migrate`.
- Roteiro completo, variáveis de produção, agendador e webhooks: `docs/v2/go-live.md`.
