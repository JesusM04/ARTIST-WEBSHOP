"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean
  onStrengthChange?: (strength: number) => void
}

export function PasswordInput({
  className,
  showStrengthIndicator = false,
  onStrengthChange,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [strength, setStrength] = React.useState(0)

  const calculateStrength = (value: string) => {
    let score = 0
    
    // Longitud mínima (14 caracteres)
    if (value.length >= 14) score += 25

    // Mayúsculas
    if (/[A-Z]/.test(value)) score += 15

    // Minúsculas
    if (/[a-z]/.test(value)) score += 15

    // Números
    if (/[0-9]/.test(value)) score += 15

    // Caracteres especiales
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) score += 15

    // Penalizaciones
    // Repeticiones de caracteres
    if (/(.)\1{2,}/.test(value)) score -= 10

    // Secuencias comunes
    const commonSequences = ['qwerty', 'asdfg', '123', '789']
    if (commonSequences.some(seq => value.toLowerCase().includes(seq))) score -= 10

    // Asegurar que el score esté entre 0 y 100
    score = Math.max(0, Math.min(100, score))
    
    setStrength(score)
    onStrengthChange?.(score)

    return score
  }

  const getStrengthColor = () => {
    if (strength >= 80) return 'bg-green-500'
    if (strength >= 60) return 'bg-yellow-500'
    if (strength >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getStrengthText = () => {
    if (strength >= 80) return 'Fuerte'
    if (strength >= 60) return 'Buena'
    if (strength >= 40) return 'Regular'
    return 'Débil'
  }

  React.useEffect(() => {
    if (props.value && typeof props.value === 'string') {
      calculateStrength(props.value)
    }
  }, [props.value])

  return (
    <div className="relative">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10",
            className
          )}
          onChange={(e) => {
            props.onChange?.(e)
            if (showStrengthIndicator) {
              calculateStrength(e.target.value)
            }
          }}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>
      
      {showStrengthIndicator && (
        <div className="mt-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Fortaleza:</span>
            <span className="text-sm text-gray-500">{getStrengthText()}</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-150", getStrengthColor())}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
} 