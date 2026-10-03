import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/epic/ui";
import { AVISO_PROVISORIO, CONTROLADOR, legalPublicavel, PAGINAS_LEGAIS } from "@/lib/epic/content/legal";
import { NAO_INDEXAR } from "@/lib/epic/seo";

// Status de publicação em src/lib/epic/content/legal.ts. Enquanto não
// aprovada pelo jurídico: no ar (os formulários apontam para cá), sem
// placeholder, marcada como provisória, noindex e fora do sitemap.
const PUBLICAVEL = legalPublicavel("privacidade");
// Versão registrada junto de cada consentimento (RF-063). Mudou o texto,
// muda a versão em legal.ts e em app_settings.privacy_policy_version.
const VERSAO = PAGINAS_LEGAIS.privacidade.versao;

export const metadata: Metadata = {
  title: "Política de privacidade",
  alternates: { canonical: "/privacidade" },
  ...(PUBLICAVEL ? {} : { robots: NAO_INDEXAR }),
};

/** Canal para pedidos de privacidade: o e-mail do encarregado, quando definido; senão, o Contato. */
function Canal() {
  return CONTROLADOR.emailPrivacidade ? (
    <a href={`mailto:${CONTROLADOR.emailPrivacidade}`} className="underline underline-offset-2">
      {CONTROLADOR.emailPrivacidade}
    </a>
  ) : (
    <Link href="/contato?assunto=outro" className="underline underline-offset-2">
      a página de Contato
    </Link>
  );
}

export default function PrivacidadePage() {
  return (
    <>
      <article className="grao">
        <Container estreito className="py-16 sm:py-24">
          {!PUBLICAVEL && (
            <p role="note" className="mb-8 rounded-[var(--radius-epic)] border border-latao/50 bg-papel-claro px-4 py-3 text-sm text-grafite/80">
              {AVISO_PROVISORIO}
            </p>
          )}
          <p className="font-mono text-sm text-latao-escuro">Versão {VERSAO}</p>
          <h1 className="entrada mt-4 font-display text-[2.6rem] leading-tight text-grafite">Política de privacidade</h1>

          <div className="prosa mt-10 space-y-8 text-[17px] leading-relaxed text-grafite/90">
            <Bloco titulo="Quem é responsável pelos seus dados">
              {CONTROLADOR.razaoSocial && CONTROLADOR.cnpj ? (
                <p>
                  O EPIC247 é operado por {CONTROLADOR.razaoSocial}, inscrita no CNPJ {CONTROLADOR.cnpj}, que é a
                  controladora dos dados pessoais tratados neste site. Para qualquer assunto de privacidade, use <Canal />.
                </p>
              ) : (
                <p>
                  O EPIC247 é o controlador dos dados pessoais tratados neste site. Os dados de identificação da
                  empresa serão publicados aqui ao fim da revisão jurídica. Para qualquer assunto de privacidade, use{" "}
                  <Canal />.
                </p>
              )}
            </Bloco>

            <Bloco titulo="O que coletamos">
              <ul className="list-disc space-y-2 pl-5 marker:text-latao">
                <li>
                  <strong>Navegação:</strong> páginas visitadas, de onde você veio (por exemplo, um link do
                  Instagram), tipo de aparelho e sistema, e cidade aproximada informada pelo provedor de
                  hospedagem. Não guardamos o seu endereço IP.
                </li>
                <li>
                  <strong>Um identificador aleatório</strong>, guardado em cookie, para reconhecer o seu
                  navegador entre visitas. Ele não contém nome, e-mail nem respostas.
                </li>
                <li>
                  <strong>Respostas dos Mapas</strong> e o resultado calculado a partir delas.
                </li>
                <li>
                  <strong>Nome e e-mail</strong>, somente quando você informa, por exemplo para receber o seu
                  mapa, assinar a newsletter ou falar com a gente.
                </li>
                <li>
                  <strong>Dados de compra</strong> enviados pela plataforma de pagamento: produto, valor, status
                  do pagamento e o e-mail usado na compra. Não recebemos nem guardamos dados de cartão.
                </li>
                <li>
                  <strong>Mensagens</strong> que você envia pelo contato ou pelo interesse na Mentoria.
                </li>
              </ul>
            </Bloco>

            <Bloco titulo="Para que usamos">
              <ul className="list-disc space-y-2 pl-5 marker:text-latao">
                <li>Mostrar o resultado do seu Mapa e permitir que você volte a ele pelo link.</li>
                <li>Enviar o que você pediu: o seu mapa, o seu Plano e as informações sobre o que comprou.</li>
                <li>Entregar e acompanhar os produtos comprados.</li>
                <li>Enviar conteúdos e ofertas por e-mail, somente se você aceitar. Esse aceite é separado e opcional.</li>
                <li>Lembrar uma compra iniciada e não concluída, respeitando o seu descadastro.</li>
                <li>Entender quais conteúdos e canais funcionam, de forma agregada, para melhorar o site.</li>
              </ul>
            </Bloco>

            <Bloco titulo="Os Mapas não são diagnóstico">
              <p>
                Os Mapas EPIC são ferramentas educativas de autoavaliação. Não pedimos, não inferimos e não
                registramos diagnóstico de saúde. O resultado não é classificado como dado de saúde.
              </p>
            </Bloco>

            <Bloco titulo="Bases legais">
              <p>
                Execução de contrato e procedimentos a pedido seu (resultado, produtos, respostas); consentimento
                (comunicação de marketing); legítimo interesse (segurança do site, métricas agregadas e lembrete
                de compra iniciada); cumprimento de obrigação legal (registros financeiros).
              </p>
            </Bloco>

            <Bloco titulo="Com quem compartilhamos">
              <p>
                Somente com fornecedores necessários para o site funcionar: hospedagem (Vercel), banco de dados
                (Supabase), envio de e-mails (Resend) e pagamento (Kiwify). Quando ativas, ferramentas de medição
                de campanhas (Meta e Google) recebem eventos de navegação. Nunca vendemos dados pessoais.
              </p>
            </Bloco>

            <Bloco titulo="Cookies">
              <p>
                Usamos um cookie de identificação (até 1 ano) e um de sessão, necessários para guardar o seu
                progresso nos Mapas e ligar o seu resultado à sua compra. Ferramentas de medição de terceiros,
                quando ativas, usam cookies próprios.
              </p>
            </Bloco>

            <Bloco titulo="Por quanto tempo guardamos">
              <p>
                Enquanto a sua relação com o EPIC247 existir ou até você pedir a exclusão. Registros financeiros
                são mantidos pelo prazo exigido em lei.
              </p>
            </Bloco>

            <Bloco titulo="Seus direitos">
              <p>
                Você pode pedir acesso, correção, portabilidade ou exclusão dos seus dados, e revogar o
                consentimento a qualquer momento. Para parar de receber e-mails, use o link no rodapé de qualquer
                mensagem. Para os demais pedidos, use <Canal />.
              </p>
            </Bloco>
          </div>
        </Container>
      </article>
    </>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-2xl text-grafite">{titulo}</h2>
      {children}
    </section>
  );
}
