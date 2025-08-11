import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNavigation } from "@/components/main-navigation"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "nanoMED - Salud de Vanguardia con Tecnología e Inteligencia Artificial",
  description:
    "Llevamos atención médica avanzada a donde más se necesita, combinando la telemedicina y la inteligencia artificial para todos.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <MainNavigation />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
