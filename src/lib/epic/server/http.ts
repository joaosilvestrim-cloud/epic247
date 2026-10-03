import "server-only";
import { segredoDoSite } from "./segredo";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { withTx } from "./db";
import { BOT_UA } from "./identity";

// Utilitários das rotas /api/v2. Erros nunca vazam detalhe nem PII (RF-067).

export function ok(body: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ ok: true, ...body }, { status, headers: { "Cache-Control": "no-store" } });
}

export function erro(mensagem: string, status = 400) {
  return NextResponse.json({ ok: false, error: mensagem }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function lerJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await req.json();
    return b && typeof b === "object" && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function ehBot(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  return !ua || BOT_UA.test(ua);
}

/** Campo-isca: humano não vê nem preenche. Robô de spam preenche. */
export function caiuNaIsca(body: Record<string, unknown>) {
  return typeof body.website === "string" && body.website.trim() !== "";
}

export function logErro(contexto: string, e: unknown) {
  // Só a mensagem técnica: nada de corpo de requisição, e-mail ou respostas.
  console.error(`[${contexto}]`, e instanceof Error ? e.message : String(e));
}

export const str = (v: unknown, n = 300) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

/**
 * Limite de requisições por IP e rota (Blueprint §29). Janela fixa no banco,
 * porque cada função serverless tem a própria memória. O IP é guardado só
 * como hash com o segredo do site, nunca em claro. Se o banco falhar, deixa
 * passar: o limite protege contra abuso, não pode derrubar o formulário.
 */
export async function excedeuLimite(req: Request, rota: string, maximo: number, janelaSegundos: number): Promise<boolean> {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "sem-ip";
  const segredo = segredoDoSite();
  const chave = `${rota}:${createHash("sha256").update(`${segredo}:${ip}`).digest("hex").slice(0, 24)}`;
  const janela = new Date(Math.floor(Date.now() / (janelaSegundos * 1000)) * janelaSegundos * 1000).toISOString();
  try {
    const n = await withTx(async (q) => {
      const [r] = await q<{ contagem: number }>(
        `insert into rate_limits (chave, janela, contagem) values ($1, $2, 1)
         on conflict (chave, janela) do update set contagem = rate_limits.contagem + 1
         returning contagem`,
        [chave, janela]
      );
      // Limpeza oportunista: janelas de mais de um dia não servem para nada.
      if (Math.random() < 0.02) await q("delete from rate_limits where janela < now() - interval '1 day'");
      return r.contagem;
    });
    return n > maximo;
  } catch {
    return false;
  }
}
