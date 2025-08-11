import { apiClient } from "../client"
import { ENDPOINTS } from "../config"
import type { LoginRequest, RegisterRequest, LoginResponse, User, ApiResponse } from "../types"

export class AuthService {
  private readonly ACCESS_TOKEN_KEY = "auth_access_token"
  private readonly REFRESH_TOKEN_KEY = "auth_refresh_token"
  private readonly USER_KEY = "auth_user"

  // Iniciar sesión
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data)

      // Si el login es exitoso, guardar tokens y usuario
      if (!response.error && response.body) {
        // Try different possible token field names
        const possibleTokens = {
          token: response.body.token,
          accessToken: (response.body as any).accessToken,
          access_token: (response.body as any).access_token,
        }

        const possibleRefreshTokens = {
          refreshToken: response.body.refreshToken,
          refresh_token: (response.body as any).refresh_token,
        }

        // Use the first available token
        const token = possibleTokens.token || possibleTokens.accessToken || possibleTokens.access_token
        const refreshToken = possibleRefreshTokens.refreshToken || possibleRefreshTokens.refresh_token

        if (token && response.body.user) {
          // Guardar tokens y usuario
          this.setTokens(token, refreshToken || "")
          this.setUser(response.body.user)
        } else {
          return {
            error: true,
            status: response.status,
            body: null as unknown as LoginResponse,
            message: "Token o datos de usuario faltantes en la respuesta",
          }
        }
      }

      return response
    } catch (error) {
      return {
        error: true,
        status: 0,
        body: null as unknown as LoginResponse,
        message: error instanceof Error ? error.message : "Error en el login",
      }
    }
  }

  // Registrar nuevo usuario
  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post<User>(ENDPOINTS.AUTH.REGISTER, data)

      // Si hay error, intentar proporcionar un mensaje más específico
      if (response.error) {
        let errorMessage = response.message || "Error en el registro"

        // Mensajes específicos según el código de estado
        switch (response.status) {
          case 400:
            errorMessage = "Datos inválidos. Verifica que todos los campos estén correctos."
            break
          case 409:
            errorMessage = "El correo electrónico ya está registrado. Intenta con otro correo."
            break
          case 422:
            errorMessage = "Los datos proporcionados no son válidos. Verifica el formato del RUT y correo."
            break
          case 500:
            errorMessage = "Error interno del servidor. Intenta nuevamente en unos minutos."
            break
          case 0:
            errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet."
            break
        }

        return {
          ...response,
          message: errorMessage,
        }
      }

      return response
    } catch (error) {
      return {
        error: true,
        status: 0,
        body: null as unknown as User,
        message: error instanceof Error ? error.message : "Error inesperado en el registro",
      }
    }
  }

  // Cerrar sesión
  async logout(): Promise<ApiResponse<void>> {
    try {
      // Intentar notificar al servidor solo si hay token
      const token = this.getAccessToken()
      if (token) {
        try {
          const response = await apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT)
          // No retornar aquí, continuar con la limpieza local
        } catch (serverError) {
          // No lanzar el error, solo registrarlo
        }
      }

      // Siempre limpiar sesión local, independientemente del resultado del servidor
      this.clearSession()

      return {
        error: false,
        status: 200,
        body: undefined,
        message: "Sesión cerrada exitosamente",
      }
    } catch (error) {
      // Siempre limpiar sesión local, incluso si hay errores
      this.clearSession()

      return {
        error: false, // Cambiado a false porque la limpieza local es lo importante
        status: 200,
        body: undefined,
        message: "Sesión cerrada localmente",
      }
    }
  }

  // Guardar tokens
  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)

      // Guardar también en cookies para el middleware
      document.cookie = `auth_access_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`
      if (refreshToken) {
        document.cookie = `auth_refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`
      }

      // También configurar en el cliente API inmediatamente
      apiClient.setToken(accessToken)
    }
  }

  // Guardar usuario
  private setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }
  }

  // Obtener access token
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  // Obtener refresh token
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  // Obtener usuario
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    try {
      const userStr = localStorage.getItem(this.USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      // Error silencioso al obtener usuario
      return null
    }
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  // Limpiar sesión
  clearSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)

      // Limpiar también las claves antiguas por si acaso
      localStorage.removeItem("token")
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")

      // Limpiar cookies
      document.cookie = "auth_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "auth_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }

    apiClient.setToken(null)
  }

  // Inicializar token en el cliente API (para cuando se recarga la página)
  initializeFromStorage(): void {
    const token = this.getAccessToken()

    if (token) {
      apiClient.setToken(token)
    }
  }
}

export const authService = new AuthService()
