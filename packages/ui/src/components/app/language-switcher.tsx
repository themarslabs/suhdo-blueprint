"use client"

import * as React from "react"
import { Check, Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonSpinner } from "@/components/ui/loading-state"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type LocaleOption = {
  code: string
  label: string
  shortLabel?: string
}

export function LanguageSwitcher({
  locales,
  locale,
  onChange,
  compact = true,
  className,
}: {
  locales: LocaleOption[]
  locale: string
  onChange: (locale: string) => void | Promise<void>
  compact?: boolean
  className?: string
}) {
  const [pending, setPending] = React.useState(false)
  const active = locales.find((option) => option.code === locale) ?? locales[0]
  if (!active) return null

  async function change(next: string) {
    if (next === locale || pending) return
    setPending(true)
    try {
      await onChange(next)
    } finally {
      setPending(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={compact ? "icon-sm" : "sm"} className={cn(!compact && "gap-2", className)} aria-label={`Idioma: ${active.label}`}>
          {pending ? <ButtonSpinner busy /> : <Languages />}
          {!compact ? <span>{active.shortLabel ?? active.label}</span> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Idioma</DropdownMenuLabel>
        {locales.map((option) => (
          <DropdownMenuItem key={option.code} disabled={pending} onSelect={() => void change(option.code)}>
            <span className="font-mono text-xs text-muted-foreground uppercase">{option.code}</span>
            <span className="flex-1">{option.label}</span>
            {option.code === locale ? <Check className="size-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
