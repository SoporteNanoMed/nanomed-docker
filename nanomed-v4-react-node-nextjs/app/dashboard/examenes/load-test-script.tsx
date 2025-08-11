"use client"

import { useEffect } from "react"

export default function LoadTestScript() {
  useEffect(() => {
    // Solo cargar en desarrollo
    if (process.env.NODE_ENV === 'development') {
      // Cargar script de prueba general
      const script1 = document.createElement('script')
      script1.src = '/scripts/test-exams-blob.js'
      script1.async = true
      document.head.appendChild(script1)
      
      // Cargar script de prueba de PDF
      const script2 = document.createElement('script')
      script2.src = '/scripts/test-pdf-viewer.js'
      script2.async = true
      document.head.appendChild(script2)
      
      return () => {
        if (document.head.contains(script1)) {
          document.head.removeChild(script1)
        }
        if (document.head.contains(script2)) {
          document.head.removeChild(script2)
        }
      }
    }
  }, [])

  return null
} 