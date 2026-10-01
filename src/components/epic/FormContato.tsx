"use client";

import { useId, useState } from "react";
import { enviar } from "@/lib/epic/client/track";

const campo =
  "w-full rounded-[var(--radius-epic)] border border-linha bg-papel-claro px-4 py-3 text-grafite focus:border-grafite";

/** Formulário de contato (RF-059): validação, confirmação e erro tratado. */
export default function FormContato() {
  const id = useId();
  const [estado, setEstado] = useState<"livre" | "enviando" | "ok">("livre");
  const [erro, setErro] = useState<string | null>(null);

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const f = new FormData(e.currentTarget);
    if (!String(f.get("message") ?? "").trim()) {
      setErro("Escreva a sua mensagem.");
      return;
    }
    setEstado("enviando");
    try {
      await enviar("/api/v2/contato", {
        name: f.get("name"),
        email: f.get("email"),
        subject: f.get("subject"),
        message: f.get("message"),
        website: f.get("website"),
      });
      setEstado("ok");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível enviar.");
      setEstado("livre");
    }
  }

  if (estado === "ok") {
    return (
      <div role="status" className="self-start rounded-[var(--radius-epic)] border border-latao/50 bg-papel-claro p-8">
        <p className="font-display text-3xl text-grafite">Mensagem enviada.</p>
        <p className="mt-3 text-grafite/80">Respondemos no seu e-mail assim que possível.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submeter} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-n`} className="mb-1.5 block text-sm font-medium">Nome</label>
          <input id={`${id}-n`} name="name" required autoComplete="name" className={campo} />
        </div>
        <div>
          <label htmlFor={`${id}-e`} className="mb-1.5 block text-sm font-medium">E-mail</label>
          <input id={`${id}-e`} name="email" type="email" required autoComplete="email" className={campo} />
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-s`} className="mb-1.5 block text-sm font-medium">Assunto</label>
        <input id={`${id}-s`} name="subject" maxLength={150} className={campo} />
      </div>
      <div>
        <label htmlFor={`${id}-m`} className="mb-1.5 block text-sm font-medium">Mensagem</label>
        <textarea id={`${id}-m`} name="message" rows={6} required maxLength={3000} className={campo} />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <p className="text-xs text-mineral-escuro">
        Usamos seus dados só para responder. Veja a{" "}
        <a href="/privacidade" className="underline underline-offset-2">política de privacidade</a>.
      </p>
      {erro && <p role="alert" className="text-sm text-[#9a3b2a]">{erro}</p>}
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="rounded-[var(--radius-epic)] bg-grafite px-7 py-3.5 text-[15px] font-semibold text-papel hover:bg-tinta disabled:opacity-50"
      >
        {estado === "enviando" ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
