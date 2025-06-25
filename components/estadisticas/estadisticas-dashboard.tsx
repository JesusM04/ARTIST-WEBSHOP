'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { getEstadisticasCliente, getEstadisticasArtista } from "@/lib/firestore";
import { EstadisticasCliente, EstadisticasArtista } from "@/lib/types";
import { Icons } from "@/components/icons";
import { useToast } from "@/components/ui/use-toast";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

interface EstadisticasCardProps {
  title: string;
  value: number;
  description: string;
  icon: keyof typeof Icons;
}

function EstadisticasCard({ title, value, description, icon }: EstadisticasCardProps) {
  const Icon = Icons[icon];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function EstadisticasDashboard({ isArtist = false }) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasCliente | EstadisticasArtista | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadEstadisticas();
  }, [user]);

  const loadEstadisticas = async () => {
    if (!user) return;
    
    try {
      const stats = isArtist
        ? await getEstadisticasArtista(user.uid)
        : await getEstadisticasCliente(user.uid);
      setEstadisticas(stats);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay estadísticas disponibles.
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    {
      name: "Pendientes",
      cantidad: estadisticas.pedidosPendientes,
    },
    {
      name: "Cotizados",
      cantidad: estadisticas.pedidosCotizados,
    },
    {
      name: "Completados",
      cantidad: estadisticas.pedidosCompletados,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EstadisticasCard
          title="Total de Pedidos"
          value={estadisticas.totalPedidos}
          description="Pedidos realizados hasta la fecha"
          icon="fileText"
        />
        <EstadisticasCard
          title="Pedidos Pendientes"
          value={estadisticas.pedidosPendientes}
          description="Pedidos sin cotizar"
          icon="clock"
        />
        <EstadisticasCard
          title="Pedidos Cotizados"
          value={estadisticas.pedidosCotizados}
          description="Pedidos con precio asignado"
          icon="dollarSign"
        />
        <EstadisticasCard
          title="Pedidos Completados"
          value={estadisticas.pedidosCompletados}
          description="Pedidos finalizados"
          icon="check"
        />
        {isArtist && 'clientesUnicos' in estadisticas && (
          <>
            <EstadisticasCard
              title="Clientes Únicos"
              value={estadisticas.clientesUnicos}
              description="Total de clientes atendidos"
              icon="users"
            />
            <EstadisticasCard
              title="Tiempo Promedio"
              value={Math.round(estadisticas.promedioTiempoRespuesta / (1000 * 60 * 60))}
              description="Horas promedio de respuesta"
              icon="clock"
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de Pedidos</CardTitle>
          <CardDescription>
            Visualización del estado de los pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="cantidad"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 