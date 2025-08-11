import { apiClient } from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/config"
import type { NotificationFilters, NotificationsResponse, ApiResponse } from "@/lib/api/types"

export class NotificationsService {
  // Listar notificaciones del usuario
  async getNotifications(filters?: NotificationFilters): Promise<ApiResponse<NotificationsResponse>> {
    const params = {
      ...filters,
      limite: filters?.limite || 50,
      offset: filters?.offset || 0,
    }
    return apiClient.get<NotificationsResponse>(ENDPOINTS.NOTIFICATIONS.LIST, params)
  }

  // Marcar notificación como leída - Note: This endpoint is not defined in the OpenAPI spec
  // This method may need to be removed or the API needs to be updated
  async markAsRead(id: number): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${ENDPOINTS.NOTIFICATIONS.LIST}/${id}/read`)
  }

  // Marcar todas las notificaciones como leídas - Note: This endpoint is not defined in the OpenAPI spec
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${ENDPOINTS.NOTIFICATIONS.LIST}/read-all`)
  }

  // Eliminar notificación - Note: This endpoint is not defined in the OpenAPI spec
  async deleteNotification(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${ENDPOINTS.NOTIFICATIONS.LIST}/${id}`)
  }

  // Obtener notificaciones no leídas
  async getUnreadNotifications(): Promise<ApiResponse<NotificationsResponse>> {
    return this.getNotifications({ leida: false })
  }

  // Obtener conteo de notificaciones no leídas
  async getUnreadCount(): Promise<number> {
    const response = await this.getUnreadNotifications()
    return response.body?.no_leidas || 0
  }

  // Obtener preferencias de notificación
  async getNotificationPreferences(): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${ENDPOINTS.NOTIFICATIONS.LIST}/preferences`)
  }

  // Actualizar preferencias de notificación
  async updateNotificationPreferences(preferences: any): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${ENDPOINTS.NOTIFICATIONS.LIST}/preferences`, preferences)
  }
}

export const notificationsService = new NotificationsService()
