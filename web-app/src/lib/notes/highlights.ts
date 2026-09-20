/**
 * E-12 verse highlighting. Client-safe (bundled into reader components) —
 * mirrors text.ts's role for the note-text side of the same feature.
 */
export const HIGHLIGHT_COLORS = ["yellow", "green", "blue", "pink"] as const

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number]

/** Tailwind class per colour — kept as literal strings (not built from the
 * variable) so Tailwind's scanner can find them at build time. */
export const HIGHLIGHT_BG_CLASS: Record<HighlightColor, string> = {
  yellow: "bg-yellow-300/25",
  green: "bg-emerald-300/25",
  blue: "bg-sky-300/25",
  pink: "bg-pink-300/25",
}

/** Solid swatch colour for the picker UI (not the translucent reading-mode tint). */
export const HIGHLIGHT_SWATCH_CLASS: Record<HighlightColor, string> = {
  yellow: "bg-yellow-400",
  green: "bg-emerald-400",
  blue: "bg-sky-400",
  pink: "bg-pink-400",
}

export function isHighlightColor(value: unknown): value is HighlightColor {
  return typeof value === "string" && (HIGHLIGHT_COLORS as readonly string[]).includes(value)
}

/** Validate a PATCH body's highlightColor — a literal null clears the highlight. */
export function normalizeHighlightColor(
  input: unknown,
): { ok: true; color: HighlightColor | null } | { ok: false; error: string } {
  if (input === null) return { ok: true, color: null }
  if (isHighlightColor(input)) return { ok: true, color: input }
  return { ok: false, error: "Invalid highlight colour." }
}
