"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, UserCheck, UserX, Phone, Mail, Calendar } from "lucide-react"
import Link from "next/link"

// Datos de prueba para recepcionistas
const mockRecepcionistas = [
  {
    id: 1,
    nombre: "María González",
    email: "maria.gonzalez@nanomed.cl",
    telefono: "+56 9 8765 4321",
    estado: "activo",
    fechaIngreso: "2023-01-15",
    turno: "mañana",
    avatar: "/placeholder.svg?height=40&width=40&text=MG",
    ultimaActividad: "2024-01-15 14:30",
    citasAtendidas: 156,
    experiencia: "2 años",
  },
  {
    id: 2,
    nombre: "Carmen Silva",
    email: "carmen.silva@nanomed.cl",
    telefono: "+56 9 7654 3210",
    estado: "activo",
    fechaIngreso: "2022-08-20",
    turno: "tarde",
    avatar: "/placeholder.svg?height=40&width=40&text=CS",
    ultimaActividad: "2024-01-15 16:45",
    citasAtendidas: 298,
    experiencia: "3 años",
  },
  {
    id: 3,
    nombre: "Ana Rodríguez",
    email: "ana.rodriguez@nanomed.cl",
    telefono: "+56 9 6543 2109",
    estado: "inactivo",
    fechaIngreso: "2023-06-10",
    turno: "mañana",
    avatar: "/placeholder.svg?height=40&width=40&text=AR",
    ultimaActividad: "2024-01-10 12:15",
    citasAtendidas: 89,
    experiencia: "1 año",
  },
  {
    id: 4,
    nombre: "Patricia Morales",
    email: "patricia.morales@nanomed.cl",
    telefono: "+56 9 5432 1098",
    estado: "activo",
    fechaIngreso: "2021-03-05",
    turno: "completo",
    avatar: "/placeholder.svg?height=40&width=40&text=PM",
    ultimaActividad: "2024-01-15 17:20",
    citasAtendidas: 445,
    experiencia: "4 años",
  },
  {
    id: 5,
    nombre: "Lucía Herrera",
    email: "lucia.herrera@nanomed.cl",
    telefono: "+56 9 4321 0987",
    estado: "activo",
    fechaIngreso: "2023-11-01",
    turno: "tarde",
    avatar: "/placeholder.svg?height=40&width=40&text=LH",
    ultimaActividad: "2024-01-15 15:10",
    citasAtendidas: 67,
    experiencia: "6 meses",
  },
]

export default function RecepcionistasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  const recepcionistasFiltradas = mockRecepcionistas.filter((recepcionista) => {
    const matchesSearch =
      recepcionista.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recepcionista.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filtroEstado === "todos" || recepcionista.estado === filtroEstado
    return matchesSearch && matchesEstado
  })

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

  const getTurnoBadge = (turno: string) => {
    switch (turno) {
      case "mañana":
        return (
          <Badge variant="outline" className="text-blue-600">
            Mañana
          </Badge>
        )
      case "tarde":
        return (
          <Badge variant="outline" className="text-orange-600">
            Tarde
          </Badge>
        )
      case "completo":
        return (
          <Badge variant="outline" className="text-purple-600">
            Completo
          </Badge>
        )
      default:
        return <Badge variant="outline">{turno}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Recepcionistas</h1>
          <p className="text-gray-600 mt-1">Administra el personal de recepción</p>
        </div>
        <Link href="/dashboard/admin/recepcionistas/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Recepcionista
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recepcionistas</p>
                <p className="text-2xl font-bold">{mockRecepcionistas.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockRecepcionistas.filter((r) => r.estado === "activo").length}
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
                <p className="text-sm text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockRecepcionistas.filter((r) => r.estado === "inactivo").length}
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
                <p className="text-sm text-gray-600">Citas Atendidas</p>
                <p className="text-2xl font-bold">{mockRecepcionistas.reduce((sum, r) => sum + r.citasAtendidas, 0)}</p>
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
                placeholder="Buscar por nombre o email..."
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
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Recepcionistas ({recepcionistasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recepcionista</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Experiencia</TableHead>
                  <TableHead>Citas Atendidas</TableHead>
                  <TableHead>Última Actividad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recepcionistasFiltradas.map((recepcionista) => (
                  <TableRow key={recepcionista.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={recepcionista.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {recepcionista.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{recepcionista.nombre}</p>
                          <p className="text-sm text-gray-500">ID: {recepcionista.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {recepcionista.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {recepcionista.telefono}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getEstadoBadge(recepcionista.estado)}</TableCell>
                    <TableCell>{getTurnoBadge(recepcionista.turno)}</TableCell>
                    <TableCell>{recepcionista.experiencia}</TableCell>
                    <TableCell>
                      <span className="font-medium">{recepcionista.citasAtendidas}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{recepcionista.ultimaActividad}</span>
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
                            <Link href={`/dashboard/admin/recepcionistas/${recepcionista.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/recepcionistas/${recepcionista.id}/editar`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
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
