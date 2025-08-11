"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, Download, Eye, Edit, Trash2, Plus, Filter, Calendar, User, Clock } from "lucide-react"

// Datos de ejemplo para exámenes
const mockExams = [
  {
    id: 1,
    paciente: {
      id: 101,
      nombre: "Juan",
      apellido: "Pérez",
      rut: "12345678-9",
    },
    medico: {
      id: 1,
      nombre: "Carlos",
      apellido: "Mendoza",
      especialidad: "Cardiología",
    },
    tipo: "Electrocardiograma",
    categoria: "Cardiología",
    fechaSolicitud: "2023-06-10T09:00:00",
    fechaRealizacion: "2023-06-12T14:30:00",
    fechaEntrega: "2023-06-13T10:00:00",
    estado: "entregado",
    prioridad: "normal",
    observaciones: "Examen de rutina para control cardiológico",
    resultados: "Ritmo sinusal normal, sin alteraciones significativas",
    archivo: "ecg_juan_perez_20230612.pdf",
    costo: 45000,
  },
  {
    id: 2,
    paciente: {
      id: 102,
      nombre: "María",
      apellido: "González",
      rut: "98765432-1",
    },
    medico: {
      id: 2,
      nombre: "Ana",
      apellido: "Soto",
      especialidad: "Neurología",
    },
    tipo: "Resonancia Magnética Cerebral",
    categoria: "Neurología",
    fechaSolicitud: "2023-06-08T11:00:00",
    fechaRealizacion: "2023-06-15T16:00:00",
    fechaEntrega: null,
    estado: "realizado",
    prioridad: "alta",
    observaciones: "Paciente con cefaleas frecuentes",
    resultados: "Pendiente de interpretación",
    archivo: null,
    costo: 180000,
  },
  {
    id: 3,
    paciente: {
      id: 103,
      nombre: "Pedro",
      apellido: "Sánchez",
      rut: "45678912-3",
    },
    medico: {
      id: 3,
      nombre: "Roberto",
      apellido: "Gómez",
      especialidad: "Traumatología",
    },
    tipo: "Radiografía de Rodilla",
    categoria: "Traumatología",
    fechaSolicitud: "2023-06-14T08:30:00",
    fechaRealizacion: null,
    fechaEntrega: null,
    estado: "programado",
    prioridad: "normal",
    observaciones: "Dolor en rodilla derecha post caída",
    resultados: null,
    archivo: null,
    costo: 25000,
  },
  {
    id: 4,
    paciente: {
      id: 104,
      nombre: "Ana",
      apellido: "Rodríguez",
      rut: "56789123-4",
    },
    medico: {
      id: 4,
      nombre: "Patricia",
      apellido: "Vega",
      especialidad: "Medicina General",
    },
    tipo: "Hemograma Completo",
    categoria: "Laboratorio",
    fechaSolicitud: "2023-06-12T10:15:00",
    fechaRealizacion: "2023-06-12T11:00:00",
    fechaEntrega: "2023-06-13T15:30:00",
    estado: "entregado",
    prioridad: "normal",
    observaciones: "Exámenes de rutina",
    resultados: "Valores dentro de parámetros normales",
    archivo: "hemograma_ana_rodriguez_20230612.pdf",
    costo: 15000,
  },
  {
    id: 5,
    paciente: {
      id: 105,
      nombre: "Luis",
      apellido: "Martínez",
      rut: "67891234-5",
    },
    medico: {
      id: 5,
      nombre: "Fernando",
      apellido: "Torres",
      especialidad: "Neurología",
    },
    tipo: "Electroencefalograma",
    categoria: "Neurología",
    fechaSolicitud: "2023-06-09T14:00:00",
    fechaRealizacion: "2023-06-11T09:30:00",
    fechaEntrega: null,
    estado: "realizado",
    prioridad: "alta",
    observaciones: "Episodios de mareos frecuentes",
    resultados: "En proceso de análisis",
    archivo: null,
    costo: 85000,
  },
  {
    id: 6,
    paciente: {
      id: 106,
      nombre: "Carmen",
      apellido: "Díaz",
      rut: "78912345-6",
    },
    medico: {
      id: 6,
      nombre: "Claudia",
      apellido: "Morales",
      especialidad: "Endocrinología",
    },
    tipo: "Perfil Tiroideo",
    categoria: "Laboratorio",
    fechaSolicitud: "2023-06-13T16:00:00",
    fechaRealizacion: null,
    fechaEntrega: null,
    estado: "cancelado",
    prioridad: "normal",
    observaciones: "Control de hipotiroidismo",
    resultados: null,
    archivo: null,
    costo: 35000,
  },
]

export default function AllExamsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [filterCategoria, setFilterCategoria] = useState("todas")
  const [filterPrioridad, setFilterPrioridad] = useState("todas")
  const [activeTab, setActiveTab] = useState("todos")

  // Filtrar exámenes según los criterios
  const filteredExams = mockExams.filter((exam) => {
    // Filtro por búsqueda
    const searchMatch =
      exam.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.paciente.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.medico.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.categoria.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro por estado
    const estadoMatch = filterEstado === "todos" || exam.estado === filterEstado

    // Filtro por categoría
    const categoriaMatch = filterCategoria === "todas" || exam.categoria === filterCategoria

    // Filtro por prioridad
    const prioridadMatch = filterPrioridad === "todas" || exam.prioridad === filterPrioridad

    return searchMatch && estadoMatch && categoriaMatch && prioridadMatch
  })

  // Filtrar por tab activo
  const examsByTab = {
    todos: filteredExams,
    programados: filteredExams.filter((exam) => exam.estado === "programado"),
    realizados: filteredExams.filter((exam) => exam.estado === "realizado"),
    entregados: filteredExams.filter((exam) => exam.estado === "entregado"),
    cancelados: filteredExams.filter((exam) => exam.estado === "cancelado"),
  }

  // Extraer valores únicos para los filtros
  const categorias = Array.from(new Set(mockExams.map((exam) => exam.categoria)))

  // Función para obtener el color del badge según el estado
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "programado":
        return "bg-blue-100 text-blue-800"
      case "realizado":
        return "bg-yellow-100 text-yellow-800"
      case "entregado":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para obtener el color del badge según la prioridad
  const getPriorityBadgeColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      case "normal":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL")
  }

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Exámenes</h1>
          <p className="text-gray-500">Administra todos los exámenes del sistema</p>
        </div>
        <Link href="/dashboard/exams/new">
          <Button className="bg-cyan-500 hover:bg-cyan-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Examen
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar exámenes..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="programado">Programado</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
                <SelectItem value="entregado">Entregado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setSearchTerm("")
                setFilterEstado("todos")
                setFilterCategoria("todas")
                setFilterPrioridad("todas")
              }}
            >
              <Filter className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="programados">Programados</TabsTrigger>
          <TabsTrigger value="realizados">Realizados</TabsTrigger>
          <TabsTrigger value="entregados">Entregados</TabsTrigger>
          <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
        </TabsList>

        {Object.entries(examsByTab).map(([tab, exams]) => (
          <TabsContent key={tab} value={tab}>
            {exams.length > 0 ? (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <Card key={exam.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={getBadgeColor(exam.estado)}>
                              {exam.estado.charAt(0).toUpperCase() + exam.estado.slice(1)}
                            </Badge>
                            <Badge variant="outline" className={getPriorityBadgeColor(exam.prioridad)}>
                              Prioridad {exam.prioridad}
                            </Badge>
                            <span className="text-sm text-gray-500">{exam.categoria}</span>
                          </div>

                          <div>
                            <h3 className="font-semibold text-lg">{exam.tipo}</h3>
                            <p className="text-sm text-gray-600">{exam.observaciones}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-cyan-500" />
                              <span>
                                <strong>Paciente:</strong> {exam.paciente.nombre} {exam.paciente.apellido} (
                                {exam.paciente.rut})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-cyan-500" />
                              <span>
                                <strong>Médico:</strong> Dr. {exam.medico.nombre} {exam.medico.apellido}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-cyan-500" />
                              <span>
                                <strong>Solicitado:</strong> {formatDate(exam.fechaSolicitud)}
                              </span>
                            </div>

                            {exam.fechaRealizacion && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-cyan-500" />
                                <span>
                                  <strong>Realizado:</strong> {formatDate(exam.fechaRealizacion)}
                                </span>
                              </div>
                            )}

                            {exam.fechaEntrega && (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-cyan-500" />
                                <span>
                                  <strong>Entregado:</strong> {formatDate(exam.fechaEntrega)}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <span>
                                <strong>Costo:</strong> {formatCurrency(exam.costo)}
                              </span>
                            </div>
                          </div>

                          {exam.resultados && (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <p className="text-sm">
                                <strong>Resultados:</strong> {exam.resultados}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 min-w-[140px]">
                          <Link href={`/dashboard/exams/${exam.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Button>
                          </Link>

                          <Link href={`/dashboard/exams/${exam.id}/edit`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </Link>

                          {exam.archivo && (
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </Button>
                          )}

                          {exam.estado !== "cancelado" && (
                            <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay exámenes</h3>
                <p className="mt-1 text-sm text-gray-500">No se encontraron exámenes con los filtros seleccionados.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
