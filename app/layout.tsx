import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { Toaster } from 'sonner'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { motion } from 'framer-motion'

// Carga dinámica de componentes para reducir el bundle inicial
const ThemeProvider = dynamic(() => import('@/components/theme-provider').then(mod => mod.ThemeProvider), { 
  ssr: false // No renderizar en el servidor para evitar diferencias de hidratación
})

const LoadingScreen = dynamic(() => import('@/components/ui/loading-screen').then(mod => mod.LoadingScreen), {
  ssr: false
})

// Optimización de fuentes
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Mejora el rendimiento de fuentes
  preload: true,
  fallback: ['system-ui', 'sans-serif']
})

export const metadata: Metadata = {
  title: 'Springtide Colors',
  description: 'Pagina web de Springtide Colors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
              <LoadingScreen isOpen={false} />
              {children}
            </Suspense>
            <Toaster richColors position="top-right" closeButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
