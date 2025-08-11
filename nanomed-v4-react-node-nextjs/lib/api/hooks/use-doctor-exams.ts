import { useState, useEffect } from "react"
import { doctorExamsService } from "@/lib/api/services/doctor-exams.service"
import type { ExamWithDetails, ExamFilters, ApiResponse } from "@/lib/api/types"

interface UseDoctorExamsOptions {
  filters?: ExamFilters
  autoFetch?: boolean
}

interface DoctorExamsResponse {
  examenes: ExamWithDetails[]
  total: number
  filtros_aplicados: ExamFilters
  user_role: string
}

interface UseDoctorExamsReturn {
  exams: ExamWithDetails[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => Promise<void>
  downloadExamFile: (id: string) => Promise<void>
  deleteExam: (id: string, reason?: string) => Promise<boolean>
  getExamsByPatient: (patientId: number, filters?: ExamFilters) => Promise<ExamWithDetails[]>
  getExamsByType: (tipo_examen: string, filters?: ExamFilters) => Promise<ExamWithDetails[]>
  getRecentExams: (days?: number, filters?: ExamFilters) => Promise<ExamWithDetails[]>
  searchExams: (query: string, filters?: ExamFilters) => Promise<ExamWithDetails[]>
  getFileTypes: () => Promise<string[]>
  getUsersWithExams: () => Promise<any[]>
}

export function useDoctorExams(options: UseDoctorExamsOptions = {}): UseDoctorExamsReturn {
  const { filters, autoFetch = true } = options
  const [exams, setExams] = useState<ExamWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchAllExams = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await doctorExamsService.getAllExams(filters)
      
      if (response.error) {
        setError(response.message || "Error al cargar los exámenes")
        return
      }

      const data = response.body as DoctorExamsResponse
      setExams(data.examenes || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al cargar los exámenes")
    } finally {
      setLoading(false)
    }
  }

  const downloadExamFile = async (id: string) => {
    try {
      setError(null)
      const blob = await doctorExamsService.downloadExamFile(id)
      
      // Obtener información del examen para el nombre del archivo
      // Para blob storage, el ID ya contiene información útil
      const filename = `examen_${id.replace('blob_', '')}.pdf`
      
      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al descargar el archivo")
    }
  }

  const deleteExam = async (id: string, reason?: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await doctorExamsService.deleteExam(id, reason)
      
      if (response.error) {
        setError(response.message || "Error al eliminar el examen")
        return false
      }

      // Actualizar la lista de exámenes
      await fetchAllExams()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el examen")
      return false
    } finally {
      setLoading(false)
    }
  }

  const getExamsByPatient = async (patientId: number, filters?: ExamFilters): Promise<ExamWithDetails[]> => {
    try {
      setError(null)
      const response = await doctorExamsService.getExamsByPatient(patientId, filters)
      
      if (response.error) {
        setError(response.message || "Error al cargar los exámenes del paciente")
        return []
      }

      return response.body
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los exámenes del paciente")
      return []
    }
  }

  const getExamsByType = async (tipo_examen: string, filters?: ExamFilters): Promise<ExamWithDetails[]> => {
    try {
      setError(null)
      const response = await doctorExamsService.getExamsByType(tipo_examen, filters)
      
      if (response.error) {
        setError(response.message || "Error al cargar los exámenes por tipo")
        return []
      }

      return response.body
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los exámenes por tipo")
      return []
    }
  }

  const getRecentExams = async (days = 30, filters?: ExamFilters): Promise<ExamWithDetails[]> => {
    try {
      setError(null)
      const response = await doctorExamsService.getRecentExams(days, filters)
      
      if (response.error) {
        setError(response.message || "Error al cargar los exámenes recientes")
        return []
      }

      return response.body
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los exámenes recientes")
      return []
    }
  }

  const searchExams = async (query: string, filters?: ExamFilters): Promise<ExamWithDetails[]> => {
    try {
      setError(null)
      const response = await doctorExamsService.searchExams(query, filters)
      
      if (response.error) {
        setError(response.message || "Error al buscar exámenes")
        return []
      }

      return response.body.examenes || []
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar exámenes")
      return []
    }
  }

  const getFileTypes = async (): Promise<string[]> => {
    try {
      setError(null)
      const response = await doctorExamsService.getFileTypes()
      
      if (response.error) {
        setError(response.message || "Error al cargar tipos de archivo")
        return []
      }

      return response.body
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tipos de archivo")
      return []
    }
  }

  const getUsersWithExams = async (): Promise<any[]> => {
    try {
      setError(null)
      const response = await doctorExamsService.getUsersWithExams()
      
      if (response.error) {
        setError(response.message || "Error al cargar usuarios con exámenes")
        return []
      }

      return response.body
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios con exámenes")
      return []
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchAllExams()
    }
  }, [filters, autoFetch])

  return {
    exams,
    loading,
    error,
    total,
    refetch: fetchAllExams,
    downloadExamFile,
    deleteExam,
    getExamsByPatient,
    getExamsByType,
    getRecentExams,
    searchExams,
    getFileTypes,
    getUsersWithExams,
  }
}

// ========= NOTA IMPORTANTE =========
// Este hook ha sido ACTUALIZADO para usar exclusivamente
// blob storage. Ya no trabaja con endpoints de base de datos.
// Los IDs ahora son strings y incluyen el prefijo 'blob_'.
// =================================== 