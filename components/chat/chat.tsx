import { useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { chatService } from '@/lib/services/chat'

export default function Chat() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Actualizar estado cuando el componente se monta
    chatService.updateUserStatus(user.uid, true)

    // Actualizar estado cuando el componente se desmonta
    return () => {
      chatService.updateUserStatus(user.uid, false)
    }
  }, [user])

  // ... existing code ...
} 