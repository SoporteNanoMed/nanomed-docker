"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Calendar,
  Phone,
  Mail,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Datos de prueba para recepcionistas
const mockReceptionists = [
  {
    id: 1,
    name: "María Fernández",
    email: "maria.fernandez@nanomed.cl",
    phone: "+56 9 8765 4321",
    position: "Recepcionista Senior",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    experience: "5 años",
    shift: "Mañana",
    schedule: "Lun-Vie 07:00-15:00",
    patientsAttended: 1250,
    appointmentsToday: 28,
    efficiency: 95,
    joinDate: "2019-03-15",
    department: "Recepción Principal",
    languages: ["Español", "Inglés"],
  },
  {
    id: 2,
    name: "Carmen López",
    email: "carmen.lopez@nanomed.cl",
    phone: "+56 9 7654 3210",
    position: "Recepcionista",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    experience: "3 años",
    shift: "Tarde",
    schedule: "Lun-Vie 15:00-23:00",
    patientsAttended: 890,
    appointmentsToday: 22,
    efficiency: 92,
    joinDate: "2021-07-22",
    department: "Recepción Principal",
    languages: ["Español"],
  },
  {
    id: 3,
    name: "Patricia Morales",
    email: "patricia.morales@nanomed.cl",
    phone: "+56 9 6543 2109",
    position: "Recepcionista",
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
    experience: "2 años",
    shift: "Mañana",
    schedule: "Mar-Sab 08:00-16:00",
    patientsAttended: 567,
    appointmentsToday: 0,
    efficiency: 88,
    joinDate: "2022-01-10",
    department: "Recepción Especialidades",
    languages: ["Español", "Francés"],
  },
  {
    id: 4,
    name: "Andrea Silva",
    email: "andrea.silva@nanomed.cl",
    phone: "+56 9 5432 1098",
    position: "Recepcionista Junior",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    experience: "1 año",
    shift: "Fin de Semana",
    schedule: "Sab-Dom 08:00-20:00",
    patientsAttended: 234,
    appointmentsToday: 15,
    efficiency: 85,
    joinDate: "2023-09-01",
    department: "Recepción Urgencias",
    languages: ["Español", "Inglés", "Portugués"],
  },
  {
    id: 5,
    name: "Rosa Herrera",
    email: "rosa.herrera@nanomed.cl",
    phone: "+56 9 4321 0987",
    position: "Recepcionista Senior",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    experience: "7 años",
    shift: "Noche",
    schedule: "Lun-Vie 23:00-07:00",
    patientsAttended: 1456,
    appointmentsToday: 8,
    efficiency: 97,
    joinDate: "2017-11-15",
    department: "Recepción Principal",
    languages: ["Español", "Inglés"],
  },
]

const shifts = ["Todos", "Mañana", "Tarde", "Noche", "Fin de Semana"]
const departments = ["Todos", "Recepción Principal", "Recepción Especialidades", "Recepción Urgencias"]

export default function AdminReceptionistsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedShift, setSelectedShift] = useState("Todos")
  const [selectedDepartment, setSelectedDepartment] = useState("Todos")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredReceptionists = mockReceptionists.filter((receptionist) => {
    const matchesSearch =
      receptionist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receptionist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receptionist.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesShift = selectedShift === "Todos" || receptionist.shift === selectedShift
    const matchesDepartment = selectedDepartment === "Todos" || receptionist.department === selectedDepartment
    const matchesStatus = statusFilter === "all" || receptionist.status === statusFilter

    return matchesSearch && matchesShift && matchesDepartment && matchesStatus
  })

  const activeCount = mockReceptionists.filter((r) => r.status === "active").length
  const inactiveCount = mockReceptionists.filter((r) => r.status === "inactive").length
  const totalPatientsAttended = mockReceptionists.reduce((sum, r) => sum + r.patientsAttended, 0)
  const avgEfficiency = Math.round(
    mockReceptionists.reduce((sum, r) => sum + r.efficiency, 0) / mockReceptionists.length,
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Recepcionistas</h1>
          <p className="text-muted-foreground">Administra el personal de recepción del centro</p>
        </div>
        <Link href="/dashboard/admin/receptionists/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Recepcionista
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recepcionistas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReceptionists.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCount} activas, {inactiveCount} inactivas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Atendidos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatientsAttended.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total histórico</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency}%</div>
            <p className="text-xs text-muted-foreground">Rendimiento general</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockReceptionists.reduce((sum, r) => sum + r.appointmentsToday, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Gestionadas hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o posición..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Turno" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((shift) => (
                  <SelectItem key={shift} value={shift}>
                    {shift}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Receptionists List */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Vista de Tarjetas</TabsTrigger>
          <TabsTrigger value="table">Vista de Tabla</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReceptionists.map((receptionist) => (
              <Card key={receptionist.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={receptionist.avatar || "/placeholder.svg"} alt={receptionist.name} />
                        <AvatarFallback>
                          {receptionist.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{receptionist.name}</CardTitle>
                        <CardDescription>{receptionist.position}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/admin/receptionists/${receptionist.id}`}>Ver Detalles</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/admin/receptionists/${receptionist.id}/edit`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {receptionist.status === "active" ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={receptionist.status === "active" ? "default" : "secondary"}>
                      {receptionist.status === "active" ? "Activa" : "Inactiva"}
                    </Badge>
                    <Badge variant="outline">{receptionist.shift}</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{receptionist.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{receptionist.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{receptionist.schedule}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{receptionist.department}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-sm font-semibold">{receptionist.patientsAttended}</div>
                      <div className="text-xs text-muted-foreground">Pacientes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold">{receptionist.appointmentsToday}</div>
                      <div className="text-xs text-muted-foreground">Citas Hoy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold">{receptionist.efficiency}%</div>
                      <div className="text-xs text-muted-foreground">Eficiencia</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {receptionist.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Recepcionista</th>
                      <th className="text-left p-4">Posición</th>
                      <th className="text-left p-4">Contacto</th>
                      <th className="text-left p-4">Turno</th>
                      <th className="text-left p-4">Estado</th>
                      <th className="text-left p-4">Eficiencia</th>
                      <th className="text-left p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceptionists.map((receptionist) => (
                      <tr key={receptionist.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={receptionist.avatar || "/placeholder.svg"} alt={receptionist.name} />
                              <AvatarFallback>
                                {receptionist.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{receptionist.name}</div>
                              <div className="text-sm text-muted-foreground">{receptionist.experience}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{receptionist.position}</td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>{receptionist.email}</div>
                            <div className="text-muted-foreground">{receptionist.phone}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{receptionist.shift}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={receptionist.status === "active" ? "default" : "secondary"}>
                            {receptionist.status === "active" ? "Activa" : "Inactiva"}
                          </Badge>
                        </td>
                        <td className="p-4">{receptionist.efficiency}%</td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/admin/receptionists/${receptionist.id}`}>Ver Detalles</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/admin/receptionists/${receptionist.id}/edit`}>Editar</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {receptionist.status === "active" ? "Desactivar" : "Activar"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredReceptionists.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron recepcionistas</h3>
            <p className="text-muted-foreground">Intenta ajustar los filtros o crear una nueva recepcionista.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
