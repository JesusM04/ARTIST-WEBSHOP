"use client"

import { memo } from "react"
import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  text?: string
  isOpen: boolean
}

// Usamos memo para evitar renderizados innecesarios
const LoadingScreen = memo(function LoadingScreen({ 
  text = "Cargando...", 
  isOpen 
}: LoadingScreenProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  )
})

// Esto asegura que el componente tenga un nombre para las herramientas de desarrollo
LoadingScreen.displayName = "LoadingScreen"

export { LoadingScreen } 