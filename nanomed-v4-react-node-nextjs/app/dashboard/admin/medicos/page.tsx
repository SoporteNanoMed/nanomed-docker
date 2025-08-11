"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  Stethoscope,
  Clock,
} from "lucide-react"
import Link from "next/link"

// Datos de prueba para médicos
const mockMedicos = [
  {
    id: 1,
    nombre: "Dr. Carlos Ruiz",
    especialidad: "Cardiología",
    email: "carlos.ruiz@nanomed.cl",
    telefono: "+56 9 1111 2222",
    estado: "activo",
    fechaIngreso: "2020-03-15",
    licencia: "MED-12345",
    avatar: "/placeholder.svg?height=40&width=40&text=CR",
    ultimaActividad: "2024-01-15 16:30",
    pacientesAtendidos: 1245,
    experiencia: "15 años",
    horarioTrabajo: "Lunes a Viernes 08:00-17:00",
    consultorio: "Consultorio 101",
  },
  {
    id: 2,
    nombre: "Dra. María López",
    especialidad: "Pediatría",
    email: "maria.lopez@nanomed.cl",
    telefono: "+56 9 2222 3333",
    estado: "activo",
    fechaIngreso: "2019-08-20",
    licencia: "MED-23456",
    avatar: "/placeholder.svg?height=40&width=40&text=ML",
    ultimaActividad: "2024-01-15 15:45",
    pacientesAtendidos: 987,
    experiencia: "12 años",
    horarioTrabajo: "Lunes a Viernes 09:00-18:00",
    consultorio: "Consultorio 102",
  },
  {
    id: 3,
    nombre: "Dr. Luis García",
    especialidad: "Traumatología",
    email: "luis.garcia@nanomed.cl",
    telefono: "+56 9 3333 4444",
    estado: "inactivo",
    fechaIngreso: "2021-01-10",
    licencia: "MED-34567",
    avatar: "/placeholder.svg?height=40&width=40&text=LG",
    ultimaActividad: "2024-01-10 14:20",
    pacientesAtendidos: 654,
    experiencia: "8 años",
    horarioTrabajo: "Lunes a Jueves 08:00-16:00",
    consultorio: "Consultorio 103",
  },
  {
    id: 4,
    nombre: "Dra. Elena Vargas",
    especialidad: "Ginecología",
    email: "elena.vargas@nanomed.cl",
    telefono: "+56 9 4444 5555",
    estado: "activo",
    fechaIngreso: "2018-05-12",
    licencia: "MED-45678",
    avatar: "/placeholder.svg?height=40&width=40&text=EV",
    ultimaActividad: "2024-01-15 17:10",
    pacientesAtendidos: 1567,
    experiencia: "18 años",
    horarioTrabajo: "Martes a Sábado 10:00-19:00",
    consultorio: "Consultorio 104",
  },
  {
    id: 5,
    nombre: "Dr. Roberto Silva",
    especialidad: "Neurología",
    email: "roberto.silva@nanomed.cl",
    telefono: "+56 9 5555 6666",
    estado: "activo",
    fechaIngreso: "2022-09-01",
    licencia: "MED-56789",
    avatar: "/placeholder.svg?height=40&width=40&text=RS",
    ultimaActividad: "2024-01-15 13:25",
    pacientesAtendidos: 234,
    experiencia: "10 años",
    horarioTrabajo: "Lunes a Miércoles 14:00-20:00",
    consultorio: "Consultorio 105",
  },
]

const especialidades = [
  "Todas", 
  "Medicina General / Médico Cirujano",
  "Tecnólogo Médico",
  "TENS",
  "Enfermería",
  "Ginecología / Médico Cirujano",
  "Nutrición y Dietética",
  "Pediatría / Médico Cirujano",
  "Dermatología / Médico Cirujano",
  "Cardiología / Médico Cirujano"
]

export default function MedicosAdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("Todas")

  const medicosFiltrados = mockMedicos.filter((medico) => {
    const matchesSearch =
      medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filtroEstado === "todos" || medico.estado === filtroEstado
    const matchesEspecialidad = filtroEspecialidad === "Todas" || medico.especialidad === filtroEspecialidad
    return matchesSearch && matchesEstado && matchesEspecialidad
  })

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

  const getEspecialidadBadge = (especialidad: string) => {
    // Extraer la especialidad principal (antes del "/")
    const especialidadPrincipal = especialidad.split('/')[0].trim()
    
    const colors = {
      "Medicina General": "bg-blue-100 text-blue-800",
      "Cardiología": "bg-red-100 text-red-800",
      "Pediatría": "bg-blue-100 text-blue-800",
      "Traumatología": "bg-green-100 text-green-800",
      "Ginecología": "bg-pink-100 text-pink-800",
      "Neurología": "bg-purple-100 text-purple-800",
      "Dermatología": "bg-orange-100 text-orange-800",
      "Tecnólogo Médico": "bg-cyan-100 text-cyan-800",
      "TENS": "bg-indigo-100 text-indigo-800",
      "Enfermería": "bg-teal-100 text-teal-800",
      "Nutrición y Dietética": "bg-emerald-100 text-emerald-800",
      "Kinesiología": "bg-lime-100 text-lime-800",
      "Fonoaudiología": "bg-amber-100 text-amber-800",
      "Matrona": "bg-rose-100 text-rose-800",
      "Psicología": "bg-violet-100 text-violet-800",
      "Medicina Interna": "bg-sky-100 text-sky-800",
      "Oftalmología": "bg-yellow-100 text-yellow-800",
      "Psiquiatría": "bg-fuchsia-100 text-fuchsia-800",
    }
    
    return (
      <Badge className={colors[especialidadPrincipal as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {especialidad}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Médicos</h1>
          <p className="text-gray-600 mt-1">Administra el personal médico</p>
        </div>
        <Link href="/dashboard/admin/medicos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Médico
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Médicos</p>
                <p className="text-2xl font-bold">{mockMedicos.length}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockMedicos.filter((m) => m.estado === "activo").length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockMedicos.filter((m) => m.estado === "inactivo").length}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pacientes Atendidos</p>
                <p className="text-2xl font-bold">{mockMedicos.reduce((sum, m) => sum + m.pacientesAtendidos, 0)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filtroEstado === "todos" ? "default" : "outline"}
                onClick={() => setFiltroEstado("todos")}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filtroEstado === "activo" ? "default" : "outline"}
                onClick={() => setFiltroEstado("activo")}
                size="sm"
              >
                Activos
              </Button>
              <Button
                variant={filtroEstado === "inactivo" ? "default" : "outline"}
                onClick={() => setFiltroEstado("inactivo")}
                size="sm"
              >
                Inactivos
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {especialidades.map((esp) => (
                <Button
                  key={esp}
                  variant={filtroEspecialidad === esp ? "default" : "outline"}
                  onClick={() => setFiltroEspecialidad(esp)}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {esp}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Médicos ({medicosFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médico</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Consultorio</TableHead>
                  <TableHead>Pacientes</TableHead>
                  <TableHead>Última Actividad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicosFiltrados.map((medico) => (
                  <TableRow key={medico.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={medico.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {medico.nombre
                              .split(" ")
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{medico.nombre}</p>
                          <p className="text-sm text-gray-500">Lic: {medico.licencia}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getEspecialidadBadge(medico.especialidad)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {medico.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {medico.telefono}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getEstadoBadge(medico.estado)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{medico.consultorio}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {medico.horarioTrabajo}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{medico.pacientesAtendidos}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{medico.ultimaActividad}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/medicos/${medico.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/medicos/${medico.id}/editar`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/medicos/${medico.id}/horarios`}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Gestionar Horarios
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
