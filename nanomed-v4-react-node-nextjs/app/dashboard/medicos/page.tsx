"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorAlert } from "@/components/ui/error-alert"
import { 
  Search, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Star, 
  RefreshCw, 
  Phone, 
  MapPin,
  Stethoscope, 
  Building2, 
  MessageCircle, 
  Zap, 
  Building, 
  Users, 
  Activity, 
  Heart, 
  Volume2, 
  Apple, 
  Baby, 
  Brain, 
  Smile, 
  HeartHandshake, 
  Bone, 
  Sun, 
  Eye, 
  Flower, 
  Dumbbell, 
  Moon
} from "lucide-react"

interface RawDoctor {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  especialidad?: string
  tipo_registro: "medico" | "legacy"
  role?: "medico"
  activo?: boolean
  email_verified?: boolean
  foto_perfil?: string | null
  fuente: "usuarios" | "medicos_legacy"
  creado_en?: string
  actualizado_en?: string
}

interface MergedDoctor {
  id: string // Usamos email como ID único
  nombre: string
  apellido: string
  email: string
  telefono?: string
  especialidad: string
  activo: boolean
  foto_perfil?: string
  email_verified: boolean
  fuente_principal: "usuarios" | "medicos_legacy"
  tiene_cuenta_usuario: boolean
  creado_en?: string
}

interface DoctorsResponse {
  error: boolean
  status: number
  body: {
    medicos: RawDoctor[]
    total: number
    filtros_aplicados: Record<string, any>
  }
}

interface CachedData {
  doctors: MergedDoctor[]
  timestamp: number
}

const CACHE_KEY = "doctors_cache"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Función para obtener el icono correspondiente a cada especialidad
const getEspecialidadIcon = (nombre: string) => {
  // Extraer la especialidad principal (antes del "/")
  const especialidadPrincipal = nombre.split('/')[0]?.trim() || nombre.trim()
  
  const iconMap: Record<string, any> = {
    "Medicina General": Stethoscope,
    "Kinesiología": Activity,
    "Kinesiología de Piso Pélvico": Flower,
    "Fonoaudiología": Volume2,
    "Nutrición": Apple,
    "Nutrición y Dietética": Apple,
    "Matrona": Baby,
    "Psicología Adulta": Brain,
    "Pediatría": Smile,
    "Psicología Infanto-Juvenil": Users,
    "Medicina Interna": HeartHandshake,
    "Traumatología y Ortopedia": Bone,
    "Cardiología": Heart,
    "Dermatología": Sun,
    "Neurología": Brain,
    "Oftalmología": Eye,
    "Ginecología": Flower,
    "Psiquiatría Pediátrica y Adolescencia": Users,
    "Psiquiatría Adulto": Brain,
    "Nutrición Deportiva": Dumbbell,
    "Terapia del Sueño": Moon,
  }
  
  return iconMap[especialidadPrincipal] || Stethoscope // Fallback al estetoscopio
}

export default function DashboardMedicosPage() {
  const [doctors, setDoctors] = useState<MergedDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [especialidadFilter, setEspecialidadFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Especialidades a omitir
  const especialidadesOmitidas = ["Tecnólogo Médico", "TENS", "Enfermería"]

  // Función para mergear doctores duplicados
  const mergeDoctors = useCallback((rawDoctors: RawDoctor[]): MergedDoctor[] => {
    const doctorMap = new Map<string, MergedDoctor>()

    rawDoctors.forEach((doctor) => {
      const email = doctor.email.toLowerCase()

      if (doctorMap.has(email)) {
        // Doctor ya existe, mergear información
        const existing = doctorMap.get(email)!

        // Priorizar información de usuarios sobre legacy
        if (doctor.fuente === "usuarios") {
          existing.telefono = doctor.telefono || existing.telefono
          existing.foto_perfil = doctor.foto_perfil || existing.foto_perfil
          existing.email_verified = doctor.email_verified ?? existing.email_verified
          existing.tiene_cuenta_usuario = true
          existing.fuente_principal = "usuarios"
          existing.creado_en = doctor.creado_en || existing.creado_en
        } else if (doctor.fuente === "medicos_legacy") {
          // Solo actualizar si no tenemos especialidad
          if (!existing.especialidad && doctor.especialidad) {
            existing.especialidad = doctor.especialidad
          }
          // Solo actualizar activo si no está definido
          if (existing.activo === undefined) {
            existing.activo = doctor.activo ?? true
          }
        }
      } else {
        // Nuevo doctor
        const mergedDoctor: MergedDoctor = {
          id: email,
          nombre: doctor.nombre,
          apellido: doctor.apellido,
          email: doctor.email,
          telefono: doctor.telefono || undefined,
          especialidad: doctor.especialidad || "Especialidad no especificada",
          activo: doctor.activo ?? true,
          foto_perfil: doctor.foto_perfil || undefined,
          email_verified: doctor.email_verified ?? false,
          fuente_principal: doctor.fuente,
          tiene_cuenta_usuario: doctor.fuente === "usuarios",
          creado_en: doctor.creado_en,
        }

        doctorMap.set(email, mergedDoctor)
      }
    })

    return Array.from(doctorMap.values()).sort((a, b) =>
      `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`),
    )
  }, [])

  // Función para obtener datos del cache
  const getCachedData = useCallback((): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const data: CachedData = JSON.parse(cached)
      const now = Date.now()

      if (now - data.timestamp < CACHE_DURATION) {
        return data
      }

      localStorage.removeItem(CACHE_KEY)
      return null
    } catch (error) {
      // Error silencioso al leer cache
      localStorage.removeItem(CACHE_KEY)
      return null
    }
  }, [])

  // Función para guardar datos en cache
  const setCachedData = useCallback((doctors: MergedDoctor[]) => {
    try {
      const data: CachedData = {
        doctors,
        timestamp: Date.now(),
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (error) {
      // Error silencioso al guardar cache
    }
  }, [])

  // Función para hacer la petición al API
  const fetchDoctors = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true)
        setError(null)

        if (!forceRefresh) {
          const cachedData = getCachedData()
          if (cachedData) {
            // Usando datos del cache
            setDoctors(cachedData.doctors)
            setLoading(false)
            return
          }
        }

        const token = localStorage.getItem("auth_access_token")

        if (!token) {
          throw new Error("No se encontró token de autenticación")
        }

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }

        // Obteniendo médicos desde la API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors`, {
          method: "GET",
          headers,
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("No autorizado. Por favor, inicia sesión nuevamente.")
          }
          if (response.status === 429) {
            const cachedData = getCachedData()
            if (cachedData) {
              // Límite de peticiones alcanzado, usando cache expirado
              setDoctors(cachedData.doctors)
              setError("Demasiadas peticiones. Mostrando datos guardados.")
              return
            }
            throw new Error("Demasiadas peticiones. Por favor, espera un momento antes de intentar nuevamente.")
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data: DoctorsResponse = await response.json()

        if (data.error) {
          throw new Error("Error al obtener los médicos")
        }

        const rawDoctors = data.body.medicos || []
        const mergedDoctors = mergeDoctors(rawDoctors)

        setDoctors(mergedDoctors)
        setCachedData(mergedDoctors)
        // Datos obtenidos y almacenados en cache exitosamente
      } catch (err: any) {
        // Error silencioso al obtener médicos

        const cachedData = getCachedData()
        if (cachedData) {
          // Error ocurrido, usando datos del cache
          setDoctors(cachedData.doctors)
          setError(`${err.message} (Mostrando datos guardados)`)
        } else {
          setError(err.message || "Error al cargar los médicos")
        }
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    },
    [getCachedData, setCachedData, mergeDoctors],
  )

  // Función para refrescar datos
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await fetchDoctors(true)
  }, [fetchDoctors])

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  if (loading && doctors.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Profesionales de la salud</h1>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // Extraer especialidades únicas para el filtro (omitiendo especialidades específicas)
  const especialidades = Array.from(new Set(doctors.map((doctor) => doctor.especialidad)))
    .filter((esp) => esp && esp !== "Especialidad no especificada" && !especialidadesOmitidas.includes(esp))
    .sort()

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      !searchTerm ||
      doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.especialidad.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEspecialidad =
      especialidadFilter === "all" || !especialidadFilter || doctor.especialidad === especialidadFilter

    // Omitir especialidades específicas
    const noEsEspecialidadOmitida = !especialidadesOmitidas.includes(doctor.especialidad)

    return matchesSearch && matchesEspecialidad && doctor.activo && noEsEspecialidadOmitida
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Profesionales</span> de la salud
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Encuentra y contacta con nuestros profesionales de la salud de forma integral
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing} 
          variant="outline" 
          size="sm"
          className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <ErrorAlert
          title="Aviso"
          message={error}
          variant={error.includes("Mostrando datos guardados") ? "warning" : "destructive"}
        />
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/5 to-[#479cd0]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#59c3ed] group-hover:text-[#479cd0] transition-colors duration-300" />
              <Input
                placeholder="Buscar por nombre o especialidad..."
                className="pl-9 bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={especialidadFilter} onValueChange={setEspecialidadFilter}>
              <SelectTrigger className="w-[180px] bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300">
                <SelectValue placeholder="Filtrar por especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las especialidades</SelectItem>
                {especialidades.map((esp) => (
                  <SelectItem key={esp} value={esp}>
                    {esp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profesionales</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.filter((d) => !especialidadesOmitidas.includes(d.especialidad)).length}</div>
            <p className="text-xs text-muted-foreground">Profesionales registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.filter((d) => d.activo && !especialidadesOmitidas.includes(d.especialidad)).length}</div>
            <p className="text-xs text-muted-foreground">Actualmente activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{especialidades.length}</div>
            <p className="text-xs text-muted-foreground">Diferentes especialidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Cuenta</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.filter((d) => d.tiene_cuenta_usuario && !especialidadesOmitidas.includes(d.especialidad)).length}</div>
            <p className="text-xs text-muted-foreground">Cuentas verificadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Resultados */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {filteredDoctors.length === 0
            ? "No se encontraron profesionales con los criterios seleccionados"
            : `Mostrando ${filteredDoctors.length} profesional${filteredDoctors.length !== 1 ? "es" : ""}`}
        </p>
      </div>

      {/* Grid de Médicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              {/* Header con médico y estado */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-lg">
                    {(() => {
                      const IconComponent = getEspecialidadIcon(doctor.especialidad)
                      return <IconComponent className="w-5 h-5 text-[#59c3ed]" />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Dr. {doctor.nombre} {doctor.apellido}</h3>
                    <p className="text-sm text-gray-600">{doctor.especialidad}</p>
                  </div>
                </div>
                <Badge 
                  variant={doctor.activo ? "default" : "secondary"} 
                  className={doctor.activo ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}
                >
                  {doctor.activo ? "Disponible" : "No disponible"}
                </Badge>
              </div>
              

              

            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {filteredDoctors.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-16">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron profesionales</h3>
            <p className="text-muted-foreground mb-6">
              Intenta ajustar los filtros de búsqueda o contacta con nosotros para más información.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setEspecialidadFilter("all")
              }}
            >
              Limpiar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
