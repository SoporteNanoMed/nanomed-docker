"use client"

import * as React from "react"
import { ThemeProviderContext, type Theme } from "@/hooks/use-theme"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "nanomed-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem(storageKey) as Theme
    if (savedTheme && ["light", "dark", "high-contrast"].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [storageKey])

  React.useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Remover todas las clases de tema
    root.classList.remove("light", "dark", "high-contrast")

    // Agregar la clase del tema actual
    root.classList.add(theme)

    // Guardar en localStorage
    localStorage.setItem(storageKey, theme)
  }, [theme, mounted, storageKey])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      console.log(`Cambiando tema a: ${newTheme}`)
      setTheme(newTheme)
    },
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
