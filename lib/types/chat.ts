import { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string
  content: string
  type: 'text' | 'image' | 'audio'
  senderId: string
  senderEmail: string
  senderRole: 'client' | 'artist'
  receiverId: string
  timestamp: Date
  isStarred: boolean
  mediaUrl?: string
  replyTo?: {
    id: string
    content: string
    senderName: string
  }
  deleted?: {
    by: string[]
    at: Date
  }
  chatId?: string
}

export interface ChatRoom {
  id: string
  participants: {
    client: {
      id: string
      email: string
    }
    artist: {
      id: string
      email: string
    }
  }
  lastMessage?: {
    content: string
    timestamp: Date
    type: 'text' | 'image' | 'audio'
  }
  createdAt: Date
  updatedAt: Date
}

export interface UserStatus {
  isOnline: boolean
  lastSeen?: Date
} 