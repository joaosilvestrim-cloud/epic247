"use client";

import { useState } from "react";
import { enviar, espelhar } from "@/lib/epic/client/track";
import { MICRO } from "@/lib/epic/content/microcopy";

/**
 * Abre o checkout pelo servidor (que registra StartCheckout, bloqueia recompra
 * e monta o link com rastreio) e espelha InitiateCheckout no Pixel com o
 * mesmo event_id.
 */
export default function BotaoCheckout({
  productId,
  token,
  rotulo,
  escuro = false,
  disponivel = true,
}: {
  productId: string;
  token?: string | null;
  rotulo: string;
  escuro?: boolean;
  disponivel?: boolean;
}) {
  const [indo, setIndo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function ir() {
    setErro(null);
    setIndo(true);
    try {
      const d = await enviar<{ url: string; event_id: string; value: number }>("/api/v2/checkout/iniciar", {
        product_id: productId,
        r: token ?? null,
      });
      espelhar("StartCheckout", d.event_id, { value: d.value, currency: "BRL", product_id: productId });
      window.location.href = d.url;
    } catch (e) {
      // Recompra bloqueada e afins voltam com mensagem própria do servidor.
      setErro(e instanceof Error && e.message ? e.message : MICRO.checkout.falha);
      setIndo(false);
    }
  }

  const cores = escuro ? "bg-papel text-tinta hover:bg-papel-claro" : "bg-grafite text-papel hover:bg-tinta";
  // Produto sem checkout ativo: estado de indisponível, sem botão morto (Copy Final §27.30).
  if (!disponivel) {
    return (
      <div>
        <p className={`font-display text-lg ${escuro ? "text-papel" : "text-grafite"}`}>{MICRO.indisponivel.titulo}</p>
        <p className={`mt-1 text-sm ${escuro ? "text-papel/60" : "text-mineral-escuro"}`}>{MICRO.indisponivel.texto}</p>
      </div>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={ir}
        disabled={indo}
        className={`group inline-flex items-center gap-3 rounded-[var(--radius-epic)] px-7 py-4 text-[15px] font-semibold transition-colors disabled:opacity-50 ${cores}`}
      >
        {indo ? MICRO.checkout.levando : rotulo}
        {!indo && <span aria-hidden className="h-px w-5 bg-latao transition-all group-hover:w-8" />}
      </button>
      {!erro && <p className={`mt-3 text-xs ${escuro ? "text-papel/50" : "text-mineral-escuro"}`}>{MICRO.checkout.kiwify}</p>}
      {erro && (
        <p role="alert" className={`mt-3 text-sm ${escuro ? "text-[#e8b4a0]" : "text-[#9a3b2a]"}`}>
          {erro}
        </p>
      )}
    </div>
  );
}
