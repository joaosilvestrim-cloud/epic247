import Link from "next/link";
import type { ReactNode } from "react";

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10}%` : "—");
export const dataHora = (v: string | null | undefined) =>
  v
    ? new Date(v).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
      })
    : "—";

/** Origem para exibição: vazio e "direct" viram "direto". */
export const origem = (v: string | null | undefined) => (!v || v === "direct" ? "direto" : v);

export const ETAPA_LABEL: Record<string, string> = {
  anonymous_visitor: "Visitante",
  map_started: "Começou Mapa",
  map_completed: "Concluiu Mapa",
  identified_lead: "Lead",
  plan_buyer: "Comprou Plano",
  kit_buyer: "Comprou Kit",
  protocol_buyer: "Comprou Protocolo",
  mentoring_lead: "Interesse Mentoria",
  mentoring_client: "Cliente Mentoria",
};

export function Titulo({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-[2rem] leading-tight text-grafite">{children}</h1>
      {sub && <p className="mt-1 text-sm text-mineral-escuro">{sub}</p>}
    </div>
  );
}

export function Cartao({ rotulo, valor, sub }: { rotulo: string; valor: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-5">
      <p className="text-xs text-mineral-escuro">{rotulo}</p>
      <p className="mt-1 font-display text-[1.9rem] leading-tight text-grafite">{valor}</p>
      {sub && <p className="mt-1 text-xs text-mineral-escuro">{sub}</p>}
    </div>
  );
}

export function Tabela({ cab, children, vazio }: { cab: string[]; children: ReactNode; vazio?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-epic)] border border-linha bg-papel-claro">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-linha bg-papel-escuro/60 text-xs text-mineral-escuro">
          <tr>{cab.map((c) => <th key={c} className="whitespace-nowrap px-3 py-2.5 font-semibold">{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-linha/70">{children}</tbody>
      </table>
      {vazio && <p className="px-3 py-6 text-center text-sm text-mineral-escuro">Nada por aqui ainda.</p>}
    </div>
  );
}

export function Td({ children, mono = false, direita = false }: { children: ReactNode; mono?: boolean; direita?: boolean }) {
  return <td className={`px-3 py-2.5 align-top ${mono ? "font-mono text-xs" : ""} ${direita ? "text-right tabular-nums" : ""}`}>{children}</td>;
}

export function FiltroPeriodo({ atual, base }: { atual: string; base: string }) {
  const op = [
    ["7", "7 dias"],
    ["30", "30 dias"],
    ["90", "90 dias"],
    ["tudo", "Tudo"],
  ];
  return (
    <div className="mb-6 flex gap-1 rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-1 text-sm w-fit">
      {op.map(([v, l]) => (
        <Link key={v} href={`${base}?p=${v}`} className={`rounded px-3 py-1.5 ${atual === v ? "bg-grafite text-papel" : "text-grafite/70 hover:text-grafite"}`}>
          {l}
        </Link>
      ))}
    </div>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-mono text-sm text-latao-escuro">{titulo}</h2>
      {children}
    </section>
  );
}

export function Aviso({ children, tom = "bom" }: { children: ReactNode; tom?: "bom" | "ruim" }) {
  const cor = tom === "bom" ? "border-[#7a8f5a] text-[#4f6234]" : "border-[#b06a5a] text-[#8a3f30]";
  return <p className={`mb-6 rounded border bg-papel-claro px-4 py-2 text-sm ${cor}`}>{children}</p>;
}

export function Selo({ children, tom = "neutro" }: { children: ReactNode; tom?: "neutro" | "bom" | "alerta" | "ruim" }) {
  const cor = {
    neutro: "border-linha text-mineral-escuro",
    bom: "border-[#7a8f5a] text-[#4f6234]",
    alerta: "border-latao text-latao-escuro",
    ruim: "border-[#b06a5a] text-[#8a3f30]",
  }[tom];
  return <span className={`inline-block rounded border px-1.5 py-0.5 text-[11px] ${cor}`}>{children}</span>;
}
