import { apiClient } from "../client"
import { ENDPOINTS } from "../config"
import type { 
  ApiResponse, 
  ReceptionistAppointment,
  ReceptionistAppointmentFilters,
  ReceptionistAppointmentsResponse,
  ReceptionistDoctor,
  ReceptionistDoctorFilters,
  ReceptionistDoctorsResponse 
} from "../types"

export interface ReceptionistPatient {
  id: number
  nombre: string
  apellido: string
  rut: string
  email: string
  telefono?: string
  fecha_nacimiento?: string
  genero?: string
  direccion?: string
  ciudad?: string
  region?: string
  creado_en?: string
  // Campos adicionales que pueden estar presentes
  prevision?: string
  estado?: "activo" | "inactivo"
  ultimaVisita?: string
  proximaCita?: string
  historialMedico?: {
    alergias: string[]
    enfermedadesCronicas: string[]
    medicamentos: string[]
  }
}

export interface ReceptionistPatientsResponse {
  pacientes: ReceptionistPatient[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}



export const receptionistsService = {
  // Obtener todos los pacientes para recepcionistas
  getPatients: async (filters?: { search?: string; page?: number; limit?: number }): Promise<{ error: boolean; message?: string; body?: ReceptionistPatientsResponse }> => {
    try {
      // Construir URL con parámetros de búsqueda
      let endpoint = ENDPOINTS.RECEPTIONISTS.PATIENTS
      if (filters) {
        const params = new URLSearchParams()
        if (filters.search) params.append('search', filters.search)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
        
        if (params.toString()) {
          endpoint += `?${params.toString()}`
        }
      }
      
      const response = await apiClient.get(endpoint)
      
      if (response.error) {
        console.error("Error en la respuesta:", response.message)
        console.error("Status:", response.status)
        return {
          error: true,
          message: response.message || "Error al cargar los pacientes",
        }
      }
      
      return {
        error: false,
        body: response.body,
      }
    } catch (error: any) {
      console.error("Error fetching receptionist patients:", error)
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return {
        error: true,
        message: "Error al cargar los pacientes",
      }
    }
  },

  // Obtener todos los médicos para recepcionistas
  getDoctors: async (filters?: ReceptionistDoctorFilters): Promise<{ error: boolean; message?: string; body?: ReceptionistDoctorsResponse }> => {
    try {
      // Construir URL con parámetros de búsqueda
      let endpoint = ENDPOINTS.RECEPTIONISTS.DOCTORS
      if (filters) {
        const params = new URLSearchParams()
        if (filters.search) params.append('search', filters.search)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
        if (filters.especialidad) params.append('especialidad', filters.especialidad)
        if (filters.activo !== undefined) params.append('activo', filters.activo.toString())
        
        if (params.toString()) {
          endpoint += `?${params.toString()}`
        }
      }
      
      const response = await apiClient.get(endpoint)
      
      if (response.error) {
        console.error("Error en la respuesta:", response.message)
        console.error("Status:", response.status)
        return {
          error: true,
          message: response.message || "Error al cargar los médicos",
        }
      }
      
      return {
        error: false,
        body: response.body,
      }
    } catch (error: any) {
      console.error("Error fetching receptionist doctors:", error)
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return {
        error: true,
        message: "Error al cargar los médicos",
      }
    }
  },

  // Obtener todas las citas para recepcionistas
  getAllAppointments: async (filters?: ReceptionistAppointmentFilters): Promise<ApiResponse<ReceptionistAppointmentsResponse>> => {
    try {
      // Construir URL con parámetros de filtro
      let endpoint = ENDPOINTS.RECEPTIONISTS.APPOINTMENTS
      if (filters && Object.keys(filters).length > 0) {
        const params = new URLSearchParams()
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        
        if (params.toString()) {
          endpoint += `?${params.toString()}`
        }
      }
      
      const response = await apiClient.get<ReceptionistAppointmentsResponse>(endpoint)
      
      if (response.error) {
        console.error("Error en la respuesta:", response.message)
        console.error("Status:", response.status)
        return {
          error: response.error,
          message: response.message || "Error al cargar las citas",
          statusCode: response.status,
          body: {
            citas: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
          }
        }
      }
      
      return response
    } catch (error: any) {
      console.error("Error fetching receptionist appointments:", error)
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return {
        error: true,
        message: "Error al cargar las citas",
        statusCode: 500,
        body: {
          citas: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      }
    }
  },

  // Cancelar una cita
  cancelAppointment: async (appointmentId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete<void>(`/api/receptionists/appointments/${appointmentId}`)
      
      return response
    } catch (error: any) {
      console.error("Error cancelling appointment:", error)
      return {
        error: true,
        message: "Error al cancelar la cita",
        statusCode: 500
      }
    }
  },

  // Actualizar una cita
  updateAppointment: async (appointmentId: number, data: { estado?: string; notas?: string }): Promise<ApiResponse<ReceptionistAppointment>> => {
    try {
      const response = await apiClient.put<ReceptionistAppointment>(`/api/receptionists/appointments/${appointmentId}`, data)
      
      return response
    } catch (error: any) {
      console.error("Error updating appointment:", error)
      return {
        error: true,
        message: "Error al actualizar la cita",
        statusCode: 500
      }
    }
  },

  // Crear una nueva cita
  createAppointment: async (citaData: {
    paciente_id: number
    medico_id: number
    fecha_hora: string
    duracion: number
    lugar?: string
    direccion?: string
    notas?: string
    tipo_cita?: string
  }): Promise<ApiResponse<ReceptionistAppointment>> => {
    // Asegurar que los IDs sean números enteros
    const citaDataValidated = {
      ...citaData,
      paciente_id: parseInt(citaData.paciente_id.toString()),
      medico_id: parseInt(citaData.medico_id.toString())
    }

    try {
      // Usar el endpoint correcto para recepcionistas que ahora devuelve datos completos
      const response = await apiClient.post<ReceptionistAppointment>(ENDPOINTS.RECEPTIONISTS.CREATE_APPOINTMENT, citaDataValidated)
      
      if (response.body) {
        // Validación en el servicio - ahora debería funcionar correctamente
        if (response.body.paciente_id && response.body.paciente_id !== citaDataValidated.paciente_id) {
          console.error(" [SERVICIO] ERROR: Paciente ID no coincide!")
          console.error("Enviado:", citaDataValidated.paciente_id)
          console.error("Recibido:", response.body.paciente_id)
        } else {
          console.log(" [SERVICIO] Paciente ID correcto:", response.body.paciente_id)
        }
      }
      
      return response
    } catch (error: any) {
      console.error("❌ [SERVICIO] Error creating appointment:", error)
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return {
        error: true,
        message: "Error al crear la cita",
        statusCode: 500
      }
    }
  }
} 