"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"
import { VisorExamen } from "./visor-examen"

export interface Examen {
  id: string
  titulo: string
  fecha: string
  tipo: "imagen" | "pdf" | "codigo"
  url: string
  descripcion: string
  medico: string
  especialidad: string
  thumbnail?: string
  esBlobStorage?: boolean
}

interface ExamenCardProps {
  examen: Examen
}

export function ExamenCard({ examen }: ExamenCardProps) {
  const [visorAbierto, setVisorAbierto] = useState(false)

  return (
    <>
      <Card className="overflow-hidden" data-exam-id={examen.id}>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">{examen.titulo}</h3>
          <div className="flex justify-between gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 flex-1 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white border-0 font-semibold transition-all duration-300 hover:shadow-md" 
              onClick={() => setVisorAbierto(true)}
            >
            <Eye className="h-4 w-4" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
              className="flex items-center gap-1 flex-1 border-2 border-[#479cd0]/50 text-[#479cd0] hover:bg-gradient-to-r hover:from-[#59c3ed]/10 hover:to-[#479cd0]/10 hover:border-[#479cd0] font-semibold transition-all duration-300"
            onClick={() => {
              if (examen.url && examen.url !== "/placeholder.svg?height=400&width=600") {
                window.open(examen.url, "_blank")
              } else {
                // Si no hay URL válida, mostrar mensaje
                alert("Este examen no tiene archivo adjunto disponible para descargar.")
              }
            }}
          >
            <Download className="h-4 w-4" />
            Descargar
          </Button>
          </div>
        </CardContent>
      </Card>

      {visorAbierto && <VisorExamen examen={examen} onClose={() => setVisorAbierto(false)} />}
    </>
  )
}
