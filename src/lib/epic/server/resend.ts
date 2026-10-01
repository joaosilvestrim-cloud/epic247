import "server-only";

// Envio pelo Resend (REST, sem SDK). Domínio epic247.com.br já verificado.
//
// Modo de entrega (EPIC_EMAIL_MODE):
// - live: envia de verdade (padrão em produção);
// - simulate: não envia, marca como simulado (padrão em staging). Endereços
//   em EPIC_EMAIL_ALLOWLIST recebem de verdade mesmo assim, para teste.

export interface Envio {
  para: string;
  assunto: string;
  html: string;
  texto: string;
  descadastroUrl: string | null;
  tag: string;
}

export interface ResultadoEnvio {
  modo: "live" | "simulated";
  id: string;
}

function modo(para: string): "live" | "simulated" {
  const m = process.env.EPIC_EMAIL_MODE ?? (process.env.NEXT_PUBLIC_EPIC_ENV === "production" ? "live" : "simulate");
  if (m === "live") return "live";
  const lista = (process.env.EPIC_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return lista.includes(para.toLowerCase()) ? "live" : "simulated";
}

export async function enviarEmail(e: Envio): Promise<ResultadoEnvio> {
  const m = modo(e.para);
  if (m === "simulated") return { modo: "simulated", id: `simulado:${Date.now()}` };

  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY ausente");
  const headers: Record<string, string> = {};
  if (e.descadastroUrl) {
    // Descadastro em um clique (RFC 8058), exigido por Gmail e Yahoo.
    headers["List-Unsubscribe"] = `<${e.descadastroUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "EPIC247 <contato@epic247.com.br>",
      to: e.para,
      subject: e.assunto,
      html: e.html,
      text: e.texto,
      headers,
      tags: [{ name: "automacao", value: e.tag.replace(/[^a-zA-Z0-9_-]/g, "_") }],
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const d = (await res.json()) as { id?: string };
  return { modo: "live", id: d.id ?? "sem-id" };
}
