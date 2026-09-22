"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { NotebookPen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useNotes } from "@/context/NotesContext"
import { NOTE_TEXT_MAX_LENGTH } from "@/lib/notes/text"
import {
  HIGHLIGHT_COLORS,
  HIGHLIGHT_SWATCH_CLASS,
  isHighlightColor,
  type HighlightColor,
} from "@/lib/notes/highlights"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export interface NoteDto {
  verseKey: string
  text: string
  highlightColor?: string | null
  updatedAt?: string
  createdAt?: string
}

interface NoteEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  verseKey: string
  /** Optional label e.g. "Al-Baqarah · 2:255" */
  title?: string
  /** Seed when opening from account list (skip extra GET) */
  initialText?: string
  /** Called after a successful save/delete so account lists can update */
  onSaved?: (note: NoteDto | null) => void
}

async function fetchNote(verseKey: string): Promise<NoteDto | null> {
  const res = await fetch(
    `/api/account/notes?verseKey=${encodeURIComponent(verseKey)}`,
  )
  if (!res.ok) return null
  const data = (await res.json()) as { note?: NoteDto | null }
  return data.note ?? null
}

export function NoteEditor({
  open,
  onOpenChange,
  verseKey,
  title,
  initialText,
  onSaved,
}: NoteEditorProps) {
  const { setHasNote, setHighlightColorLocal, refresh } = useNotes()
  const isMobile = useIsMobile()
  const textareaId = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [text, setText] = useState("")
  const [baseline, setBaseline] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hadNote, setHadNote] = useState(false)
  // E-12: applied immediately on tap (like a real highlighter), independent
  // of the note text's own dirty/Save flow below.
  const [highlightColor, setHighlightColor] = useState<HighlightColor | null>(null)
  const [highlightSaving, setHighlightSaving] = useState(false)

  const dirty = text !== baseline
  const overLimit = text.length > NOTE_TEXT_MAX_LENGTH

  // Load note when the sheet opens for a verse
  useEffect(() => {
    if (!open) return
    let cancelled = false

    Promise.resolve()
      .then(() => {
        if (cancelled) return
        setError(null)
        if (typeof initialText === "string") {
          setText(initialText)
          setBaseline(initialText)
          setHadNote(initialText.trim().length > 0)
          setHighlightColor(null)
          setLoading(false)
          return
        }
        setLoading(true)
        setText("")
        setBaseline("")
        return fetchNote(verseKey)
      })
      .then((note) => {
        if (cancelled || note === undefined) return
        const next = note?.text ?? ""
        setText(next)
        setBaseline(next)
        setHadNote(next.length > 0)
        setHighlightColor(isHighlightColor(note?.highlightColor) ? note.highlightColor : null)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError("Couldn’t load this note. You can still type a draft.")
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, verseKey, initialText])

  // Focus textarea after open + load
  useEffect(() => {
    if (!open || loading) return
    const t = window.setTimeout(() => textareaRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, loading])

  function requestClose() {
    if (dirty && !window.confirm("Discard unsaved note?")) return
    onOpenChange(false)
  }

  /** E-12: toggling a swatch applies immediately — no separate Save step. */
  async function applyHighlight(color: HighlightColor | null) {
    if (highlightSaving || color === highlightColor) return
    const previous = highlightColor
    setHighlightColor(color)
    setHighlightColorLocal(verseKey, color)
    setHighlightSaving(true)
    try {
      const res = await fetch("/api/account/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseKey, highlightColor: color }),
      })
      if (!res.ok) throw new Error("PATCH failed")
      void refresh()
    } catch {
      setHighlightColor(previous)
      setHighlightColorLocal(verseKey, previous)
      setError("Couldn’t update the highlight colour.")
    } finally {
      setHighlightSaving(false)
    }
  }

  async function save() {
    if (saving || overLimit) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/account/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseKey, text }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        note?: NoteDto
        deleted?: boolean
      }

      if (!res.ok) {
        setError(data.error ?? "Couldn’t save the note. Your draft is kept.")
        return
      }

      if (data.deleted) {
        setText("")
        setBaseline("")
        setHadNote(false)
        setHasNote(verseKey, false)
        onSaved?.(null)
      } else if (data.note) {
        // E-12: a highlight-only row can survive with text cleared — "has a
        // note" means non-empty text, not merely that the row exists.
        const hasText = data.note.text.length > 0
        setText(data.note.text)
        setBaseline(data.note.text)
        setHadNote(hasText)
        setHasNote(verseKey, hasText)
        onSaved?.(data.note)
      }

      void refresh()
      onOpenChange(false)
    } catch {
      setError("Couldn’t save the note. Your draft is kept.")
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (saving) return
    if (!window.confirm("Delete this note?")) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/account/notes?verseKey=${encodeURIComponent(verseKey)}`,
        { method: "DELETE" },
      )
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? "Couldn’t delete the note.")
        return
      }
      setText("")
      setBaseline("")
      setHadNote(false)
      setHasNote(verseKey, false)
      setHighlightColor(null)
      setHighlightColorLocal(verseKey, null)
      onSaved?.(null)
      void refresh()
      onOpenChange(false)
    } catch {
      setError("Couldn’t delete the note.")
    } finally {
      setSaving(false)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      void save()
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) onOpenChange(true)
        else requestClose()
      }}
    >
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        aria-label="Note editor"
        className={cn(
          "gap-0",
          isMobile
            ? "max-h-[85dvh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
            : "data-[side=right]:sm:max-w-md",
        )}
      >
        <SheetHeader className="border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <NotebookPen className="size-4" strokeWidth={1.75} />
            <span className="text-xs font-medium tracking-wide">Private note</span>
          </div>
          <SheetTitle className="font-serif text-xl">
            {title ?? verseKey}
          </SheetTitle>
          <SheetDescription>
            Plain text only — visible only to you. Empty save clears the note.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
          {/* E-12: highlight colour — applies immediately on tap */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Highlight</span>
            <div className="flex items-center gap-1.5">
              {HIGHLIGHT_COLORS.map((color) => {
                const active = highlightColor === color
                return (
                  <button
                    key={color}
                    type="button"
                    disabled={highlightSaving}
                    title={`Highlight ${color}`}
                    aria-label={`Highlight ${color}`}
                    aria-pressed={active}
                    onClick={() => void applyHighlight(color)}
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full transition-transform disabled:opacity-50",
                      HIGHLIGHT_SWATCH_CLASS[color],
                      active ? "ring-2 ring-offset-2 ring-foreground/60 ring-offset-background" : "hover:scale-110",
                    )}
                  >
                    {active && <Check className="size-3.5 text-background" strokeWidth={3} />}
                  </button>
                )
              })}
              {highlightColor && (
                <button
                  type="button"
                  disabled={highlightSaving}
                  onClick={() => void applyHighlight(null)}
                  className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <label htmlFor={textareaId} className="sr-only">
            Note for {verseKey}
          </label>
          <Textarea
            ref={textareaRef}
            id={textareaId}
            dir="auto"
            value={text}
            disabled={loading || saving}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Write a private note for this ayah…"
            aria-invalid={overLimit}
            className={cn(
              "min-h-40 flex-1 resize-y whitespace-pre-wrap text-base md:text-sm",
              overLimit && "border-destructive",
            )}
          />

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              {text.length.toLocaleString()} / {NOTE_TEXT_MAX_LENGTH.toLocaleString()}
            </span>
            {dirty && !saving && <span>Unsaved changes</span>}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <SheetFooter className="border-t border-border sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            {hadNote && (
              <Button
                type="button"
                variant="ghost"
                disabled={saving || loading}
                onClick={() => void remove()}
                className="text-destructive hover:text-destructive"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={requestClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || loading || overLimit || !dirty}
              onClick={() => void save()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
