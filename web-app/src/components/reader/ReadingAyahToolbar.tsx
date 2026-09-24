"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  BookOpen,
  Play,
  ScrollText,
  Bookmark,
  Highlighter,
  Sparkles,
  Copy,
  Share2,
  Check,
  ImageIcon,
  X,
  Mic,
  Square,
  Trash2,
  Headphones,
} from "lucide-react"
import type { Verse } from "@/types/quran"
import { useSession } from "@/lib/auth/react-compat"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { useStudyPanel } from "@/context/StudyPanelContext"
import { useBookmarks } from "@/context/BookmarksContext"
import { useHifz } from "@/context/HifzContext"
import { useNotes } from "@/context/NotesContext"
import { useSoftGate } from "@/context/SoftGateContext"
import { NoteEditor } from "@/components/account/NoteEditor"
import { HIGHLIGHT_SWATCH_CLASS } from "@/lib/notes/highlights"
import { hasAsbab } from "@/lib/asbabIndex"
import { cn } from "@/lib/utils"
import { useRecorder } from "@/hooks/useRecorder"

interface ReadingAyahToolbarProps {
  verse: Verse | null
  onClose: () => void
}

export function ReadingAyahToolbar({ verse, onClose }: ReadingAyahToolbarProps) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)

  const { data: session } = useSession()
  const { requireAuth } = useSoftGate()
  const player = useAudioPlayer()
  const { openTafsir, openAsbab } = useStudyPanel()
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks()
  const { isMemorised, toggle: toggleHifz } = useHifz()
  const { hasNote, getHighlightColor } = useNotes()
  
  // Safe to call unconditionally; if verse is null we just early return below anyway.
  // We use verse?.verse_key but hooks must be called unconditionally.
  const { isRecording, recordingBlob, startRecording, stopRecording, clearRecording, error: recorderError } = useRecorder(verse?.verse_key ?? "")
  const [isPlayingSelf, setIsPlayingSelf] = useState(false)
  const selfAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (recordingBlob) {
      const url = URL.createObjectURL(recordingBlob)
      const audio = new Audio(url)
      audio.onended = () => setIsPlayingSelf(false)
      selfAudioRef.current = audio
      return () => {
        URL.revokeObjectURL(url)
        audio.pause()
      }
    } else {
      selfAudioRef.current = null
    }
  }, [recordingBlob])

  if (!verse) return null

  const chapterId = Number(verse.verse_key.split(":")[0])
  const bookmarked = isBookmarked(verse.verse_key)
  const memorised = isMemorised(verse.verse_key)
  const highlightColor = getHighlightColor(verse.verse_key)

  async function copyAyah() {
    if (!verse) return
    const arabic = verse.text_uthmani
    const ref = `[${verse.verse_key}]`
    try {
      await navigator.clipboard.writeText(`${arabic}\n\n${ref}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  async function shareAyah() {
    if (!verse) return
    const [surahId, ayahId] = verse.verse_key.split(":")
    const url = `${window.location.origin}/${surahId}/${ayahId}`
    if (navigator.share) {
      await navigator.share({ url, title: `Quran ${verse.verse_key}` }).catch(() => {})
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 1500)
    } catch {}
  }

  return (
    <div
      role="dialog"
      aria-label={`Ayah ${verse.verse_key} options`}
      className={cn(
        "fixed inset-x-3 bottom-24 z-50 mx-auto max-w-xl rounded-2xl",
        "border border-border/80 bg-background/95 p-3.5 shadow-2xl backdrop-blur-md",
        "animate-in slide-in-from-bottom-5 fade-in duration-200 ease-out",
        "md:bottom-6",
      )}
    >
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {verse.verse_number}
          </span>
          <span className="text-sm font-medium text-foreground">
            Ayah {verse.verse_key}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close ayah options"
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        {/* Audio play */}
        <button
          type="button"
          onClick={() => {
            player.playVerse(chapterId, verse.verse_number)
          }}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <Play className="size-3.5" fill="currentColor" />
          <span>Sheikh</span>
        </button>

        {/* Record Self */}
        {!isRecording && !recordingBlob && (
          <button
            type="button"
            onClick={startRecording}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-500/15 hover:text-red-500"
            title={recorderError ? recorderError.message : "Record your recitation"}
          >
            <Mic className="size-3.5" />
            <span>Record</span>
          </button>
        )}
        
        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-red-500/15 px-2.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/25"
          >
            <Square className="size-3.5" fill="currentColor" />
            <span className="animate-pulse">Recording...</span>
          </button>
        )}

        {recordingBlob && !isRecording && (
          <div className="flex items-center gap-1 rounded-lg bg-primary/5 p-0.5">
            <button
              type="button"
              onClick={() => {
                if (isPlayingSelf) {
                  selfAudioRef.current?.pause()
                  setIsPlayingSelf(false)
                } else {
                  player.stop() // Stop Sheikh if playing
                  selfAudioRef.current?.play()
                  setIsPlayingSelf(true)
                }
              }}
              className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
            >
              {isPlayingSelf ? <Square className="size-3.5" fill="currentColor" /> : <Headphones className="size-3.5" />}
              <span>You</span>
            </button>
            <button
              type="button"
              onClick={clearRecording}
              className="flex h-7 items-center justify-center rounded-md px-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
              aria-label="Delete recording"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}

        {/* Tafsir */}
        <button
          type="button"
          onClick={() => {
            openTafsir(verse.verse_key)
            onClose()
          }}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <BookOpen className="size-3.5" />
          <span>Tafsir</span>
        </button>

        {/* Asbab Nuzul */}
        {hasAsbab(verse.verse_key) && (
          <button
            type="button"
            onClick={() => {
              openAsbab(verse.verse_key)
              onClose()
            }}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ScrollText className="size-3.5" />
            <span>Asbab</span>
          </button>
        )}

        {/* Bookmark */}
        <button
          type="button"
          onClick={() => toggleBookmark(verse.verse_key)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
            bookmarked
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Bookmark className="size-3.5" fill={bookmarked ? "currentColor" : "none"} />
          <span>{bookmarked ? "Saved" : "Save"}</span>
        </button>

        {/* Hifz */}
        <button
          type="button"
          onClick={() => toggleHifz(verse.verse_key)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
            memorised
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Sparkles className="size-3.5" />
          <span>Hifz</span>
        </button>

        {/* Highlight & Note (E-12) — one sheet covers both */}
        <button
          type="button"
          onClick={() => {
            if (!session?.user) {
              requireAuth("note")
              return
            }
            setNoteOpen(true)
          }}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
            highlightColor || hasNote(verse.verse_key)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {highlightColor ? (
            <span
              aria-hidden="true"
              className={cn("size-3 rounded-full", HIGHLIGHT_SWATCH_CLASS[highlightColor])}
            />
          ) : (
            <Highlighter className="size-3.5" fill={hasNote(verse.verse_key) ? "currentColor" : "none"} />
          )}
          <span>{highlightColor ? "Highlighted" : hasNote(verse.verse_key) ? "Note" : "Highlight"}</span>
        </button>

        {/* Copy */}
        <button
          type="button"
          onClick={copyAyah}
          title="Copy ayah text"
          aria-label="Copy ayah text"
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            copied && "text-primary",
          )}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={shareAyah}
          title="Share ayah link"
          aria-label="Share ayah link"
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            shared && "text-primary",
          )}
        >
          {shared ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
        </button>

        {/* Card */}
        <Link
          href={`/media-maker?verse=${encodeURIComponent(verse.verse_key)}`}
          title="Create a shareable image card"
          aria-label="Create a shareable image card"
          className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ImageIcon className="size-3.5" />
        </Link>
      </div>

      {session?.user && noteOpen && (
        <NoteEditor
          open={noteOpen}
          onOpenChange={setNoteOpen}
          verseKey={verse.verse_key}
          title={`Ayah ${verse.verse_key}`}
        />
      )}
    </div>
  )
}
