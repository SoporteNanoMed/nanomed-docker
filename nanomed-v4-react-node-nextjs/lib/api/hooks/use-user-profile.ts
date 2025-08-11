"use client"

import { useState, useEffect, useCallback } from "react"
import { userService } from "../services/user.service"
import { useAuth } from "./use-auth"
import type { UserProfile, UpdateProfileRequest } from "../types"

export const useUserProfile = () => {
  const { user: authUser, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Crear perfil básico desde datos de autenticación
  const createBasicProfile = useCallback((user: any): UserProfile => {

    return {
      id: user.id || 0,
      role: user.role || "user",
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      email: user.email || "",
      telefono: user.telefono || "",
      rut: user.rut || "",
      email_verified: user.email_verified || false,
      genero: user.genero || "",
      direccion: user.direccion || "",
      ciudad: user.ciudad || "",
      region: user.region || "",
      foto_perfil: user.foto_perfil || "",
      creado_en: user.creado_en || "",
      actualizado_en: user.actualizado_en || "",
      fecha_nacimiento: user.fecha_nacimiento || "",
      mfa_enabled: user.mfa_enabled || false,

      // Campos adicionales con valores por defecto
      fechaNacimiento: user.fecha_nacimiento || user.fechaNacimiento || "",
      grupoSanguineo: user.grupoSanguineo || user.grupo_sanguineo || "",
      alergias: user.alergias || "",
      medicamentos: user.medicamentos || "",
      condicionesMedicas: user.condicionesMedicas || user.condiciones_medicas || "",
      contactoEmergencia: user.contactoEmergencia ||
        user.contacto_emergencia || {
          nombre: "",
          relacion: "",
          telefono: "",
        },
      avatar: user.foto_perfil || user.avatar || "",
      preferenciasNotificaciones: user.preferenciasNotificaciones || {
        emailCitas: true,
        emailResultados: true,
        emailMensajes: true,
        emailPromociones: false,
        smsCitas: true,
        smsResultados: false,
      },
      createdAt: user.creado_en || user.createdAt || "",
      updatedAt: user.actualizado_en || user.updatedAt || "",
    }
  }, [])

  // Cargar perfil del usuario desde /api/users/me
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || !authUser) {
      setProfile(null)
      setInitialized(true)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Verificar que tenemos token antes de hacer la llamada
      const token = localStorage.getItem("auth_access_token")
      if (!token) {
        const basicProfile = createBasicProfile(authUser)
        setProfile(basicProfile)
        setError(null)
        setInitialized(true)
        return
      }

      // Llamar al endpoint /api/users/me
      const response = await userService.getProfile()

      if (!response.error && response.body) {
        setProfile(response.body)
        setError(null)
      } else {
        // Si es un error de autorización, es más serio
        if (response.status === 401 || response.status === 403) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
          setProfile(null)
        } else {
          // Para otros errores, usar perfil básico como fallback
          const basicProfile = createBasicProfile(authUser)
          setProfile(basicProfile)
          setError(`Error al cargar perfil completo: ${response.message}`)
        }
      }
    } catch (error: any) {

      // Asegurar que tenemos al menos un perfil básico
      if (authUser) {
        const basicProfile = createBasicProfile(authUser)
        setProfile(basicProfile)
      }

      // Solo mostrar error si es crítico
      if (error.message?.includes("401") || error.message?.includes("403")) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else {
        setError("Error al cargar perfil. Usando datos básicos.")
      }
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [isAuthenticated, authUser, createBasicProfile])

  // Actualizar perfil
  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      if (!profile) return { success: false, error: "No hay perfil cargado" }

      try {
        setUpdating(true)
        setError(null)

        // Actualizar el perfil local inmediatamente para mejor UX
        const updatedProfile = { ...profile, ...data }
        setProfile(updatedProfile)

        // Intentar actualizar en el servidor
        const response = await userService.updateProfile(data)

        if (!response.error && response.body) {
          setProfile(response.body)
          return { success: true }
        } else {
          // Mantener los cambios locales aunque falle el servidor
          return {
            success: true,
            warning: "Cambios guardados localmente. Algunos cambios podrían no sincronizarse con el servidor.",
          }
        }
      } catch (error: any) {
        // Mantener los cambios locales
        return { success: true, warning: "Cambios guardados localmente. Verifique su conexión a internet." }
      } finally {
        setUpdating(false)
      }
    },
    [profile],
  )

  // Subir avatar
  const uploadAvatar = useCallback(
    async (file: File) => {
      try {
        setUpdating(true)
        setError(null)

        // Crear URL temporal para preview inmediato
        const tempUrl = URL.createObjectURL(file)
        if (profile) {
          setProfile({
            ...profile,
            avatar: tempUrl,
            foto_perfil: tempUrl,
          })
        }

        const response = await userService.uploadAvatar(file)

        if (!response.error && response.body) {
          // Recargar el perfil para obtener la URL actualizada del servidor
          await loadProfile()
          
          return { success: true, avatarUrl: response.body.avatarUrl }
        } else {
          // Mantener la imagen temporal
          return { success: true, warning: "Avatar actualizado localmente. Verifique su conexión para sincronizar." }
        }
      } catch (error: any) {
        return { success: true, warning: "Avatar actualizado localmente. Verifique su conexión para sincronizar." }
      } finally {
        setUpdating(false)
      }
    },
    [profile, loadProfile],
  )

  // Cambiar contraseña
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      setUpdating(true)
      setError(null)

      const response = await userService.updatePassword(currentPassword, newPassword)

      if (!response.error) {
        return { success: true }
      } else {
        setError(response.message || "Error al cambiar contraseña")
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Error al cambiar contraseña"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setUpdating(false)
    }
  }, [])

  // Cargar perfil cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && authUser) {
      loadProfile()
    } else if (!isAuthenticated) {
      setProfile(null)
      setError(null)
      setInitialized(true)
    }
  }, [isAuthenticated, authUser, loadProfile])

  return {
    profile,
    loading,
    updating,
    error,
    initialized,
    loadProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    clearError: () => setError(null),
  }
}
