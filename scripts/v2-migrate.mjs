// Aplica supabase/v2/*.sql em ordem no schema do ambiente (EPIC_DB_SCHEMA).
// Uso: node scripts/v2-migrate.mjs            (lê .env.local)
//      EPIC_DB_SCHEMA=v2 node scripts/v2-migrate.mjs
// Cada arquivo roda numa transação e fica registrado em <schema>._migrations:
// rodar de novo não reaplica o que já foi aplicado.
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

function lerEnv(arquivo) {
  if (!fs.existsSync(arquivo)) return;
  for (const linha of fs.readFileSync(arquivo, "utf8").split(/\r?\n/)) {
    const m = linha.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}
lerEnv(".env.local");

const schema = process.env.EPIC_DB_SCHEMA;
if (!schema || !/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error("EPIC_DB_SCHEMA ausente ou inválido");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ausente");

const dir = path.join("supabase", "v2");
const arquivos = fs.readdirSync(dir).filter((f) => /^\d{3}_.*\.sql$/.test(f)).sort();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(`create schema if not exists ${schema}`);
  await client.query(`create table if not exists ${schema}._migrations (
    arquivo text primary key, aplicado_em timestamptz not null default now())`);
  const feitos = new Set((await client.query(`select arquivo from ${schema}._migrations`)).rows.map((r) => r.arquivo));
  for (const f of arquivos) {
    if (feitos.has(f)) { console.log(`  = ${f} (já aplicado)`); continue; }
    const sql = fs.readFileSync(path.join(dir, f), "utf8");
    await client.query("begin");
    try {
      await client.query(`set local search_path to ${schema}, public, extensions`);
      await client.query(sql);
      await client.query(`insert into ${schema}._migrations (arquivo) values ($1)`, [f]);
      await client.query("commit");
      console.log(`  + ${f}`);
    } catch (e) {
      await client.query("rollback");
      console.error(`  x ${f}: ${e.message}`);
      process.exitCode = 1;
      break;
    }
  }
  console.log(`schema ${schema} em dia.`);
} finally {
  await client.end();
}
