import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: React.ReactNode
  prefixNode?: React.ReactNode
  suffixNode?: React.ReactNode
  /** Extra classes for the inner bordered container (icon + input row) */
  wrapperClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, hint, error, prefixNode, suffixNode, wrapperClassName, id, ...props }, ref) => {
    const [focus, setFocus] = React.useState(false)
    const generatedId = React.useId()
    const uid = id || generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={uid} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex min-h-[44px] items-center gap-2 rounded-[10px] border bg-card px-3 text-muted-foreground transition-colors",
            error ? "border-destructive" : focus ? "border-ring shadow-[0_0_0_2px_var(--ring)]" : "border-border",
            // Callers reach for `className` to style this visible field box
            // (height, background, padding) — not the outer label+hint
            // layout div — so this is where it needs to land. Merged after
            // the base classes above so a caller's override (e.g. a
            // different border colour) wins.
            className,
            wrapperClassName
          )}
        >
          {prefixNode}
          <InputPrimitive
            ref={ref}
            id={uid}
            type={type}
            onFocus={(e) => {
              setFocus(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocus(false)
              props.onBlur?.(e)
            }}
            data-slot="input"
            // `items-center` on the row above already centers this
            // vertically regardless of its own padding — kept small (rather
            // than matching the row's own min-h-[44px] with padding of its
            // own) so a caller-supplied *exact* height (e.g. `h-11`) can
            // never be shorter than the input's intrinsic content height,
            // which would otherwise overflow the rounded box by a pixel or
            // two at the top/bottom — most visible right at the corners,
            // where it looks like a broken piece of border.
            className="flex-1 bg-transparent py-2 text-base text-foreground outline-none min-w-0 placeholder:text-muted-foreground"
            {...props}
          />
          {suffixNode}
        </div>
        {(hint || error) && (
          <div className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
            {error || hint}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
