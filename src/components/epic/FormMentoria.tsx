"use client";

import { useId, useState } from "react";
import { enviar, espelhar } from "@/lib/epic/client/track";

const campo =
  "w-full rounded-[var(--radius-epic)] border border-linha bg-papel px-4 py-3 text-grafite focus:border-grafite";

/** Interesse na Mentoria (RF-060). Sem dado médico ou psicológico. */
export default function FormMentoria({ listaDeEspera }: { listaDeEspera: boolean }) {
  const id = useId();
  const [estado, setEstado] = useState<"livre" | "enviando" | "ok">("livre");
  const [erro, setErro] = useState<string | null>(null);
  const [marketing, setMarketing] = useState(false);

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEstado("enviando");
    const f = new FormData(e.currentTarget);
    try {
      const d = await enviar<{ event_id?: string; lista_de_espera?: boolean }>("/api/v2/mentoria", {
        name: f.get("name"),
        email: f.get("email"),
        challenge: f.get("challenge"),
        desired_change: f.get("desired_change"),
        availability: f.get("availability"),
        marketing,
        website: f.get("website"),
      });
      if (d.event_id) espelhar("MentoringInterest", d.event_id);
      setEstado("ok");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível enviar.");
      setEstado("livre");
    }
  }

  if (estado === "ok") {
    return (
      <div role="status" className="rounded-[var(--radius-epic)] border border-latao/50 bg-papel-claro p-7">
        <p className="font-display text-2xl text-grafite">Recebido.</p>
        <p className="mt-2 text-grafite/80">
          {listaDeEspera
            ? "Você está na lista de espera. Avisamos por e-mail quando uma vaga abrir."
            : "A equipe vai ler e responder por e-mail com os próximos passos."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submeter} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-n`} className="mb-1.5 block text-sm font-medium text-grafite">Nome</label>
          <input id={`${id}-n`} name="name" required autoComplete="name" className={campo} />
        </div>
        <div>
          <label htmlFor={`${id}-e`} className="mb-1.5 block text-sm font-medium text-grafite">E-mail</label>
          <input id={`${id}-e`} name="email" type="email" required autoComplete="email" className={campo} />
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-c`} className="mb-1.5 block text-sm font-medium text-grafite">
          Qual é o seu principal desafio hoje?
        </label>
        <textarea id={`${id}-c`} name="challenge" rows={3} maxLength={1000} className={campo} />
      </div>
      <div>
        <label htmlFor={`${id}-m`} className="mb-1.5 block text-sm font-medium text-grafite">
          Que mudança você quer fazer agora?
        </label>
        <textarea id={`${id}-m`} name="desired_change" rows={3} maxLength={1000} className={campo} />
      </div>
      <div>
        <label htmlFor={`${id}-a`} className="mb-1.5 block text-sm font-medium text-grafite">
          Disponibilidade aproximada
        </label>
        <input id={`${id}-a`} name="availability" placeholder="Ex.: terças à noite, manhãs" maxLength={200} className={campo} />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex items-start gap-3 text-sm leading-snug text-grafite/80">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-grafite)]" />
        <span>Também quero receber conteúdos do EPIC247 por e-mail. É opcional.</span>
      </label>
      <p className="text-xs text-mineral-escuro">
        Não precisa contar nada sobre saúde. Usamos seus dados conforme a{" "}
        <a href="/privacidade" className="underline underline-offset-2">política de privacidade</a>.
      </p>
      {erro && <p role="alert" className="text-sm text-[#9a3b2a]">{erro}</p>}
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="rounded-[var(--radius-epic)] bg-grafite px-7 py-3.5 text-[15px] font-semibold text-papel hover:bg-tinta disabled:opacity-50"
      >
        {estado === "enviando" ? "Enviando..." : listaDeEspera ? "Entrar na lista de espera" : "Enviar"}
      </button>
    </form>
  );
}
