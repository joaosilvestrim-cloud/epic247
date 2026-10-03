import { notFound, redirect } from "next/navigation";
import { withTx } from "@/lib/epic/server/db";
import { idDoPlanoPorToken } from "@/lib/epic/server/planos";

export const dynamic = "force-dynamic";

/**
 * Link antigo do Plano, por token (e-mails enviados antes do Meu EPIC).
 * Conhecer o endereço não abre mais o Plano (CR-01A): o link só aponta para
 * o Plano no Meu EPIC, que pede a entrada com o e-mail da conta (D3).
 */
export default async function PlanoAcessoAntigoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const id = await withTx((q) => idDoPlanoPorToken(q, token)).catch(() => null);
  if (!id) notFound();
  redirect(`/meu-epic/planos/${id}`);
}
