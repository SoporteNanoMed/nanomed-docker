import { useState, useEffect } from "react"
import { examsService } from "@/lib/api/services/exams.service"

// Tipos para el hook
export interface ExamWithDetails {
  id: string // Cambié de number a string para blob storage
  paciente_id: number
  medico_id?: number | null
  tipo_examen: string
  fecha: string
  descripcion?: string | null
  resultados?: string | null
  estado?: string
  archivo_path?: string | null
  archivo_nombre_original?: string | null
  archivo_container?: string | null
  archivo_url?: string | null
  creado_en?: string
  actualizado_en?: string
  nombre_medico?: string | null
  email_medico?: string | null
  nombre_paciente?: string | null
  email_paciente?: string | null
  rut_paciente?: string | null
  telefono_paciente?: string | null
  es_blob_storage?: boolean
  archivo_tamaño?: number
  archivo_tipo?: string
}

export interface ExamsResponse {
  examenes: ExamWithDetails[]
  total: number
  filtros_aplicados: any
  user_role: string
  examenes_bd?: number
  examenes_blob?: number
}

export interface UseExamsOptions {
  filters?: any
  autoFetch?: boolean
}

export interface UseExamsReturn {
  exams: ExamWithDetails[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => Promise<void>
  downloadExamFile: (id: string) => Promise<void>
  deleteExam: (id: string, reason?: string) => Promise<boolean>
  moveExam: (id: string, targetFolder: string, reason?: string) => Promise<boolean>
  restoreExam: (id: string) => Promise<boolean>
}

export function useExams(options: UseExamsOptions = {}): UseExamsReturn {
  const { filters, autoFetch = true } = options
  const [exams, setExams] = useState<ExamWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchExams = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await examsService.getExams(filters)
      
      if (response.error) {
        setError(response.message || "Error al cargar los exámenes")
        return
      }

      // El backend devuelve { examenes, total, filtros_aplicados, user_role }
      const data = response.body as ExamsResponse
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
      const blob = await examsService.downloadExamFile(id)
      
      // Obtener información del examen para el nombre del archivo
      const examResponse = await examsService.getExamById(id)
      const filename = examResponse.body?.archivo_nombre_original || `examen_${id}.pdf`
      
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
      
      const response = await examsService.deleteExam(id, reason)
      
      if (response.error) {
        setError(response.message || "Error al eliminar el examen")
        return false
      }

      // Actualizar la lista de exámenes
      await fetchExams()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el examen")
      return false
    } finally {
      setLoading(false)
    }
  }

  const moveExam = async (id: string, targetFolder: string, reason?: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await examsService.moveExam(id, targetFolder, reason)
      
      if (response.error) {
        setError(response.message || "Error al mover el examen")
        return false
      }

      // Actualizar la lista de exámenes
      await fetchExams()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al mover el examen")
      return false
    } finally {
      setLoading(false)
    }
  }

  const restoreExam = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await examsService.restoreExam(id)
      
      if (response.error) {
        setError(response.message || "Error al restaurar el examen")
        return false
      }

      // Actualizar la lista de exámenes
      await fetchExams()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restaurar el examen")
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchExams()
    }
  }, [filters, autoFetch])

  return {
    exams,
    loading,
    error,
    total,
    refetch: fetchExams,
    downloadExamFile,
    deleteExam,
    moveExam,
    restoreExam,
  }
}

// ========= NOTA IMPORTANTE =========
// El método createExam() ha sido ELIMINADO
// porque ya no se crean exámenes en base de datos.
// Ahora todos los exámenes se gestionan directamente
// subiendo archivos al Azure Blob Storage.
// =================================== 