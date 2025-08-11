import { apiClient } from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/config"
import type { ExamWithDetails, ExamFilters, ApiResponse } from "@/lib/api/types"

export class DoctorExamsService {
  // Obtener todos los exámenes del blob storage (para médicos)
  async getAllExams(filters?: ExamFilters): Promise<ApiResponse<{
    examenes: ExamWithDetails[]
    total: number
    filtros_aplicados: ExamFilters
    user_role: string
  }>> {
    let endpoint = ENDPOINTS.EXAMS.DOCTOR.ALL
    
    // Construir query parameters si hay filtros
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
    
    return apiClient.get<{
      examenes: ExamWithDetails[]
      total: number
      filtros_aplicados: ExamFilters
      user_role: string
    }>(endpoint)
  }

  // Obtener exámenes por paciente específico (blob storage)
  async getExamsByPatient(patientId: number, filters?: ExamFilters): Promise<ApiResponse<ExamWithDetails[]>> {
    let endpoint = ENDPOINTS.EXAMS.DOCTOR.USER_EXAMS(patientId)
    
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
    
    return apiClient.get<ExamWithDetails[]>(endpoint)
  }

  // Obtener exámenes por tipo (blob storage)
  async getExamsByType(tipo_examen: string, filters?: ExamFilters): Promise<ApiResponse<ExamWithDetails[]>> {
    const combinedFilters = { ...filters, tipo_examen }
    const response = await this.getAllExams(combinedFilters)
    
    if (response.error) {
      return {
        error: response.error,
        message: response.message,
        statusCode: response.statusCode,
        body: []
      }
    }
    
    return {
      error: false,
      body: response.body.examenes,
      statusCode: response.statusCode
    }
  }

  // Obtener exámenes recientes (blob storage)
  async getRecentExams(days = 30, filters?: ExamFilters): Promise<ApiResponse<ExamWithDetails[]>> {
    const fecha_desde = new Date()
    fecha_desde.setDate(fecha_desde.getDate() - days)

    const combinedFilters = {
      ...filters,
      fecha_desde: fecha_desde.toISOString().split("T")[0],
    }

    const response = await this.getAllExams(combinedFilters)
    
    if (response.error) {
      return {
        error: response.error,
        message: response.message,
        statusCode: response.statusCode,
        body: []
      }
    }
    
    return {
      error: false,
      body: response.body.examenes,
      statusCode: response.statusCode
    }
  }

  // Descargar archivo de examen (blob storage)
  async downloadExamFile(id: string): Promise<Blob> {
    const response = await fetch(`${apiClient.apiBaseURL}${ENDPOINTS.EXAMS.DOWNLOAD(id)}`, {
      headers: {
        Authorization: `Bearer ${apiClient.authToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Error al descargar el archivo")
    }

    return response.blob()
  }

  // Eliminar examen (blob storage)
  async deleteExam(id: string, reason?: string): Promise<ApiResponse<any>> {
    const data = reason ? { reason } : undefined
    return apiClient.delete<any>(ENDPOINTS.EXAMS.DELETE(id), data)
  }

  // Buscar exámenes (blob storage)
  async searchExams(query: string, filters?: ExamFilters): Promise<ApiResponse<{
    examenes: ExamWithDetails[]
    total: number
    filtros_aplicados: any
  }>> {
    let endpoint = ENDPOINTS.EXAMS.DOCTOR.SEARCH
    
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }
    
    return apiClient.get<{
      examenes: ExamWithDetails[]
      total: number
      filtros_aplicados: any
    }>(endpoint)
  }

  // Obtener tipos de archivo disponibles (blob storage)
  async getFileTypes(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(ENDPOINTS.EXAMS.DOCTOR.FILE_TYPES)
  }

  // Obtener usuarios con exámenes (blob storage)
  async getUsersWithExams(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(ENDPOINTS.EXAMS.DOCTOR.USERS)
  }
}

export const doctorExamsService = new DoctorExamsService()

// ========= NOTA IMPORTANTE =========
// Este servicio ha sido ACTUALIZADO para usar exclusivamente
// blob storage. Ya no hace llamadas a endpoints de base de datos.
// Todos los métodos ahora usan los nuevos endpoints de blob storage.
// =================================== 