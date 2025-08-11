"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, Calendar, Clock, User, CreditCard, RefreshCw, ArrowLeft } from "lucide-react"
import { paymentService } from "@/lib/api/services/payment.service"
import { appointmentsService } from "@/lib/api/services/appointments.service"

interface PaymentResult {
  status: string
  amount: number
  orderId: string
  cita_id: number
}

export default function PaymentConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [citaInfo, setCitaInfo] = useState<any>(null)

  useEffect(() => {
    const token_ws = searchParams.get("token_ws")
    const tbk_token = searchParams.get("tbk_token")

    if (!token_ws && !tbk_token) {
      setError("No se encontró token de transacción")
      setLoading(false)
      return
    }

    const token = token_ws || tbk_token

    // Confirmar el pago con el backend
    const confirmPayment = async () => {
      try {
        const response = await paymentService.confirmPayment(token!)
        
        if (response.error) {
          setError(response.message || "Error al confirmar el pago")
          return
        }

        setPaymentResult(response.body)

        // Obtener información de la cita
        if (response.body.cita_id) {
          try {
            const citaResponse = await appointmentsService.getAppointmentById(response.body.cita_id)
            if (!citaResponse.error) {
              setCitaInfo(citaResponse.body)
            }
          } catch (citaError) {
            console.error("Error al obtener información de la cita:", citaError)
          }
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido al procesar el pago"
        setError(errorMessage)
        console.error("Error al confirmar pago:", err)
      } finally {
        setLoading(false)
      }
    }

    confirmPayment()
  }, [searchParams])

  const handleGoToAppointments = () => {
    router.push("/dashboard/citas")
  }

  const handleRetryPayment = () => {
    if (paymentResult?.cita_id) {
      router.push(`/dashboard/citas/payment/retry/${paymentResult.cita_id}`)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Procesando tu pago</h2>
                <p className="text-gray-600">Por favor espera mientras confirmamos tu transacción...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-center text-2xl font-bold text-gray-900">
              Error en el pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800 font-medium">
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleGoToAppointments} 
                variant="outline" 
                className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a mis citas
              </Button>
              {paymentResult?.cita_id && (
                <Button 
                  onClick={handleRetryPayment} 
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar pago
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No Payment Result
  if (!paymentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Resultado no disponible</h2>
                <p className="text-gray-600">No se pudo procesar el resultado del pago</p>
              </div>
              <Button 
                onClick={handleGoToAppointments} 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ir a mis citas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isSuccessful = paymentService.isPaymentSuccessful(paymentResult.status)
  const statusMessage = paymentService.getPaymentStatusMessage(paymentResult.status)

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isSuccessful ? 'from-slate-50 to-green-50' : 'from-slate-50 to-red-50'} flex items-center justify-center p-4`}>
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full ${isSuccessful ? 'bg-green-100' : 'bg-red-100'}`}>
            {isSuccessful ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          <CardTitle className="text-center text-3xl font-bold text-gray-900">
            {isSuccessful ? "¡Pago Exitoso!" : "Pago No Procesado"}
          </CardTitle>
          <div className="flex justify-center mt-4">
            <Badge 
              variant={isSuccessful ? "default" : "destructive"}
              className={`text-sm px-4 py-2 font-medium ${isSuccessful ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}`}
            >
              {statusMessage}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Payment Details - Solo si es exitoso */}
          {isSuccessful && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <h3 className="flex items-center text-lg font-semibold text-green-900 mb-6">
                <CreditCard className="w-5 h-5 mr-2" />
                Detalles del pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-green-700">Monto pagado</p>
                    <p className="text-2xl font-bold text-green-900">{paymentService.formatAmount(paymentResult.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Número de orden</p>
                    <p className="text-lg font-mono text-green-800">{paymentResult.orderId}</p>
                  </div>
                </div>
                
                {/* Appointment Info */}
                {citaInfo && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-700 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Médico
                      </p>
                      <p className="text-lg font-semibold text-green-900">{citaInfo.nombre_medico || "Sin asignar"}</p>
                    </div>
                    <div className="flex space-x-4">
                      <div>
                        <p className="text-sm font-medium text-green-700 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Fecha
                        </p>
                        <p className="text-green-800 font-medium">
                          {new Date(citaInfo.fecha_hora).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Hora
                        </p>
                        <p className="text-green-800 font-medium">
                          {new Date(citaInfo.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Failed Payment Help */}
          {!isSuccessful && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">¿Qué puedes hacer?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                    Verificar que tu tarjeta tenga fondos suficientes
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                    Revisar que los datos de tu tarjeta sean correctos
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                    Intentar con otra tarjeta
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                    Contactar a tu banco si el problema persiste
                  </li>
                </ul>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleGoToAppointments} 
              variant="outline" 
              className="flex-1 h-12 border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver mis citas
            </Button>
            {!isSuccessful && paymentResult.cita_id && (
              <Button 
                onClick={handleRetryPayment} 
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar pago
              </Button>
            )}
          </div>

          {/* Success Footer Message */}
          {isSuccessful && (
            <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">
                📧 Recibirás un correo de confirmación con todos los detalles de tu cita
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 