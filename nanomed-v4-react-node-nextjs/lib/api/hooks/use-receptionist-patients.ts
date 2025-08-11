import { useState, useEffect, useCallback } from "react"
import { receptionistsService } from "@/lib/api/services/receptionists.service"
import type { 
  ReceptionistPatient, 
  ReceptionistPatientFilters,
  ReceptionistPatientsResponse 
} from "@/lib/api/types"

interface UseReceptionistPatientsResult {
  patients: ReceptionistPatient[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  refetch: () => Promise<void>
  setFilters: (filters: ReceptionistPatientFilters) => void
  filters: ReceptionistPatientFilters
}

export function useReceptionistPatients(
  initialFilters: ReceptionistPatientFilters = {}
): UseReceptionistPatientsResult {
  const [patients, setPatients] = useState<ReceptionistPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ReceptionistPatientFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await receptionistsService.getPatients(filters)
      
      if (response.error) {
        const errorMessage = typeof response.message === 'string' 
          ? response.message 
          : "Error al cargar los pacientes"
        throw new Error(errorMessage)
      }

      if (response.body && response.body.pacientes) {
        setPatients(response.body.pacientes)
        setPagination(response.body.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        })
      } else {
        console.warn("Respuesta sin estructura esperada:", response)
        setPatients([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 })
      }
    } catch (err) {
      console.error("Error al obtener pacientes:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al cargar los pacientes"
      setError(errorMessage)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleSetFilters = useCallback((newFilters: ReceptionistPatientFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset to page 1 when filters change (unless page is explicitly set)
    }))
  }, [])

  const refetch = useCallback(async () => {
    await fetchPatients()
  }, [fetchPatients])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return {
    patients,
    loading,
    error,
    pagination,
    refetch,
    setFilters: handleSetFilters,
    filters
  }
} 