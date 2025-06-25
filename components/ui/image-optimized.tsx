"use client"

import Image from "next/image"
import { useState, useEffect, memo } from "react"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  loading?: "eager" | "lazy"
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
}

/**
 * Componente de imagen optimizado que admite lazy loading, prioridad y placeholders.
 * Mejora significativamente la carga y el rendimiento del LCP (Largest Contentful Paint).
 */
const OptimizedImage = memo(({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false,
  className = "",
  objectFit = "cover",
  loading = "lazy",
  placeholder = "empty",
  blurDataURL,
  onLoad,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    // Si la imagen es prioritaria o tiene loading eager, la cargamos inmediatamente
    if (priority || loading === "eager") {
      setIsIntersecting(true)
      return
    }

    // Configuramos Intersection Observer para carga lazy
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" } // Empezar a cargar cuando está a 200px de la ventana visible
    )

    const element = document.querySelector(`[data-image-id="${src}"]`)
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [src, priority, loading])

  // Placeholder predeterminado para imágenes blur si no se proporciona
  const defaultBlurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

  // Manejamos el onLoad propio y el pasado por props
  const handleLoad = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  const imageClasses = `transition-opacity duration-500 ${
    isLoaded ? "opacity-100" : "opacity-0"
  } ${className}`

  // Renderizado condicional: solo renderizamos la imagen real cuando está en el viewport
  return (
    <div
      className="relative overflow-hidden"
      data-image-id={src}
      style={{ width: width || "100%", height: height || "auto" }}
    >
      {imageError ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-200 rounded">
          <span className="text-gray-400 text-sm">Error al cargar imagen</span>
        </div>
      ) : (
        <>
          {(isIntersecting || priority) && (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              className={imageClasses}
              style={{ objectFit }}
              loading={loading}
              placeholder={placeholder}
              blurDataURL={blurDataURL || defaultBlurDataURL}
              onLoad={handleLoad}
              onError={() => setImageError(true)}
            />
          )}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          )}
        </>
      )}
    </div>
  )
})

OptimizedImage.displayName = "OptimizedImage"

export { OptimizedImage } 