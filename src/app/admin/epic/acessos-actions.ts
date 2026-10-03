"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDimensionId } from "@/lib/epic/dimensions";
import { alterarAcesso, BUCKET_PRIVADO, concederManual, garantirBucket } from "@/lib/epic/server/acessos";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { enviarAcessoLiberado } from "@/lib/epic/server/conta";
import { DB_SCHEMA, withTx } from "@/lib/epic/server/db";
import { emailValido, leadPorEmail } from "@/lib/epic/server/identity";
import { reprocessarPlano } from "@/lib/epic/server/planos";

// Ações do admin para o Meu EPIC (CR-01): acessos, Planos e materiais.
// Cada uma confere o admin por conta própria.

const s = (f: FormData, k: string, n = 500) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null;
};
const UUID = /^[0-9a-f-]{36}$/i;

function destinoDo(productId: string) {
  if (productId.startsWith("kit_")) return `/meu-epic/produtos/kit/${productId.slice(4)}`;
  if (productId === "protocol") return "/meu-epic/produtos/protocolo";
  if (productId.startsWith("plan_")) return "/meu-epic/planos";
  return "/meu-epic";
}

export async function alterarAcessoAdmin(f: FormData) {
  await exigirAdmin();
  const lead = s(f, "lead_id", 40);
  const grant = s(f, "grant_id", 40);
  const status = s(f, "status", 20);
  if (!lead || !grant || !UUID.test(grant) || !["active", "suspended", "revoked"].includes(status ?? "")) return;
  await withTx((q) => alterarAcesso(q, grant, status as "active" | "suspended" | "revoked", s(f, "motivo", 200) ?? "ajuste_admin"));
  revalidatePath(`/admin/epic/leads/${lead}`);
  redirect(`/admin/epic/leads/${lead}?acesso=ok#meu-epic`);
}

export async function concederAcessoAdmin(f: FormData) {
  await exigirAdmin();
  const lead = s(f, "lead_id", 40);
  const produto = s(f, "product_id", 40);
  if (!lead || !UUID.test(lead) || !produto) return;
  const avisar = f.get("avisar") === "on";
  await withTx(async (q) => {
    const novo = await concederManual(q, lead, produto, "admin");
    if (novo && avisar) {
      const [p] = await q<{ product_name: string }>("select product_name from products where product_id = $1", [produto]);
      await enviarAcessoLiberado(q, lead, p.product_name, destinoDo(produto));
    }
  });
  revalidatePath(`/admin/epic/leads/${lead}`);
  redirect(`/admin/epic/leads/${lead}?acesso=ok#meu-epic`);
}

export async function reprocessarPlanoAdmin(f: FormData) {
  await exigirAdmin();
  const lead = s(f, "lead_id", 40);
  const id = s(f, "plan_generation_id", 40);
  if (!lead || !id || !UUID.test(id)) return;
  const r = await withTx((q) => reprocessarPlano(q, id)).catch(() => "falhou");
  revalidatePath(`/admin/epic/leads/${lead}`);
  redirect(`/admin/epic/leads/${lead}?plano=${r}#meu-epic`);
}

/**
 * Migração de compradores anteriores (D11): uma linha por e-mail. Cria o
 * lead se preciso, concede o acesso e, se marcado, envia o link de entrada.
 */
export async function importarCompradores(f: FormData) {
  await exigirAdmin();
  const produto = s(f, "product_id", 40);
  if (!produto) return;
  const avisar = f.get("avisar") === "on";
  const emails = [
    ...new Set(String(f.get("emails") ?? "").split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(emailValido)),
  ].slice(0, 500);
  let novos = 0;
  for (const email of emails) {
    await withTx(async (q) => {
      const lead = await leadPorEmail(q, email, null, null);
      if (await concederManual(q, lead, produto, "migration")) {
        novos++;
        if (avisar) {
          const [p] = await q<{ product_name: string }>("select product_name from products where product_id = $1", [produto]);
          await enviarAcessoLiberado(q, lead, p.product_name, destinoDo(produto));
        }
      }
    });
  }
  revalidatePath("/admin/epic/materiais");
  redirect(`/admin/epic/materiais?importados=${novos}&lidos=${emails.length}#migracao`);
}

// ── Materiais ──

/** Registra o material já enviado ao bucket privado. Mesmo tipo e título = nova versão. */
export async function registrarMaterial(d: {
  product_type: string;
  dimension: string;
  asset_kind: string;
  title: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  published: boolean;
}): Promise<{ ok: boolean; erro?: string }> {
  await exigirAdmin();
  const titulo = d.title.trim().slice(0, 160);
  if (!["kit", "protocol"].includes(d.product_type) || !isDimensionId(d.dimension)) return { ok: false, erro: "Produto ou dimensão inválidos." };
  if (!["manual", "workbook", "ferramenta", "outro"].includes(d.asset_kind)) return { ok: false, erro: "Tipo inválido." };
  if (!titulo || !d.storage_path.startsWith(`${DB_SCHEMA}/${d.product_type}/${d.dimension}/`)) return { ok: false, erro: "Dados incompletos." };
  await withTx(async (q) => {
    const [antes] = await q<{ version: number | null }>(
      "select max(version) as version from product_assets where product_type = $1 and dimension = $2 and asset_kind = $3 and title = $4",
      [d.product_type, d.dimension, d.asset_kind, titulo]
    );
    if (antes?.version && d.published) {
      await q(
        `update product_assets set published = false, updated_at = now()
         where product_type = $1 and dimension = $2 and asset_kind = $3 and title = $4`,
        [d.product_type, d.dimension, d.asset_kind, titulo]
      );
    }
    await q(
      `insert into product_assets (product_type, dimension, asset_kind, title, storage_path, file_name, file_size, version, published)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [d.product_type, d.dimension, d.asset_kind, titulo, d.storage_path, d.file_name.slice(0, 160), d.file_size,
        (antes?.version ?? 0) + 1, d.published]
    );
  });
  revalidatePath("/admin/epic/materiais");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function publicarMaterial(f: FormData) {
  await exigirAdmin();
  const id = s(f, "asset_id", 40);
  if (!id || !UUID.test(id)) return;
  await withTx((q) =>
    q("update product_assets set published = $2, updated_at = now() where asset_id = $1", [id, f.get("published") === "1"])
  );
  revalidatePath("/admin/epic/materiais");
  revalidatePath("/", "layout");
  redirect("/admin/epic/materiais?ok=1");
}

export async function excluirMaterial(f: FormData) {
  await exigirAdmin();
  const id = s(f, "asset_id", 40);
  if (!id || !UUID.test(id)) return;
  const [m] = await withTx((q) =>
    q<{ storage_path: string }>("delete from product_assets where asset_id = $1 returning storage_path", [id])
  );
  if (m) {
    const sb = await garantirBucket().catch(() => null);
    await sb?.storage.from(BUCKET_PRIVADO).remove([m.storage_path]);
  }
  revalidatePath("/admin/epic/materiais");
  revalidatePath("/", "layout");
  redirect("/admin/epic/materiais?ok=1");
}

/** Troca quem entrega o produto (Kiwify na transição, depois Meu EPIC). */
export async function alterarEntrega(f: FormData) {
  await exigirAdmin();
  const id = s(f, "product_id", 40);
  const entrega = s(f, "delivery", 10);
  if (!id || !["epic", "kiwify"].includes(entrega ?? "")) return;
  await withTx((q) => q("update products set delivery = $2, updated_at = now() where product_id = $1", [id, entrega]));
  revalidatePath("/admin/epic/materiais");
  revalidatePath("/", "layout");
  redirect("/admin/epic/materiais?ok=1");
}
