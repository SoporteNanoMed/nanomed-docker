"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

// Datos mock para un paciente específico
const mockPatient = {
  id: "1",
  name: "María González",
  rut: "12.345.678-9",
}

export default function NewMedicalNote() {
  const params = useParams()
  const patientId = params.id as string

  // En una aplicación real, aquí cargaríamos los datos del paciente usando el ID
  const patient = mockPatient

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    diagnosis: "",
    treatment: "",
    observations: "",
    followUp: "",
    medications: [{ name: "", dose: "", frequency: "", duration: "" }],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...formData.medications]
    updatedMedications[index] = { ...updatedMedications[index], [field]: value }
    setFormData((prev) => ({ ...prev, medications: updatedMedications }))
  }

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: "", dose: "", frequency: "", duration: "" }],
    }))
  }

  const removeMedication = (index: number) => {
    const updatedMedications = [...formData.medications]
    updatedMedications.splice(index, 1)
    setFormData((prev) => ({ ...prev, medications: updatedMedications }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar los datos a la API
    console.log("Datos del formulario:", formData)
    // Redireccionar al detalle del paciente después de guardar
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href={`/dashboard/doctor/pacientes/${patientId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Nota Médica</h1>
          <p className="text-muted-foreground">
            Paciente: {patient.name} - RUT: {patient.rut}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Consulta</CardTitle>
            <CardDescription>Ingrese los detalles de la consulta médica.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Consulta</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ej: Control rutinario, Consulta por dolor, etc."
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Consulta</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="control">Control Rutinario</SelectItem>
                    <SelectItem value="urgencia">Urgencia</SelectItem>
                    <SelectItem value="seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="especialidad">Consulta Especialidad</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción / Motivo de Consulta</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describa el motivo de la consulta y los síntomas presentados"
                value={formData.description}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                placeholder="Ingrese el diagnóstico del paciente"
                value={formData.diagnosis}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">Tratamiento</Label>
              <Textarea
                id="treatment"
                name="treatment"
                placeholder="Describa el tratamiento indicado"
                value={formData.treatment}
                onChange={handleChange}
              />
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Medicamentos Recetados</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Medicamento
                </Button>
              </div>

              {formData.medications.map((med, index) => (
                <div key={index} className="bg-muted/50 p-4 rounded-md mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Medicamento {index + 1}</h4>
                    {formData.medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="h-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`med-name-${index}`}>Nombre del Medicamento</Label>
                      <Input
                        id={`med-name-${index}`}
                        placeholder="Ej: Paracetamol, Ibuprofeno, etc."
                        value={med.name}
                        onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`med-dose-${index}`}>Dosis</Label>
                      <Input
                        id={`med-dose-${index}`}
                        placeholder="Ej: 500mg, 1 comprimido, etc."
                        value={med.dose}
                        onChange={(e) => handleMedicationChange(index, "dose", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`med-frequency-${index}`}>Frecuencia</Label>
                      <Input
                        id={`med-frequency-${index}`}
                        placeholder="Ej: Cada 8 horas, 2 veces al día, etc."
                        value={med.frequency}
                        onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`med-duration-${index}`}>Duración</Label>
                      <Input
                        id={`med-duration-${index}`}
                        placeholder="Ej: 7 días, 2 semanas, etc."
                        value={med.duration}
                        onChange={(e) => handleMedicationChange(index, "duration", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                name="observations"
                placeholder="Observaciones adicionales"
                value={formData.observations}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUp">Seguimiento</Label>
              <Textarea
                id="followUp"
                name="followUp"
                placeholder="Indicaciones de seguimiento, próximos controles, etc."
                value={formData.followUp}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" type="button" asChild>
              <Link href={`/dashboard/doctor/pacientes/${patientId}`}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-1" />
              Guardar Nota Médica
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
