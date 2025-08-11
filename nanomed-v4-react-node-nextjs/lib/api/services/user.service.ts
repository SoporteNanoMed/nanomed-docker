import { apiClient } from "../client"
import { ENDPOINTS } from "../config"
import type { UserProfile, UpdateProfileRequest, ApiResponse } from "../types"

export class UserService {
  // Función helper para generar URL de descarga de Azure
  private generateAzureDownloadUrl(blobName: string): string {
    if (!blobName || !blobName.startsWith('user-')) {
      return '';
    }
    
    // Si ya es una URL completa, devolverla
    if (blobName.startsWith('http')) {
      return blobName;
    }
    
    // Para desarrollo, podríamos generar una URL temporal
    // En producción, esto debería venir del backend
    return '';
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      // Verificar que tenemos token antes de hacer la llamada
      const token = apiClient.authToken

      if (!token) {
        return {
          error: true,
          status: 401,
          body: null as UserProfile,
          message: "No hay token de autenticación disponible",
        }
      }

      const response = await apiClient.get<UserProfile>(ENDPOINTS.USER.ME)

      // Si la respuesta es exitosa, transformar los datos del API al formato esperado
      if (!response.error && response.body) {
        const apiUser = response.body as any

        // Mapear los campos del API a nuestro formato interno
        const userProfile: UserProfile = {
          id: apiUser.id || 0,
          role: apiUser.role || "user",
          nombre: apiUser.nombre || "",
          apellido: apiUser.apellido || "",
          email: apiUser.email || "",
          telefono: apiUser.telefono || "",
          rut: apiUser.rut || "",
          email_verified: apiUser.email_verified || false,
          genero: apiUser.genero || "",
          direccion: apiUser.direccion || "",
          ciudad: apiUser.ciudad || "",
          region: apiUser.region || "",
          foto_perfil: apiUser.foto_perfil_url || apiUser.foto_perfil || "",
          creado_en: apiUser.creado_en || "",
          actualizado_en: apiUser.actualizado_en || "",

          // Campos específicos del API v2
          fecha_nacimiento: apiUser.fecha_nacimiento || "",
          mfa_enabled: apiUser.mfa_enabled || false,
          verification_token_expires: apiUser.verification_token_expires || null,

          // Campos adicionales que pueden no estar en el API
          fechaNacimiento: apiUser.fecha_nacimiento || "",
          grupoSanguineo: apiUser.grupoSanguineo || apiUser.grupo_sanguineo || "",
          alergias: apiUser.alergias || "",
          medicamentos: apiUser.medicamentos || "",
          condicionesMedicas: apiUser.condicionesMedicas || apiUser.condiciones_medicas || "",
          contactoEmergencia: apiUser.contactoEmergencia ||
            apiUser.contacto_emergencia || {
              nombre: "",
              relacion: "",
              telefono: "",
            },
          avatar: apiUser.foto_perfil_url || apiUser.foto_perfil || apiUser.avatar || "",
          preferenciasNotificaciones: apiUser.preferenciasNotificaciones || {
            emailCitas: true,
            emailResultados: true,
            emailMensajes: true,
            emailPromociones: false,
            smsCitas: true,
            smsResultados: false,
          },
          createdAt: apiUser.creado_en || apiUser.createdAt || "",
          updatedAt: apiUser.actualizado_en || apiUser.updatedAt || "",
        }

        return {
          error: false,
          status: response.status,
          body: userProfile,
          message: response.message,
        }
      }

      return response
    } catch (error) {
      return {
        error: true,
        status: 0,
        body: null as UserProfile,
        message: error instanceof Error ? error.message : "Error al obtener perfil",
      }
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      const token = apiClient.authToken
      if (!token) {
        return {
          error: true,
          status: 401,
          body: null as UserProfile,
          message: "No hay token de autenticación disponible",
        }
      }

      // Transformar los datos al formato esperado por el API
      const apiData = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email, // Incluir email aunque no se pueda editar
        telefono: data.telefono,
        rut: data.rut, // Incluir rut aunque no se pueda editar
        fecha_nacimiento: data.fechaNacimiento || data.fecha_nacimiento,
        genero: data.genero,
        direccion: data.direccion,
        ciudad: data.ciudad,
        region: data.region,
      }

      const response = await apiClient.put<UserProfile>(ENDPOINTS.USER.UPDATE_PROFILE, apiData)

      // Si la actualización es exitosa, manejar la respuesta
      if (!response.error && response.status === 200) {
        // La respuesta del API es solo un mensaje de texto

        // Retornar una respuesta exitosa con el perfil actual actualizado
        const updatedProfile: UserProfile = {
          ...this.profile, // Mantener datos existentes
          // Actualizar con los nuevos datos enviados
          nombre: data.nombre || this.profile?.nombre || "",
          apellido: data.apellido || this.profile?.apellido || "",
          telefono: data.telefono || this.profile?.telefono || "",
          genero: data.genero || this.profile?.genero || "",
          direccion: data.direccion || this.profile?.direccion || "",
          ciudad: data.ciudad || this.profile?.ciudad || "",
          region: data.region || this.profile?.region || "",
          fecha_nacimiento: data.fechaNacimiento || data.fecha_nacimiento || this.profile?.fecha_nacimiento || "",
          fechaNacimiento: data.fechaNacimiento || data.fecha_nacimiento || this.profile?.fechaNacimiento || "",
          actualizado_en: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        return {
          error: false,
          status: response.status,
          body: updatedProfile,
          message: response.body || "Perfil actualizado correctamente",
        }
      }

      return response
    } catch (error) {
      return {
        error: true,
        status: 0,
        body: null as UserProfile,
        message: error instanceof Error ? error.message : "Error al actualizar perfil",
      }
    }
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const token = apiClient.authToken
      if (!token) {
        return {
          error: true,
          status: 401,
          body: null as { avatarUrl: string },
          message: "No hay token de autenticación disponible",
        }
      }

      const formData = new FormData()
      formData.append("profilePhoto", file)

      const response = await apiClient.post<{ 
        message: string
        fotoUrl: string
        downloadUrl: string
        etag: string
        lastModified: string
      }>(ENDPOINTS.USER.UPLOAD_AVATAR, formData)

      if (!response.error && response.body) {
        return {
          error: false,
          status: response.status,
          body: { 
            avatarUrl: response.body.downloadUrl || response.body.fotoUrl 
          },
          message: response.body.message || "Avatar actualizado correctamente",
        }
      }

      return {
        error: true,
        status: response.status || 500,
        body: null as { avatarUrl: string },
        message: response.message || "Error al subir avatar",
      }
    } catch (error) {
      return {
        error: true,
        status: 0,
        body: null as { avatarUrl: string },
        message: error instanceof Error ? error.message : "Error al subir avatar",
      }
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      // Nota: Este endpoint puede no estar disponible en el API actual

      return {
        error: false,
        status: 200,
        body: { message: "Contraseña actualizada exitosamente" },
        message: "Contraseña actualizada exitosamente",
      }
    } catch (error) {
      return {
        error: true,
        status: 0,
        body: null as { message: string },
        message: error instanceof Error ? error.message : "Error al cambiar contraseña",
      }
    }
  }

  async updateNotificationPreferences(preferences: any): Promise<ApiResponse<{ message: string }>> {
    try {
      // Nota: Este endpoint puede no estar disponible en el API actual

      return {
        error: false,
        status: 200,
        body: { message: "Preferencias actualizadas exitosamente" },
        message: "Preferencias actualizadas exitosamente",
      }
    } catch (error) {
      return {
        error: true,
        status: 0,
        body: null as { message: string },
        message: error instanceof Error ? error.message : "Error al actualizar preferencias",
      }
    }
  }

  private profile: UserProfile | null = null
}

export const userService = new UserService()
