import { useState, useEffect, useCallback } from "react"
import { receptionistsService } from "@/lib/api/services/receptionists.service"
import type { 
  ReceptionistAppointment, 
  ReceptionistAppointmentFilters,
  ReceptionistAppointmentsResponse 
} from "@/lib/api/types"

interface UseReceptionistAppointmentsResult {
  appointments: ReceptionistAppointment[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  refetch: () => Promise<void>
  setFilters: (filters: ReceptionistAppointmentFilters) => void
  filters: ReceptionistAppointmentFilters
}

// Función simplificada para obtener citas
async function fetchAppointmentsData(filters: ReceptionistAppointmentFilters) {
  return await receptionistsService.getAllAppointments(filters)
}

export function useReceptionistAppointments(
  initialFilters: ReceptionistAppointmentFilters = {}
): UseReceptionistAppointmentsResult {
  const [appointments, setAppointments] = useState<ReceptionistAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ReceptionistAppointmentFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener datos de citas
      const response = await fetchAppointmentsData(filters)
      
      if (response.error) {
        // Obtener información más detallada del error
        let errorMessage = "Error al cargar las citas"
        
        // Manejar diferentes tipos de errores
        if (response.status === 401) {
          errorMessage = "No tienes autorización para ver las citas. Por favor, inicia sesión nuevamente."
        } else if (response.status === 403) {
          errorMessage = "No tienes permisos suficientes para acceder a las citas. Se requiere rol de recepcionista."
        } else if (response.status === 404) {
          errorMessage = "El endpoint de citas no fue encontrado. Verifica la configuración del servidor."
        } else if (response.status >= 500) {
          errorMessage = "Error del servidor. Por favor, contacta al administrador."
        } else if (typeof response.message === 'string') {
          errorMessage = response.message
        } else if (response.body && typeof response.body === 'object') {
          // Si el body contiene información del error
          if (response.body.message) {
            errorMessage = response.body.message
          } else if (response.body.error) {
            errorMessage = response.body.error
          }
        }
        
        throw new Error(`${errorMessage} (Status: ${response.status})`)
      }

      // Manejar diferentes estructuras de respuesta
      if (response.body) {
        if (response.body.citas) {
          // Estructura esperada: { citas: [...], pagination: {...} }
          setAppointments(response.body.citas)
          setPagination(response.body.pagination || {
            page: 1,
            limit: 20,
            total: response.body.citas.length,
            totalPages: 1
          })
        } else if (Array.isArray(response.body)) {
          // La respuesta es directamente un array de citas
          setAppointments(response.body)
          setPagination({
            page: 1,
            limit: 20,
            total: response.body.length,
            totalPages: 1
          })
        } else {
          // Estructura inesperada
          setAppointments([])
          setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 })
        }
      } else {
        setAppointments([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar las citas"
      setError(errorMessage)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleSetFilters = useCallback((newFilters: ReceptionistAppointmentFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset to page 1 when filters change (unless page is explicitly set)
    }))
  }, [])

  const refetch = useCallback(async () => {
    await fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return {
    appointments,
    loading,
    error,
    pagination,
    refetch,
    setFilters: handleSetFilters,
    filters
  }
} 