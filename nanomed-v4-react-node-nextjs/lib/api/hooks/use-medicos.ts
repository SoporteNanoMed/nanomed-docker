import { useState, useEffect } from 'react'

interface Medico {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string
  especialidad: string
  foto_perfil?: string
  email_verified: boolean
  creado_en: string
  actualizado_en: string
  role: string
  tipo_registro?: string
  fuente?: string
}

interface UseMedicosReturn {
  medicos: Medico[]
  loading: boolean
  error: string | null
  refetch: () => void
  searchMedicos: (filtros: any) => void
}

export function useMedicos(): UseMedicosReturn {
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMedicos = async (filtros = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/admin/medicos?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener los médicos')
      }

      const data = await response.json()
      setMedicos(data.body || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching médicos:', err)
    } finally {
      setLoading(false)
    }
  }

  const searchMedicos = (filtros: any) => {
    fetchMedicos(filtros)
  }

  const refetch = () => {
    fetchMedicos()
  }

  useEffect(() => {
    fetchMedicos()
  }, [])

  return {
    medicos,
    loading,
    error,
    refetch,
    searchMedicos
  }
} 