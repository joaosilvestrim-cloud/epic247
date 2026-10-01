import { brl, Cartao, FiltroPeriodo, origem, pct, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { getDimensionalMap } from "@/lib/epic/maps";
import { CENARIOS, CHECKPOINTS, cortes, economia, painel, periodoDe, prontidao, type Corte } from "@/lib/epic/server/admin";

type Props = { searchParams: Promise<{ p?: string }> };

const ROTULO_TIPO: Record<string, string> = { plan: "Planos", kit: "Kits", protocol: "Protocolos", mentoring: "Mentorias" };
const dias = (v: number | null) => (v == null ? "—" : v < 1 ? "menos de 1 dia" : `${Math.round(v)} dia${Math.round(v) === 1 ? "" : "s"}`);

/** Dashboard semanal (Modelo Financeiro §15, Funis §30, Modelo de Dados §40). */
export default async function PainelPage({ searchParams }: Props) {
  const periodo = periodoDe((await searchParams).p);
  const [d, eco, campanhas, criativos, checklist] = await Promise.all([
    painel(periodo),
    economia(periodo),
    cortes(periodo, "utm_campaign"),
    cortes(periodo, "utm_content"),
    prontidao(),
  ]);
  const hoje = new Date().toISOString().slice(0, 10);
  const proximo = CHECKPOINTS.find((c) => c.ate >= hoje) ?? CHECKPOINTS[CHECKPOINTS.length - 1];
  const nomeDim = (x: string) => (isDimensionId(x) ? DIMENSIONS[x].name : x);
  const nomePerfil = (mapa: string, perfil: string) =>
    mapa === "friccao" ? nomeDim(perfil) : isDimensionId(mapa) ? getDimensionalMap(mapa).axes.find((a) => a.key === perfil)?.label ?? perfil : perfil;
  const pendentes = checklist.filter((c) => !c.ok).length;

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

      <Secao titulo={`Pronto para tráfego pago? ${pendentes ? `${pendentes} pendência(s)` : "Tudo certo"}`}>
        <ul className="divide-y divide-linha rounded-[var(--radius-epic)] border border-linha bg-papel-claro text-sm">
          {checklist.map((c) => (
            <li key={c.item} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-2.5">
              <span className="flex items-baseline gap-2">
                <Selo tom={c.ok ? "bom" : "alerta"}>{c.ok ? "ok" : "falta"}</Selo>
                <span className="text-grafite">{c.item}</span>
              </span>
              <span className="text-xs text-mineral-escuro">{c.detalhe}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-mineral-escuro">Pré-requisitos do Modelo Financeiro §18. Cada item é conferido no sistema, nada é marcado à mão.</p>
      </Secao>

      <Secao titulo="Funil do período">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Cartao rotulo="Visitantes" valor={d.visitantes} sub={`${d.sessoes} sessões`} />
          <Cartao rotulo="Mapas iniciados" valor={d.mapasIniciados} sub={`${d.mapasConcluidos} concluídos · ${pct(d.mapasConcluidos, d.mapasIniciados)}`} />
          <Cartao rotulo="Leads (e-mail após Mapa)" valor={d.leads} sub={`resultado → e-mail ${pct(d.leads, d.mapasConcluidos)}`} />
          <Cartao rotulo="Compras" valor={d.compras.reduce((a, c) => a + c.n, 0)} sub={d.compras.map((c) => `${c.n} ${ROTULO_TIPO[c.tipo] ?? c.tipo}`).join(" · ") || "nenhuma"} />
        </div>
      </Secao>

      <Secao titulo="Conversão por oferta">
        <Tabela cab={["Oferta", "Vista", "Comprou", "Conversão"]}>
          {eco.ofertas.map((o) => (
            <tr key={o.oferta}>
              <Td>{o.oferta === "Mentoria" ? "Mentoria (interesse)" : o.oferta}</Td>
              <Td direita>{o.vistas}</Td>
              <Td direita>{o.compras}</Td>
              <Td direita>{pct(o.compras, o.vistas)}</Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <Secao titulo="Economia do período">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Cartao rotulo="Vendido (bruto)" valor={brl(d.bruto)} sub={`taxas ${brl(d.taxas)} · ticket médio ${brl(eco.ticketMedio)}`} />
          <Cartao rotulo="Receita líquida" valor={brl(d.liquido)} sub={`reembolsos ${brl(d.reembolsos)}`} />
          <Cartao rotulo="Recebido" valor={brl(d.recebido)} sub={`a receber ${brl(d.aReceber)}`} />
          <Cartao
            rotulo="Receita por lead · por visitante"
            valor={d.leads ? brl(d.bruto / d.leads) : "—"}
            sub={`RPV ${d.visitantes ? brl(d.bruto / d.visitantes) : "—"} · caixa por lead ${brl(eco.caixaPorLead)} · meta RPL ≈ R$ 24`}
          />
        </div>
        <p className="mt-3 text-xs text-mineral-escuro">CPL, CAC e ROAS ficam em Mídia, que cruza o investimento lançado com o que cada campanha trouxe.</p>
      </Secao>

      <Secao titulo="Cenários da meta (vendas acumuladas desde o início)">
        <Tabela cab={["Produto", "Vendido", "Conservador", "Base", "Forte"]}>
          {(["plan", "kit", "protocol", "mentoring"] as const).map((t) => {
            const n = eco.acumulado[t] ?? 0;
            return (
              <tr key={t}>
                <Td>{ROTULO_TIPO[t]}</Td>
                <Td direita><strong>{n}</strong></Td>
                {(["conservador", "base", "forte"] as const).map((c) => (
                  <Td key={c} direita>
                    {CENARIOS[c][t]} <span className="text-xs text-mineral-escuro">({pct(n, CENARIOS[c][t])})</span>
                  </Td>
                ))}
              </tr>
            );
          })}
        </Tabela>
        <p className="mt-2 text-xs text-mineral-escuro">
          O Protocolo é cerca de 59% da receita do cenário base. Se ficar abaixo da metade do previsto, a meta fica comprometida.
        </p>
      </Secao>

      <Secao titulo="Progressão entre produtos">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Tabela cab={["De", "Para", "Compradores", "Avançaram", "Taxa"]}>
            {eco.progressao.map((r) => (
              <tr key={`${r.de}-${r.para}`}>
                <Td>{r.de}</Td>
                <Td>{r.para}</Td>
                <Td direita>{r.base}</Td>
                <Td direita>{r.avancaram}</Td>
                <Td direita>{pct(r.avancaram, r.base)}</Td>
              </tr>
            ))}
          </Tabela>
          <div className="grid gap-4">
            <Cartao rotulo="Tempo médio do Mapa até a 1ª compra" valor={dias(eco.diasMapaPrimeiraCompra)} />
            <Cartao rotulo="Tempo médio da 1ª até a 2ª compra" valor={dias(eco.diasPrimeiraSegunda)} sub={`interesse em Mentoria no período: ${eco.mentoriaInteresse}`} />
          </div>
        </div>
      </Secao>

      <Secao titulo="Por origem">
        <Tabela cab={["Origem", "Visitantes", "Mapas", "Leads", "Compras", "Vendido", "Lead / visitante"]} vazio={d.porOrigem.length === 0}>
          {d.porOrigem.map((o) => (
            <tr key={o.origem}>
              <Td>{origem(o.origem)}</Td>
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

      <TabelaCorte titulo="Por campanha (utm_campaign)" linhas={campanhas} />
      <TabelaCorte titulo="Por criativo (utm_content)" linhas={criativos} />

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

      <Secao titulo="Por perfil principal">
        <Tabela cab={["Mapa", "Perfil", "Concluíram", "Deixaram e-mail", "Compraram depois", "Compra / conclusão"]} vazio={!eco.porPerfil.length}>
          {eco.porPerfil.map((r) => (
            <tr key={`${r.mapa}-${r.perfil}`}>
              <Td>{r.mapa === "friccao" ? "Fricção" : nomeDim(r.mapa)}</Td>
              <Td>{nomePerfil(r.mapa, r.perfil)}</Td>
              <Td direita>{r.concluidos}</Td>
              <Td direita>{r.leads}</Td>
              <Td direita>{r.compradores}</Td>
              <Td direita>{pct(r.compradores, r.concluidos)}</Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <Secao titulo="Por produto">
        <Tabela cab={["Produto", "Vendas", "Vendido", "Reembolsos"]} vazio={!eco.porProduto.length}>
          {eco.porProduto.map((r) => (
            <tr key={r.produto}>
              <Td>{r.nome}</Td>
              <Td direita>{r.vendas}</Td>
              <Td direita>{brl(r.bruto)}</Td>
              <Td direita>{r.reembolsos}</Td>
            </tr>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}

function TabelaCorte({ titulo, linhas }: { titulo: string; linhas: Corte[] }) {
  return (
    <Secao titulo={titulo}>
      <Tabela cab={["", "Visitantes", "Mapas", "Leads", "Compras", "Vendido", "Lead / visitante"]} vazio={!linhas.length}>
        {linhas.map((o) => (
          <tr key={o.chave}>
            <Td mono>{o.chave}</Td>
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
  );
}
