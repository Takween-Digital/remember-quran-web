"use client"

import { useLayoutEffect, useRef, useState, type ReactNode, type ComponentPropsWithoutRef } from "react"

interface QcfLineProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  /** Hint that this is a genuinely short trailing line (e.g. the page's
   * very last printed line) — always centered at the page's shared scale
   * rather than stretched. Only a hint: a page bundling several short
   * surahs can have more than one such line (every surah's closing line),
   * which the caller doesn't always know ahead of render, so the
   * measurement below detects those too even when this stays `true`. */
  justify?: boolean
  /** The page's shared fit ratio, as last reported by a full line via
   * `onScaleMeasured`. `null` until the first full line on the page has
   * measured. */
  pageScale?: number | null
  /** Reports this line's fitted ratio once measured — but only when this
   * line was treated as a full line, since a short line's own natural-width
   * ratio isn't representative of the page. */
  onScaleMeasured?: (ratio: number) => void
}

/**
 * Wraps one printed Mushaf line rendered in QCF glyphs. QCF fonts pre-shape
 * every word's advance width for one canonical page width, so the rendered
 * line only comes out flush-both-edges if it happens to render at exactly
 * that width — any other container width leaves a gap or overflows.
 *
 * Fits by adjusting `font-size`, not a `transform: scaleX`. A transform
 * stretches horizontally only, distorting the font's own pre-shaped
 * kashida/letter-spacing — visually, words start crowding into each other
 * once the ratio drifts far from 1. Scaling `font-size` instead resizes the
 * whole glyph proportionally (exactly like reading the same page printed
 * bigger or smaller), so every letterform's real proportions are preserved
 * at any container width.
 *
 * A line's own fit ratio (available / natural-at-100%) is only meaningful
 * when it has close to a full line's worth of words — every full line on a
 * page ends up computing nearly the same ratio, since they share one
 * container width and were typeset for one canonical page width. A line
 * with far fewer words (a surah's closing line — and a page bundling
 * several short surahs can have more than one) would need a much LARGER
 * ratio to stretch to that same width, inflating its glyphs — and, most
 * visibly, its ayah-end medallion — well past every other line's size. Such
 * lines are detected by comparing their own ratio against the page's
 * established one, and reuse that shared ratio (centered) instead.
 */
export function QcfLine({
  children,
  className,
  justify = true,
  pageScale = null,
  onScaleMeasured,
  ...rest
}: QcfLineProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [fontScale, setFontScale] = useState(1)
  const [isShort, setIsShort] = useState(!justify)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const measure = () => {
      // Reset to the unscaled baseline before measuring — unlike a
      // transform, font-size changes the box's own layout width, so last
      // render's ratio would otherwise compound into this one.
      inner.style.fontSize = "100%"
      const natural = inner.scrollWidth
      const available = outer.clientWidth
      if (natural <= 0 || available <= 0) return

      const ownRatio = available / natural
      // >15% above the page's established ratio is too big a gap to be
      // ordinary per-line variation (full lines typically land within a few
      // percent of each other) — this line has meaningfully fewer words
      // than a full one.
      const short = !justify || (pageScale != null && ownRatio > pageScale * 1.15)
      const ratio = short && pageScale != null ? pageScale : ownRatio

      inner.style.fontSize = `${ratio * 100}%`
      setFontScale((prev) => (Math.abs(prev - ratio) < 0.001 ? prev : ratio))
      setIsShort(short)
      if (!short) onScaleMeasured?.(ownRatio)
    }

    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(outer)
    // The glyph font can finish loading/swapping after first paint —
    // re-measure once it settles so the fallback-font measurement doesn't stick.
    document.fonts?.ready?.then(measure)

    // Re-measure on real DOM content changes rather than depending on
    // `children` by identity — the caller re-creates that array (and its
    // elements) on every render even when the line's actual words haven't
    // changed, which would otherwise tear down/rebuild this effect (and
    // call setFontScale) on every single parent re-render, not just ones
    // where the printed line genuinely changed.
    const mo = new MutationObserver(measure)
    mo.observe(inner, { childList: true, subtree: true, characterData: true })

    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [justify, pageScale, onScaleMeasured])

  return (
    <div
      ref={outerRef}
      className={className}
      style={isShort ? { textAlign: "center" } : undefined}
      {...rest}
    >
      <div
        ref={innerRef}
        dir="rtl"
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          fontSize: `${fontScale * 100}%`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
