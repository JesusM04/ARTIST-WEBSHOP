import { useState } from "react"
import { Order } from "@/lib/data/orders"
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

interface OrderFormDialogProps {
  order: Order
  open: boolean
  onClose: () => void
  onSave?: (order: Partial<Order>) => void
  mode: "view" | "edit"
}

const sizeOptions = ["Pequeño", "Mediano", "Grande"]
const styleOptions = ["Realismo", "Abstracto", "Impresionismo", "Surrealismo"]
const toneOptions = ["Claro", "Oscuro", "Neutro"]
const materialOptions = ["Lienzo", "Madera", "Papel"]
const frameSizeOptions = ["Sin Marco", "Pequeño", "Mediano", "Grande"]
const backgroundOptions = ["Blanco", "Negro", "Transparente"]

export function OrderFormDialog({
  order,
  open,
  onClose,
  onSave,
  mode
}: OrderFormDialogProps) {
  const [formData, setFormData] = useState({
    size: order.size,
    style: order.style,
    tone: order.tone,
    material: order.material,
    frameSize: order.frameSize,
    background: order.background,
    description: order.description || "",
    referenceImage: order.referenceImage
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({
            ...prev,
            referenceImage: e.target?.result as string
          }))
        }
      }
      
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Pedido" : "Ver Pedido"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tamaño</Label>
              <Select
                value={formData.size}
                onValueChange={(value) => handleChange("size", value)}
                disabled={mode === "view"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tamaño" />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estilo</Label>
              <Select
                value={formData.style}
                onValueChange={(value) => handleChange("style", value)}
                disabled={mode === "view"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estilo" />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tono</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => handleChange("tone", value)}
                disabled={mode === "view"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tono" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Material</Label>
              <Select
                value={formData.material}
                onValueChange={(value) => handleChange("material", value)}
                disabled={mode === "view"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar material" />
                </SelectTrigger>
                <SelectContent>
                  {materialOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tamaño del Marco</Label>
              <Select
                value={formData.frameSize}
                onValueChange={(value) => handleChange("frameSize", value)}
                disabled={mode === "view"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tamaño del marco" />
                </SelectTrigger>
                <SelectContent>
                  {frameSizeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fondo</Label>
              <Select
                value={formData.background}
                onValueChange={(value) => handleChange("background", value)}
                disabled={mode === "view"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fondo" />
                </SelectTrigger>
                <SelectContent>
                  {backgroundOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={mode === "view"}
                placeholder="Describe cómo te gustaría la pintura..."
              />
            </div>

            <div className="space-y-2">
              <Label>Imagen de Referencia</Label>
              {mode === "edit" ? (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
              ) : null}
              {formData.referenceImage && (
                <div className="mt-2">
                  <img
                    src={formData.referenceImage}
                    alt="Referencia"
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          {mode === "edit" && (
            <Button onClick={handleSave}>
              Guardar Cambios
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 