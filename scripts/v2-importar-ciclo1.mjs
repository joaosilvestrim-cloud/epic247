// Traz os leads do Ciclo 1 (public.leads, quiz de energia) para o schema do 2.0.
// Uso: node scripts/v2-importar-ciclo1.mjs              (simulação, desfaz tudo)
//      APLICAR=1 EPIC_DB_SCHEMA=v2 node scripts/v2-importar-ciclo1.mjs
//
// Regras:
// - Só quem tem e-mail. Quem já existe no 2.0 (mesmo e-mail) é mantido como está.
// - Sem aceite de marketing: o Ciclo 1 não pedia esse aceite separado. Essas
//   pessoas não entram em nutrição até aceitarem de novo (ex.: ao fazer um Mapa).
// - Primeiro toque vem da utm do Ciclo 1. Etapa: identified_lead.
// - Rodar de novo não duplica.
import fs from "node:fs";
import pg from "pg";

for (const linha of fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8").split(/\r?\n/) : []) {
  const m = linha.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}
const schema = process.env.EPIC_DB_SCHEMA;
if (!schema || !/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error("EPIC_DB_SCHEMA ausente ou inválido");
const aplicar = process.env.APLICAR === "1";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query("begin");
  const { rows } = await client.query(
    `with origem as (
       select distinct on (lower(trim(email))) lower(trim(email)) as email, nullif(trim(nome), '') as nome,
              nullif(utm_source, '') as src, nullif(utm_medium, '') as med, nullif(utm_campaign, '') as camp,
              nullif(utm_content, '') as cont, created_at
       from public.leads where email is not null and email ~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
       order by lower(trim(email)), created_at
     )
     insert into ${schema}.leads (email, first_name, lifecycle_stage, email_consent, email_consent_at,
       email_consent_source, marketing_email_allowed, first_touch_source, first_touch_medium, first_touch_campaign,
       first_touch_content, first_touch_landing_page, first_touch_at, last_touch_source, last_touch_medium,
       last_touch_campaign, last_touch_at, created_at, last_activity_at)
     select o.email, split_part(o.nome, ' ', 1), 'identified_lead', true, o.created_at, 'ciclo1_quiz_energia', false,
            coalesce(o.src, 'direct'), o.med, o.camp, o.cont, '/quiz', o.created_at,
            coalesce(o.src, 'direct'), o.med, o.camp, o.created_at, o.created_at, o.created_at
     from origem o
     where not exists (select 1 from ${schema}.leads l where lower(l.email) = o.email and l.merged_into is null)
     returning email`
  );
  console.log(`${rows.length} lead(s) ${aplicar ? "importados" : "seriam importados"} para ${schema}.`);
  await client.query(aplicar ? "commit" : "rollback");
  if (!aplicar) console.log("Simulação: nada foi gravado. Use APLICAR=1 para gravar.");
} catch (e) {
  await client.query("rollback");
  throw e;
} finally {
  await client.end();
}
