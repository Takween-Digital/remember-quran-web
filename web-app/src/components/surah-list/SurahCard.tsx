"use client"

import Link from "next/link"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Chapter } from "@/types/quran"
import { useHifz } from "@/context/HifzContext"
import { useSurahContentOptional } from "@/context/SurahContentContext"
import { cn } from "@/lib/utils"

interface SurahCardProps {
  chapter: Chapter
}

/**
 * Home chapter tile.
 *
 * The surah number sits inside an 8-point rosette — the classic "rub el
 * hizb" star (two overlapping squares) used to mark divisions in the mushaf
 * — rendered as a real SVG so its two squares can bloom independently on
 * hover rather than a single frame flipping in place. `size-10` keeps the
 * ornament at a fixed 40×40 badge that scales with the root font size (zoom,
 * user font-size preferences) exactly like every other rem-sized control on
 * the page, so it stays correct at any viewport.
 *
 * The Arabic name is the visual anchor on the trailing edge.
 */
export function SurahCard({ chapter }: SurahCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isMakki = chapter.revelation_place === "makkah"
  const { getMemorisedCountForSurah } = useHifz()
  const surahContent = useSurahContentOptional()

  const memorisedCount = getMemorisedCountForSurah(chapter.id)
  const memorisedPct = chapter.verses_count > 0
    ? Math.round((memorisedCount / chapter.verses_count) * 100)
    : 0

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    startTransition(() => {
      router.push(`/${chapter.id}`)
    })
  }

  return (
    <Link
      href={`/${chapter.id}`}
      prefetch={true}
      onClick={handleClick}
      onMouseEnter={() => surahContent?.prefetchSurah(chapter.id)}
      onTouchStart={() => surahContent?.prefetchSurah(chapter.id)}
      dir="ltr"
      className={cn(
        "@container group relative flex items-center gap-3.5 rounded-[var(--radius-card)] border bg-card p-4 transition duration-(--dur-base) ease-(--ease-out)",
        isPending 
          ? "border-gold-strong/50 shadow-[0_4px_12px_rgba(182,152,91,0.08)] bg-gold-strong/5" 
          : "border-border/50 hover:-translate-y-[1px] hover:border-gold-strong/30 hover:shadow-[0_4px_12px_rgba(182,152,91,0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <span className="relative grid size-10 shrink-0 place-items-center">
        <svg
          aria-hidden
          viewBox="0 0 40 40"
          className={cn(
            "absolute inset-0 size-full transition-colors duration-(--dur-slow) ease-(--ease-out)",
            isPending ? "text-gold" : memorisedCount > 0 ? "text-primary" : "text-muted-foreground group-hover:text-gold",
          )}
        >
          <rect
            x="8"
            y="8"
            width="24"
            height="24"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth={memorisedCount > 0 || isPending ? "1.75" : "1.25"}
            style={{ transformOrigin: "20px 20px" }}
            className={cn(
              "transition-transform duration-(--dur-slow) ease-(--ease-out)",
              isPending ? "-rotate-[14deg]" : "group-hover:-rotate-[14deg]"
            )}
          />
          <g transform="rotate(45 20 20)">
            <rect
              x="8"
              y="8"
              width="24"
              height="24"
              rx="4"
              fill="none"
              stroke="currentColor"
              strokeWidth={memorisedCount > 0 || isPending ? "1.75" : "1.25"}
              style={{ transformOrigin: "20px 20px" }}
              className={cn(
                "transition-transform duration-(--dur-slow) ease-(--ease-out)",
                isPending ? "rotate-[59deg]" : "group-hover:rotate-[59deg]"
              )}
            />
          </g>
        </svg>
        
        {isPending ? (
          <svg 
            className="w-4 h-4 text-gold animate-[spin_3s_linear_infinite] relative" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2L14.8 7.2L20.5 6L19 11.5L23.5 15.5L18 17.5L16.5 23L12 19L7.5 23L6 17.5L0.5 15.5L5 11.5L3.5 6L9.2 7.2L12 2ZM12 5.5L10 8.5L6.5 7.5L7.5 11L4.5 14L8 15L9 18.5L12 16L15 18.5L16 15L19.5 14L16.5 11L17.5 7.5L14 8.5L12 5.5Z" />
          </svg>
        ) : (
          <span
            data-numeric
            className={cn(
              "relative font-mono text-xs font-medium transition-colors duration-(--dur-slow) ease-(--ease-out)",
              memorisedCount > 0 ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-gold",
            )}
          >
            {chapter.id}
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium leading-tight text-foreground">
          {chapter.name_simple}
        </span>
        <span className="mt-0.5 block truncate text-xs text-subtle">
          {chapter.translated_name.name}
        </span>
        <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-subtle">
          <span data-numeric className="font-mono">{chapter.verses_count} ayahs</span>
          <span aria-hidden>·</span>
          <span
            className={cn(
              "rounded px-1.5 py-px text-[10px] font-medium leading-none",
              isMakki
                ? "bg-gold-soft text-gold-strong"
                : "bg-accent text-accent-foreground",
            )}
          >
            {isMakki ? "Makki" : "Madani"}
          </span>
          {memorisedCount > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="rounded bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary leading-none">
                {memorisedPct}% Hifz
              </span>
            </>
          )}
        </span>
      </span>

      <span
        className="shrink-0 font-arabic-ui text-xl font-medium tracking-normal leading-none text-reader-ink/85 transition-colors duration-(--dur-base) ease-(--ease-out) group-hover:text-reader-ink"
        dir="rtl"
        lang="ar"
      >
        {chapter.name_arabic}
      </span>
    </Link>
  )
}
