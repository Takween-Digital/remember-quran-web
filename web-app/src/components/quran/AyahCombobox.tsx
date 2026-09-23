"use client"

import { useMemo } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

interface AyahComboboxProps {
  /** Total ayahs in the currently selected surah. */
  versesCount: number
  value: number
  onChange: (ayahNumber: number) => void
  label?: string
  className?: string
}

/** Companion to SurahCombobox (RQ-18) — lets a "start from" flow pick a
 * specific ayah within whichever surah was just chosen, not just the
 * surah's first ayah. */
export function AyahCombobox({
  versesCount,
  value,
  onChange,
  label = "Starting ayah",
  className,
}: AyahComboboxProps) {
  const ayahs = useMemo(
    () => Array.from({ length: Math.max(versesCount, 0) }, (_, i) => i + 1),
    [versesCount],
  )
  const selected = ayahs.includes(value) ? value : null

  return (
    <Combobox
      items={ayahs}
      value={selected}
      onValueChange={(ayah) => {
        if (ayah != null) onChange(ayah)
      }}
      itemToStringLabel={(ayah) => `Ayah ${ayah}`}
      isItemEqualToValue={(a, b) => a === b}
    >
      <ComboboxInput
        aria-label={label}
        placeholder="Search ayah number…"
        className={cn("w-full", className)}
        showClear={false}
        // Prevent virtual keyboard on mobile to stop it from covering the options (RQ-36)
        inputMode="none"
      />
      <ComboboxContent>
        <ComboboxEmpty>No ayah found.</ComboboxEmpty>
        <ComboboxList>
          {(ayah) => (
            <ComboboxItem key={ayah} value={ayah} className="border-b border-border/50 py-2 last:border-b-0">
              <span className="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">
                Ayah
              </span>
              <span className="min-w-0 flex-1 tabular-nums">{ayah}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
