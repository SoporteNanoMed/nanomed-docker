"use client"

import { useState, useEffect } from "react"
import { doctorsService, type DoctorAvailabilityResponse } from "@/lib/api/services/doctors.service"

export function useDoctorAvailability(doctorId: number | null, fecha: string | null) {
  const [availability, setAvailability] = useState<DoctorAvailabilityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailability = async () => {
    if (!doctorId || !fecha) {
      setAvailability(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Formatear la fecha como YYYY-MM-DD
      const formattedDate = fecha instanceof Date 
        ? fecha.toISOString().split('T')[0] 
        : fecha

      const response = await doctorsService.checkDoctorAvailability(doctorId, formattedDate)

      if (response.error) {
        throw new Error(response.message || "Error al cargar la disponibilidad")
      }

      setAvailability(response.body || response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setAvailability(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [doctorId, fecha])

  return {
    availability,
    loading,
    error,
    refetch: fetchAvailability,
  }
} 