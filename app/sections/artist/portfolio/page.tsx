"use client"

import { useEffect, useState } from "react"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { useAuth } from "@/lib/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Award, Building, Calendar, GraduationCap, Sparkles } from "lucide-react"
import Image from "next/image"

interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description: string;
}

interface Exhibition {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  image?: string;
}

interface Award {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
}

export default function PortfolioPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Datos de demostración
  const [experiences] = useState<Experience[]>([
    {
      id: "1",
      title: "Artista Principal",
      company: "Galería Contemporánea",
      period: "2020 - Presente",
      description: "Exposición permanente de obras acrílicas y colaboración con artistas invitados. Participación en festivales de arte contemporáneo y talleres educativos."
    },
    {
      id: "2",
      title: "Diseñador de Vestuario",
      company: "Teatro Municipal",
      period: "2018 - 2020",
      description: "Creación de vestuario para producciones teatrales, incluyendo la adaptación de 'Sueño de una noche de verano' y 'Romeo y Julieta'."
    },
    {
      id: "3",
      title: "Ilustrador Freelance",
      company: "Independiente",
      period: "2016 - 2018",
      description: "Desarrollo de ilustraciones para clientes en industrias editorial, publicitaria y digital. Especialización en acuarela y técnicas mixtas."
    }
  ]);
  
  const [education] = useState<Education[]>([
    {
      id: "1",
      degree: "Máster en Bellas Artes",
      institution: "Universidad Nacional de Arte",
      year: "2016",
      description: "Especialización en técnicas mixtas y arte contemporáneo. Tesis sobre la influencia del arte latinoamericano en las tendencias globales."
    },
    {
      id: "2",
      degree: "Licenciatura en Diseño Gráfico",
      institution: "Instituto Superior de Diseño",
      year: "2014",
      description: "Enfoque en ilustración, teoría del color y composición. Proyecto final sobre identidad visual para espacios culturales."
    }
  ]);
  
  const [exhibitions] = useState<Exhibition[]>([
    {
      id: "1",
      title: "Colores del Alma",
      location: "Museo de Arte Contemporáneo",
      date: "Mayo 2022",
      description: "Exposición individual con 15 obras que exploran la conexión entre color y emociones.",
      image: "/images/exhibitions/colores.jpg"
    },
    {
      id: "2",
      title: "Nuevas Perspectivas",
      location: "Galería Moderna",
      date: "Octubre 2021",
      description: "Participación en muestra colectiva con artistas emergentes de la región.",
      image: "/images/exhibitions/perspectivas.jpg"
    },
    {
      id: "3",
      title: "Festival Internacional de Arte",
      location: "Centro Cultural",
      date: "Julio 2020",
      description: "Seleccionado entre 200 artistas para exhibir en el pabellón principal.",
      image: "/images/exhibitions/festival.jpg"
    }
  ]);
  
  const [awards] = useState<Award[]>([
    {
      id: "1",
      title: "Premio Innovación Artística",
      organization: "Fundación para las Artes",
      year: "2022",
      description: "Reconocimiento por técnicas innovadoras en arte mixto."
    },
    {
      id: "2",
      title: "Mención Honorífica",
      organization: "Bienal de Arte Joven",
      year: "2021",
      description: "Por la obra 'Memorias Fragmentadas' en técnica mixta."
    },
    {
      id: "3",
      title: "Artista Revelación",
      organization: "Asociación de Galerías",
      year: "2019",
      description: "Seleccionado como uno de los 10 artistas emergentes del año."
    }
  ]);
  
  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <ProfileLayout role="artist">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout role="artist">
      <div className="space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Mi Portfolio</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Trayectoria profesional, educación y reconocimientos a lo largo de mi carrera artística
          </p>
        </header>
        
        <Tabs defaultValue="experience" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="experience" className="flex gap-2 items-center justify-center">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Experiencia</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex gap-2 items-center justify-center">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Educación</span>
            </TabsTrigger>
            <TabsTrigger value="exhibitions" className="flex gap-2 items-center justify-center">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Exposiciones</span>
            </TabsTrigger>
            <TabsTrigger value="awards" className="flex gap-2 items-center justify-center">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Premios</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Experiencia */}
          <TabsContent value="experience" className="pt-4">
            <div className="space-y-4">
              {experiences.map((exp) => (
                <Card key={exp.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between flex-wrap">
                      <div>
                        <CardTitle className="text-xl text-blue-700">{exp.title}</CardTitle>
                        <CardDescription className="text-gray-600 font-medium">{exp.company}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {exp.period}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{exp.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Educación */}
          <TabsContent value="education" className="pt-4">
            <div className="space-y-4">
              {education.map((edu) => (
                <Card key={edu.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between flex-wrap">
                      <div>
                        <CardTitle className="text-xl text-blue-700">{edu.degree}</CardTitle>
                        <CardDescription className="text-gray-600 font-medium">{edu.institution}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {edu.year}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{edu.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Exposiciones */}
          <TabsContent value="exhibitions" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exhibitions.map((exhibition) => (
                <Card key={exhibition.id} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 relative">
                    {exhibition.image ? (
                      <div className="relative h-full w-full">
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                          <span className="text-gray-500">Imagen no disponible</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-blue-50">
                        <Sparkles className="h-12 w-12 text-blue-300" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between flex-wrap">
                      <div>
                        <CardTitle className="text-lg text-blue-700">{exhibition.title}</CardTitle>
                        <CardDescription className="text-gray-600 font-medium">{exhibition.location}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                        {exhibition.date}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{exhibition.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Premios */}
          <TabsContent value="awards" className="pt-4">
            <div className="space-y-4">
              {awards.map((award) => (
                <Card key={award.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between flex-wrap">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-yellow-500 mt-1" />
                        <div>
                          <CardTitle className="text-xl text-blue-700">{award.title}</CardTitle>
                          <CardDescription className="text-gray-600 font-medium">{award.organization}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                        {award.year}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{award.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProfileLayout>
  )
}
