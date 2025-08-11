"use client"

import { useState, useEffect } from "react"
import { doctorsService } from "@/lib/api/services/doctors.service"

export interface AvailableDay {
  fecha: string
  tieneDisponibilidad: boolean
  bloquesDisponibles: number
  totalBloques: number
}

export function useDoctorAvailableDays(doctorId: number | null, mesInicio?: Date) {
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailableDays = async () => {
    if (!doctorId) {
      setAvailableDays([])
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Calcular el rango de fechas (mes completo desde la fecha actual o desde mesInicio)
      const inicio = mesInicio ? new Date(mesInicio) : new Date()
      inicio.setDate(1) // Primer día del mes
      
      const fin = new Date(inicio)
      fin.setMonth(fin.getMonth() + 2) // Obtener 2 meses para tener suficientes datos
      fin.setDate(0) // Último día del mes anterior (último día del segundo mes)

      const fechaInicio = inicio.toISOString().split('T')[0]
      const fechaFin = fin.toISOString().split('T')[0]

      const response = await doctorsService.getDoctorAvailabilityBlocks(doctorId, {
        fecha_desde: fechaInicio,
        fecha_hasta: fechaFin
      })

      if (response.error) {
        throw new Error(response.message || "Error al cargar los días disponibles")
      }

      const data = response.body || response.data
      if (!data || !data.resumen_por_fecha) {
        setAvailableDays([])
        return
      }

      // Procesar los datos para crear la lista de días disponibles
      const diasDisponibles: AvailableDay[] = data.resumen_por_fecha.map(resumen => ({
        fecha: resumen.fecha,
        tieneDisponibilidad: resumen.bloques_disponibles > 0,
        bloquesDisponibles: resumen.bloques_disponibles,
        totalBloques: resumen.total_bloques
      }))

      setAvailableDays(diasDisponibles)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setAvailableDays([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailableDays()
  }, [doctorId, mesInicio])

  // Función helper para verificar si una fecha específica tiene disponibilidad
  const hasAvailability = (fecha: Date): boolean => {
    const fechaString = fecha.toISOString().split('T')[0]
    const diaInfo = availableDays.find(day => day.fecha === fechaString)
    return diaInfo?.tieneDisponibilidad || false
  }

  // Función helper para obtener el conjunto de fechas disponibles
  const getAvailableDates = (): Set<string> => {
    return new Set(availableDays
      .filter(day => day.tieneDisponibilidad)
      .map(day => day.fecha))
  }

  return {
    availableDays,
    loading,
    error,
    hasAvailability,
    getAvailableDates,
    refetch: fetchAvailableDays,
  }
} 