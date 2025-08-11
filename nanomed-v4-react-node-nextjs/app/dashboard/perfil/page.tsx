"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Camera,
  Save,
  Lock,
  Bell,
  User,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Calendar,
} from "lucide-react"
import { useUserProfile } from "@/lib/api/hooks/use-user-profile"
import { useAuth } from "@/lib/api/hooks/use-auth"
import type { UpdateProfileRequest } from "@/lib/api/types"
import { apiClient } from "@/lib/api/client"
import { ProfileImage } from "@/components/ui/profile-image";

// Componente para la pestaña de información médica
const MedicalInfoTab = ({ profile, datosEditados, handleChange, editando }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Médica</CardTitle>
        <CardDescription>Información importante para tu atención médica</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alergias">Alergias</Label>
            <Textarea
              id="alergias"
              name="alergias"
              value={datosEditados.alergias || ""}
              onChange={handleChange}
              disabled={!editando}
              placeholder="Describe cualquier alergia conocida..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicamentos">Medicamentos Actuales</Label>
            <Textarea
              id="medicamentos"
              name="medicamentos"
              value={datosEditados.medicamentos || ""}
              onChange={handleChange}
              disabled={!editando}
              placeholder="Lista los medicamentos que tomas actualmente..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condicionesMedicas">Condiciones Médicas</Label>
            <Textarea
              id="condicionesMedicas"
              name="condicionesMedicas"
              value={datosEditados.condicionesMedicas || ""}
              onChange={handleChange}
              disabled={!editando}
              placeholder="Describe cualquier condición médica relevante..."
              rows={3}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Componente para la pestaña de seguridad
const SecurityTab = ({ profile, updating, passwordData, setPasswordData, passwordError, handlePasswordChange }) => {
  return (
    <div className="space-y-6">
      <div className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Cambiar Contraseña</h3>
            <p className="text-sm text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
          </div>
          <div>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300"
                />
              </div>
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
            </form>
          </div>
          <div className="mt-4">
            <Button
              onClick={handlePasswordChange}
              disabled={
                updating || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword
              }
              className="bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
            >
              {updating ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Cambiando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Información de Seguridad</h3>
            <p className="text-sm text-gray-600">Estado de seguridad de tu cuenta</p>
          </div>
          <div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Verificado</p>
                  <p className="text-sm text-gray-500">Tu dirección de email ha sido verificada</p>
                </div>
                <Badge variant={profile?.email_verified ? "default" : "destructive"}>
                  {profile?.email_verified ? "Verificado" : "No Verificado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticación de Dos Factores (MFA)</p>
                  <p className="text-sm text-gray-500">Protección adicional para tu cuenta</p>
                </div>
                <Badge variant={profile?.mfa_enabled ? "default" : "secondary"}>
                  {profile?.mfa_enabled ? "Habilitado" : "Deshabilitado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Rol de Usuario</p>
                  <p className="text-sm text-gray-500">Tu nivel de acceso en la plataforma</p>
                </div>
                <Badge variant="outline">
                  {profile?.role === "user" ? "Paciente" : profile?.role === "medico" ? "Médico" : "Admin"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PerfilPage() {
  // Hooks de autenticación y perfil
  const { user: authUser, isAuthenticated } = useAuth()
  const {
    profile,
    loading,
    updating,
    error,
    updateProfile,
    uploadAvatar,
    changePassword,
    clearError,
    initialized,
    loadProfile,
  } = useUserProfile()

  // Estados para debug
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Estados del formulario
  const [editando, setEditando] = useState(false)
  const [datosEditados, setDatosEditados] = useState<UpdateProfileRequest>({})
  const [fotoSeleccionada, setFotoSeleccionada] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("personal")

  // Asegurar que usuarios regulares y recepcionistas no puedan estar en pestañas bloqueadas
  useEffect(() => {
    if (activeTab === "notificaciones" && (authUser?.role === "user" || authUser?.role === "recepcionista")) {
      setActiveTab("personal")
    }
    // Bloquear pestaña de información médica para todos los usuarios
    if (activeTab === "medica") {
      setActiveTab("personal")
    }
  }, [activeTab, authUser?.role])

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Estados para notificaciones
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailCitas: true,
    emailResultados: true,
    emailMensajes: true,
    emailPromociones: false,
    smsCitas: true,
    smsResultados: false,
  })

  // Estado para controlar si ya se inicializaron los datos
  const [datosInicializados, setDatosInicializados] = useState(false)

  // Estados para validación
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string>>({})

  // Función para formatear fechas
  const formatDate = useCallback((dateString: string | undefined) => {
    if (!dateString) return ""
    try {
      // Si la fecha está en formato YYYY-MM-DD, parsearla manualmente
      // para evitar problemas de zona horaria
      if (dateString.includes("-") && dateString.length === 10) {
        const [year, month, day] = dateString.split("-").map(Number)
        const date = new Date(year, month - 1, day) // month - 1 porque los meses en JS van de 0-11
        return date.toLocaleDateString("es-CL", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }

      // Para otros formatos de fecha, usar el método original
      const date = new Date(dateString)
      return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }, [])

  // Función para formatear fecha de nacimiento para input date
  const formatDateForInput = useCallback((dateString: string | undefined) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    } catch (e) {
      return dateString
    }
  }, [])

  // Función para validar campos requeridos
  const validarCampos = useCallback((datos: UpdateProfileRequest) => {
    const errores: Record<string, string> = {}

    // Campos requeridos
    if (!datos.nombre?.trim()) {
      errores.nombre = "El nombre es requerido"
    }

    if (!datos.apellido?.trim()) {
      errores.apellido = "El apellido es requerido"
    }

    if (!datos.telefono?.trim()) {
      errores.telefono = "El teléfono es requerido"
    } else if (!/^\+?[\d\s\-()]+$/.test(datos.telefono.trim())) {
      errores.telefono = "Formato de teléfono inválido"
    }

    // Validar fecha de nacimiento
    const fechaNacimiento = datos.fecha_nacimiento || datos.fechaNacimiento
    if (!fechaNacimiento?.trim()) {
      errores.fecha_nacimiento = "La fecha de nacimiento es requerida"
    } else {
      // Validar que sea una fecha válida
      const fecha = new Date(fechaNacimiento)
      if (isNaN(fecha.getTime())) {
        errores.fecha_nacimiento = "Fecha de nacimiento inválida"
      } else {
        // Validar que no sea una fecha futura
        const hoy = new Date()
        if (fecha > hoy) {
          errores.fecha_nacimiento = "La fecha de nacimiento no puede ser futura"
        }
        // Validar que sea una fecha razonable (no más de 120 años atrás)
        const hace120Anos = new Date()
        hace120Anos.setFullYear(hace120Anos.getFullYear() - 120)
        if (fecha < hace120Anos) {
          errores.fecha_nacimiento = "Fecha de nacimiento no válida"
        }
      }
    }

    if (!datos.genero?.trim()) {
      errores.genero = "El género es requerido"
    }

    // Validar email si está presente (aunque no sea editable)
    if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      errores.email = "Formato de email inválido"
    }

    return errores
  }, [])

  // Función para agregar información de debug
  const addDebugInfo = useCallback((info: string) => {
    setDebugInfo((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${info}`])
  }, [])

  // Cargar perfil automáticamente al montar el componente
  useEffect(() => {
    if (isAuthenticated && !profile && !loading) {
      loadProfile()
      addDebugInfo("Carga automática de perfil iniciada")
    }
  }, [isAuthenticated, profile, loading, loadProfile, addDebugInfo])

  // Verificar token y estado de autenticación
  useEffect(() => {
    if (showDebug) {
      const token = localStorage.getItem("auth_access_token")
      const apiToken = apiClient.authToken

      addDebugInfo(`Token en localStorage: ${!!token}`)
      addDebugInfo(`Token en API client: ${!!apiToken}`)
      addDebugInfo(`Usuario autenticado: ${isAuthenticated}`)
      addDebugInfo(`Perfil cargado: ${!!profile}`)
      addDebugInfo(`Inicializado: ${initialized}`)
      addDebugInfo(`Cargando: ${loading}`)
      addDebugInfo(`Error: ${error || "Ninguno"}`)

      if (profile) {
        addDebugInfo(`Datos del perfil: ID=${profile.id}, Email=${profile.email}`)
        addDebugInfo(`Nombre completo: ${profile.nombre} ${profile.apellido}`)
        addDebugInfo(`Fecha nacimiento: ${profile.fecha_nacimiento || "No especificada"}`)
        addDebugInfo(`MFA habilitado: ${profile.mfa_enabled ? "Sí" : "No"}`)
      }
    }
  }, [showDebug, isAuthenticated, profile, initialized, loading, error, addDebugInfo])

  // Inicializar datos cuando se carga el perfil por primera vez
  useEffect(() => {
    if (profile && (!datosInicializados || !editando)) {
      setDatosEditados({
        nombre: profile.nombre || "",
        apellido: profile.apellido || "",
        email: profile.email || "",
        telefono: profile.telefono || "",
        rut: profile.rut || "",
        fechaNacimiento: profile.fecha_nacimiento || profile.fechaNacimiento || "",
        fecha_nacimiento: profile.fecha_nacimiento || profile.fechaNacimiento || "",
        genero: profile.genero || "",
        direccion: profile.direccion || "",
        ciudad: profile.ciudad || "",
        region: profile.region || "",
        alergias: profile.alergias || "",
        medicamentos: profile.medicamentos || "",
        condicionesMedicas: profile.condicionesMedicas || "",
        contactoEmergencia: profile.contactoEmergencia || {
          nombre: "",
          relacion: "",
          telefono: "",
        },
      })

      if (profile.preferenciasNotificaciones) {
        setNotificationPrefs(profile.preferenciasNotificaciones)
      }

      setDatosInicializados(true)
      addDebugInfo("Formulario inicializado con datos del perfil")
    }
  }, [profile, datosInicializados, editando, addDebugInfo])

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  // Manejar cambios en los campos del formulario
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target

      // Manejo especial para fecha de nacimiento
      if (name === "fecha_nacimiento") {
        setDatosEditados((prev) => ({
          ...prev,
          fecha_nacimiento: value,
          fechaNacimiento: value, // Mantener ambos formatos por compatibilidad
        }))
      } else {
        setDatosEditados((prev) => ({
          ...prev,
          [name]: value,
        }))
      }

      // Limpiar error del campo si se está escribiendo
      if (erroresValidacion[name]) {
        setErroresValidacion((prev) => {
          const nuevosErrores = { ...prev }
          delete nuevosErrores[name]
          return nuevosErrores
        })
      }
    },
    [erroresValidacion],
  )

  // Manejar cambios en los campos select
  const handleSelectChange = useCallback(
    (name: string, value: string) => {
      setDatosEditados((prev) => ({
        ...prev,
        [name]: value,
      }))

      // Limpiar error del campo si se está seleccionando
      if (erroresValidacion[name]) {
        setErroresValidacion((prev) => {
          const nuevosErrores = { ...prev }
          delete nuevosErrores[name]
          return nuevosErrores
        })
      }
    },
    [erroresValidacion],
  )

  // Manejar cambios en el contacto de emergencia
  const handleContactoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDatosEditados((prev) => ({
      ...prev,
      contactoEmergencia: {
        ...prev.contactoEmergencia!,
        [name]: value,
      },
    }))
  }, [])

  // Manejar la selección de foto de perfil
  const handleFotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFotoSeleccionada(file)

      // Crear una URL para previsualizar la imagen
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewFoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Guardar cambios
  const handleGuardar = useCallback(async () => {
    try {
      clearError()
      setSuccessMessage(null)

      // Validar campos antes de enviar
      const errores = validarCampos(datosEditados)
      if (Object.keys(errores).length > 0) {
        setErroresValidacion(errores)
        addDebugInfo(`Errores de validación: ${Object.keys(errores).join(", ")}`)
        return
      }

      // Limpiar errores si la validación pasa
      setErroresValidacion({})

      addDebugInfo("Iniciando guardado de perfil...")

      // Subir avatar si se seleccionó uno nuevo
      if (fotoSeleccionada) {
        addDebugInfo("Subiendo avatar...")
        const avatarResult = await uploadAvatar(fotoSeleccionada)
        if (avatarResult.success && avatarResult.avatarUrl) {
          datosEditados.avatar = avatarResult.avatarUrl
          addDebugInfo("Avatar subido exitosamente")
        }
      }

      // Preparar datos para el API - asegurar formato correcto de fecha
      const datosParaAPI = {
        ...datosEditados,
        // Asegurar que fecha_nacimiento esté en formato correcto (YYYY-MM-DD)
        fecha_nacimiento: datosEditados.fecha_nacimiento || datosEditados.fechaNacimiento,
      }

      // Remover fechaNacimiento del objeto que se envía al API
      delete datosParaAPI.fechaNacimiento

      addDebugInfo(`Datos a enviar al API: ${JSON.stringify(datosParaAPI)}`)
      addDebugInfo(`Fecha de nacimiento a enviar: ${datosParaAPI.fecha_nacimiento}`)

      // Actualizar perfil
      addDebugInfo("Actualizando perfil en servidor...")
      const result = await updateProfile(datosParaAPI)

      if (result.success) {
        setEditando(false)
        setFotoSeleccionada(null)
        setPreviewFoto(null)
        setSuccessMessage("Perfil actualizado exitosamente")
        addDebugInfo("Perfil guardado exitosamente")

        // Marcar que los datos necesitan reinicializarse para mostrar los nuevos valores
        setDatosInicializados(false)

        if (result.warning) {
          addDebugInfo(`Advertencia: ${result.warning}`)
        }
      }
    } catch (error) {
      // Error silencioso al guardar perfil
      addDebugInfo(`Error guardando: ${error}`)
    }
  }, [fotoSeleccionada, datosEditados, clearError, addDebugInfo, uploadAvatar, updateProfile, validarCampos])

  // Cancelar edición
  const handleCancelar = useCallback(() => {
    if (profile) {
      setDatosEditados({
        nombre: profile.nombre || "",
        apellido: profile.apellido || "",
        email: profile.email || "",
        telefono: profile.telefono || "",
        rut: profile.rut || "",
        fechaNacimiento: profile.fecha_nacimiento || profile.fechaNacimiento || "",
        fecha_nacimiento: profile.fecha_nacimiento || profile.fechaNacimiento || "",
        genero: profile.genero || "",
        direccion: profile.direccion || "",
        ciudad: profile.ciudad || "",
        region: profile.region || "",
        alergias: profile.alergias || "",
        medicamentos: profile.medicamentos || "",
        condicionesMedicas: profile.condicionesMedicas || "",
        contactoEmergencia: profile.contactoEmergencia || {
          nombre: "",
          relacion: "",
          telefono: "",
        },
      })
    }
    setEditando(false)
    setPreviewFoto(null)
    setFotoSeleccionada(null)
    clearError()
    setErroresValidacion({})
    addDebugInfo("Edición cancelada")
  }, [profile, clearError, addDebugInfo])

  // Manejar cambio de contraseña
  const handlePasswordChange = useCallback(async () => {
    setPasswordError(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)

    if (result.success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setSuccessMessage("Contraseña actualizada exitosamente")
      addDebugInfo("Contraseña cambiada exitosamente")
    } else {
      setPasswordError(result.error || "Error al cambiar contraseña")
      addDebugInfo(`Error cambiando contraseña: ${result.error}`)
    }
  }, [passwordData, changePassword, addDebugInfo])

  // Guardar preferencias de notificaciones
  const handleSaveNotifications = useCallback(async () => {
    try {
      const result = await updateProfile({ preferenciasNotificaciones: notificationPrefs })
      if (result.success) {
        setSuccessMessage("Preferencias de notificaciones guardadas exitosamente")
        addDebugInfo("Preferencias de notificaciones guardadas")
      }
    } catch (error) {
      // Error silencioso al guardar preferencias
      addDebugInfo(`Error guardando preferencias: ${error}`)
    }
  }, [notificationPrefs, updateProfile, addDebugInfo])

  // Recargar perfil manualmente
  const handleReloadProfile = useCallback(async () => {
    addDebugInfo("Recargando perfil manualmente...")
    await loadProfile()
  }, [loadProfile, addDebugInfo])

  // Manejar cambio de pestaña
  const handleTabChange = useCallback((value: string) => {
    // Bloquear pestaña de notificaciones para usuarios regulares
    if (value === "notificaciones" && authUser?.role === "user") {
      return // No permitir el cambio
    }
    setActiveTab(value)
  }, [authUser?.role])

  // Verificar si hay errores de validación
  const tieneErrores = useMemo(() => {
    return Object.keys(erroresValidacion).length > 0
  }, [erroresValidacion])

  const personalInfoContent = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de perfil */}
        <div className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Foto de Perfil</h3>
              <p className="text-sm text-gray-600">Tu foto visible para el equipo médico</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <ProfileImage
                  src={previewFoto || profile?.foto_perfil || profile?.avatar}
                  alt={`${profile?.nombre} ${profile?.apellido}`}
                  fallback={`${profile?.nombre?.[0] || ""}${profile?.apellido?.[0] || ""}`}
                  size="lg"
                  className="h-32 w-32"
                />
                {editando && (
                  <label
                    htmlFor="foto-perfil"
                    className="absolute bottom-0 right-0 bg-cyan-500 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-600"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="foto-perfil"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFotoChange}
                    />
                  </label>
                )}
              </div>
              <h3 className="font-medium text-lg">
                {profile?.nombre} {profile?.apellido}
              </h3>
              <p className="text-gray-500 text-sm">{profile?.email}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  {profile?.role === "user" ? "Paciente" : profile?.role === "medico" ? "Médico" : "Admin"}
                </Badge>
                {profile?.email_verified && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    Verificado
                  </Badge>
                )}
                {profile?.mfa_enabled && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                    MFA
                  </Badge>
                )}
              </div>
              {profile?.creado_en && (
                <p className="text-xs text-gray-400 mt-2">Miembro desde {formatDate(profile.creado_en)}</p>
              )}
            </div>
            <div className="flex justify-center mt-4">
              {!editando ? (
                <Button variant="outline" onClick={() => setEditando(true)} className="w-full bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300">
                  Editar Perfil
                </Button>
              ) : (
                <div className="flex gap-2 w-full">
                  <Button variant="outline" onClick={handleCancelar} className="flex-1 bg-white/80 hover:bg-white border-gray-200 hover:border-[#59c3ed]/50 focus:border-[#59c3ed] focus:ring-[#59c3ed]/20 transition-all duration-300" disabled={updating}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleGuardar}
                    className="flex-1 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                    disabled={updating || tieneErrores}
                  >
                    {updating ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulario de información personal */}
        <div className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] md:col-span-2">
          <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Información Personal</h3>
            </div>
            <div>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={datosEditados.nombre || ""}
                      onChange={handleChange}
                      disabled={!editando}
                      className={erroresValidacion.nombre ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {erroresValidacion.nombre && <p className="text-sm text-red-500">{erroresValidacion.nombre}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      name="apellido"
                      value={datosEditados.apellido || ""}
                      onChange={handleChange}
                      disabled={!editando}
                      className={erroresValidacion.apellido ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {erroresValidacion.apellido && <p className="text-sm text-red-500">{erroresValidacion.apellido}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={datosEditados.email || ""}
                      onChange={handleChange}
                      disabled={true} // Email no se puede editar según el API
                    />
                    <p className="text-xs text-gray-500">El email no se puede modificar</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={datosEditados.telefono || ""}
                      onChange={handleChange}
                      disabled={!editando}
                      className={erroresValidacion.telefono ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {erroresValidacion.telefono && <p className="text-sm text-red-500">{erroresValidacion.telefono}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input
                      id="rut"
                      name="rut"
                      value={datosEditados.rut || ""}
                      onChange={handleChange}
                      disabled={true} // RUT no se puede editar según el API
                    />
                    <p className="text-xs text-gray-500">El RUT no se puede modificar</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Fecha de Nacimiento *
                    </Label>
                    <Input
                      id="fecha_nacimiento"
                      name="fecha_nacimiento"
                      type="date"
                      value={formatDateForInput(datosEditados.fecha_nacimiento)}
                      onChange={handleChange}
                      disabled={!editando}
                      className={erroresValidacion.fecha_nacimiento ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {erroresValidacion.fecha_nacimiento && (
                      <p className="text-sm text-red-500">{erroresValidacion.fecha_nacimiento}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero">Género *</Label>
                  <Select
                    disabled={!editando}
                    value={datosEditados.genero || ""}
                    onValueChange={(value) => handleSelectChange("genero", value)}
                  >
                    <SelectTrigger id="genero" className={erroresValidacion.genero ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                      <SelectItem value="prefiero-no-decir">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                  {erroresValidacion.genero && <p className="text-sm text-red-500">{erroresValidacion.genero}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={datosEditados.direccion || ""}
                    onChange={handleChange}
                    disabled={!editando}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      name="ciudad"
                      value={datosEditados.ciudad || ""}
                      onChange={handleChange}
                      disabled={!editando}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Región</Label>
                    <Input
                      id="region"
                      name="region"
                      value={datosEditados.region || ""}
                      onChange={handleChange}
                      disabled={!editando}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo_postal">Código Postal</Label>
                    <Input
                      id="codigo_postal"
                      name="codigo_postal"
                      value={datosEditados.codigo_postal || ""}
                      onChange={handleChange}
                      disabled={!editando}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pais">País</Label>
                    <Input
                      id="pais"
                      name="pais"
                      value={datosEditados.pais || ""}
                      onChange={handleChange}
                      disabled={!editando}
                    />
                  </div>
                </div>

                {/* Información de contacto de emergencia */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Contacto de Emergencia</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contacto_nombre">Nombre del Contacto</Label>
                      <Input
                        id="contacto_nombre"
                        name="contacto_nombre"
                        value={datosEditados.contacto_nombre || ""}
                        onChange={handleContactoChange}
                        disabled={!editando}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contacto_telefono">Teléfono del Contacto</Label>
                      <Input
                        id="contacto_telefono"
                        name="contacto_telefono"
                        value={datosEditados.contacto_telefono || ""}
                        onChange={handleContactoChange}
                        disabled={!editando}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contacto_relacion">Relación</Label>
                    <Input
                      id="contacto_relacion"
                      name="contacto_relacion"
                      value={datosEditados.contacto_relacion || ""}
                      onChange={handleContactoChange}
                      disabled={!editando}
                    />
                  </div>
                </div>
              </form>
              {profile?.actualizado_en && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400">Última actualización: {formatDate(profile.actualizado_en)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contacto de emergencia */}
        {/* Eliminado: Sección de Contacto de Emergencia (Próximamente) */}
      </div>
    ),
    [
      profile,
      datosEditados,
      editando,
      updating,
      previewFoto,
      handleChange,
      handleSelectChange,
      handleContactoChange,
      handleFotoChange,
      handleGuardar,
      handleCancelar,
      formatDate,
      formatDateForInput,
      erroresValidacion,
      tieneErrores,
    ],
  )

  const notificationsContent = useMemo(
    () => (
      <div className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Preferencias de Notificaciones</h3>
            <p className="text-sm text-gray-600">Configura cómo quieres recibir notificaciones</p>
          </div>
          <div>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Notificaciones por Email</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailCitas">Recordatorios de citas</Label>
                    <Switch
                      id="emailCitas"
                      checked={notificationPrefs.emailCitas}
                      onCheckedChange={(checked) => setNotificationPrefs((prev) => ({ ...prev, emailCitas: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailResultados">Resultados de exámenes</Label>
                    <Switch
                      id="emailResultados"
                      checked={notificationPrefs.emailResultados}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs((prev) => ({ ...prev, emailResultados: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailMensajes">Mensajes del equipo médico</Label>
                    <Switch
                      id="emailMensajes"
                      checked={notificationPrefs.emailMensajes}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs((prev) => ({ ...prev, emailMensajes: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailPromociones">Promociones y noticias</Label>
                    <Switch
                      id="emailPromociones"
                      checked={notificationPrefs.emailPromociones}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs((prev) => ({ ...prev, emailPromociones: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Notificaciones por SMS</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smsCitas">Recordatorios de citas</Label>
                    <Switch
                      id="smsCitas"
                      checked={notificationPrefs.smsCitas}
                      onCheckedChange={(checked) => setNotificationPrefs((prev) => ({ ...prev, smsCitas: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smsResultados">Resultados urgentes</Label>
                    <Switch
                      id="smsResultados"
                      checked={notificationPrefs.smsResultados}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs((prev) => ({ ...prev, smsResultados: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSaveNotifications} disabled={updating} className="bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
              {updating ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Preferencias
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    ),
    [notificationPrefs, updating, handleSaveNotifications],
  )

  // Mostrar loading solo cuando realmente está cargando
  if (loading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Cargando tu perfil</h2>
            <p className="text-sm text-gray-500">Esto solo tomará un momento...</p>
          </div>
        </div>

      </div>
    )
  }

  // Mostrar error solo si hay un error después de cargar
  if (!profile && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudo cargar la información del perfil. {error && ` Error: ${error}`}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={handleReloadProfile} variant="outline" disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? "Cargando..." : "Reintentar cargar perfil"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">perfil</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Gestiona tu información personal y preferencias
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleReloadProfile} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>



      {/* Mensajes de estado */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6 bg-gray-100/50 border border-gray-200 p-0 rounded-lg grid grid-cols-4 w-full h-12 overflow-hidden">
          <TabsTrigger 
            value="personal" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium rounded-l-md border-r border-gray-200/50"
          >
            Personal
          </TabsTrigger>
          <TabsTrigger 
            value="medica" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium opacity-50 cursor-not-allowed border-r border-gray-200/50"
            disabled
          >
            Médica
          </TabsTrigger>
          {(authUser?.role === "user" || authUser?.role === "recepcionista") ? (
            <TabsTrigger 
              value="notificaciones" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium opacity-50 cursor-not-allowed border-r border-gray-200/50"
              disabled
            >
              Notif.
            </TabsTrigger>
          ) : (
            <TabsTrigger 
              value="notificaciones" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium border-r border-gray-200/50"
            >
              Notif.
            </TabsTrigger>
          )}
          <TabsTrigger 
            value="seguridad" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#59c3ed] data-[state=active]:to-[#479cd0] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 hover:bg-white/80 text-xs md:text-sm px-2 py-3 h-full flex items-center justify-center font-medium rounded-r-md"
          >
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Información Personal */}
        <TabsContent value="personal">{personalInfoContent}</TabsContent>

        {/* Pestaña de Información Médica */}
        <TabsContent value="medica">
          <div className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Función Próximamente</h3>
              <p className="text-muted-foreground mb-6">
                La información médica estará disponible próximamente.
              </p>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                En desarrollo
              </Badge>
            </div>
          </div>
        </TabsContent>

        {/* Pestaña de Notificaciones */}
        <TabsContent value="notificaciones">
          {(authUser?.role === "user" || authUser?.role === "recepcionista") ? (
            <div className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative text-center py-16">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Función Próximamente</h3>
                <p className="text-muted-foreground mb-6">
                  La configuración de notificaciones estará disponible próximamente.
                </p>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  En desarrollo
                </Badge>
              </div>
            </div>
          ) : (
            notificationsContent
          )}
        </TabsContent>

        {/* Pestaña de Seguridad */}
        <TabsContent value="seguridad">
          <SecurityTab
            profile={profile}
            updating={updating}
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            passwordError={passwordError}
            handlePasswordChange={handlePasswordChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
