import { FiltroPeriodo, pct, Secao, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { FRICCAO, getDimensionalMap } from "@/lib/epic/maps";
import { periodoDe, resumoMapas } from "@/lib/epic/server/admin";

type Props = { searchParams: Promise<{ p?: string }> };

const KIND: Record<string, string> = { single: "claro", close: "muito próximos", tie: "empate", low: "tudo estável" };

/** Critérios de validação de cada documento de Mapa (§17). */
export default async function MapasAdminPage({ searchParams }: Props) {
  const periodo = periodoDe((await searchParams).p);
  const mapas = await resumoMapas(periodo);

  return (
    <>
      <Titulo sub="Distribuição dos resultados, empates e onde as pessoas param. Se um padrão dominar demais, revisar a redação antes de concluir algo sobre o público.">
        Mapas
      </Titulo>
      <FiltroPeriodo atual={periodo} base="/admin/epic/mapas" />
      {mapas.length === 0 && <p className="text-mineral-escuro">Nenhum Mapa iniciado no período.</p>}
      {mapas.map((m) => {
        const friccao = m.map_type === "friccao";
        const cfg = friccao ? null : isDimensionId(m.map_type) ? getDimensionalMap(m.map_type) : null;
        const total = friccao ? FRICCAO.questions.length : cfg?.questions.length ?? 15;
        const rotulo = (v: string) =>
          friccao ? (isDimensionId(v) ? DIMENSIONS[v].name : v) : cfg?.axes.find((a) => a.key === v)?.label ?? v;
        const concl = m.distribuicao.reduce((a, x) => a + x.n, 0);
        const maior = m.distribuicao[0];
        return (
          <Secao key={m.map_type} titulo={friccao ? "Mapa de Fricção" : cfg?.title ?? m.map_type}>
            <div className="grid gap-6 rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-5 lg:grid-cols-3">
              <div>
                <p className="text-xs text-mineral-escuro">Conclusão</p>
                <p className="font-display text-2xl">{m.concluidos} de {m.iniciados} · {pct(m.concluidos, m.iniciados)}</p>
                <p className="mt-3 text-xs text-mineral-escuro">Tipo de resultado</p>
                <p className="text-sm">{m.tipos.map((t) => `${KIND[t.kind] ?? t.kind}: ${t.n}`).join(" · ") || "—"}</p>
                {maior && concl >= 20 && maior.n / concl > 0.45 && (
                  <p className="mt-3 text-sm text-[#8a3f30]">
                    {rotulo(maior.valor)} concentra {pct(maior.n, concl)} dos resultados. Vale revisar a redação dos itens.
                  </p>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs text-mineral-escuro">Resultado principal</p>
                <ul className="space-y-1.5">
                  {m.distribuicao.map((x) => (
                    <li key={x.valor} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-2 text-sm">
                      <span className="truncate">{rotulo(x.valor)}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-papel-escuro">
                        <span className="block h-full bg-grafite" style={{ width: `${(x.n / Math.max(1, concl)) * 100}%` }} />
                      </span>
                      <span className="text-right tabular-nums text-mineral-escuro">{x.n}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs text-mineral-escuro">Onde param (abertos há mais de 1h)</p>
                {m.abandono.length === 0 ? (
                  <p className="text-sm text-mineral-escuro">Ninguém parado no meio.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {m.abandono.map((a) => (
                      <li key={a.passo}>
                        {a.passo === 0 ? "Antes da 1ª pergunta" : `Depois da pergunta ${a.passo} de ${total}`}: <strong>{a.n}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Secao>
        );
      })}
    </>
  );
}
