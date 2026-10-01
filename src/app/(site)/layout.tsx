import AppFooter from "@/components/epic/AppFooter";
import AppHeader, { type ItemDimensao } from "@/components/epic/AppHeader";
import { CTA_FRICCAO, NAV, dimensoesNavegaveis } from "@/lib/epic/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const dimensoes: ItemDimensao[] = dimensoesNavegaveis().map((d) => ({
    id: d.id,
    ordem: d.order,
    nome: d.name,
    // Frase do mega-menu ainda é COPY PENDENTE: usa a linha aprovada do manifesto.
    frase: d.menuPhrase ?? d.manifestoLine,
    href: d.href,
  }));

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-tinta focus:px-4 focus:py-2 focus:text-papel"
      >
        Pular para o conteúdo
      </a>
      <AppHeader dimensoes={dimensoes} nav={NAV} cta={CTA_FRICCAO} />
      <main id="conteudo">{children}</main>
      <AppFooter />
    </>
  );
}
