"use client"

import { useState } from "react"

interface CloudinaryVideoBackgroundProps {
  cloudName: string
  publicId: string
  fallbackImageSrc?: string
}

export function CloudinaryVideoBackground({
  cloudName,
  publicId,
  fallbackImageSrc = "/images/hero-background.png",
}: CloudinaryVideoBackgroundProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // Construir la URL del video de Cloudinary
  const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.mp4`

  // URL de respaldo que sabemos que funciona
  const fallbackVideoUrl = "https://res.cloudinary.com/diuym5ii0/video/upload/v1745962222/video01-transcode_t1z328.mp4"

  return (
    <>
      {!videoError ? (
        <video
          className={`absolute w-full h-full object-cover transition-opacity duration-500 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => {
            setIsVideoLoaded(true)
          }}
          onError={(e) => {
            setVideoError(true)
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={fallbackVideoUrl} type="video/mp4" />
        </video>
      ) : (
        // Si falla el video, usar el video de respaldo directamente
        <video
          className="absolute w-full h-full object-cover opacity-100"
          autoPlay
          muted
          loop
          playsInline
          onError={() => {
            // Error silencioso - usar imagen de respaldo
          }}
        >
          <source src={fallbackVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* Imagen de respaldo si todo falla */}
      {videoError && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${fallbackImageSrc})`,
            opacity: isVideoLoaded ? 0 : 1,
          }}
        />
      )}
    </>
  )
}
