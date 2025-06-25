import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { chatService } from '@/lib/services/chat'
import { format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'

interface ChatUserItemProps {
  user: {
    id: string
    name: string
    photoURL?: string
  }
  onClick: () => void
  isSelected?: boolean
  lastMessage?: {
    content: string
    timestamp: any
    type?: 'text' | 'image' | 'audio'
  }
}

export function ChatUserItem({ user, onClick, isSelected, lastMessage }: ChatUserItemProps) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const unsubscribe = chatService.subscribeToUserStatus(user.id, (status) => {
      setIsOnline(status?.isOnline || false)
    })

    return () => unsubscribe()
  }, [user.id])

  // Formatear el último mensaje según su tipo
  const getLastMessageContent = () => {
    if (!lastMessage) return null
    
    switch (lastMessage.type) {
      case 'image':
        return '📷 Imagen';
      case 'audio':
        return '🎤 Audio';
      default:
        return lastMessage.content.length > 30 
          ? `${lastMessage.content.substring(0, 27)}...` 
          : lastMessage.content;
    }
  }

  // Formatear la fecha del último mensaje
  const formatTimestamp = () => {
    if (!lastMessage?.timestamp) return null
    
    try {
      const date = lastMessage.timestamp instanceof Date 
        ? lastMessage.timestamp 
        : lastMessage.timestamp.toDate ? lastMessage.timestamp.toDate() 
        : new Date(lastMessage.timestamp)
      
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: es })
      } else if (isYesterday(date)) {
        return 'Ayer'
      } else {
        return format(date, 'dd/MM/yy', { locale: es })
      }
    } catch (error) {
      console.error("Error formatting timestamp:", error)
      return null
    }
  }

  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-1 p-3 cursor-pointer hover:bg-accent rounded-lg transition-colors ${
        isSelected ? 'bg-accent' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium truncate">{user.name}</span>
            {lastMessage && (
              <span className="text-xs text-muted-foreground">
                {formatTimestamp()}
              </span>
            )}
          </div>
          {lastMessage && (
            <p className="text-xs text-muted-foreground truncate">
              {getLastMessageContent()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 