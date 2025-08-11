"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Search, Plus, Edit, Trash2, UserCheck, UserX, AlertCircle, Download } from "lucide-react"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { hasPermission, getRoleName } from "@/lib/utils/permissions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { User, CreateUserRequest } from "@/lib/api/types"

// Datos de ejemplo
const mockUsers: User[] = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@email.com",
    telefono: "+56912345678",
    rut: "12.345.678-9",
    role: "user",
    email_verified: true,
    activo: true,
    creado_en: "2024-01-15T10:30:00Z",
    ultimo_acceso: "2024-01-20T14:22:00Z",
  },
  {
    id: 2,
    nombre: "María",
    apellido: "González",
    email: "maria.gonzalez@nanomed.cl",
    telefono: "+56987654321",
    rut: "98.765.432-1",
    role: "medico",
    email_verified: true,
    activo: true,
    creado_en: "2024-01-10T09:15:00Z",
    ultimo_acceso: "2024-01-20T16:45:00Z",
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "carlos.rodriguez@nanomed.cl",
    telefono: "+56911223344",
    rut: "11.223.344-5",
    role: "recepcionista",
    email_verified: true,
    activo: true,
    creado_en: "2024-01-08T11:20:00Z",
    ultimo_acceso: "2024-01-20T13:10:00Z",
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "Martínez",
    email: "ana.martinez@nanomed.cl",
    telefono: "+56955667788",
    rut: "55.667.788-9",
    role: "admin",
    email_verified: true,
    activo: true,
    creado_en: "2024-01-05T08:00:00Z",
    ultimo_acceso: "2024-01-20T17:30:00Z",
  },
  {
    id: 5,
    nombre: "Pedro",
    apellido: "Silva",
    email: "pedro.silva@email.com",
    telefono: "+56933445566",
    rut: "33.445.566-7",
    role: "user",
    email_verified: false,
    activo: false,
    creado_en: "2024-01-18T15:45:00Z",
    ultimo_acceso: null,
  },
]

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rut: "",
    telefono: "",
    role: "user",
    activo: true,
  })

  // Verificar permisos
  const canManageUsers = hasPermission(user, "canViewAllUsers")
  const canCreateUsers = hasPermission(user, "canCreateUsers")
  const canUpdateUsers = hasPermission(user, "canUpdateUsers")
  const canDeleteUsers = hasPermission(user, "canDeleteUsers")

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
      setLoading(false)
    }

    if (canManageUsers) {
      loadUsers()
    } else {
      setLoading(false)
    }
  }, [canManageUsers])

  // Filtrar usuarios
  useEffect(() => {
    let filtered = users

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.rut?.includes(searchTerm),
      )
    }

    // Filtro por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((user) => user.activo)
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((user) => !user.activo)
      } else if (statusFilter === "verified") {
        filtered = filtered.filter((user) => user.email_verified)
      } else if (statusFilter === "unverified") {
        filtered = filtered.filter((user) => !user.email_verified)
      }
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const handleCreateUser = async () => {
    // Aquí iría la llamada a la API para crear el usuario
    console.log("Crear usuario:", newUser)
    setCreateDialogOpen(false)
    // Reset form
    setNewUser({
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      rut: "",
      telefono: "",
      role: "user",
      activo: true,
    })
  }

  const handleToggleUserStatus = async (userId: number) => {
    // Aquí iría la llamada a la API para cambiar el estado del usuario
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, activo: !user.activo } : user)))
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Nunca"
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!canManageUsers) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No tienes permisos para gestionar usuarios.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <span className="ml-2">Cargando usuarios...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra todos los usuarios del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {canCreateUsers && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Completa la información para crear un nuevo usuario en el sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={newUser.nombre}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, nombre: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        value={newUser.apellido}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, apellido: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rut">RUT</Label>
                      <Input
                        id="rut"
                        value={newUser.rut}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, rut: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={newUser.telefono}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, telefono: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: any) => setNewUser((prev) => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Paciente</SelectItem>
                        <SelectItem value="medico">Médico</SelectItem>
                        <SelectItem value="recepcionista">Recepcionista</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser} className="bg-cyan-500 hover:bg-cyan-600">
                    Crear Usuario
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o RUT..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="user">Pacientes</SelectItem>
                <SelectItem value="medico">Médicos</SelectItem>
                <SelectItem value="recepcionista">Recepcionistas</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="verified">Verificados</SelectItem>
                <SelectItem value="unverified">No verificados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredUsers.length}</div>
            <p className="text-sm text-gray-500">Total usuarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{filteredUsers.filter((u) => u.activo).length}</div>
            <p className="text-sm text-gray-500">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredUsers.filter((u) => u.email_verified).length}
            </div>
            <p className="text-sm text-gray-500">Verificados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {filteredUsers.filter((u) => u.role === "medico").length}
            </div>
            <p className="text-sm text-gray-500">Médicos</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
          <CardDescription>Lista completa de usuarios registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-medium">
                    {user.nombre[0]}
                    {user.apellido[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {user.nombre} {user.apellido}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {getRoleName(user.role)}
                      </Badge>
                      {user.email_verified && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                          Verificado
                        </Badge>
                      )}
                      {!user.activo && (
                        <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      RUT: {user.rut} | Último acceso: {formatDate(user.ultimo_acceso)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canUpdateUsers && (
                    <Button variant="outline" size="sm" onClick={() => handleToggleUserStatus(user.id)}>
                      {user.activo ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>
                  )}
                  {canUpdateUsers && (
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDeleteUsers && user.role !== "admin" && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron usuarios con los filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
