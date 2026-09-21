"use client"

import * as React from "react"
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isAfter, isBefore, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type DateRange = { from?: Date; to?: Date }

export type DateRangePickerProps = {
  value: DateRange
  onChange: (range: DateRange) => void
  label?: string
  className?: string
}

const presets = [
  { label: "Hoje", getRange: () => ({ from: startOfDay(new Date()), to: startOfDay(new Date()) }) },
  { label: "Ontem", getRange: () => ({ from: subDays(startOfDay(new Date()), 1), to: subDays(startOfDay(new Date()), 1) }) },
  { label: "Últimos 7 dias", getRange: () => ({ from: subDays(startOfDay(new Date()), 6), to: startOfDay(new Date()) }) },
  { label: "Últimos 30 dias", getRange: () => ({ from: subDays(startOfDay(new Date()), 29), to: startOfDay(new Date()) }) },
  { label: "Este mês", getRange: () => ({ from: startOfMonth(new Date()), to: startOfDay(new Date()) }) },
  { label: "Mês passado", getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
]

export function DateRangePicker({ value, onChange, label = "Período", className }: DateRangePickerProps) {
  const [month, setMonth] = React.useState(() => startOfMonth(value.from ?? new Date()))
  const visibleMonths = [month, addMonths(month, 1)]
  const rangeLabel = value.from
    ? value.to
      ? isSameDay(value.from, value.to)
        ? format(value.from, "dd MMM yyyy", { locale: ptBR })
        : `${format(value.from, "dd MMM", { locale: ptBR })} – ${format(value.to, "dd MMM yyyy", { locale: ptBR })}`
      : `A partir de ${format(value.from, "dd MMM", { locale: ptBR })}`
    : label

  function selectDay(day: Date) {
    const selected = startOfDay(day)
    if (!value.from || value.to) {
      onChange({ from: selected })
      return
    }
    if (isBefore(selected, value.from)) onChange({ from: selected, to: value.from })
    else onChange({ from: value.from, to: selected })
  }

  function isPresetActive(range: DateRange) {
    return Boolean(value.from && value.to && range.from && range.to && isSameDay(value.from, range.from) && isSameDay(value.to, range.to))
  }

  function calendar(calendarMonth: Date, index: number) {
    const calendarStart = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(endOfMonth(calendarMonth), { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
      <div key={calendarMonth.toISOString()} className="w-64 p-3">
        <div className="flex h-8 items-center justify-between">
          {index === 0 ? <Button type="button" variant="ghost" size="icon-sm" aria-label="Mês anterior" onClick={() => setMonth((current) => addMonths(current, -1))}><ChevronLeft /></Button> : <span className="size-8" />}
          <p className="text-xs font-semibold capitalize">{format(calendarMonth, "MMMM 'de' yyyy", { locale: ptBR })}</p>
          {index === 1 ? <Button type="button" variant="ghost" size="icon-sm" aria-label="Próximo mês" onClick={() => setMonth((current) => addMonths(current, 1))}><ChevronRight /></Button> : <span className="size-8" />}
        </div>
        <div className="mt-1 grid grid-cols-7 text-center text-[10px] font-medium text-muted-foreground">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, dayIndex) => <span key={`${day}-${dayIndex}`} className="py-1.5">{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map((day) => {
            const start = value.from && isSameDay(day, value.from)
            const end = value.to && isSameDay(day, value.to)
            const inRange = value.from && value.to && isAfter(day, value.from) && isBefore(day, value.to)
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => selectDay(day)}
                className={cn(
                  "grid h-8 place-items-center rounded-md text-xs outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  !isSameMonth(day, calendarMonth) && "text-muted-foreground/35",
                  inRange && "rounded-none bg-primary/10 text-foreground",
                  (start || end) && "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
                )}
              >
                {format(day, "d")}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button data-component="DateRangePicker" variant="outline" className={cn("h-9 min-w-40 justify-between border-border/80 bg-background/70 px-2.5 font-normal shadow-none", className)}>
          <span className="flex min-w-0 items-center gap-2"><CalendarDays className="size-3.5 shrink-0 text-muted-foreground" /><span className="max-w-40 truncate text-xs capitalize">{rangeLabel}</span></span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto p-0" onCloseAutoFocus={(event) => event.preventDefault()}>
        <div className="flex">
          <div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {visibleMonths.map(calendar)}
            </div>
            <div className="flex min-h-11 items-center justify-between border-t border-border px-4 py-2">
              <span className="text-[11px] text-muted-foreground">{value.from && !value.to ? "Selecione a data final" : rangeLabel}</span>
              {value.from || value.to ? <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground" onClick={() => onChange({})}><X className="size-3" />Limpar</Button> : null}
            </div>
          </div>
          <aside className="w-40 border-l border-border p-2">
            <p className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Períodos</p>
            <div className="grid gap-0.5">
              {presets.map((preset) => {
                const range = preset.getRange()
                const active = isPresetActive(range)
                return (
                  <Button key={preset.label} variant="ghost" size="sm" className={cn("h-8 justify-between px-2 text-xs font-normal", active && "bg-accent text-accent-foreground")} onClick={() => { onChange(range); setMonth(startOfMonth(range.from!)) }}>
                    {preset.label}{active ? <Check className="size-3.5 text-primary" /> : null}
                  </Button>
                )
              })}
            </div>
          </aside>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
