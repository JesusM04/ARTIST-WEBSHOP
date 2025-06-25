"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/AuthContext"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, DocumentReference } from "firebase/firestore"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarDays, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  Star, 
  Heart, 
  Clock,
  Loader2
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UserData {
  name: string;
  email: string;
  role: string;
  photoURL?: string;
  createdAt: string;
  location?: string;
}

interface ClientStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  favouriteArtists: number;
  totalSpent: number;
}

interface RecentOrder {
  id: string;
  title: string;
  createdAt: Date;
  status: string;
  price?: number;
  artistName?: string;
}

export default function ClientProfile() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [stats, setStats] = useState<ClientStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    favouriteArtists: 0,
    totalSpent: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        // Obtener datos del usuario
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData)
          
          // Obtener estadísticas de pedidos
          const ordersQuery = query(
            collection(db, "orders"),
            where("clientId", "==", user.uid)
          )
          
          const ordersSnapshot = await getDocs(ordersQuery)
          
          let totalOrders = 0
          let completedOrders = 0
          let pendingOrders = 0
          let totalSpent = 0
          
          ordersSnapshot.forEach(doc => {
            const order = doc.data()
            totalOrders++
            
            if (order.status === "completed") {
              completedOrders++
              if (order.price) totalSpent += order.price
            } else if (order.status === "pending" || order.status === "in_progress") {
              pendingOrders++
            }
          })
          
          // Obtener pedidos recientes
          const recentOrdersQuery = query(
            collection(db, "orders"),
            where("clientId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(5)
          )
          
          const recentOrdersSnapshot = await getDocs(recentOrdersQuery)
          const recentOrdersData: RecentOrder[] = []
          
          for (const orderDoc of recentOrdersSnapshot.docs) {
            const orderData = orderDoc.data()
            let artistName = undefined
            
            if (orderData.artistId) {
              const artistDocRef = doc(db, "users", orderData.artistId);
              const artistDoc = await getDoc(artistDocRef);
              if (artistDoc.exists()) {
                artistName = artistDoc.data().name
              }
            }
            
            recentOrdersData.push({
              id: orderDoc.id,
              title: orderData.title || "Pedido sin título",
              createdAt: orderData.createdAt.toDate(),
              status: orderData.status,
              price: orderData.price,
              artistName
            })
          }
          
          setRecentOrders(recentOrdersData)
          
          // Obtener favoritos
          const favoritesQuery = query(
            collection(db, "favorites"),
            where("userId", "==", user.uid)
          )
          
          const favoritesSnapshot = await getDocs(favoritesQuery)
          
          setStats({
            totalOrders,
            completedOrders,
            pendingOrders,
            favouriteArtists: favoritesSnapshot.size,
            totalSpent
          })
        }
      } catch (error) {
        console.error('Error obteniendo datos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (loading) {
    return (
      <ProfileLayout role="client">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Cargando perfil...</p>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  if (!userData) {
    return (
      <ProfileLayout role="client">
        <div className="text-center">
          <p className="text-muted-foreground">No se pudo cargar la información del usuario</p>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout role="client">
      <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
        <div className="space-y-6 p-4">
          <Card className="overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-blue-500 to-primary"></div>
            <CardContent className="relative p-6">
              <div className="flex flex-col items-center space-y-6 -mt-20">
                {/* Avatar y Nombre */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={userData.photoURL || ''} alt={userData.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl">
                      {userData.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h1 className="text-3xl font-bold">{userData.name}</h1>
                    <Badge className="mt-2" variant="outline">Cliente</Badge>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="w-full max-w-md space-y-3">
                  <div className="flex items-center space-x-3 text-muted-foreground justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-muted-foreground justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{userData.location || 'Ubicación no especificada'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-muted-foreground justify-center">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <span>Miembro desde {new Date(userData.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Total de Pedidos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalOrders}</div>
                <div className="text-sm text-muted-foreground">
                  {stats.pendingOrders} pedidos en progreso
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Pedidos Completados</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.completedOrders}</div>
                <div className="text-sm text-muted-foreground">
                  {((stats.completedOrders / stats.totalOrders) * 100 || 0).toFixed(0)}% de finalización
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Artistas Favoritos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.favouriteArtists}</div>
                <div className="text-sm text-muted-foreground">
                  Explora más artistas
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-xl">€</span>
                  <CardTitle className="text-base">Total Gastado</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(stats.totalSpent)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Inversión en arte
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pedidos Recientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Pedidos Recientes</CardTitle>
                </div>
              </div>
              <CardDescription>
                Últimos pedidos realizados a artistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="divide-y">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          {order.artistName && (
                            <>
                              <span>•</span>
                              <span>{order.artistName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {order.price && (
                          <span className="text-sm font-medium">
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(order.price)}
                          </span>
                        )}
                        <Badge variant={
                          order.status === "completed" ? "default" :
                          order.status === "in_progress" ? "secondary" :
                          order.status === "cancelled" ? "destructive" : 
                          "outline"
                        }>
                          {order.status === "completed" ? "Completado" :
                           order.status === "in_progress" ? "En progreso" :
                           order.status === "cancelled" ? "Cancelado" : 
                           "Pendiente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No has realizado ningún pedido aún
                </div>
              )}
            </CardContent>
            {recentOrders.length > 0 && (
              <CardFooter className="border-t pt-4 flex justify-end">
                <a href="/sections/client/orders" className="text-sm text-primary hover:underline">
                  Ver todos los pedidos →
                </a>
              </CardFooter>
            )}
          </Card>
        </div>
      </ScrollArea>
    </ProfileLayout>
  )
}
