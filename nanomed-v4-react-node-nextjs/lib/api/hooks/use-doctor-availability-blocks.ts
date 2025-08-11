"use client"

import { useState, useEffect } from "react"
import { doctorsService, type AvailabilityBlocksResponse } from "@/lib/api/services/doctors.service"

export interface TimeSlot {
  hora: string
  fecha_hora_inicio: string
  fecha_hora_fin: string
  disponible: boolean
  duracion: number
  bloque_id: number
}

export function useDoctorAvailabilityBlocks(doctorId: number | null, fecha: string | null) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [doctorInfo, setDoctorInfo] = useState<{nombre: string, apellido: string} | null>(null)

  const fetchAvailabilityBlocks = async () => {
    if (!doctorId || !fecha) {
      setAvailableSlots([])
      setLoading(false)
      setError(null)
      setDoctorInfo(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Formatear la fecha como YYYY-MM-DD
      const formattedDate = fecha instanceof Date 
        ? fecha.toISOString().split('T')[0] 
        : fecha

      const response = await doctorsService.getDoctorAvailabilityBlocks(doctorId, {
        fecha: formattedDate
      })

      if (response.error) {
        throw new Error(response.message || "Error al cargar los bloques de disponibilidad")
      }

      const data = response.body || response.data
      if (!data) {
        throw new Error("No se recibieron datos del servidor")
      }

      // Establecer información del médico
      if (data.medico) {
        setDoctorInfo({
          nombre: data.medico.nombre,
          apellido: data.medico.apellido
        })
      }

      // Procesar bloques para la fecha específica
      const slots: TimeSlot[] = []
      
      if (data.resumen_por_fecha && data.resumen_por_fecha.length > 0) {
        const fechaData = data.resumen_por_fecha.find(d => d.fecha === formattedDate)
        
        if (fechaData && fechaData.bloques) {
          fechaData.bloques.forEach(bloque => {
            if (bloque.disponible && !bloque.cita_reservada) {
              // Calcular duración en minutos
              const inicio = new Date(bloque.fecha_hora_inicio)
              const fin = new Date(bloque.fecha_hora_fin)
              const duracionMs = fin.getTime() - inicio.getTime()
              const duracionMinutos = Math.round(duracionMs / (1000 * 60))

              slots.push({
                hora: bloque.hora_inicio,
                fecha_hora_inicio: bloque.fecha_hora_inicio,
                fecha_hora_fin: bloque.fecha_hora_fin,
                disponible: true,
                duracion: duracionMinutos,
                bloque_id: bloque.id
              })
            }
          })
        }
      }

      // Ordenar slots por hora
      slots.sort((a, b) => a.hora.localeCompare(b.hora))
      
      setAvailableSlots(slots)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setAvailableSlots([])
      setDoctorInfo(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailabilityBlocks()
  }, [doctorId, fecha])

  return {
    availableSlots,
    loading,
    error,
    doctorInfo,
    refetch: fetchAvailabilityBlocks,
  }
} 