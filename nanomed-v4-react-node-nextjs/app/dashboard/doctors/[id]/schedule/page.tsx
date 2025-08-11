"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Clock, CalendarIcon, AlertCircle, RefreshCw, User } from "lucide-react"
import { useDoctorSchedule } from "@/lib/api/hooks/use-doctor-schedule"
import { useAuth } from "@/lib/api/hooks/use-auth"

export default function DoctorSchedulePage({ params }: { params: { id: string } }) {
  const doctorId = Number.parseInt(params.id)
  const { schedule, loading, error, refetch } = useDoctorSchedule(doctorId)
  const { user } = useAuth()

  // Función para formatear la hora
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  // Función para calcular la duración en horas
  const calculateDuration = (inicio: string, fin: string) => {
    const start = new Date(inicio)
    const end = new Date(fin)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours
  }

  if (loading) {
    return <ScheduleLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/doctors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Horarios del Médico</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={refetch} className="ml-2">
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/doctors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Horarios del Médico</h1>
        </div>

        <div className="text-center py-10">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron horarios</h3>
          <p className="mt-1 text-sm text-gray-500">No hay información de horarios disponible para este médico.</p>
        </div>
      </div>
    )
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
        <h1 className="text-2xl font-bold tracking-tight">Horarios del Médico</h1>
        <Button variant="outline" onClick={refetch} disabled={loading} className="ml-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Información del médico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {schedule.medico.nombre} {schedule.medico.apellido}
            </h3>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>ID: {schedule.medico.id}</span>
              <span>Total de horarios: {schedule.total_horarios_regulares}</span>
              <span>Excepciones: {schedule.total_excepciones}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horarios por día */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Horarios Semanales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.horarios_por_dia.map((dia) => (
                <div key={dia.dia_numero} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{dia.dia_nombre}</h3>
                    <Badge variant={dia.horarios.length > 0 ? "default" : "secondary"}>
                      {dia.horarios.length > 0 ? "Disponible" : "Sin horarios"}
                    </Badge>
                  </div>

                  {dia.horarios.length > 0 ? (
                    <div className="space-y-2">
                      {dia.horarios.map((horario) => (
                        <div
                          key={horario.id}
                          className={`p-3 rounded-md border ${
                            horario.activo ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-cyan-500" />
                                <span className="font-medium">
                                  {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Duración: {calculateDuration(horario.hora_inicio, horario.hora_fin)}h
                              </div>
                              <div className="text-sm text-gray-600">Citas de {horario.duracion_cita} min</div>
                            </div>
                            <Badge variant={horario.activo ? "default" : "secondary"}>
                              {horario.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>

                          {(horario.fecha_desde || horario.fecha_hasta) && (
                            <div className="mt-2 text-xs text-gray-500">
                              {horario.fecha_desde && (
                                <span>Desde: {new Date(horario.fecha_desde).toLocaleDateString()}</span>
                              )}
                              {horario.fecha_desde && horario.fecha_hasta && <span> | </span>}
                              {horario.fecha_hasta && (
                                <span>Hasta: {new Date(horario.fecha_hasta).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No hay horarios configurados para este día</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Excepciones próximas */}
        {schedule.excepciones_proximas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Excepciones Próximas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {schedule.excepciones_proximas.map((excepcion, index) => (
                  <div key={index} className="p-3 rounded-md border border-amber-200 bg-amber-50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{excepcion.fecha}</span>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">
                        Excepción
                      </Badge>
                    </div>
                    {excepcion.descripcion && <p className="text-sm text-gray-600 mt-1">{excepcion.descripcion}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">
                  {schedule.horarios_por_dia.filter((dia) => dia.horarios.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Días con horarios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{schedule.total_horarios_regulares}</div>
                <div className="text-sm text-gray-600">Horarios regulares</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{schedule.total_excepciones}</div>
                <div className="text-sm text-gray-600">Excepciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {schedule.horarios_por_dia.flatMap((dia) => dia.horarios).filter((horario) => horario.activo).length}
                </div>
                <div className="text-sm text-gray-600">Horarios activos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ScheduleLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-8 w-48" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-md border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
