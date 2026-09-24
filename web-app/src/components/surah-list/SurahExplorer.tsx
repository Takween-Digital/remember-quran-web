"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"
import { SurahCard } from "./SurahCard"
import { SurahFilter, type SurahFilterValue } from "./SurahFilter"

function normalize(s: string): string {
  return s.trim().toLowerCase()
}

function matchesQuery(chapter: Chapter, query: string): boolean {
  const q = normalize(query)
  if (!q) return true
  return (
    chapter.name_simple.toLowerCase().includes(q) ||
    chapter.name_complex.toLowerCase().includes(q) ||
    chapter.translated_name.name.toLowerCase().includes(q) ||
    chapter.name_arabic.includes(query.trim()) ||
    String(chapter.id) === q
  )
}

function SurahSearchInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative w-full sm:w-80 md:w-96">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search surahs by name or number…"
        aria-label="Search surahs by name or number"
        className={cn(
          "h-11 w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-10 text-sm shadow-xs",
          "transition-all duration-(--dur-base) ease-(--ease-out)",
          "placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

/**
 * Full-directory explorer for the 114 surahs. Chapters wrap into a
 * responsive CSS grid instead of a single scrolling row: `auto-fill` with a
 * `minmax` floor lets the browser pick the column count per breakpoint —
 * one column on a phone, up to roughly ten on an ultrawide desktop — so
 * there's no breakpoint list to maintain and no card is ever squeezed
 * narrower than it can lay out its content.
 *
 * The revelation-place filter lives here as plain state rather than a DOM
 * attribute: the list is already client-rendered for search, so there is no
 * server-rendered output left to preserve by filtering-by-attribute.
 */
export function SurahExplorer({ chapters }: { chapters: Chapter[] }) {
  const [filter, setFilter] = useState<SurahFilterValue>("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () =>
      chapters
        .filter((c) => filter === "all" || c.revelation_place === filter)
        .filter((c) => matchesQuery(c, query)),
    [chapters, filter, query],
  )

  return (
    <section aria-labelledby="all-surahs-heading" className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {/* Left side: Directory title & Revelation filter */}
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
              Directory
            </p>
            <h2
              id="all-surahs-heading"
              className="mt-0.5 text-xl font-semibold tracking-tight text-foreground"
            >
              {filtered.length} {filtered.length === 1 ? "surah" : "surahs"}
            </h2>
          </div>

          <div className="sm:border-l sm:border-border/60 sm:pl-6">
            <SurahFilter value={filter} onChange={setFilter} />
          </div>
        </div>

        {/* Right side: Large Search Bar */}
        <div className="w-full sm:w-auto">
          <SurahSearchInput value={query} onChange={setQuery} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No surahs match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div
          dir="rtl"
          className={cn(
            "grid gap-3",
            "[grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]",
          )}
          role="list"
          aria-label="List of surahs"
        >
          {filtered.map((chapter) => (
            <div key={chapter.id} role="listitem">
              <SurahCard chapter={chapter} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
