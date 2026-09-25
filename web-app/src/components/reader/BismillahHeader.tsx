"use client"

import { cn } from "@/lib/utils"
import { Bismillah } from "@/components/ui/Bismillah"

interface BismillahHeaderProps {
  className?: string
}

/**
 * Authentic Calligraphic Bismillah Header (بسم الله الرحمن الرحيم)
 * Renders an inline SVG component for flawless rendering across all operating 
 * systems and browsers without relying on external web fonts, eliminating CLS.
 */
export function BismillahHeader({ className }: BismillahHeaderProps) {
  return (
    <div
      dir="rtl"
      lang="ar"
      role="banner"
      aria-label="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
      className={cn(
        "w-full flex items-center justify-center text-center select-none py-6",
        className,
      )}
    >
      <Bismillah className="w-48 sm:w-64 max-w-[80vw] text-reader-ink" />
    </div>
  )
}
