"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Estado {
  emAndamento: { nome: string; url: string; respondidas: number; total: number } | null;
  resultado: { nome: string; url: string; data: string } | null;
}

/**
 * Faixa discreta para quem volta: continuar o Mapa que ficou pela metade ou
 * reabrir o último resultado. Some quando não há nada (a página continua
 * estática; quem decide é o cookie, consultado depois de carregar).
 */
export default function Retorno({ esconderMapa }: { esconderMapa?: string }) {
  const [e, setE] = useState<Estado | null>(null);
  useEffect(() => {
    let vivo = true;
    fetch("/api/v2/retorno", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => vivo && setE({ emAndamento: j.emAndamento ?? null, resultado: j.resultado ?? null }))
      .catch(() => null);
    return () => {
      vivo = false;
    };
  }, []);

  const andamento = e?.emAndamento && e.emAndamento.url !== esconderMapa ? e.emAndamento : null;
  const resultado = !andamento ? e?.resultado : null;
  if (!andamento && !resultado) return null;

  return (
    <div className="border-b border-linha bg-papel-escuro/70">
      <div className="mx-auto flex max-w-[76rem] flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3 text-[15px] sm:px-8">
        {andamento ? (
          <>
            <span className="text-grafite/80">
              Seu {andamento.nome} ficou em {andamento.respondidas} de {andamento.total} perguntas.
            </span>
            <Link href={andamento.url} className="font-medium text-grafite underline underline-offset-4">
              Continuar de onde parei
            </Link>
          </>
        ) : resultado ? (
          <>
            <span className="text-grafite/80">
              Você fez o {resultado.nome} em{" "}
              {new Date(resultado.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}.
            </span>
            <Link href={resultado.url} className="font-medium text-grafite underline underline-offset-4">
              Ver meu resultado
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
