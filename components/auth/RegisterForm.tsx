"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordRequirements } from '@/components/ui/password-requirements';
import { Loader2, User, Mail, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { RoleSelector } from '@/components/ui/role-selector';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (errorMessage) setErrorMessage("");
  }, [email, password, confirmPassword, name]);

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Ingresa una contraseña";
    if (passwordStrength <= 25) return "Débil";
    if (passwordStrength <= 50) return "Moderada";
    if (passwordStrength <= 75) return "Buena";
    return "Fuerte";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const createUserDocument = async (userId: string, userEmail: string, userName: string, userPhotoURL: string | null) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: userId,
        email: userEmail,
        name: userName,
        role: 'client',
        createdAt: new Date().toISOString(),
        photoURL: userPhotoURL,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Por favor completa todos los campos");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      setIsSubmitting(false);
      return;
    }

    if (passwordStrength < 50) {
      setErrorMessage("La contraseña es demasiado débil. Debe tener al menos 8 caracteres, incluir números, letras mayúsculas y minúsculas.");
      setIsSubmitting(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await createUserDocument(result.user.uid, email, name, null);

      toast({
        title: "¡Cuenta creada con éxito!",
        description: "Bienvenido a nuestra plataforma.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      handleAuthError(error.code);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      
      await createUserDocument(
        result.user.uid, 
        result.user.email!, 
        result.user.displayName || result.user.email!.split('@')[0], 
        result.user.photoURL
      );

      toast({
        title: "¡Cuenta creada con éxito!",
        description: "Te has registrado correctamente con Google.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error al registrarse con Google:', error);
      handleAuthError(error.code);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        setErrorMessage("Este correo electrónico ya está en uso. Por favor intenta con otro o inicia sesión.");
        break;
      case 'auth/invalid-email':
        setErrorMessage("El correo electrónico no es válido.");
        break;
      case 'auth/weak-password':
        setErrorMessage("La contraseña es demasiado débil. Debe tener al menos 6 caracteres.");
        break;
      case 'auth/popup-closed-by-user':
        setErrorMessage("Has cerrado la ventana de registro con Google.");
        break;
      default:
        setErrorMessage("Ha ocurrido un error durante el registro. Por favor intenta de nuevo.");
    }
  };

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
            <Label htmlFor="name" className="text-sm font-medium text-blue-900">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-blue-500" />
              <Input
                id="name"
                placeholder="Tu nombre"
                required
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-blue-50 border-blue-200 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
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
            <Label htmlFor="password" className="text-sm font-medium text-blue-900">Contraseña</Label>
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
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Seguridad:</span>
                <span className={`
                  font-medium
                  ${passwordStrength === 0 ? 'text-gray-400' : ''}
                  ${passwordStrength <= 25 ? 'text-red-500' : ''}
                  ${passwordStrength <= 50 && passwordStrength > 25 ? 'text-orange-500' : ''}
                  ${passwordStrength <= 75 && passwordStrength > 50 ? 'text-yellow-500' : ''}
                  ${passwordStrength > 75 ? 'text-green-500' : ''}
                `}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <Progress value={passwordStrength} className={`h-1 ${getPasswordStrengthColor()}`} />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-blue-900">Confirmar contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-blue-500" />
              <PasswordInput
                id="confirmPassword"
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-blue-50 border-blue-200 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
            {password && confirmPassword && (
              <div className="flex items-center mt-1 text-xs">
                {password === confirmPassword ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">Las contraseñas coinciden</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-600">Las contraseñas no coinciden</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <Button 
            disabled={isLoading} 
            type="submit"
            className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creando cuenta...</span>
              </>
            ) : (
              <>
                <span>Crear cuenta</span>
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
  );
} 