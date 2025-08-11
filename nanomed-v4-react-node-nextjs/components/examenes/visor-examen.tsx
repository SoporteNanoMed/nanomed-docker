"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, ZoomIn, ZoomOut, RotateCw, Download, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Examen } from "./examen-card"

interface VisorExamenProps {
  examen: Examen
  onClose: () => void
}

export function VisorExamen({ examen, onClose }: VisorExamenProps) {
  const [escala, setEscala] = useState(1)
  const [rotacion, setRotacion] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Prevenir scroll del body cuando el visor está abierto
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const aumentarZoom = () => setEscala((prev) => Math.min(prev + 0.25, 3))
  const disminuirZoom = () => setEscala((prev) => Math.max(prev - 0.25, 0.5))
  const rotar = () => setRotacion((prev) => (prev + 90) % 360)

  // Verificar si el archivo está en Azure Blob Storage
  const esArchivoAzure = examen.url && (
    examen.url.includes('blob.core.windows.net') || 
    examen.url.includes('azurewebsites.net') ||
    examen.url.includes('azure.com')
  )

  const handleDownload = () => {
    if (examen.url && examen.url !== "/placeholder.svg?height=400&width=600") {
      // Para archivos del blob storage, usar la URL directamente
      if (examen.esBlobStorage) {
        window.open(examen.url, "_blank")
      } else {
        // Para archivos de la base de datos, usar el endpoint de descarga
        const examId = examen.id
        const downloadUrl = `/api/exams/${examId}/file`
        window.open(downloadUrl, "_blank")
      }
    } else {
      alert("Este examen no tiene archivo adjunto disponible para descargar.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Barra superior */}
      <div className="bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{examen.titulo}</h3>
          {examen.esBlobStorage && (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              Archivo directo
            </div>
          )}
          {esArchivoAzure && !examen.esBlobStorage && (
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              Azure
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={disminuirZoom}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={aumentarZoom}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={rotar}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contenido del visor */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {examen.tipo === "imagen" ? (
          <div
            className="relative"
            style={{
              transform: `scale(${escala}) rotate(${rotacion}deg)`,
              transition: "transform 0.3s ease",
            }}
          >
            {cargando && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            )}
            <Image
              src={examen.url || "/placeholder.svg"}
              alt={examen.titulo}
              width={800}
              height={600}
              className="max-h-[80vh] w-auto object-contain"
              onLoad={() => setCargando(false)}
              onError={() => {
                setCargando(false)
                console.error("Error al cargar la imagen:", examen.url)
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full h-full overflow-hidden">
            {examen.url && examen.url !== "/placeholder.svg?height=400&width=600" ? (
              // Mostrar PDF real si hay URL válida
              <iframe
                src={examen.url}
                className="w-full h-full"
                style={{
                  transform: `scale(${escala}) rotate(${rotacion}deg)`,
                  transition: "transform 0.3s ease",
                }}
                onLoad={() => setCargando(false)}
                onError={() => {
                  setCargando(false)
                  console.error("Error al cargar el PDF:", examen.url)
                }}
                title={examen.titulo}
              />
            ) : (
              // Fallback a imagen estática si no hay URL
              <Image
                src="/images/pdf-medical-report.svg"
                alt={examen.titulo}
                width={1000}
                height={1400}
                className="w-full h-full object-contain"
                style={{
                  transform: `scale(${escala}) rotate(${rotacion}deg)`,
                  transition: "transform 0.3s ease",
                }}
                onLoad={() => setCargando(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-white p-4">
        <p className="text-sm">{examen.descripcion}</p>
        <p className="text-sm text-gray-500 mt-1">
          Dr. {examen.medico} - {examen.especialidad} |
          {new Date(examen.fecha).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {examen.esBlobStorage && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <Cloud className="h-3 w-3" />
            Archivo directo del blob storage
          </p>
        )}
        {esArchivoAzure && !examen.esBlobStorage && (
          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <Cloud className="h-3 w-3" />
            Archivo almacenado en Azure Blob Storage
          </p>
        )}
      </div>
    </div>
  )
}
