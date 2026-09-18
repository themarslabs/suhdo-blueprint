"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type Accent = "emerald" | "sky" | "amber" | "violet"

const ACCENT_COLOR: Record<Accent, string> = {
  emerald: "var(--chart-1)",
  sky: "var(--chart-2)",
  amber: "var(--chart-3)",
  violet: "var(--chart-4)",
}

export function MetricCard({
  label,
  value,
  delta,
  sublabel,
  chart,
}: {
  label: string
  value: React.ReactNode
  delta?: React.ReactNode
  sublabel?: React.ReactNode
  chart?: React.ReactNode
}) {
  return (
    <section aria-label={label} className="flex items-stretch gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20">
      <div className="flex min-w-0 max-w-40 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
          {delta}
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
        {sublabel ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{sublabel}</p> : null}
      </div>
      {chart ? <div className="flex min-w-0 max-w-16 flex-1 items-stretch sm:max-w-none" aria-hidden="true">{chart}</div> : null}
    </section>
  )
}

export function DeltaBadge({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) return null
  const positive = value >= 0
  const Icon = positive ? TrendingUp : TrendingDown

  return (
    <span className={cn("inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium tabular-nums", positive ? "text-success" : "text-destructive")}>
      <Icon className="size-3" />
      {positive ? "+" : ""}{value.toFixed(1)}%
    </span>
  )
}

function chartConfig(accent: Accent, label: string): ChartConfig {
  return { value: { label, color: ACCENT_COLOR[accent] } }
}

export function ChartEmpty({ label = "Sem dados ainda" }: { label?: string }) {
  return <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground/75">{label}</div>
}

export function Sparkline({
  data,
  accent = "emerald",
  label = "Valor",
  empty = false,
}: {
  data: number[]
  accent?: Accent
  label?: string
  empty?: boolean
}) {
  const gradientId = React.useId()
  if (empty) return <ChartEmpty />
  const chartData = data.map((value, index) => ({ index, value }))

  return (
    <ChartContainer config={chartConfig(accent, label)} className="aspect-auto h-full w-full">
      <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel className="min-w-0" />} />
        <Area dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={1.5} fill={`url(#${gradientId})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ChartContainer>
  )
}

export function MiniBars({
  data,
  accent = "violet",
  label = "Valor",
  empty = false,
}: {
  data: number[]
  accent?: Accent
  label?: string
  empty?: boolean
}) {
  if (empty) return <ChartEmpty />
  const chartData = data.map((value, index) => ({ index, value }))
  return (
    <ChartContainer config={chartConfig(accent, label)} className="aspect-auto h-full w-full">
      <BarChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel className="min-w-0" />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={1} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  )
}

export type DonutSegment = { key: string; label: string; value: number; color: string }

export function DonutChart({ segments, tooltipSide = "left" }: { segments: DonutSegment[]; tooltipSide?: "left" | "right" }) {
  const total = segments.reduce((sum, segment) => sum + Math.max(segment.value, 0), 0)
  const data = total > 0 ? segments : [{ key: "empty", label: "Sem dados", value: 1, color: "var(--muted)" }]
  const config = Object.fromEntries(segments.map((segment) => [segment.key, { label: segment.label, color: segment.color }])) as ChartConfig
  const tooltipWrapperStyle: React.CSSProperties = {
    transform: "none",
    top: "50%",
    translate: "0 -50%",
    left: tooltipSide === "right" ? "calc(100% + 8px)" : "auto",
    right: tooltipSide === "left" ? "calc(100% + 8px)" : "auto",
    whiteSpace: "nowrap",
  }

  return (
    <ChartContainer config={config} className="ml-auto aspect-square h-full max-w-full">
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        {total > 0 ? <ChartTooltip cursor={false} wrapperStyle={tooltipWrapperStyle} content={<ChartTooltipContent hideLabel />} /> : null}
        <Pie data={data} dataKey="value" nameKey="key" innerRadius="60%" outerRadius="100%" strokeWidth={2} paddingAngle={data.length > 1 ? 3 : 0} startAngle={90} endAngle={-270} isAnimationActive={false}>
          {data.map((segment) => <Cell key={segment.key} fill={segment.color} stroke="var(--card)" />)}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

export function ProgressBar({ value, accent = "emerald" }: { value: number; accent?: Accent }) {
  const percentage = Math.max(0, Math.min(100, value))
  const fill: Record<Accent, string> = { emerald: "bg-chart-1", sky: "bg-chart-2", amber: "bg-chart-3", violet: "bg-chart-4" }
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-[width]", fill[accent])} style={{ width: `${percentage}%` }} />
    </div>
  )
}
