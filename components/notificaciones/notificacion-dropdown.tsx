'use client';

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { getNotificaciones, markNotificacionLeida } from "@/lib/firestore";
import { Notificacion } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function NotificacionDropdown() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadNotificaciones();
    // Actualizar notificaciones cada minuto
    const interval = setInterval(loadNotificaciones, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotificaciones = async () => {
    if (!user?.email) return;

    try {
      const fetchedNotificaciones = await getNotificaciones(user.email);
      setNotificaciones(fetchedNotificaciones);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
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

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificacionesNoLeidas.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {notificacionesNoLeidas.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Icons.spinner className="h-6 w-6 animate-spin" />
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No hay notificaciones
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notificaciones.map((notificacion) => (
              <DropdownMenuItem
                key={notificacion.id}
                className={`flex flex-col items-start p-4 space-y-1 ${
                  notificacion.leida ? 'opacity-60' : ''
                }`}
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">
                    {notificacion.tipo === 'nuevo_pedido' ? '🆕' :
                     notificacion.tipo === 'cotizacion' ? '💰' : '🔄'}
                    {' '}
                    {notificacion.mensaje}
                  </span>
                  {!notificacion.leida && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarcarLeida(notificacion.id)}
                    >
                      <Icons.check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(notificacion.fecha.seconds * 1000).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 