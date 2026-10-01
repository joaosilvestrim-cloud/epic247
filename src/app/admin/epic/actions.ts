"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { withTx } from "@/lib/epic/server/db";
import { dispararFila } from "@/lib/epic/server/dispatcher";
import { registrarEvento } from "@/lib/epic/server/events";
import { gerarCodigo } from "@/lib/epic/server/editorial";
import { processarWebhook } from "@/lib/epic/server/webhooks";

// Server Actions do /admin/epic. Cada uma confere o admin por conta própria:
// Server Action é acessível por POST direto, não só pela tela.

const s = (f: FormData, k: string, n = 500) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null;
};

// ── Produtos ──
export async function salvarProduto(f: FormData) {
  await exigirAdmin();
  const id = s(f, "product_id", 40);
  if (!id) return;
  const preco = Number(String(f.get("price_list") ?? "").replace(",", "."));
  const checkout = s(f, "checkout_url", 300);
  if (checkout && !/^https:\/\//.test(checkout)) redirect(`/admin/epic/produtos?erro=checkout&id=${id}#${id}`);
  const ativo = f.get("active") === "on";
  await withTx((q) =>
    q(
      `update products set price_list = coalesce($2::numeric, price_list), checkout_url = $3::text,
         provider_product_id = $4::text, active = $5::boolean and $3::text is not null, updated_at = now()
       where product_id = $1`,
      [id, Number.isFinite(preco) && preco > 0 ? preco : null, checkout, s(f, "provider_product_id", 80), ativo]
    )
  );
  revalidatePath("/", "layout");
  redirect(`/admin/epic/produtos?ok=${id}#${id}`);
}

export async function salvarCapacidadeMentoria(f: FormData) {
  await exigirAdmin();
  const bruto = Number(f.get("capacidade"));
  const n = Number.isFinite(bruto) ? Math.max(0, Math.min(50, Math.round(bruto))) : 5;
  await withTx((q) =>
    q(
      `insert into app_settings (key, value, updated_at) values ('mentoring_capacity', $1::jsonb, now())
       on conflict (key) do update set value = excluded.value, updated_at = now()`,
      [JSON.stringify(n)]
    )
  );
  revalidatePath("/mentoria");
  revalidatePath("/admin/epic/produtos");
}

// ── Webhooks ──
export async function reprocessarWebhook(f: FormData) {
  await exigirAdmin();
  const id = Number(f.get("id"));
  if (Number.isInteger(id)) await processarWebhook(id);
  revalidatePath("/admin/epic/vendas");
}

// ── Fila de e-mails ──
export async function dispararAgora() {
  await exigirAdmin();
  await dispararFila(40);
  revalidatePath("/admin/epic/emails");
}

export async function cancelarMensagem(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  if (id) {
    await withTx((q) =>
      q(
        "update messages set status = 'cancelled', skip_reason = 'cancelado_no_admin' where message_id = $1 and status = 'scheduled'",
        [id]
      )
    );
  }
  revalidatePath("/admin/epic/emails");
}

// ── Caixa de entrada ──
export async function statusMentoria(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  const st = s(f, "status", 20);
  if (id && st && ["new", "in_conversation", "client", "waitlist", "disqualified"].includes(st)) {
    await withTx(async (q) => {
      const [antes] = await q<{ lead_id: string | null; status: string }>(
        "select lead_id, status from mentoring_applications where id = $1 for update", [id]
      );
      await q("update mentoring_applications set status = $2 where id = $1", [id, st]);
      // Conversa marcada: evento de sucesso da AUT_MENTORING_INTEREST (MentoringBooked).
      if (st === "in_conversation" && antes?.status !== "in_conversation" && antes?.lead_id) {
        await registrarEvento(q, "MentoringBooked", { lead_id: antes.lead_id, props: { candidatura: id } });
      }
    });
  }
  revalidatePath("/admin/epic/caixa");
}

export async function statusContato(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  const st = s(f, "status", 20);
  if (id && st && ["new", "answered", "archived"].includes(st)) {
    await withTx((q) => q("update contact_messages set status = $2 where id = $1", [id, st]));
  }
  revalidatePath("/admin/epic/caixa");
}

// ── LGPD (RF-064) ──
/**
 * Anonimiza a pessoa: apaga nome, e-mail, textos livres e respostas
 * individuais. Mantém o que a lei exige (transações) sem o e-mail, e os
 * números agregados (pontuações) sem ligação com a identidade.
 */
export async function anonimizarLead(f: FormData) {
  await exigirAdmin();
  const id = s(f, "lead_id", 40);
  if (!id) return;
  if (f.get("confirmar") !== "ANONIMIZAR") redirect(`/admin/epic/leads/${id}?erro=confirmar#lgpd`);
  await withTx(async (q) => {
    const ids = (await q<{ lead_id: string }>("select lead_id from leads where lead_id = $1 or merged_into = $1", [id])).map(
      (r) => r.lead_id
    );
    await q(
      `update leads set email = null, first_name = null, email_consent = false, marketing_email_allowed = false,
         unsubscribed_at = coalesce(unsubscribed_at, now()), mentoring_interest = false, mentoring_waitlist = false
       where lead_id = any($1)`,
      [ids]
    );
    await q("update map_results set answers_json = '{}'::jsonb where lead_id = any($1)", [ids]);
    await q("update transactions set buyer_email = null where lead_id = any($1)", [ids]);
    await q("delete from contact_messages where lead_id = any($1)", [ids]);
    await q("delete from mentoring_applications where lead_id = any($1)", [ids]);
    await q(
      "update messages set status = 'cancelled', skip_reason = 'anonimizado' where lead_id = any($1) and status = 'scheduled'",
      [ids]
    );
    await q("update messages set context = '{}'::jsonb, subject = null where lead_id = any($1)", [ids]);
    await q("update plan_generations set content = null, access_token = null where lead_id = any($1)", [ids]);
    await q("update events set props = null, page_url = null, referrer = null where lead_id = any($1)", [ids]);
  });
  revalidatePath(`/admin/epic/leads/${id}`);
  redirect(`/admin/epic/leads/${id}?anonimizado=1`);
}

// ── Ideias (CMS) ──
const TIPOS = ["artigo", "newsletter", "video", "repertorio"];

export async function salvarConteudo(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  const titulo = s(f, "title", 200);
  const tipo = s(f, "content_type", 20);
  const slugBruto = s(f, "slug", 120) ?? titulo ?? "";
  const slug = slugBruto
    .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!titulo || !tipo || !TIPOS.includes(tipo) || !slug) redirect(`/admin/epic/ideias/${id ?? "novo"}?erro=campos`);
  const status = f.get("status") === "published" ? "published" : "draft";
  // datetime-local chega sem fuso: é horário de Brasília.
  const campoData = s(f, "published_at", 30);
  const publicado = campoData && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(campoData) ? `${campoData}:00-03:00` : campoData;
  const valores = [
    tipo, titulo, slug, s(f, "excerpt", 400), s(f, "cover", 400), s(f, "body", 60000), s(f, "video_url", 400),
    s(f, "dimension", 30), s(f, "author", 80), s(f, "seo_title", 120), s(f, "seo_description", 300), status,
    status === "published" ? publicado ?? new Date().toISOString() : publicado,
  ];
  const novoId = await withTx(async (q) => {
    // Endereço já usado por outro conteúdo: no novo, ganha um sufixo; na edição, avisa.
    const [usado] = await q("select 1 from content_items where slug = $1 and id is distinct from $2::uuid", [slug, id]);
    if (usado) {
      if (id) return null;
      valores[2] = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }
    if (id) {
      await q(
        `update content_items set content_type=$2, title=$3, slug=$4, excerpt=$5, cover=$6, body=$7, video_url=$8,
           dimension=$9, author=$10, seo_title=$11, seo_description=$12, status=$13, published_at=$14, updated_at=now()
         where id = $1`,
        [id, ...valores]
      );
      return id;
    }
    const [r] = await q<{ id: string }>(
      `insert into content_items (content_type, title, slug, excerpt, cover, body, video_url, dimension, author,
         seo_title, seo_description, status, published_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id`,
      valores
    );
    return r.id;
  });
  if (!novoId) redirect(`/admin/epic/ideias/${id}?erro=slug`);
  revalidatePath("/", "layout");
  redirect(`/admin/epic/ideias/${novoId}?salvo=1`);
}

export async function excluirConteudo(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  if (id && f.get("confirmar") === "on") await withTx((q) => q("delete from content_items where id = $1", [id]));
  revalidatePath("/", "layout");
  redirect("/admin/epic/ideias");
}

// ── Mídia paga (Financeiro §10) ──
export async function salvarInvestimento(f: FormData) {
  await exigirAdmin();
  const ini = s(f, "period_start", 10);
  const fim = s(f, "period_end", 10) ?? ini;
  const valor = Number(String(f.get("amount") ?? "").replace(/\./g, "").replace(",", "."));
  const fase = Number(f.get("fase"));
  if (!ini || !fim || !/^\d{4}-\d{2}-\d{2}$/.test(ini) || !/^\d{4}-\d{2}-\d{2}$/.test(fim) || !(valor >= 0)) {
    redirect("/admin/epic/midia?erro=campos");
  }
  await withTx((q) =>
    q(
      `insert into media_spend (period_start, period_end, channel, campaign, content, fase, amount, notes)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [ini, fim < ini! ? ini : fim, s(f, "channel", 30) ?? "meta", s(f, "campaign", 120), s(f, "content", 120),
        fase >= 1 && fase <= 5 ? fase : null, valor, s(f, "notes", 300)]
    )
  );
  revalidatePath("/admin/epic/midia");
  redirect("/admin/epic/midia?ok=1");
}

export async function excluirInvestimento(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  if (id) await withTx((q) => q("delete from media_spend where id = $1", [id]));
  revalidatePath("/admin/epic/midia");
}

// ── Banco de ideias editoriais (Sistema Editorial §7) ──
const ENUMS_IDEIA = {
  estado_icp: ["funcional_exausto", "lucido_imovel", "bem_sucedido_desalinhado", "decidido_com_medo", "inquieto_em_expansao"],
  universo: ["eu_me_vi_aqui", "ju_pensa", "historias", "cultura", "ferramentas", "movimento"],
  gatilho: ["contradicao", "custo", "reconhecimento", "possibilidade"],
  objetivo: ["atencao", "reconhecimento", "movimento"],
  status: ["ideia", "producao", "publicada", "arquivada"],
} as const;
const enumDe = (f: FormData, k: keyof typeof ENUMS_IDEIA) => {
  const v = s(f, k, 40);
  return v && (ENUMS_IDEIA[k] as readonly string[]).includes(v) ? v : null;
};

export async function salvarIdeiaEditorial(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  const ideia = s(f, "ideia_mae", 500);
  if (!ideia) redirect(`/admin/epic/editorial/${id ?? "nova"}?erro=ideia`);
  const cta = Number(f.get("cta_nivel"));
  const valores = [
    ideia, s(f, "tensao", 500), s(f, "dimensao", 30), enumDe(f, "estado_icp"), enumDe(f, "universo"),
    enumDe(f, "gatilho"), enumDe(f, "objetivo"), s(f, "formato_mae", 60), cta >= 0 && cta <= 3 ? cta : null,
    s(f, "produto_id", 40), enumDe(f, "status") ?? "ideia", s(f, "notas", 4000),
  ];
  const novoId = await withTx(async (q) => {
    if (id) {
      await q(
        `update editorial_ideas set ideia_mae=$2, tensao=$3, dimensao=$4, estado_icp=$5, universo=$6, gatilho=$7,
           objetivo=$8, formato_mae=$9, cta_nivel=$10, produto_id=$11, status=$12, notas=$13, updated_at=now()
         where id = $1`,
        [id, ...valores]
      );
      return id;
    }
    const [r] = await q<{ id: string }>(
      `insert into editorial_ideas (ideia_mae, tensao, dimensao, estado_icp, universo, gatilho, objetivo, formato_mae,
         cta_nivel, produto_id, status, notas) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id`,
      valores
    );
    return r.id;
  });
  revalidatePath("/admin/epic/editorial");
  redirect(`/admin/epic/editorial/${novoId}?salvo=1`);
}

export async function excluirIdeiaEditorial(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  if (id && f.get("confirmar") === "on") await withTx((q) => q("delete from editorial_ideas where id = $1", [id]));
  revalidatePath("/admin/epic/editorial");
  redirect("/admin/epic/editorial");
}

export async function adicionarDerivacao(f: FormData) {
  await exigirAdmin();
  const idea = s(f, "idea_id", 40);
  const formato = s(f, "formato", 60);
  if (!idea || !formato) return;
  const destino = s(f, "destino", 200) ?? "/mapa";
  await withTx(async (q) => {
    const [i] = await q<{ dimensao: string | null }>("select dimensao from editorial_ideas where id = $1", [idea]);
    await q(
      `insert into editorial_derivations (idea_id, formato, canal, codigo, destino, pago, campanha)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [idea, formato, s(f, "canal", 30) ?? "instagram", gerarCodigo(formato, i?.dimensao ?? null),
        destino.startsWith("/") ? destino : `/${destino}`, f.get("pago") === "on", s(f, "campanha", 120)]
    );
  });
  revalidatePath(`/admin/epic/editorial/${idea}`);
}

export async function salvarMetricasDerivacao(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  const idea = s(f, "idea_id", 40);
  if (!id) return;
  const n = (k: string) => {
    const v = String(f.get(k) ?? "").replace(",", ".").trim();
    return v === "" || !Number.isFinite(Number(v)) ? null : Number(v);
  };
  const data = s(f, "publicado_em", 10);
  await withTx((q) =>
    q(
      `update editorial_derivations set publicado_em = $2, views = $3, retencao_3s = $4, retencao_50 = $5,
         salvamentos = $6, compartilhamentos = $7, relatos = $8, notas = $9 where id = $1`,
      [id, data && /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : null, n("views"), n("retencao_3s"), n("retencao_50"),
        n("salvamentos"), n("compartilhamentos"), n("relatos"), s(f, "notas", 300)]
    )
  );
  if (idea) revalidatePath(`/admin/epic/editorial/${idea}`);
}

export async function excluirDerivacao(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  const idea = s(f, "idea_id", 40);
  if (id) await withTx((q) => q("delete from editorial_derivations where id = $1", [id]));
  if (idea) revalidatePath(`/admin/epic/editorial/${idea}`);
}

// ── Newsletter editorial (Funis §44) ──
/**
 * Põe uma edição publicada na fila para todos os inscritos com aceite de
 * marketing. Cada envio passa pelas mesmas regras da fila (descadastro,
 * e-mail inválido, 1 e-mail de marketing por dia). Uma edição sai uma vez só.
 */
export async function enviarNewsletter(f: FormData) {
  await exigirAdmin();
  const id = s(f, "id", 40);
  if (!id || f.get("confirmar") !== "on") redirect(`/admin/epic/ideias/${id}?erro=confirmar_envio`);
  const n = await withTx(async (q) => {
    const [c] = await q<{ ok: boolean }>(
      `select (content_type = 'newsletter' and status = 'published' and newsletter_sent_at is null) ok
       from content_items where id = $1 for update`,
      [id]
    );
    if (!c?.ok) return -1;
    const enviados = await q(
      `insert into messages (lead_id, automation_id, automation_version, step, template_key, priority, scheduled_for,
         context, dedupe_key)
       select lp.lead_id, 'AUT_NEWSLETTER_EDITION', '1.0', 'E', 'newsletter_edition', 5,
              greatest(now(), (select published_at from content_items where id = $1)),
              jsonb_build_object('content_id', $1::text), lp.lead_id || ':newsletter:' || $1
       from lead_profile lp
       where lp.email is not null and lp.marketing_email_allowed and lp.unsubscribed_at is null and lp.email_bounced_at is null
       on conflict (dedupe_key) do nothing
       returning message_id`,
      [id]
    );
    await q("update content_items set newsletter_sent_at = now(), newsletter_recipients = $2 where id = $1", [id, enviados.length]);
    return enviados.length;
  });
  revalidatePath(`/admin/epic/ideias/${id}`);
  redirect(n < 0 ? `/admin/epic/ideias/${id}?erro=nao_enviavel` : `/admin/epic/ideias/${id}?enviada=${n}`);
}
