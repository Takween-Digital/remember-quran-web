"use client"

import { LayoutList, AlignLeft } from "lucide-react"
import { useReaderSettings, type DisplayMode } from "@/context/ReaderSettingsContext"
import { cn } from "@/lib/utils"
import { hapticFeedback } from "@/lib/haptics"

const OPTIONS: {
  value: DisplayMode
  label: string
  description: string
  icon: typeof LayoutList
}[] = [
  {
    value: "verse",
    label: "Verse by verse",
    description: "Each ayah on its own, with translation underneath",
    icon: LayoutList,
  },
  {
    value: "reading",
    label: "Reading",
    description: "Continuous Arabic flow, like a printed mushaf",
    icon: AlignLeft,
  },
]

export function DisplayModeToggle() {
  const { displayMode, setDisplayMode } = useReaderSettings()

  return (
    <div
      role="radiogroup"
      aria-label="Display mode"
      className="grid grid-cols-1 gap-1.5"
    >
      {OPTIONS.map(({ value, label, description, icon: Icon }) => {
        const active = displayMode === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              if (!active) {
                hapticFeedback("light");
                setDisplayMode(value);
              }
            }}
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
                "mt-2 size-4 shrink-0 rounded-full transition-all duration-300 flex items-center justify-center",
                active ? "bg-primary" : "border-2 border-muted-foreground/40 bg-background shadow-sm",
              )}
              aria-hidden="true"
            >
              {active && <span className="size-1.5 rounded-full bg-background" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
