"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  CalendarX,
  Users,
  GraduationCap,
  Heart,
  ClockIcon,
} from "lucide-react"
import { doctorsService, type AddScheduleExceptionRequest } from "@/lib/api/services/doctors.service"
import { useDoctors } from "@/lib/api/hooks/use-doctors"

// Plantillas predefinidas
const EXCEPTION_TEMPLATES = [
  {
    id: "vacaciones",
    name: "Vacaciones",
    icon: CalendarX,
    description: "Día completo no disponible por vacaciones",
    data: {
      motivo: "Vacaciones",
      todo_el_dia: true,
    },
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    id: "festivo",
    name: "Día Festivo",
    icon: Calendar,
    description: "Feriado nacional o día especial",
    data: {
      motivo: "Día festivo",
      todo_el_dia: true,
    },
    color: "bg-red-50 border-red-200 text-red-700",
  },
  {
    id: "reunion",
    name: "Reunión Médica",
    icon: Users,
    description: "Reunión o junta médica",
    data: {
      motivo: "Reunión médica",
      todo_el_dia: false,
      hora_inicio: "14:00",
      hora_fin: "16:00",
    },
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
  {
    id: "capacitacion",
    name: "Capacitación",
    icon: GraduationCap,
    description: "Curso o capacitación profesional",
    data: {
      motivo: "Capacitación médica",
      todo_el_dia: false,
      hora_inicio: "08:00",
      hora_fin: "12:00",
    },
    color: "bg-green-50 border-green-200 text-green-700",
  },
  {
    id: "emergencia",
    name: "Emergencia Personal",
    icon: Heart,
    description: "Situación personal imprevista",
    data: {
      motivo: "Emergencia personal",
      todo_el_dia: true,
    },
    color: "bg-orange-50 border-orange-200 text-orange-700",
  },
  {
    id: "horario_reducido",
    name: "Horario Reducido",
    icon: ClockIcon,
    description: "Disponibilidad limitada por consulta externa",
    data: {
      motivo: "Horario reducido por consulta externa",
      todo_el_dia: false,
      hora_inicio: "16:00",
      hora_fin: "18:00",
    },
    color: "bg-yellow-50 border-yellow-200 text-yellow-700",
  },
]

export default function ScheduleExceptionsPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = Number.parseInt(params.id as string)

  const { doctors } = useDoctors()
  const doctor = doctors?.find((d) => d.id === doctorId)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado del formulario
  const [formData, setFormData] = useState<AddScheduleExceptionRequest>({
    fecha: "",
    motivo: "",
    todo_el_dia: true,
    hora_inicio: "",
    hora_fin: "",
  })

  const handleTemplateSelect = (template: (typeof EXCEPTION_TEMPLATES)[0]) => {
    setFormData({
      ...formData,
      ...template.data,
    })
    setError(null)
    setSuccess(false)
  }

  const handleInputChange = (field: keyof AddScheduleExceptionRequest, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
    setSuccess(false)
  }

  const validateForm = (): string | null => {
    if (!formData.fecha) {
      return "La fecha es obligatoria"
    }

    if (!formData.motivo.trim()) {
      return "El motivo es obligatorio"
    }

    if (!formData.todo_el_dia) {
      if (!formData.hora_inicio || !formData.hora_fin) {
        return "Las horas de inicio y fin son obligatorias para excepciones parciales"
      }

      if (formData.hora_inicio >= formData.hora_fin) {
        return "La hora de inicio debe ser anterior a la hora de fin"
      }
    }

    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(formData.fecha)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      return "No se pueden crear excepciones para fechas pasadas"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Preparar datos para envío
      const submitData: AddScheduleExceptionRequest = {
        fecha: formData.fecha,
        motivo: formData.motivo.trim(),
        todo_el_dia: formData.todo_el_dia,
      }

      // Solo incluir horas si no es todo el día
      if (!formData.todo_el_dia) {
        submitData.hora_inicio = formData.hora_inicio
        submitData.hora_fin = formData.hora_fin
      }

      await doctorsService.addScheduleException(doctorId, submitData)

      setSuccess(true)
      setError(null)

      // Limpiar formulario después de éxito
      setTimeout(() => {
        setFormData({
          fecha: "",
          motivo: "",
          todo_el_dia: true,
          hora_inicio: "",
          hora_fin: "",
        })
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Error al crear la excepción")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agregar Excepciones al Horario</h1>
          {doctor && (
            <p className="text-gray-500">
              Configurando excepciones para{" "}
              <span className="font-medium">
                {doctor.nombre} {doctor.apellido}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Información del médico */}
      {doctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Médico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre completo</p>
                <p className="font-medium">
                  {doctor.nombre} {doctor.apellido}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{doctor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <Badge variant={doctor.email_verified ? "default" : "secondary"}>
                  {doctor.email_verified ? "Verificado" : "Sin verificar"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            ¡Excepción creada exitosamente! La excepción ha sido agregada al horario del médico.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulario principal */}
      {/* Formulario unificado */}
      <Card>
        <CardHeader>
          <CardTitle>Crear Excepción al Horario</CardTitle>
          <p className="text-sm text-gray-500">
            Selecciona una plantilla rápida o configura manualmente los detalles de la excepción
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plantillas rápidas */}
          <div>
            <Label className="text-base font-medium">Plantillas Rápidas</Label>
            <p className="text-sm text-gray-500 mb-3">
              Haz clic en una plantilla para aplicar la configuración automáticamente
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {EXCEPTION_TEMPLATES.map((template) => {
                const Icon = template.icon
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${template.color} border-2`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs opacity-80">{template.description}</p>
                          <div className="mt-1 text-xs">
                            <p>
                              <strong>Tipo:</strong> {template.data.todo_el_dia ? "Día completo" : "Parcial"}
                            </p>
                            {!template.data.todo_el_dia && template.data.hora_inicio && template.data.hora_fin && (
                              <p>
                                <strong>Horario:</strong> {template.data.hora_inicio} - {template.data.hora_fin}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O configura manualmente</span>
            </div>
          </div>

          {/* Configuración manual */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha de la excepción *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange("fecha", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="todo_el_dia"
                  checked={formData.todo_el_dia}
                  onCheckedChange={(checked) => handleInputChange("todo_el_dia", checked)}
                />
                <Label htmlFor="todo_el_dia">Todo el día</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="motivo">Motivo de la excepción *</Label>
              <Textarea
                id="motivo"
                placeholder="Describe el motivo de la excepción..."
                value={formData.motivo}
                onChange={(e) => handleInputChange("motivo", e.target.value)}
                rows={3}
              />
            </div>

            {!formData.todo_el_dia && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hora_inicio">Hora de inicio *</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => handleInputChange("hora_inicio", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hora_fin">Hora de fin *</Label>
                  <Input
                    id="hora_fin"
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => handleInputChange("hora_fin", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vista previa */}
      {formData.fecha && formData.motivo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Vista Previa de la Excepción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{formatDate(formData.fecha)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <Badge variant={formData.todo_el_dia ? "destructive" : "secondary"}>
                    {formData.todo_el_dia ? "Día completo" : "Horario parcial"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Motivo</p>
                <p className="font-medium">{formData.motivo}</p>
              </div>

              {!formData.todo_el_dia && formData.hora_inicio && formData.hora_fin && (
                <div>
                  <p className="text-sm text-gray-500">Horario afectado</p>
                  <p className="font-medium">
                    {formData.hora_inicio} - {formData.hora_fin}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de acción */}
      <div className="flex gap-4">
        <Button onClick={handleSubmit} disabled={loading || !formData.fecha || !formData.motivo} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creando Excepción...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Crear Excepción
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setFormData({
              fecha: "",
              motivo: "",
              todo_el_dia: true,
              hora_inicio: "",
              hora_fin: "",
            })
            setError(null)
            setSuccess(false)
          }}
        >
          Limpiar
        </Button>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Importante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Las excepciones afectan la disponibilidad del médico en la fecha especificada</p>
            <p>• Las excepciones de "día completo" bloquean toda la agenda del día</p>
            <p>• Las excepciones "parciales" solo afectan el horario especificado</p>
            <p>• No se pueden crear excepciones para fechas pasadas</p>
            <p>• Las citas existentes en el horario de la excepción deberán ser reprogramadas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
