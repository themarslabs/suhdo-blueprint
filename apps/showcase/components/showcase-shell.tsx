"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Blocks, BookOpen, Clock3, Database, FilePenLine, FileText, LayoutDashboard, Palette, Pencil, Play, Plus, Save, Settings2 } from "lucide-react"

import { AccountMenu } from "@suhdo/ui/components/app/account-menu"
import { AppHeaderActionButton } from "@suhdo/ui/components/app/app-header-action-button"
import { AppShell, type AppNavGroup, type AppShellLinkProps } from "@suhdo/ui/components/app/app-shell"
import type { AppNotification } from "@suhdo/ui/components/app/notification-menu"
import { ProductSwitcher } from "@suhdo/ui/components/app/product-switcher"
import { Button } from "@suhdo/ui/components/ui/button"
import { DialogsProvider } from "@suhdo/ui/components/ui/dialogs-provider"

const organizations = [
  { id: "suhdo-labs", name: "Suhdo Labs", description: "Produto e tecnologia" },
  { id: "three-as", name: "3AS Tecnologia", description: "Identidade e plataforma" },
  { id: "north-studio", name: "North Studio", description: "Parceiro externo" },
]

const applications = [
  { id: "hydrogen", name: "Hydrogen", description: "CMS operacional", shortLabel: "HY", icon: Blocks },
  { id: "krona", name: "Krona", description: "Timesheet", shortLabel: "KR", icon: Clock3 },
  { id: "quanta", name: "Quanta", description: "Video", shortLabel: "QU", icon: Play },
]

const initialWorkspaces = [
  { id: "principal", name: "Workspace principal", description: "Produção e conteúdo institucional" },
  { id: "marketing", name: "Marketing", description: "Campanhas e landing pages" },
  { id: "docs", name: "Documentação", description: "Guias e central de ajuda" },
]

const initialNotifications: AppNotification[] = [
  { id: "1", title: "Pagina pronta para revisao", body: "A pagina Recursos recebeu uma nova versao.", time: "ha 8 min", href: "/pages", read: false },
  { id: "2", title: "Publicacao concluida", body: "Inicio foi publicada no ambiente principal.", time: "ha 42 min", href: "/pages", read: false },
  { id: "3", title: "Blueprint sincronizado", body: "Os componentes locais estao na versao mais recente.", time: "ontem", read: true },
]

function renderLink(props: AppShellLinkProps) {
  return <Link {...props} />
}

export function ShowcaseShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [organizationId, setOrganizationId] = React.useState("suhdo-labs")
  const [applicationId] = React.useState("hydrogen")
  const [workspaces, setWorkspaces] = React.useState(initialWorkspaces)
  const [workspaceId, setWorkspaceId] = React.useState("principal")
  const [locale, setLocale] = React.useState("pt-BR")
  const [notifications, setNotifications] = React.useState(initialNotifications)

  const routeHeader = pathname === "/pages" ? {
    title: "Páginas",
    actions: <AppHeaderActionButton asChild><Link href="/edit"><Plus />Nova Página</Link></AppHeaderActionButton>,
  } : pathname === "/edit" ? {
    title: "Editar pagina",
    actions: <><Button variant="outline" size="sm" asChild><Link href="/pages"><ArrowLeft />Voltar</Link></Button><Button size="sm" type="submit" form="page-editor"><Save />Salvar</Button></>,
  } : {
    title: "UI Blueprint",
    actions: <Button size="sm" asChild><Link href="/pages"><FileText />Ver paginas</Link></Button>,
  }

  const navigation: AppNavGroup[] = [
    {
      label: "Aplicativo",
      items: [
        { label: "Visao geral", href: "/", icon: <LayoutDashboard />, active: pathname === "/" },
        {
          label: "Conteudo",
          icon: <Database />,
          defaultOpen: true,
          children: [
            { label: "Páginas", href: "/pages", icon: <FileText />, active: pathname === "/pages" },
            { label: "Editor", href: "/edit", icon: <FilePenLine />, active: pathname === "/edit" },
          ],
        },
      ],
    },
    {
      label: "Blueprint",
      items: [
        { label: "Componentes", href: "/#components", icon: <Palette />, active: false },
        {
          label: "Documentacao",
          icon: <BookOpen />,
          children: [
            { label: "Contrato de UI", href: "/#contract", icon: <FileText /> },
            { label: "Tokens", href: "/#tokens", icon: <Settings2 /> },
          ],
        },
      ],
    },
  ]

  function markRead(notification: AppNotification) {
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item))
  }

  return (
    <DialogsProvider>
      <AppShell
        title={routeHeader.title}
        headerActions={routeHeader.actions}
        navigation={navigation}
        renderLink={renderLink}
        brand={<ProductSwitcher
          applications={applications}
          activeApplicationId={applicationId}
          organizations={organizations}
          activeOrganizationId={organizationId}
          onOrganizationChange={(organization) => setOrganizationId(organization.id)}
          workspaces={workspaces}
          activeWorkspaceId={workspaceId}
          onWorkspaceChange={(workspace) => setWorkspaceId(workspace.id)}
          onWorkspaceCreate={() => {
            const next = { id: `workspace-${workspaces.length + 1}`, name: `Novo workspace ${workspaces.length + 1}`, description: "Workspace recém-criado" }
            setWorkspaces((current) => [...current, next])
            setWorkspaceId(next.id)
          }}
        />}
        userMenu={<AccountMenu
          user={{ name: "Ninja Suhdo", email: "design@suhdo.com", roleLabel: "Admin" }}
          notifications={notifications}
          onRead={markRead}
          onMarkAllRead={() => setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))}
          locales={[{ code: "pt-BR", label: "Portugues", shortLabel: "PT" }, { code: "en", label: "English", shortLabel: "EN" }, { code: "es", label: "Espanol", shortLabel: "ES" }]}
          locale={locale}
          onLocaleChange={setLocale}
          actions={[{ label: "Editar perfil", icon: Pencil, onSelect: () => undefined }]}
          onSignOut={() => undefined}
        />}
      >
        {children}
      </AppShell>
    </DialogsProvider>
  )
}
