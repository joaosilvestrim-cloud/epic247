// Layout dos e-mails do EPIC247 2.0. HTML de e-mail: tabelas e estilo
// inline, porque cliente de e-mail ignora CSS moderno. Mesma paleta do site.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://epic247.com.br").replace(/\/$/, "");

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface BlocoEmail {
  tipo: "texto" | "destaque" | "citacao" | "botao" | "lista" | "pequeno";
  texto?: string;
  itens?: string[];
  href?: string;
}

export function renderEmail(opts: {
  preheader: string;
  blocos: BlocoEmail[];
  descadastroUrl: string | null;
  motivo: string;
}): string {
  const corpo = opts.blocos
    .map((b) => {
      switch (b.tipo) {
        case "texto":
          return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#2b2a28">${esc(b.texto!)}</p>`;
        case "destaque":
          return `<p style="margin:8px 0 20px;font-family:Georgia,serif;font-size:22px;line-height:1.35;color:#171614">${esc(b.texto!)}</p>`;
        case "citacao":
          return `<p style="margin:0 0 20px;padding-left:16px;border-left:2px solid #b59a63;font-family:Georgia,serif;font-size:18px;line-height:1.45;color:#2b2a28">${esc(b.texto!)}</p>`;
        case "lista":
          return `<ol style="margin:0 0 18px;padding-left:20px;color:#2b2a28;font-size:15px;line-height:1.6">${b.itens!
            .map((i) => `<li style="margin-bottom:6px">${esc(i)}</li>`)
            .join("")}</ol>`;
        case "botao":
          return `<p style="margin:24px 0 28px"><a href="${esc(b.href!)}" style="display:inline-block;background:#2b2a28;color:#f1e8dc;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:6px">${esc(b.texto!)}</a></p>`;
        case "pequeno":
          return `<p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#66625d">${esc(b.texto!)}</p>`;
      }
    })
    .join("\n");

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>EPIC247</title></head>
<body style="margin:0;padding:0;background:#f1e8dc">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1e8dc"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#f7f2ea;border:1px solid #d8ccbb;border-radius:8px">
<tr><td style="padding:28px 32px 8px;font-family:Arial,Helvetica,sans-serif">
<span style="font-weight:800;font-size:18px;color:#2b2a28;letter-spacing:-.3px">EPIC<span style="color:#b59a63;font-weight:300;font-style:italic">/</span>247</span>
<div style="height:1px;background:#b59a63;width:40px;margin:16px 0 8px"></div>
</td></tr>
<tr><td style="padding:8px 32px 24px;font-family:Arial,Helvetica,sans-serif">${corpo}</td></tr>
<tr><td style="padding:18px 32px 26px;border-top:1px solid #d8ccbb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8b8782">
${esc(opts.motivo)}${opts.descadastroUrl ? ` <a href="${esc(opts.descadastroUrl)}" style="color:#66625d">Não quero mais receber estes e-mails.</a>` : ""}<br>
EPIC247 · Transformação pessoal aplicada · <a href="${SITE_URL}/privacidade" style="color:#66625d">Privacidade</a>
</td></tr></table></td></tr></table></body></html>`;
}

/** Versão texto puro (entregabilidade e leitores de tela). */
export function renderTexto(blocos: BlocoEmail[], descadastroUrl: string | null): string {
  const linhas = blocos.flatMap((b) => {
    if (b.tipo === "lista") return b.itens!.map((i, n) => `${n + 1}. ${i}`);
    if (b.tipo === "botao") return [`${b.texto}: ${b.href}`];
    if (b.tipo === "citacao") return [`"${b.texto}"`];
    return [b.texto!];
  });
  if (descadastroUrl) linhas.push("", `Não quer mais receber? ${descadastroUrl}`);
  return linhas.join("\n\n");
}
