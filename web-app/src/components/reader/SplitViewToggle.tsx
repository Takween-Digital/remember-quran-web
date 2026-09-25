"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { Switch } from "@/components/ui/switch"

/** E-09: side-by-side translation column, Scroll layout only. */
export function SplitViewToggle() {
  const { splitViewTranslation, setSplitViewTranslation } = useReaderSettings()

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1">
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">Split view: translation</span>
        <span className="mt-0.5 block text-[11px] font-medium leading-snug text-muted-foreground">
          Show a synced translation column beside the Mushaf page (md+ screens)
        </span>
      </div>
      <Switch checked={splitViewTranslation} onCheckedChange={setSplitViewTranslation} className="data-[state=checked]:bg-primary" />
    </div>
  )
}
