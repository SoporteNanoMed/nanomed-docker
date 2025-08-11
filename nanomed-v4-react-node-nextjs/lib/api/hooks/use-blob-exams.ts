import { useState, useEffect, useCallback } from "react"
import { blobExamsService } from "@/lib/api/services/blob-exams.service"
import type { ExamWithDetails, ApiResponse } from "@/lib/api/types"
import type { BlobExamFilters, BlobExamsResponse, BlobExamStats, BlobExamManagementAction } from "@/lib/api/services/blob-exams.service"

interface UseBlobExamsOptions {
  filters?: BlobExamFilters
  autoFetch?: boolean
}

interface UseBlobExamsReturn {
  // Estado
  exams: ExamWithDetails[]
  loading: boolean
  error: string | null
  total: number
  stats: BlobExamStats | null

  // Funciones básicas
  refetch: () => Promise<void>
  setFilters: (filters: BlobExamFilters) => void
  clearError: () => void

  // Gestión individual
  downloadExamFile: (blobId: string) => Promise<void>
  deleteExam: (blobId: string, reason?: string) => Promise<boolean>
  archiveExam: (blobId: string, reason?: string) => Promise<boolean>
  markAsProcessed: (blobId: string, reason?: string) => Promise<boolean>
  moveExam: (blobId: string, targetFolder: string, reason?: string) => Promise<boolean>
  restoreExam: (blobId: string) => Promise<boolean>

  // Gestión masiva
  deleteSelectedExams: (blobIds: string[], reason?: string) => Promise<{
    successful: string[]
    failed: string[]
    errors: Record<string, string>
  }>
  archiveSelectedExams: (blobIds: string[], reason?: string) => Promise<{
    successful: string[]
    failed: string[]
    errors: Record<string, string>
  }>
  performBulkAction: (blobIds: string[], action: BlobExamManagementAction) => Promise<{
    successful: string[]
    failed: string[]
    errors: Record<string, string>
  }>

  // Filtros y búsqueda
  searchExams: (query: string) => Promise<void>
  getExamsByUser: (userId: number) => Promise<ExamWithDetails[]>
  
  // Metadatos
  getFileTypes: () => Promise<string[]>
  getUsersWithExams: () => Promise<Array<{
    user_id: number
    nombre: string
    apellido: string
    email: string
    total_exams: number
    total_size: number
  }>>

  // Subida de exámenes
  uploadExam: (examData: {
    paciente_id: number
    tipo_examen: string
    fecha: string
    descripcion?: string
    file: File
  }) => Promise<boolean>
}

export function useBlobExams(options: UseBlobExamsOptions = {}): UseBlobExamsReturn {
  const { filters: initialFilters, autoFetch = true } = options
  
  // Estado
  const [exams, setExams] = useState<ExamWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<BlobExamStats | null>(null)
  const [currentFilters, setCurrentFilters] = useState<BlobExamFilters>(initialFilters || {})

  // Función para obtener todos los exámenes del blob storage
  const fetchBlobExams = useCallback(async (filters?: BlobExamFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const filtersToUse = filters || currentFilters
      const response = await blobExamsService.getAllBlobExams(filtersToUse)
      
      if (response.error) {
        setError(response.message || "Error al cargar los exámenes del blob storage")
        return
      }

      const data = response.body as BlobExamsResponse
      setExams(data.examenes || [])
      setTotal(data.total || 0)
      setStats(data.estadisticas || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los exámenes")
    } finally {
      setLoading(false)
    }
  }, [currentFilters])

  // Refetch función pública
  const refetch = useCallback(async () => {
    await fetchBlobExams()
  }, [fetchBlobExams])

  // Función para establecer filtros
  const setFilters = useCallback((filters: BlobExamFilters) => {
    setCurrentFilters(filters)
  }, [])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Descargar archivo de examen
  const downloadExamFile = useCallback(async (blobId: string) => {
    try {
      const blob = await blobExamsService.downloadBlobExamFile(blobId)
      
      // Obtener información del examen para el nombre del archivo
      const examResponse = await blobExamsService.getBlobExamById(blobId)
      const filename = examResponse.body?.archivo_nombre_original || `examen_${blobId}.pdf`
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al descargar el archivo")
      throw err
    }
  }, [])

  // Eliminar examen individual
  const deleteExam = useCallback(async (blobId: string, reason?: string): Promise<boolean> => {
    try {
      const response = await blobExamsService.deleteBlobExam(blobId, reason)
      
      if (response.error) {
        setError(response.message || "Error al eliminar el examen")
        return false
      }

      // Refrescar lista después de eliminar
      await refetch()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el examen")
      return false
    }
  }, [refetch])

  // Archivar examen
  const archiveExam = useCallback(async (blobId: string, reason?: string): Promise<boolean> => {
    try {
      const response = await blobExamsService.archiveBlobExam(blobId, reason)
      
      if (response.error) {
        setError(response.message || "Error al archivar el examen")
        return false
      }

      await refetch()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al archivar el examen")
      return false
    }
  }, [refetch])

  // Marcar como procesado
  const markAsProcessed = useCallback(async (blobId: string, reason?: string): Promise<boolean> => {
    try {
      const response = await blobExamsService.markBlobExamAsProcessed(blobId, reason)
      
      if (response.error) {
        setError(response.message || "Error al marcar el examen como procesado")
        return false
      }

      await refetch()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al marcar el examen como procesado")
      return false
    }
  }, [refetch])

  // Mover examen
  const moveExam = useCallback(async (blobId: string, targetFolder: string, reason?: string): Promise<boolean> => {
    try {
      const response = await blobExamsService.moveBlobExam(blobId, targetFolder, reason)
      
      if (response.error) {
        setError(response.message || "Error al mover el examen")
        return false
      }

      await refetch()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al mover el examen")
      return false
    }
  }, [refetch])

  // Restaurar examen
  const restoreExam = useCallback(async (blobId: string): Promise<boolean> => {
    try {
      const response = await blobExamsService.restoreBlobExam(blobId)
      
      if (response.error) {
        setError(response.message || "Error al restaurar el examen")
        return false
      }

      await refetch()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restaurar el examen")
      return false
    }
  }, [refetch])

  // Eliminar exámenes seleccionados
  const deleteSelectedExams = useCallback(async (blobIds: string[], reason?: string) => {
    try {
      const response = await blobExamsService.performBulkAction(blobIds, {
        action: 'delete',
        reason: reason || "Eliminación masiva por médico"
      })
      
      if (response.error) {
        setError(response.message || "Error en la eliminación masiva")
        return {
          successful: [],
          failed: blobIds,
          errors: { general: response.message || "Error desconocido" }
        }
      }

      await refetch()
      return response.body || { successful: [], failed: [], errors: {} }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la eliminación masiva")
      return {
        successful: [],
        failed: blobIds,
        errors: { general: err instanceof Error ? err.message : "Error desconocido" }
      }
    }
  }, [refetch])

  // Archivar exámenes seleccionados
  const archiveSelectedExams = useCallback(async (blobIds: string[], reason?: string) => {
    try {
      const response = await blobExamsService.performBulkAction(blobIds, {
        action: 'archive',
        target_folder: 'archived',
        reason: reason || "Archivado masivo por médico"
      })
      
      if (response.error) {
        setError(response.message || "Error en el archivado masivo")
        return {
          successful: [],
          failed: blobIds,
          errors: { general: response.message || "Error desconocido" }
        }
      }

      await refetch()
      return response.body || { successful: [], failed: [], errors: {} }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en el archivado masivo")
      return {
        successful: [],
        failed: blobIds,
        errors: { general: err instanceof Error ? err.message : "Error desconocido" }
      }
    }
  }, [refetch])

  // Realizar acción masiva
  const performBulkAction = useCallback(async (blobIds: string[], action: BlobExamManagementAction) => {
    try {
      const response = await blobExamsService.performBulkAction(blobIds, action)
      
      if (response.error) {
        setError(response.message || "Error en la acción masiva")
        return {
          successful: [],
          failed: blobIds,
          errors: { general: response.message || "Error desconocido" }
        }
      }

      await refetch()
      return response.body || { successful: [], failed: [], errors: {} }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la acción masiva")
      return {
        successful: [],
        failed: blobIds,
        errors: { general: err instanceof Error ? err.message : "Error desconocido" }
      }
    }
  }, [refetch])

  // Buscar exámenes
  const searchExams = useCallback(async (query: string) => {
    await fetchBlobExams({ ...currentFilters, search: query })
  }, [fetchBlobExams, currentFilters])

  // Obtener exámenes por usuario
  const getExamsByUser = useCallback(async (userId: number): Promise<ExamWithDetails[]> => {
    try {
      const response = await blobExamsService.getBlobExamsByUser(userId, currentFilters)
      
      if (response.error) {
        setError(response.message || "Error al obtener exámenes del usuario")
        return []
      }

      return response.body || []
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener exámenes del usuario")
      return []
    }
  }, [currentFilters])

  // Obtener tipos de archivo
  const getFileTypes = useCallback(async (): Promise<string[]> => {
    try {
      const response = await blobExamsService.getBlobFileTypes()
      
      if (response.error) {
        setError(response.message || "Error al obtener tipos de archivo")
        return []
      }

      return response.body || []
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener tipos de archivo")
      return []
    }
  }, [])

  // Obtener usuarios con exámenes
  const getUsersWithExams = useCallback(async () => {
    try {
      const response = await blobExamsService.getUsersWithBlobExams()
      
      if (response.error) {
        setError(response.message || "Error al obtener usuarios con exámenes")
        return []
      }

      return response.body || []
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener usuarios con exámenes")
      return []
    }
  }, [])

  // Subida de exámenes
  const uploadExam = useCallback(async (examData: {
    paciente_id: number
    tipo_examen: string
    fecha: string
    descripcion?: string
    file: File
  }) => {
    try {
      const response = await blobExamsService.uploadBlobExam(examData)
      
      if (response.error) {
        setError(response.message || "Error al subir el examen")
        return false
      }

      await refetch()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el examen")
      return false
    }
  }, [refetch])

  // Efecto para cargar datos inicialmente
  useEffect(() => {
    if (autoFetch) {
      fetchBlobExams()
    }
  }, [autoFetch, fetchBlobExams])

  // Efecto para actualizar cuando cambien los filtros
  useEffect(() => {
    if (autoFetch) {
      fetchBlobExams(currentFilters)
    }
  }, [currentFilters, autoFetch, fetchBlobExams])

  return {
    // Estado
    exams,
    loading,
    error,
    total,
    stats,

    // Funciones básicas
    refetch,
    setFilters,
    clearError,

    // Gestión individual
    downloadExamFile,
    deleteExam,
    archiveExam,
    markAsProcessed,
    moveExam,
    restoreExam,

    // Gestión masiva
    deleteSelectedExams,
    archiveSelectedExams,
    performBulkAction,

    // Filtros y búsqueda
    searchExams,
    getExamsByUser,
    
    // Metadatos
    getFileTypes,
    getUsersWithExams,

    // Subida de exámenes
    uploadExam
  }
} 