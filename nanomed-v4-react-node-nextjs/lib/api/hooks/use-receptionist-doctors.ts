import { useState, useEffect, useCallback } from "react"
import { receptionistsService } from "@/lib/api/services/receptionists.service"
import type { 
  ReceptionistDoctor, 
  ReceptionistDoctorFilters,
  ReceptionistDoctorsResponse 
} from "@/lib/api/types"

interface UseReceptionistDoctorsResult {
  doctors: ReceptionistDoctor[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  refetch: () => Promise<void>
  setFilters: (filters: ReceptionistDoctorFilters) => void
  filters: ReceptionistDoctorFilters
}

export function useReceptionistDoctors(
  initialFilters: ReceptionistDoctorFilters = {}
): UseReceptionistDoctorsResult {
  const [doctors, setDoctors] = useState<ReceptionistDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ReceptionistDoctorFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await receptionistsService.getDoctors(filters)
      
      if (response.error) {
        const errorMessage = typeof response.message === 'string' 
          ? response.message 
          : "Error al cargar los médicos"
        throw new Error(errorMessage)
      }

      if (response.body && response.body.medicos) {
        setDoctors(response.body.medicos)
        setPagination(response.body.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        })
      } else {
        console.warn("Respuesta sin estructura esperada:", response)
        setDoctors([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 })
      }
    } catch (err) {
      console.error("Error al obtener médicos:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al cargar los médicos"
      setError(errorMessage)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleSetFilters = useCallback((newFilters: ReceptionistDoctorFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset to page 1 when filters change (unless page is explicitly set)
    }))
  }, [])

  const refetch = useCallback(async () => {
    await fetchDoctors()
  }, [fetchDoctors])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  return {
    doctors,
    loading,
    error,
    pagination,
    refetch,
    setFilters: handleSetFilters,
    filters
  }
} 