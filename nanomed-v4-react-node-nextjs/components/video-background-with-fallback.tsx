"use client"

import { useState } from "react"
import Image from "next/image"

interface VideoBackgroundProps {
  videoSrc: string
  fallbackImageSrc?: string
  fallbackImageSrcSets?: Array<{ src: string; width: number }>
}

export function VideoBackground({
  videoSrc,
  fallbackImageSrc = "/images/hero-background.png",
  fallbackImageSrcSets,
}: VideoBackgroundProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  return (
    <>
      {!videoError ? (
        <video
          className={`absolute w-full h-full object-cover transition-opacity duration-500 ${isVideoLoaded ? "opacity-100" : "opacity-0"}`}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => {
            console.log("Error cargando el video, mostrando imagen de respaldo")
            setVideoError(true)
          }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0">
          <Image
            src={fallbackImageSrc || "/placeholder.svg"}
            alt="Background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            {...(fallbackImageSrcSets && {
              srcSet: fallbackImageSrcSets.map((set) => `${set.src} ${set.width}w`).join(", "),
            })}
          />
        </div>
      )}
    </>
  )
}
