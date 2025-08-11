"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, User, Phone, Mail, MapPin, Calendar, Plus, Filter, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { usePatients } from "@/lib/api/hooks/use-patients"
import { useAuth } from "@/lib/api/hooks/use-auth"
import type { ReceptionistPatient } from "@/lib/api/services/receptionists.service"

export default function DoctorPatientsPage() {
  const { patients, loading, error, refetch } = usePatients()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [filterPrevision, setFilterPrevision] = useState("todas")
  const [filterComuna, setFilterComuna] = useState("todas")

  // Filtrar pacientes según los criterios
  const filteredPatients = patients.filter((patient) => {
    // Filtro por búsqueda
    const searchMatch =
      patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.telefono && patient.telefono.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtro por estado (asumimos que todos los pacientes están activos por defecto)
    const estadoMatch = filterEstado === "todos" || (patient.estado || "activo") === filterEstado

    // Filtro por previsión (no disponible en el backend actual)
    const previsionMatch = filterPrevision === "todas" || (patient.prevision || "No registrada") === filterPrevision

    // Filtro por comuna
    const comunaMatch = filterComuna === "todas" || patient.ciudad === filterComuna

    return searchMatch && estadoMatch && previsionMatch && comunaMatch
  })

  // Extraer valores únicos para los filtros
  const previsiones = Array.from(new Set(patients.map((p) => p.prevision || "No registrada").filter(Boolean)))
  const comunas = Array.from(new Set(patients.map((p) => p.ciudad).filter(Boolean)))

  // Función para calcular la edad
  const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return "N/A"
    
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  // Función para formatear fecha
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("es-CL")
  }

  if (loading) {
    return <PatientsLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Mis Pacientes</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Gestiona y visualiza la información de tus pacientes
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              size="sm" 
              onClick={refetch} 
              className="ml-2 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Mis Pacientes</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Gestiona y visualiza la información de tus pacientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refetch} 
            disabled={loading}
            className="bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Link href="/dashboard/doctor/pacientes/nuevo">
            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paciente
            </Button>
          </Link>
        </div>
      </div>

      {/* Indicadores de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total de Pacientes */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600 mb-2">Total de Pacientes</p>
                <p className="text-3xl font-bold text-cyan-900">{filteredPatients.length}</p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Pacientes Activos */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">Pacientes Activos</p>
                <p className="text-3xl font-bold text-green-900">
                  {filteredPatients.filter(patient => (patient.estado || "activo") === "activo").length}
                </p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Citas Pendientes */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-2">Citas Pendientes</p>
                <p className="text-3xl font-bold text-orange-900">
                  {filteredPatients.filter(patient => patient.proximaCita).length}
                </p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Resultados Filtrados */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-2">Resultados Filtrados</p>
                <p className="text-3xl font-bold text-purple-900">
                  {searchTerm ? filteredPatients.length : patients?.length || 0}
                </p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Search className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-100 shadow-lg group-hover:shadow-2xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Filter className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                  Filtros
                </h3>
                <p className="text-sm text-gray-600">Busca y filtra tus pacientes</p>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar pacientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
                  />
                </div>

                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPrevision} onValueChange={setFilterPrevision}>
                  <SelectTrigger className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300">
                    <SelectValue placeholder="Previsión" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las previsiones</SelectItem>
                    {previsiones.map((prevision) => (
                      <SelectItem key={prevision} value={prevision}>
                        {prevision}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterComuna} onValueChange={setFilterComuna}>
                  <SelectTrigger className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300">
                    <SelectValue placeholder="Comuna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las comunas</SelectItem>
                    {comunas.map((comuna) => (
                      <SelectItem key={comuna} value={comuna}>
                        {comuna}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterEstado("todos")
                    setFilterPrevision("todas")
                    setFilterComuna("todas")
                  }}
                >
                  <Filter className="h-4 w-4" />
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                        {patient.nombre} {patient.apellido}
                      </h3>
                    </div>
                  </div>
                  <Badge variant={(patient.estado || "activo") === "activo" ? "default" : "secondary"}>
                    {(patient.estado || "activo") === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">RUT:</span> {patient.rut}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Edad:</span> {calculateAge(patient.fecha_nacimiento)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Previsión:</span> {patient.prevision || "No registrada"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {patient.telefono && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        {patient.telefono}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {patient.email}
                    </div>
                    {patient.ciudad && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {patient.ciudad}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Última visita:</span> {patient.ultimaVisita || "No disponible"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Próxima cita:</span> {patient.proximaCita || "No disponible"}
                    </p>
                  </div>

                  {/* Indicadores de historial médico */}
                  <div className="flex flex-wrap gap-1">
                    {patient.historialMedico ? (
                      <>
                        {patient.historialMedico.alergias?.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                            Alergias
                          </Badge>
                        )}
                        {patient.historialMedico.enfermedadesCronicas?.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                            Enf. Crónicas
                          </Badge>
                        )}
                        {patient.historialMedico.medicamentos?.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Medicamentos
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
                        Sin historial
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/doctor/pacientes/${patient.id}`} className="flex-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300"
                    >
                      Ver Detalles
                    </Button>
                  </Link>
                  <Link href={`/dashboard/doctor/pacientes/${patient.id}/historial`} className="flex-1">
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Historial
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron pacientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterEstado !== "todos" || filterPrevision !== "todas" || filterComuna !== "todas" 
                ? "No hay pacientes que coincidan con los filtros seleccionados." 
                : "No hay pacientes registrados en el sistema."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function PatientsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Estadísticas skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="w-16 h-16 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Filtros skeleton */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
        <div className="flex items-center mb-6">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="ml-4 space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Pacientes skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
