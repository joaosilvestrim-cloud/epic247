"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

/**
 * Fundo aurora animado. `heat` (0..1) desloca a paleta do azul (cheio de energia)
 * para o vermelho/âmbar (drenado), reforçando a narrativa da Bateria Vital.
 */
export function Aurora({ heat }: { heat: number }) {
  // Interpola cores conforme o nível de "calor" (drenagem).
  const blobA = lerpColor([216, 183, 101], [244, 63, 94], heat); // dourado -> vermelho
  const blobB = lerpColor([34, 50, 92], [192, 152, 64], heat); // navy -> ouro

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-quiz-grid opacity-40" />
      <motion.div
        className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full blur-[120px] animate-float-blob"
        animate={{ backgroundColor: `rgba(${blobA},0.45)` }}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        className="absolute -bottom-40 -right-24 h-[32rem] w-[32rem] rounded-full blur-[130px] animate-float-blob"
        style={{ animationDelay: "-6s" }}
        animate={{ backgroundColor: `rgba(${blobB},0.40)` }}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full blur-[110px] animate-pulse-glow"
        animate={{ backgroundColor: `rgba(${blobA},0.30)` }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
}

/** Anel SVG da Bateria Vital com animação suave de preenchimento. */
export function EnergyRing({
  value,
  size = 132,
  stroke = 10,
  label = "Bateria Vital",
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useMotionValue(0);
  const dashoffset = useTransform(
    progress,
    (v) => circumference - (v / 100) * circumference
  );
  const display = useMotionValue(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const c1 = animate(progress, value, { duration: 0.9, ease: "easeOut" });
    const c2 = animate(display, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => {
      c1.stop();
      c2.stop();
    };
  }, [value, progress, display]);

  const color = value > 66 ? "#d8b765" : value > 33 ? "#c09840" : "#f43f5e";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashoffset }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold tabular-nums" style={{ color }}>
          {shown}%
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/50">
          {label}
        </span>
      </div>
    </div>
  );
}

const BUBBLES = [
  { left: "22%", size: 7, delay: 0, dur: 3.4 },
  { left: "50%", size: 5, delay: 0.8, dur: 4.1 },
  { left: "70%", size: 9, delay: 1.6, dur: 3.0 },
  { left: "38%", size: 4, delay: 2.3, dur: 4.6 },
  { left: "60%", size: 6, delay: 1.1, dur: 3.7 },
];

/**
 * Bateria Vital animada — líquido que enche/drena com efeito de ondas,
 * bolhas subindo, faísca elétrica e brilho pulsante. É a peça-tema do quiz.
 */
export function VitalBattery({
  value,
  height = 200,
  width = 112,
  label = "Bateria Vital",
}: {
  value: number; // 0..100
  height?: number;
  width?: number;
  label?: string;
}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const c = animate(shown, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const color =
    value > 66
      ? { base: "#d8b765", glow: "216,183,101" }
      : value > 33
        ? { base: "#c09840", glow: "192,152,64" }
        : { base: "#f43f5e", glow: "244,63,94" };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative animate-battery-glow"
        style={{ width, height }}
      >
        {/* terminal (tampa) */}
        <div
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[70%] rounded-md"
          style={{
            width: width * 0.34,
            height: 12,
            backgroundColor: color.base,
          }}
        />
        {/* corpo */}
        <div
          className="relative h-full w-full overflow-hidden rounded-[1.4rem] border-4 bg-navy-deep/70 backdrop-blur-sm"
          style={{ borderColor: `rgba(${color.glow},0.7)` }}
        >
          {/* líquido */}
          <motion.div
            className="absolute inset-x-0 bottom-0 overflow-hidden"
            initial={false}
            animate={{
              height: `${Math.max(value, 3)}%`,
              backgroundColor: color.base,
            }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            {/* ondas na superfície */}
            <div
              className="battery-wave"
              style={{
                top: -width * 1.9,
                background: "rgba(255,255,255,0.22)",
                animation: "wave-spin 7s linear infinite",
              }}
            />
            <div
              className="battery-wave"
              style={{
                top: -width * 1.95,
                background: "rgba(255,255,255,0.12)",
                animation: "wave-spin 11s linear infinite reverse",
              }}
            />
          </motion.div>

          {/* bolhas */}
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              className="absolute bottom-2 rounded-full bg-white/40"
              style={{
                left: b.left,
                width: b.size,
                height: b.size,
                animation: `bubble-rise ${b.dur}s ease-in infinite`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}

          {/* brilho interno */}
          <div className="pointer-events-none absolute inset-0 rounded-[1.1rem] shadow-[inset_0_0_30px_rgba(0,0,0,0.4)]" />

          {/* conteúdo */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <span className="text-3xl animate-bolt-flicker drop-shadow-lg">⚡</span>
            <span className="mt-1 text-3xl font-extrabold tabular-nums text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              {shown}%
            </span>
          </div>
        </div>
      </div>
      <span className="mt-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
        {label}
      </span>
    </div>
  );
}

/** Número que conta de 0 até `to`. */
export function CountUp({
  to,
  duration = 0.9,
  className = "",
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [to, duration]);
  return <span className={className}>{shown}</span>;
}

function lerpColor(a: number[], b: number[], t: number): string {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * clamp01(t)));
  return c.join(",");
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
