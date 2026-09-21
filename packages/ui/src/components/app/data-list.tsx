"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ChartNoAxesCombined, Check, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DateRangePicker, type DateRange } from "@/components/app/date-range-picker"
import { Input } from "@/components/ui/input"
import { LoaderTrace } from "@/components/ui/loading-state"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type Breakpoint = "sm" | "md" | "lg" | "xl"
type ViewMode = "table" | "cards"
type ColumnRole = "media" | "primary" | "meta" | "actions"

export type DataListColumn<T> = {
  id: string
  header?: React.ReactNode
  cell: (row: T) => React.ReactNode
  className?: string
  align?: "left" | "center" | "right"
  hideBelow?: Breakpoint
  hideOnMobile?: boolean
  role?: ColumnRole
  hideInCard?: boolean
  hideHeaderInCard?: boolean
  sortKey?: string
}

export type DataListFilter<T> = {
  id: string
  label: string
  options: { label: string; value: string }[]
  defaultValue?: string
  allValue?: string
  predicate: (row: T, value: string) => boolean
}

export type DataListDateFilter<T> = {
  label?: string
  getDate: (row: T) => string | Date
}

export type DataListControlled = {
  search?: { value: string; onChange: (query: string) => void }
  sort?: { key: string; dir: "asc" | "desc"; onChange: (key: string) => void }
  footer?: React.ReactNode
  loading?: boolean
  totalLabel?: string
}

export type DataListProps<T> = {
  data: T[]
  columns: DataListColumn<T>[]
  getRowId: (row: T) => string
  getRowLabel?: (row: T) => string
  getSearchText?: (row: T) => string
  searchPlaceholder?: string
  searchWidth?: "fill" | "compact"
  filters?: DataListFilter<T>[]
  dateFilter?: DataListDateFilter<T>
  pageSize?: number
  rowHeight?: number
  cardHeight?: number
  emptyState?: React.ReactNode
  defaultView?: ViewMode
  enableViewToggle?: boolean
  cardMinWidth?: number
  renderCard?: (row: T) => React.ReactNode
  cardsSurface?: boolean
  controlled?: DataListControlled
  toolbarLeading?: React.ReactNode
  toolbarExtras?: React.ReactNode
  charts?: React.ReactNode
  defaultChartsVisible?: boolean
  caption?: string
  className?: string
}

const TABLE_VISIBILITY: Record<Breakpoint, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
}

const ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

function useIsMobile() {
  const [mobile, setMobile] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const update = () => setMobile(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return mobile
}

export function DataList<T>({
  data,
  columns,
  getRowId,
  getRowLabel,
  getSearchText,
  searchPlaceholder = "Buscar...",
  searchWidth = "fill",
  filters = [],
  dateFilter,
  pageSize = 8,
  rowHeight,
  cardHeight,
  emptyState = "Nenhum resultado encontrado.",
  defaultView = "table",
  enableViewToggle = true,
  cardMinWidth = 288,
  renderCard,
  cardsSurface = false,
  controlled,
  toolbarLeading,
  toolbarExtras,
  charts,
  defaultChartsVisible = true,
  caption = "Dados",
  className,
}: DataListProps<T>) {
  const [localQuery, setLocalQuery] = React.useState("")
  const [view, setView] = React.useState<ViewMode>(defaultView)
  const [page, setPage] = React.useState(0)
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((filter) => [filter.id, filter.defaultValue ?? filter.options[0]?.value ?? "all"])),
  )
  const [dateRange, setDateRange] = React.useState<DateRange>({})
  const [chartsVisible, setChartsVisible] = React.useState(defaultChartsVisible)
  const mobile = useIsMobile()
  const listViewportRef = React.useRef<HTMLDivElement>(null)
  const [fitRows, setFitRows] = React.useState(pageSize)
  const query = controlled?.search?.value ?? localQuery
  const deferredQuery = React.useDeferredValue(query)
  const effectiveView = mobile ? "cards" : view
  const normalizedQuery = deferredQuery.trim().toLocaleLowerCase()

  React.useEffect(() => {
    const viewport = listViewportRef.current
    if (!viewport || !rowHeight || effectiveView !== "table") return
    const update = () => setFitRows(Math.max(1, Math.floor((viewport.clientHeight - 41) / rowHeight)))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [rowHeight, effectiveView, chartsVisible])

  const filtered = controlled ? data : data.filter((row) => {
    if (normalizedQuery && getSearchText && !getSearchText(row).toLocaleLowerCase().includes(normalizedQuery)) return false
    const matchesFields = filters.every((filter) => {
      const selected = filterValues[filter.id]
      return !selected || selected === (filter.allValue ?? "all") || filter.predicate(row, selected)
    })
    if (!matchesFields || !dateFilter || (!dateRange.from && !dateRange.to)) return matchesFields
    const date = new Date(dateFilter.getDate(row))
    const from = dateRange.from ? new Date(dateRange.from) : null
    const to = dateRange.to ? new Date(dateRange.to) : null
    from?.setHours(0, 0, 0, 0)
    to?.setHours(23, 59, 59, 999)
    return (!from || date >= from) && (!to || date <= to)
  })
  const effectivePageSize = rowHeight && effectiveView === "table" ? fitRows : pageSize
  const pageCount = controlled ? 1 : Math.max(1, Math.ceil(filtered.length / effectivePageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const rows = controlled ? filtered : filtered.slice(currentPage * effectivePageSize, (currentPage + 1) * effectivePageSize)

  function changeQuery(next: string) {
    if (controlled?.search) controlled.search.onChange(next)
    else setLocalQuery(next)
    setPage(0)
  }

  function changeFilter(id: string, value: string) {
    setFilterValues((current) => ({ ...current, [id]: value }))
    setPage(0)
  }

  const activeFilterCount = filters.filter((filter) => {
    const value = filterValues[filter.id]
    return value && value !== (filter.allValue ?? "all")
  }).length

  return (
    <section aria-label={caption} className={cn("flex min-w-0 flex-col gap-3 xl:gap-4", className)}>
      {charts && chartsVisible ? <div className="min-w-0 shrink-0">{charts}</div> : null}
      <div className="shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-full min-w-max items-center gap-3 xl:gap-4">
          {toolbarLeading}
          <div className={cn("group relative min-w-52 sm:min-w-64", searchWidth === "compact" ? "w-full max-w-xs shrink-0" : "flex-1")}>
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input value={query} onChange={(event) => changeQuery(event.target.value)} aria-label={searchPlaceholder} placeholder={searchPlaceholder} className="border-border/80 bg-background/70 pl-8 shadow-none min-[1900px]:h-10 min-[1900px]:text-sm" />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3 xl:gap-4">
          <div className="flex shrink-0 items-center gap-3 xl:gap-4">
          {toolbarExtras}

          {dateFilter ? <DateRangePicker value={dateRange} onChange={(range) => { setDateRange(range); setPage(0) }} label={dateFilter.label ?? "Período"} className="min-w-48 min-[1900px]:h-10 min-[1900px]:min-w-52 min-[1900px]:px-3" /> : null}

          {filters.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 min-w-32 gap-2 border-border/80 bg-background/70 px-2.5 font-normal shadow-none min-[1900px]:h-10 min-[1900px]:min-w-36 min-[1900px]:px-3">
                  <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                  <span className="text-xs">Filtros</span>
                  {activeFilterCount ? <span className="grid size-4 place-items-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">{activeFilterCount}</span> : null}
                  <ChevronDown className="ml-auto size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5">
                {filters.map((filter, index) => (
                  <React.Fragment key={filter.id}>
                    {index ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                    {filter.options.map((option) => {
                      const active = filterValues[filter.id] === option.value
                      return <DropdownMenuItem key={option.value} onSelect={(event) => { event.preventDefault(); changeFilter(filter.id, option.value) }} className="justify-between">{option.label.replace(`${filter.label}: `, "")} {active ? <Check className="text-primary" /> : null}</DropdownMenuItem>
                    })}
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : filters.map((filter) => (
            <Select key={filter.id} value={filterValues[filter.id]} onValueChange={(value: string) => changeFilter(filter.id, value)}>
              <SelectTrigger aria-label={filter.label} className="min-w-32 border-border/80 bg-background/70 shadow-none min-[1900px]:h-10 min-[1900px]:min-w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{filter.options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          ))}
          </div>

          {charts ? <Button variant="ghost" size="icon-sm" className={cn("size-9 shrink-0 min-[1900px]:size-10", chartsVisible ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")} onClick={() => setChartsVisible((visible) => !visible)} aria-pressed={chartsVisible} aria-label={chartsVisible ? "Ocultar gráficos" : "Mostrar gráficos"} title={chartsVisible ? "Ocultar gráficos" : "Mostrar gráficos"}><span className="relative grid place-items-center"><ChartNoAxesCombined />{!chartsVisible ? <span className="absolute h-px w-5 -rotate-45 bg-current ring-1 ring-background" /> : null}</span></Button> : null}

          {enableViewToggle ? (
            <div className="hidden shrink-0 items-center gap-0.5 rounded-lg border border-border/80 bg-background/70 p-0.5 md:flex min-[1900px]:[&_button]:size-9" aria-label="Modo de visualizacao">
              <ViewButton active={view === "table"} label="Lista" onClick={() => setView("table")}><List /></ViewButton>
              <ViewButton active={view === "cards"} label="Cards" onClick={() => setView("cards")}><LayoutGrid /></ViewButton>
            </div>
          ) : null}
          </div>
        </div>
      </div>

      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", effectiveView === "cards" && !cardsSurface ? "bg-transparent" : "rounded-xl border border-border bg-card")}>
        <div ref={listViewportRef} className="min-h-0 flex-1 overflow-hidden">
        {controlled?.loading ? (
          <div className="flex min-h-64 items-center justify-center" role="status" aria-live="polite">
            <div className="flex items-center gap-3 text-sm text-muted-foreground"><LoaderTrace className="text-primary" />Carregando lista...</div>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-52 items-center justify-center p-6 text-center text-sm text-muted-foreground">{emptyState}</div>
        ) : effectiveView === "table" ? (
          <Table>
            <caption className="sr-only">{caption}</caption>
            <TableHeader>
              <TableRow>
                {columns.map((column) => {
                  const sorted = column.sortKey && controlled?.sort?.key === column.sortKey
                  return (
                    <TableHead
                      key={column.id}
                      aria-sort={sorted ? (controlled?.sort?.dir === "asc" ? "ascending" : "descending") : undefined}
                      className={cn(column.hideBelow && TABLE_VISIBILITY[column.hideBelow], ALIGN[column.align ?? "left"], column.className)}
                    >
                      {column.sortKey && controlled?.sort ? (
                        <button type="button" className="inline-flex items-center gap-1 rounded-sm uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" onClick={() => controlled.sort?.onChange(column.sortKey!)}>
                          {column.header}
                          {sorted ? controlled.sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : null}
                        </button>
                      ) : column.header}
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={getRowId(row)} style={rowHeight ? { height: rowHeight } : undefined}>
                  {columns.map((column) => <TableCell key={column.id} className={cn(column.hideBelow && TABLE_VISIBILITY[column.hideBelow], ALIGN[column.align ?? "left"], column.className)}>{column.cell(row)}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className={cn("grid gap-3", cardsSurface ? "p-3" : "py-1")} style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${cardMinWidth}px), 1fr))`, gridAutoRows: cardHeight ? `${cardHeight}px` : undefined }}>
            {rows.map((row) => renderCard ? <React.Fragment key={getRowId(row)}>{renderCard(row)}</React.Fragment> : <DataCard key={getRowId(row)} row={row} columns={columns} ariaLabel={getRowLabel?.(row)} />)}
          </div>
        )}

        </div>

        <div className={cn("flex min-h-12 shrink-0 items-center justify-between gap-3 px-3 py-2 text-xs text-muted-foreground sm:px-4", effectiveView === "cards" && !cardsSurface ? "mt-2 rounded-lg border border-border/70 bg-card/45" : "border-t border-border")}>
          <span className="tabular-nums">
            {controlled?.totalLabel ?? (filtered.length === 0 ? "0 itens" : controlled ? `${filtered.length} carregado${filtered.length === 1 ? "" : "s"}` : `${currentPage * effectivePageSize + 1}-${Math.min((currentPage + 1) * effectivePageSize, filtered.length)} de ${filtered.length}`)}
          </span>
          {controlled ? controlled.footer : (
            <div className="flex items-center gap-1">
              <span className="mr-1 tabular-nums">{currentPage + 1} / {pageCount}</span>
              <Button variant="outline" size="icon-sm" className="size-10 bg-background md:size-8" onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} aria-label="Pagina anterior"><ChevronLeft /></Button>
              <Button variant="outline" size="icon-sm" className="size-10 bg-background md:size-8" onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))} disabled={currentPage === pageCount - 1} aria-label="Proxima pagina"><ChevronRight /></Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ViewButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} aria-label={label} onClick={onClick} className={cn("flex size-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4", active ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
      {children}
    </button>
  )
}

function DataCard<T>({ row, columns, ariaLabel }: { row: T; columns: DataListColumn<T>[]; ariaLabel?: string }) {
  const media = columns.find((column) => column.role === "media" && !column.hideInCard)
  const primary = columns.find((column) => column.role === "primary" && !column.hideInCard)
  const actions = columns.find((column) => column.role === "actions" && !column.hideInCard)
  const metadata = columns.filter((column) => (column.role ?? "meta") === "meta" && !column.hideInCard && !column.hideOnMobile)

  return (
    <article aria-label={ariaLabel} className="group flex min-h-40 flex-col gap-3 overflow-hidden rounded-xl border border-border/80 bg-card/70 p-4 shadow-[0_1px_0_rgba(255,255,255,0.025)] transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-card">
      <div className="flex items-start gap-3">
        {media ? <div className="shrink-0">{media.cell(row)}</div> : null}
        {primary ? <div className="min-w-0 flex-1">{primary.cell(row)}</div> : null}
        {actions ? <div className="-mt-1 -mr-1 shrink-0">{actions.cell(row)}</div> : null}
      </div>
      {metadata.length ? (
        <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3">
          {metadata.map((column) => (
            <div key={column.id} className="flex min-w-0 items-center gap-1.5">
              {!column.hideHeaderInCard && column.header ? <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">{column.header}</dt> : null}
              <dd className="min-w-0 text-xs">{column.cell(row)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  )
}
