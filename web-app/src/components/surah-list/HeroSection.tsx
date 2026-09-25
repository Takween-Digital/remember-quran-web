"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "@/lib/auth/react-compat"
import { ArrowRight, BookOpenText, Radio, Search } from "lucide-react"
import { useChapterMeta } from "@/context/ChaptersContext"
import { useUI } from "@/context/UIContext"
import { cn } from "@/lib/utils"
import type { LastPositionDto } from "@/components/account/ContinuePrompt"
import { motion, useScroll, useTransform } from "framer-motion"

export function HeroSection() {
  const { data: session, status } = useSession()
  const [position, setPosition] = useState<LastPositionDto | null>(null)
  const [loaded, setLoaded] = useState(false)
  const chapter = useChapterMeta(position?.surahId)
  const { setCommandOpen } = useUI()
  
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      queueMicrotask(() => {
        setPosition(null)
        setLoaded(true)
      })
      return
    }

    let cancelled = false
    import("@/lib/firebase/progress").then(({ getLastPosition }) => {
      getLastPosition(session.user.id).then((pos) => {
        if (!cancelled) {
          setPosition(pos)
          setLoaded(true)
        }
      }).catch(() => {
        if (!cancelled) setLoaded(true)
      })
    })

    return () => {
      cancelled = true
    }
  }, [session?.user, status])

  const resumeLabel =
    position?.surahName || chapter?.name_simple || "your last surah"

  const titleText = loaded && position 
    ? `Continue ${resumeLabel} Ayah ${position.ayahId}` 
    : "Begin your reading journey"

  // Framer Motion variants for staggered text entrance
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }
  const wordVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  }

  return (
    <section className="relative isolate flex min-h-[500px] w-full flex-col items-center justify-center overflow-hidden border-b border-border bg-background px-6 py-20 text-center sm:px-12 sm:py-24">
      {/* Background Video with Parallax & Radial Mask */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-background"
      >
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 h-full w-full">
          <video
            src="/rememberquran_herosection_video.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{ maskImage: "radial-gradient(circle at center, black 0%, transparent 80%)", WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 80%)" }}
            className="absolute inset-0 h-[120%] w-[120%] -left-[10%] -top-[10%] object-cover opacity-30 mix-blend-luminosity dark:opacity-20"
          />
        </motion.div>
        {/* Subtle gradient overlay to ensure text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/90" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="eyebrow text-primary tracking-widest uppercase"
        >
          {loaded && position ? "Resume reading" : "Start reading"}
        </motion.p>

        {/* Cinematic Staggered Title */}
        <motion.h1 
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="mt-4 font-serif text-4xl font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl flex flex-wrap justify-center gap-x-3"
        >
          {titleText.split(" ").map((word, i) => (
            <div key={i} className="overflow-hidden">
              <motion.span variants={wordVars} className="inline-block">
                {word}
              </motion.span>
            </div>
          ))}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mx-auto mt-4 max-w-xl text-lg font-light text-muted-foreground sm:mt-6"
        >
          {loaded && position
            ? `Pick up right where you left off, ${position.verseKey}.`
            : "Start with Al-Fatihah, the opening surah of the Quran."}
        </motion.p>

        {/* Premium Search Bar Glitch Fix */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
          className="mx-auto mt-8 max-w-md sm:mt-10"
        >
          <button
            onClick={() => setCommandOpen(true)}
            className="group flex w-full items-center gap-3 rounded-full border border-border/50 bg-background/50 px-6 py-4 text-start shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:bg-background/80 hover:shadow-md focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/20"
            aria-label="Search the Quran"
          >
            <Search className="size-5 shrink-0 text-muted-foreground transition-colors group-focus:text-primary" strokeWidth={1.5} />
            <span className="flex-1 text-base text-muted-foreground transition-colors group-focus:text-foreground">Search the Quran...</span>
            <kbd className="hidden rounded bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border sm:inline-block">
              ⌘K
            </kbd>
          </button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href={
              loaded && position
                ? `/${position.surahId}/${position.ayahId}`
                : "/1/1"
            }
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary bg-primary px-8 text-base font-medium text-primary-foreground shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] sm:w-auto",
              "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <BookOpenText className="size-4" strokeWidth={2} aria-hidden />
            {loaded && position ? "Continue reading" : "Start reading"}
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
          </Link>

          <Link
            href="/radio"
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border/50 bg-background/50 px-8 text-base font-medium text-foreground shadow-sm backdrop-blur-xl sm:w-auto",
              "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/50 hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <Radio className="size-4 text-primary" strokeWidth={2} aria-hidden />
            Quran radio
          </Link>
        </motion.div>
        
        <p className="mt-8 text-xs font-medium tracking-wide text-muted-foreground/40 uppercase">
          Free forever &middot; no ads &middot; no tracking
        </p>
      </div>
    </section>
  )
}
