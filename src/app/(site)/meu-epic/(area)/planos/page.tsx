import type { Metadata } from "next";
import { Container } from "@/components/epic/ui";
import { Cabecalho, Item, Lista, Secao, Vazio } from "@/components/epic/meu-epic/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { estadoPlano, rotuloPlano } from "@/lib/epic/meu-epic";
import { exigirConta } from "@/lib/epic/server/conta";
import { withTx } from "@/lib/epic/server/db";
import { dataCurta } from "@/lib/epic/server/meu-epic";
import { planosDaConta } from "@/lib/epic/server/planos";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Meus Planos" };

/** Meus Planos (CR-01A §3): dimensão, data, perfil-base, estado e acesso. */
export default async function MeusPlanosPage() {
  const conta = await exigirConta("/meu-epic/planos");
  const planos = await withTx((q) => planosDaConta(q, conta.leadId));
  const nome = (d: string) => (isDimensionId(d) ? DIMENSIONS[d].name : "");
  return (
    <>
      <Cabecalho titulo="Meus Planos" apoio="Seus Planos EPIC 7 Dias ficam guardados aqui. Abra quantas vezes quiser." />
      <Container>
        <Secao titulo="Planos">
          {planos.length ? (
            <Lista>
              {planos.map((p) => {
                const estado = estadoPlano(p);
                const ativo = p.access_status === "active";
                return (
                  <Item
                    key={p.plan_generation_id}
                    href={ativo ? `/meu-epic/planos/${p.plan_generation_id}` : undefined}
                    titulo={`Plano EPIC ${nome(p.dimensao)} 7 Dias`}
                    meta={[
                      p.generated_at ? `Gerado em ${dataCurta(p.generated_at)}` : null,
                      p.content?.padrao?.nome ? `Perfil-base: ${p.content.padrao.nome}` : null,
                    ].filter(Boolean).join(" · ") || undefined}
                    status={ativo ? rotuloPlano(estado, p.processing_error === "sem_mapa") : "Acesso encerrado"}
                    acao={ativo ? "Acessar meu Plano" : undefined}
                  />
                );
              })}
            </Lista>
          ) : (
            <Vazio texto="Seus Planos EPIC 7 Dias aparecerão aqui após a compra e geração." />
          )}
        </Secao>
      </Container>
    </>
  );
}
