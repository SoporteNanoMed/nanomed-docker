"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react"
import { examsService } from "@/lib/api/services/exams.service"
import type { Exam } from "@/lib/api/types"

export default function EditExamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
    const fetchExam = async () => {
      try {
        setLoading(true)
        const response = await examsService.getExamById(Number.parseInt(params.id))

        if (!response.error) {
          setExam(response.body)
        } else {
          setError("No se pudo cargar el examen")
        }
      } catch (err) {
        console.error("Error fetching exam:", err)
        setError("Error al cargar el examen")
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (!exam) return

    setExam({
      ...exam,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (!exam) return

    setExam({
      ...exam,
      [name]: value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exam) return

    try {
      setSaving(true)
      setError(null)

      const examData = {
        tipo_examen: exam.tipo_examen,
        fecha: exam.fecha,
        descripcion: exam.descripcion,
        resultados: exam.resultados,
      }

      let response
      if (selectedFile) {
        response = await examsService.updateExam(exam.id, {
          ...examData,
          archivo: selectedFile,
        })
      } else {
        response = await examsService.updateExam(exam.id, examData)
      }

      if (!response.error) {
        setSuccess("Examen actualizado exitosamente")

        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess(null)
          router.push(`/dashboard/doctor/examenes/${exam.id}`)
        }, 2000)
      } else {
        setError(response.message || "Error al actualizar el examen")
      }
    } catch (err) {
      console.error("Error updating exam:", err)
      setError("Error al actualizar el examen")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error && !exam) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "No se encontró el examen"}</AlertDescription>
      </Alert>
    )
  }

  if (!exam) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No se encontró el examen</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/doctor/examenes/${exam.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Editar Examen</h1>
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

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Examen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paciente">Paciente</Label>
                <Input
                  id="paciente"
                  value={`${exam.paciente?.nombre || ""} ${exam.paciente?.apellido || ""}`}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_examen">Tipo de Examen</Label>
                <Select value={exam.tipo_examen} onValueChange={(value) => handleSelectChange("tipo_examen", value)}>
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
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={exam.fecha ? new Date(exam.fecha).toISOString().split("T")[0] : ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="archivo">Reemplazar Archivo (opcional)</Label>
                <Input
                  id="archivo"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <p className="text-xs text-gray-500">Formatos aceptados: PDF, JPG, PNG, DOC, DOCX</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                placeholder="Detalles adicionales sobre el examen"
                value={exam.descripcion || ""}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resultados">Resultados</Label>
              <Textarea
                id="resultados"
                name="resultados"
                placeholder="Resultados del examen"
                value={exam.resultados || ""}
                onChange={handleInputChange}
                rows={5}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Link href={`/dashboard/doctor/examenes/${exam.id}`}>
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600" disabled={saving}>
              {saving ? (
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
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
