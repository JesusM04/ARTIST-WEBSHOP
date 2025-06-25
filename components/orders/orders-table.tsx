import { Order } from "@/lib/data/orders"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit2, DollarSign } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface OrdersTableProps {
  orders: Order[]
  role: "client" | "artist"
  onViewOrder: (order: Order) => void
  onEditOrder?: (order: Order) => void
  onViewInvoice?: (order: Order) => void
  onCreateInvoice?: (order: Order) => void
}

export function OrdersTable({
  orders,
  role,
  onViewOrder,
  onEditOrder,
  onViewInvoice,
  onCreateInvoice
}: OrdersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tamaño</TableHead>
            <TableHead>Estilo</TableHead>
            <TableHead>Tono</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Marco</TableHead>
            <TableHead>Fondo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Referencia</TableHead>
            {role === "client" && <TableHead>Precio</TableHead>}
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.size}</TableCell>
              <TableCell>{order.style}</TableCell>
              <TableCell>{order.tone}</TableCell>
              <TableCell>{order.material}</TableCell>
              <TableCell>{order.frameSize}</TableCell>
              <TableCell>{order.background}</TableCell>
              <TableCell>{order.description ? "Sí" : "No"}</TableCell>
              <TableCell>{order.referenceImage ? "Sí" : "No"}</TableCell>
              {role === "client" && (
                <TableCell>
                  {order.invoice ? `$${order.invoice.totalPrice}` : "-"}
                </TableCell>
              )}
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewOrder(order)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {role === "client" && onEditOrder && !order.invoice && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditOrder(order)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}

                {role === "artist" && !order.invoice && onCreateInvoice && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCreateInvoice(order)}
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                )}

                {order.invoice && onViewInvoice && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewInvoice(order)}
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 