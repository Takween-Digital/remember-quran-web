"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { Switch } from "@/components/ui/switch"

/** E-09: side-by-side translation column, Scroll layout only. */
export function SplitViewToggle() {
  const { splitViewTranslation, setSplitViewTranslation } = useReaderSettings()

  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <span className="block text-sm">Split view: translation</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
          Show a synced translation column beside the Mushaf page (md+ screens)
        </span>
      </div>
      <Switch checked={splitViewTranslation} onCheckedChange={setSplitViewTranslation} />
    </div>
  )
}
