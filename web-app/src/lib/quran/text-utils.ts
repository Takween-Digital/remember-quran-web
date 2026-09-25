/**
 * Arabic text cleaning and optimization utilities
 */

/**
 * Comprehensive regex to remove ALL Arabic diacritical marks and special notation marks
 * Includes:
 * - Standard harakat (vowel marks): U+064B-U+065F
 * - Quranic special marks: Silent Alif (U+06DF), Maddah variants (U+0653-0+0655)
 * - Presentation forms and other combining marks
 */
const DIACRITICAL_MARKS = /[ً-ٰٟۖ-۪ۜ۟ۤۧۨ۫]/g

/**
 * Removes all diacritical marks (harakat) and Quranic special marks from Arabic text
 * Includes standard diacritics, Quranic notation marks, and combining characters
 * Useful for cleaner rendering when diacritics are not needed
 *
 * @param text Arabic text with diacriticals
 * @returns Text without diacriticals or special marks
 *
 * @example
 * removeDiacritics("بِسْمِ الله الرَّحْمٰن الرَّحِيم")
 * // Returns: "بسم الله الرحمن الرحيم"
 *
 * @example
 * removeDiacritics("فٱذكرونىٓ أذكركم وٱشكروا۟ لى ولا تكفرون")
 * // Returns: "فاذكروني اذكركم واشكروا لي ولا تكفرون"
 */
export function removeDiacritics(text: string): string {
  if (!text) return text

  // Remove all diacritical marks and special notation marks
  let cleaned = text.replace(DIACRITICAL_MARKS, "")

  // Also normalize ALIF WASLA to regular ALIF for consistency
  cleaned = cleaned.replace(/ٱ/g, "ا") // ٱ → ا

  return cleaned
}

/**
 * Normalizes Arabic text for optimal rendering
 * - Removes extra whitespace
 * - Normalizes Unicode form
 * - Removes control characters
 *
 * @param text Raw Arabic text
 * @returns Normalized text
 */
export function normalizeArabicText(text: string): string {
  if (!text) return text

  // Normalize Unicode to NFC form (composed characters)
  let normalized = text.normalize("NFC")

  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, " ")

  // Remove zero-width characters (except the silent alif mark)
  normalized = normalized.replace(/[​-‌]/g, "")

  return normalized.trim()
}

/**
 * Gets optimal text variant for rendering
 * - Uses text without diacritics for cleaner display
 * - Falls back to original if no diacritics found
 *
 * @param text Arabic text (potentially with diacritics)
 * @param keepDiacritics Whether to keep diacriticals (default: false for cleaner rendering)
 * @returns Optimized text
 */
export function getOptimalTextVariant(
  text: string,
  keepDiacritics: boolean = false
): string {
  if (!text) return text

  if (!keepDiacritics) {
    return normalizeArabicText(removeDiacritics(text))
  }

  return normalizeArabicText(text)
}

/**
 * Detects if text contains diacritical marks or special Quranic notation
 *
 * @param text Text to check
 * @returns true if text contains diacritics or special marks
 */
export function hasDiacritics(text: string): boolean {
  if (!text) return false
  // Test for both diacriticals and special marks
  return /[ً-ٰٟۖ-۪ۜ۟ۤۧۨ۫ٱ]/.test(text)
}

/**
 * Gets text statistics for rendering optimization
 */
export function getTextStats(text: string) {
  return {
    length: text.length,
    hasDiacritics: hasDiacritics(text),
    wordCount: text.split(/\s+/).length,
    cleanLength: removeDiacritics(text).length,
    diacriticsCount: (text.match(DIACRITICAL_MARKS) || []).length,
  }
}
