"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenText, Headphones, ImagePlus, LayoutGrid } from "lucide-react"
import { ArabesquePattern } from "@/components/layout/ArabesquePattern"
import { authClient } from "@/lib/auth/client"
import { AuthNav } from "@/components/auth/AuthNav"
import { LogoWordmark } from "@/components/layout/Logo"
import { NavbarResumeButton } from "@/components/layout/NavbarResumeButton"
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher"
import { useUI } from "@/context/UIContext"
import { cn } from "@/lib/utils"

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

const TABS = [
  {
    href: "/",
    label: "Quran",
    icon: BookOpenText,
    match: (p: string) => p === "/" || /^\/\d+/.test(p),
  },
  {
    href: "/radio",
    label: "Listen",
    icon: Headphones,
    match: (p: string) => p === "/radio",
  },
  {
    href: "/media-maker",
    label: "Create",
    icon: ImagePlus,
    match: (p: string) => p === "/media-maker",
  },
]

/** RQ-23: a signed-in user's only route to their account was three clicks
 * deep (profile menu → Account overview) — surface it as a normal top-level
 * tab, same as Quran/Listen/Create, once they're actually signed in. */
function useDashboardTab() {
  const { data: session } = authClient.useSession()
  if (!session?.user) return []
  return [
    {
      href: "/account",
      label: "Dashboard",
      icon: LayoutGrid,
      match: (p: string) => p.startsWith("/account"),
    },
  ]
}

function NavTabs({ pathname }: { pathname: string }) {
  const dashboardTab = useDashboardTab()
  const tabs = [...TABS, ...dashboardTab]
  return (
    <nav className="hidden md:flex h-full items-center gap-1 sm:gap-2">
      {tabs.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname)
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-full items-center gap-1.5 px-3 text-[13px] sm:text-sm font-medium",
              "transition-colors duration-(--dur-base) ease-(--ease-out)",
              active
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground",
              FOCUS,
            )}
          >
            <Icon className="size-4 sm:size-5" strokeWidth={1.75} />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function NavActions() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <NavbarResumeButton />
      <ThemeSwitcher />
      <AuthNav />
    </div>
  )
}

function LogoLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="RememberQuran — home"
      className={cn("rounded-sm shrink-0", FOCUS, className)}
    >
      <span className="inline-flex transition-opacity duration-(--dur-base) hover:opacity-80">
        <LogoWordmark size="sm" className="sm:hidden" />
        <LogoWordmark size="md" className="hidden sm:inline-flex" />
      </span>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { sidebarOpen, focusMode } = useUI()
  const [scrolled, setScrolled] = useState(false)
  const frame = useRef(0)
  const isSurahRoute = /^\/\d+/.test(pathname)
  // The reader uses the sidebar open state
  const sidebarEffectivelyOpen = sidebarOpen

  useEffect(() => {
    const measure = () => {
      frame.current = 0
      setScrolled(window.scrollY > 4)
    }

    const onScroll = () => {
      if (frame.current) return
      frame.current = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      if (frame.current) window.cancelAnimationFrame(frame.current)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  // Focus mode (toggled from ReaderControls) only makes sense on the reader
  // itself — gating on isSurahRoute too means a stale `focusMode=true` left
  // over from a previous reader visit can never hide the navbar anywhere
  // else.
  //
  // Slides out via `top` instead of unmounting: ReaderControls (the toolbar
  // right below) animates its own `top` between `top-14` and `top-0` over
  // the same 200ms/ease-out, so this bar's bottom edge and that bar's top
  // edge move in lockstep with zero gap or overlap. Unmounting instead (the
  // old behavior) made this bar vanish instantly while ReaderControls kept
  // animating for 200ms, so their icons briefly collided mid-scroll.
  const hideForFocus = focusMode && isSurahRoute

  // The reader route's bar stays flush and full-width — its logo column
  // lines up with the reader sidebar below it (see the comment further
  // down), and insetting it into a floating pill would break that corner
  // alignment. It still gets the same scroll-based shrink + blur, since
  // `scale` is a transform and doesn't touch layout.
  const floating = !isSurahRoute

  return (
    <header
      className={cn(
        "sticky z-40 w-full",
        hideForFocus ? "-top-14 pointer-events-none" : "top-0",
        floating && "px-3 pt-3 sm:px-4",
        "transition-[top] duration-200 ease-out",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden backdrop-blur-xl",
          "transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ease-out",
          scrolled ? "backdrop-blur-2xl bg-background/90" : "bg-background/60",
          floating
            ? cn(
                "mx-auto max-w-6xl rounded-2xl border",
                scrolled
                  ? "border-border shadow-lg"
                  : "border-border/40 shadow-sm",
              )
            : cn(
                "border-b",
                scrolled
                  ? "border-border shadow-[0_1px_0_0_color-mix(in_srgb,var(--brand-gold)_28%,transparent)]"
                  : "border-border/40",
              ),
        )}
      >
        {floating && (
          <ArabesquePattern
            id="navbar"
            className="hidden sm:block text-gold-leaf/[0.05] [animation-duration:120s]"
          />
        )}
        {isSurahRoute ? (
          /* Reader: logo sits in w-72 above the sidebar — no border-r so the
             sidebar divider starts below the navbar (clean corner, no line
             cutting through the header). */
          <div className="flex h-14 w-full items-center">
            <div
              className={cn(
                "flex h-full shrink-0 items-center px-3",
                "transition-[width] duration-200 ease-out",
                "w-auto",
                sidebarEffectivelyOpen && "md:w-64 lg:md:w-72",
              )}
            >
              <LogoLink />
            </div>
            <div className="flex min-w-0 flex-1 h-full items-center justify-between px-3 sm:px-4">
              <NavTabs pathname={pathname} />
              <NavActions />
            </div>
          </div>
        ) : (
          <div className="site-shell flex h-14 items-center justify-between px-3 sm:px-4">
            <div className="flex items-center h-full gap-4 sm:gap-8">
              <LogoLink />
              <NavTabs pathname={pathname} />
            </div>
            <NavActions />
          </div>
        )}
      </div>
    </header>
  )
}
