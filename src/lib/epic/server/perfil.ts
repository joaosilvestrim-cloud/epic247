import "server-only";
import { withTx } from "./db";
import { leadAtual } from "./identity";

export interface PerfilVisitante {
  lead_id: string;
  email: string | null;
  first_name: string | null;
  lifecycle_stage: string;
  protocol_purchased: boolean;
  mentoring_purchased: boolean;
  kits_owned: string[];
  plans_owned: string[];
}

/** Perfil de quem está navegando (cookie). Sem cookie ou sem banco: null. */
export async function perfilAtual(): Promise<PerfilVisitante | null> {
  try {
    return await withTx(async (q) => {
      const lead = await leadAtual(q);
      if (!lead) return null;
      const [p] = await q<Omit<PerfilVisitante, "plans_owned"> & { kits_owned: string[] | null }>(
        `select lead_id, email, first_name, lifecycle_stage, protocol_purchased, mentoring_purchased, kits_owned
         from lead_profile where lead_id = $1`,
        [lead]
      );
      if (!p) return null;
      const planos = await q<{ d: string }>(
        `select distinct p.product_dimension as d from transactions t join products p using (product_id)
         where t.lead_id = $1 and t.transaction_status = 'approved' and p.product_type = 'plan'`,
        [lead]
      );
      return { ...p, kits_owned: p.kits_owned ?? [], plans_owned: planos.map((x) => x.d) };
    });
  } catch {
    return null;
  }
}

/** Regras de supressão de oferta (RF-038 a RF-041): ver src/lib/epic/ofertas.ts. */
export { ofertasPermitidas } from "../ofertas";
