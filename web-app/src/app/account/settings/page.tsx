"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/components/auth/AuthProvider"
import { SettingsForms } from "@/components/account/SettingsForms"
import { getUserById } from "@/lib/firebase/users"

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ displayName: string, email: string } | null>(null)

  useEffect(() => {
    if (!user) return

    let isMounted = true
    const fetchData = async () => {
      try {
        const userDoc = await getUserById(user.uid)
        
        if (isMounted) {
          setData({
            displayName: userDoc?.profile?.displayName || user.displayName || "User",
            email: userDoc?.email || user.email || "",
          })
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
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
            Settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your profile and sign-in details.
          </p>
        </div>

        {loading || !data ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <SettingsForms
            initialDisplayName={data.displayName}
            initialEmail={data.email}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
