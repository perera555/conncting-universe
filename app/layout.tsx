import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond, Manrope, Noto_Sans_Sinhala, Noto_Serif_Sinhala, Noto_Sans_Tamil, Noto_Serif_Tamil,
} from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display-latin",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});
const body = Manrope({ variable: "--font-body-latin", subsets: ["latin"] });

// Sinhala and Tamil faces: the browser picks them per character via unicode-range.
const siSans = Noto_Sans_Sinhala({ variable: "--font-si-sans", subsets: ["sinhala"], preload: false });
const siSerif = Noto_Serif_Sinhala({ variable: "--font-si-serif", subsets: ["sinhala"], weight: ["500", "700"], preload: false });
const taSans = Noto_Sans_Tamil({ variable: "--font-ta-sans", subsets: ["tamil"], preload: false });
const taSerif = Noto_Serif_Tamil({ variable: "--font-ta-serif", subsets: ["tamil"], weight: ["500", "700"], preload: false });

export const metadata: Metadata = {
  title: "Connecting Universe",
  description: "Visualize your goal, complete it, and let the universe help.",
};

export const viewport: Viewport = {
  themeColor: "#07051a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [display, body, siSans, siSerif, taSans, taSerif].map((f) => f.variable).join(" ");
  return (
    <html lang="si" className={`${fonts} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
