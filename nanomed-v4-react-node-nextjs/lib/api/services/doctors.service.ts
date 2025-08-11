import { apiClient } from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/config"
import type { Doctor, DoctorFilters, ApiResponse } from "@/lib/api/types"

export class DoctorsService {
  get apiClient() {
    return apiClient
  }

  // Listar médicos
  async getDoctors(
    filters?: DoctorFilters,
  ): Promise<ApiResponse<{ medicos: Doctor[]; total: number; filtros_aplicados: any }>> {
    return apiClient.get<{ medicos: Doctor[]; total: number; filtros_aplicados: any }>("/api/doctors", filters)
  }

  // Obtener médico por ID
  async getDoctorById(id: number): Promise<ApiResponse<Doctor>> {
    return apiClient.get<Doctor>(ENDPOINTS.DOCTORS.BY_ID(id))
  }

  // Buscar médicos con filtros avanzados
  async searchDoctors(filters: DoctorFilters): Promise<ApiResponse<Doctor[]>> {
    return apiClient.get<Doctor[]>(ENDPOINTS.DOCTORS.SEARCH, filters)
  }

  // Obtener médicos por especialidad
  async getDoctorsBySpecialty(especialidad: string): Promise<ApiResponse<Doctor[]>> {
    return this.getDoctors({ especialidad })
  }

  // ===== ENDPOINTS PARA RECEPCIONISTAS =====

  // Obtener horarios de un médico (para recepcionistas)
  async getDoctorSchedule(doctorId: number): Promise<ApiResponse<DoctorScheduleResponse>> {
    const response = await apiClient.get<DoctorScheduleResponse>(`/api/receptionists/doctors/${doctorId}/schedule`)

    return response
  }

  // Establecer horarios base de un médico (para recepcionistas)
  async setDoctorSchedule(doctorId: number, scheduleData: SetScheduleRequest): Promise<ApiResponse<any>> {
    const response = await apiClient.post<any>(`/api/receptionists/doctors/${doctorId}/schedule`, scheduleData)

    return response
  }

  // Crear bloques de disponibilidad de un médico (para recepcionistas)
  async createAvailabilityBlocks(
    doctorId: number,
    blocksData: CreateAvailabilityBlocksRequest,
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/receptionists/doctors/${doctorId}/availability-blocks`, blocksData)
  }

  // Generar bloques automáticamente (para recepcionistas)
  async generateAvailabilityBlocks(
    doctorId: number,
    generateData: GenerateAvailabilityBlocksRequest,
  ): Promise<ApiResponse<any>> {
    // Usar fetch directamente con timeout personalizado para generación de bloques
    try {
      const controller = new AbortController()
      // Timeout de 5 minutos para generación masiva de bloques
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutos

      const response = await fetch(`${apiClient.apiBaseURL}/api/receptionists/doctors/${doctorId}/availability-blocks/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(apiClient.authToken ? { Authorization: `Bearer ${apiClient.authToken}` } : {})
        },
        body: JSON.stringify(generateData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const contentType = response.headers.get("content-type")
      let body: any

      try {
        if (contentType && contentType.includes("application/json")) {
          body = await response.json()
        } else {
          body = await response.text()
        }
      } catch (error) {
        body = null
      }

      if (!response.ok) {
        return {
          error: true,
          status: response.status,
          body: body,
          message: body?.message || body?.error || response.statusText || "Error en la solicitud",
        }
      }

      // Si la respuesta tiene el formato estándar de la API
      if (body && typeof body === "object" && "error" in body && "status" in body && "body" in body) {
        return {
          error: body.error || false,
          status: body.status || response.status,
          body: body.body,
          message: body.message,
        }
      }

      // Si la respuesta es directamente el contenido
      return {
        error: false,
        status: response.status,
        body: body,
        message: "Success",
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          error: true,
          status: 0,
          body: null,
          message: "Request timeout - La generación de bloques tomó más de 5 minutos",
        }
      }

      return {
        error: true,
        status: 0,
        body: null,
        message: error.message || "Network error",
      }
    }
  }

  // Agregar excepción al horario (para recepcionistas)
  async addScheduleException(doctorId: number, exceptionData: AddScheduleExceptionRequest): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/api/receptionists/doctors/${doctorId}/schedule/exceptions`, exceptionData)
  }

  // Verificar disponibilidad del médico (para recepcionistas)
  async checkDoctorAvailability(doctorId: number, fecha: string): Promise<ApiResponse<DoctorAvailabilityResponse>> {
    const url = `/api/receptionists/doctors/${doctorId}/availability-updated?fecha=${fecha}`
    return apiClient.get<DoctorAvailabilityResponse>(url)
  }

  // NUEVOS MÉTODOS PARA GESTIÓN DE BLOQUES

  // Obtener bloques de disponibilidad de un médico
  async getDoctorAvailabilityBlocks(
    doctorId: number,
    filters?: AvailabilityBlockFilters,
  ): Promise<ApiResponse<AvailabilityBlocksResponse>> {
    try {
      const queryParams = new URLSearchParams()

      // Usar fecha_desde y fecha_hasta directamente
      if (filters?.fecha_desde) {
        queryParams.append("fecha_inicio", filters.fecha_desde)
      }
      if (filters?.fecha_hasta) {
        queryParams.append("fecha_fin", filters.fecha_hasta)
      }

      // Para fecha específica, usar como rango de un día
      if (filters?.fecha && !filters?.fecha_desde && !filters?.fecha_hasta) {
        queryParams.append("fecha_inicio", filters.fecha)
        queryParams.append("fecha_fin", filters.fecha)
      }

      // Si no hay filtros de fecha, usar un rango por defecto (próximos 30 días)
      if (!filters?.fecha && !filters?.fecha_desde && !filters?.fecha_hasta) {
        const today = new Date().toISOString().split("T")[0]
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        const future = futureDate.toISOString().split("T")[0]

        queryParams.append("fecha_inicio", today)
        queryParams.append("fecha_fin", future)
      }

      // Construir URL final
      const baseUrl = `/api/receptionists/doctors/${doctorId}/availability-blocks`
      const queryString = queryParams.toString()
      const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl

      const response = await apiClient.get<AvailabilityBlocksResponse>(finalUrl)

      return response
    } catch (error) {
      // Re-lanzar el error para que sea manejado por el componente
      throw error
    }
  }

  // Método alias para compatibilidad
  async getAvailabilityBlocks(
    doctorId: number,
    filters?: AvailabilityBlockFilters,
  ): Promise<ApiResponse<AvailabilityBlocksResponse>> {
    return this.getDoctorAvailabilityBlocks(doctorId, filters)
  }

  // Marcar un bloque como no disponible
  async disableAvailabilityBlock(bloqueId: number, motivo: string): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/api/receptionists/availability-blocks/${bloqueId}/disable`, { motivo })
  }

  // Marcar un bloque como disponible
  async enableAvailabilityBlock(bloqueId: number): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/api/receptionists/availability-blocks/${bloqueId}/enable`)
  }

  // Eliminar bloques de disponibilidad
  async deleteAvailabilityBlocks(
    doctorId: number,
    filters: DeleteBlocksFilters,
  ): Promise<ApiResponse<DeleteBlocksResponse>> {
    try {
      const queryParams = new URLSearchParams()

      // Agregar filtros a los query parameters
      if (filters.fecha) {
        queryParams.append("fecha", filters.fecha)
      }

      if (filters.fecha_desde) {
        queryParams.append("fecha_desde", filters.fecha_desde)
      }

      if (filters.fecha_hasta) {
        queryParams.append("fecha_hasta", filters.fecha_hasta)
      }

      if (filters.bloque_ids && filters.bloque_ids.length > 0) {
        queryParams.append("bloque_ids", filters.bloque_ids.join(","))
      }

      if (filters.solo_disponibles) {
        queryParams.append("solo_disponibles", "true")
      }

      // Construir URL final
      const baseUrl = `/api/receptionists/doctors/${doctorId}/availability-blocks`
      const queryString = queryParams.toString()
      const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl

      const response = await apiClient.delete<DeleteBlocksResponse>(finalUrl)

      return response
    } catch (error) {
      throw error
    }
  }
}

export const doctorsService = new DoctorsService()

// ===== TIPOS PARA HORARIOS BASE =====

export interface DoctorScheduleResponse {
  medico: {
    id: number
    nombre: string
    apellido: string
    especialidad?: string
  }
  horarios_por_dia: DaySchedule[]
  total_horarios_regulares: number
  excepciones_proximas?: ScheduleException[]
  total_excepciones: number
}

export interface DaySchedule {
  dia_numero: number
  dia_nombre: string
  horarios: Schedule[]
}

export interface Schedule {
  id: number
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  duracion_cita: number
  fecha_desde: string | null
  fecha_hasta: string | null
  activo: boolean
  creado_en: string
  actualizado_en: string
}

export interface SetScheduleRequest {
  horarios: ScheduleInput[]
}

export interface ScheduleInput {
  dia_semana: number // 0=Domingo, 1=Lunes, 2=Martes, etc.
  hora_inicio: string // Formato "HH:MM"
  hora_fin: string // Formato "HH:MM"
  duracion_cita: number // En minutos
  fecha_desde?: string | null // Formato "YYYY-MM-DD" (opcional)
  fecha_hasta?: string | null // Formato "YYYY-MM-DD" (opcional)
}

// ===== TIPOS PARA BLOQUES DE DISPONIBILIDAD =====

export interface CreateAvailabilityBlocksRequest {
  bloques: AvailabilityBlock[]
}

export interface AvailabilityBlock {
  fecha_hora_inicio: string
  fecha_hora_fin: string
  disponible: boolean
}

export interface GenerateAvailabilityBlocksRequest {
  fecha_inicio: string // Formato "YYYY-MM-DD"
  fecha_fin: string // Formato "YYYY-MM-DD"
  dias_semana?: number[] // Array de números [0,1,2,3,4,5,6]
  hora_inicio?: string // Formato "HH:MM"
  hora_fin?: string // Formato "HH:MM"
  duracion_bloque: number // En minutos
  excluir_fechas?: string[] // Array de fechas en formato "YYYY-MM-DD"
}

export interface AddScheduleExceptionRequest {
  fecha: string
  motivo: string
  todo_el_dia: boolean
  hora_inicio?: string
  hora_fin?: string
}

export interface DoctorAvailabilityResponse {
  medico: {
    id: number
    nombre: string
    apellido: string
  }
  fecha: string
  dia_semana?: number
  horarios_configurados?: ConfiguredSchedule[]
  horarios_disponibles: AvailableSlot[]
  citas_existentes: ExistingAppointment[]
  excepcion?: ScheduleException | null
  mensaje?: string
}

export interface ConfiguredSchedule {
  hora_inicio: string
  hora_fin: string
  duracion_cita: number
}

export interface AvailableSlot {
  hora: string
  fecha_hora: string
  disponible: boolean
  duracion: number
}

export interface ExistingAppointment {
  fecha_hora: string
  duracion: number
  estado: string
}

export interface ScheduleException {
  id?: number
  fecha: string
  motivo: string
  mensaje?: string
  parcial?: boolean
  todo_el_dia?: boolean
  hora_inicio?: string
  hora_fin?: string
}

// NUEVOS TIPOS PARA GESTIÓN DE BLOQUES

export interface AvailabilityBlocksResponse {
  medico: {
    id: number
    nombre: string
    apellido: string
  }
  rango_fechas: {
    inicio: string
    fin: string
  }
  resumen_por_fecha: DateSummary[]
  total_bloques: number
  bloques_disponibles: number
  bloques_ocupados: number
  bloques_no_disponibles: number
}

export interface DateSummary {
  fecha: string
  dia_semana: number
  total_bloques: number
  bloques_disponibles: number
  bloques_ocupados: number
  bloques_no_disponibles: number
  bloques: AvailabilityBlockItem[]
}

export interface AvailabilityBlockItem {
  id: number
  hora_inicio: string
  hora_fin: string
  fecha_hora_inicio: string
  fecha_hora_fin: string
  disponible: boolean
  motivo_no_disponible: string | null
  cita_reservada: {
    id: number
    paciente_id: number
    paciente_nombre: string
    paciente_apellido: string
    estado: string
  } | null
}

export interface AvailabilityBlockFilters {
  fecha?: string // Para fecha específica
  fecha_desde?: string // Se convertirá a fecha_inicio
  fecha_hasta?: string // Se convertirá a fecha_fin
  disponible?: boolean
}

export interface DeleteBlocksFilters {
  fecha?: string
  fecha_desde?: string
  fecha_hasta?: string
  bloque_ids?: number[]
  solo_disponibles?: boolean
}

export interface DeleteBlocksResponse {
  medico: {
    id: number
    nombre: string
    apellido: string
  }
  bloques_eliminados: number
  bloques: any[]
  mensaje: string
  filtros_aplicados: any
}
