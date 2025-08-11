"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { doctorsService } from "@/lib/api/services/doctors.service"
import type { Doctor, DoctorFilters } from "@/lib/api/types"

interface UseDoctorsReturn {
  doctors: Doctor[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => void
  searchDoctors: (filters: DoctorFilters) => void
}

interface UseMedicosReturn {
  medicos: Doctor[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => void
}

export function useDoctors(initialFilters?: DoctorFilters): UseDoctorsReturn {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  // Memorizar los filtros iniciales para evitar cambios constantes
  const memoizedFilters = useMemo(() => initialFilters, [JSON.stringify(initialFilters)])

  const fetchDoctors = useCallback(async (filters?: DoctorFilters) => {
    try {
      setLoading(true)
      setError(null)

      const response = await doctorsService.getDoctors(filters)

      if (response?.error) {
        throw new Error(response.message || "Error al cargar médicos")
      }

      const medicosData = Array.isArray(response?.body?.medicos) ? response.body.medicos : []
      const totalData = response?.body?.total || medicosData.length

      setDoctors(medicosData)
      setTotal(totalData)
    } catch (err) {
      console.error("Error fetching doctors:", err)
      setError(err instanceof Error ? err.message : "Error al cargar médicos")
      setDoctors([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    fetchDoctors(memoizedFilters)
  }, [fetchDoctors, memoizedFilters])

  const searchDoctors = useCallback(
    (filters: DoctorFilters) => {
      fetchDoctors(filters)
    },
    [fetchDoctors],
  )

  // Solo ejecutar una vez al montar el componente
  useEffect(() => {
    fetchDoctors(memoizedFilters)
  }, []) // Dependencias vacías para ejecutar solo una vez

  return {
    doctors,
    loading,
    error,
    total,
    refetch,
    searchDoctors,
  }
}

// Hook simplificado para médicos
export function useMedicos(): UseMedicosReturn {
  const [medicos, setMedicos] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchMedicos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await doctorsService.getDoctors({ activo: true })

      if (response?.error) {
        throw new Error(response.message || "Error al cargar médicos")
      }

      const medicosData = Array.isArray(response?.body?.medicos) ? response.body.medicos : []
      const totalData = response?.body?.total || medicosData.length

      setMedicos(medicosData)
      setTotal(totalData)
    } catch (err) {
      console.error("Error fetching medicos:", err)
      setError(err instanceof Error ? err.message : "Error al cargar médicos")
      setMedicos([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    fetchMedicos()
  }, [fetchMedicos])

  useEffect(() => {
    fetchMedicos()
  }, [fetchMedicos])

  return {
    medicos,
    loading,
    error,
    total,
    refetch,
  }
}

export function useDoctor(id: number) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchDoctor = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await doctorsService.getDoctorById(id)

        if (response?.error) {
          throw new Error(response.message || "Error al cargar médico")
        }

        setDoctor(response?.body || null)
      } catch (err) {
        console.error("Error fetching doctor:", err)
        setError(err instanceof Error ? err.message : "Error al cargar médico")
        setDoctor(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [id])

  return { doctor, loading, error }
}
