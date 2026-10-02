"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import BrandLogo from "@/components/brand-logo";

export interface ItemDimensao {
  id: string;
  ordem: number;
  nome: string;
  frase: string;
  href: string;
  /** Mapa da dimensão, quando está no ar: vira o CTA do header na página dela. */
  mapaHref: string | null;
}

interface Props {
  dimensoes: ItemDimensao[];
  nav: readonly { label: string; href: string }[];
  cta: { label: string; href: string };
  menu: { titulo: string | null; apoio: string | null; fimPergunta: string | null };
}

/**
 * CTA contextual do header (Blueprint v1.2 §54.6): na página de dimensão,
 * o Mapa dela; durante um Mapa e no resultado, nenhum (não tirar a pessoa
 * do fluxo nem competir com o próximo passo do resultado).
 */
export function ctaDoHeader(
  pathname: string,
  dimensoes: ItemDimensao[],
  padrao: { label: string; href: string }
): { label: string; href: string } | null {
  if (pathname === "/mapa" || pathname.startsWith("/mapa/") || pathname.startsWith("/mapas/")) return null;
  if (pathname.startsWith("/plano/acesso")) return null;
  const m = pathname.match(/^\/dimensoes\/([^/]+)/);
  const d = m && dimensoes.find((x) => x.id === m[1]);
  if (d?.mapaHref) return { label: `Fazer meu Mapa de ${d.nome}`, href: d.mapaHref };
  return padrao;
}

/**
 * Header global (RF-001) com mega-menu de Dimensões (RF-002).
 * Acessível por teclado: Esc fecha, foco volta para o botão.
 */
export default function AppHeader({ dimensoes, nav, cta: ctaPadrao, menu }: Props) {
  const [megaAberto, setMegaAberto] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);
  // Ao rolar, o header fica um pouco mais baixo e ganha o filete (sem sombra).
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const pathname = usePathname();
  const painelId = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Fecha tudo ao navegar.
  useEffect(() => {
    setMegaAberto(false);
    setMobileAberto(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaAberto && !mobileAberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaAberto(false);
        setMobileAberto(false);
        botaoRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMegaAberto(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [megaAberto, mobileAberto]);

  useEffect(() => {
    document.body.style.overflow = mobileAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileAberto]);

  const ativo = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  const emDimensao = pathname.startsWith("/dimensoes");
  const cta = ctaDoHeader(pathname, dimensoes, ctaPadrao);
  const [inicio, ...resto] = nav;
  const linkNav = (item: { label: string; href: string }) => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={ativo(item.href) ? "page" : undefined}
      className={`relative py-1 text-[15px] transition-colors hover:text-tinta ${
        ativo(item.href) ? "text-tinta" : "text-grafite/80"
      }`}
    >
      {item.label}
      <span
        aria-hidden
        className={`absolute -bottom-0.5 left-0 h-px bg-latao transition-all ${ativo(item.href) ? "w-full" : "w-0"}`}
      />
    </Link>
  );

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 border-b backdrop-blur-sm transition-[background-color,border-color] duration-300 ${
        rolou || megaAberto || mobileAberto ? "border-linha bg-papel/95" : "border-transparent bg-papel/80"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[76rem] items-center justify-between gap-6 px-5 transition-[height] duration-300 [transition-timing-function:var(--ease-saida)] sm:px-8 ${
          rolou ? "h-[58px]" : "h-[68px]"
        }`}
      >
        <Link href="/" aria-label="EPIC247, página inicial" className="text-grafite">
          <BrandLogo size="1.2rem" tagline={false} />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
          {inicio && linkNav(inicio)}
          {dimensoes.length > 0 && (
            <button
              ref={botaoRef}
              type="button"
              aria-expanded={megaAberto}
              aria-controls={painelId}
              onClick={() => setMegaAberto((v) => !v)}
              className={`relative py-1 text-[15px] transition-colors hover:text-tinta ${
                megaAberto || emDimensao ? "text-tinta" : "text-grafite/80"
              }`}
            >
              Dimensões
              <span
                aria-hidden
                className={`absolute -bottom-0.5 left-0 h-px bg-latao transition-all ${
                  megaAberto || emDimensao ? "w-full" : "w-0"
                }`}
              />
            </button>
          )}
          {resto.map(linkNav)}
        </nav>

        <div className="flex items-center gap-3">
          {cta && (
            <Link
              href={cta.href}
              className="hidden rounded-[var(--radius-epic)] bg-grafite px-4 py-2.5 text-sm font-semibold text-papel transition-colors hover:bg-tinta sm:inline-block"
            >
              {cta.label}
            </Link>
          )}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center lg:hidden"
            aria-label={mobileAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileAberto}
            onClick={() => setMobileAberto((v) => !v)}
          >
            <span className="relative block h-3 w-6">
              <span
                className={`absolute left-0 h-px w-6 bg-grafite transition-all ${
                  mobileAberto ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-6 bg-grafite transition-all ${
                  mobileAberto ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mega-menu de Dimensões (desktop) */}
      {megaAberto && dimensoes.length > 0 && (
        <div id={painelId} className="menu-entra absolute inset-x-0 top-full border-b border-linha bg-papel-claro shadow-[0_24px_40px_-30px_rgba(23,22,20,0.35)]">
          <div className="mx-auto max-w-[76rem] px-8 py-10">
            {menu.titulo && (
              <div className="mb-8 flex items-end justify-between gap-10 border-b border-linha pb-6">
                <div className="max-w-2xl">
                  <p className="font-display text-[1.6rem] leading-tight text-grafite">{menu.titulo}</p>
                  {menu.apoio && <p className="mt-2 text-[15px] text-mineral-escuro">{menu.apoio}</p>}
                </div>
                <p className="shrink-0 text-right text-sm text-mineral-escuro">
                  {menu.fimPergunta}{" "}
                  <Link href={ctaPadrao.href} className="border-b border-latao font-medium text-grafite hover:border-grafite">
                    {ctaPadrao.label}
                  </Link>
                </p>
              </div>
            )}
            <ol className="grid grid-cols-2 gap-x-12 gap-y-1 xl:grid-cols-5 xl:gap-x-6">
              {dimensoes.map((d) => (
                <li key={d.id}>
                  <Link
                    href={d.href}
                    className="group flex gap-3 rounded-[var(--radius-epic)] p-3 transition-colors hover:bg-papel"
                  >
                    <span className="pt-1 font-mono text-xs text-latao-escuro">
                      {String(d.ordem).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-display text-lg leading-tight text-grafite group-hover:text-tinta">
                        {d.nome}
                      </span>
                      <span className="mt-1 block text-[13px] leading-snug text-mineral-escuro">{d.frase}</span>
                      <span className="mt-2 block text-[13px] font-medium text-grafite/80 group-hover:text-tinta">
                        Explorar {d.nome}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Menu mobile */}
      {mobileAberto && (
        <div className={`menu-entra fixed inset-x-0 bottom-0 overflow-y-auto bg-tinta text-papel lg:hidden ${rolou ? "top-[58px]" : "top-[68px]"}`}>
          <div className="px-5 pb-12 pt-8">
            {cta && (
              <Link
                href={cta.href}
                className="mb-10 flex items-center justify-between rounded-[var(--radius-epic)] bg-papel px-5 py-4 font-semibold text-tinta"
              >
                {cta.label}
                <span aria-hidden className="h-px w-6 bg-latao" />
              </Link>
            )}
            {dimensoes.length > 0 && (
              <>
                <p className="mb-3 font-mono text-xs text-latao">Dimensões</p>
                <ol className="mb-10 grid grid-cols-2 gap-x-4 gap-y-3">
                  {dimensoes.map((d) => (
                    <li key={d.id}>
                      <Link href={d.href} className="flex items-baseline gap-2">
                        <span className="font-mono text-[11px] text-latao">{String(d.ordem).padStart(2, "0")}</span>
                        <span className="font-display text-lg">{d.nome}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </>
            )}
            <ul className="space-y-1 border-t border-papel/15 pt-6">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block py-2 font-display text-2xl">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
