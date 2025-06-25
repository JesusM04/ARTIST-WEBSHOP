"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import mockData from "@/lib/mock/users.json"
import { CalendarDays, Mail, MapPin, GraduationCap, Palette } from "lucide-react"

interface ArtistStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  totalEarnings: number;
  averageRating: number;
}

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ArtistStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    totalEarnings: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("artistId", "==", user.uid)
        );
        const snapshot = await getDocs(ordersQuery);
        
        let completedOrders = 0;
        let pendingOrders = 0;
        let inProgressOrders = 0;
        let totalEarnings = 0;
        let totalRating = 0;
        let ratedOrders = 0;

        snapshot.forEach((doc) => {
          const order = doc.data();
          
          switch (order.status) {
            case "completed":
              completedOrders++;
              if (order.price) totalEarnings += order.price;
              if (order.rating) {
                totalRating += order.rating;
                ratedOrders++;
              }
              break;
            case "pending":
              pendingOrders++;
              break;
            case "in_progress":
              inProgressOrders++;
              break;
          }
        });

        setStats({
          totalOrders: snapshot.size,
          completedOrders,
          pendingOrders,
          inProgressOrders,
          totalEarnings,
          averageRating: ratedOrders > 0 ? totalRating / ratedOrders : 0,
        });
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <ProfileLayout role="artist">
      <div className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">Panel del Artista</h1>

        {loading ? (
          <div className="text-center py-8">Cargando estadísticas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Pedidos que requieren tu atención
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.inProgressOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pedidos que estás trabajando
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.completedOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de pedidos entregados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(stats.totalEarnings)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingresos por pedidos completados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {stats.averageRating.toFixed(1)}
                  <span className="text-yellow-500">★</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Basado en pedidos completados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalOrders > 0
                    ? `${((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pedidos completados vs. totales
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProfileLayout>
  )
} 