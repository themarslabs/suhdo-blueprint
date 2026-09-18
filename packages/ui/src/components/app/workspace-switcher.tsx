"use client"

import * as React from "react"
import { Check, ChevronsUpDown, FolderKanban, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonSpinner } from "@/components/ui/loading-state"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type WorkspaceOption = {
  id: string
  name: string
  description?: string
}

export function WorkspaceSwitcher({
  workspaces,
  activeId,
  organizationName,
  onChange,
  onCreate,
  className,
}: {
  workspaces: WorkspaceOption[]
  activeId: string
  organizationName?: string
  onChange: (workspace: WorkspaceOption) => void | Promise<void>
  onCreate?: () => void
  className?: string
}) {
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const active = workspaces.find((workspace) => workspace.id === activeId) ?? workspaces[0]

  async function change(workspace: WorkspaceOption) {
    if (workspace.id === activeId || pendingId) return
    setPendingId(workspace.id)
    try {
      await onChange(workspace)
    } finally {
      setPendingId(null)
    }
  }

  if (!active) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("h-8 max-w-52 gap-2 bg-background px-2.5 text-xs", className)} aria-label={`Workspace ativo: ${active.name}`}>
          <FolderKanban className="size-3.5 text-muted-foreground" />
          <span className="truncate">{active.name}</span>
          {pendingId ? <ButtonSpinner busy /> : <ChevronsUpDown className="size-3 shrink-0 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{organizationName ? `Workspaces de ${organizationName}` : "Workspace ativo"}</DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem key={workspace.id} disabled={Boolean(pendingId)} onSelect={() => void change(workspace)} className="min-h-10">
            <FolderKanban className="size-4 text-muted-foreground" />
            <span className="min-w-0 flex-1"><span className="block truncate font-medium">{workspace.name}</span>{workspace.description ? <span className="block truncate text-xs text-muted-foreground">{workspace.description}</span> : null}</span>
            {workspace.id === activeId ? <Check className="size-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
        {onCreate ? <><DropdownMenuSeparator /><DropdownMenuItem onSelect={onCreate}><Plus />Novo workspace</DropdownMenuItem></> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
