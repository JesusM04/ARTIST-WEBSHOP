"use client"

import { useState, useEffect } from "react"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, Mail, Phone, MapPin, Calendar, User, ShoppingBag, X, Loader2, Star, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/AuthContext"

interface Order {
  id: string
  title: string
  description: string
  status: string
  createdAt: Date
  price: number
  clientId: string
  artistId: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  location: string
  joinedDate: string
  totalPurchases: number
  totalSpent: number
  lastPurchase: string
  isActive: boolean
  photoURL?: string
  rating: number
  orders: Order[]
}

export default function ArtistClientsDemo() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Datos ficticios para demostración
  const demoClients: Client[] = [
    {
      id: "1",
      name: "María García López",
      email: "maria.garcia@email.com",
      phone: "+34 612 345 678",
      location: "Madrid, España",
      joinedDate: "15 de enero, 2023",
      totalPurchases: 8,
      totalSpent: 2450,
      lastPurchase: "3 de diciembre, 2024",
      isActive: true,
      photoURL: "/placeholder.svg?height=100&width=100",
      rating: 4.8,
      orders: [
        {
          id: "ord_001",
          title: "Retrato personalizado",
          description: "Retrato al óleo de familia",
          status: "Completado",
          createdAt: new Date("2024-12-03"),
          price: 350,
          clientId: "1",
          artistId: "artist1",
        },
        {
          id: "ord_002",
          title: "Ilustración para libro",
          description: "Ilustraciones para libro infantil",
          status: "En progreso",
          createdAt: new Date("2024-11-15"),
          price: 800,
          clientId: "1",
          artistId: "artist1",
        },
      ],
    },
    {
      id: "2",
      name: "Carlos Ruiz Mendoza",
      email: "carlos.ruiz@empresa.com",
      phone: "+34 687 234 567",
      location: "Barcelona, España",
      joinedDate: "22 de marzo, 2023",
      totalPurchases: 12,
      totalSpent: 3200,
      lastPurchase: "28 de noviembre, 2024",
      isActive: true,
      photoURL: "/placeholder.svg?height=100&width=100",
      rating: 4.9,
      orders: [
        {
          id: "ord_003",
          title: "Logo empresarial",
          description: "Diseño de identidad corporativa",
          status: "Completado",
          createdAt: new Date("2024-11-28"),
          price: 450,
          clientId: "2",
          artistId: "artist1",
        },
      ],
    },
    {
      id: "3",
      name: "Ana López Fernández",
      email: "ana.lopez@gmail.com",
      phone: "+34 654 987 321",
      location: "Valencia, España",
      joinedDate: "8 de junio, 2023",
      totalPurchases: 5,
      totalSpent: 1750,
      lastPurchase: "15 de octubre, 2024",
      isActive: true,
      photoURL: "/placeholder.svg?height=100&width=100",
      rating: 4.6,
      orders: [],
    },
    {
      id: "4",
      name: "Roberto Silva Castro",
      email: "roberto.silva@hotmail.com",
      phone: "+34 698 765 432",
      location: "Sevilla, España",
      joinedDate: "12 de febrero, 2023",
      totalPurchases: 3,
      totalSpent: 890,
      lastPurchase: "5 de agosto, 2024",
      isActive: false,
      photoURL: "/placeholder.svg?height=100&width=100",
      rating: 4.2,
      orders: [],
    },
    {
      id: "5",
      name: "Elena Martín Jiménez",
      email: "elena.martin@yahoo.com",
      phone: "+34 623 456 789",
      location: "Bilbao, España",
      joinedDate: "30 de abril, 2023",
      totalPurchases: 15,
      totalSpent: 4200,
      lastPurchase: "1 de diciembre, 2024",
      isActive: true,
      photoURL: "/placeholder.svg?height=100&width=100",
      rating: 5.0,
      orders: [
        {
          id: "ord_004",
          title: "Mural decorativo",
          description: "Mural para oficina corporativa",
          status: "Completado",
          createdAt: new Date("2024-12-01"),
          price: 1200,
          clientId: "5",
          artistId: "artist1",
        },
      ],
    },
    {
      id: "6",
      name: "Pedro Sánchez Morales",
      email: "pedro.sanchez@outlook.com",
      phone: "+34 645 123 987",
      location: "Zaragoza, España",
      joinedDate: "18 de julio, 2023",
      totalPurchases: 7,
      totalSpent: 2100,
      lastPurchase: "20 de noviembre, 2024",
      isActive: true,
      photoURL: "/placeholder.svg?height=100&width=100",
      rating: 4.7,
      orders: [],
    },
    {
      id: "7",
      name: "Laura Fernández Ruiz",
      email: "laura.fernandez@gmail.com",
      phone: "+34 612 789 456",
      location: "Málaga, España",
      joinedDate: "5 de septiembre, 2023",
      totalPurchases: 2,
      totalSpent: 650,
      lastPurchase: "10 de septiembre, 2024",
      isActive: false,
      photoURL: "/placeholder.svg?height=100&width=100",
      rating: 4.3,
      orders: [],
    },
    {
      id: "8",
      name: "Diego Morales Vega",
      email: "diego.morales@empresa.es",
      phone: "+34 687 654 321",
      location: "Murcia, España",
      joinedDate: "14 de octubre, 2023",
      totalPurchases: 9,
      totalSpent: 2800,
      lastPurchase: "25 de noviembre, 2024",
      isActive: true,
      photoURL: "/placeholder.svg?height=100&width=100",
      rating: 4.8,
      orders: [],
    },
    {
      id: "9",
      name: "Patricia López Herrera",
      email: "patricia.lopez@hotmail.com",
      phone: "+34 634 567 890",
      location: "Santander, España",
      joinedDate: "28 de noviembre, 2023",
      totalPurchases: 4,
      totalSpent: 1200,
      lastPurchase: "8 de octubre, 2024",
      isActive: true,
      photoURL: "/placeholder.svg?height=100&width=100",
      rating: 4.5,
      orders: [],
    },
    {
      id: "10",
      name: "Javier González Pérez",
      email: "javier.gonzalez@gmail.com",
      phone: "+34 698 432 165",
      location: "Córdoba, España",
      joinedDate: "3 de diciembre, 2023",
      totalPurchases: 1,
      totalSpent: 280,
      lastPurchase: "15 de julio, 2024",
      isActive: false,
      photoURL: "/placeholder.svg?height=100&width=100",
      rating: 4.0,
      orders: [],
    },
  ]

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setClients(demoClients)
      setFilteredClients(demoClients)
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Filtrar clientes según la búsqueda y pestaña activa
    let result = clients

    // Aplicar filtro por texto de búsqueda
    if (searchQuery) {
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Aplicar filtro por estado (activo/inactivo)
    if (activeTab !== "all") {
      const isActive = activeTab === "active"
      result = result.filter((client) => client.isActive === isActive)
    }

    setFilteredClients(result)
  }, [searchQuery, activeTab, clients])

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client)
    setDetailsOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  const renderClientCard = (client: Client) => (
    <Card
      key={client.id}
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
      onClick={() => handleViewDetails(client)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={client.photoURL || "/placeholder.svg"} />
            <AvatarFallback className="text-lg font-semibold">
              {client.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg text-foreground truncate">{client.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(client.rating)}
                  <span className="text-sm text-muted-foreground ml-1">({client.rating})</span>
                </div>
              </div>
              <Badge variant={client.isActive ? "default" : "secondary"} className="ml-2">
                {client.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{client.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{client.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{client.totalPurchases}</div>
                <div className="text-xs text-muted-foreground">Pedidos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{formatCurrency(client.totalSpent)}</div>
                <div className="text-xs text-muted-foreground">Total gastado</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Última compra</div>
                <div className="text-sm font-medium">{client.lastPurchase}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProfileLayout role={user?.role || "artist"}>
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        {/* Header fijo */}
        <header className="flex-shrink-0 p-6 border-b border-border bg-background">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <User className="h-8 w-8" />
                Mis Clientes
              </h1>
              <p className="text-muted-foreground mt-2">Gestiona y visualiza información de todos tus clientes</p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, email o ubicación..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex-shrink-0 px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Todos ({clients.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Activos ({clients.filter((c) => c.isActive).length})
                </TabsTrigger>
                <TabsTrigger value="inactive" className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  Inactivos ({clients.filter((c) => !c.isActive).length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="all" className="h-full m-0 p-0">
                <div className="h-[calc(100vh-16rem)] overflow-y-auto px-6 py-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground mt-2">Cargando clientes...</p>
                      </div>
                    </div>
                  ) : filteredClients.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                      {filteredClients.map((client) => renderClientCard(client))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground mt-2">
                          {searchQuery
                            ? "No se encontraron clientes que coincidan con tu búsqueda."
                            : "No hay clientes disponibles."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="active" className="h-full m-0 p-0">
                <div className="h-[calc(100vh-16rem)] overflow-y-auto px-6 py-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground mt-2">Cargando clientes...</p>
                      </div>
                    </div>
                  ) : filteredClients.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                      {filteredClients.map((client) => renderClientCard(client))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground mt-2">
                          {searchQuery
                            ? "No se encontraron clientes activos que coincidan con tu búsqueda."
                            : "No hay clientes activos disponibles."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="inactive" className="h-full m-0 p-0">
                <div className="h-[calc(100vh-16rem)] overflow-y-auto px-6 py-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground mt-2">Cargando clientes...</p>
                      </div>
                    </div>
                  ) : filteredClients.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                      {filteredClients.map((client) => renderClientCard(client))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground mt-2">
                          {searchQuery
                            ? "No se encontraron clientes inactivos que coincidan con tu búsqueda."
                            : "No hay clientes inactivos disponibles."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Diálogo de detalles del cliente */}
        {selectedClient && (
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl text-foreground">Detalles del Cliente</DialogTitle>
                    <DialogDescription>Información completa y historial de pedidos</DialogDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setDetailsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-8">
                {/* Información del cliente */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={selectedClient.photoURL || "/placeholder.svg"} />
                        <AvatarFallback className="text-2xl">
                          {selectedClient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="font-bold text-xl text-foreground">{selectedClient.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1">{renderStars(selectedClient.rating)}</div>
                            <span className="text-sm text-muted-foreground">({selectedClient.rating}/5.0)</span>
                            <Badge variant={selectedClient.isActive ? "default" : "secondary"}>
                              {selectedClient.isActive ? "Cliente activo" : "Cliente inactivo"}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a href={`mailto:${selectedClient.email}`} className="hover:underline text-primary">
                                {selectedClient.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedClient.phone}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedClient.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Cliente desde: {selectedClient.joinedDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                      <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-primary">{selectedClient.totalPurchases}</div>
                        <div className="text-sm text-muted-foreground">Total Pedidos</div>
                      </Card>
                      <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedClient.totalSpent)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Gastado</div>
                      </Card>
                      <Card className="text-center p-4">
                        <div className="text-lg font-bold text-foreground">{selectedClient.lastPurchase}</div>
                        <div className="text-sm text-muted-foreground">Última Compra</div>
                      </Card>
                      <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-yellow-600">{selectedClient.rating}</div>
                        <div className="text-sm text-muted-foreground">Valoración</div>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Historial de pedidos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Historial de Pedidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedClient.orders && selectedClient.orders.length > 0 ? (
                      <div className="space-y-4">
                        {selectedClient.orders.map((order) => (
                          <Card key={order.id} className="border-l-4 border-l-primary/30">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground">{order.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{order.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span>ID: {order.id}</span>
                                    <span>Fecha: {order.createdAt.toLocaleDateString("es-ES")}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">{formatCurrency(order.price)}</div>
                                  <Badge
                                    variant={
                                      order.status === "Completado"
                                        ? "default"
                                        : order.status === "Pendiente"
                                          ? "secondary"
                                          : order.status === "En progreso"
                                            ? "outline"
                                            : "destructive"
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30" />
                        <p className="mt-2 text-muted-foreground">Este cliente aún no ha realizado ningún pedido</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Cerrar
                </Button>
                <Button className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Enviar mensaje
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProfileLayout>
  )
}
