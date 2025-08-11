"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Image from "next/image"
import { CliengoChat } from "@/components/cliengo-chat"

export default function RegisterPage() {
  const router = useRouter()
  // Agrega estos estados locales para manejar loading y error:
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const clearError = () => setError("")

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    rut: "",
    fechaNacimiento: "",
    password: "",
    confirmPassword: "",
    genero: "",
    direccion: "",
    ciudad: "",
    region: "",
  })

  const [acceptTerms, setAcceptTerms] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es requerido"
    }

    if (!formData.apellido.trim()) {
      errors.apellido = "El apellido es requerido"
    }

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El correo electrónico no es válido"
    }

    if (!formData.rut.trim()) {
      errors.rut = "El RUT es requerido"
    }

    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = "La fecha de nacimiento es requerida"
    }

    if (!formData.genero) {
      errors.genero = "El género es requerido"
    }

    if (!formData.direccion.trim()) {
      errors.direccion = "La dirección es requerida"
    }

    if (!formData.ciudad.trim()) {
      errors.ciudad = "La ciudad es requerida"
    }

    if (!formData.region.trim()) {
      errors.region = "La región es requerida"
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (!acceptTerms) {
      errors.terms = "Debes aceptar los términos y condiciones"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSuccessMessage("")
    setLoading(true)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    // Preparar datos para la API según el formato especificado
    const registerData = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      rut: formData.rut.trim(),
      telefono: formData.telefono.trim() || undefined,
      fecha_nacimiento: formData.fechaNacimiento,
      genero: formData.genero,
      direccion: formData.direccion.trim(),
      ciudad: formData.ciudad.trim(),
      region: formData.region.trim(),
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      })

      const responseData = await response.json()

      if (response.ok) {
        setSuccessMessage("¡Registro exitoso! Revisa tu correo electrónico para verificar tu cuenta.")

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/login?message=Cuenta creada exitosamente. Por favor inicia sesión.")
        }, 3000)
      } else {
        // Mostrar error específico de la API
        const errorMessage =
          responseData.body ||
          responseData.message ||
          responseData.error ||
          `Error ${response.status}: ${response.statusText}`
        setError(errorMessage)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setError("Error de conexión con la API. Por favor intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col min-h-screen">
      <CliengoChat />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#f0f6f7] to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-5xl font-bold text-[#000000] mb-6">Crear cuenta</h1>
              
              {/* Título principal con diseño elegante */}
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Únete a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">nanoMED</span>
                </h2>
              </div>

              {/* Descripción principal */}
              <div className="max-w-4xl mx-auto mb-8">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  Crea tu cuenta de paciente y accede a todos nuestros servicios médicos digitales
                </p>
              </div>

              {/* Información adicional con diseño premium */}
              <div className="max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-full border border-[#59c3ed]/20">
                  <div className="w-2 h-2 bg-[#59c3ed] rounded-full"></div>
                  <p className="text-lg text-gray-700 font-medium">
                    Registro rápido y seguro para acceder a citas, resultados y tu historial médico
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de registro con diseño moderno */}
            <div className="flex justify-center mb-16">
              <div className="w-full max-w-2xl">
                <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
                  {/* Efectos de fondo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/5 via-transparent to-[#479cd0]/5"></div>
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-[#59c3ed]/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#479cd0]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                  </div>
                  
                  {/* Contenido del formulario */}
                  <div className="relative z-10 px-8 py-12">
                    <div className="flex justify-center mb-8">
                      <Image src="/images/logo.svg" alt="nanoMED" width={180} height={45} className="h-12 w-auto" />
                    </div>

                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Crear una cuenta de paciente</h3>
                    <p className="text-center text-gray-600 mb-8">
                      Regístrate como paciente para acceder a nuestros servicios médicos y gestionar tus citas
                    </p>

                    {/* Mensaje de éxito */}
                    {successMessage && (
                      <Alert className="mb-6 border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                      </Alert>
                    )}

                    {/* Mensaje de error */}
                    {error && (
                      <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                      </Alert>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                            Nombre *
                          </label>
                          <Input
                            id="nombre"
                            name="nombre"
                            placeholder="Ingresa tu nombre"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                            value={formData.nombre}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          {formErrors.nombre && <p className="text-sm text-red-600">{formErrors.nombre}</p>}
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="apellido" className="text-sm font-medium text-gray-700">
                            Apellido *
                          </label>
                          <Input
                            id="apellido"
                            name="apellido"
                            placeholder="Ingresa tu apellido"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                            value={formData.apellido}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          {formErrors.apellido && <p className="text-sm text-red-600">{formErrors.apellido}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Correo electrónico *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="correo@ejemplo.com"
                          className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                            Teléfono
                          </label>
                          <Input
                            id="telefono"
                            name="telefono"
                            type="tel"
                            placeholder="+56 9 XXXX XXXX"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                            value={formData.telefono}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="rut" className="text-sm font-medium text-gray-700">
                            RUT *
                          </label>
                          <Input
                            id="rut"
                            name="rut"
                            placeholder="12.345.678-9"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                            value={formData.rut}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          {formErrors.rut && <p className="text-sm text-red-600">{formErrors.rut}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="fechaNacimiento" className="text-sm font-medium text-gray-700">
                          Fecha de nacimiento *
                        </label>
                        <Input
                          id="fechaNacimiento"
                          name="fechaNacimiento"
                          type="date"
                          className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                          value={formData.fechaNacimiento}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {formErrors.fechaNacimiento && <p className="text-sm text-red-600">{formErrors.fechaNacimiento}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="genero" className="text-sm font-medium text-gray-700">
                            Género *
                          </label>
                          <select
                            id="genero"
                            name="genero"
                            className="h-12 rounded-xl border border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] px-3 transition-all duration-300"
                            value={formData.genero}
                            onChange={(e) => handleChange(e as any)}
                            disabled={loading}
                          >
                            <option value="">Selecciona tu género</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                          </select>
                          {formErrors.genero && <p className="text-sm text-red-600">{formErrors.genero}</p>}
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="direccion" className="text-sm font-medium text-gray-700">
                            Dirección *
                          </label>
                          <Input
                            id="direccion"
                            name="direccion"
                            placeholder="Ingresa tu dirección"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                            value={formData.direccion}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          {formErrors.direccion && <p className="text-sm text-red-600">{formErrors.direccion}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="ciudad" className="text-sm font-medium text-gray-700">
                            Ciudad *
                          </label>
                          <Input
                            id="ciudad"
                            name="ciudad"
                            placeholder="Ingresa tu ciudad"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                            value={formData.ciudad}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          {formErrors.ciudad && <p className="text-sm text-red-600">{formErrors.ciudad}</p>}
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="region" className="text-sm font-medium text-gray-700">
                            Región *
                          </label>
                          <Input
                            id="region"
                            name="region"
                            placeholder="Ingresa tu región"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                            value={formData.region}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          {formErrors.region && <p className="text-sm text-red-600">{formErrors.region}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Contraseña *
                          </label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <p className="text-xs text-gray-500">
                            Mínimo 8 caracteres, incluyendo una letra mayúscula, minúscula y un número
                          </p>
                          {formErrors.password && <p className="text-sm text-red-600">{formErrors.password}</p>}
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                            Confirmar contraseña *
                          </label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#59c3ed] focus:ring-[#59c3ed] transition-all duration-300"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          {formErrors.confirmPassword && <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="terms"
                            checked={acceptTerms}
                            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                            disabled={loading}
                            className="mt-1"
                          />
                          <label htmlFor="terms" className="text-sm text-gray-600">
                            Acepto los{" "}
                            <Link href="#" className="text-[#59c3ed] hover:text-[#479cd0] font-medium transition-colors">
                              Términos y Condiciones
                            </Link>{" "}
                            y la{" "}
                            <Link href="#" className="text-[#59c3ed] hover:text-[#479cd0] font-medium transition-colors">
                              Política de Privacidad
                            </Link>
                          </label>
                        </div>
                        {formErrors.terms && <p className="text-sm text-red-600">{formErrors.terms}</p>}

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="newsletter"
                            checked={newsletter}
                            onCheckedChange={(checked) => setNewsletter(checked as boolean)}
                            disabled={loading}
                            className="mt-1"
                          />
                          <label htmlFor="newsletter" className="text-sm text-gray-600">
                            Deseo recibir información sobre servicios, promociones y noticias de salud (opcional)
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            Creando cuenta...
                          </div>
                        ) : (
                          "Crear cuenta de paciente"
                        )}
                      </Button>
                    </form>

                    <div className="mt-8 text-center">
                      <p className="text-sm text-gray-600">
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login" className="text-[#59c3ed] hover:text-[#479cd0] font-semibold transition-colors">
                          Inicia sesión aquí
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Registro seguro */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                            Registro seguro
                          </h4>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed text-justify">
                          Tus datos están protegidos con <span className="font-semibold text-[#59c3ed]">encriptación de nivel bancario</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acceso completo */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                            Acceso completo
                          </h4>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed text-justify">
                          <span className="font-semibold text-[#59c3ed]">Accede a todos los servicios</span> médicos, citas y resultados
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verificación rápida */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                            Verificación rápida
                          </h4>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed text-justify">
                          <span className="font-semibold text-[#59c3ed]">Verificación por email</span> para activar tu cuenta
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <Image src="/images/webclip.png" alt="nanoMED" width={150} height={40} className="mb-4" />
              <p className="text-gray-400 mb-4 text-justify">
                En nanoMED Ilevamos salud de calidad a empresas y comunidades rurales, con tecnología avanzada y
                atención donde más se necesita.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/nanoMedcl"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/nanomed.clinica/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/nano-med-1/posts/?feedView=all/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/especialidades" className="text-gray-400 hover:text-white transition-colors">
                    Especialidades
                  </Link>
                </li>
                <li>
                  <Link href="/salud-ocupacional" className="text-gray-400 hover:text-white transition-colors">
                    Salud Ocupacional
                  </Link>
                </li>
                <li>
                  <Link href="/requisitos-examenes" className="text-gray-400 hover:text-white transition-colors">
                    Requisitos Exámenes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Imagenología
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Laboratorio
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Telemedicina
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Salud Ocupacional
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-400 flex-shrink-0"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-gray-400">José Joaquín Pérez #240, Salamanca, Chile.</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-400 flex-shrink-0"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="text-gray-400">+56 9 8828 9770</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-400 flex-shrink-0"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="text-gray-400">contacto@nanomed.cl</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} nanoMED. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
