import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Notificacion, EstadisticasCliente, EstadisticasArtista, Order } from './types';

// Funciones para usuarios
export const createUserProfile = async (profile: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', profile.email!);
  await updateDoc(userRef, profile);
};

export const getUserProfile = async (email: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', email);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return null;
  return userSnap.data() as UserProfile;
};

// Funciones para pedidos
export const createPedido = async (pedido: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  const pedidosRef = collection(db, 'orders');
  const newPedidoRef = doc(pedidosRef);
  const timestamp = serverTimestamp();
  
  await updateDoc(newPedidoRef, {
    ...pedido,
    createdAt: timestamp,
    updatedAt: timestamp
  });
  
  return newPedidoRef.id;
};

export async function getPedidosCliente(clientId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('clientId', '==', clientId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as Order[];
}

export async function getPedidosArtista(artistId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('artistId', '==', artistId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as Order[];
}

export async function updatePedido(id: string, data: Partial<Order>): Promise<void> {
  const pedidoRef = doc(db, 'orders', id);
  await updateDoc(pedidoRef, {
    ...data,
    updatedAt: new Date()
  });
}

// Funciones para notificaciones
export const createNotificacion = async (notificacion: Notificacion) => {
  const notificacionesRef = collection(db, 'notificaciones');
  await addDoc(notificacionesRef, {
    ...notificacion,
    fecha: serverTimestamp()
  });
};

export const getNotificaciones = async (userEmail: string) => {
  const q = query(
    collection(db, 'notificaciones'),
    where('userEmail', '==', userEmail),
    orderBy('fecha', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Notificacion);
};

export const markNotificacionLeida = async (notificacionId: string) => {
  const notificacionRef = doc(db, 'notificaciones', notificacionId);
  await updateDoc(notificacionRef, {
    leida: true
  });
};

// Funciones para estadísticas
export const getEstadisticasCliente = async (clientId: string): Promise<EstadisticasCliente> => {
  const pedidos = await getPedidosCliente(clientId);
  
  return {
    totalPedidos: pedidos.length,
    pedidosPendientes: pedidos.filter(p => p.status === 'pendiente').length,
    pedidosCotizados: pedidos.filter(p => p.status === 'cotizado').length,
    pedidosCompletados: pedidos.filter(p => p.status === 'completado').length
  };
};

export const getEstadisticasArtista = async (artistId: string): Promise<EstadisticasArtista> => {
  const pedidos = await getPedidosArtista(artistId);
  const clientesUnicos = new Set(pedidos.map(p => p.clientId)).size;
  
  // Calcular tiempo promedio de respuesta (en días)
  const tiemposRespuesta = pedidos
    .filter(p => p.status === 'cotizado' && p.updatedAt)
    .map(p => {
      const creacion = p.createdAt;
      const cotizacion = p.updatedAt!;
      return (cotizacion.getTime() - creacion.getTime()) / (1000 * 60 * 60 * 24);
    });
  
  const promedioTiempoRespuesta = tiemposRespuesta.length > 0
    ? tiemposRespuesta.reduce((a, b) => a + b) / tiemposRespuesta.length
    : 0;
  
  return {
    totalPedidos: pedidos.length,
    pedidosPendientes: pedidos.filter(p => p.status === 'pendiente').length,
    pedidosCotizados: pedidos.filter(p => p.status === 'cotizado').length,
    pedidosCompletados: pedidos.filter(p => p.status === 'completado').length,
    clientesUnicos,
    promedioTiempoRespuesta
  };
}; 