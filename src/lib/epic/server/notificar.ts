import "server-only";
import { enviarEmail } from "./resend";

/**
 * Aviso interno para a equipe (Mentoria, contato). Destino em
 * EPIC_TEAM_EMAIL. Sem destino configurado, não faz nada. Respeita o modo
 * de envio: no staging é simulado, a não ser que o e-mail esteja na allowlist.
 */
export async function notificarEquipe(assunto: string, linhas: string[]) {
  const para = process.env.EPIC_TEAM_EMAIL;
  if (!para) return;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  try {
    await enviarEmail({
      para,
      assunto: `[EPIC247] ${assunto}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">${linhas.map((l) => `<p>${esc(l)}</p>`).join("")}</div>`,
      texto: linhas.join("\n"),
      descadastroUrl: null,
      tag: "interno",
    });
  } catch {
    /* aviso interno nunca derruba o fluxo da pessoa */
  }
}
