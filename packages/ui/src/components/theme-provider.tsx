"use client"

import * as React from "react"

import {
  readThemeCookie,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
  writeThemeCookie,
} from "@/lib/theme"

type ThemeContextValue = {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  cookieDomain,
}: {
  children: React.ReactNode
  cookieDomain?: string
}) {
  const [preference, setPreferenceState] = React.useState<ThemePreference>("system")
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("light")

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const saved = readThemeCookie() ?? "system"

    function apply(next: ThemePreference) {
      const resolved = resolveTheme(next, media.matches)
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(resolved)
      document.documentElement.dataset.themePreference = next
      setResolvedTheme(resolved)
    }

    setPreferenceState(saved)
    apply(saved)

    function handleSystemChange() {
      if ((readThemeCookie() ?? "system") === "system") apply("system")
    }

    media.addEventListener("change", handleSystemChange)
    return () => media.removeEventListener("change", handleSystemChange)
  }, [])

  function setPreference(next: ThemePreference) {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const resolved = resolveTheme(next, media.matches)
    writeThemeCookie(next, cookieDomain)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(resolved)
    document.documentElement.dataset.themePreference = next
    setPreferenceState(next)
    setResolvedTheme(resolved)
  }

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used inside ThemeProvider")
  return context
}
