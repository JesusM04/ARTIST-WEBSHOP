"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useAuth } from "@/lib/AuthContext"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search, Star, Image as ImageIcon, Mic, Trash2, StarOff, Loader2, MessageSquare, X, Reply } from "lucide-react"
import { chatService } from "@/lib/services/chat"
import { ChatMessage } from "@/lib/types"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { OnlineStatus } from "@/components/ui/online-status"
import { useAutoScroll } from "@/hooks/useAutoScroll"
import ChatMessageItem from '@/components/chat/ChatMessageItem'

const formatMessageTimestamp = (timestamp: any) => {
  if (!timestamp) return ""
  
  try {
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate ? timestamp.toDate() 
      : new Date(timestamp)
    
    return format(date, "HH:mm", { locale: es })
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return ""
  }
}

// Función mejorada para ordenar los mensajes por fecha
const sortMessages = (messages: ChatMessage[]) => {
  return [...messages].sort((a, b) => {
    const dateA = a.timestamp instanceof Date 
      ? a.timestamp
      : (a.timestamp as any)?.toDate ? (a.timestamp as any).toDate()
      : new Date(a.timestamp);

    const dateB = b.timestamp instanceof Date 
      ? b.timestamp 
      : (b.timestamp as any)?.toDate ? (b.timestamp as any).toDate()
      : new Date(b.timestamp);

    // Orden cronológico: los más antiguos primero
    return dateA.getTime() - dateB.getTime();
  });
};

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatId, setChatId] = useState<string>("")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedUserData, setSelectedUserData] = useState<{ name: string, photoURL?: string } | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showStarred, setShowStarred] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(true)
  const [replyingTo, setReplyingTo] = useState<{ id: string, content: string, senderName: string } | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const audioChunks = useRef<Blob[]>([])
  const { scrollRef, scrollToBottom, isNearBottom } = useAutoScroll()
  const fileInputRefMobile = useRef<HTMLInputElement>(null)
  const fileInputRefDesktop = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

  // Carga optimizada y prevención de pantalla negra
  useEffect(() => {
    // Establecer el color de fondo desde el principio para evitar flash negro
    document.documentElement.style.backgroundColor = "var(--background)";
    document.documentElement.classList.add('no-flash');
    document.body.classList.add('loaded');
    
    // Asegurar que la página se carga con el fondo correcto
    setPageLoaded(true);
    
    return () => {
      document.documentElement.classList.remove('no-flash');
      document.body.classList.remove('loaded');
    }
  }, [])

  // Scroll automático cuando llegan nuevos mensajes
  useEffect(() => {
    if (messages.length > 0 && isNearBottom) {
      scrollToBottom()
    }
  }, [messages, isNearBottom, scrollToBottom])

  // Seleccionar un chat y cargar sus mensajes
  const handleSelectChat = async (newChatId: string, userId: string) => {
    try {
      setIsLoading(true)
      setChatId(newChatId)
      setSelectedUserId(userId)
      setShowStarred(false)
      setSearchTerm("")
      setMessages([])
      setSelectedUserData(null)
      setReplyingTo(null)
      setIsMobileSearchOpen(false)

      // Obtener información del usuario seleccionado
      const userDoc = await chatService.getUserInfo(userId)
      if (userDoc) {
        setSelectedUserData({
          name: userDoc.name || userDoc.email?.split('@')[0] || 'Usuario',
          photoURL: userDoc.photoURL
        })
      }

      const unsubscribe = chatService.subscribeToMessages(newChatId, (newMessages) => {
        setMessages(
          sortMessages(newMessages.filter((msg) => !msg.deleted?.by?.includes(user?.uid || "")))
        )
        setIsLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Error al seleccionar chat:", error)
      setIsLoading(false)
      toast.error("Error al cargar el chat")
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !user || !chatId || !selectedUserId) return

    const tempInput = messageInput
    setMessageInput("")

    try {
      // Si estamos respondiendo a un mensaje
      if (replyingTo && replyingTo.id && replyingTo.content && replyingTo.senderName) {
        await chatService.sendMessage(
          chatId,
          tempInput,
          user.uid,
          user.email || "",
          user.role as 'client' | 'artist',
          selectedUserId,
          'text',
          {
            id: replyingTo.id,
            content: replyingTo.content,
            senderName: replyingTo.senderName
          }
        )
        setReplyingTo(null)
      } else {
        // Enviar mensaje normal sin respuesta
        await chatService.sendMessage(
          chatId,
          tempInput,
          user.uid,
          user.email || "",
          user.role as 'client' | 'artist',
          selectedUserId,
          'text'
        )
      }
      scrollToBottom()
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      toast.error("Error al enviar el mensaje. Inténtalo de nuevo.")
      setMessageInput(tempInput) // Restaurar el mensaje si hay error
      
      // Verificar la conexión a Firebase y reintentar
      setTimeout(async () => {
        try {
          if (navigator.onLine) {
            // Si estamos online, intentar reconectar
            toast.info("Intentando reconectar...");
            // Reintentar envío después de 2 segundos
            if (replyingTo && replyingTo.id && replyingTo.content && replyingTo.senderName) {
              await chatService.sendMessage(
                chatId,
                tempInput,
                user.uid,
                user.email || "",
                user.role as 'client' | 'artist',
                selectedUserId,
                'text',
                {
                  id: replyingTo.id,
                  content: replyingTo.content,
                  senderName: replyingTo.senderName
                }
              )
              setReplyingTo(null)
            } else {
              await chatService.sendMessage(
                chatId,
                tempInput,
                user.uid,
                user.email || "",
                user.role as 'client' | 'artist',
                selectedUserId,
                'text'
              )
            }
            toast.success("Mensaje enviado correctamente");
            setMessageInput("");
            scrollToBottom();
          } else {
            toast.error("No hay conexión a internet. Guarda tu mensaje e intenta más tarde.");
          }
        } catch (retryError) {
          console.error("Error al reintentar:", retryError);
        }
      }, 2000);
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !chatId || !selectedUserId) return

    try {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecciona una imagen válida')
        return
      }

      const compressedFile = await compressImage(file)
      
      setIsUploading(true)
      await chatService.sendImageMessage(
        chatId,
        compressedFile,
        user.uid,
        user.email || "",
        'client',
        selectedUserId
      )
      
      // Limpiar referencias de archivos
      if (fileInputRefMobile.current) {
        fileInputRefMobile.current.value = ''
      }
      if (fileInputRefDesktop.current) {
        fileInputRefDesktop.current.value = ''
      }
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast.error(error.message || "Error al enviar la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('No se pudo crear el contexto 2D'))
            return
          }

          let width = img.width
          let height = img.height
          const maxSize = 1024

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Error al comprimir la imagen'))
              }
            },
            'image/jpeg',
            0.8
          )
        }
      }
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      audioChunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        try {
          if (!user || !chatId || !selectedUserId) return

          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm;codecs=opus' })
          
          if (audioChunks.current.length < 2) {
            toast.error("La grabación es demasiado corta")
            return
          }
          
          setIsUploading(true)
          await chatService.sendAudioMessage(
            chatId,
            audioBlob,
            user.uid,
            user.email || "",
            'client',
            selectedUserId
          )
        } catch (error: any) {
          console.error("Error sending audio:", error)
          toast.error(error.message || "Error al enviar el audio")
        } finally {
          setIsUploading(false)
          stream.getTracks().forEach(track => track.stop())
        }
      }

      recorder.start(100)
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error: any) {
      console.error("Error starting recording:", error)
      toast.error(error.message || "Error al iniciar la grabación")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  // Búsqueda de mensajes en la conversación
  const handleSearch = async () => {
    if (!chatId || !searchTerm.trim()) {
      return
    }
    
    setIsSearching(true)
    try {
      const results = await chatService.searchMessages(chatId, searchTerm)
      // Filtrar mensajes borrados y ordenarlos
      const filteredResults = sortMessages(
        results.filter((msg) => !msg.deleted?.by?.includes(user?.uid || ""))
      )
      setSearchResults(filteredResults)
      setMessages(filteredResults)
    } catch (error) {
      console.error("Error searching messages:", error)
      toast.error("Error al buscar mensajes")
    } finally {
      setIsSearching(false)
    }
  }

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    if (chatId) {
      if (searchTerm.trim()) {
        const delaySearch = setTimeout(() => {
          handleSearch()
        }, 500)
        return () => clearTimeout(delaySearch)
      } else if (!showStarred) {
        // Restaurar mensajes normales
        chatService.subscribeToMessages(chatId, (newMessages) => {
          setMessages(
            sortMessages(newMessages.filter((msg) => !msg.deleted?.by?.includes(user?.uid || "")))
          )
        })
      }
    }
  }, [searchTerm, chatId, showStarred])

  const handleStarredMessages = async () => {
    if (!chatId) return
    
    try {
      if (!showStarred) {
        const starredMessages = await chatService.getStarredMessages(chatId)
        setMessages(starredMessages)
      } else {
        const unsubscribe = chatService.subscribeToMessages(chatId, (newMessages) => {
          setMessages(newMessages.filter(msg => !msg.deleted?.by.includes(user?.uid || "")))
        })
        return () => unsubscribe()
      }
      setShowStarred(!showStarred)
    } catch (error) {
      console.error("Error fetching starred messages:", error)
      toast.error("Error al obtener mensajes destacados")
    }
  }

  const handleToggleStar = async (messageId: string, isStarred: boolean) => {
    if (!chatId) return

    try {
      await chatService.toggleStarMessage(chatId, messageId)
    } catch (error) {
      console.error("Error toggling star:", error)
      toast.error("Error al destacar el mensaje")
    }
  }

  const handleDeleteChat = async () => {
    if (!chatId || !user) return

    try {
      setIsLoading(true)
      await chatService.deleteMessages(chatId, user.uid)
      
      // Recargar mensajes después de borrar para actualizar la UI correctamente
      const unsubscribe = chatService.subscribeToMessages(chatId, (newMessages) => {
        setMessages(
          sortMessages(newMessages.filter((msg) => !msg.deleted?.by?.includes(user.uid || "")))
        )
        setIsLoading(false)
      })
      
      toast.success("Chat eliminado correctamente")
      
      // Limpiar el historial visual inmediatamente
      setMessages([])
      
      return () => unsubscribe()
    } catch (error) {
      console.error("Error deleting chat:", error)
      toast.error("Error al eliminar el chat")
      setIsLoading(false)
    }
  }

  // Función para responder a un mensaje
  const handleReplyToMessage = (message: ChatMessage) => {
    setReplyingTo({
      id: message.id,
      content: message.content,
      senderName: message.senderEmail.split('@')[0]
    })
    inputRef.current?.focus()
  }

  // Cancelar la respuesta a un mensaje
  const cancelReply = () => {
    setReplyingTo(null)
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen) {
      setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 100);
    }
  }

  const handleMobileSearch = () => {
    if (searchTerm.trim() && chatId) {
      handleSearch();
    }
  }

  return (
    <ProfileLayout role={user?.role as "client" | "artist"}>
      <div className="h-[calc(100vh-5rem)] w-full">
        <Card className="h-full flex overflow-hidden">
          {/* Sidebar de chats - responsive */}
          <div className={`border-r h-full ${isSidebarCollapsed ? 'w-10' : 'min-w-[220px] max-w-[280px]'} flex-shrink-0 md:flex hidden transition-all duration-300`}>
            <ChatSidebar 
              onSelectChat={handleSelectChat} 
              selectedChatId={chatId} 
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            />
          </div>
          
          {/* Versión móvil del sidebar - se muestra solo en dispositivos pequeños */}
          <div className="md:hidden w-full flex-shrink-0 h-full">
            {!chatId ? (
              <ChatSidebar onSelectChat={handleSelectChat} selectedChatId={chatId} isMobile={true} />
            ) : (
              <div className="flex-1 flex flex-col h-full">
                {/* Cabecera del chat con botón para volver y búsqueda en móvil */}
                <div className="p-3 border-b flex items-center justify-between bg-card">
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setChatId("")}
                      className="mr-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
                    </Button>
                    <Avatar>
                      <AvatarImage src={selectedUserData?.photoURL || "/avatars/default.png"} />
                      <AvatarFallback>
                        {selectedUserData?.name?.[0].toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedUserData?.name || 'Usuario'}</p>
                      {selectedUserId && (
                        <OnlineStatus userId={selectedUserId} />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMobileSearch}
                      className={isMobileSearchOpen ? "text-primary" : ""}
                      title="Buscar mensajes"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleStarredMessages}
                      className={showStarred ? "text-yellow-500" : ""}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeleteChat}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Barra de búsqueda móvil */}
                {isMobileSearchOpen && (
                  <div className="p-2 border-b flex items-center space-x-2 bg-card/80 animate-accordion-down">
                    <Input
                      ref={mobileSearchInputRef}
                      placeholder="Buscar mensajes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleMobileSearch}
                      disabled={!searchTerm.trim()}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setSearchTerm("");
                        setIsMobileSearchOpen(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Área de mensajes */}
                <div className="flex-1 relative overflow-hidden" ref={scrollRef}>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full bg-background">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="chat-loading-spinner"></div>
                        <p className="text-muted-foreground">Cargando conversación...</p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4">
                        {searchTerm && messages.length === 0 && !isSearching ? (
                          <div className="text-center py-6 text-muted-foreground">
                            No se encontraron mensajes con "{searchTerm}"
                          </div>
                        ) : messages.length === 0 && !isSearching ? (
                          <div className="text-center py-6 text-muted-foreground">
                            No hay mensajes. Comienza la conversación ahora.
                          </div>
                        ) : (
                          messages.map((message) => (
                            <ChatMessageItem
                              key={message.id}
                              message={message}
                              currentUserId={user?.uid || ''}
                              searchTerm={searchTerm}
                              onToggleStar={handleToggleStar}
                              onReply={handleReplyToMessage}
                            />
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  )}
                  {!isNearBottom && messages.length > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-4 right-4 opacity-75 hover:opacity-100"
                      onClick={scrollToBottom}
                    >
                      Nuevos mensajes ↓
                    </Button>
                  )}
                </div>

                {/* Área de entrada de texto con respuesta */}
                <div className="px-3 py-2 border-t bg-card mt-auto">
                  {replyingTo && (
                    <div className="flex items-center justify-between bg-accent/40 p-2 rounded-lg mb-2 text-sm border border-primary/20 animate-pulse-slow">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-xs flex items-center gap-1">
                          <Reply className="h-3 w-3" />
                          Respondiendo a {replyingTo.senderName}
                        </span>
                        <p className="truncate text-xs text-muted-foreground">{replyingTo.content}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 rounded-full flex-shrink-0"
                        onClick={cancelReply}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload-mobile"
                      ref={fileInputRefMobile}
                      onChange={handleImageUpload}
                      disabled={isUploading || isRecording}
                    />
                    <div className="flex items-center space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRefMobile.current?.click()}
                        disabled={isUploading || isRecording}
                        className="hover:bg-accent"
                        title="Enviar imagen"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`hover:bg-accent ${isRecording ? "text-red-500" : ""}`}
                        disabled={isUploading}
                        title={isRecording ? "Detener grabación" : "Grabar audio"}
                      >
                        {isRecording ? (
                          <span className="animate-pulse">●</span>
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Input
                      ref={inputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={isRecording ? "Grabando audio..." : replyingTo ? `Respuesta a ${replyingTo.senderName}...` : "Escribe un mensaje..."}
                      className="flex-1"
                      disabled={isRecording || isUploading}
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={isRecording || isUploading || (!messageInput.trim() && !isRecording)}
                      className="hover:bg-accent"
                      title="Enviar mensaje"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Contenido del chat - versión desktop */}
          <div className="hidden md:flex flex-1 flex-col h-full">
            {chatId ? (
              <>
                {/* Cabecera del chat */}
                <div className="p-3 border-b flex items-center justify-between bg-card">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedUserData?.photoURL || "/avatars/default.png"} />
                      <AvatarFallback>
                        {selectedUserData?.name?.[0].toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedUserData?.name || 'Usuario'}</p>
                      {selectedUserId && (
                        <OnlineStatus userId={selectedUserId} />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleStarredMessages}
                      className={showStarred ? "text-yellow-500" : ""}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <div className="relative hidden md:block">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar mensajes..."
                        className="pl-9 w-40 md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeleteChat}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Área de mensajes */}
                <div className="flex-1 relative overflow-hidden" ref={scrollRef}>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full bg-background">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="chat-loading-spinner"></div>
                        <p className="text-muted-foreground">Cargando conversación...</p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4">
                        {searchTerm && messages.length === 0 && !isSearching ? (
                          <div className="text-center py-6 text-muted-foreground">
                            No se encontraron mensajes con "{searchTerm}"
                          </div>
                        ) : messages.length === 0 && !isSearching ? (
                          <div className="text-center py-6 text-muted-foreground">
                            No hay mensajes. Comienza la conversación ahora.
                          </div>
                        ) : (
                          messages.map((message) => (
                            <ChatMessageItem
                              key={message.id}
                              message={message}
                              currentUserId={user?.uid || ''}
                              searchTerm={searchTerm}
                              onToggleStar={handleToggleStar}
                              onReply={handleReplyToMessage}
                            />
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  )}
                  {!isNearBottom && messages.length > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-4 right-4 opacity-75 hover:opacity-100"
                      onClick={scrollToBottom}
                    >
                      Nuevos mensajes ↓
                    </Button>
                  )}
                </div>

                {/* Área de entrada de texto con respuesta - desktop */}
                <div className="px-3 py-2 border-t bg-card mt-auto">
                  {replyingTo && (
                    <div className="flex items-center justify-between bg-accent/40 p-2 rounded-lg mb-2 text-sm border border-primary/20 animate-pulse-slow">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-xs flex items-center gap-1">
                          <Reply className="h-3 w-3" />
                          Respondiendo a {replyingTo.senderName}
                        </span>
                        <p className="truncate text-xs text-muted-foreground">{replyingTo.content}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 rounded-full flex-shrink-0"
                        onClick={cancelReply}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload-desktop"
                      ref={fileInputRefDesktop}
                      onChange={handleImageUpload}
                      disabled={isUploading || isRecording}
                    />
                    <div className="flex items-center space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRefDesktop.current?.click()}
                        disabled={isUploading || isRecording}
                        className="hover:bg-accent"
                        title="Enviar imagen"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`hover:bg-accent ${isRecording ? "text-red-500" : ""}`}
                        disabled={isUploading}
                        title={isRecording ? "Detener grabación" : "Grabar audio"}
                      >
                        {isRecording ? (
                          <span className="animate-pulse">●</span>
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Input
                      ref={inputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={isRecording ? "Grabando audio..." : replyingTo ? `Respuesta a ${replyingTo.senderName}...` : "Escribe un mensaje..."}
                      className="flex-1"
                      disabled={isRecording || isUploading}
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={isRecording || isUploading || (!messageInput.trim() && !isRecording)}
                      className="hover:bg-accent"
                      title="Enviar mensaje"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-card/30">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">
                    Selecciona un chat para comenzar
                  </p>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <MessageSquare className="h-8 w-8 text-primary/50" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ProfileLayout>
  )
} 