"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api/client"
import { MainNavigation } from "@/components/main-navigation"
import { CliengoChat } from "@/components/cliengo-chat"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loading, error, clearError, isAuthenticated, initialized } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Obtener URL de redirección
  const redirectUrl = searchParams.get("redirect") || "/dashboard"

  // Redirigir si ya está autenticado (solo después de inicializado)
  useEffect(() => {
    if (initialized && isAuthenticated && !isSubmitting) {
      router.replace(redirectUrl)
    }
  }, [initialized, isAuthenticated, isSubmitting, redirectUrl, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!email || !password || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    const result = await login({ email, password })

    if (result.success) {
      router.replace(redirectUrl)
    } else {
      setIsSubmitting(false)
    }
  }

  // Mostrar loading mientras se inicializa
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si está autenticado, mostrar loading de redirección
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex flex-col min-h-screen">
      <CliengoChat />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#f0f6f7] to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-5xl font-bold text-[#000000] mb-6">Iniciar sesión</h1>
              
              {/* Título principal con diseño elegante */}
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Accede a tu cuenta en <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">nanoMED</span>
                </h2>
              </div>

              {/* Descripción principal */}
              <div className="max-w-4xl mx-auto mb-8">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  Conecta con tu salud digital y accede a todos nuestros servicios médicos
                </p>
              </div>

              {/* Información adicional con diseño premium */}
              <div className="max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-full border border-[#59c3ed]/20">
                  <div className="w-2 h-2 bg-[#59c3ed] rounded-full"></div>
                  <p className="text-lg text-gray-700 font-medium">
                    Acceso seguro y rápido a tu historial médico, citas y resultados
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de login con diseño moderno */}
            <div className="flex justify-center mb-16">
              <div className="w-full max-w-md">
                <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
                  {/* Efectos de fondo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/5 via-transparent to-[#479cd0]/5"></div>
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-[#59c3ed]/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#479cd0]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                  </div>
                  
                  {/* Contenido del formulario */}
                  <div className="relative z-10 px-8 py-12">
                    <div className="flex justify-center mb-8">
                      <Image src="/images/logo.svg" alt="nanoMED" width={180} height={45} className="h-12 w-auto" />
                    </div>

                    {error && (
                      <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                      </Alert>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Correo electrónico
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="correo@ejemplo.com"
                          className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Contraseña
                          </label>
                          <Link href="/forgot-password" className="text-sm text-[#59c3ed] hover:text-[#479cd0] transition-colors">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                        <div className="relative">
                        <Input
                          id="password"
                            type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300 pr-12"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          disabled={loading}
                        />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Recordar mi sesión
                        </label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        disabled={loading || !email || !password}
                      >
                        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                      </Button>
                    </form>

                    <div className="mt-8 text-center">
                      <p className="text-sm text-gray-600">
                        ¿No tienes una cuenta?{" "}
                        <Link href="/registro" className="text-[#59c3ed] hover:text-[#479cd0] font-semibold transition-colors">
                          Regístrate aquí
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Seguridad */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                            Acceso seguro
                          </h4>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed text-justify">
                          Tus datos están protegidos con <span className="font-semibold text-[#59c3ed]">encriptación de nivel bancario</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acceso rápido */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                            Acceso rápido
                          </h4>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed text-justify">
                          <span className="font-semibold text-[#59c3ed]">Inicia sesión en segundos</span> y accede a todos tus servicios médicos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Soporte 24/7 */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                            Soporte 24/7
                          </h4>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed text-justify">
                          <span className="font-semibold text-[#59c3ed]">Asistencia técnica disponible</span> cuando la necesites
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <Image src="/images/webclip.png" alt="nanoMED" width={150} height={40} className="mb-4" />
              <p className="text-gray-400 mb-4 text-justify">
                En nanoMED Ilevamos salud de calidad a empresas y comunidades rurales, con tecnología avanzada y
                atención donde más se necesita.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/nanoMedcl"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/nanomed.clinica/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/nano-med-1/posts/?feedView=all/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/especialidades" className="text-gray-400 hover:text-white transition-colors">
                    Especialidades
                  </Link>
                </li>
                <li>
                  <Link href="/salud-ocupacional" className="text-gray-400 hover:text-white transition-colors">
                    Salud Ocupacional
                  </Link>
                </li>
                <li>
                  <Link href="/requisitos-examenes" className="text-gray-400 hover:text-white transition-colors">
                    Requisitos Exámenes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Imagenología
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Laboratorio
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Telemedicina
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Salud Ocupacional
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-400 flex-shrink-0"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-gray-400">José Joaquín Pérez #240, Salamanca, Chile.</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-400 flex-shrink-0"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="text-gray-400">+56 9 8828 9770</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-400 flex-shrink-0"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="text-gray-400">contacto@nanomed.cl</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} nanoMED. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
