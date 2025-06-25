import { Navbar } from "@/components/ui/navbar"
import Image from "next/image"

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      <div className="shadow-md">
        <Navbar />
      </div>

      <div className="container mx-auto px-4 py-16 mt-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#003876] mb-6">Sobre el Artista</h1>
          <div className="text-lg text-gray-700 max-w-3xl mx-auto text-justify leading-relaxed">
            Cada trazo cuenta una historia, cada color revela un sentimiento. Mi arte es el puente entre lo que vemos y lo que sentimos.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
          <div className="bg-[#f0f4f9] p-8 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold text-[#003876] mb-3">Misión</h3>
            <div className="text-gray-700 text-base leading-relaxed text-justify">
              Crear obras que despierten, conmuevan y acompañen. Que lleven lo íntimo hacia lo eterno.
            </div>
          </div>

          <div className="bg-[#f0f4f9] p-8 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold text-[#003876] mb-3">Visión</h3>
            <div className="text-gray-700 text-base leading-relaxed text-justify">
              Construir una identidad artística que trascienda formatos y fronteras. Que inspire, que se quede.
            </div>
          </div>

          <div className="bg-[#f0f4f9] p-8 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold text-[#003876] mb-3">Valores</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-base text-justify">
              <li>Verdad emocional</li>
              <li>Pasión por el detalle</li>
              <li>Autenticidad sin filtros</li>
              <li>Compromiso con lo hecho a mano</li>
              <li>Arte como acto de presencia</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <div className="italic text-gray-600 text-xl max-w-2xl mx-auto text-justify">
            "No creo para decorar espacios. Creo para habitar emociones."
          </div>
        </div>
      </div>
    </main>
  )
}
