"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";
import { DRENOS_POR_HIERARQUIA } from "@/lib/drenos";

const CHECKOUT_URL = "#oferta"; // Troque pela URL real do checkout (Hotmart/Kiwify).

/* ───────────────────────── helpers de animação ───────────────────────── */

function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: [0.21, 0.5, 0.35, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Counter({
  to,
  suffix = "",
  prefix = "",
}: {
  to: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

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
    <motion.a
      href={href}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gold px-9 py-4 text-lg font-bold text-navy-deep shadow-[0_10px_40px_-10px] shadow-gold/70 ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </motion.a>
  );
}

/* ───────────────────────── fundo animado do hero ───────────────────────── */

const PARTICLES = [
  { top: "12%", left: "8%", size: 6, delay: 0 },
  { top: "22%", left: "82%", size: 4, delay: 0.6 },
  { top: "40%", left: "16%", size: 3, delay: 1.2 },
  { top: "58%", left: "72%", size: 5, delay: 0.3 },
  { top: "70%", left: "30%", size: 4, delay: 0.9 },
  { top: "30%", left: "55%", size: 3, delay: 1.6 },
  { top: "80%", left: "88%", size: 6, delay: 0.4 },
  { top: "16%", left: "40%", size: 3, delay: 1.1 },
  { top: "64%", left: "48%", size: 4, delay: 1.9 },
  { top: "48%", left: "90%", size: 3, delay: 0.7 },
];

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base navy com brilho radial superior */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#22325c_0%,#182848_45%,#0f1c34_100%)]" />
      {/* grade dourada */}
      <div className="absolute inset-0 bg-grid-gold opacity-50 [mask-image:radial-gradient(80%_70%_at_50%_30%,#000,transparent)]" />
      {/* blobs dourados flutuantes */}
      <div className="absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-gold/25 blur-[120px] animate-float-blob" />
      <div
        className="absolute -right-24 top-1/3 h-[30rem] w-[30rem] rounded-full bg-gold-soft/20 blur-[130px] animate-float-blob"
        style={{ animationDelay: "-7s" }}
      />
      <div className="absolute bottom-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gold/15 blur-[120px] animate-pulse-glow" />
      {/* partículas */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold-soft animate-twinkle"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────────── página ───────────────────────────── */

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const barWidth = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const scaleX = useTransform(barWidth, [0, 1], [0, 1]);

  return (
    <main className="overflow-x-hidden bg-offwhite">
      {/* barra de progresso de leitura */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-gradient-to-r from-gold to-gold-soft"
      />

      {/* ───────────── Bloco 1: Hero ───────────── */}
      <section className="relative isolate flex min-h-screen items-center justify-center px-6 py-24 text-white">
        <HeroBackground />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft"
          >
            EPIC247 · Módulo Energia
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-8 text-balance font-display text-4xl font-black leading-[1.08] sm:text-6xl"
          >
            Você sabe muito, planeja bem, e mesmo assim não sai do lugar.
            <span className="mt-4 block text-gold-gradient">
              Não é falta de disciplina. É falta de combustível.
            </span>
          </motion.h1>

          {/* VSL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-12 flex aspect-video max-w-2xl items-center justify-center rounded-3xl border border-gold/30 bg-navy-deep/60 shadow-[0_0_80px_-20px] shadow-gold/40 backdrop-blur"
          >
            <div className="text-center text-white/50">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gold text-2xl text-navy-deep shadow-lg animate-pulse-glow">
                ▶
              </div>
              <p className="text-sm">VSL · 9 a 11 minutos</p>
              <p className="text-xs text-white/30">(incorpore aqui seu player)</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12"
          >
            <CTAButton>QUERO O MÓDULO ENERGIA · R$97</CTAButton>
            <p className="mt-4 text-sm text-white/50">
              Acesso imediato · Garantia incondicional de 14 dias
            </p>
            <Link
              href="/quiz"
              className="mt-6 inline-block text-sm font-medium text-gold-soft underline-offset-4 transition hover:underline"
            >
              Ainda não sabe seu Dreno Dominante? Faça o diagnóstico de 2 min →
            </Link>
          </motion.div>
        </div>

        {/* indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold-soft animate-scroll-bob">
          ↓
        </div>
      </section>

      {/* ───────────── Bloco 2: Reconhecimento e Empatia ───────────── */}
      <section className="bg-offwhite px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
              Você já tentou. Várias vezes.
            </h2>
          </Reveal>
          <div className="mt-7 space-y-5 text-lg leading-relaxed text-navy/80">
            <Reveal delay={0.05}>
              <p>
                Você comprou o curso. Baixou o app de produtividade. Montou a rotina
                perfeita no domingo à noite. E por duas semanas, funcionou.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p>
                Depois, como sempre, desmoronou. E você se culpou — de novo — por não
                ter &ldquo;disciplina suficiente&rdquo;.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="rounded-2xl border-l-4 border-gold bg-cream p-6 font-display text-xl font-semibold text-navy">
                Você não desmoronou porque é fraco. Desmoronou porque estava tentando
                construir em cima de uma fundação sem energia.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────── Bloco 3 e 4: Mecanismo e Ciência ───────────── */}
      <section className="bg-cream px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
              O erro não é mental. É biológico.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 text-lg leading-relaxed text-navy/80">
              Toda a indústria de produtividade trata o seu problema como mental: mais
              foco, mais método, mais força de vontade. Mas você não conserta o motor
              de um carro com o motor desligado.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg leading-relaxed text-navy/80">
              Quando a sua biologia está drenada — sono ruim, combustível errado,
              cortisol nas alturas — nenhuma técnica de organização se sustenta. A
              energia vem primeiro. Tudo o mais é construído sobre ela.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { num: <Counter to={60} prefix="+" suffix="%" />, desc: "dos adultos relatam fadiga frequente que afeta a produtividade." },
              { num: "OMS", desc: "reconhece o burnout como fenômeno ocupacional ligado ao esgotamento de energia." },
              { num: "Gallup", desc: "aponta níveis recordes de estresse e desengajamento no trabalho." },
            ].map((stat, i) => (
              <Reveal key={i} delay={0.1 * i}>
                <div className="h-full rounded-2xl border border-line/40 bg-offwhite p-6">
                  <div className="font-display text-3xl font-black text-gold">
                    {stat.num}
                  </div>
                  <p className="mt-2 text-sm text-navy/70">{stat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-xs text-line">
            Dados ilustrativos — substitua pelas fontes e números oficiais antes de publicar.
          </p>
        </div>
      </section>

      {/* ───────────── Os 5 Drenos ───────────── */}
      <section className="relative isolate overflow-hidden bg-navy-deep px-6 py-24 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-gold opacity-30" />
        <div className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-gold/15 blur-[120px] animate-float-blob" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Os 5 Drenos de Energia
            </h2>
            <p className="mt-4 text-white/70">
              Um deles está sugando sua energia agora. O diagnóstico revela qual.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DRENOS_POR_HIERARQUIA.map((dreno, i) => (
              <Reveal key={dreno.id} delay={0.08 * i}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-sm transition-colors hover:border-gold/50"
                >
                  <div
                    className="mb-3 h-2 w-10 rounded-full"
                    style={{ backgroundColor: dreno.cor }}
                  />
                  <span className="text-xs font-semibold text-gold-soft">
                    0{i + 1}
                  </span>
                  <h3 className="mt-1 font-display font-bold">{dreno.nome}</h3>
                </motion.div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <div className="mt-12">
              <CTAButton href="/quiz">Descobrir meu Dreno Dominante</CTAButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────── Bloco 5 e 6: Entregáveis e Princípios ───────────── */}
      <section className="bg-offwhite px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
              O que você recebe
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { titulo: "Manual de Energia Vital", tag: "Teoria", desc: "O mapa completo de como sua energia funciona e por que ela falha." },
              { titulo: "Workbook de Energia", tag: "Prática", desc: "Os exercícios e o sistema de implementação dos micro-hábitos." },
              { titulo: "Livro Energia", tag: "Aprofundamento", desc: "A leitura que consolida a mudança de identidade e comportamento." },
            ].map((item, i) => (
              <Reveal key={item.titulo} delay={0.08 * i}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="h-full rounded-2xl border border-line/40 bg-cream p-6 transition-colors hover:border-gold/60"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-gold">
                    {item.tag}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold text-navy">
                    {item.titulo}
                  </h3>
                  <p className="mt-2 text-sm text-navy/70">{item.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <h3 className="mt-20 font-display text-2xl font-bold text-navy">
              Os 4 Princípios do Método
            </h3>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              "Transformação Começa no Corpo.",
              "Mínimo Viável Vence Ideal Abandonado.",
              "Identidade Antes de Comportamento.",
              "Subtrair Também é Estratégia.",
            ].map((principio, i) => (
              <Reveal key={principio} delay={0.06 * i}>
                <div className="flex items-start gap-4 rounded-xl border border-line/30 bg-offwhite p-5">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-gold">
                    {i + 1}
                  </span>
                  <p className="font-medium text-navy">{principio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Autoridade ───────────── */}
      <section className="bg-cream px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
              <div className="h-32 w-32 flex-shrink-0 rounded-full bg-gradient-to-br from-navy to-gold p-1">
                <div className="h-full w-full rounded-full bg-navy" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">
                  Ju Ferreira
                </h2>
                <p className="mt-1 font-medium text-gold">
                  Psicóloga · <Counter to={15} prefix="+" suffix=" anos" /> de clínica
                </p>
                <p className="mt-4 text-navy/80">
                  O Módulo Energia nasceu de mais de uma década atendendo pessoas
                  inteligentes e capazes que estavam travadas — não por falta de
                  conhecimento, mas por falta de energia para executar o que já sabiam.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────── Prova Social ───────────── */}
      <section className="bg-offwhite px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold text-navy sm:text-4xl">
              O que muda em <Counter to={30} suffix=" dias" />
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { nome: "Mariana, 34", texto: "Parei de tentar me forçar. Cuidei do sono primeiro e em duas semanas minha capacidade de focar voltou sozinha." },
              { nome: "Rafael, 41", texto: "Achei que era preguiça. Era cansaço crônico. O diagnóstico me mostrou exatamente onde estava o vazamento." },
              { nome: "Carla, 29", texto: "Um micro-hábito por semana. Parece pouco, mas foi a primeira coisa em anos que eu consegui manter." },
            ].map((dep, i) => (
              <Reveal key={dep.nome} delay={0.08 * i}>
                <figure className="h-full rounded-2xl border border-line/40 bg-cream p-6">
                  <div className="mb-3 text-2xl text-gold">&ldquo;</div>
                  <blockquote className="text-navy/80">{dep.texto}</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-navy">
                    {dep.nome}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-line">
            Depoimentos ilustrativos — substitua por depoimentos reais com autorização.
          </p>
        </div>
      </section>

      {/* ───────────── Oferta consolidada ───────────── */}
      <section
        id="oferta"
        className="relative isolate overflow-hidden bg-navy-deep px-6 py-24 text-white"
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-gold opacity-30" />
        <div className="absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-gold/15 blur-[120px] animate-pulse-glow" />
        <div className="relative z-10 mx-auto max-w-xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Módulo Energia — Acesso completo
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 rounded-3xl border border-gold/30 bg-white/[0.04] p-8 shadow-[0_0_80px_-24px] shadow-gold/40 backdrop-blur">
              <p className="text-white/50 line-through">De R$197</p>
              <p className="mt-1 font-display text-6xl font-black text-gold-gradient">
                R$97
              </p>
              <p className="mt-2 text-sm text-white/60">pagamento único</p>

              <div className="gold-rule my-8" />

              <ul className="space-y-3 text-left">
                {[
                  "Manual de Energia Vital (Teoria)",
                  "Workbook de Energia (Prática)",
                  "Livro Energia (Aprofundamento)",
                  "Acesso à plataforma de monitoramento da Bateria Vital",
                  "Garantia incondicional de 14 dias",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 text-gold">✓</span>
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <CTAButton className="w-full">
                  QUERO O MÓDULO ENERGIA · R$97
                </CTAButton>
              </div>

              <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-4 text-left text-sm">
                <p className="font-semibold text-gold-soft">Order Bump no checkout</p>
                <p className="mt-1 text-white/70">
                  Adicione o Livro Físico Energia por apenas +R$67.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────── Rodapé ───────────── */}
      <footer className="bg-navy px-6 py-12 text-center text-sm text-white/40">
        <p className="font-display text-base text-white/70">EPIC247 · Módulo Energia</p>
        <p className="mt-3">
          <Link href="/quiz" className="text-gold-soft hover:underline">
            Fazer o diagnóstico dos 5 Drenos
          </Link>
        </p>
      </footer>
    </main>
  );
}
