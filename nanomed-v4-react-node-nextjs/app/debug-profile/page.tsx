"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/config"

export default function DebugProfilePage() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_access_token")
    setToken(storedToken)
    if (storedToken) {
      apiClient.setToken(storedToken)
    }
  }, [])

  const testApiCall = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const result = await apiClient.get(ENDPOINTS.USER.ME)

      setResponse(result)

      if (result.error) {
        setError(`API Error: ${result.message} (Status: ${result.status})`)
      }
    } catch (err: any) {
      setError(`Exception: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = () => {
    const storedToken = localStorage.getItem("auth_access_token")
    setToken(storedToken)
    if (storedToken) {
      apiClient.setToken(storedToken)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Debug Profile API</h1>
          <p className="text-gray-500">Test the /api/users/me endpoint</p>
        </div>
        <Button onClick={refreshToken} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Token
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Current API settings and token status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>API Base URL:</strong> {apiClient.apiBaseURL}
          </p>
          <p>
            <strong>Endpoint:</strong> {ENDPOINTS.USER.ME}
          </p>
          <p>
            <strong>Full URL:</strong> {apiClient.apiBaseURL}
            {ENDPOINTS.USER.ME}
          </p>
          <p>
            <strong>Token Available:</strong> {token ? "Yes" : "No"}
          </p>
          {token && (
            <p>
              <strong>Token Preview:</strong> {token.substring(0, 20)}...
            </p>
          )}
          <p>
            <strong>API Client Token:</strong> {apiClient.authToken ? "Set" : "Not Set"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test API Call</CardTitle>
          <CardDescription>Make a direct call to /api/users/me</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testApiCall} disabled={loading || !token} className="w-full">
            {loading ? (
              <>
                <LoadingSpinner className="h-4 w-4 mr-2" />
                Testing API...
              </>
            ) : (
              "Test /api/users/me"
            )}
          </Button>

          {!token && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No authentication token found. Please log in first.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {response.error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              API Response
            </CardTitle>
            <CardDescription>
              Status: {response.status} | Error: {response.error ? "Yes" : "No"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">{JSON.stringify(response, null, 2)}</pre>

            {response.body && !response.error && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Extracted User Data:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <strong>ID:</strong> {response.body.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {response.body.email}
                  </p>
                  <p>
                    <strong>Name:</strong> {response.body.nombre} {response.body.apellido}
                  </p>
                  <p>
                    <strong>Phone:</strong> {response.body.telefono}
                  </p>
                  <p>
                    <strong>RUT:</strong> {response.body.rut}
                  </p>
                  <p>
                    <strong>Birth Date:</strong> {response.body.fecha_nacimiento}
                  </p>
                  <p>
                    <strong>Gender:</strong> {response.body.genero}
                  </p>
                  <p>
                    <strong>City:</strong> {response.body.ciudad}
                  </p>
                  <p>
                    <strong>Region:</strong> {response.body.region}
                  </p>
                  <p>
                    <strong>Role:</strong> {response.body.role}
                  </p>
                  <p>
                    <strong>Email Verified:</strong> {response.body.email_verified ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>MFA Enabled:</strong> {response.body.mfa_enabled ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
