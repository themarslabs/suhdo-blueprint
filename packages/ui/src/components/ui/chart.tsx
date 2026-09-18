"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { TooltipValueType } from "recharts"

import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const
type TooltipNameType = number | string

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within ChartContainer")
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        role={ariaLabel ? "img" : undefined}
        aria-label={ariaLabel}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer minWidth={0}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, item]) => item.theme ?? item.color)
  if (!colorConfig.length) return null

  const css = Object.entries(THEMES)
    .map(([theme, prefix]) => `${prefix} [data-chart=${id}] {\n${colorConfig
      .map(([key, item]) => {
        const color = item.theme?.[theme as keyof typeof item.theme] ?? item.color
        return color ? `  --color-${key}: ${color};` : ""
      })
      .join("\n")}\n}`)
    .join("\n")

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  hideLabel = false,
  label,
  formatter,
  valueFormatter,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    valueFormatter?: (value: TooltipValueType, key: string) => React.ReactNode
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>,
    "accessibilityLayer"
  >) {
  const { config } = useChart()
  if (!active || !payload?.length) return null

  return (
    <div className={cn("grid min-w-28 gap-1.5 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}>
      {!hideLabel && label ? <div className="font-medium">{String(label)}</div> : null}
      <div className="grid gap-1.5">
        {payload.filter((item) => item.type !== "none").map((item, index) => {
          const key = `${item.name ?? item.dataKey ?? "value"}`
          const itemConfig = config[key] ?? config.value
          const color = item.payload?.fill ?? item.color

          if (formatter && item.value !== undefined && item.name) {
            return <React.Fragment key={index}>{formatter(item.value, item.name, item, index, item.payload)}</React.Fragment>
          }

          return (
            <div key={index} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
              <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                {valueFormatter ? valueFormatter(item.value ?? "", key) : typeof item.value === "number" ? item.value.toLocaleString() : String(item.value ?? "")}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent }
