import { Navbar } from "@/components/ui/navbar"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function Contact() {
  return (
    <main className="min-h-screen bg-white">
      <div className="shadow-md">
        <Navbar />
      </div>

      <div className="container mx-auto px-4 py-16 mt-8">
        <h1 className="text-4xl font-bold text-[#003876] mb-8">Contacto</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold text-[#003876] mb-6">Ponte en contacto</h2>
              <div className="space-y-5">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-[#003876] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#003876]">Ubicación del Estudio</h3>
                    <p className="text-gray-700">
                      Caracas, Venezuela<br />(*Atención solo con cita previa*)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-[#003876] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#003876]">WhatsApp / Teléfono</h3>
                    <p className="text-gray-700">
                      +58 412 123 4567
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-[#003876] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#003876]">Correo Electrónico</h3>
                    <p className="text-gray-700">
                      contacto@artistaejemplo.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-[#003876] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#003876]">Horario de Atención</h3>
                    <p className="text-gray-700">
                      Lunes a Viernes: 9:00 AM - 6:00 PM<br />
                      Sábados: 10:00 AM - 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-[#003876] mb-6">Envíame un Mensaje</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#003876] mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[#003876] placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#003876]"
                  placeholder="Ingresa tu nombre"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#003876] mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[#003876] placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#003876]"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#003876] mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[#003876] placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#003876]"
                  placeholder="Motivo del mensaje"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#003876] mb-2">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-[#003876] placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#003876]"
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#003876] text-white py-2 px-4 rounded-md hover:bg-[#002d5f] transition-colors"
              >
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
