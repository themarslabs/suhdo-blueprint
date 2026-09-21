"use client"

import * as React from "react"
import { Bell, Check, CheckCheck, ChevronRight, ChevronsUpDown, Languages, Laptop, LogOut, Moon, Sun } from "lucide-react"

import type { AppNotification } from "@/components/app/notification-menu"
import type { LocaleOption } from "@/components/app/language-switcher"
import type { UserIdentity, UserMenuAction } from "@/components/app/user-menu"
import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ThemePreference } from "@/lib/theme"
import { cn } from "@/lib/utils"

const themeOptions: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Laptop },
]

export function AccountMenu({
  user,
  notifications = [],
  onRead,
  onMarkAllRead,
  locales = [],
  locale,
  onLocaleChange,
  actions = [],
  onSignOut,
  compact = false,
  className,
}: {
  user: UserIdentity
  notifications?: AppNotification[]
  onRead?: (notification: AppNotification) => void
  onMarkAllRead?: () => void
  locales?: LocaleOption[]
  locale?: string
  onLocaleChange?: (locale: string) => void | Promise<void>
  actions?: UserMenuAction[]
  onSignOut?: () => void
  compact?: boolean
  className?: string
}) {
  const { preference, setPreference } = useTheme()
  const [localePending, setLocalePending] = React.useState(false)
  const initials = user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase()
  const unread = notifications.filter((notification) => !notification.read).length
  const activeLocale = locales.find((option) => option.code === locale)

  async function changeLocale(nextLocale: string) {
    if (!onLocaleChange || nextLocale === locale || localePending) return
    setLocalePending(true)
    try {
      await onLocaleChange(nextLocale)
    } finally {
      setLocalePending(false)
    }
  }

  return (
    <div className="@container w-full min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn("h-11 w-full justify-center gap-2 px-0 @min-[7rem]:justify-start @min-[7rem]:px-2", compact && "size-9 justify-center px-0", className)}
            aria-label={`Menu de ${user.name}`}
          >
            <Avatar size="sm"><AvatarImage src={user.image} alt="" /><AvatarFallback>{initials}</AvatarFallback></Avatar>
            {!compact ? <span className="hidden min-w-0 flex-1 text-left @min-[7rem]:block"><span className="block truncate text-xs font-medium">{user.name}</span><span className="block truncate text-[10px] font-normal text-muted-foreground">Conta e preferencias</span></span> : null}
            {!compact ? <ChevronsUpDown className="hidden size-3.5 shrink-0 text-muted-foreground @min-[7rem]:block" /> : null}
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" sideOffset={8} className="w-72">
        <DropdownMenuLabel className="flex min-w-0 items-center gap-3 py-2">
          <Avatar><AvatarImage src={user.image} alt="" /><AvatarFallback>{initials}</AvatarFallback></Avatar>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-foreground">{user.name}</span><span className="block truncate font-normal">{user.email}</span></span>
          {user.roleLabel ? <Badge variant="secondary" className="shrink-0">{user.roleLabel}</Badge> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Bell />
              <span className="flex-1">Notificacoes</span>
              {unread ? <Badge className="h-5 min-w-5 justify-center px-1 text-[10px]">{unread > 9 ? "9+" : unread}</Badge> : null}
              <ChevronRight className="size-4 text-muted-foreground" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between gap-3"><span>Notificacoes</span>{unread ? <span className="font-normal">{unread} nao lida{unread === 1 ? "" : "s"}</span> : null}</DropdownMenuLabel>
              {unread && onMarkAllRead ? <><DropdownMenuItem onSelect={onMarkAllRead}><CheckCheck />Marcar todas como lidas</DropdownMenuItem><DropdownMenuSeparator /></> : null}
              {notifications.map((notification) => {
                const content = <><span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", notification.read ? "bg-transparent" : "bg-primary")} /><span className="min-w-0 flex-1"><span className="block text-sm font-medium leading-snug">{notification.title}</span>{notification.body ? <span className="mt-0.5 block line-clamp-2 text-xs leading-4 text-muted-foreground">{notification.body}</span> : null}{notification.time ? <span className="mt-1 block text-[11px] text-muted-foreground">{notification.time}</span> : null}</span></>
                return <DropdownMenuItem key={notification.id} asChild={Boolean(notification.href)} onSelect={() => onRead?.(notification)} className={cn("items-start py-2.5", !notification.read && "bg-primary/5")}>{notification.href ? <a href={notification.href}>{content}</a> : content}</DropdownMenuItem>
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : null}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger><Moon /><span className="flex-1">Tema</span><span className="text-xs text-muted-foreground">{themeOptions.find((option) => option.value === preference)?.label}</span><ChevronRight className="size-4 text-muted-foreground" /></DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuLabel>Tema</DropdownMenuLabel>
            {themeOptions.map((option) => <DropdownMenuItem key={option.value} onSelect={() => setPreference(option.value)}><option.icon />{option.label}{preference === option.value ? <Check className="ml-auto text-primary" /> : null}</DropdownMenuItem>)}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {activeLocale && locales.length ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger><Languages /><span className="flex-1">Idioma</span><span className="text-xs text-muted-foreground">{activeLocale.shortLabel ?? activeLocale.label}</span><ChevronRight className="size-4 text-muted-foreground" /></DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>Idioma</DropdownMenuLabel>
              {locales.map((option) => <DropdownMenuItem key={option.code} disabled={localePending} onSelect={() => void changeLocale(option.code)}><span className="font-mono text-xs text-muted-foreground uppercase">{option.code}</span><span className="flex-1">{option.label}</span>{option.code === locale ? <Check className="text-primary" /> : null}</DropdownMenuItem>)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : null}

        {actions.length ? <DropdownMenuSeparator /> : null}
        {actions.map((action) => {
          const Icon = action.icon
          return <DropdownMenuItem key={action.label} variant={action.destructive ? "destructive" : "default"} onSelect={action.onSelect} asChild={Boolean(action.href)}>{action.href ? <a href={action.href}>{Icon ? <Icon /> : null}{action.label}</a> : <>{Icon ? <Icon /> : null}{action.label}</>}</DropdownMenuItem>
        })}
        {onSignOut ? <><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={onSignOut}><LogOut />Sair</DropdownMenuItem></> : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
