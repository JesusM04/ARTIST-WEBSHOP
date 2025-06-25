"use client"

import { useState, useMemo, lazy, Suspense } from "react"
import Link from "next/link"
import dynamic from 'next/dynamic'

// Importación dinámica de componentes pesados
const Navbar = dynamic(() => import("@/components/ui/navbar").then(mod => mod.Navbar), {
  loading: () => <div className="h-16 bg-white border-b"></div>
})

const Footer = dynamic(() => import("@/components/ui/footer").then(mod => mod.Footer), {
  ssr: false
})

// Componentes UI que no son críticos para la carga inicial
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Carga diferida de los formularios de autenticación
const LoginForm = lazy(() => import("@/components/auth/LoginForm").then(mod => ({ default: mod.LoginForm })))
const RegisterForm = lazy(() => import("@/components/auth/RegisterForm").then(mod => ({ default: mod.RegisterForm })))
const ResetPasswordForm = lazy(() => import("@/components/auth/ResetPasswordForm").then(mod => ({ default: mod.ResetPasswordForm })))

// Optimización de importación de iconos
import { 
  Palette, 
  UserSquare2, 
  Mountain, 
  Laptop, 
  Users, 
  Clock,
  Brush,
  Sparkles,
  Frame,
  PaintBucket,
  LucideIcon
} from "lucide-react"

interface CollectionItem {
  icon: LucideIcon; // Specify LucideIcon here if that's what it always is
  title: string;
  desc: string;
  // href?: string; // Make 'href' optional here with '?'
}

const AuthFormFallback = () => (
  <div className="flex items-center justify-center p-6 min-h-[200px]">
    <div className="animate-pulse h-8 w-8 rounded-full bg-blue-200"></div>
  </div>
)

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  // Memoización de colecciones para evitar recreación en cada renderizado
const collections: CollectionItem[] = useMemo(() => [
  {
    icon: Palette,
    title: "Abstracto",
    desc: "Formas, colores y emociones en estado puro"
  },
  {
    icon: UserSquare2,
    title: "Retratos",
    desc: "Miradas que cuentan historias profundas"
  },
  {
    icon: Mountain,
    title: "Paisajes",
    desc: "Naturaleza convertida en poesía visual"
  },
  {
    icon: Laptop,
    title: "Arte Digital",
    desc: "Creatividad moderna y técnica sin límites"
  },
], [])



  // Memoización de estadísticas para evitar recreación en cada renderizado
  const stats = useMemo(() => [
    {
      icon: Frame,
      value: "+300",
      label: "Obras Vendidas"
    },
    {
      icon: Users,
      value: "+150",
      label: "Clientes Satisfechos"
    },
    {
      icon: Clock,
      value: "10",
      label: "Años de Experiencia"
    },
    {
      icon: PaintBucket,
      value: "+500",
      label: "Obras Creadas"
    }
  ], [])

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <Navbar />
      </header>

      {/* Hero Intro */}
      <section className="container mx-auto px-6 py-20 mt-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <Brush className="h-24 w-24 text-blue-700 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-800 to-blue-500 bg-clip-text text-transparent">
            Springtide Colors
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Bienvenido a un universo visual donde cada obra lleva un pedazo de alma.
            Desde trazos clásicos hasta composiciones digitales vanguardistas, aquí encontrarás creaciones que
            no solo decoran, sino que hablan, sienten y despiertan.
          </p>
          <div className="flex justify-center gap-4">
              <Link href="#colecciones" scroll={true}>
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white">
                  Explorar Galería
                </Button>
              </Link>
              <Link href="/home/about">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white">
                  Conoce más
                </Button>
              </Link>
          </div>
        </div>
      </section>

      {/* Colecciones */}
      <section id="colecciones" className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <Sparkles className="h-12 w-12 mx-auto text-blue-700" />
            <h2 className="text-4xl font-bold text-gray-800">Colecciones Destacadas</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explora nuestras colecciones cuidadosamente curadas para encontrar la obra perfecta para tu espacio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collections.map(({ icon: Icon, title, desc }, index) => (
                <div key={index} className="group relative overflow-hidden rounded-2xl border bg-white p-6 hover:border-blue-700 hover:shadow-lg transition-all">
                  <div className="mb-4">
                    <Icon className="h-12 w-12 text-blue-700 transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800">{title}</h3>
                  <p className="text-gray-600">{desc}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, value, label }, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border hover:border-blue-700 text-center space-y-2 transition-all hover:shadow-lg">
                <Icon className="h-10 w-10 mx-auto text-blue-700" />
                <h3 className="text-4xl font-bold text-blue-700">{value}</h3>
                <p className="text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modales */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Iniciar Sesión</DialogTitle>
          </DialogHeader>
          <Suspense fallback={<AuthFormFallback />}>
            <LoginForm
              onSuccess={() => setLoginOpen(false)}
            />
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Crear Cuenta</DialogTitle>
          </DialogHeader>
          <Suspense fallback={<AuthFormFallback />}>
            <RegisterForm onSuccess={() => setRegisterOpen(false)} />
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Recuperar Contraseña</DialogTitle>
          </DialogHeader>
          <Suspense fallback={<AuthFormFallback />}>
            <ResetPasswordForm
              onSuccess={() => setResetOpen(false)}
              onLoginClick={() => {
                setResetOpen(false)
                setLoginOpen(true)
              }}
            />
          </Suspense>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />
    </main>
  )
}
