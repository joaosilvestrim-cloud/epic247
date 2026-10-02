import { brl, dataHora, FiltroPeriodo, Secao, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { AvisoCarga, ImportarCsv, inteiro, ListaCargas, taxa } from "@/components/epic/admin/dados";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { DEFINICAO_CONTEUDO, taxasConteudo } from "@/lib/epic/kpi/metricas";
import { exigirAdmin, periodoDe } from "@/lib/epic/server/admin";
import { conteudoKpi, ultimasCargas } from "@/lib/epic/server/kpi";

type Props = { searchParams: Promise<{ p?: string; carga?: string }> };

/**
 * Performance de conteúdo externo ligada ao funil pelo content_id = utm_content
 * (Modelo de Dados §53, Blueprint §40 e §46, RF-096, RF-097, RF-110).
 */
export default async function ConteudoPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const periodo = periodoDe(sp.p);
  const [{ linhas, semMetrica }, cargas] = await Promise.all([conteudoKpi(periodo), ultimasCargas("content_performance")]);

  return (
    <>
      <Titulo sub="Cada conteúdo com content_id estável. O mesmo id vai no utm_content do link: assim a peça se liga à visita, ao Mapa, ao lead e à venda.">
        Conteúdo
      </Titulo>
      <AvisoCarga carga={sp.carga} />
      <FiltroPeriodo atual={periodo} base="/admin/epic/conteudo" />

      <Secao titulo="Por content_id (publicados no período)">
        <Tabela
          cab={["content_id", "Plataforma", "Publicado", "Tipo", "Dimensão", "Views", "Retenção", "Salv.", "Comp.", "Save Rate", "Share Rate", "CTR", "Sessões", "Leads", "Vendas", "Receita", "Métrica de"]}
          vazio={!linhas.length}
        >
          {linhas.map((c) => {
            const t = taxasConteudo(c);
            return (
              <tr key={`${c.platform}-${c.content_id}`}>
                <Td mono>{c.content_id}</Td>
                <Td>{c.platform}{c.organic_or_paid !== "organic" ? ` · ${c.organic_or_paid === "paid" ? "pago" : "híbrido"}` : ""}</Td>
                <Td>{c.published_at ? dataHora(c.published_at).slice(0, 8) : "—"}</Td>
                <Td>{c.content_type ?? "—"}</Td>
                <Td>{c.dimension ? (isDimensionId(c.dimension) ? DIMENSIONS[c.dimension].name : c.dimension) : "—"}</Td>
                <Td direita>{inteiro(c.views)}</Td>
                <Td direita>{c.retention_rate == null ? "—" : `${String(c.retention_rate).replace(".", ",")}%`}</Td>
                <Td direita>{inteiro(c.saves)}</Td>
                <Td direita>{inteiro(c.shares)}</Td>
                <Td direita>{taxa(t.saveRate)}</Td>
                <Td direita>{taxa(t.shareRate)}</Td>
                <Td direita>{taxa(t.ctr)}</Td>
                <Td direita>{c.sessoes}</Td>
                <Td direita>{c.leads}</Td>
                <Td direita>{c.vendas}</Td>
                <Td direita>{brl(c.receita)}</Td>
                <Td><span className="text-xs text-mineral-escuro">{dataHora(c.source_updated_at)}</span></Td>
              </tr>
            );
          })}
        </Tabela>
        <p className="mt-2 text-xs text-mineral-escuro">
          {DEFINICAO_CONTEUDO} Sessões, leads e vendas pelo utm_content, desde a publicação. Lead conta pelo último toque.
          “Métrica de” é a data do dado na plataforma: número antigo pode ser parcial.
        </p>
      </Secao>

      {semMetrica.length > 0 && (
        <Secao titulo="utm_content com visitas e sem métrica importada">
          <Tabela cab={["utm_content", "Sessões no período"]}>
            {semMetrica.map((s) => (
              <tr key={s.utm_content}>
                <Td mono>{s.utm_content}</Td>
                <Td direita>{s.sessoes}</Td>
              </tr>
            ))}
          </Tabela>
          <p className="mt-2 text-xs text-mineral-escuro">Importe a métrica dessas peças com o mesmo id para fechar a conta.</p>
        </Secao>
      )}

      <section id="importar" className="mb-10">
        <h2 className="mb-3 font-mono text-sm text-latao-escuro">Importar CSV de conteúdo</h2>
        <ImportarCsv entidade="content_performance" origem="instagram_csv" plataformas={["instagram", "facebook", "linkedin", "youtube", "tiktok", "other"]}>
          Uma linha por peça. Obrigatórias: content_id (ou utm_content) e plataforma (a escolhida acima vale para linhas sem
          plataforma). Opcionais: published_at, content_type (reel, story, carousel, static_post, video, article,
          newsletter), dimension, editorial_universe, organic_or_paid, campaign_id, views, reach, impressions,
          watch_time_seconds, average_watch_time_seconds, retention_rate (%), saves, shares, comments, profile_visits,
          link_clicks, source_updated_at. Nomes em português também valem (visualizações, alcance, salvamentos,
          compartilhamentos). Reimportar atualiza a peça. Export mais antigo não sobrescreve número mais novo.
        </ImportarCsv>
        <div className="mt-4">
          <ListaCargas cargas={cargas} />
        </div>
      </section>
    </>
  );
}
