"use client"

import { Brain } from "lucide-react"
import { useSession } from "@/lib/auth/react-compat"
import { useHifz } from "@/context/HifzContext"
import { useSoftGate } from "@/context/SoftGateContext"
import { cn } from "@/lib/utils"

interface HifzButtonProps {
  verseKey: string
  className?: string
  iconClassName?: string
}

/**
 * Toggle memorised state for one ayah. Guests get the soft-gate; signed-in
 * users get an optimistic filled icon that reverts if the API call fails.
 */
export function HifzButton({
  verseKey,
  className,
  iconClassName,
}: HifzButtonProps) {
  const { data: session, status } = useSession()
  const { requireAuth } = useSoftGate()
  const { loaded, isMemorised, isPending, toggle } = useHifz()

  const saved = isMemorised(verseKey)
  const pending = isPending(verseKey)
  const signedIn = Boolean(session?.user)
  const waitingForKeys = signedIn && !loaded

  function handleClick() {
    if (status === "loading" || waitingForKeys) return
    if (!session?.user) {
      requireAuth("hifz")
      return
    }
    void toggle(verseKey)
  }

  return (
    <button
      type="button"
      title={saved ? "Remove from Hifz" : "Add to Hifz"}
      aria-label={
        saved
          ? `Remove ${verseKey} from Hifz`
          : `Add ${verseKey} to Hifz`
      }
      aria-pressed={saved}
      disabled={pending || waitingForKeys}
      onClick={handleClick}
      className={cn(className, saved && "text-primary hover:text-primary")}
    >
      <Brain
        className={iconClassName}
        strokeWidth={1.75}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  )
}
