import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/epic/ui";
import { BotaoForm } from "@/components/epic/meu-epic/ui";
import { destinoSeguro } from "@/lib/epic/meu-epic";
import { contaAtual, VALIDADE_LINK_MIN } from "@/lib/epic/server/conta";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Entrar" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

const AVISOS: Record<string, string> = {
  email: "Confira o e-mail digitado.",
  limite: "Muitas tentativas seguidas. Espere alguns minutos e peça de novo.",
  expirado: "Este link já foi usado ou expirou. Peça um novo abaixo: ele chega na hora.",
  falha: "Não conseguimos abrir sua sessão agora. Tente de novo em instantes.",
};

/** Entrada do Meu EPIC: link de acesso por e-mail, sem senha (CR-01A, D1). */
export default async function EntrarPage({ searchParams }: Props) {
  const sp = await searchParams;
  const volta = destinoSeguro(sp.volta);
  if (await contaAtual().catch(() => null)) redirect(volta);

  const aviso = sp.erro ? AVISOS[sp.erro] : null;
  return (
    <section className="grao min-h-[70vh]">
      <Container estreito className="py-16 sm:py-24">
        <p className="font-mono text-sm text-latao-escuro">Meu EPIC</p>
        <h1 className="mt-4 font-display text-[2.3rem] font-normal leading-[1.1] text-grafite sm:text-[3rem]">
          {sp.enviado ? "Confira seu e-mail." : "Entre na sua área."}
        </h1>

        {sp.enviado ? (
          <div className="mt-5 max-w-xl space-y-3 text-[17px] leading-relaxed text-grafite/85">
            <p>
              Se este e-mail tiver Mapas ou compras no EPIC247, o link de acesso chega em instantes. Ele vale por{" "}
              {VALIDADE_LINK_MIN} minutos e funciona uma vez.
            </p>
            <p className="text-[15px] text-mineral-escuro">Não chegou? Confira a caixa de spam ou peça de novo.</p>
          </div>
        ) : (
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-grafite/85">
            Seus Mapas, Planos e produtos ficam aqui. Use o e-mail do Mapa ou da compra: enviamos um link de acesso, sem
            senha.
          </p>
        )}

        {sp.saiu && <p role="status" className="mt-6 border-l border-latao pl-4 text-grafite">Você saiu do Meu EPIC.</p>}
        {aviso && (
          <p role="alert" className="mt-6 border-l border-latao pl-4 text-grafite">
            {aviso}
          </p>
        )}

        <form action="/api/v2/conta/link" method="post" className="mt-8 max-w-md">
          <input type="hidden" name="volta" value={volta} />
          <label htmlFor="email" className="block text-[15px] font-medium text-grafite">
            Seu e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className="mt-2 w-full rounded-[var(--radius-epic)] border border-linha bg-papel-claro px-4 py-3 text-[16px] text-grafite"
          />
          <div className="mt-5">
            <BotaoForm>{sp.enviado ? "Enviar outro link" : "Receber link de acesso"}</BotaoForm>
          </div>
        </form>

        <p className="mt-10 text-sm text-mineral-escuro">
          Problema para entrar? <a href="/contato?assunto=produtos" className="link-traco">Fale com a gente</a>.
        </p>
      </Container>
    </section>
  );
}
