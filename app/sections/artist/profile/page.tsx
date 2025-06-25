"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/AuthContext"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Mail, MapPin, Award, Palette, Star } from "lucide-react"

interface UserData {
  name: string;
  email: string;
  role: string;
  photoURL?: string;
  createdAt: string;
  orders?: any[];
  location?: string;
  bio?: string;
  specialties?: string[];
  stats?: {
    ordersCompleted: number;
    averageRating: number;
    worksPosted: number;
  }
}

export default function ArtistProfile() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setUserData({
            ...userDoc.data() as UserData,
            // Datos de demostración si no existen en Firestore
            bio: userDoc.data().bio || "Artista visual especializado en técnicas mixtas y pintura acrílica. Participante en exposiciones locales e internacionales con más de 5 años de experiencia.",
            specialties: userDoc.data().specialties || ["Pintura acrílica", "Acuarela", "Arte digital", "Ilustración"],
            location: userDoc.data().location || "Caracas, Venezuela",
            stats: {
              ordersCompleted: 24,
              averageRating: 4.8,
              worksPosted: 37
            }
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (loading) {
    return (
      <ProfileLayout role="artist">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProfileLayout>
    )
  }

  if (!userData) {
    return (
      <ProfileLayout role="artist">
        <div className="text-center">
          <p className="text-gray-500">No se pudo cargar la información del usuario</p>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout role="artist">
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <CardContent className="relative p-6">
            <div className="flex flex-col items-center space-y-6 -mt-20">
              {/* Avatar y Nombre */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={userData.photoURL || ''} alt={userData.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl">
                    {userData.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
                  <span className="inline-block mt-1 text-blue-600 font-medium">Artista</span>
                </div>
              </div>

              {/* Biografía */}
              <div className="max-w-lg text-center text-gray-600">
                <p className="italic">{userData.bio}</p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Palette className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-700">{userData.stats?.worksPosted || 0}</p>
                  <p className="text-sm text-blue-600">Obras Publicadas</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-700">{userData.stats?.ordersCompleted || 0}</p>
                  <p className="text-sm text-blue-600">Pedidos Completados</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-700">{userData.stats?.averageRating || 0}/5.0</p>
                  <p className="text-sm text-blue-600">Calificación Media</p>
                </div>
              </div>

              {/* Especialidades */}
              <div className="w-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">Especialidades</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {userData.specialties?.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center space-x-3 text-gray-600 justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>{userData.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 justify-center">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  <span>Miembro desde {new Date(userData.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  )
}
