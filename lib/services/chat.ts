import { db, storage } from '@/lib/firebase'
import { collection, query, where, orderBy, addDoc, updateDoc, doc, getDoc, getDocs, serverTimestamp, onSnapshot, setDoc, writeBatch, Timestamp, limit } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import type { ChatMessage, ChatRoom, UserStatus } from '@/lib/types'

class ChatServiceImpl {
  private readonly chatsCollection = collection(db, 'chats');

  async getOrCreateChatRoom(
    clientId: string, 
    clientEmail: string, 
    artistId: string, 
    artistEmail: string
  ): Promise<string> {
    try {
      const artistDoc = await getDoc(doc(db, 'users', artistId));
      if (!artistDoc.exists() || artistDoc.data()?.role !== 'artist') {
        throw new Error('Usuario no es un artista válido');
      }

      const q = query(
        this.chatsCollection,
        where('participants.client.id', '==', clientId),
        where('participants.artist.id', '==', artistId)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }

      const timestamp = serverTimestamp();
      const newChatRoom = {
        participants: {
          client: { id: clientId, email: clientEmail },
          artist: { id: artistId, email: artistEmail }
        },
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const docRef = await addDoc(this.chatsCollection, newChatRoom);
      return docRef.id;
    } catch (error) {
      console.error('Error in getOrCreateChatRoom:', error);
      throw error;
    }
  }

  async sendMessage(
    chatId: string,
    content: string,
    senderId: string,
    senderEmail: string,
    senderRole: 'client' | 'artist',
    receiverId: string,
    type: 'text' | 'image' | 'audio' = 'text',
    replyTo?: { id: string, content: string, senderName: string } | null
  ): Promise<void> {
    try {
      if (!chatId || !content || !senderId || !receiverId) {
        throw new Error('Faltan parámetros requeridos para enviar el mensaje');
      }

      const messagesRef = collection(this.chatsCollection, chatId, 'messages');
      const chatRef = doc(this.chatsCollection, chatId);
      const timestamp = serverTimestamp();

      // Crear objeto base del mensaje
      const newMessage: any = {
        content,
        type,
        senderId,
        senderEmail,
        senderRole,
        receiverId,
        timestamp,
        isStarred: false,
        deleted: {
          by: [],
          at: timestamp
        }
      };

      // Solo agregar replyTo si existe y no es null o undefined
      if (replyTo && replyTo.id && replyTo.content && replyTo.senderName) {
        newMessage.replyTo = {
          id: replyTo.id,
          content: replyTo.content,
          senderName: replyTo.senderName
        };
      }

      // Intentar añadir el mensaje con reintentos
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          const docRef = await addDoc(messagesRef, newMessage);
          
          // Solo actualizar lastMessage si se añadió el mensaje correctamente
          await updateDoc(chatRef, {
            lastMessage: {
              content,
              timestamp,
              type
            },
            updatedAt: timestamp
          });
          
          return; // Éxito, salir del método
        } catch (err) {
          retries++;
          if (retries >= maxRetries) {
            throw err; // Reenviar el error si se agotan los reintentos
          }
          
          // Esperar antes de reintentar (espera exponencial)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  async sendImageMessage(
    chatId: string,
    file: File | Blob,
    senderId: string,
    senderEmail: string,
    senderRole: 'client' | 'artist',
    receiverId: string
  ): Promise<void> {
    try {
      const imageRef = ref(storage, `chats/${chatId}/images/${uuidv4()}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      await this.sendMessage(
        chatId,
        downloadURL,
        senderId,
        senderEmail,
        senderRole,
        receiverId,
        'image'
      );
    } catch (error) {
      console.error('Error al enviar imagen:', error);
      throw error;
    }
  }

  async sendAudioMessage(
    chatId: string,
    audioBlob: Blob,
    senderId: string,
    senderEmail: string,
    senderRole: 'client' | 'artist',
    receiverId: string
  ): Promise<void> {
    try {
      const audioRef = ref(storage, `chats/${chatId}/audio/${uuidv4()}.webm`);
      await uploadBytes(audioRef, audioBlob);
      const downloadURL = await getDownloadURL(audioRef);

      await this.sendMessage(
        chatId,
        downloadURL,
        senderId,
        senderEmail,
        senderRole,
        receiverId,
        'audio'
      );
    } catch (error) {
      console.error('Error al enviar audio:', error);
      throw error;
    }
  }

  async getMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const q = query(
        this.chatsCollection,
        where('participants.client.id', '==', chatId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
    const messagesRef = collection(this.chatsCollection, chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));

    return onSnapshot(q, snapshot => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
          deleted: data.deleted ? {
            by: data.deleted.by || [],
            at: (data.deleted.at as Timestamp)?.toDate() || new Date()
          } : {
            by: [],
            at: new Date()
          }
        } as ChatMessage;
      });
      callback(messages);
    });
  }

  async starMessage(chatId: string, messageId: string): Promise<void> {
    try {
      const messageRef = doc(this.chatsCollection, chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        isStarred: true
      });
    } catch (error) {
      console.error('Error al marcar mensaje como destacado:', error);
      throw error;
    }
  }

  async getStarredMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const messagesRef = collection(this.chatsCollection, chatId, 'messages');
      const q = query(messagesRef, where('isStarred', '==', true));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date()
      })) as ChatMessage[];
    } catch (error) {
      console.error('Error al obtener mensajes destacados:', error);
      throw error;
    }
  }

  async searchMessages(chatId: string, searchTerm: string): Promise<ChatMessage[]> {
    try {
      if (!searchTerm.trim()) {
        return [];
      }

      const messagesRef = collection(this.chatsCollection, chatId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(100));
      const querySnapshot = await getDocs(messagesQuery);
      
      const searchTermLower = searchTerm.toLowerCase();
      
      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp)?.toDate() || new Date()
          } as ChatMessage;
        })
        .filter(message => {
          if (message.deleted && message.deleted.by && message.deleted.by.length > 0) {
            return false;
          }
          
          return message.content && message.content.toLowerCase().includes(searchTermLower);
        });
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  async deleteMessages(chatId: string, userId: string): Promise<void> {
    try {
      const messagesRef = collection(this.chatsCollection, chatId, 'messages');
      const q = query(messagesRef);
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      
      // Marcar cada mensaje como borrado por este usuario
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const deletedBy = data.deleted?.by || [];
        
        // Asegurarse de que no esté ya marcado como borrado por este usuario
        if (!deletedBy.includes(userId)) {
          const newDeletedBy = [...deletedBy, userId];
          
          batch.update(doc.ref, { 
            deleted: {
              by: newDeletedBy,
              at: serverTimestamp()
            }
          });
        }
      });
      
      await batch.commit();
      
      // Actualizar la última entrada en la colección de chats
      const chatRef = doc(this.chatsCollection, chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          content: "Chat borrado",
          timestamp: serverTimestamp(),
          type: "text"
        },
        updatedAt: serverTimestamp()
      });
      
    } catch (error) {
      console.error('Error deleting messages:', error);
      throw error;
    }
  }

  async getUserOnlineStatus(userId: string): Promise<UserStatus> {
    try {
      const userStatusRef = doc(db, 'userStatus', userId);
      const statusDoc = await getDoc(userStatusRef);
      
      if (!statusDoc.exists()) {
        return { isOnline: false };
      }

      const data = statusDoc.data();
      return {
        isOnline: data?.isOnline || false,
        lastSeen: data?.lastSeen?.toDate()
      };
    } catch (error) {
      console.error('Error getting user status:', error);
      throw error;
    }
  }

  subscribeToUserStatus(userId: string, callback: (status: UserStatus) => void) {
    const userStatusRef = doc(db, 'userStatus', userId);
    
    return onSnapshot(userStatusRef, doc => {
      const data = doc.data();
      callback({
        isOnline: data?.isOnline || false,
        lastSeen: data?.lastSeen?.toDate()
      });
    });
  }

  async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      const userStatusRef = doc(db, 'userStatus', userId);
      await setDoc(userStatusRef, {
        isOnline,
        lastSeen: isOnline ? null : serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async toggleStarMessage(chatId: string, messageId: string): Promise<void> {
    try {
      const messageRef = doc(this.chatsCollection, chatId, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) {
        throw new Error('Mensaje no encontrado');
      }

      const currentStarred = messageDoc.data()?.isStarred || false;
      await updateDoc(messageRef, {
        isStarred: !currentStarred
      });
    } catch (error) {
      console.error('Error toggling star message:', error);
      throw error;
    }
  }

  async getUserInfo(userId: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      return null;
    }
  }
}

export const chatService = new ChatServiceImpl(); 