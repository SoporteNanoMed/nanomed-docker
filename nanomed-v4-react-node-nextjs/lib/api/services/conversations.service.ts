import { apiClient } from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/config"
import type { ApiResponse } from "@/lib/api/types"

// Tipos específicos para conversaciones
export interface Conversation {
  id: number
  medico_id: number
  paciente_id: number
  creado_en: string
  ultimo_mensaje?: Message
}

export interface Message {
  id: number
  conversacion_id: number
  emisor_id: number
  contenido: string
  archivo_path?: string
  leido: boolean
  creado_en: string
}

export class ConversationsService {
  // Listar conversaciones del usuario
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return apiClient.get<Conversation[]>(ENDPOINTS.CONVERSATIONS.LIST)
  }

  // Obtener mensajes de una conversación
  async getMessages(conversationId: number): Promise<ApiResponse<Message[]>> {
    return apiClient.get<Message[]>(`${ENDPOINTS.CONVERSATIONS.LIST}/${conversationId}/messages`)
  }

  // Iniciar nueva conversación
  async createConversation(medico_id: number): Promise<ApiResponse<Conversation>> {
    return apiClient.post<Conversation>(ENDPOINTS.CONVERSATIONS.LIST, { medico_id })
  }

  // Enviar mensaje
  async sendMessage(conversationId: number, contenido: string, archivo?: File): Promise<ApiResponse<Message>> {
    if (archivo) {
      const formData = new FormData()
      formData.append("contenido", contenido)
      formData.append("archivo", archivo)

      return apiClient.upload<Message>(`${ENDPOINTS.CONVERSATIONS.LIST}/${conversationId}/messages`, formData)
    } else {
      return apiClient.post<Message>(`${ENDPOINTS.CONVERSATIONS.LIST}/${conversationId}/messages`, { contenido })
    }
  }

  // Marcar mensaje como leído
  async markMessageAsRead(conversationId: number, messageId: number): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${ENDPOINTS.CONVERSATIONS.LIST}/${conversationId}/messages/${messageId}/read`)
  }

  // Descargar archivo adjunto
  async downloadAttachment(conversationId: number, messageId: number): Promise<Blob> {
    const response = await fetch(
      `${apiClient.apiBaseURL}${ENDPOINTS.CONVERSATIONS.LIST}/${conversationId}/messages/${messageId}/attachment`,
      {
        headers: {
          Authorization: `Bearer ${apiClient.authToken}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Error al descargar el archivo")
    }

    return response.blob()
  }
}

export const conversationsService = new ConversationsService()
