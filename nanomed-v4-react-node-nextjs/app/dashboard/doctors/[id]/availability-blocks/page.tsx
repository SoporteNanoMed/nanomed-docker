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
import { ArrowLeft, Calendar, Clock, Plus, Trash2, AlertCircle, CheckCircle, User } from "lucide-react"
import { doctorsService, type AvailabilityBlock } from "@/lib/api/services/doctors.service"
import { useDoctors } from "@/lib/api/hooks/use-doctors"

export default function CreateAvailabilityBlocksPage() {
  const router = useRouter()
  const params = useParams()
  const doctorId = Number.parseInt(params.id as string)

  const { doctors } = useDoctors()
  const doctor = doctors?.find((d) => d.id === doctorId)

  const [selectedDate, setSelectedDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [duration, setDuration] = useState("30")
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Generar bloques automáticamente
  const generateBlocks = () => {
    if (!selectedDate || !startTime || !endTime) {
      setError("Por favor complete todos los campos requeridos")
      return
    }

    const start = new Date(`${selectedDate}T${startTime}:00`)
    const end = new Date(`${selectedDate}T${endTime}:00`)
    const durationMinutes = Number.parseInt(duration)

    if (start >= end) {
      setError("La hora de inicio debe ser anterior a la hora de fin")
      return
    }

    const newBlocks: AvailabilityBlock[] = []
    const current = new Date(start)

    while (current < end) {
      const blockEnd = new Date(current.getTime() + durationMinutes * 60000)
      if (blockEnd > end) break

      newBlocks.push({
        fecha_hora_inicio: current.toISOString(),
        fecha_hora_fin: blockEnd.toISOString(),
        disponible: true,
      })

      current.setTime(current.getTime() + durationMinutes * 60000)
    }

    setBlocks(newBlocks)
    setError("")
  }

  // Alternar disponibilidad de un bloque
  const toggleBlockAvailability = (index: number) => {
    setBlocks((prev) => prev.map((block, i) => (i === index ? { ...block, disponible: !block.disponible } : block)))
  }

  // Eliminar un bloque
  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  // Agregar bloque manual
  const addManualBlock = () => {
    if (!selectedDate) {
      setError("Seleccione una fecha primero")
      return
    }

    const newBlock: AvailabilityBlock = {
      fecha_hora_inicio: `${selectedDate}T09:00:00.000Z`,
      fecha_hora_fin: `${selectedDate}T09:30:00.000Z`,
      disponible: true,
    }

    setBlocks((prev) => [...prev, newBlock])
  }

  // Actualizar bloque manual
  const updateBlock = (index: number, field: keyof AvailabilityBlock, value: any) => {
    setBlocks((prev) => prev.map((block, i) => (i === index ? { ...block, [field]: value } : block)))
  }

  // Guardar bloques
  const handleSave = async () => {
    if (blocks.length === 0) {
      setError("Debe crear al menos un bloque de disponibilidad")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await doctorsService.createAvailabilityBlocks(doctorId, { bloques: blocks })
      setSuccess("Bloques de disponibilidad creados exitosamente")

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard/doctors")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Error al crear los bloques de disponibilidad")
    } finally {
      setLoading(false)
    }
  }

  // Formatear fecha y hora para mostrar
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Bloques de Disponibilidad</h1>
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

      {/* Generador automático de bloques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Generar Bloques Automáticamente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
              />
            </div>
            <div>
              <Label htmlFor="start-time">Hora Inicio</Label>
              <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end-time">Hora Fin</Label>
              <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="duration">Duración (min)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generateBlocks} className="w-full md:w-auto">
            <Clock className="h-4 w-4 mr-2" />
            Generar Bloques
          </Button>
        </CardContent>
      </Card>

      {/* Lista de bloques generados */}
      {blocks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bloques de Disponibilidad ({blocks.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={addManualBlock}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Manual
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {blocks.map((block, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Checkbox checked={block.disponible} onCheckedChange={() => toggleBlockAvailability(index)} />
                    <div>
                      <p className="font-medium">
                        {formatDateTime(block.fecha_hora_inicio)} - {formatDateTime(block.fecha_hora_fin)}
                      </p>
                      <Badge variant={block.disponible ? "default" : "secondary"}>
                        {block.disponible ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBlock(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>
                    Total de bloques: <strong>{blocks.length}</strong>
                  </p>
                  <p>
                    Disponibles: <strong>{blocks.filter((b) => b.disponible).length}</strong>
                  </p>
                  <p>
                    No disponibles: <strong>{blocks.filter((b) => !b.disponible).length}</strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setBlocks([])}>
                    Limpiar Todo
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Guardando..." : "Guardar Bloques"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              • Los bloques de disponibilidad permiten definir períodos específicos donde el médico puede atender
              pacientes.
            </p>
            <p>• Puede generar bloques automáticamente o agregarlos manualmente.</p>
            <p>• Use el checkbox para marcar/desmarcar la disponibilidad de cada bloque.</p>
            <p>• Los bloques marcados como "No disponible" aparecerán como ocupados en el sistema de citas.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
