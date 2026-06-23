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
const DIAS_ORDEM = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/* ════════════════ UI helpers ════════════════ */
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
      <span className="w-36 flex-shrink-0 truncate text-sm text-navy/80" title={label}>{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cor }} />
      </div>
      <span className="w-14 text-right text-sm font-semibold text-navy">{sufixo ?? valor}</span>
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
  return [...map.entries()].map(([chave, v]) => ({ chave, ...v }));
}

/* ════════════════ Resumo (Visão geral) ════════════════ */
export function ConteudosAnalytics({ conteudos }: { conteudos: Conteudo[] }) {
  const hoje = hojeISO();
  const total = conteudos.length;
  const entregues = conteudos.filter((c) => c.status === "entregue").length;
  const pct = total ? Math.round((entregues / total) * 100) : 0;
  const ativos = conteudos.filter((c) => pendente(c.status));
  const atrasados = ativos.filter((c) => { const d = diasAteData(c.data, hoje); return d !== null && d < 0; }).length;
  const prox7 = ativos.filter((c) => { const d = diasAteData(c.data, hoje); return d !== null && d >= 0 && d <= 7; }).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <CardNum label="Conteúdos" valor={total} cor="#182848" />
      <CardNum label="Entregues" valor={`${pct}%`} sub={`${entregues}/${total}`} cor="#10b981" />
      <CardNum label="Atrasados" valor={atrasados} cor="#f43f5e" />
      <CardNum label="Próx. 7 dias" valor={prox7} cor="#c09840" />
    </div>
  );
}

/* ════════════════ Dashboards gerenciais ════════════════ */
export function ConteudosDashboards({ conteudos }: { conteudos: Conteudo[] }) {
  const hoje = hojeISO();
  const total = conteudos.length;
  const cont = (s: ConteudoStatus) => conteudos.filter((c) => c.status === s).length;
  const entregues = cont("entregue");
  const pct = total ? Math.round((entregues / total) * 100) : 0;

  const ativos = conteudos.filter((c) => pendente(c.status));
  const atrasados = ativos
    .filter((c) => { const d = diasAteData(c.data, hoje); return d !== null && d < 0; })
    .sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const proximos = ativos
    .filter((c) => { const d = diasAteData(c.data, hoje); return d !== null && d >= 0; })
    .sort((a, b) => (a.data || "").localeCompare(b.data || ""));

  const porTipo = agrupar(conteudos, (c) => c.tipo || "Sem tipo").sort((a, b) => b.total - a.total);
  const porFormato = agrupar(conteudos, (c) => c.formato || "Sem formato").sort((a, b) => b.total - a.total);

  // por mês (cronograma)
  const porMes = useMemo(() => {
    const map = new Map<string, { total: number; entregues: number }>();
    for (const c of conteudos) {
      if (!c.data) continue;
      const k = c.data.slice(0, 7);
      const cur = map.get(k) || { total: 0, entregues: 0 };
      cur.total += 1;
      if (c.status === "entregue") cur.entregues += 1;
      map.set(k, cur);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [conteudos]);
  const maxMes = Math.max(1, ...porMes.map(([, v]) => v.total));

  const porDia = DIAS_ORDEM.map((d) => ({ dia: d, qtd: conteudos.filter((c) => (c.dia || "").trim() === d).length }));
  const maxDia = Math.max(1, ...porDia.map((d) => d.qtd));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <CardNum label="Total" valor={total} cor="#182848" />
        <CardNum label="Entregues" valor={`${pct}%`} sub={`${entregues}/${total}`} cor="#10b981" />
        <CardNum label="A produzir" valor={cont("a_produzir")} cor="#94a3b8" />
        <CardNum label="Atrasados" valor={atrasados.length} cor="#f43f5e" />
        <CardNum label="Próx. 7 dias" valor={proximos.filter((c) => (diasAteData(c.data, hoje) ?? 99) <= 7).length} cor="#c09840" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funil de produção */}
        <Bloco titulo="Funil de produção">
          <Barra label="A produzir" valor={cont("a_produzir")} max={total} cor="#94a3b8" />
          <Barra label="Validar" valor={cont("validar")} max={total} cor="#c09840" />
          <Barra label="Entregue" valor={cont("entregue")} max={total} cor="#10b981" />
          <Barra label="Repost" valor={cont("repost")} max={total} cor="#6366f1" />
        </Bloco>

        {/* Progresso geral */}
        <Bloco titulo="Progresso de entrega">
          <div className="flex items-center justify-center py-2">
            <div className="text-center">
              <p className="font-display text-5xl font-black text-emerald-500">{pct}%</p>
              <p className="mt-1 text-sm text-navy/60">{entregues} de {total} entregues</p>
            </div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-cream">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
          </div>
        </Bloco>

        {/* Por tipo */}
        <Bloco titulo="Por tipo de conteúdo">
          {porTipo.map((g) => (
            <Barra key={g.chave} label={g.chave} valor={g.total} max={total} cor="#182848" />
          ))}
        </Bloco>

        {/* Por formato */}
        <Bloco titulo="Por formato">
          {porFormato.slice(0, 8).map((g) => (
            <Barra key={g.chave} label={g.chave} valor={g.total} max={total} cor="#c09840" />
          ))}
        </Bloco>

        {/* Cronograma por mês */}
        <Bloco titulo="Cronograma (conteúdos por mês)">
          {porMes.length === 0 && <p className="text-sm text-navy/40">Sem datas.</p>}
          {porMes.map(([k, v]) => {
            const [y, mo] = k.split("-");
            const label = `${MESES[+mo - 1]}/${y.slice(2)}`;
            return (
              <div key={k}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-navy">{label}</span>
                  <span className="text-navy/50">{v.entregues}/{v.total} entregues</span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-cream">
                  <div className="h-full bg-emerald-500" style={{ width: `${(v.entregues / maxMes) * 100}%` }} />
                  <div className="h-full bg-gold/60" style={{ width: `${((v.total - v.entregues) / maxMes) * 100}%` }} />
                </div>
              </div>
            );
          })}
          <p className="pt-1 text-xs text-navy/40">
            <span className="text-emerald-500">■</span> entregue ·{" "}
            <span className="text-gold">■</span> pendente
          </p>
        </Bloco>

        {/* Por dia da semana */}
        <Bloco titulo="Por dia da semana">
          {porDia.map((d) => (
            <Barra key={d.dia} label={d.dia} valor={d.qtd} max={maxDia} cor="#6366f1" />
          ))}
        </Bloco>
      </div>

      {/* Listas de prazos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Bloco titulo={`Atrasados (${atrasados.length})`}>
          {atrasados.length === 0 && <p className="text-sm text-navy/40">Nada atrasado. 🎉</p>}
          {atrasados.slice(0, 8).map((c) => (
            <ItemPrazo key={c.id} c={c} hoje={hoje} />
          ))}
        </Bloco>
        <Bloco titulo="Próximos a publicar">
          {proximos.length === 0 && <p className="text-sm text-navy/40">Nada agendado.</p>}
          {proximos.slice(0, 8).map((c) => (
            <ItemPrazo key={c.id} c={c} hoje={hoje} />
          ))}
        </Bloco>
      </div>
    </div>
  );
}

function ItemPrazo({ c, hoje }: { c: Conteudo; hoje: string }) {
  const d = diasAteData(c.data, hoje);
  const atrasado = d !== null && d < 0;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/20 pb-2 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-navy" title={c.nome}>
          {c.nomenclatura ? `${c.nomenclatura} · ` : ""}{c.nome}
        </p>
        <p className="text-xs text-navy/50">{c.tipo || ""} · {STATUS_INFO[c.status].label}</p>
      </div>
      <span className={`whitespace-nowrap text-sm font-semibold ${atrasado ? "text-red-600" : "text-navy/70"}`}>
        {fmtData(c.data)}{atrasado ? " ⚠" : ""}
      </span>
    </div>
  );
}

/* ════════════════ Calendário (Lista + Dashboards) ════════════════ */
export default function ConteudosView({
  conteudos,
  pronto,
}: {
  conteudos: Conteudo[];
  pronto: boolean;
}) {
  const [sub, setSub] = useState<"lista" | "dashboards">("lista");

  if (!pronto) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
        A tabela <code>conteudos</code> ainda não existe (ou falta a coluna <code>semana</code>).
        Rode o SQL indicado e recarregue.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-xl border border-line/50 bg-white p-1">
        {([["lista", "Lista"], ["dashboards", "Dashboards"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              sub === id ? "bg-navy text-white" : "text-navy/60 hover:text-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === "lista" ? <Lista conteudos={conteudos} /> : <ConteudosDashboards conteudos={conteudos} />}
    </div>
  );
}

function Lista({ conteudos }: { conteudos: Conteudo[] }) {
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

  const Trunc = ({ v, w = 200 }: { v: string | null; w?: number }) =>
    v ? (
      <div className="truncate text-navy/70" style={{ maxWidth: w }} title={v}>{v}</div>
    ) : (
      <span className="text-navy/30">—</span>
    );

  return (
    <div className="space-y-4">
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
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="rounded-xl border border-line/50 px-3 py-2 text-sm outline-none focus:border-gold">
          <option value="todos">Todos os tipos</option>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="min-w-[140px] flex-1 rounded-xl border border-line/50 px-3 py-2 text-sm outline-none focus:border-gold" />
        <button onClick={() => setCriando(true)} className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-navy-deep transition hover:brightness-110">+ Novo</button>
      </div>

      <p className="text-sm text-navy/50">{filtrados.length} de {conteudos.length} conteúdos</p>
      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line/40 bg-white">
        <table className="w-full min-w-[1400px] text-left text-sm">
          <thead className="border-b border-line/40 bg-cream/60 text-navy/70">
            <tr>
              {["Semana","Data","Dia","Horário","Tipo","Formato","Nomenclatura","Nome do conteúdo","Story#","Status","Link","Legenda","Hashtags","Notas",""].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={15} className="px-4 py-10 text-center text-navy/50">Nenhum conteúdo.</td></tr>
            )}
            {filtrados.map((c) => {
              const d = diasAteData(c.data, hoje);
              const atrasado = d !== null && d < 0 && pendente(c.status);
              return (
                <tr key={c.id} className="border-b border-line/20 align-top last:border-0">
                  <td className="px-3 py-3 text-navy/70">{c.semana || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={atrasado ? "font-semibold text-red-600" : "text-navy/70"}>{fmtData(c.data)}{atrasado && " ⚠"}</span>
                  </td>
                  <td className="px-3 py-3 text-navy/70">{c.dia || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-navy/70">{c.horario || "—"}</td>
                  <td className="px-3 py-3 text-navy/70">{c.tipo || "—"}</td>
                  <td className="px-3 py-3 text-navy/70">{c.formato || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-gold">{c.nomenclatura || "—"}</td>
                  <td className="px-3 py-3"><div className="min-w-[200px] font-medium text-navy">{c.nome}</div></td>
                  <td className="px-3 py-3 text-navy/70">{c.story_num || "—"}</td>
                  <td className="px-3 py-3">
                    <select value={c.status} onChange={(e) => mudarStatus(c, e.target.value as ConteudoStatus)} className="rounded-lg border border-line/50 bg-white px-2 py-1 text-xs font-semibold outline-none" style={{ color: STATUS_INFO[c.status].cor }}>
                      {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_INFO[s].label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3">{c.link ? <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">abrir</a> : <span className="text-navy/30">—</span>}</td>
                  <td className="px-3 py-3"><Trunc v={c.legenda} w={260} /></td>
                  <td className="px-3 py-3"><Trunc v={c.hashtags} w={180} /></td>
                  <td className="px-3 py-3"><Trunc v={c.notas} w={160} /></td>
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
    semana: conteudo?.semana ?? "",
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
      if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.error ?? "Falha ao salvar."); }
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
          <Campo label="Semana"><input value={f.semana} onChange={(e) => set("semana", e.target.value)} className="inp" /></Campo>
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
          <button type="submit" disabled={salvando} className="rounded-xl bg-gold px-5 py-2 text-sm font-bold text-navy-deep disabled:opacity-60">{salvando ? "Salvando..." : "Salvar"}</button>
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
