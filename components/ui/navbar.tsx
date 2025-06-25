"use client"

import Link from "next/link"
import { useState, memo, lazy, Suspense, useEffect } from "react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Menu, X, Paintbrush } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Carga lazy de componentes de autenticación
const LoginForm = lazy(() => import("@/components/auth/LoginForm").then(mod => ({ default: mod.LoginForm })))
const RegisterForm = lazy(() => import("@/components/auth/RegisterForm").then(mod => ({ default: mod.RegisterForm })))

const AuthFormFallback = () => (
  <div className="flex items-center justify-center p-8 min-h-[300px]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-pulse h-10 w-10 rounded-full bg-blue-200"></div>
      <p className="text-gray-500 animate-pulse">Cargando formulario...</p>
    </div>
  </div>
)

// Enlaces de navegación memorizados para evitar recálculos
const navLinks = [
  { href: "/home/about", label: "Nosotros" },
  { href: "/home/contact", label: "Contacto" },
  { href: "/home/faq", label: "FAQ" },
]

// Enlaces de roles memorizados
const roleLinks = [
  { href: "/sections/client", label: "Cliente", description: "Gestión de compras y pedidos" },
  { href: "/sections/artist", label: "Artista", description: "Administra tus obras y ventas" },
  { href: "/directivos", label: "Directivos", description: "Panel de control y métricas" },
  { href: "/admin", label: "Administración", description: "Configuración del sistema" },
]

// Tipos para las props de los componentes
interface NavLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
}

interface RoleMenuItemProps {
  href: string;
  label: string;
  description: string;
  onClick?: () => void;
}

// Usando memo para evitar re-renderizados innecesarios
const NavLink = memo((props: NavLinkProps) => {
  const { href, label, onClick = () => {} } = props;
  return (
    <Link
      href={href}
      className="relative text-sm font-medium text-zinc-800 hover:text-indigo-600 transition-colors duration-300 group px-3 py-1"
      onClick={onClick}
    >
      {label}
      <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-indigo-600 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
});

NavLink.displayName = "NavLink";

// Componente para RoleMenuItem con más detalles
const RoleMenuItem = memo((props: RoleMenuItemProps) => {
  const { href, label, description, onClick } = props;
  return (
    <DropdownMenuItem asChild className="p-0 focus:bg-indigo-50">
      <Link 
        href={href} 
        className="w-full p-3 flex flex-col hover:bg-indigo-50 transition-colors rounded-md"
        onClick={onClick}
      >
        <span className="font-medium text-indigo-800">{label}</span>
        <span className="text-xs text-zinc-500 mt-1">{description}</span>
      </Link>
    </DropdownMenuItem>
  );
});

RoleMenuItem.displayName = "RoleMenuItem";

// Componente de navbar
export function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detectar scroll para cambiar estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const navbarClass = `
    fixed w-full top-0 z-50 
    ${isScrolled 
      ? 'bg-white/90 backdrop-blur-md shadow-sm py-2 transition-all duration-300 border-b border-zinc-100' 
      : 'bg-white py-3 transition-all duration-300'}
  `;

  return (
    <>
      <nav className={navbarClass}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Logo + Ícono */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-sm font-bold transition duration-300 transform hover:text-indigo-700"
            >
              <Paintbrush className="h-5 w-5 text-indigo-700" strokeWidth={2.5} />
              <span className="text-base font-semibold tracking-tight text-indigo-700">Springtide Colors</span>
            </Link>

            {/* Menú principal en pantallas grandes - centrado */}
            <div className="hidden lg:flex items-center justify-center space-x-6">
              {navLinks.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>

            {/* Menú derecho: Dropdown Acceso + Botones Auth */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Botones de autenticación */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => setLoginOpen(true)}
                  variant="ghost"
                  className="text-zinc-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors text-sm font-medium"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  size="sm"
                  onClick={() => setRegisterOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 to-violet-500 text-white hover:from-indigo-700 hover:to-violet-600 shadow-sm hover:shadow transition-all text-sm font-medium rounded-full px-4"
                >
                  Registrarse
                </Button>
              </div>
            </div>

            {/* Menú hamburguesa - alineado a la derecha */}
            <button
              className="lg:hidden text-zinc-700 p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Menú móvil optimizado con animación */}
          {menuOpen && (
            <div className="lg:hidden mt-2 pb-3 flex flex-col space-y-3 animate-in slide-in-from-top duration-300">
              <div className="flex flex-col space-y-1.5 p-3 bg-zinc-50 rounded-xl">
                {navLinks.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} onClick={closeMenu} />
                ))}
              </div>

              <div className="flex flex-col space-y-2 p-2">
                <Button
                  onClick={() => {
                    setLoginOpen(true);
                    closeMenu();
                  }}
                  className="w-full bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-colors"
                  variant="outline"
                  size="sm"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  onClick={() => {
                    setRegisterOpen(true);
                    closeMenu();
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white hover:from-indigo-700 hover:to-violet-600 shadow-sm"
                  size="sm"
                >
                  Registrarse
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Espaciado para el contenido debajo del navbar */}
      <div className="h-16"></div>

      {/* Diálogos de autenticación con Suspense */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="bg-white sm:max-w-md rounded-2xl p-0 border-0 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-indigo-600 to-violet-500 p-5 rounded-t-2xl">
            <DialogTitle className="text-lg text-white font-medium">Iniciar Sesión</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <Suspense fallback={<AuthFormFallback />}>
              <LoginForm onSuccess={() => setLoginOpen(false)} />
            </Suspense>
            <div className="mt-6 text-center border-t border-zinc-100 pt-4">
              <button
                onClick={() => {
                  setLoginOpen(false);
                  setRegisterOpen(true);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors hover:underline"
              >
                ¿No tienes cuenta? Regístrate aquí
              </button>
            </div>
          </div>
          <DialogFooter className="bg-zinc-50 p-4 rounded-b-2xl flex justify-center">
            <p className="text-xs text-zinc-500">Tus datos están seguros con nosotros</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-white sm:max-w-md rounded-2xl p-0 border-0 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-indigo-600 to-violet-500 p-5 rounded-t-2xl">
            <DialogTitle className="text-lg text-white font-medium">Registrarse</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <Suspense fallback={<AuthFormFallback />}>
              <RegisterForm onSuccess={() => setRegisterOpen(false)} />
            </Suspense>
            <div className="mt-6 text-center border-t border-zinc-100 pt-4">
              <button
                onClick={() => {
                  setRegisterOpen(false);
                  setLoginOpen(true);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors hover:underline"
              >
                ¿Ya tienes cuenta? Inicia sesión aquí
              </button>
            </div>
          </div>
          <DialogFooter className="bg-zinc-50 p-4 rounded-b-2xl flex justify-center">
            <p className="text-xs text-zinc-500">Al registrarte aceptas nuestros términos y condiciones</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
