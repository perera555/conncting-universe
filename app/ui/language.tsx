"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { LANGS, LANG_LABEL, langHref, pdfHref, type Lang } from "@/content/i18n";

const KEY = "cu-lang";
const FLAGS: Record<Lang, string> = { si: "සිං", en: "EN", ta: "த" };
const TITLES = "භාෂාව තෝරන්න · Choose your language · மொழியைத் தேர்ந்தெடுக்கவும்";
const PDF_TITLE = "PDF භාෂාව · PDF language · PDF மொழி";

function remember(l: Lang) {
  try {
    localStorage.setItem(KEY, l);
  } catch {}
}

function Chooser({ title, onPick, onClose }: { title: string; onPick: (l: Lang) => void; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="no-print fixed inset-0 z-[100] grid place-items-center bg-night/80 p-4 backdrop-blur-md" onClick={onClose} role="dialog" aria-modal aria-label={title}>
      <div className="glass fade-in w-full max-w-md rounded-3xl p-8 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-4xl">🪐</p>
        <h2 className="font-display mt-3 text-2xl leading-snug">{title}</h2>
        <div className="mt-6 grid gap-3">
          {LANGS.map((l) => (
            <button key={l} onClick={() => onPick(l)} className="btn btn-ghost justify-center py-4 text-lg hover:border-gold">
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-5 text-sm text-muted hover:text-ink" aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  );
}

const noop = () => () => {};

/** Asks for a language on the very first visit and remembers the answer. */
export function FirstVisitLanguage({ current }: { current: Lang }) {
  const router = useRouter();
  const needsChoice = useSyncExternalStore(
    noop,
    () => {
      try {
        return !localStorage.getItem(KEY);
      } catch {
        return false;
      }
    },
    () => false,
  );
  const [closed, setClosed] = useState(false);
  if (!needsChoice || closed) return null;

  return (
    <Chooser
      title={TITLES}
      onClose={() => {
        remember(current);
        setClosed(true);
      }}
      onPick={(l) => {
        remember(l);
        setClosed(true);
        if (l !== current) router.push(langHref(l));
      }}
    />
  );
}

/** Nav language switcher. */
export function LangSwitch({ current }: { current: Lang }) {
  return (
    <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-xs">
      {LANGS.map((l) => (
        <a
          key={l}
          href={langHref(l)}
          onClick={() => remember(l)}
          lang={l}
          aria-current={l === current ? "page" : undefined}
          title={LANG_LABEL[l]}
          className={`rounded-full px-3 py-1.5 transition ${l === current ? "bg-gold text-night font-bold" : "text-muted hover:text-ink"}`}
        >
          {FLAGS[l]}
        </a>
      ))}
    </div>
  );
}

/** A PDF button that first asks which language PDF to download. */
export function PdfButton({ label, className, view = false }: { label: string; className: string; view?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      {open && (
        <Chooser
          title={PDF_TITLE}
          onClose={() => setOpen(false)}
          onPick={(l) => {
            setOpen(false);
            const a = document.createElement("a");
            a.href = pdfHref(l);
            if (view) a.target = "_blank";
            else a.download = `cosmic-goal-guide-${l}.pdf`;
            a.rel = "noreferrer";
            a.click();
          }}
        />
      )}
    </>
  );
}
