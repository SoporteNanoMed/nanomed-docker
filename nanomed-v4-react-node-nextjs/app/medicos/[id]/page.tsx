"use client"

import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorAlert } from "@/components/ui/error-alert"
import { useDoctor } from "@/lib/api/hooks/use-doctors"
import { ArrowLeft, Phone, Mail, Calendar, Clock, Star, Award, Users, Stethoscope } from "lucide-react"

interface MedicoDetailPageProps {
  params: Promise<{ id: string }>
}

export default function MedicoDetailPage({ params }: MedicoDetailPageProps) {
  const { id } = use(params)
  const { doctor, loading, error } = useDoctor(Number.parseInt(id))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <ErrorAlert title="Error al cargar información del médico" message={error || "Médico no encontrado"} />
          <div className="mt-6">
            <Link href="/medicos">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navegación */}
        <div className="mb-6">
          <Link href="/medicos">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Catálogo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Perfil del Médico */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <Image
                      src={doctor.foto_perfil || "/placeholder.svg?height=128&width=128"}
                      alt={`Dr. ${doctor.nombre} ${doctor.apellido}`}
                      fill
                      className="rounded-full object-cover border-4 border-cyan-100"
                    />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-3xl text-gray-900 mb-2">
                      Dr. {doctor.nombre} {doctor.apellido}
                    </CardTitle>
                    <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 text-lg px-4 py-2 mb-4">
                      {doctor.especialidad}
                    </Badge>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-cyan-600" />
                      <Badge variant={doctor.activo ? "default" : "secondary"}>
                        {doctor.activo ? "Disponible para consultas" : "No disponible"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Información de Contacto */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-cyan-600" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctor.telefono && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-gray-600">{doctor.telefono}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{doctor.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Especialidad y Experiencia */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-cyan-600" />
                  Especialidad Médica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-cyan-700 mb-2">{doctor.especialidad}</h3>
                    <p className="text-gray-600">
                      Especialista certificado en {doctor.especialidad.toLowerCase()}, comprometido con brindar atención
                      médica de la más alta calidad utilizando las técnicas y tecnologías más avanzadas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disponibilidad */}
            {doctor.disponibilidad && doctor.disponibilidad.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-cyan-600" />
                    Horarios de Atención
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctor.disponibilidad.map((horario) => {
                      const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
                      return (
                        <div key={horario.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{dias[horario.dia_semana]}</span>
                          <span className="text-gray-600">
                            {horario.hora_inicio} - {horario.hora_fin}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Acciones */}
          <div className="space-y-6">
            {/* Agendar Cita */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-cyan-700">Agendar Consulta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctor.activo ? (
                  <>
                    <Link href={`/agendar-cita?medico=${doctor.id}`} className="block">
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3">
                        <Calendar className="h-5 w-5 mr-2" />
                        Agendar Cita
                      </Button>
                    </Link>

                    <div className="text-center text-sm text-gray-600">
                      <p>Disponible para consultas</p>
                      <p>Respuesta en menos de 24 horas</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Este médico no está disponible actualmente para nuevas consultas.
                    </p>
                    <Link href="/medicos">
                      <Button variant="outline" className="w-full">
                        Ver Otros Médicos
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-cyan-600" />
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="font-medium">Atención</p>
                    <p className="text-sm text-gray-600">Consultas presenciales y virtuales</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="font-medium">Certificación</p>
                    <p className="text-sm text-gray-600">Médico certificado y colegiado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contacto Directo */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>¿Tienes preguntas?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Contáctanos para resolver cualquier duda sobre este especialista.
                </p>
                <Link href="/contacto">
                  <Button variant="outline" className="w-full">
                    Contactar Soporte
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
