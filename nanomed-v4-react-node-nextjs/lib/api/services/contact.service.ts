import { apiClient } from "../client"
import { ENDPOINTS } from "../config"
import type { ApiResponse } from "../types"

export interface ContactFormData {
  nombreApellido: string
  empresa?: string
  servicio: string
  telefono: string
  email: string
  mensaje: string
}

export interface ContactResponse {
  message: string
  emailStatus: string
}

export class ContactService {
  // Enviar mensaje de contacto
  async sendContactMessage(data: ContactFormData): Promise<ApiResponse<ContactResponse>> {
    try {
      const response = await apiClient.post<ContactResponse>(ENDPOINTS.CONTACT.SEND_MESSAGE, data)

      // Si hay error, proporcionar mensajes más específicos
      if (response.error) {
        let errorMessage = response.message || "Error al enviar el mensaje"

        // Mensajes específicos según el código de estado
        switch (response.status) {
          case 400:
            errorMessage = "Datos inválidos. Verifica que todos los campos obligatorios estén completados correctamente."
            break
          case 422:
            errorMessage = "Los datos proporcionados no son válidos. Verifica el formato del email y teléfono."
            break
          case 429:
            errorMessage = "Has enviado demasiados mensajes. Por favor intenta nuevamente en unos minutos."
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
        body: null as unknown as ContactResponse,
        message: error instanceof Error ? error.message : "Error inesperado al enviar el mensaje",
      }
    }
  }
}

export const contactService = new ContactService() 