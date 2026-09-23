"use client"

import { useReaderSettings, type ReaderTheme } from "@/context/ReaderSettingsContext"
import { cn } from "@/lib/utils"

const OPTIONS: { value: ReaderTheme; label: string; swatch: string }[] = [
  { value: "default", label: "Nur", swatch: "#faf3e1" },
  { value: "sepia", label: "Sepia", swatch: "#f4ead5" },
  { value: "parchment", label: "Parchment", swatch: "#e8dcc8" },
  { value: "amoled", label: "AMOLED", swatch: "#000000" },
]

/** Segmented control for the Mushaf page surface (E-07) — independent of
 * the site's own light/dark/modern theme; "Nur" defers to whichever of
 * those is active. */
export function ReaderThemeSelector() {
  const { readerTheme, setReaderTheme } = useReaderSettings()

  return (
    <div
      role="radiogroup"
      aria-label="Reading surface"
      className="flex gap-0.5 rounded-lg border border-border bg-muted p-0.5"
    >
      {OPTIONS.map(({ value, label, swatch }) => {
        const selected = readerTheme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setReaderTheme(value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-1.5 py-1.5 text-[11px] font-medium",
              "transition-[background-color,color,box-shadow] duration-(--dur-base) ease-(--ease-out)",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className="size-3 shrink-0 rounded-full border border-border-strong/50"
              style={{ backgroundColor: swatch }}
            />
            {label}
          </button>
        )
      })}
    </div>
  )
}
