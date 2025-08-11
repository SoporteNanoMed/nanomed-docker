"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, Home, Building2, Shield, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { ThemeSelector } from "@/components/theme-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, checkAuth } = useAuth()

  // Determinar si estamos en la página principal
  const isHomePage = pathname === "/"

  // Verificar autenticación al montar el componente y cuando cambie la URL
  useEffect(() => {
    checkAuth()
  }, [checkAuth, pathname])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])



  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src={isScrolled || !isHomePage ? "/images/logo.svg" : "/images/webclip.png"}
                alt="nanoMED"
                width={120}
                height={30}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              // Menú desplegable para usuarios logueados
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center space-x-1 text-sm font-medium ${
                      isScrolled || !isHomePage ? "text-gray-700 hover:text-cyan-500" : "text-white hover:text-gray-200"
                    } transition-colors`}
                  >
                    <span>Inicio</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/" className="flex items-center space-x-2 w-full">
                      <Home className="h-4 w-4" />
                      <span>Inicio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/especialidades" className="flex items-center space-x-2 w-full">
                      <Building2 className="h-4 w-4" />
                      <span>Especialidades médicas</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/salud-ocupacional" className="flex items-center space-x-2 w-full">
                      <Shield className="h-4 w-4" />
                      <span>Salud ocupacional</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/requisitos-examenes" className="flex items-center space-x-2 w-full">
                      <FileText className="h-4 w-4" />
                      <span>Requisitos exámenes</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Enlaces individuales para usuarios no logueados
              <>
                <Link
                  href="/"
                  className={`text-sm font-medium ${
                    isScrolled || !isHomePage ? "text-gray-700 hover:text-cyan-500" : "text-white hover:text-gray-200"
                  } transition-colors`}
                >
                  Inicio
                </Link>
                <Link
                  href="/especialidades"
                  className={`text-sm font-medium ${
                    isScrolled || !isHomePage ? "text-gray-700 hover:text-cyan-500" : "text-white hover:text-gray-200"
                  } transition-colors`}
                >
                  Especialidades médicas
                </Link>
                <Link
                  href="/salud-ocupacional"
                  className={`text-sm font-medium ${
                    isScrolled || !isHomePage ? "text-gray-700 hover:text-cyan-500" : "text-white hover:text-gray-200"
                  } transition-colors`}
                >
                  Salud ocupacional
                </Link>
                <Link
                  href="/requisitos-examenes"
                  className={`text-sm font-medium ${
                    isScrolled || !isHomePage ? "text-gray-700 hover:text-cyan-500" : "text-white hover:text-gray-200"
                  } transition-colors`}
                >
                  Requisitos exámenes
                </Link>
              </>
            )}

            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-medium ${isScrolled || !isHomePage ? "text-gray-700" : "text-white"}`}>
                  {user?.name || user?.email}
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button
                    variant={isScrolled || !isHomePage ? "outline" : "outline"}
                    className={
                      isScrolled || !isHomePage
                        ? "border-[#59c3ed] text-[#59c3ed] hover:bg-[#59c3ed]/10 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        : "bg-white text-gray-900 hover:bg-gray-100"
                    }
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant={isScrolled || !isHomePage ? "default" : "outline"}
                  className={
                    isScrolled || !isHomePage
                      ? "bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                  }
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant={isScrolled || !isHomePage ? "default" : "outline"}
                  className={
                    isScrolled || !isHomePage
                      ? "bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                  }
                >
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={isScrolled || !isHomePage ? "text-gray-700" : "text-white"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Enlaces de páginas principales */}
            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-700 hover:text-cyan-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Inicio</span>
              </Link>
              <Link
                href="/especialidades"
                className="flex items-center space-x-2 text-gray-700 hover:text-cyan-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Building2 className="h-4 w-4" />
                <span>Especialidades médicas</span>
              </Link>
              <Link
                href="/salud-ocupacional"
                className="flex items-center space-x-2 text-gray-700 hover:text-cyan-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                <span>Salud ocupacional</span>
              </Link>
              <Link
                href="/requisitos-examenes"
                className="flex items-center space-x-2 text-gray-700 hover:text-cyan-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                <span>Requisitos exámenes</span>
              </Link>
            </div>

            {!isAuthenticated && (
              <div className="py-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 font-medium">Tema</p>
                  <ThemeSelector />
                </div>
              </div>
            )}

            {isAuthenticated && (
              <>
                <div className="py-3 border-t border-gray-100">
                  <p className="text-gray-700 font-medium">Hola, {user?.name || user?.email}</p>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex items-center">
                <ThemeSelector className={isScrolled || !isHomePage ? "text-gray-700" : "text-white"} />
              </div>
            )}

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className={
                      isScrolled || !isHomePage
                        ? "border-[#59c3ed] text-[#59c3ed] hover:bg-[#59c3ed]/10 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        : "bg-white text-gray-900 hover:bg-gray-100"
                    }
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  className="bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleLogout()
                  }}
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">Iniciar Sesión</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
