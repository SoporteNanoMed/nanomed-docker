"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewPatient() {
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    birthDate: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    bloodType: "",
    allergies: "",
    conditions: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar los datos a la API
    console.log("Datos del formulario:", formData)
    // Redireccionar a la lista de pacientes después de guardar
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/dashboard/doctor/pacientes">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Paciente</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="medical">Información Médica</TabsTrigger>
            <TabsTrigger value="additional">Información Adicional</TabsTrigger>
          </TabsList>

          <Card>
            <TabsContent value="personal" className="m-0">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Ingrese la información básica del paciente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Nombre y apellidos"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input
                      id="rut"
                      name="rut"
                      placeholder="12.345.678-9"
                      value={formData.rut}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Género</Label>
                    <RadioGroup
                      defaultValue={formData.gender}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Masculino" id="male" />
                        <Label htmlFor="male">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Femenino" id="female" />
                        <Label htmlFor="female">Femenino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Otro" id="other" />
                        <Label htmlFor="other">Otro</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Dirección completa"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+56 9 1234 5678"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="medical" className="m-0">
              <CardHeader>
                <CardTitle>Información Médica</CardTitle>
                <CardDescription>Ingrese la información médica relevante del paciente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Grupo Sanguíneo</Label>
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) => handleSelectChange("bloodType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea
                    id="allergies"
                    name="allergies"
                    placeholder="Ingrese las alergias del paciente (separadas por comas)"
                    value={formData.allergies}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conditions">Condiciones Médicas</Label>
                  <Textarea
                    id="conditions"
                    name="conditions"
                    placeholder="Ingrese las condiciones médicas del paciente (separadas por comas)"
                    value={formData.conditions}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="additional" className="m-0">
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
                <CardDescription>Ingrese información adicional y contactos de emergencia.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    placeholder="Nombre del contacto de emergencia"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    placeholder="+56 9 1234 5678"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Ingrese cualquier información adicional relevante"
                    value={formData.notes}
                    onChange={handleChange}
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
            </TabsContent>

            <CardFooter className="flex justify-between border-t p-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/doctor/pacientes">
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Link>
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-1" />
                Guardar Paciente
              </Button>
            </CardFooter>
          </Card>
        </Tabs>
      </form>
    </div>
  )
}
