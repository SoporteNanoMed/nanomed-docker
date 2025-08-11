"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Stethoscope, User, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NuevoMedicoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rut: "",
    fechaNacimiento: "",
    direccion: "",
    especialidad: "",
    licencia: "",
    universidad: "",
    anoTitulacion: "",
    experiencia: "",
    consultorio: "",
    fechaIngreso: "",
    horarioInicio: "",
    horarioFin: "",
    diasTrabajo: [] as string[],
    observaciones: "",
  })

  const especialidades = [
    "Medicina General / Médico Cirujano",
    "Tecnólogo Médico",
    "TENS",
    "Enfermería",
    "Ginecología / Médico Cirujano",
    "Nutrición y Dietética",
    "Pediatría / Médico Cirujano",
    "Dermatología / Médico Cirujano",
    "Cardiología / Médico Cirujano",
    "Kinesiología",
    "Kinesiología de Piso Pélvico",
    "Fonoaudiología",
    "Matrona",
    "Psicología Adulta",
    "Psicología Infanto-Juvenil",
    "Medicina Interna",
    "Traumatología y Ortopedia",
    "Neurología",
    "Oftalmología",
    "Psiquiatría Pediátrica y Adolescencia",
    "Psiquiatría Adulto",
    "Nutrición Deportiva",
    "Terapia del Sueño",
    "Otorrinolaringología",
    "Urología",
    "Endocrinología",
    "Gastroenterología",
    "Neumología",
    "Reumatología",
    "Oncología",
    "Hematología",
    "Nefrología",
    "Infectología",
    "Anestesiología",
    "Cirugía General",
    "Cirugía Plástica",
    "Neurocirugía",
    "Cirugía Cardiovascular",
    "Cirugía Pediátrica",
    "Medicina Familiar",
    "Medicina de Urgencia",
    "Medicina Preventiva",
    "Medicina del Trabajo",
    "Medicina Legal",
    "Patología",
    "Radiología",
    "Medicina Nuclear",
    "Farmacología Clínica",
    "Inmunología",
    "Alergología",
    "Genética Médica",
    "Medicina Física y Rehabilitación",
    "Medicina del Deporte",
    "Medicina Aeroespacial",
    "Medicina Subacuática",
    "Medicina del Viajero",
    "Medicina Paliativa",
    "Medicina Integrativa"
  ]

  const consultorios = [
    "Consultorio 101",
    "Consultorio 102",
    "Consultorio 103",
    "Consultorio 104",
    "Consultorio 105",
    "Consultorio 201",
    "Consultorio 202",
    "Consultorio 203",
  ]

  const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDiaChange = (dia: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      diasTrabajo: checked ? [...prev.diasTrabajo, dia] : prev.diasTrabajo.filter((d) => d !== dia),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Preparar datos para la API
      const medicoData = {
        nombre: formData.nombre.split(' ')[0] || formData.nombre, // Primer nombre
        apellido: formData.nombre.split(' ').slice(1).join(' ') || '', // Resto como apellido
        email: formData.email,
        password: `Temp${Math.random().toString(36).slice(-8)}!`, // Contraseña temporal
        especialidad: formData.especialidad,
        telefono: formData.telefono,
        rut: formData.rut,
        fecha_nacimiento: formData.fechaNacimiento || null,
        direccion: formData.direccion || null,
        // Campos adicionales que podrían ser útiles
        genero: null,
        ciudad: null,
        region: null
      }

      // Validar campos requeridos
      if (!medicoData.nombre || !medicoData.apellido || !medicoData.email || !medicoData.especialidad) {
        alert("Por favor complete todos los campos requeridos")
        return
      }

      // Llamar a la API
      const response = await fetch('/api/admin/users/medico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicoData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear el médico')
      }

      const result = await response.json()
      
      // Mostrar mensaje de éxito con información de acceso
      alert(`Médico creado exitosamente!\n\nEmail: ${medicoData.email}\nContraseña temporal: ${medicoData.password}\n\nEl médico debe cambiar su contraseña en el primer inicio de sesión.`)
      
      // Redirigir a la lista de médicos
      router.push("/dashboard/admin/medicos")
      
    } catch (error) {
      console.error('Error al crear médico:', error)
      alert(`Error al crear el médico: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/admin/medicos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Médico</h1>
          <p className="text-gray-600 mt-1">Registra un nuevo médico en el sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ej: Dr. Carlos Ruiz Silva"
                  required
                />
              </div>
              <div>
                <Label htmlFor="rut">RUT *</Label>
                <Input
                  id="rut"
                  value={formData.rut}
                  onChange={(e) => handleInputChange("rut", e.target.value)}
                  placeholder="Ej: 11.222.333-4"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Ej: carlos.ruiz@nanomed.cl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  placeholder="Ej: +56 9 1111 2222"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
                <Input
                  id="fechaIngreso"
                  type="date"
                  value={formData.fechaIngreso}
                  onChange={(e) => handleInputChange("fechaIngreso", e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                placeholder="Ej: Las Condes 5678, Santiago"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información Profesional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="h-5 w-5 mr-2" />
              Información Profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="especialidad">Especialidad *</Label>
                <Select onValueChange={(value) => handleInputChange("especialidad", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidades.map((esp) => (
                      <SelectItem key={esp} value={esp}>
                        {esp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="licencia">Licencia Médica *</Label>
                <Input
                  id="licencia"
                  value={formData.licencia}
                  onChange={(e) => handleInputChange("licencia", e.target.value)}
                  placeholder="Ej: MED-12345"
                  required
                />
              </div>
              <div>
                <Label htmlFor="consultorio">Consultorio *</Label>
                <Select onValueChange={(value) => handleInputChange("consultorio", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar consultorio" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultorios.map((cons) => (
                      <SelectItem key={cons} value={cons}>
                        {cons}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experiencia">Años de Experiencia</Label>
                <Input
                  id="experiencia"
                  value={formData.experiencia}
                  onChange={(e) => handleInputChange("experiencia", e.target.value)}
                  placeholder="Ej: 15 años"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formación Académica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Formación Académica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="universidad">Universidad</Label>
                <Input
                  id="universidad"
                  value={formData.universidad}
                  onChange={(e) => handleInputChange("universidad", e.target.value)}
                  placeholder="Ej: Universidad de Chile"
                />
              </div>
              <div>
                <Label htmlFor="anoTitulacion">Año de Titulación</Label>
                <Input
                  id="anoTitulacion"
                  type="number"
                  value={formData.anoTitulacion}
                  onChange={(e) => handleInputChange("anoTitulacion", e.target.value)}
                  placeholder="Ej: 2005"
                  min="1950"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horarios de Trabajo */}
        <Card>
          <CardHeader>
            <CardTitle>Horarios de Trabajo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horarioInicio">Hora de Inicio</Label>
                <Input
                  id="horarioInicio"
                  type="time"
                  value={formData.horarioInicio}
                  onChange={(e) => handleInputChange("horarioInicio", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="horarioFin">Hora de Fin</Label>
                <Input
                  id="horarioFin"
                  type="time"
                  value={formData.horarioFin}
                  onChange={(e) => handleInputChange("horarioFin", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Días de Trabajo</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {diasSemana.map((dia) => (
                  <label key={dia} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.diasTrabajo.includes(dia)}
                      onChange={(e) => handleDiaChange(dia, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{dia}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="observaciones">Notas adicionales</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange("observaciones", e.target.value)}
                placeholder="Información adicional relevante..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/admin/medicos">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Guardar Médico
          </Button>
        </div>
      </form>
    </div>
  )
}
