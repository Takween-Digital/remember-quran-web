"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getHistoryFactsFrom } from "@/lib/islamic-history"
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion"

const TICKER_INTERVAL_MS = 5000

export function IslamicHistoryCard() {
  // Computed inside the component (not at module scope) so it re-evaluates
  // per request/mount instead of being frozen for the lifetime of the server
  // process — a module-level call only runs once when the module first
  // loads, which drifts a day stale after the server's been up across a UTC
  // midnight, causing a hydration mismatch against the always-fresh client.
  const [FACTS] = useState(() => getHistoryFactsFrom())
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const fact = useMemo(() => FACTS[index % FACTS.length], [FACTS, index])
  const prefersReducedMotion = useSafeReducedMotion()

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % FACTS.length)
    }, TICKER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused])

  const handlePrev = () => {
    setIndex((i) => (i - 1 + FACTS.length) % FACTS.length)
  }

  const handleNext = () => {
    setIndex((i) => (i + 1) % FACTS.length)
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-[#0e6b57] p-6 text-white shadow-sm transition-shadow hover:shadow-md sm:p-8"
    >
      {/* Decorative pattern */}
      <div className="absolute -right-16 -top-16 opacity-10 blur-xl pointer-events-none">
        <div className="size-64 rounded-full bg-gold" />
      </div>

      <div className="relative z-10">
        <p className="eyebrow text-gold-leaf tracking-widest uppercase opacity-90">
          On this day in Islamic history
        </p>

        <div className="relative mt-4 min-h-[5rem] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={fact.title}
              initial={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 16 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: prefersReducedMotion ? 0.15 : 0.35 }}
            >
              <p className="text-lg font-medium leading-tight text-white">{fact.title}</p>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">{fact.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer controls: indicator dots + navigation arrows */}
      <div className="relative z-10 mt-6 flex items-center justify-between">
        {/* Indicator dots */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Islamic history facts">
          {FACTS.map((_, i) => {
            const isActive = i === index % FACTS.length
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to fact ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                className={`h-1.5 rounded-full transition duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                  isActive ? "w-5 bg-gold" : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            )
          })}
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous fact"
            className="flex size-7 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-xs transition duration-200 hover:bg-white/20 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <ChevronLeft className="size-4" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next fact"
            className="flex size-7 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-xs transition duration-200 hover:bg-white/20 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <ChevronRight className="size-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  )
}
