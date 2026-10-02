import type { Metadata } from "next";
import Link from "next/link";
import AdminLogin from "@/components/admin-login";
import BrandLogo from "@/components/brand-logo";
import { adminConfigurado, isAdmin } from "@/lib/admin-auth";
import { DB_SCHEMA } from "@/lib/epic/server/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin EPIC 2.0", robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin/epic", label: "Painel" },
  { href: "/admin/epic/mapas", label: "Mapas" },
  { href: "/admin/epic/leads", label: "Leads" },
  { href: "/admin/epic/vendas", label: "Vendas" },
  { href: "/admin/epic/midia", label: "Mídia" },
  { href: "/admin/epic/conteudo", label: "Conteúdo" },
  { href: "/admin/epic/produtos", label: "Produtos" },
  { href: "/admin/epic/emails", label: "E-mails" },
  { href: "/admin/epic/editorial", label: "Banco de ideias" },
  { href: "/admin/epic/ideias", label: "Ideias no site" },
  { href: "/admin/epic/caixa", label: "Caixa de entrada" },
  { href: "/admin/epic/mentoria", label: "Mentoria" },
];

export default async function AdminEpicLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) return <AdminLogin configurado={adminConfigurado()} />;
  return (
    <div className="min-h-screen bg-papel lg:grid lg:grid-cols-[14rem_1fr]">
      <aside className="border-b border-linha bg-tinta px-5 py-5 text-papel lg:sticky lg:top-0 lg:h-screen lg:border-b-0">
        <Link href="/admin/epic" className="text-papel">
          <BrandLogo size="1.1rem" tagline={false} />
        </Link>
        <p className="mt-2 font-mono text-[11px] text-latao">
          admin 2.0 · {DB_SCHEMA === "v2" ? "produção" : DB_SCHEMA}
        </p>
        <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-1 lg:flex-col lg:gap-y-0.5">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded px-2 py-1.5 text-sm text-papel/80 hover:bg-papel/10 hover:text-papel">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-papel/10 pt-4 text-xs text-papel/50">
          <a href="/admin#marketing" className="hover:text-papel">Pixel e tags de marketing</a>
          <br />
          <Link href="/admin" className="hover:text-papel">Admin do site atual (Ciclo 1)</Link>
          <br />
          <Link href="/" className="hover:text-papel">Ver o site</Link>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
