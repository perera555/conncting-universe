import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEFAULT_LANG, LANGS, getDict, isLang } from "@/content/i18n";
import Home from "../ui/home";

// English and Tamil get their own static pages; Sinhala is served at "/".
export function generateStaticParams() {
  return LANGS.filter((l) => l !== DEFAULT_LANG).map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: { si: "/", en: "/en", ta: "/ta" } },
  };
}

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang) || lang === DEFAULT_LANG) notFound();
  return <Home lang={lang} />;
}
