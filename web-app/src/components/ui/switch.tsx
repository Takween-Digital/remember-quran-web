"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"
import { hapticFeedback } from "@/lib/haptics"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "data-[size=default]:h-[24px] data-[size=default]:w-[44px]",
        "data-[size=sm]:h-[18px] data-[size=sm]:w-[32px]",
        "cursor-pointer bg-black/15 dark:bg-white/15 hover:bg-black/25 dark:hover:bg-white/25",
        "aria-checked:bg-primary aria-checked:hover:bg-primary/90",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
      onCheckedChange={(checked, eventDetails) => {
        hapticFeedback("light")
        props.onCheckedChange?.(checked, eventDetails)
      }}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white dark:bg-foreground ring-0 transition-transform shadow-sm",
          "group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-3.5",
          "group-aria-checked/switch:translate-x-5 group-data-[size=sm]/switch:group-aria-checked/switch:translate-x-3.5",
          "translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
