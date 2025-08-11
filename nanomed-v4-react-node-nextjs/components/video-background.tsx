"use client"

import { useState } from "react"

interface VideoBackgroundProps {
  videoSrc: string
}

export function VideoBackground({ videoSrc }: VideoBackgroundProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // URL de respaldo en caso de que el video local no cargue
  const fallbackVideoUrl = "https://res.cloudinary.com/diuym5ii0/video/upload/v1745962222/video01-transcode_t1z328.mp4"

  // Usar la URL de respaldo si hay un error con el video local
  const effectiveVideoSrc = videoError ? fallbackVideoUrl : videoSrc

  return (
    <video
      className={`absolute w-full h-full object-cover transition-opacity duration-500 ${isVideoLoaded ? "opacity-100" : "opacity-0"}`}
      autoPlay
      muted
      loop
      playsInline
      onLoadedData={() => setIsVideoLoaded(true)}
      onError={() => {
        console.log("Error cargando el video local, usando respaldo")
        setVideoError(true)
      }}
    >
      <source src={effectiveVideoSrc} type="video/mp4" />
    </video>
  )
}
