"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { useRouter } from "next/navigation"
import { examsService } from "@/lib/api/services/exams.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Search, RefreshCw, Download, Eye, Info, Upload } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Tipos
interface Exam {
  id: string // Cambiado a string para blob storage
  paciente_id: number
  tipo_examen: string
  fecha: string
  descripcion?: string
  estado: string
  archivo_nombre_original?: string
  nombre_paciente?: string
  email_paciente?: string
  nombre_medico?: string
  creado_en: string
  es_blob_storage?: boolean
}

export default function ManageExamsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExamType, setSelectedExamType] = useState<string>("")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Tipos de exámenes disponibles
  const examTypes = [
    "Hemograma",
    "Perfil Bioquímico", 
    "Perfil Lipídico",
    "Radiografía",
    "Ecografía",
    "Tomografía Computarizada",
    "Resonancia Magnética",
    "Electrocardiograma",
    "Endoscopía",
    "Colonoscopía",
    "Mamografía",
    "Densitometría Ósea",
    "Audiometría",
    "Espirometría",
    "Test de Esfuerzo",
  ]

  useEffect(() => {
    loadExams()
  }, [user])

  const loadExams = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await examsService.getExams({ medico_id: user.id })

      if (!response.error) {
        // El response ahora viene con la estructura: { examenes: [...], total: number }
        const examenes = response.body?.examenes || response.body || []
        setExams(examenes)
      } else {
        setError("Error al cargar los exámenes")
      }
    } catch (err) {
      console.error("Error fetching exams:", err)
      setError("Error al cargar los exámenes")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!user) return

    try {
      setLoading(true)

      const filters: any = { medico_id: user.id }

      if (selectedExamType) {
        filters.tipo_examen = selectedExamType
      }

      if (dateRange.from) {
        filters.fecha_desde = dateRange.from
      }

      if (dateRange.to) {
        filters.fecha_hasta = dateRange.to
      }

      const response = await examsService.getExams(filters)

      if (!response.error) {
        // Filtrar por término de búsqueda en el cliente
        let filteredExams = response.body?.examenes || response.body || []

        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          filteredExams = filteredExams.filter(
            (exam: any) =>
              exam.nombre_paciente?.toLowerCase().includes(term) ||
              exam.tipo_examen.toLowerCase().includes(term) ||
              exam.descripcion?.toLowerCase().includes(term),
          )
        }

        setExams(filteredExams)
      } else {
        setError("Error al buscar exámenes")
      }
    } catch (err) {
      console.error("Error searching exams:", err)
      setError("Error al buscar exámenes")
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedExamType("")
    setDateRange({ from: "", to: "" })
    loadExams()
  }

  const downloadExam = async (examId: string, fileName: string) => {
    try {
      await examsService.downloadExamFile(examId)
    } catch (err) {
      console.error("Error downloading exam:", err)
      setError("Error al descargar el examen")
    }
  }

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", variant: "secondary" as const },
      completado: { label: "Completado", variant: "default" as const },
      en_proceso: { label: "En Proceso", variant: "outline" as const },
      cancelado: { label: "Cancelado", variant: "destructive" as const },
    }

    const config = statusConfig[estado as keyof typeof statusConfig] || statusConfig.pendiente
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Filtrar exámenes según los criterios
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = searchTerm === "" || 
      exam.nombre_paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.tipo_examen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedExamType === "" || exam.tipo_examen === selectedExamType

    const matchesDateFrom = !dateRange.from || new Date(exam.fecha) >= new Date(dateRange.from)
    const matchesDateTo = !dateRange.to || new Date(exam.fecha) <= new Date(dateRange.to)

    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo
  })

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Exámenes</h1>
          <p className="text-gray-500">
            Administra y visualiza exámenes médicos
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadExams}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Aviso sobre la nueva gestión de exámenes */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Información:</strong> La creación de exámenes ahora se gestiona directamente a través de blob storage. 
          Los exámenes se suben directamente como archivos al sistema de almacenamiento.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>Utiliza los filtros para encontrar exámenes específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Input
                placeholder="Buscar por paciente o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de examen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  {examTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                type="date"
                placeholder="Fecha desde"
                value={dateRange.from}
                onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
              />
            </div>

            <div>
              <Input
                type="date"
                placeholder="Fecha hasta"
                value={dateRange.to}
                onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} disabled={loading} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de exámenes */}
      <Card>
        <CardHeader>
          <CardTitle>Exámenes ({filteredExams.length})</CardTitle>
          <CardDescription>Lista de todos los exámenes encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2">Cargando exámenes...</span>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron exámenes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo de Examen</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exam.nombre_paciente || "N/A"}</div>
                          <div className="text-sm text-gray-500">{exam.email_paciente}</div>
                        </div>
                      </TableCell>
                      <TableCell>{exam.tipo_examen}</TableCell>
                      <TableCell>
                        {format(new Date(exam.fecha), "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>{getStatusBadge(exam.estado)}</TableCell>
                      <TableCell>
                        {exam.archivo_nombre_original ? (
                          <div className="text-sm">
                            <div className="font-medium">{exam.archivo_nombre_original}</div>
                            {exam.es_blob_storage && (
                              <div className="text-xs text-blue-600">Blob Storage</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin archivo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/examenes/${exam.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {exam.archivo_nombre_original && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadExam(exam.id, exam.archivo_nombre_original!)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
