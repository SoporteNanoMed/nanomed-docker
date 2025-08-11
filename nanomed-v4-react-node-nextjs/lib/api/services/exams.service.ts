import { apiClient } from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/config"
import type { Exam, ExamFilters, ApiResponse } from "@/lib/api/types"

export class ExamsService {
  // Listar exámenes del usuario (blob storage)
  async getExams(filters?: ExamFilters): Promise<ApiResponse<any>> {
    let endpoint = ENDPOINTS.EXAMS.LIST
    
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
    
    return apiClient.get<any>(endpoint)
  }

  // Obtener examen por ID (blob storage)
  async getExamById(id: string): Promise<ApiResponse<Exam>> {
    return apiClient.get<Exam>(ENDPOINTS.EXAMS.BY_ID(id))
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

  // Eliminar examen (blob storage - solo médicos/admin)
  async deleteExam(id: string, reason?: string): Promise<ApiResponse<any>> {
    const data = reason ? { reason } : undefined
    return apiClient.delete<any>(ENDPOINTS.EXAMS.DELETE(id), data)
  }

  // Mover examen a carpeta (blob storage - solo médicos/admin)
  async moveExam(id: string, targetFolder: string, reason?: string): Promise<ApiResponse<any>> {
    const data = { target_folder: targetFolder, reason }
    return apiClient.post<any>(ENDPOINTS.EXAMS.MOVE(id), data)
  }

  // Restaurar examen archivado (blob storage - solo médicos/admin)
  async restoreExam(id: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(ENDPOINTS.EXAMS.RESTORE(id), {})
  }

  // Obtener exámenes por tipo
  async getExamsByType(tipo_examen: string): Promise<ApiResponse<any>> {
    return this.getExams({ tipo_examen })
  }

  // Obtener exámenes recientes
  async getRecentExams(days = 30): Promise<ApiResponse<any>> {
    const fecha_desde = new Date()
    fecha_desde.setDate(fecha_desde.getDate() - days)

    return this.getExams({
      fecha_desde: fecha_desde.toISOString().split("T")[0],
    })
  }

  // ========= NOTA IMPORTANTE =========
  // Los métodos createExam() y updateExam() han sido ELIMINADOS
  // porque ya no se crean/actualizan exámenes en base de datos.
  // Ahora todos los exámenes se gestionan directamente en blob storage
  // a través de upload directo de archivos al Azure Blob Storage.
  // ===================================
}

export const examsService = new ExamsService()
