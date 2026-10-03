"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/meu-epic", label: "Início" },
  { href: "/meu-epic/mapas", label: "Meus Mapas" },
  { href: "/meu-epic/planos", label: "Meus Planos" },
  { href: "/meu-epic/produtos", label: "Meus Produtos" },
  { href: "/meu-epic/conta", label: "Minha Conta" },
];

/** Abas do Meu EPIC. No celular rolam na horizontal, sem esconder nenhuma. */
export default function NavMeuEpic() {
  const atual = usePathname();
  const ativo = (href: string) => (href === "/meu-epic" ? atual === href : atual.startsWith(href));
  return (
    <nav aria-label="Meu EPIC" className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <ul className="flex min-w-max gap-6 pt-5 sm:gap-8">
        {ITENS.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={ativo(i.href) ? "page" : undefined}
              className={`inline-block border-b-2 pb-3 text-[15px] transition-colors ${
                ativo(i.href)
                  ? "border-latao font-semibold text-grafite"
                  : "border-transparent text-mineral-escuro hover:text-grafite"
              }`}
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
