"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, BookOpen, Database, FilePenLine, FileText, LayoutDashboard, Palette, Pencil, Plus, Save, Settings2 } from "lucide-react"

import { ApplicationSwitcher } from "@suhdo/ui/components/app/application-switcher"
import { AppHeaderActionButton } from "@suhdo/ui/components/app/app-header-action-button"
import { AppShell, type AppNavGroup, type AppShellLinkProps } from "@suhdo/ui/components/app/app-shell"
import { LanguageSwitcher } from "@suhdo/ui/components/app/language-switcher"
import { NotificationMenu, type AppNotification } from "@suhdo/ui/components/app/notification-menu"
import { OrganizationSwitcher } from "@suhdo/ui/components/app/organization-switcher"
import { UserMenu } from "@suhdo/ui/components/app/user-menu"
import { ThemeToggle } from "@suhdo/ui/components/theme-toggle"
import { Button } from "@suhdo/ui/components/ui/button"
import { DialogsProvider } from "@suhdo/ui/components/ui/dialogs-provider"

const organizations = [
  { id: "suhdo-labs", name: "Suhdo Labs", description: "Produto e tecnologia" },
  { id: "three-as", name: "3AS Tecnologia", description: "Identidade e plataforma" },
  { id: "north-studio", name: "North Studio", description: "Parceiro externo" },
]

const applications = [
  { id: "hydrogen", name: "Hydrogen", description: "CMS operacional", shortLabel: "HY" },
  { id: "krona", name: "Krona", description: "Timesheet", shortLabel: "KR" },
  { id: "quanta", name: "Quanta", description: "Video", shortLabel: "QU" },
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
  const [applicationId, setApplicationId] = React.useState("hydrogen")
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
        organizationSwitcher={<OrganizationSwitcher organizations={organizations} activeId={organizationId} onChange={(organization) => setOrganizationId(organization.id)} className="w-full max-w-none" />}
        applicationSwitcher={<ApplicationSwitcher applications={applications} activeId={applicationId} onChange={(application) => setApplicationId(application.id)} />}
        notifications={<NotificationMenu notifications={notifications} onRead={markRead} onMarkAllRead={() => setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))} />}
        sidebarActions={<ThemeToggle />}
        languageSwitcher={<LanguageSwitcher locales={[{ code: "pt-BR", label: "Portugues", shortLabel: "PT" }, { code: "en", label: "English", shortLabel: "EN" }, { code: "es", label: "Espanol", shortLabel: "ES" }]} locale={locale} onChange={setLocale} />}
        userMenu={<UserMenu user={{ name: "Ninja Suhdo", email: "design@suhdo.com", roleLabel: "Admin" }} actions={[{ label: "Editar perfil", icon: Pencil, onSelect: () => undefined }]} onSignOut={() => undefined} />}
      >
        {children}
      </AppShell>
    </DialogsProvider>
  )
}
