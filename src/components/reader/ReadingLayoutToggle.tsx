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
              "flex w-full items-start gap-3 rounded-md px-2.5 py-2.5 text-left",
              "transition-colors duration-[120ms]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
              active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border",
                active
                  ? "border-primary/25 bg-primary/10"
                  : "border-border bg-muted/60 text-muted-foreground",
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[11px] leading-snug",
                  active ? "text-primary/75" : "text-muted-foreground",
                )}
              >
                {description}
              </span>
            </span>
            <span
              className={cn(
                "mt-1 size-1.5 shrink-0 rounded-full",
                active ? "bg-primary" : "border border-muted-foreground/40",
              )}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
