"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Calendar, FileText, Phone, Mail, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { appointmentsService } from "@/lib/api/services/appointments.service"
import type { User } from "@/lib/api/types"

interface PatientWithStats extends User {
  total_citas: number
  ultima_cita: string | null
  proxima_cita: string | null
  examenes_pendientes: number
}

export default function PatientsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<PatientWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPatients()
  }, [user])

  const loadPatients = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Obtener todas las citas del médico para extraer los pacientes únicos
      const response = await appointmentsService.getAppointments({ medico_id: user.id })

      if (!response.error) {
        // Procesar las citas para obtener estadísticas de pacientes
        const patientMap = new Map<number, PatientWithStats>()

        response.body.forEach((appointment) => {
          if (appointment.paciente) {
            const patientId = appointment.paciente.id

            if (!patientMap.has(patientId)) {
              patientMap.set(patientId, {
                ...appointment.paciente,
                total_citas: 0,
                ultima_cita: null,
                proxima_cita: null,
                examenes_pendientes: 0,
              })
            }

            const patient = patientMap.get(patientId)!
            patient.total_citas++

            const appointmentDate = new Date(appointment.fecha_hora)
            const now = new Date()

            // Determinar última cita (pasada)
            if (appointmentDate < now) {
              if (!patient.ultima_cita || appointmentDate > new Date(patient.ultima_cita)) {
                patient.ultima_cita = appointment.fecha_hora
              }
            }

            // Determinar próxima cita (futura)
            if (appointmentDate > now) {
              if (!patient.proxima_cita || appointmentDate < new Date(patient.proxima_cita)) {
                patient.proxima_cita = appointment.fecha_hora
              }
            }
          }
        })

        setPatients(Array.from(patientMap.values()))
      } else {
        setError("Error al cargar los pacientes")
      }
    } catch (err) {
      console.error("Error fetching patients:", err)
      setError("Error al cargar los pacientes")
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm) return true

    const term = searchTerm.toLowerCase()
    return (
      patient.nombre?.toLowerCase().includes(term) ||
      patient.apellido?.toLowerCase().includes(term) ||
      patient.rut?.toLowerCase().includes(term) ||
      patient.email?.toLowerCase().includes(term)
    )
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Pacientes</h1>
        <p className="text-gray-500">Lista de pacientes que han tenido citas conmigo</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Buscar Pacientes
          </CardTitle>
          <CardDescription>
            Mostrando {filteredPatients.length} de {patients.length} pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search">Buscar por nombre, apellido, RUT o email</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                placeholder="Buscar pacientes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        {patient.nombre} {patient.apellido}
                      </h3>
                      <Badge variant="outline" className="bg-cyan-50 text-cyan-700">
                        {patient.total_citas} citas
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">RUT</p>
                        <p className="font-medium">{patient.rut || "No registrado"}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium">{patient.email || "No registrado"}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Última Cita</p>
                        <p className="font-medium">{formatDate(patient.ultima_cita)}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Próxima Cita</p>
                        <p className="font-medium">{formatDate(patient.proxima_cita)}</p>
                      </div>
                    </div>

                    {patient.telefono && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        {patient.telefono}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link href={`/dashboard/citas?paciente=${patient.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Calendar className="h-4 w-4 mr-1" />
                        Ver Citas
                      </Button>
                    </Link>

                    <Link href={`/dashboard/examenes?paciente=${patient.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="h-4 w-4 mr-1" />
                        Ver Exámenes
                      </Button>
                    </Link>

                    {patient.email && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Mail className="h-4 w-4 mr-1" />
                        Contactar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pacientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "No se encontraron pacientes con los criterios de búsqueda."
                : "Aún no tienes pacientes registrados."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
