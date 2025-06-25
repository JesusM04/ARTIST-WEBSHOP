"use client"

import { useState } from "react"
import { useAuth } from "@/lib/AuthContext"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { OrderForm } from "@/components/orders/order-form"

export default function BuyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    if (!user) {
      toast.error("Debes iniciar sesión para hacer un pedido")
      return
    }

    setLoading(true)
    try {
      const orderData = {
        ...formData,
        clientId: user.uid,
        clientEmail: user.email,
        status: "pending",
        createdAt: serverTimestamp(),
        artistId: null,
        price: null,
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "orders"), orderData)
      toast.success("Pedido enviado con éxito")
      router.push("/sections/client/orders")
    } catch (error) {
      console.error("Error al crear el pedido:", error)
      toast.error("Error al crear el pedido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProfileLayout role="client">
      <div className="max-w-3xl mx-auto space-y-6 p-6 bg-gradient-to-br from-white to-primary/5 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary text-center">
          Crear Nuevo Pedido
        </h1>
        
        <OrderForm
          onSubmit={handleSubmit}
          userRole="client"
        />
      </div>
    </ProfileLayout>
  )
}
