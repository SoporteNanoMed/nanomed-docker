"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Upload, FileText, AlertCircle, User } from "lucide-react"
import { usePatients } from "@/lib/api/hooks/use-patients"

interface UploadExamModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: () => void
  onUpload: (examData: {
    paciente_id: number
    tipo_examen: string
    fecha: string
    descripcion?: string
    file: File
  }) => Promise<boolean>
}

const EXAM_TYPES = [
  "Examen de Sangre",
  "Radiografía",
  "Ecografía",
  "Resonancia Magnética",
  "Tomografía",
  "Electrocardiograma",
  "Endoscopía",
  "Biopsia",
  "Análisis de Orina",
  "Mamografía",
  "Densitometría Ósea",
  "Otro"
]

export function UploadExamModal({ open, onOpenChange, onUploadSuccess, onUpload }: UploadExamModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [examType, setExamType] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { patients, loading: patientsLoading, error: patientsError } = usePatients({ autoFetch: true })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedPatient("")
      setExamType("")
      setDate(new Date().toISOString().split('T')[0])
      setDescription("")
      setSelectedFile(null)
      setError(null)
    }
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setError("El archivo es demasiado grande. Máximo 500MB permitido.")
        return
      }
      
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/dicom',
        'application/x-dicom',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        setError("Tipo de archivo no válido. Se permiten: PDF, imágenes, DICOM, documentos de texto, ZIP.")
        return
      }
      
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPatient || !examType || !selectedFile) {
      setError("Por favor complete todos los campos obligatorios")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const success = await onUpload({
        paciente_id: parseInt(selectedPatient),
        tipo_examen: examType,
        fecha: date,
        descripcion: description || undefined,
        file: selectedFile
      })

      if (success) {
        onUploadSuccess()
        onOpenChange(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el examen")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Nuevo Examen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {patientsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Error al cargar pacientes: {patientsError}</AlertDescription>
            </Alert>
          )}

          {/* Selección de paciente */}
          <div className="space-y-2">
            <Label htmlFor="patient">Paciente *</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient} disabled={patientsLoading}>
              <SelectTrigger>
                <SelectValue placeholder={patientsLoading ? "Cargando pacientes..." : "Seleccionar paciente"} />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{patient.nombre} {patient.apellido}</span>
                      <span className="text-xs text-muted-foreground">({patient.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de examen */}
          <div className="space-y-2">
            <Label htmlFor="examType">Tipo de Examen *</Label>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de examen" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha del Examen *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descripción adicional del examen..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Archivo */}
          <div className="space-y-2">
            <Label htmlFor="file">Archivo del Examen *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.dcm,.doc,.docx,.txt,.zip"
                required
              />
              {selectedFile && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Formatos permitidos: PDF, imágenes, DICOM, documentos de texto, ZIP. Máximo 500MB.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploading || !selectedPatient || !examType || !selectedFile}
            >
              {uploading && <LoadingSpinner className="h-4 w-4 mr-2" />}
              {uploading ? "Subiendo..." : "Subir Examen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 