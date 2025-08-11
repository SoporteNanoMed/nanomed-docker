import { apiClient } from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/config"
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentFilters,
  ApiResponse,
  AppointmentsListResponse,
} from "@/lib/api/types"

export class AppointmentsService {
  // Listar citas del usuario
  async getAppointments(filters?: AppointmentFilters): Promise<ApiResponse<AppointmentsListResponse>> {
    return apiClient.get<AppointmentsListResponse>(ENDPOINTS.APPOINTMENTS.LIST, filters)
  }

  // Obtener cita por ID
  async getAppointmentById(id: number): Promise<ApiResponse<Appointment>> {
    return apiClient.get<Appointment>(ENDPOINTS.APPOINTMENTS.BY_ID(id))
  }

  // Crear nueva cita
  async createAppointment(data: CreateAppointmentRequest): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>(ENDPOINTS.APPOINTMENTS.CREATE, data)
  }

  // Actualizar cita
  async updateAppointment(id: number, data: UpdateAppointmentRequest): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(ENDPOINTS.APPOINTMENTS.BY_ID(id), data)
  }

  // Cancelar cita
  async cancelAppointment(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.APPOINTMENTS.BY_ID(id))
  }

  // Obtener citas por estado
  async getAppointmentsByStatus(
    estado: "programada" | "confirmada" | "completada" | "cancelada",
  ): Promise<ApiResponse<AppointmentsListResponse>> {
    return this.getAppointments({ estado })
  }

  // Obtener próximas citas
  async getUpcomingAppointments(): Promise<ApiResponse<AppointmentsListResponse>> {
    const today = new Date().toISOString().split("T")[0]
    return this.getAppointments({
      fecha_desde: today,
      estado: "programada",
    })
  }

  // Obtener historial de citas
  async getAppointmentHistory(): Promise<ApiResponse<AppointmentsListResponse>> {
    return this.getAppointments({ estado: "completada" })
  }
}

export const appointmentsService = new AppointmentsService()
