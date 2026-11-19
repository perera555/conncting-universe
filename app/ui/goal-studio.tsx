"use client";

import { useState, type FormEvent } from "react";
import type { Dict } from "@/content/en";
import { detectCategory } from "@/content/plan";
import { useStored, uid } from "./use-stored";
import Tilt from "./tilt";

export type Step = { id: string; text: string; done: boolean };
export type Goal = { id: string; title: string; feeling: string; date: string; steps: Step[]; done?: boolean };

type T = Dict["studio"];
type P = Dict["planner"];

function Ring({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 72 72" className="progress-ring h-20 w-20 -rotate-90" aria-hidden>
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="7" />
      <circle
        cx="36" cy="36" r={r} fill="none" stroke="url(#ring-grad)" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
      />
      <defs>
        <linearGradient id="ring-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#f5c86b" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function GoalCard({ goal, t, p, onChange, onDelete }: { goal: Goal; t: T; p: P; onChange: (g: Goal) => void; onDelete: () => void }) {
  const [step, setStep] = useState("");
  const done = goal.steps.filter((s) => s.done).length;
  const allTicked = goal.steps.length > 0 && done === goal.steps.length;
  const complete = goal.done || allTicked;
  const pct = complete ? 1 : goal.steps.length ? done / goal.steps.length : 0;

  const cat = p.categories[detectCategory(goal.title)];
  const existing = new Set(goal.steps.map((s) => s.text));
  const suggestions = [...cat.actions, ...p.common.actions].filter((a) => !existing.has(a)).slice(0, 4);

  const addStep = (text: string) => {
    if (!text.trim()) return;
    onChange({ ...goal, done: false, steps: [...goal.steps, { id: uid(), text: text.trim(), done: false }] });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    addStep(step);
    setStep("");
  };

  return (
    <Tilt max={4} className="fade-in rounded-3xl">
      <article className={`glass rounded-3xl p-6 ${complete ? "ring-2 ring-gold/70" : ""}`}>
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Ring pct={pct} />
            <span className="absolute inset-0 grid place-items-center text-sm font-bold">{Math.round(pct * 100)}%</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl leading-tight break-words">{goal.title}</h3>
            {goal.feeling && <p className="mt-1 text-sm text-muted">{t.feelsLike} {goal.feeling}</p>}
            {goal.date && <p className="mt-1 text-xs tracking-wide text-gold">{t.target} {goal.date}</p>}
            {goal.steps.length > 0 && <p className="mt-1 text-xs text-muted">{done} / {goal.steps.length}</p>}
          </div>
          <button onClick={onDelete} className="shrink-0 text-muted transition hover:text-rose" aria-label={`${t.del}: ${goal.title}`}>
            ✕
          </button>
        </div>

        {complete && <p className="mt-4 rounded-xl bg-gold/15 px-4 py-2 text-sm text-gold">{t.complete}</p>}

        {goal.steps.length > 0 && <p className="mt-5 text-xs text-muted">{t.stepsHint}</p>}
        <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
          {goal.steps.map((s) => (
            <li key={s.id} className="flex items-start gap-3">
              <button
                onClick={() => onChange({ ...goal, steps: goal.steps.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)) })}
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
                  s.done ? "border-gold bg-gold text-night" : "border-white/30 hover:border-gold"
                }`}
                aria-label={s.text}
                aria-pressed={s.done}
              >
                {s.done ? "✓" : ""}
              </button>
              <span className={`min-w-0 flex-1 text-sm ${s.done ? "text-muted line-through" : ""}`}>{s.text}</span>
              <button
                onClick={() => onChange({ ...goal, steps: goal.steps.filter((x) => x.id !== s.id) })}
                className="shrink-0 text-xs text-muted hover:text-rose"
              >
                {t.remove}
              </button>
            </li>
          ))}
        </ul>

        {suggestions.length > 0 && !complete && (
          <div className="mt-5">
            <p className="text-xs text-muted">{t.suggestLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => addStep(s)}
                  className="rounded-full border border-dashed border-gold/40 px-3 py-1 text-left text-xs text-gold/90 transition hover:border-gold hover:bg-gold/10"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input className="field min-w-0 py-2 text-sm" value={step} onChange={(e) => setStep(e.target.value)} placeholder={t.addStepPh} />
          <button className="btn btn-ghost shrink-0 px-4 py-2 text-sm">{t.add}</button>
        </form>

        {(goal.done || !allTicked) && (
          <div className="mt-4 text-right">
            <button onClick={() => onChange({ ...goal, done: !goal.done })} className="text-sm text-gold hover:underline">
              {goal.done ? t.undoDone : t.markDone}
            </button>
          </div>
        )}
      </article>
    </Tilt>
  );
}

export default function GoalStudio({ t, p }: { t: T; p: P }) {
  const [goals, setGoals, hydrated] = useStored<Goal[]>("cu-goals", []);

  if (hydrated && goals.length === 0) {
    return (
      <div className="glass grid min-h-64 place-items-center rounded-3xl p-10 text-center">
        <div>
          <p className="text-5xl">🌌</p>
          <p className="font-display mt-4 text-2xl">{t.emptyTitle}</p>
          <p className="mt-2 text-sm text-muted">{t.emptyBody}</p>
          <a href="#planner" className="btn btn-primary mt-6">{p.generate}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {goals.map((g) => (
        <GoalCard
          key={g.id}
          goal={g}
          t={t}
          p={p}
          onChange={(ng) => setGoals((all) => all.map((x) => (x.id === g.id ? ng : x)))}
          onDelete={() => setGoals((all) => all.filter((x) => x.id !== g.id))}
        />
      ))}
    </div>
  );
}
