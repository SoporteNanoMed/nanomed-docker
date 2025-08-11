"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Users,
  UserCheck,
  Calendar,
  FileText,
  Activity,
  TrendingUp,
  AlertCircle,
  Shield,
  BarChart3,
} from "lucide-react"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { hasPermission } from "@/lib/utils/permissions"
import Link from "next/link"

// Datos de ejemplo para estadísticas
const mockStats = {
  totalUsers: 1250,
  totalDoctors: 45,
  totalAppointments: 3420,
  totalExams: 2180,
  dailyAppointments: 28,
  pendingAppointments: 15,
  completedAppointments: 3405,
  totalPatients: 1180,
  totalReceptionists: 12,
  totalAdministrators: 3,
}

const mockDailyStats = [
  {
    fecha: "2024-01-15",
    total_citas: 32,
    citas_completadas: 28,
    citas_canceladas: 2,
    nuevos_pacientes: 5,
    examenes_realizados: 18,
  },
  {
    fecha: "2024-01-14",
    total_citas: 29,
    citas_completadas: 26,
    citas_canceladas: 1,
    nuevos_pacientes: 3,
    examenes_realizados: 15,
  },
  {
    fecha: "2024-01-13",
    total_citas: 35,
    citas_completadas: 31,
    citas_canceladas: 3,
    nuevos_pacientes: 7,
    examenes_realizados: 22,
  },
  {
    fecha: "2024-01-12",
    total_citas: 28,
    citas_completadas: 25,
    citas_canceladas: 2,
    nuevos_pacientes: 4,
    examenes_realizados: 16,
  },
  {
    fecha: "2024-01-11",
    total_citas: 31,
    citas_completadas: 29,
    citas_canceladas: 1,
    nuevos_pacientes: 6,
    examenes_realizados: 19,
  },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(mockStats)
  const [dailyStats, setDailyStats] = useState(mockDailyStats)

  // Verificar permisos
  const canViewStats = hasPermission(user, "canViewSystemStats")
  const canManageUsers = hasPermission(user, "canCreateUsers")

  useEffect(() => {
    // Simular carga de datos
    const loadData = async () => {
      setLoading(true)
      // Aquí iría la llamada real a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setLoading(false)
    }

    if (canViewStats) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [canViewStats])

  if (!canViewStats) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No tienes permisos para acceder al panel de administración.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <span className="ml-2">Cargando estadísticas del sistema...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestión y estadísticas del sistema nanoMED</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <Shield className="h-3 w-3 mr-1" />
            Administrador
          </Badge>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDoctors}</div>
            <p className="text-xs text-muted-foreground">+2 nuevos este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailyAppointments}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingAppointments} pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exámenes Totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExams.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por tipo de usuario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pacientes</CardTitle>
            <CardDescription>Usuarios registrados como pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalPatients.toLocaleString()}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+5.2% este mes</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recepcionistas</CardTitle>
            <CardDescription>Personal de recepción activo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalReceptionists}</div>
            <div className="flex items-center mt-2">
              <Activity className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm text-blue-600">Todos activos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Administradores</CardTitle>
            <CardDescription>Usuarios con permisos de administración</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.totalAdministrators}</div>
            <div className="flex items-center mt-2">
              <Shield className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600">Acceso completo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas diarias */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad de los Últimos 5 Días</CardTitle>
          <CardDescription>Resumen de la actividad diaria del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyStats.map((day, index) => (
              <div key={day.fecha} className="flex items-center justify-between p-4 border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">
                    {new Date(day.fecha).toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>{day.total_citas} citas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>{day.examenes_realizados} exámenes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>{day.nuevos_pacientes} nuevos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {canManageUsers && (
          <Link href="/dashboard/admin/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <h3 className="font-medium">Gestionar Usuarios</h3>
                  <p className="text-sm text-muted-foreground">Crear y administrar usuarios</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/dashboard/admin/stats">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <BarChart3 className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <h3 className="font-medium">Estadísticas Detalladas</h3>
                <p className="text-sm text-muted-foreground">Ver reportes completos</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/logs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <FileText className="h-8 w-8 text-orange-500 mr-4" />
              <div>
                <h3 className="font-medium">Logs del Sistema</h3>
                <p className="text-sm text-muted-foreground">Auditoría y monitoreo</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/doctors">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <UserCheck className="h-8 w-8 text-cyan-500 mr-4" />
              <div>
                <h3 className="font-medium">Gestionar Médicos</h3>
                <p className="text-sm text-muted-foreground">Administrar personal médico</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
