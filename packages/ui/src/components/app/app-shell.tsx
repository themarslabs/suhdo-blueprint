"use client"

import * as React from "react"
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type AppNavItem = {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
  badge?: React.ReactNode
}

export type AppNavGroup = {
  label?: string
  items: AppNavItem[]
}

type AppShellProps = {
  children: React.ReactNode
  title?: React.ReactNode
  brand?: React.ReactNode
  navigation: AppNavGroup[]
  headerActions?: React.ReactNode
  organizationSwitcher?: React.ReactNode
  workspaceSwitcher?: React.ReactNode
  languageSwitcher?: React.ReactNode
  userMenu?: React.ReactNode
  organization?: React.ReactNode
  user?: { name: string; email?: string; initials?: string }
  onLogout?: () => void
}

function BrandMark() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-primary font-mono text-sm font-bold text-primary-foreground">
      S
    </span>
  )
}

function Navigation({ groups, collapsed = false }: { groups: AppNavGroup[]; collapsed?: boolean }) {
  return (
    <nav aria-label="Navegacao principal" className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-2">
      {groups.map((group, groupIndex) => (
        <div key={group.label ?? groupIndex} className="grid gap-1">
          {group.label && !collapsed ? <p className="px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-sidebar-foreground/55 uppercase">{group.label}</p> : null}
          {group.items.map((item) => {
            const link = (
              <a
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground/75 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  item.active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                  collapsed && "justify-center",
                )}
              >
                <span className="[&>svg]:size-4">{item.icon}</span>
                <span className={cn("min-w-0 flex-1 truncate", collapsed && "sr-only")}>{item.label}</span>
                {!collapsed ? item.badge : null}
              </a>
            )

            return collapsed ? (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : <React.Fragment key={item.label}>{link}</React.Fragment>
          })}
        </div>
      ))}
    </nav>
  )
}

function SidebarBody({
  brand,
  navigation,
  organization,
  user,
  onLogout,
  collapsed = false,
}: Pick<AppShellProps, "brand" | "navigation" | "organization" | "user" | "onLogout"> & { collapsed?: boolean }) {
  return (
    <div data-slot="sidebar" className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex h-16 items-center gap-2 px-3", collapsed && "justify-center px-2")}>
        {brand ?? <><BrandMark /><span className={cn("text-sm font-semibold tracking-tight", collapsed && "sr-only")}>suhdo</span></>}
      </div>
      {organization ? <div className={cn("px-2 pb-2", collapsed && "hidden")}>{organization}</div> : null}
      <Separator className="bg-sidebar-border" />
      <Navigation groups={navigation} collapsed={collapsed} />
      {user ? (
        <div className="border-t border-sidebar-border p-2">
          <div className={cn("flex min-w-0 items-center gap-2 rounded-md p-2", collapsed && "justify-center p-1")}>
            <Avatar size="sm"><AvatarFallback>{user.initials ?? user.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{user.name}</p>
                {user.email ? <p className="truncate text-[11px] text-sidebar-foreground/55">{user.email}</p> : null}
              </div>
            ) : null}
            {onLogout && !collapsed ? <Button variant="ghost" size="icon-sm" onClick={onLogout} aria-label="Sair"><LogOut /></Button> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function AppShell({
  children,
  title,
  brand,
  navigation,
  headerActions,
  organizationSwitcher,
  workspaceSwitcher,
  languageSwitcher,
  userMenu,
  organization,
  user,
  onLogout,
}: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <TooltipProvider>
      <div className="app-ui flex min-h-svh w-full bg-background">
        <aside
          aria-label="Barra lateral"
          className={cn(
            "sticky top-0 hidden h-svh shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:block",
            collapsed ? "w-13" : "w-64",
          )}
        >
          <SidebarBody brand={brand} navigation={navigation} organization={organization} user={user} onLogout={onLogout} collapsed={collapsed} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/92 px-3 backdrop-blur-md sm:px-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir navegacao"><Menu /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
                <SheetHeader className="sr-only"><SheetTitle>Navegacao</SheetTitle><SheetDescription>Menu principal do aplicativo</SheetDescription></SheetHeader>
                <SidebarBody brand={brand} navigation={navigation} organization={organization} user={user} onLogout={onLogout} />
              </SheetContent>
            </Sheet>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={() => setCollapsed((current) => !current)}
              aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
            <Separator orientation="vertical" className="mx-1 h-5" />
            {organizationSwitcher ? <div className="min-w-0 shrink sm:max-w-60">{organizationSwitcher}</div> : null}
            {organizationSwitcher && title ? <Separator orientation="vertical" className="mx-1 hidden h-5 lg:block" /> : null}
            <div className={cn("min-w-0 flex-1 truncate text-sm font-medium", organizationSwitcher && "hidden lg:block")}>{title}</div>
            {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
            {workspaceSwitcher ? <div className="hidden lg:block">{workspaceSwitcher}</div> : null}
            {languageSwitcher}
            {userMenu}
          </header>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
