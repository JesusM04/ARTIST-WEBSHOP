"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ProfileLayout } from "@/components/layouts/profile-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  ordersByType: {
    [key: string]: number;
  };
  ordersByMonth: {
    name: string;
    orders: number;
  }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function StatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    cancelledOrders: 0,
    totalSpent: 0,
    ordersByType: {},
    ordersByMonth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("clientId", "==", user.uid)
        );
        const snapshot = await getDocs(ordersQuery);
        
        const ordersByType: { [key: string]: number } = {};
        const ordersByMonth: { [key: string]: number } = {};
        let completedOrders = 0;
        let pendingOrders = 0;
        let inProgressOrders = 0;
        let cancelledOrders = 0;
        let totalSpent = 0;

        snapshot.forEach((doc) => {
          const order = doc.data();
          
          // Contar por estado
          switch (order.status) {
            case "completed":
              completedOrders++;
              if (order.price) totalSpent += order.price;
              break;
            case "pending":
              pendingOrders++;
              break;
            case "in_progress":
              inProgressOrders++;
              break;
            case "cancelled":
              cancelledOrders++;
              break;
          }

          // Contar por tipo
          ordersByType[order.type] = (ordersByType[order.type] || 0) + 1;

          // Contar por mes
          const date = order.createdAt.toDate();
          const monthYear = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
          ordersByMonth[monthYear] = (ordersByMonth[monthYear] || 0) + 1;
        });

        // Convertir ordersByMonth a array para el gráfico
        const ordersByMonthArray = Object.entries(ordersByMonth).map(([name, orders]) => ({
          name,
          orders,
        }));

        setStats({
          totalOrders: snapshot.size,
          completedOrders,
          pendingOrders,
          inProgressOrders,
          cancelledOrders,
          totalSpent,
          ordersByType,
          ordersByMonth: ordersByMonthArray,
        });
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const orderTypeData = Object.entries(stats.ordersByType).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ProfileLayout role="client">
      <div className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">Estadísticas de Pedidos</h1>

        {loading ? (
          <div className="text-center py-8">Cargando estadísticas...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Completados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedOrders}
                  </div>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(stats.totalSpent)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.ordersByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

              <Card>
            <CardHeader>
                  <CardTitle>Pedidos por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {orderTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
            </CardContent>
          </Card>
            </div>
          </>
        )}
      </div>
    </ProfileLayout>
  );
} 