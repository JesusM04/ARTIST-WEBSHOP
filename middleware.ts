import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
  if (publicRoutes.includes(pathname)) {
    if (authCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Rutas protegidas que requieren autenticación
  if (!authCookie) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/perfil/:path*',
    '/pedidos/:path*',
    '/auth/:path*'
  ],
} 