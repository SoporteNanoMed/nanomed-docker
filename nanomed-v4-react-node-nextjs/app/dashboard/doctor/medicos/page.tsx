"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, User, Mail, Phone, MapPin, Calendar, AlertCircle, RefreshCw } from "lucide-react"
import { useMedicos } from "@/lib/api/hooks/use-doctors"
import { useAuth } from "@/lib/api/hooks/use-auth"

export default function MedicosPage() {
  const { medicos, total, loading, error, refetch } = useMedicos()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("")

  // Filtrar médicos
  const filteredMedicos =
    medicos?.filter((medico) => {
      const matchesSearch =
        medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medico.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medico.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (medico.especialidad && medico.especialidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (medico.rut && medico.rut.includes(searchTerm))

      return matchesSearch
    }) || []

  if (loading) {
    return <MedicosLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Profesionales de la salud</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Gestiona y visualiza la información de los médicos registrados
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Médicos</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Gestiona y visualiza la información de los médicos registrados
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
        </div>
      </div>

      {/* Indicadores de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total de Médicos */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600 mb-2">Total de Médicos</p>
                <p className="text-3xl font-bold text-cyan-900">{filteredMedicos.length}</p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Médicos Activos */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">Médicos Activos</p>
                <p className="text-3xl font-bold text-green-900">
                  {filteredMedicos.filter(medico => medico.activo).length}
                </p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Mail className="w-8 h-8 text-white" />
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
                <p className="text-sm font-medium text-orange-600 mb-2">Resultados Filtrados</p>
                <p className="text-3xl font-bold text-orange-900">
                  {searchTerm ? filteredMedicos.length : medicos?.length || 0}
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
                <p className="text-sm text-gray-600">Busca y filtra profesionales de la salud</p>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nombre, apellido, email, especialidad o RUT..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de médicos */}
      <div className="grid gap-6">
        {filteredMedicos.length > 0 ? (
          filteredMedicos.map((medico) => (
            <div key={medico.id} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-100 shadow-lg group-hover:shadow-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                      {medico.foto_perfil ? (
                        <img
                          src={medico.foto_perfil}
                          alt={`${medico.nombre} ${medico.apellido}`}
                          className="w-16 h-16 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>'
                            }
                          }}
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                          Dr. {medico.nombre} {medico.apellido}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {medico.email}
                          </span>
                          {medico.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {medico.telefono}
                            </span>
                          )}
                          {medico.rut && <span>RUT: {medico.rut}</span>}
                        </div>
                      </div>

                      {medico.especialidad && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-blue-600">
                            {medico.especialidad}
                          </div>
                          {medico.subespecialidad && (
                            <div className="text-xs text-gray-500">
                              {medico.subespecialidad}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge variant={medico.activo ? "default" : "secondary"}>
                          {medico.activo ? "Activo" : "Inactivo"}
                        </Badge>
                        {medico.especialidad && <Badge variant="outline">{medico.especialidad}</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link href={`/dashboard/doctor/medicos/${medico.id}`}>
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Ver Perfil
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron médicos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Intente con otros términos de búsqueda." : "No hay médicos registrados en el sistema."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MedicosLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
