"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input, type InputProps } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** RQ-21: `Input` with a show/hide toggle — for every password field, not
 * just Create Account, since the same gap exists on login, reset, and
 * account settings. */
export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ suffixNode, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)

    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        suffixNode={
          <>
            {suffixNode}
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              title={visible ? "Hide password" : "Show password"}
              aria-label={visible ? "Hide password" : "Show password"}
              className="flex shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {visible ? (
                <EyeOff className={cn("size-4")} strokeWidth={1.75} />
              ) : (
                <Eye className={cn("size-4")} strokeWidth={1.75} />
              )}
            </button>
          </>
        }
        {...props}
      />
    )
  },
)
PasswordInput.displayName = "PasswordInput"
