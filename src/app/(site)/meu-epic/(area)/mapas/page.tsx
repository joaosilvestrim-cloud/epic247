import type { Metadata } from "next";
import { Container, PrimaryCTA } from "@/components/epic/ui";
import { Cabecalho, Item, Lista, Secao, Vazio } from "@/components/epic/meu-epic/ui";
import { exigirConta } from "@/lib/epic/server/conta";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { dataCurta, mapasDaConta } from "@/lib/epic/server/meu-epic";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Meus Mapas" };

/** Meus Mapas (CR-01A §2): histórico com repetições, do mais novo ao mais antigo. */
export default async function MeusMapasPage() {
  const conta = await exigirConta("/meu-epic/mapas");
  const mapas = await withTx(async (q) => {
    const m = await mapasDaConta(q, conta.leadId);
    await registrarEvento(q, "ViewMapHistory", { lead_id: conta.leadId, props: { total: m.length } });
    return m;
  });
  return (
    <>
      <Cabecalho titulo="Meus Mapas" apoio="Cada vez que você refaz um Mapa, o resultado anterior continua aqui." />
      <Container>
        <Secao titulo={mapas.length ? `${mapas.length} ${mapas.length === 1 ? "Mapa concluído" : "Mapas concluídos"}` : "Histórico"}>
          {mapas.length ? (
            <Lista>
              {mapas.map((m) => (
                <Item
                  key={m.map_result_id}
                  href={m.url}
                  titulo={m.nome}
                  meta={
                    <>
                      {dataCurta(m.concluidoEm)}
                      {m.principal && <> · Principal: {m.principal}</>}
                      {m.secundario && <> · Também apareceu: {m.secundario}</>}
                    </>
                  }
                  acao="Ver resultado"
                />
              ))}
            </Lista>
          ) : (
            <Vazio
              texto="Você ainda não concluiu nenhum Mapa."
              acao={<PrimaryCTA href="/mapa">Começar pelo Mapa de Fricção</PrimaryCTA>}
            />
          )}
        </Secao>
      </Container>
    </>
  );
}
