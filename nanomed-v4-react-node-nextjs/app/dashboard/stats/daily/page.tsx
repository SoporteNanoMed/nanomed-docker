"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Users, UserCheck, Clock, FileText, TrendingUp, Activity, DollarSign } from "lucide-react"

// Datos de ejemplo para estadísticas diarias
const mockDailyStats = {
  "2023-06-15": {
    citas: {
      total: 24,
      programadas: 18,
      completadas: 15,
      canceladas: 3,
      noShow: 2,
      porcentajeAsistencia: 83.3,
    },
    pacientes: {
      total: 22,
      nuevos: 4,
      recurrentes: 18,
      edadPromedio: 42,
    },
    medicos: {
      activos: 6,
      horasTrabajadasTotal: 48,
      promedioHorasPorMedico: 8,
    },
    examenes: {
      realizados: 12,
      pendientes: 3,
      entregados: 9,
    },
    ingresos: {
      total: 1250000,
      promedioPorCita: 52083,
      porTipoPago: {
        efectivo: 300000,
        tarjeta: 450000,
        transferencia: 500000,
      },
    },
    especialidades: {
      cardiologia: 6,
      neurologia: 4,
      traumatologia: 5,
      medicinaGeneral: 7,
      endocrinologia: 2,
    },
  },
}

export default function DailyStatsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState("dia")

  // Obtener estadísticas para la fecha seleccionada
  const dateKey = format(selectedDate, "yyyy-MM-dd")
  const stats = mockDailyStats[dateKey as keyof typeof mockDailyStats] || {
    citas: { total: 0, programadas: 0, completadas: 0, canceladas: 0, noShow: 0, porcentajeAsistencia: 0 },
    pacientes: { total: 0, nuevos: 0, recurrentes: 0, edadPromedio: 0 },
    medicos: { activos: 0, horasTrabajadasTotal: 0, promedioHorasPorMedico: 0 },
    examenes: { realizados: 0, pendientes: 0, entregados: 0 },
    ingresos: { total: 0, promedioPorCita: 0, porTipoPago: { efectivo: 0, tarjeta: 0, transferencia: 0 } },
    especialidades: { cardiologia: 0, neurologia: 0, traumatologia: 0, medicinaGeneral: 0, endocrinologia: 0 },
  }

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount)
  }

  // Función para obtener el color del indicador de tendencia
  const getTrendColor = (value: number, threshold: number) => {
    if (value >= threshold) return "text-green-600"
    if (value >= threshold * 0.8) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estadísticas Diarias</h1>
          <p className="text-gray-500">Resumen de actividad y métricas del centro médico</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Día</SelectItem>
                  <SelectItem value="semana">Semana</SelectItem>
                  <SelectItem value="mes">Mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.citas.total}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className={`mr-1 h-3 w-3 ${getTrendColor(stats.citas.total, 20)}`} />
              {stats.citas.porcentajeAsistencia.toFixed(1)}% asistencia
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pacientes.total}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <UserCheck className="mr-1 h-3 w-3 text-green-600" />
              {stats.pacientes.nuevos} nuevos pacientes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.medicos.activos}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3 text-blue-600" />
              {stats.medicos.horasTrabajadasTotal}h trabajadas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.ingresos.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              {formatCurrency(stats.ingresos.promedioPorCita)} promedio/cita
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Estado de las citas */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de las Citas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Programadas</span>
              </div>
              <span className="font-medium">{stats.citas.programadas}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Completadas</span>
              </div>
              <span className="font-medium">{stats.citas.completadas}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Canceladas</span>
              </div>
              <span className="font-medium">{stats.citas.canceladas}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm">No Show</span>
              </div>
              <span className="font-medium">{stats.citas.noShow}</span>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Porcentaje de Asistencia</span>
                <span className={`font-bold ${getTrendColor(stats.citas.porcentajeAsistencia, 80)}`}>
                  {stats.citas.porcentajeAsistencia.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exámenes */}
        <Card>
          <CardHeader>
            <CardTitle>Exámenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm">Realizados</span>
              </div>
              <span className="font-medium">{stats.examenes.realizados}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Pendientes</span>
              </div>
              <span className="font-medium">{stats.examenes.pendientes}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Entregados</span>
              </div>
              <span className="font-medium">{stats.examenes.entregados}</span>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tasa de Entrega</span>
                <span className="font-bold text-green-600">
                  {stats.examenes.realizados > 0
                    ? ((stats.examenes.entregados / stats.examenes.realizados) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribución por especialidades */}
        <Card>
          <CardHeader>
            <CardTitle>Citas por Especialidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Medicina General</span>
              <span className="font-medium">{stats.especialidades.medicinaGeneral}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Cardiología</span>
              <span className="font-medium">{stats.especialidades.cardiologia}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Traumatología</span>
              <span className="font-medium">{stats.especialidades.traumatologia}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Neurología</span>
              <span className="font-medium">{stats.especialidades.neurologia}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Endocrinología</span>
              <span className="font-medium">{stats.especialidades.endocrinologia}</span>
            </div>
          </CardContent>
        </Card>

        {/* Ingresos por tipo de pago */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Tipo de Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Efectivo</span>
              <span className="font-medium">{formatCurrency(stats.ingresos.porTipoPago.efectivo)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Tarjeta</span>
              <span className="font-medium">{formatCurrency(stats.ingresos.porTipoPago.tarjeta)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Transferencia</span>
              <span className="font-medium">{formatCurrency(stats.ingresos.porTipoPago.transferencia)}</span>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total</span>
                <span className="font-bold text-green-600">{formatCurrency(stats.ingresos.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.pacientes.edadPromedio}</div>
              <div className="text-sm text-gray-500">Edad promedio de pacientes</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.medicos.promedioHorasPorMedico}</div>
              <div className="text-sm text-gray-500">Horas promedio por médico</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.citas.total > 0 ? ((stats.pacientes.total / stats.citas.total) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-500">Eficiencia de atención</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
