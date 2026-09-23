"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  GoalsView,
  type GoalsSnapshot,
} from "@/components/account/GoalsView"
import { evaluateGoalAndStreak } from "@/lib/firebase/goals"

export default function GoalsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<GoalsSnapshot | null>(null)

  useEffect(() => {
    if (!user) return

    let isMounted = true
    const fetchData = async () => {
      try {
        // We use a simple fallback timezone for the client initially
        const snapshot = await evaluateGoalAndStreak(
          user.uid,
          Intl.DateTimeFormat().resolvedOptions().timeZone
        )

        if (isMounted) {
          setData(snapshot)
        }
      } catch (error) {
        console.error("Failed to fetch goals:", error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [user])

  return (
    <ProtectedRoute>
      <div className="max-w-3xl">
        <div className="mb-7">
          <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
            Your account
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
            Goals & streaks
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set a simple daily reading goal. Meet it to keep your streak — keep
            it light.
          </p>
        </div>

        {loading || !data ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <GoalsView initial={data} />
        )}
      </div>
    </ProtectedRoute>
  )
}
