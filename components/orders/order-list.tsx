"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OrderForm } from "./order-form"
import { OrderRow } from "./order-row"

interface Order {
  id: string
  title: string
  description: string
  type: string
  size: string
  style: string
  tone: string
  material: string
  frameSize: string
  background: string
  status: string
  createdAt: Date
  updatedAt?: Date
  price: number | null
  deadline: string
  imageUrl?: string
  clientId: string
  artistId: string
}

interface OrderListProps {
  orders: Order[]
  userRole: "client" | "artist"
  onOrderClick: (order: Order) => void
}

export function OrderList({ orders, userRole, onOrderClick }: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "outline"
      case "in_progress":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "in_progress":
        return "En Progreso"
      case "cancelled":
        return "Cancelado"
      default:
        return "Pendiente"
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesType = typeFilter === "all" || order.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Buscar pedidos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-64"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="digital">Digital</SelectItem>
            <SelectItem value="traditional">Tradicional</SelectItem>
            <SelectItem value="mixed">Mixto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron pedidos
        </div>
      ) : (
        <div className="rounded-md border min-w-max">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Título</TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="w-[100px]">Tipo</TableHead>
                <TableHead className="w-[100px]">Tamaño</TableHead>
                <TableHead className="w-[120px]">Fecha</TableHead>
                <TableHead className="w-[100px]">Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onOrderClick={onOrderClick}
                  isArtist={userRole === "artist"}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Detalles del Pedido
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderForm
              initialData={selectedOrder}
              isReadOnly={true}
              userRole={userRole}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 