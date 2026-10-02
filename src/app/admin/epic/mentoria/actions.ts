"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { agendarAutomacao } from "@/lib/epic/server/automations";
import { withTx } from "@/lib/epic/server/db";
import { dispararFila } from "@/lib/epic/server/dispatcher";
import { registrarEvento } from "@/lib/epic/server/events";
import { logErro } from "@/lib/epic/server/http";
import { linkPagamentoMentoria } from "@/lib/epic/server/mentoria";
import { capacidadeMentoria, produto, vendavel } from "@/lib/epic/server/produtos";
import { ehStatusMentoria, podeLiberarLink, podeMudar } from "@/lib/epic/mentoria";

// Ações da Mentoria no admin. Cada uma confere o admin por conta própria:
// Server Action é acessível por POST direto, não só pela tela.

const s = (f: FormData, k: string, n = 500) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null;
};
const UUID = /^[0-9a-f-]{36}$/i;
const voltar = (f: FormData, extra: string, id?: string | null) => {
  const filtro = s(f, "filtro", 40);
  const qs = [filtro ? `status=${filtro}` : null, extra].filter(Boolean).join("&");
  redirect(`/admin/epic/mentoria?${qs}${id ? `#c-${id}` : ""}`);
};

/** Muda o status à mão, só pelas transições permitidas. "ativo" vem do pagamento. */
export async function mudarStatusMentoria(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  const para = s(f, "status", 40);
  if (!id || !UUID.test(id) || !ehStatusMentoria(para)) return voltar(f, "erro=status", id);
  const r = await withTx(async (q) => {
    const [c] = await q<{ lead_id: string | null; status: string }>(
      "select lead_id, status from mentoring_applications where id = $1 for update", [id]
    );
    if (!c || !ehStatusMentoria(c.status) || !podeMudar(c.status, para)) return false;
    await q(
      "update mentoring_applications set status = $2, status_changed_at = now(), updated_at = now() where id = $1",
      [id, para]
    );
    if (c.lead_id) {
      // Primeiro contato feito: evento de sucesso da AUT_MENTORING_INTEREST (Matriz §10).
      if (para === "em_contato") {
        await registrarEvento(q, "MentoringBooked", { lead_id: c.lead_id, props: { candidatura: id } });
      }
      if (para === "lista_espera") {
        await q(
          `update leads set mentoring_waitlist = true, mentoring_waitlist_at = coalesce(mentoring_waitlist_at, now())
           where lead_id = $1`,
          [c.lead_id]
        );
      } else if (c.status === "lista_espera") {
        await q("update leads set mentoring_waitlist = false where lead_id = $1", [c.lead_id]);
      }
      // Link recolhido: a rota de pagamento já recusa, e a recuperação de checkout para.
      if (c.status === "link_enviado") {
        await q(
          `update messages set status = 'cancelled', skip_reason = 'link_recolhido'
           where lead_id = $1 and status = 'scheduled' and automation_id = 'AUT_CHECKOUT_ABANDON'
             and context->>'product_id' = 'mentoring'`,
          [c.lead_id]
        );
      }
    }
    return true;
  });
  revalidatePath("/admin/epic/mentoria");
  return voltar(f, r ? "ok=status" : "erro=transicao", id);
}

/**
 * Vaga confirmada: libera o link de pagamento da Kiwify por e-mail
 * transacional. Recusa se a Mentoria não tem checkout configurado ou se
 * os clientes ativos já ocupam a capacidade.
 */
export async function liberarLinkMentoria(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  if (!id || !UUID.test(id)) return voltar(f, "erro=status");
  const p = await produto("mentoring");
  if (!vendavel(p)) return voltar(f, "erro=checkout", id);
  const vagas = await capacidadeMentoria();
  if (!vagas.disponivel) return voltar(f, "erro=capacidade", id);

  const r = await withTx(async (q) => {
    const [c] = await q<{ lead_id: string | null; status: string; email: string }>(
      "select lead_id, status, email from mentoring_applications where id = $1 for update", [id]
    );
    if (!c?.lead_id || !c.email) return "sem_email";
    if (!ehStatusMentoria(c.status) || !podeLiberarLink(c.status)) return "transicao";
    const link = linkPagamentoMentoria(id);
    await q(
      `update mentoring_applications set status = 'link_enviado', payment_link_url = $2,
         payment_link_sent_at = now(), status_changed_at = case when status <> 'link_enviado' then now() else status_changed_at end,
         updated_at = now()
       where id = $1`,
      [id, link]
    );
    await registrarEvento(q, "MentoringPaymentLinkSent", {
      lead_id: c.lead_id, product_id: p.product_id, product_type: p.product_type, product_price: p.price_list,
      props: { candidatura: id, reenvio: c.status === "link_enviado" },
    });
    await agendarAutomacao(q, c.lead_id, "AUT_MENTORING_PAYMENT_LINK", {
      application_id: id, link_id: `${id}:${Date.now()}`, product_id: p.product_id, checkout_link: link,
    });
    return "ok";
  });
  if (r !== "ok") return voltar(f, `erro=${r}`, id);
  // Envia já, sem esperar o próximo disparo agendado. Falha aqui não perde nada:
  // a mensagem fica na fila e sai no próximo ciclo.
  try {
    await dispararFila(10);
  } catch (e) {
    logErro("admin/mentoria/link", e);
  }
  revalidatePath("/admin/epic/mentoria");
  return voltar(f, "ok=link", id);
}

/** Nota interna da equipe. Nunca vai para a pessoa. */
export async function salvarNotaMentoria(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  if (!id || !UUID.test(id)) return voltar(f, "erro=status");
  await withTx((q) =>
    q("update mentoring_applications set internal_note = $2, updated_at = now() where id = $1", [id, s(f, "nota", 2000)])
  );
  revalidatePath("/admin/epic/mentoria");
  return voltar(f, "ok=nota", id);
}
