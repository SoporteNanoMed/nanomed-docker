"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Search, Download, FilePlus, ChevronRight, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Datos mock para un paciente específico
const mockPatient = {
  id: "1",
  name: "María González",
  rut: "12.345.678-9",
  history: [
    {
      id: "n1",
      date: "15/05/2023",
      type: "Consulta",
      title: "Control rutinario",
      description: "Paciente acude a control rutinario. Refiere sentirse bien, sin molestias significativas.",
      diagnosis: "Hipertensión arterial controlada. Diabetes tipo 2 en tratamiento.",
      vitals: {
        bloodPressure: "130/85",
        heartRate: "72",
        temperature: "36.5",
        weight: "68.5",
        height: "162",
      },
      doctor: "Dr. Carlos Mendoza",
      medications: [
        { name: "Losartán", dose: "50mg", frequency: "Cada 12 horas", duration: "Permanente" },
        { name: "Metformina", dose: "850mg", frequency: "Con desayuno y cena", duration: "Permanente" },
      ],
    },
    {
      id: "n2",
      date: "15/01/2023",
      type: "Consulta",
      title: "Consulta por resfriado",
      description:
        "Paciente consulta por cuadro de 3 días de evolución caracterizado por rinorrea, odinofagia y tos seca.",
      diagnosis: "Resfriado común",
      vitals: {
        bloodPressure: "125/80",
        heartRate: "78",
        temperature: "37.2",
        weight: "69.0",
        height: "162",
      },
      doctor: "Dra. Ana Martínez",
      medications: [
        { name: "Paracetamol", dose: "500mg", frequency: "Cada 8 horas", duration: "5 días" },
        { name: "Loratadina", dose: "10mg", frequency: "Una vez al día", duration: "7 días" },
      ],
    },
    {
      id: "n3",
      date: "10/10/2022",
      type: "Consulta",
      title: "Control de diabetes",
      description: "Paciente acude a control de diabetes. Refiere cumplimiento de tratamiento y dieta.",
      diagnosis: "Diabetes tipo 2 controlada",
      vitals: {
        bloodPressure: "135/88",
        heartRate: "70",
        temperature: "36.6",
        weight: "70.2",
        height: "162",
      },
      doctor: "Dr. Carlos Mendoza",
      medications: [{ name: "Metformina", dose: "850mg", frequency: "Con desayuno y cena", duration: "Permanente" }],
    },
    {
      id: "n4",
      date: "05/07/2022",
      type: "Consulta",
      title: "Diagnóstico inicial de hipertensión",
      description:
        "Paciente consulta por cefalea frecuente. Se detecta presión arterial elevada en múltiples mediciones.",
      diagnosis: "Hipertensión arterial esencial",
      vitals: {
        bloodPressure: "150/95",
        heartRate: "76",
        temperature: "36.5",
        weight: "71.5",
        height: "162",
      },
      doctor: "Dr. Carlos Mendoza",
      medications: [{ name: "Losartán", dose: "50mg", frequency: "Cada 12 horas", duration: "Permanente" }],
    },
  ],
  exams: [
    {
      id: "e1",
      date: "10/03/2023",
      type: "Hemograma",
      status: "Completado",
      results: "Valores normales excepto glucemia elevada (126 mg/dl).",
    },
    {
      id: "e2",
      date: "10/03/2023",
      type: "Perfil Lipídico",
      status: "Completado",
      results: "Colesterol total: 210 mg/dl. LDL: 130 mg/dl. HDL: 45 mg/dl. Triglicéridos: 180 mg/dl.",
    },
    {
      id: "e3",
      date: "15/12/2022",
      type: "Radiografía de Tórax",
      status: "Completado",
      results: "Sin hallazgos patológicos.",
    },
  ],
}

export default function PatientMedicalHistory() {
  const params = useParams()
  const patientId = params.id as string

  // En una aplicación real, aquí cargaríamos los datos del paciente usando el ID
  const patient = mockPatient

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  // Filtrar historial según búsqueda y filtros
  const filteredHistory = patient.history.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || entry.type.toLowerCase() === typeFilter.toLowerCase()

    // Aquí se podría implementar un filtro por fecha más sofisticado
    const matchesDate = dateFilter === "all"

    return matchesSearch && matchesType && matchesDate
  })

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
          <h1 className="text-3xl font-bold">Historial Médico</h1>
          <p className="text-muted-foreground">
            Paciente: {patient.name} - RUT: {patient.rut}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Columna izquierda - Información resumida */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarFallback>
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{patient.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">RUT: {patient.rut}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Resumen</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Total consultas:</span>
                      <span className="font-medium">{patient.history.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Última consulta:</span>
                      <span className="font-medium">{patient.history[0]?.date || "N/A"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Exámenes:</span>
                      <span className="font-medium">{patient.exams.length}</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/doctor/pacientes/${patientId}/notas/nueva`}>
                      <FilePlus className="h-4 w-4 mr-1" />
                      Nueva Nota
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-1" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Historial detallado */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Historial Clínico Detallado</CardTitle>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar en historial..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="consulta">Consultas</SelectItem>
                      <SelectItem value="examen">Exámenes</SelectItem>
                      <SelectItem value="procedimiento">Procedimientos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo</SelectItem>
                      <SelectItem value="month">Último mes</SelectItem>
                      <SelectItem value="quarter">Últimos 3 meses</SelectItem>
                      <SelectItem value="year">Último año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((entry) => (
                    <div key={entry.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {entry.type}
                          </Badge>
                          <span className="font-medium">{entry.date}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver Detalle
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>

                      <h3 className="font-semibold mb-2">{entry.title}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h4>
                          <p className="text-sm">{entry.description}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Diagnóstico</h4>
                          <p className="text-sm">{entry.diagnosis}</p>
                        </div>
                      </div>

                      {entry.vitals && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Signos Vitales</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                            <div className="bg-muted/50 p-2 rounded">
                              <div className="font-medium">PA</div>
                              <div>{entry.vitals.bloodPressure} mmHg</div>
                            </div>
                            <div className="bg-muted/50 p-2 rounded">
                              <div className="font-medium">FC</div>
                              <div>{entry.vitals.heartRate} lpm</div>
                            </div>
                            <div className="bg-muted/50 p-2 rounded">
                              <div className="font-medium">Temp</div>
                              <div>{entry.vitals.temperature}°C</div>
                            </div>
                            <div className="bg-muted/50 p-2 rounded">
                              <div className="font-medium">Peso</div>
                              <div>{entry.vitals.weight} kg</div>
                            </div>
                            <div className="bg-muted/50 p-2 rounded">
                              <div className="font-medium">Talla</div>
                              <div>{entry.vitals.height} cm</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {entry.medications && entry.medications.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Medicamentos Recetados</h4>
                          <div className="space-y-1">
                            {entry.medications.map((med, idx) => (
                              <div key={idx} className="text-sm bg-blue-50 p-2 rounded">
                                <span className="font-medium">{med.name}</span> - {med.dose} - {med.frequency}
                                {med.duration && <span className="text-muted-foreground"> ({med.duration})</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">Atendido por: {entry.doctor}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No se encontraron registros con los criterios de búsqueda.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
