'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface PedidoFilterProps {
  onFilter: (filters: {
    search: string;
    estado: string;
    fechaDesde: Date | null;
    fechaHasta: Date | null;
  }) => void;
}

export default function PedidoFilter({ onFilter }: PedidoFilterProps) {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);

  const handleFilter = () => {
    onFilter({
      search,
      estado,
      fechaDesde,
      fechaHasta,
    });
  };

  const handleReset = () => {
    setSearch("");
    setEstado("");
    setFechaDesde(null);
    setFechaHasta(null);
    onFilter({
      search: "",
      estado: "",
      fechaDesde: null,
      fechaHasta: null,
    });
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Buscar</Label>
          <Input
            placeholder="Buscar en descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="cotizado">Cotizado</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Desde</Label>
          <DatePicker
            date={fechaDesde}
            setDate={setFechaDesde}
            placeholder="Seleccionar fecha"
          />
        </div>
        <div className="space-y-2">
          <Label>Hasta</Label>
          <DatePicker
            date={fechaHasta}
            setDate={setFechaHasta}
            placeholder="Seleccionar fecha"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleReset}>
          <Icons.refresh className="mr-2 h-4 w-4" />
          Reiniciar
        </Button>
        <Button onClick={handleFilter}>
          <Icons.search className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </div>
    </div>
  );
} 