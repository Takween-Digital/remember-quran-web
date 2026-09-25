"use client"

import { ScrollText, BookOpenCheck } from "lucide-react"
import { useReaderSettings, type ReadingLayout } from "@/context/ReaderSettingsContext"
import { cn } from "@/lib/utils"

const OPTIONS: {
  value: ReadingLayout
  label: string
  description: string
  icon: typeof ScrollText
}[] = [
  {
    value: "scroll",
    label: "Scroll",
    description: "Continuous vertical flow through pages",
    icon: ScrollText,
  },
  {
    value: "paged",
    label: "Paged",
    description: "Turn one Mushaf page at a time — swipe or use arrow keys",
    icon: BookOpenCheck,
  },
]

/** Reading-mode-only sub-setting — how pages are navigated (E-06). */
export function ReadingLayoutToggle() {
  const { readingLayout, setReadingLayout } = useReaderSettings()

  return (
    <div role="radiogroup" aria-label="Page navigation" className="grid grid-cols-1 gap-1.5">
      {OPTIONS.map(({ value, label, description, icon: Icon }) => {
        const active = readingLayout === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setReadingLayout(value)}
            className={cn(
              "flex w-full items-start gap-4 rounded-xl px-2 py-3 text-start",
              "transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              active ? "bg-muted/30" : "hover:bg-muted/50"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border",
                active
                  ? "bg-background border-primary/30 text-primary shadow-sm"
                  : "bg-muted/30 border-border/50 text-muted-foreground/70",
              )}
            >
              <Icon className="size-4" strokeWidth={active ? 2 : 1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn("block text-[15px] font-medium transition-colors", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
              <span
                className={cn(
                  "mt-1 block text-[11px] leading-snug font-medium transition-colors",
                  active ? "text-foreground/70" : "text-muted-foreground/60",
                )}
              >
                {description}
              </span>
            </span>
            <span
              className={cn(
                "mt-2 size-2 shrink-0 rounded-full transition-colors",
                active ? "bg-primary" : "border border-border bg-transparent",
              )}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
