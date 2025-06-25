"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone } from "lucide-react"

export function Footer() {
  const handleMapClick = () => {
    window.open("https://maps.google.com/?q=10.4696,-66.8694", "_blank")
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sección de la empresa */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Springtide Colors</h3>
            <p className="text-sm">
              Tu socio confiable en servicios académicos y profesionales.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/home/about" className="hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/home/contact" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/home/faq" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>+58 (212) 555-0123</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <a href="mailto:info@carrasquero2.com" className="hover:text-white transition-colors">
                  contacto@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3 cursor-pointer hover:text-white transition-colors"
                  onClick={handleMapClick}>
                <MapPin className="h-5 w-5 text-gray-400" />
                <span>Caracas, Venezuela</span>
              </li>
            </ul>
          </div>

          {/* Horario */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Horario de Atención</h3>
            <ul className="space-y-2">
              <li>Lunes - Viernes</li>
              <li className="font-semibold text-white">8:00 AM - 6:00 PM</li>
              <li>Sábados</li>
              <li className="font-semibold text-white">9:00 AM - 2:00 PM</li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Phantom Troupe. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/terms" className="text-sm hover:text-white transition-colors">
                Términos de Servicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
