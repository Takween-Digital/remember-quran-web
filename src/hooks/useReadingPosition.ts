import { useEffect, useState, useRef } from "react"
import { useLocalStorage } from "./useLocalStorage"

const READING_POSITION_KEY = "rq_reading_position"

interface ReadingPosition {
  surahId: number
  verseKey: string
  timestamp: number
}

export function useReadingPosition(surahId?: number) {
  const [positions, setPositions] = useLocalStorage<Record<number, ReadingPosition>>(
    READING_POSITION_KEY,
    {}
  )
  const [lastReadPosition, setLastReadPosition] = useState<ReadingPosition | null>(null)
  
  // On mount, load the last read position for this surah
  useEffect(() => {
    if (!surahId) return
    const pos = positions[surahId]
    if (pos) {
      setLastReadPosition(pos)
    }
  }, [surahId, positions])

  const observerRef = useRef<IntersectionObserver | null>(null)
  
  // Track scroll position of ayahs in the DOM
  useEffect(() => {
    if (!surahId) return

    // Debounce the save to prevent excessive localStorage writes
    let timeout: NodeJS.Timeout
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const visibleEntries = entries.filter(e => e.isIntersecting)
      if (visibleEntries.length === 0) return

      // Sort by vertical position to find the topmost visible ayah
      visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      const topEntry = visibleEntries[0]
      const verseKey = (topEntry.target as HTMLElement).dataset.firstVerseKey

      if (verseKey) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          setPositions(prev => ({
            ...prev,
            [surahId]: {
              surahId,
              verseKey,
              timestamp: Date.now()
            }
          }))
        }, 1000)
      }
    }

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-20% 0px -60% 0px", // Focus on the upper middle of the screen
      threshold: 0.1
    })

    const ayahElements = document.querySelectorAll('[data-first-verse-key]')
    ayahElements.forEach(el => observerRef.current?.observe(el))

    return () => {
      clearTimeout(timeout)
      observerRef.current?.disconnect()
    }
  }, [surahId, setPositions])

  // Call this whenever new ayahs are loaded (e.g. infinite scroll or paged turns)
  const reobserve = () => {
    if (!observerRef.current) return
    observerRef.current.disconnect()
    const ayahElements = document.querySelectorAll('[data-first-verse-key]')
    ayahElements.forEach(el => observerRef.current?.observe(el))
  }

  const clearLastReadPosition = () => {
    if (!surahId) return
    setPositions(prev => {
      const newPos = { ...prev }
      delete newPos[surahId]
      return newPos
    })
    setLastReadPosition(null)
  }

  return { lastReadPosition, clearLastReadPosition, reobserve }
}
