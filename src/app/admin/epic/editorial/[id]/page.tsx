import Link from "next/link";
import { notFound } from "next/navigation";
import { Aviso, brl, Secao, Titulo } from "@/components/epic/admin/ui";
import { DIMENSION_IDS, DIMENSIONS } from "@/lib/epic/dimensions";
import {
  adicionarDerivacao, excluirDerivacao, excluirIdeiaEditorial, salvarIdeiaEditorial, salvarMetricasDerivacao,
} from "../../actions";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";
import {
  ESTADOS_ICP, FORMATOS, GATILHOS, linkRastreavel, NIVEIS_CTA, OBJETIVOS, resultadoPorCodigo, UNIVERSOS,
} from "@/lib/epic/server/editorial";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string; erro?: string }> };

const DESTINOS = [
  ["/mapa", "Mapa de Fricção"],
  ...DIMENSION_IDS.map((d) => [`/mapas/${d}`, `Mapa de ${DIMENSIONS[d].name}`]),
  ...DIMENSION_IDS.map((d) => [`/dimensoes/${d}`, `Página de ${DIMENSIONS[d].name}`]),
  ["/protocolo", "Protocolo"],
  ["/mentoria", "Mentoria"],
  ["/ideias", "Ideias"],
  ["/", "Home"],
];

export default async function IdeiaEditorialPage({ params, searchParams }: Props) {
  await exigirAdmin();
  const { id } = await params;
  const nova = id === "nova";
  if (!nova && !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const sp = await searchParams;
  const [i] = nova ? [null] : await query<Record<string, string | number | null>>("select * from editorial_ideas where id = $1", [id]);
  if (!nova && !i) notFound();
  const derivs = nova
    ? []
    : await query<Record<string, string | number | boolean | null>>(
        "select *, publicado_em::text as publicado_txt from editorial_derivations where idea_id = $1 order by created_at",
        [id]
      );
  const res = await resultadoPorCodigo(derivs.map((d) => String(d.codigo)));
  const produtos = await query<{ product_id: string; product_name: string }>("select product_id, product_name from products order by product_type, product_id");
  const dim = (i?.dimensao as string | null) ?? null;

  return (
    <>
      <p className="mb-2 text-sm"><Link href="/admin/epic/editorial" className="text-mineral-escuro hover:text-grafite">← Banco de ideias</Link></p>
      <Titulo sub="Tensão humana → ideia forte → melhor formato → derivações → Mapa → oferta.">{nova ? "Nova ideia" : String(i!.ideia_mae)}</Titulo>
      {sp.salvo && <Aviso>Salvo.</Aviso>}
      {sp.erro && <Aviso tom="ruim">Escreva a ideia-mãe. Nada foi salvo.</Aviso>}

      <form action={salvarIdeiaEditorial} className="grid max-w-5xl gap-4 text-sm lg:grid-cols-2">
        {i && <input type="hidden" name="id" value={String(i.id)} />}
        <Campo rotulo="Ideia-mãe" largo>
          <textarea name="ideia_mae" rows={2} required defaultValue={(i?.ideia_mae as string) ?? ""} className={`${CAMPO} font-display text-lg`}
            placeholder="Quanto custa continuar adiando uma decisão que você já tomou por dentro?" />
        </Campo>
        <Campo rotulo="Tensão humana" largo>
          <input name="tensao" defaultValue={(i?.tensao as string) ?? ""} className={CAMPO} placeholder="Já decidi. Não consegui agir." />
        </Campo>
        <Seletor nome="dimensao" rotulo="Dimensão" valor={dim} opcoes={DIMENSION_IDS.map((d) => [d, DIMENSIONS[d].name])} />
        <Seletor nome="estado_icp" rotulo="Estado do ICP" valor={i?.estado_icp as string} opcoes={Object.entries(ESTADOS_ICP)} />
        <Seletor nome="universo" rotulo="Universo editorial" valor={i?.universo as string} opcoes={Object.entries(UNIVERSOS).map(([k, u]) => [k, u.nome])} />
        <Seletor nome="gatilho" rotulo="Gatilho" valor={i?.gatilho as string} opcoes={Object.entries(GATILHOS)} />
        <Seletor nome="objetivo" rotulo="Objetivo" valor={i?.objetivo as string} opcoes={Object.entries(OBJETIVOS)} />
        <Seletor nome="cta_nivel" rotulo="CTA" valor={i?.cta_nivel == null ? null : String(i.cta_nivel)} opcoes={Object.entries(NIVEIS_CTA)} />
        <Seletor nome="formato_mae" rotulo="Formato-mãe" valor={i?.formato_mae as string} opcoes={FORMATOS.map((f) => [f, f])} />
        <Seletor nome="produto_id" rotulo="Produto associado" valor={i?.produto_id as string} opcoes={produtos.map((p) => [p.product_id, p.product_name])} />
        <Seletor nome="status" rotulo="Situação" valor={(i?.status as string) ?? "ideia"} vazio={false}
          opcoes={[["ideia", "Ideia"], ["producao", "Em produção"], ["publicada", "Publicada"], ["arquivada", "Arquivada"]]} />
        <Campo rotulo="Notas (o que aprendemos com esta ideia)" largo>
          <textarea name="notas" rows={3} defaultValue={(i?.notas as string) ?? ""} className={CAMPO} />
        </Campo>
        <div className="lg:col-span-2"><button className="rounded bg-grafite px-4 py-2 text-papel">Salvar ideia</button></div>
      </form>

      {i && (
        <>
          <Secao titulo="Derivações: uma ideia, muitas manifestações">
            <div className="space-y-3">
              {derivs.map((d) => {
                const r = res[String(d.codigo)];
                const link = linkRastreavel(
                  { destino: String(d.destino), canal: String(d.canal), pago: Boolean(d.pago), campanha: (d.campanha as string) ?? null, codigo: String(d.codigo) },
                  dim
                );
                return (
                  <div key={String(d.id)} className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold text-grafite">{String(d.formato)} <span className="font-normal text-mineral-escuro">· {String(d.canal)}{d.pago ? " · pago" : ""}</span></p>
                      <p className="text-mineral-escuro">
                        {r ? `${r.visitas} visitas · ${r.mapas} Mapas · ${r.leads} leads · ${r.compras} compras · ${brl(r.receita)}` : "sem dados"}
                      </p>
                    </div>
                    <p className="mt-2 break-all rounded bg-papel px-2 py-1 font-mono text-xs text-grafite">{link}</p>
                    <form action={salvarMetricasDerivacao} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                      <input type="hidden" name="id" value={String(d.id)} />
                      <input type="hidden" name="idea_id" value={String(i.id)} />
                      <Mini nome="publicado_em" rotulo="Publicado em" tipo="date" valor={d.publicado_txt as string} />
                      <Mini nome="views" rotulo="Views" valor={d.views} />
                      <Mini nome="retencao_3s" rotulo="Retenção 3s %" valor={d.retencao_3s} />
                      <Mini nome="retencao_50" rotulo="Retenção 50% %" valor={d.retencao_50} />
                      <Mini nome="salvamentos" rotulo="Salvamentos" valor={d.salvamentos} />
                      <Mini nome="compartilhamentos" rotulo="Compartilhamentos" valor={d.compartilhamentos} />
                      <Mini nome="relatos" rotulo="Relatos de vida" valor={d.relatos} />
                      <div className="flex items-end gap-2">
                        <button className="rounded border border-grafite px-3 py-1.5">Salvar</button>
                      </div>
                    </form>
                    <form action={excluirDerivacao} className="mt-2">
                      <input type="hidden" name="id" value={String(d.id)} />
                      <input type="hidden" name="idea_id" value={String(i.id)} />
                      <button className="text-xs text-[#8a3f30] underline">remover peça</button>
                    </form>
                  </div>
                );
              })}
            </div>

            <form action={adicionarDerivacao} className="mt-4 grid gap-3 rounded-[var(--radius-epic)] border border-dashed border-linha p-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
              <input type="hidden" name="idea_id" value={String(i.id)} />
              <Seletor nome="formato" rotulo="Formato" valor="Reel da Ju" vazio={false} opcoes={FORMATOS.map((f) => [f, f])} />
              <Seletor nome="canal" rotulo="Canal" valor="instagram" vazio={false}
                opcoes={["instagram", "meta", "linkedin", "email", "partner", "google", "other"].map((c) => [c, c])} />
              <Seletor nome="destino" rotulo="Leva para" valor={dim ? `/mapas/${dim}` : "/mapa"} vazio={false} opcoes={DESTINOS} />
              <Campo rotulo="Campanha (opcional)"><input name="campanha" placeholder="aquisicao_onda1_energia" className={CAMPO} /></Campo>
              <label className="flex items-end gap-2 pb-2"><input type="checkbox" name="pago" /> Peça paga</label>
              <div className="sm:col-span-2 lg:col-span-5"><button className="rounded bg-grafite px-4 py-2 text-papel">Adicionar peça e gerar link</button></div>
            </form>
            <p className="mt-2 text-xs text-mineral-escuro">
              Criativo específico leva a experiência específica (Funis §3.2): conteúdo de Energia vai para o Mapa de Energia, conteúdo amplo para o Mapa de Fricção.
            </p>
          </Secao>

          <form action={excluirIdeiaEditorial} className="mt-12 border-t border-linha pt-6 text-sm">
            <input type="hidden" name="id" value={String(i.id)} />
            <label className="mr-3 inline-flex items-center gap-2 text-mineral-escuro"><input type="checkbox" name="confirmar" required /> Quero excluir de vez</label>
            <button className="text-[#8a3f30] underline">Excluir esta ideia</button>
          </form>
        </>
      )}
    </>
  );
}

const CAMPO = "w-full rounded border border-linha bg-papel-claro px-3 py-2";

function Campo({ rotulo, children, largo }: { rotulo: string; children: React.ReactNode; largo?: boolean }) {
  return (
    <label className={`block ${largo ? "lg:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs text-mineral-escuro">{rotulo}</span>
      {children}
    </label>
  );
}

function Seletor({ nome, rotulo, valor, opcoes, vazio = true }: { nome: string; rotulo: string; valor: string | null | undefined; opcoes: (string[] | [string, string])[]; vazio?: boolean }) {
  return (
    <Campo rotulo={rotulo}>
      <select name={nome} defaultValue={valor ?? ""} className={CAMPO}>
        {vazio && <option value="">—</option>}
        {opcoes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Campo>
  );
}

function Mini({ nome, rotulo, valor, tipo = "text" }: { nome: string; rotulo: string; valor: unknown; tipo?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-mineral-escuro">{rotulo}</span>
      <input name={nome} type={tipo} inputMode={tipo === "text" ? "decimal" : undefined} defaultValue={valor == null ? "" : String(valor)}
        className="w-full rounded border border-linha bg-papel px-2 py-1.5" />
    </label>
  );
}
