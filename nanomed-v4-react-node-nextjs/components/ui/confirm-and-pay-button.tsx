"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { appointmentsService } from "@/lib/api/services/appointments.service"
import { paymentService } from "@/lib/api/services/payment.service"
import { Loader2, CheckCircle } from "lucide-react"

interface ConfirmAndPayButtonProps {
  formData: any | null
  onSuccess?: () => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
}

export function ConfirmAndPayButton({
  formData,
  onSuccess,
  onError,
  disabled = false,
  className = ""
}: ConfirmAndPayButtonProps) {
  const [processing, setProcessing] = useState(false)
  const [citaCreated, setCitaCreated] = useState(false)

  const handleConfirmAndPay = async () => {
    if (!formData) {
      onError?.("Datos del formulario incompletos")
      return
    }

    try {
      setProcessing(true)
      setCitaCreated(false)

      // Crear la cita
      const citaResponse = await appointmentsService.createAppointment(formData)

      if (citaResponse.error) {
        const errorMessage = citaResponse.message || "Error al crear la cita"
        onError?.(errorMessage)
        return
      }

      setCitaCreated(true)

      // Procesar pago inmediatamente después de crear la cita
      try {
        const paymentResponse = await paymentService.createPaymentTransaction(citaResponse.body.cita.id)
        
        if (!paymentResponse.error) {
          // Generar formulario HTML para enviar a Transbank
          paymentService.redirectToTransbankPayment(paymentResponse.body.url_pago, paymentResponse.body.token)
          return // No cerrar el diálogo, el usuario será redirigido
        } else {
          // Si hay error en el pago, mostrar la cita como creada pero con advertencia
          const errorMessage = paymentResponse.message || "Error desconocido al procesar el pago"
          console.error("Error al procesar pago:", errorMessage)
          
          // Mostrar mensaje de advertencia al usuario
          onError?.(`Cita creada exitosamente, pero hubo un problema con el pago: ${errorMessage}`)
        }
      } catch (paymentError) {
        console.error("Error al procesar pago:", paymentError)
        
        // Mostrar mensaje de advertencia al usuario
        const errorMessage = paymentError instanceof Error ? paymentError.message : "Error desconocido al procesar el pago"
        onError?.(`Cita creada exitosamente, pero hubo un problema con el pago: ${errorMessage}`)
      }

      // Mostrar éxito
      onSuccess?.()

    } catch (error: any) {
      const errorMessage = error.message || "Error al crear la cita"
      onError?.(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleConfirmAndPay}
      className={`bg-cyan-500 hover:bg-cyan-600 ${className}`}
      disabled={disabled || processing}
    >
      {processing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {citaCreated ? "Procesando pago..." : "Creando cita..."}
        </>
      ) : citaCreated ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          ¡Cita creada!
        </>
      ) : (
        "Confirmar cita y pagar"
      )}
    </Button>
  )
} 