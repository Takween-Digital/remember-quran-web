"use client"

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Verse, Word, Chapter } from "@/types/quran"
import { useChapters } from "@/context/ChaptersContext"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { useAudioPlayerOptional } from "@/context/AudioPlayerContext"
import { useHighlightedWord, usePlaybackVerseKey, subscribe, getPlaybackPosition } from "@/lib/playbackStore"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useSyncExternalStore } from "react"
import { LAST_READ_STORAGE_KEY, EMPTY_LAST_READ_MAP } from "@/lib/readingProgress"
import { useNotes } from "@/context/NotesContext"
import { useHifz } from "@/context/HifzContext"
import { useSession } from "@/lib/auth/react-compat"
import { SurahProgressProvider, useSurahProgressContext } from "@/context/SurahProgressContext"
import { useReadingPosition } from "@/hooks/useReadingPosition"
import { HIGHLIGHT_BG_CLASS } from "@/lib/notes/highlights"
import { TOTAL_QURAN_PAGES } from "@/lib/goals/constants"
import { useQcfPageFont } from "@/hooks/useQcfPageFont"
import { ArabicWord } from "./ArabicWord"
import { AyahEndMarker } from "./AyahEndMarker"
import { HideableArabic } from "./HideableArabic"
import { MushafPageFrame } from "./MushafPageFrame"
import { QcfLine } from "./QcfLine"
import { SurahHeaderCartouche } from "./SurahHeaderCartouche"
import { BismillahHeader } from "./BismillahHeader"
import { WordStudyRibbon } from "./WordStudyRibbon"
import { ReadingAyahToolbar } from "./ReadingAyahToolbar"
import { TranslationBlock } from "./TranslationBlock"
import { toArabicDigits } from "./AyahText"
import { cn } from "@/lib/utils"

interface ReadingModeViewProps {
  verses: Verse[]
  targetAyahId?: number
  chapter?: Chapter
  /** Paged layout only: fires whenever the visible page changes, true once
   * it's the surah's last page — lets QuranReader gate its "Continue to
   * Surah" prompt on genuinely reaching the end, not just being in Reading
   * mode at all (which Paged's single-page-at-a-time view otherwise always
   * triggers).
   */
  onPagedPositionChange?: (atLastPage: boolean) => void
}
interface ReadingVerseProps {
  verse: Verse
  isTarget: boolean
  onWordClick: (word: Word, verseKey?: string) => void
  onAyahClick?: (verse: Verse) => void
  qcfFontFamily?: string | null
}

/** One verse span in continuous Arabic flow */
function ReadingVerse({ verse, isTarget, onWordClick, onAyahClick, qcfFontFamily }: ReadingVerseProps) {
  const highlightedPosition = useHighlightedWord(verse.verse_key)
  const { getHighlightColor } = useNotes()
  const highlightColor = getHighlightColor(verse.verse_key)
  const words = (verse.words ?? []).filter(
    (w) => w.char_type_name === "word" || w.char_type_name === "end",
  )

  return (
    <HideableArabic
      verseKey={verse.verse_key}
      compact
      className={cn(
        "scroll-mt-28 inline",
        isTarget
          ? "rounded-xs bg-primary/10"
          : highlightColor && HIGHLIGHT_BG_CLASS[highlightColor],
      )}
    >
      <span id={`ayah-${verse.verse_key.replace(":", "-")}`} data-verse-key={verse.verse_key} className="inline">
        {words.map((word, i) => {
          if (word.char_type_name === "end") return null
          const isLast = i === words.length - 1
          const endWord = !isLast && words[i + 1]?.char_type_name === "end" ? words[i + 1] : null

          return (
            <Fragment key={word.id}>
              <ArabicWord
                word={word}
                isHighlighted={highlightedPosition === word.position}
                verseKey={verse.verse_key}
                disableTooltip={false}
                onWordClick={onWordClick}
                qcfFontFamily={qcfFontFamily}
              />
              {endWord ? (
                <AyahEndMarker
                  digits={endWord.qpc_uthmani_hafs || endWord.text_uthmani}
                  ariaLabel={`Ayah ${verse.verse_number}`}
                  onClick={() => onAyahClick?.(verse)}
                />
              ) : (
                " "
              )}
            </Fragment>
          )
        })}
      </span>
    </HideableArabic>
  )
}

/** One word within a standard 15-line page — its own component so the
 * per-verse highlight hook can be called correctly even though neighbouring
 * words on the same printed line can belong to different verses. */
function LineWord({
  word,
  verse,
  targetAyahId,
  onWordClick,
  onAyahClick,
  attachedEndMarker,
  qcfFontFamily,
}: {
  word: Word
  verse: Verse
  targetAyahId?: number
  onWordClick: (word: Word, verseKey?: string) => void
  onAyahClick: (verse: Verse) => void
  attachedEndMarker?: Word | null
  qcfFontFamily?: string | null
}) {
  const highlightedPosition = useHighlightedWord(verse.verse_key)
  const { hideArabic, isVerseInHideScope, isVerseRevealed, toggleVerseReveal } =
    useReaderSettings()
  // E-12: user-applied verse highlight colour — a passing "you jumped here"
  // tint (targetAyahId, below) takes visual priority over a permanent one
  // when both apply to the same word, rather than fighting over background-color.
  const { getHighlightColor } = useNotes()
  const highlightColor = getHighlightColor(verse.verse_key)
  
  // E-15: Spatial Heatmap
  const { isMemorised } = useHifz()
  const { isRead } = useSurahProgressContext()
  const memorised = isMemorised(verse.verse_key)
  const read = isRead(verse.verse_key)

  const isFirstWordOfAyah =
    word.position === 1 || (verse.words && verse.words[0]?.id === word.id)
  const hideActive = hideArabic && isVerseInHideScope(verse.verse_key)
  const revealed = isVerseRevealed(verse.verse_key)

  if (word.char_type_name === "end") {
    // If rendered standalone (fallback)
    return (
      <span
        id={!isFirstWordOfAyah ? `ayah-marker-${verse.verse_key.replace(":", "-")}` : undefined}
        className={cn(
          "inline-flex shrink-0 items-center select-none",
          highlightColor && HIGHLIGHT_BG_CLASS[highlightColor],
        )}
      >
        <AyahEndMarker
          digits={word.qpc_uthmani_hafs || word.text_uthmani}
          ariaLabel={`Ayah ${verse.verse_number}`}
          onClick={() => onAyahClick(verse)}
        />
      </span>
    )
  }

  const wordContent = (
    <>
      <ArabicWord
        word={word}
        verseKey={verse.verse_key}
        isHighlighted={highlightedPosition === word.position}
        disableTooltip={false}
        onWordClick={onWordClick}
        qcfFontFamily={qcfFontFamily}
      />
      {attachedEndMarker && (
        <span
          id={`ayah-marker-${verse.verse_key.replace(":", "-")}`}
          className="inline-flex shrink-0 items-center select-none"
        >
          <AyahEndMarker
            digits={attachedEndMarker.qpc_uthmani_hafs || attachedEndMarker.text_uthmani}
            ariaLabel={`Ayah ${verse.verse_number}`}
            onClick={() => onAyahClick(verse)}
          />
        </span>
      )}
    </>
  )

  const masked = hideActive && !revealed

  return (
    <span
      id={isFirstWordOfAyah ? `ayah-${verse.verse_key.replace(":", "-")}` : undefined}
      data-verse-key={verse.verse_key}
      className={cn(
        qcfFontFamily
          // QCF renders one glyph per whole word with no space character
          // between them — the font's own side-bearing is the only gap
          // unless we add one. me-[0.22em] (margin-inline-end — the visual
          // left side in this RTL flow, i.e. the gap toward the next word)
          // gives every word clear, even breathing room without touching
          // the letter-spacing inside any single word.
          ? "inline shrink-0 me-[0.22em]"
          : "inline-flex items-center gap-0.5 sm:gap-1 shrink-0",
        targetAyahId === verse.verse_number
          ? "rounded-xs bg-primary/10"
          : highlightColor
            ? HIGHLIGHT_BG_CLASS[highlightColor]
            : memorised
              ? "bg-amber-500/10 rounded-xs"
              : read
                ? "bg-green-500/5 rounded-xs"
                : "",
      )}
    >
      {masked ? (
        // Inert + blurred until tapped — mirrors HideableArabic's compact
        // masked state. Words from the same verse can span several printed
        // lines; tapping any one of them reveals the whole verse at once
        // since they all read the same shared `isVerseRevealed` state.
        <span
          role="button"
          tabIndex={0}
          onClick={() => toggleVerseReveal(verse.verse_key)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              toggleVerseReveal(verse.verse_key)
            }
          }}
          aria-label={`Reveal Arabic for ${verse.verse_key}`}
          className={cn(
            "inline cursor-pointer select-none rounded-sm blur-[5px] opacity-65 saturate-50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
          )}
        >
          <span className="pointer-events-none" aria-hidden>
            {wordContent}
          </span>
        </span>
      ) : (
        wordContent
      )}
    </span>
  )
}

/** True once the word currently being recited (per the shared playback
 * store) lives on this printed line — a line can span the tail of one verse
 * and the start of the next, so this checks every item on the line rather
 * than assuming one verse per line. */
function useIsLineActive(
  lineItems: { word: Word; verse: Verse; attachedEndMarker?: Word | null }[],
): boolean {
  const activeVerseKey = usePlaybackVerseKey()
  const relevantVerseKey =
    lineItems.find((item) => item.verse.verse_key === activeVerseKey)?.verse.verse_key ?? null
  const highlightedPosition = useHighlightedWord(relevantVerseKey ?? "")
  if (relevantVerseKey === null) return false
  return lineItems.some(
    (item) =>
      item.word.char_type_name !== "end" &&
      item.verse.verse_key === relevantVerseKey &&
      item.word.position === highlightedPosition,
  )
}

/** One printed line — its own component (like LineWord) so the playback
 * hooks driving the karaoke-style highlight/auto-scroll are called
 * correctly per line, not once for the whole page. */
function MushafLine({
  pageNumber,
  lineNumber,
  lineItems,
  qcfFontFamily,
  isShortLastLine,
  isDenseLine,
  isVeryDense,
  targetAyahId,
  onWordClick,
  onAyahClick,
  pageScale,
  onScaleMeasured,
}: {
  pageNumber: number
  lineNumber: number
  lineItems: { word: Word; verse: Verse; attachedEndMarker?: Word | null }[]
  qcfFontFamily?: string | null
  isShortLastLine: boolean
  isDenseLine: boolean
  isVeryDense: boolean
  targetAyahId?: number
  onWordClick: (word: Word, verseKey?: string) => void
  onAyahClick: (verse: Verse) => void
  pageScale: number | null
  onScaleMeasured: (ratio: number) => void
}) {
  const { autoFollowRecitation } = useReaderSettings()
  const isActive = useIsLineActive(lineItems) && autoFollowRecitation
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return
    wrapperRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [isActive])

  const words = lineItems.map(({ word, verse, attachedEndMarker }) => (
    <LineWord
      key={word.id}
      word={word}
      verse={verse}
      targetAyahId={targetAyahId}
      onWordClick={onWordClick}
      onAyahClick={onAyahClick}
      attachedEndMarker={attachedEndMarker}
      qcfFontFamily={qcfFontFamily}
    />
  ))

  return (
    <div
      ref={wrapperRef}
      data-line-id={`page-${pageNumber}-line-${lineNumber}`}
      data-first-verse-key={lineItems[0]?.verse.verse_key}
      className={cn(
        "w-full rounded-sm transition-colors duration-300",
        isActive && "bg-primary/8",
      )}
    >
      {qcfFontFamily ? (
        // Real QCF glyphs already encode each word's exact advance
        // width/kashida for this printed line. QcfLine measures the natural
        // width and scales it to fit the page exactly — flush both edges,
        // at any container width, without clipping a single glyph.
        <QcfLine
          data-line-number={lineNumber}
          className="w-full leading-[1.25]"
          justify={!isShortLastLine}
          pageScale={pageScale}
          onScaleMeasured={onScaleMeasured}
        >
          {words}
        </QcfLine>
      ) : (
        <div
          data-line-number={lineNumber}
          className={cn(
            "w-full leading-none flex items-center flex-nowrap",
            isVeryDense ? "text-[0.88em]" : isDenseLine ? "text-[0.93em]" : "text-[1em]",
            isShortLastLine ? "justify-center gap-2 sm:gap-3.5 md:gap-5" : "justify-between",
          )}
        >
          {words}
        </div>
      )}
    </div>
  )
}

/** Placeholder shown in place of a Mushaf page's text body while its QCF
 * glyph font is still loading. */
function MushafPageSkeleton({ centered, lineCount }: { centered: boolean; lineCount: number }) {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex flex-col flex-1 items-center justify-center h-full w-full gap-4"
    >
      <svg 
        className="w-12 h-12 text-reader-paper-gilt animate-[spin_4s_linear_infinite]" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L14.8 7.2L20.5 6L19 11.5L23.5 15.5L18 17.5L16.5 23L12 19L7.5 23L6 17.5L0.5 15.5L5 11.5L3.5 6L9.2 7.2L12 2ZM12 5.5L10 8.5L6.5 7.5L7.5 11L4.5 14L8 15L9 18.5L12 16L15 18.5L16 15L19.5 14L16.5 11L17.5 7.5L14 8.5L12 5.5Z" />
      </svg>
      <span className="font-uthmani text-reader-paper-gilt/80 animate-pulse text-lg tracking-wide">
        جاري التحميل...
      </span>
      <span className="sr-only">Loading…</span>
    </div>
  )
}

/** Juz/hizb marker breaking the flow at section boundaries */
function SectionMarker({
  arabicLabel,
  englishLabel,
  number,
  emphasized,
}: {
  arabicLabel: string
  englishLabel: string
  number: number
  emphasized: boolean
}) {
  return (
    <div
      dir="rtl"
      role="separator"
      aria-label={`${englishLabel} ${number}`}
      className={cn(
        "mushaf-marker mx-auto my-6 flex w-fit items-center gap-2.5 px-4 py-1.5",
        !emphasized && "opacity-85",
      )}
    >
      <span className={cn("quran-arabic text-base leading-none text-gold", emphasized ? "font-medium" : "")}>
        {arabicLabel} {toArabicDigits(number)}
      </span>
      <span aria-hidden className="h-3 w-px bg-gold/30" />
      <span dir="ltr" className="shrink-0 font-mono text-[10px] tabular-nums tracking-wide text-muted-foreground">
        {englishLabel} {number}
      </span>
    </div>
  )
}

interface MushafPage {
  pageNumber: number
  verses: Verse[]
  hasSurahStart: boolean
  juzNumber?: number
  hizbNumber?: number
  lines: { lineNumber: number; words: { word: Word; verse: Verse }[] }[]
}

/** One printed Mushaf page — its own component so useQcfPageFont can load
 * that page's glyph font independently as it scrolls into view. */
function ReadingPage({
  page,
  prevPage,
  chapter,
  chaptersById,
  targetAyahId,
  onWordClick,
  onAyahClick,
  enableScrollTurn = true,
}: {
  page: MushafPage
  prevPage: MushafPage | null
  chapter?: Chapter
  chaptersById: Map<number, Chapter>
  targetAyahId?: number
  onWordClick: (word: Word, verseKey?: string) => void
  onAyahClick: (verse: Verse) => void
  /** Scroll-linked fade/scale as the page crosses the viewport — for the
   * continuous-scroll and split-view layouts, where pages genuinely scroll
   * past. Paged mode swaps a single settled page via its own 3D flip
   * animation instead; leaving this on there let the view-timeline
   * animation fire mid-transition whenever the surrounding document wasn't
   * scrolled to the exact settled position, rendering the page at a
   * partial opacity/scale/translateY — a "ghost" second card outline
   * behind the real one. */
  enableScrollTurn?: boolean
}) {
  // A surah can span dozens of Mushaf pages — only fetch this page's font
  // once it's actually near the viewport, not the moment it mounts, so
  // scrolling through a long surah (or one pulled in by infinite scroll)
  // doesn't kick off font requests for every page at once.
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el || isNearViewport) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsNearViewport(true)
          observer.disconnect()
        }
      },
      { rootMargin: "600px 0px 600px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isNearViewport])



  // Falls back to the Unicode qpc_uthmani_hafs/text_uthmani rendering
  // already in ArabicWord/AyahEndMarker until this page's font resolves.
  const { fontFamily: qcfFontFamily, isLoading: fontLoading } = useQcfPageFont(
    page.pageNumber,
    isNearViewport,
  )

  // E-15: Page completion calculation
  const { isMemorised } = useHifz()
  const { isRead } = useSurahProgressContext()
  const { data: session } = useSession()

  const totalAyahs = page.verses.length
  let readCount = 0
  let memCount = 0
  for (const v of page.verses) {
    if (isRead(v.verse_key)) readCount++
    if (isMemorised(v.verse_key)) memCount++
  }

  const readPercent = totalAyahs > 0 ? Math.round((readCount / totalAyahs) * 100) : 0
  const isFullyMemorised = totalAyahs > 0 && memCount === totalAyahs

  // Signed-out visitors have nothing to show here — read-progress is
  // account-backed (useSurahProgress only fetches once signed in), so this
  // would otherwise be a permanent, misleading "0%" on every single page.
  const completionBadge = totalAyahs > 0 && session?.user ? (
    <div
      title={
        isFullyMemorised
          ? "You've read and memorized every ayah on this page"
          : `You've read ${readPercent}% of this page's ayahs`
      }
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-reader-paper/50 border border-reader-paper-gilt/30 text-[10px] text-reader-paper-ink-soft"
    >
      <span>{readPercent}%</span>
      {isFullyMemorised && <span className="text-amber-500">★</span>}
    </div>
  ) : null

  const isNewJuz = !!prevPage && page.juzNumber !== prevPage.juzNumber
  const isNewHizb = !isNewJuz && !!prevPage && page.hizbNumber !== prevPage.hizbNumber

  const marginBadges = []
  if (isNewJuz && page.juzNumber) {
    marginBadges.push({
      id: `juz-${page.juzNumber}`,
      title: "الجزء",
      number: page.juzNumber,
      sublabel: `Juz ${page.juzNumber}`,
      type: "juz" as const,
    })
  } else if (isNewHizb && page.hizbNumber) {
    marginBadges.push({
      id: `hizb-${page.hizbNumber}`,
      title: "الحزب",
      number: page.hizbNumber,
      sublabel: `Hizb ${page.hizbNumber}`,
      type: "hizb" as const,
    })
  }

  const isCenteredOpeningPage = page.pageNumber <= 2
  // Pages with multiple surahs (e.g. Juz 30) have far fewer than 15 word-lines
  // but inject inline SurahHeaderCartouche+BismillahHeader as extra flex children.
  // justify-between on such pages inflates the flex height beyond the fixed
  // aspect-ratio frame, bleeding text out the bottom. Detect and switch layout.
  const surahStartCount = page.lines.filter(({ words }) =>
    words.some(({ word, verse }) => verse.verse_number === 1 && word.position === 1)
  ).length
  const isMultiSurahPage = surahStartCount > 1

  // Shared QCF fit ratio for this page — every full line reports its own
  // measured ratio here (they should all agree, since they share one
  // container width and one canonical QCF line width), and a short line
  // (detected in QcfLine by comparing its own ratio against this one)
  // applies the shared ratio instead of its own natural size, which
  // otherwise looks visibly mismatched against the rest of the page (most
  // noticeably the ayah-end medallion glyph). Starts `null`, not a guessed
  // number — an arbitrary starting value could itself get flagged as the
  // "baseline" a genuinely full first line looks anomalous against.
  //
  // Kept as the MINIMUM of every reported ratio, not the latest — on the
  // very first render every line still sees `pageScale` as `null` (a
  // sibling's setState from this same pass hasn't committed yet), so a
  // short line can slip through undetected once and report its own
  // inflated ratio too. Reducing by minimum makes the result independent of
  // which line's report lands last: a short line's ratio is always well
  // above a full line's, so the true full-line baseline naturally survives.
  const [pageScale, setPageScale] = useState<number | null>(null)
  const handleScaleMeasured = useCallback((ratio: number) => {
    setPageScale((prev) => (prev == null || ratio < prev ? ratio : prev))
  }, [])

  // The real Madani mushaf's page header names whichever surah opens
  // the page — not necessarily the surah this route was loaded for,
  // since a short surah's neighbor can share the page.
  const pageLeadSurahId = Number(page.verses[0]?.verse_key.split(":")[0])
  const pageHeaderChapter = chaptersById.get(pageLeadSurahId) ?? chapter

  return (
    <div ref={containerRef} className={enableScrollTurn ? "mushaf-page-turn" : undefined}>
      <MushafPageFrame
        pageNumber={page.pageNumber}
        juzNumber={page.juzNumber}
        surahNameArabic={pageHeaderChapter?.name_arabic}
        marginBadges={marginBadges}
        completionBadge={completionBadge}
        hasSurahStart={page.hasSurahStart}
      >
        {/* Surah Title Cartouche (Unwan) when Surah begins on this page.
            Only for the centered opening pages (Fatihah / early Baqarah) —
            those are always single-surah. Every other page's surah-start
            cartouche is rendered inline, right before its own line, since
            a shared page can start a surah mid-page. */}
        {isCenteredOpeningPage && page.hasSurahStart && pageHeaderChapter && (
          <div className="w-full mb-3">
            <SurahHeaderCartouche chapter={pageHeaderChapter} />
            {/* For Surahs with bismillah_pre (Surahs 2-114 except 9) */}
            {pageHeaderChapter.bismillah_pre && <BismillahHeader />}
          </div>
        )}

        {/* 15-Line Madani Standard Grid or Centered Opening Page */}
        <div
          ref={contentRef}
          dir="rtl"
          lang="ar"
          className={cn(
            "quran-arabic font-uthmani select-text w-full reading-mode-text h-full flex-1",
            "text-reader-ink",
            isCenteredOpeningPage
              ? "flex flex-col items-center justify-center space-y-2 py-1 text-center leading-[2.0]"
              : isMultiSurahPage
                // Multi-surah pages (Juz 30): flow from top with consistent gap.
                // justify-between would spread few lines + multiple headers to fill
                // the full frame height, exceeding the aspect-ratio box.
                ? "flex flex-col justify-start gap-[0.55em] pt-0.5 pb-2 sm:pb-2.5"
                // Standard 15-line pages: justify-between spreads lines to fill the frame.
                : "flex flex-col justify-between gap-[0.4em] pt-0.5 pb-2 sm:pb-2.5",
            // The font size MUST be mathematically identical on every page to preserve the grid.
            // A Surah Header + Bismillah physically replaces exactly 3 or 4 lines of text.
            // Using cqw (inline/width) instead of cqh to avoid cyclic height dependency in Chrome/WebKit:
            // the outer frame is aspect-[1/1.5] so width is always proportional to height — safe anchor.
            "text-[clamp(16px,6.2cqw,40px)]",
          )}
        >
          {fontLoading ? (
            <MushafPageSkeleton
              centered={isCenteredOpeningPage}
              lineCount={isCenteredOpeningPage ? Math.max(page.verses.length, 3) : 15}
            />
          ) : isCenteredOpeningPage ? (
            // Opening pages (Fatihah / Baqarah 1-5): Continuous centered calligraphic flow
            page.verses.map((verse) => (
              <div key={verse.id} className="w-full text-center" data-first-verse-key={verse.verse_key}>
                <ReadingVerse
                  verse={verse}
                  isTarget={targetAyahId === verse.verse_number}
                  onWordClick={onWordClick}
                  onAyahClick={onAyahClick}
                  qcfFontFamily={qcfFontFamily}
                />
              </div>
            ))
          ) : (
            // Standard 15-Line Madani Page: Exact line-by-line justified rendering
            page.lines.map(({ lineNumber, words }, index) => {
              const isLastLine = index === page.lines.length - 1
              const isShortLastLine = isLastLine && words.length <= 5

              // A new surah always opens on a fresh printed line — never
              // mid-line — so this is enough to catch every surah start
              // on a shared page, not just the one this route loaded.
              const surahStart = words.find(
                ({ word, verse }) => verse.verse_number === 1 && word.position === 1,
              )
              const startingChapter = surahStart
                ? chaptersById.get(Number(surahStart.verse.verse_key.split(":")[0]))
                : null

              // Pre-process words for this printed line: pair end-of-ayah marker with its preceding word
              const lineItems: { word: Word; verse: Verse; attachedEndMarker?: Word | null }[] = []
              for (let wIdx = 0; wIdx < words.length; wIdx++) {
                const current = words[wIdx]
                if (current.word.char_type_name === "end") {
                  continue
                }
                const isLastInLine = wIdx === words.length - 1
                const attachedEndMarker =
                  !isLastInLine && words[wIdx + 1]?.word.char_type_name === "end"
                    ? words[wIdx + 1]?.word
                    : null
                lineItems.push({ word: current.word, verse: current.verse, attachedEndMarker })
              }

              // In the King Fahd printed mushaf, words are spaced such that they
              // exactly fill the physical 13cm width. A line with 6 words vs 14
              // words requires vastly different space-between distribution to
              // maintain that flush-left/flush-right block boundary.
              const isVeryDense = lineItems.length > 12
              const isDenseLine = lineItems.length > 9

              return (
                <Fragment key={lineNumber}>
                  {surahStart && startingChapter && (
                    <div className="w-full">
                      <SurahHeaderCartouche chapter={startingChapter} />
                      {startingChapter.bismillah_pre && <BismillahHeader />}
                    </div>
                  )}
                  <MushafLine
                    pageNumber={page.pageNumber}
                    lineNumber={lineNumber}
                    lineItems={lineItems}
                    qcfFontFamily={qcfFontFamily}
                    isShortLastLine={isShortLastLine}
                    isDenseLine={isDenseLine}
                    isVeryDense={isVeryDense}
                    targetAyahId={targetAyahId}
                    onWordClick={onWordClick}
                    onAyahClick={onAyahClick}
                    pageScale={pageScale}
                    onScaleMeasured={handleScaleMeasured}
                  />
                </Fragment>
              )
            })
          )}
        </div>
      </MushafPageFrame>
    </div>
  )
}

/** Floating "where am I" pill — page/Juz/Hizb context that would otherwise
 * only live in MushafPageFrame's own header/footer, which scrolls away.
 * Sits above BottomNav and MiniPlayer (both mobile and desktop) rather than
 * fighting them for the same fixed-bottom real estate. */
function PageProgressPill({
  pageNumber,
  juzNumber,
  hizbNumber,
}: {
  pageNumber: number
  juzNumber?: number
  hizbNumber?: number
}) {
  const player = useAudioPlayerOptional()
  const playerVisible = !!player && player.status !== "idle"

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-30 flex justify-center transition-[bottom] duration-[var(--dur-base)]",
        playerVisible ? "bottom-48 md:bottom-24" : "bottom-24 md:bottom-4",
      )}
    >
      <div
        dir="ltr"
        className="flex items-center gap-1.5 rounded-full border border-border/50 bg-background/70 px-3.5 py-1.5 text-xs font-medium tabular-nums text-muted-foreground shadow-md backdrop-blur-md"
      >
        <span>Page {toArabicDigits(pageNumber)}</span>
        {juzNumber != null && (
          <>
            <span className="opacity-50">·</span>
            <span>Juz {toArabicDigits(juzNumber)}</span>
          </>
        )}
        {hizbNumber != null && (
          <>
            <span className="opacity-50">·</span>
            <span>Hizb {toArabicDigits(hizbNumber)}</span>
          </>
        )}
      </div>
    </div>
  )
}

/** E-08: thin right-edge strip of one block per Mushaf page in this surah —
 * spatial "where am I in this long surah" awareness that a scrollbar alone
 * doesn't give, since a scrollbar's thumb size/position tracks pixel height,
 * not page count. Scroll layout only: Paged mode already occupies this same
 * edge with its own next-page chevron, and already has an equivalent "N of
 * total" readout via its page counter. Purely a visual/mouse affordance —
 * marked aria-hidden since the sidebar surah list and ayah picker already
 * cover keyboard/screen-reader navigation, and 40+ identical unlabeled
 * "jump to page" buttons would be poor screen-reader experience anyway. */
function MushafMinimap({
  pages,
  activePageNumber,
  onJump,
}: {
  pages: { pageNumber: number }[]
  activePageNumber: number | null
  onJump: (pageNumber: number) => void
}) {
  if (pages.length < 2) return null

  return (
    <div
      aria-hidden="true"
      className="fixed right-1 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-[2px] md:flex"
      style={{ height: "min(60dvh, 34rem)" }}
    >
      {pages.map((page) => {
        const active = page.pageNumber === activePageNumber
        return (
          <button
            key={page.pageNumber}
            type="button"
            tabIndex={-1}
            title={`Page ${page.pageNumber}`}
            onClick={() => onJump(page.pageNumber)}
            className={cn(
              "min-h-[2px] w-1.5 flex-1 rounded-full transition-colors duration-150",
              active ? "bg-gold" : "bg-muted-foreground/25 hover:bg-muted-foreground/50",
            )}
          />
        )
      })}
    </div>
  )
}

/**
 * E-09: right-hand column of translation blocks, one per ayah, keyed to the
 * exact same `verses` the Mushaf column renders. Independently scrollable
 * (its own overflow-y-auto) — ReadingModeView keeps it loosely synced to
 * whichever ayah is current in the Mushaf column rather than living in the
 * same scroll flow, which is what "bidirectional sync" actually needs to
 * mean once two columns can each have very different content heights per
 * ayah (a one-line ayah's Arabic vs. three paragraphs of tafsir-length
 * translation).
 */
function SplitTranslationPanel({
  innerRef,
  verses,
  activeTranslationIds,
  activeVerseKey,
  clickedVerseKey,
  onAyahClick,
}: {
  innerRef: RefObject<HTMLDivElement | null>
  verses: Verse[]
  activeTranslationIds: number[]
  activeVerseKey: string | null
  clickedVerseKey: string | null
  onAyahClick: (verseKey: string) => void
}) {
  return (
    <div
      ref={innerRef}
      className="hidden md:block md:w-2/5 md:shrink-0 md:sticky md:top-4 md:max-h-[calc(100dvh-2rem)] md:overflow-y-auto md:rounded-lg md:border md:border-border/50"
      aria-label="Translation"
    >
      <div className="flex flex-col divide-y divide-border/40">
        {verses.map((verse) => {
          const translations = verse.translations.filter((t) =>
            activeTranslationIds.includes(t.resource_id),
          )
          const isActive = verse.verse_key === activeVerseKey || verse.verse_key === clickedVerseKey
          return (
            <button
              key={verse.id}
              type="button"
              data-verse-key={verse.verse_key}
              onClick={() => onAyahClick(verse.verse_key)}
              className={cn(
                "flex flex-col items-start gap-1 px-4 py-4 text-left transition-colors duration-200",
                isActive ? "bg-primary/5" : "hover:bg-muted/40",
              )}
            >
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {verse.verse_key}
              </span>
              {translations.length > 0 ? (
                translations.map((t) => <TranslationBlock key={t.resource_id} translation={t} />)
              ) : (
                <p className="text-xs text-muted-foreground/60">No translation selected</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const SWIPE_THRESHOLD_PX = 60
/** Must match the duration in .mushaf-flip-next/.mushaf-flip-prev (globals.css). */
const FLIP_ANIMATION_MS = 420
/** E-13: reader width at which Paged layout shows a two-page spread instead
 * of one page. The reading column sits inside `<article class="max-w-5xl ...">`
 * (see [surahId]/page.tsx), so its content can never exceed ~976px no matter
 * how wide the viewport is — a 68rem (1088px) threshold, matching the ticket's
 * literal number, would make the spread permanently unreachable. 44rem (704px)
 * is the largest round breakpoint that still leaves both pages a legible width
 * within that 976px ceiling once the center gap/binding shadow are subtracted. */
const SPREAD_MIN_WIDTH_PX = 44 * 16

/** One "page turn" unit in Paged layout: a genuine odd+even pair when the
 * reader is wide enough and both pages are loaded, otherwise a lone page. */
interface PageSpread {
  right: MushafPage
  left: MushafPage | null
}

/**
 * E-06: one Mushaf page at a time, turned via swipe, on-screen arrows, or
 * arrow keys, with a directional 3D flip on entry. Reuses `ReadingPage`
 * unchanged — this only supplies the framing (perspective, gesture capture,
 * nav affordances) around it; a `key`d remount on the page itself is what
 * re-triggers the flip keyframe each time the page changes.
 */
function PagedMushafDeck({
  spread,
  spreadIndex,
  totalSpreads,
  totalPages,
  chapter,
  chaptersById,
  targetAyahId,
  onWordClick,
  onAyahClick,
  flipDirection,
  onPrev,
  onNext,
}: {
  spread: PageSpread
  spreadIndex: number
  totalSpreads: number
  totalPages: number
  chapter?: Chapter
  chaptersById: Map<number, Chapter>
  targetAyahId?: number
  onWordClick: (word: Word, verseKey?: string) => void
  onAyahClick: (verse: Verse) => void
  flipDirection: "next" | "prev" | null
  onPrev: () => void
  onNext: () => void
}) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  // Deliberately not ANDed with `!isFlipping` — that's a sub-second guard
  // against a genuine double-input (handled centrally in goToPage), not a
  // real "can't turn the page" state, so it shouldn't flicker the arrows'
  // opacity-0-when-disabled styling on every single page turn.
  const canGoPrev = spreadIndex > 0
  const canGoNext = spreadIndex < totalSpreads - 1

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    touchStartRef.current = { x: e.clientX, y: e.clientY }
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return
    // Arabic pages turn right-to-left, like a physical Mushaf: swiping
    // toward the spine (leftward) advances to the next page.
    if (dx < 0) onNext()
    else onPrev()
  }

  return (
    <div className="w-full">
      {/* Arrows sit in their own flex gutters beside the page(s), not
       * overlaid on top of them — an overlay button placed over the page
       * image at any width can end up sitting on top of the ayahs
       * themselves, which is precisely the "canvas" a reader shouldn't be
       * covering. */}
      <div className="flex items-center gap-1 sm:gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev}
          title="Previous page"
          aria-label="Previous page"
          className="flex size-10 shrink-0 items-center justify-center disabled:pointer-events-none disabled:opacity-0 sm:size-12 group z-10"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-md backdrop-blur-md sm:size-12">
            <ChevronLeft className="size-5 sm:size-6 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
          </span>
        </button>

        <div className="relative min-w-0 flex-1" style={{ perspective: "1600px" }}>
          <div
            key={spread.right.pageNumber}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            className={cn(
              "w-full touch-pan-y relative",
              flipDirection === "next" && "mushaf-flip-next",
              flipDirection === "prev" && "mushaf-flip-prev",
            )}
            style={{
              transformOrigin: flipDirection === "prev" ? "left center" : "right center",
              backfaceVisibility: "hidden",
            }}
          >
            {/* items-start, not items-center: a mid-page surah transition (a
             * surah-end + a new surah's header/Bismillah + its opening ayahs
             * all on one Mushaf page) makes that page's rendered content
             * taller than its spread-mate. Centering each page independently
             * then left the taller one hanging lower than the other, like a
             * torn-out page — top-aligning keeps both pages sitting on the
             * same "shelf", as they would in a real bound Mushaf. */}
            <div className={cn("grid gap-8 items-stretch", spread.left ? "grid-cols-2" : "grid-cols-1 mx-auto max-w-[min(100%,48rem)]")}>
              {spread.left && (
                // @container: MushafPageFrame sizes itself off `100cqw`, which
                // otherwise resolves against the far [surahId]/layout.tsx
                // ancestor's full width instead of this ~half-width column,
                // letting the page render at its 36.25rem max and overflow the
                // grid cell.
                <div className="relative @container">
                  {/* Center binding shadow on the right edge of the left page */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent z-10" />
                  <ReadingPage
                    page={spread.left}
                    prevPage={spread.right}
                    chapter={chapter}
                    chaptersById={chaptersById}
                    targetAyahId={targetAyahId}
                    onWordClick={onWordClick}
                    onAyahClick={onAyahClick}
                    enableScrollTurn={false}
                  />
                </div>
              )}
              <div className="relative @container">
                {spread.left && (
                  /* Center binding shadow on the left edge of the right page */
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent z-10" />
                )}
                <ReadingPage
                  page={spread.right}
                  prevPage={null}
                  chapter={chapter}
                  chaptersById={chaptersById}
                  targetAyahId={targetAyahId}
                  onWordClick={onWordClick}
                  onAyahClick={onAyahClick}
                  enableScrollTurn={false}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          title="Next page"
          aria-label="Next page"
          className="flex size-10 shrink-0 items-center justify-center disabled:pointer-events-none disabled:opacity-0 sm:size-12 group z-10"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-md backdrop-blur-md sm:size-12">
            <ChevronRight className="size-5 sm:size-6 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </span>
        </button>
      </div>

      <div dir="ltr" className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {spread.left ? `${spread.right.pageNumber}–${spread.left.pageNumber}` : spread.right.pageNumber}
        </span>
        <span>of</span>
        <span className="tabular-nums">{totalPages}</span>
      </div>
    </div>
  )
}

/**
 * Authentic Printed Quran (Mushaf) 15-Line Madani Reading Mode
 * Features:
 * - Exact 15-line standard line-by-line rendering matching King Fahd Madani Mushaf
 * - Centered calligraphic layout on opening pages (Al-Fatihah / Al-Baqarah 1-5)
 * - Surah title cartouches (Unwan) and calligraphic Basmalah
 * - Docked Word Study Ribbon on word interaction
 * - Context Toolbar on Ayah End Marker interaction
 */
export function ReadingModeView({
  verses,
  targetAyahId,
  chapter,
  onPagedPositionChange,
}: ReadingModeViewProps) {
  const [selectedWord, setSelectedWord] = useState<{ word: Word; verseKey?: string } | null>(null)
  const [selectedAyah, setSelectedAyah] = useState<Verse | null>(null)
  const chapters = useChapters()
  const chaptersById = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters])
  const { readingLayout, activeTranslations, showTranslation, splitViewTranslation } =
    useReaderSettings()
  // Scroll layout only (E-06's Paged mode already occupies the reader with
  // its own one-page-at-a-time affordances and has nowhere to put a second
  // scrolling column).
  const splitView = readingLayout === "scroll" && splitViewTranslation && showTranslation
  const player = useAudioPlayerOptional()
  
  // E-04: "Continue Reading" Resume Marker Tracking
  const { lastReadPosition, clearLastReadPosition, reobserve } = useReadingPosition(chapter?.id)

  // Use the reobserve function when pages render or change so we correctly track the DOM
  useEffect(() => {
    reobserve()
  }, [verses, readingLayout, splitView, reobserve])

  const [hasRestoredPosition, setHasRestoredPosition] = useState(false)
  const [showResumeToast, setShowResumeToast] = useState(false)

  // When returning to the surah, auto-scroll to the last read position
  useEffect(() => {
    if (lastReadPosition && !hasRestoredPosition && !targetAyahId) {
      const el = document.querySelector(`[data-first-verse-key="${lastReadPosition.verseKey}"]`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        setHasRestoredPosition(true)
        setShowResumeToast(true)
        
        // Hide the toast after a few seconds
        const t = setTimeout(() => setShowResumeToast(false), 5000)
        return () => clearTimeout(t)
      }
    }
  }, [lastReadPosition, hasRestoredPosition, targetAyahId])

  // Same map QuranReader saves "last read" positions into — read-only here,
  // just to pick a sensible starting page when Paged mode opens with no
  // explicit ayah target.
  const [lastReadMap] = useLocalStorage<Record<number, number>>(
    LAST_READ_STORAGE_KEY,
    EMPTY_LAST_READ_MAP,
  )

  // Group verses into authentic printed Mushaf pages and 15 lines per page
  const pages = useMemo(() => {
    const pageMap = new Map<number, Verse[]>()
    for (const verse of verses) {
      const p = verse.page_number || 1
      const list = pageMap.get(p) ?? []
      list.push(verse)
      pageMap.set(p, list)
    }

    return Array.from(pageMap.entries()).map(([pageNumber, pageVerses]) => {
      const firstVerse = pageVerses[0]
      const hasSurahStart = pageVerses.some((v) => v.verse_number === 1)
      const juzNumber = firstVerse?.juz_number
      const hizbNumber = firstVerse?.hizb_number

      // Group words into lines 1..15 based on word.line_number
      const lineMap = new Map<number, { word: Word; verse: Verse }[]>()
      for (let i = 1; i <= 15; i++) {
        lineMap.set(i, [])
      }

      pageVerses.forEach((verse) => {
        (verse.words ?? []).forEach((word) => {
          const lNum = word.line_number || 1
          const lineList = lineMap.get(lNum) ?? []
          lineList.push({ word, verse })
          lineMap.set(lNum, lineList)
        })
      })

      const lines = Array.from(lineMap.entries())
        .map(([lineNumber, words]) => ({ lineNumber, words }))
        .filter((l) => l.words.length > 0)

      return {
        pageNumber,
        verses: pageVerses,
        hasSurahStart,
        juzNumber,
        hizbNumber,
        lines,
      }
    })
  }, [verses])

  // ---------- Split view: synced translation column (E-09) ----------
  // The verse currently centered in the Mushaf column, tracked only while
  // split view is on. Drives which translation row gets scrolled into view
  // + highlighted — one-directional (mushaf leads, translation follows) to
  // avoid the two columns fighting for scroll control; the reverse direction
  // is click-driven instead (see jumpFromTranslation below), which the
  // ticket explicitly calls for regardless.
  const mushafColumnRef = useRef<HTMLDivElement>(null)
  const translationColumnRef = useRef<HTMLDivElement>(null)
  const [mushafActiveVerseKey, setMushafActiveVerseKey] = useState<string | null>(null)
  // Explicit click in either panel — a temporary highlight independent of
  // (and layered on top of) `targetAyahId`'s own explicit-jump highlight.
  const [splitClickVerseKey, setSplitClickVerseKey] = useState<string | null>(null)
  const splitClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!splitView) return
    const root = mushafColumnRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        // Furthest down in DOM order — with a thin center band this is
        // normally the only (or last) candidate anyway; compareDocumentPosition
        // keeps it correct regardless of the two page-layout shapes
        // (MushafLine's grid vs ReadingVerse's centered-opening-page flow)
        // these elements can come from.
        const lowest = visible.reduce((a, b) =>
          a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? b : a,
        )
        const verseKey = lowest.target.getAttribute("data-first-verse-key")
        if (verseKey) setMushafActiveVerseKey(verseKey)
      },
      { root: null, rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    )

    const observeAll = () => {
      root.querySelectorAll("[data-first-verse-key]").forEach((el) => observer.observe(el))
    }
    observeAll()

    // A page's lines only exist once its QCF font has loaded (skeleton
    // placeholders otherwise, see ReadingPage) — most pages aren't rendered
    // yet at mount, so without this the observer's candidate pool stays
    // frozen to whichever handful of pages happened to load first, and
    // never updates as the user scrolls into pages that render later.
    // Re-observing is a no-op for elements already being watched.
    const mo = new MutationObserver(observeAll)
    mo.observe(root, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mo.disconnect()
    }
  }, [splitView, pages])

  // Debounced so a fast scroll doesn't yank the translation panel around on
  // every intermediate verse — only the one the mushaf column settles on.
  useEffect(() => {
    if (!splitView || !mushafActiveVerseKey) return
    const t = setTimeout(() => {
      const el = translationColumnRef.current?.querySelector(
        `[data-verse-key="${CSS.escape(mushafActiveVerseKey)}"]`,
      )
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }, 200)
    return () => clearTimeout(t)
  }, [splitView, mushafActiveVerseKey])

  function flashSplitClick(verseKey: string) {
    setSplitClickVerseKey(verseKey)
    if (splitClickTimerRef.current) clearTimeout(splitClickTimerRef.current)
    splitClickTimerRef.current = setTimeout(() => setSplitClickVerseKey(null), 4000)
  }

  useEffect(() => {
    return () => {
      if (splitClickTimerRef.current) clearTimeout(splitClickTimerRef.current)
    }
  }, [])

  /** Translation panel → Mushaf: scroll the ayah into view + highlight both. */
  function jumpFromTranslation(verseKey: string) {
    flashSplitClick(verseKey)
    const exact = mushafColumnRef.current?.querySelector(`[data-verse-key="${CSS.escape(verseKey)}"]`)
    if (exact) {
      exact.scrollIntoView({ block: "center", behavior: "smooth" })
      return
    }
    // The word-level spans this normally targets only exist once that
    // page's QCF font has loaded (skeleton otherwise, see ReadingPage) — a
    // translation row far from the current scroll position can easily be
    // clicked before its page has ever come near the viewport. Fall back to
    // scrolling the page itself into view; its font then starts loading
    // (proximity-triggered) and the exact ayah becomes reachable moments
    // later on its own.
    const page = pages.find((p) => p.verses.some((v) => v.verse_key === verseKey))
    if (!page) return
    document
      .querySelector(`[data-page-number="${page.pageNumber}"]`)
      ?.scrollIntoView({ block: "start", behavior: "smooth" })
  }

  // Which printed page is currently dominant on screen, for the floating
  // progress pill. A thin detection band near vertical center (rather than
  // "any part visible") means exactly one page's container crosses it at a
  // time in the common case, so simply taking the latest intersecting entry
  // is enough — no need to compare intersection ratios. Scroll-layout only —
  // Paged mode derives the same shape directly from `pagedIndex` below.
  const [scrollActivePage, setScrollActivePage] = useState<
    { pageNumber: number; juzNumber?: number; hizbNumber?: number } | null
  >(null)
  const pageElsRef = useRef(new Map<number, HTMLDivElement>())
  const pageRefCallbacksRef = useRef(new Map<number, (el: HTMLDivElement | null) => void>())

  function getPageRefCallback(pageNumber: number) {
    let cb = pageRefCallbacksRef.current.get(pageNumber)
    if (!cb) {
      cb = (el) => {
        if (el) pageElsRef.current.set(pageNumber, el)
        else pageElsRef.current.delete(pageNumber)
      }
      pageRefCallbacksRef.current.set(pageNumber, cb)
    }
    return cb
  }

  useEffect(() => {
    if (readingLayout !== "scroll") return

    setScrollActivePage(
      pages[0]
        ? { pageNumber: pages[0].pageNumber, juzNumber: pages[0].juzNumber, hizbNumber: pages[0].hizbNumber }
        : null,
    )

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length === 0) return

        const lowest = visible.reduce((a, b) =>
          Number(a.target.getAttribute("data-page-number")) >
          Number(b.target.getAttribute("data-page-number"))
            ? a
            : b,
        )
        const pageNumber = Number(lowest.target.getAttribute("data-page-number"))
        const page = pages.find((p) => p.pageNumber === pageNumber)
        if (page) {
          setScrollActivePage({ pageNumber: page.pageNumber, juzNumber: page.juzNumber, hizbNumber: page.hizbNumber })
        }
      },
      // A thin band around the vertical center of the viewport — a page is
      // "current" once its container crosses the middle of the screen, not
      // merely once any sliver of it is visible.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    )

    pageElsRef.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [readingLayout, pages])

  // ---------- Paged layout (E-06) / two-page spread (E-13) ----------
  // Same element the JSX return below attaches this to (the outermost
  // reader div) — its width tracks the ambient @container from
  // [surahId]/layout.tsx that MushafPageFrame's own cqw sizing already
  // depends on, so this observes "the same width CSS is reacting to"
  // without needing a ref threaded down from a distant ancestor.
  const spreadRootRef = useRef<HTMLDivElement>(null)
  // ≥68rem of reader width — matches the ticket's own breakpoint. Tracked in
  // JS (ResizeObserver on the reader root, below) so page-turn navigation
  // advances by the same unit CSS is currently displaying, not a fixed one.
  const [isSpreadEligible, setIsSpreadEligible] = useState(false)

  useEffect(() => {
    if (readingLayout !== "paged") return
    const el = spreadRootRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      setIsSpreadEligible((entries[0]?.contentRect.width ?? 0) >= SPREAD_MIN_WIDTH_PX)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [readingLayout])

  // Group pages into spread units. Below the breakpoint every page is its
  // own solo unit — identical to E-06's original one-at-a-time behaviour —
  // so the "advance one unit per turn" logic further down stays correct at
  // any width without a separate code path. At/above it, an odd page pairs
  // with the very next even page when one is actually loaded; a surah/page
  // boundary can leave a lone odd or even page with no loaded partner
  // (PagedMushafDeck just renders those alone rather than half-empty).
  const pageSpreads = useMemo<PageSpread[]>(() => {
    if (!isSpreadEligible) return pages.map((p) => ({ right: p, left: null }))
    const spreads: PageSpread[] = []
    let i = 0
    while (i < pages.length) {
      const p = pages[i]
      const next = pages[i + 1]
      if (p.pageNumber % 2 === 1 && next && next.pageNumber === p.pageNumber + 1) {
        spreads.push({ right: p, left: next })
        i += 2
      } else {
        spreads.push({ right: p, left: null })
        i += 1
      }
    }
    return spreads
  }, [pages, isSpreadEligible])

  // The stable piece of state is a page NUMBER, not a spread index —
  // pageSpreads' own grouping reshapes across the isSpreadEligible
  // breakpoint (a resize can turn two solo pages into one spread, or split
  // one back apart), so an index into it would silently point at the wrong
  // page the moment that happens. Deriving the index from a page number
  // instead means a resize just re-groups the display around wherever you
  // already are — no explicit remap effect needed.
  const [currentPageNumber, setCurrentPageNumber] = useState<number | null>(null)
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null)
  // Tracks which chapter the paged position was last resolved for, so manual
  // navigation isn't clobbered by unrelated re-renders (e.g. this surah's
  // own last-read position updating as the user pages through it) — only a
  // genuine surah change re-resolves the starting page.
  const pagedResolvedForRef = useRef<number | null>(null)

  useEffect(() => {
    if (readingLayout !== "paged") return
    if (pagedResolvedForRef.current === (chapter?.id ?? null)) return
    pagedResolvedForRef.current = chapter?.id ?? null

    const wantedAyah = targetAyahId ?? (chapter ? lastReadMap[chapter.id] : undefined)
    let pageNumber = pages[0]?.pageNumber ?? null
    if (wantedAyah != null && chapter) {
      const found = pages.find((p) => p.verses.some((v) => v.verse_key === `${chapter.id}:${wantedAyah}`))
      if (found) pageNumber = found.pageNumber
    }
    setCurrentPageNumber(pageNumber)
    setFlipDirection(null)
  }, [readingLayout, chapter, targetAyahId, pages, lastReadMap])

  const pagedIndex = useMemo(() => {
    if (currentPageNumber == null) return 0
    const idx = pageSpreads.findIndex(
      (s) => s.right.pageNumber === currentPageNumber || s.left?.pageNumber === currentPageNumber,
    )
    return idx >= 0 ? idx : 0
  }, [pageSpreads, currentPageNumber])

  // Guards against a second nav input landing mid-flip: besides being poor
  // feedback (two page-turns overlapping), a 3D-rotated element can
  // genuinely intercept pointer events over the nav buttons for the brief
  // window it's mid-transform, so without this a fast double-click can miss
  // entirely rather than queue.
  const isFlippingRef = useRef(false)
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // The CSS animation's own duration already collapses to ~0 under reduced
  // motion (sitewide override in globals.css) — mirrored here so this guard
  // doesn't impose an artificial 420ms input delay on top of an animation
  // that reduced-motion users can no longer actually see.
  const prefersReducedMotionRef = useRef(false)

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current)
    }
  }, [])

  const goToPage = useCallback(
    (delta: number, direction: "next" | "prev") => {
      if (isFlippingRef.current) return
      const targetIndex = Math.max(0, Math.min(pageSpreads.length - 1, pagedIndex + delta))
      if (targetIndex === pagedIndex) return
      const targetSpread = pageSpreads[targetIndex]
      if (!targetSpread) return

      setFlipDirection(direction)
      setCurrentPageNumber(targetSpread.right.pageNumber)
      isFlippingRef.current = true
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current)
      flipTimeoutRef.current = setTimeout(
        () => {
          isFlippingRef.current = false
        },
        prefersReducedMotionRef.current ? 0 : FLIP_ANIMATION_MS,
      )
    },
    [pageSpreads, pagedIndex],
  )
  const goNextPage = useCallback(() => goToPage(1, "next"), [goToPage])
  const goPrevPage = useCallback(() => goToPage(-1, "prev"), [goToPage])

  // Arrow-key page turning — only while Paged, and only when audio isn't
  // already claiming the arrow keys for ayah-by-ayah playback control (see
  // KeyboardSurahNav's own ArrowLeft/ArrowRight binding).
  useEffect(() => {
    if (readingLayout !== "paged") return

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (player && (player.status === "playing" || player.status === "paused")) return

      if (e.key === "ArrowRight") {
        e.preventDefault()
        goNextPage()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        goPrevPage()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [readingLayout, player, goNextPage, goPrevPage])

  useLayoutEffect(() => {
    if (readingLayout !== "paged") return
    onPagedPositionChange?.(pagedIndex === pageSpreads.length - 1)
  }, [readingLayout, pagedIndex, pageSpreads.length, onPagedPositionChange])

  const currentSpread = pageSpreads[pagedIndex] ?? null
  const previousSpread = pagedIndex > 0 ? pageSpreads[pagedIndex - 1] : null

  const activePage =
    readingLayout === "paged"
      ? currentSpread
        ? {
            pageNumber: currentSpread.right.pageNumber,
            juzNumber: currentSpread.right.juzNumber,
            hizbNumber: currentSpread.right.hizbNumber,
          }
        : null
      : scrollActivePage

  function jumpToPage(pageNumber: number) {
    const el = document.querySelector(`[data-page-number="${pageNumber}"]`)
    if (!el) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })
  }

  function handleWordClick(word: Word, verseKey?: string) {
    setSelectedAyah(null)
    setSelectedWord({ word, verseKey })
  }

  function handleAyahClick(verse: Verse) {
    setSelectedWord(null)
    setSelectedAyah(verse)

    if (splitView) {
      flashSplitClick(verse.verse_key)
      const el = translationColumnRef.current?.querySelector(
        `[data-verse-key="${CSS.escape(verse.verse_key)}"]`,
      )
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }

  // A split-view click is the most recent explicit user action, so it takes
  // over the same highlight-tint prop chain that an external jump/resume
  // target already uses — no separate highlight styling needed. Guarded to
  // this chapter so a boundary verse from a neighbouring surah (page-sharing
  // at a surah edge) can't light up a same-numbered ayah in the wrong surah.
  const splitClickAyahNumber =
    splitClickVerseKey && chapter && splitClickVerseKey.startsWith(`${chapter.id}:`)
      ? Number(splitClickVerseKey.split(":")[1])
      : null
  const effectiveTargetAyahId = splitClickAyahNumber ?? targetAyahId

  const mushafPagesJsx = pages.map((page, pIndex) => (
    <div key={page.pageNumber} ref={getPageRefCallback(page.pageNumber)} data-page-number={page.pageNumber}>
      <ReadingPage
        page={page}
        prevPage={pIndex > 0 ? pages[pIndex - 1] : null}
        chapter={chapter}
        chaptersById={chaptersById}
        targetAyahId={effectiveTargetAyahId}
        onWordClick={handleWordClick}
        onAyahClick={handleAyahClick}
      />
    </div>
  ))

  return (
    <SurahProgressProvider surahId={chapter?.id ?? 1}>
      <div ref={spreadRootRef} className="flex flex-col gap-10 w-full relative">
        {/* E-04: Floating Resume Marker Toast */}
        {showResumeToast && lastReadPosition && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 rounded-full bg-background/90 backdrop-blur-md border border-border/50 px-5 py-2.5 shadow-lg">
              <span className="text-sm font-medium text-foreground">
                Resumed from Ayah {lastReadPosition.verseKey.split(':')[1]}
              </span>
              <button 
                onClick={() => {
                  clearLastReadPosition()
                  setShowResumeToast(false)
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {readingLayout === "paged" ? (
          pageSpreads[pagedIndex] && (
            <PagedMushafDeck
              spread={pageSpreads[pagedIndex]}
              spreadIndex={pagedIndex}
              totalSpreads={pageSpreads.length}
              totalPages={TOTAL_QURAN_PAGES}
              chapter={chapter}
              chaptersById={chaptersById}
              targetAyahId={targetAyahId}
              onWordClick={handleWordClick}
              onAyahClick={handleAyahClick}
              flipDirection={flipDirection}
              onPrev={goPrevPage}
              onNext={goNextPage}
            />
          )
        ) : splitView ? (
          // E-09: left = Mushaf (its own @container so MushafPageFrame's cqw
          // sizing recalculates against this narrower column instead of the
          // full-width ancestor container declared in [surahId]/layout.tsx),
          // right = synced translation column.
          <div className="flex w-full gap-6">
            <div ref={mushafColumnRef} className="flex w-full flex-col gap-10 @container md:w-3/5">
              {mushafPagesJsx}
            </div>
            <SplitTranslationPanel
              innerRef={translationColumnRef}
              verses={verses}
              activeTranslationIds={activeTranslations}
              activeVerseKey={mushafActiveVerseKey}
              clickedVerseKey={splitClickVerseKey}
              onAyahClick={jumpFromTranslation}
            />
          </div>
        ) : (
          mushafPagesJsx
        )}

        {/* Docked Ayah Action Toolbar when Ayah marker is clicked */}
        <ReadingAyahToolbar
          verse={selectedAyah}
          onClose={() => setSelectedAyah(null)}
        />

        {activePage && (
          <PageProgressPill
            pageNumber={activePage.pageNumber}
            juzNumber={activePage.juzNumber}
            hizbNumber={activePage.hizbNumber}
          />
        )}

        {readingLayout === "scroll" && (
          <MushafMinimap
            pages={pages}
            activePageNumber={activePage?.pageNumber ?? null}
            onJump={jumpToPage}
          />
        )}
      </div>
    </SurahProgressProvider>
  )
}
