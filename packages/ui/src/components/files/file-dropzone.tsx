"use client"

import * as React from "react"
import { CircleAlert, Upload } from "lucide-react"

import { LoaderTrace } from "@/components/ui/loading-state"
import { cn } from "@/lib/utils"

export function FileDropzone({
  onFiles,
  accept,
  multiple = true,
  uploading: controlledUploading,
  disabled = false,
  title = "Arraste arquivos aqui",
  description = "ou clique para selecionar do seu dispositivo",
  onError,
  className,
}: {
  onFiles: (files: File[]) => void | Promise<void>
  accept?: string
  multiple?: boolean
  uploading?: boolean
  disabled?: boolean
  title?: string
  description?: string
  onError?: (error: unknown) => void
  className?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [internalUploading, setInternalUploading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const uploading = controlledUploading ?? internalUploading

  async function handle(files: FileList | null) {
    const selected = files ? Array.from(files) : []
    if (!selected.length || disabled || uploading) return
    setErrorMessage(null)
    if (controlledUploading === undefined) setInternalUploading(true)
    try {
      await onFiles(selected)
    } catch (error) {
      setErrorMessage(error instanceof Error && error.message ? error.message : "Nao foi possivel enviar os arquivos.")
      onError?.(error)
    } finally {
      if (controlledUploading === undefined) setInternalUploading(false)
    }
  }

  return (
    <div className={cn("flex h-full min-h-72 flex-col p-1", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || uploading}
        aria-busy={uploading}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && !uploading && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => { event.preventDefault(); setDragOver(false); void handle(event.dataTransfer.files) }}
        className={cn(
          "flex h-full min-h-72 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60",
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:border-foreground/30 hover:bg-muted/30",
        )}
      >
        {uploading ? (
          <><LoaderTrace size="lg" className="text-primary" /><span className="text-sm text-muted-foreground">Enviando arquivos...</span></>
        ) : (
          <>
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><Upload className="size-5" /></span>
            <span className="space-y-0.5"><span className="block text-sm font-medium text-foreground">{title}</span><span className="block text-xs text-muted-foreground">{description}</span></span>
            <span className="mt-1 inline-flex h-8 items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground">Selecionar arquivos</span>
            {accept ? <span className="max-w-sm text-[10px] text-muted-foreground">Formatos aceitos: {accept}</span> : null}
          </>
        )}
      </div>
      {errorMessage ? <p role="alert" className="mt-2 flex items-center justify-center gap-2 text-xs text-destructive"><CircleAlert className="size-3.5" />{errorMessage}</p> : null}
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => { void handle(event.target.files); event.target.value = "" }}
      />
    </div>
  )
}
