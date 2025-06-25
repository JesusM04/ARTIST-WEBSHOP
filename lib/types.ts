export * from './types/chat';

export interface UserProfile {
  email: string;
  name?: string;
  type: 'client' | 'artist' | 'admin' | 'guest';
  createdAt: any;
  pedidosRealizados: number;
}

export interface Order {
  id: string;
  title: string;
  description: string;
  type: string;
  size: string;
  style: string;
  tone: string;
  material: string;
  frameSize: string;
  background: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  price: number | null;
  deadline: string;
  imageUrl?: string;
  clientId: string;
  artistId: string;
  artistEmail?: string;
}

export interface Notificacion {
  id: string;
  tipo: 'nuevo_pedido' | 'cotizacion' | 'actualizacion';
  mensaje: string;
  leida: boolean;
  fecha: any;
  pedidoId?: string;
  userEmail: string;
}

export interface EstadisticasCliente {
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosCotizados: number;
  pedidosCompletados: number;
}

export interface EstadisticasArtista {
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosCotizados: number;
  pedidosCompletados: number;
  clientesUnicos: number;
  promedioTiempoRespuesta: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'audio';
  senderId: string;
  senderEmail: string;
  senderRole: 'client' | 'artist';
  receiverId: string;
  timestamp: Date;
  isStarred: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  deleted?: {
    by: string[];
    at: Date;
  };
  chatId?: string;
}

export interface ChatRoom {
  id: string;
  participants: {
    client: { id: string; email: string };
    artist: { id: string; email: string };
  };
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    content: string;
    timestamp: Date;
    type: 'text' | 'image' | 'audio';
  };
}

export interface UserStatus {
  isOnline: boolean;
  lastSeen?: Date;
} 