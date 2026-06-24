"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";
import {
  STATUS_INFO,
  STATUS_ORDER,
  diasAteData,
  pendente,
  type Anexo,
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
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
function fmtDataLonga(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
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
      {children}
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

/** Donut/rosca SVG com legenda. */
function Donut({
  segs,
  size = 168,
  thickness = 24,
  centerTop,
  centerBottom,
}: {
  segs: { label: string; valor: number; cor: string }[];
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerBottom?: string;
}) {
  const total = segs.reduce((a, s) => a + s.valor, 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1ece2" strokeWidth={thickness} />
          {segs.map((s, i) => {
            const len = (s.valor / total) * C;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.cor}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-black text-navy">{centerTop ?? total}</span>
          {centerBottom && <span className="text-[11px] text-navy/50">{centerBottom}</span>}
        </div>
      </div>
      <ul className="min-w-[120px] flex-1 space-y-1.5">
        {segs.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-navy/80">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.cor }} />
              {s.label}
            </span>
            <span className="font-semibold text-navy">
              {s.valor}
              <span className="ml-1 text-xs font-normal text-navy/40">
                {Math.round((s.valor / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
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

const PALETA = ["#182848", "#c09840", "#10b981", "#6366f1", "#f43f5e", "#0ea5e9", "#f59e0b", "#ec4899", "#14b8a6", "#a855f7"];
const MESES_LONGOS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const pad2 = (n: number) => String(n).padStart(2, "0");

/* ════════════════ Calendário editorial (grade mensal) ════════════════ */
function CalendarioEditorial({ conteudos }: { conteudos: Conteudo[] }) {
  const porData = useMemo(() => {
    const m = new Map<string, Conteudo[]>();
    for (const c of conteudos) {
      if (!c.data) continue;
      if (!m.has(c.data)) m.set(c.data, []);
      m.get(c.data)!.push(c);
    }
    // Ordena os posts de cada dia por horário (sem horário vai para o fim).
    const hKey = (c: Conteudo) => (c.horario && c.horario.trim() ? c.horario.trim() : "99:99");
    for (const arr of m.values()) {
      arr.sort((a, b) => hKey(a).localeCompare(hKey(b)) || (a.ordem ?? 0) - (b.ordem ?? 0));
    }
    return m;
  }, [conteudos]);

  const meses = useMemo(
    () => [...new Set(conteudos.filter((c) => c.data).map((c) => c.data!.slice(0, 7)))].sort(),
    [conteudos]
  );

  const [mes, setMes] = useState(() => {
    const hoje = `${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}`;
    return meses.includes(hoje) ? hoje : meses[0] ?? hoje;
  });
  const [diaSel, setDiaSel] = useState<string | null>(null);

  const [y, mo] = mes.split("-").map(Number);
  const inicioOffset = new Date(y, mo - 1, 1).getDay(); // 0=Dom
  const diasNoMes = new Date(y, mo, 0).getDate();

  const celulas: (string | null)[] = [];
  for (let i = 0; i < inicioOffset; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(`${y}-${pad2(mo)}-${pad2(d)}`);
  while (celulas.length % 7 !== 0) celulas.push(null);

  function mover(delta: number) {
    const dt = new Date(y, mo - 1 + delta, 1);
    setMes(`${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}`);
    setDiaSel(null);
  }

  const hojeStr = `${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}-${pad2(new Date().getDate())}`;
  const totalMes = celulas.filter((c) => c && porData.has(c)).reduce((a, c) => a + (porData.get(c!)?.length ?? 0), 0);
  const selPosts = diaSel ? porData.get(diaSel) ?? [] : [];

  return (
    <div className="rounded-2xl border border-line/40 bg-white p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-navy">
          Calendário editorial
          <span className="ml-2 text-sm font-normal text-navy/50">{totalMes} posts no mês</span>
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => mover(-1)} className="rounded-lg border border-line/50 px-3 py-1.5 text-sm hover:bg-cream">‹</button>
          <span className="min-w-[140px] text-center font-semibold text-navy">{MESES_LONGOS[mo - 1]} {y}</span>
          <button onClick={() => mover(1)} className="rounded-lg border border-line/50 px-3 py-1.5 text-sm hover:bg-cream">›</button>
          {meses.length > 0 && (
            <select value={mes} onChange={(e) => { setMes(e.target.value); setDiaSel(null); }} className="rounded-lg border border-line/50 px-2 py-1.5 text-sm outline-none focus:border-gold">
              {meses.map((m) => { const [yy, mm] = m.split("-"); return <option key={m} value={m}>{MESES_LONGOS[+mm - 1].slice(0, 3)}/{yy.slice(2)}</option>; })}
            </select>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 gap-1.5">
            {DOW.map((d) => (
              <div key={d} className="pb-1 text-center text-xs font-semibold uppercase tracking-wide text-navy/40">{d}</div>
            ))}
            {celulas.map((cell, i) => {
              if (!cell) return <div key={i} className="min-h-[92px] rounded-lg bg-cream/30" />;
              const posts = porData.get(cell) ?? [];
              const diaNum = +cell.slice(8, 10);
              const hoje = cell === hojeStr;
              return (
                <button
                  key={i}
                  onClick={() => posts.length && setDiaSel(diaSel === cell ? null : cell)}
                  className={`min-h-[92px] rounded-lg border p-1.5 text-left align-top transition ${
                    diaSel === cell ? "border-gold ring-1 ring-gold" : "border-line/30"
                  } ${posts.length ? "bg-white hover:border-gold/60" : "bg-cream/20"}`}
                >
                  <div className={`mb-1 text-xs font-bold ${hoje ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white" : "text-navy/60"}`}>
                    {diaNum}
                  </div>
                  <div className="space-y-1">
                    {posts.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        title={`${p.horario ? p.horario + " · " : ""}${p.nome} (${STATUS_INFO[p.status].label})`}
                        className="truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight text-white"
                        style={{ backgroundColor: STATUS_INFO[p.status].cor }}
                      >
                        {p.nomenclatura || p.tipo || p.nome}
                      </div>
                    ))}
                    {posts.length > 3 && <div className="px-1 text-[10px] font-semibold text-navy/50">+{posts.length - 3} mais</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-3 flex flex-wrap gap-3">
        {STATUS_ORDER.map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-xs text-navy/60">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: STATUS_INFO[s].cor }} />
            {STATUS_INFO[s].label}
          </span>
        ))}
      </div>

      {/* Detalhe do dia selecionado */}
      {diaSel && selPosts.length > 0 && (
        <div className="mt-4 rounded-xl border border-line/40 bg-cream/30 p-4">
          <p className="mb-2 font-semibold text-navy">
            {new Date(diaSel + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} · {selPosts.length} post(s)
          </p>
          <div className="space-y-2">
            {selPosts.map((p) => (
              <div key={p.id} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: STATUS_INFO[p.status].cor }} />
                <div>
                  <span className="font-medium text-navy">{p.nomenclatura ? `${p.nomenclatura} · ` : ""}{p.nome}</span>
                  <span className="ml-2 text-xs text-navy/50">{[p.horario, p.tipo, STATUS_INFO[p.status].label].filter(Boolean).join(" · ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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
  const atrasados = ativos.filter((c) => { const d = diasAteData(c.data, hoje); return d !== null && d < 0; }).sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const proximos = ativos.filter((c) => { const d = diasAteData(c.data, hoje); return d !== null && d >= 0; }).sort((a, b) => (a.data || "").localeCompare(b.data || ""));

  const porTipo = agrupar(conteudos, (c) => c.tipo || "Sem tipo").sort((a, b) => b.total - a.total);
  const porFormato = agrupar(conteudos, (c) => c.formato || "Sem formato").sort((a, b) => b.total - a.total);

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

  const statusSegs = STATUS_ORDER.map((s) => ({ label: STATUS_INFO[s].label, valor: cont(s), cor: STATUS_INFO[s].cor }));
  const tipoSegs = porTipo.map((g, i) => ({ label: g.chave, valor: g.total, cor: PALETA[i % PALETA.length] }));

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

      {/* Calendário editorial */}
      <CalendarioEditorial conteudos={conteudos} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status — donut */}
        <Bloco titulo="Distribuição por status">
          <Donut segs={statusSegs} centerTop={String(total)} centerBottom="conteúdos" />
        </Bloco>

        {/* Progresso — anel */}
        <Bloco titulo="Progresso de entrega">
          <Donut
            segs={[
              { label: "Entregue", valor: entregues, cor: "#10b981" },
              { label: "Pendente", valor: total - entregues, cor: "#e5e1d6" },
            ]}
            centerTop={`${pct}%`}
            centerBottom="entregue"
          />
        </Bloco>

        {/* Tipo — donut */}
        <Bloco titulo="Por tipo de conteúdo">
          <Donut segs={tipoSegs} centerTop={String(total)} centerBottom="total" />
        </Bloco>

        {/* Funil — barras */}
        <Bloco titulo="Funil de produção">
          <div className="space-y-3">
            <Barra label="A produzir" valor={cont("a_produzir")} max={total} cor="#94a3b8" />
            <Barra label="Validar" valor={cont("validar")} max={total} cor="#c09840" />
            <Barra label="Entregue" valor={cont("entregue")} max={total} cor="#10b981" />
            <Barra label="Repost" valor={cont("repost")} max={total} cor="#6366f1" />
          </div>
        </Bloco>

        {/* Formato — barras */}
        <Bloco titulo="Por formato">
          <div className="space-y-3">
            {porFormato.slice(0, 8).map((g) => (
              <Barra key={g.chave} label={g.chave} valor={g.total} max={total} cor="#c09840" />
            ))}
          </div>
        </Bloco>

        {/* Dia da semana — barras */}
        <Bloco titulo="Por dia da semana">
          <div className="space-y-3">
            {porDia.map((d) => (
              <Barra key={d.dia} label={d.dia} valor={d.qtd} max={maxDia} cor="#6366f1" />
            ))}
          </div>
        </Bloco>
      </div>

      {/* Cronograma — largura total */}
      <Bloco titulo="Cronograma (conteúdos por mês)">
        <div className="space-y-3">
          {porMes.length === 0 && <p className="text-sm text-navy/40">Sem datas.</p>}
          {porMes.map(([k, v]) => {
            const [y, mo] = k.split("-");
            return (
              <div key={k}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-navy">{MESES[+mo - 1]}/{y.slice(2)}</span>
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
            <span className="text-emerald-500">■</span> entregue · <span className="text-gold">■</span> pendente
          </p>
        </div>
      </Bloco>

      {/* Listas de prazos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Bloco titulo={`Atrasados (${atrasados.length})`}>
          <div className="space-y-2">
            {atrasados.length === 0 && <p className="text-sm text-navy/40">Nada atrasado. 🎉</p>}
            {atrasados.slice(0, 8).map((c) => <ItemPrazo key={c.id} c={c} hoje={hoje} />)}
          </div>
        </Bloco>
        <Bloco titulo="Próximos a publicar">
          <div className="space-y-2">
            {proximos.length === 0 && <p className="text-sm text-navy/40">Nada agendado.</p>}
            {proximos.slice(0, 8).map((c) => <ItemPrazo key={c.id} c={c} hoje={hoje} />)}
          </div>
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
export default function ConteudosView({ conteudos, pronto }: { conteudos: Conteudo[]; pronto: boolean }) {
  const [sub, setSub] = useState<"lista" | "dashboards">("lista");
  if (!pronto) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
        A tabela <code>conteudos</code> ainda não existe. Rode o SQL indicado e recarregue.
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
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${sub === id ? "bg-navy text-white" : "text-navy/60 hover:text-navy"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {sub === "lista" ? <Lista conteudos={conteudos} /> : <ConteudosDashboards conteudos={conteudos} />}
    </div>
  );
}

/* ════════════════ Lista (linhas expansíveis) ════════════════ */
function Lista({ conteudos }: { conteudos: Conteudo[] }) {
  const router = useRouter();
  const hoje = hojeISO();
  const [filtroStatus, setFiltroStatus] = useState<"todos" | ConteudoStatus>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);
  const [editando, setEditando] = useState<Conteudo | null>(null);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const tipos = useMemo(() => [...new Set(conteudos.map((c) => c.tipo).filter(Boolean) as string[])].sort(), [conteudos]);
  const filtrados = useMemo(() => {
    const dKey = (c: Conteudo) => (c.data && c.data.trim() ? c.data.trim() : "9999-99-99");
    const hKey = (c: Conteudo) => (c.horario && c.horario.trim() ? c.horario.trim() : "99:99");
    return conteudos
      .filter((c) => {
        if (filtroStatus !== "todos" && c.status !== filtroStatus) return false;
        if (filtroTipo !== "todos" && c.tipo !== filtroTipo) return false;
        if (busca) {
          const q = busca.toLowerCase();
          if (!`${c.nome} ${c.nomenclatura ?? ""} ${c.legenda ?? ""} ${c.hashtags ?? ""}`.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          dKey(a).localeCompare(dKey(b)) ||
          hKey(a).localeCompare(hKey(b)) ||
          (a.ordem ?? 0) - (b.ordem ?? 0)
      );
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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(["todos", ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${filtroStatus === s ? "bg-navy text-white" : "border border-line/50 text-navy/70 hover:bg-cream"}`}
            >
              {s === "todos" ? "Todos" : STATUS_INFO[s].label}
            </button>
          ))}
        </div>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="rounded-xl border border-line/50 px-3 py-2 text-sm outline-none focus:border-gold">
          <option value="todos">Todos os tipos</option>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome, legenda, hashtag..." className="min-w-[160px] flex-1 rounded-xl border border-line/50 px-3 py-2 text-sm outline-none focus:border-gold" />
        <button onClick={() => setCriando(true)} className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-navy-deep transition hover:brightness-110">+ Novo</button>
      </div>

      <p className="text-sm text-navy/50">{filtrados.length} de {conteudos.length} conteúdos</p>
      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="divide-y divide-line/30 overflow-hidden rounded-2xl border border-line/40 bg-white">
        {filtrados.length === 0 && <p className="px-4 py-10 text-center text-navy/50">Nenhum conteúdo.</p>}
        {filtrados.map((c) => {
          const d = diasAteData(c.data, hoje);
          const atrasado = d !== null && d < 0 && pendente(c.status);
          const open = aberto === c.id;
          return (
            <div key={c.id}>
              {/* Linha principal */}
              <div
                onClick={() => setAberto(open ? null : c.id)}
                className="flex cursor-pointer items-center gap-3 px-3 py-3 transition hover:bg-cream/40 sm:px-4"
              >
                {/* data */}
                <div className="w-12 flex-shrink-0 text-center">
                  <div className={`text-sm font-bold ${atrasado ? "text-red-600" : "text-navy"}`}>{fmtData(c.data)}</div>
                  <div className="text-[10px] uppercase text-navy/40">{c.dia || ""}</div>
                </div>
                {/* nome */}
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium ${c.status === "entregue" ? "text-navy/50" : "text-navy"}`}>
                    {c.nomenclatura && <span className="font-bold text-gold">{c.nomenclatura} · </span>}
                    {c.nome}
                  </p>
                  <p className="truncate text-xs text-navy/50">
                    {[c.tipo, c.formato, c.horario].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                {/* indicador de anexos */}
                {(c.anexos?.length ?? 0) > 0 && (
                  <span
                    title={`${c.anexos!.length} anexo(s)`}
                    className="flex flex-shrink-0 items-center gap-0.5 rounded-full bg-navy/5 px-2 py-0.5 text-xs font-semibold text-navy/60"
                  >
                    📎 {c.anexos!.length}
                  </span>
                )}
                {/* status inline */}
                <select
                  value={c.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => mudarStatus(c, e.target.value as ConteudoStatus)}
                  className="flex-shrink-0 rounded-lg border border-line/50 bg-white px-2 py-1 text-xs font-semibold outline-none"
                  style={{ color: STATUS_INFO[c.status].cor }}
                >
                  {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_INFO[s].label}</option>)}
                </select>
                <span className={`flex-shrink-0 text-navy/30 transition ${open ? "rotate-180" : ""}`}>⌄</span>
              </div>

              {/* Painel expandido */}
              {open && (
                <div className="bg-cream/30 px-4 pb-4 pt-1 text-sm sm:px-6">
                  <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                    <Detalhe rotulo="Semana" valor={c.semana} />
                    <Detalhe rotulo="Data" valor={fmtDataLonga(c.data)} />
                    <Detalhe rotulo="Dia / Horário" valor={[c.dia, c.horario].filter(Boolean).join(" ") || "—"} />
                    <Detalhe rotulo="Tipo" valor={c.tipo} />
                    <Detalhe rotulo="Formato" valor={c.formato} />
                    <Detalhe rotulo="Story #" valor={c.story_num} />
                  </div>

                  {c.link && (
                    <p className="mt-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-navy/50">Link: </span>
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="break-all text-gold hover:underline">{c.link}</a>
                    </p>
                  )}

                  {c.legenda && <BlocoTexto rotulo="Legenda" valor={c.legenda} />}
                  {c.hashtags && <BlocoTexto rotulo="Hashtags" valor={c.hashtags} />}
                  {c.notas && <BlocoTexto rotulo="Notas" valor={c.notas} />}

                  <AnexosBox conteudo={c} onChange={() => router.refresh()} />

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setEditando(c)} className="rounded-lg bg-navy px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-125">Editar</button>
                    <button onClick={() => excluir(c)} className="rounded-lg border border-red-300 px-4 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">Excluir</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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

function formatarTamanho(b?: number) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function AnexosBox({ conteudo, onChange }: { conteudo: Conteudo; onChange: () => void }) {
  const anexos: Anexo[] = conteudo.anexos ?? [];
  const [enviando, setEnviando] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setErro(null);
    setEnviando(true);
    try {
      const supabase = getBrowserClient();
      const novos: Anexo[] = [...anexos];
      for (const file of files) {
        setStatus(`Enviando ${file.name}...`);
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `conteudos/${conteudo.id}/${Date.now()}-${safe}`;
        const r = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        if (!r.ok) {
          const d = await r.json().catch(() => null);
          throw new Error(d?.error ?? "Falha ao preparar upload.");
        }
        const { token, path: signedPath, publicUrl } = await r.json();
        const { error } = await supabase.storage.from("assets").uploadToSignedUrl(signedPath, token, file);
        if (error) throw new Error(error.message);
        novos.push({ nome: file.name, url: publicUrl, path: signedPath, tamanho: file.size });
      }
      setStatus("Salvando...");
      const s = await fetch(`/api/admin/conteudos/${conteudo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anexos: novos }),
      });
      if (!s.ok) throw new Error("Falha ao salvar anexos.");
      setStatus(null);
      onChange();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro no upload.");
      setStatus(null);
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  async function remover(a: Anexo) {
    if (!confirm(`Remover "${a.nome}"?`)) return;
    setErro(null);
    try {
      const novos = anexos.filter((x) => x.path !== a.path);
      await fetch("/api/admin/conteudos/" + conteudo.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anexos: novos }),
      });
      await fetch("/api/admin/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: a.path }),
      }).catch(() => {});
      onChange();
    } catch {
      setErro("Falha ao remover.");
    }
  }

  function ehImagem(a: Anexo) {
    return /\.(png|jpe?g|gif|webp|avif)$/i.test(a.nome);
  }

  return (
    <div className="mt-4">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy/50">
          Anexos {anexos.length > 0 && `(${anexos.length})`}
        </span>
      </div>

      {anexos.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {anexos.map((a) => (
            <div key={a.path} className="flex items-center gap-2 rounded-lg border border-line/40 bg-white p-2">
              {ehImagem(a) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.url} alt={a.nome} className="h-12 w-12 flex-shrink-0 rounded object-cover" />
              ) : (
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-cream text-xl">📄</span>
              )}
              <div className="min-w-0 max-w-[160px]">
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium text-navy hover:text-gold" title={a.nome}>
                  {a.nome}
                </a>
                <span className="text-xs text-navy/40">{formatarTamanho(a.tamanho)}</span>
              </div>
              <button onClick={() => remover(a)} className="flex-shrink-0 text-sm text-red-500 hover:text-red-700" title="Remover">✕</button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line bg-white px-4 py-2 text-sm font-medium text-navy/70 transition hover:border-gold hover:text-navy">
        <span>＋ Enviar arquivo</span>
        <input type="file" multiple onChange={enviar} disabled={enviando} className="hidden" />
      </label>
      {status && <span className="ml-3 text-sm text-gold">{status}</span>}
      {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}
    </div>
  );
}

function Detalhe({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-navy/50">{rotulo}: </span>
      <span className="text-navy/80">{valor || "—"}</span>
    </div>
  );
}

function BlocoTexto({ rotulo, valor }: { rotulo: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy/50">{rotulo}</span>
        <button onClick={copiar} className="text-xs text-gold hover:underline">{copiado ? "copiado!" : "copiar"}</button>
      </div>
      <p className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-line/40 bg-white p-3 text-navy/80">{valor}</p>
    </div>
  );
}

/* ════════════════ Form ════════════════ */
function ConteudoForm({ conteudo, onClose, onSaved }: { conteudo: Conteudo | null; onClose: () => void; onSaved: () => void }) {
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
      const res = await fetch(url, { method: conteudo ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
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
