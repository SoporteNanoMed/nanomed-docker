"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Clock, Award, AlertCircle, MessageSquare } from "lucide-react"

// Tipo para el médico
interface Doctor {
  id: number
  nombre: string
  apellido: string
  especialidad: string
  telefono: string
  email: string
  ubicacion: string
  estado: string
  experiencia: string
  licencia: string
  universidad: string
  fechaIngreso: string
  horarioAtencion: string
  especialidades: string[]
  certificaciones: string[]
  biografia: string
  imagen: string
}

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true)
        // En un entorno real, esto sería una llamada a la API
        // const response = await doctorsService.getDoctorById(parseInt(params.id))

        // Simulamos la respuesta de la API con datos de ejemplo
        setTimeout(() => {
          const mockDoctor = {
            id: Number.parseInt(params.id),
            nombre: "Carlos",
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
          }

          setDoctor(mockDoctor)
          setLoading(false)
        }, 500)
      } catch (err) {
        console.error("Error fetching doctor:", err)
        setError("Error al cargar la información del médico")
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "No se encontró la información del médico"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/doctor/medicos">
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
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Disponibilidad
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
