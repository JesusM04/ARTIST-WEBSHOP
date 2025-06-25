"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { doc, collection, query, where, onSnapshot, updateDoc, orderBy } from "firebase/firestore"
import { useAuth } from "@/lib/AuthContext"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { OrderList } from "@/components/orders/order-list"
import { OrderForm } from "@/components/orders/order-form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  artistEmail?: string
}

export default function ClientOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return

    setLoading(true)
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, where("clientId", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        try {
          const ordersData = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              type: data.type || '',
              size: data.size || '',
              style: data.style || '',
              tone: data.tone || '',
              material: data.material || '',
              frameSize: data.frameSize || '',
              background: data.background || '',
              status: data.status || '',
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              price: data.price || null,
              deadline: data.deadline || '',
              imageUrl: data.imageUrl,
              clientId: data.clientId || '',
              artistId: data.artistId || '',
              artistEmail: data.artistEmail || 'Email no disponible'
            }
          }) as Order[]

          setOrders(ordersData)
          setLoading(false)
          setError("")

          // Si hay un pedido seleccionado, actualizamos su información
          if (selectedOrder) {
            const updatedOrder = ordersData.find(order => order.id === selectedOrder.id)
            if (updatedOrder) {
              setSelectedOrder(updatedOrder)
            }
          }
        } catch (error) {
          console.error("Error al procesar los pedidos:", error)
          toast.error("Error al cargar los pedidos")
          setLoading(false)
          setError("Error al procesar los datos de pedidos")
        }
      }, 
      (error) => {
        console.error("Error al obtener pedidos:", error)
        toast.error("Error al cargar los pedidos")
        setLoading(false)
        setError("Error al obtener los pedidos de la base de datos")
      }
    )

    return () => unsubscribe()
  }, [user, selectedOrder])

  // Filtrar pedidos basados en búsqueda y estado
  useEffect(() => {
    if (orders.length === 0) {
      setFilteredOrders([])
      return
    }

    let result = [...orders]

    // Filtrar por búsqueda
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(order => 
        order.title.toLowerCase().includes(query) ||
        order.description.toLowerCase().includes(query) ||
        order.type.toLowerCase().includes(query)
      )
    }

    // Filtrar por estado
    if (activeFilter !== "all") {
      result = result.filter(order => order.status === activeFilter)
    }

    // Ordenar por fecha más reciente
    result = result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    setFilteredOrders(result)
  }, [orders, searchQuery, activeFilter])

  const canEditOrder = useCallback((order: Order) => {
    return order.status === "pending" || (order.status === "in_progress" && !order.price)
  }, [])

  const handleOrderClick = useCallback((order: Order) => {
    setSelectedOrder(order)
    setIsEditing(false)
  }, [])

  const handleEditOrder = useCallback(() => {
    if (!selectedOrder || !canEditOrder(selectedOrder)) return
    setIsEditing(true)
  }, [selectedOrder, canEditOrder])

  const handleUpdateOrder = useCallback(async (formData: any) => {
    if (!selectedOrder || !canEditOrder(selectedOrder)) return

    try {
      const orderRef = doc(db, "orders", selectedOrder.id)
      await updateDoc(orderRef, {
        ...formData,
        updatedAt: new Date()
      })
      
      setIsEditing(false)
      toast.success("Pedido actualizado correctamente")
    } catch (error) {
      console.error("Error al actualizar el pedido:", error)
      toast.error("Error al actualizar el pedido")
    }
  }, [selectedOrder, canEditOrder])

  const handleCancelOrder = useCallback(async () => {
    if (!selectedOrder || !canEditOrder(selectedOrder)) return

    try {
      const orderRef = doc(db, "orders", selectedOrder.id)
      await updateDoc(orderRef, {
        status: "cancelled",
        updatedAt: new Date()
      })
      
      setShowCancelDialog(false)
      setSelectedOrder(null)
      toast.success("Pedido cancelado correctamente")
    } catch (error) {
      console.error("Error al cancelar el pedido:", error)
      toast.error("Error al cancelar el pedido")
    }
  }, [selectedOrder, canEditOrder])

  const handleCloseDialog = useCallback(() => {
    setSelectedOrder(null)
    setIsEditing(false)
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'in_progress': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }, [])

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'in_progress': return 'En progreso'
      case 'completed': return 'Completado'
      case 'cancelled': return 'Cancelado'
      default: return 'Desconocido'
    }
  }, [])

  if (!user) {
    return null
  }

  return (
    <ProfileLayout role="client">
      <div className="container py-8 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Mis Pedidos</h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Input
              placeholder="Buscar por título, descripción o tipo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full md:w-80"
            />
            
            <div className="flex space-x-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveFilter("all")}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={activeFilter === "pending" ? "default" : "outline"}
                onClick={() => setActiveFilter("pending")}
                size="sm"
              >
                Pendientes
              </Button>
              <Button
                variant={activeFilter === "in_progress" ? "default" : "outline"}
                onClick={() => setActiveFilter("in_progress")}
                size="sm"
              >
                En progreso
              </Button>
              <Button
                variant={activeFilter === "completed" ? "default" : "outline"}
                onClick={() => setActiveFilter("completed")}
                size="sm"
              >
                Completados
              </Button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-destructive">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Recargar página</Button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <ScrollArea className="h-[60vh]">
            <OrderList 
              orders={filteredOrders} 
              userRole="client" 
              onOrderClick={handleOrderClick}
            />
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">No se encontraron pedidos</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "No hay pedidos que coincidan con tu búsqueda." 
                : "Aún no tienes pedidos. ¡Crea tu primer pedido ahora!"}
            </p>
          </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Creado: {format(selectedOrder.createdAt, "dd/MM/yyyy", { locale: es })}
                    </span>
                  </div>
                  {selectedOrder.price && (
                    <div className="text-lg font-semibold">
                      Precio: ${selectedOrder.price}
                    </div>
                  )}
                </div>
                
                {selectedOrder.artistEmail && (
                  <div className="text-sm text-muted-foreground">
                    Artista asignado: {selectedOrder.artistEmail}
                  </div>
                )}
                
                <OrderForm
                  initialData={selectedOrder}
                  isReadOnly={!isEditing}
                  onSubmit={handleUpdateOrder}
                  onEdit={handleEditOrder}
                  userRole="client"
                />

                {canEditOrder(selectedOrder) && !isEditing && (
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelDialog(true)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Cancelar Pedido
                    </Button>
                    <Button
                      onClick={handleEditOrder}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Editar Pedido
                    </Button>
                  </div>
                )}

                <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El pedido será cancelado permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancelOrder}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Confirmar Cancelación
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProfileLayout>
  )
}
