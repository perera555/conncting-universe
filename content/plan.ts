/** Language-independent planning logic: goal category detection, money parsing and timeline math. */

export type CategoryKey = "career" | "money" | "health" | "love" | "study" | "home" | "peace" | "general";
export type Unit = "days" | "weeks" | "months" | "years";

// Keywords in English, Sinhala and Tamil (people often mix languages).
const KEYWORDS: Record<Exclude<CategoryKey, "general">, string[]> = {
  money: [
    "money", "million", "rich", "wealth", "income", "debt", "salary", "$", "rs", "lakh", "crore", "dollar", "rupee",
    "salli", "mudal", "miliyan", "laksha", "dolar", "panam", "kaasu",
    "සල්ලි", "මුදල", "මිලියන", "මිල්ලි", "ලක්ෂ", "කෝටි", "ධනය", "ණය", "ඩොලර්", "දොලර්", "රුපියල්",
    "பணம்", "பனம்", "மில்லியன்", "லட்சம்", "கோடி", "செல்வம்", "கடன்", "டாலர்", "ரூபாய்",
  ],
  career: [
    "job", "career", "business", "company", "promotion", "work", "client", "startup", "shop", "abroad",
    "rakshawa", "rassawa", "rakiyawa", "wyaparaya", "business", "velai", "thozhil",
    "රැකියා", "රක්ශ", "රක්ෂ", "රස්ස", "ව්‍යාපාර", "සමාගම", "උසස්වීම", "වැඩ", "විදේශ", "කඩය",
    "வேலை", "வெலை", "தொழில்", "வியாபார", "நிறுவன", "பதவி", "வெளிநாட்டு", "கடை",
  ],
  health: [
    "health", "weight", "kg", "fit", "gym", "heal", "sick", "marathon", "body", "diet",
    "සෞඛ්‍ය", "බර", "නිරෝගී", "සුව", "ශරීර", "ලෙඩ",
    "ஆரோக்கிய", "எடை", "உடல்", "நோய்", "குணம்",
  ],
  love: [
    "love", "marry", "marriage", "wife", "husband", "partner", "relationship", "girlfriend", "boyfriend",
    "ආදර", "විවාහ", "බිරිඳ", "සැමියා", "සබඳතා",
    "காதல்", "திருமண", "மனைவி", "கணவன்", "உறவு",
  ],
  study: [
    "exam", "study", "degree", "university", "school", "pass", "marks", "a/l", "o/l", "scholarship",
    "විභාග", "අධ්‍යාපන", "උපාධි", "සරසවි", "පාසල", "ලකුණු", "ශිෂ්‍යත්ව",
    "தேர்வு", "படிப்பு", "பட்டம்", "பல்கலை", "பள்ளி", "மதிப்பெண்",
  ],
  home: [
    "house", "home", "land", "family", "car", "apartment", "build",
    "නිවස", "ගෙදර", "ඉඩම", "පවුල", "වාහන", "ගෙයක්",
    "வீடு", "நிலம்", "குடும்ப", "கார்",
  ],
  peace: [
    "peace", "calm", "spirit", "meditation", "stress", "anxiety", "happy", "happiness",
    "සාම", "සන්සුන්", "භාවනා", "සතුට", "ආතතිය",
    "அமைதி", "தியான", "மன அழுத்த", "மகிழ்ச்சி",
  ],
};

const ZERO_START = [
  "broke", "no job", "nojob", "no money", "unemployed", "jobless", "nothing", "poor", "debt",
  "දුප්පත්", "ණය", "කිසිවක් නැ", "කඩන්", "kadan", "duppath",
  "கடன்", "ஏழை", "ஒன்றும் இல்லை",
];
// "no" words and "job/money" words in English, Sinhala, Singlish, Tamil and Tanglish
const NEGATION = /\bno\b|\bnot\b|without|nae|naha|nehe|nathi|nomath|nometh|\bna\b|නැ|නෑ|නොම|නහ|නැති|இல்லை|illai|illa/;
const JOB_OR_MONEY = /job|work|money|cash|income|salli|mudal|raksh|rassa|rakiy|rækiy|රැකියා|රක්ශ|රක්ෂ|රස්ස|සල්ලි|මුදල|වැඩ|වේලை|வேலை|பணம்|பனம்|velai|panam|kaasu/;

/** True when the person says they are starting with no job / no money. */
export const startsFromZero = (goal: string) => {
  const g = goal.toLowerCase();
  return ZERO_START.some((w) => g.includes(w)) || (NEGATION.test(g) && JOB_OR_MONEY.test(g));
};

export function detectCategory(goal: string): CategoryKey {
  const g = goal.toLowerCase();
  let best: CategoryKey = "general";
  let bestHits = 0;
  for (const [key, words] of Object.entries(KEYWORDS) as [CategoryKey, string[]][]) {
    const hits = words.reduce((n, w) => n + (g.includes(w) ? 1 : 0), 0);
    if (hits > bestHits) {
      best = key;
      bestHits = hits;
    }
  }
  return best;
}

/** A realistic default time period per goal type, used when the user leaves it empty. */
export const DEFAULT_PERIOD: Record<CategoryKey, { n: number; unit: Unit }> = {
  money: { n: 5, unit: "years" },
  career: { n: 6, unit: "months" },
  health: { n: 3, unit: "months" },
  love: { n: 1, unit: "years" },
  study: { n: 3, unit: "months" },
  home: { n: 2, unit: "years" },
  peace: { n: 1, unit: "months" },
  general: { n: 1, unit: "years" },
};

const MULTIPLIERS: [RegExp, number][] = [
  [/^(billion|bn|බිලියන|பில்லியன்)/, 1e9],
  [/^(crore|cr|කෝටි|கோடி)/, 1e7],
  [/^(mil+[a-z]*n|mn|m\b|mil\b|මිලියන|மில்லியன்)/, 1e6],
  [/^(lakh|lakhs|lac|ලක්ෂ|லட்ச)/, 1e5],
  [/^(thousand|k\b|දහස|ஆயிரம்)/, 1e3],
];

export type Money = { amount: number; currency: string };

/** Reads an amount like "$1 million", "Rs. 50 lakhs", "1,000,000", "ඩොලර් මිලියනයක්" from free text. */
const WORD_AMOUNTS: [RegExp, number][] = [
  [/billion|බිලියන|பில்லியன்/, 1e9],
  [/crore|කෝටි|கோடி/, 1e7],
  [/\bmil+[a-z]*n|මිලියන|මිල්ලි|மில்லியன்|மில்லி/, 1e6], // also typos like "milion" and Singlish "මිල්ලිඔන්"
  [/lakh|ලක්ෂ|லட்ச/, 1e5],
];

export function parseMoney(goal: string, isMoneyGoal: boolean): Money | null {
  const g = goal.toLowerCase().replace(/(\d),(\d)/g, "$1$2");
  let currency = "";
  if (/\$|dollar|dolar|usd|ඩොලර්|දොලර්|டாலர்|டொலர்/.test(g)) currency = "$";
  else if (/\brs\b|lkr|rupee|රුපියල්|රු\.|ரூபாய்|₹|inr/.test(g)) currency = "Rs. ";
  else if (/€|euro/.test(g)) currency = "€";
  else if (/£|pound/.test(g)) currency = "£";

  // Sinhala/Tamil often put the unit first: "ලක්ෂ 50", "கோடி 2"
  for (const [re, mult] of WORD_AMOUNTS) {
    const m = g.match(new RegExp(`(?:${re.source})\\S*\\s*(\\d+(?:\\.\\d+)?)(?!\\s*(?:kg|%))`));
    if (m && !new RegExp(`\\d\\s*(?:${re.source})`).test(g)) return { amount: parseFloat(m[1]) * mult, currency: currency || "$" };
  }

  for (const m of g.matchAll(/(\d+(?:\.\d+)?)\s*([^\s\d.,!?]*)/g)) {
    let n = parseFloat(m[1]);
    let scaled = false;
    for (const [re, mult] of MULTIPLIERS) {
      if (re.test(m[2] ?? "")) {
        n *= mult;
        scaled = true;
        break;
      }
    }
    // A bare number (e.g. a year like 2026) only counts when it clearly is money.
    if (n >= 1000 && (scaled || currency || isMoneyGoal)) return { amount: n, currency: currency || "$" };
  }
  // Amount written only as a word: "a million", "ඩොලර් මිලියනයක්", "ஒரு கோடி"
  for (const [re, mult] of WORD_AMOUNTS) {
    if (re.test(g)) return { amount: mult, currency: currency || "$" };
  }
  return null;
}

export function addPeriod(start: Date, n: number, unit: Unit): Date {
  const d = new Date(start);
  if (unit === "days") d.setDate(d.getDate() + n);
  if (unit === "weeks") d.setDate(d.getDate() + n * 7);
  if (unit === "months") d.setMonth(d.getMonth() + n);
  if (unit === "years") d.setFullYear(d.getFullYear() + n);
  return d;
}

export const daysBetween = (a: Date, b: Date) => Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));

/** Phase boundaries as cumulative shares of the whole period. */
export const PHASE_SHARES = [0.1, 0.35, 0.65, 0.9, 1];
/** Growth tends to be slow at first and faster later: share of the money target reached by each phase end. */
export const PHASE_MONEY = [0.02, 0.12, 0.35, 0.7, 1];

export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));

export function formatMoney(n: number, currency: string, locale: string) {
  const v = new Intl.NumberFormat(locale, { maximumFractionDigits: n < 100 ? 2 : 0 }).format(n);
  return `${currency}${v}`;
}
