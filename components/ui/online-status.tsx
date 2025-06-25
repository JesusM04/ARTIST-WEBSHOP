import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { chatService } from '@/lib/services/chat'

interface OnlineStatusProps {
  userId: string
  className?: string
}

interface UserStatus {
  isOnline: boolean
  lastSeen?: Date | string
}

export function OnlineStatus({ userId, className }: OnlineStatusProps) {
  const [status, setStatus] = useState<UserStatus>({ isOnline: false })

  useEffect(() => {
    if (!userId) return

    // Obtener el estado inicial
    const getInitialStatus = async () => {
      try {
        const initialStatus = await chatService.getUserOnlineStatus(userId)
        setStatus({
          isOnline: initialStatus.isOnline,
          lastSeen: initialStatus.lastSeen
        })
      } catch (error) {
        console.error('Error getting initial status:', error)
      }
    }
    getInitialStatus()

    // Suscribirse a cambios de estado
    const unsubscribe = chatService.subscribeToUserStatus(userId, (newStatus) => {
      if (newStatus) {
        setStatus({
          isOnline: newStatus.isOnline || false,
          lastSeen: newStatus.lastSeen ? new Date(newStatus.lastSeen) : undefined
        })
      }
    })

    return () => unsubscribe()
  }, [userId])

  const getLastSeenText = () => {
    if (!status.lastSeen) return 'No disponible'
    
    const now = new Date()
    const lastSeen = typeof status.lastSeen === 'string' ? new Date(status.lastSeen) : status.lastSeen
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Hace un momento'
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Hace ${diffInHours} horas`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Ayer'
    return `Hace ${diffInDays} días`
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'w-2 h-2 rounded-full',
        status?.isOnline ? 'bg-green-500' : 'bg-gray-400'
      )} />
      <span className="text-sm text-gray-600">
        {status?.isOnline ? 'En línea' : `Última vez: ${getLastSeenText()}`}
      </span>
    </div>
  )
} 