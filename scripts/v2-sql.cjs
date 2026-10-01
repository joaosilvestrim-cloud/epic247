// Consulta rápida no schema do ambiente: node scripts/v2-sql.cjs "select ..."
// Roda em transação com SET LOCAL (o pooler não guarda SET entre consultas).
const fs = require("fs");
for (const l of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}
const pg = require("pg");
(async () => {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  try {
    await c.query("begin");
    await c.query(`set local search_path to ${process.env.EPIC_DB_SCHEMA}, public, extensions`);
    for (const sql of process.argv.slice(2)) {
      const r = await c.query(sql);
      console.log(`> ${sql.slice(0, 90)}`);
      console.table(r.rows);
    }
    await c.query(process.env.SQL_COMMIT === "1" ? "commit" : "rollback");
  } finally {
    await c.end();
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
