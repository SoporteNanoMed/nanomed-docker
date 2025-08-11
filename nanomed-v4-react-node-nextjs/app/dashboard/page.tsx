"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Bell, AlertCircle, Clock, ImageIcon, Activity, Building, Users, Heart, Zap, Shield } from "lucide-react"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { examsService } from "@/lib/api/services/exams.service"
import { appointmentsService } from "@/lib/api/services/appointments.service"
import { format, parseISO, isAfter, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import { formatearHoraChile, formatearSoloFechaChile } from "@/lib/utils/dateUtils"
import { CliengoChat } from "@/components/cliengo-chat"

// Interfaces para los datos
interface ExamenReciente {
  id: string
  titulo: string
  fecha: string
  tipo: "imagen" | "pdf"
  medico: string
  thumbnail?: string
}

interface CitaProxima {
  id: string
  medico: string
  especialidad: string
  fecha: string
  hora: string
  lugar: string
  estado: string
}

interface NotificacionReciente {
  id: number
  tipo: string
  titulo: string
  mensaje: string
  fecha: string
  leida: boolean
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [showMedicoAlert, setShowMedicoAlert] = useState(false)

  // Estados para exámenes
  const [examenesRecientes, setExamenesRecientes] = useState<ExamenReciente[]>([])
  const [loadingExamenes, setLoadingExamenes] = useState(true)

  // Estados para citas
  const [citasProximas, setCitasProximas] = useState<CitaProxima[]>([])
  const [loadingCitas, setLoadingCitas] = useState(true)

  // Estados para notificaciones
  const [notificacionesRecientes, setNotificacionesRecientes] = useState<NotificacionReciente[]>([])
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(true)

  // Función para adaptar exámenes del API
  const adaptarExamenDesdeAPI = (examenAPI: any): ExamenReciente => {
    let tipo: "imagen" | "pdf" = "pdf"
    if (examenAPI.archivo_path) {
      const extension = examenAPI.archivo_path.toLowerCase().split(".").pop()
      if (extension && ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
        tipo = "imagen"
      }
    }

    return {
      id: examenAPI.id?.toString() || "",
      titulo: examenAPI.tipo_examen || "Examen médico",
      fecha: examenAPI.fecha
        ? new Date(examenAPI.fecha).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      tipo: tipo,
      medico: examenAPI.nombre_medico || "Médico no especificado",
      thumbnail: tipo === "imagen" ? examenAPI.archivo_path : undefined,
    }
  }

  // Función para adaptar citas del API
  const adaptarCitaDesdeAPI = (cita: any): CitaProxima => {
    return {
      id: cita.id.toString(),
      medico: `Dr. ${cita.nombre_medico}`,
      especialidad: cita.especialidad,
      fecha: formatearSoloFechaChile(cita.fecha_hora),
      hora: formatearHoraChile(cita.fecha_hora),
      lugar: cita.lugar,
      estado: cita.estado === "confirmada" ? "programada" : cita.estado,
    }
  }

  // Cargar exámenes recientes
  useEffect(() => {
    const cargarExamenesRecientes = async () => {
      try {
        setLoadingExamenes(true)
        const response = await examsService.getExams()

        if (!response.error && response.body.examenes) {
          const examenesAdaptados = response.body.examenes.map(adaptarExamenDesdeAPI).slice(0, 3) // Solo los 3 más recientes
          setExamenesRecientes(examenesAdaptados)
        }
      } catch (error) {
        // Error silencioso al cargar exámenes recientes
      } finally {
        setLoadingExamenes(false)
      }
    }

    // Cargar exámenes para todos los usuarios
    if (user) {
      cargarExamenesRecientes()
    }
  }, [user])

  // Cargar próximas citas
  useEffect(() => {
    const cargarProximasCitas = async () => {
      try {
        setLoadingCitas(true)
        const response = await appointmentsService.getAppointments()

        if (!response.error && response.body.citas) {
          const citasAdaptadas = response.body.citas
            .map(adaptarCitaDesdeAPI)
            .filter((cita) => {
              // Solo citas futuras y programadas
              const fechaCita = parseISO(cita.fecha)
              const hoy = startOfDay(new Date())
              return isAfter(fechaCita, hoy) && (cita.estado === "programada" || cita.estado === "confirmada")
            })
            .slice(0, 3) // Solo las 3 próximas
          setCitasProximas(citasAdaptadas)
        }
      } catch (error) {
        // Error silencioso al cargar próximas citas
      } finally {
        setLoadingCitas(false)
      }
    }

    // Solo cargar citas si el usuario no es recepcionista
    if (user && user.role !== "recepcionista") {
      cargarProximasCitas()
    } else if (user && user.role === "recepcionista") {
      // Para recepcionistas, no cargar datos pero sí marcar como terminado el loading
      setLoadingCitas(false)
    }
  }, [user])

  // Cargar notificaciones recientes
  useEffect(() => {
    // Para todos los tipos de usuario, no cargar notificaciones ya que la función estará próximamente
    if (user) {
      setLoadingNotificaciones(false)
    }
  }, [user])

  // Mostrar skeleton solo si está cargando Y no hay usuario
  if (loading && !user) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatExamDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Hace 1 día"
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semana${Math.ceil(diffDays / 7) > 1 ? "s" : ""}`
    return date.toLocaleDateString("es-ES")
  }

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Hoy a las ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays === 1) {
      return `Ayer a las ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "cita":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "examen":
        return <FileText className="h-4 w-4 text-green-500" />
      case "mensaje":
        return <Bell className="h-4 w-4 text-purple-500" />
      case "sistema":
      default:
        return <Bell className="h-4 w-4 text-amber-500" />
    }
  }

  const handleAgendarCita = () => {
    if (user?.role === "medico") {
      setShowMedicoAlert(true)
    } else {
      // Redirigir a la página de agendar cita para otros roles
      window.location.href = "/dashboard/citas"
    }
  }

  return (
    <main className="flex flex-col min-h-screen">
      <CliengoChat />
      
      {/* Hero Section */}
      <section className="py-4 md:py-6 bg-gradient-to-b from-[#f0f6f7] to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              {/* Título principal con diseño elegante */}
              <h1 className="text-3xl md:text-5xl font-bold text-[#000000] mb-2">
                {user ? `${(user.genero || "").trim().toLowerCase() === "femenino" ? "Bienvenida" : "Bienvenido"}, ${user.nombre}` : "Bienvenido"} a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">nanoMED</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content Section */}
      <section className="py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título de sección */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">panel de control</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Gestiona tu información médica y mantén el control de tu salud de forma integral
              </p>
            </div>

            {/* Cards principales */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {/* Exámenes recientes */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                          Exámenes recientes
                        </h3>

                      </div>
                    </div>
                    
                    <div className="flex-1 mb-6">
                      {loadingExamenes ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ) : examenesRecientes.length > 0 ? (
                        <div className="space-y-3">
                          {examenesRecientes.map((examen) => (
                            <div key={examen.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                              <div className="flex-shrink-0">
                                {examen.tipo === "imagen" ? (
                                  examen.thumbnail ? (
                                    <div className="w-10 h-10 relative rounded overflow-hidden">
                                      <Image
                                        src={examen.thumbnail || "/placeholder.svg"}
                                        alt={examen.titulo}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <ImageIcon className="h-10 w-10 text-gray-400 p-2 bg-gray-100 rounded" />
                                  )
                                ) : (
                                  <FileText className="h-10 w-10 text-red-500 p-2 bg-red-50 rounded" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{examen.titulo}</p>
                                <p className="text-xs text-gray-500">{examen.medico}</p>
                                <p className="text-xs text-gray-400">{formatExamDate(examen.fecha)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">No hay exámenes recientes</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <Link href="/dashboard/examenes" className="w-full">
                        <Button variant="outline" className="w-full bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0">
                          Ver todos los exámenes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Próximas citas */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                          Próximas citas
                        </h3>
                        {user?.role === "recepcionista" && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Próximamente
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 mb-6">
                      {user?.role === "recepcionista" ? (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-sm font-semibold mb-2">Función Próximamente</h3>
                          <p className="text-xs text-muted-foreground">
                            La sección de próximas citas estará disponible próximamente.
                          </p>
                        </div>
                      ) : loadingCitas ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ) : citasProximas.length > 0 ? (
                        <div className="space-y-3">
                          {citasProximas.map((cita) => (
                            <div key={cita.id} className="p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{cita.medico}</p>
                                  <p className="text-xs text-gray-500">{cita.especialidad}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Calendar className="h-3 w-3 text-cyan-500" />
                                    <span className="text-xs">{format(parseISO(cita.fecha), "EEEE d 'de' MMMM", { locale: es })}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-cyan-500" />
                                    <span className="text-xs">{cita.hora}</span>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  Programada
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">No hay citas programadas</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      {user?.role === "recepcionista" ? (
                        <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" disabled>
                          Función no disponible
                        </Button>
                      ) : (
                        <Link href="/dashboard/citas" className="w-full">
                          <Button variant="outline" className="w-full bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0">
                            Ver todas las citas
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notificaciones */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Bell className="w-8 h-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                          Notificaciones
                        </h3>
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          Próximamente
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 mb-6">
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-sm font-semibold mb-2">Función Próximamente</h3>
                        <p className="text-xs text-muted-foreground">
                          La sección de notificaciones estará disponible próximamente.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" disabled>
                        Función no disponible
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Acciones <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">rápidas</span>
              </h3>
              <p className="text-lg text-gray-600">
                Accede a las funciones más importantes de tu cuenta
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user?.role === "recepcionista" ? (
                <div className="group relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 opacity-50 cursor-not-allowed h-24 flex items-center">
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-500 flex items-center gap-2">
                          Agendar Cita
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Próximamente
                          </Badge>
                        </h3>
                        <p className="text-sm text-gray-400">Función no disponible</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="group relative cursor-pointer h-full" onClick={handleAgendarCita}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-24 flex items-center">
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium group-hover:text-[#59c3ed] transition-colors duration-300">Agendar Cita</h3>
                        <p className="text-sm text-gray-600">Programa una nueva cita</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Link href="/dashboard/examenes" className="h-full">
                <div className="group relative cursor-pointer h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-24 flex items-center">
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium group-hover:text-[#59c3ed] transition-colors duration-300">Ver Exámenes</h3>
                        <p className="text-sm text-gray-600">Revisa tus resultados</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/perfil" className="h-full">
                <div className="group relative cursor-pointer h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-24 flex items-center">
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium group-hover:text-[#59c3ed] transition-colors duration-300">Mi Perfil</h3>
                        <p className="text-sm text-gray-600">Actualiza tu información</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/requisitos-examenes" className="h-full">
                <div className="group relative cursor-pointer h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-24 flex items-center">
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium group-hover:text-[#59c3ed] transition-colors duration-300">Requisitos Exámenes</h3>
                        <p className="text-sm text-gray-600">Consulta los requisitos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diálogo para médicos que intentan agendar citas */}
      <Dialog open={showMedicoAlert} onOpenChange={setShowMedicoAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Función no disponible</DialogTitle>
            <DialogDescription>
              Como médico, no puedes agendar citas directamente. Por favor, contacta a recepción para programar citas.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-600">
                Esta sección está desactivada para médicos. Las citas deben solicitarse a través de recepción.
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowMedicoAlert(false)}>Entendido</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
