"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Calendar, Clock, FileText, Phone, Mail } from "lucide-react"

// Mock data
const mockCitaDetalle = {
  id: 1,
  paciente: {
    nombre: "Ana García",
    edad: 35,
    telefono: "+56 9 8765 4321",
    email: "ana.garcia@email.com",
    rut: "12.345.678-9",
  },
  fecha: "2024-01-15",
  hora: "09:00",
  tipo: "Consulta General",
  estado: "Confirmada",
  motivo: "Control rutinario",
  duracion: "30 min",
  notas: "Paciente refiere sentirse bien en general. Solicita control de presión arterial.",
  historialMedico: "Hipertensión controlada con medicamentos",
  medicamentos: ["Losartán 50mg", "Amlodipino 5mg"],
  alergias: "Penicilina",
  observaciones: "",
}

export default function CitaDetallePage({ params }: { params: { id: string } }) {
  const [cita, setCita] = useState(mockCitaDetalle)
  const [nuevoEstado, setNuevoEstado] = useState(cita.estado)
  const [observaciones, setObservaciones] = useState(cita.observaciones)

  const handleActualizarEstado = () => {
    setCita((prev) => ({ ...prev, estado: nuevoEstado, observaciones }))
    // Aquí iría la llamada a la API
    alert("Estado de cita actualizado correctamente")
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "confirmada":
        return "default"
      case "completada":
        return "secondary"
      case "pendiente":
        return "outline"
      case "cancelada":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Detalle de Cita</h1>
        <Badge variant={getEstadoBadgeVariant(cita.estado)}>{cita.estado}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información de la Cita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Fecha</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(cita.fecha).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Hora</label>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {cita.hora} ({cita.duracion})
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo de Consulta</label>
                  <p>{cita.tipo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado Actual</label>
                  <Badge variant={getEstadoBadgeVariant(cita.estado)}>{cita.estado}</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium">Motivo de Consulta</label>
                <p className="mt-1">{cita.motivo}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Notas Iniciales</label>
                <p className="mt-1 text-muted-foreground">{cita.notas}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Nombre Completo</label>
                  <p className="text-lg">{cita.paciente.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">RUT</label>
                  <p>{cita.paciente.rut}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Edad</label>
                  <p>{cita.paciente.edad} años</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {cita.paciente.telefono}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Email</label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {cita.paciente.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Historial Médico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Antecedentes</label>
                <p className="mt-1">{cita.historialMedico}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Medicamentos Actuales</label>
                <div className="mt-1 space-y-1">
                  {cita.medicamentos.map((med, index) => (
                    <Badge key={index} variant="outline" className="mr-2">
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Alergias</label>
                <p className="mt-1 text-red-600">{cita.alergias}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actualizar Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nuevo Estado</label>
                <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Confirmada">Confirmada</SelectItem>
                    <SelectItem value="En Curso">En Curso</SelectItem>
                    <SelectItem value="Completada">Completada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Observaciones</label>
                <Textarea
                  placeholder="Agregar observaciones sobre la cita..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleActualizarEstado} className="w-full">
                Actualizar Estado
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Reprogramar Cita
              </Button>
              <Button variant="outline" className="w-full">
                Enviar Recordatorio
              </Button>
              <Button variant="outline" className="w-full">
                Ver Historial Completo
              </Button>
              <Button variant="outline" className="w-full">
                Generar Receta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
