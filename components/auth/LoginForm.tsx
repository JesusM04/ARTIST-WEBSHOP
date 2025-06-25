'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { ForgotPasswordDialog } from './ForgotPasswordDialog'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Reiniciar el mensaje de error cuando el usuario cambia sus credenciales
  useEffect(() => {
    if (errorMessage) setErrorMessage('')
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    
    if (!email || !password) {
      setErrorMessage("Por favor completa todos los campos")
      setIsSubmitting(false)
      return
    }

    setIsLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)

      const userRef = doc(db, 'users', result.user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          name: result.user.displayName || email.split('@')[0],
          role: 'client',
          createdAt: new Date().toISOString(),
          photoURL: result.user.photoURL,
        })
      }

      toast({
        title: "¡Bienvenido a Springtide Colors!",
        description: "Has iniciado sesión correctamente.",
      })

      const userData = userSnap.exists() ? userSnap.data() : { role: 'client' }
      if (userData.role === 'client') {
        router.push('/sections/client')
      } else if (userData.role === 'artist') {
        router.push('/sections/artist')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error en inicio de sesión:', error)
      setErrorMessage(getAuthErrorMessage(error.code))
    } finally {
      setIsLoading(false)
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setErrorMessage('')
    
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, provider)

      const userRef = doc(db, 'users', result.user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          name: result.user.displayName,
          role: 'client',
          createdAt: new Date().toISOString(),
          photoURL: result.user.photoURL,
        })
      }

      toast({
        title: "¡Bienvenido a Springtide Colors!",
        description: "Has iniciado sesión correctamente con Google.",
      })

      const userData = userSnap.exists() ? userSnap.data() : { role: 'client' }
      if (userData.role === 'client') {
        router.push('/sections/client')
      } else if (userData.role === 'artist') {
        router.push('/sections/artist')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error en inicio de sesión con Google:', error)
      setErrorMessage(getAuthErrorMessage(error.code))
    } finally {
      setIsLoading(false)
    }
  }

  const getAuthErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return "Credenciales inválidas. Por favor verifica tu email y contraseña."
      case 'auth/user-not-found':
        return "No existe una cuenta con este correo electrónico."
      case 'auth/wrong-password':
        return "Contraseña incorrecta."
      case 'auth/popup-closed-by-user':
        return "Has cerrado la ventana de inicio de sesión con Google."
      case 'auth/cancelled-popup-request':
        return "La operación fue cancelada porque se abrió otra ventana de inicio de sesión."
      case 'auth/popup-blocked':
        return "La ventana emergente fue bloqueada por el navegador. Por favor, permite ventanas emergentes para este sitio."
      default:
        return "Ocurrió un error al iniciar sesión. Por favor intenta de nuevo."
    }
  }

  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {errorMessage && (
            <motion.div 
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              {errorMessage}
            </motion.div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-blue-900">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-blue-500" />
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-blue-50 border-blue-200 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-blue-900">Contraseña</Label>
              <ForgotPasswordDialog className="text-xs text-blue-700 hover:text-blue-900 transition-colors hover:underline" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-blue-500" />
              <PasswordInput
                id="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-blue-50 border-blue-200 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <Button 
            disabled={isLoading} 
            type="submit"
            className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
          
          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500 font-medium">O continúa con</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 font-medium transition-all duration-200 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Conectando con Google...</span>
              </>
            ) : (
              <>
                <FcGoogle className="mr-2 h-5 w-5" />
                <span>Continuar con Google</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
