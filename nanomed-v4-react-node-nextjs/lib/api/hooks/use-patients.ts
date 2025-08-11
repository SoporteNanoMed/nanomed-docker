import { useState, useEffect } from "react"
import { receptionistsService } from "@/lib/api/services/receptionists.service"
import type { ReceptionistPatient, ReceptionistPatientsResponse } from "@/lib/api/services/receptionists.service"

interface UsePatientsOptions {
  autoFetch?: boolean
  search?: string
}

interface UsePatientsReturn {
  patients: ReceptionistPatient[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => Promise<void>
}

export function usePatients(options: UsePatientsOptions = {}): UsePatientsReturn {
  const { autoFetch = true, search } = options
  const [patients, setPatients] = useState<ReceptionistPatient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters = {
        search,
        page: 1,
        limit: 50 // Obtener más pacientes para la búsqueda
      }
      
      const response = await receptionistsService.getPatients(filters)
      
      if (response.error) {
        setError(response.message || "Error al cargar los pacientes")
        return
      }

      const data = response.body as ReceptionistPatientsResponse
      setPatients(data.pacientes || [])
      setTotal(data.pagination?.total || data.pacientes?.length || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al cargar los pacientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchPatients()
    }
  }, [autoFetch, search])

  return {
    patients,
    loading,
    error,
    total,
    refetch: fetchPatients,
  }
} 