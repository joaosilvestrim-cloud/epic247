import { createHmac, timingSafeEqual } from "node:crypto";

// Verificação da assinatura dos webhooks do Resend (padrão Svix).
// Conteúdo assinado: "<svix-id>.<svix-timestamp>.<corpo cru>", HMAC-SHA256
// com o segredo (whsec_<base64>) decodificado. O cabeçalho svix-signature
// traz uma ou mais assinaturas "v1,<base64>" separadas por espaço.

const TOLERANCIA_S = 5 * 60;

export function conferirSvix(
  segredo: string,
  cab: { id: string | null; timestamp: string | null; assinatura: string | null },
  corpo: string,
  agora = Date.now()
): boolean {
  if (!cab.id || !cab.timestamp || !cab.assinatura) return false;
  const ts = Number(cab.timestamp);
  if (!Number.isFinite(ts) || Math.abs(agora / 1000 - ts) > TOLERANCIA_S) return false;
  const chave = Buffer.from(segredo.replace(/^whsec_/, ""), "base64");
  const esperado = createHmac("sha256", chave).update(`${cab.id}.${cab.timestamp}.${corpo}`).digest();
  return cab.assinatura.split(" ").some((parte) => {
    const [versao, valor] = parte.split(",");
    if (versao !== "v1" || !valor) return false;
    const recebido = Buffer.from(valor, "base64");
    return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
  });
}
