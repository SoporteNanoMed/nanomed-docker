"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Calendar,
  MessageSquare,
  User,
  Menu,
  X,
  Shield,
  Users,
  UserCheck,
  UserCog,
  BarChart3,
  CalendarPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProfileImage } from "@/components/ui/profile-image"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { getAvailableRoutes, getRoleName, canAccessRoute } from "@/lib/utils/permissions"

// Mapeo de iconos
const iconMap = {
  LayoutDashboard,
  FileText,
  Calendar,
  MessageSquare,
  User,
  Shield,
  Users,
  UserCheck,
  UserCog,
  BarChart3,
  CalendarPlus,
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, initialized, isAuthenticated, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // Efecto para redirección - simplificado
  useEffect(() => {
    // Solo verificar después de inicializado
    if (initialized && !isAuthenticated && !redirecting) {
      setRedirecting(true)
      // Usar replace en lugar de push para evitar bucles
      router.replace("/login?redirect=" + encodeURIComponent(pathname))
    }
  }, [initialized, isAuthenticated, redirecting, router, pathname])

  // Verificar acceso a la ruta actual - simplificado
  useEffect(() => {
    if (initialized && user && !canAccessRoute(user, pathname)) {
      router.replace("/dashboard")
    }
  }, [initialized, user, pathname, router])

  // Obtener rutas de navegación según el rol del usuario
  const navigation = user
    ? getAvailableRoutes(user).map((route) => ({
        ...route,
        current: pathname === route.href,
        icon: iconMap[route.icon as keyof typeof iconMap] || LayoutDashboard,
      }))
    : []

  // Mostrar loading mientras se verifica la autenticación
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si está redirigiendo, mostrar mensaje
  if (redirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado después de inicializado, no mostrar nada
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Para usuarios API, no mostrar sidebar */}
      {user && user.role === "api" ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none p-6 bg-background">
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Usuario Corporativo API
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Este usuario es para uso corporativo vía API y no posee perspectivas visuales.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <>
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden fixed top-16 left-4 z-40">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-sidebar border-sidebar-border"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          {/* Sidebar for mobile */}
          <div
            className={`fixed inset-0 z-30 lg:hidden transform ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out pt-16`}
          >
            <div className="relative flex flex-col w-72 h-full max-w-xs bg-sidebar border-sidebar-border border-r">
              <div className="flex items-center justify-center h-16 px-6 border-sidebar-border border-b">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-sidebar-foreground">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Dashboard</span>
                  </span>
                </div>
              </div>

              {/* User info */}
              {user && (
                <div className="p-4 border-sidebar-border border-b bg-sidebar-muted">
                  <div className="flex items-center gap-3">
                    <ProfileImage
                      src={user.foto_perfil || user.avatar}
                      alt={`${user.nombre} ${user.apellido}`}
                      fallback={`${user.nombre?.[0] || ""}${user.apellido?.[0] || ""}`}
                      size="sm"
                      className="h-10 w-10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user.nombre} {user.apellido}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getRoleName(user.role)}
                        </Badge>
                        {user.email_verified && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            Verificado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex-1 px-4 space-y-2">
                  {navigation.map((item) => {
                    const IconComponent = item.icon
                    
                    if (item.disabled) {
                      return (
                        <div
                          key={item.name}
                          className="flex items-center px-4 py-3 text-sm font-medium rounded-xl opacity-50 cursor-not-allowed relative text-sidebar-foreground"
                          title="Función disponible próximamente"
                        >
                          <IconComponent className="mr-3 h-5 w-5 text-sidebar-foreground" />
                          <span className="flex-1">{item.name}</span>
                          {item.comingSoon && (
                            <Badge variant="outline" className="text-xs ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              Próximamente
                            </Badge>
                          )}
                        </div>
                      )
                    }
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 ${
                          item.current
                            ? "bg-gradient-to-r from-[#59c3ed] to-[#479cd0] text-white shadow-lg"
                            : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-[#59c3ed] hover:to-[#479cd0] hover:text-white hover:shadow-lg"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <IconComponent className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>

          {/* Static sidebar for desktop */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-72">
              <div className="flex flex-col flex-grow bg-sidebar border-sidebar-border border-r pt-16">
                <div className="flex items-center justify-center h-16 px-6 border-sidebar-border border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-sidebar-foreground">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Dashboard</span>
                    </span>
                  </div>
                </div>

                {/* User info */}
                {user && (
                  <div className="p-4 border-sidebar-border border-b bg-sidebar-muted">
                    <div className="flex items-center gap-3">
                      <ProfileImage
                        src={user.foto_perfil || user.avatar}
                        alt={`${user.nombre} ${user.apellido}`}
                        fallback={`${user.nombre?.[0] || ""}${user.apellido?.[0] || ""}`}
                        size="sm"
                        className="h-10 w-10"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">
                          {user.nombre} {user.apellido}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getRoleName(user.role)}
                          </Badge>
                          {user.email_verified && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              Verificado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto py-4">
                  <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => {
                      const IconComponent = item.icon
                      
                      if (item.disabled) {
                        return (
                          <div
                            key={item.name}
                            className="flex items-center px-4 py-3 text-sm font-medium rounded-xl opacity-50 cursor-not-allowed relative text-sidebar-foreground"
                            title="Función disponible próximamente"
                          >
                            <IconComponent className="mr-3 h-5 w-5 text-sidebar-foreground" />
                            <span className="flex-1">{item.name}</span>
                            {item.comingSoon && (
                              <Badge variant="outline" className="text-xs ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                Próximamente
                              </Badge>
                            )}
                          </div>
                        )
                      }
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 ${
                            item.current
                              ? "bg-gradient-to-r from-[#59c3ed] to-[#479cd0] text-white shadow-lg"
                              : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-[#59c3ed] hover:to-[#479cd0] hover:text-white hover:shadow-lg"
                          }`}
                        >
                          <IconComponent className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col flex-1 overflow-hidden pt-16">
            <main className="flex-1 relative overflow-y-auto focus:outline-none p-6 bg-background">{children}</main>
          </div>
        </>
      )}
    </div>
  )
}
