"use client"

import { useState, useEffect } from "react";
import { ProfileLayout } from "@/components/layouts/profile-layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, Filter, SlidersHorizontal, Heart, MessageSquare, Loader2, Star } from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, query, getDocs, limit, where, orderBy } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Artist {
  id: string;
  name: string;
  photoURL?: string;
  specialties?: string[];
  rating?: number;
  completedWorks?: number;
}

interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  artist: {
    id: string;
    name: string;
    photoURL?: string;
  };
  isFavorite?: boolean;
}

const categories = [
  "Todas", 
  "Pintura", 
  "Escultura", 
  "Fotografía", 
  "Digital", 
  "Ilustración", 
  "Mixta",
  "Grabado"
];

export default function ExplorePage() {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("recent");
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener obras
        const artworksQuery = query(
          collection(db, "artworks"),
          limit(50)
        );
        
        const artworksSnapshot = await getDocs(artworksQuery);
        const artworksList: Artwork[] = [];
        
        // Obtener artistas
        const artistsQuery = query(
          collection(db, "users"),
          where("role", "==", "artist"),
          limit(10)
        );
        
        const artistsSnapshot = await getDocs(artistsQuery);
        const artistsList: Artist[] = [];
        
        // Convertir artistas
        artistsSnapshot.forEach(doc => {
          const data = doc.data();
          artistsList.push({
            id: doc.id,
            name: data.name || data.displayName || "Artista",
            photoURL: data.photoURL,
            specialties: data.specialties || [],
            rating: data.rating || 0,
            completedWorks: data.completedWorks || 0
          });
        });
        
        // Convertir obras
        for (const doc of artworksSnapshot.docs) {
          const data = doc.data();
          const artistId = data.artistId;
          
          let artistData = {
            id: artistId,
            name: "Artista desconocido",
            photoURL: undefined as string | undefined
          };
          
          // Buscar el artista en la lista de artistas
          const artist = artistsList.find(a => a.id === artistId);
          if (artist) {
            artistData = {
              id: artist.id,
              name: artist.name,
              photoURL: artist.photoURL
            };
          } else {
            // Si no encontramos el artista en la lista, lo buscamos directamente
            try {
              const artistDoc = await getDocs(query(
                collection(db, "users"),
                where("__name__", "==", artistId),
                limit(1)
              ));
              
              if (!artistDoc.empty) {
                const artistInfo = artistDoc.docs[0].data();
                artistData = {
                  id: artistId,
                  name: artistInfo.name || artistInfo.displayName || "Artista",
                  photoURL: artistInfo.photoURL
                };
              }
            } catch (error) {
              console.error("Error al obtener artista:", error);
            }
          }
          
          artworksList.push({
            id: doc.id,
            title: data.title || "Sin título",
            description: data.description || "",
            price: data.price || 0,
            imageUrl: data.imageUrl || "/images/placeholder.jpg",
            category: data.category || "Mixta",
            artist: artistData,
            isFavorite: false // Por defecto, no es favorito
          });
        }
        
        // Si no hay obras en Firestore, usar datos de ejemplo
        if (artworksList.length === 0) {
          const mockArtworks: Artwork[] = [
            {
              id: "1",
              title: "Atardecer en la ciudad",
              description: "Una vista panorámica de la ciudad al atardecer con colores vibrantes y cálidos.",
              price: 450,
              imageUrl: "https://images.unsplash.com/photo-1617369120004-4fc70312c5e6",
              category: "Pintura",
              artist: {
                id: "a1",
                name: "María González",
                photoURL: "https://randomuser.me/api/portraits/women/44.jpg"
              }
            },
            {
              id: "2",
              title: "Abstracto #42",
              description: "Composición abstracta que explora la relación entre formas geométricas y orgánicas.",
              price: 350,
              imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5",
              category: "Pintura",
              artist: {
                id: "a2",
                name: "Carlos Jiménez",
                photoURL: "https://randomuser.me/api/portraits/men/46.jpg"
              }
            },
            {
              id: "3",
              title: "Naturaleza silenciosa",
              description: "Bodegón contemporáneo con elementos naturales y artificiales en armonía.",
              price: 280,
              imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
              category: "Fotografía",
              artist: {
                id: "a3",
                name: "Laura Martínez",
                photoURL: "https://randomuser.me/api/portraits/women/22.jpg"
              }
            },
            {
              id: "4",
              title: "Expresión digital",
              description: "Arte digital que captura la esencia de las emociones humanas a través de colores y formas.",
              price: 320,
              imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42",
              category: "Digital",
              artist: {
                id: "a4",
                name: "Javier Rodríguez",
                photoURL: "https://randomuser.me/api/portraits/men/32.jpg"
              }
            },
          ];
          
          setArtworks(mockArtworks);
          setFilteredArtworks(mockArtworks);
          
          // Extraer artistas únicos de las obras de ejemplo
          const uniqueArtists = Array.from(new Set(mockArtworks.map(artwork => artwork.artist.id)))
            .map(id => {
              const artwork = mockArtworks.find(a => a.artist.id === id);
              return {
                id,
                name: artwork?.artist.name || "Artista",
                photoURL: artwork?.artist.photoURL,
                specialties: ["Pintura", "Ilustración"],
                rating: 4.5,
                completedWorks: 12
              };
            });
          
          setArtists(uniqueArtists);
        } else {
          setArtworks(artworksList);
          setFilteredArtworks(artworksList);
          setArtists(artistsList);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Aplicar filtros
  useEffect(() => {
    let filtered = [...artworks];
    
    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(artwork => 
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtrar por categoría
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter(artwork => artwork.category === selectedCategory);
    }
    
    // Filtrar por rango de precio
    filtered = filtered.filter(artwork => 
      artwork.price >= priceRange[0] && artwork.price <= priceRange[1]
    );
    
    // Ordenar
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "recent") {
      // Por defecto ya están ordenados por más recientes
    }
    
    setFilteredArtworks(filtered);
  }, [searchQuery, selectedCategory, priceRange, sortBy, artworks]);

  const toggleFavorite = (id: string) => {
    setArtworks(artworks.map(artwork => 
      artwork.id === id 
        ? { ...artwork, isFavorite: !artwork.isFavorite } 
        : artwork
    ));
    
    setFilteredArtworks(filteredArtworks.map(artwork => 
      artwork.id === id 
        ? { ...artwork, isFavorite: !artwork.isFavorite } 
        : artwork
    ));
  };

  return (
    <ProfileLayout role="client">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-6 lg:p-8 space-y-8 lg:space-y-10">
          {/* Header y búsqueda */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6">
            <h1 className="text-2xl font-bold">Explorar Obras de Arte</h1>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, descripción..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="sr-only">Filtros</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Categoría</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                          <Badge
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Precio</h3>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-20"
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                          className="w-20"
                        />
                        <span>€</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Ordenar por</h3>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Más recientes</SelectItem>
                          <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                          <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {/* Artistas destacados */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Artistas Destacados</h2>
            <div className="flex overflow-x-auto py-3 gap-4 lg:gap-6 pb-6">
              {loading ? (
                <div className="flex items-center justify-center w-full py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : artists.length > 0 ? (
                artists.map((artist) => (
                  <div key={artist.id} className="flex-shrink-0 w-52 bg-card rounded-lg p-5 border text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-16 w-16 mb-3">
                        <AvatarImage src={artist.photoURL || "/placeholder.svg"} />
                        <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-medium truncate w-full">{artist.name}</h3>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{artist.rating?.toFixed(1) || "N/A"}</span>
                        <span className="mx-1">•</span>
                        <span>{artist.completedWorks || 0} obras</span>
                      </div>
                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        {artist.specialties?.slice(0, 2).map((specialty, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        Ver perfil
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center w-full py-6 text-muted-foreground">
                  No se encontraron artistas
                </div>
              )}
            </div>
          </div>
          
          {/* Grid de obras */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Obras de Arte</h2>
              <div className="text-sm text-muted-foreground">
                {filteredArtworks.length} resultados
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredArtworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {filteredArtworks.map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden h-full flex flex-col">
                    <div className="aspect-square relative overflow-hidden">
                      <img 
                        src={artwork.imageUrl || "/placeholder.svg"} 
                        alt={artwork.title} 
                        className="object-cover w-full h-full transition-transform hover:scale-105"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full h-8 w-8"
                              onClick={() => toggleFavorite(artwork.id)}
                            >
                              <Heart className={`h-5 w-5 ${artwork.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {artwork.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <CardContent className="p-5 space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{artwork.category}</Badge>
                        <span className="text-lg font-semibold text-primary">
                          {new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(artwork.price)}
                        </span>
                      </div>
                      <h3 className="font-semibold truncate">{artwork.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{artwork.description}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={artwork.artist.photoURL || "/placeholder.svg"} />
                          <AvatarFallback>{artwork.artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{artwork.artist.name}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-5 pt-0 flex gap-2">
                      <Button className="flex-1" size="sm">
                        Comprar
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" /> Chat
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 lg:py-16 px-4 text-muted-foreground">
                <div className="mx-auto mb-4 bg-muted w-16 h-16 rounded-full flex items-center justify-center">
                  <Filter className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium">No se encontraron resultados</h3>
                <p className="mt-1">Prueba a cambiar los filtros o la búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </ProfileLayout>
  );
}