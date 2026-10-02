import { Aviso, brl, FiltroPeriodo, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { AvisoCarga, brlOu, ImportarCsv, ListaCargas, vezes } from "@/components/epic/admin/dados";
import { excluirInvestimento, salvarInvestimento } from "../actions";
import { DEFINICAO_ECONOMIA, MODELO_ATRIBUICAO } from "@/lib/epic/kpi/metricas";
import { exigirAdmin, FASES_MIDIA, periodoDe, resumoMidia, sinalMidia } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";
import { atribuicaoMidia, ultimasCargas, type LinhaAtribuicao } from "@/lib/epic/server/kpi";

type Props = { searchParams: Promise<{ ok?: string; erro?: string; p?: string; carga?: string }> };

const SINAL = {
  verde: { tom: "bom", texto: "verde · escalar" },
  amarelo: { tom: "alerta", texto: "amarelo · manter e testar" },
  vermelho: { tom: "ruim", texto: "vermelho · parar" },
  sem_dados: { tom: "neutro", texto: "sem leads ainda" },
} as const;

/** Investimento em mídia e o que ele trouxe (Financeiro §10, §11, §16, §17; Modelo de Dados §54-§56). */
export default async function MidiaPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const periodo = periodoDe(sp.p);
  const [resumo, campanhas, criativos, cargas, lancamentos] = await Promise.all([
    resumoMidia(),
    atribuicaoMidia(periodo, "campanha"),
    atribuicaoMidia(periodo, "criativo"),
    ultimasCargas("campaign_performance"),
    query<Record<string, string | null>>(
      `select id, period_start::text, period_end::text, channel, campaign, content, fase, amount, notes
       from media_spend order by period_start desc, created_at desc limit 100`
    ),
  ]);
  const hoje = new Date().toISOString().slice(0, 10);
  const porFase = Object.fromEntries(resumo.porFase.map((f) => [f.fase, f.investido]));

  return (
    <>
      <Titulo sub="Não gastar R$ 10 mil tentando provar uma hipótese que os primeiros R$ 1 mil já mostraram estar errada.">Mídia</Titulo>
      {sp.ok && <Aviso>Investimento lançado.</Aviso>}
      {sp.erro && <Aviso tom="ruim">Confira as datas e o valor. Nada foi salvo.</Aviso>}
      <AvisoCarga carga={sp.carga} />

      <Secao titulo={`Orçamento por fase · ${brl(resumo.total)} de ${brl(10000)}`}>
        <div className="grid gap-3 sm:grid-cols-5">
          {FASES_MIDIA.map((f) => {
            const gasto = porFase[f.fase] ?? 0;
            return (
              <div key={f.fase} className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4">
                <p className="font-mono text-xs text-mineral-escuro">Fase {f.fase}</p>
                <p className="font-display text-lg text-grafite">{f.nome}</p>
                <p className="mt-1 text-sm text-grafite">{brl(gasto)} <span className="text-mineral-escuro">de {brl(f.teto)}</span></p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-papel-escuro">
                  <div className={`h-full ${gasto > f.teto ? "bg-[#b06a5a]" : "bg-grafite"}`} style={{ width: `${Math.min(100, (gasto / f.teto) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-mineral-escuro">
          Liberar a fase seguinte só quando a anterior mostrou comportamento econômico aceitável. Soma o CSV importado e o
          lançamento manual. Linha importada só entra numa fase se o CSV tiver a coluna fase.
        </p>
      </Secao>

      <FiltroPeriodo atual={periodo} base="/admin/epic/midia" />

      <TabelaAtribuicao titulo="Por campanha" coluna="Campanha" linhas={campanhas} sinal />
      <TabelaAtribuicao titulo="Por criativo (utm_content)" coluna="Criativo" linhas={criativos} />
      <p className="-mt-6 mb-10 text-xs text-mineral-escuro">
        {MODELO_ATRIBUICAO} {DEFINICAO_ECONOMIA} Gasto e resultado do mesmo período. CPL desejável abaixo de R$ 12
        (R$ 7 a 8 é bom sinal; R$ 18 a 20 pede análise; R$ 35 tende a quebrar o modelo). Leads e compras informados pela
        plataforma não entram nessas contas.
      </p>

      <section id="importar" className="mb-10">
        <h2 className="mb-3 font-mono text-sm text-latao-escuro">Importar CSV da plataforma</h2>
        <ImportarCsv entidade="campaign_performance" origem="meta_ads_csv" plataformas={["meta", "google", "linkedin", "tiktok", "other"]}>
          No Gerenciador de Anúncios, exporte com detalhamento por dia e nível de anúncio. Colunas lidas: Dia, Identificação
          e Nome da campanha, do conjunto e do anúncio, Valor usado (BRL), Impressões, Alcance, Cliques no link,
          Visualizações da página de destino, Parâmetros de URL. Também aceita utm_campaign, utm_content e fase. A chave é
          dia + plataforma + campanha + conjunto + anúncio: reimportar o mesmo período atualiza, não duplica.
        </ImportarCsv>
        <div className="mt-4">
          <ListaCargas cargas={cargas} />
        </div>
      </section>

      <Secao titulo="Lançar investimento à mão">
        <form action={salvarInvestimento} className="grid gap-3 rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Campo rotulo="De"><input type="date" name="period_start" required defaultValue={hoje} className={CAMPO} /></Campo>
          <Campo rotulo="Até"><input type="date" name="period_end" defaultValue={hoje} className={CAMPO} /></Campo>
          <Campo rotulo="Valor (R$)"><input name="amount" required inputMode="decimal" placeholder="250,00" className={CAMPO} /></Campo>
          <Campo rotulo="Fase">
            <select name="fase" defaultValue="1" className={CAMPO}>
              {FASES_MIDIA.map((f) => <option key={f.fase} value={f.fase}>{f.fase}. {f.nome}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Canal">
            <select name="channel" defaultValue="meta" className={CAMPO}>
              {["meta", "google", "linkedin", "tiktok", "partner", "other"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Campanha (igual ao utm_campaign)"><input name="campaign" placeholder="onda1_energia" className={CAMPO} /></Campo>
          <Campo rotulo="Criativo (utm_content, opcional)"><input name="content" placeholder="reel_07" className={CAMPO} /></Campo>
          <Campo rotulo="Observação"><input name="notes" className={CAMPO} /></Campo>
          <div className="sm:col-span-2 lg:col-span-4">
            <button className="rounded bg-grafite px-4 py-2 text-papel">Lançar</button>
          </div>
        </form>
        <p className="mt-2 text-xs text-mineral-escuro">
          Para gasto que não vem em CSV (parceria, impulsionamento avulso). Não lance aqui o que já foi importado, senão o
          gasto conta duas vezes. Padrão de campanha sugerido (Funis §27): objetivo_onda_dimensao.
        </p>
      </Secao>

      <Secao titulo="Lançamentos manuais">
        <Tabela cab={["Período", "Fase", "Canal", "Campanha", "Criativo", "Valor", "Observação", ""]} vazio={!lancamentos.length}>
          {lancamentos.map((l) => (
            <tr key={l.id}>
              <Td>{fmt(l.period_start)}{l.period_end !== l.period_start ? ` a ${fmt(l.period_end)}` : ""}</Td>
              <Td>{l.fase ?? "—"}</Td>
              <Td>{l.channel}</Td>
              <Td mono>{l.campaign ?? "—"}</Td>
              <Td mono>{l.content ?? "—"}</Td>
              <Td direita>{brl(Number(l.amount))}</Td>
              <Td>{l.notes ?? ""}</Td>
              <Td>
                <form action={excluirInvestimento}>
                  <input type="hidden" name="id" value={l.id!} />
                  <button className="text-xs text-[#8a3f30] underline">excluir</button>
                </form>
              </Td>
            </tr>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}

function TabelaAtribuicao({ titulo, coluna, linhas, sinal = false }: { titulo: string; coluna: string; linhas: LinhaAtribuicao[]; sinal?: boolean }) {
  const cab = [coluna, "Investido", "Visitantes", "Leads", "CPL", "Novos", "CAC 1º produto", "Compradores", "CAC cliente", "Bruto", "ROAS bruto", "ROAS líquido", "Cash ROAS"];
  return (
    <Secao titulo={titulo}>
      <Tabela cab={sinal ? [...cab, "Sinal"] : cab} vazio={!linhas.length}>
        {linhas.map((l) => {
          const s = SINAL[sinalMidia(l.cpl, l.leads ? l.bruto / l.leads : null, l.investido)];
          return (
            <tr key={l.chave}>
              <Td mono>{l.chave}</Td>
              <Td direita>{brl(l.investido)}</Td>
              <Td direita>{l.visitantes}</Td>
              <Td direita>{l.leads}</Td>
              <Td direita>{brlOu(l.cpl)}</Td>
              <Td direita>{l.novos}</Td>
              <Td direita>{brlOu(l.cacPrimeiroProduto)}</Td>
              <Td direita>{l.compradores}</Td>
              <Td direita>{brlOu(l.cacCliente)}</Td>
              <Td direita>{brl(l.bruto)}</Td>
              <Td direita>{vezes(l.roasBruto)}</Td>
              <Td direita>{vezes(l.roasLiquido)}</Td>
              <Td direita>{vezes(l.roasCaixa)}</Td>
              {sinal && <Td><Selo tom={s.tom}>{s.texto}</Selo></Td>}
            </tr>
          );
        })}
      </Tabela>
    </Secao>
  );
}

const fmt = (d: string | null) => (d ? d.split("-").reverse().join("/") : "—");
const CAMPO = "w-full rounded border border-linha bg-papel px-3 py-2";

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-mineral-escuro">{rotulo}</span>
      {children}
    </label>
  );
}
