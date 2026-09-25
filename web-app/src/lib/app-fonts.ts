import {
  Newsreader,
  Public_Sans,
  Noto_Naskh_Arabic,
  JetBrains_Mono,
  Amiri,
  Amiri_Quran,
} from "next/font/google"

/** Display, long-form prose, headings — regular weight only. */
export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  axes: ["opsz"],
  adjustFontFallback: true,
  fallback: ["Georgia", "serif"],
})

/** All UI chrome: nav, labels, buttons, metadata. */
export const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["system-ui", "sans-serif"],
})

/** Arabic UI text — surah names in lists, NOT revelation text. */
export const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-naskh",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["Arial", "sans-serif"],
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["ui-monospace", "monospace"],
})

/**
 * Kept as fallback for Quranic Arabic.
 * Primary Arabic is UthmanicHafs (local @font-face in globals.css).
 */
export const amiri = Amiri({
  weight: "400",
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["Arial", "sans-serif"],
})

export const amiriQuran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic", "latin"],
  variable: "--font-amiri-quran",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["Arial", "sans-serif"],
})
