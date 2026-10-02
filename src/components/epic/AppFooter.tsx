import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import { MANIFESTO } from "@/lib/epic/content/home";
import { CTA_FRICCAO, NAV, dimensoesNavegaveis } from "@/lib/epic/site";
import NewsletterForm from "./NewsletterForm";

export default function AppFooter() {
  const dims = dimensoesNavegaveis();
  const ano = new Date().getFullYear();

  return (
    <footer className="grao bg-tinta text-papel">
      <div className="mx-auto max-w-[76rem] px-5 pb-10 pt-20 sm:px-8">
        {/* Fechamento: a promessa da marca (Posicionamento §9), em tamanho de cena final. */}
        <p className="revelar max-w-4xl font-display text-[2.1rem] font-light leading-[1.12] text-papel sm:text-[3.2rem]">
          {MANIFESTO.promessa}
        </p>
        <div className="filete-revela mt-10 h-px w-24 bg-latao" />
        <div className="mt-14 grid gap-12 border-t border-papel/10 pt-12 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <BrandLogo size="1.3rem" tagline={false} />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-papel/70">
              Transformação pessoal aplicada. 10 dimensões. Um sistema.
            </p>
            <Link
              href={CTA_FRICCAO.href}
              className="mt-6 inline-block border-b border-latao pb-0.5 text-sm text-papel/90 hover:text-papel"
            >
              {CTA_FRICCAO.label}
            </Link>
          </div>

          {dims.length > 0 && (
            <nav aria-label="Dimensões">
              <p className="mb-4 font-mono text-xs text-latao">Dimensões</p>
              <ul className="space-y-1.5 text-sm text-papel/75">
                {dims.map((d) => (
                  <li key={d.id}>
                    <Link href={d.href} className="hover:text-papel">
                      {d.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <nav aria-label="Institucional">
            <p className="mb-4 font-mono text-xs text-latao">EPIC247</p>
            <ul className="space-y-1.5 text-sm text-papel/75">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-papel">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li className="pt-3">
                <Link href="/privacidade" className="hover:text-papel">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-papel">
                  Termos de uso
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="mb-4 font-mono text-xs text-latao">Newsletter</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-papel/10 pt-6 text-xs text-papel/45 sm:flex-row sm:justify-between">
          <p>© {ano} EPIC247. Transformação pessoal aplicada.</p>
          <p>Os Mapas EPIC são ferramentas educativas. Não substituem avaliação profissional.</p>
        </div>
      </div>
    </footer>
  );
}
