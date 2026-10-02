import type { ReactNode } from "react";
import { importarDados } from "@/app/admin/epic/kpi-actions";
import { idade } from "@/lib/epic/kpi/metricas";
import type { Frescor } from "@/lib/epic/server/kpi";
import { Aviso, brl, dataHora, Tabela, Td } from "./ui";

// Peças do painel de KPIs e da importação de dados externos.

/** Razão como porcentagem com uma casa ("4,2%"). */
export const taxa = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(1).replace(".", ",")}%`);
/** ROAS como multiplicador ("1,35x"). */
export const vezes = (v: number | null) => (v == null ? "—" : `${v.toFixed(2).replace(".", ",")}x`);
export const brlOu = (v: number | null) => (v == null ? "—" : brl(v));
export const inteiro = (v: number | null) => (v == null ? "—" : v.toLocaleString("pt-BR"));

const CAMPO = "w-full rounded border border-linha bg-papel px-3 py-2";

export function ImportarCsv({
  entidade, origem, plataformas, children,
}: {
  entidade: "content_performance" | "campaign_performance" | "receivables";
  origem: string;
  plataformas?: string[];
  children: ReactNode;
}) {
  return (
    <form action={importarDados} className="grid gap-3 rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4 text-sm sm:grid-cols-[1fr_12rem_10rem_auto] sm:items-end">
      <input type="hidden" name="entidade" value={entidade} />
      <label className="block">
        <span className="mb-1 block text-xs text-mineral-escuro">Arquivo CSV (até 1 MB)</span>
        <input type="file" name="arquivo" accept=".csv,text/csv" required className={CAMPO} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-mineral-escuro">Origem (source_system)</span>
        <input name="origem" defaultValue={origem} className={CAMPO} />
      </label>
      {plataformas ? (
        <label className="block">
          <span className="mb-1 block text-xs text-mineral-escuro">Plataforma</span>
          <select name="plataforma" defaultValue={plataformas[0]} className={CAMPO}>
            {plataformas.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
      ) : <span />}
      <button className="rounded bg-grafite px-4 py-2 text-papel">Importar</button>
      <div className="text-xs text-mineral-escuro sm:col-span-4">{children}</div>
    </form>
  );
}

/** Retorno da última importação, lido de ?carga= */
export function AvisoCarga({ carga }: { carga?: string }) {
  if (!carga) return null;
  if (carga === "vazio") return <Aviso tom="ruim">Escolha um arquivo CSV.</Aviso>;
  if (carga === "grande") return <Aviso tom="ruim">Arquivo acima de 1 MB. Exporte um período menor.</Aviso>;
  const [ok, falhas, total] = carga.split("-").map(Number);
  if (!Number.isFinite(ok)) return null;
  return (
    <Aviso tom={falhas && !ok ? "ruim" : "bom"}>
      {ok} linha(s) gravada(s) de {total}. {falhas ? `${falhas} com problema, detalhes nas cargas abaixo.` : "Nenhum problema."}
    </Aviso>
  );
}

export function ListaCargas({ cargas }: { cargas: Record<string, string | number | null>[] }) {
  return (
    <Tabela cab={["Quando", "Origem", "Arquivo", "Linhas", "Gravadas", "Com problema", "Primeiros problemas"]} vazio={!cargas.length}>
      {cargas.map((c) => {
        const erros = (c.errors as unknown as { linha: number; erro: string }[] | null) ?? [];
        return (
          <tr key={String(c.id)}>
            <Td>{dataHora(c.started_at as string)}</Td>
            <Td mono>{c.source_system}</Td>
            <Td>{c.file_name ?? "—"}</Td>
            <Td direita>{c.rows_total}</Td>
            <Td direita>{c.rows_ok}</Td>
            <Td direita>{c.rows_failed}</Td>
            <Td>
              <span className="text-xs text-mineral-escuro">
                {erros.slice(0, 3).map((e) => (e.linha ? `linha ${e.linha}: ${e.erro}` : e.erro)).join(" · ")}
              </span>
            </Td>
          </tr>
        );
      })}
    </Tabela>
  );
}

/** Última atualização por fonte (Blueprint §50). */
export function FrescorDados({ itens }: { itens: Frescor[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-1 rounded-[var(--radius-epic)] border border-linha bg-papel-claro px-4 py-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
      {itens.map((f) => (
        <li key={f.fonte} className="flex flex-wrap items-baseline justify-between gap-x-3 py-1">
          <span className="text-grafite">{f.fonte}</span>
          <span className="text-xs text-mineral-escuro">
            {f.quando ? `${idade(f.quando)} (${dataHora(f.quando)})` : "nunca"} · {f.detalhe}
          </span>
        </li>
      ))}
    </ul>
  );
}
