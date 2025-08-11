"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TrendingUp, Calendar, Users, FileText, Activity, Download, RefreshCw, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { hasPermission } from "@/lib/utils/permissions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Datos de ejemplo para estadísticas detalladas
const mockDetailedStats = {
  overview: {
    totalUsers: 1250,
    totalDoctors: 45,
    totalAppointments: 3420,
    totalExams: 2180,
    growthRate: 12.5,
    activeUsers: 1180,
    newUsersThisMonth: 85,
    appointmentsThisMonth: 420,
    examsThisMonth: 280,
  },
  monthlyData: [
    { month: "Enero", users: 1100, appointments: 380, exams: 250, revenue: 45000 },
    { month: "Febrero", users: 1150, appointments: 395, exams: 265, revenue: 47500 },
    { month: "Marzo", users: 1200, appointments: 410, exams: 275, revenue: 49200 },
    { month: "Abril", users: 1250, appointments: 420, exams: 280, revenue: 51000 },
  ],
  usersByRole: [
    { role: "Pacientes", count: 1180, percentage: 94.4 },
    { role: "Médicos", count: 45, percentage: 3.6 },
    { role: "Recepcionistas", count: 12, percentage: 1.0 },
    { role: "Administradores", count: 13, percentage: 1.0 },
  ],
  appointmentsByStatus: [
    { status: "Completadas", count: 3200, percentage: 93.6 },
    { status: "Programadas", count: 180, percentage: 5.3 },
    { status: "Canceladas", count: 40, percentage: 1.1 },
  ],
  topDoctors: [
    { name: "Dr. Carlos Mendoza", appointments: 145, rating: 4.9 },
    { name: "Dra. Ana Soto", appointments: 132, rating: 4.8 },
    { name: "Dr. Roberto Gómez", appointments: 128, rating: 4.7 },
    { name: "Dra. Patricia Vega", appointments: 115, rating: 4.8 },
    { name: "Dr. Fernando Torres", appointments: 98, rating: 4.6 },
  ],
  systemHealth: {
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.02,
    activeConnections: 156,
  },
}

export default function AdminStatsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(mockDetailedStats)
  const [timeRange, setTimeRange] = useState("month")
  const [refreshing, setRefreshing] = useState(false)

  // Verificar permisos
  const canViewStats = hasPermission(user, "canViewSystemStats")

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStats(mockDetailedStats)
      setLoading(false)
    }

    if (canViewStats) {
      loadStats()
    } else {
      setLoading(false)
    }
  }, [canViewStats, timeRange])

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const handleExport = () => {
    // Aquí iría la lógica para exportar estadísticas
  }

  if (!canViewStats) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No tienes permisos para ver las estadísticas del sistema.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <span className="ml-2">Cargando estadísticas detalladas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estadísticas Detalladas</h1>
          <p className="text-gray-500">Análisis completo del sistema nanoMED</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+{stats.overview.newUsersThisMonth} este mes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.appointmentsThisMonth}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+{stats.overview.growthRate}% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exámenes del Mes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.examsThisMonth}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.5% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.activeUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-green-500">
                {((stats.overview.activeUsers / stats.overview.totalUsers) * 100).toFixed(1)}% del total
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendencias mensuales */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias Mensuales</CardTitle>
          <CardDescription>Evolución de usuarios, citas y exámenes por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.monthlyData.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="font-medium">{month.month}</div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>{month.users} usuarios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{month.appointments} citas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>{month.exams} exámenes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>${month.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribución por roles y estados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios por Rol</CardTitle>
            <CardDescription>Distribución de usuarios según su rol en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.usersByRole.map((role) => (
                <div key={role.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{role.role}</div>
                    <Badge variant="outline">{role.count}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${role.percentage}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-500">{role.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Citas por Estado</CardTitle>
            <CardDescription>Distribución de citas según su estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.appointmentsByStatus.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{status.status}</div>
                    <Badge variant="outline">{status.count}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status.status === "Completadas"
                            ? "bg-green-500"
                            : status.status === "Programadas"
                              ? "bg-blue-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${status.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{status.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top médicos y salud del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Médicos Más Activos</CardTitle>
            <CardDescription>Médicos con mayor número de citas atendidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topDoctors.map((doctor, index) => (
                <div key={doctor.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{doctor.name}</div>
                      <div className="text-sm text-gray-500">{doctor.appointments} citas</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">{doctor.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salud del Sistema</CardTitle>
            <CardDescription>Métricas de rendimiento y disponibilidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Tiempo de actividad</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {stats.systemHealth.uptime}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Tiempo de respuesta</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {stats.systemHealth.responseTime}ms
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Tasa de errores</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {stats.systemHealth.errorRate}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Conexiones activas</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    {stats.systemHealth.activeConnections}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
