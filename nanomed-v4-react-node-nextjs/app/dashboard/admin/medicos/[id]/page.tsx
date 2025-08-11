"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Phone, Mail, Calendar, TrendingUp, Users, CheckCircle, MapPin, Award } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Datos de prueba para médico específico
const mockMedico = {
  id: 1,
  nombre: "Dr. Carlos Ruiz",
  especialidad: "Cardiología",
  email: "carlos.ruiz@nanomed.cl",
  telefono: "+56 9 1111 2222",
  estado: "activo",
  fechaIngreso: "2020-03-15",
  licencia: "MED-12345",
  avatar: "/placeholder.svg?height=100&width=100&text=CR",
  ultimaActividad: "2024-01-15 16:30",
  pacientesAtendidos: 1245,
  experiencia: "15 años",
  rut: "11.222.333-4",
  fechaNacimiento: "1980-07-22",
  direccion: "Las Condes 5678, Santiago",
  universidad: "Universidad de Chile",
  anoTitulacion: "2005",
  especialidades: ["Cardiología", "Medicina Interna"],
  certificaciones: ["Ecocardiografía", "Cateterismo Cardíaco"],
  consultorio: "Consultorio 101",
  horarios: {
    lunes: "08:00 - 17:00",
    martes: "08:00 - 17:00",
    miercoles: "08:00 - 17:00",
    jueves: "08:00 - 17:00",
    viernes: "08:00 - 17:00",
    sabado: "Libre",
    domingo: "Libre",
  },
  estadisticas: {
    citasHoy: 8,
    citasSemana: 42,
    citasMes: 178,
    promedioConsulta: "25 min",
    satisfaccion: 4.9,
    puntualidad: 96,
  },
}

const mockCitasRecientes = [
  {
    id: 1,
    paciente: "Juan Pérez",
    fecha: "2024-01-15",
    hora: "09:00",
    estado: "completada",
    tipo: "Control Cardiológico",
    diagnostico: "Hipertensión controlada",
  },
  {
    id: 2,
    paciente: "Ana Silva",
    fecha: "2024-01-15",
    hora: "10:00",
    estado: "completada",
    tipo: "Primera Consulta",
    diagnostico: "Evaluación inicial",
  },
  {
    id: 3,
    paciente: "Pedro Morales",
    fecha: "2024-01-15",
    hora: "11:00",
    estado: "cancelada",
    tipo: "Ecocardiograma",
    diagnostico: "-",
  },
  {
    id: 4,
    paciente: "Carmen Rodríguez",
    fecha: "2024-01-15",
    hora: "14:00",
    estado: "completada",
    tipo: "Control Post-operatorio",
    diagnostico: "Evolución favorable",
  },
]

export default function MedicoDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("general")

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "activo":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case "inactivo":
        return <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
      case "vacaciones":
        return <Badge className="bg-yellow-100 text-yellow-800">Vacaciones</Badge>
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
          <Link href="/dashboard/admin/medicos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detalle de Médico</h1>
            <p className="text-gray-600 mt-1">Información completa del profesional</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/dashboard/admin/medicos/${params.id}/horarios`}>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Horarios
            </Button>
          </Link>
          <Link href={`/dashboard/admin/medicos/${params.id}/editar`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={mockMedico.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">
                {mockMedico.nombre
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">{mockMedico.nombre}</h2>
                {getEstadoBadge(mockMedico.estado)}
                <Badge className="bg-blue-100 text-blue-800">{mockMedico.especialidad}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {mockMedico.email}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {mockMedico.telefono}
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-gray-400" />
                  Licencia: {mockMedico.licencia}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {mockMedico.consultorio}
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
                <p className="text-2xl font-bold text-blue-600">{mockMedico.estadisticas.citasHoy}</p>
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
                <p className="text-2xl font-bold text-green-600">{mockMedico.estadisticas.citasSemana}</p>
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
                <p className="text-2xl font-bold text-purple-600">{mockMedico.estadisticas.citasMes}</p>
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
                <p className="text-2xl font-bold text-orange-600">{mockMedico.estadisticas.satisfaccion}/5</p>
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
          <TabsTrigger value="profesional">Datos Profesionales</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
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
                  <p className="text-sm">{mockMedico.rut}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                  <p className="text-sm">{mockMedico.fechaNacimiento}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dirección</label>
                  <p className="text-sm">{mockMedico.direccion}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Ingreso</label>
                  <p className="text-sm">{mockMedico.fechaIngreso}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm">{mockMedico.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-sm">{mockMedico.telefono}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Consultorio</label>
                  <p className="text-sm">{mockMedico.consultorio}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <div className="mt-1">{getEstadoBadge(mockMedico.estado)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profesional" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Formación Académica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Universidad</label>
                  <p className="text-sm">{mockMedico.universidad}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Año de Titulación</label>
                  <p className="text-sm">{mockMedico.anoTitulacion}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Experiencia</label>
                  <p className="text-sm">{mockMedico.experiencia}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Licencia Médica</label>
                  <p className="text-sm">{mockMedico.licencia}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Especialidades y Certificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Especialidades</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mockMedico.especialidades.map((esp, index) => (
                      <Badge key={index} variant="outline">
                        {esp}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Certificaciones</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mockMedico.certificaciones.map((cert, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="horarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Atención</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mockMedico.horarios).map(([dia, horario]) => (
                  <div key={dia} className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="font-medium capitalize">{dia}</span>
                    <span className={horario === "Libre" ? "text-gray-500" : "text-green-600"}>{horario}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{cita.tipo}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{cita.fecha}</span>
                        <span>{cita.hora}</span>
                        <span>{cita.diagnostico}</span>
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
