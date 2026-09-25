import { useCallback, useEffect, useState } from "react"
import type { QuranFont } from "@/lib/readerFonts"

interface FontMetrics {
  name: QuranFont
  isLoading: boolean
  isLoaded: boolean
  error: Error | null
  loadTime: number | null
}

const fontMetrics = new Map<QuranFont, FontMetrics>()

/**
 * Tracks font loading state and provides visual feedback when fonts are applied.
 * Monitors CSS font-family changes and reports when fonts are ready for use.
 */
export function useFontLoading(fontName: QuranFont) {
  const [metrics, setMetrics] = useState<FontMetrics>(() => ({
    name: fontName,
    isLoading: false,
    isLoaded: false,
    error: null,
    loadTime: null,
  }))

  const updateMetrics = useCallback((updates: Partial<FontMetrics>) => {
    setMetrics((prev) => ({ ...prev, ...updates }))
  }, [])

  useEffect(() => {
    if (!fontName) return

    updateMetrics({ isLoading: true, error: null })
    const startTime = performance.now()

    // Check if font is already loaded via document.fonts
    const checkFontReady = async () => {
      try {
        const fontFace = [...document.fonts].find((font) =>
          font.family.includes(fontName),
        )

        if (fontFace?.status === "loaded") {
          const loadTime = performance.now() - startTime
          updateMetrics({
            isLoading: false,
            isLoaded: true,
            loadTime,
          })
          return
        }

        // Wait for font with timeout
        const timeout = new Promise<void>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(`Font load timeout (${fontName})`),
              ),
            2000,
          ),
        )

        await Promise.race([
          document.fonts.ready,
          timeout,
        ])

        const loadTime = performance.now() - startTime
        updateMetrics({
          isLoading: false,
          isLoaded: true,
          loadTime,
        })
      } catch (err) {
        updateMetrics({
          isLoading: false,
          isLoaded: false,
          error: err instanceof Error ? err : new Error(String(err)),
        })
      }
    }

    // Small delay to ensure font has been registered
    const timer = setTimeout(checkFontReady, 100)

    return () => clearTimeout(timer)
  }, [fontName, updateMetrics])

  return metrics
}

/**
 * Preload commonly used fonts to avoid loading delays.
 */
export function useFontPreload(fonts: QuranFont[]) {
  useEffect(() => {
    fonts.forEach((font) => {
      // Create a dummy element to trigger font loading
      const el = document.createElement("span")
      el.style.fontFamily = font
      el.style.position = "absolute"
      el.style.visibility = "hidden"
      el.textContent = "بسم"
      document.body.appendChild(el)

      // Clean up after a frame
      requestAnimationFrame(() => {
        el.remove()
      })
    })
  }, [fonts])
}
