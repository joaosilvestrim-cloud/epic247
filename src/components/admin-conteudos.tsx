"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  STATUS_INFO,
  STATUS_ORDER,
  diasAteData,
  pendente,
  type Conteudo,
  type ConteudoStatus,
} from "@/lib/conteudos";

function hojeISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function fmtData(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

/* ════════════════ Analytics ════════════════ */
export function ConteudosAnalytics({ conteudos }: { conteudos: Conteudo[] }) {
  const hoje = hojeISO();
  const total = conteudos.length;
  const entregues = conteudos.filter((c) => c.status === "entregue").length;
  const pct = total ? Math.round((entregues / total) * 100) : 0;

  const ativos = conteudos.filter((c) => pendente(c.status));
  const atrasados = ativos.filter((c) => {
    const d = diasAteData(c.data, hoje);
    return d !== null && d < 0;
  });
  const venceHoje = ativos.filter((c) => diasAteData(c.data, hoje) === 0);
  const prox7 = ativos.filter((c) => {
    const d = diasAteData(c.data, hoje);
    return d !== null && d > 0 && d <= 7;
  });

  const porTipo = agrupar(conteudos, (c) => c.tipo || "Sem tipo");
  const porFormato = agrupar(conteudos, (c) => c.formato || "Sem formato");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardNum label="Total de conteúdos" valor={total} cor="#182848" />
        <CardNum label="Entregues" valor={`${pct}%`} sub={`${entregues}/${total}`} cor="#10b981" />
        <CardNum label="Atrasados" valor={atrasados.length} cor="#f43f5e" />
        <CardNum label="Próx. 7 dias" valor={prox7.length + venceHoje.length} cor="#c09840" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Bloco titulo="Por status">
          {STATUS_ORDER.map((s) => (
            <Barra
              key={s}
              label={STATUS_INFO[s].label}
              valor={conteudos.filter((c) => c.status === s).length}
              max={total}
              cor={STATUS_INFO[s].cor}
            />
          ))}
        </Bloco>

        <Bloco titulo="Prazos (conteúdos pendentes)">
          <Barra label="Atrasados" valor={atrasados.length} max={Math.max(1, ativos.length)} cor="#f43f5e" />
          <Barra label="Publicam hoje" valor={venceHoje.length} max={Math.max(1, ativos.length)} cor="#c09840" />
          <Barra label="Próximos 7 dias" valor={prox7.length} max={Math.max(1, ativos.length)} cor="#d8b765" />
        </Bloco>

        <Bloco titulo="Por tipo">
          {porTipo.map((g) => (
            <Barra key={g.chave} label={g.chave} valor={g.entregues} max={g.total} cor="#182848" sufixo={`${g.entregues}/${g.total}`} />
          ))}
        </Bloco>

        <Bloco titulo="Por formato">
          {porFormato.map((g) => (
            <Barra key={g.chave} label={g.chave} valor={g.entregues} max={g.total} cor="#c09840" sufixo={`${g.entregues}/${g.total}`} />
          ))}
        </Bloco>
      </div>
    </div>
  );
}

function agrupar(itens: Conteudo[], fn: (c: Conteudo) => string) {
  const map = new Map<string, { total: number; entregues: number }>();
  for (const c of itens) {
    const k = fn(c);
    const cur = map.get(k) || { total: 0, entregues: 0 };
    cur.total += 1;
    if (c.status === "entregue") cur.entregues += 1;
    map.set(k, cur);
  }
  return [...map.entries()]
    .map(([chave, v]) => ({ chave, ...v }))
    .sort((a, b) => b.total - a.total);
}

function CardNum({ label, valor, sub, cor }: { label: string; valor: number | string; sub?: string; cor: string }) {
  return (
    <div className="rounded-2xl border border-line/40 bg-white p-5">
      <p className="text-sm text-navy/60">{label}</p>
      <p className="mt-1 font-display text-3xl font-black" style={{ color: cor }}>{valor}</p>
      {sub && <p className="text-xs text-navy/50">{sub}</p>}
    </div>
  );
}
function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line/40 bg-white p-6">
      <h3 className="mb-4 font-display text-lg font-bold text-navy">{titulo}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Barra({ label, valor, max, cor, sufixo }: { label: string; valor: number; max: number; cor: string; sufixo?: string }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 flex-shrink-0 truncate text-sm text-navy/80" title={label}>{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cor }} />
      </div>
      <span className="w-12 text-right text-sm font-semibold text-navy">{sufixo ?? valor}</span>
    </div>
  );
}

/* ════════════════ Gestão ════════════════ */
export default function ConteudosView({
  conteudos,
  pronto,
}: {
  conteudos: Conteudo[];
  pronto: boolean;
}) {
  const router = useRouter();
  const hoje = hojeISO();
  const [filtroStatus, setFiltroStatus] = useState<"todos" | ConteudoStatus>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Conteudo | null>(null);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const tipos = useMemo(
    () => [...new Set(conteudos.map((c) => c.tipo).filter(Boolean) as string[])].sort(),
    [conteudos]
  );

  const filtrados = useMemo(() => {
    return conteudos.filter((c) => {
      if (filtroStatus !== "todos" && c.status !== filtroStatus) return false;
      if (filtroTipo !== "todos" && c.tipo !== filtroTipo) return false;
      if (busca) {
        const q = busca.toLowerCase();
        const alvo = `${c.nome} ${c.nomenclatura ?? ""} ${c.legenda ?? ""}`.toLowerCase();
        if (!alvo.includes(q)) return false;
      }
      return true;
    });
  }, [conteudos, filtroStatus, filtroTipo, busca]);

  async function mudarStatus(c: Conteudo, status: ConteudoStatus) {
    setErro(null);
    const res = await fetch(`/api/admin/conteudos/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setErro("Falha ao atualizar status.");
    router.refresh();
  }
  async function excluir(c: Conteudo) {
    if (!confirm(`Excluir "${c.nome}"?`)) return;
    const res = await fetch(`/api/admin/conteudos/${c.id}`, { method: "DELETE" });
    if (!res.ok) setErro("Falha ao excluir.");
    router.refresh();
  }

  if (!pronto) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
        A tabela <code>conteudos</code> ainda não existe. Rode o SQL de{" "}
        <code>supabase/conteudos.sql</code> (cria a tabela e importa a planilha) e recarregue.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["todos", ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                filtroStatus === s ? "bg-navy text-white" : "border border-line/50 text-navy/70 hover:bg-cream"
              }`}
            >
              {s === "todos" ? "Todos" : STATUS_INFO[s].label}
            </button>
          ))}
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-xl border border-line/50 px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="todos">Todos os tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar..."
          className="min-w-[140px] flex-1 rounded-xl border border-line/50 px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button onClick={() => setCriando(true)} className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-navy-deep transition hover:brightness-110">
          + Novo conteúdo
        </button>
      </div>

      <p className="text-sm text-navy/50">{filtrados.length} de {conteudos.length} conteúdos</p>
      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line/40 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line/40 bg-cream/60 text-navy/70">
            <tr>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Data</th>
              <th className="px-3 py-3 font-semibold">Tipo</th>
              <th className="px-3 py-3 font-semibold">Conteúdo</th>
              <th className="px-3 py-3 font-semibold">Link</th>
              <th className="px-3 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-navy/50">Nenhum conteúdo.</td></tr>
            )}
            {filtrados.map((c) => {
              const d = diasAteData(c.data, hoje);
              const atrasado = d !== null && d < 0 && pendente(c.status);
              return (
                <tr key={c.id} className="border-b border-line/20 align-top last:border-0">
                  <td className="px-3 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => mudarStatus(c, e.target.value as ConteudoStatus)}
                      className="rounded-lg border border-line/50 bg-white px-2 py-1 text-xs font-semibold outline-none"
                      style={{ color: STATUS_INFO[c.status].cor }}
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>{STATUS_INFO[s].label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={atrasado ? "font-semibold text-red-600" : "text-navy/70"}>
                      {fmtData(c.data)}{atrasado && " ⚠"}
                    </span>
                    <div className="text-xs text-navy/40">{[c.dia, c.horario].filter(Boolean).join(" ")}</div>
                  </td>
                  <td className="px-3 py-3 text-navy/70">
                    {c.tipo || "—"}
                    {c.formato && <div className="text-xs text-navy/40">{c.formato}</div>}
                  </td>
                  <td className="px-3 py-3">
                    {c.nomenclatura && <span className="text-xs font-semibold text-gold">{c.nomenclatura} · </span>}
                    <span className="font-medium text-navy">{c.nome}</span>
                  </td>
                  <td className="px-3 py-3">
                    {c.link ? (
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">abrir</a>
                    ) : <span className="text-navy/30">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <button onClick={() => setEditando(c)} className="text-sm text-gold hover:underline">Editar</button>
                    <button onClick={() => excluir(c)} className="ml-3 text-sm text-red-500 hover:underline">Excluir</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(criando || editando) && (
        <ConteudoForm
          conteudo={editando}
          onClose={() => { setCriando(false); setEditando(null); }}
          onSaved={() => { setCriando(false); setEditando(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

function ConteudoForm({
  conteudo,
  onClose,
  onSaved,
}: {
  conteudo: Conteudo | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    nome: conteudo?.nome ?? "",
    data: conteudo?.data ?? "",
    dia: conteudo?.dia ?? "",
    horario: conteudo?.horario ?? "",
    tipo: conteudo?.tipo ?? "",
    formato: conteudo?.formato ?? "",
    nomenclatura: conteudo?.nomenclatura ?? "",
    story_num: conteudo?.story_num ?? "",
    status: conteudo?.status ?? "a_produzir",
    link: conteudo?.link ?? "",
    legenda: conteudo?.legenda ?? "",
    hashtags: conteudo?.hashtags ?? "",
    notas: conteudo?.notas ?? "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!f.nome.trim()) { setErro("Informe o nome do conteúdo."); return; }
    setSalvando(true);
    try {
      const url = conteudo ? `/api/admin/conteudos/${conteudo.id}` : "/api/admin/conteudos";
      const res = await fetch(url, {
        method: conteudo ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? "Falha ao salvar.");
      }
      onSaved();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={salvar} className="my-8 w-full max-w-2xl space-y-3 rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="font-display text-xl font-bold text-navy">{conteudo ? "Editar conteúdo" : "Novo conteúdo"}</h3>
        <Campo label="Nome do conteúdo"><input value={f.nome} onChange={(e) => set("nome", e.target.value)} className="inp" autoFocus /></Campo>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Campo label="Nomenclatura"><input value={f.nomenclatura} onChange={(e) => set("nomenclatura", e.target.value)} className="inp" /></Campo>
          <Campo label="Data"><input type="date" value={f.data} onChange={(e) => set("data", e.target.value)} className="inp" /></Campo>
          <Campo label="Dia"><input value={f.dia} onChange={(e) => set("dia", e.target.value)} className="inp" /></Campo>
          <Campo label="Horário"><input value={f.horario} onChange={(e) => set("horario", e.target.value)} className="inp" /></Campo>
          <Campo label="Tipo"><input value={f.tipo} onChange={(e) => set("tipo", e.target.value)} className="inp" /></Campo>
          <Campo label="Formato"><input value={f.formato} onChange={(e) => set("formato", e.target.value)} className="inp" /></Campo>
          <Campo label="Story #"><input value={f.story_num} onChange={(e) => set("story_num", e.target.value)} className="inp" /></Campo>
          <Campo label="Status">
            <select value={f.status} onChange={(e) => set("status", e.target.value as ConteudoStatus)} className="inp">
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_INFO[s].label}</option>)}
            </select>
          </Campo>
        </div>
        <Campo label="Link do ativo (URL)"><input value={f.link} onChange={(e) => set("link", e.target.value)} className="inp" /></Campo>
        <Campo label="Legenda"><textarea value={f.legenda} onChange={(e) => set("legenda", e.target.value)} rows={4} className="inp" /></Campo>
        <Campo label="Hashtags"><input value={f.hashtags} onChange={(e) => set("hashtags", e.target.value)} className="inp" /></Campo>
        <Campo label="Notas"><input value={f.notas} onChange={(e) => set("notas", e.target.value)} className="inp" /></Campo>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-line/50 px-4 py-2 text-sm">Cancelar</button>
          <button type="submit" disabled={salvando} className="rounded-xl bg-gold px-5 py-2 text-sm font-bold text-navy-deep disabled:opacity-60">
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
        <style>{`.inp{width:100%;border:1px solid #d9d4c8;border-radius:0.6rem;padding:0.5rem 0.7rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#c09840}`}</style>
      </form>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/50">{label}</span>
      {children}
    </label>
  );
}
