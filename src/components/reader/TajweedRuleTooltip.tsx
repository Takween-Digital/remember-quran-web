import { TAJWEED_RULES } from "@/lib/tajweed"

interface TajweedRuleTooltipProps {
  ruleKey: string
}

/** E-10: shown instead of WordMeaningContent when the tapped span is a
 * tajweed-coloured letter run, not plain text. */
export function TajweedRuleTooltip({ ruleKey }: TajweedRuleTooltipProps) {
  const rule = TAJWEED_RULES[ruleKey]
  if (!rule) return null

  return (
    <div className="flex max-w-[220px] flex-col gap-1 py-0.5 px-0.5 select-none">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: `var(--tj-${ruleKey})` }}
        />
        <span className="font-arabic text-base leading-none text-gold" dir="rtl" lang="ar">
          {rule.arabic}
        </span>
        <span className="text-[11px] font-medium text-foreground/95">— {rule.label}</span>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">{rule.description}</p>
    </div>
  )
}
