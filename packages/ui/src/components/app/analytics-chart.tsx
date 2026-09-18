"use client"

import * as React from "react"
import { AlertCircle, BarChart3, Table2 } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { ChartLoading } from "@/components/ui/loading-state"
import { cn } from "@/lib/utils"

export type ChartSeries = {
  key: string
  label: string
  color?: string
}

export type ChartDataRow = {
  label: string
  [key: string]: string | number
}

export type ChartPanelProps = {
  title: string
  description?: string
  action?: React.ReactNode
  loading?: boolean
  error?: React.ReactNode
  empty?: boolean
  emptyLabel?: string
  children: React.ReactNode
  table?: { columns: { key: string; label: string; format?: (value: string | number) => React.ReactNode }[]; rows: ChartDataRow[] }
  className?: string
}

export function ChartPanel({ title, description, action, loading = false, error, empty = false, emptyLabel = "Sem dados para este periodo", children, table, className }: ChartPanelProps) {
  const titleId = React.useId()
  return (
    <section aria-labelledby={titleId} className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <header className="flex min-h-16 items-start justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0"><h3 id={titleId} className="text-sm font-semibold">{title}</h3>{description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}</div>
        {action}
      </header>
      <div className="min-h-72 p-3 sm:p-5">
        {loading ? <ChartLoading message={`Carregando ${title}`} /> : error ? (
          <div className="flex min-h-64 items-center justify-center" role="alert"><div className="max-w-sm text-center"><AlertCircle className="mx-auto mb-2 size-6 text-destructive" /><p className="text-sm font-medium">Nao foi possivel carregar o grafico</p><p className="mt-1 text-xs text-muted-foreground">{error}</p></div></div>
        ) : empty ? (
          <div className="flex min-h-64 items-center justify-center text-center"><div><BarChart3 className="mx-auto mb-2 size-7 text-muted-foreground/55" /><p className="text-sm text-muted-foreground">{emptyLabel}</p></div></div>
        ) : children}
      </div>
      {!loading && !error && !empty && table?.rows.length ? <AccessibleChartTable {...table} /> : null}
    </section>
  )
}

export function TimeSeriesChart({
  data,
  series,
  ariaLabel,
  valueFormatter = defaultFormatter,
  compact = false,
}: {
  data: ChartDataRow[]
  series: ChartSeries[]
  ariaLabel: string
  valueFormatter?: (value: number) => string
  compact?: boolean
}) {
  const gradientPrefix = React.useId().replace(/:/g, "")
  const config = getConfig(series)
  return (
    <ChartContainer config={config} aria-label={ariaLabel} className={cn("aspect-auto h-72 w-full", compact && "h-48")}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: compact ? -24 : 4 }}>
        <defs>{series.map((item) => <linearGradient key={item.key} id={`fill-${gradientPrefix}-${safeId(item.key)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={`var(--color-${item.key})`} stopOpacity={0.28} /><stop offset="95%" stopColor={`var(--color-${item.key})`} stopOpacity={0} /></linearGradient>)}</defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={10} minTickGap={28} hide={compact} />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} width={compact ? 0 : 52} hide={compact} tickFormatter={(value) => compactNumber(Number(value))} />
        <ChartTooltip cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }} content={<ChartTooltipContent valueFormatter={(value) => valueFormatter(Number(value))} />} />
        {series.map((item) => <Area key={item.key} dataKey={item.key} name={item.key} type="monotone" stroke={`var(--color-${item.key})`} strokeWidth={2} fill={`url(#fill-${gradientPrefix}-${safeId(item.key)})`} dot={false} activeDot={{ r: 3 }} isAnimationActive={false} />)}
      </AreaChart>
    </ChartContainer>
  )
}

export function CategoryBarChart({
  data,
  series,
  ariaLabel,
  valueFormatter = defaultFormatter,
  stacked = false,
}: {
  data: ChartDataRow[]
  series: ChartSeries[]
  ariaLabel: string
  valueFormatter?: (value: number) => string
  stacked?: boolean
}) {
  return (
    <ChartContainer config={getConfig(series)} aria-label={ariaLabel} className="aspect-auto h-72 w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={10} />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} width={52} tickFormatter={(value) => compactNumber(Number(value))} />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltipContent valueFormatter={(value) => valueFormatter(Number(value))} />} />
        {series.map((item, index) => <Bar key={item.key} dataKey={item.key} name={item.key} stackId={stacked ? "total" : undefined} fill={`var(--color-${item.key})`} radius={stacked ? index === series.length - 1 ? [4, 4, 0, 0] : 0 : [4, 4, 0, 0]} isAnimationActive={false} />)}
      </BarChart>
    </ChartContainer>
  )
}

export type DonutDatum = { key: string; label: string; value: number; color?: string }

export function DonutBreakdownChart({ data, ariaLabel, valueFormatter = defaultFormatter, centerLabel = "Total" }: { data: DonutDatum[]; ariaLabel: string; valueFormatter?: (value: number) => string; centerLabel?: string }) {
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0)
  const config = getConfig(data)
  return (
    <div className="grid min-h-72 items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.7fr)]">
      <ChartContainer config={config} aria-label={ariaLabel} className="mx-auto aspect-square h-64 max-w-full">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel valueFormatter={(value) => valueFormatter(Number(value))} />} />
          <Pie data={data} dataKey="value" nameKey="key" innerRadius="62%" outerRadius="86%" paddingAngle={data.length > 1 ? 2 : 0} stroke="var(--card)" strokeWidth={3} isAnimationActive={false}>
            {data.map((item) => <Cell key={item.key} fill={`var(--color-${item.key})`} />)}
            <Label position="center" content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null
              return <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle"><tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 7} className="fill-foreground text-lg font-semibold">{valueFormatter(total)}</tspan><tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 13} className="fill-muted-foreground text-[10px]">{centerLabel}</tspan></text>
            }} />
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="grid gap-2" aria-label="Legenda">
        {data.map((item, index) => <li key={item.key} className="flex items-center gap-2 text-xs"><span className="size-2.5 rounded-[3px]" style={{ backgroundColor: chartColor(item, index) }} /><span className="min-w-0 flex-1 truncate text-muted-foreground">{item.label}</span><span className="font-mono font-medium tabular-nums">{valueFormatter(item.value)}</span><span className="w-10 text-right font-mono text-[10px] text-muted-foreground tabular-nums">{total ? `${Math.round(item.value / total * 100)}%` : "0%"}</span></li>)}
      </ul>
    </div>
  )
}

function AccessibleChartTable({ columns, rows }: NonNullable<ChartPanelProps["table"]>) {
  return (
    <details className="group border-t border-border">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><Table2 className="size-3.5" />Ver dados em tabela</summary>
      <div className="overflow-x-auto border-t border-border">
        <table className="w-full text-xs">
          <thead><tr className="bg-muted/30">{columns.map((column) => <th key={column.key} scope="col" className="h-9 px-4 text-left font-medium text-muted-foreground">{column.label}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={`${row.label}-${index}`} className="border-t border-border">{columns.map((column) => <td key={column.key} className="px-4 py-2 font-mono tabular-nums">{column.format?.(row[column.key]) ?? row[column.key]}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </details>
  )
}

function getConfig(series: ChartSeries[]): ChartConfig {
  return Object.fromEntries(series.map((item, index) => [item.key, { label: item.label, color: chartColor(item, index) }]))
}

function chartColor(item: ChartSeries, index: number) {
  return item.color ?? `var(--chart-${index % 5 + 1})`
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-")
}

function defaultFormatter(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}
