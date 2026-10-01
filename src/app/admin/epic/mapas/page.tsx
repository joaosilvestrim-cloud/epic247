import { Aviso, FiltroPeriodo, pct, Secao, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { FRICCAO, getDimensionalMap } from "@/lib/epic/maps";
import { esperandoMapa, periodoDe, resumoMapas } from "@/lib/epic/server/admin";
import { mapaVisivel } from "@/lib/epic/site";
import { avisarMapaDisponivel } from "../actions";

type Props = { searchParams: Promise<{ p?: string; avisados?: string; dim?: string; erro?: string }> };

const KIND: Record<string, string> = { single: "claro", close: "muito próximos", tie: "empate", low: "tudo estável" };

/** Critérios de validação de cada documento de Mapa (§17). */
export default async function MapasAdminPage({ searchParams }: Props) {
  const sp = await searchParams;
  const periodo = periodoDe(sp.p);
  const [mapas, espera] = await Promise.all([resumoMapas(periodo), esperandoMapa()]);

  return (
    <>
      <Titulo sub="Distribuição dos resultados, empates e onde as pessoas param. Se um padrão dominar demais, revisar a redação antes de concluir algo sobre o público.">
        Mapas
      </Titulo>
      <FiltroPeriodo atual={periodo} base="/admin/epic/mapas" />
      {sp.avisados && <Aviso>{sp.avisados} pessoa(s) avisada(s) sobre o Mapa de {sp.dim && isDimensionId(sp.dim) ? DIMENSIONS[sp.dim].name : sp.dim}.</Aviso>}
      {sp.erro === "mapa_fora_do_ar" && <Aviso tom="ruim">Esse Mapa ainda não está no ar. Publique antes de avisar.</Aviso>}
      {espera.length > 0 && (
        <Secao titulo="Esperando um Mapa (Mapa de Fricção §7)">
          <div className="space-y-2">
            {espera.map((e) => {
              const ok = isDimensionId(e.dimensao) && mapaVisivel(e.dimensao);
              return (
                <form key={e.dimensao} action={avisarMapaDisponivel}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-epic)] border border-linha bg-papel-claro px-4 py-3 text-sm">
                  <input type="hidden" name="dimensao" value={e.dimensao} />
                  <span>
                    <strong className="text-grafite">{isDimensionId(e.dimensao) ? DIMENSIONS[e.dimensao].name : e.dimensao}</strong>
                    <span className="text-mineral-escuro"> · {e.esperando} esperando · {e.avisados} já avisada(s)</span>
                  </span>
                  {ok && e.esperando > 0 ? (
                    <button className="rounded bg-grafite px-3 py-1.5 text-papel">Avisar {e.esperando} pessoa(s) que o Mapa está no ar</button>
                  ) : (
                    <span className="text-xs text-mineral-escuro">{ok ? "ninguém esperando" : "Mapa ainda não publicado"}</span>
                  )}
                </form>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-mineral-escuro">
            Pessoas que fizeram o Mapa de Fricção, deixaram e-mail e tiveram essa dimensão como principal, sem ter feito o Mapa dela.
          </p>
        </Secao>
      )}
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
            {(m.feedback.length > 0 || m.aprofundamento.length > 0) && (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {m.feedback.length > 0 && (
                  <div className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4 text-sm">
                    <p className="mb-2 text-xs text-mineral-escuro">"Este resultado faz sentido para você?"</p>
                    <ul className="space-y-1">
                      {m.feedback.map((f) => {
                        const tot = f.sim + f.em_parte + f.nao;
                        return (
                          <li key={f.perfil} className="flex justify-between gap-3">
                            <span>{rotulo(f.perfil)}</span>
                            <span className="tabular-nums text-mineral-escuro">
                              sim {pct(f.sim, tot)} · em parte {pct(f.em_parte, tot)} · não {pct(f.nao, tot)} ({tot})
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    {m.comentarios.length > 0 && (
                      <ul className="mt-3 space-y-2 border-t border-linha pt-3">
                        {m.comentarios.map((c, i) => (
                          <li key={i} className="text-grafite/85">
                            <span className="text-xs text-mineral-escuro">{rotulo(c.perfil)} · {c.resposta.replace("_", " ")}:</span> “{c.texto}”
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {m.aprofundamento.length > 0 && (
                  <div className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4 text-sm">
                    <p className="mb-2 text-xs text-mineral-escuro">Resultado → aprofundamento e compra (Mapa de Fricção §10)</p>
                    <ul className="space-y-1">
                      {m.aprofundamento.map((a) => (
                        <li key={a.dimensao} className="flex justify-between gap-3">
                          <span>{rotulo(a.dimensao)}</span>
                          <span className="tabular-nums text-mineral-escuro">
                            {a.concluidos} · fez o Mapa {pct(a.aprofundaram, a.concluidos)} · comprou {pct(a.compraram, a.concluidos)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Secao>
        );
      })}
    </>
  );
}
