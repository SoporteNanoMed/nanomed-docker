"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Bell, Calendar, FileText, MessageSquare, AlertCircle, CheckCircle, Clock, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/api/hooks/use-auth"

// Tipo para notificaciones
interface Notification {
  id: number
  tipo: string
  titulo: string
  mensaje: string
  fecha: string
  leida: boolean
  accion?: {
    tipo: string
    id: number
    texto: string
  }
}

export default function NotificacionesPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("todas")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)

        // En un entorno real, esto sería una llamada a la API
        // const response = await notificationsService.getNotifications()

        // Simulamos la respuesta de la API con datos de ejemplo
        setTimeout(() => {
          const mockNotifications: Notification[] = [
            {
              id: 1,
              tipo: "cita",
              titulo: "Recordatorio de cita",
              mensaje: "Tiene una cita programada para mañana a las 10:30 AM con el Dr. Carlos Mendoza.",
              fecha: "2023-06-14T15:30:00",
              leida: false,
              accion: {
                tipo: "cita",
                id: 101,
                texto: "Ver cita",
              },
            },
            {
              id: 2,
              tipo: "examen",
              titulo: "Resultados disponibles",
              mensaje: "Los resultados de su examen de sangre ya están disponibles para su revisión.",
              fecha: "2023-06-13T09:15:00",
              leida: true,
              accion: {
                tipo: "examen",
                id: 201,
                texto: "Ver resultados",
              },
            },
            {
              id: 3,
              tipo: "sistema",
              titulo: "Actualización de perfil",
              mensaje: "Su información de perfil ha sido actualizada exitosamente.",
              fecha: "2023-06-10T14:20:00",
              leida: true,
            },
            {
              id: 4,
              tipo: "mensaje",
              titulo: "Nuevo mensaje",
              mensaje: "Ha recibido un nuevo mensaje del Dr. Ana Soto sobre su consulta anterior.",
              fecha: "2023-06-09T11:45:00",
              leida: false,
              accion: {
                tipo: "mensaje",
                id: 301,
                texto: "Leer mensaje",
              },
            },
            {
              id: 5,
              tipo: "cita",
              titulo: "Cita cancelada",
              mensaje: "Su cita del 15 de junio ha sido cancelada. Por favor, reprograme cuando le sea conveniente.",
              fecha: "2023-06-08T16:10:00",
              leida: true,
            },
          ]

          setNotifications(mockNotifications)
          setLoading(false)
        }, 800)
      } catch (err) {
        console.error("Error fetching notifications:", err)
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = async (id: number) => {
    try {
      // En un entorno real, esto sería una llamada a la API
      // await notificationsService.markAsRead(id)

      // Actualizamos el estado local
      setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, leida: true } : notif)))
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      // En un entorno real, esto sería una llamada a la API
      // await notificationsService.markAllAsRead()

      // Actualizamos el estado local
      setNotifications((prev) => prev.map((notif) => ({ ...notif, leida: true })))
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      // En un entorno real, esto sería una llamada a la API
      // await notificationsService.deleteNotification(id)

      // Actualizamos el estado local
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    } catch (err) {
      console.error("Error deleting notification:", err)
    }
  }

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "cita":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "examen":
        return <FileText className="h-5 w-5 text-green-500" />
      case "mensaje":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case "sistema":
      default:
        return <Bell className="h-5 w-5 text-amber-500" />
    }
  }

  const getActionLink = (accion?: { tipo: string; id: number }) => {
    if (!accion) return "#"

    switch (accion.tipo) {
      case "cita":
        return `/dashboard/citas/${accion.id}`
      case "examen":
        return `/dashboard/examenes/${accion.id}`
      case "mensaje":
        return `/dashboard/mensajes/${accion.id}`
      default:
        return "#"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Hoy a las ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays === 1) {
      return `Ayer a las ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "todas") return true
    if (activeTab === "no-leidas") return !notif.leida
    return notif.tipo === activeTab
  })

  const unreadCount = notifications.filter((notif) => !notif.leida).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
            <p className="text-muted-foreground">Gestiona tus notificaciones y alertas</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todas">
            Todas
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="no-leidas">
            No leídas
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cita">Citas</TabsTrigger>
          <TabsTrigger value="examen">Exámenes</TabsTrigger>
          <TabsTrigger value="mensaje">Mensajes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "todas" && "Todas las notificaciones"}
                {activeTab === "no-leidas" && "Notificaciones no leídas"}
                {activeTab === "cita" && "Notificaciones de citas"}
                {activeTab === "examen" && "Notificaciones de exámenes"}
                {activeTab === "mensaje" && "Notificaciones de mensajes"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border rounded-lg ${!notif.leida ? "bg-blue-50 border-blue-200" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getNotificationIcon(notif.tipo)}</div>
                          <div>
                            <h3 className="font-medium">{notif.titulo}</h3>
                            <p className="text-sm text-gray-600 mt-1">{notif.mensaje}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDate(notif.fecha)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notif.leida && (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)} className="h-8 px-2">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notif.id)}
                            className="h-8 px-2 text-red-500 hover:text-red-600"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {notif.accion && (
                        <div className="mt-3 text-right">
                          <Link href={getActionLink(notif.accion)}>
                            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                              {notif.accion.texto}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
                  <p className="mt-1 text-sm text-gray-500">No se encontraron notificaciones en esta categoría.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
