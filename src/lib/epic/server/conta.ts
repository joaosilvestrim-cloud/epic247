import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { renderEmail, renderTexto, SITE_URL, type BlocoEmail } from "../emails/layout";
import { destinoSeguro } from "../meu-epic";
import { withTx, type Q } from "./db";
import { registrarEvento } from "./events";
import { COOKIE_LEAD, seguirLead } from "./identity";
import { enviarEmail } from "./resend";

// Autenticação do Meu EPIC (CR-01A, decisões D1 e D2 da análise de impacto).
// Link mágico próprio, enviado pelo Resend: sem senha e sem segunda tabela de
// usuários. A conta é o lead (o mesmo da união de histórico por e-mail).
// No banco ficam só os hashes do token e da sessão.

export const COOKIE_CONTA = "epic_conta";
const MINUTO = 60_000;
export const VALIDADE_LINK_MIN = 20;
export const VALIDADE_LINK_COMPRA_H = 72;
export const SESSAO_DIAS = 30;

const hash = (v: string) => createHash("sha256").update(v).digest("hex");
const novoSegredo = () => randomBytes(32).toString("base64url");
const FORMATO = /^[A-Za-z0-9_-]{40,64}$/;

export interface Conta {
  leadId: string;
  email: string;
  nome: string | null;
}

/** Cria um link de entrada. "compra" vale mais (chega junto com o e-mail da compra). */
export async function criarLinkDeEntrada(
  q: Q,
  lead: string,
  email: string,
  finalidade: "login" | "compra",
  destino: string
): Promise<string> {
  const token = novoSegredo();
  const validade = finalidade === "compra" ? VALIDADE_LINK_COMPRA_H * 60 * MINUTO : VALIDADE_LINK_MIN * MINUTO;
  await q(
    `insert into auth_tokens (token_hash, lead_id, purpose, email, next_path, expires_at)
     values ($1, $2, $3, $4, $5, $6)`,
    [hash(token), lead, finalidade, email.toLowerCase(), destinoSeguro(destino), new Date(Date.now() + validade).toISOString()]
  );
  return `${SITE_URL}/meu-epic/entrar/${token}`;
}

/**
 * Pedido de link pela tela de entrada. Sempre responde igual, exista ou não
 * a conta: a tela não revela quem é cliente. O e-mail pode ser o do Mapa ou
 * o usado no checkout da Kiwify (D5): os dois levam à mesma conta.
 */
export async function pedirLink(emailDigitado: string, destino: string): Promise<void> {
  const email = emailDigitado.trim().toLowerCase();
  const envio = await withTx(async (q) => {
    const [lead] = await q<{ lead_id: string; first_name: string | null }>(
      "select lead_id, first_name from leads where lower(email) = $1 and merged_into is null", [email]
    );
    let leadId: string | null = lead?.lead_id ?? null;
    if (!leadId) {
      const [compra] = await q<{ lead_id: string }>(
        `select lead_id from transactions where lower(buyer_email) = $1 and lead_id is not null
         order by created_at desc limit 1`,
        [email]
      );
      leadId = compra ? await seguirLead(q, compra.lead_id) : null;
    }
    if (!leadId) return null;
    // Um pedido por minuto por conta: evita encher a caixa de alguém.
    const [recente] = await q(
      "select 1 from auth_tokens where lead_id = $1 and purpose = 'login' and created_at > now() - interval '1 minute'",
      [leadId]
    );
    if (recente) return null;
    const [nome] = await q<{ first_name: string | null }>("select first_name from leads where lead_id = $1", [leadId]);
    const url = await criarLinkDeEntrada(q, leadId, email, "login", destino);
    return { url, nome: nome?.first_name ?? null };
  });
  if (!envio) return;
  const blocos: BlocoEmail[] = [
    { tipo: "texto", texto: envio.nome ? `Olá, ${envio.nome}.` : "Olá." },
    { tipo: "texto", texto: "Use o botão abaixo para entrar no Meu EPIC." },
    { tipo: "botao", texto: "Entrar no Meu EPIC", href: envio.url },
    { tipo: "pequeno", texto: `O link vale por ${VALIDADE_LINK_MIN} minutos e funciona uma vez. Se não foi você que pediu, ignore este e-mail.` },
  ];
  await enviarEmail({
    para: email,
    assunto: "Seu link de acesso ao Meu EPIC",
    html: renderEmail({ preheader: "Entre sem senha.", blocos, descadastroUrl: null, motivo: "Você recebeu este e-mail porque pediu acesso ao Meu EPIC." }),
    texto: renderTexto(blocos, null),
    descadastroUrl: null,
    tag: "meu_epic_login",
  });
}

/** Estado do link, sem consumir (a página mostra o botão "Entrar"). */
export async function conferirLink(token: string): Promise<"valido" | "expirado"> {
  if (!FORMATO.test(token)) return "expirado";
  const [t] = await withTx((q) =>
    q("select 1 from auth_tokens where token_hash = $1 and used_at is null and expires_at > now()", [hash(token)])
  );
  return t ? "valido" : "expirado";
}

/**
 * Consome o link e abre a sessão. O consumo é feito por POST (botão na
 * página): antivírus de e-mail que abrem links sozinhos não gastam o acesso.
 */
export async function entrar(token: string): Promise<{ destino: string } | null> {
  if (!FORMATO.test(token)) return null;
  const segredo = novoSegredo();
  const ua = (await headers()).get("user-agent") ?? "";
  const r = await withTx(async (q) => {
    const [t] = await q<{ lead_id: string; next_path: string | null; purpose: string }>(
      `update auth_tokens set used_at = now()
       where token_hash = $1 and used_at is null and expires_at > now()
       returning lead_id, next_path, purpose`,
      [hash(token)]
    );
    if (!t) return null;
    const lead = await seguirLead(q, t.lead_id);
    if (!lead) return null;
    await q(
      `insert into auth_sessions (session_hash, lead_id, expires_at, device)
       values ($1, $2, now() + make_interval(days => $3), $4)`,
      [hash(segredo), lead, SESSAO_DIAS, dispositivo(ua)]
    );
    await registrarEvento(q, "LoginMeuEpic", { lead_id: lead, props: { via: t.purpose } });
    return { lead, destino: destinoSeguro(t.next_path) };
  });
  if (!r) return null;
  const jar = await cookies();
  jar.set(COOKIE_CONTA, segredo, cookieConta());
  // O site passa a reconhecer a mesma pessoa: Mapas feitos agora entram na conta.
  jar.set(COOKIE_LEAD, r.lead, { ...cookieConta(), maxAge: 60 * 60 * 24 * 365 });
  return { destino: r.destino };
}

export function cookieConta() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSAO_DIAS * 24 * 60 * 60,
  };
}

/**
 * Conta da sessão atual, ou null. Renova a validade no banco uma vez por dia
 * de uso (sessão de 30 dias, renovada a cada uso; o cookie é renovado no proxy).
 */
export async function contaAtual(): Promise<Conta | null> {
  const segredo = (await cookies()).get(COOKIE_CONTA)?.value;
  if (!segredo || !FORMATO.test(segredo)) return null;
  return withTx(async (q) => {
    const [s] = await q<{ lead_id: string; renovar: boolean }>(
      `select lead_id, last_seen_at < now() - interval '1 day' as renovar from auth_sessions
       where session_hash = $1 and ended_at is null and expires_at > now()`,
      [hash(segredo)]
    );
    if (!s) return null;
    const lead = await seguirLead(q, s.lead_id);
    if (!lead) return null;
    if (s.renovar) {
      await q(
        `update auth_sessions set last_seen_at = now(), expires_at = now() + make_interval(days => $2)
         where session_hash = $1`,
        [hash(segredo), SESSAO_DIAS]
      );
    }
    const [l] = await q<{ email: string | null; first_name: string | null }>(
      "select email, first_name from leads where lead_id = $1", [lead]
    );
    if (!l?.email) return null;
    return { leadId: lead, email: l.email, nome: l.first_name };
  });
}

/** Página do Meu EPIC: exige sessão. Sem ela, vai para a entrada e volta depois. */
export async function exigirConta(destino: string): Promise<Conta> {
  const c = await contaAtual().catch(() => null);
  if (!c) redirect(`/meu-epic/entrar?volta=${encodeURIComponent(destinoSeguro(destino))}`);
  return c;
}

export async function sair(): Promise<void> {
  const jar = await cookies();
  const segredo = jar.get(COOKIE_CONTA)?.value;
  if (segredo && FORMATO.test(segredo)) {
    await withTx((q) => q("update auth_sessions set ended_at = now() where session_hash = $1", [hash(segredo)])).catch(() => null);
  }
  jar.delete(COOKIE_CONTA);
}

function dispositivo(ua: string) {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "mac";
  return "outro";
}

/**
 * Aviso de acesso liberado fora do fluxo de compra (cortesia ou migração de
 * compradores do Ciclo 1, D11): link de entrada de 72 horas.
 */
export async function enviarAcessoLiberado(q: Q, lead: string, produtoNome: string, destino: string): Promise<boolean> {
  const [l] = await q<{ email: string | null; first_name: string | null }>(
    "select email, first_name from leads where lead_id = $1", [lead]
  );
  if (!l?.email) return false;
  const url = await criarLinkDeEntrada(q, lead, l.email, "compra", destino);
  const blocos: BlocoEmail[] = [
    { tipo: "texto", texto: l.first_name ? `Olá, ${l.first_name}.` : "Olá." },
    { tipo: "texto", texto: `Seu acesso ao ${produtoNome} está liberado no Meu EPIC, a sua área no site do EPIC247.` },
    { tipo: "botao", texto: "Acessar meu EPIC", href: url },
    { tipo: "pequeno", texto: "O botão vale por 72 horas e funciona uma vez. Depois disso, entre em epic247.com.br/meu-epic com este e-mail e receba um novo link na hora, sem senha." },
    { tipo: "pequeno", texto: `Algum problema com o acesso? Fale com a gente: ${SITE_URL}/contato?assunto=produtos` },
  ];
  await enviarEmail({
    para: l.email,
    assunto: `Seu acesso ao ${produtoNome} no Meu EPIC`,
    html: renderEmail({ preheader: "Seu acesso está liberado.", blocos, descadastroUrl: null, motivo: "Você recebeu este e-mail porque tem um produto do EPIC247." }),
    texto: renderTexto(blocos, null),
    descadastroUrl: null,
    tag: "meu_epic_acesso",
  });
  return true;
}
