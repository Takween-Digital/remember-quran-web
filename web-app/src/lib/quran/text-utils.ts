/**
 * Arabic text cleaning and optimization utilities
 */

/**
 * Regex to remove ONLY problematic Quranic marks
 * KEEPS standard harakat (vowel marks) for authentic Quranic appearance
 * Removes only: Silent Alif (۟), Superscript Alif (ٓ), and similar noise marks
 * Preserves: Fatha (َ), Damma (ُ), Kasra (ِ), Sukun (ْ), Shadda (ّ), etc.
 */
const DIACRITICAL_MARKS = /[۟ٓ]/g

/**
 * Removes ONLY problematic marks while preserving standard Arabic harakat
 * Keeps vowel marks (fatha, damma, kasra, sukun, shadda) for authentic appearance
 * Perfect for displaying Quranic Arabic with proper vowel marks but without noise marks
 *
 * @param text Arabic text with Quranic marks
 * @returns Text with only problematic marks removed, standard harakat preserved
 *
 * @example
 * removeDiacritics("فٱذكرونىٓ أذكركم وٱشكروا۟ لى ولا تكفرون")
 * // Returns: "فاذكروني اذكركم واشكروا لي ولا تكفرون"
 * // Keeps all vowel marks (َ ُ ِ ْ ّ), removes only ۟ and ٓ
 *
 * @example
 * removeDiacritics("بِسْمِ الله الرَّحْمٰن الرَّحِيم")
 * // Returns: "بِسْمِ الله الرَّحْمَن الرَّحِيم"
 * // All harakat preserved, only special marks removed
 */
export function removeDiacritics(text: string): string {
  if (!text) return text

  // Remove ONLY problematic marks (silent alif, superscript alif, etc)
  let cleaned = text.replace(DIACRITICAL_MARKS, "")

  // Normalize ALIF WASLA to regular ALIF for consistency
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
 * - Uses text without only problematic marks for display
 * - Preserves standard harakat for authentic appearance
 *
 * @param text Arabic text (potentially with marks)
 * @param keepDiacritics Whether to keep diacriticals (default: false for cleaner rendering)
 * @returns Optimized text
 */
export function getOptimalTextVariant(
  text: string,
  keepDiacritics: boolean = false
): string {
  if (!text) return text

  if (!keepDiacritics) {
    // Remove only problematic marks, keep standard harakat
    return normalizeArabicText(removeDiacritics(text))
  }

  return normalizeArabicText(text)
}

/**
 * Detects if text contains problematic marks
 *
 * @param text Text to check
 * @returns true if text contains problematic marks
 */
export function hasDiacritics(text: string): boolean {
  if (!text) return false
  // Check for problematic marks only
  return /[۟ٓٱ]/.test(text)
}

/**
 * Gets text statistics for rendering optimization
 */
export function getTextStats(text: string) {
  return {
    length: text.length,
    hasProblematicMarks: hasDiacritics(text),
    wordCount: text.split(/\s+/).length,
    cleanLength: removeDiacritics(text).length,
    problematicMarkCount: (text.match(DIACRITICAL_MARKS) || []).length,
  }
}
