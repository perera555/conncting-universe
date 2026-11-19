"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Dict } from "@/content/en";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// The browser's install prompt arrives once, possibly before React mounts; keep it at module level.
let deferred: PromptEvent | null = null;
const subs = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as PromptEvent;
    subs.forEach((f) => f());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    subs.forEach((f) => f());
  });
}
const sub = (f: () => void) => {
  subs.add(f);
  return () => subs.delete(f);
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

type Platform = "ios" | "mac-safari" | "android" | "desktop";
function platform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (ua.includes("Mac") && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua)) return "mac-safari";
  return "desktop";
}

export default function InstallButton({ t }: { t: Dict["install"] }) {
  const hasPrompt = useSyncExternalStore(sub, () => deferred !== null, () => false);
  const installed = useSyncExternalStore(sub, isStandalone, () => false);
  const [help, setHelp] = useState<Platform | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (installed) return null;

  const click = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice.catch(() => null);
      deferred = null;
      subs.forEach((f) => f());
      return;
    }
    setHelp(platform());
  };

  const steps: Record<Platform, string[]> = { ios: t.ios, "mac-safari": t.mac, android: t.android, desktop: t.desktop };

  return (
    <>
      <button
        onClick={click}
        className={`btn px-3 py-2 text-sm ${hasPrompt ? "btn-primary" : "btn-ghost"} border-gold/50`}
        title={t.button}
      >
        <span aria-hidden>📲</span>
        <span>{t.button}</span>
      </button>
      {help && (
        <div
          className="no-print fixed inset-0 z-[100] grid place-items-center bg-night/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal
          aria-label={t.title}
          onClick={() => setHelp(null)}
        >
          <div className="glass fade-in w-full max-w-md rounded-3xl p-7" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-4xl">📲</p>
            <h2 className="font-display mt-3 text-center text-2xl">{t.title}</h2>
            <ol className="mt-5 space-y-3">
              {steps[help].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="orb-num h-7! w-7! shrink-0 text-sm">{i + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-xs text-muted">{t.other}</p>
            <button onClick={() => setHelp(null)} className="btn btn-primary mt-6 w-full justify-center">
              {t.ok}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
