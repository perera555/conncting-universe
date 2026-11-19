import { getDict, LANG_LOCALE, type Lang } from "@/content/i18n";
import Starfield from "./starfield";
import Planet from "./planet";
import Tilt from "./tilt";
import RevealOnScroll from "./reveal";
import Planner from "./planner";
import GoalStudio from "./goal-studio";
import VideoWall from "./video-wall";
import Motivation from "./motivation";
import { FirstVisitLanguage, LangSwitch, PdfButton } from "./language";
import InstallButton from "./install";

function SectionHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <header className="reveal mx-auto mb-14 max-w-3xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display mt-4 text-4xl leading-tight md:text-6xl">{title}</h2>
      <p className="mt-5 text-lg text-muted">{lead}</p>
    </header>
  );
}

function Steps({ steps, color, label }: { steps: { title: string; body: string }[]; color: string; label: string }) {
  return (
    <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.title} className="reveal" style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
          <Tilt className="h-full rounded-3xl">
            <div className="glass h-full rounded-3xl p-7">
              <div className="pop flex items-center gap-4">
                <span className="orb-num font-display text-xl" style={{ ["--c" as string]: color }}>
                  {i + 1}
                </span>
                <span className="text-xs tracking-[0.2em] text-muted uppercase">
                  {label} {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="pop-sm font-display mt-5 text-2xl">{s.title}</h3>
              <p className="pop-sm mt-3 leading-relaxed text-muted">{s.body}</p>
            </div>
          </Tilt>
        </li>
      ))}
    </ol>
  );
}

export default function Home({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const g = t.guide;
  const nav = [
    ["#planner", t.nav.planner],
    ["#studio", t.nav.studio],
    ["#visualize", t.nav.visualize],
    ["#universe", t.nav.universe],
    ["#videos", t.nav.videos],
    ["#motivate", t.nav.motivate],
    ["#guide", t.nav.guide],
  ] as const;

  return (
    <div lang={lang}>
      <Starfield />
      <RevealOnScroll />
      <FirstVisitLanguage current={lang} />

      <div className="relative z-10">
        <nav className="no-print sticky top-0 z-50 border-b border-white/5 bg-night/50 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
            <a href="#top" className="font-display flex items-center gap-2 text-lg font-semibold whitespace-nowrap md:text-xl">
              <span className="inline-block h-6 w-6 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff,#8b6cff_45%,#2a1570)] shadow-[0_0_16px_#8b6cff]" />
              <span className="hidden sm:inline">Connecting Universe</span>
            </a>
            <div className="hidden items-center gap-5 text-sm text-muted xl:flex">
              {nav.map(([href, label]) => (
                <a key={href} href={href} className="transition hover:text-ink">
                  {label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <InstallButton t={t.install} />
              <LangSwitch current={lang} />
              <PdfButton label={`⬇ ${t.nav.pdf}`} className="btn btn-primary hidden px-4 py-2 text-sm sm:inline-flex" />
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section id="top" className="no-print mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-4 py-16 md:px-8 lg:grid-cols-2">
          <div className="fade-in">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1 className="hero-title font-display mt-6 font-semibold">
              {t.hero.title1} <span className="text-cosmic italic">{t.hero.title2}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">{t.hero.lead}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#planner" className="btn btn-primary">
                ✦ {t.hero.ctaStart}
              </a>
              <PdfButton label={`⬇ ${t.hero.ctaPdf}`} className="btn btn-ghost" />
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 text-center">
              {t.hero.stats.map(([n, l]) => (
                <div key={l} className="glass rounded-2xl p-3">
                  <dt className="font-display text-3xl text-gold">{n}</dt>
                  <dd className="text-xs text-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid place-items-center py-10">
            <div className="hidden md:block">
              <Planet size={360} />
            </div>
            <div className="md:hidden">
              <Planet size={200} />
            </div>
          </div>
        </section>

        {/* Planner */}
        <section id="planner" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-8">
          <div className="no-print">
            <SectionHead eyebrow={t.planner.eyebrow} title={t.planner.title} lead={t.planner.lead} />
          </div>
          <Planner t={t.planner} locale={LANG_LOCALE[lang]} />
        </section>

        {/* My goals */}
        <section id="studio" className="no-print mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8">
          <SectionHead eyebrow={t.studio.eyebrow} title={t.studio.title} lead={t.studio.lead} />
          <GoalStudio t={t.studio} p={t.planner} />
        </section>

        <div className="no-print">
          {/* Visualize */}
          <section id="visualize" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8">
            <SectionHead eyebrow={g.visualize.eyebrow} title={g.visualize.heading} lead={g.visualize.lead} />
            <Steps steps={g.visualize.steps} color="#8b6cff" label={g.stepLabel} />
          </section>

          {/* Universe */}
          <section id="universe" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8">
            <SectionHead eyebrow={g.universe.eyebrow} title={g.universe.heading} lead={g.universe.lead} />
            <Steps steps={g.universe.steps} color="#f5c86b" label={g.stepLabel} />

            <div className="reveal mt-16 grid gap-6 md:grid-cols-2">
              {(
                [
                  [t.ritual.morningTitle, g.ritual.morning],
                  [t.ritual.eveningTitle, g.ritual.evening],
                ] as const
              ).map(([title, items]) => (
                <Tilt key={title} className="rounded-3xl" max={6}>
                  <div className="glass rounded-3xl p-8">
                    <h3 className="pop font-display text-3xl">{title}</h3>
                    <ul className="pop-sm mt-5 space-y-3">
                      {items.map((x) => (
                        <li key={x} className="flex gap-3 text-muted">
                          <span className="text-gold">✦</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tilt>
              ))}
            </div>
          </section>

          {/* Videos */}
          <section id="videos" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8">
            <SectionHead eyebrow={t.videos.eyebrow} title={t.videos.title} lead={t.videos.lead} />
            <VideoWall t={t.videos} />
          </section>

          {/* Motivation */}
          <section id="motivate" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8">
            <SectionHead eyebrow={t.motivate.eyebrow} title={t.motivate.title} lead={t.motivate.lead} />
            <Motivation t={t.motivate} />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {t.motivate.ideas.map((idea, i) => (
                <div key={idea.title} className="reveal" style={{ transitionDelay: `${(i % 4) * 80}ms` }}>
                  <Tilt className="h-full rounded-3xl">
                    <div className="glass h-full rounded-3xl p-6">
                      <p className="pop text-4xl">{idea.icon}</p>
                      <h3 className="pop-sm mt-4 font-semibold">{idea.title}</h3>
                      <p className="pop-sm mt-2 text-sm text-muted">{idea.body}</p>
                    </div>
                  </Tilt>
                </div>
              ))}
            </div>
            <div className="reveal mt-14">
              <p className="eyebrow mb-5 text-center">{t.motivate.affirmations}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {g.affirmations.map((a) => (
                  <span key={a} className="glass rounded-full px-5 py-2 text-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* PDF guide */}
          <section id="guide" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-8">
            <div className="reveal">
              <Tilt className="rounded-[2.5rem]" max={5}>
                <div className="glass relative overflow-hidden rounded-[2.5rem] p-8 md:p-14">
                  <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-violet/30 blur-3xl" />
                  <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto]">
                    <div className="pop">
                      <p className="eyebrow">{t.pdf.eyebrow}</p>
                      <h2 className="font-display mt-4 text-4xl md:text-6xl">{g.title}</h2>
                      <p className="mt-4 max-w-xl text-lg text-muted">
                        {g.subtitle}. {t.pdf.desc}
                      </p>
                      <ul className="mt-6 space-y-2 text-muted">
                        {t.pdf.bullets.map((b) => (
                          <li key={b}>✦ {b}</li>
                        ))}
                      </ul>
                      <div className="mt-8 flex flex-wrap gap-4">
                        <PdfButton label={t.pdf.download} className="btn btn-primary" />
                        <PdfButton label={t.pdf.view} className="btn btn-ghost" view />
                      </div>
                      <p className="mt-4 text-xs text-muted">සිංහල · English · தமிழ்</p>
                    </div>
                    {/* 3D book */}
                    <div className="scene mx-auto">
                      <div className="book relative h-72 w-52">
                        <div className="book-cover absolute inset-0 rounded-l-sm rounded-r-xl p-5">
                          <div className="mx-auto mt-6 h-20 w-20 rounded-full bg-[radial-gradient(circle_at_30%_28%,#fff,#b9a2ff_20%,#7c5cff_50%,#2e1a78)] shadow-[0_0_40px_#8b6cff]" />
                          <p className="mt-8 text-center text-[9px] tracking-[0.3em] text-gold">CONNECTING UNIVERSE</p>
                          <p className="font-display mt-2 text-center text-xl leading-tight">{g.title}</p>
                        </div>
                        <div className="book-pages absolute top-1 bottom-1 left-0 w-7" />
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </div>
          </section>

          <footer className="border-t border-white/5 px-4 py-10 text-center text-sm text-muted">
            <p className="font-display mx-auto max-w-3xl text-lg text-ink">{g.closing}</p>
            <p className="mt-4">© Connecting Universe · {t.footer}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
