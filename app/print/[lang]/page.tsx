import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, getDict, isLang } from "@/content/i18n";
import "./print.css";

/**
 * Print-ready version of the guide. `npm run pdf` opens these pages in a
 * headless browser and saves public/cosmic-goal-guide-{lang}.pdf, so
 * Sinhala and Tamil text is shaped correctly by the browser.
 */
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const metadata: Metadata = { robots: { index: false } };

export default async function PrintGuide({ params }: PageProps<"/print/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const g = getDict(lang).guide;

  const Section = ({ part, accent }: { part: typeof g.visualize; accent: string }) => (
    <section className="pg-section">
      <p className="pg-eyebrow">{part.eyebrow}</p>
      <h2 className="pg-h1">{part.heading}</h2>
      <p className="pg-lead">{part.lead}</p>
      {part.steps.map((s, i) => (
        <div key={s.title} className="pg-step" style={{ borderLeftColor: accent }}>
          <span className="pg-num" style={{ color: accent }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        </div>
      ))}
    </section>
  );

  return (
    <div lang={lang} className="pg">
      <div className="pg-cover">
        <div className="pg-stars" />
        <div className="pg-planet-wrap">
          <div className="pg-ring pg-ring-back" />
          <div className="pg-planet" />
          <div className="pg-ring pg-ring-front" />
        </div>
        <p className="pg-brand">CONNECTING UNIVERSE</p>
        <h1 className="pg-title">{g.title}</h1>
        <p className="pg-sub">{g.subtitle}</p>
        <div className="pg-rule" />
      </div>

      <main className="pg-body">
        <section className="pg-section">
          <p className="pg-eyebrow">{g.welcome}</p>
          <h2 className="pg-h1">{g.before}</h2>
          <p className="pg-lead">{g.intro}</p>
        </section>
        <Section part={g.visualize} accent="#7c5cff" />
        <Section part={g.universe} accent="#d99a1e" />
        <section className="pg-section pg-break">
          <p className="pg-eyebrow">{g.ritual.eyebrow}</p>
          <h2 className="pg-h1">{g.ritual.heading}</h2>
          <p className="pg-lead">{g.ritual.lead}</p>
          <div className="pg-two">
            {(
              [
                [g.morning, g.ritual.morning],
                [g.evening, g.ritual.evening],
              ] as const
            ).map(([title, items]) => (
              <div key={title} className="pg-box">
                <h3>{title}</h3>
                <ul>
                  {items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <h2 className="pg-h1 pg-mt">{g.affirmationsTitle}</h2>
          {g.affirmations.map((a) => (
            <p key={a} className="pg-quote">
              “{a}”
            </p>
          ))}
          <p className="pg-lead pg-mt">{g.closing}</p>
          <p className="pg-line">{g.myGoal}: ______________________________________________</p>
          <p className="pg-line">{g.myStep}: ______________________________________________</p>
        </section>
      </main>
    </div>
  );
}
