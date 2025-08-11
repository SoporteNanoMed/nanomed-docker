"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ExamenCard, type Examen } from "@/components/examenes/examen-card"
import { Search, RefreshCw, AlertCircle } from "lucide-react"
import { examsService } from "@/lib/api/services/exams.service"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import LoadTestScript from "./load-test-script"

export default function ExamenesPage() {
  const [examenes, setExamenes] = useState<Examen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroFecha, setFiltroFecha] = useState("todos")

  // Función para adaptar los datos del API al formato esperado por el componente
  const adaptarExamenDesdeAPI = (examenAPI: any): Examen => {
    // Determinar el tipo basado en si tiene archivo y su extensión
    let tipo: "imagen" | "pdf" | "codigo" = "pdf"
    let archivoUrl = ""
    
    // Manejar archivos desde Azure Blob Storage
    if (examenAPI.archivo_url) {
      // Archivo en Azure Blob Storage
      archivoUrl = examenAPI.archivo_url
      const extension = archivoUrl.toLowerCase().split(".").pop()
      if (extension && ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
        tipo = "imagen"
      } else if (extension && ["js", "ts", "jsx", "tsx", "html", "css", "scss", "py", "java", "cpp", "c", "php", "rb", "go", "rs", "swift", "kt", "dart", "vue", "svelte", "json", "xml", "yaml", "yml", "sql", "sh", "bat", "ps1", "zip", "rar", "dicom"].includes(extension)) {
        tipo = "codigo"
      }
    } else if (examenAPI.archivo_path) {
      // Archivo local (fallback)
      archivoUrl = examenAPI.archivo_path
      const extension = archivoUrl.toLowerCase().split(".").pop()
      if (extension && ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
        tipo = "imagen"
      } else if (extension && ["js", "ts", "jsx", "tsx", "html", "css", "scss", "py", "java", "cpp", "c", "php", "rb", "go", "rs", "swift", "kt", "dart", "vue", "svelte", "json", "xml", "yaml", "yml", "sql", "sh", "bat", "ps1", "zip", "rar", "dicom"].includes(extension)) {
        tipo = "codigo"
      }
    }

    // Formatear la fecha
    const fecha = examenAPI.fecha
      ? new Date(examenAPI.fecha).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]

    // Determinar el título del examen
    let titulo = examenAPI.tipo_examen || "Examen médico"
    
    // Si es un examen del blob storage, usar el nombre del archivo
    if (examenAPI.es_blob_storage && archivoUrl) {
      // Extraer el nombre del archivo sin la extensión
      const nombreArchivo = archivoUrl.split('/').pop() || archivoUrl
      const nombreSinExtension = nombreArchivo.replace(/\.[^/.]+$/, "")
      
      // Formatear la fecha para mostrar
      const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      
      titulo = `${nombreSinExtension} | ${fechaFormateada}`
    }

    return {
      id: examenAPI.id?.toString() || "",
      titulo: titulo,
      fecha: fecha,
      tipo: tipo,
      url: archivoUrl || "/placeholder.svg?height=400&width=600",
      thumbnail: tipo === "imagen" ? archivoUrl : undefined,
      descripcion: examenAPI.descripcion || examenAPI.resultados || "Sin descripción disponible",
      medico: examenAPI.nombre_medico || "Médico no especificado",
      especialidad: "Medicina General", // No viene en la respuesta, usar valor por defecto
      esBlobStorage: examenAPI.es_blob_storage || false,
    }
  }

  // Función para cargar los exámenes
  const cargarExamenes = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await examsService.getExams()

      if (response.error) {
        throw new Error(response.message || "Error al cargar los exámenes")
      }

      // La respuesta del backend tiene la estructura: { examenes: [...], total: number, ... }
      const examenesAdaptados = response.body.examenes?.map(adaptarExamenDesdeAPI) || []
      setExamenes(examenesAdaptados)
      setTotal(response.body.total || 0)
    } catch (err) {
      console.error("Error al cargar exámenes:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al cargar los exámenes")
      setExamenes([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // Cargar exámenes al montar el componente
  useEffect(() => {
    cargarExamenes()
  }, [])

  // Filtrar exámenes según los criterios
  const examenesFiltrados = examenes.filter((examen) => {
    // Filtro por búsqueda
    const coincideBusqueda =
      examen.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      examen.medico.toLowerCase().includes(busqueda.toLowerCase()) ||
      examen.especialidad.toLowerCase().includes(busqueda.toLowerCase())

    // Filtro por tipo
    const coincideTipo = filtroTipo === "todos" || examen.tipo === filtroTipo

    // Filtro por fecha
    let coincideFecha = true
    if (filtroFecha !== "todos") {
      const fechaExamen = new Date(examen.fecha)
      const hoy = new Date()

      if (filtroFecha === "mes") {
        const unMesAtras = new Date()
        unMesAtras.setMonth(hoy.getMonth() - 1)
        coincideFecha = fechaExamen >= unMesAtras
      } else if (filtroFecha === "trimestre") {
        const tresMesesAtras = new Date()
        tresMesesAtras.setMonth(hoy.getMonth() - 3)
        coincideFecha = fechaExamen >= tresMesesAtras
      } else if (filtroFecha === "anio") {
        const unAnioAtras = new Date()
        unAnioAtras.setFullYear(hoy.getFullYear() - 1)
        coincideFecha = fechaExamen >= unAnioAtras
      }
    }

    return coincideBusqueda && coincideTipo && coincideFecha
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Exámenes</h1>
          <p className="text-gray-500">Visualiza y descarga tus exámenes médicos</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <LoadTestScript />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Exámenes</h1>
          <p className="text-gray-500">
            Visualiza y descarga tus exámenes médicos
            {total > 0 && ` (${total} exámenes)`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={cargarExamenes}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={cargarExamenes} className="ml-4">
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título, médico o especialidad"
              className="pl-9"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de examen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="imagen">Imágenes</SelectItem>
                <SelectItem value="pdf">Documentos PDF</SelectItem>
                <SelectItem value="codigo">Paquetes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroFecha} onValueChange={setFiltroFecha}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los períodos</SelectItem>
                <SelectItem value="mes">Último mes</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
                <SelectItem value="anio">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="mb-6 bg-gray-100/50 border border-gray-200 p-0 rounded-lg grid grid-cols-4 w-full h-12 overflow-hidden">
            <TabsTrigger 
              value="todos"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium rounded-l-md border-r border-gray-200/50"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="imagenes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium border-r border-gray-200/50"
            >
              Imágenes
            </TabsTrigger>
            <TabsTrigger 
              value="documentos"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium border-r border-gray-200/50"
            >
              Documentos
            </TabsTrigger>
            <TabsTrigger 
              value="codigo"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium rounded-r-md"
            >
              Paquetes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="todos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examenesFiltrados.length > 0 ? (
                examenesFiltrados.map((examen) => <ExamenCard key={examen.id} examen={examen} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    {examenes.length === 0
                      ? "No tienes exámenes médicos registrados aún."
                      : "No se encontraron exámenes con los filtros seleccionados."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="imagenes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examenesFiltrados.filter((e) => e.tipo === "imagen").length > 0 ? (
                examenesFiltrados
                  .filter((e) => e.tipo === "imagen")
                  .map((examen) => <ExamenCard key={examen.id} examen={examen} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    {examenes.filter((e) => e.tipo === "imagen").length === 0
                      ? "No tienes exámenes de imágenes registrados aún."
                      : "No se encontraron imágenes con los filtros seleccionados."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="documentos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examenesFiltrados.filter((e) => e.tipo === "pdf").length > 0 ? (
                examenesFiltrados
                  .filter((e) => e.tipo === "pdf")
                  .map((examen) => <ExamenCard key={examen.id} examen={examen} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    {examenes.filter((e) => e.tipo === "pdf").length === 0
                      ? "No tienes exámenes de documentos registrados aún."
                      : "No se encontraron documentos con los filtros seleccionados."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="codigo">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examenesFiltrados.filter((e) => e.tipo === "codigo").length > 0 ? (
                examenesFiltrados
                  .filter((e) => e.tipo === "codigo")
                  .map((examen) => <ExamenCard key={examen.id} examen={examen} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    {examenes.filter((e) => e.tipo === "codigo").length === 0
                      ? "No tienes paquetes registrados aún."
                      : "No se encontraron paquetes con los filtros seleccionados."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
