import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function AppPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("min-h-full w-full px-4 py-5 lg:px-6 lg:py-6", className)}>{children}</div>
}

export function AppPageIntro({
  eyebrow,
  title,
  description,
  icon,
  badge,
  meta,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between", className)}>
      <div className="min-w-0 max-w-4xl space-y-4">
        {eyebrow || badge ? (
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow ? <Badge variant="secondary" className="h-6 px-2.5 text-[11px]">{eyebrow}</Badge> : null}
            {badge}
          </div>
        ) : null}
        <div className="flex items-start gap-3">
          {icon ? <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border/70 bg-muted/35 text-primary">{icon}</div> : null}
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            {description ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p> : null}
          </div>
        </div>
        {meta ? <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 xl:justify-end">{actions}</div> : null}
    </section>
  )
}

export function AppPageStats({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 2xl:grid-cols-4", className)}>{children}</div>
}

export function AppStatCard({
  label,
  value,
  description,
  icon,
}: {
  label: React.ReactNode
  value: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <Card className="h-full py-0 shadow-none transition-colors hover:border-foreground/20">
      <CardContent className="flex h-full items-start justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-[28px]">{value}</p>
          {description ? <p className="text-sm leading-5 text-muted-foreground">{description}</p> : null}
        </div>
        {icon ? <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border/70 bg-muted/35 text-primary">{icon}</div> : null}
      </CardContent>
    </Card>
  )
}

export function AppSectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
        {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function AppEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      {icon ? <div className="mb-5 flex size-14 items-center justify-center rounded-[10px] border border-border bg-muted text-primary">{icon}</div> : null}
      <div className="max-w-xl space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
