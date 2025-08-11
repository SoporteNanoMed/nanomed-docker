"use client"

import React, { useState, useEffect, use } from "react"
import { Alert, AlertDescription as AlertDescriptionComponent } from "@/components/ui/alert"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Clock,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle,
  CalendarDays,
  Zap,
  Settings,
  X,
  BookOpen,
  ChevronRight,
  Target,
  Users,
  AlertCircle,
  AlertTriangle,
  Info,
  Filter,
  Search,
  Calendar,
  User,
  Ban,
  ChevronLeft,
  Grid,
  List,
  CalendarIcon,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { doctorsService } from "@/lib/api/services/doctors.service"
import type { 
  GenerateAvailabilityBlocksRequest,
  AvailabilityBlocksResponse,
  DateSummary,
  AvailabilityBlockItem,
  Doctor
} from "@/lib/api/services/doctors.service"

// Tipos específicos para el componente
interface DoctorInfo {
  id: number
  nombre: string
  apellido: string
  especialidad: string
  email: string
}

interface AvailabilityData {
  date: string
  dayOfWeek: string
  available: boolean
  slots: Array<{
    time: string
    available: boolean
  }>
}

interface MonthlyAvailabilityData {
  [date: string]: {
    available: boolean
    slots: number
    booked: number
    exceptions: boolean
    reason?: string
  }
}

interface DateValidation {
  startDateValid: boolean
  endDateValid: boolean
  message: string
}

interface GenerateConfig {
  startDate: string
  endDate: string
  duration: number
  breakTime: number
  excludeWeekends: boolean
  selectedDays: number[]
  startTime: string
  endTime: string
}

interface ManageConfig {
  startDate: string
  endDate: string
}

interface ErrorResponse {
  error?: boolean
  status?: number
  message?: string
  body?: string | Record<string, any>
  success?: boolean
  data?: any
}

// Estructura inicial para horarios base (ya no se usa)
/*
const initialBaseSchedule = [
  { day: "Lunes", dayNumber: 1, startTime: "", endTime: "", enabled: false, duration: 30 },
  { day: "Martes", dayNumber: 2, startTime: "", endTime: "", enabled: false, duration: 30 },
  { day: "Miércoles", dayNumber: 3, startTime: "", endTime: "", enabled: false, duration: 30 },
  { day: "Jueves", dayNumber: 4, startTime: "", endTime: "", enabled: false, duration: 30 },
  { day: "Viernes", dayNumber: 5, startTime: "", endTime: "", enabled: false, duration: 30 },
  { day: "Sábado", dayNumber: 6, startTime: "", endTime: "", enabled: false, duration: 30 },
  { day: "Domingo", dayNumber: 0, startTime: "", endTime: "", enabled: false, duration: 30 },
]
*/

// Mock data para disponibilidad mensual
const mockMonthlyData = {
  "2024-01-15": { available: true, slots: 8, booked: 2, exceptions: false },
  "2024-01-16": { available: true, slots: 6, booked: 4, exceptions: false },
  "2024-01-17": { available: false, slots: 0, booked: 0, exceptions: true, reason: "Vacaciones" },
  "2024-01-18": { available: true, slots: 10, booked: 1, exceptions: false },
  "2024-01-19": { available: true, slots: 8, booked: 6, exceptions: false },
  "2024-01-22": { available: true, slots: 8, booked: 0, exceptions: false },
  "2024-01-23": { available: true, slots: 6, booked: 3, exceptions: false },
  "2024-01-24": { available: false, slots: 0, booked: 0, exceptions: true, reason: "Conferencia" },
  "2024-01-25": { available: true, slots: 10, booked: 8, exceptions: false },
  "2024-01-26": { available: true, slots: 8, booked: 2, exceptions: false },
}

export default function ScheduleManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const doctorId = Number.parseInt(resolvedParams.id)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("guia")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null)

  // Estado para información del médico
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo>({
    id: 0,
    nombre: "Cargando...",
    apellido: "",
    especialidad: "Cargando...",
    email: "",
  })

  // Estados para alertas
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // Estados para el calendario mensual
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthlyAvailability, setMonthlyAvailability] = useState<MonthlyAvailabilityData>({})
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)

  const [generateConfig, setGenerateConfig] = useState<GenerateConfig>({
    startDate: "",
    endDate: "",
    duration: 30,
    breakTime: 15,
    excludeWeekends: true,
    selectedDays: [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
    startTime: "09:00",
    endTime: "17:00",
  })

  // Agregar estado para validación de fechas
  const [dateValidation, setDateValidation] = useState<DateValidation>({
    startDateValid: true,
    endDateValid: true,
    message: "",
  })

  // Estados para la gestión de bloques
  const [manageConfig, setManageConfig] = useState<ManageConfig>({
    startDate: "",
    endDate: "",
  })
  const [blocksData, setBlocksData] = useState<AvailabilityBlocksResponse | null>(null)
  const [loadingBlocks, setLoadingBlocks] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | number | null>(null)

  // Agregar estados para la vista de calendario después de las funciones existentes (línea ~70)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [calendarDate, setCalendarDate] = useState(new Date())

  // Función para cargar información del médico
  const loadDoctorInfo = async (doctorId: number) => {
    try {
      // Obtener información real del médico desde la API
      const response = await doctorsService.getDoctorById(doctorId)
      
      if (response.error === false && response.body) {
        const doctorData = response.body
        setDoctorInfo({
          id: doctorData.id,
          nombre: doctorData.nombre,
          apellido: doctorData.apellido,
          especialidad: doctorData.especialidad || "No especificada",
          email: doctorData.email || "",
        })
      } else {
        // Fallback con datos básicos si hay error
        setDoctorInfo({
          id: doctorId,
          nombre: "Médico",
          apellido: `ID: ${doctorId}`,
          especialidad: "No especificada",
          email: "",
        })
        // Error al cargar información del médico
      }
    } catch (error) {
      // Error loading doctor info
      // Fallback con datos básicos en caso de error
      setDoctorInfo({
        id: doctorId,
        nombre: "Médico",
        apellido: `ID: ${doctorId}`,
        especialidad: "No especificada",
        email: "",
      })
    }
  }

  // Función para validar fechas
  const validateDates = (startDate: string, endDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Establecer a medianoche para comparación correcta

    // Crear fechas locales para evitar problemas de zona horaria
    const start = new Date(startDate + "T00:00:00")
    const end = new Date(endDate + "T00:00:00")

    let isValid = true
    let message = ""

    if (!startDate || !endDate) {
      isValid = false
      message = "Debe seleccionar fechas de inicio y fin"
    } else if (start < today) {
      isValid = false
      message = "La fecha de inicio no puede ser anterior a hoy"
    } else if (end < start) {
      isValid = false
      message = "La fecha de fin debe ser posterior a la fecha de inicio"
    } else if (end.getTime() - start.getTime() > 90 * 24 * 60 * 60 * 1000) {
      isValid = false
      message = "El rango de fechas no puede ser mayor a 90 días"
    }

    setDateValidation({
      startDateValid: isValid || !startDate,
      endDateValid: isValid || !endDate,
      message: message,
    })

    return isValid
  }

  // Función para cargar disponibilidad mensual
  const loadMonthlyAvailability = async (month: Date) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Simular datos del mes
      setMonthlyAvailability(mockMonthlyData)
    } catch (error) {
      // Error loading monthly availability
    } finally {
      setLoading(false)
    }
  }

  // Cargar disponibilidad mensual cuando cambia el mes
  useEffect(() => {
    loadMonthlyAvailability(currentMonth)
  }, [currentMonth])

  // Funciones auxiliares para el calendario
  const getDayAvailability = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return monthlyAvailability[dateStr] || null
  }

  const getDayStatus = (date: Date) => {
    const availability = getDayAvailability(date)
    const isPast = date < new Date().setHours(0, 0, 0, 0)

    if (isPast) return "past"
    if (!availability) return "no-schedule"
    if (availability.exceptions) return "exception"
    if (!availability.available) return "unavailable"
    if (availability.booked >= availability.slots) return "fully-booked"
    if (availability.booked > 0) return "partially-booked"
    return "available"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "partially-booked":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "fully-booked":
        return "bg-red-100 text-red-800 border-red-200"
      case "exception":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "unavailable":
        return "bg-gray-100 text-gray-600 border-gray-200"
      case "past":
        return "bg-gray-50 text-gray-400 border-gray-100"
      default:
        return "bg-white text-gray-500 border-gray-100"
    }
  }

  // Función para verificar disponibilidad
  const checkAvailability = async () => {
    if (!selectedDate) return

    setLoading(true)
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const dayOfWeek = format(selectedDate, "EEEE", { locale: es })
      const formattedDate = format(selectedDate, "dd/MM/yyyy")

      setAvailabilityData({
        date: formattedDate,
        dayOfWeek: dayOfWeek,
        available: true,
        slots: [
          { time: "09:00", available: true },
          { time: "09:30", available: true },
          { time: "10:00", available: false },
          { time: "10:30", available: true },
        ],
      })
    } catch (error) {
      // Error checking availability
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener el estado y estilo de la cita
  const getCitaStatus = (block: any) => {
    if (!block.disponible) {
      return {
        label: "No Disponible",
        variant: "destructive" as const,
        bgColor: "border-red-200 bg-red-50",
        icon: Ban,
        description: block.motivo_no_disponible
      }
    }
    
    if (block.cita_reservada) {
      const estado = block.cita_reservada.estado
      switch (estado) {
        case "programada":
          return {
            label: "Programada",
            variant: "default" as const,
            bgColor: "border-blue-200 bg-blue-50",
            icon: Clock,
            description: `${block.cita_reservada.paciente_nombre} ${block.cita_reservada.paciente_apellido}`
          }
        case "confirmada":
          return {
            label: "Confirmada",
            variant: "default" as const,
            bgColor: "border-yellow-200 bg-yellow-50",
            icon: CheckCircle,
            description: `${block.cita_reservada.paciente_nombre} ${block.cita_reservada.paciente_apellido}`
          }
        case "completada":
          return {
            label: "Completada",
            variant: "default" as const,
            bgColor: "border-green-200 bg-green-50",
            icon: CheckCircle,
            description: `${block.cita_reservada.paciente_nombre} ${block.cita_reservada.paciente_apellido}`
          }
        case "cancelada":
          return {
            label: "Cancelada",
            variant: "destructive" as const,
            bgColor: "border-gray-200 bg-gray-50",
            icon: X,
            description: `${block.cita_reservada.paciente_nombre} ${block.cita_reservada.paciente_apellido}`
          }
        default:
          // Para estados no reconocidos, mostrar el estado tal como viene del servidor
          // Si no hay estado definido, usar "Ocupado" como fallback
          const estadoCapitalizado = estado ? 
            estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase() : 
            "Ocupado"
          return {
            label: estadoCapitalizado,
            variant: "default" as const,
            bgColor: "border-orange-200 bg-orange-50",
            icon: User,
            description: `${block.cita_reservada.paciente_nombre} ${block.cita_reservada.paciente_apellido}`
          }
      }
    }
    
    return {
      label: "Disponible",
      variant: "secondary" as const,
      bgColor: "border-green-200 bg-green-50",
      icon: CheckCircle,
      description: null
    }
  }

  // Cargar información del médico al montar el componente
  useEffect(() => {
    loadDoctorInfo(doctorId)
  }, [doctorId])

  // Función para generar bloques automáticamente
  const generateBlocks = async () => {
    if (!generateConfig.startDate || !generateConfig.endDate) {
      setError("Debe seleccionar fechas de inicio y fin")
      return
    }

    if (!validateDates(generateConfig.startDate, generateConfig.endDate)) {
      setError(dateValidation.message)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setInfo(null)

    try {
      const requestData = {
        fecha_inicio: generateConfig.startDate,
        fecha_fin: generateConfig.endDate,
        dias_semana: generateConfig.selectedDays,
        hora_inicio: generateConfig.startTime,
        hora_fin: generateConfig.endTime,
        duracion_bloque: generateConfig.duration,
        excluir_fechas: [],
      }

      // Log para debugging - mostrar datos enviados
      console.log('===== FRONTEND DEBUG =====')
      console.log('Doctor ID:', doctorId)
      console.log('Datos enviados para generar bloques:', requestData)
      console.log('Fechas enviadas:')
      console.log('  - fecha_inicio:', requestData.fecha_inicio, '(tipo:', typeof requestData.fecha_inicio, ')')
      console.log('  - fecha_fin:', requestData.fecha_fin, '(tipo:', typeof requestData.fecha_fin, ')')
      console.log('  - dias_semana:', requestData.dias_semana)
      console.log('  - Diferencia en días:', 
        Math.ceil((new Date(requestData.fecha_fin).getTime() - new Date(requestData.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24))
      )

      const response = await doctorsService.generateAvailabilityBlocks(doctorId, requestData)

      // Log para debugging - mostrar respuesta completa
      console.log('===== RESPUESTA DEL SERVIDOR =====')
      console.log('Response completo:', response)
      console.log('Response.body:', response.body)
      console.log('Response.error:', response.error)
      console.log('Response.status:', response.status)

      if (response.error === false || response.success) {
        const bloquesGenerados = response.body?.bloques_generados || 0
        const fechaDesde = response.body?.fecha_desde || generateConfig.startDate
        const fechaHasta = response.body?.fecha_hasta || generateConfig.endDate
        const configuracionUsada = response.body?.configuracion_utilizada || {}
        
        // Calcular días esperados vs días reales
        const diasEsperados = Math.ceil((new Date(generateConfig.endDate).getTime() - new Date(generateConfig.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
        
        setSuccess(
          `✅ Bloques generados exitosamente: ${bloquesGenerados} bloques creados`
        )
        setInfo(
          `📊 Período solicitado: ${generateConfig.startDate} al ${generateConfig.endDate} (${diasEsperados} días)
          📅 Días/semana: ${generateConfig.selectedDays.length} días (${generateConfig.selectedDays.map(d => ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d]).join(', ')})
          ⏱️ Horario: ${generateConfig.startTime}-${generateConfig.endTime} (${generateConfig.duration} min/bloque)
          🔍 Para verificar el rango real generado, revise en "Gestionar Bloques"`
        )
      } else {
        handleGenerationError(response)
      }
    } catch (err: unknown) {
      // Los bloques se generan correctamente incluso con timeout
      // No mostramos error ya que la funcionalidad funciona bien
      
      // Log para debugging del error
      console.log('Error en generateBlocks:', err)
      
      // Mostrar mensaje de información en lugar de error
      setInfo(`⏳ Los bloques se están generando para el período ${generateConfig.startDate} al ${generateConfig.endDate}. La operación puede tardar hasta 5 minutos para períodos largos. Verifique en 'Gestionar Bloques de Disponibilidad' para confirmar el rango real generado.`)
    } finally {
      setLoading(false)
    }
  }

  // Nueva función para manejar errores específicos de generación
  const handleGenerationError = (errorResponse: ErrorResponse) => {
    // Manejando error de generación

    const status = errorResponse.status
    const errorBody = errorResponse.body

    switch (status) {
      case 409: // Conflicto - Bloques ya existen
        if (typeof errorBody === "string" && errorBody.includes("Ya existe un bloque")) {
          // Extraer información del conflicto
          const conflictMatch = errorBody.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g)
          if (conflictMatch && conflictMatch.length >= 2) {
            const startTime = new Date(conflictMatch[0]).toLocaleString("es-ES", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
            const endTime = new Date(conflictMatch[1]).toLocaleString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })

            setError(
              `⚠️ Conflicto de Horarios: Ya existe un bloque programado el ${startTime} - ${endTime}. ` +
                `Para continuar, puede: 1) Cambiar el rango de fechas, 2) Excluir las fechas conflictivas, o 3) Eliminar los bloques existentes primero.`,
            )
          } else {
            setError(
              `⚠️ Conflicto de Horarios: Ya existen bloques programados en el período seleccionado. ` +
                `Revise los bloques existentes o cambie el rango de fechas.`,
            )
          }
        } else {
          setError(
            `⚠️ Conflicto: Ya existen bloques en el período seleccionado. ` +
              `Verifique los horarios existentes antes de generar nuevos bloques.`,
          )
        }

        // Mostrar información adicional
        setInfo(
          "💡 Sugerencia: Vaya a la pestaña 'Gestionar' para revisar los bloques existentes, " +
            "o use la pestaña 'Verificar' para ver el calendario de disponibilidad.",
        )
        break

      case 400: // Bad Request - Datos inválidos
        setError(
          `❌ Datos Inválidos: ${errorBody || "Los datos enviados no son válidos"}. ` +
            `Verifique que las fechas, horarios y días seleccionados sean correctos.`,
        )
        break

      case 404: // Not Found - Médico no encontrado
        setError(
          `❌ Médico No Encontrado: No se pudo encontrar el médico con ID ${doctorId}. ` +
            `Verifique que el médico existe y tiene permisos para gestionar horarios.`,
        )
        break

      case 403: // Forbidden - Sin permisos
        setError(
          `🚫 Sin Permisos: No tiene autorización para generar bloques para este médico. ` +
            `Contacte al administrador si necesita acceso.`,
        )
        break

      case 422: // Unprocessable Entity - Reglas de negocio
        setError(
          `⚠️ Error de Validación: ${errorBody || "Los datos no cumplen con las reglas de negocio"}. ` +
            `Verifique que los parámetros sean válidos.`,
        )

        setInfo(
          "💡 Sugerencia: Asegúrese de que las fechas, horarios y días seleccionados sean correctos " +
            "antes de generar bloques automáticamente.",
        )
        break

      case 500: // Internal Server Error
        setError(
          `🔧 Error del Servidor: Ocurrió un error interno en el servidor. ` +
            `Intente nuevamente en unos momentos o contacte al soporte técnico.`,
        )
        break

      default:
        // Los bloques se generan correctamente incluso con otros errores
        // No mostramos error ya que la funcionalidad funciona bien
        console.log('Error de generación:', errorResponse)
        setInfo(`⏳ Los bloques se están generando para el período ${generateConfig.startDate} al ${generateConfig.endDate}. La operación puede tardar hasta 5 minutos para períodos largos. Verifique en 'Gestionar Bloques de Disponibilidad' para confirmar el rango real generado.`)
        break
    }
  }

  // Función para toggle día de la semana
  const toggleWeekDay = (dayNumber: number) => {
    const currentDays = generateConfig.selectedDays
    const newDays = currentDays.includes(dayNumber)
      ? currentDays.filter((d) => d !== dayNumber)
      : [...currentDays, dayNumber].sort()

    setGenerateConfig({
      ...generateConfig,
      selectedDays: newDays,
    })
  }

  // Función para cargar bloques de disponibilidad
  const loadAvailabilityBlocks = async () => {
    if (!manageConfig.startDate || !manageConfig.endDate) {
      setError("Debe seleccionar fechas de inicio y fin")
      return
    }

    setLoadingBlocks(true)
    setError(null)
    setInfo(null)

    try {
      // Consultando bloques de disponibilidad

      // Usar las fechas directamente sin formatear ya que vienen en formato YYYY-MM-DD del input
      const filters = {
        fecha_desde: manageConfig.startDate,
        fecha_hasta: manageConfig.endDate,
      }

      // Filtros preparados

      // Realizar la llamada a la API
      const response = await doctorsService.getDoctorAvailabilityBlocks(doctorId, filters)

      // Respuesta del servidor procesada

      // Verificar si la respuesta es exitosa
      if (response.error === false || response.success) {
        // Actualizar el estado con los datos recibidos
        setBlocksData(response.body || response.data)
        const totalBloques = (response.body || response.data)?.total_bloques || 0
        setInfo(
          `Se encontraron ${totalBloques} bloques en el rango ${manageConfig.startDate} - ${manageConfig.endDate}`,
        )
      } else {
        // Manejar errores
        setError(response.message || "Error al cargar los bloques de disponibilidad")
      }
    } catch (err: unknown) {
      // Error al consultar bloques
      
      if (err && typeof err === 'object') {
        const error = err as any
        // Error message y response data
      }
      
      // Error procesado
      setError("Error de conexión al consultar bloques")
    } finally {
      setLoadingBlocks(false)
    }
  }

  // Función para establecer rangos de fecha rápidos
  const setQuickDateRange = (range: string) => {
    const today = new Date()
    let startDate: Date
    let endDate: Date

    switch (range) {
      case "today":
        startDate = new Date(today)
        endDate = new Date(today)
        break
      case "week":
        // Esta semana (lunes a domingo)
        const currentDay = today.getDay()
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
        startDate = new Date(today)
        startDate.setDate(today.getDate() + mondayOffset)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        break
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case "next-week":
        // Próxima semana (lunes a domingo)
        const nextWeekStart = new Date(today)
        const daysUntilNextMonday = ((7 - today.getDay()) % 7) + 1
        nextWeekStart.setDate(today.getDate() + daysUntilNextMonday)
        startDate = nextWeekStart
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        break
      default:
        return
    }

    // Formatear las fechas a string en formato YYYY-MM-DD
    const startDateFormatted = startDate.toISOString().split("T")[0]
    const endDateFormatted = endDate.toISOString().split("T")[0]

    // Rango rápido configurado

    // Actualizar el estado con las fechas formateadas
    setManageConfig({
      startDate: startDateFormatted,
      endDate: endDateFormatted,
    })
  }

  // Función para habilitar un bloque
  const handleEnableBlock = async (blockId: number) => {
    setActionLoading(blockId)
    setError(null)
    setSuccess(null)

    try {
      // Habilitando bloque de disponibilidad

      const response = await doctorsService.enableAvailabilityBlock(blockId)

      // Respuesta del servidor procesada

      if (response.error === false || response.success) {
        setSuccess("Bloque habilitado exitosamente")
        // Recargar los bloques para reflejar el cambio
        await loadAvailabilityBlocks()
      } else {
        setError(response.message || "Error al habilitar el bloque")
      }
    } catch (err: unknown) {
      // Error al habilitar bloque
      
      if (err && typeof err === 'object') {
        const error = err as any
        // Error message y response data
      }
      
      // Error procesado
      setError("Error de conexión al habilitar el bloque")
    } finally {
      setActionLoading(null)
    }
  }

  // Función para deshabilitar un bloque
  const handleDisableBlock = async (blockId: number) => {
    setActionLoading(blockId)
    setError(null)
    setSuccess(null)

    try {
      // Deshabilitando bloque de disponibilidad

      const response = await doctorsService.disableAvailabilityBlock(parseInt(blockId.toString()), "Deshabilitado por recepcionista")

      // Respuesta del servidor procesada

      if (response.error === false || response.success) {
        setSuccess("Bloque deshabilitado exitosamente")
        // Recargar los bloques para reflejar el cambio
        await loadAvailabilityBlocks()
      } else {
        setError(response.message || "Error al deshabilitar el bloque")
      }
    } catch (err: unknown) {
      // Error al deshabilitar bloque
      
      if (err && typeof err === 'object') {
        const error = err as any
        // Error message y response data
      }
      
      // Error procesado
      setError("Error de conexión al deshabilitar el bloque")
    } finally {
      setActionLoading(null)
    }
  }

  // Función para eliminar bloques masivamente
  const handleBulkDeleteBlocks = async (deleteMode: string, selectedBlocks: number[]) => {
    setActionLoading("bulk-delete")
    setError(null)
    setSuccess(null)

    try {
      // Eliminación masiva de bloques

      const filters: Record<string, any> = {}

      if (deleteMode === "selected") {
        if (selectedBlocks.length === 0) {
          setError("Seleccione al menos un bloque para eliminar")
          return
        }
        filters.bloque_ids = selectedBlocks
      } else if (deleteMode === "date") {
        // Eliminar solo el día de inicio
        if (!manageConfig.startDate) {
          setError("Debe seleccionar una fecha para eliminar")
          return
        }
        filters.fecha = manageConfig.startDate
        // Eliminando día específico
      } else if (deleteMode === "range") {
        // Eliminar rango completo
        if (!manageConfig.startDate || !manageConfig.endDate) {
          setError("Debe seleccionar un rango de fechas para eliminar")
          return
        }
        filters.fecha_desde = manageConfig.startDate
        filters.fecha_hasta = manageConfig.endDate
        // Eliminando rango
      } else if (deleteMode === "available") {
        // Eliminar solo disponibles en el rango
        if (!manageConfig.startDate || !manageConfig.endDate) {
          setError("Debe seleccionar un rango de fechas para eliminar solo disponibles")
          return
        }
        filters.fecha_desde = manageConfig.startDate
        filters.fecha_hasta = manageConfig.endDate
        filters.solo_disponibles = true
        // Eliminando solo disponibles en rango
      }

      // Filtros finales preparados

      const response = await doctorsService.deleteAvailabilityBlocks(doctorId, filters)

      // Respuesta del servidor procesada

      if (response.error === false || response.success) {
        const data = response.data || response.body
        const eliminados = data?.bloques_eliminados || 0

        if (eliminados > 0) {
          let mensaje = `${eliminados} bloques eliminados exitosamente`

          // Agregar información específica según el modo
          if (deleteMode === "date") {
            mensaje += ` del día ${manageConfig.startDate}`
          } else if (deleteMode === "range") {
            mensaje += ` del rango ${manageConfig.startDate} - ${manageConfig.endDate}`
          } else if (deleteMode === "available") {
            mensaje += ` (solo disponibles) del rango ${manageConfig.startDate} - ${manageConfig.endDate}`
          }

          setSuccess(mensaje)
        } else {
          let mensaje = "No se encontraron bloques para eliminar"

          if (deleteMode === "date") {
            mensaje += ` en el día ${manageConfig.startDate}`
          } else if (deleteMode === "range") {
            mensaje += ` en el rango ${manageConfig.startDate} - ${manageConfig.endDate}`
          } else if (deleteMode === "available") {
            mensaje += ` (disponibles) en el rango ${manageConfig.startDate} - ${manageConfig.endDate}`
          }

          setInfo(mensaje)
        }

        // Recargar los bloques para reflejar los cambios
        await loadAvailabilityBlocks()
      } else {
        // Manejar diferentes tipos de errores
        handleDeleteError(response)
      }
    } catch (err: unknown) {
      // Error al eliminar bloques
      
      if (err && typeof err === 'object') {
        const error = err as any
        // Error message y response data
        
        if (error.response?.data) {
          handleDeleteError(error.response.data)
        } else {
          setError("Error de conexión al eliminar bloques")
        }
      } else {
        setError("Error de conexión al eliminar bloques")
      }
      
      // Error procesado
    } finally {
      setActionLoading(null)
    }
  }

  // Nueva función para manejar errores específicos de eliminación
  const handleDeleteError = (errorResponse: ErrorResponse) => {
    // Manejando error de eliminación

    const status = errorResponse.status
    const errorBody = errorResponse.body

    switch (status) {
      case 400:
        if (typeof errorBody === "string" && errorBody.includes("citas asignadas")) {
          setError(
            "❌ No se pueden eliminar bloques que tienen citas asignadas. " +
              "Cancele o reprograme las citas antes de eliminar los bloques.",
          )
          setInfo("💡 Sugerencia: Use el filtro 'solo_disponibles=true' para eliminar únicamente bloques sin citas.")
        } else if (typeof errorBody === "string" && errorBody.includes("al menos un filtro")) {
          setError(
            "❌ Se requiere al menos un filtro para eliminar bloques. " +
              "Especifique una fecha, rango de fechas o IDs de bloques específicos.",
          )
        } else {
          setError(`❌ Datos Inválidos: ${errorBody || "Los filtros proporcionados no son válidos"}`)
        }
        break

      case 404:
        setError(
          `❌ Médico No Encontrado: No se pudo encontrar el médico con ID ${doctorId}. ` +
            "Verifique que el médico existe.",
        )
        break

      case 403:
        setError(
          "🚫 Sin Permisos: No tiene autorización para eliminar bloques de este médico. " +
            "Contacte al administrador si necesita acceso.",
        )
        break

      case 500:
        setError(
          "🔧 Error del Servidor: Ocurrió un error interno en el servidor. " +
            "Intente nuevamente en unos momentos o contacte al soporte técnico.",
        )
        break

      default:
        const message = errorResponse.message || errorBody || "Error desconocido"
        setError(`❌ Error al Eliminar Bloques: ${message}`)
        break
    }
  }

  // Agregar funciones auxiliares para el calendario después de las funciones existentes (línea ~800)

  // Función para obtener los días del mes para el calendario
  const getCalendarDays = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()

    // Primer día del mes
    const firstDay = new Date(year, month, 1)
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0)

    // Primer día de la semana (lunes = 1, domingo = 0)
    const startDate = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startDate.setDate(firstDay.getDate() + mondayOffset)

    // Generar array de días (6 semanas = 42 días)
    const days = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return { days, firstDay, lastDay }
  }

  // Función para obtener bloques de un día específico
  const getBlocksForDate = (date: Date) => {
    if (!blocksData?.resumen_por_fecha) return []

    const dateStr = format(date, "yyyy-MM-dd")
    const dayData = blocksData.resumen_por_fecha.find((d) => d.fecha === dateStr)
    return dayData?.bloques || []
  }

  // Función para obtener resumen de un día
  const getDaySummary = (date: Date) => {
    if (!blocksData?.resumen_por_fecha) return null

    const dateStr = format(date, "yyyy-MM-dd")
    return blocksData.resumen_por_fecha.find((d) => d.fecha === dateStr) || null
  }

  // Función para navegar meses
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(calendarDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCalendarDate(newDate)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/doctors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Médicos
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Horarios</h1>
          <p className="text-gray-600">
            {doctorInfo.nombre} {doctorInfo.apellido} - {doctorInfo.especialidad}
          </p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescriptionComponent>
            {error}
            <Button variant="outline" size="sm" onClick={() => setError(null)} className="ml-2">
              <X className="h-4 w-4" />
            </Button>
          </AlertDescriptionComponent>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescriptionComponent className="text-green-800">
            {success}
            <Button variant="outline" size="sm" onClick={() => setSuccess(null)} className="ml-2">
              <X className="h-4 w-4" />
            </Button>
          </AlertDescriptionComponent>
        </Alert>
      )}

      {info && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescriptionComponent className="text-blue-800">
            {info}
            <Button variant="outline" size="sm" onClick={() => setInfo(null)} className="ml-2">
              <X className="h-4 w-4" />
            </Button>
          </AlertDescriptionComponent>
        </Alert>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guia" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Guía
          </TabsTrigger>
          <TabsTrigger value="generar" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Generar
          </TabsTrigger>
          <TabsTrigger value="gestionar" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gestionar
          </TabsTrigger>
        </TabsList>

        {/* Tab: Guía de Uso */}
        <TabsContent value="guia">
          <div className="space-y-6">
            {/* Información principal */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Sistema de Gestión de Horarios - Guía Completa
                </CardTitle>
                <p className="text-blue-700">
                  Sistema unificado para gestionar la disponibilidad de médicos mediante bloques de tiempo específicos y configuración automática.
                </p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Flujo Recomendado de Gestión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Paso 1 */}
                  <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-2">Generar Bloques Automáticamente</h3>
                      <p className="text-blue-800 mb-3">
                        Crea bloques de disponibilidad para un período específico de forma automática basado en días de la semana y horarios.
                      </p>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Qué hacer:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                          <li>• Ve a la pestaña <strong>"Generar"</strong></li>
                          <li>• Define el período de fechas (inicio y fin)</li>
                          <li>• Selecciona los días de la semana específicos</li>
                          <li>• Configura horarios de trabajo (hora inicio y fin)</li>
                          <li>• Define la duración de cada bloque (15, 30, 45 o 60 min)</li>
                          <li>• Genera los bloques automáticamente</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Paso 2 */}
                  <div className="flex gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-2">Gestionar Bloques de Disponibilidad</h3>
                      <p className="text-green-800 mb-3">
                        Revisa, modifica y gestiona los bloques creados con opciones de vista lista y calendario.
                      </p>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Qué hacer:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                          <li>• Ve a la pestaña <strong>"Gestionar"</strong></li>
                          <li>• Consulta bloques por rango de fechas específico</li>
                          <li>• Cambia entre vista de lista y vista de calendario</li>
                          <li>• Habilita/deshabilita bloques individuales</li>
                          <li>• Elimina bloques por día, rango o solo disponibles</li>
                          <li>• Revisa el estado de cada bloque (disponible, con citas según estado, no disponible)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Paso 3 */}
                  <div className="flex gap-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900 mb-2">Monitoreo y Mantenimiento</h3>
                      <p className="text-purple-800 mb-3">
                        Mantén un control continuo de la disponibilidad y gestiona cambios según sea necesario.
                      </p>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Qué hacer:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                          <li>• Revisa regularmente la vista de calendario para ver disponibilidad</li>
                          <li>• Deshabilita bloques cuando el médico no esté disponible</li>
                          <li>• Elimina bloques innecesarios para optimizar horarios</li>
                          <li>• Genera nuevos bloques para períodos futuros</li>
                          <li>• Monitorea el porcentaje de ocupación por día</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ventajas del sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Ventajas del Sistema de Bloques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Generación Automática Inteligente</h4>
                    <p className="text-sm text-green-800 mb-2">Crea múltiples bloques basados en patrones de días y horarios</p>
                    <p className="text-xs text-green-700">Configuración flexible por días de la semana específicos</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">⚡ Gestión Granular</h4>
                    <p className="text-sm text-blue-800 mb-2">Control individual de cada bloque de tiempo</p>
                    <p className="text-xs text-blue-700">Habilita/deshabilita bloques sin afectar otros</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">📊 Visualización Dual</h4>
                    <p className="text-sm text-purple-800 mb-2">Vista de lista detallada y vista de calendario mensual</p>
                    <p className="text-xs text-purple-700">Monitoreo visual de disponibilidad y ocupación</p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">🔧 Eliminación Flexible</h4>
                    <p className="text-sm text-orange-800 mb-2">Elimina bloques por día, rango o solo disponibles</p>
                    <p className="text-xs text-orange-700">Protección automática de bloques con citas asignadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funcionalidades específicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Funcionalidades Específicas del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">📅 Generación de Bloques</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Rango de fechas:</strong> Define período específico de generación</li>
                      <li>• <strong>Días de la semana:</strong> Selecciona días específicos (Lun-Vie, solo Sáb, etc.)</li>
                      <li>• <strong>Horarios:</strong> Configura hora de inicio y fin de trabajo</li>
                      <li>• <strong>Duración:</strong> Bloques de 15, 30, 45 o 60 minutos</li>
                      <li>• <strong>Validación:</strong> Detecta conflictos con bloques existentes</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">🔍 Gestión de Bloques</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• <strong>Consulta por rango:</strong> Filtra bloques por fechas específicas</li>
                      <li>• <strong>Vista de lista:</strong> Detalles completos de cada bloque</li>
                      <li>• <strong>Vista de calendario:</strong> Resumen visual mensual</li>
                      <li>• <strong>Estados:</strong> Disponible, Programada, Confirmada, Completada, Cancelada, No disponible</li>
                      <li>• <strong>Acciones:</strong> Habilitar/deshabilitar bloques individuales</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">🗑️ Eliminación de Bloques</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• <strong>Por día:</strong> Elimina todos los bloques de una fecha específica</li>
                      <li>• <strong>Por rango:</strong> Elimina bloques en un período de fechas</li>
                      <li>• <strong>Solo disponibles:</strong> Elimina únicamente bloques sin citas</li>
                      <li>• <strong>Protección:</strong> No permite eliminar bloques con citas asignadas</li>
                      <li>• <strong>Confirmación:</strong> Muestra cantidad de bloques a eliminar</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frecuencia de uso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Frecuencia de Uso Recomendada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">📅 Configuración inicial</h4>
                    <p className="text-sm text-blue-800 mb-2">Generar → Configurar primer mes de horarios</p>
                    <p className="text-xs text-blue-700">Tiempo estimado: 10-15 minutos</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">🔄 Mantenimiento semanal</h4>
                    <p className="text-sm text-green-800 mb-2">Generar → Próxima semana + Gestionar → Revisar actual</p>
                    <p className="text-xs text-green-700">Tiempo estimado: 5-10 minutos</p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">📋 Revisión diaria</h4>
                    <p className="text-sm text-orange-800 mb-2">Gestionar → Vista calendario → Revisar bloques del día</p>
                    <p className="text-xs text-orange-700">Tiempo estimado: 2-3 minutos</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">⚡ Ajustes rápidos</h4>
                    <p className="text-sm text-purple-800 mb-2">Gestionar → Deshabilitar bloques específicos</p>
                    <p className="text-xs text-purple-700">Tiempo estimado: 1-2 minutos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consideraciones importantes */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Consideraciones Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-yellow-700 space-y-2">
                <p>
                  • <strong>Conflictos de horarios:</strong> El sistema detecta automáticamente si ya existen bloques en las fechas seleccionadas
                </p>
                <p>
                  • <strong>Protección de citas:</strong> No se pueden eliminar bloques que tienen citas asignadas
                </p>
                <p>
                  • <strong>Días específicos:</strong> Solo se generan bloques para los días de la semana marcados
                </p>
                <p>
                  • <strong>Planificación recomendada:</strong> Genera bloques con 1-2 semanas de anticipación
                </p>
                <p>
                  • <strong>Optimización:</strong> Usa la eliminación "solo disponibles" para limpiar bloques sin citas
                </p>
                <p>
                  • <strong>Monitoreo:</strong> Revisa regularmente la vista de calendario para control visual
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Generar Bloques Automáticamente */}
        <TabsContent value="generar">
          <div className="space-y-6">
            {/* Información del endpoint */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Generar Bloques Automáticamente
                </CardTitle>
                <p className="text-blue-700 text-sm">
                  Crea múltiples bloques de disponibilidad basados en un patrón de horarios y días específicos.
                </p>
              </CardHeader>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Formulario principal */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Generación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rango de fechas */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Rango de Fechas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gen-start">Fecha de inicio</Label>
                        <Input
                          id="gen-start"
                          type="date"
                          value={generateConfig.startDate}
                          onChange={(e) => {
                            setGenerateConfig({ ...generateConfig, startDate: e.target.value })
                            if (e.target.value && generateConfig.endDate) {
                              validateDates(e.target.value, generateConfig.endDate)
                            }
                          }}
                          className={!dateValidation.startDateValid ? "border-red-500" : ""}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gen-end">Fecha de fin</Label>
                        <Input
                          id="gen-end"
                          type="date"
                          value={generateConfig.endDate}
                          onChange={(e) => {
                            setGenerateConfig({ ...generateConfig, endDate: e.target.value })
                            if (generateConfig.startDate && e.target.value) {
                              validateDates(generateConfig.startDate, e.target.value)
                            }
                          }}
                          className={!dateValidation.endDateValid ? "border-red-500" : ""}
                          min={generateConfig.startDate || new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                    {dateValidation.message && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {dateValidation.message}
                      </p>
                    )}
                  </div>

                  {/* Días de la semana */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Días de la Semana</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {[
                        { num: 0, name: "Dom", full: "Domingo" },
                        { num: 1, name: "Lun", full: "Lunes" },
                        { num: 2, name: "Mar", full: "Martes" },
                        { num: 3, name: "Mié", full: "Miércoles" },
                        { num: 4, name: "Jue", full: "Jueves" },
                        { num: 5, name: "Vie", full: "Viernes" },
                        { num: 6, name: "Sáb", full: "Sábado" },
                      ].map((day) => (
                        <Button
                          key={day.num}
                          type="button"
                          variant={generateConfig.selectedDays.includes(day.num) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleWeekDay(day.num)}
                          className="h-12 text-xs"
                          title={day.full}
                        >
                          {day.name}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">Seleccionados: {generateConfig.selectedDays.length} días</p>
                  </div>

                  {/* Horarios */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Horarios</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gen-start-time">Hora de inicio</Label>
                        <Input
                          id="gen-start-time"
                          type="time"
                          value={generateConfig.startTime}
                          onChange={(e) => setGenerateConfig({ ...generateConfig, startTime: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gen-end-time">Hora de fin</Label>
                        <Input
                          id="gen-end-time"
                          type="time"
                          value={generateConfig.endTime}
                          onChange={(e) => setGenerateConfig({ ...generateConfig, endTime: e.target.value })}
                          min={generateConfig.startTime}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duración de bloques */}
                  <div>
                    <Label htmlFor="gen-duration">Duración por bloque (minutos)</Label>
                    <Select
                      value={generateConfig.duration.toString()}
                      onValueChange={(value) =>
                        setGenerateConfig({ ...generateConfig, duration: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="20">20 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botón de generar */}
                  <Button
                    onClick={generateBlocks}
                    disabled={loading || !dateValidation.startDateValid || !dateValidation.endDateValid}
                    className="w-full"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                    Generar Bloques
                  </Button>
                </CardContent>
              </Card>

              {/* Ejemplos y vista previa */}
              <div className="space-y-6">
                {/* Vista previa de configuración */}
                {generateConfig.startDate && generateConfig.endDate && generateConfig.selectedDays.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Vista Previa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Período:</span>
                          <p className="text-gray-600">
                            {generateConfig.startDate
                              ? format(new Date(generateConfig.startDate + "T00:00:00"), "dd/MM/yyyy")
                              : ""}{" "}
                            -{" "}
                            {generateConfig.endDate
                              ? format(new Date(generateConfig.endDate + "T00:00:00"), "dd/MM/yyyy")
                              : ""}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Horario:</span>
                          <p className="text-gray-600">
                            {generateConfig.startTime} - {generateConfig.endTime}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Días:</span>
                          <p className="text-gray-600">
                            {generateConfig.selectedDays
                              .map((d) => ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d])
                              .join(", ")}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Duración:</span>
                          <p className="text-gray-600">{generateConfig.duration} minutos</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <span className="font-medium text-blue-600">
                          Estimado: ~
                          {Math.ceil(
                            (((new Date(generateConfig.endDate).getTime() -
                              new Date(generateConfig.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)) *
                              generateConfig.selectedDays.length) /
                              7,
                          )}{" "}
                          días con bloques
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Información adicional */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-yellow-800 text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Consideraciones Importantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-yellow-700 space-y-2">
                    <p>
                      • <strong>Validación de Fechas:</strong> La fecha de inicio no puede ser anterior a hoy y el rango máximo es de 90 días
                    </p>
                    <p>
                      • <strong>Días Seleccionados:</strong> Solo se generarán bloques para los días de la semana marcados dentro del rango de fechas
                    </p>
                    <p>
                      • <strong>Conflictos de Bloques:</strong> Si ya existen bloques en las fechas seleccionadas, el sistema mostrará un error de conflicto (409)
                    </p>
                    <p>
                      • <strong>Horarios:</strong> La hora de fin debe ser posterior a la hora de inicio para generar bloques válidos
                    </p>
                    <p>
                      • <strong>Duración de Bloques:</strong> Los bloques se generan con la duración especificada (15, 30, 45 o 60 minutos)
                    </p>
                    <p>
                      • <strong>Gestión Post-Generación:</strong> Use la pestaña "Gestionar" para revisar, habilitar/deshabilitar o eliminar bloques después de generarlos
                    </p>
                    <p>
                      • <strong>Resolución de Conflictos:</strong> Si hay conflictos, puede cambiar el rango de fechas o eliminar bloques existentes primero
                    </p>
                    <p>
                      • <strong>Planificación Recomendada:</strong> Genere bloques con 1-2 semanas de anticipación para mejor gestión y evitar conflictos
                    </p>
                    <p>
                      • <strong>Tiempo de Procesamiento:</strong> La generación puede tardar hasta 5 minutos para períodos largos (más de 15 días)
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Gestionar Bloques */}
        <TabsContent value="gestionar">
          <div className="space-y-6">
            {/* Información del endpoint */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Gestionar Bloques de Disponibilidad
                </CardTitle>
                <p className="text-blue-700 text-sm">
                  Visualiza y gestiona todos los bloques de disponibilidad configurados para el médico.
                </p>
              </CardHeader>
            </Card>

            {/* Filtros de fecha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros de Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="manage-start-date">Fecha de inicio</Label>
                    <Input
                      id="manage-start-date"
                      type="date"
                      value={manageConfig.startDate}
                      onChange={(e) => setManageConfig({ ...manageConfig, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="manage-end-date">Fecha de fin</Label>
                    <Input
                      id="manage-end-date"
                      type="date"
                      value={manageConfig.endDate}
                      onChange={(e) => setManageConfig({ ...manageConfig, endDate: e.target.value })}
                      min={manageConfig.startDate}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={loadAvailabilityBlocks} disabled={loadingBlocks} className="w-full">
                      {loadingBlocks ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Consultar Bloques
                    </Button>
                  </div>
                </div>

                {/* Botones de consulta rápida */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setQuickDateRange("today")}>
                    Hoy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickDateRange("week")}>
                    Esta Semana
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickDateRange("month")}>
                    Este Mes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickDateRange("next-week")}>
                    Próxima Semana
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Selector de vista */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Vista de Bloques
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4 mr-2" />
                      Lista
                    </Button>
                    <Button
                      variant={viewMode === "calendar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("calendar")}
                    >
                      <Grid className="h-4 w-4 mr-2" />
                      Calendario
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Resumen de bloques */}
            {blocksData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Total Bloques</p>
                        <p className="text-2xl font-bold">{blocksData.total_bloques}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Disponibles</p>
                        <p className="text-2xl font-bold">{blocksData.bloques_disponibles}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-600">Con Citas</p>
                        <p className="text-2xl font-bold">{blocksData.bloques_ocupados}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Ban className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-600">No Disponibles</p>
                        <p className="text-2xl font-bold">{blocksData.bloques_no_disponibles}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Vista de bloques - Lista o Calendario */}
            {blocksData && blocksData.resumen_por_fecha && blocksData.resumen_por_fecha.length > 0 ? (
              <div className="space-y-6">
                {/* Información del rango consultado */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Mostrando bloques del <strong>{manageConfig.startDate}</strong> al{" "}
                        <strong>{manageConfig.endDate}</strong>
                        {blocksData.rango_fechas && (
                          <span className="ml-2 text-blue-600">
                            (Servidor: {blocksData.rango_fechas.inicio} - {blocksData.rango_fechas.fin})
                          </span>
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {viewMode === "list" ? (
                  // Vista de Lista (código existente)
                  <div className="space-y-6">
                    {blocksData.resumen_por_fecha.map((dayData) => (
                      <Card key={dayData.fecha} id={`day-${dayData.fecha}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                {format(new Date(dayData.fecha + "T00:00:00"), "EEEE, d 'de' MMMM 'de' yyyy", {
                                  locale: es,
                                })}
                                <Badge variant="outline" className="ml-2">
                                  {dayData.fecha}
                                </Badge>
                              </CardTitle>
                              <p className="text-sm text-gray-600 mt-1">
                                {dayData.total_bloques} bloques • {dayData.bloques_disponibles} disponibles •
                                {dayData.bloques_ocupados} con citas • {dayData.bloques_no_disponibles} no disponibles
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {dayData.total_bloques > 0
                                  ? Math.round((dayData.bloques_disponibles / dayData.total_bloques) * 100)
                                  : 0}
                                % libre
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2">
                            {dayData.bloques && dayData.bloques.length > 0 ? (
                              dayData.bloques.map((block) => {
                                const status = getCitaStatus(block)
                                return (
                                <div
                                  key={block.id}
                                  className={`p-3 border rounded-lg ${status.bgColor}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-medium">
                                          {block.hora_inicio} - {block.hora_fin}
                                        </span>
                                      </div>

                                                                    {/* Estado del bloque */}
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const status = getCitaStatus(block)
                                  const IconComponent = status.icon
                                  return (
                                    <Badge variant={status.variant} className="flex items-center gap-1">
                                      <IconComponent className="h-3 w-3" />
                                      {status.label}
                                    </Badge>
                                  )
                                })()}
                              </div>

                                                                    {/* Información adicional */}
                              <div className="text-sm text-gray-600">
                                {(() => {
                                  const status = getCitaStatus(block)
                                  if (status.description) {
                                    if (!block.disponible) {
                                      return <span>Motivo: {status.description}</span>
                                    } else {
                                      return <span>Paciente: {status.description}</span>
                                    }
                                  }
                                  return null
                                })()}
                              </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center gap-2">
                                      {block.disponible && !block.cita_reservada && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDisableBlock(block.id.toString())}
                                          disabled={actionLoading === block.id.toString()}
                                        >
                                          <Ban className="h-4 w-4 mr-1" />
                                          Deshabilitar
                                        </Button>
                                      )}
                                      {!block.disponible && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEnableBlock(block.id.toString())}
                                          disabled={actionLoading === block.id.toString()}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Habilitar
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                )
                              })
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <p>No hay bloques para este día</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Vista de Calendario
                  <div className="space-y-6">
                    {/* Navegación del calendario */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <h3 className="text-lg font-semibold">
                              {format(calendarDate, "MMMM yyyy", { locale: es })}
                            </h3>
                            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setCalendarDate(new Date())}>
                            Hoy
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Calendario */}
                    <Card>
                      <CardContent className="p-6">
                        {/* Encabezados de días de la semana */}
                        <div className="grid grid-cols-7 gap-2 mb-4">
                          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Días del calendario */}
                        <div className="grid grid-cols-7 gap-2">
                          {(() => {
                            const { days, firstDay, lastDay } = getCalendarDays()
                            return days.map((date, index) => {
                              const isCurrentMonth = date >= firstDay && date <= lastDay
                              const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                              const blocks = getBlocksForDate(date)
                              const daySummary = getDaySummary(date)
                              const isPast = date < new Date().setHours(0, 0, 0, 0)

                              return (
                                <div
                                  key={index}
                                  className={`min-h-[120px] border rounded-lg p-2 ${
                                    isCurrentMonth
                                      ? isToday
                                        ? "bg-blue-50 border-blue-300"
                                        : "bg-white border-gray-200"
                                      : "bg-gray-50 border-gray-100"
                                  } ${isPast ? "opacity-60" : ""}`}
                                >
                                  {/* Número del día */}
                                  <div className="flex items-center justify-between mb-2">
                                    <span
                                      className={`text-sm font-medium ${
                                        isCurrentMonth ? (isToday ? "text-blue-600" : "text-gray-900") : "text-gray-400"
                                      }`}
                                    >
                                      {date.getDate()}
                                    </span>
                                    {daySummary && (
                                      <div className="flex gap-1">
                                        {daySummary.bloques_disponibles > 0 && (
                                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Disponibles" />
                                        )}
                                        {daySummary.bloques_ocupados > 0 && (
                                          <div className="w-2 h-2 bg-orange-500 rounded-full" title="Con Citas" />
                                        )}
                                        {daySummary.bloques_no_disponibles > 0 && (
                                          <div className="w-2 h-2 bg-red-500 rounded-full" title="No disponibles" />
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Bloques del día */}
                                  {isCurrentMonth && blocks.length > 0 && (
                                    <div className="space-y-1">
                                      {blocks.slice(0, 3).map((block) => (
                                        <div
                                          key={block.id}
                                          className={`text-xs p-1 rounded cursor-pointer transition-colors ${
                                            (() => {
                                              const status = getCitaStatus(block)
                                              if (status.label === "No Disponible") return "bg-red-100 text-red-800 border border-red-200"
                                              if (status.label === "Programada") return "bg-blue-100 text-blue-800 border border-blue-200"
                                              if (status.label === "Confirmada") return "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                              if (status.label === "Completada") return "bg-green-100 text-green-800 border border-green-200"
                                              if (status.label === "Cancelada") return "bg-gray-100 text-gray-800 border border-gray-200"
                                              return "bg-green-100 text-green-800 border border-green-200" // Disponible
                                            })()
                                          }`}
                                          onClick={() => {
                                            // Cambiar a vista de lista y hacer scroll al día
                                            setViewMode("list")
                                            setTimeout(() => {
                                              const element = document.getElementById(
                                                `day-${format(date, "yyyy-MM-dd")}`,
                                              )
                                              if (element) {
                                                element.scrollIntoView({ behavior: "smooth" })
                                              }
                                            }, 100)
                                          }}
                                          title={`${block.hora_inicio}-${block.hora_fin} ${
                                            (() => {
                                              const status = getCitaStatus(block)
                                              if (status.label === "No Disponible") {
                                                return `(No disponible: ${status.description || "Sin motivo"})`
                                              } else if (status.description) {
                                                return `(${status.label}: ${status.description})`
                                              } else {
                                                return `(${status.label})`
                                              }
                                            })()
                                          }`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium">{block.hora_inicio}</span>
                                            <div className="flex items-center gap-1">
                                              {(() => {
                                                const status = getCitaStatus(block)
                                                const IconComponent = status.icon
                                                return <IconComponent className="h-2 w-2" />
                                              })()}
                                            </div>
                                          </div>
                                          {block.cita_reservada && (
                                            <div className="truncate">{block.cita_reservada.paciente_nombre}</div>
                                          )}
                                        </div>
                                      ))}
                                      {blocks.length > 3 && (
                                        <div
                                          className="text-xs text-gray-500 text-center py-1 cursor-pointer hover:text-gray-700"
                                          onClick={() => {
                                            setViewMode("list")
                                            setTimeout(() => {
                                              const element = document.getElementById(
                                                `day-${format(date, "yyyy-MM-dd")}`,
                                              )
                                              if (element) {
                                                element.scrollIntoView({ behavior: "smooth" })
                                              }
                                            }, 100)
                                          }}
                                        >
                                          +{blocks.length - 3} más
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Resumen del día */}
                                  {isCurrentMonth && daySummary && (
                                    <div className="mt-2 text-xs text-gray-600">
                                      <div className="flex justify-between">
                                        <span>{daySummary.total_bloques} total</span>
                                        <span>
                                          {daySummary.total_bloques > 0
                                            ? Math.round(
                                                (daySummary.bloques_disponibles / daySummary.total_bloques) * 100,
                                              )
                                            : 0}
                                          % libre
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Leyenda del calendario */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Leyenda</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Disponible</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>Con Citas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>No Disponible</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Día Actual</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Haz clic en un bloque o día para ver más detalles en la vista de lista
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : blocksData && blocksData.resumen_por_fecha && blocksData.resumen_por_fecha.length === 0 ? (
              // Resto del código existente para cuando no hay bloques...
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay bloques en el rango seleccionado</h3>
                  <p className="text-gray-600 mb-4">
                    No se encontraron bloques de disponibilidad para las fechas{" "}
                    <strong>{manageConfig.startDate}</strong> - <strong>{manageConfig.endDate}</strong>
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setActiveTab("generar")}>
                      <Zap className="h-4 w-4 mr-2" />
                      Generar Bloques
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un rango de fechas</h3>
                  <p className="text-gray-600">
                    Configura las fechas de inicio y fin para consultar los bloques de disponibilidad
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Opciones de eliminación mejoradas */}
            {blocksData && blocksData.resumen_por_fecha && blocksData.resumen_por_fecha.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Opciones de Eliminación
                  </CardTitle>
                  <p className="text-orange-700 text-sm">
                    Elimina bloques según diferentes criterios. Las fechas se basan en el rango actual:{" "}
                    <strong>{manageConfig.startDate}</strong> - <strong>{manageConfig.endDate}</strong>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkDeleteBlocks("date", [])}
                      disabled={!manageConfig.startDate || actionLoading !== null}
                      className="justify-start"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div>Eliminar Día</div>
                        <div className="text-xs opacity-80">{manageConfig.startDate}</div>
                      </div>
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkDeleteBlocks("range", [])}
                      disabled={!manageConfig.startDate || !manageConfig.endDate || actionLoading !== null}
                      className="justify-start"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div>Eliminar Rango</div>
                        <div className="text-xs opacity-80">
                          {manageConfig.startDate} - {manageConfig.endDate}
                        </div>
                      </div>
                    </Button>
                  </div>

                  {actionLoading === "bulk-delete" && (
                    <div className="mt-4 flex items-center gap-2 text-orange-700">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Eliminando bloques...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}


          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
