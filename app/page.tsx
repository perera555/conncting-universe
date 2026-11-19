import type { Metadata } from "next";
import { DEFAULT_LANG, getDict } from "@/content/i18n";
import Home from "./ui/home";

// Sinhala is the main language and lives at "/".
const t = getDict(DEFAULT_LANG);

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: { languages: { si: "/", en: "/en", ta: "/ta" } },
};

export default function Page() {
  return <Home lang={DEFAULT_LANG} />;
}
