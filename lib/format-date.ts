import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha para mostrarla en mensajes de chat
 */
export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return "";
  
  try {
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate ? timestamp.toDate() 
      : new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: es });
    } else if (isYesterday(date)) {
      return `Ayer, ${format(date, "HH:mm", { locale: es })}`;
    } else {
      return format(date, "dd/MM/yy HH:mm", { locale: es });
    }
  } catch (error) {
    console.error("Error formateando timestamp:", error);
    return "";
  }
};

/**
 * Formatea una fecha para mostrarla en la lista de chats
 */
export const formatChatTimestamp = (timestamp: any): string => {
  if (!timestamp) return "";
  
  try {
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate ? timestamp.toDate() 
      : new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: es });
    } else if (isYesterday(date)) {
      return "Ayer";
    } else {
      return format(date, "dd/MM/yy", { locale: es });
    }
  } catch (error) {
    console.error("Error formateando timestamp:", error);
    return "";
  }
}; 