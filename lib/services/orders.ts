import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  arrayUnion
} from 'firebase/firestore';

export interface Order {
  id?: string;
  clientId: string;
  artistId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  price: number;
  createdAt: any;
  completedAt?: any;
  attachments?: string[];
  comments?: string[];
}

export const ordersService = {
  // Crear un nuevo pedido
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) {
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Obtener pedidos de un cliente
  async getClientOrders(clientId: string) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error('Error getting client orders:', error);
      throw error;
    }
  },

  // Obtener pedidos de un artista
  async getArtistOrders(artistId: string) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('artistId', '==', artistId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error('Error getting artist orders:', error);
      throw error;
    }
  },

  // Actualizar el estado de un pedido
  async updateOrderStatus(orderId: string, status: Order['status']) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        ...(status === 'completed' ? { completedAt: serverTimestamp() } : {})
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Añadir un comentario a un pedido
  async addComment(orderId: string, comment: string) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        comments: arrayUnion(comment)
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Añadir un archivo adjunto a un pedido
  async addAttachment(orderId: string, attachmentUrl: string) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        attachments: arrayUnion(attachmentUrl)
      });
    } catch (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }
  }
}; 