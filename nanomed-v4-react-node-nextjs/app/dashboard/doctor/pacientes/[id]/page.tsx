"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Clock,
  Edit,
  FilePlus,
  CalendarPlus,
  AlertCircle,
  ChevronRight,
  Download,
  Pill,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Datos mock para un paciente específico
const mockPatient = {
  id: "1",
  name: "María González",
  rut: "12.345.678-9",
  age: 45,
  birthDate: "10/03/1978",
  gender: "Femenino",
  address: "Av. Providencia 1234, Santiago",
  phone: "+56 9 1234 5678",
  email: "maria.gonzalez@email.com",
  bloodType: "O+",
  allergies: ["Penicilina", "Sulfas"],
  conditions: ["Hipertensión", "Diabetes tipo 2"],
  medications: [
    { name: "Losartán", dose: "50mg", frequency: "Cada 12 horas" },
    { name: "Metformina", dose: "850mg", frequency: "Con desayuno y cena" },
  ],
  lastVisit: "15/05/2023",
  nextAppointment: "22/06/2023",
  status: "active",
  history: [
    {
      date: "15/05/2023",
      type: "Consulta",
      description: "Control rutinario. Presión arterial: 130/85. Glucemia: 126 mg/dl.",
      doctor: "Dr. Carlos Mendoza",
    },
    {
      date: "10/03/2023",
      type: "Examen",
      description: "Hemograma completo y perfil lipídico.",
      doctor: "Dr. Carlos Mendoza",
    },
    {
      date: "15/01/2023",
      type: "Consulta",
      description: "Resfriado común. Se recetó paracetamol y reposo.",
      doctor: "Dra. Ana Martínez",
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
  appointments: [
    {
      id: "a1",
      date: "22/06/2023",
      time: "10:30",
      type: "Control",
      status: "Programada",
      doctor: "Dr. Carlos Mendoza",
    },
    {
      id: "a2",
      date: "15/05/2023",
      time: "11:00",
      type: "Control",
      status: "Completada",
      doctor: "Dr. Carlos Mendoza",
    },
    {
      id: "a3",
      date: "15/01/2023",
      time: "09:15",
      type: "Urgencia",
      status: "Completada",
      doctor: "Dra. Ana Martínez",
    },
  ],
}

export default function PatientDetail() {
  const params = useParams()
  const patientId = params.id as string

  // En una aplicación real, aquí cargaríamos los datos del paciente usando el ID
  const patient = mockPatient

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/dashboard/doctor/pacientes">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Ficha del Paciente</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información del paciente */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
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
                    <CardDescription>RUT: {patient.rut}</CardDescription>
                  </div>
                </div>
                <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                  {patient.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Información Personal</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Edad:</div>
                    <div className="font-medium">{patient.age} años</div>
                    <div>Fecha de Nacimiento:</div>
                    <div className="font-medium">{patient.birthDate}</div>
                    <div>Género:</div>
                    <div className="font-medium">{patient.gender}</div>
                    <div>Grupo Sanguíneo:</div>
                    <div className="font-medium">{patient.bloodType}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Contacto</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{patient.email}</span>
                    </div>
                    <p className="text-sm">{patient.address}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Condiciones Médicas</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {patient.conditions.map((condition, idx) => (
                      <Badge key={idx} variant="outline">
                        {condition}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="text-sm font-medium text-muted-foreground mt-3 mb-2">Alergias</h3>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Medicamentos Actuales</h3>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {patient.medications.map((med, idx) => (
                      <div key={idx} className="bg-muted/50 p-2 rounded-md">
                        <div className="flex items-center">
                          <Pill className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium">{med.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground ml-6">
                          {med.dose} - {med.frequency}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Editar Información
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <AlertCircle className="h-4 w-4 mr-1" />
                Reportar Problema
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Columna derecha - Historial, exámenes y citas */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="historial" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="historial">Historial Clínico</TabsTrigger>
              <TabsTrigger value="examenes">Exámenes</TabsTrigger>
              <TabsTrigger value="citas">Citas</TabsTrigger>
            </TabsList>

            {/* Pestaña de Historial Clínico */}
            <TabsContent value="historial" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Historial Clínico</h2>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/doctor/pacientes/${patient.id}/notas/nueva`}>
                      <FilePlus className="h-4 w-4 mr-1" />
                      Nueva Nota
                    </Link>
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {patient.history.map((entry, idx) => (
                      <div key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {entry.type}
                              </Badge>
                              <span className="font-medium">{entry.date}</span>
                            </div>
                            <p className="mt-1">{entry.description}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Ver Detalle
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">Atendido por: {entry.doctor}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña de Exámenes */}
            <TabsContent value="examenes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Exámenes Médicos</h2>
                <div className="flex gap-2">
                  <Button size="sm">
                    <FilePlus className="h-4 w-4 mr-1" />
                    Solicitar Examen
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {patient.exams.map((exam, idx) => (
                      <div key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium">{exam.type}</span>
                              <Badge className="ml-2" variant={exam.status === "Completado" ? "default" : "secondary"}>
                                {exam.status}
                              </Badge>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{exam.date}</span>
                            </div>
                            <p className="mt-2">{exam.results}</p>
                          </div>
                          <div className="flex">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                            <Button variant="ghost" size="sm">
                              Ver Detalle
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña de Citas */}
            <TabsContent value="citas" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Citas Médicas</h2>
                <div className="flex gap-2">
                  <Button size="sm">
                    <CalendarPlus className="h-4 w-4 mr-1" />
                    Agendar Cita
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {patient.appointments.map((appointment, idx) => (
                      <div key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {appointment.type}
                              </Badge>
                              <span className="font-medium">{appointment.date}</span>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="mt-1 text-sm">Médico: {appointment.doctor}</div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge
                              className="mb-2"
                              variant={
                                appointment.status === "Completada"
                                  ? "secondary"
                                  : appointment.status === "Programada"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {appointment.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              Ver Detalle
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
