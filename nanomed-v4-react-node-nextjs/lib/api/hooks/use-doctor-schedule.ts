"use client"

import { useState, useEffect } from "react"
import { doctorsService, type DoctorScheduleResponse } from "@/lib/api/services/doctors.service"

export function useDoctorSchedule(doctorId: number) {
  const [schedule, setSchedule] = useState<DoctorScheduleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await doctorsService.getDoctorSchedule(doctorId)

      if (response.error) {
        throw new Error(response.message || "Error al cargar los horarios")
      }

      setSchedule(response.body)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (doctorId) {
      fetchSchedule()
    }
  }, [doctorId])

  return {
    schedule,
    loading,
    error,
    refetch: fetchSchedule,
  }
}
