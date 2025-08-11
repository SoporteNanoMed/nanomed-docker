"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Filter,
  Trash2,
  Ban,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  User,
  Search,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import {
  doctorsService,
  type AvailabilityBlocksResponse,
  type DateSummary,
  type AvailabilityBlockItem,
} from "@/lib/api/services/doctors.service"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export default function ManageBlocksPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = Number.parseInt(params.id as string)

  // Estados principales
  const [blocks, setBlocks] = useState<AvailabilityBlocksResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados de filtros
  const [dateFilter, setDateFilter] = useState("")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Estados de acciones
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [disableReason, setDisableReason] = useState("")
  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([])
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  // Estados de diálogos
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [blockToDisable, setBlockToDisable] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteMode, setDeleteMode] = useState<"selected" | "filtered" | "available">("selected")

  // Estados de UI
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  // Cargar bloques
  const loadBlocks = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validar que doctorId sea válido
      if (!doctorId || isNaN(doctorId)) {
        throw new Error(`ID de médico inválido: ${doctorId}`)
      }

      const filters: any = {}
      if (dateFilter) filters.fecha = dateFilter
      if (dateFromFilter) filters.fecha_desde = dateFromFilter
      if (dateToFilter) filters.fecha_hasta = dateToFilter

      let response
      try {
        // Intentar con el método principal
        if (typeof doctorsService.getDoctorAvailabilityBlocks === "function") {
          response = await doctorsService.getDoctorAvailabilityBlocks(doctorId, filters)
        } else if (typeof doctorsService.getAvailabilityBlocks === "function") {
          response = await doctorsService.getAvailabilityBlocks(doctorId, filters)
        } else {
          throw new Error("Ningún método de consulta de bloques está disponible")
        }
      } catch (methodError) {
        console.error("Error al llamar método del servicio:", methodError)
        throw methodError
      }

      if (response.success && response.data) {
        setBlocks(response.data)

        // Auto-expandir fechas si hay pocas
        if (response.data.resumen_por_fecha && response.data.resumen_por_fecha.length <= 7) {
          const allDates = new Set(response.data.resumen_por_fecha.map((d) => d.fecha))
          setExpandedDates(allDates)
        }
      } else if (!response.error && response.body) {
        setBlocks(response.body)
      } else {
        // Manejar diferentes tipos de error
        let errorMessage = "Error al cargar los bloques"

        if (response.status === 404) {
          errorMessage = "Médico no encontrado. Verifique que el ID del médico sea correcto."
        } else if (response.status === 400) {
          errorMessage = "Formato de fecha inválido. Verifique las fechas ingresadas."
        } else if (response.status === 403) {
          errorMessage = "No tiene permisos para consultar los bloques de este médico."
        } else if (response.status === 500) {
          errorMessage = "Error interno del servidor. Contacte al administrador."
        } else if (response.error) {
          errorMessage = typeof response.error === "string" ? response.error : response.message || errorMessage
        }

        console.error("❌ Error en la respuesta:", errorMessage)
        setError(errorMessage)
      }
    } catch (err) {
      console.error("=== ERROR DE CONEXIÓN ===")
      console.error("Error object:", err)
      console.error("Error name:", err?.name)
      console.error("Error message:", err?.message)
      console.error("Error stack:", err?.stack)
      console.error("========================")

      let errorMessage = "Error de conexión al consultar bloques"

      if (err instanceof Error) {
        if (err.message.includes("fetch")) {
          errorMessage = "Error de red: No se pudo conectar con el servidor. Verifique su conexión a internet."
        } else if (err.message.includes("timeout")) {
          errorMessage = "Tiempo de espera agotado: El servidor tardó demasiado en responder."
        } else if (err.message.includes("ID de médico inválido")) {
          errorMessage = err.message
        } else {
          errorMessage = `Error de conexión: ${err.message}`
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Cargar bloques al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadBlocks()
  }, [doctorId, dateFilter, dateFromFilter, dateToFilter])

  // Obtener todos los bloques para filtrado
  const getAllBlocks = (): AvailabilityBlockItem[] => {
    if (!blocks?.resumen_por_fecha) return []
    return blocks.resumen_por_fecha.flatMap((dateSum) => dateSum.bloques)
  }

  // Filtrar bloques por término de búsqueda y disponibilidad
  const getFilteredDateSummaries = (): DateSummary[] => {
    if (!blocks?.resumen_por_fecha) return []

    return blocks.resumen_por_fecha
      .map((dateSummary) => {
        let filteredBlocks = dateSummary.bloques

        // Filtrar por disponibilidad
        if (availabilityFilter === "available") {
          filteredBlocks = filteredBlocks.filter((block) => block.disponible && !block.cita_reservada)
        } else if (availabilityFilter === "unavailable") {
          filteredBlocks = filteredBlocks.filter((block) => !block.disponible)
        } else if (availabilityFilter === "occupied") {
          filteredBlocks = filteredBlocks.filter((block) => block.cita_reservada)
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          filteredBlocks = filteredBlocks.filter((block) => {
            try {
              const timeRange = `${block.hora_inicio} - ${block.hora_fin}`
              const patientName = block.cita_reservada
                ? `${block.cita_reservada.paciente_nombre} ${block.cita_reservada.paciente_apellido}`
                : ""
              const reason = block.motivo_no_disponible || ""

              return (
                timeRange.includes(searchLower) ||
                patientName.toLowerCase().includes(searchLower) ||
                reason.toLowerCase().includes(searchLower)
              )
            } catch (error) {
              console.error("Error filtering block:", error, block)
              return false
            }
          })
        }

        return {
          ...dateSummary,
          bloques: filteredBlocks,
        }
      })
      .filter((dateSummary) => dateSummary.bloques.length > 0) // Solo mostrar fechas con bloques
  }

  // Habilitar bloque
  const handleEnableBlock = async (blockId: number) => {
    try {
      setActionLoading(blockId)
      const response = await doctorsService.enableAvailabilityBlock(blockId)

      if (response.success) {
        await loadBlocks()
      } else {
        setError(response.error || "Error al habilitar el bloque")
      }
    } catch (err) {
      setError("Error de conexión al habilitar el bloque")
    } finally {
      setActionLoading(null)
    }
  }

  // Deshabilitar bloque
  const handleDisableBlock = async () => {
    if (!blockToDisable || !disableReason.trim()) return

    try {
      setActionLoading(blockToDisable)
      const response = await doctorsService.disableAvailabilityBlock(blockToDisable, disableReason)

      if (response.success) {
        await loadBlocks()
        setDisableDialogOpen(false)
        setBlockToDisable(null)
        setDisableReason("")
      } else {
        setError(response.error || "Error al deshabilitar el bloque")
      }
    } catch (err) {
      setError("Error de conexión al deshabilitar el bloque")
    } finally {
      setActionLoading(null)
    }
  }

  // Eliminar bloques
  const handleDeleteBlocks = async () => {
    try {
      setBulkDeleteLoading(true)
      const filters: any = {}

      if (deleteMode === "selected") {
        if (selectedBlocks.length === 0) {
          setError("Seleccione al menos un bloque para eliminar")
          return
        }
        filters.bloque_ids = selectedBlocks
      } else if (deleteMode === "filtered") {
        if (dateFilter) filters.fecha = dateFilter
        if (dateFromFilter) filters.fecha_desde = dateFromFilter
        if (dateToFilter) filters.fecha_hasta = dateToFilter
      } else if (deleteMode === "available") {
        filters.solo_disponibles = true
        if (dateFromFilter) filters.fecha_desde = dateFromFilter
        if (dateToFilter) filters.fecha_hasta = dateToFilter
      }

      const response = await doctorsService.deleteAvailabilityBlocks(doctorId, filters)

      if (response.success) {
        await loadBlocks()
        setDeleteDialogOpen(false)
        setSelectedBlocks([])
      } else {
        setError(response.error || "Error al eliminar los bloques")
      }
    } catch (err) {
      setError("Error de conexión al eliminar los bloques")
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  // Manejar selección de bloques
  const handleBlockSelection = (blockId: number, checked: boolean) => {
    if (checked) {
      setSelectedBlocks((prev) => [...prev, blockId])
    } else {
      setSelectedBlocks((prev) => prev.filter((id) => id !== blockId))
    }
  }

  // Seleccionar todos los bloques disponibles visibles
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const availableBlocks = getAllBlocks()
        .filter((block) => block.disponible && !block.cita_reservada)
        .map((block) => block.id)
      setSelectedBlocks(availableBlocks)
    } else {
      setSelectedBlocks([])
    }
  }

  // Toggle expandir fecha
  const toggleDateExpansion = (fecha: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(fecha)) {
      newExpanded.delete(fecha)
    } else {
      newExpanded.add(fecha)
    }
    setExpandedDates(newExpanded)
  }

  // Obtener badge de estado del bloque
  const getBlockStatusBadge = (block: AvailabilityBlockItem) => {
    if (block.cita_reservada) {
      return <Badge variant="default">Con Cita</Badge>
    } else if (block.disponible) {
      return <Badge variant="secondary">Disponible</Badge>
    } else {
      return <Badge variant="destructive">No Disponible</Badge>
    }
  }

  if (loading && !blocks) {
    return <LoadingSkeleton />
  }

  const filteredDateSummaries = getFilteredDateSummaries()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestionar Bloques de Disponibilidad</h1>
          {blocks && (
            <p className="text-gray-600">
              {blocks.medico.nombre} {blocks.medico.apellido}
            </p>
          )}
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={loadBlocks} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              console.log("=== INFORMACIÓN DE DEBUG ===")
              console.log("Doctor ID:", doctorId)
              console.log("Doctor ID type:", typeof doctorId)
              console.log("Doctor ID valid:", !isNaN(doctorId))
              console.log("API Base URL:", doctorsService.apiClient?.apiBaseURL)
              console.log("Auth Token exists:", !!doctorsService.apiClient?.authToken)
              console.log("Current filters:", {
                dateFilter,
                dateFromFilter,
                dateToFilter,
                availabilityFilter,
              })
              console.log("Current blocks:", blocks)
              console.log("Current error:", error)
              console.log("Loading state:", loading)
              console.log("============================")
            }}
          >
            Debug Info
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={() => setError(null)} className="ml-2">
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      {blocks && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Bloques</p>
                  <p className="text-2xl font-bold">{blocks.total_bloques || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Disponibles</p>
                  <p className="text-2xl font-bold">{blocks.bloques_disponibles || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Con Citas</p>
                  <p className="text-2xl font-bold">{blocks.bloques_ocupados || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">No Disponibles</p>
                  <p className="text-2xl font-bold">{blocks.bloques_no_disponibles || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rango de fechas */}
      {blocks?.rango_fechas && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Mostrando bloques desde {format(parseISO(blocks.rango_fechas.inicio), "dd/MM/yyyy", { locale: es })}{" "}
                hasta {format(parseISO(blocks.rango_fechas.fin), "dd/MM/yyyy", { locale: es })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date-filter">Fecha específica</Label>
              <Input id="date-filter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="date-from">Fecha desde</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date-to">Fecha hasta</Label>
              <Input id="date-to" type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="availability-filter">Estado</Label>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponibles</SelectItem>
                  <SelectItem value="occupied">Con Citas</SelectItem>
                  <SelectItem value="unavailable">No Disponibles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Buscar por hora, paciente o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDateFilter("")
                setDateFromFilter("")
                setDateToFilter("")
                setAvailabilityFilter("all")
                setSearchTerm("")
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Acciones masivas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Acciones Masivas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedBlocks.length > 0 &&
                  selectedBlocks.length === getAllBlocks().filter((b) => b.disponible && !b.cita_reservada).length
                }
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all">
                Seleccionar todos los disponibles ({selectedBlocks.length} seleccionados)
              </Label>
            </div>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={selectedBlocks.length === 0}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Seleccionados
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar Bloques</DialogTitle>
                  <DialogDescription>Seleccione el tipo de eliminación que desea realizar.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="delete-selected"
                        name="delete-mode"
                        checked={deleteMode === "selected"}
                        onChange={() => setDeleteMode("selected")}
                      />
                      <Label htmlFor="delete-selected">Eliminar bloques seleccionados ({selectedBlocks.length})</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="delete-filtered"
                        name="delete-mode"
                        checked={deleteMode === "filtered"}
                        onChange={() => setDeleteMode("filtered")}
                      />
                      <Label htmlFor="delete-filtered">Eliminar todos los bloques con filtros actuales</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="delete-available"
                        name="delete-mode"
                        checked={deleteMode === "available"}
                        onChange={() => setDeleteMode("available")}
                      />
                      <Label htmlFor="delete-available">Eliminar solo bloques disponibles (sin citas)</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteBlocks} disabled={bulkDeleteLoading}>
                    {bulkDeleteLoading ? "Eliminando..." : "Eliminar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Lista de bloques agrupados por fecha */}
      <Card>
        <CardHeader>
          <CardTitle>Bloques de Disponibilidad por Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDateSummaries.length > 0 ? (
            <div className="space-y-4">
              {filteredDateSummaries.map((dateSummary) => (
                <div key={dateSummary.fecha} className="border rounded-lg">
                  {/* Header de fecha */}
                  <div
                    className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleDateExpansion(dateSummary.fecha)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedDates.has(dateSummary.fecha) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <h3 className="font-medium">
                            {format(parseISO(dateSummary.fecha), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                          </h3>
                          <p className="text-sm text-gray-600">{dateSummary.total_bloques} bloques total</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{dateSummary.bloques_disponibles} disponibles</Badge>
                        <Badge variant="default">{dateSummary.bloques_ocupados} con citas</Badge>
                        <Badge variant="destructive">{dateSummary.bloques_no_disponibles} no disponibles</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Bloques de la fecha */}
                  {expandedDates.has(dateSummary.fecha) && (
                    <div className="p-4 space-y-2">
                      {dateSummary.bloques.map((block) => (
                        <div
                          key={block.id}
                          className={`p-3 border rounded-lg ${
                            block.cita_reservada
                              ? "border-purple-200 bg-purple-50"
                              : block.disponible
                                ? "border-green-200 bg-green-50"
                                : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {block.disponible && !block.cita_reservada && (
                                <Checkbox
                                  checked={selectedBlocks.includes(block.id)}
                                  onCheckedChange={(checked) => handleBlockSelection(block.id, checked as boolean)}
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {block.hora_inicio} - {block.hora_fin}
                                  </span>
                                  {getBlockStatusBadge(block)}
                                </div>
                                {block.cita_reservada && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <User className="h-3 w-3 text-purple-600" />
                                    <span className="text-sm text-purple-700">
                                      {block.cita_reservada.paciente_nombre} {block.cita_reservada.paciente_apellido}
                                    </span>
                                  </div>
                                )}
                                {block.motivo_no_disponible && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                    <span className="text-sm text-red-700">{block.motivo_no_disponible}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {block.disponible && !block.cita_reservada ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setBlockToDisable(block.id)
                                    setDisableDialogOpen(true)
                                  }}
                                  disabled={actionLoading === block.id}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Deshabilitar
                                </Button>
                              ) : !block.disponible ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEnableBlock(block.id)}
                                  disabled={actionLoading === block.id}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Habilitar
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron bloques</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || dateFilter || dateFromFilter || dateToFilter || availabilityFilter !== "all"
                  ? "Intente ajustar los filtros de búsqueda."
                  : "No hay bloques de disponibilidad para este médico en el rango seleccionado."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para deshabilitar bloque */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deshabilitar Bloque</DialogTitle>
            <DialogDescription>
              Ingrese el motivo por el cual desea deshabilitar este bloque de disponibilidad.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="disable-reason">Motivo</Label>
              <Textarea
                id="disable-reason"
                placeholder="Ej: Emergencia médica, Reunión administrativa, etc."
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDisableBlock} disabled={!disableReason.trim() || actionLoading !== null}>
              Deshabilitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-20" />
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-24 ml-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg">
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
