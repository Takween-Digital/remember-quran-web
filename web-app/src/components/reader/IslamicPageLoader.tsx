"use client"

import { cn } from "@/lib/utils"

interface IslamicPageLoaderProps {
  pageNumber?: number
  showLabel?: boolean
  className?: string
}

/**
 * Traditional Islamic geometric loading animation for Mushaf pages.
 * Features rotating Muqarnas-inspired geometric patterns with elegant styling.
 */
export function IslamicPageLoader({
  pageNumber,
  showLabel = true,
  className,
}: IslamicPageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full h-full",
        "animate-in fade-in duration-300",
        className,
      )}
    >
      {/* Geometric Islamic Pattern Loader */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6">
        {/* Outer rotating ring */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{ animationDuration: "3s" }}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Muqarnas-inspired geometric pattern */}
          <defs>
            <linearGradient id="gradientRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "var(--color-emerald-500)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "var(--color-gold-500)", stopOpacity: 0.6 }} />
            </linearGradient>
          </defs>

          {/* Outer octagon (8-pointed star foundation) */}
          <circle cx="50" cy="50" r="45" stroke="url(#gradientRing)" strokeWidth="2" opacity="0.8" />

          {/* Inner geometric patterns */}
          <g opacity="0.6">
            <polygon
              points="50,15 70,25 75,50 70,75 50,85 30,75 25,50 30,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-emerald-500 dark:text-emerald-400"
            />
          </g>

          {/* Decorative dots at cardinal points */}
          <circle cx="50" cy="10" r="3" fill="currentColor" className="text-gold-500" opacity="0.8" />
          <circle cx="90" cy="50" r="3" fill="currentColor" className="text-gold-500" opacity="0.8" />
          <circle cx="50" cy="90" r="3" fill="currentColor" className="text-gold-500" opacity="0.8" />
          <circle cx="10" cy="50" r="3" fill="currentColor" className="text-gold-500" opacity="0.8" />
        </svg>

        {/* Inner counter-rotating pattern */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{
            animationDuration: "4s",
            animationDirection: "reverse",
          }}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Inner geometric elements */}
          <g opacity="0.5">
            <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
            <polygon
              points="50,35 60,42 60,58 50,65 40,58 40,42"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-gold-400"
            />
          </g>

          {/* Center point */}
          <circle cx="50" cy="50" r="4" fill="currentColor" className="text-emerald-600 dark:text-emerald-400" />
        </svg>

        {/* Pulsing center indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-gold-500 animate-pulse"
            style={{ animationDuration: "2s" }}
          />
        </div>
      </div>

      {/* Loading text with Islamic theme */}
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold text-foreground">
          {showLabel ? "Loading Page" : ""}
          {pageNumber && showLabel ? ` ${pageNumber}` : ""}
        </p>
        <p className="text-xs text-muted-foreground animate-pulse">
          جاري التحميل...
        </p>
      </div>

      {/* Decorative divider line */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-500/50" />
        <div className="text-xs text-muted-foreground/60">✦</div>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-500/50" />
      </div>
    </div>
  )
}

/**
 * Compact version for inline loading indicators
 */
export function IslamicLoaderCompact({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <svg
        className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400"
        style={{ animationDuration: "2.5s" }}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <path
          d="M 50 10 A 40 40 0 0 1 75 20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  )
}
