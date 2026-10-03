import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlanoConteudo from "@/components/epic/PlanoConteudo";
import { Container, PrimaryCTA } from "@/components/epic/ui";
import { Cabecalho, Vazio } from "@/components/epic/meu-epic/ui";
import { DIMENSIONS, isDimensionId, mapPath } from "@/lib/epic/dimensions";
import { estadoPlano, podeAbrirKit } from "@/lib/epic/meu-epic";
import { acessosDoLead } from "@/lib/epic/server/acessos";
import { exigirConta } from "@/lib/epic/server/conta";
import { listarConteudos, TIPO_ROTA } from "@/lib/epic/server/conteudo";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { planoDaConta, registrarRetornoDia7 } from "@/lib/epic/server/planos";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Plano EPIC 7 Dias" };

type Props = { params: Promise<{ id: string }> };

/**
 * Um Plano da conta (CR-01A §3). Sessão + dono + acesso ativo, conferidos no
 * servidor a cada abertura: conhecer o endereço não abre o Plano.
 */
export default async function PlanoDaContaPage({ params }: Props) {
  const { id } = await params;
  const conta = await exigirConta(`/meu-epic/planos/${id}`);
  const r = await withTx(async (q) => {
    const g = await planoDaConta(q, conta.leadId, id);
    if (!g) return null;
    const acessos = await acessosDoLead(q, conta.leadId);
    if (g.access_status === "active" && estadoPlano(g) === "ready") {
      await registrarEvento(q, "ViewPlan", {
        lead_id: conta.leadId, product_id: g.product_id, product_type: "plan", dimension: g.dimensao,
        props: { plan_generation_id: g.plan_generation_id, versao: g.output_version },
      });
      await registrarRetornoDia7(q, { plan_generation_id: g.plan_generation_id, lead_id: conta.leadId, product_id: g.product_id, generated_at: g.generated_at });
    }
    return { g, acessos };
  });
  if (!r) notFound();
  const { g, acessos } = r;
  const nome = isDimensionId(g.dimensao) ? DIMENSIONS[g.dimensao].name : "";
  const voltar = { href: "/meu-epic/planos", label: "Meus Planos" };

  if (g.access_status !== "active") {
    return (
      <>
        <Cabecalho titulo={`Plano EPIC ${nome} 7 Dias`} voltar={voltar} />
        <Container className="mt-10">
          <Vazio
            texto="O acesso a este Plano foi encerrado. O histórico continua guardado na sua conta."
            acao={<a href="/contato?assunto=produtos" className="link-traco text-[15px] font-medium text-grafite">Falar com a equipe</a>}
          />
        </Container>
      </>
    );
  }

  if (estadoPlano(g) !== "ready" || !g.content) {
    const semMapa = g.processing_error === "sem_mapa";
    return (
      <>
        <Cabecalho titulo={`Plano EPIC ${nome} 7 Dias`} voltar={voltar} />
        <Container className="mt-10">
          {semMapa && isDimensionId(g.dimensao) ? (
            <Vazio
              texto={`Falta um passo. Para personalizar o seu Plano, precisamos das suas respostas no Mapa de ${nome}. Assim que você concluir, o Plano aparece aqui.`}
              acao={<PrimaryCTA href={mapPath(g.dimensao)}>Fazer o Mapa de {nome}</PrimaryCTA>}
            />
          ) : (
            <Vazio texto="Seu Plano está sendo preparado. Assim que estiver pronto, ele aparecerá aqui e avisaremos por e-mail." />
          )}
        </Container>
      </>
    );
  }

  const [rec] = await listarConteudos({ dimensao: g.content.dimensao, limite: 1 });
  const recomendado = rec ? { titulo: rec.title, url: `/ideias/${TIPO_ROTA[rec.content_type]}/${rec.slug}` } : null;
  return (
    <PlanoConteudo
      p={g.content}
      recomendado={recomendado}
      ofertaKit={!podeAbrirKit(acessos, g.dimensao)}
      acoes={
        <a
          href={`/meu-epic/planos/${g.plan_generation_id}/pdf`}
          className="group inline-flex items-center gap-3 rounded-[var(--radius-epic)] bg-grafite px-5 py-3 text-[15px] font-semibold text-papel hover:bg-tinta"
        >
          Baixar PDF
          <span aria-hidden className="h-px w-5 bg-latao transition-all duration-300 group-hover:w-8" />
        </a>
      }
    />
  );
}
