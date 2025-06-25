import { LucideIcon } from "lucide-react"

export interface Invoice {
  id: string
  orderId: string
  materials: {
    name: string
    quantity: number
    price: number
  }[]
  laborCost: number
  totalPrice: number
  createdAt: Date
  notes?: string
}

export interface Order {
  id: string
  clientId: string
  size: string
  style: string
  tone: string
  material: string
  frameSize: string
  background: string
  description: string | null
  referenceImage: string | null
  status: "pending" | "priced" | "in_progress" | "completed"
  invoice?: Invoice
  createdAt: Date
  updatedAt: Date
}

// Datos de ejemplo
export const sampleOrders: Order[] = [
  {
    id: "order1",
    clientId: "client1",
    size: "Mediano",
    style: "Realismo",
    tone: "Claro",
    material: "Lienzo",
    frameSize: "Mediano",
    background: "Blanco",
    description: "Un hermoso paisaje de montaña al atardecer",
    referenceImage: "/sample-images/landscape.jpg",
    status: "pending",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15")
  },
  {
    id: "order2",
    clientId: "client1",
    size: "Grande",
    style: "Abstracto",
    tone: "Oscuro",
    material: "Madera",
    frameSize: "Grande",
    background: "Negro",
    description: "Arte abstracto con tonos oscuros y formas geométricas",
    referenceImage: null,
    status: "priced",
    invoice: {
      id: "inv1",
      orderId: "order2",
      materials: [
        { name: "Pintura acrílica", quantity: 5, price: 10 },
        { name: "Lienzo premium", quantity: 1, price: 30 },
        { name: "Pinceles especiales", quantity: 3, price: 15 }
      ],
      laborCost: 100,
      totalPrice: 195,
      createdAt: new Date("2024-03-16"),
      notes: "Trabajo detallado con materiales premium"
    },
    createdAt: new Date("2024-03-14"),
    updatedAt: new Date("2024-03-16")
  },
  {
    id: "order3",
    clientId: "client1",
    size: "Pequeño",
    style: "Impresionismo",
    tone: "Neutro",
    material: "Papel",
    frameSize: "Sin Marco",
    background: "Blanco",
    description: null,
    referenceImage: "/sample-images/reference.jpg",
    status: "pending",
    createdAt: new Date("2024-03-17"),
    updatedAt: new Date("2024-03-17")
  }
]

export const materialOptions = [
  { name: "Pintura acrílica", basePrice: 10 },
  { name: "Pintura al óleo", basePrice: 15 },
  { name: "Lienzo premium", basePrice: 30 },
  { name: "Lienzo estándar", basePrice: 20 },
  { name: "Pinceles especiales", basePrice: 15 },
  { name: "Pinceles básicos", basePrice: 8 },
  { name: "Marco de madera", basePrice: 25 },
  { name: "Marco metálico", basePrice: 35 },
  { name: "Papel artístico", basePrice: 12 }
] 