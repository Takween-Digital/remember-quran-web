"use client"

import type { MouseEvent } from "react"
import { Volume2, GraduationCap, Bookmark } from "lucide-react"
import { useSession } from "next-auth/react"
import { useAudioPlayerActions } from "@/context/AudioPlayerContext"
import { useStudyPanel } from "@/context/StudyPanelContext"
import { useBookmarks } from "@/context/BookmarksContext"
import { useSoftGate } from "@/context/SoftGateContext"
import { getWordAudioUrl } from "@/lib/audioSources"
import type { Word } from "@/types/quran"
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
    <div className="flex min-w-[70px] max-w-[150px] flex-col items-center text-center select-none py-0.5 px-0.5">
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

