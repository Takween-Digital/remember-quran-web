"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { Switch } from "@/components/ui/switch"

export function AutoFollowToggle() {
  const { autoFollowRecitation, setAutoFollowRecitation } = useReaderSettings()

  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <span className="block text-sm">Auto-follow recitation</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
          In Reading mode, highlight and scroll to the line being recited
        </span>
      </div>
      <Switch checked={autoFollowRecitation} onCheckedChange={setAutoFollowRecitation} />
    </div>
  )
}
