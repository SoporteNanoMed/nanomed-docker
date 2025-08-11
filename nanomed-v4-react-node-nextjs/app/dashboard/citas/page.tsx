"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Calendar, Clock, MapPin, User, Search, Plus, Filter, X } from "lucide-react"
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { appointmentsService } from "@/lib/api/services/appointments.service"
import { paymentService } from "@/lib/api/services/payment.service"
import { TransbankPaymentButton } from "@/components/ui/transbank-payment-button"
import { ConfirmAndPayButton } from "@/components/ui/confirm-and-pay-button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { doctorsService } from "@/lib/api/services/doctors.service"
import { construirFechaISOChile, validarFechaFutura, formatearFechaChile, formatearHoraChile, formatearSoloFechaChile } from "@/lib/utils/dateUtils"

// Adaptar la interfaz para que coincida con la respuesta del API
interface CitaAdaptada {
  id: string
  medico: string
  especialidad: string
  fecha: string
  hora: string
  duracion: number
  lugar: string
  direccion: string
  estado: "programada" | "confirmada" | "completada" | "cancelada"
  notas?: string
}

// Función para adaptar los datos del API al formato esperado por el componente
const adaptarCitaDesdeAPI = (cita: any): CitaAdaptada => {
  try {
    // Validar que la cita tenga los campos necesarios
    if (!cita || !cita.id || !cita.fecha_hora) {
      throw new Error('Datos de cita incompletos');
    }

    return {
      id: cita.id.toString(),
      medico: `Dr. ${cita.nombre_medico || 'Sin nombre'}`,
      especialidad: cita.especialidad || 'Sin especialidad',
      fecha: formatearSoloFechaChile(cita.fecha_hora),
      hora: formatearHoraChile(cita.fecha_hora),
      duracion: cita.duracion || 30,
      lugar: cita.lugar || 'Sin lugar',
      direccion: cita.direccion || 'Sin dirección',
      estado: cita.estado || "programada",
      notas: cita.notas,
    }
  } catch (error) {
    // Error silencioso al adaptar cita
    // Retornar una cita por defecto en caso de error
    return {
      id: cita?.id?.toString() || '0',
      medico: 'Dr. Sin nombre',
      especialidad: 'Sin especialidad',
      fecha: new Date().toISOString().split('T')[0],
      hora: '00:00',
      duracion: 30,
      lugar: 'Sin lugar',
      direccion: 'Sin dirección',
      estado: 'programada',
      notas: '',
    }
  }
}

// Componente para mostrar una cita individual
function CitaCard({ cita, onCitaCancelada }: { cita: CitaAdaptada; onCitaCancelada?: () => void }) {
  const [openDialog, setOpenDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para pago
  const [paymentStatus, setPaymentStatus] = useState<{
    tiene_pago_aprobado: boolean
    monto_cita: number
  } | null>(null)

  // Formatear la fecha para mostrarla en español
  const fechaFormateada = format(parseISO(cita.fecha), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })

  // Determinar el color del badge según el estado
  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case "programada":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "confirmada":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "completada":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100"
      case "cancelada":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Función para cancelar la cita
  const cancelarCita = async () => {
    try {
      setCanceling(true)
      setError(null)

      const response = await appointmentsService.cancelAppointment(Number.parseInt(cita.id))

      if (!response.error) {
        setShowCancelDialog(false)
        setOpenDialog(false)
        if (onCitaCancelada) {
          onCitaCancelada()
        }
      } else {
        setError(response.message || "Error al cancelar la cita")
      }
    } catch (err) {
      // Error silencioso al cancelar cita
      setError("Error al cancelar la cita")
    } finally {
      setCanceling(false)
    }
  }

  // Función para verificar estado del pago
  const verificarEstadoPago = async () => {
    try {
      const response = await paymentService.getPaymentStatus(Number.parseInt(cita.id))
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



  // Función para confirmar la cita (solo si ya tiene pago aprobado)
  const confirmarCita = async () => {
    try {
      setConfirming(true)
      setError(null)

      const response = await appointmentsService.updateAppointment(Number.parseInt(cita.id), {
        estado: "confirmada"
      })

      if (!response.error) {
        setOpenDialog(false)
        if (onCitaCancelada) {
          onCitaCancelada() // Usamos el mismo callback para refrescar las citas
        }
      } else {
        setError(response.message || "Error al confirmar la cita")
      }
    } catch (err) {
      // Error silencioso al confirmar cita
      setError("Error al confirmar la cita")
    } finally {
      setConfirming(false)
    }
  }

  // Verificar estado del pago cuando se abre el diálogo
  useEffect(() => {
    if (openDialog && cita.estado === "programada") {
      verificarEstadoPago()
    }
  }, [openDialog, cita.estado])

  return (
    <>
      <div className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          {/* Header con médico y estado */}
                      <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{cita.medico}</h3>
                <p className="text-sm text-gray-600">{cita.especialidad}</p>
              </div>
            <Badge className={getBadgeVariant(cita.estado)} variant="outline">
              {cita.estado === "programada"
                ? "Programada"
                : cita.estado === "confirmada"
                  ? "Confirmada"
                  : cita.estado === "completada"
                    ? "Completada"
                    : "Cancelada"}
            </Badge>
          </div>
          
          {/* Información de la cita */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-gray-200/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#59c3ed]" />
                <span className="font-medium text-gray-700">Fecha</span>
              </div>
              <span className="font-bold text-gray-900 text-sm capitalize">{fechaFormateada}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-gray-200/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#59c3ed]" />
                <span className="font-medium text-gray-700">Hora</span>
              </div>
              <span className="font-bold text-gray-900 text-sm">
                {cita.hora} ({cita.duracion} min)
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-gray-200/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#59c3ed]" />
                <span className="font-medium text-gray-700">Lugar</span>
              </div>
              <span className="font-bold text-gray-900 text-sm">{cita.lugar}</span>
            </div>
          </div>
          
          {/* Botón de acción */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0 font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group shadow-md" 
            onClick={() => setOpenDialog(true)}
          >
            <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver detalles
          </Button>
        </div>
      </div>

      {/* Diálogo con detalles de la cita */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 border-l-4 border-[#479cd0] pl-3">Detalles de la cita</DialogTitle>
            <DialogDescription className="text-gray-700 ml-7">Información completa sobre tu cita médica</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">Médico</h4>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-[#1e3a5f]" />
                <span className="font-medium text-gray-800">
                  {cita.medico} - {cita.especialidad}
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Fecha y hora</h4>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-[#1e3a5f]" />
                <span className="capitalize font-medium text-gray-800">{fechaFormateada}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-[#1e3a5f]" />
                <span className="font-medium text-gray-800">
                  {cita.hora} ({cita.duracion} minutos)
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Ubicación</h4>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-[#1e3a5f]" />
                <span className="font-medium text-gray-800">{cita.lugar}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-6">{cita.direccion}</p>
            </div>
            {cita.notas && (
              <div>
                <h4 className="font-semibold text-gray-900">Notas</h4>
                <p className="text-sm mt-1 text-gray-700 font-medium">{cita.notas}</p>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900">Estado</h4>
              <Badge className={`mt-1 ${getBadgeVariant(cita.estado)}`} variant="outline">
                {cita.estado === "programada"
                  ? "Programada"
                  : cita.estado === "confirmada"
                    ? "Confirmada"
                    : cita.estado === "completada"
                      ? "Completada"
                      : "Cancelada"}
              </Badge>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between pt-4 border-t border-gray-200">
            <div className="w-full space-y-3">
              {cita.estado === "programada" && (
                <>
                  {/* Mostrar información de pago si está disponible */}
                  {paymentStatus && (
                    <div className="w-full p-3 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 border-2 border-[#479cd0]/40 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#1e3a5f]">
                          {paymentStatus.tiene_pago_aprobado 
                            ? "Pago aprobado" 
                            : "Pendiente de pago"}
                        </span>
                        <span className="text-[#479cd0] font-bold">
                          {paymentService.formatAmount(paymentStatus.monto_cita)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Botón de pago si no tiene pago aprobado */}
                    {(!paymentStatus?.tiene_pago_aprobado) && (
                      <TransbankPaymentButton
                        citaId={Number.parseInt(cita.id)}
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex-1"
                      >
                        Pagar cita
                      </TransbankPaymentButton>
                    )}
                    
                    {/* Botón de confirmar solo si tiene pago aprobado */}
                    {paymentStatus?.tiene_pago_aprobado && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={confirmarCita}
                        disabled={confirming}
                        className="bg-gradient-to-r from-[#3a8bb8] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#3a8bb8] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex-1"
                      >
                        {confirming ? "Confirmando..." : "✅ Confirmar cita"}
                      </Button>
                    )}
                    
                    {/* Botón de cancelar */}
                    {(cita.estado === "programada" || cita.estado === "confirmada") && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setShowCancelDialog(true)}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex-1"
                      >
                        Cancelar cita
                      </Button>
                    )}
                  </div>
                </>
              )}
              
              {/* Para citas que no son programadas, solo mostrar botón de cancelar si aplica */}
              {(cita.estado === "confirmada" && !(cita.estado === "programada")) && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowCancelDialog(true)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 w-full"
                >
                  Cancelar cita
                </Button>
              )}
            </div>
            
            <div className="w-full pt-3 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setOpenDialog(false)}
                className="w-full border-2 border-[#479cd0]/50 text-[#479cd0] hover:bg-gradient-to-r hover:from-[#59c3ed]/10 hover:to-[#479cd0]/10 hover:border-[#479cd0] font-semibold transition-all duration-300"
              >
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para cancelar cita */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900 border-l-4 border-red-500 pl-3">Confirmar Cancelación</DialogTitle>
            <DialogDescription className="text-gray-700 ml-7">
              ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-3 shadow-sm">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              className="border-2 border-[#479cd0]/50 text-[#479cd0] hover:bg-gradient-to-r hover:from-[#59c3ed]/10 hover:to-[#479cd0]/10 hover:border-[#479cd0] font-semibold transition-all duration-300"
            >
              No, mantener cita
            </Button>
            <Button
              variant="destructive"
              onClick={cancelarCita}
              disabled={canceling}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              {canceling ? "Cancelando..." : "Sí, cancelar cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Componente para programar una nueva cita - Vista unificada
function NuevaCitaDialog({ onCitaCreada }: { onCitaCreada?: () => void }) {
  const [open, setOpen] = useState(false)
  const [especialidad, setEspecialidad] = useState("")
  const [medicoId, setMedicoId] = useState("")
  const [motivo, setMotivo] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(undefined)
  const [horaSeleccionada, setHoraSeleccionada] = useState("")

  // Estados para el envío de la cita
  const [enviandoCita, setEnviandoCita] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [citaCreada, setCitaCreada] = useState(false)

  // Estados para médicos del API
  const [medicos, setMedicos] = useState<Record<string, Array<{ id: string; nombre: string; apellido: string }>>>({})
  const [loadingMedicos, setLoadingMedicos] = useState(false)
  const [errorMedicos, setErrorMedicos] = useState<string | null>(null)

  // Estados para horarios disponibles
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [errorHorarios, setErrorHorarios] = useState<string | null>(null)
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([])

  // Estados para fechas con disponibilidad
  const [fechasConDisponibilidad, setFechasConDisponibilidad] = useState<Date[]>([])
  const [loadingFechasDisponibles, setLoadingFechasDisponibles] = useState(false)
  const [cacheDisponibilidad, setCacheDisponibilidad] = useState<Map<string, { fechas: Date[], timestamp: number }>>(new Map())
  const [progresoDisponibilidad, setProgresoDisponibilidad] = useState<{ actual: number, total: number } | null>(null)

  // Función para obtener médicos del API
  const fetchMedicos = useCallback(async () => {
    const cacheKey = "doctors_for_appointments"
    const cacheTimeKey = "doctors_for_appointments_time"
    const cacheTime = localStorage.getItem(cacheTimeKey)
    const cachedData = localStorage.getItem(cacheKey)

    // Verificar cache (5 minutos)
    if (cacheTime && cachedData) {
      const timeDiff = Date.now() - Number.parseInt(cacheTime)
      if (timeDiff < 5 * 60 * 1000) {
        // 5 minutos
        try {
          const parsed = JSON.parse(cachedData)
          setMedicos(parsed)
          return
        } catch (error) {
          // Error silencioso al parsear médicos del cache
        }
      }
    }

    try {
      setLoadingMedicos(true)
      setErrorMedicos(null)

      const token = localStorage.getItem("auth_access_token")
      if (!token) {
        setErrorMedicos("No se encontró token de autenticación")
        return
      }

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limiting - usar cache si existe
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData)
              setMedicos(parsed)
              setErrorMedicos("Usando datos guardados (límite de peticiones)")
              return
            } catch (error) {
              // Error silencioso al parsear médicos del cache
            }
          }
          throw new Error("Demasiadas peticiones. Intenta más tarde.")
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.message || "Error al obtener médicos")
      }

      // Datos del API cargados correctamente

      // Función para mergear médicos duplicados
      const mergeDoctors = (doctors: any[]) => {
        const doctorMap = new Map()

        doctors.forEach((doctor) => {
          const email = doctor.email

          if (doctorMap.has(email)) {
            const existing = doctorMap.get(email)
            // Priorizar datos de usuarios sobre legacy, pero conservar especialidad de legacy
            const merged = {
              ...existing,
              especialidad: doctor.especialidad || existing.especialidad || "Medicina General",
              activo:
                doctor.activo !== undefined ? doctor.activo : existing.activo !== undefined ? existing.activo : true,
              // Si es de usuarios, usar esos datos como base
              ...(doctor.fuente === "usuarios"
                ? {
                    id: doctor.id,
                    nombre: doctor.nombre,
                    apellido: doctor.apellido,
                    telefono: doctor.telefono,
                    email_verified: doctor.email_verified,
                    foto_perfil: doctor.foto_perfil,
                  }
                : {}),
            }
            doctorMap.set(email, merged)
          } else {
            doctorMap.set(email, {
              ...doctor,
              especialidad: doctor.especialidad || "Medicina General",
              activo: doctor.activo !== undefined ? doctor.activo : true,
            })
          }
        })

        return Array.from(doctorMap.values())
      }

      // Mergear médicos duplicados
      const mergedDoctors = mergeDoctors(data.body.medicos)

      // Función para categorizar especialidades
      const categorizarEspecialidades = (medicosPorEspecialidad: Record<string, Array<{ id: string; nombre: string; apellido: string }>>, especialidadesOmitidas: string[]) => {
        const categorias = {
          "Médicos Cirujanos": [
            "Medicina General / Médico Cirujano",
            "Ginecología / Médico Cirujano", 
            "Pediatría / Médico Cirujano",
            "Dermatología / Médico Cirujano",
            "Cardiología / Médico Cirujano"
          ],
          "Profesionales de la Salud": [
            "Nutrición y Dietética"
          ],
          "Especialidades Médicas": [
            "Kinesiología",
            "Kinesiología de Piso Pélvico",
            "Fonoaudiología",
            "Matrona",
            "Psicología Adulta",
            "Psicología Infanto-Juvenil",
            "Medicina Interna",
            "Traumatología y Ortopedia",
            "Neurología",
            "Oftalmología",
            "Psiquiatría Pediátrica y Adolescencia",
            "Psiquiatría Adulto",
            "Nutrición Deportiva",
            "Terapia del Sueño",
            "Otorrinolaringología",
            "Urología",
            "Endocrinología",
            "Gastroenterología",
            "Neumología",
            "Reumatología",
            "Oncología",
            "Hematología",
            "Nefrología",
            "Infectología"
          ],
          "Especialidades Quirúrgicas": [
            "Anestesiología",
            "Cirugía General",
            "Cirugía Plástica",
            "Neurocirugía",
            "Cirugía Cardiovascular",
            "Cirugía Pediátrica"
          ],
          "Otras Especialidades": [
            "Medicina Familiar",
            "Medicina de Urgencia",
            "Medicina Preventiva",
            "Medicina del Trabajo",
            "Medicina Legal",
            "Patología",
            "Radiología",
            "Medicina Nuclear",
            "Farmacología Clínica",
            "Inmunología",
            "Alergología",
            "Genética Médica",
            "Medicina Física y Rehabilitación",
            "Medicina del Deporte",
            "Medicina Aeroespacial",
            "Medicina Subacuática",
            "Medicina del Viajero",
            "Medicina Paliativa",
            "Medicina Integrativa"
          ]
        }

        // Crear objeto categorizado
        const especialidadesCategorizadas: Record<string, Array<{ id: string; nombre: string; apellido: string }>> = {}

        // Primero agregar las especialidades que existen en el sistema (omitiendo las especialidades especificadas)
        Object.keys(medicosPorEspecialidad).forEach(especialidad => {
          // Omitir especialidades específicas
          if (especialidadesOmitidas.includes(especialidad)) {
            return
          }
          
          // Buscar en qué categoría pertenece
          let categoriaEncontrada = "Otras Especialidades"
          
          for (const [categoria, especialidades] of Object.entries(categorias)) {
            if (especialidades.includes(especialidad)) {
              categoriaEncontrada = categoria
              break
            }
          }
          
          // Crear clave con formato "Categoría - Especialidad"
          const claveCategorizada = `${categoriaEncontrada} - ${especialidad}`
          especialidadesCategorizadas[claveCategorizada] = medicosPorEspecialidad[especialidad]
        })

        return especialidadesCategorizadas
      }

      // Especialidades a omitir
      const especialidadesOmitidas = ["Tecnólogo Médico", "TENS", "Enfermería"]
      
      // Agrupar médicos por especialidad
      const medicosPorEspecialidad: Record<string, Array<{ id: string; nombre: string; apellido: string }>> = {}

      // Médicos del API procesados correctamente

      mergedDoctors.forEach((medico: any) => {
        // Solo incluir médicos activos (asumir activo = true si no existe el campo)
        const isActivo = medico.activo !== undefined ? medico.activo : true
        
        if (isActivo) {
          const especialidad = medico.especialidad || "Medicina General / Médico Cirujano"

          // Omitir especialidades específicas
          if (especialidadesOmitidas.includes(especialidad)) {
            return
          }

          if (!medicosPorEspecialidad[especialidad]) {
            medicosPorEspecialidad[especialidad] = []
          }

          medicosPorEspecialidad[especialidad].push({
            id: medico.id.toString(),
            nombre: medico.nombre,
            apellido: medico.apellido,
          })
        }
      })

      // Médicos agrupados por especialidad

      // Categorizar especialidades
      const especialidadesCategorizadas = categorizarEspecialidades(medicosPorEspecialidad, especialidadesOmitidas)

      // Especialidades categorizadas correctamente

      // Usar las especialidades categorizadas
      const especialidadesOrdenadas: Record<string, Array<{ id: string; nombre: string; apellido: string }>> = {}

      // Ordenar especialidades categorizadas alfabéticamente por categoría y luego por especialidad
      Object.keys(especialidadesCategorizadas)
        .sort((a, b) => {
          // Extraer categoría y especialidad de las claves
          const [categoriaA, especialidadA] = a.split(" - ")
          const [categoriaB, especialidadB] = b.split(" - ")
          
          // Primero ordenar por categoría
          if (categoriaA !== categoriaB) {
            return categoriaA.localeCompare(categoriaB)
          }
          
          // Si la categoría es igual, ordenar por especialidad
          return especialidadA.localeCompare(especialidadB)
        })
        .forEach(claveCategorizada => {
          especialidadesOrdenadas[claveCategorizada] = especialidadesCategorizadas[claveCategorizada].sort((a, b) =>
            `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`)
          )
        })

      // Especialidades ordenadas correctamente

      setMedicos(especialidadesOrdenadas)

      // Guardar en cache
      localStorage.setItem(cacheKey, JSON.stringify(especialidadesOrdenadas))
      localStorage.setItem(cacheTimeKey, Date.now().toString())

      // Médicos cargados y organizados correctamente
    } catch (error: any) {
      // Error silencioso al cargar médicos
      setErrorMedicos(error.message || "Error al cargar médicos")

      // Intentar usar cache como fallback
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData)
          setMedicos(parsed)
          setErrorMedicos(`${error.message} (usando datos guardados)`)
        } catch (parseError) {
          // Error silencioso al parsear médicos del cache
        }
      }
    } finally {
      setLoadingMedicos(false)
    }
  }, [])

  // Cargar médicos cuando se abre el diálogo
  useEffect(() => {
    if (open && Object.keys(medicos).length === 0) {
      fetchMedicos()
    }
  }, [open, fetchMedicos])

  // Cargar fechas disponibles cuando se selecciona un médico
  useEffect(() => {
    if (medicoId) {
      // Médico seleccionado, cargar fechas disponibles
    }
  }, [medicoId])

  // Función para obtener horarios disponibles desde el API
  const fetchHorariosDisponibles = useCallback(
    async (medicoId: string, fecha: Date) => {
      if (!medicoId || !fecha) {
        setHorariosDisponibles([])
        return
      }

      try {
        setLoadingHorarios(true)
        setErrorHorarios(null)

        const token = localStorage.getItem("auth_access_token")
        if (!token) {
          throw new Error("No se encontró token de autenticación")
        }

        // Formatear fecha para el API (YYYY-MM-DD)
        const fechaStr = fecha.toISOString().split("T")[0]

        // Remove specialty from the API call
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/available-slots?medico_id=${medicoId}&fecha=${fechaStr}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.message || "Error al obtener horarios disponibles")
        }

        // Adaptar la respuesta real del API
        const horariosData = data.body?.horarios_disponibles || []
        const horarios = horariosData.map((horario: any) => {
          // CORRECCIÓN: Usar directamente hora_formato que ya viene sin conversión de zona horaria
          // El backend ya formatea correctamente las horas según Chile
          return horario.hora_formato || "00:00"
        })

        // FILTRO POR HORA ACTUAL DE CHILE + 1 HORA (SOLO PARA EL DÍA DE HOY)
        const ahora = new Date()
        const horaChile = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Santiago' }))
        const fechaHoy = horaChile.toISOString().split('T')[0] // YYYY-MM-DD formato
        const fechaSeleccionadaStr = fecha.toISOString().split('T')[0] // YYYY-MM-DD formato
        
        let horariosFiltrados = horarios
        
        // Solo aplicar filtro de hora si es el día de hoy
        if (fechaSeleccionadaStr === fechaHoy) {
          const horaActual = horaChile.getHours()
          const minutoActual = horaChile.getMinutes()
          
          // Calcular hora mínima (hora actual + 1 hora)
          const horaMinima = horaActual + 1
          const minutoMinimo = minutoActual
          
          // Filtrar horarios disponibles solo para hoy
          horariosFiltrados = horarios.filter((hora: string) => {
            const [horaNum, minutoNum] = hora.split(':').map(Number)
            
            // Comparar hora y minutos
            if (horaNum > horaMinima) {
              return true
            } else if (horaNum === horaMinima && minutoNum >= minutoMinimo) {
              return true
            }
            
            return false
          })
        }
        // Para días futuros, mostrar todos los horarios sin filtro
        
        setHorariosDisponibles(horariosFiltrados)

        // Horarios disponibles cargados correctamente
      } catch (error: any) {
        // Error silencioso al cargar horarios disponibles
        setErrorHorarios(error.message || "Error al cargar horarios disponibles")
        setHorariosDisponibles([])
      } finally {
        setLoadingHorarios(false)
      }
    },
    [], // Remove especialidad from dependency array
  )

  // Función optimizada para obtener fechas con disponibilidad
  const fetchFechasConDisponibilidad = useCallback(
    async (medicoId: string) => {
      if (!medicoId) {
        setFechasConDisponibilidad([])
        return
      }

      // Verificar cache (5 minutos de duración)
      const cacheKey = `medico_${medicoId}`
      const cached = cacheDisponibilidad.get(cacheKey)
      const now = Date.now()
      const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        // Usando fechas desde cache
        setFechasConDisponibilidad(cached.fechas)
        setLoadingFechasDisponibles(false)
        setProgresoDisponibilidad(null)
        return
      }

      try {
        setLoadingFechasDisponibles(true)

        const token = localStorage.getItem("auth_access_token")
        if (!token) {
          // Error: no se encontró token de autenticación
          return
        }

        // Generar fechas a verificar (próximos 30 días hábiles)
        const fechasAVerificar: Date[] = []
        const hoy = new Date()
        
        for (let i = 0; i < 45; i++) { // Verificar 45 días para obtener al menos 30 hábiles
          const fecha = new Date(hoy)
          fecha.setDate(fecha.getDate() + i)
          
          const diaSemana = fecha.getDay()
          // Solo días de semana
          if (diaSemana !== 0 && diaSemana !== 6) {
            fechasAVerificar.push(new Date(fecha))
          }
          
          // Limitar a 30 días hábiles
          if (fechasAVerificar.length >= 30) break
        }

        // Verificando disponibilidad para días hábiles

        // Función para verificar disponibilidad de una fecha específica
        const verificarFecha = async (fecha: Date): Promise<Date | null> => {
          const fechaStr = fecha.toISOString().split("T")[0]
          
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/available-slots?medico_id=${medicoId}&fecha=${fechaStr}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              },
            )

            if (response.ok) {
              const data = await response.json()
              if (!data.error && data.body?.horarios_disponibles?.length > 0) {
                return new Date(fecha)
              }
            }
            return null
          } catch (error) {
            // Error silencioso al verificar disponibilidad
            return null
          }
        }

        // Procesar en lotes de 5 llamadas paralelas para no sobrecargar
        const BATCH_SIZE = 5
        const fechasConHorarios: Date[] = []

        const totalLotes = Math.ceil(fechasAVerificar.length / BATCH_SIZE)

        for (let i = 0; i < fechasAVerificar.length; i += BATCH_SIZE) {
          const lote = fechasAVerificar.slice(i, i + BATCH_SIZE)
          const loteActual = Math.floor(i/BATCH_SIZE) + 1
          
          // Actualizar progreso
          setProgresoDisponibilidad({ actual: loteActual, total: totalLotes })

          
          // Ejecutar llamadas del lote en paralelo
          const promesasLote = lote.map(fecha => verificarFecha(fecha))
          const resultadosLote = await Promise.allSettled(promesasLote)
          
          // Procesar resultados del lote
          resultadosLote.forEach((resultado) => {
            if (resultado.status === 'fulfilled' && resultado.value) {
              fechasConHorarios.push(resultado.value)
            }
          })
          
          // Actualizar vista con fechas encontradas hasta ahora (UX mejorada)
          if (fechasConHorarios.length > 0) {
            const fechasOrdenadas = [...fechasConHorarios].sort((a, b) => a.getTime() - b.getTime())
            setFechasConDisponibilidad(fechasOrdenadas)
          }

          // Pequeña pausa entre lotes para evitar rate limiting
          if (i + BATCH_SIZE < fechasAVerificar.length) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        }

        // Ordenar fechas
        fechasConHorarios.sort((a, b) => a.getTime() - b.getTime())

        // Guardar en cache
        setCacheDisponibilidad(prev => {
          const newCache = new Map(prev)
          newCache.set(cacheKey, {
            fechas: fechasConHorarios,
            timestamp: now
          })
          return newCache
        })

        setFechasConDisponibilidad(fechasConHorarios)
        setProgresoDisponibilidad(null) // Resetear progreso al terminar
        
        // Fechas con disponibilidad cargadas correctamente
        
        // Guardar en cache
        setCacheDisponibilidad(prev => {
          const newCache = new Map(prev)
          newCache.set(cacheKey, { fechas: fechasConHorarios, timestamp: now })
          return newCache
        })
      } catch (error) {
        // Error silencioso al cargar fechas disponibles
        setFechasConDisponibilidad([])
      } finally {
        setLoadingFechasDisponibles(false)
        setProgresoDisponibilidad(null)
      }
    },
    [cacheDisponibilidad]
  )

  // Función para manejar la selección de fecha
  const handleFechaSeleccionada = (fecha: Date | undefined) => {
    setFechaSeleccionada(fecha)
    setHoraSeleccionada("")

    // Cargar horarios disponibles si hay médico y fecha seleccionados
    if (fecha && medicoId) {
      fetchHorariosDisponibles(medicoId, fecha)
    } else {
      setHorariosDisponibles([])
    }
  }

  // Función para manejar el cambio de especialidad
  const handleEspecialidadChange = (value: string) => {
    // VERSIÓN TEMPORAL - usar directamente el valor sin extracción
    setEspecialidad(value)
    setMedicoId("")
    setFechaSeleccionada(undefined)
    setHoraSeleccionada("")
    setHorariosDisponibles([])
  }

  // Función para manejar el cambio de médico
  const handleMedicoChange = (value: string) => {
    setMedicoId(value)
    setHoraSeleccionada("")
    setHorariosDisponibles([])

    // Cargar fechas con disponibilidad para el nuevo médico
    fetchFechasConDisponibilidad(value)

    // If date is already selected, fetch available slots for the new doctor
    if (fechaSeleccionada) {
      fetchHorariosDisponibles(value, fechaSeleccionada)
    }
  }

  // Función para reiniciar el formulario
  const resetForm = () => {
    setEspecialidad("")
    setMedicoId("")
    setMotivo("")
    setObservaciones("")
    setFechaSeleccionada(undefined)
    setHoraSeleccionada("")
    setEnviandoCita(false)
    setErrorEnvio(null)
    setCitaCreada(false)
    setHorariosDisponibles([])
    setFechasConDisponibilidad([])
    setProgresoDisponibilidad(null)
  }

  // Función para cerrar el diálogo
  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  // Función para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación más estricta
    if (!fechaSeleccionada || !horaSeleccionada || !medicoId || !motivo.trim()) {
      setErrorEnvio("Todos los campos marcados con * son requeridos")
      return
    }

    // Validar observaciones si se seleccionó "otro" como motivo
    if (motivo === "otro" && !observaciones.trim()) {
      setErrorEnvio("Por favor describe el motivo específico de tu consulta")
      return
    }

    try {
      setEnviandoCita(true)
      setErrorEnvio(null)

      // Validar que medicoId sea un número válido
      const medicoIdNum = Number.parseInt(medicoId)
      if (isNaN(medicoIdNum) || medicoIdNum <= 0) {
        throw new Error("ID de médico inválido")
      }

      // CORRECCIÓN: Construir la fecha/hora correctamente usando la utilidad
      const [horas, minutos] = horaSeleccionada.split(":").map(Number)
      if (isNaN(horas) || isNaN(minutos)) {
        throw new Error("Hora seleccionada inválida")
      }

      // Construir fecha/hora usando la utilidad
      const fechaHoraISO = construirFechaISOChile(fechaSeleccionada, horaSeleccionada)

      // Validar que la fecha sea válida
      const fechaValidacion = new Date(fechaHoraISO)
      if (isNaN(fechaValidacion.getTime())) {
        throw new Error("Fecha y hora inválidas")
      }

      // BLOQUEO ELIMINADO: Permitir agendar en cualquier fecha/hora
      // Solo validar que sea una fecha válida

      // Datos para enviar al API - exactamente según los criterios especificados
      const motivoCompleto = motivo === "otro" && observaciones.trim() 
        ? `Otro: ${observaciones.trim()}` 
        : motivo

      const datosNuevaCita = {
        medico_id: medicoIdNum,
        fecha_hora: fechaHoraISO, // Enviar la fecha construida correctamente
        duracion: 30,
        lugar: "Centro Médico nanoMED",
        direccion: "José Joaquín Pérez 240, Salamanca",
        notas: motivoCompleto,
      }

      // Enviando nueva cita al servidor

      // Hacer la petición directamente en lugar de usar el servicio para mejor control de errores
      const token = localStorage.getItem("auth_access_token")
      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosNuevaCita),
      })

      // Leer la respuesta
      const responseText = await response.text()

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        // Error silencioso al parsear respuesta
        throw new Error(`Error del servidor: ${response.status} - ${responseText}`)
      }

      if (!response.ok) {
        // Error de API
        
        // Manejar diferentes tipos de errores
        if (response.status === 400) {
          throw new Error(responseData.message || "Datos de la cita inválidos")
        } else if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente")
        } else if (response.status === 403) {
          throw new Error("No tienes permisos para crear citas")
        } else if (response.status === 422) {
          throw new Error(responseData.message || "Error de validación en los datos")
        } else if (response.status === 429) {
          throw new Error("Demasiadas peticiones. Intenta más tarde")
        } else {
          throw new Error(responseData.message || `Error del servidor: ${response.status}`)
        }
      }

      if (responseData.error) {
        throw new Error(responseData.message || "Error al crear la cita")
      }

      // Cita creada exitosamente - ahora procesar el pago
      const citaCreada = responseData.body

      // Validar que el ID de la cita existe
      if (!citaCreada.cita?.id) {
        throw new Error('No se pudo obtener el ID de la cita creada')
      }

      // Procesar pago inmediatamente después de crear la cita
      try {
        const paymentResponse = await paymentService.createPaymentTransaction(citaCreada.cita.id)
        
        if (!paymentResponse.error) {
          // Generar formulario HTML para enviar a Transbank
          paymentService.redirectToTransbankPayment(paymentResponse.body.url_pago, paymentResponse.body.token)
          return // No cerrar el diálogo, el usuario será redirigido
        } else {
          // Si hay error en el pago, mostrar la cita como creada pero con advertencia
          const errorMessage = paymentResponse.message || "Error desconocido al procesar el pago"
          console.error("Error al procesar pago:", errorMessage)
          
          // Mostrar mensaje de advertencia al usuario
          setErrorEnvio(`Cita creada exitosamente, pero hubo un problema con el pago: ${errorMessage}`)
        }
      } catch (paymentError) {
        console.error("Error al procesar pago:", paymentError)
        
        // Mostrar mensaje de advertencia al usuario
        const errorMessage = paymentError instanceof Error ? paymentError.message : "Error desconocido al procesar el pago"
        setErrorEnvio(`Cita creada exitosamente, pero hubo un problema con el pago: ${errorMessage}`)
      }

      // Mostrar éxito
      setCitaCreada(true)

      // Recargar las citas en el componente padre
      if (onCitaCreada) {
        onCitaCreada()
      }

      // Cerrar el diálogo después de un momento
      setTimeout(() => {
        handleClose()
        setCitaCreada(false)
      }, 2000)
    } catch (error: any) {
      // Error silencioso al crear cita
      setErrorEnvio(error.message || "Error al crear la cita")
    } finally {
      setEnviandoCita(false)
    }
  }

  // Función para convertir el valor del motivo a texto legible
  const getMotivoText = (motivoValue: string) => {
    const motivosMap: Record<string, string> = {
      "control-rutinario": "Control rutinario",
      "dolor-cabeza": "Dolor de cabeza",
      "dolor-espalda": "Dolor de espalda",
      "problemas-respiratorios": "Problemas respiratorios",
      "problemas-digestivos": "Problemas digestivos",
      "fatiga-cansancio": "Fatiga y cansancio",
      "ansiedad-estres": "Ansiedad y estrés",
      "problemas-piel": "Problemas de piel",
      "examenes-laboratorio": "Exámenes de laboratorio",
      "medicamentos": "Consulta de medicamentos",
      "otro": "Otro motivo"
    }
    return motivosMap[motivoValue] || motivoValue
  }

  // Obtener el médico seleccionado
  const medicoSeleccionado = especialidad && medicoId ? 
    Object.values(medicos).flat().find((m) => m.id === medicoId) : null

  // Verificar si el formulario está completo
  const formularioCompleto = especialidad && medicoId && fechaSeleccionada && horaSeleccionada && motivo.trim() && 
    (motivo !== "otro" || observaciones.trim())

  // Función para construir los datos del formulario
  const buildFormData = () => {
    if (!formularioCompleto) return null

    const medicoIdNum = Number.parseInt(medicoId)
    const fechaHoraISO = construirFechaISOChile(fechaSeleccionada!, horaSeleccionada)
    const motivoCompleto = motivo === "otro" && observaciones.trim() 
      ? `Otro: ${observaciones.trim()}` 
      : motivo

    return {
      medico_id: medicoIdNum,
      fecha_hora: fechaHoraISO,
      duracion: 30,
      lugar: "Centro Médico nanoMED",
      direccion: "José Joaquín Pérez 240, Salamanca",
      notas: motivoCompleto,
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" />
          Programar cita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Programar nueva cita médica</DialogTitle>
          <DialogDescription>Completa todos los campos para programar tu cita médica</DialogDescription>
        </DialogHeader>

        <form className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda - Información del médico y motivo */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-900">
                  <User className="h-5 w-5 mr-2 text-[#479cd0]" />
                  Información del médico
                </h3>

                {/* Mostrar error o loading de médicos */}
                {loadingMedicos && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Cargando médicos...</p>
                  </div>
                )}

                {errorMedicos && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-yellow-800">{errorMedicos}</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={fetchMedicos}>
                      Reintentar
                    </Button>
                  </div>
                )}

                {!loadingMedicos && Object.keys(medicos).length > 0 && (
                                      <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="especialidad" className="text-gray-900 font-semibold border-l-4 border-[#479cd0] pl-3 py-1 bg-gradient-to-r from-[#59c3ed]/5 to-[#479cd0]/5">Especialidad médica *</Label>
                      <Select value={especialidad} onValueChange={handleEspecialidadChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(medicos).map((claveCategorizada) => {
                            const [categoria, especialidad] = claveCategorizada.split(" - ")
                            return (
                              <SelectItem key={claveCategorizada} value={claveCategorizada}>
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{especialidad}</span>
                                  <span className="text-xs text-gray-500">{categoria}</span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {especialidad && medicos[especialidad] && (
                      <div className="space-y-2">
                        <Label htmlFor="medico" className="text-gray-900 font-semibold border-l-4 border-[#479cd0] pl-3 py-1 bg-gradient-to-r from-[#59c3ed]/5 to-[#479cd0]/5">Médico *</Label>
                        <Select value={medicoId} onValueChange={handleMedicoChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un médico" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicos[especialidad].map((medico) => (
                              <SelectItem key={medico.id} value={medico.id}>
                                {medico.nombre} {medico.apellido}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-900">
                  <Calendar className="h-5 w-5 mr-2 text-[#479cd0]" />
                  Motivo de la consulta
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="motivo" className="text-gray-900 font-semibold border-l-4 border-[#479cd0] pl-3 py-1 bg-gradient-to-r from-[#59c3ed]/5 to-[#479cd0]/5">Selecciona el motivo de tu consulta *</Label>
                  <Select value={motivo} onValueChange={setMotivo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un motivo de consulta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="control-rutinario">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Control rutinario</span>
                          <span className="text-xs text-gray-500">Revisión médica periódica</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dolor-cabeza">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Dolor de cabeza</span>
                          <span className="text-xs text-gray-500">Cefalea, migraña</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dolor-espalda">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Dolor de espalda</span>
                          <span className="text-xs text-gray-500">Lumbalgia, dorsalgia</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dolor-articular">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Dolor articular</span>
                          <span className="text-xs text-gray-500">Rodillas, hombros, etc.</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="problemas-respiratorios">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Problemas respiratorios</span>
                          <span className="text-xs text-gray-500">Tos, dificultad para respirar</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="problemas-digestivos">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Problemas digestivos</span>
                          <span className="text-xs text-gray-500">Dolor abdominal, náuseas</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fatiga-cansancio">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Fatiga y cansancio</span>
                          <span className="text-xs text-gray-500">Astenia, debilidad</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ansiedad-estres">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Ansiedad y estrés</span>
                          <span className="text-xs text-gray-500">Problemas emocionales</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="problemas-piel">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Problemas de piel</span>
                          <span className="text-xs text-gray-500">Erupciones, manchas</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="examenes-laboratorio">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Exámenes de laboratorio</span>
                          <span className="text-xs text-gray-500">Análisis de sangre, orina</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medicamentos">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Consulta de medicamentos</span>
                          <span className="text-xs text-gray-500">Recetas, ajustes de dosis</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="otro">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">Otro motivo</span>
                          <span className="text-xs text-gray-500">Especificar en observaciones</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Campo adicional para observaciones cuando se selecciona "Otro" */}
                  {motivo === "otro" && (
                    <div className="mt-3">
                      <Label htmlFor="observaciones" className="text-gray-900 font-semibold border-l-4 border-[#479cd0] pl-3 py-1 bg-gradient-to-r from-[#59c3ed]/5 to-[#479cd0]/5">Observaciones adicionales</Label>
                      <Textarea
                        id="observaciones"
                        placeholder="Describe el motivo específico de tu consulta..."
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen de la cita */}
              {formularioCompleto && (
                <div className="bg-gradient-to-r from-[#59c3ed]/20 to-[#479cd0]/20 border-2 border-[#479cd0]/60 p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-3 text-[#1e3a5f]">Resumen de tu cita</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Especialidad:</span>
                      <span>{especialidad ? especialidad.split(" - ")[1] || especialidad : ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Médico:</span>
                      <span>
                        {medicoSeleccionado ? `Dr. ${medicoSeleccionado.nombre} ${medicoSeleccionado.apellido}` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Fecha:</span>
                      <span>
                        {fechaSeleccionada ? format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es }) : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Hora:</span>
                      <span>{horaSeleccionada}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Duración:</span>
                      <span>30 minutos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Lugar:</span>
                      <span>Centro Médico nanoMED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Motivo:</span>
                      <span className="text-right max-w-xs">
                        {motivo === "otro" && observaciones.trim() 
                          ? observaciones.trim() 
                          : getMotivoText(motivo)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha - Fecha y hora */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-900">
                  <Calendar className="h-5 w-5 mr-2 text-[#479cd0]" />
                  Selecciona fecha y hora
                </h3>

                {!medicoId ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Primero selecciona un médico</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-bold text-gray-900 border-l-4 border-[#479cd0] pl-3 py-1 bg-gradient-to-r from-[#59c3ed]/5 to-[#479cd0]/5">Fecha disponible *</Label>
                      <div className="mt-2 flex justify-center">
                        <CalendarComponent
                          mode="single"
                          selected={fechaSeleccionada}
                          onSelect={handleFechaSeleccionada}
                          disabled={(date) => {
                            // Obtener fecha actual de Chile
                            const ahora = new Date()
                            const fechaChile = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Santiago' }))
                            const hoy = new Date(fechaChile.getFullYear(), fechaChile.getMonth(), fechaChile.getDate())
                            
                            // Bloquear solo días anteriores a hoy
                            return date < hoy
                          }}
                          modifiers={{
                            available: fechasConDisponibilidad,
                            selected: fechaSeleccionada ? [fechaSeleccionada] : []
                          }}
                          modifiersClassNames={{
                            available: "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 hover:from-emerald-200 hover:to-emerald-300 border-2 border-emerald-300 font-bold shadow-md hover:shadow-lg transition-all duration-200",
                            selected: "bg-gradient-to-r from-[#59c3ed] to-[#479cd0] text-white hover:from-[#479cd0] hover:to-[#59c3ed] border-2 border-[#479cd0] font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                          }}
                          className="rounded-md border"
                          initialFocus
                        />
                      </div>
                      {loadingFechasDisponibles && (
                        <div className="text-center mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#59c3ed] mx-auto"></div>
                          {progresoDisponibilidad ? (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                Verificando disponibilidad... ({progresoDisponibilidad.actual}/{progresoDisponibilidad.total})
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-gradient-to-r from-[#59c3ed] to-[#479cd0] h-1.5 rounded-full transition-all duration-300" 
                                  style={{ width: `${(progresoDisponibilidad.actual / progresoDisponibilidad.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 mt-1">Preparando verificación...</p>
                          )}
                        </div>
                      )}
                      {fechasConDisponibilidad.length > 0 && !loadingFechasDisponibles && (
                        <div className="mt-2 text-center">
                          <p className="text-sm text-gray-800 font-medium">
                            <span className="inline-block w-4 h-4 bg-gradient-to-r from-emerald-100 to-emerald-200 border-2 border-emerald-300 rounded-sm mr-2 shadow-md"></span>
                            Días con horarios disponibles ({fechasConDisponibilidad.length} días)
                          </p>
                        </div>
                      )}
                      {fechasConDisponibilidad.length === 0 && !loadingFechasDisponibles && medicoId && (
                        <div className="mt-2 text-center">
                          <p className="text-xs text-gray-500">
                            No se encontraron horarios disponibles
                          </p>
                        </div>
                      )}
                    </div>

                    {fechaSeleccionada && (
                      <div className="space-y-3">
                        <Label className="text-base font-bold text-gray-900 border-l-4 border-[#479cd0] pl-3 py-1 bg-gradient-to-r from-[#59c3ed]/5 to-[#479cd0]/5">Horarios disponibles *</Label>
                        <p className="text-sm text-gray-800 font-semibold bg-gray-100 px-3 py-1 rounded-md">
                          {format(fechaSeleccionada, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>

                        {loadingHorarios ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#59c3ed] mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Cargando horarios...</p>
                          </div>
                        ) : errorHorarios ? (
                          <div className="text-center py-4">
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                              <p className="text-sm text-red-800">{errorHorarios}</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => fetchHorariosDisponibles(medicoId, fechaSeleccionada)}
                              >
                                Reintentar
                              </Button>
                            </div>
                          </div>
                        ) : horariosDisponibles.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {horariosDisponibles.map((hora) => (
                              <Button
                                key={hora}
                                type="button"
                                variant={horaSeleccionada === hora ? "default" : "outline"}
                                className={`${
                                  horaSeleccionada === hora
                                    ? "bg-gradient-to-r from-[#3a8bb8] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#3a8bb8] text-white font-semibold shadow-md border-2 border-[#1e3a5f]"
                                    : "hover:bg-gradient-to-r hover:from-[#59c3ed]/20 hover:to-[#479cd0]/20 border-2 border-gray-200 hover:border-[#479cd0]/50"
                                } transition-all duration-200`}
                                onClick={() => setHoraSeleccionada(hora)}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                {hora}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-100 rounded-md">
                            <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">No hay horarios disponibles</p>
                            <p className="text-sm text-gray-400 mt-1">Selecciona otra fecha</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {errorEnvio && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium">Error al crear la cita</p>
                  <p className="text-sm text-red-700 mt-1">{errorEnvio}</p>
                </div>
              </div>
            </div>
          )}

          {citaCreada && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800 font-medium">¡Cita creada exitosamente!</p>
                  <p className="text-sm text-green-700 mt-1">Tu cita ha sido programada correctamente.</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={enviandoCita}>
              Cancelar
            </Button>
            <ConfirmAndPayButton
              formData={buildFormData()}
              onSuccess={() => {
                setCitaCreada(true)
                if (onCitaCreada) {
                  onCitaCreada()
                }
                setTimeout(() => {
                  handleClose()
                  setCitaCreada(false)
                }, 2000)
              }}
              onError={(error) => setErrorEnvio(error)}
              disabled={!formularioCompleto || enviandoCita || citaCreada}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CitasPage() {
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroFecha, setFiltroFecha] = useState("todos")

  // Estados para el API
  const [citas, setCitas] = useState<CitaAdaptada[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar las citas desde el API
  const cargarCitas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await appointmentsService.getAppointments()

      if (response.error) {
        throw new Error(response.message || "Error al cargar las citas")
      }

      // Validar que la respuesta tenga la estructura esperada
      if (!response.body) {
        throw new Error("Respuesta del servidor inválida")
      }

      // Adaptar los datos del API
      // El backend devuelve { citas: Appointment[], total: number, filtros_aplicados: {} }
      const citasDelBackend = response.body.citas || []
      
      if (!Array.isArray(citasDelBackend)) {
        // Las citas no son un array válido
        setCitas([]);
        return;
      }

      const citasAdaptadas = citasDelBackend
        .filter(cita => cita && typeof cita === 'object') // Filtrar citas válidas
        .map(adaptarCitaDesdeAPI)
        .filter(cita => cita.id !== '0') // Filtrar citas con error

      setCitas(citasAdaptadas)
    } catch (error: any) {
      // Error silencioso al cargar citas
      setError(error.message || "Error al cargar las citas")
      setCitas([]) // Establecer array vacío en caso de error
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar citas al montar el componente
  useEffect(() => {
    cargarCitas()
  }, [cargarCitas])

  // Filtrar citas según los criterios (mantener la lógica existente)
  const citasFiltradas = citas.filter((cita) => {
    // Filtro por búsqueda
    const coincideBusqueda =
      cita.medico.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.especialidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.lugar.toLowerCase().includes(busqueda.toLowerCase())

    // Filtro por estado
    const coincideEstado = filtroEstado === "todos" || cita.estado === filtroEstado

    // Filtro por fecha
    let coincideFecha = true
    const fechaCita = parseISO(cita.fecha)
    const hoy = startOfDay(new Date())

    if (filtroFecha === "proximas") {
      coincideFecha = isAfter(fechaCita, hoy)
    } else if (filtroFecha === "pasadas") {
      coincideFecha = isBefore(fechaCita, hoy)
    }

    return coincideBusqueda && coincideEstado && coincideFecha
  })

  // Separar citas por estado para las pestañas
  const citasProgramadas = citasFiltradas.filter((cita) => cita.estado === "programada")
  const citasConfirmadas = citasFiltradas.filter((cita) => cita.estado === "confirmada")
  const citasCompletadas = citasFiltradas.filter((cita) => cita.estado === "completada")
  const citasCanceladas = citasFiltradas.filter((cita) => cita.estado === "cancelada")

  // Mostrar loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mis Citas</h1>
            <p className="text-gray-500">Gestiona tus citas médicas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={cargarCitas} disabled={loading}>
              {loading ? "Cargando..." : "Actualizar"}
            </Button>
            <NuevaCitaDialog onCitaCreada={cargarCitas} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#59c3ed]"></div>
            <p className="ml-3 text-gray-500">Cargando citas...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mis Citas</h1>
            <p className="text-gray-500">Gestiona tus citas médicas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={cargarCitas} disabled={loading}>
              {loading ? "Cargando..." : "Actualizar"}
            </Button>
            <NuevaCitaDialog onCitaCreada={cargarCitas} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto">
              <p className="text-red-800 font-medium">Error al cargar las citas</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={cargarCitas}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mis <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">citas</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Gestiona tus citas médicas y mantén el control de tu salud de forma integral
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={cargarCitas} 
            disabled={loading}
            className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
          >
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
          <NuevaCitaDialog onCitaCreada={cargarCitas} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/5 to-[#479cd0]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#59c3ed] group-hover:text-[#479cd0] transition-colors duration-300" />
              <Input
                placeholder="Buscar por médico, especialidad o lugar"
                className="pl-9 bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[180px] bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="programada">Programadas</SelectItem>
                <SelectItem value="confirmada">Confirmadas</SelectItem>
                <SelectItem value="completada">Completadas</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroFecha} onValueChange={setFiltroFecha}>
              <SelectTrigger className="w-[180px] bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300">
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las fechas</SelectItem>
                <SelectItem value="proximas">Próximas citas</SelectItem>
                <SelectItem value="pasadas">Citas pasadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="mb-6 bg-gray-100/50 border border-gray-200 p-0 rounded-lg grid grid-cols-2 md:grid-cols-5 w-full h-12 overflow-hidden">
            <TabsTrigger 
              value="todas" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium first:rounded-l-md md:border-r md:border-gray-200/50"
            >
              Todas
            </TabsTrigger>
            <TabsTrigger 
              value="programadas" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium last:rounded-r-md md:last:rounded-none md:border-r md:border-gray-200/50"
            >
              Programadas
            </TabsTrigger>
            <TabsTrigger 
              value="confirmadas" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium first:rounded-l-md md:first:rounded-none md:border-r md:border-gray-200/50"
            >
              Confirmadas
            </TabsTrigger>
            <TabsTrigger 
              value="completadas" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium last:rounded-r-md md:border-r md:border-gray-200/50"
            >
              Completadas
            </TabsTrigger>
            <TabsTrigger 
              value="canceladas" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium rounded-r-md"
            >
              Canceladas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas">
            {citasFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {citasFiltradas.map((cita) => (
                  <CitaCard key={cita.id} cita={cita} onCitaCancelada={cargarCitas} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron citas con los filtros seleccionados.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="programadas">
            {citasProgramadas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {citasProgramadas.map((cita) => (
                  <CitaCard key={cita.id} cita={cita} onCitaCancelada={cargarCitas} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No tienes citas programadas.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="confirmadas">
            {citasConfirmadas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {citasConfirmadas.map((cita) => (
                  <CitaCard key={cita.id} cita={cita} onCitaCancelada={cargarCitas} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No tienes citas confirmadas.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completadas">
            {citasCompletadas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {citasCompletadas.map((cita) => (
                  <CitaCard key={cita.id} cita={cita} onCitaCancelada={cargarCitas} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No tienes citas completadas.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="canceladas">
            {citasCanceladas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {citasCanceladas.map((cita) => (
                  <CitaCard key={cita.id} cita={cita} onCitaCancelada={cargarCitas} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No tienes citas canceladas.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
