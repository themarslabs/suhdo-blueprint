"use client"

import * as React from "react"
import { Image as ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function ListThumb({ image, alt = "", fallback, className }: { image?: string | null; alt?: string; fallback?: React.ReactNode; className?: string }) {
  const [broken, setBroken] = React.useState(false)

  React.useEffect(() => setBroken(false), [image])

  return (
    <div className={cn("flex h-9 w-14 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40 text-muted-foreground/60 transition-colors group-hover:border-foreground/30", className)}>
      {image && !broken ? <img src={image} alt={alt} className="h-full w-full object-cover" loading="lazy" onError={() => setBroken(true)} /> : fallback ?? <ImageIcon className="size-4" />}
    </div>
  )
}
