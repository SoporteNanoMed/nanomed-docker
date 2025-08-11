"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { format, parseISO, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns"
import { es } from "date-fns/locale"
import { convertirUTCaChile, formatearHoraChile } from "@/lib/utils/dateUtils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Search, Filter, User, Clock, MapPin, Plus, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useReceptionistAppointments } from "@/lib/api/hooks/use-receptionist-appointments"
import { receptionistsService } from "@/lib/api/services/receptionists.service"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/api/hooks/use-auth"

export default function AllAppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [filterMedico, setFilterMedico] = useState("todos")
  const [filterFecha, setFilterFecha] = useState("todos")
  const [activeTab, setActiveTab] = useState("todas")
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null)
  const [cancellingAppointment, setCancellingAppointment] = useState(false)
  const [appointmentToConfirm, setAppointmentToConfirm] = useState<number | null>(null)
  const [confirmingAppointment, setConfirmingAppointment] = useState(false)
  const [appointmentToComplete, setAppointmentToComplete] = useState<number | null>(null)
  const [completingAppointment, setCompletingAppointment] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { toast } = useToast()
  const { user } = useAuth()

  // Obtener citas usando el hook personalizado
  const { 
    appointments, 
    loading, 
    error, 
    pagination, 
    refetch, 
    setFilters, 
    filters 
  } = useReceptionistAppointments({
    page: 1,
    limit: 100 // Cargar más citas para permitir filtrado local
  })

  // Aplicar filtros locales
  const filteredAppointments = useMemo(() => {
    return appointments.filter((cita) => {
      // Filtro por búsqueda
      const searchMatch =
        cita.paciente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.paciente_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.paciente_rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cita.medico_nombre && cita.medico_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cita.medico_apellido && cita.medico_apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cita.notas && cita.notas.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filtro por estado
      const estadoMatch = filterEstado === "todos" || cita.estado === filterEstado

      // Filtro por médico
      const medicoMatch = filterMedico === "todos" || cita.medico_id?.toString() === filterMedico

      // Filtro por fecha
      let fechaMatch = true
      const today = new Date()
      const citaDate = parseISO(cita.fecha_hora)

      if (filterFecha === "hoy") {
        fechaMatch = format(citaDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
      } else if (filterFecha === "manana") {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        fechaMatch = format(citaDate, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")
      } else if (filterFecha === "semana") {
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)
        fechaMatch = citaDate >= today && citaDate <= nextWeek
      }

      return searchMatch && estadoMatch && medicoMatch && fechaMatch
    })
  }, [appointments, searchTerm, filterEstado, filterMedico, filterFecha])

  // Filtrar por tab activo
  const appointmentsByTab = useMemo(() => ({
    todas: filteredAppointments,
    programadas: filteredAppointments.filter((cita) => cita.estado === "programada"),
    confirmadas: filteredAppointments.filter((cita) => cita.estado === "confirmada"),
    completadas: filteredAppointments.filter((cita) => cita.estado === "completada"),
    canceladas: filteredAppointments.filter((cita) => cita.estado === "cancelada"),
    calendario: filteredAppointments,
  }), [filteredAppointments])

  // Extraer médicos únicos para el filtro
  const medicos = useMemo(() => {
    const medicosMap = new Map()
    appointments.forEach((cita) => {
      if (cita.medico_id && cita.medico_nombre) {
        medicosMap.set(cita.medico_id, {
          id: cita.medico_id,
          nombre: `${cita.medico_nombre} ${cita.medico_apellido || ''}`,
        })
      }
    })
    return Array.from(medicosMap.values())
  }, [appointments])

  // Función para obtener el color del badge según el estado
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "programada":
        return "bg-blue-100 text-blue-800"
      case "confirmada":
        return "bg-green-100 text-green-800"
      case "completada":
        return "bg-cyan-100 text-cyan-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para formatear la fecha y hora
  const formatDateTime = (dateString: string) => {
    const dateChile = convertirUTCaChile(dateString)
    return {
      date: format(dateChile, "EEEE d 'de' MMMM 'de' yyyy", { locale: es }),
      time: formatearHoraChile(dateString),
    }
  }

  // Función para confirmar la cancelación de una cita
  const handleCancelAppointment = (appointmentId: number) => {
    setAppointmentToCancel(appointmentId)
  }

  // Función para manejar la confirmación de una cita
  const handleConfirmAppointment = (appointmentId: number) => {
    setAppointmentToConfirm(appointmentId)
  }

  // Función para manejar la completación de una cita
  const handleCompleteAppointment = (appointmentId: number) => {
    setAppointmentToComplete(appointmentId)
  }

  // Función para ejecutar la cancelación de la cita
  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return

    try {
      setCancellingAppointment(true)
      
      const response = await receptionistsService.cancelAppointment(appointmentToCancel)
      
      if (response.error) {
        throw new Error(response.message || "Error al cancelar la cita")
      }

      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada exitosamente.",
        variant: "default",
      })

      // Actualizar la lista de citas
      await refetch()
      
    } catch (error) {
      // Error manejado mediante toast al usuario
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cancelar la cita",
        variant: "destructive",
      })
    } finally {
      setCancellingAppointment(false)
      setAppointmentToCancel(null)
    }
  }

  // Función para ejecutar la confirmación de la cita
  const confirmConfirmAppointment = async () => {
    if (!appointmentToConfirm) return

    try {
      setConfirmingAppointment(true)
      
      const response = await receptionistsService.updateAppointment(appointmentToConfirm, {
        estado: "confirmada"
      })
      
      if (response.error) {
        throw new Error(response.message || "Error al confirmar la cita")
      }

      toast({
        title: "Cita confirmada",
        description: "La cita ha sido confirmada exitosamente.",
        variant: "default",
      })

      // Actualizar la lista de citas
      await refetch()
      
    } catch (error) {
      // Error manejado mediante toast al usuario
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo confirmar la cita",
        variant: "destructive",
      })
    } finally {
      setConfirmingAppointment(false)
      setAppointmentToConfirm(null)
    }
  }

  // Función para ejecutar la completación de la cita
  const confirmCompleteAppointment = async () => {
    if (!appointmentToComplete) return

    try {
      setCompletingAppointment(true)
      
      const response = await receptionistsService.updateAppointment(appointmentToComplete, {
        estado: "completada"
      })
      
      if (response.error) {
        throw new Error(response.message || "Error al completar la cita")
      }

      toast({
        title: "Cita completada",
        description: "La cita ha sido marcada como completada exitosamente.",
        variant: "default",
      })

      // Actualizar la lista de citas
      await refetch()
      
    } catch (error) {
      // Error manejado mediante toast al usuario
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo completar la cita",
        variant: "destructive",
      })
    } finally {
      setCompletingAppointment(false)
      setAppointmentToComplete(null)
    }
  }

  // Función para obtener citas de un día específico
  const getAppointmentsForDay = (date: Date) => {
    return appointmentsByTab.calendario.filter((cita) => {
      const citaDate = convertirUTCaChile(cita.fecha_hora)
      return isSameDay(citaDate, date)
    })
  }

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    
    // Agregar días del mes anterior para completar la semana
    const startDayOfWeek = getDay(start)
    const daysToAdd = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 // Lunes = 0
    
    const previousMonthDays = []
    for (let i = daysToAdd - 1; i >= 0; i--) {
      const prevDay = new Date(start)
      prevDay.setDate(start.getDate() - i - 1)
      previousMonthDays.push(prevDay)
    }
    
    // Agregar días del mes siguiente para completar la semana
    const endDayOfWeek = getDay(end)
    const remainingDays = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek
    
    const nextMonthDays = []
    for (let i = 1; i <= remainingDays; i++) {
      const nextDay = new Date(end)
      nextDay.setDate(end.getDate() + i)
      nextMonthDays.push(nextDay)
    }
    
    return [...previousMonthDays, ...days, ...nextMonthDays]
  }, [currentMonth])

  // Función para navegar meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentMonth(newDate)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Todas las Citas</h1>
            <p className="text-gray-500">Gestiona todas las citas del sistema</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar las citas: {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={refetch}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Todas las Citas</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Gestiona todas las citas del sistema ({pagination.total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/appointments/new">
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-0 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </Link>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Filter className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
              Filtros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por paciente, médico o notas"
                className="pl-10 bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="programada">Programada</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMedico} onValueChange={setFilterMedico}>
              <SelectTrigger className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300">
                <SelectValue placeholder="Médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los médicos</SelectItem>
                {medicos.map((medico) => (
                  <SelectItem key={medico.id} value={medico.id.toString()}>
                    {medico.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterFecha} onValueChange={setFilterFecha}>
              <SelectTrigger className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300">
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las fechas</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="manana">Mañana</SelectItem>
                <SelectItem value="semana">Próximos 7 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
              onClick={() => {
                setSearchTerm("")
                setFilterEstado("todos")
                setFilterMedico("todos")
                setFilterFecha("todos")
              }}
            >
              <Filter className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-gray-100/50 border border-gray-200 p-0 rounded-lg grid grid-cols-6 w-full h-12 overflow-hidden">
          <TabsTrigger 
            value="todas"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium rounded-l-md border-r border-gray-200/50"
          >
            Todas ({appointmentsByTab.todas.length})
          </TabsTrigger>
          <TabsTrigger 
            value="programadas"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium border-r border-gray-200/50"
          >
            Programadas ({appointmentsByTab.programadas.length})
          </TabsTrigger>
          <TabsTrigger 
            value="confirmadas"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium border-r border-gray-200/50"
          >
            Confirmadas ({appointmentsByTab.confirmadas.length})
          </TabsTrigger>
          <TabsTrigger 
            value="completadas"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium border-r border-gray-200/50"
          >
            Completadas ({appointmentsByTab.completadas.length})
          </TabsTrigger>
          <TabsTrigger 
            value="canceladas"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium border-r border-gray-200/50"
          >
            Canceladas ({appointmentsByTab.canceladas.length})
          </TabsTrigger>
          <TabsTrigger 
            value="calendario"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium rounded-r-md"
          >
            <Calendar className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Vista Calendario</span>
            <span className="sm:hidden">Calendario</span>
          </TabsTrigger>
        </TabsList>

        {/* Vista de Calendario */}
        <TabsContent value="calendario">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                    {format(currentMonth, "MMMM yyyy", { locale: es }).replace(/^\w/, c => c.toUpperCase())}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                    className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date())}
                    className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50"
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                    className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayAppointments = getAppointmentsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isToday = isSameDay(day, new Date())
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[100px] p-1 border rounded-lg transition-colors
                        ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                        ${isToday ? 'ring-2 ring-cyan-500 bg-cyan-50' : ''}
                      `}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${isToday ? 'text-cyan-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      `}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((cita) => {
                          const time = formatearHoraChile(cita.fecha_hora)
                          return (
                            <div
                              key={cita.id}
                              className={`
                                text-xs p-1 rounded truncate cursor-pointer
                                ${cita.estado === 'programada' ? 'bg-blue-100 text-blue-800' : ''}
                                ${cita.estado === 'confirmada' ? 'bg-green-100 text-green-800' : ''}
                                ${cita.estado === 'completada' ? 'bg-cyan-100 text-cyan-800' : ''}
                                ${cita.estado === 'cancelada' ? 'bg-red-100 text-red-800' : ''}
                              `}
                              title={`${time} - ${cita.paciente_nombre} ${cita.paciente_apellido}`}
                            >
                              <div className="font-medium">{time}</div>
                              <div className="truncate">{cita.paciente_nombre}</div>
                            </div>
                          )
                        })}
                        
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{dayAppointments.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Leyenda */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                  <span>Programada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                  <span>Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-100 border border-cyan-200 rounded"></div>
                  <span>Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                  <span>Cancelada</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {Object.entries(appointmentsByTab).filter(([tab]) => tab !== 'calendario').map(([tab, appointments]) => (
          <TabsContent key={tab} value={tab}>
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((cita) => {
                  const dateTime = formatDateTime(cita.fecha_hora)

                  return (
                    <div key={cita.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-[1.02] shadow-lg group-hover:shadow-2xl">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                          {/* Información principal */}
                          <div className="flex-1 space-y-4">
                            {/* Header con paciente y estado */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                                    {cita.paciente_nombre} {cita.paciente_apellido}
                                  </h3>
                                  <p className="text-sm text-gray-600">{cita.paciente_rut}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className={getBadgeColor(cita.estado)}>
                                {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                              </Badge>
                            </div>

                            {/* Información de la cita */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-lg">
                                  <Calendar className="h-4 w-4 text-[#59c3ed]" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Fecha</p>
                                  <p className="text-sm text-gray-600 capitalize">{dateTime.date}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-lg">
                                  <Clock className="h-4 w-4 text-[#59c3ed]" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Hora</p>
                                  <p className="text-sm text-gray-600">{dateTime.time} ({cita.duracion} min)</p>
                                </div>
                              </div>

                              {cita.medico_nombre && (
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-lg">
                                    <User className="h-4 w-4 text-[#59c3ed]" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Médico</p>
                                    <p className="text-sm text-gray-600">Dr. {cita.medico_nombre} {cita.medico_apellido}</p>
                                  </div>
                                </div>
                              )}

                              {cita.lugar && (
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-lg">
                                    <MapPin className="h-4 w-4 text-[#59c3ed]" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Ubicación</p>
                                    <p className="text-sm text-gray-600">
                                      {cita.lugar}
                                      {cita.direccion && ` - ${cita.direccion}`}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Información adicional */}
                            {(cita.notas || cita.paciente_telefono) && (
                              <div className="space-y-2 pt-2 border-t border-gray-200">
                                {cita.notas && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Notas</p>
                                    <p className="text-sm text-gray-600">{cita.notas}</p>
                                  </div>
                                )}
                                {cita.paciente_telefono && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Teléfono</p>
                                    <p className="text-sm text-gray-600">{cita.paciente_telefono}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Botones de acción */}
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            {user?.role === "recepcionista" ? (
                              <Button variant="outline" size="sm" className="w-full opacity-50 cursor-not-allowed bg-white/80 hover:bg-white border-gray-200" disabled title="Función disponible próximamente">
                                <span className="flex items-center gap-2">
                                  Ver Detalles
                                  <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                    Próximamente
                                  </Badge>
                                </span>
                              </Button>
                            ) : (
                              <Link href={`/dashboard/citas/${cita.id}`}>
                                <Button variant="outline" size="sm" className="w-full bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50">
                                  Ver Detalles
                                </Button>
                              </Link>
                            )}

                            {cita.estado !== "cancelada" && cita.estado !== "completada" && (
                              <>
                                {/* Botón de confirmar solo para citas programadas */}
                                {cita.estado === "programada" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full bg-green-50 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-100"
                                    onClick={() => handleConfirmAppointment(cita.id)}
                                    disabled={confirmingAppointment}
                                  >
                                    {confirmingAppointment && appointmentToConfirm === cita.id ? "Confirmando..." : "Confirmar"}
                                  </Button>
                                )}

                                {/* Botón de completar solo para citas confirmadas */}
                                {cita.estado === "confirmada" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full bg-cyan-50 text-cyan-600 hover:text-cyan-700 border-cyan-200 hover:border-cyan-300 hover:bg-cyan-100"
                                    onClick={() => handleCompleteAppointment(cita.id)}
                                    disabled={completingAppointment}
                                  >
                                    {completingAppointment && appointmentToComplete === cita.id ? "Completando..." : "Completar"}
                                  </Button>
                                )}

                                {user?.role === "recepcionista" ? (
                                  <Button variant="outline" size="sm" className="w-full opacity-50 cursor-not-allowed bg-white/80 hover:bg-white border-gray-200" disabled title="Función disponible próximamente">
                                    <span className="flex items-center gap-2">
                                      Editar
                                      <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                        Próximamente
                                      </Badge>
                                    </span>
                                  </Button>
                                ) : (
                                  <Link href={`/dashboard/appointments/${cita.id}/edit`}>
                                    <Button variant="outline" size="sm" className="w-full bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50">
                                      Editar
                                    </Button>
                                  </Link>
                                )}

                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full bg-red-50 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-100"
                                  onClick={() => handleCancelAppointment(cita.id)}
                                  disabled={cancellingAppointment}
                                >
                                  {cancellingAppointment && appointmentToCancel === cita.id ? "Cancelando..." : "Cancelar"}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
                <p className="mt-1 text-sm text-gray-500">No se encontraron citas con los filtros seleccionados.</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={refetch}
                >
                  Actualizar
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Diálogo de confirmación para cancelar cita */}
      <AlertDialog open={appointmentToCancel !== null} onOpenChange={(open) => !open && setAppointmentToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cita será marcada como cancelada y el paciente será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancellingAppointment}>
              No, mantener cita
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelAppointment}
              disabled={cancellingAppointment}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancellingAppointment ? "Cancelando..." : "Sí, cancelar cita"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para confirmar cita */}
      <AlertDialog open={appointmentToConfirm !== null} onOpenChange={(open) => !open && setAppointmentToConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              La cita será marcada como confirmada. El paciente podrá ver que su cita ha sido confirmada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmingAppointment}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmConfirmAppointment}
              disabled={confirmingAppointment}
              className="bg-green-600 hover:bg-green-700"
            >
              {confirmingAppointment ? "Confirmando..." : "Sí, confirmar cita"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para completar cita */}
      <AlertDialog open={appointmentToComplete !== null} onOpenChange={(open) => !open && setAppointmentToComplete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Completar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              La cita será marcada como completada. Esto indica que la consulta médica se ha realizado exitosamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completingAppointment}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCompleteAppointment}
              disabled={completingAppointment}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {completingAppointment ? "Completando..." : "Sí, completar cita"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
