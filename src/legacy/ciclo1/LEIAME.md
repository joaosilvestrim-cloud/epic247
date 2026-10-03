# Legado do Ciclo 1 (isolado)

Código do site anterior ao EPIC247 2.0 (quiz dos "5 Drenos", calendário de conteúdos,
relatório de origem). Fica aqui só para o **admin antigo** (`/admin/antigo`), mantido
como consulta a pedido do projeto.

- Quem pode importar daqui: `src/app/admin/antigo` e as rotas `src/app/api/admin/conteudos`
  e `src/app/api/admin/origem`. O teste `src/lib/epic/legado.test.ts` falha se qualquer
  outro arquivo importar `@/legacy/...`.
- Os leads do Ciclo 1 já foram importados para o 2.0 (`scripts/v2-importar-ciclo1.mjs`).
- Código morto do Ciclo 1 (quiz-engine, relatório em PDF dos drenos, e-mail antigo,
  sound, flags) foi removido em 03/10/2026; está no histórico do git.

**Condição de remoção:** quando o projeto disser que o admin antigo não é mais
necessário para consulta, apagar esta pasta, `src/app/admin/antigo`,
`src/app/api/admin/conteudos`, `src/app/api/admin/origem` e `scripts/legacy`.
As tabelas do Ciclo 1 no schema `public` (leads, conteudos) podem ser arquivadas depois
de um backup.
