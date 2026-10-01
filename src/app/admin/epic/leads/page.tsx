import Link from "next/link";
import { brl, dataHora, ETAPA_LABEL, origem, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";

type Props = { searchParams: Promise<{ q?: string; etapa?: string; pg?: string }> };

const POR_PAGINA = 50;

interface Linha {
  lead_id: string;
  email: string | null;
  first_name: string | null;
  lifecycle_stage: string;
  first_touch_source: string | null;
  latest_primary_dimension: string | null;
  maps_completed_count: number;
  marketing_email_allowed: boolean;
  unsubscribed_at: string | null;
  lifetime_revenue_gross: string;
  last_activity_at: string;
  total: string;
}

/** Lista de leads identificados (por padrão só quem deixou e-mail). */
export default async function LeadsPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const busca = sp.q?.trim() || null;
  const etapa = sp.etapa && sp.etapa in ETAPA_LABEL ? sp.etapa : null;
  const pg = Math.max(1, Number(sp.pg) || 1);

  const linhas = await query<Linha>(
    `select lead_id, email, first_name, lifecycle_stage, first_touch_source, latest_primary_dimension,
            maps_completed_count, marketing_email_allowed, unsubscribed_at, lifetime_revenue_gross, last_activity_at,
            count(*) over () as total
     from lead_profile
     where ($1::text is null or email ilike '%' || $1 || '%' or first_name ilike '%' || $1 || '%' or lead_id::text = $1)
       and ($2::text is null or lifecycle_stage = $2)
       and ($1::text is not null or $2::text is not null or email is not null)
     order by last_activity_at desc
     limit $3 offset $4`,
    [busca, etapa, POR_PAGINA, (pg - 1) * POR_PAGINA]
  );
  const total = Number(linhas[0]?.total ?? 0);
  const href = (p: number) => `/admin/epic/leads?${new URLSearchParams({ ...(busca ? { q: busca } : {}), ...(etapa ? { etapa } : {}), pg: String(p) })}`;

  return (
    <>
      <Titulo sub="Quem deixou e-mail. Busque por e-mail, nome ou id para achar também visitantes anônimos.">Leads</Titulo>
      <form className="mb-6 flex flex-wrap gap-2 text-sm" action="/admin/epic/leads">
        <input name="q" defaultValue={busca ?? ""} placeholder="e-mail, nome ou id" className="w-64 rounded border border-linha bg-papel-claro px-3 py-2" />
        <select name="etapa" defaultValue={etapa ?? ""} className="rounded border border-linha bg-papel-claro px-3 py-2">
          <option value="">Todas as etapas</option>
          {Object.entries(ETAPA_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="rounded bg-grafite px-4 py-2 text-papel">Filtrar</button>
      </form>

      <p className="mb-2 text-sm text-mineral-escuro">{total} encontrados</p>
      <Tabela cab={["Pessoa", "Etapa", "Origem", "Última dimensão", "Mapas", "E-mail marketing", "Comprou", "Última atividade"]} vazio={!linhas.length}>
        {linhas.map((l) => (
          <tr key={l.lead_id} className="hover:bg-papel-escuro/40">
            <Td>
              <Link href={`/admin/epic/leads/${l.lead_id}`} className="text-grafite underline-offset-2 hover:underline">
                {l.email ?? <span className="font-mono text-xs text-mineral-escuro">{l.lead_id.slice(0, 8)}</span>}
              </Link>
              {l.first_name && <span className="block text-xs text-mineral-escuro">{l.first_name}</span>}
            </Td>
            <Td>{ETAPA_LABEL[l.lifecycle_stage] ?? l.lifecycle_stage}</Td>
            <Td>{origem(l.first_touch_source)}</Td>
            <Td>{l.latest_primary_dimension && isDimensionId(l.latest_primary_dimension) ? DIMENSIONS[l.latest_primary_dimension].name : "—"}</Td>
            <Td direita>{l.maps_completed_count}</Td>
            <Td>{l.unsubscribed_at ? <Selo tom="ruim">descadastrado</Selo> : l.marketing_email_allowed ? <Selo tom="bom">aceitou</Selo> : <Selo>só transacional</Selo>}</Td>
            <Td direita>{Number(l.lifetime_revenue_gross) ? brl(Number(l.lifetime_revenue_gross)) : "—"}</Td>
            <Td>{dataHora(l.last_activity_at)}</Td>
          </tr>
        ))}
      </Tabela>
      {total > POR_PAGINA && (
        <div className="mt-4 flex gap-3 text-sm">
          {pg > 1 && <Link href={href(pg - 1)} className="underline">Anteriores</Link>}
          {pg * POR_PAGINA < total && <Link href={href(pg + 1)} className="underline">Próximos</Link>}
        </div>
      )}
    </>
  );
}
