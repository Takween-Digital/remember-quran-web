"use client"

import { Sparkles, X } from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { cn } from "@/lib/utils"

const HINT_KEY = "rq:word-tap-hint-dismissed"

export function WordTapHint() {
  const [dismissed, setDismissed] = useLocalStorage<boolean>(HINT_KEY, false)

  if (dismissed) return null

  return (
    <div className="mx-auto w-full max-w-2xl px-2 pt-3 sm:px-4">
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2.5",
        )}
      >
        <Sparkles className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.75} />
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-foreground/80">
          <span className="font-medium text-foreground">Tip:</span> Tap any Arabic
          word to hear its pronunciation and see its meaning.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss tip"
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <X className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
