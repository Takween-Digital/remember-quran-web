import { useEffect, useState } from "react"
import { loadQcfPageFont, qcfFontFamily } from "@/lib/qcfFonts"

export interface QcfPageFontState {
  /** The font-family name once ready, `null` while loading or on failure —
   * in both of the latter cases callers should keep rendering the Unicode
   * fallback rather than block on the network. */
  fontFamily: string | null
  /** True only while a fetch for this exact page is genuinely in flight
   * (i.e. `enabled` and not yet settled) — distinct from `fontFamily` being
   * null because the load already failed, so callers can show a loading
   * skeleton just for the former. */
  isLoading: boolean
}

/**
 * Loads the QCF v2 glyph font for one Mushaf page.
 *
 * Pass `enabled: false` to defer the fetch (e.g. until the page is near the
 * viewport) — a surah can span dozens of Mushaf pages, and font-loading all
 * of them on mount defeats the point of a per-page font scheme.
 */
export function useQcfPageFont(pageNumber: number, enabled = true): QcfPageFontState {
  // Keyed by the page it resolved for — if `pageNumber` changes before this
  // fires, the stale result is simply ignored below rather than requiring a
  // synchronous reset inside the effect.
  const [resolved, setResolved] = useState<{ pageNumber: number; ok: boolean } | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    loadQcfPageFont(pageNumber).then((ok) => {
      if (!cancelled) setResolved({ pageNumber, ok })
    })
    return () => {
      cancelled = true
    }
  }, [pageNumber, enabled])

  const settledForThisPage = resolved?.pageNumber === pageNumber ? resolved : null
  const ready = !!settledForThisPage?.ok

  return {
    fontFamily: ready ? qcfFontFamily(pageNumber) : null,
    isLoading: enabled && !settledForThisPage,
  }
}
