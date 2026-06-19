"use client";

// Sons sintetizados via Web Audio API — sem arquivos, sem dependências.
// Tema "energia": sweep de power-up na abertura, blip nas respostas,
// acorde de conclusão no fim.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(
  c: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "sine",
  peak = 0.18
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** Som de abertura: sweep ascendente + acorde brilhante. */
export function playStart() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  // sweep de power-up
  const osc = c.createOscillator();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(6000, now + 0.5);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.5);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  osc.connect(filter).connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.72);

  // acorde brilhante (Dó maior) por cima
  [523.25, 659.25, 783.99].forEach((f, i) =>
    blip(c, f, now + 0.18 + i * 0.05, 0.5, "triangle", 0.12)
  );
}

/** Blip curto e suave ao responder. */
export function playTick() {
  const c = getCtx();
  if (!c) return;
  blip(c, 660, c.currentTime, 0.12, "sine", 0.1);
}

/** Acorde de conclusão (arpejo ascendente). */
export function playComplete() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    blip(c, f, now + i * 0.09, 0.45, "triangle", 0.13)
  );
}
