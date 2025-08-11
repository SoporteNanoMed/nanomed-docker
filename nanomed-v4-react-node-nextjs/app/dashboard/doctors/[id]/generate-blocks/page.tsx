"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  User,
  Settings,
  CalendarDays,
  Info,
} from "lucide-react"
import { doctorsService, type GenerateAvailabilityBlocksRequest } from "@/lib/api/services/doctors.service"
import { useDoctors } from "@/lib/api/hooks/use-doctors"

const DIAS_SEMANA = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
]

const PLANTILLAS_PREDEFINIDAS = [
  {
    id: "lunes-viernes",
    nombre: "Lunes a Viernes",
    descripcion: "Horario laboral estándar",
    config: {
      dias_semana: [1, 2, 3, 4, 5],
      hora_inicio: "09:00",
      hora_fin: "17:00",
      duracion_bloque: 30,
    },
  },
  {
    id: "lun-mie-vie",
    nombre: "Lunes, Miércoles y Viernes",
    descripcion: "Días alternos",
    config: {
      dias_semana: [1, 3, 5],
      hora_inicio: "08:00",
      hora_fin: "16:00",
      duracion_bloque: 45,
    },
  },
  {
    id: "manana",
    nombre: "Solo Mañanas",
    descripcion: "Horario matutino",
    config: {
      dias_semana: [1, 2, 3, 4, 5],
      hora_inicio: "09:00",
      hora_fin: "12:00",
      duracion_bloque: 30,
    },
  },
  {
    id: "fin-semana",
    nombre: "Fin de Semana",
    descripcion: "Sábados y domingos",
    config: {
      dias_semana: [0, 6],
      hora_inicio: "10:00",
      hora_fin: "14:00",
      duracion_bloque: 30,
    },
  },
  {
    id: "bloques-largos",
    nombre: "Bloques de 1 Hora",
    descripcion: "Consultas extensas",
    config: {
      dias_semana: [1, 2, 3, 4, 5],
      hora_inicio: "10:00",
      hora_fin: "18:00",
      duracion_bloque: 60,
    },
  },
]

export default function GenerateBlocksPage() {
  const router = useRouter()
  const params = useParams()
  const doctorId = Number.parseInt(params.id as string)

  const { doctors } = useDoctors()
  const doctor = doctors?.find((d) => d.id === doctorId)

  // Estado del formulario
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [diasSemana, setDiasSemana] = useState<number[]>([1, 2, 3, 4, 5])
  const [horaInicio, setHoraInicio] = useState("09:00")
  const [horaFin, setHoraFin] = useState("17:00")
  const [duracionBloque, setDuracionBloque] = useState("30")
  const [excluirFechas, setExcluirFechas] = useState<string[]>([])
  const [fechaExcluir, setFechaExcluir] = useState("")

  // Estados de la aplicación
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [preview, setPreview] = useState<any>(null)

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0]

  // Aplicar plantilla predefinida
  const aplicarPlantilla = (plantilla: (typeof PLANTILLAS_PREDEFINIDAS)[0]) => {
    setDiasSemana(plantilla.config.dias_semana)
    setHoraInicio(plantilla.config.hora_inicio)
    setHoraFin(plantilla.config.hora_fin)
    setDuracionBloque(plantilla.config.duracion_bloque.toString())
  }

  // Manejar selección de días de la semana
  const toggleDiaSemana = (dia: number) => {
    setDiasSemana((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia].sort()))
  }

  // Agregar fecha a excluir
  const agregarFechaExcluir = () => {
    if (fechaExcluir && !excluirFechas.includes(fechaExcluir)) {
      setExcluirFechas((prev) => [...prev, fechaExcluir].sort())
      setFechaExcluir("")
    }
  }

  // Remover fecha excluida
  const removerFechaExcluir = (fecha: string) => {
    setExcluirFechas((prev) => prev.filter((f) => f !== fecha))
  }

  // Generar vista previa
  const generarPreview = () => {
    if (!fechaInicio || !fechaFin) {
      setError("Debe seleccionar fechas de inicio y fin")
      return
    }

    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      setError("La fecha de inicio debe ser anterior a la fecha de fin")
      return
    }

    if (diasSemana.length === 0) {
      setError("Debe seleccionar al menos un día de la semana")
      return
    }

    if (horaInicio >= horaFin) {
      setError("La hora de inicio debe ser anterior a la hora de fin")
      return
    }

    // Calcular estadísticas de preview
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    const totalDias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1

    let diasValidos = 0
    const diasExcluidos = excluirFechas.length

    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      const diaSemana = d.getDay()
      const fechaStr = d.toISOString().split("T")[0]

      if (diasSemana.includes(diaSemana) && !excluirFechas.includes(fechaStr)) {
        diasValidos++
      }
    }

    // Calcular bloques por día
    const [horaInicioH, horaInicioM] = horaInicio.split(":").map(Number)
    const [horaFinH, horaFinM] = horaFin.split(":").map(Number)
    const minutosInicio = horaInicioH * 60 + horaInicioM
    const minutosFin = horaFinH * 60 + horaFinM
    const bloquesPorDia = Math.floor((minutosFin - minutosInicio) / Number.parseInt(duracionBloque))
    const totalBloques = diasValidos * bloquesPorDia

    setPreview({
      totalDias,
      diasValidos,
      diasExcluidos,
      bloquesPorDia,
      totalBloques,
      duracionTotal: totalBloques * Number.parseInt(duracionBloque),
    })

    setError("")
  }

  // Generar bloques
  const handleGenerar = async () => {
    if (!preview) {
      setError("Debe generar una vista previa primero")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const requestData: GenerateAvailabilityBlocksRequest = {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        dias_semana: diasSemana,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        duracion_bloque: Number.parseInt(duracionBloque),
        excluir_fechas: excluirFechas.length > 0 ? excluirFechas : undefined,
      }

      await doctorsService.generateAvailabilityBlocks(doctorId, requestData)
      setSuccess(`Se generaron ${preview.totalBloques} bloques de disponibilidad exitosamente`)

      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push("/dashboard/doctors")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Error al generar los bloques de disponibilidad")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generar Bloques Automáticamente</h1>
          {doctor && (
            <p className="text-gray-500">
              Para Dr. {doctor.nombre} {doctor.apellido}
            </p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Nombre:</strong> {doctor.nombre} {doctor.apellido}
                </p>
                <p>
                  <strong>Email:</strong> {doctor.email}
                </p>
              </div>
              <div>
                {doctor.telefono && (
                  <p>
                    <strong>Teléfono:</strong> {doctor.telefono}
                  </p>
                )}
                {doctor.rut && (
                  <p>
                    <strong>RUT:</strong> {doctor.rut}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="configuracion" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        {/* Plantillas predefinidas */}
        <TabsContent value="plantillas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Plantillas Predefinidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PLANTILLAS_PREDEFINIDAS.map((plantilla) => (
                  <Card key={plantilla.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{plantilla.nombre}</h4>
                        <p className="text-sm text-gray-600">{plantilla.descripcion}</p>
                        <div className="text-xs space-y-1">
                          <p>
                            <strong>Días:</strong>{" "}
                            {plantilla.config.dias_semana.map((d) => DIAS_SEMANA[d].short).join(", ")}
                          </p>
                          <p>
                            <strong>Horario:</strong> {plantilla.config.hora_inicio} - {plantilla.config.hora_fin}
                          </p>
                          <p>
                            <strong>Duración:</strong> {plantilla.config.duracion_bloque} min
                          </p>
                        </div>
                        <Button size="sm" onClick={() => aplicarPlantilla(plantilla)} className="w-full">
                          Aplicar Plantilla
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración manual */}
        <TabsContent value="configuracion">
          <div className="space-y-6">
            {/* Fechas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Rango de Fechas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                    <Input
                      id="fecha-inicio"
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      min={today}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha-fin">Fecha Fin</Label>
                    <Input
                      id="fecha-fin"
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      min={fechaInicio || today}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Días de la semana */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Días de la Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <div key={dia.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dia-${dia.value}`}
                        checked={diasSemana.includes(dia.value)}
                        onCheckedChange={() => toggleDiaSemana(dia.value)}
                      />
                      <Label htmlFor={`dia-${dia.value}`} className="text-sm">
                        {dia.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Horarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Configuración de Horarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hora-inicio">Hora Inicio</Label>
                    <Input
                      id="hora-inicio"
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hora-fin">Hora Fin</Label>
                    <Input id="hora-fin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="duracion">Duración Bloque (min)</Label>
                    <Select value={duracionBloque} onValueChange={setDuracionBloque}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                        <SelectItem value="120">120 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fechas a excluir */}
            <Card>
              <CardHeader>
                <CardTitle>Fechas a Excluir (Opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={fechaExcluir}
                      onChange={(e) => setFechaExcluir(e.target.value)}
                      min={fechaInicio || today}
                      max={fechaFin}
                      placeholder="Seleccionar fecha"
                    />
                    <Button onClick={agregarFechaExcluir} disabled={!fechaExcluir}>
                      Agregar
                    </Button>
                  </div>

                  {excluirFechas.length > 0 && (
                    <div className="space-y-2">
                      <Label>Fechas excluidas:</Label>
                      <div className="flex flex-wrap gap-2">
                        {excluirFechas.map((fecha) => (
                          <Badge key={fecha} variant="secondary" className="cursor-pointer">
                            {fecha}
                            <button
                              onClick={() => removerFechaExcluir(fecha)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vista previa */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Vista Previa y Generación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generarPreview} className="w-full md:w-auto">
                Generar Vista Previa
              </Button>

              {preview && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{preview.totalDias}</div>
                      <div className="text-sm text-blue-800">Días totales</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{preview.diasValidos}</div>
                      <div className="text-sm text-green-800">Días válidos</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{preview.bloquesPorDia}</div>
                      <div className="text-sm text-orange-800">Bloques/día</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{preview.totalBloques}</div>
                      <div className="text-sm text-purple-800">Total bloques</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Resumen de Configuración:</h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Período:</strong> {fechaInicio} al {fechaFin}
                      </p>
                      <p>
                        <strong>Días:</strong> {diasSemana.map((d) => DIAS_SEMANA[d].short).join(", ")}
                      </p>
                      <p>
                        <strong>Horario:</strong> {horaInicio} - {horaFin}
                      </p>
                      <p>
                        <strong>Duración por bloque:</strong> {duracionBloque} minutos
                      </p>
                      <p>
                        <strong>Tiempo total disponible:</strong> {Math.floor(preview.duracionTotal / 60)}h{" "}
                        {preview.duracionTotal % 60}m
                      </p>
                      {excluirFechas.length > 0 && (
                        <p>
                          <strong>Fechas excluidas:</strong> {excluirFechas.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleGenerar} disabled={loading} className="w-full" size="lg">
                    {loading ? "Generando..." : `Generar ${preview.totalBloques} Bloques`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Información
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Los bloques se generan automáticamente según la configuración especificada.</p>
            <p>• Puede usar plantillas predefinidas o configurar manualmente todos los parámetros.</p>
            <p>• Las fechas excluidas no generarán bloques (útil para días festivos o vacaciones).</p>
            <p>• La vista previa muestra estadísticas antes de generar los bloques definitivos.</p>
            <p>• Todos los bloques generados estarán marcados como disponibles por defecto.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
