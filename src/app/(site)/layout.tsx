import AppFooter from "@/components/epic/AppFooter";
import AppHeader, { type ItemDimensao } from "@/components/epic/AppHeader";
import { copyText } from "@/lib/epic/content/copy";
import { MEGA_MENU, PERGUNTA_MENU } from "@/lib/epic/content/navegacao";
import { mapPath } from "@/lib/epic/dimensions";
import { CTA_FRICCAO, NAV, dimensoesNavegaveis, mapaVisivel } from "@/lib/epic/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const dimensoes: ItemDimensao[] = dimensoesNavegaveis().map((d) => ({
    id: d.id,
    ordem: d.order,
    nome: d.name,
    // Pergunta do mega-menu (Copy Final §3); sem ela, a linha do manifesto.
    frase: copyText(PERGUNTA_MENU[d.id]) ?? d.manifestoLine,
    href: d.href,
    mapaHref: mapaVisivel(d.id) ? mapPath(d.id) : null,
  }));
  const menu = {
    titulo: copyText(MEGA_MENU.titulo),
    apoio: copyText(MEGA_MENU.apoio),
    fimPergunta: copyText(MEGA_MENU.fimPergunta),
  };

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-tinta focus:px-4 focus:py-2 focus:text-papel"
      >
        Pular para o conteúdo
      </a>
      <AppHeader dimensoes={dimensoes} nav={NAV} cta={CTA_FRICCAO} menu={menu} />
      <main id="conteudo">{children}</main>
      <AppFooter />
    </>
  );
}
