import React, { useState, useRef, useEffect, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Star, StarOff, Reply, CornerDownRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChatMessage } from "@/lib/types";

interface ChatMessageItemProps {
  message: ChatMessage;
  currentUserId: string;
  searchTerm?: string;
  onToggleStar: (messageId: string, isStarred: boolean) => void;
  onReply: (message: ChatMessage) => void;
}

// Utilizamos memo para evitar renderizados innecesarios
export const ChatMessageItem = memo(({ 
  message, 
  currentUserId, 
  searchTerm, 
  onToggleStar,
  onReply
}: ChatMessageItemProps) => {
  const isOwnMessage = message.senderId === currentUserId;
  const messageRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [mouseStartX, setMouseStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAmount, setDragAmount] = useState(0);
  const swipeThreshold = 50; // Píxeles necesarios para considerar un swipe
  const lastTouchMove = useRef<number>(0);
  
  // Formatear timestamp de manera eficiente
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    
    try {
      const date = timestamp instanceof Date 
        ? timestamp 
        : timestamp.toDate ? timestamp.toDate() 
        : new Date(timestamp);
      
      return format(date, "HH:mm", { locale: es });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };
  
  // Resaltar el término de búsqueda en el texto del mensaje
  const highlightSearchTerm = (content: string, term: string) => {
    if (!term || !content.toLowerCase().includes(term.toLowerCase())) {
      return <p className="break-words whitespace-pre-wrap">{content}</p>;
    }
    
    const parts = content.split(new RegExp(`(${term})`, 'gi'));
    return (
      <p className="break-words whitespace-pre-wrap">
        {parts.map((part, i) => 
          part.toLowerCase() === term.toLowerCase() 
            ? <span key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">{part}</span> 
            : part
        )}
      </p>
    );
  };

  // Manejo de eventos touch para móviles con optimización de rendimiento
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isOwnMessage) return; // Solo permitir swipes en mensajes de otros
    setTouchStartX(e.touches[0].clientX);
    lastTouchMove.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isOwnMessage) return;
    
    // Limitamos la frecuencia de actualizaciones para mejorar el rendimiento
    const now = Date.now();
    if (now - lastTouchMove.current < 16) { // ~60fps
      return;
    }
    lastTouchMove.current = now;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    
    if (diff > 0 && diff < 100) {
      setDragAmount(diff);
      setIsDragging(true);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      if (dragAmount > swipeThreshold) {
        handleReply();
      }
      setIsDragging(false);
      setDragAmount(0);
    }
  };

  // Manejo de eventos mouse para desktop con optimización
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOwnMessage) return;
    setMouseStartX(e.clientX);
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isOwnMessage) return;
    
    // Limitamos el movimiento a horizontal y positivo
    const diff = e.clientX - mouseStartX;
    if (diff > 0 && diff < 100) {
      setDragAmount(diff);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      if (dragAmount > swipeThreshold) {
        handleReply();
      }
      setIsDragging(false);
      setDragAmount(0);
    }
  };

  // Limpiar eventos al desmontar
  useEffect(() => {
    const handleMouseUpOutside = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragAmount(0);
      }
    };

    document.addEventListener('mouseup', handleMouseUpOutside);
    return () => {
      document.removeEventListener('mouseup', handleMouseUpOutside);
    };
  }, [isDragging]);

  const handleReply = () => {
    onReply(message);
  };
  
  // Optimizamos el estilo para evitar recálculos excesivos
  const messageStyle = {
    transform: isDragging && !isOwnMessage ? `translateX(${dragAmount}px)` : 'translateX(0)',
    transition: isDragging ? 'none' : 'transform 0.2s ease'
  };
  
  const replyIndicatorStyle = {
    opacity: isDragging ? dragAmount / 100 : 0
  };
  
  // Limitar el contenido del mensaje para mostrar en el bloque de respuesta
  const getTruncatedContent = (content: string, maxLength = 30) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };
  
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group mb-2`}>
      <div
        ref={messageRef}
        className={`relative max-w-[90%] sm:max-w-[80%] rounded-lg ${
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-muted rounded-bl-none"
        } ${searchTerm && message.content?.toLowerCase().includes(searchTerm.toLowerCase()) ? "ring-1 ring-yellow-300 dark:ring-yellow-600" : ""}`}
        style={messageStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={() => !isOwnMessage && handleReply()}
      >
        {/* Mensaje de respuesta si existe */}
        {message.replyTo && (
          <div className="bg-black/10 dark:bg-white/10 p-2 rounded-t-lg text-xs max-w-full overflow-hidden border-l-2 border-primary animate-pulse-slow">
            <div className="flex items-center gap-1 mb-0.5">
              <CornerDownRight className="h-3 w-3 opacity-70" />
              <p className="font-semibold">{message.replyTo.senderName}</p>
            </div>
            <p className="truncate opacity-80">{getTruncatedContent(message.replyTo.content)}</p>
          </div>
        )}
        
        <div className="p-3">
          {message.type === "text" && (
            searchTerm 
              ? highlightSearchTerm(message.content, searchTerm)
              : <p className="break-words whitespace-pre-wrap">{message.content}</p>
          )}
          
          {message.type === "image" && (
            <img
              src={message.content}
              alt="Imagen"
              className="max-w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.content, '_blank')}
              loading="lazy"
            />
          )}
          
          {message.type === "audio" && (
            <audio 
              controls 
              className="max-w-full w-full"
              controlsList="nodownload"
              preload="metadata"
            >
              <source src={message.content} type="audio/webm;codecs=opus" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          )}
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs opacity-70">
              {formatTimestamp(message.timestamp)}
            </p>
            <div className="flex items-center space-x-1 opacity-70 hover:opacity-100 transition-opacity">
              {!isOwnMessage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleReply}
                  title="Responder"
                >
                  <Reply className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={() => onToggleStar(message.id, message.isStarred || false)}
                title={message.isStarred ? "Quitar destacado" : "Destacar mensaje"}
              >
                {message.isStarred ? (
                  <Star className="h-3 w-3 text-yellow-500" />
                ) : (
                  <StarOff className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {!isOwnMessage && (
          <div 
            className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pl-2"
            style={replyIndicatorStyle}
          >
            <div className="bg-primary/20 p-1 rounded-full text-primary">
              <Reply className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default memo(ChatMessageItem); 