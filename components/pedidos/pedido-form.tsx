'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { createPedido } from "@/lib/firestore";
import { Icons } from "@/components/icons";

export default function PedidoForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [descripcion, setDescripcion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createPedido({
        title: descripcion,
        description: descripcion,
        type: "default",
        size: "default",
        style: "default",
        tone: "default",
        material: "default",
        frameSize: "default",
        background: "default",
        status: "pendiente",
        price: null,
        deadline: "",
        clientId: user.uid,
        artistId: ""
      });

      toast({
        title: "Éxito",
        description: "Pedido creado correctamente"
      });
      
      setDescripcion("");
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el pedido",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Pedido</CardTitle>
        <CardDescription>
          Describe los detalles de tu pedido
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full gap-4">
            <div className="flex flex-col space-y-1.5">
              <Textarea
                id="descripcion"
                name="descripcion"
                placeholder="Describe tu pedido aquí..."
                className="min-h-[200px]"
                disabled={isLoading}
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enviar Pedido
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 