"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, FileText, Download, Trash2, AlertCircle, User, Calendar, RefreshCw, CheckCircle, Package, Cloud, Send, Eye } from "lucide-react"
import { useBlobExams } from "@/lib/api/hooks/use-blob-exams"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { UploadExamModal } from "@/components/examenes/upload-exam-modal"

export default function ExamenesPage() {
  // Estado para sistema de almacenamiento
  const [blobSearchTerm, setBlobSearchTerm] = useState("")
  const [blobFiltroTipo, setBlobFiltroTipo] = useState("todos")
  const [blobFiltroUsuario, setBlobFiltroUsuario] = useState("todos")
  const [selectedBlobExams, setSelectedBlobExams] = useState<string[]>([])
  
  // Estado para modal de subida
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Hooks para sistema de almacenamiento
  const { 
    exams: blobExams, 
    loading: blobLoading, 
    error: blobError, 
    total: blobTotal,
    stats: blobStats,
    refetch: refetchBlob,
    downloadExamFile: downloadBlobFile,
    deleteExam: deleteBlobExam,
    deleteSelectedExams,
    clearError: clearBlobError,
    uploadExam
  } = useBlobExams()

  // Filtros para sistema de almacenamiento
  const filteredBlobExams = blobExams.filter((exam) => {
    const matchesSearch = 
      exam.nombre_paciente?.toLowerCase().includes(blobSearchTerm.toLowerCase()) ||
      exam.tipo_examen.toLowerCase().includes(blobSearchTerm.toLowerCase()) ||
      exam.archivo_nombre_original?.toLowerCase().includes(blobSearchTerm.toLowerCase())
    const matchesTipo = blobFiltroTipo === "todos" || exam.tipo_examen === blobFiltroTipo
    const matchesUsuario = blobFiltroUsuario === "todos" || exam.nombre_paciente?.includes(blobFiltroUsuario)
    return matchesSearch && matchesTipo && matchesUsuario
  })

  // Obtener listas únicas para filtros
  const tiposBlobUnicos = Array.from(new Set(blobExams.map(exam => exam.tipo_examen)))
  const usuariosBlobUnicos = Array.from(new Set(blobExams.map(exam => exam.nombre_paciente).filter(Boolean)))

  const getFileTypeBadgeVariant = (tipo?: string) => {
    if (!tipo) return "outline"
    
    switch (tipo.toLowerCase()) {
      case "imagen médica":
        return "default"
      case "documento pdf":
        return "secondary"
      case "imagen dicom":
        return "default"
      default:
        return "outline"
    }
  }

  // Handlers para sistema de almacenamiento
  const handleBlobDownload = async (blobId: string) => {
    try {
      await downloadBlobFile(blobId)
    } catch (error) {
      console.error("Error al descargar archivo del blob:", error)
    }
  }

  const handleBlobDelete = async (blobId: string) => {
    if (confirm("¿Está seguro de que desea eliminar este examen del sistema?")) {
      const success = await deleteBlobExam(blobId, "Eliminado por médico desde interfaz web")
      if (success) {
        setSelectedBlobExams(prev => prev.filter(id => id !== blobId))
      }
    }
  }

  const handleReenviarExamen = (blobId: string) => {
    // Función placeholder para reenviar examen
    alert("Próximamente: Función para reenviar examen al paciente")
  }

  // Función para verificar si un archivo es visualizable (imagen o PDF)
  const isViewableFile = (fileName?: string) => {
    if (!fileName) return false
    
    const extension = fileName.toLowerCase().split('.').pop()
    const viewableExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf']
    
    return viewableExtensions.includes(extension || '')
  }

  // Función para ver examen en nueva ventana
  const handleVerExamen = async (blobId: string, fileName?: string) => {
    try {
      // Obtener la información del examen que incluye archivo_url
      let examInfo = blobExams.find(exam => exam.id === blobId)
      
      if (!examInfo) {
        throw new Error('No se encontró el examen')
      }
      
      let url = examInfo.archivo_url
      
      // Si no hay URL o la URL puede haber expirado, intentar obtener una fresca
      if (!url) {
        // Refrescar la lista para obtener URLs actualizadas
        await refetchBlob()
        examInfo = blobExams.find(exam => exam.id === blobId)
        url = examInfo?.archivo_url
      }
      
      if (url) {
        // Usar la URL de descarga temporal de Azure directamente
        const newWindow = window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
        
        if (!newWindow) {
          alert("Por favor, permite las ventanas emergentes para ver el examen")
          return
        }
      } else {
        throw new Error('No se pudo obtener la URL del archivo')
      }
    } catch (error) {
      console.error("Error al abrir examen:", error)
      alert("Error al abrir el examen. Puedes intentar descargarlo.")
    }
  }

  // Handlers para selección múltiple
  const handleSelectBlobExam = (blobId: string, checked: boolean) => {
    if (checked) {
      setSelectedBlobExams(prev => [...prev, blobId])
    } else {
      setSelectedBlobExams(prev => prev.filter(id => id !== blobId))
    }
  }

  const handleSelectAllBlobExams = (checked: boolean) => {
    if (checked) {
      setSelectedBlobExams(filteredBlobExams.map(exam => exam.id))
    } else {
      setSelectedBlobExams([])
    }
  }

  // Handlers para acciones masivas
  const handleBulkDelete = async () => {
    if (selectedBlobExams.length === 0) return
    
    if (confirm(`¿Está seguro de que desea eliminar ${selectedBlobExams.length} exámenes seleccionados?`)) {
      const result = await deleteSelectedExams(selectedBlobExams, "Eliminación masiva por médico")
      setSelectedBlobExams([])
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Desconocido"
    const kb = bytes / 1024
    const mb = kb / 1024
    
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`
    } else {
      return `${kb.toFixed(1)} KB`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Exámenes</h1>
          <p className="text-gray-600 mt-1">
            Gestión completa de exámenes médicos de todos los usuarios del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetchBlob} disabled={blobLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${blobLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Subir Examen
          </Button>
        </div>
      </div>

      {/* Header con estadísticas */}
      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
        <Cloud className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold">Sistema de Almacenamiento de Exámenes</h2>
          <p className="text-sm text-gray-600">
            Gestión de {blobTotal} exámenes de todos los usuarios del sistema
          </p>
        </div>
      </div>

      {blobError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {blobError}
            <Button variant="link" size="sm" onClick={clearBlobError} className="ml-2">
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas del sistema de almacenamiento */}
      {blobStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Archivos</p>
                  <p className="text-2xl font-bold">{blobStats.totalFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tamaño Total</p>
                  <p className="text-2xl font-bold">{formatFileSize(blobStats.totalSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-slate-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Usuarios</p>
                  <p className="text-2xl font-bold">{blobStats.usersWithFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-slate-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Recientes</p>
                  <p className="text-2xl font-bold">{blobStats.recentFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros y selección múltiple */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente, tipo o nombre de archivo..."
            value={blobSearchTerm}
            onChange={(e) => setBlobSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={blobFiltroTipo} onValueChange={setBlobFiltroTipo}>
          <SelectTrigger className="w-48">
            <FileText className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Tipo de archivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {tiposBlobUnicos.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={blobFiltroUsuario} onValueChange={setBlobFiltroUsuario}>
          <SelectTrigger className="w-48">
            <User className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los usuarios</SelectItem>
            {usuariosBlobUnicos.map((usuario) => (
              <SelectItem key={usuario} value={usuario}>
                {usuario}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Acciones masivas */}
      {selectedBlobExams.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {selectedBlobExams.length} exámenes seleccionados
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar seleccionados
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedBlobExams([])}
                  className="bg-slate-50 hover:bg-slate-100 border-slate-200"
                >
                  Cancelar selección
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {blobLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
          <span className="ml-2">Cargando exámenes del sistema...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Checkbox para seleccionar todos */}
          {filteredBlobExams.length > 0 && (
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={filteredBlobExams.length > 0 && selectedBlobExams.length === filteredBlobExams.length}
                    onCheckedChange={handleSelectAllBlobExams}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Seleccionar todos ({filteredBlobExams.length} exámenes)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredBlobExams.map((exam) => (
            <Card key={exam.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedBlobExams.includes(exam.id)}
                    onCheckedChange={(checked) => handleSelectBlobExam(exam.id, checked as boolean)}
                  />
                  
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold">{exam.archivo_nombre_original || "Archivo sin nombre"}</h3>
                      <Badge variant={getFileTypeBadgeVariant(exam.tipo_examen)}>
                        {exam.tipo_examen}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {exam.fecha}
                      </Badge>
                      <Badge variant="secondary">
                        {formatFileSize(exam.archivo_tamaño)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm">
                          <strong>Paciente:</strong> {exam.nombre_paciente || "Desconocido"}
                        </p>
                        <p className="text-sm">
                          <strong>Usuario ID:</strong> {exam.paciente_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">
                          <strong>Ruta:</strong> {exam.archivo_path}
                        </p>
                        {exam.descripcion && (
                          <p className="text-sm">
                            <strong>Descripción:</strong> {exam.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBlobDownload(exam.id)}
                      className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReenviarExamen(exam.id)}
                      className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Reenviar
                    </Button>
                    {isViewableFile(exam.archivo_nombre_original) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerExamen(exam.id, exam.archivo_nombre_original)}
                        className="bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBlobDelete(exam.id)}
                      className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredBlobExams.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Cloud className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No hay exámenes en el sistema
                </h3>
                <p className="text-slate-600">
                  No se encontraron exámenes en el sistema con los filtros aplicados.
                  Los usuarios pueden subir exámenes desde sus perfiles de paciente.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal de subida de exámenes */}
      <UploadExamModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={() => {
          refetchBlob()
        }}
        onUpload={uploadExam}
      />
    </div>
  )
}
