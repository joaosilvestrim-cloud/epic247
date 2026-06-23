"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  STATUS_INFO,
  STATUS_ORDER,
  PRIORIDADE_INFO,
  diasAtePrazo,
  type Tarefa,
  type TarefaStatus,
  type TarefaPrioridade,
} from "@/lib/tarefas";

function hojeISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/* ════════════════════════ Analytics ════════════════════════ */
export function TarefasAnalytics({ tarefas }: { tarefas: Tarefa[] }) {
  const hoje = hojeISO();

  const porStatus = STATUS_ORDER.map((s) => ({
    status: s,
    qtd: tarefas.filter((t) => t.status === s).length,
  }));
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.status === "concluido").length;
  const pctConcluido = total ? Math.round((concluidas / total) * 100) : 0;

  const ativas = tarefas.filter((t) => t.status !== "concluido");
  const atrasadas = ativas.filter((t) => {
    const d = diasAtePrazo(t.prazo, hoje);
    return d !== null && d < 0;
  });
  const venceHoje = ativas.filter((t) => diasAtePrazo(t.prazo, hoje) === 0);
  const proximas = ativas.filter((t) => {
    const d = diasAtePrazo(t.prazo, hoje);
    return d !== null && d > 0 && d <= 7;
  });

  const porResp = agrupar(tarefas, (t) => t.responsavel || "Sem responsável");
  const porCat = agrupar(tarefas, (t) => t.categoria || "Sem categoria");

  return (
    <div className="space-y-6">
      {/* Cards de topo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardNum label="Total de tarefas" valor={total} cor="#182848" />
        <CardNum label="Concluídas" valor={`${pctConcluido}%`} sub={`${concluidas}/${total}`} cor="#10b981" />
        <CardNum label="Atrasadas" valor={atrasadas.length} cor="#f43f5e" />
        <CardNum label="Vencem em 7 dias" valor={proximas.length + venceHoje.length} cor="#c09840" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status */}
        <Bloco titulo="Por status">
          {porStatus.map(({ status, qtd }) => (
            <BarraLinha
              key={status}
              label={STATUS_INFO[status].label}
              valor={qtd}
              max={total}
              cor={STATUS_INFO[status].cor}
            />
          ))}
        </Bloco>

        {/* Prazos */}
        <Bloco titulo="Prazos (tarefas ativas)">
          <BarraLinha label="Atrasadas" valor={atrasadas.length} max={Math.max(1, ativas.length)} cor="#f43f5e" />
          <BarraLinha label="Vencem hoje" valor={venceHoje.length} max={Math.max(1, ativas.length)} cor="#c09840" />
          <BarraLinha label="Próximos 7 dias" valor={proximas.length} max={Math.max(1, ativas.length)} cor="#d8b765" />
        </Bloco>

        {/* Por responsável */}
        <Bloco titulo="Por responsável">
          {porResp.length === 0 && <Vazio />}
          {porResp.map((g) => (
            <BarraLinha key={g.chave} label={g.chave} valor={g.concluidas} max={g.total} cor="#182848" sufixo={`${g.concluidas}/${g.total}`} />
          ))}
        </Bloco>

        {/* Por categoria */}
        <Bloco titulo="Por categoria/área">
          {porCat.length === 0 && <Vazio />}
          {porCat.map((g) => (
            <BarraLinha key={g.chave} label={g.chave} valor={g.concluidas} max={g.total} cor="#c09840" sufixo={`${g.concluidas}/${g.total}`} />
          ))}
        </Bloco>
      </div>
    </div>
  );
}

function agrupar(tarefas: Tarefa[], chaveFn: (t: Tarefa) => string) {
  const map = new Map<string, { total: number; concluidas: number }>();
  for (const t of tarefas) {
    const k = chaveFn(t);
    const cur = map.get(k) || { total: 0, concluidas: 0 };
    cur.total += 1;
    if (t.status === "concluido") cur.concluidas += 1;
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
      <p className="mt-1 font-display text-3xl font-black" style={{ color: cor }}>
        {valor}
      </p>
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

function Vazio() {
  return <p className="text-sm text-navy/40">Sem dados ainda.</p>;
}

function BarraLinha({ label, valor, max, cor, sufixo }: { label: string; valor: number; max: number; cor: string; sufixo?: string }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 flex-shrink-0 truncate text-sm text-navy/80" title={label}>
        {label}
      </span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cor }} />
      </div>
      <span className="w-12 text-right text-sm font-semibold text-navy">{sufixo ?? valor}</span>
    </div>
  );
}

/* ════════════════════════ Gestão ════════════════════════ */
const VAZIA = {
  titulo: "",
  descricao: "",
  categoria: "",
  responsavel: "",
  status: "a_fazer" as TarefaStatus,
  prioridade: "media" as TarefaPrioridade,
  prazo: "",
};

export default function TarefasView({
  tarefas,
  tarefasReady,
}: {
  tarefas: Tarefa[];
  tarefasReady: boolean;
}) {
  const router = useRouter();
  const hoje = hojeISO();
  const [filtroStatus, setFiltroStatus] = useState<"todos" | TarefaStatus>("todos");
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    return tarefas.filter((t) => {
      if (filtroStatus !== "todos" && t.status !== filtroStatus) return false;
      if (busca) {
        const q = busca.toLowerCase();
        const alvo = `${t.titulo} ${t.responsavel ?? ""} ${t.categoria ?? ""}`.toLowerCase();
        if (!alvo.includes(q)) return false;
      }
      return true;
    });
  }, [tarefas, filtroStatus, busca]);

  async function mudarStatus(t: Tarefa, status: TarefaStatus) {
    setErro(null);
    const res = await fetch(`/api/admin/tarefas/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setErro("Falha ao atualizar status.");
    router.refresh();
  }

  async function excluir(t: Tarefa) {
    if (!confirm(`Excluir a tarefa "${t.titulo}"?`)) return;
    const res = await fetch(`/api/admin/tarefas/${t.id}`, { method: "DELETE" });
    if (!res.ok) setErro("Falha ao excluir.");
    router.refresh();
  }

  if (!tarefasReady) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
        A tabela <code>tarefas</code> ainda não existe no Supabase. Rode o SQL de{" "}
        <code>supabase/schema.sql</code> (seção Tarefas) e recarregue.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["todos", ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                filtroStatus === s
                  ? "bg-navy text-white"
                  : "border border-line/50 text-navy/70 hover:bg-cream"
              }`}
            >
              {s === "todos" ? "Todas" : STATUS_INFO[s].label}
            </button>
          ))}
        </div>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar..."
          className="min-w-[140px] flex-1 rounded-xl border border-line/50 px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button
          onClick={() => setCriando(true)}
          className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-navy-deep transition hover:brightness-110"
        >
          + Nova tarefa
        </button>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {/* Tabela */}
      <div className="overflow-x-auto rounded-2xl border border-line/40 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line/40 bg-cream/60 text-navy/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Tarefa</th>
              <th className="px-4 py-3 font-semibold">Responsável</th>
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 font-semibold">Prazo</th>
              <th className="px-4 py-3 font-semibold">Prioridade</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-navy/50">
                  Nenhuma tarefa. Crie a primeira ou importe a planilha.
                </td>
              </tr>
            )}
            {filtradas.map((t) => {
              const d = diasAtePrazo(t.prazo, hoje);
              const atrasada = d !== null && d < 0 && t.status !== "concluido";
              return (
                <tr key={t.id} className="border-b border-line/20 last:border-0 align-top">
                  <td className="px-4 py-3">
                    <select
                      value={t.status}
                      onChange={(e) => mudarStatus(t, e.target.value as TarefaStatus)}
                      className="rounded-lg border border-line/50 bg-white px-2 py-1 text-xs font-semibold outline-none"
                      style={{ color: STATUS_INFO[t.status].cor }}
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_INFO[s].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <p className={`font-medium ${t.status === "concluido" ? "text-navy/40 line-through" : "text-navy"}`}>
                      {t.titulo}
                    </p>
                    {t.descricao && (
                      <p className="mt-0.5 max-w-md text-xs text-navy/50">{t.descricao}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-navy/70">{t.responsavel || "—"}</td>
                  <td className="px-4 py-3 text-navy/70">{t.categoria || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {t.prazo ? (
                      <span className={atrasada ? "font-semibold text-red-600" : "text-navy/70"}>
                        {new Date(t.prazo + "T00:00:00").toLocaleDateString("pt-BR")}
                        {atrasada && " ⚠"}
                      </span>
                    ) : (
                      <span className="text-navy/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        color: PRIORIDADE_INFO[t.prioridade].cor,
                        backgroundColor: `${PRIORIDADE_INFO[t.prioridade].cor}1a`,
                      }}
                    >
                      {PRIORIDADE_INFO[t.prioridade].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button onClick={() => setEditando(t)} className="text-sm text-gold hover:underline">
                      Editar
                    </button>
                    <button onClick={() => excluir(t)} className="ml-3 text-sm text-red-500 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(criando || editando) && (
        <TarefaForm
          tarefa={editando}
          onClose={() => {
            setCriando(false);
            setEditando(null);
          }}
          onSaved={() => {
            setCriando(false);
            setEditando(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function TarefaForm({
  tarefa,
  onClose,
  onSaved,
}: {
  tarefa: Tarefa | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    titulo: tarefa?.titulo ?? VAZIA.titulo,
    descricao: tarefa?.descricao ?? "",
    categoria: tarefa?.categoria ?? "",
    responsavel: tarefa?.responsavel ?? "",
    status: tarefa?.status ?? VAZIA.status,
    prioridade: tarefa?.prioridade ?? VAZIA.prioridade,
    prazo: tarefa?.prazo ?? "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!form.titulo.trim()) {
      setErro("Informe o título.");
      return;
    }
    setSalvando(true);
    try {
      const url = tarefa ? `/api/admin/tarefas/${tarefa.id}` : "/api/admin/tarefas";
      const res = await fetch(url, {
        method: tarefa ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={salvar}
        className="mt-10 w-full max-w-lg space-y-3 rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="font-display text-xl font-bold text-navy">
          {tarefa ? "Editar tarefa" : "Nova tarefa"}
        </h3>

        <Campo label="Título">
          <input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} className="inp" autoFocus />
        </Campo>
        <Campo label="Descrição">
          <textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} rows={2} className="inp" />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Responsável">
            <input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} className="inp" />
          </Campo>
          <Campo label="Categoria">
            <input value={form.categoria} onChange={(e) => set("categoria", e.target.value)} className="inp" />
          </Campo>
          <Campo label="Status">
            <select value={form.status} onChange={(e) => set("status", e.target.value as TarefaStatus)} className="inp">
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{STATUS_INFO[s].label}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Prioridade">
            <select value={form.prioridade} onChange={(e) => set("prioridade", e.target.value as TarefaPrioridade)} className="inp">
              {(["baixa", "media", "alta"] as TarefaPrioridade[]).map((p) => (
                <option key={p} value={p}>{PRIORIDADE_INFO[p].label}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Prazo">
            <input type="date" value={form.prazo ?? ""} onChange={(e) => set("prazo", e.target.value)} className="inp" />
          </Campo>
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-line/50 px-4 py-2 text-sm">
            Cancelar
          </button>
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
