"use client"

import * as React from "react"
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonSpinner } from "@/components/ui/loading-state"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { organizationInitials, organizationTintStyle } from "@/lib/org-identity"
import { cn } from "@/lib/utils"

export type OrganizationOption = {
  id: string
  name: string
  description?: string
}

export function OrganizationSwitcher({
  organizations,
  activeId,
  onChange,
  onCreate,
  compact = false,
  className,
}: {
  organizations: OrganizationOption[]
  activeId: string
  onChange: (organization: OrganizationOption) => void | Promise<void>
  onCreate?: () => void
  compact?: boolean
  className?: string
}) {
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const active = organizations.find((organization) => organization.id === activeId) ?? organizations[0]

  async function change(organization: OrganizationOption) {
    if (organization.id === activeId || pendingId) return
    setPendingId(organization.id)
    try {
      await onChange(organization)
    } finally {
      setPendingId(null)
    }
  }

  if (!active) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("h-9 max-w-60 justify-start gap-2 px-1.5", compact && "max-w-44", className)} aria-label={`Organizacao ativa: ${active.name}`}>
          <OrganizationMark organization={active} />
          <span className={cn("min-w-0 flex-1 truncate text-left text-xs font-medium", compact && "hidden sm:block")}>{active.name}</span>
          {pendingId ? <ButtonSpinner busy /> : <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Organizacao ativa</DropdownMenuLabel>
        {organizations.map((organization) => (
          <DropdownMenuItem key={organization.id} disabled={Boolean(pendingId)} onSelect={() => void change(organization)} className="min-h-11">
            <OrganizationMark organization={organization} />
            <span className="min-w-0 flex-1"><span className="block truncate font-medium">{organization.name}</span>{organization.description ? <span className="block truncate text-xs text-muted-foreground">{organization.description}</span> : null}</span>
            {organization.id === activeId ? <Check className="size-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
        {onCreate ? <><DropdownMenuSeparator /><DropdownMenuItem onSelect={onCreate}><Plus />Nova organizacao</DropdownMenuItem></> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function OrganizationMark({ organization }: { organization: OrganizationOption }) {
  return <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-md text-[10px] font-bold ring-1 ring-current/10" style={organizationTintStyle(organization.id)}>{organizationInitials(organization.name) || <Building2 className="size-3.5" />}</span>
}
