"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  X,
  RadioTower,
  RotateCcw,
} from "lucide-react"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { useElapsedSeconds, usePlaybackVerseKey } from "@/lib/playbackStore"
import { ElapsedTime, PLAYER_SURFACE_LAYOUT_ID, SeekBar } from "./PlayerPrimitives"
import { SpeedControl } from "./SpeedControl"
import { RepeatControls } from "./RepeatControls"
import { ReciterSelector } from "./ReciterSelector"
import { SleepTimerControl } from "./SleepTimerControl"
import { VolumeControl } from "./VolumeControl"
import { FullScreenPlayer } from "./FullScreenPlayer"
import { cn } from "@/lib/utils"

const barBtn = cn(
  "flex size-12 sm:size-11 items-center justify-center rounded-md",
  "text-muted-foreground transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
  "disabled:opacity-30 disabled:pointer-events-none",
)

function NowPlayingLabel({
  chapterId,
  chapterName,
  isRadio,
  isPlaying,
}: {
  chapterId: number | null
  chapterName: string | null
  isRadio: boolean
  isPlaying: boolean
}) {
  const verseKey = usePlaybackVerseKey()

  return (
    <span className="flex min-w-0 items-center gap-2 px-1.5 py-1">
      {isRadio && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
          <RadioTower className="size-2.5" strokeWidth={1.5} />
          Radio
        </span>
      )}
      {isPlaying && !isRadio && (
        <span className="shrink-0 size-1.5 rounded-full bg-[var(--playing-indicator)] animate-pulse-ambient" />
      )}
      <span className="truncate text-sm font-medium text-foreground">
        {chapterName ?? (chapterId !== null ? `Surah ${chapterId}` : "")}
      </span>
      {verseKey && (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {verseKey}
        </span>
      )}
    </span>
  )
}

/**
 * Persistent mini player. Lives in the root layout so playback survives
 * navigation; renders nothing while idle, so the base layout is untouched
 * until the user actually plays audio.
 *
 * On mobile it floats as its own rounded card above `BottomNav` rather than
 * spanning edge-to-edge; on desktop (no bottom nav to clear) it stays a
 * flush full-width bar. Tapping the "now playing" area — anywhere that
 * isn't one of the transport controls — expands it into `FullScreenPlayer`
 * via a shared `layoutId`, so the surface itself appears to grow into the
 * full-screen view rather than the two looking like unrelated components.
 */
export function MiniPlayer() {
  const player = useAudioPlayer()
  const elapsed = useElapsedSeconds()
  const [expanded, setExpanded] = useState(false)

  if (player.status === "idle") return null

  const isPlaying = player.status === "playing"
  const isBusy = player.status === "loading" || player.isBuffering

  return (
    <AnimatePresence mode="wait" initial={false}>
      {expanded ? (
        <FullScreenPlayer key="full" onClose={() => setExpanded(false)} />
      ) : (
      <motion.div
        key="mini"
        layoutId={PLAYER_SURFACE_LAYOUT_ID}
        role="region"
        aria-label="Audio player"
        onClick={() => setExpanded(true)}
        className={cn(
          "fixed inset-x-3 bottom-24 z-40 cursor-pointer rounded-2xl md:inset-x-0 md:bottom-0 md:cursor-default md:rounded-none",
          "border border-border/60 bg-background/80 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] backdrop-blur-md",
          "md:border-x-0 md:border-b-0 md:pb-[env(safe-area-inset-bottom)]",
          "animate-in slide-in-from-bottom-8 fade-in duration-[360ms] ease-out",
        )}
        transition={{ type: "tween", duration: 0.36, ease: "easeOut" }}
      >
        {player.durationMs !== null &&
          player.status !== "error" &&
          player.status !== "loading" && (
            <div className="absolute top-0 inset-x-0 h-[3px] bg-border/30">
              <div 
                className="h-full bg-jade-500 transition-all duration-[var(--dur-base)] ease-linear"
                style={{ width: `${(elapsed * 1000 / player.durationMs) * 100}%` }}
              />
            </div>
          )}
        <div className="site-shell flex min-h-[6rem] flex-col justify-center gap-3 px-3 py-3 sm:h-24 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-0">
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:flex-1">
            <div className="min-w-0 flex-1">
              <NowPlayingLabel
                chapterId={player.chapterId}
                chapterName={player.chapterName}
                isRadio={player.mode === "radio"}
                isPlaying={isPlaying}
              />
            </div>
            {/* Main playback controls for mobile, normally inline on desktop */}
            <div className="flex shrink-0 items-center gap-2 sm:hidden" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                title={isPlaying ? "Pause" : "Play"}
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={player.togglePlayPause}
                className={cn(barBtn, "size-18 bg-primary/10 text-primary hover:bg-primary/20")}
              >
                {isBusy ? (
                  <Loader2 className="size-8 animate-spin" strokeWidth={1.5} />
                ) : isPlaying ? (
                  <Pause className="size-8" strokeWidth={1.5} fill="currentColor" />
                ) : (
                  <Play className="size-8" strokeWidth={1.5} fill="currentColor" />
                )}
              </button>
            </div>
          </div>

          {player.status === "error" ? (
            <div
              className="hidden shrink-0 items-center gap-3 sm:flex"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm text-destructive">
                {player.errorMessage ?? "Couldn't load audio"}
              </span>
              <button
                type="button"
                title="Retry"
                aria-label="Retry"
                onClick={player.retry}
                className={cn(barBtn, "size-12 text-foreground")}
              >
                <RotateCcw className="size-6" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <div
              className="hidden shrink-0 items-center gap-2 sm:flex"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                title="Previous ayah"
                aria-label="Previous ayah"
                onClick={player.prevAyah}
                className={cn(barBtn, "size-14")}
              >
                <SkipBack className="size-7" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                title={isPlaying ? "Pause" : "Play"}
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={player.togglePlayPause}
                className={cn(barBtn, "size-16 text-foreground")}
              >
                {isBusy ? (
                  <Loader2 className="size-8 animate-spin" strokeWidth={1.5} />
                ) : isPlaying ? (
                  <Pause className="size-7" strokeWidth={1.5} />
                ) : (
                  <Play className="size-7" strokeWidth={1.5} />
                )}
              </button>
              <button
                type="button"
                title="Next ayah"
                aria-label="Next ayah"
                onClick={player.nextAyah}
                className={cn(barBtn, "size-12")}
              >
                <SkipForward className="size-6" strokeWidth={1.5} />
              </button>
            </div>
          )}

          <div
            className="mt-1 flex w-full flex-wrap items-center justify-between gap-1 sm:mt-0 sm:w-auto sm:shrink-0 sm:justify-start sm:gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <ElapsedTime durationMs={player.durationMs} />
            <VolumeControl />
            <SpeedControl />
            {player.mode !== "radio" && <RepeatControls />}
            <SleepTimerControl />
            <ReciterSelector />
            <div className="mx-0.5 hidden h-4 w-px bg-border/50 sm:block" aria-hidden="true" />
            <button
              type="button"
              title="Close player"
              aria-label="Close player"
              onClick={player.stop}
              className={barBtn}
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  )
}
