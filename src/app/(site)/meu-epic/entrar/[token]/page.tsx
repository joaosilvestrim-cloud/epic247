import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/epic/ui";
import { BotaoForm } from "@/components/epic/meu-epic/ui";
import { conferirLink } from "@/lib/epic/server/conta";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Entrar", referrer: "no-referrer" };

type Props = { params: Promise<{ token: string }> };

/**
 * Página do link do e-mail. O acesso só é consumido no clique em "Entrar"
 * (POST): filtros de e-mail que abrem links sozinhos não gastam o link.
 */
export default async function LinkDeEntradaPage({ params }: Props) {
  const { token } = await params;
  if ((await conferirLink(token).catch(() => "expirado")) !== "valido") redirect("/meu-epic/entrar?erro=expirado");
  return (
    <section className="grao min-h-[70vh]">
      <Container estreito className="py-16 sm:py-24">
        <p className="font-mono text-sm text-latao-escuro">Meu EPIC</p>
        <h1 className="mt-4 font-display text-[2.3rem] font-normal leading-[1.1] text-grafite sm:text-[3rem]">
          Seu acesso está pronto.
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-grafite/85">
          Toque em entrar para abrir o Meu EPIC neste aparelho. Você continua conectado por 30 dias.
        </p>
        <form action="/api/v2/conta/entrar" method="post" className="mt-8">
          <input type="hidden" name="token" value={token} />
          <BotaoForm>Entrar no Meu EPIC</BotaoForm>
        </form>
      </Container>
    </section>
  );
}
