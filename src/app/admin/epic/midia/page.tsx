import { Aviso, brl, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { excluirInvestimento, salvarInvestimento } from "../actions";
import { exigirAdmin, FASES_MIDIA, resumoMidia } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";

type Props = { searchParams: Promise<{ ok?: string; erro?: string }> };

const SINAL = {
  verde: { tom: "bom", texto: "verde · escalar" },
  amarelo: { tom: "alerta", texto: "amarelo · manter e testar" },
  vermelho: { tom: "ruim", texto: "vermelho · parar" },
  sem_dados: { tom: "neutro", texto: "sem leads ainda" },
} as const;

/** Investimento em mídia e o que ele trouxe (Financeiro §10, §11, §16, §17). */
export default async function MidiaPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const [resumo, lancamentos] = await Promise.all([
    resumoMidia(),
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
          Liberar a fase seguinte só quando a anterior mostrou comportamento econômico aceitável.
        </p>
      </Secao>

      <Secao titulo="Por campanha">
        <Tabela cab={["Campanha", "Investido", "Visitantes", "Leads", "CPL", "Compradores", "CAC", "Receita", "ROAS", "Sinal"]} vazio={!resumo.linhas.length}>
          {resumo.linhas.map((l) => (
            <tr key={l.campanha}>
              <Td mono>{l.campanha}</Td>
              <Td direita>{brl(l.investido)}</Td>
              <Td direita>{l.visitantes}</Td>
              <Td direita>{l.leads}</Td>
              <Td direita>{l.cpl == null ? "—" : brl(l.cpl)}</Td>
              <Td direita>{l.compradores}</Td>
              <Td direita>{l.cac == null ? "—" : brl(l.cac)}</Td>
              <Td direita>{brl(l.receita)}</Td>
              <Td direita>{l.roas == null ? "—" : `${l.roas.toFixed(2).replace(".", ",")}x`}</Td>
              <Td><Selo tom={SINAL[l.sinal].tom}>{SINAL[l.sinal].texto}</Selo></Td>
            </tr>
          ))}
        </Tabela>
        <p className="mt-2 text-xs text-mineral-escuro">
          CPL desejável abaixo de R$ 12 (R$ 7 a 8 é bom sinal; R$ 18 a 20 pede análise; R$ 35 tende a quebrar o modelo).
          CPL sozinho não decide: campanha cuja receita por lead paga o lead fica verde. Leads e compras são ligados à
          campanha pelo utm_campaign do link do anúncio.
        </p>
      </Secao>

      <Secao titulo="Lançar investimento">
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
          Padrão de campanha sugerido (Funis §27): objetivo_onda_dimensao, por exemplo aquisicao_onda1_energia.
        </p>
      </Secao>

      <Secao titulo="Lançamentos">
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
