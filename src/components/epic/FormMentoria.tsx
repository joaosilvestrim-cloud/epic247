"use client";

import { useId, useRef, useState } from "react";
import { espelhar } from "@/lib/epic/client/track";
import { MENTORIA_FORM as T } from "@/lib/epic/content/mentoria";
import { LIMITE_CONTEXTO, validarInteresse, type CampoMentoria } from "@/lib/epic/mentoria";

const campo =
  "w-full rounded-[var(--radius-epic)] border bg-papel px-4 py-3 text-grafite focus:border-grafite aria-[invalid=true]:border-[#9a3b2a]";

type Erros = Partial<Record<CampoMentoria, string>>;

/**
 * Interesse ou lista de espera da Mentoria (RC1 §6, RF-060). Campos
 * canônicos: nome, e-mail, WhatsApp opcional e uma pergunta opcional.
 * Sem dado médico ou psicológico. O envio não reserva vaga.
 */
export default function FormMentoria({ listaDeEspera }: { listaDeEspera: boolean }) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [estado, setEstado] = useState<"livre" | "enviando" | "ok">("livre");
  const [entrouNaEspera, setEntrouNaEspera] = useState(listaDeEspera);
  const [erros, setErros] = useState<Erros>({});
  const [falha, setFalha] = useState<string | null>(null);

  function focarPrimeiroErro(e: Erros) {
    const primeiro = (["name", "email", "whatsapp"] as const).find((k) => e[k]);
    if (primeiro) form.current?.querySelector<HTMLElement>(`[name="${primeiro}"]`)?.focus();
  }

  async function submeter(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setFalha(null);
    const f = new FormData(ev.currentTarget);
    const corpo = {
      tipo: listaDeEspera ? "lista_espera" : "interesse",
      name: f.get("name"),
      email: f.get("email"),
      whatsapp: f.get("whatsapp"),
      context: f.get("context"),
      marketing: f.get("marketing") === "on",
      website: f.get("website"),
    };
    const v = validarInteresse(corpo);
    if (!v.ok) {
      setErros(v.erros);
      focarPrimeiroErro(v.erros);
      return;
    }
    setErros({});
    setEstado("enviando");
    try {
      const r = await fetch("/api/v2/mentoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const d = (await r.json().catch(() => null)) as
        | { ok?: boolean; error?: string; campos?: Erros; event_id?: string; lista_de_espera?: boolean }
        | null;
      if (!r.ok || !d || d.ok === false) {
        if (d?.campos && Object.keys(d.campos).length) {
          setErros(d.campos);
          focarPrimeiroErro(d.campos);
        } else setFalha(d?.error ?? T.falha);
        setEstado("livre");
        return;
      }
      if (d.event_id) espelhar("MentoringInterest", d.event_id);
      setEntrouNaEspera(Boolean(d.lista_de_espera));
      setEstado("ok");
    } catch {
      setFalha(T.conexao);
      setEstado("livre");
    }
  }

  const aria = (k: CampoMentoria, extra?: string) => ({
    "aria-invalid": erros[k] ? true : undefined,
    "aria-describedby": [erros[k] ? `${id}-${k}-erro` : null, extra].filter(Boolean).join(" ") || undefined,
  });
  const erro = (k: CampoMentoria) =>
    erros[k] ? (
      <p id={`${id}-${k}-erro`} className="mt-1.5 text-sm text-[#9a3b2a]">
        {erros[k]}
      </p>
    ) : null;

  return (
    <div>
      {/* Região anunciada: confirmação e falha de envio chegam ao leitor de tela. */}
      <div aria-live="polite" role="status">
        {estado === "ok" && (
          <div className="rounded-[var(--radius-epic)] border border-latao/50 bg-papel-claro p-7">
            <p className="font-display text-2xl leading-snug text-grafite">{entrouNaEspera ? T.okEspera : T.okInteresse}</p>
            <p className="mt-3 leading-relaxed text-grafite/80">{entrouNaEspera ? T.okEsperaTexto : T.okInteresseTexto}</p>
          </div>
        )}
      </div>

      {estado !== "ok" && (
        <form ref={form} onSubmit={submeter} noValidate className="space-y-5" aria-busy={estado === "enviando"}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-medium text-grafite">{T.nome}</label>
              <input id={`${id}-name`} name="name" required autoComplete="name" maxLength={120} className={`${campo} border-linha`} {...aria("name")} />
              {erro("name")}
            </div>
            <div>
              <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium text-grafite">{T.email}</label>
              <input id={`${id}-email`} name="email" type="email" required autoComplete="email" maxLength={254} className={`${campo} border-linha`} {...aria("email")} />
              {erro("email")}
            </div>
          </div>
          <div className="sm:max-w-[calc(50%-0.625rem)]">
            <label htmlFor={`${id}-whatsapp`} className="mb-1.5 block text-sm font-medium text-grafite">
              {T.whatsapp} <span className="font-normal text-mineral-escuro">({T.opcional})</span>
            </label>
            <input id={`${id}-whatsapp`} name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" maxLength={25} className={`${campo} border-linha`} {...aria("whatsapp")} />
            {erro("whatsapp")}
          </div>
          {!listaDeEspera && (
            <div>
              <label htmlFor={`${id}-context`} className="mb-1.5 block text-sm font-medium text-grafite">
                {T.pergunta} <span className="font-normal text-mineral-escuro">({T.opcional})</span>
              </label>
              <textarea
                id={`${id}-context`}
                name="context"
                rows={3}
                maxLength={LIMITE_CONTEXTO}
                aria-describedby={`${id}-sensiveis`}
                className={`${campo} border-linha`}
              />
              <p id={`${id}-sensiveis`} className="mt-1.5 text-xs leading-relaxed text-mineral-escuro">{T.sensiveis}</p>
            </div>
          )}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div className="flex items-start gap-3 text-sm leading-snug text-grafite/80">
            <input id={`${id}-mkt`} type="checkbox" name="marketing" className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-grafite)]" />
            <label htmlFor={`${id}-mkt`}>{T.marketing}</label>
          </div>
          <p className="text-xs leading-relaxed text-mineral-escuro">
            {T.operacional} Veja a{" "}
            <a href="/privacidade" className="underline underline-offset-2">política de privacidade</a>.
          </p>
          {falha && (
            <p role="alert" className="text-sm text-[#9a3b2a]">
              {falha}
            </p>
          )}
          <button
            type="submit"
            disabled={estado === "enviando"}
            className="rounded-[var(--radius-epic)] bg-grafite px-7 py-3.5 text-[15px] font-semibold text-papel hover:bg-tinta disabled:opacity-50"
          >
            {estado === "enviando" ? T.enviando : listaDeEspera ? T.enviarEspera : T.enviarInteresse}
          </button>
        </form>
      )}
    </div>
  );
}
