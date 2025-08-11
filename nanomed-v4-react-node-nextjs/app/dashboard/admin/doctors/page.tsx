"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Calendar,
  Phone,
  Mail,
  Stethoscope,
  GraduationCap,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useDoctors } from "@/lib/api/hooks/use-doctors"
import { useAuth } from "@/lib/api/hooks/use-auth"

export default function AdminDoctorsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas")
  const [statusFilter, setStatusFilter] = useState("all")

  // Hook para obtener médicos
  const { doctors, loading, error, total, refetch, searchDoctors } = useDoctors()

  // Obtener especialidades únicas de los médicos
  const specialties = useMemo(() => {
    const uniqueSpecialties = [...new Set(doctors.map((doctor) => doctor.especialidad))]
    return uniqueSpecialties.filter(Boolean).sort()
  }, [doctors])

  // Verificar permisos de administrador
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "recepcionista") {
      console.warn("Usuario sin permisos para acceder a gestión de médicos")
    }
  }, [user])

  // Filtrar médicos localmente
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch =
        doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.especialidad.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSpecialty = selectedSpecialty === "Todas" || doctor.especialidad === selectedSpecialty
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && doctor.activo) ||
        (statusFilter === "inactive" && !doctor.activo)

      return matchesSearch && matchesSpecialty && matchesStatus
    })
  }, [doctors, searchTerm, selectedSpecialty, statusFilter])

  // Aplicar filtros en la API cuando cambien
  useEffect(() => {
    const filters: any = {}

    if (selectedSpecialty !== "Todas") {
      filters.especialidad = selectedSpecialty
    }

    if (statusFilter !== "all") {
      filters.activo = statusFilter === "active"
    }

    if (searchTerm) {
      filters.nombre = searchTerm
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchDoctors(filters)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [selectedSpecialty, statusFilter, searchTerm, searchDoctors])

  // Calcular estadísticas
  const stats = useMemo(() => {
    const activeCount = doctors.filter((d) => d.activo).length
    const inactiveCount = doctors.filter((d) => !d.activo).length

    return {
      total: doctors.length,
      active: activeCount,
      inactive: inactiveCount,
      specialties: specialties.length,
    }
  }, [doctors, specialties])

  const handleRefresh = () => {
    refetch()
  }

  if (loading && doctors.length === 0) {
    return <AdminDoctorsLoading />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Médicos</h1>
          <p className="text-muted-foreground">Administra el personal médico del centro</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          {(user?.role === "admin" || user?.role === "recepcionista") && (
            <Link href="/dashboard/admin/doctors/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Médico
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2">
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Médicos</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} activos, {stats.inactive} inactivos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.specialties}</div>
            <p className="text-xs text-muted-foreground">Disponibles en el centro</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">En la base de datos</p>
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
                  placeholder="Buscar por nombre, apellido, email o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas las especialidades</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
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
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Vista de Tarjetas</TabsTrigger>
          <TabsTrigger value="table">Vista de Tabla</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {loading && (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Cargando médicos...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={doctor.foto_perfil || "/placeholder.svg"}
                          alt={`${doctor.nombre} ${doctor.apellido}`}
                        />
                        <AvatarFallback>
                          {doctor.nombre.charAt(0)}
                          {doctor.apellido.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {doctor.nombre} {doctor.apellido}
                        </CardTitle>
                        <CardDescription>{doctor.especialidad}</CardDescription>
                      </div>
                    </div>
                    {(user?.role === "admin" || user?.role === "recepcionista") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/doctors/${doctor.id}`}>Ver Detalles</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/doctors/${doctor.id}/edit`}>Editar</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>{doctor.activo ? "Desactivar" : "Activar"}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={doctor.activo ? "default" : "secondary"}>
                      {doctor.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    {doctor.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{doctor.telefono}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-3 w-3 text-muted-foreground" />
                      <span>{doctor.especialidad}</span>
                    </div>
                  </div>

                  {doctor.disponibilidad && doctor.disponibilidad.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-1">Disponibilidad:</div>
                      <div className="text-sm">
                        {doctor.disponibilidad.slice(0, 2).map((disp, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][disp.dia_semana]}: {disp.hora_inicio} -{" "}
                              {disp.hora_fin}
                            </span>
                          </div>
                        ))}
                        {doctor.disponibilidad.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{doctor.disponibilidad.length - 2} horarios más
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                      <th className="text-left p-4">Médico</th>
                      <th className="text-left p-4">Especialidad</th>
                      <th className="text-left p-4">Contacto</th>
                      <th className="text-left p-4">Estado</th>
                      {(user?.role === "admin" || user?.role === "recepcionista") && (
                        <th className="text-left p-4">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor) => (
                      <tr key={doctor.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={doctor.foto_perfil || "/placeholder.svg"}
                                alt={`${doctor.nombre} ${doctor.apellido}`}
                              />
                              <AvatarFallback>
                                {doctor.nombre.charAt(0)}
                                {doctor.apellido.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {doctor.nombre} {doctor.apellido}
                              </div>
                              <div className="text-sm text-muted-foreground">ID: {doctor.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{doctor.especialidad}</td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>{doctor.email}</div>
                            {doctor.telefono && <div className="text-muted-foreground">{doctor.telefono}</div>}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={doctor.activo ? "default" : "secondary"}>
                            {doctor.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        {(user?.role === "admin" || user?.role === "recepcionista") && (
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/admin/doctors/${doctor.id}`}>Ver Detalles</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/admin/doctors/${doctor.id}/edit`}>Editar</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>{doctor.activo ? "Desactivar" : "Activar"}</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredDoctors.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron médicos</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedSpecialty !== "Todas" || statusFilter !== "all"
                ? "Intenta ajustar los filtros para ver más resultados."
                : "No hay médicos registrados en el sistema."}
            </p>
            {(searchTerm || selectedSpecialty !== "Todas" || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedSpecialty("Todas")
                  setStatusFilter("all")
                }}
                className="mt-4"
              >
                Limpiar Filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Componente de loading
function AdminDoctorsLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>

        <div className="h-32 bg-gray-200 rounded mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
