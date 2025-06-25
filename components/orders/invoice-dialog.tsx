import { useState } from "react"
import { Invoice, Order, materialOptions } from "@/lib/data/orders"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Minus, X } from "lucide-react"

interface InvoiceDialogProps {
  order: Order
  open: boolean
  onClose: () => void
  onSave?: (invoice: Omit<Invoice, "id" | "orderId" | "createdAt">) => void
  mode: "create" | "view"
}

export function InvoiceDialog({
  order,
  open,
  onClose,
  onSave,
  mode
}: InvoiceDialogProps) {
  const [materials, setMaterials] = useState<{
    name: string
    quantity: number
    price: number
  }[]>(order.invoice?.materials || [])
  const [laborCost, setLaborCost] = useState(order.invoice?.laborCost || 0)
  const [notes, setNotes] = useState(order.invoice?.notes || "")

  const addMaterial = () => {
    setMaterials([...materials, { name: "", quantity: 1, price: 0 }])
  }

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index))
  }

  const updateMaterial = (index: number, field: string, value: any) => {
    const newMaterials = [...materials]
    if (field === "name") {
      const materialOption = materialOptions.find(m => m.name === value)
      newMaterials[index] = {
        ...newMaterials[index],
        [field]: value,
        price: materialOption?.basePrice || 0
      }
    } else {
      newMaterials[index] = {
        ...newMaterials[index],
        [field]: value
      }
    }
    setMaterials(newMaterials)
  }

  const calculateTotal = () => {
    const materialsTotal = materials.reduce((acc, mat) => acc + (mat.price * mat.quantity), 0)
    return materialsTotal + laborCost
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        materials,
        laborCost,
        notes,
        totalPrice: calculateTotal()
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear Factura" : "Ver Factura"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Materiales</h3>
              {mode === "create" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMaterial}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Material
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {materials.map((material, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Label>Material</Label>
                    <Select
                      value={material.name}
                      onValueChange={(value) => updateMaterial(index, "name", value)}
                      disabled={mode === "view"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialOptions.map((option) => (
                          <SelectItem key={option.name} value={option.name}>
                            {option.name} - ${option.basePrice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24">
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={material.quantity}
                      onChange={(e) => updateMaterial(index, "quantity", parseInt(e.target.value))}
                      disabled={mode === "view"}
                    />
                  </div>

                  <div className="w-24">
                    <Label>Precio</Label>
                    <Input
                      type="number"
                      value={material.price}
                      disabled
                    />
                  </div>

                  <div className="w-24">
                    <Label>Total</Label>
                    <Input
                      type="number"
                      value={material.price * material.quantity}
                      disabled
                    />
                  </div>

                  {mode === "create" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMaterial(index)}
                      className="mt-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Costo de Mano de Obra</Label>
              <Input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(parseInt(e.target.value))}
                disabled={mode === "view"}
              />
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={mode === "view"}
                placeholder="Notas adicionales sobre la factura..."
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-semibold">
              Total: ${calculateTotal()}
            </div>
            {mode === "create" && (
              <Button onClick={handleSave}>
                Guardar Factura
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 