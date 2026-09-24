"use client"

import type { ReactNode } from "react"
import { toArabicDigits } from "./AyahText"
import { cn } from "@/lib/utils"


/**
 * Authentic Printed Mushaf Page Frame (إطار المصحف الشريف)
 * Clean, plain, high-contrast manuscript canvas:
 * - Minimalist double gold hairline framing with subtle corner finials
 * - Crisp plain warm background (--reader-paper)
 * - Clear, readable header and footer cartouches
 */
const JUZ_NAMES_ARABIC: Record<number, string> = {
  1: "الأول",
  2: "الثاني",
  3: "الثالث",
  4: "الرابع",
  5: "الخامس",
  6: "السادس",
  7: "السابع",
  8: "الثامن",
  9: "التاسع",
  10: "العاشر",
  11: "الحادي عشر",
  12: "الثاني عشر",
  13: "الثالث عشر",
  14: "الرابع عشر",
  15: "الخامس عشر",
  16: "السادس عشر",
  17: "السابع عشر",
  18: "الثامن عشر",
  19: "التاسع عشر",
  20: "العشرون",
  21: "الحادي والعشرون",
  22: "الثاني والعشرون",
  23: "الثالث والعشرون",
  24: "الرابع والعشرون",
  25: "الخامس والعشرون",
  26: "السادس والعشرون",
  27: "السابع والعشرون",
  28: "الثامن والعشرون",
  29: "التاسع والعشرون",
  30: "الثلاثون",
}

export interface MushafPageFrameProps {
  pageNumber: number
  juzNumber?: number
  surahNameArabic?: string | null
  children: ReactNode
  marginBadges?: {
    id: string
    title: string
    number: number
    sublabel: string
    type: "juz" | "hizb" | "sajdah"
  }[]
  className?: string
  completionBadge?: ReactNode
  hasSurahStart?: boolean
}

export function MushafPageFrame({
  pageNumber,
  juzNumber,
  surahNameArabic,
  children,
  marginBadges = [],
  className,
  completionBadge,
  hasSurahStart = false,
}: MushafPageFrameProps) {
  const juzOrdinal = juzNumber ? JUZ_NAMES_ARABIC[juzNumber] || toArabicDigits(juzNumber) : ""
  const cleanSurahName = surahNameArabic ? surahNameArabic.replace(/^سورة\s+/i, "") : ""

  return (
    <div
      className={cn(
        // Fluid against the reader column's actual available width (see the
        // @container on its wrapper in [surahId]/layout.tsx) — scales
        // continuously with whatever space nav/Study-Panel state leaves,
        // instead of jumping between a handful of viewport breakpoints, and
        // still caps at the same 580px reading-comfort ceiling as before.
        "relative mx-auto my-3 sm:my-5 md:my-6 w-[min(100cqw,36.25rem)] px-1 sm:px-2 md:px-3",
        className,
      )}
    >
      {/* Outer Margin Badges (Desktop) */}
      {marginBadges.length > 0 && (
        <div className="absolute right-0 top-12 hidden flex-col gap-3 @[45rem]:flex translate-x-[calc(100%+6px)]">
          {marginBadges.map((badge) => (
            <div
              key={badge.id}
              dir="rtl"
              className={cn(
                "flex flex-col items-center justify-center rounded-sm border border-reader-paper-gilt/60 bg-reader-paper px-3 py-1.5 text-center shadow-xs",
                "transition-transform hover:scale-105",
              )}
            >
              <div className="flex items-center gap-1.5 text-reader-ink">
                <span className="font-uthmani text-base font-medium leading-none">
                  {badge.title}
                </span>
                <span className="font-uthmani text-xs font-medium leading-none">
                  {toArabicDigits(badge.number)}
                </span>
              </div>
              {badge.sublabel && (
                <span className="mt-1 text-[10px] font-mono tabular-nums text-muted-foreground">
                  {badge.sublabel}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Mushaf Page Container - King Fahd Complex Madani Manuscript Geometry */}
      <div
        className={cn(
          "relative transition duration-(--dur-slow)",
          "bg-reader-paper text-reader-ink",
          "border border-reader-paper-edge rounded-sm shadow-[var(--reader-paper-shadow)]",
          "p-1 sm:p-2.5 md:p-3.5",
          "aspect-[1/1.5] flex flex-col"
        )}
      >
        {/* Authentic Madani Double Gold Hairline Border Frame */}
        <div className="relative rounded-xs border-2 border-reader-paper-gilt p-0.5 sm:p-1 md:p-1.5 h-full flex flex-col min-h-0">
          <div className="relative rounded-xs border border-reader-paper-gilt/60 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Top Page Header: Classical Manuscript Header Bar (Surah and Juz) */}
            <header className="mb-2 sm:mb-3 flex items-center justify-between border-b-2 border-reader-paper-gilt/60 pb-1 px-1.5 select-none text-center">
              <div className="flex items-center gap-1.5">
                <span className="text-reader-paper-gilt-strong text-xs">۞</span>
                <span
                  className="font-uthmani font-medium text-reader-paper-ink-soft tracking-wide"
                  style={{ fontSize: "13px" }}
                >
                  {cleanSurahName ? `سورة ${cleanSurahName}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="font-uthmani font-medium text-reader-paper-ink-soft tracking-wide"
                  style={{ fontSize: "13px" }}
                >
                  {juzOrdinal ? `الجزء ${juzOrdinal}` : juzNumber ? `الجزء ${toArabicDigits(juzNumber)}` : ""}
                </span>
                <span className="text-reader-paper-gilt-strong text-xs">۞</span>
              </div>
            </header>

            {/* Main Quranic Text Body (15-line flow) */}
            <main className="relative z-10 flex-1 flex flex-col justify-start py-1 @container/page [container-type:inline-size] min-h-0">
              {children}
            </main>

            {/* Bottom Page Footer: Floating Medallion Design */}
            <footer
              aria-label={`Page ${pageNumber}`}
              className="mt-4 pb-2 relative flex items-end justify-center select-none"
            >
              {/* Calligraphic Border / Medallion (Hidden on Surah-start pages to prevent overlap with deep descenders) */}
              {!hasSurahStart && (
                <div className="relative flex items-center justify-center">
                  <div className="px-6 py-1 border-y-2 border-x border-reader-paper-gilt/60 rounded-[40%] bg-reader-paper-gilt/5 shadow-sm">
                    <span className="text-lg sm:text-xl text-reader-paper-ink-soft/90 font-medium">
                      {toArabicDigits(pageNumber)}
                    </span>
                  </div>
                </div>
              )}

              {/* Badges remain absolute to the right so they don't shift the centered number */}
              <div className="absolute right-0 bottom-2 px-4">
                {completionBadge}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
