"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function SimpleCarousel() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const clientLogos = [
    { src: "/images/clients/cap-mineria.png", alt: "CAP Minería", width: 150, height: 60 },
    { src: "/images/clients/caserones.png", alt: "Caserones", width: 200, height: 60 },
    { src: "/images/clients/antofagasta-minerals.png", alt: "Antofagasta Minerals", width: 200, height: 60 },
    { src: "/images/clients/colbun.png", alt: "Colbún", width: 180, height: 60 },
    { src: "/images/clients/derco.png", alt: "Derco", width: 150, height: 60 },
    { src: "/images/clients/cmp.png", alt: "CMP", width: 150, height: 60 },
    { src: "/images/clients/flsmidth.png", alt: "FLSmidth", width: 150, height: 60 },
    { src: "/images/clients/besalco.png", alt: "Besalco", width: 180, height: 60 },
    { src: "/images/clients/enex.png", alt: "Enex", width: 120, height: 60 },
    { src: "/images/clients/metso-outotec.png", alt: "Metso Outotec", width: 200, height: 60 },
    // Nuevos logos
    { src: "/images/clients/minera-san-geronimo.png", alt: "Minera San Gerónimo", width: 200, height: 60 },
    { src: "/images/clients/siemens-energy.png", alt: "Siemens Energy", width: 180, height: 60 },
    { src: "/images/clients/teck.png", alt: "Teck", width: 120, height: 60 },
    { src: "/images/clients/vitacura.png", alt: "Vitacura", width: 180, height: 60 },
    { src: "/images/clients/turbus.png", alt: "TurBus", width: 150, height: 60 },
  ]

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center py-6 animate-scroll">
        {clientLogos.map((logo, index) => (
          <div key={index} className="flex-shrink-0 mx-8">
            <Image
              src={logo.src || "/placeholder.svg"}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all"
            />
          </div>
        ))}
        {clientLogos.map((logo, index) => (
          <div key={`duplicate-${index}`} className="flex-shrink-0 mx-8">
            <Image
              src={logo.src || "/placeholder.svg"}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all"
            />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 40s linear infinite; /* Aumenté la duración para que sea más lento con más logos */
          width: max-content;
        }
      `}</style>
    </div>
  )
}
