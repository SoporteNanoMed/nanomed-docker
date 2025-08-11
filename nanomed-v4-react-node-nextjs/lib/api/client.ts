import { API_CONFIG, DEFAULT_HEADERS } from "./config"
import type { ApiResponse } from "./types"

class ApiClient {
  private baseURL: string
  private timeout: number
  public authToken: string | null = null

  constructor() {
    // Usar la configuración dinámicamente en lugar de en el constructor
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT

    // Inicializar token desde localStorage si está disponible
    if (typeof window !== "undefined") {
      try {
        this.authToken = localStorage.getItem("auth_access_token")
      } catch (error) {
        this.authToken = null
      }
    }
  }

  // Obtener la URL base dinámicamente
  private getBaseURL(): string {
    return API_CONFIG.BASE_URL
  }

  get apiBaseURL() {
    return this.baseURL
  }

  setToken(token: string | null) {
    this.authToken = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_access_token", token)
      } else {
        localStorage.removeItem("auth_access_token")
      }
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { ...DEFAULT_HEADERS }

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type")
    let body: any

    try {
      if (contentType && contentType.includes("application/json")) {
        body = await response.json()
      } else {
        body = await response.text()
      }
    } catch (error) {
      body = null
    }

    if (!response.ok) {
      return {
        error: true,
        status: response.status,
        body: body,
        message: body?.message || body?.error || response.statusText || "Error en la solicitud",
      }
    }

    // Si la respuesta tiene el formato estándar de la API
    if (body && typeof body === "object" && "error" in body && "status" in body && "body" in body) {
      return {
        error: body.error || false,
        status: body.status || response.status,
        body: body.body,
        message: body.message,
      }
    }

    // Si la respuesta es directamente el contenido
    return {
      error: false,
      status: response.status,
      body: body,
      message: "Success",
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.getBaseURL()}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders(),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return this.handleResponse<T>(response)
    } catch (error: any) {

      if (error.name === "AbortError") {
        return {
          error: true,
          status: 0,
          body: null as T,
          message: "Request timeout",
        }
      }

      return {
        error: true,
        status: 0,
        body: null as T,
        message: error.message || "Network error",
      }
    }
  }

  async post<T>(endpoint: string, data?: any, options?: { headers?: HeadersInit }): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      // Determinar si es FormData
      const isFormData = data instanceof FormData
      
      // Preparar headers
      const headers = { ...this.getHeaders() }
      
      // Si se proporcionan headers adicionales, agregarlos
      if (options?.headers) {
        Object.assign(headers, options.headers)
      }
      
      // Para FormData, no establecer Content-Type (se establece automáticamente con boundary)
      if (isFormData) {
        delete headers['Content-Type']
      }

      const response = await fetch(`${this.getBaseURL()}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return this.handleResponse<T>(response)
    } catch (error: any) {

      if (error.name === "AbortError") {
        return {
          error: true,
          status: 0,
          body: null as T,
          message: "Request timeout",
        }
      }

      return {
        error: true,
        status: 0,
        body: null as T,
        message: error.message || "Network error",
      }
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.getBaseURL()}${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return this.handleResponse<T>(response)
    } catch (error: any) {

      if (error.name === "AbortError") {
        return {
          error: true,
          status: 0,
          body: null as T,
          message: "Request timeout",
        }
      }

      return {
        error: true,
        status: 0,
        body: null as T,
        message: error.message || "Network error",
      }
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.getBaseURL()}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return this.handleResponse<T>(response)
    } catch (error: any) {

      if (error.name === "AbortError") {
        return {
          error: true,
          status: 0,
          body: null as T,
          message: "Request timeout",
        }
      }

      return {
        error: true,
        status: 0,
        body: null as T,
        message: error.message || "Network error",
      }
    }
  }
}

export const apiClient = new ApiClient()
