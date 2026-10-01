import "server-only";
import { Pool, type PoolClient } from "pg";

// Acesso ao Postgres do EPIC247 2.0. Só servidor.
//
// Por que Postgres direto e não supabase-js: o 2.0 precisa de transação de
// verdade (compra idempotente, merge de identidade, estágio que só sobe) e
// mora num schema por ambiente (v2_staging / v2), que não precisa ficar
// exposto na API pública do Supabase.
//
// O pooler do Supabase em modo transação não guarda configuração de sessão
// entre transações, então TODA consulta roda dentro de withTx(), que fixa o
// search_path com SET LOCAL.

const SCHEMA = process.env.EPIC_DB_SCHEMA || "v2_staging";
if (!/^[a-z_][a-z0-9_]*$/.test(SCHEMA)) throw new Error("EPIC_DB_SCHEMA inválido");

declare global {
  // Reaproveita o pool entre recargas do dev server.
  var __epicPool: Pool | undefined;
}

function pool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não configurada");
  if (!globalThis.__epicPool) {
    globalThis.__epicPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 12_000,
      keepAlive: true,
    });
    // Erro numa conexão ociosa não pode derrubar o processo.
    globalThis.__epicPool.on("error", () => {});
  }
  return globalThis.__epicPool;
}

export type Q = <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T[]>;

/**
 * Abrir conexão com o pooler às vezes demora. Repetir aqui é seguro: nada foi
 * executado ainda. Depois de conectado, erro de consulta nunca é repetido.
 */
async function conectar(): Promise<PoolClient> {
  try {
    return await pool().connect();
  } catch {
    await new Promise((r) => setTimeout(r, 300));
    return pool().connect();
  }
}

/** Executa fn numa transação, com o schema do ambiente. Faz rollback em erro. */
export async function withTx<R>(fn: (q: Q, client: PoolClient) => Promise<R>): Promise<R> {
  const client = await conectar();
  try {
    await client.query("begin");
    await client.query(`set local search_path to ${SCHEMA}, public, extensions`);
    const q: Q = async (sql, params) => (await client.query(sql, params as unknown[])).rows;
    const out = await fn(q, client);
    await client.query("commit");
    return out;
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Atalho para uma consulta só. */
export function query<T = Record<string, unknown>>(sql: string, params?: unknown[]) {
  return withTx((q) => q<T>(sql, params));
}

export function dbConfigurado(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export const DB_SCHEMA = SCHEMA;
