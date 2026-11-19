// Builds public/cosmic-goal-guide-{si,en,ta}.pdf from the /print/[lang] pages.
// Usage: npm run build && npm run pdf
// Uses headless Microsoft Edge or Chrome so Sinhala and Tamil text is shaped correctly.
import { spawn, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const PORT = 3123;
const LANGS = ["si", "en", "ta"];
const root = path.resolve(import.meta.dirname, "..");

const candidates = [
  process.env.BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) throw new Error("No Edge/Chrome found. Set BROWSER=/path/to/chrome");

const server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "-p", String(PORT)], {
  cwd: root,
  stdio: "ignore",
});

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/print/en`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not start");
}

try {
  await waitForServer();
  for (const lang of LANGS) {
    const out = path.join(root, "public", `cosmic-goal-guide-${lang}.pdf`);
    execFileSync(browser, [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--virtual-time-budget=15000",
      `--print-to-pdf=${out}`,
      `http://localhost:${PORT}/print/${lang}`,
    ], { stdio: "ignore" });
    console.log("wrote", path.relative(root, out));
  }
} finally {
  server.kill();
}
