"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { Switch } from "@/components/ui/switch"

export function TajweedToggle() {
  const { tajweedEnabled, setTajweedEnabled } = useReaderSettings()

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1">
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">Tajweed colours</span>
        <span className="mt-0.5 block text-[11px] font-medium leading-snug text-muted-foreground">
          Highlight pronunciation rules in Arabic text
        </span>
      </div>
      <Switch checked={tajweedEnabled} onCheckedChange={setTajweedEnabled} className="data-[state=checked]:bg-primary" />
    </div>
  )
}
