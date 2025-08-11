"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorAlert } from "@/components/ui/error-alert"
import { useDoctors } from "@/lib/api/hooks/use-doctors"
import { Search, User, Phone, Mail, Calendar, Clock } from "lucide-react"

export default function MedicosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [especialidadFilter, setEspecialidadFilter] = useState("")

  const { doctors, loading, error } = useDoctors({
    nombre: searchTerm || undefined,
    especialidad: especialidadFilter || undefined,
    activo: true,
  })

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <ErrorAlert title="Error al cargar médicos" message={error} />
        </div>
      </div>
    )
  }

  // Extraer especialidades únicas para el filtro
  const especialidades = Array.from(new Set(doctors.map((doctor) => doctor.especialidad)))

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      !searchTerm ||
      doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.especialidad.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEspecialidad = !especialidadFilter || doctor.especialidad === especialidadFilter

    return matchesSearch && matchesEspecialidad
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Médicos Especialistas</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra al especialista que necesitas. Contamos con profesionales altamente calificados en diversas áreas
            de la medicina para brindarte la mejor atención.
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-cyan-600" />
              Buscar Médicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={especialidadFilter} onValueChange={setEspecialidadFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredDoctors.length === 0
              ? "No se encontraron médicos con los criterios seleccionados"
              : `Mostrando ${filteredDoctors.length} médico${filteredDoctors.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Grid de Médicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
            >
              <CardHeader className="text-center pb-4">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={doctor.foto_perfil || "/placeholder.svg?height=96&width=96"}
                    alt={`Dr. ${doctor.nombre} ${doctor.apellido}`}
                    fill
                    className="rounded-full object-cover border-4 border-cyan-100"
                  />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  Dr. {doctor.nombre} {doctor.apellido}
                </CardTitle>
                <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200">{doctor.especialidad}</Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {doctor.telefono && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-cyan-600" />
                      <span>{doctor.telefono}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-cyan-600" />
                    <span>{doctor.email}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-cyan-600" />
                    <Badge variant={doctor.activo ? "default" : "secondary"} className="text-xs">
                      {doctor.activo ? "Disponible" : "No disponible"}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Link href={`/medicos/${doctor.id}`} className="block">
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">Ver Perfil Completo</Button>
                  </Link>

                  {doctor.activo && (
                    <Link href={`/agendar-cita?medico=${doctor.id}`} className="block">
                      <Button variant="outline" className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-50">
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar Cita
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estado vacío */}
        {filteredDoctors.length === 0 && !loading && (
          <div className="text-center py-16">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron médicos</h3>
            <p className="text-gray-500 mb-6">
              Intenta ajustar los filtros de búsqueda o contacta con nosotros para más información.
            </p>
            <Link href="/contacto">
              <Button className="bg-cyan-600 hover:bg-cyan-700">Contactar con Nosotros</Button>
            </Link>
          </div>
        )}

        {/* Call to Action */}
        {filteredDoctors.length > 0 && (
          <div className="mt-16 text-center bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Necesitas ayuda para elegir?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Nuestro equipo de atención al cliente puede ayudarte a encontrar el especialista más adecuado para tus
              necesidades específicas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contacto">
                <Button className="bg-cyan-600 hover:bg-cyan-700">Contactar Asesor</Button>
              </Link>
              <Link href="/especialidades">
                <Button variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50">
                  Ver Todas las Especialidades
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
