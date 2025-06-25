import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { ChatUserItem } from './chat-user-item'
import { ScrollArea } from '../ui/scroll-area'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, getDocs, limit } from 'firebase/firestore'
import { ChatRoom } from '@/lib/types/chat'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight, Users, MessageSquare, Search, Loader2 } from 'lucide-react'
import { chatService } from '@/lib/services/chat'
import { Input } from '../ui/input'

interface ChatSidebarProps {
  onSelectChat: (chatId: string, userId: string) => void
  selectedChatId?: string
  isMobile?: boolean
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

// Definir estructura para participantes del chat
interface ChatParticipant {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
}

export function ChatSidebar({ 
  onSelectChat, 
  selectedChatId, 
  isMobile, 
  isSidebarCollapsed = false,
  onToggleSidebar 
}: ChatSidebarProps) {
  const { user } = useAuth()
  const [chats, setChats] = useState<Array<{ id: string; user: any; lastMessage?: any }>>([])
  const [availableUsers, setAvailableUsers] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)
  const [showingUsers, setShowingUsers] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(isSidebarCollapsed)

  // Sincronizar con props de colapso
  useEffect(() => {
    setIsCollapsed(isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // Cargar chats existentes - optimizado para cargar más rápido
  useEffect(() => {
    if (!user) return

    setLoading(true)
    const chatsRef = collection(db, 'chats')
    const q = query(
      chatsRef,
      where(`participants.${user.role}.id`, '==', user.uid),
      limit(20) // Limitar a los 20 chats más recientes para mejor rendimiento
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = []
      for (const doc of snapshot.docs) {
        const chat = doc.data() as ChatRoom
        const otherRole = user.role === 'artist' ? 'client' : 'artist'
        const otherUser = chat.participants[otherRole] as ChatParticipant
        
        // Optimizar la carga de datos del usuario
        chatsData.push({
          id: doc.id,
          user: {
            id: otherUser.id,
            name: otherUser.name || otherUser.email?.split('@')[0] || 'Usuario',
            email: otherUser.email,
            photoURL: otherUser.photoURL
          },
          lastMessage: chat.lastMessage
        })
      }
      setChats(chatsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // Cargar usuarios disponibles solo cuando se necesite
  useEffect(() => {
    if (!user || user.role !== 'artist' || !showingUsers) return

    const loadAvailableUsers = async () => {
      try {
        setLoading(true)
        const usersRef = collection(db, 'users')
        const q = query(
          usersRef, 
          where('role', '==', 'client'),
          limit(25) // Limitar a 25 usuarios para mejor rendimiento
        )
        const snapshot = await getDocs(q)
        
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name || doc.data().email?.split('@')[0] || 'Usuario'
        }))
        
        setAvailableUsers(users)
        setLoading(false)
      } catch (error) {
        console.error("Error loading users:", error)
        setLoading(false)
      }
    }

    loadAvailableUsers()
  }, [user, showingUsers])

  // Iniciar o continuar una conversación
  const handleNewChat = async (otherUser: any) => {
    if (!user) return
    
    try {
      const chatId = await chatService.getOrCreateChatRoom(
        user.role === 'artist' ? otherUser.id : user.uid,
        user.role === 'artist' ? otherUser.email : user.email || '',
        user.role === 'artist' ? user.uid : otherUser.id,
        user.role === 'artist' ? user.email || '' : otherUser.email
      )
      onSelectChat(chatId, otherUser.id)
      setShowingUsers(false)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  // Filtrar chats/usuarios según el término de búsqueda
  const filteredChats = searchTerm 
    ? chats.filter(chat => 
        chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chats

  const filteredUsers = searchTerm
    ? availableUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableUsers

  const toggleCollapse = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  // Si está colapsado en modo desktop, mostrar solo el botón para expandir
  if (isCollapsed && !isMobile) {
    return (
      <div className="h-full w-10 border-r flex flex-col items-center py-4 bg-card/60">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="h-8 w-8 rounded-full"
          title="Expandir panel"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">
          {showingUsers ? 'Usuarios disponibles' : 'Chats'}
        </h2>
        <div className="flex items-center space-x-1">
          {user?.role === 'artist' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowingUsers(!showingUsers)}
              className="h-8 w-8"
              title={showingUsers ? "Ver chats" : "Buscar usuarios"}
            >
              {showingUsers ? <MessageSquare className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            </Button>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-8 w-8"
              title="Colapsar panel"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={showingUsers ? "Buscar usuarios..." : "Buscar chats..."}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : showingUsers ? (
          <div className="p-2 space-y-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((availableUser) => (
                <ChatUserItem
                  key={availableUser.id}
                  user={availableUser}
                  onClick={() => handleNewChat(availableUser)}
                />
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-4 text-center">
                {searchTerm ? "No se encontraron resultados" : "No hay usuarios disponibles"}
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <ChatUserItem
                  key={chat.id}
                  user={chat.user}
                  onClick={() => onSelectChat(chat.id, chat.user.id)}
                  isSelected={chat.id === selectedChatId}
                  lastMessage={chat.lastMessage}
                />
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-4 text-center">
                {searchTerm ? "No se encontraron resultados" : "No hay chats disponibles"}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Indicador de carga optimizada */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Cargando chats...</p>
          </div>
        </div>
      )}
    </div>
  )
} 