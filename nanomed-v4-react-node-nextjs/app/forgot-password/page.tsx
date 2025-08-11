"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api/client"
import { MainNavigation } from "@/components/main-navigation"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!email || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiClient.post("/api/auth/forgot-password", { email })

      if (!response.error) {
        setMessage(response.message || "Se ha enviado un enlace para restablecer tu contraseña")
        setIsSuccess(true)
        setEmail("")
      } else {
        setError(response.message || "Error al procesar la solicitud")
      }
    } catch (err) {
      setError("Error al procesar la solicitud. Por favor intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <MainNavigation />

      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-center mb-8">
                <Image src="/images/logo.svg" alt="nanoMED" width={180} height={45} className="h-12 w-auto" />
              </div>

              <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Recuperar contraseña</h1>
              <p className="text-center text-gray-600 mb-6">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
              </p>

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {isSuccess && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{message}</AlertDescription>
                </Alert>
              )}

              {!isSuccess && (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Correo electrónico
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className="h-12 rounded-md border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-medium"
                    disabled={isSubmitting || !email}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Recordaste tu contraseña?{" "}
                  <Link href="/login" className="text-cyan-500 hover:text-cyan-600 font-medium">
                    Iniciar sesión
                  </Link>
                </p>
              </div>

              {isSuccess && (
                <div className="mt-4 text-center">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Volver al login
                    </Button>
                  </Link>
                </div>
              )}

              {/* Información de debug */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-cyan-500">Información de debug</summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-left">
                    <p>
                      <strong>API URL:</strong> {apiClient.apiBaseURL}
                    </p>
                    <p>
                      <strong>Environment:</strong> {process.env.NODE_ENV}
                    </p>
                    <p>
                      <strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 