import Link from "next/link";
import { brl, pct, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";
import { ESTADOS_ICP, resultadoPorCodigo, somar, TERRITORIOS_INICIAIS, UNIVERSOS } from "@/lib/epic/server/editorial";

type Props = { searchParams: Promise<{ status?: string; universo?: string; dimensao?: string }> };

const STATUS: Record<string, string> = { ideia: "ideia", producao: "em produção", publicada: "publicada", arquivada: "arquivada" };

/** Banco de ideias (Sistema Editorial §7): ideia → derivações → resultado. */
export default async function EditorialPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const ideias = await query<Record<string, string | null>>(
    `select id, ideia_mae, tensao, dimensao, estado_icp, universo, gatilho, objetivo, cta_nivel, status, updated_at
     from editorial_ideas
     where ($1::text is null or status = $1) and ($2::text is null or universo = $2) and ($3::text is null or dimensao = $3)
     order by updated_at desc limit 300`,
    [sp.status ?? null, sp.universo ?? null, sp.dimensao ?? null]
  );
  const derivs = await query<{ idea_id: string; codigo: string; views: number | null; salvamentos: number | null; compartilhamentos: number | null; relatos: number | null }>(
    "select idea_id, codigo, views, salvamentos, compartilhamentos, relatos from editorial_derivations"
  );
  const resultados = await resultadoPorCodigo(derivs.map((d) => d.codigo));
  const porIdeia = (id: string) => {
    const ds = derivs.filter((d) => d.idea_id === id);
    return {
      n: ds.length,
      views: ds.reduce((a, d) => a + (d.views ?? 0), 0),
      relatos: ds.reduce((a, d) => a + (d.relatos ?? 0), 0),
      r: somar(ds.map((d) => resultados[d.codigo]).filter(Boolean)),
    };
  };

  // Distribuição real vs referência (§5) e territórios (§22), sobre ideias não arquivadas.
  const ativas = ideias.filter((i) => i.status !== "arquivada");
  const comUniverso = ativas.filter((i) => i.universo);
  const comDimensao = ativas.filter((i) => i.dimensao);
  const noTerritorio = comDimensao.filter((i) => TERRITORIOS_INICIAIS.includes(i.dimensao!)).length;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <Titulo sub="Não começar pelo calendário. Começar por ideias capazes de gerar atenção, reconhecimento e movimento.">Banco de ideias</Titulo>
        <Link href="/admin/epic/editorial/nova" className="rounded bg-grafite px-4 py-2 text-sm text-papel">Nova ideia</Link>
      </div>

      <Secao titulo="Distribuição editorial (referência do documento, não regra rígida)">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Tabela cab={["Universo", "Ideias", "Atual", "Referência"]}>
            {Object.entries(UNIVERSOS).map(([k, u]) => {
              const n = comUniverso.filter((i) => i.universo === k).length;
              return (
                <tr key={k}>
                  <Td><Link href={`/admin/epic/editorial?universo=${k}`} className="hover:underline">{u.nome}</Link></Td>
                  <Td direita>{n}</Td>
                  <Td direita>{pct(n, comUniverso.length)}</Td>
                  <Td direita>{u.referencia}%</Td>
                </tr>
              );
            })}
          </Tabela>
          <div className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-5 text-sm">
            <p className="text-xs text-mineral-escuro">Territórios de aquisição iniciais (§22)</p>
            <p className="mt-1 font-display text-3xl text-grafite">{pct(noTerritorio, comDimensao.length)}</p>
            <p className="mt-1 text-mineral-escuro">
              das ideias com dimensão estão em Energia, Ação, Coragem ou Autoconhecimento. Referência: cerca de 70%.
            </p>
          </div>
        </div>
      </Secao>

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href="/admin/epic/editorial" className={!sp.status && !sp.universo && !sp.dimensao ? "font-semibold" : "text-mineral-escuro"}>Todas</Link>
        {Object.entries(STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin/epic/editorial?status=${k}`} className={sp.status === k ? "font-semibold" : "text-mineral-escuro"}>{v}</Link>
        ))}
      </div>

      <Tabela cab={["Ideia", "Dimensão", "Estado do ICP", "Universo", "Peças", "Views", "Relatos", "Visitas", "Mapas", "Leads", "Receita", ""]} vazio={!ideias.length}>
        {ideias.map((i) => {
          const m = porIdeia(i.id!);
          return (
            <tr key={i.id}>
              <Td>
                <Link href={`/admin/epic/editorial/${i.id}`} className="text-grafite underline-offset-2 hover:underline">{i.ideia_mae}</Link>
                {i.tensao && <span className="block text-xs text-mineral-escuro">{i.tensao}</span>}
              </Td>
              <Td>{i.dimensao && isDimensionId(i.dimensao) ? DIMENSIONS[i.dimensao].name : "—"}</Td>
              <Td>{i.estado_icp ? ESTADOS_ICP[i.estado_icp] : "—"}</Td>
              <Td>{i.universo ? UNIVERSOS[i.universo]?.nome : "—"}</Td>
              <Td direita>{m.n}</Td>
              <Td direita>{m.views || "—"}</Td>
              <Td direita>{m.relatos || "—"}</Td>
              <Td direita>{m.r.visitas}</Td>
              <Td direita>{m.r.mapas}</Td>
              <Td direita>{m.r.leads}</Td>
              <Td direita>{brl(m.r.receita)}</Td>
              <Td><Selo tom={i.status === "publicada" ? "bom" : i.status === "producao" ? "alerta" : "neutro"}>{STATUS[i.status!]}</Selo></Td>
            </tr>
          );
        })}
      </Tabela>
      <p className="mt-2 text-xs text-mineral-escuro">
        Visitas, Mapas, leads e receita vêm do site, pelo código de cada peça (utm_content). Views e relatos são lançados à mão em cada peça.
      </p>
    </>
  );
}
