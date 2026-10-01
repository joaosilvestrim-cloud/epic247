import type { Metadata } from "next";
import { Container } from "@/components/epic/ui";

export const metadata: Metadata = { title: "Descadastro", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ l?: string; t?: string; ok?: string }> };

/**
 * Confirmação em dois passos: o clique no e-mail abre esta página, e só o
 * botão descadastra. Evita que antivírus que "visitam" links descadastrem
 * a pessoa sem ela querer.
 */
export default async function DescadastroPage({ searchParams }: Props) {
  const { l, t, ok } = await searchParams;
  return (
    <section className="grao min-h-[60vh]">
      <Container estreito className="py-24">
        {ok ? (
          <>
            <h1 className="font-display text-[2.4rem] leading-tight text-grafite">Pronto.</h1>
            <p className="mt-4 text-lg text-grafite/80">
              Você não vai mais receber conteúdos e ofertas do EPIC247 por e-mail. Mensagens sobre algo que você
              comprou ou pediu continuam chegando.
            </p>
          </>
        ) : l && t ? (
          <form action={`/api/v2/descadastro`} method="post">
            <input type="hidden" name="l" value={l} />
            <input type="hidden" name="t" value={t} />
            <h1 className="font-display text-[2.4rem] leading-tight text-grafite">Parar de receber e-mails?</h1>
            <p className="mt-4 text-lg text-grafite/80">
              Você deixa de receber conteúdos e ofertas. Mensagens sobre compras e pedidos seus continuam.
            </p>
            <button
              type="submit"
              className="mt-8 rounded-[var(--radius-epic)] bg-grafite px-7 py-3.5 text-[15px] font-semibold text-papel hover:bg-tinta"
            >
              Confirmar descadastro
            </button>
          </form>
        ) : (
          <>
            <h1 className="font-display text-[2.4rem] leading-tight text-grafite">Link incompleto.</h1>
            <p className="mt-4 text-lg text-grafite/80">Use o link que veio no rodapé do e-mail.</p>
          </>
        )}
      </Container>
    </section>
  );
}
