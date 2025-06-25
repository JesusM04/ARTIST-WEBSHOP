'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { getNotificaciones, markNotificacionLeida } from "@/lib/firestore";
import { Notificacion } from "@/lib/types";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface NotificacionItemProps {
  notificacion: Notificacion;
  onMarcarLeida: (id: string) => Promise<void>;
}

function NotificacionItem({ notificacion, onMarcarLeida }: NotificacionItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarcarLeida = async () => {
    setIsUpdating(true);
    await onMarcarLeida(notificacion.id);
    setIsUpdating(false);
  };

  return (
    <Card className={`mb-4 ${notificacion.leida ? 'opacity-60' : ''}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>
            {notificacion.tipo === 'nuevo_pedido' ? '🆕' :
             notificacion.tipo === 'cotizacion' ? '💰' : '🔄'}
            {' '}
            {notificacion.mensaje}
          </span>
          {!notificacion.leida && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarcarLeida}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.check className="h-4 w-4" />
              )}
              <span className="ml-2">Marcar como leída</span>
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {new Date(notificacion.fecha.seconds * 1000).toLocaleString()}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function NotificacionList() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadNotificaciones();
  }, [user]);

  const loadNotificaciones = async () => {
    if (!user?.email) return;

    try {
      const fetchedNotificaciones = await getNotificaciones(user.email);
      setNotificaciones(fetchedNotificaciones);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarcarLeida = async (notificacionId: string) => {
    try {
      await markNotificacionLeida(notificacionId);
      await loadNotificaciones();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (notificaciones.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay notificaciones para mostrar.
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {notificaciones.map((notificacion) => (
        <NotificacionItem
          key={notificacion.id}
          notificacion={notificacion}
          onMarcarLeida={handleMarcarLeida}
        />
      ))}
    </div>
  );
} 