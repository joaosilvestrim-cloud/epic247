"use client";

import { useState } from "react";

/**
 * Resultado duplo com empate: a pessoa diz qual área pesa mais agora. O
 * resultado não muda; o Plano EPIC 7 Dias parte da área escolhida
 * (Mapa de Energia §8: prioridade pela urgência que a pessoa declara).
 */
export default function EscolhaPrioridade({
  token,
  opcoes,
  inicial,
}: {
  token: string;
  opcoes: { chave: string; nome: string }[];
  inicial: string | null;
}) {
  const [escolhida, setEscolhida] = useState<string | null>(inicial);
  const [salvando, setSalvando] = useState(false);

  async function escolher(chave: string) {
    setSalvando(true);
    try {
      const r = await fetch("/api/v2/mapas/prioridade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, eixo: chave }),
      });
      if (r.ok) setEscolhida(chave);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mt-6">
      <p className="text-grafite/85">Qual das duas pesa mais para você agora?</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Qual das duas pesa mais para você agora?">
        {opcoes.map((o) => (
          <button
            key={o.chave}
            type="button"
            disabled={salvando}
            aria-pressed={escolhida === o.chave}
            onClick={() => escolher(o.chave)}
            className={`rounded-[var(--radius-epic)] border px-4 py-2 text-[15px] transition-colors disabled:opacity-60 ${
              escolhida === o.chave ? "border-grafite bg-grafite text-papel" : "border-linha bg-papel-claro text-grafite hover:border-grafite"
            }`}
          >
            {o.nome}
          </button>
        ))}
      </div>
      {escolhida && (
        <p className="mt-2 text-sm text-mineral-escuro" role="status">
          Anotado. Se você fizer o Plano de 7 dias, ele começa por {opcoes.find((o) => o.chave === escolhida)?.nome}.
        </p>
      )}
    </div>
  );
}
