"use client";

// Wrappers para disparar eventos no Meta Pixel (fbq) e GA4 (gtag) no client.
// Seguros: se os scripts não estiverem carregados, viram no-op.

type Props = Record<string, unknown>;

interface WindowWithTrackers extends Window {
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
}

function fbq(event: string, props?: Props) {
  if (typeof window === "undefined") return;
  const w = window as WindowWithTrackers;
  w.fbq?.("track", event, props ?? {});
}

function ga(event: string, props?: Props) {
  if (typeof window === "undefined") return;
  const w = window as WindowWithTrackers;
  w.gtag?.("event", event, props ?? {});
}

export function trackLead(props?: Props) {
  fbq("Lead", props);
  ga("generate_lead", props);
}

export function trackInitiateCheckout(props?: Props) {
  fbq("InitiateCheckout", props);
  ga("begin_checkout", props);
}

export function trackViewContent(props?: Props) {
  fbq("ViewContent", props);
  ga("view_item", props);
}
