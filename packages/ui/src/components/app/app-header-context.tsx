"use client"

import * as React from "react"

export type AppHeaderState = {
  title?: React.ReactNode
  actions?: React.ReactNode
}

type AppHeaderContextValue = {
  clearHeader: () => void
  header: AppHeaderState
  setHeader: (next: AppHeaderState) => void
}

const AppHeaderContext = React.createContext<AppHeaderContextValue | null>(null)

export function AppHeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeader] = React.useState<AppHeaderState>({})

  const clearHeader = React.useCallback(() => setHeader({}), [])
  const value = React.useMemo(() => ({ clearHeader, header, setHeader }), [clearHeader, header])

  return <AppHeaderContext.Provider value={value}>{children}</AppHeaderContext.Provider>
}

export function useAppHeader() {
  const context = React.useContext(AppHeaderContext)
  if (!context) throw new Error("useAppHeader must be used within an AppHeaderProvider.")
  return context
}
