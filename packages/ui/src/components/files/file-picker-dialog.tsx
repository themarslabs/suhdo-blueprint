"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check, FileStack, ImagePlus, Library, Trash2, Upload } from "lucide-react"

import { DataList, type DataListColumn, type DataListFilter } from "@/components/app/data-list"
import { FileDropzone } from "@/components/files/file-dropzone"
import { FileTile, formatFileSize, type FileAsset, type FileAssetKind } from "@/components/files/file-tile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  title = "Biblioteca de arquivos",
  description,
  confirmLabel = selectionMode === "single" ? "Usar arquivo" : "Adicionar",
  onUpload,
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

  function choose(asset: FileAsset) {
    if (multiple) toggle(asset)
    else setDetails(asset)
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
      cell: (asset) => <Button size="sm" variant={selectedIds.includes(asset.id) ? "default" : "outline"} onClick={() => choose(asset)}>{selectedIds.includes(asset.id) ? <Check /> : null}{multiple ? selectedIds.includes(asset.id) ? "Selecionado" : "Selecionar" : "Detalhes"}</Button>,
    },
  ]

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
        <DialogContent size="full" className="z-[10000]" overlayClassName="z-[9999]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description ?? (selectionMode === "collection" ? "Envie ou selecione arquivos e organize a colecao antes de confirmar." : multiple ? "Selecione um ou mais arquivos da biblioteca." : "Envie um arquivo novo ou escolha um da biblioteca.")}</DialogDescription>
          </DialogHeader>

          <Tabs value={tab} onValueChange={(value) => setTab(value as PickerTab)} className="flex min-h-0 flex-1 gap-0">
            <div className="shrink-0 border-b border-border px-4 py-2">
              <TabsList>
                <TabsTrigger value="upload"><Upload />Enviar</TabsTrigger>
                <TabsTrigger value="library"><Library />Biblioteca</TabsTrigger>
                {multiple ? <TabsTrigger value="selection"><FileStack />{selectionMode === "collection" ? "Colecao" : "Selecao"}{selectedIds.length ? ` (${selectedIds.length})` : ""}</TabsTrigger> : null}
              </TabsList>
            </div>

            <TabsContent value="upload" className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              <FileDropzone accept={accept} uploading={uploading} disabled={!onUpload} onFiles={uploadFiles} />
            </TabsContent>

            <TabsContent value="library" className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              <DataList
                data={visibleAssets}
                columns={columns}
                getRowId={(asset) => asset.id}
                getSearchText={(asset) => `${asset.name} ${asset.mime ?? ""} ${KIND_LABEL[asset.kind]}`}
                searchPlaceholder="Buscar arquivos..."
                defaultView="cards"
                cardMinWidth={170}
                filters={filters}
                controlled={loading ? { loading: true } : undefined}
                pageSize={12}
                emptyState="Nenhum arquivo. Envie o primeiro pela aba Enviar."
                renderCard={(asset) => (
                  <FileTile asset={asset} selected={selectedIds.includes(asset.id)} onSelect={() => choose(asset)}>
                    {multiple ? <span className={cn("absolute top-2 left-2 grid size-6 place-items-center rounded-full border-2 shadow-sm", selectedIds.includes(asset.id) ? "border-primary bg-primary text-primary-foreground" : "border-white/85 bg-black/35 text-white")}>{selectedIds.includes(asset.id) ? <Check className="size-3.5" /> : null}</span> : null}
                  </FileTile>
                )}
              />
              {multiple ? (
                <div className="sticky bottom-0 mt-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/94 px-4 py-3 shadow-lg backdrop-blur-md">
                  <span className="text-sm text-muted-foreground tabular-nums">{selectedIds.length} selecionado{selectedIds.length === 1 ? "" : "s"}</span>
                  <div className="flex gap-2"><Button variant="outline" disabled={!selectedIds.length} onClick={() => setTab("selection")}>Revisar</Button><Button disabled={!selectedIds.length} onClick={() => confirmSelection()}>{confirmLabel} ({selectedIds.length})</Button></div>
                </div>
              ) : null}
            </TabsContent>

            {multiple ? (
              <TabsContent value="selection" className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4">
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
        actionLabel={multiple ? selectedIds.includes(details?.id ?? "") ? "Remover da selecao" : "Adicionar a selecao" : confirmLabel}
        onAction={details ? () => { if (multiple) { toggle(details); setDetails(null) } else confirmSelection([details]) } : undefined}
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
  onOpenChange,
}: {
  asset: FileAsset | null
  nested?: boolean
  actionLabel?: string
  onAction?: () => void
  onOpenChange: (open: boolean) => void
}) {
  if (!asset) return null
  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("w-full gap-0 overflow-y-auto p-0 sm:max-w-md", nested && "z-[10002]")} overlayClassName={nested ? "z-[10001]" : undefined}>
        <SheetHeader><SheetTitle>Detalhes do arquivo</SheetTitle><SheetDescription>Metadados e visualizacao do item selecionado.</SheetDescription></SheetHeader>
        <div className="flex min-h-52 items-center justify-center border-b border-border bg-muted/20 p-4">
          {asset.kind === "video" && asset.url ? <video src={asset.url} controls className="max-h-72 w-full rounded-md" /> : (asset.kind === "image" || asset.kind === "svg") && (asset.previewUrl || asset.url) ? <img src={asset.previewUrl || asset.url} alt={asset.alt ?? asset.name} className="max-h-72 w-auto rounded-md object-contain" /> : <FileStack className="size-12 text-muted-foreground/50" />}
        </div>
        <div className="space-y-5 p-5">
          {onAction ? <Button className="w-full" onClick={onAction}><Check />{actionLabel}</Button> : null}
          <dl className="space-y-2 text-xs">
            <Metadata label="Nome" value={asset.name} mono />
            <Metadata label="Tipo" value={asset.mime ?? KIND_LABEL[asset.kind]} />
            {typeof asset.size === "number" ? <Metadata label="Tamanho" value={formatFileSize(asset.size)} /> : null}
            {asset.width && asset.height ? <Metadata label="Dimensoes" value={`${asset.width} x ${asset.height} px`} /> : null}
            {asset.uploadedBy ? <Metadata label="Enviado por" value={asset.uploadedBy} /> : null}
          </dl>
          {asset.alt ? <div><p className="text-xs font-medium">Texto alternativo</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{asset.alt}</p></div> : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Metadata({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="flex justify-between gap-4"><dt className="shrink-0 text-muted-foreground">{label}</dt><dd className={cn("truncate text-right", mono && "font-mono")}>{value}</dd></div>
}
