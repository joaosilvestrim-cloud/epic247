import Link from "next/link";
import { notFound } from "next/navigation";
import CapaUpload from "@/components/epic/admin/CapaUpload";
import { Aviso, Titulo } from "@/components/epic/admin/ui";
import { DIMENSION_IDS, DIMENSIONS } from "@/lib/epic/dimensions";
import { enviarNewsletter, excluirConteudo, salvarConteudo } from "../../actions";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { TIPO_LABEL, TIPO_ROTA, type ItemConteudo } from "@/lib/epic/server/conteudo";
import { query } from "@/lib/epic/server/db";
import { UNIVERSOS } from "@/lib/epic/server/editorial";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string; erro?: string; enviada?: string }> };

/** "2026-10-05T12:00:00Z" → "2026-10-05T09:00" no horário de Brasília (campo datetime-local). */
function paraCampo(v: string | null) {
  if (!v) return "";
  const d = new Date(new Date(v).getTime() - 3 * 3600e3);
  return d.toISOString().slice(0, 16);
}

export default async function EditorIdeiaPage({ params, searchParams }: Props) {
  await exigirAdmin();
  const { id } = await params;
  const novo = id === "novo";
  if (!novo && !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [c] = novo
    ? [null]
    : await query<ItemConteudo & { status: string; newsletter_sent_at: string | null; newsletter_recipients: number | null }>(
        "select * from content_items where id = $1",
        [id]
      );
  if (!novo && !c) notFound();
  const sp = await searchParams;
  const salvo = sp.salvo === "1";
  const [{ inscritos }] = await query<{ inscritos: number }>(
    `select count(*)::int inscritos from lead_profile
     where email is not null and marketing_email_allowed and unsubscribed_at is null and email_bounced_at is null`
  );
  const noAr = c?.status === "published" && c.published_at && new Date(c.published_at) <= new Date();

  return (
    <>
      <p className="mb-2 text-sm"><Link href="/admin/epic/ideias" className="text-mineral-escuro hover:text-grafite">← Ideias</Link></p>
      <Titulo sub={noAr && c ? <a className="underline" target="_blank" rel="noreferrer" href={`/ideias/${TIPO_ROTA[c.content_type]}/${c.slug}`}>Ver no site</a> : undefined}>
        {novo ? "Novo conteúdo" : c!.title}
      </Titulo>
      {salvo && <Aviso>Salvo.</Aviso>}
      {sp.erro === "campos" && <Aviso tom="ruim">Título e tipo são obrigatórios. Nada foi salvo.</Aviso>}
      {sp.erro === "slug" && <Aviso tom="ruim">Esse endereço (slug) já é de outro conteúdo. Escolha outro. Nada foi salvo.</Aviso>}

      <form action={salvarConteudo} className="grid max-w-5xl gap-6 text-sm lg:grid-cols-[1fr_18rem]">
        {c && <input type="hidden" name="id" value={c.id} />}
        <div className="space-y-4">
          <Campo rotulo="Título">
            <input name="title" required defaultValue={c?.title ?? ""} className={`${CAMPO} font-display text-xl`} />
          </Campo>
          <Campo rotulo="Resumo (aparece na listagem e no compartilhamento)">
            <textarea name="excerpt" rows={2} maxLength={400} defaultValue={c?.excerpt ?? ""} className={CAMPO} />
          </Campo>
          <Campo rotulo="Texto">
            <textarea name="body" rows={22} defaultValue={c?.body ?? ""} className={`${CAMPO} font-mono text-[13px] leading-relaxed`} />
          </Campo>
          <p className="text-xs text-mineral-escuro">
            Linha em branco separa parágrafos. <code>## Subtítulo</code>, <code>### Intertítulo</code>, <code>- item</code>,{" "}
            <code>&gt; citação</code>, <code>**negrito**</code>, <code>*itálico*</code>, <code>[texto](https://link)</code>.
          </p>
          <Campo rotulo="Vídeo (YouTube ou Vimeo, para o tipo Vídeo)">
            <input name="video_url" defaultValue={c?.video_url ?? ""} className={CAMPO} />
          </Campo>
        </div>

        <div className="space-y-4">
          <Campo rotulo="Situação">
            <select name="status" defaultValue={c?.status ?? "draft"} className={CAMPO}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </Campo>
          <Campo rotulo="Data de publicação (Brasília)">
            <input type="datetime-local" name="published_at" defaultValue={paraCampo(c?.published_at ?? null)} className={CAMPO} />
          </Campo>
          <p className="-mt-2 text-xs text-mineral-escuro">Vazio ao publicar = agora. Data futura = agendado.</p>
          <Campo rotulo="Tipo">
            <select name="content_type" defaultValue={c?.content_type ?? "artigo"} className={CAMPO}>
              {Object.entries(TIPO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Dimensão">
            <select name="dimension" defaultValue={c?.dimension ?? ""} className={CAMPO}>
              <option value="">Nenhuma</option>
              {DIMENSION_IDS.map((d) => <option key={d} value={d}>{DIMENSIONS[d].name}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Universo editorial (interno)">
            <select name="universe" defaultValue={c?.universe ?? ""} className={CAMPO}>
              <option value="">Nenhum</option>
              {Object.entries(UNIVERSOS).map(([k, u]) => <option key={k} value={k}>{u.nome}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Autor">
            <input name="author" defaultValue={c?.author ?? "Ju Ferreira"} className={CAMPO} />
          </Campo>
          <div className="rounded border border-linha p-3">
            <label className="flex items-center gap-2 text-grafite">
              <input type="checkbox" name="featured" defaultChecked={Boolean(c?.featured)} /> Ideia em destaque
            </label>
            <p className="mt-1 text-xs text-mineral-escuro">Abre a página Ideias. Escolha pela força da ideia, não pela data.</p>
            <Campo rotulo="Ordem do destaque">
              <input name="featured_order" type="number" min={0} max={99} defaultValue={(c as { featured_order?: number | null } | null)?.featured_order ?? ""} className={CAMPO} />
            </Campo>
          </div>
          <Campo rotulo="Endereço (slug)">
            <input name="slug" defaultValue={c?.slug ?? ""} placeholder="gerado do título" className={`${CAMPO} font-mono text-xs`} />
          </Campo>
          <Campo rotulo="Capa">
            <CapaUpload nome="cover" inicial={c?.cover ?? null} />
          </Campo>
          <details className="rounded border border-linha p-3">
            <summary className="cursor-pointer text-mineral-escuro">SEO</summary>
            <div className="mt-3 space-y-3">
              <Campo rotulo="Título para o Google">
                <input name="seo_title" maxLength={120} defaultValue={c?.seo_title ?? ""} className={CAMPO} />
              </Campo>
              <Campo rotulo="Descrição para o Google">
                <textarea name="seo_description" rows={3} maxLength={300} defaultValue={c?.seo_description ?? ""} className={CAMPO} />
              </Campo>
              <Campo rotulo="Imagem social (URL; vazio = capa)">
                <input name="og_image" maxLength={400} defaultValue={c?.og_image ?? ""} className={CAMPO} />
              </Campo>
            </div>
          </details>
          <button className="w-full rounded bg-grafite px-4 py-2.5 text-papel">Salvar</button>
        </div>
      </form>

      {c?.content_type === "newsletter" && (
        <section className="mt-10 max-w-5xl rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-5 text-sm">
          <p className="font-semibold text-grafite">Enviar esta edição por e-mail</p>
          {sp.enviada && <p className="mt-2 text-[#4f6234]">Edição na fila para {sp.enviada} pessoa(s).</p>}
          {sp.erro === "confirmar_envio" && <p className="mt-2 text-[#8a3f30]">Marque a confirmação para enviar.</p>}
          {sp.erro === "nao_enviavel" && <p className="mt-2 text-[#8a3f30]">Só edições publicadas e ainda não enviadas podem sair.</p>}
          {c.newsletter_sent_at ? (
            <p className="mt-2 text-mineral-escuro">
              Enviada em {new Date(c.newsletter_sent_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} para{" "}
              {c.newsletter_recipients} pessoa(s). Acompanhe em E-mails (automação AUT_NEWSLETTER_EDITION).
            </p>
          ) : c.status !== "published" ? (
            <p className="mt-2 text-mineral-escuro">Publique a edição para poder enviar.</p>
          ) : (
            <form action={enviarNewsletter} className="mt-3 flex flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={c.id} />
              <span className="text-mineral-escuro">
                {inscritos} pessoa(s) com aceite de marketing. Sai no horário de publicação, respeitando 1 e-mail de marketing por dia.
              </span>
              <label className="inline-flex items-center gap-2"><input type="checkbox" name="confirmar" required /> Conferi o texto</label>
              <button className="rounded bg-grafite px-4 py-2 text-papel">Enviar para os inscritos</button>
            </form>
          )}
        </section>
      )}

      {c && (
        <form action={excluirConteudo} className="mt-12 max-w-5xl border-t border-linha pt-6 text-sm">
          <input type="hidden" name="id" value={c.id} />
          <label className="mr-3 inline-flex items-center gap-2 text-mineral-escuro">
            <input type="checkbox" name="confirmar" required /> Quero excluir de vez
          </label>
          <button className="text-[#8a3f30] underline">Excluir este conteúdo</button>
          <span className="ml-3 text-xs text-mineral-escuro">Para tirar do ar sem apagar, mude para Rascunho.</span>
        </form>
      )}
    </>
  );
}

const CAMPO = "w-full rounded border border-linha bg-papel-claro px-3 py-2";

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-mineral-escuro">{rotulo}</span>
      {children}
    </label>
  );
}
