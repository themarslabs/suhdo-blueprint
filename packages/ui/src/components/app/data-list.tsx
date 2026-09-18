"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, LayoutGrid, List, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoaderTrace } from "@/components/ui/loading-state"
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
  filters?: DataListFilter<T>[]
  pageSize?: number
  emptyState?: React.ReactNode
  defaultView?: ViewMode
  enableViewToggle?: boolean
  cardMinWidth?: number
  renderCard?: (row: T) => React.ReactNode
  controlled?: DataListControlled
  toolbarExtras?: React.ReactNode
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
  filters = [],
  pageSize = 8,
  emptyState = "Nenhum resultado encontrado.",
  defaultView = "table",
  enableViewToggle = true,
  cardMinWidth = 288,
  renderCard,
  controlled,
  toolbarExtras,
  caption = "Dados",
  className,
}: DataListProps<T>) {
  const [localQuery, setLocalQuery] = React.useState("")
  const [view, setView] = React.useState<ViewMode>(defaultView)
  const [page, setPage] = React.useState(0)
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((filter) => [filter.id, filter.defaultValue ?? filter.options[0]?.value ?? "all"])),
  )
  const mobile = useIsMobile()
  const query = controlled?.search?.value ?? localQuery
  const deferredQuery = React.useDeferredValue(query)
  const effectiveView = mobile ? "cards" : view
  const normalizedQuery = deferredQuery.trim().toLocaleLowerCase()

  const filtered = controlled ? data : data.filter((row) => {
    if (normalizedQuery && getSearchText && !getSearchText(row).toLocaleLowerCase().includes(normalizedQuery)) return false
    return filters.every((filter) => {
      const selected = filterValues[filter.id]
      return !selected || selected === (filter.allValue ?? "all") || filter.predicate(row, selected)
    })
  })
  const pageCount = controlled ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const rows = controlled ? filtered : filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  function changeQuery(next: string) {
    if (controlled?.search) controlled.search.onChange(next)
    else setLocalQuery(next)
    setPage(0)
  }

  function changeFilter(id: string, value: string) {
    setFilterValues((current) => ({ ...current, [id]: value }))
    setPage(0)
  }

  return (
    <section aria-label={caption} className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="group relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
          <Input value={query} onChange={(event) => changeQuery(event.target.value)} aria-label={searchPlaceholder} placeholder={searchPlaceholder} className="bg-background pl-8" />
        </div>

        {toolbarExtras}

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          {filters.map((filter) => (
            <Select key={filter.id} value={filterValues[filter.id]} onValueChange={(value: string) => changeFilter(filter.id, value)}>
              <SelectTrigger aria-label={filter.label} className="min-w-32 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>{filter.options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          ))}

          {enableViewToggle ? (
            <div className="hidden items-center gap-0.5 rounded-lg border border-border bg-background p-0.5 md:flex" aria-label="Modo de visualizacao">
              <ViewButton active={view === "table"} label="Tabela" onClick={() => setView("table")}><List /></ViewButton>
              <ViewButton active={view === "cards"} label="Cards" onClick={() => setView("cards")}><LayoutGrid /></ViewButton>
            </div>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
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
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => <TableCell key={column.id} className={cn(column.hideBelow && TABLE_VISIBILITY[column.hideBelow], ALIGN[column.align ?? "left"], column.className)}>{column.cell(row)}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid gap-3 p-3" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${cardMinWidth}px), 1fr))` }}>
            {rows.map((row) => renderCard ? <React.Fragment key={getRowId(row)}>{renderCard(row)}</React.Fragment> : <DataCard key={getRowId(row)} row={row} columns={columns} ariaLabel={getRowLabel?.(row)} />)}
          </div>
        )}

        <div className="flex min-h-12 items-center justify-between gap-3 border-t border-border px-3 py-2 text-xs text-muted-foreground sm:px-4">
          <span className="tabular-nums">
            {controlled?.totalLabel ?? (filtered.length === 0 ? "0 itens" : controlled ? `${filtered.length} carregado${filtered.length === 1 ? "" : "s"}` : `${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, filtered.length)} de ${filtered.length}`)}
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
    <article aria-label={ariaLabel} className="group flex min-h-40 flex-col gap-3 overflow-hidden rounded-xl border border-border bg-background p-4 transition-colors hover:border-foreground/25">
      <div className="flex items-start gap-3">
        {media ? <div className="shrink-0">{media.cell(row)}</div> : null}
        {primary ? <div className="min-w-0 flex-1">{primary.cell(row)}</div> : null}
        {actions ? <div className="-mt-1 -mr-1 shrink-0">{actions.cell(row)}</div> : null}
      </div>
      {metadata.length ? (
        <dl className="mt-auto grid gap-2 border-t border-border pt-3">
          {metadata.map((column) => (
            <div key={column.id} className="flex min-w-0 items-center justify-between gap-3">
              {!column.hideHeaderInCard && column.header ? <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">{column.header}</dt> : null}
              <dd className="min-w-0 text-right text-xs">{column.cell(row)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  )
}
