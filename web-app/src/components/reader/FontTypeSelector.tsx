"use client"

import { useState } from "react"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { QURAN_FONT_OPTIONS, type QuranFont } from "@/lib/readerFonts"
import { cn } from "@/lib/utils"
import { hapticFeedback } from "@/lib/haptics"

type FontLoadingState = Partial<Record<QuranFont, boolean>>

export function FontTypeSelector() {
  const { quranFont, setQuranFont } = useReaderSettings()
  const [fontLoading, setFontLoading] = useState<FontLoadingState>({})
  const [showFeedback, setShowFeedback] = useState(false)

  const handleFontChange = (newFont: QuranFont) => {
    if (quranFont === newFont) return

    // Show loading state
    setFontLoading((prev) => ({ ...prev, [newFont]: true }))
    setShowFeedback(true)

    // Change font
    hapticFeedback("light")
    setQuranFont(newFont)

    // Simulate font load with a slight delay for visual feedback
    const timer = setTimeout(() => {
      setFontLoading((prev) => ({ ...prev, [newFont]: false }))
      // Keep feedback visible briefly
      setTimeout(() => setShowFeedback(false), 500)
    }, 600)

    return () => clearTimeout(timer)
  }

  return (
    <div role="radiogroup" aria-label="Arabic font" className="space-y-2">
      {/* Font Loading Feedback Toast */}
      {showFeedback && (
        <div className="mb-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="inline-flex size-4 animate-spin">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.3"
              />
              <path
                d="M12 2A10 10 0 0 1 12 22"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>Applying font...</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {QURAN_FONT_OPTIONS.map((opt) => {
          const active = quranFont === opt.value
          const loading = fontLoading[opt.value]

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={loading}
              onClick={() => handleFontChange(opt.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start",
                "transition-all duration-300 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
                loading && "opacity-60 cursor-wait",
                active && !loading
                  ? "bg-card shadow-sm border border-border/40 ring-2 ring-emerald-500/20"
                  : "bg-muted/50 border border-transparent hover:bg-muted/80 text-foreground",
              )}
            >
              {/* Font Preview Icon */}
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-lg border transition-all",
                  active && !loading
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                    : "border-border/50 bg-background/50 text-muted-foreground",
                  loading && "opacity-50",
                )}
              >
                <span
                  className={cn(
                    "text-lg leading-none font-semibold",
                    opt.value === "uthmani" ? "font-uthmani" : "font-kfgqpc-v2",
                  )}
                  dir="rtl"
                  lang="ar"
                  title={`Font Preview: ${opt.label}`}
                >
                  بسم
                </span>
              </span>

              {/* Font Info */}
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm font-semibold transition-colors",
                    active && !loading ? "text-emerald-900 dark:text-emerald-400" : "text-foreground",
                  )}
                >
                  {opt.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-[11px] leading-snug transition-colors",
                    active && !loading ? "text-emerald-700/70 dark:text-emerald-400/70" : "text-muted-foreground",
                  )}
                >
                  {opt.description}
                </span>
              </span>

              {/* Status Indicator */}
              {loading ? (
                <span className="size-4 shrink-0 animate-spin">
                  <svg
                    className="w-full h-full text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.3" />
                    <path d="M12 2A10 10 0 0 1 12 22" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              ) : (
                <span
                  className={cn(
                    "size-4 shrink-0 rounded-full transition-all duration-300 flex items-center justify-center",
                    active
                      ? "bg-emerald-600 dark:bg-emerald-500 shadow-md scale-100"
                      : "border-2 border-muted-foreground/40 bg-background shadow-sm scale-90 hover:scale-100",
                  )}
                  aria-hidden="true"
                >
                  {active && <span className="size-1.5 rounded-full bg-white dark:bg-emerald-950" />}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Font Comparison Preview */}
      <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border/50 space-y-2">
        <div className="text-[11px] font-semibold text-foreground/70">Font Samples:</div>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-background border border-border/30">
            <div className="text-[11px] text-muted-foreground mb-1">Uthmanic Hafs</div>
            <div
              className="font-uthmani text-2xl text-foreground/80 leading-relaxed"
              dir="rtl"
              lang="ar"
            >
              بسم الله الرحمن الرحيم
            </div>
          </div>
          <div className="p-2 rounded bg-background border border-border/30">
            <div className="text-[11px] text-muted-foreground mb-1">King Fahd Complex V2</div>
            <div
              className="font-kfgqpc-v2 text-2xl text-foreground/80 leading-relaxed"
              dir="rtl"
              lang="ar"
            >
              بسم الله الرحمن الرحيم
            </div>
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground/60 pt-1 border-t border-border/30">
          Notice the difference in letter shapes and spacing between the two fonts.
        </div>
      </div>
    </div>
  )
}
