"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

/**
 * Fundo aurora animado. `heat` (0..1) desloca a paleta do azul (cheio de energia)
 * para o vermelho/âmbar (drenado), reforçando a narrativa da Bateria Vital.
 */
export function Aurora({ heat }: { heat: number }) {
  // Interpola cores conforme o nível de "calor" (drenagem).
  const blobA = lerpColor([56, 189, 248], [244, 63, 94], heat); // accent -> red
  const blobB = lerpColor([99, 102, 241], [245, 158, 11], heat); // indigo -> amber

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

  const color = value > 66 ? "#38bdf8" : value > 33 ? "#f59e0b" : "#f43f5e";

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
