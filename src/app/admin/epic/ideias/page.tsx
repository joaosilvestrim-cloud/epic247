import Link from "next/link";
import { dataHora, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { TIPO_LABEL, TIPO_ROTA, type ItemConteudo } from "@/lib/epic/server/conteudo";
import { query } from "@/lib/epic/server/db";

type Props = { searchParams: Promise<{ t?: string }> };

/** CMS de Ideias: artigos, newsletter, vídeos e repertório (RF-070 a RF-072). */
export default async function IdeiasAdminPage({ searchParams }: Props) {
  await exigirAdmin();
  const tipo = (await searchParams).t;
  const filtro = tipo && tipo in TIPO_LABEL ? tipo : null;
  const itens = await query<Pick<ItemConteudo, "id" | "content_type" | "title" | "slug" | "dimension" | "published_at"> & { status: string; updated_at: string }>(
    `select id, content_type, title, slug, dimension, status, published_at, updated_at
     from content_items where ($1::text is null or content_type = $1) order by updated_at desc limit 200`,
    [filtro]
  );

  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <Titulo sub="Publicado com data futura fica agendado: entra no site sozinho no dia.">Ideias</Titulo>
        <Link href="/admin/epic/ideias/novo" className="rounded bg-grafite px-4 py-2 text-sm text-papel">Novo conteúdo</Link>
      </div>
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href="/admin/epic/ideias" className={!filtro ? "font-semibold" : "text-mineral-escuro"}>Todos</Link>
        {Object.entries(TIPO_LABEL).map(([k, v]) => (
          <Link key={k} href={`/admin/epic/ideias?t=${k}`} className={filtro === k ? "font-semibold" : "text-mineral-escuro"}>{v}</Link>
        ))}
      </div>
      <Tabela cab={["Título", "Tipo", "Dimensão", "Situação", "Publicação", "Atualizado", ""]} vazio={!itens.length}>
        {itens.map((c) => {
          const agendado = c.status === "published" && c.published_at && new Date(c.published_at) > new Date();
          return (
            <tr key={c.id}>
              <Td>
                <Link href={`/admin/epic/ideias/${c.id}`} className="text-grafite underline-offset-2 hover:underline">{c.title}</Link>
                <span className="block font-mono text-xs text-mineral-escuro">{c.slug}</span>
              </Td>
              <Td>{TIPO_LABEL[c.content_type]}</Td>
              <Td>{c.dimension && isDimensionId(c.dimension) ? DIMENSIONS[c.dimension].name : "—"}</Td>
              <Td>
                {c.status === "draft" ? <Selo>rascunho</Selo> : agendado ? <Selo tom="alerta">agendado</Selo> : <Selo tom="bom">no ar</Selo>}
              </Td>
              <Td>{dataHora(c.published_at)}</Td>
              <Td>{dataHora(c.updated_at)}</Td>
              <Td>
                {c.status === "published" && !agendado && (
                  <a className="underline" target="_blank" rel="noreferrer" href={`/ideias/${TIPO_ROTA[c.content_type]}/${c.slug}`}>ver</a>
                )}
              </Td>
            </tr>
          );
        })}
      </Tabela>
    </>
  );
}
