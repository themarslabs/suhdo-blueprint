"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, FileStack, FileText, Film, ImageOff, ImagePlus, Library, Trash2, Upload } from "lucide-react"

import { DataList, type DataListColumn, type DataListFilter } from "@/components/app/data-list"
import { FileDropzone } from "@/components/files/file-dropzone"
import { FileTile, formatFileSize, type FileAsset, type FileAssetKind } from "@/components/files/file-tile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const KIND_LABEL: Record<FileAssetKind, string> = {
  image: "Imagem",
  svg: "SVG",
  video: "Video",
  document: "Documento",
  other: "Outro",
}

type PickerTab = "upload" | "library" | "selection"

export type FilePickerDialogProps = {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  assets: FileAsset[]
  loading?: boolean
  uploading?: boolean
  accept?: string
  kinds?: FileAssetKind[]
  selectionMode?: "single" | "multiple" | "collection"
  initialSelectedIds?: string[]
  title?: string
  description?: string
  confirmLabel?: string
  onUpload?: (files: File[]) => void | FileAsset[] | Promise<void | FileAsset[]>
  onDelete?: (asset: FileAsset) => void | Promise<void>
  onConfirm: (assets: FileAsset[]) => void
}

export function FilePickerDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  assets,
  loading = false,
  uploading,
  accept = "image/*,video/*,.pdf,.doc,.docx",
  kinds,
  selectionMode = "single",
  initialSelectedIds = [],
  title = "Biblioteca de mídia",
  description,
  confirmLabel = selectionMode === "single" ? "Usar arquivo" : "Adicionar",
  onUpload,
  onDelete,
  onConfirm,
}: FilePickerDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const [tab, setTab] = React.useState<PickerTab>("library")
  const [selectedIds, setSelectedIds] = React.useState<string[]>(initialSelectedIds)
  const [details, setDetails] = React.useState<FileAsset | null>(null)
  const multiple = selectionMode !== "single"

  React.useEffect(() => {
    if (!open) return
    setSelectedIds(initialSelectedIds)
    setTab(initialSelectedIds.length && multiple ? "selection" : "library")
  }, [open])

  function setOpen(next: boolean) {
    setInternalOpen(next)
    onOpenChange?.(next)
    if (!next) setDetails(null)
  }

  function toggle(asset: FileAsset) {
    setSelectedIds((current) => current.includes(asset.id) ? current.filter((id) => id !== asset.id) : [...current, asset.id])
  }

  function confirmSelection(chosen?: FileAsset[]) {
    const selected = chosen ?? selectedIds.map((id) => assets.find((asset) => asset.id === id)).filter((asset): asset is FileAsset => Boolean(asset))
    if (!selected.length) return
    onConfirm(selected)
    setOpen(false)
  }

  async function uploadFiles(files: File[]) {
    const created = await onUpload?.(files)
    if (created?.length) {
      setSelectedIds((current) => [...current, ...created.map((asset) => asset.id).filter((id) => !current.includes(id))])
      setTab(multiple ? "selection" : "library")
    } else {
      setTab("library")
    }
  }

  const visibleAssets = kinds?.length ? assets.filter((asset) => kinds.includes(asset.kind)) : assets
  const selectedAssets = selectedIds.map((id) => assets.find((asset) => asset.id === id)).filter((asset): asset is FileAsset => Boolean(asset))
  const filters: DataListFilter<FileAsset>[] = kinds && new Set(kinds.map((kind) => kind === "svg" ? "image" : kind)).size <= 1 ? [] : [{
    id: "kind",
    label: "Tipo de arquivo",
    options: [
      { label: "Tipo: todos", value: "all" },
      { label: "Imagens", value: "image" },
      { label: "Videos", value: "video" },
      { label: "Documentos", value: "document" },
    ],
    predicate: (asset, value) => value === "image" ? asset.kind === "image" || asset.kind === "svg" : asset.kind === value,
  }]
  const tabsNavigation = (
    <TabsList className="shrink-0">
      <TabsTrigger value="upload"><Upload className="size-3.5" />Enviar</TabsTrigger>
      <TabsTrigger value="library"><Library className="size-3.5" />Biblioteca</TabsTrigger>
      {multiple ? <TabsTrigger value="selection"><FileStack className="size-3.5" />{selectionMode === "collection" ? "Coleção" : "Seleção"}{selectedIds.length ? ` (${selectedIds.length})` : ""}</TabsTrigger> : null}
    </TabsList>
  )
  const columns: DataListColumn<FileAsset>[] = [
    {
      id: "preview",
      role: "media",
      className: "w-16",
      cell: (asset) => <FileThumb asset={asset} />,
    },
    {
      id: "name",
      header: "Arquivo",
      role: "primary",
      cell: (asset) => <button type="button" className="min-w-0 text-left" onClick={() => setDetails(asset)}><span className="block truncate font-medium hover:underline">{asset.name}</span><span className="block truncate font-mono text-xs text-muted-foreground">{asset.mime ?? KIND_LABEL[asset.kind]}{asset.size ? ` / ${formatFileSize(asset.size)}` : ""}</span></button>,
    },
    {
      id: "kind",
      header: "Tipo",
      role: "meta",
      hideBelow: "md",
      hideHeaderInCard: true,
      className: "w-32",
      cell: (asset) => <Badge variant="secondary">{KIND_LABEL[asset.kind]}</Badge>,
    },
    {
      id: "action",
      role: "actions",
      className: "w-28 text-right",
      cell: (asset) => <Button size="sm" variant="outline" onClick={() => setDetails(asset)}>Detalhes</Button>,
    },
  ]

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
        <DialogContent size="full" className="z-[10000] flex !h-[92vh] !w-[96vw] !max-w-[96vw] flex-col gap-4 p-6 sm:!h-[92vh] sm:!max-w-[96vw]" overlayClassName="z-[9999] bg-black/55 backdrop-blur-[2px]">
          <DialogHeader className="border-0 p-0 pr-10">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description ?? (selectionMode === "collection" ? "Envie ou selecione arquivos para montar a coleção." : "Envie um arquivo novo ou escolha um da biblioteca.")}</DialogDescription>
          </DialogHeader>

          <Tabs value={tab} onValueChange={(value) => setTab(value as PickerTab)} className="flex min-h-0 flex-1 flex-col gap-3">
            {tab === "library" ? null : tabsNavigation}

            <TabsContent value="upload" className="min-h-0 flex-1 overflow-y-auto">
              <FileDropzone accept={accept} uploading={uploading} disabled={!onUpload} onFiles={uploadFiles} />
            </TabsContent>

            <TabsContent value="library" className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <DataList
                className="min-h-0 flex-1"
                data={visibleAssets}
                columns={columns}
                getRowId={(asset) => asset.id}
                getSearchText={(asset) => `${asset.name} ${asset.mime ?? ""} ${KIND_LABEL[asset.kind]}`}
                searchPlaceholder="Buscar arquivos..."
                searchWidth="compact"
                toolbarLeading={tabsNavigation}
                defaultView="cards"
                cardMinWidth={170}
                cardHeight={190}
                cardsSurface
                filters={filters}
                controlled={loading ? { loading: true } : undefined}
                pageSize={12}
                emptyState="Nenhum arquivo. Arraste aqui ou use “Enviar arquivo”."
                renderCard={(asset) => <FileTile asset={asset} selected={selectedIds.includes(asset.id)} onSelect={() => setDetails(asset)} />}
              />
              {multiple ? (
                <div className="mt-3 flex shrink-0 items-center justify-between gap-3 border-t border-border px-1 pt-3">
                  <span className="text-sm text-muted-foreground tabular-nums">{selectedIds.length} selecionado{selectedIds.length === 1 ? "" : "s"}</span>
                  <div className="flex gap-2"><Button variant="outline" disabled={!selectedIds.length} onClick={() => setTab("selection")}>Revisar</Button><Button disabled={!selectedIds.length} onClick={() => confirmSelection()}>{confirmLabel} ({selectedIds.length})</Button></div>
                </div>
              ) : null}
            </TabsContent>

            {multiple ? (
              <TabsContent value="selection" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {selectedAssets.length ? (
                  <>
                    <div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{selectionMode === "collection" ? "Use as setas para ordenar a colecao." : "Revise os arquivos antes de adicionar."}</p><Button variant="outline" size="sm" onClick={() => setTab("library")}><ImagePlus />Adicionar mais</Button></div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,170px),1fr))] gap-3">
                      {selectedAssets.map((asset, index) => (
                        <FileTile key={asset.id} asset={asset} onSelect={() => setDetails(asset)}>
                          <div className="absolute top-2 right-2 flex gap-1">
                            {selectionMode === "collection" ? <><Button variant="secondary" size="icon-sm" disabled={index === 0} onClick={() => setSelectedIds((current) => move(current, index, index - 1))} aria-label={`Mover ${asset.name} para tras`}><ArrowLeft /></Button><Button variant="secondary" size="icon-sm" disabled={index === selectedAssets.length - 1} onClick={() => setSelectedIds((current) => move(current, index, index + 1))} aria-label={`Mover ${asset.name} para frente`}><ArrowRight /></Button></> : null}
                            <Button variant="destructive" size="icon-sm" onClick={() => toggle(asset)} aria-label={`Remover ${asset.name} da selecao`}><Trash2 /></Button>
                          </div>
                          <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">{index + 1}</span>
                        </FileTile>
                      ))}
                    </div>
                    <div className="sticky bottom-0 mt-auto flex items-center justify-between gap-3 border-t border-border bg-background/95 pt-3 backdrop-blur-md"><span className="text-sm text-muted-foreground tabular-nums">{selectedAssets.length} {selectedAssets.length === 1 ? "item" : "itens"}</span><Button onClick={() => confirmSelection()}>{confirmLabel}</Button></div>
                  </>
                ) : (
                  <div className="grid h-full min-h-72 place-items-center text-center"><div><FileStack className="mx-auto mb-3 size-8 text-muted-foreground/60" /><p className="text-sm font-medium">A selecao esta vazia</p><p className="mt-1 text-xs text-muted-foreground">Escolha arquivos na biblioteca.</p><Button className="mt-4" variant="outline" onClick={() => setTab("library")}>Abrir biblioteca</Button></div></div>
                )}
              </TabsContent>
            ) : null}
          </Tabs>
        </DialogContent>
      </Dialog>

      <FileDetailsSheet
        asset={details}
        nested
        actionLabel={details && (details.kind === "image" || details.kind === "svg") ? "Usar imagem" : "Usar arquivo"}
        onAction={details ? () => { if (multiple) { if (!selectedIds.includes(details.id)) toggle(details); setDetails(null) } else confirmSelection([details]) } : undefined}
        onDelete={onDelete ? async (asset) => { await onDelete(asset); setDetails(null) } : undefined}
        onOpenChange={(next) => !next && setDetails(null)}
      />
    </>
  )
}

function move(values: string[], from: number, to: number) {
  const next = [...values]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function FileThumb({ asset }: { asset: FileAsset }) {
  const canPreview = asset.kind === "image" || asset.kind === "svg"
  return (
    <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
      {canPreview && (asset.previewUrl || asset.url) ? <img src={asset.previewUrl || asset.url} alt="" className="size-full object-cover" /> : <FileStack className="size-4 text-muted-foreground" />}
    </div>
  )
}

export function FileDetailsSheet({
  asset,
  nested = false,
  actionLabel,
  onAction,
  onDelete,
  onOpenChange,
}: {
  asset: FileAsset | null
  nested?: boolean
  actionLabel?: string
  onAction?: () => void
  onDelete?: (asset: FileAsset) => void | Promise<void>
  onOpenChange: (open: boolean) => void
}) {
  const [alt, setAlt] = React.useState("")
  const [caption, setCaption] = React.useState("")
  const [link, setLink] = React.useState("")
  const [size, setSize] = React.useState("original")

  React.useEffect(() => {
    setAlt(asset?.alt ?? "")
    setCaption(asset?.caption ?? "")
    setLink(asset?.link ?? "")
    setSize("original")
  }, [asset])

  if (!asset) return null
  const isImage = asset.kind === "image" || asset.kind === "svg"
  const Icon = asset.kind === "video" ? Film : asset.kind === "document" ? FileText : ImageOff
  const originalUrl = asset.url || asset.previewUrl || ""
  const sizeOptions = [{ key: "original", label: "Original", url: originalUrl }, ...(["large", "medium", "thumb", "icon"] as const).flatMap((key) => asset.variants?.[key] ? [{ key, label: { large: "Grande (1600px)", medium: "Média (768px)", thumb: "Miniatura (240px)", icon: "Ícone (64px)" }[key], url: asset.variants[key]! }] : [])]
  const selectedUrl = sizeOptions.find((option) => option.key === size)?.url ?? originalUrl
  const createdAt = asset.createdAt ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(asset.createdAt)) : null

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("w-full gap-0 overflow-y-auto p-0 sm:max-w-md", nested && "z-[10002]")} overlayClassName={nested ? "z-[10001]" : undefined}>
        <SheetHeader className="border-b border-border px-5 py-4"><SheetTitle>Detalhes do anexo</SheetTitle></SheetHeader>
        <div className="flex items-center justify-center border-b border-border bg-muted/20 p-4">
          {isImage && (asset.previewUrl || asset.url) ? <img src={asset.previewUrl || asset.url} alt={asset.alt ?? asset.name} className="max-h-64 w-auto rounded-md object-contain" /> : <div className="flex h-40 w-full items-center justify-center"><Icon className="size-12 text-muted-foreground/50" /></div>}
        </div>
        <div className="space-y-5 px-5 py-4">
          {onAction ? <Button type="button" className="w-full" onClick={onAction}><Check className="mr-2 size-4" />{actionLabel}</Button> : null}
          <dl className="space-y-1.5 text-xs">
            {createdAt ? <Metadata label="Upload feito em" value={createdAt} /> : null}
            {asset.uploadedBy ? <Metadata label="Enviado por" value={asset.uploadedBy} /> : null}
            <Metadata label="Nome do arquivo" value={asset.name} mono />
            {asset.mime ? <Metadata label="Tipo do arquivo" value={asset.mime} /> : null}
            {typeof asset.size === "number" ? <Metadata label="Tamanho" value={formatFileSize(asset.size)} /> : null}
            {asset.width && asset.height ? <Metadata label="Dimensões" value={`${asset.width} × ${asset.height} px`} /> : null}
          </dl>
          {isImage ? <div className="space-y-2"><Label htmlFor="file-alt" className="text-xs">Texto alternativo</Label><Input id="file-alt" value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Descreva a imagem (acessibilidade/SEO)" className="h-9" /></div> : null}
          <div className="space-y-2"><Label htmlFor="file-caption" className="text-xs">Legenda</Label><Textarea id="file-caption" value={caption} onChange={(event) => setCaption(event.target.value)} rows={2} placeholder="Legenda do arquivo..." className="resize-none" /></div>
          <div className="space-y-2"><Label htmlFor="file-link" className="text-xs">Link de destino</Label><Input id="file-link" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://…" className="h-9 font-mono text-xs" /><p className="text-[10px] leading-snug text-muted-foreground">Link padrão do arquivo — a galeria herda ao adicioná-lo, e pode trocar.</p></div>
          <div className="space-y-2"><Label className="text-xs">Copiar link</Label><div className="flex gap-2"><Select value={size} onValueChange={setSize}><SelectTrigger className="h-9 w-40 shrink-0"><SelectValue /></SelectTrigger><SelectContent>{sizeOptions.map((option) => <SelectItem key={option.key} value={option.key}>{option.label}</SelectItem>)}</SelectContent></Select><Button type="button" variant="secondary" className="shrink-0" onClick={() => navigator.clipboard?.writeText(selectedUrl)}><Copy className="mr-2 size-4" />Copiar</Button></div><Input readOnly value={selectedUrl} className="h-9 font-mono text-xs" /></div>
          <div className="flex items-center justify-between border-t border-border pt-4"><Button variant="ghost" size="sm" asChild className="text-muted-foreground"><a href={originalUrl} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 size-4" />Abrir original</a></Button>{onDelete ? <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(asset)}><Trash2 className="mr-2 size-4" />Excluir</Button> : null}</div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Metadata({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="flex justify-between gap-3"><dt className="shrink-0 text-muted-foreground">{label}</dt><dd className={cn("truncate text-right text-foreground", mono && "font-mono")}>{value}</dd></div>
}
