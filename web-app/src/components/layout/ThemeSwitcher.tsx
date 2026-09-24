"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useHasMounted } from "@/hooks/useHasMounted"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useHasMounted()

  if (!mounted) {
    return <div className="size-9" aria-hidden />
  }

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative flex size-9 items-center justify-center rounded-full text-muted-foreground",
        "transition-colors duration-200 hover:bg-accent hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <Sun
        className={cn(
          "size-4 sm:size-5 transition duration-300",
          isDark
            ? "scale-0 rotate-90 opacity-0 absolute"
            : "scale-100 rotate-0 opacity-100",
        )}
        strokeWidth={1.75}
      />
      <Moon
        className={cn(
          "size-4 sm:size-5 transition duration-300",
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 -rotate-90 opacity-0 absolute",
        )}
        strokeWidth={1.75}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
