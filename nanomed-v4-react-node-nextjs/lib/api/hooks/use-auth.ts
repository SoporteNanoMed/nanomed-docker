"use client"

import { useState, useEffect, useCallback } from "react"
import { authService } from "../services/auth.service"
import { userService } from "../services/user.service"
import type { User, LoginRequest, RegisterRequest } from "../types"

export const useAuth = () => {
  // Estados iniciales
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // Iniciar en true para verificación inicial
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para verificar autenticación
  const checkAuth = useCallback(async () => {
    try {
      // Solo ejecutar en el cliente
      if (typeof window === "undefined") {
        return false
      }

      // Verificar si hay token y usuario en localStorage
      const token = localStorage.getItem("auth_access_token")
      const userStr = localStorage.getItem("auth_user")

      if (token && userStr) {
        try {
          // Parsear usuario
          const userData = JSON.parse(userStr)

          // Configurar token en API client - IMPORTANTE
          authService.initializeFromStorage()

          // Obtener perfil completo del usuario desde el API para asegurar que tenemos todos los campos
          try {
            const profileResponse = await userService.getProfile()
            if (!profileResponse.error && profileResponse.body) {
              setUser(profileResponse.body)
            } else {
              setUser(userData)
            }
          } catch (profileError) {
            setUser(userData)
          }

          return true
        } catch (e) {
          // Limpiar datos corruptos
          authService.clearSession()
          setUser(null)
          return false
        }
      } else {
        setUser(null)
        return false
      }
    } catch (e) {
      setUser(null)
      return false
    }
  }, [])

  // Verificar autenticación al montar el componente y cuando cambie la URL
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== "undefined") {
      // Verificar autenticación de forma asíncrona
      const initializeAuth = async () => {
        const isAuthenticated = await checkAuth()

        // Marcar como inicializado y finalizar carga
        setInitialized(true)
        setLoading(false)
      }

      initializeAuth()

      // Verificar autenticación cada vez que la ventana recupera el foco
      const handleFocus = () => {
        checkAuth()
      }

      window.addEventListener("focus", handleFocus)
      return () => {
        window.removeEventListener("focus", handleFocus)
      }
    } else {
      // En el servidor, marcar como inicializado sin verificar
      setInitialized(true)
      setLoading(false)
    }
  }, [checkAuth])

  // Función de login
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authService.login(credentials)

      if (!response.error && response.body) {
        // Actualizar estado
        setUser(response.body.user)

        // Guardar token en cookie para el middleware
        if (typeof window !== "undefined" && response.body.token) {
          document.cookie = `auth_access_token=${response.body.token}; path=/; max-age=86400; SameSite=Lax`
        }

        return { success: true }
      } else {
        setError(response.message || "Error al iniciar sesión")
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Error al iniciar sesión"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Función de registro
  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authService.register(userData)

      if (!response.error) {
        return { success: true, message: "Registro exitoso. Por favor verifica tu email." }
      } else {
        setError(response.message || "Error al registrarse")
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Error al registrarse"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Función de logout
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)

      // Limpiar cookie
      if (typeof window !== "undefined") {
        document.cookie = "auth_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      }
    } catch (error) {
      // Error silencioso al cerrar sesión
    } finally {
      setLoading(false)
    }
  }, [])

  // Calcular isAuthenticated basado en el estado actual
  const isAuthenticated = !!user

  return {
    user,
    loading,
    initialized,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError: () => setError(null),
    checkAuth,
  }
}
