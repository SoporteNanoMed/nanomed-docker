"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TransbankPaymentButton } from "@/components/ui/transbank-payment-button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, FileText, ArrowLeft, Save, AlertCircle, CheckCircle, X, User, Stethoscope, Phone, Mail, CreditCard, DollarSign } from "lucide-react"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { appointmentsService } from "@/lib/api/services/appointments.service"
import { paymentService } from "@/lib/api/services/payment.service"
import { hasPermission } from "@/lib/utils/permissions"
import type { Appointment, UpdateAppointmentRequest } from "@/lib/api/types"

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [appointmentData, setAppointmentData] = useState<UpdateAppointmentRequest>({})
  
  // Estados para pago
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<{
    tiene_pago_aprobado: boolean
    monto_cita: number
    estado_cita: string
  } | null>(null)

  useEffect(() => {
    if (params.id) {
      loadAppointment(Number.parseInt(params.id))
    }
  }, [params.id])

  const loadAppointment = async (appointmentId: number) => {
    try {
      setLoading(true)
      const response = await appointmentsService.getAppointmentById(appointmentId)

      if (!response.error) {
        setAppointment(response.body)
        setAppointmentData({
          notas: response.body.notas,
          estado: response.body.estado,
        })
        
        // Verificar estado del pago si la cita está programada
        if (response.body.estado === "programada") {
          await verificarEstadoPago(appointmentId)
        }
      } else {
        setError("Error al cargar la cita")
      }
    } catch (err) {
      console.error("Error fetching appointment:", err)
      setError("Error al cargar la cita")
    } finally {
      setLoading(false)
    }
  }

  const verificarEstadoPago = async (appointmentId: number) => {
    try {
      const response = await paymentService.getPaymentStatus(appointmentId)
      if (!response.error) {
        setPaymentStatus(response.body)
      } else {
        console.error("Error al verificar estado del pago:", response.message || "Error desconocido")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al verificar estado del pago"
      console.error("Error al verificar estado del pago:", errorMessage)
    }
  }

  const procesarPago = async () => {
    if (!appointment) return

    try {
      setProcessingPayment(true)
      setError(null)

      const response = await paymentService.createPaymentTransaction(appointment.id)

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
      setProcessingPayment(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAppointmentData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setAppointmentData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const updateAppointment = async () => {
    if (!appointment) return

    try {
      setUpdating(true)
      setError(null)

      const response = await appointmentsService.updateAppointment(appointment.id, appointmentData)

      if (!response.error) {
        setSuccess("Cita actualizada exitosamente")
        setAppointment({
          ...appointment,
          ...appointmentData,
        })
        setEditMode(false)

        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        setError(response.message || "Error al actualizar la cita")
      }
    } catch (err) {
      console.error("Error updating appointment:", err)
      setError("Error al actualizar la cita")
    } finally {
      setUpdating(false)
    }
  }

  const cancelAppointment = async () => {
    
    if (!appointment) {
      return
    }

    try {
      setCanceling(true)
      setError(null)

      const response = await appointmentsService.cancelAppointment(appointment.id)

      if (!response.error) {
        setSuccess("Cita cancelada exitosamente")
        setAppointment({
          ...appointment,
          estado: "cancelada",
        })
        setShowCancelDialog(false)

        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        setError(response.message || "Error al cancelar la cita")
      }
    } catch (err) {
      console.error("💥 Error canceling appointment:", err)
      setError("Error al cancelar la cita")
    } finally {
      setCanceling(false)
    }
  }

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null

    const statusMap: Record<string, { color: string; label: string }> = {
      programada: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Programada" },
      confirmada: { color: "bg-green-100 text-green-800 border-green-200", label: "Confirmada" },
      en_curso: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "En Curso" },
      completada: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Completada" },
      cancelada: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelada" },
      no_asistio: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "No Asistió" },
    }

    const statusInfo = statusMap[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", label: status }

    return (
      <Badge variant="outline" className={`${statusInfo.color} font-medium px-3 py-1`}>
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-48" />
          </div>
          
          {/* Main card skeleton */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info sections skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Button>

          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No se pudo cargar la información de la cita. {error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const canUpdateAppointment = user && hasPermission(user, "canUpdateAppointments")
  const canCancelAppointment = user && hasPermission(user, "canCancelAppointments")
  const canCancelThisAppointment = canCancelAppointment && appointment && appointment.estado !== "cancelada" && appointment.estado !== "completada"
  
  const dateTime = formatDateTime(appointment.fecha_hora)

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()} 
            className="flex items-center space-x-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          
          {canUpdateAppointment && !editMode && (
            <Button 
              onClick={() => setEditMode(true)} 
              variant="outline"
              className="hidden sm:flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Editar</span>
            </Button>
          )}
        </div>

        {/* Alertas */}
        {success && (
          <Alert className="bg-green-50 border-green-200 shadow-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 font-medium">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Tarjeta principal */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-xl sm:text-2xl">
                  <span className="text-gray-900">Cita #{appointment.id}</span>
                  {appointment.estado && getStatusBadge(appointment.estado)}
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  {appointment.tipo_cita || "Consulta general"}
                </CardDescription>
              </div>
              
              {canUpdateAppointment && !editMode && (
                <Button 
                  onClick={() => setEditMode(true)} 
                  variant="outline"
                  className="sm:hidden w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Información de Paciente y Médico */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Paciente */}
              <div className="bg-gray-50/50 rounded-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Paciente</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {appointment.paciente?.nombre} {appointment.paciente?.apellido}
                    </p>
                  </div>
                  {appointment.paciente?.rut && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span className="text-sm font-medium">RUT:</span>
                      <span className="text-sm">{appointment.paciente.rut}</span>
                    </div>
                  )}
                  {appointment.paciente?.telefono && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{appointment.paciente.telefono}</span>
                    </div>
                  )}
                  {appointment.paciente?.email && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{appointment.paciente.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Médico */}
              <div className="bg-gray-50/50 rounded-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Médico</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      Dr. {appointment.medico?.nombre} {appointment.medico?.apellido}
                    </p>
                  </div>
                  {appointment.medico?.especialidad && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span className="text-sm font-medium">Especialidad:</span>
                      <span className="text-sm">{appointment.medico.especialidad}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Fecha, Hora y Lugar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{dateTime.date}</p>
                    <p className="text-sm text-gray-600">Fecha</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50/50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{dateTime.time}</p>
                    <p className="text-sm text-gray-600">Hora</p>
                  </div>
                </div>
              </div>

              {appointment.lugar && (
                <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{appointment.lugar}</p>
                      <p className="text-sm text-gray-600">Lugar</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Información de Pago - Solo mostrar si la cita está programada */}
            {appointment.estado === "programada" && paymentStatus && (
              <div className="bg-amber-50/50 rounded-lg p-6 border border-amber-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Información de Pago</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {paymentStatus.tiene_pago_aprobado ? "✅ Pago aprobado" : "💰 Pendiente de pago"}
                    </span>
                    <span className="text-lg font-bold text-amber-700">
                      {paymentService.formatAmount(paymentStatus.monto_cita)}
                    </span>
                  </div>
                  
                  {!paymentStatus.tiene_pago_aprobado && (
                    <TransbankPaymentButton
                      citaId={appointment.id}
                      className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Pagar cita
                    </TransbankPaymentButton>
                  )}
                </div>
              </div>
            )}

            {/* Contenido editable o de solo lectura */}
            {editMode ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="estado" className="text-sm font-semibold text-gray-700">
                    Estado de la Cita
                  </label>
                  <Select
                    value={appointmentData.estado || ""}
                    onValueChange={(value) => handleSelectChange("estado", value)}
                  >
                    <SelectTrigger id="estado" className="w-full">
                      <SelectValue placeholder="Seleccione estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programada">Programada</SelectItem>
                      <SelectItem value="confirmada">Confirmada</SelectItem>
                      <SelectItem value="en_curso">En Curso</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                      <SelectItem value="no_asistio">No Asistió</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label htmlFor="notas" className="text-sm font-semibold text-gray-700">
                    Notas de la Consulta
                  </label>
                  <Textarea
                    id="notas"
                    name="notas"
                    value={appointmentData.notas || ""}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Ingrese las notas de la consulta, diagnóstico, tratamiento recomendado, etc."
                    className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {appointment.motivo && (
                  <div className="bg-yellow-50/50 rounded-lg p-6 border border-yellow-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <span>Motivo de la Consulta</span>
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {appointment.motivo}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50/50 rounded-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas de la Consulta</h3>
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {appointment.notas || "Sin notas registradas"}
                    </p>
                  </div>
                </div>

                {appointment.duracion && (
                  <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{appointment.duracion} minutos</p>
                        <p className="text-sm text-gray-600">Duración estimada</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
            {editMode ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setEditMode(false)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={updateAppointment} 
                  disabled={updating} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                >
                  {updating ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-2 sm:order-1">
                  {canCancelThisAppointment && (
                    <Button
                      variant="destructive"
                      onClick={() => setShowCancelDialog(true)}
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar Cita
                    </Button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/examenes/manage?paciente=${appointment.paciente?.id}`)}
                    className="w-full sm:w-auto"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Exámenes
                  </Button>
                </div>
              </>
            )}
          </CardFooter>
        </Card>

        {/* Diálogo de confirmación para cancelar cita */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Confirmar Cancelación</DialogTitle>
              <DialogDescription className="text-gray-600">
                ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelDialog(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                No, mantener cita
              </Button>
              <Button
                variant="destructive"
                onClick={cancelAppointment}
                disabled={canceling}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 order-1 sm:order-2"
              >
                {canceling ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Sí, cancelar cita
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
