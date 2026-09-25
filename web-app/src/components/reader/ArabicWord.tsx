"use client"

import { useState, type MouseEvent as ReactMouseEvent, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { useIsTouch } from "@/hooks/useIsTouch"
import { useAudioPlayerActions } from "@/context/AudioPlayerContext"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { getWordAudioUrl } from "@/lib/audioSources"
import { buildTajweedSpans, TAJWEED_RULES } from "@/lib/tajweed"
import type { Word } from "@/types/quran"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { motion } from "framer-motion"
import { WordMeaningContent } from "./WordMeaningContent"
import { TajweedRuleTooltip } from "./TajweedRuleTooltip"
import { cn } from "@/lib/utils"

interface ArabicWordProps {
  word: Word
  onWordClick?: (word: Word, verseKey?: string) => void
  isHighlighted?: boolean
  isPlaying?: boolean
  verseKey?: string
  disableTooltip?: boolean
  /** Page-specific QCF v2 glyph font-family, when its font has finished
   * loading — renders `word.code_v2` as a pre-shaped Mushaf glyph instead of
   * the Unicode fallback. Reading mode only; see useQcfPageFont. */
  qcfFontFamily?: string | null
}

export function ArabicWord({
  word,
  onWordClick,
  isHighlighted = false,
  verseKey,
  disableTooltip = false,
  qcfFontFamily = null,
}: ArabicWordProps) {
  const isTouch = useIsTouch()
  // Stable actions context — never re-renders words on playback state changes
  const actions = useAudioPlayerActions()
  const { tajweedEnabled } = useReaderSettings()

  // When tajweed is off this is the plain fallback (identical to pre-M3 behaviour)
  const plainText = word.qpc_uthmani_hafs || word.text_uthmani

  // QCF v2 has no per-letter tajweed colouring (that's QCF v4/COLRv1) — only
  // take the glyph path when tajweed is off and the page's font is ready.
  const useQcfGlyph = !tajweedEnabled && !!qcfFontFamily && !!word.code_v2

  function wordContent() {
    if (useQcfGlyph) {
      // QCF codes must go through innerHTML, not a text child — see
      // docs/DESIGN-SYSTEM.md's font-rendering notes; this is trusted API
      // data (a single private-use-area codepoint), not user input.
      return (
        <span
          style={{ fontFamily: qcfFontFamily! }}
          dangerouslySetInnerHTML={{ __html: word.code_v2! }}
        />
      )
    }
    if (!useQcfGlyph && word.text_uthmani_tajweed) {
      return buildTajweedSpans(plainText, word.text_uthmani_tajweed).map(
        ({ text, rule }, i) =>
          rule ? (
            <span key={i} className={`tj-span tj-${rule}`} data-tj-rule={rule}>
              {text}
            </span>
          ) : (
            <span key={i} className="tj-span">
              {text}
            </span>
          ),
      )
    }
    return plainText
  }

  const triggerClass = cn(
    "relative inline cursor-pointer rounded-xs px-0 py-0.5",
    "touch-manipulation select-text",
    "transition-colors duration-(--dur-fast) ease-(--ease-out)",
    "hover:bg-gold/20 hover:text-gold",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold",
    isHighlighted && "text-primary font-medium",
  )

  function handleClick() {
    if (onWordClick) {
      onWordClick(word, verseKey)
    }
  }

  const [popoverOpen, setPopoverOpen] = useState(false)

  // E-10: which tajweed rule (if any) the most recent activation landed on —
  // null shows the normal word-meaning popup instead. Mouse/touch can tell
  // exactly which coloured span was hit; keyboard activation has no such
  // position, so Enter/Space always falls back to the word meaning.
  const [tajweedRuleKey, setTajweedRuleKey] = useState<string | null>(null)

  function tajweedRuleAt(target: EventTarget | null): string | null {
    if (!tajweedEnabled || !word.text_uthmani_tajweed) return null
    const el = target instanceof HTMLElement ? target.closest<HTMLElement>("[data-tj-rule]") : null
    const rule = el?.dataset.tjRule
    return rule && TAJWEED_RULES[rule] ? rule : null
  }

  if (disableTooltip) {
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleClick()
          }
        }}
        className={triggerClass}
      >
        {isHighlighted && (
          <motion.span
            layoutId="playback-highlight"
            className="absolute inset-0 z-[-1] rounded-xs bg-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, boxShadow: "0 0 15px rgba(42, 165, 131, 0.3)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
        {wordContent()}
      </span>
    )
  }

  /* Tap/click opens a popup with the word's meaning plus Hear / Grammar /
     Bookmark actions (RQ-12) — on desktop it also speaks the word
     immediately, same as before; on touch the Hear button inside the popup
     does that instead, so a scrolling tap doesn't trigger surprise audio.
     Tapping a tajweed-coloured letter run instead shows that rule's name +
     description (E-10) — audio playback is skipped there since the tap is
     about identifying the rule, not hearing the whole word. */
  function handleActivate(rule: string | null) {
    setTajweedRuleKey(rule)
    if (!rule && !isTouch && actions && getWordAudioUrl(word)) actions.playWord(word)
    setPopoverOpen(true)
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger
        nativeButton={false}
        render={(props) => (
          <span
            {...props}
            className={triggerClass}
            tabIndex={0}
            onClick={(e: ReactMouseEvent<HTMLSpanElement>) => {
              props.onClick?.(e)
              handleActivate(tajweedRuleAt(e.target))
            }}
            onKeyDown={(e: ReactKeyboardEvent<HTMLSpanElement>) => {
              props.onKeyDown?.(e)
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleActivate(null)
              }
            }}
          >
            {isHighlighted && (
              <motion.span
                layoutId="playback-highlight"
                className="absolute inset-0 z-[-1] rounded-xs bg-primary/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, boxShadow: "0 0 15px rgba(42, 165, 131, 0.3)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            )}
            {wordContent()}
          </span>
        )}
      />
      {popoverOpen && (
        <PopoverContent side="top" className="w-auto p-3">
          {tajweedRuleKey ? (
            <TajweedRuleTooltip ruleKey={tajweedRuleKey} />
          ) : (
            <WordMeaningContent word={word} verseKey={verseKey} />
          )}
        </PopoverContent>
      )}
    </Popover>
  )
}
