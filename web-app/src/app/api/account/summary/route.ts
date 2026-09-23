import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { countBookmarks } from "@/lib/db/bookmarks"
import { countNotes } from "@/lib/db/notes"
import { countMemorisedAyahs } from "@/lib/db/hifz"
import { getUserById } from "@/lib/db/users"
import { evaluateGoalAndStreak } from "@/lib/db/goals"
import { getRequestTimeZone } from "@/lib/progress/serverTimezone"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const timeZone = await getRequestTimeZone()
  
  const [bookmarkCount, noteCount, hifzCount, user, goals] = await Promise.all([
    countBookmarks(session.user.id),
    countNotes(session.user.id),
    countMemorisedAyahs(session.user.id),
    getUserById(session.user.id),
    evaluateGoalAndStreak(session.user.id, timeZone),
  ])

  return NextResponse.json({
    user: {
      email: session.user.email,
      name: session.user.name,
      viewedSurahs: user?.viewedSurahs ?? [],
    },
    bookmarkCount,
    noteCount,
    hifzCount,
    goals,
  })
}
