import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/epic/ui";

// Peças do Meu EPIC. Mesma linguagem do site: creme, grafite, filete de
// latão. Status sempre em texto (não só cor), foco visível herdado do site.

export function Cabecalho({ titulo, apoio, voltar }: { titulo: string; apoio?: ReactNode; voltar?: { href: string; label: string } }) {
  return (
    <Container className="pt-10 sm:pt-14">
      {voltar && (
        <Link href={voltar.href} className="mb-5 inline-block text-sm text-mineral-escuro hover:text-grafite">
          ← {voltar.label}
        </Link>
      )}
      <h1 className="font-display text-[2rem] font-normal leading-[1.12] text-grafite sm:text-[2.6rem]">{titulo}</h1>
      {apoio && <div className="mt-3 max-w-2xl text-[17px] leading-relaxed text-grafite/80">{apoio}</div>}
    </Container>
  );
}

export function Secao({ titulo, children, acao }: { titulo: string; children: ReactNode; acao?: ReactNode }) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-linha pb-3">
        <h2 className="font-mono text-sm text-latao-escuro">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

/** Estado vazio do CR-01A: uma frase e, quando houver, um caminho. */
export function Vazio({ texto, acao }: { texto: string; acao?: ReactNode }) {
  return (
    <div className="border-l border-latao py-2 pl-5">
      <p className="text-[17px] text-grafite/85">{texto}</p>
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}

/** Linha de lista: título, metadados e o link da ação. A linha inteira é clicável no celular. */
export function Item({
  href,
  titulo,
  meta,
  status,
  acao,
}: {
  href?: string;
  titulo: ReactNode;
  meta?: ReactNode;
  status?: string;
  acao?: string;
}) {
  const corpo = (
    <div className="grid gap-1 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
      <div>
        <p className="font-display text-[1.25rem] leading-snug text-grafite">{titulo}</p>
        {meta && <p className="mt-1 text-[15px] text-mineral-escuro">{meta}</p>}
      </div>
      <div className="mt-2 flex items-center gap-5 sm:mt-0">
        {status && <span className="text-sm text-grafite/80">{status}</span>}
        {acao && href && <span className="link-traco text-[15px] font-medium text-grafite">{acao}</span>}
      </div>
    </div>
  );
  return (
    <li className="border-b border-linha last:border-b-0">
      {href ? (
        <Link href={href} className="block rounded-sm hover:bg-papel-claro/60">
          {corpo}
        </Link>
      ) : (
        corpo
      )}
    </li>
  );
}

export function Lista({ children }: { children: ReactNode }) {
  return <ul>{children}</ul>;
}

/** Botão sólido para formulário (POST). Mesmo desenho do PrimaryCTA. */
export function BotaoForm({ children, secundario = false }: { children: ReactNode; secundario?: boolean }) {
  return (
    <button
      type="submit"
      className={
        secundario
          ? "link-traco text-[15px] font-medium text-grafite"
          : "group inline-flex items-center gap-3 rounded-[var(--radius-epic)] bg-grafite px-6 py-3.5 text-[15px] font-semibold text-papel transition-[background-color,transform] duration-200 hover:bg-tinta active:scale-[0.98]"
      }
    >
      <span>{children}</span>
      {!secundario && <span aria-hidden className="h-px w-5 bg-latao transition-all duration-300 group-hover:w-8" />}
    </button>
  );
}
