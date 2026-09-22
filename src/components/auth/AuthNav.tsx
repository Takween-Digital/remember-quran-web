"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { auth } from "@/lib/firebase/client"
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Settings2,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { navigateAfterAuth } from "@/lib/auth/navigate-after-auth"
import { cn } from "@/lib/utils"

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

const navLink =
  "flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] sm:text-sm font-medium text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground"

export function AuthNav() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <div
        aria-hidden
        className="mx-1 h-9 w-16 animate-pulse rounded-md bg-muted/50"
      />
    )
  }

  if (!user) {
    return (
      <Link href="/login?next=/account" className={cn(navLink, FOCUS)}>
        <UserRound className="size-4 sm:size-5" strokeWidth={1.75} />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    )
  }

  const label =
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "Account"

  async function handleSignOut() {
    await auth.signOut()
    await fetch("/api/auth/session", { method: "DELETE" })
    await navigateAfterAuth(router, "/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={cn(
              "h-9 gap-1.5 px-2.5 text-xs text-muted-foreground",
              pathname.startsWith("/account") && "text-primary",
            )}
          />
        }
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound />
        </span>
        <span className="hidden max-w-28 truncate md:inline">{label}</span>
        <ChevronDown className="hidden md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
            <span className="truncate text-sm text-foreground">{label}</span>
            <span className="truncate font-normal">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push("/account")}>
            <LayoutGrid />
            Account overview
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/account/settings")}>
            <Settings2 />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={() => void handleSignOut()}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
