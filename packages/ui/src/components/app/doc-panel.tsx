"use client"

import * as React from "react"
import { Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function DocContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full min-w-0 max-w-275 space-y-4", className)}>{children}</div>
}

export function DocPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <aside className={cn("h-fit min-w-0 divide-y divide-border rounded-lg border border-border bg-muted/20", className)}>{children}</aside>
}

export function DocPanelSection({ title, meta, children }: { title?: React.ReactNode; meta?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3 px-4 py-4">
      {title ? <div className="flex min-h-5 items-center justify-between gap-2"><h2 className="text-xs font-semibold">{title}</h2>{meta}</div> : null}
      {children}
    </section>
  )
}

export function DocTitleInput({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={cn("h-auto border-0 bg-transparent px-0 text-2xl! font-bold text-primary shadow-none focus-visible:ring-0 dark:bg-transparent", className)} />
}

export function DocSwitchRow({ id, label, hint, checked, onChange }: { id: string; label: string; hint?: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-3 py-2">
      <div className="min-w-0 space-y-0.5"><Label htmlFor={id} className="text-xs">{label}</Label>{hint ? <p className="text-[10px] leading-snug text-muted-foreground">{hint}</p> : null}</div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function DocSlugField({ value, onChange, prefix = "", placeholder = "meu-slug" }: { value: string; onChange: (value: string) => void; prefix?: string; placeholder?: string }) {
  const [editing, setEditing] = React.useState(false)

  if (!editing) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">{value ? <>{prefix}<span className="font-medium text-foreground">{value}</span></> : "Definir slug..."}</span>
        <button type="button" onClick={() => setEditing(true)} className="shrink-0 text-primary underline-offset-2 hover:underline">Editar</button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Input value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); setEditing(false) } }} placeholder={placeholder} className="h-8 font-mono text-xs" autoFocus />
      <p className="truncate text-[10px] text-muted-foreground">{prefix}<span className="text-foreground">{value || placeholder}</span></p>
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" size="sm" className="h-6 px-2.5 text-xs" onClick={() => setEditing(false)}>OK</Button>
        {value ? <button type="button" onClick={() => { onChange(""); setEditing(false) }} className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">Limpar</button> : null}
      </div>
    </div>
  )
}
