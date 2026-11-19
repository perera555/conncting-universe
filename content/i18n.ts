import en, { type Dict } from "./en";
import si from "./si";
import ta from "./ta";

export type Lang = "si" | "en" | "ta";
export const LANGS: Lang[] = ["si", "en", "ta"];
export const DEFAULT_LANG: Lang = "si";

export const LANG_LABEL: Record<Lang, string> = { si: "සිංහල", en: "English", ta: "தமிழ்" };
export const LANG_LOCALE: Record<Lang, string> = { si: "si-LK", en: "en-GB", ta: "ta-LK" };

/** Home URL for each language. Sinhala is the main language, served at "/". */
export const langHref = (l: Lang) => (l === DEFAULT_LANG ? "/" : `/${l}`);
export const pdfHref = (l: Lang) => `/cosmic-goal-guide-${l}.pdf`;

const DICTS: Record<Lang, Dict> = { en, si, ta };
export const getDict = (l: Lang) => DICTS[l];
export const isLang = (s: string): s is Lang => (LANGS as string[]).includes(s);
export type { Dict };
