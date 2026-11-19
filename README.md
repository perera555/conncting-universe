# Connecting Universe

A 3D, three-language (සිංහල · English · தமிழ்) app to visualize a goal, get a dated plan, and invite the universe to help.

- **Universe Planner** — type a goal (e.g. "I'm broke, no job, I want $1 million"), choose urgent / not urgent, a time period or exact date, and feelings. You get: what to ask for and receive from the universe, a "starting from zero" path, the money pace per year/month/week/day, 5 dated milestones, your first 7 days, daily and weekly routines, a letter to the universe, a visualization script, signs and affirmations. The plan downloads automatically as a PDF.
- **My Goals** — saved plans with tickable steps and progress rings (stored privately in the browser).
- **Video wall** — add YouTube links for motivation.
- **Motivation** — quotes, daily ideas, affirmations.
- **PDF guide** — "The Cosmic Goal Guide" in all three languages.
- **Installable app (PWA)** — Windows, Mac, Android, iPhone/iPad.

Sinhala is the main language at `/`; English is at `/en`, Tamil at `/ta`.

## Develop

```bash
npm install
npm run dev
```

## Regenerate the guide PDFs

Edit the text in `content/si.ts`, `content/en.ts`, `content/ta.ts`, then:

```bash
npm run build
npm run pdf   # uses headless Edge/Chrome to print /print/{si,en,ta} into public/
```
