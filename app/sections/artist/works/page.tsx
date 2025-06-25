"use client"

import { useState, useEffect } from "react"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, Trash2, Image, Search } from "lucide-react"

interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  technique: string;
  dimensions: string;
  year: number;
  imageUrl: string;
  available: boolean;
}

export default function ArtistWorks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulación de carga de datos desde la base de datos
    const timer = setTimeout(() => {
      const mockArtworks = [
        {
          id: "1",
          title: "Atardecer en la ciudad",
          description: "Una vista panorámica de la ciudad al atardecer con colores vibrantes y cálidos.",
          price: 450,
          category: "Pintura",
          technique: "Óleo sobre lienzo",
          dimensions: "60x80 cm",
          year: 2022,
          imageUrl: "/images/artworks/atardecer.jpg",
          available: true
        },
        {
          id: "2",
          title: "Abstracto #42",
          description: "Composición abstracta que explora la relación entre formas geométricas y orgánicas.",
          price: 350,
          category: "Pintura",
          technique: "Acrílico sobre lienzo",
          dimensions: "50x50 cm",
          year: 2021,
          imageUrl: "/images/artworks/abstracto.jpg",
          available: true
        },
        {
          id: "3",
          title: "Naturaleza silenciosa",
          description: "Bodegón contemporáneo con elementos naturales y artificiales en armonía.",
          price: 280,
          category: "Fotografía",
          technique: "Fotografía digital",
          dimensions: "40x60 cm",
          year: 2023,
          imageUrl: "/images/artworks/naturaleza.jpg",
          available: false
        }
      ];
      setArtworks(mockArtworks);
      setFilteredArtworks(mockArtworks);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filtrar obras basadas en la búsqueda
    if (searchQuery) {
      const filtered = artworks.filter(artwork => 
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.technique.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArtworks(filtered);
    } else {
      setFilteredArtworks(artworks);
    }
  }, [searchQuery, artworks]);

  const handleNewArtwork = () => {
    setEditingArtwork(null);
    setOpen(true);
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setOpen(true);
  };

  const handleDeleteArtwork = (id: string) => {
    setArtworks(artworks.filter(artwork => artwork.id !== id));
  };

  const handleSaveArtwork = (formData: FormData) => {
    const newArtwork: Artwork = {
      id: editingArtwork ? editingArtwork.id : Date.now().toString(),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      technique: formData.get('technique') as string,
      dimensions: formData.get('dimensions') as string,
      year: Number(formData.get('year')),
      imageUrl: editingArtwork ? editingArtwork.imageUrl : "/images/artworks/default.jpg",
      available: true
    };

    if (editingArtwork) {
      setArtworks(artworks.map(artwork => artwork.id === editingArtwork.id ? newArtwork : artwork));
    } else {
      setArtworks([...artworks, newArtwork]);
    }
    
    setOpen(false);
  };

  return (
    <ProfileLayout role="artist">
      <div className="space-y-6 pb-10 overflow-auto max-h-[calc(100vh-64px)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Mis Obras</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar obras..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleNewArtwork} className="whitespace-nowrap">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Obra
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron obras que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtworks.map(artwork => (
              <Card key={artwork.id} className="overflow-hidden">
                <div className="aspect-square relative bg-gray-100">
                  {artwork.imageUrl ? (
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Image className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  {!artwork.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white font-semibold px-3 py-1 bg-red-500 rounded-full">Vendido</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <h3 className="text-lg font-semibold">{artwork.title}</h3>
                  <p className="text-sm text-gray-500">{artwork.technique}, {artwork.year}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2">{artwork.description}</p>
                  <p className="mt-2 font-bold">${artwork.price}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleEditArtwork(artwork)}>
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteArtwork(artwork.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingArtwork ? 'Editar Obra' : 'Nueva Obra'}</DialogTitle>
              <DialogDescription>
                Completa los detalles de tu obra para añadirla a tu portafolio.
              </DialogDescription>
            </DialogHeader>
            <form action={handleSaveArtwork}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      required 
                      defaultValue={editingArtwork?.title}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (USD)</Label>
                    <Input 
                      id="price" 
                      name="price" 
                      type="number" 
                      required 
                      defaultValue={editingArtwork?.price}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    required 
                    defaultValue={editingArtwork?.description}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select name="category" defaultValue={editingArtwork?.category || "Pintura"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pintura">Pintura</SelectItem>
                        <SelectItem value="Escultura">Escultura</SelectItem>
                        <SelectItem value="Fotografía">Fotografía</SelectItem>
                        <SelectItem value="Digital">Arte Digital</SelectItem>
                        <SelectItem value="Mixta">Técnica Mixta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Año</Label>
                    <Input 
                      id="year" 
                      name="year" 
                      type="number" 
                      required 
                      defaultValue={editingArtwork?.year || new Date().getFullYear()}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="technique">Técnica</Label>
                    <Input 
                      id="technique" 
                      name="technique" 
                      required 
                      defaultValue={editingArtwork?.technique}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensiones</Label>
                    <Input 
                      id="dimensions" 
                      name="dimensions" 
                      required 
                      defaultValue={editingArtwork?.dimensions}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Imagen</Label>
                  <div className="flex items-center gap-4">
                    {editingArtwork?.imageUrl && (
                      <div className="w-20 h-20 overflow-hidden rounded">
                        <img 
                          src={editingArtwork.imageUrl} 
                          alt={editingArtwork.title} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <Input 
                      id="image" 
                      name="image" 
                      type="file" 
                      accept="image/*"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProfileLayout>
  )
}
