import { apiClient } from "@/lib/api/client"
import type { ExamWithDetails, ExamFilters, ApiResponse } from "@/lib/api/types"

export interface BlobExamFilters extends ExamFilters {
  user_id?: number
  file_type?: string
  size_min?: number
  size_max?: number
}

export interface BlobExamStats {
  totalFiles: number
  totalSize: number
  usersWithFiles: number
  fileTypes: Record<string, number>
  recentFiles: number
}

export interface BlobExamsResponse {
  examenes: ExamWithDetails[]
  total: number
  filtros_aplicados: BlobExamFilters
  source: 'blob_storage'
  estadisticas: BlobExamStats
}

export interface BlobExamManagementAction {
  action: 'move' | 'archive' | 'delete' | 'restore'
  target_folder?: string
  reason?: string
}

export class BlobExamsService {
  // Obtener todos los exámenes del blob storage (para médicos y administradores)
  async getAllBlobExams(filters?: BlobExamFilters): Promise<ApiResponse<BlobExamsResponse>> {
    let endpoint = "/api/doctor/exams/blob"
    
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
    
    return apiClient.get<BlobExamsResponse>(endpoint)
  }

  // Obtener estadísticas de exámenes del blob storage
  async getBlobExamStats(): Promise<ApiResponse<BlobExamStats>> {
    return apiClient.get<BlobExamStats>("/api/doctor/exams/blob/stats")
  }

  // Obtener examen específico del blob storage
  async getBlobExamById(blobId: string): Promise<ApiResponse<ExamWithDetails>> {
    return apiClient.get<ExamWithDetails>(`/api/exams/blob/${blobId}`)
  }

  // Descargar archivo de examen del blob storage
  async downloadBlobExamFile(blobId: string): Promise<Blob> {
    const response = await fetch(`${apiClient.apiBaseURL}/api/exams/blob/${blobId}/download`, {
      headers: {
        Authorization: `Bearer ${apiClient.authToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Error al descargar el archivo del blob storage")
    }

    return response.blob()
  }

  // Eliminar examen del blob storage
  async deleteBlobExam(blobId: string, reason?: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/api/doctor/exams/blob/${blobId}`, {
      reason: reason || "Eliminado por médico"
    })
  }

  // Mover examen a una carpeta específica (archivar, procesar, etc.)
  async moveBlobExam(blobId: string, targetFolder: string, reason?: string): Promise<ApiResponse<boolean>> {
    return apiClient.post<boolean>(`/api/doctor/exams/blob/${blobId}/move`, {
      target_folder: targetFolder,
      reason: reason || "Movido por médico"
    })
  }

  // Archivar examen (mover a carpeta archived)
  async archiveBlobExam(blobId: string, reason?: string): Promise<ApiResponse<boolean>> {
    return this.moveBlobExam(blobId, "archived", reason || "Archivado por médico")
  } // VER SI ELIMINAR O NO

  // Marcar examen como procesado (mover a carpeta processed)
  async markBlobExamAsProcessed(blobId: string, reason?: string): Promise<ApiResponse<boolean>> {
    return this.moveBlobExam(blobId, "processed", reason || "Marcado como procesado")
  } // VER SI ELIMINAR O NO

  // Restaurar examen archivado
  async restoreBlobExam(blobId: string): Promise<ApiResponse<boolean>> {
    return apiClient.post<boolean>(`/api/doctor/exams/blob/${blobId}/restore`, {
      reason: "Restaurado por médico"
    })
  }

  // Obtener exámenes de un usuario específico del blob storage
  async getBlobExamsByUser(userId: number, filters?: BlobExamFilters): Promise<ApiResponse<ExamWithDetails[]>> {
    let endpoint = `/api/doctor/exams/blob/user/${userId}`
    
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

  // Realizar acción masiva sobre múltiples exámenes
  async performBulkAction(
    blobIds: string[], 
    action: BlobExamManagementAction
  ): Promise<ApiResponse<{
    successful: string[]
    failed: string[]
    errors: Record<string, string>
  }>> {
    return apiClient.post<{
      successful: string[]
      failed: string[]
      errors: Record<string, string>
    }>("/api/doctor/exams/blob/bulk-action", {
      blob_ids: blobIds,
      action
    })
  }

  // Buscar exámenes en el blob storage
  async searchBlobExams(query: string, filters?: BlobExamFilters): Promise<ApiResponse<BlobExamsResponse>> {
    return this.getAllBlobExams({
      ...filters,
      search: query
    })
  }

  // Obtener tipos de archivo únicos en el blob storage
  async getBlobFileTypes(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>("/api/doctor/exams/blob/file-types")
  }

  // Obtener usuarios con exámenes en el blob storage
  async getUsersWithBlobExams(): Promise<ApiResponse<Array<{
    user_id: number
    nombre: string
    apellido: string
    email: string
    total_exams: number
    total_size: number
  }>>> {
    return apiClient.get<Array<{
      user_id: number
      nombre: string
      apellido: string
      email: string
      total_exams: number
      total_size: number
    }>>("/api/doctor/exams/blob/users")
  }

  // Subir nuevo examen al blob storage (médicos)
  async uploadBlobExam(examData: {
    paciente_id: number
    tipo_examen: string
    fecha: string
    descripcion?: string
    file: File
  }): Promise<ApiResponse<{
    success: boolean
    message: string
    examen: any
  }>> {
    const formData = new FormData()
    formData.append('examFile', examData.file)
    formData.append('paciente_id', examData.paciente_id.toString())
    formData.append('tipo_examen', examData.tipo_examen)
    formData.append('fecha', examData.fecha)
    if (examData.descripcion) {
      formData.append('descripcion', examData.descripcion)
    }

    return apiClient.post<{
      success: boolean
      message: string
      examen: any
    }>("/api/doctor/exams/blob/upload", formData)
  }
}

export const blobExamsService = new BlobExamsService() 