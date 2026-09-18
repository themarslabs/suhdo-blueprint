"use client"

import * as React from "react"
import Link from "next/link"
import {
  Activity,
  Boxes,
  Check,
  CircleAlert,
  Clock3,
  Code2,
  Component,
  FileText,
  Gauge,
  ImagePlus,
  Info,
  Mail,
  MoreHorizontal,
  Palette,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

import { DataList, type DataListColumn } from "@suhdo/ui/components/app/data-list"
import { CategoryBarChart, ChartPanel, DonutBreakdownChart, TimeSeriesChart } from "@suhdo/ui/components/app/analytics-chart"
import { AppEmptyState, AppPage, AppPageHeader, AppPageIntro, AppPageStats, AppSectionHeader, AppStatCard } from "@suhdo/ui/components/app/app-page"
import { DeltaBadge, DonutChart, MetricCard, MiniBars, ProgressBar, Sparkline } from "@suhdo/ui/components/app/metric-card"
import { FilePickerDialog } from "@suhdo/ui/components/files/file-picker-dialog"
import type { FileAsset } from "@suhdo/ui/components/files/file-tile"
import { Alert, AlertDescription, AlertTitle } from "@suhdo/ui/components/ui/alert"
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup } from "@suhdo/ui/components/ui/avatar"
import { Badge } from "@suhdo/ui/components/ui/badge"
import { Button, type ButtonProps } from "@suhdo/ui/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@suhdo/ui/components/ui/card"
import { Checkbox } from "@suhdo/ui/components/ui/checkbox"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@suhdo/ui/components/ui/dialog"
import { useConfirm } from "@suhdo/ui/components/ui/dialogs-provider"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@suhdo/ui/components/ui/dropdown-menu"
import { Input } from "@suhdo/ui/components/ui/input"
import { Label } from "@suhdo/ui/components/ui/label"
import { ButtonSpinner, LoadingState, LoaderTrace } from "@suhdo/ui/components/ui/loading-state"
import { ScrollArea } from "@suhdo/ui/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@suhdo/ui/components/ui/select"
import { Separator } from "@suhdo/ui/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@suhdo/ui/components/ui/sheet"
import { Skeleton } from "@suhdo/ui/components/ui/skeleton"
import { Switch } from "@suhdo/ui/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@suhdo/ui/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@suhdo/ui/components/ui/tabs"
import { Textarea } from "@suhdo/ui/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@suhdo/ui/components/ui/tooltip"

const tokens = [
  ["Primary", "var(--primary)"],
  ["Background", "var(--background)"],
  ["Card", "var(--card)"],
  ["Muted", "var(--muted)"],
  ["Success", "var(--success)"],
  ["Warning", "var(--warning)"],
  ["Info", "var(--info)"],
  ["Destructive", "var(--destructive)"],
] as const

type Workspace = {
  id: string
  name: string
  product: string
  status: "Ativo" | "Revisao" | "Rascunho"
  members: number
  updated: string
}

const workspaces: Workspace[] = [
  { id: "1", name: "Hydrogen", product: "CMS", status: "Ativo", members: 12, updated: "Hoje, 14:32" },
  { id: "2", name: "Krona", product: "Timesheet", status: "Ativo", members: 8, updated: "Hoje, 11:08" },
  { id: "3", name: "Quanta", product: "Video", status: "Revisao", members: 5, updated: "Ontem, 18:41" },
  { id: "4", name: "3AS", product: "Identity", status: "Ativo", members: 16, updated: "Ontem, 16:20" },
  { id: "5", name: "Meter", product: "Analytics", status: "Rascunho", members: 3, updated: "12 set, 09:15" },
  { id: "6", name: "Atlas", product: "Operations", status: "Revisao", members: 7, updated: "10 set, 17:02" },
  { id: "7", name: "Signal", product: "Messaging", status: "Ativo", members: 9, updated: "8 set, 13:47" },
]

const statusVariant = {
  Ativo: "success",
  Revisao: "warning",
  Rascunho: "secondary",
} as const

const workspaceColumns: DataListColumn<Workspace>[] = [
  {
    id: "name",
    header: "Workspace",
    role: "primary",
    cell: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.product}</p></div>,
  },
  { id: "status", header: "Status", role: "meta", hideHeaderInCard: true, cell: (row) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge> },
  { id: "members", header: "Membros", role: "meta", hideBelow: "md", cell: (row) => <span className="tabular-nums">{row.members}</span> },
  { id: "updated", header: "Atualizado", role: "meta", hideBelow: "lg", cell: (row) => <span className="text-muted-foreground">{row.updated}</span> },
  { id: "actions", role: "actions", className: "w-12 text-right", cell: () => <Button variant="ghost" size="icon-sm" aria-label="Acoes do workspace"><MoreHorizontal /></Button> },
]

const trafficData = [
  { label: "08 set", sessions: 11200, conversions: 1800 },
  { label: "09 set", sessions: 12800, conversions: 2200 },
  { label: "10 set", sessions: 12100, conversions: 2100 },
  { label: "11 set", sessions: 14900, conversions: 2800 },
  { label: "12 set", sessions: 15700, conversions: 3100 },
  { label: "13 set", sessions: 17100, conversions: 3400 },
  { label: "14 set", sessions: 18400, conversions: 3900 },
]

const buildData = [
  { label: "Hydrogen", approved: 42, failed: 3 },
  { label: "Krona", approved: 31, failed: 5 },
  { label: "Quanta", approved: 24, failed: 2 },
  { label: "OIDC", approved: 38, failed: 1 },
]

const initialAssets: FileAsset[] = [
  { id: "asset-1", name: "produto-capa.svg", kind: "image", previewUrl: preview("Hydrogen", "#0f766e", "#22c55e"), mime: "image/svg+xml", size: 82400, width: 1600, height: 900, alt: "Interface do produto Hydrogen" },
  { id: "asset-2", name: "operacao-noturna.svg", kind: "image", previewUrl: preview("Operations", "#1e293b", "#7c3aed"), mime: "image/svg+xml", size: 126300, width: 1600, height: 900 },
  { id: "asset-3", name: "guia-de-marca.pdf", kind: "document", mime: "application/pdf", size: 2400000, uploadedBy: "Ana Martins" },
  { id: "asset-4", name: "demo-produto.mp4", kind: "video", mime: "video/mp4", size: 18600000, width: 1920, height: 1080 },
  { id: "asset-5", name: "icone-suhdo.svg", kind: "svg", previewUrl: preview("S", "#052e2b", "#14b8a6"), mime: "image/svg+xml", size: 12900, width: 512, height: 512 },
]

function preview(label: string, from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><linearGradient id="g"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><circle cx="650" cy="70" r="180" fill="white" opacity=".08"/><text x="48" y="390" fill="white" font-family="sans-serif" font-size="52" font-weight="700">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function Specimen({
  title,
  description,
  children,
  className,
}: {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function DemoButton({ variant, label }: { variant: NonNullable<ButtonProps["variant"]>; label: string }) {
  return <Button variant={variant}>{variant === "default" ? <Sparkles /> : null}{label}</Button>
}

function ConfirmAction() {
  const confirm = useConfirm()
  return <Button variant="outline" onClick={() => void confirm({ title: "Descartar alteracoes?", description: "Esta acao fecha o editor e remove os dados ainda nao salvos.", confirmLabel: "Descartar", danger: true })}>Confirmacao global</Button>
}

export function Showcase() {
  const [notifications, setNotifications] = React.useState(true)
  const [terms, setTerms] = React.useState(true)
  const [compact, setCompact] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [mediaAssets, setMediaAssets] = React.useState(initialAssets)
  const [selectedAssets, setSelectedAssets] = React.useState<FileAsset[]>([])

  function simulateSave() {
    setBusy(true)
    window.setTimeout(() => setBusy(false), 1100)
  }

  return (
    <AppPage className="space-y-12 pb-20">
        <AppPageHeader title="UI Blueprint" actions={<Button size="sm" asChild><Link href="/pages"><FileText />Ver paginas</Link></Button>} />
        <AppPageIntro
          eyebrow="Referencia viva"
          title="Uma linguagem para todos os produtos Suhdo"
          description="Tokens, componentes e padroes de aplicacao consumidos pelo mesmo blueprint que o CLI instala. Troque o tema, reduza a viewport e interaja com cada estado."
          icon={<Boxes className="size-5" />}
          badge={<Badge variant="success">v0.1.0</Badge>}
          meta={<><span>React 19</span><span aria-hidden="true">/</span><span>Tailwind CSS 4</span><span aria-hidden="true">/</span><span>Radix UI</span></>}
          actions={<Button variant="outline" asChild><a href="#contract"><Code2 />Ver contrato</a></Button>}
        />

        <AppPageStats>
          <AppStatCard label="Componentes" value="38" description="Primitivos e padroes" icon={<Component className="size-5" />} />
          <AppStatCard label="Temas" value="3" description="Claro, escuro, sistema" icon={<Palette className="size-5" />} />
          <AppStatCard label="Breakpoints" value="3" description="375 / 768 / 1440" icon={<Gauge className="size-5" />} />
          <AppStatCard label="Contrato" value="1" description="Uma fonte normativa" icon={<ShieldCheck className="size-5" />} />
        </AppPageStats>

        <section id="foundations" className="scroll-mt-24 space-y-5">
          <AppSectionHeader title="Fundamentos" description="Cor semantica, tipografia e geometria compartilhadas entre os aplicativos." actions={<Badge variant="outline">@suhdo/theme</Badge>} />
          <div id="tokens" className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Specimen title="Tokens de cor" description="Os mesmos papeis preservam significado nos dois temas.">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {tokens.map(([label, value]) => (
                  <div key={label} className="overflow-hidden rounded-lg border border-border">
                    <div className="h-16" style={{ background: value }} />
                    <div className="bg-card p-2.5"><p className="text-xs font-medium">{label}</p><code className="text-[10px] text-muted-foreground">--{label.toLowerCase()}</code></div>
                  </div>
                ))}
              </div>
            </Specimen>
            <Specimen title="Tipografia" description="Jost para produto, Geist Mono para informacao tecnica.">
              <div className="space-y-5">
                <div><span className="text-label-caps text-muted-foreground">Headline large</span><p className="text-headline-lg mt-1">Criar com clareza.</p></div>
                <div><span className="text-label-caps text-muted-foreground">Headline medium</span><p className="text-headline-md mt-1">Decisoes que escalam.</p></div>
                <p className="text-body-base text-muted-foreground">A densidade favorece produtos operacionais sem perder hierarquia ou legibilidade.</p>
                <code className="block rounded-md bg-muted p-3 font-mono text-xs">org_id: suhdo-labs / latency: 42ms</code>
              </div>
            </Specimen>
          </div>
        </section>

        <section id="components" className="scroll-mt-24 space-y-5">
          <AppSectionHeader title="Acoes e entrada" description="Estados previsiveis, foco visivel e densidade consistente." />
          <div className="grid gap-4 xl:grid-cols-2">
            <Specimen title="Botoes" description="Variantes expressam hierarquia, nao decoracao.">
              <div className="flex flex-wrap items-center gap-2">
                <DemoButton variant="default" label="Primario" />
                <DemoButton variant="secondary" label="Secundario" />
                <DemoButton variant="outline" label="Outline" />
                <DemoButton variant="ghost" label="Ghost" />
                <DemoButton variant="destructive" label="Destrutivo" />
                <DemoButton variant="link" label="Link" />
              </div>
              <Separator className="my-5" />
              <div className="flex flex-wrap items-center gap-2">
                <Button size="xs">Extra small</Button><Button size="sm">Small</Button><Button>Default</Button><Button size="lg">Large</Button>
                <Button variant="outline" disabled>Desabilitado</Button>
                <Button onClick={simulateSave} disabled={busy}><ButtonSpinner busy={busy} icon={Save} />{busy ? "Salvando" : "Salvar"}</Button>
              </div>
            </Specimen>

            <Specimen title="Badges" description="Status sempre usa nome e cor semantica.">
              <div className="flex flex-wrap gap-2">
                <Badge>Primary</Badge><Badge variant="secondary">Neutral</Badge><Badge variant="success"><Check />Publicado</Badge><Badge variant="warning">Atencao</Badge><Badge variant="info">Informacao</Badge><Badge variant="destructive">Falha</Badge><Badge variant="outline">Outline</Badge>
              </div>
              <Separator className="my-5" />
              <div className="flex items-center gap-4">
                <Avatar size="lg"><AvatarFallback>NS</AvatarFallback><AvatarBadge /></Avatar>
                <AvatarGroup><Avatar><AvatarFallback>AM</AvatarFallback></Avatar><Avatar><AvatarFallback>JV</AvatarFallback></Avatar><Avatar><AvatarFallback>LP</AvatarFallback></Avatar></AvatarGroup>
                <div><p className="text-sm font-medium">Equipe do produto</p><p className="text-xs text-muted-foreground">3 pessoas online</p></div>
              </div>
            </Specimen>

            <Specimen title="Campos" description="Labels explicitos e mensagens objetivas.">
              <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
                <div className="grid gap-2"><Label htmlFor="name">Nome do projeto</Label><Input id="name" defaultValue="Suhdo Blueprint" /></div>
                <div className="grid gap-2"><Label htmlFor="email">E-mail de contato</Label><Input id="email" type="email" placeholder="produto@suhdo.com" /></div>
                <div className="grid gap-2"><Label htmlFor="description">Descricao</Label><Textarea id="description" placeholder="Como este produto ajuda o usuario?" /></div>
                <div className="grid gap-2"><Label htmlFor="environment">Ambiente</Label><Select defaultValue="production"><SelectTrigger id="environment" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="development">Desenvolvimento</SelectItem><SelectItem value="staging">Homologacao</SelectItem><SelectItem value="production">Producao</SelectItem></SelectContent></Select></div>
              </form>
            </Specimen>

            <Specimen title="Escolhas" description="Controles mantem seu estado reconhecivel nos temas.">
              <div className="space-y-4">
                <label className="flex items-start gap-3 rounded-lg border border-border p-3"><Checkbox checked={terms} onCheckedChange={(value: boolean | "indeterminate") => setTerms(value === true)} /><span><span className="block text-sm font-medium">Seguir contrato da UI</span><span className="block text-xs leading-5 text-muted-foreground">Evita tokens e componentes paralelos.</span></span></label>
                <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"><span><span className="block text-sm font-medium">Notificacoes</span><span className="block text-xs text-muted-foreground">Avisar quando uma versao for publicada.</span></span><Switch checked={notifications} onCheckedChange={setNotifications} /></label>
                <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"><span><span className="block text-sm font-medium">Densidade compacta</span><span className="block text-xs text-muted-foreground">Reduz espaco em telas operacionais.</span></span><Switch checked={compact} onCheckedChange={setCompact} /></label>
              </div>
            </Specimen>
          </div>
        </section>

        <section className="space-y-5">
          <AppSectionHeader title="Navegacao e overlays" description="Radix cuida de foco, teclado, Escape e portais." />
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <Specimen title="Tabs e menu" description="Navegacao local e acoes contextuais.">
              <Tabs defaultValue="overview">
                <TabsList><TabsTrigger value="overview">Resumo</TabsTrigger><TabsTrigger value="activity">Atividade</TabsTrigger><TabsTrigger value="settings">Ajustes</TabsTrigger></TabsList>
                <TabsContent value="overview" className="rounded-lg border border-border bg-muted/25 p-4 text-sm text-muted-foreground">Componentes prontos para fluxos de produto, nao apenas para landing pages.</TabsContent>
                <TabsContent value="activity" className="rounded-lg border border-border bg-muted/25 p-4 text-sm text-muted-foreground">12 componentes revisados nesta versao.</TabsContent>
                <TabsContent value="settings" className="rounded-lg border border-border bg-muted/25 p-4 text-sm text-muted-foreground">Tema e densidade continuam preferencias do aplicativo.</TabsContent>
              </Tabs>
              <div className="mt-4 flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline">Opcoes <MoreHorizontal /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent><DropdownMenuLabel>Visualizacao</DropdownMenuLabel><DropdownMenuCheckboxItem checked={compact} onCheckedChange={(value: boolean) => setCompact(value)}>Modo compacto</DropdownMenuCheckboxItem><DropdownMenuSeparator /><DropdownMenuItem><Settings2 />Configurar<DropdownMenuShortcut>⌘,</DropdownMenuShortcut></DropdownMenuItem><DropdownMenuItem variant="destructive">Remover</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Ajuda"><Info /></Button></TooltipTrigger><TooltipContent>Leia docs/suhdo-ui.md</TooltipContent></Tooltip>
              </div>
            </Specimen>

            <Specimen title="Dialog e sheet" description="Modal para decisao; sheet para contexto lateral.">
              <div className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild><Button>Abrir dialog</Button></DialogTrigger>
                  <DialogContent><DialogHeader><DialogTitle>Publicar nova versao?</DialogTitle><DialogDescription>Os tokens e componentes atualizados ficarao disponiveis para os produtos Suhdo.</DialogDescription></DialogHeader><DialogBody><Alert variant="warning"><CircleAlert /><AlertTitle>Revise os breaking changes</AlertTitle><AlertDescription>Aplicativos com arquivos customizados serao preservados pelo CLI.</AlertDescription></Alert></DialogBody><DialogFooter><DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose><DialogClose asChild><Button>Publicar</Button></DialogClose></DialogFooter></DialogContent>
                </Dialog>
                <Sheet>
                  <SheetTrigger asChild><Button variant="outline">Abrir sheet</Button></SheetTrigger>
                  <SheetContent><SheetHeader><SheetTitle>Detalhes do token</SheetTitle><SheetDescription>Contrato usado em todos os produtos.</SheetDescription></SheetHeader><div className="space-y-4 px-4"><div className="h-28 rounded-lg bg-primary" /><div><p className="font-medium">Primary</p><code className="text-xs text-muted-foreground">hsl(160 84% 28%)</code></div><ProgressBar value={72} /></div><SheetFooter><Button>Copiar referencia</Button></SheetFooter></SheetContent>
                </Sheet>
                <ConfirmAction />
                <FilePickerDialog
                  assets={mediaAssets}
                  selectionMode="collection"
                  initialSelectedIds={selectedAssets.map((asset) => asset.id)}
                  onConfirm={setSelectedAssets}
                  onUpload={(files) => {
                    const created = files.map((file, index): FileAsset => ({
                      id: `upload-${Date.now()}-${index}`,
                      name: file.name,
                      kind: file.type.startsWith("image/") ? file.type === "image/svg+xml" ? "svg" : "image" : file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "document" : "other",
                      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
                      mime: file.type,
                      size: file.size,
                    }))
                    setMediaAssets((current) => [...created, ...current])
                    return created
                  }}
                >
                  <Button variant="outline"><ImagePlus />Biblioteca{selectedAssets.length ? ` (${selectedAssets.length})` : ""}</Button>
                </FilePickerDialog>
              </div>
              <ScrollArea className="mt-5 h-32 rounded-lg border border-border">
                <div className="space-y-1 p-2">
                  {["AppShell", "AppPage", "DataList", "MetricCard", "LoadingState", "ThemeProvider"].map((item) => <div key={item} className="rounded-md px-2 py-2 text-sm hover:bg-muted">{item}<code className="float-right text-xs text-muted-foreground">component</code></div>)}
                </div>
              </ScrollArea>
            </Specimen>
          </div>
        </section>

        <section className="space-y-5">
          <AppSectionHeader title="Feedback e estados" description="Cada fluxo explicita sucesso, risco, falha e espera." />
          <div className="grid gap-4 lg:grid-cols-2">
            <Specimen title="Alertas" description="Cor semantica acompanha iconografia e texto.">
              <div className="grid gap-3">
                <Alert variant="success"><Check /><AlertTitle>Deploy concluido</AlertTitle><AlertDescription>A versao 0.1.0 esta disponivel.</AlertDescription></Alert>
                <Alert variant="info"><Info /><AlertTitle>Contexto atualizado</AlertTitle><AlertDescription>O agente agora conhece o contrato da UI.</AlertDescription></Alert>
                <Alert variant="warning"><CircleAlert /><AlertTitle>Arquivo customizado</AlertTitle><AlertDescription>O CLI preservou sua alteracao local.</AlertDescription></Alert>
                <Alert variant="destructive"><CircleAlert /><AlertTitle>Falha no build</AlertTitle><AlertDescription>Revise imports e dependencias.</AlertDescription></Alert>
              </div>
            </Specimen>
            <Specimen title="Loading e skeleton" description="Trace para regioes; spinner somente dentro de acoes.">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid min-h-40 place-items-center rounded-lg border border-border bg-muted/20"><LoadingState message="Sincronizando tokens..." /></div>
                <div className="space-y-4 rounded-lg border border-border p-4"><div className="flex items-center gap-3"><Skeleton className="size-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-1/2" /></div></div><Skeleton className="h-20 w-full" /><div className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderTrace size="sm" />Carregamento compacto</div></div>
              </div>
            </Specimen>
          </div>
        </section>

        <section id="data" className="scroll-mt-24 space-y-5">
          <AppSectionHeader title="Metricas e dados" description="Visualizacoes preservam matiz entre temas e sempre apresentam contexto textual." />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Sessoes" value="18.4k" delta={<DeltaBadge value={12.4} />} sublabel="ultimos 30 dias" chart={<Sparkline data={[8, 12, 10, 16, 15, 22, 24, 21, 29]} label="Sessoes" />} />
            <MetricCard label="Builds" value="284" delta={<DeltaBadge value={4.8} />} sublabel="93% aprovados" chart={<MiniBars data={[4, 8, 5, 12, 9, 14, 11, 16]} label="Builds" />} />
            <MetricCard label="Uso mensal" value="72%" sublabel="36 de 50 mil" chart={<div className="flex w-full items-end pb-2"><ProgressBar value={72} accent="amber" /></div>} />
            <MetricCard label="Produtos" value="6" delta={<DeltaBadge value={-2.1} />} sublabel="4 em producao" chart={<DonutChart segments={[{ key: "live", label: "Producao", value: 4, color: "var(--chart-1)" }, { key: "review", label: "Revisao", value: 2, color: "var(--chart-3)" }]} />} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartPanel
              title="Aquisicao por dia"
              description="Sessoes e conversoes nos ultimos sete dias"
              table={{ columns: [{ key: "label", label: "Data" }, { key: "sessions", label: "Sessoes" }, { key: "conversions", label: "Conversoes" }], rows: trafficData }}
            >
              <TimeSeriesChart data={trafficData} series={[{ key: "sessions", label: "Sessoes" }, { key: "conversions", label: "Conversoes" }]} ariaLabel="Grafico de sessoes e conversoes entre 8 e 14 de setembro" />
            </ChartPanel>
            <ChartPanel
              title="Builds por produto"
              description="Resultado das pipelines na semana"
              table={{ columns: [{ key: "label", label: "Produto" }, { key: "approved", label: "Aprovados" }, { key: "failed", label: "Falhos" }], rows: buildData }}
            >
              <CategoryBarChart data={buildData} series={[{ key: "approved", label: "Aprovados", color: "var(--chart-1)" }, { key: "failed", label: "Falhos", color: "var(--chart-5)" }]} ariaLabel="Grafico de builds aprovados e falhos por produto" />
            </ChartPanel>
            <ChartPanel
              title="Distribuicao de consumo"
              description="Participacao por familia de produto"
              className="xl:col-span-2"
              table={{ columns: [{ key: "label", label: "Familia" }, { key: "value", label: "Consumo" }], rows: [{ label: "Conteudo", value: 46 }, { label: "Identidade", value: 28 }, { label: "Analytics", value: 17 }, { label: "Outros", value: 9 }] }}
            >
              <DonutBreakdownChart data={[{ key: "content", label: "Conteudo", value: 46 }, { key: "identity", label: "Identidade", value: 28 }, { key: "analytics", label: "Analytics", value: 17 }, { key: "other", label: "Outros", value: 9 }]} ariaLabel="Grafico de distribuicao percentual de consumo por familia" centerLabel="percentual" valueFormatter={(value) => `${value}%`} />
            </ChartPanel>
          </div>

          <section className="space-y-3" aria-labelledby="data-list-title">
            <div><h3 id="data-list-title" className="text-sm font-semibold">DataList responsiva</h3><p className="mt-0.5 text-xs text-muted-foreground">Ocupa a largura disponivel, vira cards no mobile e permite alternar a visualizacao no desktop.</p></div>
            <DataList
              data={workspaces}
              columns={workspaceColumns}
              getRowId={(row) => row.id}
              getRowLabel={(row) => row.name}
              getSearchText={(row) => `${row.name} ${row.product} ${row.status}`}
              searchPlaceholder="Buscar workspace"
              caption="Workspaces"
              filters={[{ id: "status", label: "Filtrar por status", options: [{ label: "Todos", value: "all" }, { label: "Ativos", value: "Ativo" }, { label: "Em revisao", value: "Revisao" }, { label: "Rascunhos", value: "Rascunho" }], predicate: (row, value) => row.status === value }]}
              pageSize={5}
            />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Specimen title="Tabela compacta" description="Semantica nativa para dados estritamente tabulares.">
              <Table><TableHeader><TableRow><TableHead>Servico</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Latencia</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell className="font-medium">OIDC</TableCell><TableCell><Badge variant="success">Operacional</Badge></TableCell><TableCell className="text-right font-mono">42ms</TableCell></TableRow><TableRow><TableCell className="font-medium">Registry</TableCell><TableCell><Badge variant="success">Operacional</Badge></TableCell><TableCell className="text-right font-mono">68ms</TableCell></TableRow><TableRow><TableCell className="font-medium">Showcase</TableCell><TableCell><Badge variant="warning">Build</Badge></TableCell><TableCell className="text-right font-mono">--</TableCell></TableRow></TableBody></Table>
            </Specimen>
            <AppEmptyState icon={<Mail className="size-6" />} title="Nenhum convite pendente" description="Quando alguem for convidado para este workspace, o status aparecera aqui." action={<Button variant="outline"><Users />Convidar pessoa</Button>} />
          </div>
        </section>

        <section id="contract" className="scroll-mt-24">
          <Card className="overflow-hidden border-primary/25 bg-primary/[0.035]">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" />Contrato instalado junto do codigo</CardTitle><CardDescription>O comando adiciona `docs/suhdo-ui.md`, referencia o arquivo nas instrucoes do agente e nunca toca no fluxo do 3AS.</CardDescription><CardAction><Badge variant="success">Contexto ativo</Badge></CardAction></CardHeader>
            <CardContent><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-border bg-card p-4"><FileText className="mb-3 size-5 text-primary" /><p className="text-sm font-medium">Normativo</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Tokens, componentes e checklist em uma fonte.</p></div><div className="rounded-lg border border-border bg-card p-4"><Activity className="mb-3 size-5 text-primary" /><p className="text-sm font-medium">Atualizavel</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Hashes preservam customizacoes do produto.</p></div><div className="rounded-lg border border-border bg-card p-4"><Clock3 className="mb-3 size-5 text-primary" /><p className="text-sm font-medium">Repetivel</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Execucoes idempotentes sem duplicar contexto.</p></div></div></CardContent>
            <CardFooter className="border-t border-border pt-5"><code className="rounded-md bg-muted px-3 py-2 font-mono text-xs">npx @suhdo/ui-blueprint</code></CardFooter>
          </Card>
        </section>
    </AppPage>
  )
}
