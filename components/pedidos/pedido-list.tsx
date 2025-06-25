'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { getPedidosCliente, getPedidosArtista, updatePedido } from "@/lib/firestore";
import { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";
import PedidoFilter from "./pedido-filter";

interface PedidoItemProps {
  pedido: Order;
  isArtist?: boolean;
  onUpdatePrecio?: (id: string, precio: number) => Promise<void>;
}

function PedidoItem({ pedido, isArtist, onUpdatePrecio }: PedidoItemProps) {
  const [precio, setPrecio] = useState(pedido.price?.toString() || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePrecio = async () => {
    if (!precio) return;
    
    setIsUpdating(true);
    try {
      await onUpdatePrecio?.(pedido.id, parseFloat(precio));
    } catch (error) {
      console.error("Error al actualizar el precio:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg">
      <h3 className="font-semibold">{pedido.title}</h3>
      <p className="text-gray-600">{pedido.description}</p>
      <div className="mt-2">
        <p>Estado: {pedido.status}</p>
        {pedido.price && <p>Precio: ${pedido.price}</p>}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        <p>Creado: {pedido.createdAt.toLocaleDateString()}</p>
        {isArtist && pedido.clientId && (
          <p>Cliente ID: {pedido.clientId}</p>
        )}
      </div>
      {isArtist && !pedido.price && (
        <div className="mt-4 flex gap-2">
          <Input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Ingrese el precio"
            className="w-32"
          />
          <Button 
            onClick={handleUpdatePrecio}
            disabled={isUpdating}
          >
            {isUpdating ? "Actualizando..." : "Actualizar Precio"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PedidoList({ isArtist = false }) {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [filteredPedidos, setFilteredPedidos] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadPedidos = async () => {
      if (!user) return;
      
      try {
        const data = isArtist 
          ? await getPedidosArtista(user.uid)
          : await getPedidosCliente(user.uid);
        
        setPedidos(data);
        setFilteredPedidos(data);
      } catch (error) {
        console.error("Error al cargar los pedidos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los pedidos",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPedidos();
  }, [user, isArtist, toast]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = pedidos.filter(pedido => 
      pedido.title.toLowerCase().includes(term.toLowerCase()) ||
      pedido.description.toLowerCase().includes(term.toLowerCase()) ||
      pedido.status.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredPedidos(filtered);
  };

  const handleUpdatePrecio = async (id: string, price: number) => {
    try {
      await updatePedido(id, { price });
      toast({
        title: "Éxito",
        description: "Precio actualizado correctamente",
      });
    } catch (error) {
      console.error("Error al actualizar el precio:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>Cargando pedidos...</div>;
  }

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Buscar pedidos..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="max-w-sm"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPedidos.map(pedido => (
          <PedidoItem
            key={pedido.id}
            pedido={pedido}
            isArtist={isArtist}
            onUpdatePrecio={handleUpdatePrecio}
          />
        ))}
      </div>
    </div>
  );
} 