import { useMemo } from "react"

interface MushafPage {
  pageNumber: number
  verses: Array<{ verse_number: number }>
  hasSurahStart: boolean
  juzNumber?: number
  hizbNumber?: number
}

interface PageLayoutConfig {
  fixedPageHeightPx: number
  headerHeightPx: number
  targetAyahsPerPage: number
  minFontSize: number
  maxFontSize: number
  lineHeightMultiplier: number
}

const DEFAULT_CONFIG: PageLayoutConfig = {
  fixedPageHeightPx: 700, // Fixed page height in pixels
  headerHeightPx: 60, // Space for surah title + bismillah
  targetAyahsPerPage: 15, // Target ayahs per page
  minFontSize: 14,
  maxFontSize: 40,
  lineHeightMultiplier: 1.6, // Line height ratio
}

/**
 * Calculates optimal font size and content distribution for balanced two-page spread.
 * Ensures both pages have equal dimensions and approximately equal content.
 */
export function useBalancedPageLayout(
  leftPage: MushafPage | null,
  rightPage: MushafPage,
  config: Partial<PageLayoutConfig> = {},
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  return useMemo(() => {
    const { fixedPageHeightPx, headerHeightPx, targetAyahsPerPage, minFontSize, maxFontSize, lineHeightMultiplier } = finalConfig

    // Count content for each page
    const leftAyahCount = leftPage?.verses.length ?? 0
    const rightAyahCount = rightPage.verses.length ?? 0
    const totalAyahs = leftAyahCount + rightAyahCount

    // Adjust available height if page has surah header
    const leftContentHeight = fixedPageHeightPx - (leftPage?.hasSurahStart ? headerHeightPx : 0)
    const rightContentHeight = fixedPageHeightPx - (rightPage.hasSurahStart ? headerHeightPx : 0)

    // Calculate font size to fit approximately 15 ayahs in the available height
    // Formula: fontSize = availableHeight / (targetAyahs × lineHeightMultiplier)
    const leftFontSize = leftPage
      ? Math.max(minFontSize, Math.min(maxFontSize, leftContentHeight / (targetAyahsPerPage * lineHeightMultiplier)))
      : maxFontSize

    const rightFontSize = Math.max(minFontSize, Math.min(maxFontSize, rightContentHeight / (targetAyahsPerPage * lineHeightMultiplier)))

    // Use the smaller font size on both pages for visual consistency
    const uniformFontSize = Math.min(leftFontSize, rightFontSize)

    // Calculate how many ayahs each page actually has (for redistribution if needed)
    const actualLeftAyahs = Math.ceil(leftContentHeight / (uniformFontSize * lineHeightMultiplier))
    const actualRightAyahs = Math.ceil(rightContentHeight / (uniformFontSize * lineHeightMultiplier))

    // Determine if pages are balanced (within 20% of each other)
    const isBalanced = leftAyahCount === 0 || (Math.abs(leftAyahCount - rightAyahCount) / Math.max(leftAyahCount, rightAyahCount)) < 0.2

    return {
      // Fixed dimensions for consistency
      pageHeightPx: fixedPageHeightPx,
      leftContentHeightPx: leftContentHeight,
      rightContentHeightPx: rightContentHeight,

      // Font sizing
      fontSize: uniformFontSize,
      leftFontSize,
      rightFontSize,

      // Content info
      leftAyahCount,
      rightAyahCount,
      totalAyahs,
      isBalanced,
      actualLeftAyahs,
      actualRightAyahs,

      // CSS variable values for use in components
      cssVars: {
        "--page-height": `${fixedPageHeightPx}px`,
        "--left-content-height": `${leftContentHeight}px`,
        "--right-content-height": `${rightContentHeight}px`,
        "--font-size": `${uniformFontSize}px`,
        "--line-height": lineHeightMultiplier,
      } as Record<string, string | number>,
    }
  }, [leftPage, rightPage, finalConfig])
}
