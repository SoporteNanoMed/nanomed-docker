"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Upload, Info, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NuevoExamenPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Nuevo Examen</h1>
          <p className="text-gray-500">
            Información sobre el nuevo sistema de gestión de exámenes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Sistema de Exámenes Actualizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              <strong>¡Importante!</strong> El sistema de gestión de exámenes ha sido migrado completamente a Azure Blob Storage.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">🔄 Cambios en el Sistema</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Ya no se crean exámenes a través de formularios en la aplicación</li>
                <li>• Los exámenes se gestionan directamente subiendo archivos al almacenamiento en la nube</li>
                <li>• Mejor rendimiento y escalabilidad del sistema</li>
                <li>• Acceso más rápido a los archivos de exámenes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">📁 Gestión de Archivos</h3>
              <p className="text-sm text-gray-600 mb-3">
                Los exámenes ahora se gestionan a través del sistema de blob storage. 
                Los archivos se organizan automáticamente por usuario y fecha.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">🎯 Próximos Pasos</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => router.push('/dashboard/doctor/examenes')}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Ver Exámenes Existentes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard/doctor')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Panel de Médico
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 Información Técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Fecha de migración:</strong> Enero 2025</p>
            <p><strong>Sistema anterior:</strong> Base de datos SQL Server</p>
            <p><strong>Sistema actual:</strong> Azure Blob Storage</p>
            <p><strong>Beneficios:</strong> Mayor escalabilidad, mejor rendimiento, gestión simplificada</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
