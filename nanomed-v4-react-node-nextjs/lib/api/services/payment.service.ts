import { apiClient } from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/config"
import type { ApiResponse } from "@/lib/api/types"

export interface PaymentTransaction {
  url_pago: string
  token: string
  monto: number
}

export interface PaymentStatus {
  cita_id: number
  tiene_pago_aprobado: boolean
  estado_cita: string
  monto_cita: number
}

export interface PaymentConfirmation {
  status: string
  amount: number
  orderId: string
  cita_id: number
}

export class PaymentService {
  // Crear transacción de pago para una cita
  async createPaymentTransaction(citaId: number): Promise<ApiResponse<PaymentTransaction>> {
    return apiClient.post<PaymentTransaction>(ENDPOINTS.APPOINTMENTS.PAYMENT_CREATE(citaId))
  }

  // Confirmar transacción de pago
  async confirmPayment(token: string): Promise<ApiResponse<PaymentConfirmation>> {
    return apiClient.post<PaymentConfirmation>(ENDPOINTS.APPOINTMENTS.PAYMENT_CONFIRM, {
      token_ws: token
    })
  }

  // Verificar estado del pago de una cita
  async getPaymentStatus(citaId: number): Promise<ApiResponse<PaymentStatus>> {
    return apiClient.get<PaymentStatus>(ENDPOINTS.APPOINTMENTS.PAYMENT_STATUS(citaId))
  }

  // Reintentar pago para una cita
  async retryPayment(citaId: number): Promise<ApiResponse<PaymentTransaction>> {
    return apiClient.post<PaymentTransaction>(ENDPOINTS.APPOINTMENTS.PAYMENT_RETRY, {
      cita_id: citaId
    })
  }

  // Generar formulario HTML para enviar a Transbank
  generateTransbankForm(token: string, url: string): void {
    // Crear un formulario temporal
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = url
    form.style.display = 'none'

    // Crear el input hidden con el token
    const tokenInput = document.createElement('input')
    tokenInput.type = 'hidden'
    tokenInput.name = 'token_ws'
    tokenInput.value = token

    // Agregar el input al formulario
    form.appendChild(tokenInput)

    // Agregar el formulario al DOM
    document.body.appendChild(form)

    // Enviar el formulario automáticamente
    form.submit()

    // Limpiar el formulario del DOM después de enviarlo
    setTimeout(() => {
      document.body.removeChild(form)
    }, 1000)
  }

  // Redirigir al usuario a la página de pago de Transbank
  redirectToPayment(url: string): void {
    // Usar el nuevo método que genera el formulario
    // Necesitamos el token para esto, así que este método se mantiene por compatibilidad
    // pero se recomienda usar generateTransbankForm directamente
    window.location.href = url
  }

  // Nuevo método que recibe tanto la URL como el token
  redirectToTransbankPayment(url: string, token: string): void {
    this.generateTransbankForm(token, url)
  }

  // Formatear monto para mostrar
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  // Verificar si el pago fue exitoso basado en el status
  isPaymentSuccessful(status: string): boolean {
    return status === 'AUTHORIZED'
  }

  // Obtener mensaje de estado del pago
  getPaymentStatusMessage(status: string): string {
    switch (status) {
      case 'AUTHORIZED':
        return 'Pago aprobado exitosamente'
      case 'REJECTED':
        return 'Pago rechazado'
      case 'FAILED':
        return 'Pago falló'
      case 'CANCELLED':
        return 'Pago cancelado'
      default:
        return 'Estado de pago desconocido'
    }
  }
}

export const paymentService = new PaymentService() 