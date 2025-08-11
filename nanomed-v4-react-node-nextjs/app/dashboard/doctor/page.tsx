"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, Clock, Users, Activity } from "lucide-react"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { appointmentsService } from "@/lib/api/services/appointments.service"
import { examsService } from "@/lib/api/services/exams.service"
import type { Appointment, Exam } from "@/lib/api/types"

export default function DoctorDashboardPage() {
  const { user, loading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [recentExams, setRecentExams] = useState<Exam[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState("today")

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!user) return

      try {
        setLoadingData(true)

        // Obtener citas del día
        const today = new Date().toISOString().split("T")[0]
        const todayResponse = await appointmentsService.getAppointments({
          medico_id: user.id,
          fecha_desde: today,
          fecha_hasta: today,
        })

        // Obtener próximas citas
        const upcomingResponse = await appointmentsService.getAppointments({
          medico_id: user.id,
          estado: "programada",
        })

        // Obtener exámenes recientes
        const examsResponse = await examsService.getExams({
          medico_id: user.id,
        })

        if (!todayResponse.error) {
          setTodayAppointments(todayResponse.body)
        }

        if (!upcomingResponse.error) {
          setAppointments(upcomingResponse.body)
        }

        if (!examsResponse.error) {
          setRecentExams(examsResponse.body)
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error)
      } finally {
        setLoadingData(false)
      }
    }

    if (user && user.role === "medico") {
      fetchDoctorData()
    }
  }, [user])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading || loadingData) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de bienvenida adaptado al género */}
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-[#000000] mb-2">
          {user
            ? `${(user.genero || "").trim().toLowerCase() === "femenino" ? "Bienvenida" : "Bienvenido"}, ${user.nombre}`
            : "Bienvenido"} a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">nanoMED</span>
        </h1>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel Médico</h1>
        <p className="text-gray-500">Gestione sus citas, exámenes y pacientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-cyan-500 mr-4" />
              <div>
                <p className="text-2xl font-bold">{todayAppointments.length}</p>
                <p className="text-sm text-gray-500">Citas hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-cyan-500 mr-4" />
              <div>
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-sm text-gray-500">Citas pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-cyan-500 mr-4" />
              <div>
                <p className="text-2xl font-bold">{recentExams.length}</p>
                <p className="text-sm text-gray-500">Exámenes recientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="today">Citas de Hoy</TabsTrigger>
          <TabsTrigger value="upcoming">Próximas Citas</TabsTrigger>
          <TabsTrigger value="exams">Exámenes Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Citas de Hoy</CardTitle>
              <CardDescription>Citas programadas para hoy</CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {appointment.paciente?.nombre} {appointment.paciente?.apellido}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(appointment.fecha_hora)}</p>
                        <p className="text-xs text-gray-400">
                          {appointment.lugar || "Consulta general"} • {appointment.duracion} min
                        </p>
                      </div>
                      <Link href={`/dashboard/citas/${appointment.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No hay citas programadas para hoy</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/citas" className="w-full">
                <Button variant="outline" className="w-full">
                  Ver todas las citas
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Citas</CardTitle>
              <CardDescription>Citas programadas para los próximos días</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {appointment.paciente?.nombre} {appointment.paciente?.apellido}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(appointment.fecha_hora)}</p>
                        <p className="text-xs text-gray-400">
                          {appointment.lugar || "Consulta general"} • {appointment.duracion} min
                        </p>
                      </div>
                      <Link href={`/dashboard/citas/${appointment.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No hay citas programadas próximamente</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/citas" className="w-full">
                <Button variant="outline" className="w-full">
                  Ver todas las citas
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Exámenes Recientes</CardTitle>
              <CardDescription>Exámenes creados o actualizados recientemente</CardDescription>
            </CardHeader>
            <CardContent>
              {recentExams.length > 0 ? (
                <div className="space-y-4">
                  {recentExams.slice(0, 5).map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {exam.paciente?.nombre} {exam.paciente?.apellido}
                        </p>
                        <p className="text-sm text-gray-500">{exam.tipo_examen}</p>
                        <p className="text-xs text-gray-400">
                          Fecha: {new Date(exam.fecha).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <Link href={`/dashboard/examenes/${exam.id}`}>
                        <Button variant="outline" size="sm">
                          Ver examen
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No hay exámenes recientes</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/examenes/manage" className="w-full">
                <Button variant="outline" className="w-full">
                  Gestionar exámenes
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/citas">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-cyan-500 mr-4" />
              <div>
                <h3 className="font-medium">Mis Citas</h3>
                <p className="text-sm text-gray-500">Ver agenda de citas</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/examenes/manage">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <FileText className="h-8 w-8 text-cyan-500 mr-4" />
              <div>
                <h3 className="font-medium">Gestionar Exámenes</h3>
                <p className="text-sm text-gray-500">Crear y actualizar exámenes</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/patients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-cyan-500 mr-4" />
              <div>
                <h3 className="font-medium">Mis Pacientes</h3>
                <p className="text-sm text-gray-500">Ver lista de pacientes</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/perfil">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <Activity className="h-8 w-8 text-cyan-500 mr-4" />
              <div>
                <h3 className="font-medium">Mi Perfil</h3>
                <p className="text-sm text-gray-500">Actualizar información</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
