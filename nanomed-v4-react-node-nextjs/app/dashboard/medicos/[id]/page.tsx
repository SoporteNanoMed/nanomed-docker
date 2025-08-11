"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorAlert } from "@/components/ui/error-alert"
import { ArrowLeft, Mail, Calendar, MessageCircle, Clock, User } from "lucide-react"

interface Doctor {
  id: number
  nombre: string
  apellido: string
  email: string
  especialidad: string
  foto_perfil: string | null
  activo: boolean
}

interface DoctorResponse {
  error: boolean
  status: number
  body: Doctor
}

export default function DoctorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const doctorId = params.id as string

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${doctorId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data: DoctorResponse = await response.json()

        if (data.error) {
          throw new Error("Error al obtener la información del médico")
        }

        setDoctor(data.body)
      } catch (err: any) {
        setError(err.message || "Error al cargar la información del médico")
      } finally {
        setLoading(false)
      }
    }

    if (doctorId) {
      fetchDoctor()
    }
  }, [doctorId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Perfil del Médico</h1>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Perfil del Médico</h1>
        </div>
        <ErrorAlert title="Error al cargar médico" message={error || "Médico no encontrado"} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Perfil del Médico</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <div className="relative w-24 h-24">
                  <Image
                    src={doctor.foto_perfil || "/placeholder.svg?height=96&width=96&text=Dr"}
                    alt={`Dr. ${doctor.nombre} ${doctor.apellido}`}
                    fill
                    className="rounded-full object-cover border-2 border-primary/20"
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    Dr. {doctor.nombre} {doctor.apellido}
                  </CardTitle>
                  <Badge variant="secondary" className="mb-4">
                    {doctor.especialidad}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <Badge variant={doctor.activo ? "default" : "secondary"}>
                      {doctor.activo ? "Disponible" : "No disponible"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Información Profesional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Profesional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Especialidad</h4>
                <p className="text-muted-foreground">{doctor.especialidad}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Estado</h4>
                <Badge variant={doctor.activo ? "default" : "secondary"}>
                  {doctor.activo ? "Activo - Disponible para consultas" : "No disponible"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctor.activo && (
                <Link href={`/dashboard/citas/nueva?medico=${doctor.id}`} className="block">
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Cita
                  </Button>
                </Link>
              )}

              <Link href={`/dashboard/mensajes/nuevo?medico=${doctor.id}`} className="block">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </Link>

              <Link href="/dashboard/medicos" className="block">
                <Button variant="ghost" className="w-full">
                  Ver Otros Médicos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  Para agendar una cita o consultar disponibilidad, utiliza el botón "Agendar Cita" o contacta
                  directamente con el médico.
                </p>
                <p>Si tienes alguna consulta específica, puedes enviar un mensaje directo al Dr. {doctor.apellido}.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
