"use client"

import { useAuth } from "@/lib/api/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DebugAuthPage() {
  const { user, loading, isAuthenticated, error } = useAuth()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug de Autenticación</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Estado de Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Estado:</span>
            <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Autenticado" : "No autenticado"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Cargando:</span>
            <Badge variant={loading ? "secondary" : "outline"}>
              {loading ? "Sí" : "No"}
            </Badge>
          </div>
          
          {error && (
            <div className="flex items-center gap-2">
              <span>Error:</span>
              <Badge variant="destructive">{error}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del Token</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>Token en localStorage:</strong>
              <div className="text-sm text-gray-600 mt-1">
                {typeof window !== "undefined" ? localStorage.getItem("auth_access_token")?.substring(0, 50) + "..." : "No disponible"}
              </div>
            </div>
            
            <div>
              <strong>Usuario en localStorage:</strong>
              <div className="text-sm text-gray-600 mt-1">
                {typeof window !== "undefined" ? localStorage.getItem("auth_user")?.substring(0, 100) + "..." : "No disponible"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()}>
          Recargar Página
        </Button>
        
        <Button 
          variant="outline" 
        >
          Log localStorage
        </Button>
      </div>
    </div>
  )
} 