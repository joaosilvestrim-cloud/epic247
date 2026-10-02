"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { enviar } from "@/lib/epic/client/track";
import { ASSUNTOS, CONTATO_PAGINA as C, ehAssunto, type Assunto } from "@/lib/epic/content/contato";
import { MICRO } from "@/lib/epic/content/microcopy";

const campo =
  "w-full rounded-[var(--radius-epic)] border border-linha bg-papel-claro px-4 py-3 text-grafite focus:border-grafite aria-[invalid=true]:border-[#9a3b2a]";

type Erros = Partial<Record<"name" | "email" | "whatsapp" | "message", string>>;

/**
 * Formulário de contato (Copy Final §24, RF-059). Assunto chega pré-escolhido
 * pelo card ou por ?assunto=, e pode ser trocado. Erro preso ao campo e
 * anunciado; aceite de marketing separado do necessário para responder.
 */
export default function FormContato({ assuntoInicial }: { assuntoInicial?: string }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [assunto, setAssunto] = useState<Assunto>(ehAssunto(assuntoInicial) ? assuntoInicial : "outro");
  const [estado, setEstado] = useState<"livre" | "enviando" | "ok">("livre");
  const [erros, setErros] = useState<Erros>({});
  const [falha, setFalha] = useState<string | null>(null);

  // Cards da página escolhem o assunto e trazem a pessoa até o formulário.
  useEffect(() => {
    const ouvir = (e: Event) => {
      const a = (e as CustomEvent<string>).detail;
      if (ehAssunto(a)) setAssunto(a);
    };
    window.addEventListener("epic:assunto", ouvir);
    return () => window.removeEventListener("epic:assunto", ouvir);
  }, []);

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFalha(null);
    const f = new FormData(e.currentTarget);
    const novo: Erros = {};
    const email = String(f.get("email") ?? "").trim();
    const whatsapp = String(f.get("whatsapp") ?? "").trim();
    if (!String(f.get("name") ?? "").trim()) novo.name = MICRO.form.nome;
    if (!email) novo.email = MICRO.form.emailVazio;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) novo.email = MICRO.form.emailInvalido;
    if (whatsapp && whatsapp.replace(/\D/g, "").length < 10) novo.whatsapp = MICRO.form.whatsapp;
    if (!String(f.get("message") ?? "").trim()) novo.message = MICRO.form.mensagem;
    setErros(novo);
    const primeiro = Object.keys(novo)[0];
    if (primeiro) {
      formRef.current?.querySelector<HTMLElement>(`[name="${primeiro}"]`)?.focus();
      return;
    }
    setEstado("enviando");
    try {
      await enviar("/api/v2/contato", {
        name: f.get("name"),
        email,
        whatsapp: whatsapp || null,
        topic: assunto,
        message: f.get("message"),
        marketing: f.get("marketing") === "on",
        origin: typeof document !== "undefined" ? document.referrer || null : null,
        website: f.get("website"),
      });
      setEstado("ok");
    } catch {
      setFalha(MICRO.contato.falha);
      setEstado("livre");
    }
  }

  if (estado === "ok") {
    return (
      <div role="status" className="self-start rounded-[var(--radius-epic)] border border-latao/50 bg-papel-claro p-8">
        <p className="font-display text-3xl text-grafite">{MICRO.contato.sucesso}</p>
        <p className="mt-3 text-grafite/80">{MICRO.contato.sucessoTexto}</p>
        <div className="mt-8 flex flex-wrap items-center gap-6 text-[15px]">
          <Link href="/" className="rounded-[var(--radius-epic)] bg-grafite px-5 py-3 font-semibold text-papel hover:bg-tinta">
            {C.confirmacao.cta}
          </Link>
          <Link href="/ideias" className="border-b border-latao pb-0.5 font-medium text-grafite">
            {C.confirmacao.cta2}
          </Link>
        </div>
      </div>
    );
  }

  const erroDe = (k: keyof Erros) =>
    erros[k] ? (
      <p id={`${id}-${k}-erro`} className="mt-1.5 text-sm text-[#9a3b2a]">
        {erros[k]}
      </p>
    ) : null;
  const ariaDe = (k: keyof Erros) => ({
    "aria-invalid": erros[k] ? true : undefined,
    "aria-describedby": erros[k] ? `${id}-${k}-erro` : undefined,
  });

  return (
    <form ref={formRef} onSubmit={submeter} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-n`} className="mb-1.5 block text-sm font-medium">Nome</label>
          <input id={`${id}-n`} name="name" required autoComplete="name" maxLength={120} className={campo} {...ariaDe("name")} />
          {erroDe("name")}
        </div>
        <div>
          <label htmlFor={`${id}-e`} className="mb-1.5 block text-sm font-medium">E-mail</label>
          <input id={`${id}-e`} name="email" type="email" required autoComplete="email" className={campo} {...ariaDe("email")} />
          {erroDe("email")}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-w`} className="mb-1.5 block text-sm font-medium">
            WhatsApp <span className="font-normal text-mineral-escuro">(opcional)</span>
          </label>
          <input id={`${id}-w`} name="whatsapp" type="tel" autoComplete="tel" maxLength={30} className={campo} {...ariaDe("whatsapp")} />
          {erroDe("whatsapp")}
        </div>
        <div>
          <label htmlFor={`${id}-s`} className="mb-1.5 block text-sm font-medium">Assunto</label>
          <select
            id={`${id}-s`}
            name="topic"
            value={assunto}
            onChange={(e) => ehAssunto(e.target.value) && setAssunto(e.target.value)}
            className={campo}
          >
            {(Object.keys(ASSUNTOS) as Assunto[]).map((a) => (
              <option key={a} value={a}>
                {ASSUNTOS[a]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-m`} className="mb-1.5 block text-sm font-medium">Mensagem</label>
        <textarea
          id={`${id}-m`}
          name="message"
          rows={6}
          required
          maxLength={3000}
          placeholder={C.form.placeholderMensagem}
          className={campo}
          {...ariaDe("message")}
        />
        {erroDe("message")}
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <p className="text-xs leading-relaxed text-mineral-escuro">{C.form.sensiveis}</p>
      <p className="text-xs leading-relaxed text-mineral-escuro">
        {MICRO.consentimento.operacional} Veja a{" "}
        <a href="/privacidade" className="underline underline-offset-2">política de privacidade</a>.
      </p>
      <label className="flex items-start gap-2.5 text-sm text-grafite/85">
        <input type="checkbox" name="marketing" className="mt-1 accent-[var(--color-latao)]" />
        <span>{MICRO.consentimento.editorial}</span>
      </label>
      <p role="alert" aria-live="assertive" className="text-sm text-[#9a3b2a]">
        {falha && (
          <>
            {falha} {MICRO.contato.falhaTexto}
          </>
        )}
      </p>
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="rounded-[var(--radius-epic)] bg-grafite px-7 py-3.5 text-[15px] font-semibold text-papel hover:bg-tinta disabled:opacity-50"
      >
        {estado === "enviando" ? MICRO.form.enviando : C.form.cta}
      </button>
    </form>
  );
}
