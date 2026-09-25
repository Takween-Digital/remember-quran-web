"use client"

import type { ReactNode } from "react"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { FontSizeSelector } from "./FontSizeSelector"
import { FontTypeSelector } from "./FontTypeSelector"
import { DisplayModeToggle } from "./DisplayModeToggle"
import { TranslationSelector } from "./TranslationSelector"
import { ReciterSettingsSelector } from "./ReciterSettingsSelector"
import { TajweedToggle } from "./TajweedToggle"
import { TajweedLegend } from "./TajweedLegend"
import { HideArabicToggle } from "./HideArabicToggle"
import { AutoFollowToggle } from "./AutoFollowToggle"
import { ReadingLayoutToggle } from "./ReadingLayoutToggle"
import { SplitViewToggle } from "./SplitViewToggle"
import { TafsirBookSelector } from "@/components/study/TafsirBookSelector"

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

export function ReaderSettingsPanel({
  onRequestClose,
}: {
  /** Close the settings sheet (e.g. after starting a hide-range session). */
  onRequestClose?: () => void
} = {}) {
  const { displayMode, readingLayout, splitViewTranslation } = useReaderSettings()
  const isReadingMode = displayMode === "reading"
  const isScrollLayout = readingLayout === "scroll"
  // Reading mode still hides the translation list by default (there's no
  // room for it inline in the Mushaf grid) — it only comes back once split
  // view actually has somewhere to put it (Scroll layout only, see E-06).
  const showTranslationSelector = !isReadingMode || (isScrollLayout && splitViewTranslation)

  return (
    <div className="space-y-6">
      <Section title="View">
        <DisplayModeToggle />
        {isReadingMode && <ReadingLayoutToggle />}
        {isReadingMode && isScrollLayout && <SplitViewToggle />}
        <HideArabicToggle onRequestClose={onRequestClose} />
      </Section>

      <div className="h-px bg-border/60" />

      <Section title="Recitation">
        <ReciterSettingsSelector />
        {isReadingMode && <AutoFollowToggle />}
      </Section>

      <div className="h-px bg-border/60" />

      <Section title="Arabic font">
        <FontTypeSelector />
      </Section>

      <div className="h-px bg-border/60" />

      <Section title="Text size">
        <FontSizeSelector />
      </Section>

      {showTranslationSelector && (
        <>
          <div className="h-px bg-border/60" />

          <Section title="Translation">
            <TranslationSelector />
          </Section>
        </>
      )}

      <div className="h-px bg-border/60" />

      <Section title="Tafsir">
        <TafsirBookSelector />
      </Section>

      <div className="h-px bg-border/60" />

      <Section title="Tajweed">
        <TajweedToggle />
        <TajweedLegend />
      </Section>
    </div>
  )
}
