export const THEME_COOKIE = "3as_theme"
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export type ThemePreference = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system"
}

export function resolveTheme(
  preference: ThemePreference,
  systemDark: boolean,
): ResolvedTheme {
  if (preference === "system") return systemDark ? "dark" : "light"
  return preference
}

export function readThemeCookie(): ThemePreference | null {
  if (typeof document === "undefined") return null

  for (const part of document.cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=")
    if (name === THEME_COOKIE) {
      const value = rest.join("=")
      return isThemePreference(value) ? value : null
    }
  }

  return null
}

export function writeThemeCookie(value: ThemePreference, domain?: string) {
  if (typeof document === "undefined") return

  const parts = [
    `${THEME_COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${THEME_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ]

  if (domain) parts.push(`Domain=${domain}`)
  if (window.location.protocol === "https:") parts.push("Secure")
  document.cookie = parts.join("; ")
}
