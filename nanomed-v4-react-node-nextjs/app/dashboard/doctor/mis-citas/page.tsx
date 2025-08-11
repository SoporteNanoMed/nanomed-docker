"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Search, Filter } from "lucide-react"

// Mock data
const mockCitas = [
  {
    id: 1,
    paciente: "Ana García",
    fecha: "2024-01-15",
    hora: "09:00",
    tipo: "Consulta General",
    estado: "Confirmada",
    motivo: "Control rutinario",
    duracion: "30 min",
  },
  {
    id: 2,
    paciente: "Carlos López",
    fecha: "2024-01-15",
    hora: "10:30",
    tipo: "Seguimiento",
    estado: "Pendiente",
    motivo: "Revisión de exámenes",
    duracion: "45 min",
  },
  {
    id: 3,
    paciente: "María Rodríguez",
    fecha: "2024-01-16",
    hora: "14:00",
    tipo: "Primera Consulta",
    estado: "Completada",
    motivo: "Dolor de pecho",
    duracion: "60 min",
  },
  {
    id: 4,
    paciente: "Pedro Martínez",
    fecha: "2024-01-16",
    hora: "15:30",
    tipo: "Control",
    estado: "Cancelada",
    motivo: "Control post-operatorio",
    duracion: "30 min",
  },
]

export default function MisCitasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [citas] = useState(mockCitas)

  const filteredCitas = citas.filter((cita) => {
    const matchesSearch =
      cita.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.motivo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filtroEstado === "todos" || cita.estado.toLowerCase() === filtroEstado.toLowerCase()
    return matchesSearch && matchesEstado
  })

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mis Citas</h1>
        <Button>Nueva Cita</Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredCitas.map((cita) => (
          <Card key={cita.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">{cita.paciente}</span>
                    </div>
                    <Badge variant={getEstadoBadgeVariant(cita.estado)}>{cita.estado}</Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(cita.fecha).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {cita.hora} ({cita.duracion})
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Tipo:</strong> {cita.tipo}
                    </p>
                    <p className="text-sm">
                      <strong>Motivo:</strong> {cita.motivo}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/dashboard/doctor/mis-citas/${cita.id}`)}
                  >
                    Ver Detalle
                  </Button>
                  {cita.estado === "Pendiente" && <Button size="sm">Confirmar</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCitas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No se encontraron citas con los filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
