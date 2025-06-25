import { Navbar } from "@/components/ui/navbar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQ() {
  const faqs = [
    {
      question: "¿Realizas envíos a todo el país?",
      answer:
        "Sí, realizamos envíos a toda Venezuela a través de servicios de encomienda confiables. También puedes coordinar la entrega en persona en eventos o exposiciones.",
    },
    {
      question: "¿Puedo encargar una obra personalizada?",
      answer:
        "¡Claro que sí! Puedes solicitar encargos personalizados escribiendo a través del formulario de contacto o por redes sociales. Hablamos del concepto, tamaño y técnica antes de comenzar.",
    },
    {
      question: "¿Qué formas de pago aceptas?",
      answer:
        "Aceptamos pagos por transferencia bancaria, Zelle, Pago Móvil y otras opciones disponibles. Al momento de comprar, te daremos todos los detalles necesarios.",
    },
    {
      question: "¿Las obras vienen enmarcadas?",
      answer:
        "Algunas obras ya vienen enmarcadas y otras no, dependiendo del formato. Si deseas agregar un marco, puedes solicitarlo con un costo adicional.",
    },
    {
      question: "¿Qué tipo de materiales usas en tus obras?",
      answer:
        "Trabajo con materiales de alta calidad: acrílicos, acuarelas, tintas y papeles libres de ácido. Cada obra tiene su ficha técnica disponible en la descripción del producto.",
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="shadow-md">
        <Navbar />
      </div>

      <div className="container mx-auto px-4 py-16 mt-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-700 mb-8 text-center">
            Preguntas Frecuentes
          </h1>
          <p className="text-gray-600 text-center mb-12">
            Aquí encontrarás información útil sobre pedidos, envíos y encargos.
            Si tienes otra duda, no dudes en contactarme.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-blue-700 hover:text-blue-800 font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              ¿Tienes otra pregunta?
            </p>
            <a
              href="/home/contact"
              className="text-blue-700 hover:text-blue-800 font-semibold underline underline-offset-4"
            >
              Escríbeme aquí →
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
