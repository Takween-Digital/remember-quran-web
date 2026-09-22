"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Bookmark,
  Brain,
  Flame,
  NotebookPen,
  TrendingUp,
} from "lucide-react"
import { ContinuePrompt } from "@/components/account/ContinuePrompt"

type SummaryData = {
  user: { email: string; name: string; viewedSurahs: string[] }
  bookmarkCount: number
  noteCount: number
  hifzCount: number
  goals: {
    streak: { currentStreak: number }
    todayCount: number
    goal?: { target: number; type: string }
  }
}

export default function AccountPage() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/account/summary")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = "/login?next=/account"
          }
          throw new Error("Failed to fetch")
        }
        return res.json() as Promise<SummaryData>
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading || !data) {
    return (
      <div className="max-w-4xl animate-pulse">
        <div className="h-6 w-24 rounded bg-muted"></div>
        <div className="mt-4 h-10 w-64 rounded bg-muted"></div>
        <div className="mt-4 h-4 w-96 rounded bg-muted"></div>
        <div className="mt-12 h-32 w-full rounded-xl bg-muted"></div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted"></div>
          ))}
        </div>
      </div>
    )
  }

  const { user, bookmarkCount, noteCount, hifzCount, goals } = data
  const name = user.name?.trim() || user.email?.split("@")[0] || "friend"
  const viewedSurahs = user.viewedSurahs ?? []

  const summaries = [
    {
      href: "/account/bookmarks",
      label: "Bookmarks",
      value: bookmarkCount.toLocaleString(),
      description: "saved ayahs",
      icon: Bookmark,
    },
    {
      href: "/account/notes",
      label: "Notes",
      value: noteCount.toLocaleString(),
      description: "private reflections",
      icon: NotebookPen,
    },
    {
      href: "/account/hifz",
      label: "Hifz",
      value: hifzCount.toLocaleString(),
      description: "ayahs memorised",
      icon: Brain,
    },
    {
      href: "/account/progress",
      label: "Progress",
      value: `${viewedSurahs.length}/114`,
      description: "surahs visited",
      icon: TrendingUp,
    },
    {
      href: "/account/goals",
      label: "Current streak",
      value: String(goals.streak.currentStreak),
      description:
        goals.streak.currentStreak === 1 ? "day in a row" : "days in a row",
      icon: Flame,
    },
  ] as const

  const goalProgress = goals.goal
    ? Math.min(100, Math.round((goals.todayCount / goals.goal.target) * 100))
    : 0

  return (
    <div className="max-w-4xl">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Your space
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          Assalamu alaikum, {name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Pick up where you left off and keep your reflections together.
        </p>
      </header>

      <ContinuePrompt className="mt-6" />

      <section className="mt-8" aria-labelledby="journey-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
              At a glance
            </p>
            <h2 id="journey-heading" className="mt-1 font-serif text-xl">
              Your Quran journey
            </h2>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {summaries.map(({ href, label, value, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-border bg-card p-4 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="mt-5 font-serif text-3xl tabular-nums">{value}</p>
              <p className="mt-1 text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Today’s reading goal</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {goals.goal
                ? `${goals.todayCount} of ${goals.goal.target} ${goals.goal.type}`
                : "Set a gentle daily rhythm that works for you."}
            </p>
          </div>
          <Link
            href="/account/goals"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {goals.goal ? "View goal" : "Set a goal"}
          </Link>
        </div>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
          aria-label={`${goalProgress}% of today’s goal`}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${goalProgress}%` }}
          />
        </div>
      </section>

      <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
        Signed in as {user.email}
      </p>
    </div>
  )
}
