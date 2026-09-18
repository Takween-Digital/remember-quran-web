"use client"

import { Loader2, Pause, Play } from "lucide-react"
import { ReciterCombobox } from "@/components/audio/ReciterCombobox"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { useSurahContentOptional } from "@/context/SurahContentContext"
import { cn } from "@/lib/utils"

export function ReciterSettingsSelector() {
  const { reciterId, setReciter, status, chapterId, playChapter, togglePlayPause } =
    useAudioPlayer()
  const surahContent = useSurahContentOptional()
  const previewSurahId = surahContent?.pendingSurahId ?? surahContent?.chapter?.id ?? null

  const isThisChapter = previewSurahId != null && chapterId === previewSurahId
  const isPlaying = isThisChapter && status === "playing"
  const isLoading = isThisChapter && status === "loading"

  function handlePreview() {
    if (previewSurahId == null) return
    if (isThisChapter && (status === "playing" || status === "paused")) {
      togglePlayPause()
    } else {
      playChapter(previewSurahId)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <ReciterCombobox
        value={reciterId}
        onChange={setReciter}
        label="Reciter"
        className="flex-1"
      />
      {previewSurahId != null && (
        <button
          type="button"
          onClick={handlePreview}
          aria-label={isPlaying ? "Pause reciter preview" : "Preview reciter"}
          title={isPlaying ? "Pause reciter preview" : "Preview reciter"}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md border border-border",
            "text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
            isPlaying && "border-primary/30 bg-primary/10 text-primary",
          )}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
          ) : isPlaying ? (
            <Pause className="size-4" strokeWidth={1.75} />
          ) : (
            <Play className="size-4" strokeWidth={1.75} />
          )}
        </button>
      )}
    </div>
  )
}
