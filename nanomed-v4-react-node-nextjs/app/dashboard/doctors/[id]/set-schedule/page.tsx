"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Clock, Save, AlertCircle, CheckCircle, User } from "lucide-react"
import { doctorsService, type ScheduleInput } from "@/lib/api/services/doctors.service"
import { useDoctors } from "@/lib/api/hooks/use-doctors"

const DIAS_SEMANA = [
  { numero: 1, nombre: "Lunes" },
  { numero: 2, nombre: "Martes" },
  { numero: 3, nombre: "Miércoles" },
  { numero: 4, nombre: "Jueves" },
  { numero: 5, nombre: "Viernes" },
  { numero: 6, nombre: "Sábado" },
  { numero: 7, nombre: "Domingo" },
]

const DURACIONES_CITA = [15, 30, 45, 60, 90, 120]

export default function SetDoctorSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const doctorId = Number.parseInt(params.id)
  const { doctors } = useDoctors()

  const [horarios, setHorarios] = useState<ScheduleInput[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Encontrar información del médico
  const doctor = doctors?.find((d) => d.id === doctorId)

  // Agregar nuevo horario
  const agregarHorario = () => {
    const nuevoHorario: ScheduleInput = {
      dia_semana: 1,
      hora_inicio: "09:00",
      hora_fin: "17:00",
      duracion_cita: 30,
      fecha_desde: new Date().toISOString().split("T")[0],
      fecha_hasta: null,
    }
    setHorarios([...horarios, nuevoHorario])
  }

  // Eliminar horario
  const eliminarHorario = (index: number) => {
    setHorarios(horarios.filter((_, i) => i !== index))
  }

  // Actualizar horario
  const actualizarHorario = (index: number, campo: keyof ScheduleInput, valor: any) => {
    const nuevosHorarios = [...horarios]
    nuevosHorarios[index] = { ...nuevosHorarios[index], [campo]: valor }
    setHorarios(nuevosHorarios)
  }

  // Validar horarios
  const validarHorarios = (): string | null => {
    if (horarios.length === 0) {
      return "Debe agregar al menos un horario"
    }

    for (let i = 0; i < horarios.length; i++) {
      const horario = horarios[i]

      if (!horario.hora_inicio || !horario.hora_fin) {
        return `Horario ${i + 1}: Debe especificar hora de inicio y fin`
      }

      if (horario.hora_inicio >= horario.hora_fin) {
        return `Horario ${i + 1}: La hora de inicio debe ser menor que la hora de fin`
      }

      if (horario.duracion_cita <= 0) {
        return `Horario ${i + 1}: La duración de cita debe ser mayor a 0`
      }
    }

    return null
  }

  // Guardar horarios
  const guardarHorarios = async () => {
    const errorValidacion = validarHorarios()
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await doctorsService.setDoctorSchedule(doctorId, { horarios })
      setSuccess(true)
      setTimeout(() => {
        router.push(`/dashboard/doctors/${doctorId}/schedule`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Error al guardar los horarios")
    } finally {
      setLoading(false)
    }
  }

  // Obtener nombre del día
  const getNombreDia = (numero: number) => {
    return DIAS_SEMANA.find((d) => d.numero === numero)?.nombre || `Día ${numero}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/doctors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Establecer Horario Base</h1>
      </div>

      {/* Información del médico */}
      {doctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Médico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {doctor.nombre} {doctor.apellido}
              </h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>ID: {doctor.id}</span>
                <span>Email: {doctor.email}</span>
                {doctor.rut && <span>RUT: {doctor.rut}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Horarios guardados exitosamente. Redirigiendo...
          </AlertDescription>
        </Alert>
      )}

      {/* Formulario de horarios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configurar Horarios</CardTitle>
            <Button onClick={agregarHorario} size="sm" className="bg-cyan-500 hover:bg-cyan-600">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Horario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {horarios.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay horarios configurados</h3>
              <p className="mt-1 text-sm text-gray-500">Comience agregando un horario para este médico.</p>
              <Button onClick={agregarHorario} className="mt-4 bg-cyan-500 hover:bg-cyan-600">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Horario
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {horarios.map((horario, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Horario {index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getNombreDia(horario.dia_semana)}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarHorario(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Día de la semana */}
                    <div className="space-y-2">
                      <Label>Día de la semana</Label>
                      <Select
                        value={horario.dia_semana.toString()}
                        onValueChange={(value) => actualizarHorario(index, "dia_semana", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAS_SEMANA.map((dia) => (
                            <SelectItem key={dia.numero} value={dia.numero.toString()}>
                              {dia.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Hora inicio */}
                    <div className="space-y-2">
                      <Label>Hora de inicio</Label>
                      <Input
                        type="time"
                        value={horario.hora_inicio}
                        onChange={(e) => actualizarHorario(index, "hora_inicio", e.target.value)}
                      />
                    </div>

                    {/* Hora fin */}
                    <div className="space-y-2">
                      <Label>Hora de fin</Label>
                      <Input
                        type="time"
                        value={horario.hora_fin}
                        onChange={(e) => actualizarHorario(index, "hora_fin", e.target.value)}
                      />
                    </div>

                    {/* Duración de cita */}
                    <div className="space-y-2">
                      <Label>Duración de cita (minutos)</Label>
                      <Select
                        value={horario.duracion_cita.toString()}
                        onValueChange={(value) => actualizarHorario(index, "duracion_cita", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DURACIONES_CITA.map((duracion) => (
                            <SelectItem key={duracion} value={duracion.toString()}>
                              {duracion} minutos
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fecha desde */}
                    <div className="space-y-2">
                      <Label>Fecha desde</Label>
                      <Input
                        type="date"
                        value={horario.fecha_desde || ""}
                        onChange={(e) => actualizarHorario(index, "fecha_desde", e.target.value || null)}
                      />
                    </div>

                    {/* Fecha hasta */}
                    <div className="space-y-2">
                      <Label>Fecha hasta (opcional)</Label>
                      <Input
                        type="date"
                        value={horario.fecha_hasta || ""}
                        onChange={(e) => actualizarHorario(index, "fecha_hasta", e.target.value || null)}
                      />
                    </div>
                  </div>

                  {/* Resumen del horario */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong>Resumen:</strong> {getNombreDia(horario.dia_semana)} de {horario.hora_inicio} a{" "}
                      {horario.hora_fin} (citas de {horario.duracion_cita} min)
                      {horario.fecha_desde && ` desde ${new Date(horario.fecha_desde).toLocaleDateString()}`}
                      {horario.fecha_hasta && ` hasta ${new Date(horario.fecha_hasta).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      {horarios.length > 0 && (
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/doctors">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button onClick={guardarHorarios} disabled={loading} className="bg-cyan-500 hover:bg-cyan-600">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Horarios
              </>
            )}
          </Button>
        </div>
      )}

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Importante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Los horarios se aplicarán como horarios base regulares para el médico.</p>
            <p>• Puede configurar múltiples horarios para el mismo día (ej: mañana y tarde).</p>
            <p>• La duración de cita determina los intervalos disponibles para agendar.</p>
            <p>• Las fechas desde/hasta son opcionales y permiten horarios temporales.</p>
            <p>• Si no especifica fecha hasta, el horario será permanente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
