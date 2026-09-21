"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Boxes, Check, Plus } from "lucide-react"

import type { OrganizationOption } from "@/components/app/organization-switcher"
import type { WorkspaceOption } from "@/components/app/workspace-switcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { organizationInitials, organizationTintStyle } from "@/lib/org-identity"
import { cn } from "@/lib/utils"

export type ProductApplication = {
  id: string
  name: string
  description?: string
  shortLabel?: string
  icon?: LucideIcon
}

export function ProductSwitcher({
  applications,
  activeApplicationId,
  organizations,
  activeOrganizationId,
  onOrganizationChange,
  workspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  onWorkspaceCreate,
  className,
}: {
  applications: ProductApplication[]
  activeApplicationId: string
  onApplicationChange?: (application: ProductApplication) => void | Promise<void>
  organizations: OrganizationOption[]
  activeOrganizationId: string
  onOrganizationChange: (organization: OrganizationOption) => void | Promise<void>
  workspaces: WorkspaceOption[]
  activeWorkspaceId: string
  onWorkspaceChange: (workspace: WorkspaceOption) => void | Promise<void>
  onWorkspaceCreate?: () => void
  className?: string
}) {
  const [pending, setPending] = React.useState(false)
  const activeApplication = applications.find((application) => application.id === activeApplicationId) ?? applications[0]
  const activeOrganization = organizations.find((organization) => organization.id === activeOrganizationId) ?? organizations[0]
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0]

  if (!activeApplication || !activeOrganization || !activeWorkspace) return null
  const ActiveIcon = activeApplication.icon ?? Boxes

  async function changeOrganization(organization: OrganizationOption) {
    if (organization.id === activeOrganizationId || pending) return
    setPending(true)
    try { await onOrganizationChange(organization) } finally { setPending(false) }
  }

  async function changeWorkspace(workspace: WorkspaceOption) {
    if (workspace.id === activeWorkspaceId || pending) return
    setPending(true)
    try { await onWorkspaceChange(workspace) } finally { setPending(false) }
  }

  return (
    <div className={cn("flex h-11 w-full min-w-9 items-center gap-2 px-1.5", className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-xs" title={activeApplication.name} aria-label={`Aplicativo: ${activeApplication.name}`}>
        <ActiveIcon className="size-4" />
      </span>

      <span className="grid min-w-0 flex-1 leading-tight">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex min-w-0 cursor-pointer items-center text-left outline-none transition-colors hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:outline-none" aria-label={`Trocar organização. Atual: ${activeOrganization.name}`}>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold decoration-sidebar-foreground/40 decoration-[0.5px] underline-offset-2 hover:underline">{activeOrganization.name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={10} className="w-72">
            <DropdownMenuLabel>Trocar organização</DropdownMenuLabel>
            {organizations.map((organization) => (
              <DropdownMenuItem key={organization.id} disabled={pending} onSelect={() => void changeOrganization(organization)} className="min-h-11">
                <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-md text-[10px] font-bold ring-1 ring-current/10" style={organizationTintStyle(organization.id)}>{organizationInitials(organization.name)}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-medium">{organization.name}</span>{organization.description ? <span className="block truncate text-xs text-muted-foreground">{organization.description}</span> : null}</span>
                {organization.id === activeOrganizationId ? <Check className="text-primary" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex min-w-0 cursor-pointer items-center text-left text-sidebar-foreground/55 outline-none transition-colors hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:outline-none" aria-label={`Trocar workspace. Atual: ${activeWorkspace.name}`}>
              <span className="min-w-0 flex-1 truncate text-xs font-normal decoration-sidebar-foreground/35 decoration-[0.5px] underline-offset-2 hover:underline">{activeWorkspace.name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={10} className="w-72">
            <DropdownMenuLabel>Workspaces de {activeOrganization.name}</DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem key={workspace.id} disabled={pending} onSelect={() => void changeWorkspace(workspace)} className="min-h-11">
                <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground ring-1 ring-border">{workspace.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toLocaleUpperCase()}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-medium">{workspace.name}</span>{workspace.description ? <span className="block truncate text-xs text-muted-foreground">{workspace.description}</span> : null}</span>
                {workspace.id === activeWorkspaceId ? <Check className="text-primary" /> : null}
              </DropdownMenuItem>
            ))}
            {onWorkspaceCreate ? <><DropdownMenuSeparator /><DropdownMenuItem onSelect={onWorkspaceCreate}><Plus />Criar workspace</DropdownMenuItem></> : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </div>
  )
}
