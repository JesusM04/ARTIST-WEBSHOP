'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { chatService } from './services/chat';

interface AuthUser extends User {
  role?: 'client' | 'artist' | 'admin';
  theme?: 'light' | 'dark' | 'system';
  displayName: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticating: boolean;
  isSigningOut: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: {[key: string]: any}) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticating: false,
  isSigningOut: false,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  // Función para aplicar el tema
  const applyTheme = (theme: string = 'system') => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    document.documentElement.setAttribute('data-theme', theme);
  };

  const createUserDocument = async (firebaseUser: User, additionalData: { name?: string } = {}) => {
    if (!firebaseUser) return null;

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        const userData = {
          email: firebaseUser.email,
          name: additionalData.name || firebaseUser.email?.split('@')[0] || 'Usuario',
          role: 'client',
          createdAt: serverTimestamp(),
          photoURL: firebaseUser.photoURL,
          ...additionalData
        };

        await setDoc(userRef, userData);
      }
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Actualizar estado en línea
        await chatService.updateUserStatus(firebaseUser.uid, true);
        
        // Obtener datos adicionales del usuario
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        
        // Aplicar el tema del usuario
        if (userData?.theme) {
          applyTheme(userData.theme);
        }
        
        setUser({ ...firebaseUser, ...userData } as AuthUser);
      } else {
        setUser(null);
        // Aplicar tema por defecto al cerrar sesión
        applyTheme('system');
      }
      setLoading(false);
    });

    // Actualizar estado cuando el usuario cierra la ventana/pestaña
    const handleBeforeUnload = async () => {
      if (auth.currentUser) {
        await chatService.updateUserStatus(auth.currentUser.uid, false);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    setIsAuthenticating(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name,
        role: 'client',
        createdAt: serverTimestamp()
      });
      
      toast.success('¡Cuenta creada exitosamente!');
    } catch (error: any) {
      setIsAuthenticating(false);
      console.error('Error signing up:', error);
      toast.error(error.message || 'Error al crear la cuenta');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        toast.success('¡Bienvenido de nuevo!');
        if (userData.role === 'client') {
          router.push('/sections/client');
        } else if (userData.role === 'artist') {
          router.push('/sections/artist');
        }
      }
    } catch (error: any) {
      setIsAuthenticating(false);
      console.error('Error in sign in:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
      
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      toast.success('¡Bienvenido!');
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.role === 'client') {
          router.push('/sections/client');
        } else if (userData.role === 'artist') {
          router.push('/sections/artist');
        }
      } else {
        router.push('/sections/client');
      }
    } catch (error: any) {
      setIsAuthenticating(false);
      console.error('Error in Google sign in:', error);
      toast.error(error.message || 'Error al iniciar sesión con Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsSigningOut(true);
      if (auth.currentUser) {
        await chatService.updateUserStatus(auth.currentUser.uid, false);
      }
      await signOut(auth);
      toast.success('¡Hasta pronto!');
      router.push('/');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setIsSigningOut(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error in reset password:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: {[key: string]: any}): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      // Actualizar perfil en Firebase Auth
      if (data.name || data.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: data.name || auth.currentUser.displayName,
          photoURL: data.photoURL || auth.currentUser.photoURL
        });
      }

      // Actualizar documento en Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        ...data,
        fechaActualizacion: serverTimestamp()
      });

      // Si se está actualizando el tema, aplicarlo inmediatamente
      if (data.theme) {
        applyTheme(data.theme);
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticating,
      isSigningOut,
      signUp,
      signIn,
      signInWithGoogle,
      logout,
      resetPassword,
      updateUserProfile,
    }}>
      <LoadingScreen isOpen={isSigningOut} text="Cerrando sesión..." />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 