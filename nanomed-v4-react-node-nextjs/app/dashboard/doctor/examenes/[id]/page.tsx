"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Download, Edit, AlertCircle, FileText, User, Calendar, Clock } from "lucide-react"
import { examsService } from "@/lib/api/services/exams.service"
import type { Exam } from "@/lib/api/types"

export default function ExamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleDownload = async () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !exam) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "No se encontró el examen"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/doctor/examenes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Detalle del Examen</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              {exam.tipo_examen}
            </CardTitle>
            <Badge>{new Date(exam.fecha).toLocaleDateString()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Paciente</h3>
                <p className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4" />
                  {exam.paciente?.nombre} {exam.paciente?.apellido}
                </p>
                {exam.paciente?.rut && <p className="text-sm text-gray-500">RUT: {exam.paciente.rut}</p>}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Fecha del Examen</h3>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(exam.fecha).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Médico Solicitante</h3>
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dr. {exam.medico?.nombre} {exam.medico?.apellido}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tipo de Examen</h3>
                <p className="font-medium text-cyan-600">{exam.tipo_examen}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Fecha de Registro</h3>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {new Date(exam.created_at).toLocaleDateString()} {new Date(exam.created_at).toLocaleTimeString()}
                </p>
              </div>

              {exam.archivo_path && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Archivo</h3>
                  <p className="text-sm">{exam.archivo_nombre_original || "Archivo adjunto"}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Descripción</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>{exam.descripcion || "Sin descripción"}</p>
            </div>
          </div>

          {exam.resultados && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Resultados</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p>{exam.resultados}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          {exam.archivo_path && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Archivo
            </Button>
          )}
          <Link href={`/dashboard/doctor/examenes/${exam.id}/editar`}>
            <Button className="bg-cyan-500 hover:bg-cyan-600">
              <Edit className="h-4 w-4 mr-2" />
              Editar Examen
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
