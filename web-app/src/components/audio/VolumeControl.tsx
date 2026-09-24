"use client"

import { Volume, Volume1, Volume2, VolumeX } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { cn } from "@/lib/utils"

const barBtn = cn(
  "flex h-12 sm:h-11 items-center justify-center rounded-md px-2 sm:px-1.5",
  "text-muted-foreground transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
)

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  const className = "size-[22px] sm:size-5"
  if (muted || volume === 0) return <VolumeX className={className} strokeWidth={1.5} />
  if (volume < 0.34) return <Volume className={className} strokeWidth={1.5} />
  if (volume < 0.67) return <Volume1 className={className} strokeWidth={1.5} />
  return <Volume2 className={className} strokeWidth={1.5} />
}

/** RQ-15: volume slider + mute toggle for the playback controls bar — the
 * underlying `<audio>` element always had a fixed, un-adjustable volume. */
export function VolumeControl() {
  const { volume, muted, setVolume, toggleMute } = useAudioPlayer()
  const effective = muted ? 0 : volume

  return (
    <Popover>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            title={muted ? "Unmute" : "Volume"}
            aria-label={muted ? "Unmute" : `Volume ${Math.round(effective * 100)}%`}
            className={barBtn}
          >
            <VolumeIcon volume={volume} muted={muted} />
          </button>
        )}
      />
      <PopoverContent side="top" className="w-11 p-3">
        <div className="flex flex-col items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(effective * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            aria-label="Volume"
            className="h-24 w-1.5 shrink-0 cursor-pointer appearance-none rounded-full bg-border accent-primary [writing-mode:vertical-lr] [direction:rtl]"
          />
          <button
            type="button"
            onClick={toggleMute}
            title={muted ? "Unmute" : "Mute"}
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={muted}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <VolumeIcon volume={volume} muted={muted} />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
