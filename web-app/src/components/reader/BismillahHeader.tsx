"use client"

import { cn } from "@/lib/utils"
import { AQF_BISMILLAH_CHAR } from "@/lib/aqfFontMap"

interface BismillahHeaderProps {
  className?: string
}

/**
 * Authentic Calligraphic Bismillah Header (بسم الله الرحمن الرحيم)
 * Renders the single ornate ligature glyph from the aqf_bsml calligraphy
 * font (Thuluth-style, King Fahd Complex frontispiece design) rather than
 * plain Uthmani text — aqf_bsml has no coverage for standard Arabic
 * Unicode, only these purpose-built codepoints, so feeding it literal
 * Bismillah text silently fell back to a plain font instead of the
 * calligraphy. The glyph is decorative (aria-hidden); the real text lives
 * in the container's aria-label for screen readers.
 */
export function BismillahHeader({ className }: BismillahHeaderProps) {
  return (
    <div
      dir="rtl"
      lang="ar"
      role="banner"
      aria-label="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
      className={cn(
        "w-full flex items-center justify-center text-center select-none",
        className,
      )}
    >
      <p
        aria-hidden="true"
        className={cn(
          "aqf-bsml inline-block text-center text-reader-ink",
          // Reduced sizes so it doesn't crowd the page
          "text-[2rem] xs:text-[2.2rem] sm:text-[2.5rem] md:text-[2.8rem]",
          "leading-[1.15]",
          "transform-gpu translate-x-[3px] sm:translate-x-[5px]",
        )}
      >
        {AQF_BISMILLAH_CHAR}
      </p>
    </div>
  )
}
