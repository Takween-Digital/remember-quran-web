import { cn } from "@/lib/utils"
import { AyahMarker } from "@/components/ui/AyahMarker"

interface AyahNumberProps {
  number: number
  className?: string
  isTarget?: boolean
}

export function AyahNumber({ number, className, isTarget }: AyahNumberProps) {
  return (
    <div
      data-numeric
      className={cn(
        "flex items-center justify-center shrink-0 text-muted-foreground/50",
        "transition-colors duration-(--dur-slow) ease-(--ease-out)",
        "group-hover:text-gold group-focus-within:text-gold",
        isTarget && "text-gold",
        className,
      )}
    >
      <AyahMarker number={number} className="text-current scale-125 mx-2" />
    </div>
  )
}
