import { brl, Cartao, FiltroPeriodo, origem, pct, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { getDimensionalMap } from "@/lib/epic/maps";
import { brlOu, FrescorDados, inteiro, taxa, vezes } from "@/components/epic/admin/dados";
import { DEFINICAO_CAIXA, DEFINICAO_CONTEUDO, DEFINICAO_ECONOMIA, MODELO_ATRIBUICAO } from "@/lib/epic/kpi/metricas";
import { CENARIOS, CHECKPOINTS, cortes, economia, painel, periodoDe, prontidao, type Corte } from "@/lib/epic/server/admin";
import { frescor, kpisSemana } from "@/lib/epic/server/kpi";

type Props = { searchParams: Promise<{ p?: string }> };

const ROTULO_TIPO: Record<string, string> = { plan: "Planos", kit: "Kits", protocol: "Protocolos", mentoring: "Mentorias" };
const dias = (v: number | null) => (v == null ? "—" : v < 1 ? "menos de 1 dia" : `${Math.round(v)} dia${Math.round(v) === 1 ? "" : "s"}`);

/** Dashboard semanal (Modelo Financeiro §15, Funis §30, Modelo de Dados §40). */
export default async function PainelPage({ searchParams }: Props) {
  const periodo = periodoDe((await searchParams).p);
  const [d, eco, campanhas, criativos, checklist, k, fontes] = await Promise.all([
    painel(periodo),
    economia(periodo),
    cortes(periodo, "utm_campaign"),
    cortes(periodo, "utm_content"),
    prontidao(),
    kpisSemana(periodo),
    frescor(),
  ]);
  // Meta é caixa recebido (Financeiro §1): vem dos recebíveis, não da venda.
  const caixaRecebido = k.caixa.recebido;
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
            const atingido = caixaRecebido >= c.valor;
            const passou = c.ate < hoje;
            return (
              <div key={c.ate} className={`rounded-[var(--radius-epic)] border p-4 ${c === proximo ? "border-grafite" : "border-linha"} bg-papel-claro`}>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-mineral-escuro">até {c.rotulo}</p>
                  {atingido ? <Selo tom="bom">atingido</Selo> : passou ? <Selo tom="ruim">não atingido</Selo> : c === proximo ? <Selo tom="alerta">próximo</Selo> : null}
                </div>
                <p className="mt-1 font-display text-2xl text-grafite">{brl(c.valor)}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-papel-escuro">
                  <div className="h-full bg-grafite" style={{ width: `${Math.min(100, (caixaRecebido / c.valor) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-mineral-escuro">
          Recebido: <strong className="text-grafite">{brl(caixaRecebido)}</strong> ({brl(k.caixa.recebidoConfirmado)} confirmado
          por extrato, {brl(k.caixa.recebidoPresumido)} pela data de depósito da Kiwify). Projetado até 30/12:{" "}
          <strong className="text-grafite">{brl(k.caixa.projetadoAteCorte)}</strong>.
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

      <Secao titulo="KPIs do período">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Grupo titulo="Conteúdo" nota={DEFINICAO_CONTEUDO} linhas={[
            ["Publicados", `${k.conteudo.publicados} (${k.conteudo.videos} vídeos)`],
            ["Views", inteiro(k.conteudo.views)],
            ["Retenção média", k.conteudo.retencao == null ? "—" : `${k.conteudo.retencao.toFixed(1).replace(".", ",")}%`],
            ["Salvamentos", inteiro(k.conteudo.salvamentos)],
            ["Compartilhamentos", inteiro(k.conteudo.compartilhamentos)],
          ]} />
          <Grupo titulo="Tráfego" nota="Sessão = visita com origem própria. Dimensão = página de entrada." linhas={[
            ["Sessões", inteiro(k.trafego.sessoes)],
            ["Visitantes", inteiro(k.trafego.visitantes)],
            ["Origem", k.trafego.origens.map((o) => `${origem(o.chave)} ${o.n}`).join(" · ") || "—"],
            ["Dimensão", k.trafego.dimensoes.map((o) => `${nomeDim(o.chave)} ${o.n}`).join(" · ") || "—"],
          ]} />
          <Grupo titulo="Mapas" nota="Taxa de conclusão = concluídos ÷ iniciados. Lead = e-mail deixado após um Mapa." linhas={[
            ["Iniciados", inteiro(k.mapas.iniciados)],
            ["Concluídos", inteiro(k.mapas.concluidos)],
            ["Taxa de conclusão", pct(k.mapas.concluidos, k.mapas.iniciados)],
            ["Leads", `${k.mapas.leads} (${pct(k.mapas.leads, k.mapas.concluidos)} dos concluídos)`],
          ]} />
          <Grupo titulo="Vendas" nota="Vendas aprovadas no período, pela data de aprovação." linhas={
            (["plan", "kit", "protocol", "mentoring"] as const).map((t) => {
              const v = k.vendas.find((x) => x.tipo === t);
              return [ROTULO_TIPO[t], v ? `${v.n} · ${brl(v.bruto)}` : "0"] as [string, string];
            })
          } />
          <Grupo titulo="Economia" nota={`${MODELO_ATRIBUICAO} ${DEFINICAO_ECONOMIA}`} linhas={[
            ["Gasto em mídia", brl(k.economia.gasto)],
            ["CPL", `${brlOu(k.economia.cpl)} (${k.economia.leadsAtribuidos} leads atribuídos)`],
            ["CAC 1º produto", `${brlOu(k.economia.cacPrimeiroProduto)} (${k.economia.novosCompradoresAtribuidos} novos)`],
            ["CAC cliente EPIC", `${brlOu(k.economia.cacCliente)} (${k.economia.compradoresUnicosAtribuidos} compradores)`],
            ["Ticket médio", brlOu(k.economia.ticketMedio)],
            ["RPL · RPV", `${brlOu(k.economia.rpl)} · ${brlOu(k.economia.rpv)} (meta RPL ≈ R$ 24)`],
            ["ROAS bruto · líquido · caixa", `${vezes(k.economia.roasBruto)} · ${vezes(k.economia.roasLiquido)} · ${vezes(k.economia.roasCaixa)}`],
          ]} />
          <Grupo titulo="Caixa" nota={DEFINICAO_CAIXA} linhas={[
            ["Vendido", `${brl(k.caixa.vendido)} (${k.caixa.vendas} vendas)`],
            ["Receita líquida", `${brl(k.caixa.receitaLiquida)} (reembolsos ${brl(k.caixa.reembolsado)})`],
            ["Taxas", brl(k.caixa.taxas)],
            ["Recebido até hoje", brl(k.caixa.recebido)],
            ["A receber", `${brl(k.caixa.aReceber)}${k.caixa.vencido ? ` (${brl(k.caixa.vencido)} vencido)` : ""}`],
            ["Projetado até 30/12", brl(k.caixa.projetadoAteCorte)],
          ]} />
        </div>
        {(k.caixa.recebidoPresumido > 0 || k.caixa.semRecebivel > 0 || k.caixa.semData > 0) && (
          <p className="mt-3 text-xs text-mineral-escuro">
            Limite do caixa: a Kiwify não confirma o depósito por webhook. {brl(k.caixa.recebidoPresumido)} conta como recebido
            pela data prevista até um extrato ser importado em Vendas.
            {k.caixa.semRecebivel > 0 && ` ${k.caixa.semRecebivel} venda(s) aprovada(s) sem data de depósito no webhook (${brl(k.caixa.semRecebivelValor)} líquido) ficam fora da projeção.`}
            {k.caixa.semData > 0 && ` ${brl(k.caixa.semData)} a receber sem data também fica fora.`}
          </p>
        )}
        <p className="mt-2 text-xs text-mineral-escuro">
          Gasto, CPL, CAC e ROAS por campanha e criativo ficam em Mídia. Conteúdo por content_id fica em Conteúdo.
        </p>
      </Secao>

      <Secao titulo="Atualização dos dados">
        <FrescorDados itens={fontes} />
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

      <Secao titulo="Coortes de clientes (LTV inicial)">
        <Tabela cab={["1ª compra em", "Clientes", "Receita por cliente em 30 dias", "Em 60 dias", "Fizeram 2ª compra"]} vazio={!eco.coortes.length}>
          {eco.coortes.map((c) => (
            <tr key={c.mes}>
              <Td>{c.mes}</Td>
              <Td direita>{c.clientes}</Td>
              <Td direita>{brl(c.receita30 / c.clientes)}</Td>
              <Td direita>{brl(c.receita60 / c.clientes)}</Td>
              <Td direita>{pct(c.segundaCompra, c.clientes)}</Td>
            </tr>
          ))}
        </Tabela>
        <p className="mt-2 text-xs text-mineral-escuro">Não julgar a aquisição só pela primeira compra quando existe progressão de ticket (Financeiro §9).</p>
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

function Grupo({ titulo, linhas, nota }: { titulo: string; linhas: [string, string][]; nota?: string }) {
  return (
    <div className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4">
      <h3 className="font-display text-lg text-grafite">{titulo}</h3>
      <dl className="mt-2 divide-y divide-linha/70 text-sm">
        {linhas.map(([r, v]) => (
          <div key={r} className="flex items-baseline justify-between gap-4 py-1.5">
            <dt className="text-mineral-escuro">{r}</dt>
            <dd className="text-right tabular-nums text-grafite">{v}</dd>
          </div>
        ))}
      </dl>
      {nota && <p className="mt-2 text-[11px] leading-snug text-mineral-escuro">{nota}</p>}
    </div>
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
