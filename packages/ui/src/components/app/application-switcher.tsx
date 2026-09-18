"use client"

import * as React from "react"
import { Boxes, Check, ChevronsUpDown, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonSpinner } from "@/components/ui/loading-state"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type ApplicationOption = {
  id: string
  name: string
  description?: string
  shortLabel?: string
}

export function ApplicationSwitcher({
  applications,
  activeId,
  onChange,
  onCreate,
  compact = false,
  className,
}: {
  applications: ApplicationOption[]
  activeId: string
  onChange: (application: ApplicationOption) => void | Promise<void>
  onCreate?: () => void
  compact?: boolean
  className?: string
}) {
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const active = applications.find((application) => application.id === activeId) ?? applications[0]

  async function change(application: ApplicationOption) {
    if (application.id === activeId || pendingId) return
    setPendingId(application.id)
    try {
      await onChange(application)
    } finally {
      setPendingId(null)
    }
  }

  if (!active) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("h-11 w-full max-w-none justify-start gap-2 px-1.5", compact && "size-9 justify-center px-0", className)}
          aria-label={`Aplicativo ativo: ${active.name}`}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Boxes className="size-4" />
          </span>
          {!compact ? (
            <span className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-sm font-semibold">{active.name}</span>
              <span className="truncate text-xs text-sidebar-foreground/55">{active.description ?? "Aplicativo Suhdo"}</span>
            </span>
          ) : null}
          {pendingId ? <ButtonSpinner busy /> : !compact ? <ChevronsUpDown className="ml-auto size-3.5 shrink-0 opacity-60" /> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={6} className="w-72">
        <DropdownMenuLabel>Aplicativos</DropdownMenuLabel>
        {applications.map((application) => (
          <DropdownMenuItem key={application.id} disabled={Boolean(pendingId)} onSelect={() => void change(application)} className="min-h-11">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold">{application.shortLabel ?? application.name.slice(0, 2).toLocaleUpperCase()}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{application.name}</span>
              {application.description ? <span className="block truncate text-xs text-muted-foreground">{application.description}</span> : null}
            </span>
            {application.id === activeId ? <Check className="size-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
        {onCreate ? <><DropdownMenuSeparator /><DropdownMenuItem onSelect={onCreate}><Plus />Novo aplicativo</DropdownMenuItem></> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
