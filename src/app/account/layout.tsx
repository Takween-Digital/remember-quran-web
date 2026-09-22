import type { ReactNode } from "react"
import type { Metadata } from "next"
import { AccountNav } from "@/components/account/AccountNav"

export const metadata: Metadata = {
  title: "Account",
}

/**
 * Account area requires a session. Protected by middleware.ts.
 */
export default function AccountLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="site-shell flex flex-col px-4 py-8 sm:px-6 sm:py-10 md:flex-row md:items-start md:gap-10">
      <AccountNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
