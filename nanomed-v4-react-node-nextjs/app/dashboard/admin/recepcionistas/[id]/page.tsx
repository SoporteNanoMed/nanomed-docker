"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Phone, Mail, Calendar, Clock, TrendingUp, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Datos de prueba para recepcionista específica
const mockRecepcionista = {
  id: 1,
  nombre: "María González",
  email: "maria.gonzalez@nanomed.cl",
  telefono: "+56 9 8765 4321",
  estado: "activo",
  fechaIngreso: "2023-01-15",
  turno: "mañana",
  avatar: "/placeholder.svg?height=100&width=100&text=MG",
  ultimaActividad: "2024-01-15 14:30",
  citasAtendidas: 156,
  experiencia: "2 años",
  direccion: "Av. Providencia 1234, Santiago",
  rut: "12.345.678-9",
  fechaNacimiento: "1990-05-15",
  estadoCivil: "Soltera",
  contactoEmergencia: {
    nombre: "Pedro González",
    telefono: "+56 9 1234 5678",
    relacion: "Hermano",
  },
  horarios: {
    lunes: "08:00 - 14:00",
    martes: "08:00 - 14:00",
    miercoles: "08:00 - 14:00",
    jueves: "08:00 - 14:00",
    viernes: "08:00 - 14:00",
    sabado: "Libre",
    domingo: "Libre",
  },
  estadisticas: {
    citasHoy: 12,
    citasSemana: 67,
    citasMes: 289,
    promedioAtencion: "3.5 min",
    satisfaccion: 4.8,
    puntualidad: 98,
  },
}

const mockCitasRecientes = [
  {
    id: 1,
    paciente: "Juan Pérez",
    medico: "Dr. Carlos Ruiz",
    fecha: "2024-01-15",
    hora: "09:30",
    estado: "completada",
    tipo: "Consulta General",
  },
  {
    id: 2,
    paciente: "Ana Silva",
    medico: "Dra. María López",
    fecha: "2024-01-15",
    hora: "10:15",
    estado: "completada",
    tipo: "Control",
  },
  {
    id: 3,
    paciente: "Pedro Morales",
    medico: "Dr. Luis García",
    fecha: "2024-01-15",
    hora: "11:00",
    estado: "cancelada",
    tipo: "Examen",
  },
  {
    id: 4,
    paciente: "Carmen Rodríguez",
    medico: "Dra. Elena Vargas",
    fecha: "2024-01-15",
    hora: "11:45",
    estado: "completada",
    tipo: "Consulta Especializada",
  },
]

export default function RecepcionistaDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("general")

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "activo":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case "inactivo":
        return <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{estado}</Badge>
    }
  }

  const getEstadoCitaBadge = (estado: string) => {
    switch (estado) {
      case "completada":
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/admin/recepcionistas">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detalle de Recepcionista</h1>
            <p className="text-gray-600 mt-1">Información completa del personal</p>
          </div>
        </div>
        <Link href={`/dashboard/admin/recepcionistas/${params.id}/editar`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={mockRecepcionista.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">
                {mockRecepcionista.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">{mockRecepcionista.nombre}</h2>
                {getEstadoBadge(mockRecepcionista.estado)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {mockRecepcionista.email}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {mockRecepcionista.telefono}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  Ingreso: {mockRecepcionista.fechaIngreso}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  Turno: {mockRecepcionista.turno}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Citas Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{mockRecepcionista.estadisticas.citasHoy}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-green-600">{mockRecepcionista.estadisticas.citasSemana}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold text-purple-600">{mockRecepcionista.estadisticas.citasMes}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfacción</p>
                <p className="text-2xl font-bold text-orange-600">{mockRecepcionista.estadisticas.satisfaccion}/5</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos Personales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">RUT</label>
                  <p className="text-sm">{mockRecepcionista.rut}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                  <p className="text-sm">{mockRecepcionista.fechaNacimiento}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado Civil</label>
                  <p className="text-sm">{mockRecepcionista.estadoCivil}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dirección</label>
                  <p className="text-sm">{mockRecepcionista.direccion}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contacto de Emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-sm">{mockRecepcionista.contactoEmergencia.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-sm">{mockRecepcionista.contactoEmergencia.telefono}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Relación</label>
                  <p className="text-sm">{mockRecepcionista.contactoEmergencia.relacion}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="horarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mockRecepcionista.horarios).map(([dia, horario]) => (
                  <div key={dia} className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="font-medium capitalize">{dia}</span>
                    <span className={horario === "Libre" ? "text-gray-500" : "text-green-600"}>{horario}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Promedio de Atención</label>
                  <p className="text-lg font-semibold">{mockRecepcionista.estadisticas.promedioAtencion}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Puntualidad</label>
                  <p className="text-lg font-semibold text-green-600">{mockRecepcionista.estadisticas.puntualidad}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfacción del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{mockRecepcionista.estadisticas.satisfaccion}</p>
                  <p className="text-sm text-gray-500">de 5 estrellas</p>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < Math.floor(mockRecepcionista.estadisticas.satisfaccion) ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{mockRecepcionista.citasAtendidas}</p>
                  <p className="text-sm text-gray-500">citas atendidas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actividad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Citas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCitasRecientes.map((cita) => (
                  <div key={cita.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{cita.paciente}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-sm text-gray-600">{cita.medico}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{cita.fecha}</span>
                        <span>{cita.hora}</span>
                        <span>{cita.tipo}</span>
                      </div>
                    </div>
                    <div>{getEstadoCitaBadge(cita.estado)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
