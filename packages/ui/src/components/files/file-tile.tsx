"use client"

import * as React from "react"
import { Box, FileText, Film, ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

export type FileAssetKind = "image" | "video" | "svg" | "document" | "other"

export type FileAsset = {
  id: string
  name: string
  kind: FileAssetKind
  url?: string
  previewUrl?: string
  alt?: string
  size?: number
  width?: number | null
  height?: number | null
  mime?: string
  createdAt?: string
  uploadedBy?: string
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** power
  return `${value >= 10 || power === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[power]}`
}

export function FileTile({
  asset,
  selected,
  onSelect,
  children,
  className,
}: {
  asset: FileAsset
  selected?: boolean
  onSelect?: () => void
  children?: React.ReactNode
  className?: string
}) {
  const isSelected = selected === true
  const isImage = asset.kind === "image" || asset.kind === "svg"
  const Icon = asset.kind === "video" ? Film : asset.kind === "document" ? FileText : asset.kind === "other" ? Box : ImageOff
  const metadata = [asset.width && asset.height ? `${asset.width}x${asset.height}` : null, typeof asset.size === "number" ? formatFileSize(asset.size) : null].filter(Boolean).join(" / ")

  return (
    <article className={cn("group relative flex min-h-48 flex-col overflow-hidden rounded-lg border bg-background transition-[border-color,box-shadow]", isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/30", className)}>
      <button type="button" onClick={onSelect} aria-label={asset.name} aria-pressed={selected} className="flex min-h-0 flex-1 flex-col text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/30">
          {isImage && (asset.previewUrl || asset.url) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.previewUrl || asset.url} alt={asset.alt ?? asset.name} className="h-full w-full object-cover" loading="lazy" />
          ) : <Icon className="size-9 text-muted-foreground/60" />}
        </span>
        <span className="block w-full shrink-0 px-2.5 py-2">
          <span className="block truncate text-xs font-medium text-foreground">{asset.name}</span>
          {metadata ? <span className="block truncate font-mono text-[10px] text-muted-foreground">{metadata}</span> : null}
        </span>
      </button>
      {children}
    </article>
  )
}
