"use client"

import { useEffect, useState, type MouseEvent } from "react"
import { Volume2, GraduationCap, Bookmark } from "lucide-react"
import { useSession } from "@/lib/auth/react-compat"
import { useAudioPlayerActions } from "@/context/AudioPlayerContext"
import { useStudyPanel } from "@/context/StudyPanelContext"
import { useBookmarks } from "@/context/BookmarksContext"
import { useSoftGate } from "@/context/SoftGateContext"
import { getWordAudioUrl } from "@/lib/audioSources"
import { getWordMorphology, prefetchSurahMorphology } from "@/lib/morphologyApi"
import { deriveVerbForm, deriveRoleHint } from "@/lib/morphologyLabels"
import type { Word } from "@/types/quran"
import type { MorphologyEntry } from "@/types/study"
import { cn } from "@/lib/utils"

interface WordMeaningContentProps {
  word: Word
  verseKey?: string
}

export function WordMeaningContent({ word, verseKey }: WordMeaningContentProps) {
  const actions = useAudioPlayerActions()
  const { openWord } = useStudyPanel()
  const { data: session } = useSession()
  const { requireAuth } = useSoftGate()
  const { isBookmarked, isPending, toggle } = useBookmarks()
  const hasAudio = !!getWordAudioUrl(word)
  const saved = verseKey ? isBookmarked(verseKey) : false
  const bookmarkPending = verseKey ? isPending(verseKey) : false

  // E-11: quick-glance root/form/role — the same per-surah-cached corpus
  // data WordDetailView uses for the full StudyPanel, just the compact cut.
  // Deliberately no loading skeleton: this is a bridge for the common case
  // (already cached from a prior tap this session), not a guaranteed field:
  // it just pops in a moment after cold, without adding visual noise to the
  // popover's basic word-meaning info while it does.
  const [morphology, setMorphology] = useState<MorphologyEntry | null>(null)
  useEffect(() => {
    setMorphology(null)
    if (!verseKey) return
    const surahId = Number(verseKey.split(":")[0])
    prefetchSurahMorphology(surahId)

    let cancelled = false
    getWordMorphology(verseKey, word.position)
      .then((entry) => {
        if (!cancelled) setMorphology(entry)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [verseKey, word.position])

  const rootLetters = morphology?.root ? [...morphology.root] : []
  const verbForm = morphology ? deriveVerbForm(morphology) : null
  const roleHint = morphology ? deriveRoleHint(morphology) : null

  function handleBookmarkClick(e: MouseEvent) {
    e.stopPropagation()
    if (!verseKey) return
    if (!session?.user) {
      requireAuth("bookmark")
      return
    }
    void toggle(verseKey)
  }

  return (
    <div
      className={cn(
        "flex min-w-[70px] flex-col items-center text-center select-none py-0.5 px-0.5",
        rootLetters.length > 0 || verbForm || roleHint ? "max-w-[210px]" : "max-w-[150px]",
      )}
    >
      {/* Arabic Word Glyph */}
      <span
        className="font-arabic text-base sm:text-lg font-medium leading-tight text-gold"
        dir="rtl"
        lang="ar"
      >
        {word.qpc_uthmani_hafs || word.text_uthmani}
      </span>

      {/* English Meaning */}
      <span className="text-[11px] font-medium text-foreground/95 leading-tight mt-0.5 line-clamp-2">
        {word.translation.text}
      </span>

      {/* Transliteration */}
      {word.transliteration?.text && (
        <span className="text-[10px] italic text-muted-foreground/75 leading-tight mt-0.5">
          {word.transliteration.text}
        </span>
      )}

      {/* E-11: root breakdown + form/role — quick-glance morphology */}
      {(rootLetters.length > 0 || verbForm || roleHint) && (
        <div className="mt-1.5 flex w-full flex-col items-center gap-1 border-t border-border/30 pt-1.5">
          {rootLetters.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
                Root
              </span>
              <div className="flex gap-0.5" dir="rtl">
                {rootLetters.map((letter, i) => (
                  <span
                    key={i}
                    className="flex size-4 items-center justify-center rounded-sm bg-accent font-arabic text-[11px] leading-none text-gold"
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(verbForm || roleHint) && (
            <div className="flex flex-wrap items-center justify-center gap-1">
              {verbForm && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium leading-tight text-foreground">
                  {verbForm}
                </span>
              )}
              {roleHint && (
                <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] leading-tight text-muted-foreground">
                  {roleHint}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Micro Quick Actions */}
      <div className="mt-1 flex items-center justify-center gap-1 pt-1 border-t border-border/40 w-full">
        {hasAudio && actions && (
          <button
            type="button"
            title="Pronunciation"
            aria-label="Pronounce"
            onClick={(e) => {
              e.stopPropagation()
              actions.playWord(word)
            }}
            className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-all duration-150 hover:bg-gold/15 hover:text-gold focus-visible:outline-none"
          >
            <Volume2 className="size-3" strokeWidth={2} />
          </button>
        )}
        {verseKey && (
          <button
            type="button"
            title="Grammar"
            aria-label="Grammar"
            onClick={(e) => {
              e.stopPropagation()
              openWord(verseKey, word.position)
            }}
            className="flex h-5 items-center justify-center gap-1 rounded-full px-1.5 text-muted-foreground transition-all duration-150 hover:bg-gold/15 hover:text-gold focus-visible:outline-none"
          >
            <GraduationCap className="size-3" strokeWidth={2} />
            <span className="text-[9px] font-medium uppercase tracking-wider">Grammar</span>
          </button>
        )}
        {verseKey && (
          <button
            type="button"
            title={saved ? "Remove bookmark" : "Bookmark"}
            aria-label={saved ? `Remove bookmark ${verseKey}` : `Bookmark ${verseKey}`}
            aria-pressed={saved}
            disabled={bookmarkPending}
            onClick={handleBookmarkClick}
            className={cn(
              "flex size-5 items-center justify-center rounded-full transition-all duration-150 hover:bg-gold/15 hover:text-gold focus-visible:outline-none disabled:opacity-50",
              saved ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Bookmark className="size-3" strokeWidth={2} fill={saved ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    </div>
  )
}

