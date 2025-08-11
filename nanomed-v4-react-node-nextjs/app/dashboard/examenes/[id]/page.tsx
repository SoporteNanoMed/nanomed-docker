"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FileText, Download, ArrowLeft, Save, AlertCircle, CheckCircle, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { examsService } from "@/lib/api/services/exams.service"
import { hasPermission } from "@/lib/utils/permissions"
import type { Exam, UpdateExamRequest } from "@/lib/api/types"

export default function ExamDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [examData, setExamData] = useState<UpdateExamRequest>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Estados de exámenes
  const examStates = ["pendiente", "en_proceso", "completado", "cancelado"]

  useEffect(() => {
    if (params.id) {
      loadExam(params.id) // Ya no convertir a número, usar string directamente
    }
  }, [params.id])

  const loadExam = async (examId: string) => { // Cambiar parameter de number a string
    try {
      setLoading(true)
      const response = await examsService.getExamById(examId)

      if (!response.error) {
        setExam(response.body)
        setExamData({
          tipo_examen: response.body.tipo_examen,
          fecha: response.body.fecha,
          descripcion: response.body.descripcion,
          resultados: response.body.resultados,
          estado: response.body.estado,
        })
      } else {
        setError("Error al cargar el examen")
      }
    } catch (err) {
      console.error("Error fetching exam:", err)
      setError("Error al cargar el examen")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setExamData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setExamData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const updateExam = async () => {
    if (!exam) return

    try {
      setUpdating(true)
      setError(null)

      const response = await examsService.updateExam(exam.id, examData)

      if (!response.error) {
        setSuccess("Examen actualizado exitosamente")
        setExam({
          ...exam,
          ...examData,
        })
        setEditMode(false)

        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        setError(response.message || "Error al actualizar el examen")
      }
    } catch (err) {
      console.error("Error updating exam:", err)
      setError("Error al actualizar el examen")
    } finally {
      setUpdating(false)
    }
  }

  const deleteExam = async () => {
    if (!exam) return

    if (!confirm("¿Está seguro que desea eliminar este examen? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setDeleting(true)
      setError(null)

      // Aquí iría la llamada a la API para eliminar el examen
      // const response = await examsService.deleteExam(exam.id)

      // Simulamos una respuesta exitosa
      const response = { error: false }

      if (!response.error) {
        setSuccess("Examen eliminado exitosamente")

        // Redirigir después de 1 segundo
        setTimeout(() => {
          router.push("/dashboard/examenes/manage")
        }, 1000)
      } else {
        setError("Error al eliminar el examen")
        setDeleting(false)
      }
    } catch (err) {
      console.error("Error deleting exam:", err)
      setError("Error al eliminar el examen")
      setDeleting(false)
    }
  }

  const downloadExam = async () => {
    if (!exam) return

    try {
      const blob = await examsService.downloadExamFile(exam.id)

      // Crear URL para descargar
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = exam.archivo_nombre_original || `examen-${exam.id}.pdf`
      document.body.appendChild(a)
      a.click()

      // Limpiar
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error downloading exam:", err)
      setError("Error al descargar el archivo del examen")
    }
  }

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null

    const statusMap: Record<string, { color: string; label: string }> = {
      pendiente: { color: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
      en_proceso: { color: "bg-blue-100 text-blue-800", label: "En Proceso" },
      completado: { color: "bg-green-100 text-green-800", label: "Completado" },
      cancelado: { color: "bg-red-100 text-red-800", label: "Cancelado" },
    }

    const statusInfo = statusMap[status] || { color: "bg-gray-100 text-gray-800", label: status }

    return (
      <Badge variant="outline" className={`${statusInfo.color}`}>
        {statusInfo.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-8 w-8 mr-2" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se pudo cargar la información del examen. {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const canUpdateExam = user && hasPermission(user, "canUpdateExams")
  const canDeleteExam = user && hasPermission(user, "canDeleteExams")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        {exam.archivo_path && (
          <Button variant="outline" onClick={downloadExam}>
            <Download className="mr-2 h-4 w-4" />
            Descargar Archivo
          </Button>
        )}
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {exam.tipo_examen}
                {exam.estado && getStatusBadge(exam.estado)}
              </CardTitle>
              <CardDescription>
                Examen #{exam.id} • Fecha: {new Date(exam.fecha).toLocaleDateString("es-ES")}
              </CardDescription>
            </div>
            {canUpdateExam && !editMode && (
              <Button onClick={() => setEditMode(true)} variant="outline">
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Paciente</h3>
              <p className="font-medium">
                {exam.paciente?.nombre} {exam.paciente?.apellido}
              </p>
              {exam.paciente?.rut && <p className="text-sm text-gray-500">RUT: {exam.paciente.rut}</p>}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Médico</h3>
              <p className="font-medium">
                {exam.medico?.nombre} {exam.medico?.apellido}
              </p>
              {exam.medico?.especialidad && <p className="text-sm text-gray-500">{exam.medico.especialidad}</p>}
            </div>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_examen">Tipo de Examen</Label>
                  <Select
                    value={examData.tipo_examen}
                    onValueChange={(value) => handleSelectChange("tipo_examen", value)}
                  >
                    <SelectTrigger id="tipo_examen">
                      <SelectValue placeholder="Seleccione tipo de examen" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha del Examen</Label>
                  <Input id="fecha" name="fecha" type="date" value={examData.fecha} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={examData.descripcion || ""}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultados">Resultados</Label>
                <Textarea
                  id="resultados"
                  name="resultados"
                  value={examData.resultados || ""}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Ingrese los resultados del examen..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={examData.estado || ""} onValueChange={(value) => handleSelectChange("estado", value)}>
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {examStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state.charAt(0).toUpperCase() + state.slice(1).replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="archivo">Reemplazar Archivo (opcional)</Label>
                <Input
                  id="archivo"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.zip,.rar"
                />
                <p className="text-xs text-gray-500">Formatos aceptados: PDF, JPG, PNG, DOC, DOCX, ZIP, RAR</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                <p className="whitespace-pre-wrap">{exam.descripcion || "Sin descripción"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Resultados</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="whitespace-pre-wrap">{exam.resultados || "Sin resultados registrados"}</p>
                </div>
              </div>

              {exam.archivo_path && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Archivo</h3>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{exam.archivo_nombre_original || "Archivo adjunto"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
              <Button onClick={updateExam} disabled={updating} className="bg-cyan-500 hover:bg-cyan-600">
                {updating ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {canDeleteExam && (
                <Button variant="destructive" onClick={deleteExam} disabled={deleting}>
                  {deleting ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar Examen
                    </>
                  )}
                </Button>
              )}
              <div></div> {/* Spacer */}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
