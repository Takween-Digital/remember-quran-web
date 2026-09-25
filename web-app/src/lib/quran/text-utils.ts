/**
 * Arabic text cleaning and optimization utilities
 */

/**
 * Diacritical marks (harakat) in Arabic
 */
const DIACRITICAL_MARKS = /[ً-ْٰـ]/g

/**
 * Removes all diacritical marks (harakat) from Arabic text
 * Useful for cleaner rendering when diacritics are not needed
 *
 * @param text Arabic text with diacriticals
 * @returns Text without diacriticals
 *
 * @example
 * removeDiacritics("بِسْمِ الله الرَّحْمٰن الرَّحِيم")
 * // Returns: "بسم الله الرحمن الرحيم"
 */
export function removeDiacritics(text: string): string {
  if (!text) return text
  return text.replace(DIACRITICAL_MARKS, "")
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
 * Detects if text contains diacritical marks
 *
 * @param text Text to check
 * @returns true if text contains diacritics
 */
export function hasDiacritics(text: string): boolean {
  return DIACRITICAL_MARKS.test(text)
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
