"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NuevaRecepcionistaPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rut: "",
    fechaNacimiento: "",
    direccion: "",
    estadoCivil: "",
    turno: "",
    fechaIngreso: "",
    contactoEmergenciaNombre: "",
    contactoEmergenciaTelefono: "",
    contactoEmergenciaRelacion: "",
    observaciones: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para crear la recepcionista
    console.log("Datos del formulario:", formData)
    // Simular guardado exitoso
    alert("Recepcionista creada exitosamente")
    router.push("/dashboard/admin/recepcionistas")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/admin/recepcionistas">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nueva Recepcionista</h1>
          <p className="text-gray-600 mt-1">Registra una nueva recepcionista en el sistema</p>
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
                  placeholder="Ej: María González Silva"
                  required
                />
              </div>
              <div>
                <Label htmlFor="rut">RUT *</Label>
                <Input
                  id="rut"
                  value={formData.rut}
                  onChange={(e) => handleInputChange("rut", e.target.value)}
                  placeholder="Ej: 12.345.678-9"
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
                  placeholder="Ej: maria.gonzalez@nanomed.cl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  placeholder="Ej: +56 9 8765 4321"
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
                <Label htmlFor="estadoCivil">Estado Civil</Label>
                <Select onValueChange={(value) => handleInputChange("estadoCivil", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soltero">Soltero/a</SelectItem>
                    <SelectItem value="casado">Casado/a</SelectItem>
                    <SelectItem value="divorciado">Divorciado/a</SelectItem>
                    <SelectItem value="viudo">Viudo/a</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                placeholder="Ej: Av. Providencia 1234, Santiago"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información Laboral */}
        <Card>
          <CardHeader>
            <CardTitle>Información Laboral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="turno">Turno *</Label>
                <Select onValueChange={(value) => handleInputChange("turno", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mañana">Mañana (08:00 - 14:00)</SelectItem>
                    <SelectItem value="tarde">Tarde (14:00 - 20:00)</SelectItem>
                    <SelectItem value="completo">Completo (08:00 - 17:00)</SelectItem>
                  </SelectContent>
                </Select>
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
          </CardContent>
        </Card>

        {/* Contacto de Emergencia */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto de Emergencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contactoEmergenciaNombre">Nombre</Label>
                <Input
                  id="contactoEmergenciaNombre"
                  value={formData.contactoEmergenciaNombre}
                  onChange={(e) => handleInputChange("contactoEmergenciaNombre", e.target.value)}
                  placeholder="Ej: Pedro González"
                />
              </div>
              <div>
                <Label htmlFor="contactoEmergenciaTelefono">Teléfono</Label>
                <Input
                  id="contactoEmergenciaTelefono"
                  value={formData.contactoEmergenciaTelefono}
                  onChange={(e) => handleInputChange("contactoEmergenciaTelefono", e.target.value)}
                  placeholder="Ej: +56 9 1234 5678"
                />
              </div>
              <div>
                <Label htmlFor="contactoEmergenciaRelacion">Relación</Label>
                <Select onValueChange={(value) => handleInputChange("contactoEmergenciaRelacion", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar relación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="padre">Padre</SelectItem>
                    <SelectItem value="madre">Madre</SelectItem>
                    <SelectItem value="hermano">Hermano/a</SelectItem>
                    <SelectItem value="conyuge">Cónyuge</SelectItem>
                    <SelectItem value="hijo">Hijo/a</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
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
          <Link href="/dashboard/admin/recepcionistas">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Guardar Recepcionista
          </Button>
        </div>
      </form>
    </div>
  )
}
