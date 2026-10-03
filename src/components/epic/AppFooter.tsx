import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import { copyText } from "@/lib/epic/content/copy";
import { MANIFESTO } from "@/lib/epic/content/home";
import { FOOTER } from "@/lib/epic/content/navegacao";
import { CTA_FRICCAO, dimensoesNavegaveis } from "@/lib/epic/site";
import NewsletterForm from "./NewsletterForm";

// Footer global (Copy Final §5): EPIC247, Dimensões, Explore, Ideias, Legal e newsletter.
const EXPLORE = [
  { label: "Protocolo", href: "/protocolo" },
  { label: "Mentoria", href: "/mentoria" },
  { label: "Ju", href: "/ju" },
  { label: "Ideias", href: "/ideias" },
  { label: "Contato", href: "/contato" },
  { label: "Meu EPIC", href: "/meu-epic" },
];
const IDEIAS = [
  { label: "Artigos", href: "/ideias/artigos" },
  { label: "Vídeos", href: "/ideias/videos" },
  { label: "Newsletter", href: "/ideias/newsletter" },
  { label: "Repertório", href: "/ideias/repertorio" },
];
const LEGAL = [
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos de Uso", href: "/termos" },
  { label: "Preferências de Comunicação", href: "/descadastro" },
];

function Coluna({ titulo, itens }: { titulo: string; itens: { label: string; href: string }[] }) {
  return (
    <nav aria-label={titulo}>
      <p className="mb-4 font-mono text-xs text-latao">{titulo}</p>
      <ul className="space-y-1.5 text-sm text-papel/75">
        {itens.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="hover:text-papel">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function AppFooter() {
  const dims = dimensoesNavegaveis();
  const n = FOOTER.newsletter;

  return (
    <footer className="grao bg-tinta text-papel">
      <div className="mx-auto max-w-[76rem] px-5 pb-10 pt-20 sm:px-8">
        {/* Fechamento: a promessa da marca (Posicionamento §9), em tamanho de cena final. */}
        <p className="revelar max-w-4xl font-display text-[2.1rem] font-light leading-[1.12] text-papel sm:text-[3.2rem]">
          {MANIFESTO.promessa}
        </p>
        <div className="filete-revela mt-10 h-px w-24 bg-latao" />

        <div className="mt-14 grid gap-12 border-t border-papel/10 pt-12 md:grid-cols-[1.4fr_1fr] lg:grid-cols-[1.5fr_1.6fr]">
          <div>
            <BrandLogo size="1.3rem" tagline={false} />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-papel/70">{copyText(FOOTER.descricao)}</p>
            <Link
              href={CTA_FRICCAO.href}
              className="mt-6 inline-block border-b border-latao pb-0.5 text-sm text-papel/90 hover:text-papel"
            >
              {CTA_FRICCAO.label}
            </Link>
            <div className="mt-12 max-w-md">
              <p className="font-display text-[1.35rem] leading-snug text-papel">{copyText(n.titulo)}</p>
              <div className="mt-4">
                <NewsletterForm texto={copyText(n.texto)} consentimento={copyText(n.consentimento)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
            {dims.length > 0 && <Coluna titulo="Dimensões" itens={dims.map((d) => ({ label: d.name, href: d.href }))} />}
            <Coluna titulo="Explore" itens={EXPLORE} />
            <Coluna titulo="Ideias" itens={IDEIAS} />
            <Coluna titulo="Legal" itens={LEGAL} />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-papel/10 pt-6 text-xs text-papel/45 sm:flex-row sm:justify-between">
          <p>{FOOTER.direitos}</p>
          <p>Os Mapas EPIC são ferramentas educativas. Não substituem avaliação profissional.</p>
        </div>
      </div>
    </footer>
  );
}
