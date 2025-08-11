"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Send, Paperclip, Plus, X } from "lucide-react"

// Tipos para los mensajes
interface Mensaje {
  id: string
  contenido: string
  fecha: string
  emisor: "paciente" | "medico"
  leido: boolean
  adjunto?: {
    nombre: string
    tipo: string
    url: string
  }
}

// Tipos para las conversaciones
interface Conversacion {
  id: string
  medico: {
    id: string
    nombre: string
    especialidad: string
    avatar?: string
  }
  ultimoMensaje: {
    contenido: string
    fecha: string
    leido: boolean
  }
  mensajes: Mensaje[]
}

// Datos de ejemplo para las conversaciones
const conversacionesEjemplo: Conversacion[] = [
  {
    id: "1",
    medico: {
      id: "med1",
      nombre: "Dr. Carlos Mendoza",
      especialidad: "Cardiología",
      avatar: "/abstract-geometric-cm.png",
    },
    ultimoMensaje: {
      contenido: "Recuerde tomar su medicación diariamente y mantenerse hidratado.",
      fecha: "2023-05-10T14:30:00",
      leido: false,
    },
    mensajes: [
      {
        id: "m1",
        contenido: "Buenos días doctor, tengo una consulta sobre mi medicación.",
        fecha: "2023-05-10T09:15:00",
        emisor: "paciente",
        leido: true,
      },
      {
        id: "m2",
        contenido: "Buenos días Juan, dígame en qué puedo ayudarle.",
        fecha: "2023-05-10T09:30:00",
        emisor: "medico",
        leido: true,
      },
      {
        id: "m3",
        contenido: "¿Puedo tomar el medicamento con las comidas? A veces me causa malestar estomacal.",
        fecha: "2023-05-10T09:45:00",
        emisor: "paciente",
        leido: true,
      },
      {
        id: "m4",
        contenido:
          "Sí, es recomendable tomarlo con alimentos para reducir la irritación gástrica. También puede dividir la dosis si su médico lo autoriza.",
        fecha: "2023-05-10T10:00:00",
        emisor: "medico",
        leido: true,
      },
      {
        id: "m5",
        contenido: "Muchas gracias doctor, seguiré su recomendación.",
        fecha: "2023-05-10T10:15:00",
        emisor: "paciente",
        leido: true,
      },
      {
        id: "m6",
        contenido: "Recuerde tomar su medicación diariamente y mantenerse hidratado.",
        fecha: "2023-05-10T14:30:00",
        emisor: "medico",
        leido: false,
      },
    ],
  },
  {
    id: "2",
    medico: {
      id: "med2",
      nombre: "Dra. Ana Soto",
      especialidad: "Dermatología",
      avatar: "/abstract-geometric-as.png",
    },
    ultimoMensaje: {
      contenido: "Le adjunto la receta para la crema que le mencioné en la consulta.",
      fecha: "2023-05-08T16:45:00",
      leido: true,
    },
    mensajes: [
      {
        id: "m7",
        contenido: "Hola doctora, quería consultarle sobre la reacción que tuve con la crema.",
        fecha: "2023-05-08T15:30:00",
        emisor: "paciente",
        leido: true,
      },
      {
        id: "m8",
        contenido: "Hola Juan, ¿qué tipo de reacción ha tenido? ¿Podría describirla?",
        fecha: "2023-05-08T15:45:00",
        emisor: "medico",
        leido: true,
      },
      {
        id: "m9",
        contenido: "Tengo enrojecimiento y un poco de picazón en la zona donde apliqué la crema.",
        fecha: "2023-05-08T16:00:00",
        emisor: "paciente",
        leido: true,
      },
      {
        id: "m10",
        contenido:
          "Entiendo. Le recomendaría suspender el uso de esa crema y cambiar a una más suave. Le adjunto la receta para la crema que le mencioné en la consulta.",
        fecha: "2023-05-08T16:45:00",
        emisor: "medico",
        leido: true,
        adjunto: {
          nombre: "receta_crema.pdf",
          tipo: "application/pdf",
          url: "/pdf-icon-stack.png",
        },
      },
    ],
  },
  {
    id: "3",
    medico: {
      id: "med3",
      nombre: "Dr. Roberto Gómez",
      especialidad: "Traumatología",
      avatar: "/abstract-geometric-rg.png",
    },
    ultimoMensaje: {
      contenido: "¿Cómo va la recuperación de su rodilla? ¿Ha notado mejoría con los ejercicios?",
      fecha: "2023-05-05T11:20:00",
      leido: true,
    },
    mensajes: [
      {
        id: "m11",
        contenido: "Buenos días doctor, quería informarle sobre mi progreso con la fisioterapia.",
        fecha: "2023-05-05T10:00:00",
        emisor: "paciente",
        leido: true,
      },
      {
        id: "m12",
        contenido: "Buenos días Juan, me alegra que se comunique. ¿Cómo va todo?",
        fecha: "2023-05-05T10:15:00",
        emisor: "medico",
        leido: true,
      },
      {
        id: "m13",
        contenido: "He notado una leve mejoría en la movilidad, pero aún tengo algo de dolor al subir escaleras.",
        fecha: "2023-05-05T10:30:00",
        emisor: "paciente",
        leido: true,
      },
      {
        id: "m14",
        contenido: "¿Cómo va la recuperación de su rodilla? ¿Ha notado mejoría con los ejercicios?",
        fecha: "2023-05-05T11:20:00",
        emisor: "medico",
        leido: true,
      },
    ],
  },
  {
    id: "4",
    medico: {
      id: "med4",
      nombre: "Dra. Patricia Vega",
      especialidad: "Medicina General",
      avatar: "/pv-symbol.png",
    },
    ultimoMensaje: {
      contenido: "Sus resultados de laboratorio están dentro de los rangos normales. ¡Felicidades!",
      fecha: "2023-04-28T09:45:00",
      leido: true,
    },
    mensajes: [
      {
        id: "m15",
        contenido: "Doctora, ¿ya están disponibles los resultados de mis análisis?",
        fecha: "2023-04-27T16:30:00",
        emisor: "paciente",
        leido: true,
      },
      {
        id: "m16",
        contenido: "Hola Juan, aún no los he recibido. En cuanto los tenga, se los haré llegar de inmediato.",
        fecha: "2023-04-27T17:00:00",
        emisor: "medico",
        leido: true,
      },
      {
        id: "m17",
        contenido: "Muchas gracias doctora, quedo atento.",
        fecha: "2023-04-27T17:15:00",
        emisor: "paciente",
        leido: true,
      },
      {
        id: "m18",
        contenido: "Sus resultados de laboratorio están dentro de los rangos normales. ¡Felicidades!",
        fecha: "2023-04-28T09:45:00",
        emisor: "medico",
        leido: true,
        adjunto: {
          nombre: "resultados_laboratorio.pdf",
          tipo: "application/pdf",
          url: "/pdf-icon-stack.png",
        },
      },
    ],
  },
]

// Componente para mostrar una conversación en la lista
function ConversacionItem({
  conversacion,
  activa,
  onClick,
}: {
  conversacion: Conversacion
  activa: boolean
  onClick: () => void
}) {
  // Formatear la fecha del último mensaje
  const fechaFormateada = format(parseISO(conversacion.ultimoMensaje.fecha), "d MMM", { locale: es })

  return (
    <div
      className={`flex items-center gap-3 p-3 cursor-pointer rounded-md transition-colors ${
        activa ? "bg-cyan-50" : "hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={conversacion.medico.avatar || "/placeholder.svg"} alt={conversacion.medico.nombre} />
        <AvatarFallback>
          {conversacion.medico.nombre
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-sm truncate">{conversacion.medico.nombre}</h4>
          <span className="text-xs text-gray-500">{fechaFormateada}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{conversacion.medico.especialidad}</p>
        <p className="text-xs truncate">
          {conversacion.ultimoMensaje.contenido}
          {!conversacion.ultimoMensaje.leido && <Badge className="ml-2 h-2 w-2 rounded-full p-0 bg-cyan-500" />}
        </p>
      </div>
    </div>
  )
}

// Componente para mostrar un mensaje individual
function MensajeItem({ mensaje, esMiMensaje }: { mensaje: Mensaje; esMiMensaje: boolean }) {
  // Formatear la hora del mensaje
  const horaFormateada = format(parseISO(mensaje.fecha), "HH:mm")

  return (
    <div className={`flex ${esMiMensaje ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${esMiMensaje ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-800"}`}
      >
        <p className="text-sm">{mensaje.contenido}</p>
        {mensaje.adjunto && (
          <div className={`mt-2 p-2 rounded flex items-center gap-2 ${esMiMensaje ? "bg-cyan-600" : "bg-gray-200"}`}>
            <div className="h-10 w-10 relative">
              <Image
                src={mensaje.adjunto.url || "/placeholder.svg"}
                alt={mensaje.adjunto.nombre}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{mensaje.adjunto.nombre}</p>
              <p className="text-xs opacity-70">{mensaje.adjunto.tipo.split("/")[1].toUpperCase()}</p>
            </div>
          </div>
        )}
        <div className={`text-xs mt-1 text-right ${esMiMensaje ? "text-cyan-100" : "text-gray-500"}`}>
          {horaFormateada}
        </div>
      </div>
    </div>
  )
}

// Componente para la página de mensajes
export default function MensajesPage() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>(conversacionesEjemplo)
  const [conversacionActiva, setConversacionActiva] = useState<Conversacion | null>(null)
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [adjuntoSeleccionado, setAdjuntoSeleccionado] = useState<File | null>(null)
  const mensajesFinRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filtrar conversaciones según la búsqueda
  const conversacionesFiltradas = conversaciones.filter((conv) =>
    conv.medico.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  )

  // Seleccionar la primera conversación por defecto
  useEffect(() => {
    if (conversaciones.length > 0 && !conversacionActiva) {
      setConversacionActiva(conversaciones[0])
    }
  }, [conversaciones, conversacionActiva])

  // Hacer scroll al último mensaje cuando cambia la conversación activa
  useEffect(() => {
    if (mensajesFinRef.current) {
      mensajesFinRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversacionActiva])

  // Manejar el envío de un nuevo mensaje
  const handleEnviarMensaje = () => {
    if (!nuevoMensaje.trim() && !adjuntoSeleccionado) return
    if (!conversacionActiva) return

    const nuevoId = `m${Date.now()}`
    const fechaActual = new Date().toISOString()

    // Crear el nuevo mensaje
    const mensaje: Mensaje = {
      id: nuevoId,
      contenido: nuevoMensaje,
      fecha: fechaActual,
      emisor: "paciente",
      leido: true,
      ...(adjuntoSeleccionado && {
        adjunto: {
          nombre: adjuntoSeleccionado.name,
          tipo: adjuntoSeleccionado.type,
          url: URL.createObjectURL(adjuntoSeleccionado),
        },
      }),
    }

    // Actualizar la conversación activa con el nuevo mensaje
    const conversacionesActualizadas = conversaciones.map((conv) => {
      if (conv.id === conversacionActiva.id) {
        return {
          ...conv,
          mensajes: [...conv.mensajes, mensaje],
          ultimoMensaje: {
            contenido: nuevoMensaje || "Archivo adjunto",
            fecha: fechaActual,
            leido: true,
          },
        }
      }
      return conv
    })

    setConversaciones(conversacionesActualizadas)
    setNuevoMensaje("")
    setAdjuntoSeleccionado(null)

    // Actualizar la conversación activa
    const conversacionActualizada = conversacionesActualizadas.find((conv) => conv.id === conversacionActiva.id)
    if (conversacionActualizada) {
      setConversacionActiva(conversacionActualizada)
    }
  }

  // Manejar la selección de un archivo adjunto
  const handleSeleccionarAdjunto = () => {
    fileInputRef.current?.click()
  }

  // Manejar el cambio en el input de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAdjuntoSeleccionado(e.target.files[0])
    }
  }

  // Manejar la eliminación del archivo adjunto
  const handleEliminarAdjunto = () => {
    setAdjuntoSeleccionado(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mensajes</h1>
        <p className="text-gray-500">Comunícate con tu equipo médico</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-220px)] min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Lista de conversaciones */}
          <div className="border-r">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar conversación"
                  className="pl-9"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-61px)]">
              {conversacionesFiltradas.length > 0 ? (
                conversacionesFiltradas.map((conv) => (
                  <ConversacionItem
                    key={conv.id}
                    conversacion={conv}
                    activa={conversacionActiva?.id === conv.id}
                    onClick={() => setConversacionActiva(conv)}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No se encontraron conversaciones</div>
              )}
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="col-span-2 flex flex-col h-full">
            {conversacionActiva ? (
              <>
                {/* Cabecera de la conversación */}
                <div className="p-3 border-b flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={conversacionActiva.medico.avatar || "/placeholder.svg"}
                      alt={conversacionActiva.medico.nombre}
                    />
                    <AvatarFallback>
                      {conversacionActiva.medico.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{conversacionActiva.medico.nombre}</h3>
                    <p className="text-xs text-gray-500">{conversacionActiva.medico.especialidad}</p>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4">
                  {conversacionActiva.mensajes.map((mensaje) => (
                    <MensajeItem key={mensaje.id} mensaje={mensaje} esMiMensaje={mensaje.emisor === "paciente"} />
                  ))}
                  <div ref={mensajesFinRef} />
                </div>

                {/* Área de entrada de mensaje */}
                <div className="p-3 border-t">
                  {adjuntoSeleccionado && (
                    <div className="mb-2 p-2 bg-gray-100 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Paperclip className="h-4 w-4" />
                        <span className="truncate max-w-[200px]">{adjuntoSeleccionado.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleEliminarAdjunto}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="shrink-0" onClick={handleSeleccionarAdjunto}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <Textarea
                      placeholder="Escribe un mensaje..."
                      className="min-h-[40px] max-h-[120px]"
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleEnviarMensaje()
                        }
                      }}
                    />
                    <Button
                      className="shrink-0 bg-cyan-500 hover:bg-cyan-600"
                      size="icon"
                      onClick={handleEnviarMensaje}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="mb-4">
                  <div className="h-16 w-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto">
                    <Plus className="h-8 w-8 text-cyan-500" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No hay conversación seleccionada</h3>
                <p className="text-gray-500 mb-4">Selecciona una conversación o inicia una nueva</p>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva conversación
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
