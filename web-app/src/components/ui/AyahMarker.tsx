import { cn } from "@/lib/utils"

interface AyahMarkerProps {
  number: number
  className?: string
}

/**
 * Bulletproof inline SVG component for the Ayah end marker (۝).
 * Renders the ornate frame via SVG and perfectly centers the verse number inside it.
 */
export function AyahMarker({ number, className }: AyahMarkerProps) {
  // Convert Western numerals to Eastern Arabic numerals if needed.
  // Using Intl.NumberFormat for precise conversion.
  const easternNumeral = new Intl.NumberFormat("ar-EG").format(number)

  return (
    <span className={cn("relative inline-flex items-center justify-center align-middle mx-1", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="w-[1.8em] h-[1.8em] fill-current text-foreground transition-colors duration-300"
      >
        {/* 
          TODO (Phase 1): Paste the highly-optimized SVGO path for the ornate Ayah marker here.
          Example placeholder circle provided below.
        */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
      </svg>
      
      {/* 
        The verse number perfectly centered inside the SVG. 
        Using absolute positioning to overlay it on the SVG frame.
      */}
      <span className="absolute inset-0 flex items-center justify-center font-arabic text-[0.7em] font-semibold text-foreground/90 leading-none pt-[0.1em]">
        {easternNumeral}
      </span>
      
      {/* Screen reader only text for accessibility */}
      <span className="sr-only">Ayah {number}</span>
    </span>
  )
}
