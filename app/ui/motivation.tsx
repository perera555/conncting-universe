"use client";

import { useState } from "react";
import type { Dict } from "@/content/en";
import Tilt from "./tilt";

export default function Motivation({ t }: { t: Dict["motivate"] }) {
  const [i, setI] = useState(0);
  const [idea, setIdea] = useState<number | null>(null);
  const q = t.quotes[i];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
      <Tilt className="rounded-4xl" max={8}>
        <blockquote className="glass relative overflow-hidden rounded-4xl p-8 md:p-12">
          <span className="font-display pointer-events-none absolute -top-6 left-4 text-[10rem] leading-none text-gold/15">
            &ldquo;
          </span>
          <p key={i} className="fade-in pop font-display relative text-3xl leading-snug md:text-5xl">
            {q.q}
          </p>
          <footer className="pop-sm mt-6 text-gold">— {q.a}</footer>
          <div className="pop-sm mt-8 flex flex-wrap gap-3">
            <button onClick={() => setI((i + 1) % t.quotes.length)} className="btn btn-ghost">
              {t.next}
            </button>
            <button onClick={() => setIdea((idea === null ? i : idea + 3) % t.ideas.length)} className="btn btn-primary">
              {t.idea}
            </button>
          </div>
          {idea !== null && (
            <div key={idea} className="fade-in mt-6 rounded-2xl border border-gold/30 bg-gold/10 p-4">
              <p className="font-semibold">
                {t.ideas[idea].icon} {t.ideas[idea].title}
              </p>
              <p className="mt-1 text-sm text-muted">{t.ideas[idea].body}</p>
            </div>
          )}
        </blockquote>
      </Tilt>
      <div className="scene mx-auto hidden md:block" aria-hidden>
        <div className="cube">
          <div>✨</div>
          <div>🌙</div>
          <div>⭐</div>
          <div>🪐</div>
          <div>☀️</div>
          <div>💫</div>
        </div>
      </div>
    </div>
  );
}
