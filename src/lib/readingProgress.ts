/**
 * localStorage key for the "last read ayah per surah" map (surahId ->
 * ayahNumber), used by QuranReader (save + scroll-mode resume) and
 * ReadingModeView (paged-mode initial page resolution). Shared here so both
 * stay in sync on the exact key/shape without importing from each other.
 */
export const LAST_READ_STORAGE_KEY = "rq:last-read-ayah"

/** Stable default so useLocalStorage's returned setter identity doesn't
 * change every render (a fresh `{}` literal per call would do that). */
export const EMPTY_LAST_READ_MAP: Record<number, number> = {}
