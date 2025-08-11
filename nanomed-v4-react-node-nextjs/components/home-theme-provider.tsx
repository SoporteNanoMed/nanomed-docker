"use client"

import type { ReactNode } from "react"

interface HomeThemeProviderProps {
  children: ReactNode
}

export function HomeThemeProvider({ children }: HomeThemeProviderProps) {
  return <div className="home-theme">{children}</div>
}
