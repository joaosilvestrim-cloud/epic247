// Envio de e-mail via Resend (REST API, sem SDK). Best-effort: se RESEND_API_KEY
// não estiver configurada, vira no-op e o fluxo do lead segue normalmente.

export interface SendReportEmailOptions {
  to: string;
  nome?: string | null;
  drenoNome: string;
  pdfName: string;
  /** URL pública do PDF (Resend baixa e anexa). Preferencial. */
  attachmentUrl?: string;
  /** Alternativa: bytes do PDF gerado em runtime. */
  pdf?: Uint8Array;
}

export async function sendReportEmail(
  opts: SendReportEmailOptions
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "EPIC247 <onboarding@resend.dev>";
  if (!key) {
    console.warn("[email] RESEND_API_KEY ausente — e-mail não enviado:", opts.to);
    return false;
  }

  const nome = opts.nome?.trim() || "";
  const ola = nome ? `Olá, ${nome}!` : "Olá!";

  // Anexo: preferimos a URL hospedada (Resend baixa); senão usamos os bytes.
  let attachment: Record<string, string> | null = null;
  if (opts.attachmentUrl) {
    attachment = { filename: opts.pdfName, path: opts.attachmentUrl };
  } else if (opts.pdf) {
    attachment = {
      filename: opts.pdfName,
      content: Buffer.from(opts.pdf).toString("base64"),
    };
  }
  if (!attachment) {
    console.warn("[email] sem anexo (nem URL nem bytes):", opts.to);
    return false;
  }

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8f8f8;padding:32px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e1d8">
      <div style="background:#182848;padding:28px 32px">
        <span style="color:#fff;font-size:22px;font-weight:800">EPIC<span style="color:#c09840">247</span></span>
        <div style="color:#b9c0cf;font-size:11px;letter-spacing:2px;margin-top:4px">MÓDULO ENERGIA</div>
      </div>
      <div style="padding:32px">
        <p style="font-size:16px;color:#182848;margin:0 0 12px">${ola}</p>
        <p style="font-size:15px;color:#3b3b45;line-height:1.6;margin:0 0 16px">
          Seu diagnóstico está pronto. Seu Dreno Dominante é
          <strong style="color:#c09840">${opts.drenoNome}</strong>.
        </p>
        <p style="font-size:15px;color:#3b3b45;line-height:1.6;margin:0 0 24px">
          Em anexo está o seu <strong>relatório completo</strong> com os 4 próximos
          passos práticos para reverter isso e recarregar a sua energia.
        </p>
        <a href="https://energia.epic247.com.br/#oferta"
           style="display:inline-block;background:#c09840;color:#0f1c34;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:12px">
          Conhecer o Módulo Energia · R$97
        </a>
      </div>
      <div style="padding:18px 32px;background:#f8f0e8;color:#9a8f7c;font-size:12px">
        EPIC247 · Módulo Energia
      </div>
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: `Seu relatório de energia · ${opts.drenoNome}`,
        html,
        attachments: [attachment],
      }),
    });
    if (!res.ok) {
      console.error("[email] erro:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] falha:", err);
    return false;
  }
}
