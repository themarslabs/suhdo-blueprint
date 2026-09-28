import "@fontsource-variable/manrope"
import "@fontsource-variable/geist-mono"
import "./globals.css"

import type { Metadata } from "next"
import { ShowcaseShell } from "../components/showcase-shell"
import { ThemeProvider } from "@suhdo/ui/components/theme-provider"
import { ThemeScript } from "@suhdo/ui/components/theme-script"

export const metadata: Metadata = {
  title: "Suhdo UI Blueprint — Design system instalável",
  description: "Componentes, tokens e padrões da Suhdo instalados diretamente no seu projeto React.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider><ShowcaseShell>{children}</ShowcaseShell></ThemeProvider>
      </body>
    </html>
  )
}
