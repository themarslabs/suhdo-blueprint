"use client"

import * as React from "react"
import { ChevronRight, LogOut, Menu, PanelLeft } from "lucide-react"

import { AppHeaderProvider, useAppHeader } from "@/components/app/app-header-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type AppNavItem = {
  label: string
  href?: string
  icon: React.ReactNode
  active?: boolean
  badge?: React.ReactNode
  defaultOpen?: boolean
  children?: AppNavItem[]
}

export type AppNavGroup = {
  label?: string
  items: AppNavItem[]
}

export type AppShellLinkProps = {
  href: string
  className: string
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  "aria-current"?: React.AriaAttributes["aria-current"]
}

export type AppShellProps = {
  children: React.ReactNode
  title?: React.ReactNode
  brand?: React.ReactNode
  navigation: AppNavGroup[]
  renderLink?: (props: AppShellLinkProps) => React.ReactNode
  headerActions?: React.ReactNode
  organizationSwitcher?: React.ReactNode
  applicationSwitcher?: React.ReactNode
  workspaceSwitcher?: React.ReactNode
  notifications?: React.ReactNode
  sidebarActions?: React.ReactNode
  languageSwitcher?: React.ReactNode
  userMenu?: React.ReactNode
  organization?: React.ReactNode
  user?: { name: string; email?: string; initials?: string }
  onLogout?: () => void
}

function BrandMark() {
  return <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-primary font-mono text-sm font-bold text-primary-foreground">S</span>
}

function hasActiveItem(item: AppNavItem): boolean {
  return Boolean(item.active || item.children?.some(hasActiveItem))
}

function NavigationLink({ item, renderLink, onNavigate, className, children }: {
  item: AppNavItem
  renderLink?: AppShellProps["renderLink"]
  onNavigate?: () => void
  className: string
  children: React.ReactNode
}) {
  if (!item.href) return null
  const props: AppShellLinkProps = {
    href: item.href,
    className,
    children,
    onClick: onNavigate,
    "aria-current": item.active ? "page" : undefined,
  }
  return renderLink ? renderLink(props) : <a {...props} />
}

function NavigationItem({ item, collapsed, renderLink, onNavigate, onRequestExpand, nested = false }: {
  item: AppNavItem
  collapsed: boolean
  renderLink?: AppShellProps["renderLink"]
  onNavigate?: () => void
  onRequestExpand?: () => void
  nested?: boolean
}) {
  const childActive = Boolean(item.children?.some(hasActiveItem))
  const [open, setOpen] = React.useState(Boolean(item.defaultOpen || childActive))

  React.useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  const rowClassName = cn(
    "flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground/75 outline-none transition-colors hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    item.active && "font-medium text-sidebar-accent-foreground [&>span:first-child]:text-sidebar-primary",
    childActive && !item.active && "font-medium text-sidebar-accent-foreground [&>span:first-child]:text-sidebar-primary",
    nested && "h-8 pl-3 text-[13px]",
    collapsed && "justify-center",
  )
  const content = <><span className="shrink-0 [&>svg]:size-4">{item.icon}</span><span className={cn("min-w-0 flex-1 truncate text-left", collapsed && "sr-only")}>{item.label}</span>{!collapsed ? item.badge : null}</>

  if (item.children?.length) {
    const trigger = (
      <button
        type="button"
        className={rowClassName}
        aria-expanded={collapsed ? false : open}
        onClick={() => collapsed ? onRequestExpand?.() : setOpen((current) => !current)}
      >
        {content}
        {!collapsed ? <ChevronRight className={cn("ml-auto size-3.5 transition-transform", open && "rotate-90")} /> : null}
      </button>
    )

    return (
      <div className="grid gap-1">
        {collapsed ? <Tooltip><TooltipTrigger asChild>{trigger}</TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip> : trigger}
        {!collapsed && open ? <div role="group" aria-label={item.label} className="ml-4 grid gap-1 border-l border-sidebar-border pl-2">{item.children.map((child) => <NavigationItem key={child.href ?? child.label} item={child} collapsed={false} renderLink={renderLink} onNavigate={onNavigate} nested />)}</div> : null}
      </div>
    )
  }

  const link = <NavigationLink item={item} renderLink={renderLink} onNavigate={onNavigate} className={rowClassName}>{content}</NavigationLink>
  return collapsed ? <Tooltip><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip> : link
}

function Navigation({ groups, collapsed = false, renderLink, onNavigate, onRequestExpand }: {
  groups: AppNavGroup[]
  collapsed?: boolean
  renderLink?: AppShellProps["renderLink"]
  onNavigate?: () => void
  onRequestExpand?: () => void
}) {
  return (
    <nav aria-label="Navegacao principal" className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-2">
      {groups.map((group, groupIndex) => (
        <div key={group.label ?? groupIndex} className="grid gap-1">
          {group.label && !collapsed ? <p className="px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-sidebar-foreground/55 uppercase">{group.label}</p> : null}
          {group.items.map((item) => <NavigationItem key={item.href ?? item.label} item={item} collapsed={collapsed} renderLink={renderLink} onNavigate={onNavigate} onRequestExpand={onRequestExpand} />)}
        </div>
      ))}
    </nav>
  )
}

function SidebarSlot({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  return <div className={cn("min-w-0 flex-1", collapsed && "mx-auto w-9 overflow-hidden [&>*]:w-9 [&>*]:min-w-9 [&>*]:justify-center [&>*]:px-0 [&>*>*:not(:first-child)]:hidden")}>{children}</div>
}

function SidebarBody({
  brand,
  navigation,
  renderLink,
  organizationSwitcher,
  applicationSwitcher,
  workspaceSwitcher,
  notifications,
  sidebarActions,
  languageSwitcher,
  userMenu,
  organization,
  user,
  onLogout,
  onNavigate,
  onRequestExpand,
  collapsed = false,
}: Omit<AppShellProps, "children" | "title" | "headerActions"> & { collapsed?: boolean; onNavigate?: () => void; onRequestExpand?: () => void }) {
  const organizationNode = organizationSwitcher ?? organization
  const applicationNode = applicationSwitcher ?? workspaceSwitcher
  const hasUtilities = notifications || sidebarActions || languageSwitcher || userMenu

  return (
    <div data-slot="sidebar" className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex h-[57px] items-center gap-2 px-2", collapsed && "justify-center px-2")}>
        {brand ? <SidebarSlot collapsed={collapsed}>{brand}</SidebarSlot> : <><BrandMark /><span className={cn("text-sm font-semibold tracking-tight", collapsed && "sr-only")}>suhdo</span></>}
      </div>
      {organizationNode || applicationNode ? (
        <div className={cn("grid gap-1 px-2 pb-2", collapsed && "px-1")}>
          {organizationNode ? <SidebarSlot collapsed={collapsed}>{organizationNode}</SidebarSlot> : null}
          {applicationNode ? <SidebarSlot collapsed={collapsed}>{applicationNode}</SidebarSlot> : null}
        </div>
      ) : null}
      <Separator className="bg-sidebar-border" />
      <Navigation groups={navigation} collapsed={collapsed} renderLink={renderLink} onNavigate={onNavigate} onRequestExpand={onRequestExpand} />
      {hasUtilities ? (
        <div className="grid gap-1 border-t border-sidebar-border p-2">
          {notifications ? <SidebarSlot collapsed={collapsed}>{notifications}</SidebarSlot> : null}
          <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
            {sidebarActions}
            {languageSwitcher}
            {userMenu}
          </div>
        </div>
      ) : null}
      {user ? (
        <div className="border-t border-sidebar-border p-2">
          <div className={cn("flex min-w-0 items-center gap-2 rounded-md p-2", collapsed && "justify-center p-1")}>
            <Avatar size="sm"><AvatarFallback>{user.initials ?? user.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
            {!collapsed ? <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{user.name}</p>{user.email ? <p className="truncate text-[11px] text-sidebar-foreground/55">{user.email}</p> : null}</div> : null}
            {onLogout && !collapsed ? <Button variant="ghost" size="icon-sm" onClick={onLogout} aria-label="Sair"><LogOut /></Button> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function AppShellFrame(props: AppShellProps) {
  const { header } = useAppHeader()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const resolvedTitle = header.title ?? props.title
  const resolvedActions = header.actions ?? props.headerActions
  const sidebarProps = { ...props, children: undefined }

  return (
    <TooltipProvider>
      <div className="app-ui flex min-h-svh w-full bg-background">
        <aside aria-label="Barra lateral" className={cn("sticky top-0 hidden h-svh shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:block", collapsed ? "w-13" : "w-64")}>
          <SidebarBody {...sidebarProps} collapsed={collapsed} onRequestExpand={() => setCollapsed(false)} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-[57px] shrink-0 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur-xl sm:px-4 lg:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir navegacao"><Menu /></Button></SheetTrigger>
              <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
                <SheetHeader className="sr-only"><SheetTitle>Navegacao</SheetTitle><SheetDescription>Menu principal do aplicativo</SheetDescription></SheetHeader>
                <SidebarBody {...sidebarProps} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon-sm" className="hidden size-8 text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex" onClick={() => setCollapsed((current) => !current)} aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}>
              <PanelLeft />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold tracking-[-0.01em] text-foreground">{resolvedTitle}</h1>
            </div>
            {resolvedActions ? <div className="ml-4 flex max-w-[70%] items-center gap-2 overflow-x-auto">{resolvedActions}</div> : null}
          </header>
          <main className="min-w-0 flex-1">{props.children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}

export function AppShell(props: AppShellProps) {
  return <AppHeaderProvider><AppShellFrame {...props} /></AppHeaderProvider>
}
