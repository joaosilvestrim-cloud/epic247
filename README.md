# EPIC247 — Módulo Energia

Landing Page + Quiz de Diagnóstico dos **5 Drenos**, parte do ecossistema EPIC247.
Construído com **Next.js 15 (App Router)**, **Tailwind CSS v4** e **Supabase**.

Esta é a camada de **aquisição** do funil: a Landing Page do Módulo Energia e o
Quiz que diagnostica o Dreno Dominante do usuário e captura o lead.

## Funcionalidades

- **Landing Page** (`/`) — Hero com VSL, blocos de empatia, mecanismo, ciência,
  os 5 Drenos, entregáveis, princípios do método, autoridade, prova social e a
  caixa de oferta (R$97) com order bump.
- **Quiz dos 5 Drenos** (`/quiz`) — 15 perguntas, motor de pontuação com
  **desempate biológico** (Sono > Combustível > Estresse > Tela > Movimento),
  captura de lead e relatório com os 4 próximos passos práticos.
- **API de leads** (`/api/lead`) — grava o lead no Supabase via Service Role.

## Os 5 Drenos

1. Sono Quebrado
2. Combustível Errado
3. Cortisol Crônico
4. Atenção Sequestrada
5. Corpo Parado

## Como rodar localmente

```bash
npm install
cp .env.local.example .env.local   # preencha as credenciais do Supabase
npm run dev
```

Acesse http://localhost:3000.

> Sem `.env.local` configurado, o quiz funciona normalmente — apenas os leads
> não são persistidos (são logados no console do servidor).

## Painel administrativo (`/admin`)

Login protegido por senha (variável `ADMIN_PASSWORD`). Permite:

- **Ver as respostas do quiz** (leads) com estatísticas e distribuição por Dreno.
- **Enviar o vídeo da VSL** e a **foto da Ju Ferreira** — ficam guardados no
  Supabase Storage (bucket `assets`) e aparecem automaticamente na landing page.

Os uploads vão direto do navegador para o Supabase via *signed URL*, sem passar
pela função serverless (evita o limite de tamanho do Vercel).

> Vídeos grandes: ajuste o limite de tamanho de arquivo do bucket no Supabase
> (Storage > assets > Settings) ou prefira hospedar em YouTube/Vimeo.

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com).
2. Rode o SQL de `supabase/schema.sql` no SQL Editor — cria as tabelas `leads` e
   `settings` e o bucket público `assets`.
3. Copie as credenciais (Project Settings > API) para o `.env.local`.

## Funil, relatórios e rastreamento

- **Relatório em PDF por dreno**: ao concluir o quiz, a rota `/api/lead` gera um
  PDF do Dreno Dominante (`lib/pdf-report.ts`, conteúdo em `lib/report-content.ts`)
  e envia por e-mail via **Resend** (`lib/email.ts`). O texto dos relatórios é um
  rascunho estrutural — expanda com o conteúdo final.
- **Páginas do funil**: `/obrigado` (pós-compra) e `/oto` (oferta única do
  Protocolo R$270 com timer real de 30 min, persistido no `localStorage`).
- **Rastreamento**: Meta Pixel + GA4 (`components/analytics.tsx`) e Conversions
  API server-side (`lib/meta-capi.ts`, evento `Lead` disparado em `/api/lead`).
  Eventos de client em `lib/analytics.ts` (`Lead`, `InitiateCheckout`).

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (somente servidor) |
| `ADMIN_PASSWORD` | Senha do painel `/admin` (use algo forte) |
| `RESEND_API_KEY` | Chave da Resend para enviar o relatório por e-mail |
| `EMAIL_FROM` | Remetente dos e-mails (ex.: `EPIC247 <contato@dominio>`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID do Meta Pixel |
| `META_CAPI_TOKEN` | Token da Conversions API do Meta |
| `NEXT_PUBLIC_GA4_ID` | ID de medição do GA4 (G-XXXX) |

## Estrutura

```
src/
├── app/
│   ├── page.tsx          # Landing Page do Módulo Energia
│   ├── quiz/page.tsx     # Quiz dos 5 Drenos (client)
│   ├── api/lead/route.ts # Captura de lead
│   ├── layout.tsx
│   └── globals.css
└── lib/
    ├── drenos.ts         # Definição dos 5 Drenos e hierarquia
    ├── quiz-data.ts      # As 15 perguntas
    ├── quiz-engine.ts    # Pontuação + desempate biológico
    └── supabase.ts       # Cliente Supabase (servidor)
```

## Próximos passos (roadmap)

- [ ] Integração com gateway de checkout (Hotmart/Kiwify) na caixa de oferta.
- [ ] Tripwire na página de obrigado (mini e-book R$19, janela de 24h).
- [ ] Plataforma / Dashboard (check-in diário, Bateria Vital, Radar de Drenos,
      micro-hábitos, Modo Sobrevivência / Modo Construção).
- [ ] Embed real da VSL.

## Deploy

Pronto para deploy na **Vercel**. Configure as variáveis de ambiente no painel
do projeto antes do primeiro deploy.
