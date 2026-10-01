"use client";

import { useState } from "react";

const OPCOES = [
  { valor: "sim", rotulo: "Sim" },
  { valor: "em_parte", rotulo: "Em parte" },
  { valor: "nao", rotulo: "Não muito" },
] as const;

/**
 * Pergunta curta sobre o reconhecimento do resultado (seção 17 de cada Mapa,
 * Mapa de Fricção §10). Serve para validar a v1.0 dos Mapas: o admin mostra
 * as respostas por perfil.
 */
export default function FeedbackResultado({ token }: { token: string }) {
  const [resposta, setResposta] = useState<string | null>(null);
  const [comentario, setComentario] = useState("");
  const [estado, setEstado] = useState<"pergunta" | "comentario" | "fim">("pergunta");

  async function enviar(valor: string, texto?: string) {
    try {
      await fetch("/api/v2/mapas/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, resposta: valor, comentario: texto || undefined }),
      });
    } catch {
      /* feedback nunca atrapalha a página */
    }
  }

  if (estado === "fim") {
    return <p className="text-grafite/75">Obrigado. Isso ajuda a deixar os Mapas mais precisos.</p>;
  }

  return (
    <div>
      <p className="font-display text-xl text-grafite">Este resultado faz sentido para você?</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Este resultado faz sentido para você?">
        {OPCOES.map((o) => (
          <button
            key={o.valor}
            type="button"
            aria-pressed={resposta === o.valor}
            onClick={() => {
              setResposta(o.valor);
              setEstado("comentario");
              void enviar(o.valor);
            }}
            className={`rounded-[var(--radius-epic)] border px-4 py-2 text-[15px] transition-colors ${
              resposta === o.valor ? "border-grafite bg-grafite text-papel" : "border-linha bg-papel-claro text-grafite hover:border-grafite"
            }`}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
      {estado === "comentario" && resposta && (
        <form
          className="mt-5 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            void enviar(resposta, comentario.trim());
            setEstado("fim");
          }}
        >
          <label htmlFor="feedback-comentario" className="mb-1.5 block text-sm text-grafite/80">
            {resposta === "sim" ? "O que você reconheceu? (opcional)" : "O que não bateu com você? (opcional)"}
          </label>
          <textarea
            id="feedback-comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full rounded-[var(--radius-epic)] border border-linha bg-papel-claro px-3 py-2 text-base"
          />
          <button type="submit" className="mt-2 rounded-[var(--radius-epic)] bg-grafite px-4 py-2 text-sm text-papel">
            {comentario.trim() ? "Enviar" : "Pular"}
          </button>
        </form>
      )}
    </div>
  );
}
