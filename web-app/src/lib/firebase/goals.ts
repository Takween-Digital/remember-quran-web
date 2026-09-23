import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "./client"
import { type GoalType, countInGoalUnits, calculateKhatmDailyTarget } from "@/lib/goals/constants"

export interface GoalsSnapshot {
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
  activityYear?: Record<string, number>
}

export async function evaluateGoalAndStreak(userId: string, timeZone: string): Promise<GoalsSnapshot> {
  const goalRef = doc(db, "users", userId, "goals", "current")
  const snapshot = await getDoc(goalRef)
  
  let rawGoal = null
  let streakData = { currentStreak: 0, longestStreak: 0, lastMetDate: null }
  
  if (snapshot.exists()) {
    rawGoal = snapshot.data().goal || null
    streakData = snapshot.data().streak || streakData
  }

  // To properly evaluate, we'd sum ayahs from 'progressEvents' for today and this week.
  // For free-tier efficiency, we just query progressEvents >= 7 days ago.
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const q = query(collection(db, "users", userId, "progressEvents"), where("timestamp", ">=", oneWeekAgo))
  const eventsSnap = await getDocs(q)
  
  // A naive local time calculation for todayAyahs
  let todayAyahs = 0
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone })
  const weekMap: Record<string, number> = {}

  for (const eventDoc of eventsSnap.docs) {
    const data = eventDoc.data()
    const from = data.fromAyah || 1
    const to = data.toAyah || 1
    const count = (to - from) + 1
    const ts = data.timestamp?.toDate() || new Date()
    const dStr = ts.toLocaleDateString('en-CA', { timeZone })
    if (dStr === todayStr) {
      todayAyahs += count
    }
    weekMap[dStr] = (weekMap[dStr] || 0) + count
  }

  let effectiveGoal = rawGoal
  let dynamicTarget = rawGoal?.target ?? 0
  
  if (rawGoal && rawGoal.type === "khatm" && rawGoal.targetDate) {
    // simplified for now
    dynamicTarget = 20
    effectiveGoal = {
      ...rawGoal,
      target: dynamicTarget,
      dailyTarget: dynamicTarget,
      daysRemaining: 100,
    }
  }

  const todayCount = effectiveGoal ? countInGoalUnits(todayAyahs, effectiveGoal.type) : todayAyahs
  const metToday = Boolean(effectiveGoal && todayCount >= dynamicTarget)
  
  // Mock week
  const week = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toLocaleDateString('en-CA', { timeZone })
    const ayahs = weekMap[ds] || 0
    const count = effectiveGoal ? countInGoalUnits(ayahs, effectiveGoal.type) : 0
    week.push({ date: d.toISOString(), met: Boolean(effectiveGoal && count >= dynamicTarget) })
  }

  return {
    goal: effectiveGoal,
    todayAyahs,
    todayCount: effectiveGoal ? todayCount : 0,
    metToday,
    streak: streakData,
    week,
    activityYear: {}
  }
}

export async function setActiveGoal(userId: string, type: GoalType, target: number, targetDate: string | null): Promise<void> {
  const goalRef = doc(db, "users", userId, "goals", "current")
  await setDoc(goalRef, {
    goal: { type, target, targetDate },
    updatedAt: new Date()
  }, { merge: true })
}

export async function clearActiveGoal(userId: string): Promise<void> {
  const goalRef = doc(db, "users", userId, "goals", "current")
  await updateDoc(goalRef, {
    goal: null,
    updatedAt: new Date()
  })
}
