"use client"

import { useEffect, useState } from "react"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { useAuth } from "@/lib/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, CheckCheck, Heart, MessageCircle, Settings, Trash2, User, Calendar, Award, Eye } from 'lucide-react'
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "system" | "achievement" | "event"
  title: string
  message: string
  timestamp: string
  read: boolean
  avatar?: string
  actionUrl?: string
}

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: User,
  system: Settings,
  achievement: Award,
  event: Calendar,
}

const notificationColors = {
  like: "text-red-500",
  comment: "text-blue-500",
  follow: "text-green-500",
  system: "text-gray-500",
  achievement: "text-yellow-500",
  event: "text-purple-500",
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    likes: true,
    comments: true,
    follows: true,
    achievements: true,
    events: true,
  })

  // Datos de demostración
  const sampleNotifications: Notification[] = [
    {
      id: "1",
      type: "like",
      title: "Nueva reacción",
      message: "A María García le gustó tu obra 'Colores del Alma'",
      timestamp: "Hace 5 minutos",
      read: false,
      avatar: "/avatars/maria.jpg",
    },
    {
      id: "2",
      type: "comment",
      title: "Nuevo comentario",
      message: "Carlos Ruiz comentó en tu exposición: 'Increíble trabajo, me encanta la técnica utilizada'",
      timestamp: "Hace 15 minutos",
      read: false,
      avatar: "/avatars/carlos.jpg",
    },
    {
      id: "3",
      type: "follow",
      title: "Nuevo seguidor",
      message: "Ana López ahora te sigue",
      timestamp: "Hace 1 hora",
      read: true,
      avatar: "/avatars/ana.jpg",
    },
    {
      id: "4",
      type: "achievement",
      title: "¡Logro desbloqueado!",
      message: "Has alcanzado 100 likes en tus obras. ¡Felicitaciones!",
      timestamp: "Hace 2 horas",
      read: false,
    },
    {
      id: "5",
      type: "event",
      title: "Recordatorio de evento",
      message: "Tu exposición 'Nuevas Perspectivas' comienza mañana a las 18:00",
      timestamp: "Hace 3 horas",
      read: true,
    },
    {
      id: "6",
      type: "system",
      title: "Actualización del sistema",
      message: "Hemos actualizado nuestras políticas de privacidad. Revisa los cambios.",
      timestamp: "Hace 1 día",
      read: true,
    },
    {
      id: "7",
      type: "like",
      title: "Múltiples reacciones",
      message: "Tu obra 'Memorias Fragmentadas' recibió 5 nuevos likes",
      timestamp: "Hace 2 días",
      read: true,
    },
    {
      id: "8",
      type: "comment",
      title: "Respuesta a comentario",
      message: "Elena Martín respondió a tu comentario en la obra de Pedro Sánchez",
      timestamp: "Hace 3 días",
      read: true,
    },
    {
      id: "9",
      type: "like",
      title: "Nueva reacción",
      message: "Roberto Silva le gustó tu proyecto 'Diseño Moderno'",
      timestamp: "Hace 4 días",
      read: true,
    },
    {
      id: "10",
      type: "system",
      title: "Mantenimiento programado",
      message: "El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 4:00 AM",
      timestamp: "Hace 5 días",
      read: false,
    },
    {
      id: "11",
      type: "comment",
      title: "Nuevo comentario",
      message: "Laura Fernández comentó: 'Excelente propuesta, me gustaría colaborar contigo'",
      timestamp: "Hace 6 días",
      read: true,
    },
    {
      id: "12",
      type: "achievement",
      title: "¡Nuevo logro!",
      message: "Has completado tu primer mes en la plataforma. ¡Bienvenido!",
      timestamp: "Hace 1 semana",
      read: true,
    },
    {
      id: "13",
      type: "follow",
      title: "Nuevo seguidor",
      message: "Diego Morales ahora te sigue",
      timestamp: "Hace 1 semana",
      read: true,
    },
    {
      id: "14",
      type: "event",
      title: "Invitación a evento",
      message: "Has sido invitado al 'Workshop de Creatividad Digital' el próximo mes",
      timestamp: "Hace 1 semana",
      read: false,
    },
    {
      id: "15",
      type: "like",
      title: "Múltiples reacciones",
      message: "Tu portafolio recibió 12 nuevos likes esta semana",
      timestamp: "Hace 1 semana",
      read: true,
    },
    {
      id: "16",
      type: "system",
      title: "Nueva función disponible",
      message: "Ahora puedes exportar tu portafolio en formato PDF desde tu perfil",
      timestamp: "Hace 2 semanas",
      read: true,
    },
    {
      id: "17",
      type: "comment",
      title: "Respuesta a comentario",
      message: "Patricia López respondió a tu comentario en el foro de la comunidad",
      timestamp: "Hace 2 semanas",
      read: true,
    },
    {
      id: "18",
      type: "achievement",
      title: "¡Logro desbloqueado!",
      message: "Has recibido tu primera colaboración. ¡Felicitaciones por tu trabajo!",
      timestamp: "Hace 2 semanas",
      read: true,
    },
  ]

  const clientNotifications: Notification[] = [
    {
      id: "c1",
      type: "system",
      title: "Bienvenido como cliente",
      message: "Tu cuenta de cliente ha sido activada. Ahora puedes explorar artistas y solicitar servicios.",
      timestamp: "Hace 10 minutos",
      read: false,
    },
    {
      id: "c2",
      type: "event",
      title: "Propuesta recibida",
      message: "María García te envió una propuesta para tu proyecto 'Diseño de Logo'",
      timestamp: "Hace 30 minutos",
      read: false,
    },
    {
      id: "c3",
      type: "comment",
      title: "Nuevo mensaje",
      message: "Carlos Ruiz respondió a tu consulta sobre precios de ilustración",
      timestamp: "Hace 1 hora",
      read: true,
    },
    {
      id: "c4",
      type: "achievement",
      title: "Primer proyecto completado",
      message: "¡Felicitaciones! Tu primer proyecto con Ana López ha sido completado exitosamente",
      timestamp: "Hace 2 horas",
      read: false,
    },
    {
      id: "c5",
      type: "follow",
      title: "Artista favorito",
      message: "Elena Martín, tu artista favorito, publicó nuevos trabajos en su portafolio",
      timestamp: "Hace 3 horas",
      read: true,
    },
    {
      id: "c6",
      type: "system",
      title: "Recordatorio de pago",
      message: "Tienes un pago pendiente por el proyecto 'Diseño Web' con Pedro Sánchez",
      timestamp: "Hace 1 día",
      read: true,
    },
    {
      id: "c7",
      type: "event",
      title: "Nueva propuesta disponible",
      message: "3 artistas han respondido a tu solicitud de 'Ilustración para libro infantil'",
      timestamp: "Hace 2 días",
      read: true,
    },
    {
      id: "c8",
      type: "comment",
      title: "Consulta respondida",
      message: "Roberto Silva respondió a tu pregunta sobre tiempos de entrega",
      timestamp: "Hace 3 días",
      read: true,
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      const isClient = user?.role === "client"
      setNotifications(isClient ? clientNotifications : sampleNotifications)
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [user?.role])

  const unreadCount = notifications.filter((n) => !n.read).length
  const filteredNotifications = (type?: string) => {
    if (!type || type === "all") return notifications
    return notifications.filter((n) => n.type === type)
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const IconComponent = notificationIcons[notification.type]
    const iconColor = notificationColors[notification.type]

    return (
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-md",
          !notification.read && "border-l-4 border-l-primary bg-primary/5",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-full", !notification.read ? "bg-primary/10" : "bg-muted")}>
              <IconComponent className={cn("h-4 w-4", iconColor)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className={cn("text-sm text-foreground", !notification.read ? "font-semibold" : "font-medium")}>
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                  <span className="text-xs text-muted-foreground/70 mt-2 block">{notification.timestamp}</span>
                </div>

                <div className="flex items-center gap-1">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <ProfileLayout role="artist">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout role={user?.role || "artist"}>
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        <header className="flex-shrink-0 flex items-center justify-between p-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-8 w-8" />
              {user?.role === "client" ? "Mis Notificaciones" : "Notificaciones"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === "client"
                ? "Mantente al día con tus proyectos, propuestas y mensajes de artistas"
                : "Mantente al día con todas tus interacciones y actualizaciones"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-3">
                {unreadCount} sin leer
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como leídas
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <div className="flex-shrink-0 px-6 pt-4">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all" className="flex gap-1 items-center">
                  <Bell className="h-3 w-3" />
                  <span className="hidden sm:inline">Todas</span>
                </TabsTrigger>
                <TabsTrigger value="like" className="flex gap-1 items-center">
                  <Heart className="h-3 w-3" />
                  <span className="hidden sm:inline">Likes</span>
                </TabsTrigger>
                <TabsTrigger value="comment" className="flex gap-1 items-center">
                  <MessageCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Comentarios</span>
                </TabsTrigger>
                <TabsTrigger value="follow" className="flex gap-1 items-center">
                  <User className="h-3 w-3" />
                  <span className="hidden sm:inline">Seguidores</span>
                </TabsTrigger>
                <TabsTrigger value="achievement" className="flex gap-1 items-center">
                  <Award className="h-3 w-3" />
                  <span className="hidden sm:inline">Logros</span>
                </TabsTrigger>
                <TabsTrigger value="event" className="flex gap-1 items-center">
                  <Calendar className="h-3 w-3" />
                  <span className="hidden sm:inline">Eventos</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex gap-1 items-center">
                  <Settings className="h-3 w-3" />
                  <span className="hidden sm:inline">Config</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* Todas las notificaciones */}
              <TabsContent value="all" className="h-full m-0 p-0">
                <div className="h-[calc(100vh-16rem)] overflow-y-auto px-6 py-4">
                  <div className="space-y-3 pb-4">
                    {filteredNotifications("all").length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No tienes notificaciones</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredNotifications("all").map((notification) => (
                        <NotificationCard key={notification.id} notification={notification} />
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Filtros por tipo */}
              {["like", "comment", "follow", "achievement", "event"].map((type) => (
                <TabsContent key={type} value={type} className="h-full m-0 p-0">
                  <div className="h-[calc(100vh-16rem)] overflow-y-auto px-6 py-4">
                    <div className="space-y-3 pb-4">
                      {filteredNotifications(type).length === 0 ? (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No tienes notificaciones de este tipo</p>
                          </CardContent>
                        </Card>
                      ) : (
                        filteredNotifications(type).map((notification) => (
                          <NotificationCard key={notification.id} notification={notification} />
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}

              {/* Configuración */}
              <TabsContent value="settings" className="h-full m-0 p-0">
                <div className="h-[calc(100vh-16rem)] overflow-y-auto px-6 py-4">
                  <div className="pb-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl text-foreground">Configuración de Notificaciones</CardTitle>
                        <CardDescription>Personaliza qué notificaciones quieres recibir y cómo</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg text-foreground">Métodos de entrega</h3>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="email-notifications" className="text-base text-foreground">
                                Notificaciones por email
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Recibe un resumen diario por correo electrónico
                              </p>
                            </div>
                            <Switch
                              id="email-notifications"
                              checked={settings.emailNotifications}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({ ...prev, emailNotifications: checked }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="push-notifications" className="text-base text-foreground">
                                Notificaciones push
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Recibe notificaciones instantáneas en tu dispositivo
                              </p>
                            </div>
                            <Switch
                              id="push-notifications"
                              checked={settings.pushNotifications}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({ ...prev, pushNotifications: checked }))
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg text-foreground">Tipos de notificaciones</h3>

                          {(user?.role === "client"
                            ? [
                                {
                                  key: "likes",
                                  label: "Nuevos trabajos de favoritos",
                                  desc: "Cuando tus artistas favoritos publican nuevo contenido",
                                },
                                {
                                  key: "comments",
                                  label: "Mensajes y respuestas",
                                  desc: "Nuevos mensajes de artistas y respuestas a consultas",
                                },
                                {
                                  key: "follows",
                                  label: "Propuestas recibidas",
                                  desc: "Cuando recibes nuevas propuestas para tus proyectos",
                                },
                                {
                                  key: "achievements",
                                  label: "Proyectos completados",
                                  desc: "Notificaciones sobre el progreso y finalización de proyectos",
                                },
                                {
                                  key: "events",
                                  label: "Recordatorios",
                                  desc: "Recordatorios de pagos, entregas y fechas importantes",
                                },
                              ]
                            : [
                                {
                                  key: "likes",
                                  label: "Likes en mis obras",
                                  desc: "Cuando alguien da like a tus creaciones",
                                },
                                {
                                  key: "comments",
                                  label: "Comentarios",
                                  desc: "Nuevos comentarios en tus obras o respuestas",
                                },
                                {
                                  key: "follows",
                                  label: "Nuevos seguidores",
                                  desc: "Cuando alguien comienza a seguirte",
                                },
                                {
                                  key: "achievements",
                                  label: "Logros",
                                  desc: "Cuando alcanzas nuevos hitos o logros",
                                },
                                {
                                  key: "events",
                                  label: "Eventos",
                                  desc: "Recordatorios de exposiciones y eventos",
                                },
                              ]
                          ).map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor={item.key} className="text-base text-foreground">
                                  {item.label}
                                </Label>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                              </div>
                              <Switch
                                id={item.key}
                                checked={settings[item.key as keyof typeof settings] as boolean}
                                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, [item.key]: checked }))}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-border">
                          <Button className="w-full">Guardar configuración</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ProfileLayout>
  )
}
