"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Clock, Award, Edit, FileText } from "lucide-react"

// Datos de ejemplo para médico detallado
const mockDoctorDetail = {
  id: 1,
  nombre: "Dr. Carlos",
  apellido: "Mendoza",
  especialidad: "Cardiología",
  telefono: "+56 9 1234 5678",
  email: "carlos.mendoza@nanomed.cl",
  ubicacion: "Santiago Centro",
  estado: "disponible",
  experiencia: "15 años",
  licencia: "CMP-12345",
  universidad: "Universidad de Chile",
  fechaIngreso: "2020-03-15",
  horarioAtencion: "Lunes a Viernes 08:00 - 18:00",
  especialidades: ["Cardiología", "Medicina Interna"],
  certificaciones: ["Cardiología Intervencionista", "Ecocardiografía"],
  biografia:
    "Especialista en cardiología con más de 15 años de experiencia en el diagnóstico y tratamiento de enfermedades cardiovasculares.",
  imagen: "/abstract-geometric-cm.png",
  proximasCitas: [
    { id: 101, paciente: "Juan Pérez", fecha: "2023-06-15T10:30:00", motivo: "Control rutinario" },
    { id: 102, paciente: "María González", fecha: "2023-06-15T11:15:00", motivo: "Revisión de exámenes" },
    { id: 103, paciente: "Pedro Sánchez", fecha: "2023-06-16T09:00:00", motivo: "Primera consulta" },
  ],
  ultimosExamenes: [
    { id: 201, paciente: "Juan Pérez", tipo: "Electrocardiograma", fecha: "2023-06-10" },
    { id: 202, paciente: "Ana Rodríguez", tipo: "Ecocardiograma", fecha: "2023-06-08" },
  ],
}

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const [doctor, setDoctor] = useState(mockDoctorDetail)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulamos la carga de datos
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-40 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/doctors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Información del Médico</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <Link href={`/dashboard/doctors/${doctor.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-md overflow-hidden">
                    <Image
                      src={doctor.imagen || "/placeholder.svg"}
                      alt={`${doctor.nombre} ${doctor.apellido}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 flex-1">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                    <p className="text-lg font-medium">
                      {doctor.nombre} {doctor.apellido}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <div className="mt-1">
                      <Badge variant={doctor.estado === "disponible" ? "default" : "secondary"}>
                        {doctor.estado === "disponible" ? "Disponible" : "Ocupado"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {doctor.telefono}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {doctor.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ubicación</label>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {doctor.ubicacion}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Licencia Médica</label>
                    <p>{doctor.licencia}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Información Profesional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Especialidad Principal</label>
                  <p className="text-cyan-600 font-medium">{doctor.especialidad}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Experiencia</label>
                  <p>{doctor.experiencia}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Universidad</label>
                  <p>{doctor.universidad}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Ingreso</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(doctor.fechaIngreso).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-500">Horario de Atención</label>
                <p className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4" />
                  {doctor.horarioAtencion}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Biografía</label>
                <p className="text-gray-600 mt-1">{doctor.biografia}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="citas">
                <TabsList className="mb-4">
                  <TabsTrigger value="citas">Próximas Citas</TabsTrigger>
                  <TabsTrigger value="examenes">Últimos Exámenes</TabsTrigger>
                </TabsList>

                <TabsContent value="citas">
                  <div className="space-y-4">
                    {doctor.proximasCitas.map((cita) => (
                      <div key={cita.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{cita.paciente}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(cita.fecha).toLocaleDateString()} -{" "}
                            {new Date(cita.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-sm">{cita.motivo}</p>
                        </div>
                        <Link href={`/dashboard/appointments/${cita.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Cita
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="examenes">
                  <div className="space-y-4">
                    {doctor.ultimosExamenes.map((examen) => (
                      <div key={examen.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{examen.paciente}</p>
                          <p className="text-sm text-gray-500">{new Date(examen.fecha).toLocaleDateString()}</p>
                          <p className="text-sm">{examen.tipo}</p>
                        </div>
                        <Link href={`/dashboard/exams/${examen.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Examen
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Especialidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {doctor.especialidades.map((esp, index) => (
                  <Badge key={index} variant="outline" className="mr-2">
                    {esp}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {doctor.certificaciones.map((cert, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">{cert}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/doctors/${doctor.id}/schedule-management`}>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Gestión de Horarios
                </Button>
              </Link>
              <Link href={`/dashboard/appointments/new?doctor=${doctor.id}`}>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Crear Cita
                </Button>
              </Link>
              <Link href={`/dashboard/doctors/${doctor.id}/patients`}>
                <Button className="w-full" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Ver Pacientes
                </Button>
              </Link>
              <Link href={`/dashboard/doctors/${doctor.id}/exams`}>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Exámenes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
