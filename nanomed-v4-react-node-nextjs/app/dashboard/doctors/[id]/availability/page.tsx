"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar, Clock, User, CheckCircle, XCircle, AlertTriangle, Info, RefreshCw } from "lucide-react"
import { doctorsService, type DoctorAvailabilityResponse } from "@/lib/api/services/doctors.service"
import { useDoctors } from "@/lib/api/hooks/use-doctors"

export default function DoctorAvailabilityPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = Number.parseInt(params.id as string)

  const { doctors } = useDoctors()
  const doctor = doctors?.find((d) => d.id === doctorId)

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [availability, setAvailability] = useState<DoctorAvailabilityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const fetchAvailability = async () => {
    if (!selectedDate) return

    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      const response = await doctorsService.checkDoctorAvailability(doctorId, selectedDate)

      setDebugInfo(response)

      if (response.error) {
        console.error("❌ Error en la respuesta:", response.message)
        setError(response.message || "Error al verificar disponibilidad")
      } else {
        setAvailability(response.body)
      }
    } catch (err) {
      console.error("💥 Error de conexión:", err)
      setError("Error al conectar con el servidor")
      setDebugInfo({ error: err })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability()
    }
  }, [selectedDate, doctorId])

  const formatDate = (dateString: string) => {
    try {
      // Crear la fecha correctamente interpretando como fecha local
      const [year, month, day] = dateString.split("-").map(Number)
      const date = new Date(year, month - 1, day) // month - 1 porque los meses van de 0-11

      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (err) {
      console.error("Error formateando fecha:", err)
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
    try {
      if (timeString.includes("T")) {
        return new Date(timeString).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      }
      return timeString.substring(0, 5)
    } catch (err) {
      console.error("Error formateando hora:", err)
      return timeString
    }
  }

  const getDayName = (dayNumber: number) => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    return days[dayNumber] || `Día ${dayNumber}`
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
          <h1 className="text-2xl font-bold tracking-tight">Verificar Disponibilidad</h1>
          {doctor && (
            <p className="text-gray-600">
              {doctor.nombre} {doctor.apellido}
            </p>
          )}
          <p className="text-sm text-gray-500">ID del médico: {doctorId}</p>
        </div>
      </div>

      {/* Debug Info - Solo en desarrollo */}
      {process.env.NODE_ENV === "development" && debugInfo && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Selector de fecha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Seleccionar Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="fecha">Fecha a consultar</Label>
              <Input
                id="fecha"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <Button onClick={fetchAvailability} disabled={loading || !selectedDate}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Consultar
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Fecha seleccionada: {selectedDate}</p>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
            <br />
            <span className="text-xs">Revisa la consola del navegador para más detalles</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Consultando disponibilidad...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sin datos */}
      {!loading && !error && !availability && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Selecciona una fecha para consultar la disponibilidad del médico.</AlertDescription>
        </Alert>
      )}

      {/* Resultados */}
      {availability && !loading && (
        <div className="space-y-6">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Médico</Label>
                  <p className="text-lg font-semibold">
                    {availability.medico?.nombre || "N/A"} {availability.medico?.apellido || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha consultada</Label>
                  <p className="text-lg">{formatDate(availability.fecha)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Excepción de día completo */}
          {availability.excepcion && !availability.excepcion.parcial && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Médico no disponible:</strong> {availability.excepcion.motivo}
                {availability.excepcion.mensaje && <span className="block mt-1">{availability.excepcion.mensaje}</span>}
              </AlertDescription>
            </Alert>
          )}

          {/* Sin horarios configurados */}
          {availability.mensaje && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{availability.mensaje}</AlertDescription>
            </Alert>
          )}

          {/* Horarios configurados */}
          {availability.horarios_configurados && availability.horarios_configurados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horarios Configurados ({availability.horarios_configurados.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {availability.horarios_configurados.map((horario, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                        </span>
                      </div>
                      <Badge variant="outline">Citas de {horario.duracion_cita} min</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Excepción parcial */}
          {availability.excepcion && availability.excepcion.parcial && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <strong>Excepción parcial:</strong> {availability.excepcion.motivo}
                {availability.excepcion.hora_inicio && availability.excepcion.hora_fin && (
                  <span className="block mt-1">
                    No disponible de {formatTime(availability.excepcion.hora_inicio)} a{" "}
                    {formatTime(availability.excepcion.hora_fin)}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Horarios disponibles */}
          {availability.horarios_disponibles && availability.horarios_disponibles.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Horarios Disponibles
                  <Badge variant="secondary" className="ml-2">
                    {availability.horarios_disponibles.filter((slot) => slot.disponible).length} disponibles
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {availability.horarios_disponibles.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border text-center ${
                        slot.disponible
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-gray-50 border-gray-200 text-gray-500"
                      }`}
                    >
                      <div className="font-medium">{formatTime(slot.hora)}</div>
                      <div className="text-xs mt-1">{slot.duracion} min</div>
                      {slot.disponible ? (
                        <CheckCircle className="h-3 w-3 mx-auto mt-1 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 mx-auto mt-1 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>No hay horarios disponibles para la fecha seleccionada.</AlertDescription>
            </Alert>
          )}

          {/* Citas existentes */}
          {availability.citas_existentes && availability.citas_existentes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Citas Programadas
                  <Badge variant="secondary" className="ml-2">
                    {availability.citas_existentes.length} citas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availability.citas_existentes.map((cita, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{formatTime(cita.fecha_hora)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{cita.duracion} min</Badge>
                        <Badge variant={cita.estado === "programada" ? "default" : "secondary"}>{cita.estado}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Disponibilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {availability.horarios_disponibles?.filter((slot) => slot.disponible).length || 0}
                  </div>
                  <div className="text-sm text-green-700">Slots Disponibles</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{availability.citas_existentes?.length || 0}</div>
                  <div className="text-sm text-blue-700">Citas Programadas</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {availability.horarios_configurados?.length || 0}
                  </div>
                  <div className="text-sm text-gray-700">Bloques de Horario</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{availability.excepcion ? 1 : 0}</div>
                  <div className="text-sm text-orange-700">Excepciones</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
