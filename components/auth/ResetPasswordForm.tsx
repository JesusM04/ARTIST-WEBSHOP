"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordRequirements } from "@/components/ui/password-requirements"
import { Loader2, CheckCircle2, Mail } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ResetPasswordFormProps {
  onSuccess: () => void
  onLoginClick: () => void
}

type Step = "email" | "code" | "password" | "success"

export function ResetPasswordForm({ onSuccess, onLoginClick }: ResetPasswordFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!email) {
      setError("Por favor ingresa tu correo electrónico")
      setIsLoading(false)
      return
    }

    // Simular envío de código
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep("code")
    }, 2000)
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos")
      setIsLoading(false)
      return
    }

    // Simular verificación de código
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep("password")
    }, 2000)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (passwordStrength < 80) {
      setError("La contraseña no cumple con los requisitos mínimos de seguridad")
      setIsLoading(false)
      return
    }

    // Simular cambio de contraseña
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep("success")
      onSuccess()
    }, 2000)
  }

  const steps = {
    email: (
      <motion.form
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        onSubmit={handleEmailSubmit}
        className="space-y-6 w-full max-w-md mx-auto p-4"
      >
        <div className="text-center mb-6">
          <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Recuperar contraseña</h3>
          <p className="text-sm text-gray-500 mt-2">
            Ingresa tu correo electrónico para recibir un código de verificación
          </p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando código...
              </>
            ) : (
              "Enviar código"
            )}
          </Button>
        </div>
      </motion.form>
    ),
    code: (
      <motion.form
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        onSubmit={handleCodeSubmit}
        className="space-y-6 w-full max-w-md mx-auto p-4"
      >
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium">Verificar código</h3>
          <p className="text-sm text-gray-500 mt-2">
            Hemos enviado un código de verificación a {email}
          </p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Código de verificación</Label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              required
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar código"
            )}
          </Button>
        </div>
      </motion.form>
    ),
    password: (
      <motion.form
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        onSubmit={handlePasswordSubmit}
        className="space-y-6 w-full max-w-md mx-auto p-4"
      >
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium">Nueva contraseña</h3>
          <p className="text-sm text-gray-500 mt-2">
            Ingresa y confirma tu nueva contraseña
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              showStrengthIndicator
              onStrengthChange={setPasswordStrength}
            />
            <PasswordRequirements password={password} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar contraseña"
            )}
          </Button>
        </div>
      </motion.form>
    ),
    success: (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 w-full max-w-md mx-auto p-4"
      >
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
        <div>
          <h3 className="text-lg font-medium">¡Contraseña actualizada!</h3>
          <p className="text-sm text-gray-500 mt-2">
            Tu contraseña ha sido actualizada exitosamente
          </p>
        </div>
        <Button onClick={onLoginClick} className="w-full">
          Ir a inicio de sesión
        </Button>
      </motion.div>
    ),
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {steps[currentStep]}
      </AnimatePresence>
    </div>
  )
} 