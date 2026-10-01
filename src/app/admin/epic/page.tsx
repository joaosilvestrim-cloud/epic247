import { brl, Cartao, FiltroPeriodo, pct, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { CHECKPOINTS, painel, periodoDe } from "@/lib/epic/server/admin";

type Props = { searchParams: Promise<{ p?: string }> };

const ROTULO_TIPO: Record<string, string> = { plan: "Planos", kit: "Kits", protocol: "Protocolos", mentoring: "Mentorias" };

/** Dashboard semanal (Modelo Financeiro §15, Funis §30). */
export default async function PainelPage({ searchParams }: Props) {
  const periodo = periodoDe((await searchParams).p);
  const d = await painel(periodo);
  const hoje = new Date().toISOString().slice(0, 10);
  const proximo = CHECKPOINTS.find((c) => c.ate >= hoje) ?? CHECKPOINTS[CHECKPOINTS.length - 1];
  const nomeDim = (x: string) => (isDimensionId(x) ? DIMENSIONS[x].name : x);

  return (
    <>
      <Titulo sub="O que aprendemos esta semana que muda o que vamos fazer na próxima?">Painel</Titulo>
      <FiltroPeriodo atual={periodo} base="/admin/epic" />

      <Secao titulo="Meta: R$ 50 mil recebidos em caixa até 30/12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHECKPOINTS.map((c) => {
            const atingido = d.caixaAcumulado >= c.valor;
            const passou = c.ate < hoje;
            return (
              <div key={c.ate} className={`rounded-[var(--radius-epic)] border p-4 ${c === proximo ? "border-grafite" : "border-linha"} bg-papel-claro`}>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-mineral-escuro">até {c.rotulo}</p>
                  {atingido ? <Selo tom="bom">atingido</Selo> : passou ? <Selo tom="ruim">não atingido</Selo> : c === proximo ? <Selo tom="alerta">próximo</Selo> : null}
                </div>
                <p className="mt-1 font-display text-2xl text-grafite">{brl(c.valor)}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-papel-escuro">
                  <div className="h-full bg-grafite" style={{ width: `${Math.min(100, (d.caixaAcumulado / c.valor) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-mineral-escuro">
          Caixa recebido acumulado: <strong className="text-grafite">{brl(d.caixaAcumulado)}</strong>. Conta o valor
          líquido cuja data prevista de depósito já passou.
        </p>
      </Secao>

      <Secao titulo="Funil do período">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Cartao rotulo="Visitantes" valor={d.visitantes} sub={`${d.sessoes} sessões`} />
          <Cartao rotulo="Mapas iniciados" valor={d.mapasIniciados} sub={`${d.mapasConcluidos} concluídos · ${pct(d.mapasConcluidos, d.mapasIniciados)}`} />
          <Cartao rotulo="Leads (e-mail após Mapa)" valor={d.leads} sub={`${pct(d.leads, d.mapasConcluidos)} dos que concluíram`} />
          <Cartao rotulo="Compras" valor={d.compras.reduce((a, c) => a + c.n, 0)} sub={d.compras.map((c) => `${c.n} ${ROTULO_TIPO[c.tipo] ?? c.tipo}`).join(" · ") || "nenhuma"} />
        </div>
      </Secao>

      <Secao titulo="Economia do período">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Cartao rotulo="Vendido (bruto)" valor={brl(d.bruto)} sub={`taxas ${brl(d.taxas)}`} />
          <Cartao rotulo="Receita líquida" valor={brl(d.liquido)} sub={`reembolsos ${brl(d.reembolsos)}`} />
          <Cartao rotulo="Recebido" valor={brl(d.recebido)} sub={`a receber ${brl(d.aReceber)}`} />
          <Cartao rotulo="Receita por lead · por visitante" valor={d.leads ? brl(d.bruto / d.leads) : "—"} sub={`RPV ${d.visitantes ? brl(d.bruto / d.visitantes) : "—"} · meta RPL ≈ R$ 24`} />
        </div>
      </Secao>

      <Secao titulo="Por origem">
        <Tabela cab={["Origem", "Visitantes", "Mapas", "Leads", "Compras", "Vendido", "Lead / visitante"]} vazio={d.porOrigem.length === 0}>
          {d.porOrigem.map((o) => (
            <tr key={o.origem}>
              <Td>{o.origem}</Td>
              <Td direita>{o.visitantes}</Td>
              <Td direita>{o.mapas}</Td>
              <Td direita>{o.leads}</Td>
              <Td direita>{o.compras}</Td>
              <Td direita>{brl(o.bruto)}</Td>
              <Td direita>{pct(o.leads, o.visitantes)}</Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <Secao titulo="Por dimensão">
        <Tabela cab={["Dimensão", "Mapas concluídos", "Leads", "Compras", "Vendido"]} vazio={d.porDimensao.length === 0}>
          {d.porDimensao.map((x) => (
            <tr key={x.dimensao}>
              <Td>{nomeDim(x.dimensao)}</Td>
              <Td direita>{x.mapas}</Td>
              <Td direita>{x.leads}</Td>
              <Td direita>{x.compras}</Td>
              <Td direita>{brl(x.bruto)}</Td>
            </tr>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}
