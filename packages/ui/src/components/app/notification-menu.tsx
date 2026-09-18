"use client"

import { Bell, CheckCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type AppNotification = {
  id: string
  title: string
  body?: string
  time?: string
  href?: string
  read?: boolean
}

export function NotificationMenu({
  notifications,
  onRead,
  onMarkAllRead,
  compact = false,
  className,
}: {
  notifications: AppNotification[]
  onRead?: (notification: AppNotification) => void
  onMarkAllRead?: () => void
  compact?: boolean
  className?: string
}) {
  const unread = notifications.filter((notification) => !notification.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("relative h-9 w-full justify-start gap-2 px-2 text-sidebar-foreground/75", compact && "size-9 justify-center px-0", className)}
          aria-label={unread ? `Notificacoes: ${unread} nao lidas` : "Notificacoes"}
        >
          <Bell className="size-4" />
          {!compact ? <span className="min-w-0 flex-1 text-left text-sm">Notificacoes</span> : null}
          {unread ? <span className={cn("grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground", compact && "absolute -top-0.5 -right-0.5 min-w-4")}>{unread > 9 ? "9+" : unread}</span> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" sideOffset={6} className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-3">
          <span>Notificacoes</span>
          {unread ? <span className="font-normal">{unread} nao lida{unread === 1 ? "" : "s"}</span> : null}
        </DropdownMenuLabel>
        {unread && onMarkAllRead ? <><DropdownMenuItem onSelect={onMarkAllRead}><CheckCheck />Marcar todas como lidas</DropdownMenuItem><DropdownMenuSeparator /></> : null}
        {notifications.length ? notifications.map((notification) => {
          const content = (
            <>
              <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", notification.read ? "bg-transparent" : "bg-primary")} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-snug">{notification.title}</span>
                {notification.body ? <span className="mt-0.5 block line-clamp-2 text-xs leading-4 text-muted-foreground">{notification.body}</span> : null}
                {notification.time ? <span className="mt-1 block text-[11px] text-muted-foreground">{notification.time}</span> : null}
              </span>
            </>
          )
          return (
            <DropdownMenuItem key={notification.id} asChild={Boolean(notification.href)} onSelect={() => onRead?.(notification)} className={cn("items-start py-2.5", !notification.read && "bg-primary/5")}>
              {notification.href ? <a href={notification.href}>{content}</a> : content}
            </DropdownMenuItem>
          )
        }) : <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nenhuma notificacao por aqui.</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
