"use client"

import Link from "next/link"
import { ArrowRightLeft, BarChart3, ExternalLink, MoreHorizontal, Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react"

import { AppHeaderActionButton } from "@suhdo/ui/components/app/app-header-action-button"
import { AppPageHeader } from "@suhdo/ui/components/app/app-page"
import { DataList, type DataListColumn } from "@suhdo/ui/components/app/data-list"
import { ListThumb } from "@suhdo/ui/components/app/list-thumb"
import { DeltaBadge, DonutChart, MetricCard, MiniBars, Sparkline } from "@suhdo/ui/components/app/metric-card"
import { SeoAverageCard, SeoScoreBadge } from "@suhdo/ui/components/app/seo-score"
import { Badge } from "@suhdo/ui/components/ui/badge"
import { Button } from "@suhdo/ui/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@suhdo/ui/components/ui/dropdown-menu"
import { cn } from "@suhdo/ui/lib/utils"

type PageRow = {
  id: string
  title: string
  path: string
  featuredImage: string | null
  type: "BUILDER" | "REDIRECT"
  published: boolean
  seoScore: number | null
  updatedAt: string
}

const pages: PageRow[] = [
  { id: "home", title: "Início", path: "", featuredImage: preview("Início", "#0f766e", "#34d399"), type: "BUILDER", published: true, seoScore: 94, updatedAt: "2026-09-18T14:32:00Z" },
  { id: "about", title: "Sobre a Suhdo", path: "sobre", featuredImage: preview("Sobre", "#1e3a8a", "#60a5fa"), type: "BUILDER", published: true, seoScore: 88, updatedAt: "2026-09-18T11:08:00Z" },
  { id: "resources", title: "Recursos", path: "recursos", featuredImage: preview("Recursos", "#4c1d95", "#a78bfa"), type: "BUILDER", published: false, seoScore: 72, updatedAt: "2026-09-17T18:41:00Z" },
  { id: "contact", title: "Contato", path: "contato", featuredImage: null, type: "BUILDER", published: true, seoScore: 91, updatedAt: "2026-09-17T16:20:00Z" },
  { id: "docs", title: "Documentação antiga", path: "docs", featuredImage: null, type: "REDIRECT", published: true, seoScore: null, updatedAt: "2026-09-12T09:15:00Z" },
  { id: "privacy", title: "Privacidade", path: "privacidade", featuredImage: null, type: "BUILDER", published: false, seoScore: 66, updatedAt: "2026-09-10T17:02:00Z" },
]

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" })

const columns: DataListColumn<PageRow>[] = [
  {
    id: "thumb",
    role: "media",
    className: "w-14 shrink-0",
    cell: (page) => <Link href="/edit" aria-label={`Editar ${page.title}`} className="block"><ListThumb image={page.featuredImage} alt={page.title} /></Link>,
  },
  {
    id: "title",
    header: "Página",
    role: "primary",
    cell: (page) => <Link href="/edit" className="block min-w-0"><p className="truncate text-sm font-medium text-foreground">{page.title}</p><p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">/@hydrogen/{page.path}</p></Link>,
  },
  { id: "type", header: "Tipo", role: "meta", className: "w-24", hideBelow: "md", hideHeaderInCard: true, cell: (page) => <Badge variant={page.type === "BUILDER" ? "secondary" : "outline"} className="font-medium">{page.type === "BUILDER" ? "Builder" : "Redirect"}</Badge> },
  { id: "seo", header: "SEO", role: "meta", className: "w-20", hideBelow: "lg", hideHeaderInCard: true, cell: (page) => <SeoScoreBadge score={page.seoScore} /> },
  { id: "status", header: "Status", role: "meta", className: "w-28", hideBelow: "sm", hideHeaderInCard: true, cell: (page) => <StatusCell published={page.published} /> },
  { id: "date", header: "Atualizada", role: "meta", className: "w-32", align: "right", hideBelow: "xl", cell: (page) => <span className="text-xs text-muted-foreground">{dateFormatter.format(new Date(page.updatedAt))}</span> },
  { id: "actions", role: "actions", className: "w-10 shrink-0", align: "right", cell: (page) => <PageActions page={page} /> },
]

const publishedCount = pages.filter((page) => page.published).length
const draftCount = pages.length - publishedCount
const publishedRate = Math.round((publishedCount / pages.length) * 100)

export function PagesShowcase() {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col gap-6 px-4 py-5 md:h-[calc(100svh-4rem)] lg:px-6 lg:py-6">
      <AppPageHeader title="Páginas" actions={<AppHeaderActionButton asChild><Link href="/edit"><Plus />Nova Página</Link></AppHeaderActionButton>} />

      <div className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-4">
        <MetricCard label="Visualizações" value="18,4 mil" delta={<DeltaBadge value={12.4} />} sublabel="Últimos 30 dias" chart={<Sparkline data={[8, 11, 10, 14, 13, 17, 16, 21, 19, 24, 23, 27, 29, 34]} accent="emerald" label="Visualizações" />} />
        <MetricCard label="Sessões" value="6,8 mil" delta={<DeltaBadge value={8.1} />} sublabel="Visitas · 30 dias" chart={<MiniBars data={[4, 7, 5, 9, 8, 11, 9, 13, 12, 15, 14, 17]} accent="violet" label="Sessões" />} />
        <MetricCard label="Cliques no CTA" value="842" delta={<DeltaBadge value={-3.2} />} sublabel="Conversão 4,6%" chart={<Sparkline data={[9, 8, 11, 10, 12, 9, 8, 10, 7, 9, 8, 7]} accent="amber" label="Cliques no CTA" />} />
        <SeoAverageCard scores={pages.map((page) => page.seoScore)} unit="página" unitPlural="páginas" />
        <MetricCard label="Publicadas" value={`${publishedCount}/${pages.length}`} sublabel={`${publishedRate}% no ar · ${draftCount} rascunhos`} chart={<DonutChart segments={[{ key: "published", label: "Publicadas", value: publishedCount, color: "var(--chart-1)" }, { key: "draft", label: "Rascunhos", value: draftCount, color: "var(--chart-3)" }]} />} />
      </div>

      <DataList
        className="min-h-0 flex-1"
        data={pages}
        columns={columns}
        getRowId={(page) => page.id}
        getRowLabel={(page) => page.title}
        getSearchText={(page) => `${page.title} ${page.path}`}
        searchPlaceholder="Buscar páginas..."
        caption="Páginas"
        pageSize={6}
        rowHeight={68}
        cardHeight={168}
        cardMinWidth={340}
        filters={[
          { id: "status", label: "Status", options: [{ label: "Status: todos", value: "all" }, { label: "Publicadas", value: "published" }, { label: "Rascunhos", value: "draft" }], predicate: (page, value) => value === "published" ? page.published : !page.published },
          { id: "type", label: "Tipo", options: [{ label: "Tipo: todos", value: "all" }, { label: "Builder", value: "BUILDER" }, { label: "Redirect", value: "REDIRECT" }], predicate: (page, value) => page.type === value },
        ]}
        emptyState="Nenhuma página corresponde aos filtros."
      />
    </div>
  )
}

function StatusCell({ published }: { published: boolean }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", published ? "bg-success/10 text-success" : "bg-muted-foreground/10 text-muted-foreground")}>{published ? "Publicada" : "Rascunho"}</span>
}

function PageActions({ page }: { page: PageRow }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label={`Ações de ${page.title}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {page.type !== "REDIRECT" ? <DropdownMenuItem asChild><Link href="/edit"><Pencil />Editor visual</Link></DropdownMenuItem> : null}
        <DropdownMenuItem asChild><Link href="/edit"><SlidersHorizontal />Metadados</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/#data"><BarChart3 />Métricas</Link></DropdownMenuItem>
        {page.published ? <DropdownMenuItem asChild><Link href="/" target="_blank"><ExternalLink />Visualizar publicada</Link></DropdownMenuItem> : null}
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}><ArrowRightLeft />Mover para instância...</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive"><Trash2 />Excluir</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function preview(label: string, from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 360"><defs><linearGradient id="g"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="560" height="360" fill="url(#g)"/><text x="28" y="320" fill="white" font-family="sans-serif" font-size="44" font-weight="700">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
