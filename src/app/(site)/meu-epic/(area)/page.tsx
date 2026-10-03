import type { Metadata } from "next";
import { Container, PrimaryCTA, TextCTA } from "@/components/epic/ui";
import { Cabecalho, Item, Lista, Secao, Vazio } from "@/components/epic/meu-epic/ui";
import { DIMENSIONS } from "@/lib/epic/dimensions";
import { estadoPlano, progressoProtocolo, rotuloPlano, temProtocolo } from "@/lib/epic/meu-epic";
import { acessosDoLead, progressoDoLead } from "@/lib/epic/server/acessos";
import { exigirConta } from "@/lib/epic/server/conta";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { dataCurta, mapasDaConta, mentoriaDaConta } from "@/lib/epic/server/meu-epic";
import { planosDaConta } from "@/lib/epic/server/planos";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Início" };

/** Início (CR-01A §1): painel simples, sem gráfico nem pontuação. */
export default async function InicioPage() {
  const conta = await exigirConta("/meu-epic");
  const dados = await withTx(async (q) => {
    const [mapas, planos, acessos, progresso, mentoria] = [
      await mapasDaConta(q, conta.leadId, 1),
      await planosDaConta(q, conta.leadId),
      await acessosDoLead(q, conta.leadId),
      await progressoDoLead(q, conta.leadId),
      await mentoriaDaConta(q, conta.leadId),
    ];
    await registrarEvento(q, "ViewMeuEpicHome", { lead_id: conta.leadId });
    return { mapas, planos, acessos, progresso, mentoria };
  });
  const ultimoMapa = dados.mapas[0] ?? null;
  const plano = dados.planos.find((p) => p.access_status === "active") ?? null;
  const ativos = dados.acessos.filter((a) => a.access_status === "active" && (a.product_type === "kit" || a.product_type === "protocol"));
  const protocolo = temProtocolo(dados.acessos) ? progressoProtocolo(dados.progresso) : null;

  return (
    <>
      <Cabecalho
        titulo={conta.nome ? `Olá, ${conta.nome}.` : "Olá."}
        apoio="O que você já fez e o que já comprou no EPIC247, num lugar só."
      />
      <Container>
        {protocolo && (
          <Secao titulo="Protocolo EPIC247">
            <p className="font-display text-[1.5rem] leading-snug text-grafite">
              {protocolo.concluidas} de {protocolo.total} dimensões concluídas.
            </p>
            {protocolo.proxima && (
              <p className="mt-2 text-[17px] text-grafite/85">
                Próxima na sequência recomendada: {DIMENSIONS[protocolo.proxima].name}.
              </p>
            )}
            <div className="mt-5">
              <PrimaryCTA href={protocolo.proxima ? `/meu-epic/produtos/protocolo/${protocolo.proxima}` : "/meu-epic/produtos/protocolo"}>
                Continuar o Protocolo
              </PrimaryCTA>
            </div>
          </Secao>
        )}

        <Secao titulo="Último Mapa" acao={ultimoMapa && <TextCTA href="/meu-epic/mapas">Todos os Mapas</TextCTA>}>
          {ultimoMapa ? (
            <>
              <Lista>
                <Item
                  href={ultimoMapa.url}
                  titulo={ultimoMapa.nome}
                  meta={[dataCurta(ultimoMapa.concluidoEm), ultimoMapa.principal].filter(Boolean).join(" · ")}
                  acao="Ver resultado"
                />
              </Lista>
              {ultimoMapa.primeiroMovimento && (
                <div className="mt-8">
                  <p className="text-[15px] text-mineral-escuro">Seu próximo movimento, segundo este Mapa:</p>
                  <p className="mt-2 border-l border-latao pl-5 font-display text-[1.3rem] leading-snug text-grafite">
                    {ultimoMapa.primeiroMovimento}
                  </p>
                </div>
              )}
            </>
          ) : (
            <Vazio
              texto="Você ainda não concluiu nenhum Mapa."
              acao={<PrimaryCTA href="/mapa">Começar pelo Mapa de Fricção</PrimaryCTA>}
            />
          )}
        </Secao>

        <Secao titulo="Plano mais recente" acao={plano && <TextCTA href="/meu-epic/planos">Todos os Planos</TextCTA>}>
          {plano ? (
            <Lista>
              <Item
                href={`/meu-epic/planos/${plano.plan_generation_id}`}
                titulo={`Plano EPIC ${DIMENSIONS[plano.dimensao as keyof typeof DIMENSIONS]?.name ?? ""} 7 Dias`}
                meta={plano.generated_at ? `Gerado em ${dataCurta(plano.generated_at)}` : undefined}
                status={rotuloPlano(estadoPlano(plano), plano.processing_error === "sem_mapa")}
                acao="Acessar meu Plano"
              />
            </Lista>
          ) : (
            <Vazio texto="Seus Planos EPIC 7 Dias aparecerão aqui após a compra e geração." />
          )}
        </Secao>

        <Secao titulo="Produtos ativos" acao={ativos.length > 0 && <TextCTA href="/meu-epic/produtos">Meus Produtos</TextCTA>}>
          {ativos.length || dados.mentoria ? (
            <Lista>
              {ativos.map((a) => (
                  <Item
                    key={a.grant_id}
                    href={a.product_type === "protocol" ? "/meu-epic/produtos/protocolo" : `/meu-epic/produtos/kit/${a.scope}`}
                    titulo={a.product_name}
                    meta={`Desde ${dataCurta(a.granted_at)}`}
                    acao="Abrir"
                  />
              ))}
              {dados.mentoria && <Item titulo="Mentoria EPIC Individual" status={dados.mentoria} />}
            </Lista>
          ) : (
            <Vazio texto="Seus Kits e o Protocolo aparecerão aqui quando estiverem disponíveis para sua conta." />
          )}
        </Secao>
      </Container>
    </>
  );
}
