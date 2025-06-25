"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { OrderList } from "@/components/orders/order-list"
import { OrderForm } from "@/components/orders/order-form"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import dynamic from 'next/dynamic'
import { ScrollArea } from "@/components/ui/scroll-area"

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

interface OrderRowProps {
  order: Order
  onOrderClick: (order: Order) => void
  isArtist: boolean
}

const OrderRow = dynamic(() => import('@/components/orders/order-row').then(mod => mod.OrderRow), { ssr: false })

export default function ArtistOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isSettingPrice, setIsSettingPrice] = useState(false)
  const [price, setPrice] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesType = typeFilter === "all" || order.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [orders, searchTerm, statusFilter, typeFilter])

  useEffect(() => {
    let unsubscribe = () => {}

    if (user) {
      const ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      )

      unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        try {
          const ordersData = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate(),
              artistId: data.artistId || "",
              price: data.price || null
            }
          }) as Order[]

          console.log("Total de pedidos encontrados:", ordersData.length)
          setOrders(ordersData)
          setLoading(false)
        } catch (error) {
          console.error("Error procesando los pedidos:", error)
          toast.error("Error al procesar los pedidos")
          setLoading(false)
        }
      })
    }

    return () => unsubscribe()
  }, [user])

  const handleOrderClick = useCallback((order: Order) => {
    setSelectedOrder(order)
    setIsSettingPrice(false)
    setPrice("")
  }, [])

  const handleSetPrice = useCallback(async () => {
    if (!selectedOrder || !price || !user) return

    try {
      const orderRef = doc(db, "orders", selectedOrder.id)
      await updateDoc(orderRef, {
        price: parseFloat(price),
        status: "in_progress",
        artistId: user.uid,
        updatedAt: new Date()
      })
      
      setIsSettingPrice(false)
      setPrice("")
      toast.success("Precio establecido correctamente")
    } catch (error) {
      console.error("Error al establecer el precio:", error)
      toast.error("Error al establecer el precio")
    }
  }, [selectedOrder, price, user])

  const handleCloseDialog = useCallback(() => {
    setSelectedOrder(null)
    setIsSettingPrice(false)
    setPrice("")
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value)
  }, [])

  const handleTypeFilterChange = useCallback((value: string) => {
    setTypeFilter(value)
  }, [])

  if (!user) {
    return null
  }

  return (
    <ProfileLayout role="artist">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Pedidos de Clientes</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
              <SelectItem value="traditional">Tradicional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay pedidos disponibles en este momento
          </div>
        ) : (
          <ScrollArea className="h-[60vh] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onOrderClick={handleOrderClick}
                    isArtist={true}
                  />
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        <Dialog open={!!selectedOrder} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                Detalles del Pedido
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <OrderForm
                  initialData={selectedOrder}
                  isReadOnly={true}
                  userRole="artist"
                />
                
                {!selectedOrder.price && selectedOrder.status !== "cancelled" && (
                  <div className="p-6 rounded-lg border bg-card/50 space-y-4">
                    <h3 className="text-lg font-medium text-primary">Establecer Precio</h3>
                    {isSettingPrice ? (
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          placeholder="Ingrese el precio..."
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-40"
                          min="0"
                          step="0.01"
                        />
                        <Button 
                          onClick={handleSetPrice} 
                          disabled={!price}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Confirmar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsSettingPrice(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setIsSettingPrice(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Establecer Precio
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProfileLayout>
  )
} 