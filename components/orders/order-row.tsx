"use client"

import React, { useEffect, useState } from 'react'
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'

interface Order {
  id: string
  title: string
  description: string
  type: string
  size: string
  style: string
  tone: string
  material: string
  frameSize: string
  background: string
  status: string
  createdAt: Date
  updatedAt?: Date
  price: number | null
  deadline: string
  imageUrl?: string
  clientId: string
  artistId: string
}

interface OrderRowProps {
  order: Order
  onOrderClick: (order: Order) => void
  isArtist?: boolean
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "outline"
    case "in_progress": return "secondary"
    case "cancelled": return "destructive"
    default: return "default"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "completed": return "Completado"
    case "in_progress": return "En Progreso"
    case "cancelled": return "Cancelado"
    default: return "Pendiente"
  }
}

export const OrderRow = React.memo(({ order, onOrderClick, isArtist = false }: OrderRowProps) => {
  const [clientEmail, setClientEmail] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchClientEmail = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", order.clientId))
        if (userDoc.exists()) {
          setClientEmail(userDoc.data().email || "")
        }
      } catch (error) {
        console.error("Error fetching client email:", error)
      }
    }

    fetchClientEmail()
  }, [order.clientId])

  const handleStatusChange = async (newStatus: string) => {
    if (!isArtist) return
    setIsUpdating(true)
    try {
      const orderRef = doc(db, "orders", order.id)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date()
      })
      toast.success("Estado actualizado correctamente")
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Error al actualizar el estado")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onOrderClick(order)}
    >
      <TableCell className="font-medium">
        {order.title}
        {isArtist && clientEmail && (
          <div className="text-sm text-muted-foreground">
            {clientEmail}
          </div>
        )}
      </TableCell>
      <TableCell>
        {isArtist ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Select
              value={order.status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue>
                  <Badge variant={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Badge variant={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Badge>
        )}
      </TableCell>
      <TableCell>{order.type}</TableCell>
      <TableCell>{order.size}</TableCell>
      <TableCell>
        {format(order.createdAt, "d 'de' MMMM 'de' yyyy", { locale: es })}
      </TableCell>
      <TableCell>
        {order.price ? (
          <span className="font-medium text-primary">
            {order.price.toFixed(2)} €
          </span>
        ) : (
          <span className="text-muted-foreground">Sin precio</span>
        )}
      </TableCell>
    </TableRow>
  )
})

OrderRow.displayName = 'OrderRow' 