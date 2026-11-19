"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Dict } from "@/content/en";
import { downloadPlanPdf } from "./plan-pdf";
import {
  addPeriod, daysBetween, detectCategory, fill, formatMoney, parseMoney, startsFromZero,
  DEFAULT_PERIOD, PHASE_MONEY, PHASE_SHARES, type CategoryKey, type Money, type Unit,
} from "@/content/plan";
import { useStored, uid } from "./use-stored";
import type { Goal } from "./goal-studio";

type T = Dict["planner"];
type Plan = {
  goal: string;
  feeling: string;
  cat: CategoryKey;
  money: Money | null;
  n: number;
  unit: Unit;
  suggested: boolean;
  zero: boolean;
  urgent: boolean;
  start: string;
  end: string;
  /** bumps on every "Create my plan" so the PDF downloads again */
  stamp: number;
};

const UNITS: Unit[] = ["days", "weeks", "months", "years"];

function Card({ title, icon, children, className = "" }: { title: string; icon: string; children: ReactNode; className?: string }) {
  return (
    <section className={`glass plan-card rounded-3xl p-6 ${className}`}>
      <h3 className="font-display flex items-center gap-3 text-2xl">
        {icon && <span className="text-xl">{icon}</span>}
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stars({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((x) => (
        <li key={x} className="flex gap-3 text-muted">
          <span className="text-gold">✦</span>
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Planner({ t, locale }: { t: T; locale: string }) {
  const [goal, setGoal] = useState("");
  const [feeling, setFeeling] = useState("");
  const [n, setN] = useState("");
  const [unit, setUnit] = useState<Unit>("years");
  const [endDate, setEndDate] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saved, setSaved] = useState(false);
  const [, setGoals] = useStored<Goal[]>("cu-goals", []);

  const build = (text: string) => {
    const g = text.trim();
    if (!g) return;
    const cat = detectCategory(g);
    const money = parseMoney(g, cat === "money");
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    // A date picked on the calendar wins; otherwise use the number + unit; otherwise suggest one.
    const picked = endDate ? new Date(`${endDate}T00:00:00`) : null;
    const num = parseInt(n, 10);
    let period: { n: number; unit: Unit };
    let end: Date;
    let suggested = false;
    if (picked && picked > start) {
      end = picked;
      period = { n: daysBetween(start, picked), unit: "days" };
    } else {
      suggested = !(num > 0);
      const def = DEFAULT_PERIOD[money ? "money" : cat];
      // Urgent goals get half the suggested time (at least 1 unit).
      period = suggested ? (urgent ? { n: Math.max(1, Math.ceil(def.n / 2)), unit: def.unit } : def) : { n: num, unit };
      end = addPeriod(start, period.n, period.unit);
    }
    setPlan({
      goal: g, feeling: feeling.trim(), cat: money && cat === "general" ? "money" : cat, money,
      n: period.n, unit: period.unit, suggested, zero: startsFromZero(g), urgent,
      start: start.toISOString(), end: end.toISOString(), stamp: Date.now(),
    });
    setSaved(false);
    setPdf("making");
    requestAnimationFrame(() => document.getElementById("plan-sheet")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    build(goal);
  };

  // Fallback if the PDF library fails: the browser's own "Save as PDF".
  const printPlan = () => {
    const html = document.documentElement;
    html.classList.add("print-plan");
    const done = () => {
      html.classList.remove("print-plan");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
  };

  const [pdf, setPdf] = useState<"idle" | "making" | "done" | "error">("idle");
  const busy = useRef(false);

  const makePdf = async () => {
    const sheet = document.getElementById("plan-sheet");
    if (!sheet || busy.current) return;
    busy.current = true;
    setPdf("making");
    try {
      await downloadPlanPdf(sheet, "my-universe-plan.pdf");
      setPdf("done");
    } catch (err) {
      console.error(err);
      setPdf("error");
    } finally {
      busy.current = false;
    }
  };

  // Every new plan is turned into a PDF and downloaded automatically.
  const stamp = plan?.stamp;
  useEffect(() => {
    if (!stamp) return;
    const id = setTimeout(makePdf, 900); // let the cards finish their entrance animation
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp]);

  const pdfLabel = pdf === "making" ? t.pdfMaking : pdf === "done" ? t.pdfReady : t.pdfPlan;

  const fmtDate = (d: Date) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(d);

  let view: ReactNode = null;
  if (plan) {
    const c = t.categories[plan.cat];
    const start = new Date(plan.start);
    const end = new Date(plan.end);
    const days = daysBetween(start, end);
    const feelingText = plan.feeling || t.feelingDefault;
    const vars = { goal: plan.goal, feeling: feelingText };
    const actions = [...c.actions, ...t.common.actions];
    const week = [t.day1, ...actions.slice(0, 5), t.day7];
    const phases = t.phases.map((p, i) => {
      const from = i === 0 ? start : new Date(start.getTime() + PHASE_SHARES[i - 1] * (end.getTime() - start.getTime()));
      const to = new Date(start.getTime() + PHASE_SHARES[i] * (end.getTime() - start.getTime()));
      return { ...p, from, to, money: plan.money ? plan.money.amount * PHASE_MONEY[i] : null };
    });
    const m = plan.money;
    const perDay = m ? m.amount / days : 0;

    const save = () => {
      setGoals((prev) => [
        {
          id: uid(),
          title: plan.goal,
          feeling: plan.feeling,
          date: end.toISOString().slice(0, 10),
          steps: [
            ...week.map((w, i) => ({ id: uid(), text: `${t.day} ${i + 1}: ${w}`, done: false })),
            ...phases.map((p) => ({
              id: uid(),
              text: `${p.name} (${fmtDate(p.to)})${p.money !== null && m ? ` · ${formatMoney(p.money, m.currency, locale)}` : ""}`,
              done: false,
            })),
          ],
        },
        ...prev,
      ]);
      setSaved(true);
    };

    view = (
      <div id="plan-sheet" className="fade-in mt-10 scroll-mt-24 space-y-6">
        {/* Goal header */}
        <div className="glass plan-card relative overflow-hidden rounded-3xl p-6 md:p-10">
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-violet/30 blur-3xl" />
          <p className="eyebrow">{t.yourGoal} · {c.label}</p>
          <h3 className="font-display mt-3 text-4xl leading-tight md:text-5xl">{plan.goal}</h3>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-gold/15 px-4 py-2 text-gold">
              📅 {fill(t.fromTo, { start: fmtDate(start), end: fmtDate(end) })}
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              ⏳ {plan.n} {t.units[plan.unit]} · {fill(t.totalDays, { days, weeks: Math.round(days / 7) })}
            </span>
            {plan.suggested && <span className="rounded-full bg-cyan/15 px-4 py-2 text-cyan">✦ {t.suggested}</span>}
          </div>
          <p className="mt-6 text-muted">{t.statementHint}</p>
          <p className="font-display mt-2 text-2xl text-gold italic">{fill(t.statement, vars)}</p>
          <div className="no-print mt-8 flex flex-wrap gap-3">
            <button onClick={save} disabled={saved} className="btn btn-ghost disabled:opacity-60">
              {saved ? "✓" : "⭐"} {t.save}
            </button>
            <button onClick={makePdf} disabled={pdf === "making"} className="btn btn-primary disabled:opacity-60">
              {pdf === "making" ? "⏳" : "⬇"} {pdf === "done" ? t.pdfPlan : pdfLabel}
            </button>
            <button onClick={() => { setPlan(null); setGoal(""); document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" }); }} className="btn btn-ghost">
              ↺ {t.newPlan}
            </button>
          </div>
          {saved && (
            <p className="no-print mt-4 text-sm text-gold">
              <a href="#studio" className="underline">{t.saved}</a>
            </p>
          )}
        </div>

        {/* What the universe brings — shown first */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card title={t.receiveTitle} icon="🎁" className="ring-1 ring-gold/40">
            <Stars items={[...c.gifts, ...t.common.gifts]} />
          </Card>
          <Card title={t.askTitle} icon="🙏" className="ring-1 ring-gold/40">
            <p className="text-lg leading-relaxed">{c.ask}</p>
          </Card>
        </div>

        {/* Urgent vs steady */}
        {plan.urgent ? (
          <Card title={t.urgency.urgentTitle} icon=""className="ring-1 ring-rose/50">
            <p className="text-muted">{t.urgency.urgentIntro}</p>
            <ol className="mt-4 space-y-3">
              {[...t.urgency.urgentSteps, ...(plan.money || plan.zero || plan.cat === "money" ? t.urgency.urgentMoney : [])].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-display text-xl text-rose">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </Card>
        ) : (
          <Card title={t.urgency.steadyTitle} icon=""className="ring-1 ring-cyan/30">
            <p className="text-muted">{t.urgency.steadyIntro}</p>
            <Stars items={t.urgency.steadySteps} />
          </Card>
        )}

        {/* Starting with no job / no money: the honest first milestones */}
        {plan.zero && (
          <Card title={t.zeroStart.title} icon="🌱" className="ring-1 ring-cyan/40">
            <p className="text-muted">{t.zeroStart.intro}</p>
            <ol className="mt-4 space-y-3">
              {t.zeroStart.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-display text-xl text-cyan">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-2xl bg-rose/10 p-4 text-sm text-rose">🛡️ {t.zeroStart.warning}</p>
          </Card>
        )}

        {/* Numbers */}
        {m && (
          <Card title={t.numbersTitle} icon="💰">
            <p className="text-muted">{fill(t.pace, { amount: formatMoney(m.amount, m.currency, locale) })}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {(
                [
                  [t.perYear, (m.amount / days) * 365],
                  [t.perMonth, (m.amount / days) * 30.44],
                  [t.perWeek, (m.amount / days) * 7],
                  [t.perDay, perDay],
                ] as const
              ).map(([label, v]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
                  <p className="font-display text-2xl text-gold md:text-3xl">{formatMoney(v, m.currency, locale)}</p>
                  <p className="text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
            {perDay > 100 && <p className="mt-4 rounded-2xl bg-rose/10 p-4 text-sm text-rose">💡 {t.paceNote}</p>}
          </Card>
        )}

        {/* Timeline */}
        <Card title={t.phasesTitle} icon="🪐">
          <ol className="relative space-y-5 border-l border-white/15 pl-6">
            {phases.map((p, i) => (
              <li key={p.name} className="relative">
                <span className="orb-num absolute top-0 -left-[2.55rem] h-8! w-8! text-sm" style={{ ["--c" as string]: i === 4 ? "#f5c86b" : "#8b6cff" }}>
                  {i + 1}
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gold">{fmtDate(p.from)} → {fmtDate(p.to)}</p>
                </div>
                <p className="mt-1 text-sm text-muted">{p.focus}</p>
                {p.money !== null && m && (
                  <p className="mt-1 text-sm">🎯 {t.targetBy}: <b className="text-gold">{formatMoney(p.money, m.currency, locale)}</b></p>
                )}
              </li>
            ))}
          </ol>
        </Card>

        {/* First 7 days */}
        <Card title={t.week1Title} icon="🗓️">
          <ol className="grid gap-3 md:grid-cols-2">
            {week.map((w, i) => {
              const d = new Date(start);
              d.setDate(d.getDate() + i);
              return (
                <li key={i} className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="shrink-0 text-center">
                    <p className="text-xs text-muted uppercase">{t.day}</p>
                    <p className="font-display text-3xl text-gold">{i + 1}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cyan">{fmtDate(d)}</p>
                    <p className="mt-1 text-sm">{w}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title={t.dailyTitle} icon="☀️"><Stars items={t.daily} /></Card>
          <Card title={t.weeklyTitle} icon="🔁"><Stars items={t.weekly} /></Card>
        </div>

        <Card title={t.letterTitle} icon="💌">
          <p className="font-display text-xl leading-relaxed whitespace-pre-line">{fill(t.letter, vars)}</p>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title={t.visualTitle} icon="🧘">
            <ol className="space-y-3">
              {t.visual.map((v, i) => (
                <li key={i} className="flex gap-3 text-muted">
                  <span className="font-display text-gold">{i + 1}.</span>
                  <span>{fill(v, vars)}</span>
                </li>
              ))}
            </ol>
          </Card>
          <div className="space-y-6">
            <Card title={t.signsTitle} icon="✨"><Stars items={[...c.signs, ...t.common.signs]} /></Card>
            <Card title={t.affirmTitle} icon="💫">
              <ul className="space-y-2">
                {[...c.affirmations, ...t.common.affirmations].map((a) => (
                  <li key={a} className="font-display text-lg italic">“{a}”</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <p className="text-center text-sm text-muted">🌌 {t.honest}</p>

        <div className="no-print glass rounded-3xl p-6 text-center md:p-8">
          <button onClick={makePdf} disabled={pdf === "making"} className="btn btn-primary px-8 py-4 text-lg disabled:opacity-70">
            {pdf === "making" ? "⏳" : "⬇"} {pdf === "done" ? t.pdfPlan : pdfLabel}
          </button>
          <p className="mt-3 text-xs text-muted">{pdf === "done" ? t.pdfReady : t.pdfHint}</p>
          {pdf === "error" && (
            <button onClick={printPlan} className="mt-3 text-sm text-gold underline">🖨 {t.print}</button>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button onClick={save} disabled={saved} className="btn btn-ghost disabled:opacity-60">
              {saved ? "✓" : "⭐"} {t.save}
            </button>
          </div>
          {saved && (
            <p className="mt-3 text-sm text-gold">
              <a href="#studio" className="underline">{t.saved}</a>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={submit} className="glass no-print mx-auto max-w-4xl rounded-3xl p-6 md:p-10">
        <label htmlFor="p-goal" className="block font-semibold">{t.goalLabel}</label>
        <textarea
          id="p-goal"
          rows={2}
          className="field mt-3 resize-none text-lg"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder={t.goalPh}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted">{t.examplesLabel}</span>
          {t.examples.map((ex) => (
            <button
              type="button"
              key={ex}
              onClick={() => setGoal(ex)}
              className="rounded-full border border-white/15 px-3 py-1 text-ink/80 transition hover:border-gold hover:text-gold"
            >
              {ex}
            </button>
          ))}
        </div>

        <fieldset className="mt-6">
          <legend className="font-semibold">{t.urgency.label}</legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {([true, false] as const).map((u) => (
              <button
                type="button"
                key={String(u)}
                aria-pressed={urgent === u}
                onClick={() => setUrgent(u)}
                className={`rounded-2xl border p-4 text-left transition ${
                  urgent === u
                    ? u ? "border-rose bg-rose/15" : "border-cyan bg-cyan/10"
                    : "border-white/15 hover:border-white/40"
                }`}
              >
                <span className="block text-lg font-semibold">{u ? t.urgency.urgent : t.urgency.steady}</span>
                <span className="mt-1 block text-xs text-muted">{u ? t.urgency.urgentHint : t.urgency.steadyHint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="p-period" className="block font-semibold">{t.periodLabel}</label>
            <div className={`mt-3 flex gap-2 transition ${endDate ? "opacity-40" : ""}`}>
              <input
                id="p-period"
                type="number"
                min={1}
                inputMode="numeric"
                className="field w-28 min-w-0"
                value={n}
                onChange={(e) => {
                  setN(e.target.value);
                  setEndDate("");
                }}
                placeholder={t.periodPh}
              />
              <select
                aria-label={t.periodLabel}
                className="field min-w-0 flex-1 [color-scheme:dark]"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value as Unit);
                  setEndDate("");
                }}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{t.units[u]}</option>
                ))}
              </select>
            </div>
            <label htmlFor="p-date" className="mt-4 block text-sm text-gold">{t.orDate}</label>
            <input
              id="p-date"
              type="date"
              className="field mt-2 [color-scheme:dark]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted">{t.periodHint}</p>
          </div>
          <div>
            <label htmlFor="p-feel" className="block font-semibold">{t.feelingLabel}</label>
            <input
              id="p-feel"
              className="field mt-3"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder={t.feelingPh}
            />
            <p className="mt-4 text-sm text-gold">{t.feelingsLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {t.feelings.map((f) => {
                const parts = feeling.split(/\s*,\s*/).filter(Boolean);
                const on = parts.includes(f);
                return (
                  <button
                    type="button"
                    key={f}
                    aria-pressed={on}
                    onClick={() => setFeeling((on ? parts.filter((p) => p !== f) : [...parts, f]).join(", "))}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      on ? "border-gold bg-gold text-night font-semibold" : "border-white/15 text-ink/80 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {on ? "✓ " : ""}{f}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <button className="btn btn-primary mt-8 w-full justify-center py-4 text-lg">{t.generate}</button>
        {plan && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={makePdf}
              disabled={pdf === "making"}
              className="btn btn-ghost w-full justify-center border-gold/60 py-3 disabled:opacity-60"
            >
              {pdf === "making" ? "⏳" : "⬇"} {pdf === "done" ? t.pdfPlan : pdfLabel}
            </button>
            <p className="mt-2 text-xs text-muted">{pdf === "done" ? t.pdfReady : t.pdfHint}</p>
          </div>
        )}
      </form>
      {view}
    </div>
  );
}
