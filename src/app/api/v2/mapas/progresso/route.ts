import { withTx } from "@/lib/epic/server/db";
import { erro, lerJson, logErro, ok } from "@/lib/epic/server/http";
import { salvarProgresso } from "@/lib/epic/server/mapas";

const UUID = /^[0-9a-f-]{36}$/i;

/** Respostas parciais (RF-012). Falha aqui nunca interrompe o Mapa. */
export async function POST(req: Request) {
  const b = await lerJson(req);
  if (!b || typeof b.map_result_id !== "string" || !UUID.test(b.map_result_id)) return erro("Inválido.");
  const respostas = b.answers && typeof b.answers === "object" && !Array.isArray(b.answers) ? b.answers : null;
  if (!respostas || Object.keys(respostas).length > 30) return erro("Inválido.");
  const passo = Number.isInteger(b.step) ? Math.max(0, Math.min(30, b.step as number)) : 0;
  try {
    const salvo = await withTx((q) =>
      salvarProgresso(q, b.map_result_id as string, respostas as Record<string, unknown>, passo)
    );
    return ok({ salvo });
  } catch (e) {
    logErro("v2/mapas/progresso", e);
    return erro("Falha ao salvar progresso.", 500);
  }
}
