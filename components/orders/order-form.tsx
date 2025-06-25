"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { 
  FilePlus, 
  Ruler, 
  Palette, 
  Sun, 
  Box, 
  Frame, 
  Image as ImageIcon,
  FileText,
  ChevronRight,
  Upload,
  Pencil,
  Save,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface OrderFormProps {
  initialData?: any
  isReadOnly?: boolean
  onSubmit?: (data: any) => void
  onEdit?: () => void
  userRole?: string
}

const OPTIONS = {
  size: ["Pequeño (20x30 cm)", "Mediano (40x60 cm)", "Grande (60x90 cm)"],
  style: ["Realismo", "Abstracto", "Impresionismo", "Surrealismo"],
  tone: ["Claro", "Oscuro", "Neutro"],
  material: ["Lienzo", "Madera", "Papel"],
  frameSize: ["Sin Marco", "Marco Pequeño", "Marco Mediano", "Marco Grande"],
  background: ["Blanco", "Negro", "Transparente"]
}

export function OrderForm({ 
  initialData, 
  isReadOnly = false, 
  onSubmit,
  onEdit,
  userRole = "client" 
}: OrderFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    size: initialData?.size || "",
    style: initialData?.style || "",
    tone: initialData?.tone || "",
    material: initialData?.material || "",
    frameSize: initialData?.frameSize || "",
    background: initialData?.background || "",
    description: initialData?.description || ""
  })

  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImageUrl(URL.createObjectURL(file))
    }
  }

  const handleDeleteImage = () => {
    setImage(null)
    setImageUrl("")
    const fileInput = document.getElementById('image') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.size || !formData.style || !formData.tone || !formData.frameSize) {
      toast.error("Por favor complete los campos requeridos")
      return
    }

    try {
      await onSubmit?.({
        ...formData,
        imageUrl,
        image
      })
      toast.success(initialData ? "Pedido actualizado con éxito" : "Pedido creado con éxito")
    } catch (error) {
      toast.error("Error al procesar el pedido")
      console.error(error)
    }
  }

  if (isReadOnly) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{formData.title || "Sin título"}</h2>
          {userRole === "client" && !initialData?.price && (
            <Button onClick={onEdit} variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData).map(([key, value]) => {
              if (key === 'title') return null
              return (
                <div key={key} className="space-y-1">
                  <Label className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                  <p className="text-gray-600">{value || "No especificado"}</p>
                </div>
              )
            })}
          </div>

          {imageUrl && (
            <div className="mt-6">
              <Label className="font-medium">Imagen de referencia</Label>
              <div className="mt-2 relative w-full max-w-[300px] aspect-square rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Imagen de referencia"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Título <span className="text-red-500">*</span></Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Título de tu obra"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(OPTIONS).map(([key, options]) => (
              <div key={key} className="space-y-2">
                <Label>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  {['size', 'style', 'tone', 'frameSize'].includes(key) && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {formData[key as keyof typeof formData] || `Seleccionar ${key}`}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    {options.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleChange(key, option)}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe los detalles de tu obra..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Imagen de referencia</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full cursor-pointer"
              />
              {(image || imageUrl) && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleDeleteImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {(image || imageUrl) && (
              <div className="mt-2 relative w-full max-w-[300px] aspect-square rounded-lg overflow-hidden">
                <img
                  src={image ? URL.createObjectURL(image) : imageUrl}
                  alt="Vista previa"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="w-4 h-4 mr-2" />
          {initialData ? "Actualizar Pedido" : "Crear Pedido"}
        </Button>
      </div>
    </form>
  )
} 