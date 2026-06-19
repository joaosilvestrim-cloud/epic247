import Link from "next/link";
import { DRENOS_POR_HIERARQUIA } from "@/lib/drenos";

const CHECKOUT_URL = "#oferta"; // Troque pela URL real do checkout (ex.: Hotmart/Kiwify).

function CTAButton({
  href = CHECKOUT_URL,
  children,
  className = "",
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl bg-epic-amber px-8 py-4 text-lg font-bold text-epic-dark shadow-lg transition hover:brightness-110 hover:shadow-xl ${className}`}
    >
      {children}
    </Link>
  );
}

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      {/* ───────────────── Bloco 1: Hero ───────────────── */}
      <section className="bg-epic-dark px-6 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-block rounded-full border border-epic-accent/40 px-4 py-1 text-sm font-medium text-epic-accent">
            EPIC247 · Módulo Energia
          </span>
          <h1 className="text-balance text-3xl font-extrabold leading-tight sm:text-5xl">
            Você sabe muito, planeja bem, e mesmo assim não sai do lugar.
            <span className="mt-3 block text-epic-accent">
              Não é falta de disciplina. É falta de combustível.
            </span>
          </h1>

          {/* VSL */}
          <div className="mx-auto mt-10 flex aspect-video max-w-2xl items-center justify-center rounded-2xl border border-white/10 bg-black/40">
            <div className="text-center text-white/50">
              <div className="mb-2 text-5xl">▶</div>
              <p className="text-sm">VSL · 9 a 11 minutos</p>
              <p className="text-xs text-white/30">(incorpore aqui seu player de vídeo)</p>
            </div>
          </div>

          <div className="mt-10">
            <CTAButton>QUERO O MÓDULO ENERGIA · R$97</CTAButton>
            <p className="mt-4 text-sm text-white/50">
              Acesso imediato · Garantia incondicional de 14 dias
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/quiz"
              className="text-sm font-medium text-epic-accent underline-offset-4 hover:underline"
            >
              Ainda não sabe seu Dreno Dominante? Faça o diagnóstico de 2 minutos →
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────── Bloco 2: Reconhecimento e Empatia ───────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Você já tentou. Várias vezes.
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-slate-700">
            <p>
              Você comprou o curso. Baixou o app de produtividade. Montou a rotina
              perfeita no domingo à noite. E por duas semanas, funcionou.
            </p>
            <p>
              Depois, como sempre, desmoronou. E você se culpou — de novo — por não
              ter &ldquo;disciplina suficiente&rdquo;.
            </p>
            <p className="border-l-4 border-epic-amber pl-5 text-xl font-semibold text-slate-900">
              Você não desmoronou porque é fraco. Desmoronou porque estava tentando
              construir em cima de uma fundação sem energia.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────── Bloco 3 e 4: Mecanismo e Ciência ───────────────── */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            O erro não é mental. É biológico.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-700">
            Toda a indústria de produtividade trata o seu problema como mental:
            mais foco, mais método, mais força de vontade. Mas você não conserta o
            motor de um carro com o motor desligado.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">
            Quando a sua biologia está drenada — sono ruim, combustível errado,
            cortisol nas alturas — nenhuma técnica de organização se sustenta. A
            energia vem primeiro. Tudo o mais é construído sobre ela.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="text-3xl font-extrabold text-epic-blue">+60%</div>
              <p className="mt-2 text-sm text-slate-600">
                dos adultos relatam fadiga frequente que afeta a produtividade.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="text-3xl font-extrabold text-epic-blue">OMS</div>
              <p className="mt-2 text-sm text-slate-600">
                reconhece o burnout como fenômeno ocupacional ligado ao esgotamento
                de energia.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="text-3xl font-extrabold text-epic-blue">Gallup</div>
              <p className="mt-2 text-sm text-slate-600">
                aponta níveis recordes de estresse e desengajamento no trabalho.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Dados ilustrativos — substitua pelas fontes e números oficiais antes de publicar.
          </p>
        </div>
      </section>

      {/* ───────────────── Os 5 Drenos ───────────────── */}
      <section className="bg-epic-navy px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Os 5 Drenos de Energia</h2>
          <p className="mt-4 text-white/70">
            Um deles está sugando sua energia agora. O diagnóstico revela qual.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DRENOS_POR_HIERARQUIA.map((dreno) => (
              <div
                key={dreno.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left"
              >
                <div
                  className="mb-3 h-2 w-10 rounded-full"
                  style={{ backgroundColor: dreno.cor }}
                />
                <h3 className="font-bold">{dreno.nome}</h3>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <CTAButton href="/quiz">Descobrir meu Dreno Dominante</CTAButton>
          </div>
        </div>
      </section>

      {/* ───────────────── Bloco 5 e 6: Entregáveis e Princípios ───────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            O que você recebe
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                titulo: "Manual de Energia Vital",
                tag: "Teoria",
                desc: "O mapa completo de como sua energia funciona e por que ela falha.",
              },
              {
                titulo: "Workbook de Energia",
                tag: "Prática",
                desc: "Os exercícios e o sistema de implementação dos micro-hábitos.",
              },
              {
                titulo: "Livro Energia",
                tag: "Aprofundamento",
                desc: "A leitura que consolida a mudança de identidade e comportamento.",
              },
            ].map((item) => (
              <div
                key={item.titulo}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-epic-amber">
                  {item.tag}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {item.titulo}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-16 text-xl font-bold text-slate-900">
            Os 4 Princípios do Método
          </h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              "Transformação Começa no Corpo.",
              "Mínimo Viável Vence Ideal Abandonado.",
              "Identidade Antes de Comportamento.",
              "Subtrair Também é Estratégia.",
            ].map((principio, i) => (
              <div
                key={principio}
                className="flex items-start gap-4 rounded-xl bg-slate-50 p-5"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-epic-blue text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="font-medium text-slate-800">{principio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Autoridade ───────────────── */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
          <div className="h-32 w-32 flex-shrink-0 rounded-full bg-gradient-to-br from-epic-blue to-epic-accent" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Ju Ferreira</h2>
            <p className="mt-1 font-medium text-epic-blue">
              Psicóloga · +15 anos de clínica
            </p>
            <p className="mt-4 text-slate-700">
              O Módulo Energia nasceu de mais de uma década atendendo pessoas
              inteligentes e capazes que estavam travadas — não por falta de
              conhecimento, mas por falta de energia para executar o que já sabiam.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────── Prova Social ───────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            O que muda em 30 dias
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                nome: "Mariana, 34",
                texto:
                  "Parei de tentar me forçar. Cuidei do sono primeiro e em duas semanas minha capacidade de focar voltou sozinha.",
              },
              {
                nome: "Rafael, 41",
                texto:
                  "Achei que era preguiça. Era cansaço crônico. O diagnóstico me mostrou exatamente onde estava o vazamento.",
              },
              {
                nome: "Carla, 29",
                texto:
                  "Um micro-hábito por semana. Parece pouco, mas foi a primeira coisa em anos que eu consegui manter.",
              },
            ].map((dep) => (
              <figure
                key={dep.nome}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <blockquote className="text-slate-700">
                  &ldquo;{dep.texto}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-slate-900">
                  {dep.nome}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Depoimentos ilustrativos — substitua por depoimentos reais com autorização.
          </p>
        </div>
      </section>

      {/* ───────────────── Oferta consolidada ───────────────── */}
      <section id="oferta" className="bg-epic-dark px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Módulo Energia — Acesso completo
          </h2>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-white/60 line-through">De R$197</p>
            <p className="mt-1 text-5xl font-extrabold">R$97</p>
            <p className="mt-2 text-sm text-white/60">pagamento único</p>

            <ul className="mt-8 space-y-3 text-left">
              {[
                "Manual de Energia Vital (Teoria)",
                "Workbook de Energia (Prática)",
                "Livro Energia (Aprofundamento)",
                "Acesso à plataforma de monitoramento da Bateria Vital",
                "Garantia incondicional de 14 dias",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-epic-accent">✓</span>
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <CTAButton className="w-full">QUERO O MÓDULO ENERGIA · R$97</CTAButton>
            </div>

            <div className="mt-6 rounded-xl border border-epic-amber/30 bg-epic-amber/10 p-4 text-left text-sm">
              <p className="font-semibold text-epic-amber">Order Bump no checkout</p>
              <p className="mt-1 text-white/70">
                Adicione o Livro Físico Energia por apenas +R$67.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── Rodapé ───────────────── */}
      <footer className="bg-epic-dark px-6 py-10 text-center text-sm text-white/40">
        <p>EPIC247 · Módulo Energia</p>
        <p className="mt-2">
          <Link href="/quiz" className="text-epic-accent hover:underline">
            Fazer o diagnóstico dos 5 Drenos
          </Link>
        </p>
      </footer>
    </main>
  );
}
