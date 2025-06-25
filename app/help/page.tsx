"use client"

import { useAuth } from "@/lib/AuthContext"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, HelpCircle, Users, Palette } from "lucide-react"

export default function HelpPage() {
  const { user } = useAuth()

  return (
    <ProfileLayout role={user?.role || "guest"}>
      <div className="container py-10 space-y-8">
        <div className="text-center space-y-2">
          <HelpCircle className="h-10 w-10 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-800">Centro de Ayuda</h1>
          <p className="text-gray-600">Encuentra respuestas a preguntas frecuentes y obtén soporte personalizado.</p>
        </div>

        {/* Preguntas frecuentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente FAQ */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
              <Users className="w-5 h-5" /> Para Clientes
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="c1">
                <AccordionTrigger>¿Cómo solicito un pedido?</AccordionTrigger>
                <AccordionContent>
                  Puedes explorar artistas en la plataforma, elegir uno y hacer clic en "Solicitar Pedido". Luego completa los detalles requeridos.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="c2">
                <AccordionTrigger>¿Cómo realizo un pago?</AccordionTrigger>
                <AccordionContent>
                  Los pagos se realizan a través de nuestra plataforma segura una vez que el artista acepta el pedido.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="c3">
                <AccordionTrigger>¿Puedo cancelar un pedido?</AccordionTrigger>
                <AccordionContent>
                  Puedes cancelar pedidos que aún no han sido aceptados. Si ya está en progreso, contáctanos para ayudarte.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Artista FAQ */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
              <Palette className="w-5 h-5" /> Para Artistas
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="a1">
                <AccordionTrigger>¿Cómo recibo nuevos pedidos?</AccordionTrigger>
                <AccordionContent>
                  Los clientes pueden encontrarte a través de tu perfil y enviarte pedidos directamente.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="a2">
                <AccordionTrigger>¿Cuándo recibo mis pagos?</AccordionTrigger>
                <AccordionContent>
                  Una vez que completes un pedido y el cliente lo apruebe, el pago se libera en un plazo de 24 a 48 horas.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="a3">
                <AccordionTrigger>¿Qué pasa si el cliente no responde?</AccordionTrigger>
                <AccordionContent>
                  Si no hay respuesta tras varios días, puedes marcar el pedido como inactivo o contactar con soporte para asistencia.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Contacto */}
        <div className="border-t pt-8 mt-8 text-center space-y-4">
          <Mail className="w-6 h-6 mx-auto text-blue-500" />
          <p className="text-gray-700">¿No encontraste lo que buscabas?</p>
          <p className="text-gray-600">
            Escríbenos a <a href="mailto:soporte@gmail.com" className="text-blue-600 underline">soporte@transacly.com</a> y con gusto te ayudaremos.
          </p>
        </div>
      </div>
    </ProfileLayout>
  )
}
