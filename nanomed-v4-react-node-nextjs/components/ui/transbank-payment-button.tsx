"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { paymentService } from "@/lib/api/services/payment.service"
import { CreditCard, Loader2 } from "lucide-react"

interface TransbankPaymentButtonProps {
  citaId: number
  children?: React.ReactNode
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
}

export function TransbankPaymentButton({
  citaId,
  children = "💳 Pagar cita",
  className = "",
  variant = "default",
  size = "default",
  disabled = false
}: TransbankPaymentButtonProps) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    try {
      setProcessing(true)
      setError(null)

      const response = await paymentService.createPaymentTransaction(citaId)

      if (!response.error) {
        // Generar formulario HTML para enviar a Transbank
        paymentService.redirectToTransbankPayment(response.body.url_pago, response.body.token)
      } else {
        const errorMessage = response.message || "Error desconocido al procesar el pago"
        setError(errorMessage)
        console.error("Error al procesar pago:", errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al procesar el pago"
      setError(errorMessage)
      console.error("Error al procesar pago:", err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <Button
        onClick={handlePayment}
        disabled={disabled || processing}
        className={className}
        variant={variant}
        size={size}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {children}
          </>
        )}
      </Button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </>
  )
} 