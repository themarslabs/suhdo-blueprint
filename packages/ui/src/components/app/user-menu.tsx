"use client"

import type { LucideIcon } from "lucide-react"
import { ChevronsUpDown, LogOut } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type UserMenuAction = {
  label: string
  icon?: LucideIcon
  onSelect?: () => void
  href?: string
  destructive?: boolean
}

export type UserIdentity = {
  name: string
  email: string
  image?: string
  roleLabel?: string
}

export function UserMenu({ user, actions = [], onSignOut, compact = true, className }: { user: UserIdentity; actions?: UserMenuAction[]; onSignOut?: () => void; compact?: boolean; className?: string }) {
  const initials = user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("h-9 gap-2 px-1.5", compact ? "w-9" : "max-w-56 justify-start", className)} aria-label={`Menu de ${user.name}`}>
          <Avatar size="sm"><AvatarImage src={user.image} alt="" /><AvatarFallback>{initials}</AvatarFallback></Avatar>
          {!compact ? <span className="min-w-0 flex-1 truncate text-left text-xs font-medium">{user.name}</span> : null}
          {!compact ? <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" /> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex min-w-0 items-center gap-3 py-2">
          <Avatar><AvatarImage src={user.image} alt="" /><AvatarFallback>{initials}</AvatarFallback></Avatar>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-foreground">{user.name}</span><span className="block truncate font-normal">{user.email}</span></span>
          {user.roleLabel ? <Badge variant="secondary" className="shrink-0">{user.roleLabel}</Badge> : null}
        </DropdownMenuLabel>
        {actions.length ? <DropdownMenuSeparator /> : null}
        {actions.map((action) => {
          const Icon = action.icon
          return <DropdownMenuItem key={action.label} variant={action.destructive ? "destructive" : "default"} onSelect={action.onSelect} asChild={Boolean(action.href)}>{action.href ? <a href={action.href}>{Icon ? <Icon /> : null}{action.label}</a> : <>{Icon ? <Icon /> : null}{action.label}</>}</DropdownMenuItem>
        })}
        {onSignOut ? <><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={onSignOut}><LogOut />Sair</DropdownMenuItem></> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
