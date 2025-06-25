import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format-date";
import Image from "next/image";
import { ChatMessage } from "@/lib/types";
import { X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReplyMessage {
  id: string;
  content: string;
  senderName: string;
}

interface ChatContentProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, replyTo?: ReplyMessage | null) => void;
  isConversationSelected: boolean;
  isLoading: boolean;
  currentUserId?: string;
}

export const ChatContent = ({
  messages,
  onSendMessage,
  isConversationSelected,
  isLoading,
  currentUserId = "currentUser"
}: ChatContentProps) => {
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<ReplyMessage | null>(null);
  const [isSending, setIsSending] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-desplazamiento al cambiar mensajes
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (content.trim() === "" || isSending) return;
    
    const messageToSend = content;
    const replyToData = replyingTo && replyingTo.id ? replyingTo : null;
    
    try {
      setIsSending(true);
      setContent("");
      
      // Intentar enviar el mensaje
      await onSendMessage(messageToSend, replyToData);
      setReplyingTo(null);
      
      // Desplazar al final después de enviar
      setTimeout(() => {
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast.error("No se pudo enviar el mensaje. Inténtalo de nuevo.");
      setContent(messageToSend); // Restaurar el mensaje si falla
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = (message: ChatMessage) => {
    if (!message || !message.id) return;
    
    setReplyingTo({
      id: message.id,
      content: message.content || "",
      senderName: message.senderEmail?.split('@')[0] || 'Usuario',
    });
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <div className="flex flex-col h-full relative bg-background" ref={chatBoxRef}>
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center bg-background">
          <div className="flex flex-col items-center space-y-2">
            <div className="chat-loading-spinner"></div>
            <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
          </div>
        </div>
      ) : !isConversationSelected ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4 bg-background">
          <Image 
            src="/images/chat.png" 
            alt="Chat" 
            width={120} 
            height={120} 
            className="mb-4 opacity-60" 
          />
          <h3 className="text-lg font-medium">Selecciona una conversación</h3>
          <p className="text-sm text-muted-foreground">
            Elige una conversación para comenzar a chatear
          </p>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto p-4 pb-16 bg-background">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Send className="h-8 w-8 text-primary/50" />
                </div>
                <h3 className="text-lg font-medium mb-1">No hay mensajes</h3>
                <p className="text-sm text-muted-foreground">
                  Envía un mensaje para comenzar la conversación
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.senderId === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-3",
                        message.senderId === currentUserId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.replyTo && message.replyTo.id && (
                        <div className="text-xs mb-1 opacity-90 p-1.5 rounded bg-background/30 line-clamp-2">
                          <span className="font-semibold">
                            {message.senderId === currentUserId
                              ? "Respondiste a "
                              : "Respuesta a "}
                            {message.replyTo.senderName || "Usuario"}
                          </span>
                          <p className="truncate opacity-75">{message.replyTo.content || ""}</p>
                        </div>
                      )}
                      <p>{message.content}</p>
                      <div
                        className={cn(
                          "text-xs mt-1",
                          message.senderId === currentUserId
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-2 bg-background border-t">
            {replyingTo && (
              <div className="flex items-center justify-between bg-accent/30 p-2 rounded-lg mb-2 text-sm border border-primary/10">
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-xs">Respondiendo a {replyingTo.senderName}</span>
                  <p className="truncate text-xs text-muted-foreground">{replyingTo.content}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={cancelReply}
                >
                  <X size={14} />
                </Button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                placeholder="Escribe un mensaje..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-grow"
                disabled={isSending}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={content.trim() === "" || isSending}
                className="transition-all"
              >
                {isSending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 