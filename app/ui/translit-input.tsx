"use client";

import { useRef, type ChangeEvent } from "react";
import { transliterate, type TypingLang } from "@/content/translit";

type Props = {
  id: string;
  value: string;
  onChange: (v: string) => void;
  typing: TypingLang;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
};

/**
 * Text box with phonetic typing. We keep the raw Latin keystrokes and show
 * their Sinhala/Tamil conversion, so "m" -> "ම්", "ma" -> "ම", "mama" -> "මම".
 * Typing at the end and backspace work like a phone keyboard; editing in the
 * middle or pasting simply keeps the text as it is.
 */
export default function TranslitInput({ id, value, onChange, typing, placeholder, className, multiline, rows }: Props) {
  // base: text kept exactly as is. raw: Latin keystrokes typed after it.
  const base = useRef(value);
  const raw = useRef("");
  const shown = useRef(value);
  const mode = useRef(typing);

  const freeze = (text: string) => {
    base.current = text;
    raw.current = "";
    shown.current = text;
  };

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Value changed from outside (example chip, reset) or typing language switched: keep text as is.
    if (value !== shown.current || typing !== mode.current) {
      freeze(value);
      mode.current = typing;
    }
    const next = e.target.value;
    const prev = shown.current;
    if (typing === "en") {
      freeze(next);
    } else if (next.startsWith(prev) && next.length > prev.length && next.length - prev.length <= 2) {
      raw.current += next.slice(prev.length); // typed at the end (1–2 keys at a time)
    } else if (prev.startsWith(next) && raw.current) {
      raw.current = raw.current.slice(0, -1); // backspace: remove one keystroke
    } else {
      freeze(next); // edit in the middle, paste, or deleting older text
    }
    const out = base.current + transliterate(raw.current, typing);
    shown.current = out;
    onChange(out);
  };

  const common = {
    id,
    value,
    onChange: handle,
    placeholder,
    className,
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: typing === "en",
  };
  return multiline ? <textarea {...common} rows={rows} /> : <input {...common} />;
}
