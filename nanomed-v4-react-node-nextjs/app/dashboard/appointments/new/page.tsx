"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, CalendarIcon, Clock, Search, AlertCircle, User, Stethoscope, CalendarDays, FileText } from "lucide-react"
import { useReceptionistPatients, useReceptionistDoctors, useDoctorAvailabilityBlocks, useDoctorAvailableDays } from "@/lib/api"
import { receptionistsService } from "@/lib/api/services/receptionists.service"
import { useToast } from "@/hooks/use-toast"

const mockAppointmentTypes = ["Primera consulta", "Control", "Procedimiento", "Examen", "Urgencia"]

export default function NewAppointmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Hooks para obtener datos reales
  const { patients, loading: patientsLoading, error: patientsError, setFilters } = useReceptionistPatients()
  const { doctors, loading: doctorsLoading, error: doctorsError } = useReceptionistDoctors()

  // Estado para el formulario
  const [formData, setFormData] = useState({
    pacienteId: "",
    medicoId: "",
    fecha: new Date(),
    hora: "",
    duracion: "30",
    tipoCita: "",
    motivo: "",
    lugar: "Centro Médico nanoMED",
    direccion: "José Joaquín Pérez 240, Salamanca",
  })

  // Estados para búsqueda
  const [searchPatient, setSearchPatient] = useState("")
  const [searchDoctor, setSearchDoctor] = useState("")

  // Estados para resultados de búsqueda
  const [filteredPatients, setFilteredPatients] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])

  // Estado para indicar si se está enviando el formulario
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hook para obtener bloques de disponibilidad del médico seleccionado
  const { 
    availableSlots, 
    loading: availabilityLoading, 
    error: availabilityError,
    doctorInfo
  } = useDoctorAvailabilityBlocks(
    formData.medicoId ? parseInt(formData.medicoId) : null,
    formData.fecha ? formData.fecha.toISOString().split('T')[0] : null
  )

  // Hook para obtener días disponibles del médico para colorear el calendario
  const { 
    availableDays, 
    loading: availableDaysLoading, 
    error: availableDaysError,
    hasAvailability,
    getAvailableDates
  } = useDoctorAvailableDays(
    formData.medicoId ? parseInt(formData.medicoId) : null,
    formData.fecha
  )

  // Función para ordenar pacientes alfabéticamente
  const sortPatients = (patientsList) => {
    return [...patientsList].sort((a, b) => {
      const nameA = `${a.nombre} ${a.apellido}`.toLowerCase()
      const nameB = `${b.nombre} ${b.apellido}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }

  // Función para ordenar médicos alfabéticamente
  const sortDoctors = (doctorsList) => {
    return [...doctorsList].sort((a, b) => {
      const nameA = `${a.nombre} ${a.apellido}`.toLowerCase()
      const nameB = `${b.nombre} ${b.apellido}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }

  // Efecto para manejar parámetros de URL
  useEffect(() => {
    const doctorId = searchParams.get("doctor")
    const dateParam = searchParams.get("date")
    const timeParam = searchParams.get("time")

    if (doctorId) {
      setFormData((prev) => ({ ...prev, medicoId: doctorId }))
    }

    if (dateParam) {
      setFormData((prev) => ({ ...prev, fecha: new Date(dateParam) }))
    }

    if (timeParam) {
      setFormData((prev) => ({ ...prev, hora: timeParam }))
    }
  }, [searchParams])

  // Efecto para sincronizar los pacientes filtrados cuando llegan los datos
  useEffect(() => {
    setFilteredPatients(sortPatients(patients))
  }, [patients])

  // Efecto para sincronizar los médicos filtrados cuando llegan los datos
  useEffect(() => {
    setFilteredDoctors(sortDoctors(doctors))
  }, [doctors])

  // Efecto para filtrar pacientes usando los datos reales
  useEffect(() => {
    if (!patients.length) return // No filtrar si no hay datos

    if (searchPatient.trim()) {
      const filtered = patients.filter(
        (patient) =>
          patient.nombre.toLowerCase().includes(searchPatient.toLowerCase()) ||
          patient.apellido.toLowerCase().includes(searchPatient.toLowerCase()) ||
          patient.rut.toLowerCase().includes(searchPatient.toLowerCase()),
      )
      setFilteredPatients(sortPatients(filtered))
    } else {
      setFilteredPatients(sortPatients(patients))
    }
  }, [searchPatient, patients])

  // Efecto para filtrar médicos usando los datos reales
  useEffect(() => {
    if (!doctors.length) return // No filtrar si no hay datos

    if (searchDoctor.trim()) {
      const filtered = doctors.filter(
        (doctor) =>
          doctor.nombre.toLowerCase().includes(searchDoctor.toLowerCase()) ||
          doctor.apellido.toLowerCase().includes(searchDoctor.toLowerCase()) ||
          doctor.especialidad.toLowerCase().includes(searchDoctor.toLowerCase()),
      )
      setFilteredDoctors(sortDoctors(filtered))
    } else {
      setFilteredDoctors(sortDoctors(doctors))
    }
  }, [searchDoctor, doctors])

  // Efecto para limpiar la hora seleccionada cuando cambie el médico o la fecha
  useEffect(() => {
    setFormData((prev) => ({ ...prev, hora: "" }))
  }, [formData.medicoId, formData.fecha])

  // Efecto para actualizar la duración basada en el slot seleccionado
  useEffect(() => {
    if (formData.hora && availableSlots) {
      const selectedSlot = availableSlots.find(
        (slot) => slot.hora === formData.hora
      )
      if (selectedSlot) {
        setFormData((prev) => ({ 
          ...prev, 
          duracion: selectedSlot.duracion.toString() 
        }))
      }
    }
  }, [formData.hora, availableSlots])

  // Manejador para cambios en el formulario
  const handleChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Manejador para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar que tenemos todos los datos necesarios
      if (!selectedPatient || !selectedDoctor || !formData.fecha || !formData.hora) {
        throw new Error("Faltan datos requeridos para crear la cita")
      }

      // Validación específica del paciente
      if (!formData.pacienteId || formData.pacienteId === "" || parseInt(formData.pacienteId) !== selectedPatient.id) {
        console.error("❌ Error de validación del paciente:", {
          formDataPacienteId: formData.pacienteId,
          selectedPatientId: selectedPatient.id,
          areEqual: parseInt(formData.pacienteId) === selectedPatient.id
        })
        throw new Error(`Error de validación: El paciente seleccionado (${selectedPatient.nombre} ${selectedPatient.apellido}, ID: ${selectedPatient.id}) no coincide con el ID del formulario (${formData.pacienteId})`)
      }

      // Encontrar el bloque horario seleccionado para obtener las fechas exactas
      const selectedSlot = availableSlots.find(slot => slot.hora === formData.hora)
      if (!selectedSlot) {
        throw new Error("No se pudo encontrar el bloque horario seleccionado")
      }

      // Validación de datos de la cita
      console.log(" Datos del formulario para crear cita:", {
        pacienteId: formData.pacienteId,
        medicoId: formData.medicoId,
        selectedPatient: selectedPatient,
        selectedDoctor: selectedDoctor
      })

      // Construir los datos de la cita usando las fechas exactas del bloque
      const citaData = {
        paciente_id: parseInt(formData.pacienteId),
        medico_id: parseInt(formData.medicoId),
        // Usar las fechas exactas del bloque para evitar problemas de zona horaria
        fecha_hora: selectedSlot.fecha_hora_inicio,
        duracion: selectedSlot.duracion, // Usar la duración real del bloque
        lugar: formData.lugar || "Centro Médico nanoMED",
        direccion: formData.direccion || "José Joaquín Pérez 240, Salamanca",
        notas: formData.motivo || "",
        tipo_cita: formData.tipoCita || "Consulta"
      }

      console.log(" Datos que se enviarán al backend:", citaData)
      console.log(" Paciente seleccionado:", {
        id: selectedPatient.id,
        nombre: selectedPatient.nombre,
        apellido: selectedPatient.apellido,
        rut: selectedPatient.rut
      })

      // Enviando datos al backend

      // Enviar la cita al backend usando el servicio de recepcionistas
      const response = await receptionistsService.createAppointment(citaData)

      console.log(" Respuesta del backend:", response)

      if (response.error) {
        throw new Error(response.message || "Error al crear la cita")
      }

      // Cita creada exitosamente
      console.log(" Cita creada exitosamente:", response.body)

      // Verificar que la cita se creó para el paciente correcto
      if (response.body && response.body.paciente_id && response.body.paciente_id !== parseInt(formData.pacienteId)) {
        console.error("⚠️ ERROR: La cita se creó para un paciente diferente!")
        console.error("Esperado paciente_id:", parseInt(formData.pacienteId))
        console.error("Recibido paciente_id:", response.body.paciente_id)
        
        toast({
          title: "⚠️ Advertencia",
          description: `La cita se creó pero parece haberse asignado a un paciente diferente. Verifica los detalles de la cita.`,
          variant: "destructive",
        })
        
        // Aún así redirigir para que el usuario pueda ver qué pasó
        setTimeout(() => {
          router.push("/dashboard/appointments/all")
        }, 3000)
        return
      }

      // Mostrar mensaje de éxito
      toast({
        title: "✅ Cita creada exitosamente",
        description: `Cita agendada para ${response.body.paciente_nombre} ${response.body.paciente_apellido} (ID: ${response.body.paciente_id}) el ${format(new Date(selectedSlot.fecha_hora_inicio), "PPP", { locale: es })} a las ${selectedSlot.hora}`,
        variant: "default",
      })

      // Redirigir a la lista de citas después de un pequeño delay
      setTimeout(() => {
        router.push("/dashboard/appointments/all")
      }, 1500)
    } catch (error) {
      // Error al crear la cita
      toast({
        title: "❌ Error al crear la cita",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Obtener paciente y médico seleccionados
  const selectedPatient = patients.find((p) => p.id.toString() === formData.pacienteId)
  const selectedDoctor = doctors.find((d) => d.id.toString() === formData.medicoId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/appointments/all">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Nueva Cita</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard/appointments/all">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button
            type="submit"
            form="appointment-form"
            className="bg-primary hover:bg-primary/80 text-primary-foreground"
            disabled={!selectedPatient || !selectedDoctor || !formData.fecha || !formData.hora || isSubmitting}
          >
            {isSubmitting ? "Creando..." : "Crear Cita"}
          </Button>
        </div>
      </div>

      <form id="appointment-form" onSubmit={handleSubmit}>
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="shadow-lg border border-border bg-card/90 rounded-2xl transition-transform duration-200 hover:scale-[1.015] hover:shadow-2xl animate-fade-in">
            <CardHeader className="pb-2 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-2xl flex flex-row items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <User className="text-primary" />
              </div>
              <CardTitle className="text-lg text-primary font-bold tracking-tight">Información del Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Separador visual */}
              <div className="h-[2px] bg-muted/60 rounded mb-2" />
              <div className="space-y-2">
                <Label htmlFor="searchPatient">Buscar Paciente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="searchPatient"
                    placeholder="Buscar por nombre o RUT"
                    className="pl-10"
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paciente">Seleccionar Paciente</Label>
                {patientsLoading ? (
                  <div className="text-sm text-gray-500">Cargando pacientes...</div>
                ) : patientsError ? (
                  <div className="text-sm text-red-500">Error al cargar pacientes: {patientsError}</div>
                ) : (
                  <Select value={formData.pacienteId} onValueChange={(value) => handleChange("pacienteId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.nombre} {patient.apellido} ({patient.rut})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedPatient && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium text-muted-foreground">
                    {selectedPatient.nombre} {selectedPatient.apellido}
                  </p>
                  <p className="text-sm text-muted-foreground">RUT: {selectedPatient.rut}</p>
                  {selectedPatient.email && (
                    <p className="text-sm text-muted-foreground">Email: {selectedPatient.email}</p>
                  )}
                  {selectedPatient.telefono && (
                    <p className="text-sm text-muted-foreground">Teléfono: {selectedPatient.telefono}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-border bg-card/90 rounded-2xl transition-transform duration-200 hover:scale-[1.015] hover:shadow-2xl animate-fade-in">
            <CardHeader className="pb-2 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-2xl flex flex-row items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <Stethoscope className="text-primary" />
              </div>
              <CardTitle className="text-lg text-primary font-bold tracking-tight">Información del Profesional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="h-[2px] bg-muted/60 rounded mb-2" />
              <div className="space-y-2">
                <Label htmlFor="searchDoctor">Buscar Profesional</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="searchDoctor"
                    placeholder="Buscar por nombre o especialidad"
                    className="pl-10"
                    value={searchDoctor}
                    onChange={(e) => setSearchDoctor(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medico">Seleccionar Profesional</Label>
                {doctorsLoading ? (
                  <div className="text-sm text-gray-500">Cargando médicos...</div>
                ) : doctorsError ? (
                  <div className="text-sm text-red-500">Error al cargar médicos: {doctorsError}</div>
                ) : (
                  <Select value={formData.medicoId} onValueChange={(value) => handleChange("medicoId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.nombre} {doctor.apellido} ({doctor.especialidad})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedDoctor && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium text-muted-foreground">
                    {selectedDoctor.nombre} {selectedDoctor.apellido}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.especialidad}</p>
                  {selectedDoctor.email && (
                    <p className="text-sm text-muted-foreground">Email: {selectedDoctor.email}</p>
                  )}
                  {selectedDoctor.telefono && (
                    <p className="text-sm text-muted-foreground">Teléfono: {selectedDoctor.telefono}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-border bg-card/90 rounded-2xl transition-transform duration-200 hover:scale-[1.015] hover:shadow-2xl animate-fade-in">
            <CardHeader className="pb-2 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-2xl flex flex-row items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <CalendarDays className="text-primary" />
              </div>
              <CardTitle className="text-lg text-primary font-bold tracking-tight">Fecha y Hora</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="h-[2px] bg-muted/60 rounded mb-2" />
              <div className="space-y-2">
                <Label>Fecha de la Cita</Label>
                {!formData.medicoId ? (
                  <div className="p-3 text-sm text-muted-foreground bg-muted rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Selecciona un médico primero para elegir la fecha
                  </div>
                ) : availableDaysLoading ? (
                  <div className="p-3 text-sm text-muted-foreground bg-muted rounded-md">
                    Cargando disponibilidad del calendario...
                  </div>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fecha ? format(formData.fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.fecha}
                        onSelect={(date) => date && handleChange("fecha", date)}
                        disabled={(date) => {
                          const day = date.getDay()
                          const isWeekend = day === 0 || day === 6
                          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                          const hasNoAvailability = !hasAvailability(date)
                          return isPast || isWeekend || hasNoAvailability
                        }}
                        modifiers={{
                          available: (date) => hasAvailability(date),
                          unavailable: (date) => {
                            const day = date.getDay()
                            const isWeekend = day === 0 || day === 6
                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                            return !isPast && !isWeekend && !hasAvailability(date)
                          }
                        }}
                        modifiersClassNames={{
                          available: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
                          unavailable: "bg-gray-100 text-gray-400 opacity-50"
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
                
                {/* Leyenda de colores para el calendario */}
                {formData.medicoId && !availableDaysLoading && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Leyenda del calendario:</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                        <span className="text-green-800">Días con disponibilidad</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-muted border border-border rounded"></div>
                        <span className="text-muted-foreground">Días sin disponibilidad</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-border border border-muted rounded"></div>
                        <span className="text-border">Días deshabilitados</span>
                      </div>
                    </div>
                    {availableDaysError && (
                      <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Error al cargar disponibilidad: {availableDaysError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                {!formData.medicoId ? (
                  <div className="p-3 text-sm text-muted-foreground bg-muted rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Selecciona un médico para ver las horas disponibles
                  </div>
                ) : availabilityLoading ? (
                  <div className="p-3 text-sm text-muted-foreground bg-muted rounded-md">
                    Cargando horarios disponibles...
                  </div>
                ) : availabilityError ? (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Error al cargar horarios: {availabilityError}
                  </div>
                ) : !availableSlots?.length ? (
                  <div className="p-3 text-sm text-warning bg-warning/10 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    No hay horarios disponibles para esta fecha
                    {doctorInfo && (
                      <span className="block mt-1 text-xs">
                        Médico: {doctorInfo.nombre} {doctorInfo.apellido}
                      </span>
                    )}
                  </div>
                ) : (
                  <Select value={formData.hora} onValueChange={(value) => handleChange("hora", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.bloque_id} value={slot.hora}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {slot.hora}
                            <span className="text-xs text-gray-500">
                              ({slot.duracion} min)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Información adicional sobre disponibilidad */}
              {availableSlots && availableSlots.length > 0 && formData.medicoId && (
                <div className="space-y-3">
                  <div className="p-3 bg-accent rounded-md">
                    <p className="text-sm font-medium text-accent-foreground mb-2">
                      📅 Horarios disponibles para esta fecha:
                    </p>
                    <p className="text-xs text-accent-foreground">
                      {availableSlots.length} {availableSlots.length === 1 ? 'horario disponible' : 'horarios disponibles'}
                      {doctorInfo && (
                        <span className="block mt-1">
                          Médico: {doctorInfo.nombre} {doctorInfo.apellido}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Resumen de disponibilidad del médico */}
              {formData.medicoId && availableDays.length > 0 && (
                <div className="space-y-3">
                  <div className="p-3 bg-secondary rounded-md">
                    <p className="text-sm font-medium text-secondary-foreground mb-2">
                      📊 Resumen de disponibilidad:
                    </p>
                    <div className="text-xs text-secondary-foreground space-y-1">
                      <p>
                        {availableDays.filter(day => day.tieneDisponibilidad).length} días con disponibilidad 
                        de {availableDays.length} días consultados
                      </p>
                      <p>
                        Total de bloques disponibles: {availableDays.reduce((sum, day) => sum + day.bloquesDisponibles, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="duracion">Duración (minutos)</Label>
                <Select value={formData.duracion} onValueChange={(value) => handleChange("duracion", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar duración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-border bg-card/90 rounded-2xl transition-transform duration-200 hover:scale-[1.015] hover:shadow-2xl animate-fade-in">
            <CardHeader className="pb-2 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-2xl flex flex-row items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <FileText className="text-primary" />
              </div>
              <CardTitle className="text-lg text-primary font-bold tracking-tight">Detalles de la Cita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="h-[2px] bg-muted/60 rounded mb-2" />
              <div className="space-y-2">
                <Label htmlFor="tipoCita">Tipo de Cita</Label>
                <Select value={formData.tipoCita} onValueChange={(value) => handleChange("tipoCita", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAppointmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo de la Consulta</Label>
                <Textarea
                  id="motivo"
                  placeholder="Describe el motivo de la consulta"
                  value={formData.motivo}
                  onChange={(e) => handleChange("motivo", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lugar">Lugar</Label>
                <Input id="lugar" value={formData.lugar} onChange={(e) => handleChange("lugar", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 shadow-xl border-2 border-primary bg-background rounded-2xl animate-fade-in">
          <CardHeader className="pb-2 border-b-2 border-primary bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-2xl flex flex-row items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
              <FileText className="text-primary" />
            </div>
            <CardTitle className="text-lg text-primary font-bold tracking-tight">Resumen de la Cita</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[2px] bg-muted/60 rounded mb-2" />
            {selectedPatient && selectedDoctor && formData.fecha && formData.hora ? (
              (() => {
                const selectedSlot = availableSlots.find(slot => slot.hora === formData.hora)
                return (
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium text-primary">Paciente:</span> {selectedPatient.nombre} {selectedPatient.apellido}
                    </p>
                    <p>
                      <span className="font-medium text-primary">Médico:</span> {selectedDoctor.nombre} {selectedDoctor.apellido}
                    </p>
                    <p>
                      <span className="font-medium text-primary">Fecha:</span> {format(formData.fecha, "PPP", { locale: es })}
                    </p>
                    <p>
                      <span className="font-medium text-primary">Hora:</span> {formData.hora}
                      {selectedSlot && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({selectedSlot.hora} - {(() => {
                            // Extraer hora de fin directamente de la cadena, sin conversiones de Date
                            const fechaFin = selectedSlot.fecha_hora_fin
                            const horaFin = fechaFin.includes('T') 
                              ? fechaFin.split('T')[1].substring(0, 5)  // ISO format: "2024-07-02T13:30:00"
                              : fechaFin.split(' ')[1]?.substring(0, 5) // SQL format: "2024-07-02 13:30:00"
                            return horaFin || 'N/A'
                          })()})
                        </span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium text-primary">Duración:</span> {formData.duracion} minutos
                      {selectedSlot && selectedSlot.duracion.toString() !== formData.duracion && (
                        <span className="text-sm text-warning ml-2">
                          (Se usará duración del bloque: {selectedSlot.duracion} min)
                        </span>
                      )}
                    </p>
                    {formData.tipoCita && (
                      <p>
                        <span className="font-medium text-primary">Tipo:</span> {formData.tipoCita}
                      </p>
                    )}
                    {formData.motivo && (
                      <p>
                        <span className="font-medium text-primary">Motivo:</span> {formData.motivo}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-primary">Lugar:</span> {formData.lugar}
                    </p>
                    <p>
                      <span className="font-medium text-primary">Dirección:</span> {formData.direccion}
                    </p>

                  </div>
                )
              })()
            ) : (
              <p className="text-muted-foreground">Complete los campos requeridos para ver el resumen</p>
                          )}
            </CardContent>
          </Card>
      </form>
    </div>
  )
}
