/**
 * Phonetic typing: Singlish -> Sinhala and Tanglish -> Tamil.
 * Only runs of Latin letters are converted; numbers, symbols and text that is
 * already Sinhala/Tamil pass through unchanged.
 */

type Table = {
  consonants: [string, string][];
  independent: [string, string][];
  signs: [string, string][];
  hal: string;
};

// Longest keys first so "th" wins over "t", "aa" over "a", etc.
const byLength = (rows: [string, string][]) => [...rows].sort((a, b) => b[0].length - a[0].length);

const SI: Table = {
  consonants: byLength([
    ["nndh", "ඳ"], ["nng", "ඟ"], ["nnd", "ඬ"], ["mmb", "ඹ"],
    ["kh", "ඛ"], ["gh", "ඝ"], ["Ch", "ඡ"], ["ch", "ච"], ["jh", "ඣ"], ["ny", "ඤ"], ["kn", "ඥ"],
    ["Th", "ථ"], ["th", "ත"], ["Dh", "ධ"], ["dh", "ද"], ["ph", "ඵ"], ["bh", "භ"], ["Sh", "ෂ"], ["sh", "ශ"],
    // Common Singlish habit: d = ද (mudal, dan), D = ඩ (Dolar)
    ["T", "ඨ"], ["D", "ඩ"], ["N", "ණ"], ["L", "ළ"],
    ["k", "ක"], ["g", "ග"], ["c", "ච"], ["j", "ජ"], ["t", "ට"], ["d", "ද"], ["n", "න"],
    ["p", "ප"], ["b", "බ"], ["m", "ම"], ["y", "ය"], ["r", "ර"], ["l", "ල"], ["w", "ව"], ["v", "ව"],
    ["s", "ස"], ["h", "හ"], ["f", "ෆ"], ["q", "ක"], ["z", "ස"], ["x", "ක්ෂ"],
  ]),
  independent: byLength([
    ["aae", "ඈ"], ["AA", "ඈ"], ["ae", "ඇ"], ["A", "ඇ"], ["aa", "ආ"], ["ai", "ඓ"], ["au", "ඖ"], ["a", "අ"],
    ["ii", "ඊ"], ["i", "ඉ"], ["uu", "ඌ"], ["u", "උ"], ["ee", "ඒ"], ["e", "එ"], ["oo", "ඕ"], ["o", "ඔ"],
  ]),
  signs: byLength([
    ["aae", "ෑ"], ["AA", "ෑ"], ["ae", "ැ"], ["A", "ැ"], ["aa", "ා"], ["ai", "ෛ"], ["au", "ෞ"], ["a", ""],
    ["ii", "ී"], ["i", "ි"], ["uu", "ූ"], ["u", "ු"], ["ee", "ේ"], ["e", "ෙ"], ["oo", "ෝ"], ["o", "ො"],
  ]),
  hal: "්",
};

const TA: Table = {
  consonants: byLength([
    ["ndr", "ன்ற"], ["ng", "ங"], ["nj", "ஞ"], ["ny", "ஞ"], ["zh", "ழ"], ["sh", "ஷ"], ["ch", "ச"], ["th", "த"], ["dh", "த"],
    ["k", "க"], ["g", "க"], ["c", "ச"], ["s", "ச"], ["j", "ஜ"], ["t", "ட"], ["d", "ட"], ["N", "ண"], ["n", "ன"],
    ["p", "ப"], ["b", "ப"], ["f", "ப"], ["m", "ம"], ["y", "ய"], ["R", "ற"], ["r", "ர"], ["L", "ள"], ["l", "ல"],
    ["v", "வ"], ["w", "வ"], ["h", "ஹ"], ["q", "க"], ["z", "ஸ"], ["x", "க்ஸ"],
  ]),
  independent: byLength([
    ["aa", "ஆ"], ["A", "ஆ"], ["ai", "ஐ"], ["au", "ஔ"], ["a", "அ"], ["ii", "ஈ"], ["ee", "ஈ"], ["I", "ஈ"], ["i", "இ"],
    ["uu", "ஊ"], ["oo", "ஊ"], ["U", "ஊ"], ["u", "உ"], ["ae", "ஏ"], ["E", "ஏ"], ["e", "எ"], ["O", "ஓ"], ["o", "ஒ"],
  ]),
  signs: byLength([
    ["aa", "ா"], ["A", "ா"], ["ai", "ை"], ["au", "ௌ"], ["ae", "ே"], ["a", ""], ["ii", "ீ"], ["ee", "ீ"], ["I", "ீ"], ["i", "ி"],
    ["uu", "ூ"], ["oo", "ூ"], ["U", "ூ"], ["u", "ு"], ["E", "ே"], ["e", "ெ"], ["O", "ோ"], ["o", "ொ"],
  ]),
  hal: "்",
};

/** Case-sensitive match first (T, D, N, L, Sh, A...), then a lowercase match. */
function match(rows: [string, string][], s: string, i: number): [string, string] | null {
  for (const row of rows) if (s.startsWith(row[0], i)) return row;
  const lower = s.toLowerCase();
  for (const row of rows) if (row[0] === row[0].toLowerCase() && lower.startsWith(row[0], i)) return row;
  return null;
}

function convertWord(word: string, tb: Table, tamil: boolean): string {
  let out = "";
  let i = 0;
  while (i < word.length) {
    const c = match(tb.consonants, word, i);
    if (c) {
      let glyph = c[1];
      // Tamil: "n" at the start of a word or before "th"/"d" is ந
      if (tamil && c[0] === "n" && (i === 0 || /^(th|dh|d)/i.test(word.slice(i + 1)))) glyph = "ந";
      i += c[0].length;
      const v = match(tb.signs, word, i);
      if (v) {
        out += glyph + v[1];
        i += v[0].length;
      } else {
        out += glyph + tb.hal;
      }
      continue;
    }
    const v = match(tb.independent, word, i);
    if (v) {
      out += v[1];
      i += v[0].length;
      continue;
    }
    out += word[i];
    i += 1;
  }
  return out;
}

export type TypingLang = "si" | "en" | "ta";

export function transliterate(text: string, lang: TypingLang): string {
  if (lang === "en") return text;
  const tb = lang === "si" ? SI : TA;
  return text.replace(/[A-Za-z]+/g, (w) => convertWord(w, tb, lang === "ta"));
}
