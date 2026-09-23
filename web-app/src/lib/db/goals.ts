import { eq } from "drizzle-orm"
import { getDb } from "./client"
import { users } from "./schema"
import { sumAyahsForDay, getYearActivityHeatmap, sumAyahsForDateRange } from "./progress"
import {
  countInGoalUnits,
  calculateKhatmDailyTarget,
  type GoalType,
} from "@/lib/goals/constants"
import { localDayStart, shiftLocalDay } from "@/lib/progress/date"

function sameLocalDay(timeZone: string, a: Date | null | undefined, b: Date): boolean {
  if (!a) return false
  return localDayStart(timeZone, a).getTime() === b.getTime()
}

export interface GoalSnapshot {
  goal: {
    type: GoalType
    target: number
    targetDate?: string | null
    dailyTarget?: number
    daysRemaining?: number
  } | null
  todayAyahs: number
  todayCount: number
  metToday: boolean
  streak: {
    currentStreak: number
    longestStreak: number
    lastMetDate: string | null
  }
  week: Array<{ date: string; met: boolean }>
  activityYear: Record<string, number>
}

export async function setActiveGoal(
  userId: string,
  goal: { type: GoalType; target: number; targetDate?: string | null },
): Promise<void> {
  const db = getDb()
  await db
    .update(users)
    .set({
      activeGoal: goal,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

export async function clearActiveGoal(userId: string): Promise<void> {
  const db = getDb()
  await db
    .update(users)
    .set({
      activeGoal: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

export async function evaluateGoalAndStreak(
  userId: string,
  timeZone: string,
): Promise<GoalSnapshot> {
  const db = getDb()
  const now = new Date()
  const today = localDayStart(timeZone, now)
  const yesterday = shiftLocalDay(timeZone, now, -1)
  const yearStart = shiftLocalDay(timeZone, now, -364)

  const [userRows, todayAyahs, activityYear] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    sumAyahsForDay(userId, today),
    getYearActivityHeatmap(userId, timeZone, yearStart),
  ])

  const userRow = userRows[0]
  const rawGoal = userRow?.activeGoal as {
    type: GoalType
    target: number
    targetDate?: string | null
    dailyTarget?: number
    daysRemaining?: number
  } | null
  const streakData = userRow?.streak ?? { currentStreak: 0, longestStreak: 0, lastMetDate: null }

  let currentStreak: number = streakData.currentStreak ?? 0
  let longestStreak: number = streakData.longestStreak ?? 0
  let lastMetDate: Date | null = streakData.lastMetDate ? localDayStart(timeZone, new Date(streakData.lastMetDate)) : null

  let effectiveGoal = rawGoal
  let dynamicTarget = rawGoal?.target ?? 0

  if (rawGoal && rawGoal.type === "khatm" && rawGoal.targetDate) {
    let totalRead = 0
    for (const count of Object.values(activityYear)) {
      totalRead += Number(count || 0)
    }
    const { dailyAyahs, daysRemaining } = calculateKhatmDailyTarget(
      rawGoal.targetDate,
      totalRead,
      now,
    )
    dynamicTarget = dailyAyahs
    effectiveGoal = {
      ...rawGoal,
      target: dailyAyahs,
      dailyTarget: dailyAyahs,
      daysRemaining,
    }
  }

  const todayCount = effectiveGoal
    ? countInGoalUnits(todayAyahs, effectiveGoal.type)
    : todayAyahs
  const metToday = Boolean(effectiveGoal && todayCount >= dynamicTarget)

  let streakChanged = false

  if (effectiveGoal) {
    if (metToday) {
      if (sameLocalDay(timeZone, lastMetDate, today)) {
        // already counted today
      } else if (sameLocalDay(timeZone, lastMetDate, yesterday)) {
        currentStreak += 1
        lastMetDate = today
        streakChanged = true
      } else {
        currentStreak = 1
        lastMetDate = today
        streakChanged = true
      }
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak
        streakChanged = true
      }
    } else if (lastMetDate && lastMetDate.getTime() < yesterday.getTime()) {
      if (currentStreak !== 0) streakChanged = true
      currentStreak = 0
    }
  } else if (lastMetDate && lastMetDate.getTime() < yesterday.getTime()) {
    if (currentStreak !== 0) streakChanged = true
    currentStreak = 0
  }

  if (streakChanged) {
    await db
      .update(users)
      .set({
        streak: {
          currentStreak,
          longestStreak,
          lastMetDate: lastMetDate ? lastMetDate.toISOString() : null,
        },
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
  }

  const priorDays = Array.from({ length: 6 }, (_, i) => shiftLocalDay(timeZone, now, -(6 - i)))
  const weekStart = priorDays[0]!
  const weekEnd = today
  const weekData = await sumAyahsForDateRange(userId, weekStart, weekEnd)

  const weekAyahs = priorDays.map((day) => {
    const key = day.toISOString().split("T")[0]
    return weekData[key] ?? 0
  })
  weekAyahs.push(todayAyahs)

  const week = weekAyahs.map((ayahs, i) => {
    const day = i < 6 ? priorDays[i]! : today
    const count = effectiveGoal ? countInGoalUnits(ayahs, effectiveGoal.type) : 0
    return { date: day.toISOString(), met: Boolean(effectiveGoal && count >= dynamicTarget) }
  })

  return {
    goal: effectiveGoal,
    todayAyahs,
    todayCount: effectiveGoal ? todayCount : 0,
    metToday,
    streak: {
      currentStreak,
      longestStreak,
      lastMetDate: lastMetDate ? lastMetDate.toISOString() : null,
    },
    week,
    activityYear,
  }
}
