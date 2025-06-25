"use client"

import { useState, useEffect } from "react";
import { ProfileLayout } from "@/components/layouts/profile-layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Search, 
  Heart, 
  Trash2, 
  MessageSquare, 
  Filter, 
  Loader2 
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, doc, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

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
  dateAdded?: Date;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Artwork[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [artworkToRemove, setArtworkToRemove] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Obtener favoritos del usuario
        const favoritesQuery = query(
          collection(db, "favorites"),
          where("userId", "==", user.uid)
        );
        
        const favoritesSnapshot = await getDocs(favoritesQuery);
        const favoritesList: Artwork[] = [];
        
        if (favoritesSnapshot.empty) {
          // Si no hay datos en Firestore, usar datos de ejemplo
          const mockFavorites: Artwork[] = [
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
              },
              dateAdded: new Date(2023, 10, 15)
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
              },
              dateAdded: new Date(2023, 11, 2)
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
              },
              dateAdded: new Date(2024, 0, 10)
            },
            {
              id: "5",
              title: "Serenidad marina",
              description: "Paisaje marino que transmite calma y paz a través de tonos azules y verdes.",
              price: 520,
              imageUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04",
              category: "Pintura",
              artist: {
                id: "a5",
                name: "Ana López",
                photoURL: "https://randomuser.me/api/portraits/women/68.jpg"
              },
              dateAdded: new Date(2024, 1, 5)
            }
          ];
          
          setFavorites(mockFavorites);
          setFilteredFavorites(mockFavorites);
        } else {
          // Procesar datos reales de Firestore
          for (const doc of favoritesSnapshot.docs) {
            const favoriteData = doc.data();
            
            try {
              // Obtener los datos de la obra desde Firestore
              const artworkDoc = await getDocs(query(
                collection(db, "artworks"),
                where("__name__", "==", favoriteData.artworkId)
              ));
              
              if (!artworkDoc.empty) {
                const artworkData = artworkDoc.docs[0].data();
                
                // Obtener los datos del artista
                const artistDoc = await getDocs(query(
                  collection(db, "users"),
                  where("__name__", "==", artworkData.artistId)
                ));
                
                let artistData = {
                  id: artworkData.artistId,
                  name: "Artista desconocido",
                  photoURL: undefined
                };
                
                if (!artistDoc.empty) {
                  const artistInfo = artistDoc.docs[0].data();
                  artistData = {
                    id: artworkData.artistId,
                    name: artistInfo.name || artistInfo.displayName || "Artista",
                    photoURL: artistInfo.photoURL
                  };
                }
                
                favoritesList.push({
                  id: favoriteData.artworkId,
                  title: artworkData.title || "Sin título",
                  description: artworkData.description || "",
                  price: artworkData.price || 0,
                  imageUrl: artworkData.imageUrl || "/images/placeholder.jpg",
                  category: artworkData.category || "Mixta",
                  artist: artistData,
                  dateAdded: favoriteData.dateAdded?.toDate() || new Date()
                });
              }
            } catch (error) {
              console.error("Error al obtener datos de obra favorita:", error);
            }
          }
          
          // Ordenar por fecha más reciente
          favoritesList.sort((a, b) => 
            (b.dateAdded?.getTime() || 0) - (a.dateAdded?.getTime() || 0)
          );
          
          setFavorites(favoritesList);
          setFilteredFavorites(favoritesList);
        }
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [user]);
  
  // Aplicar filtros
  useEffect(() => {
    let filtered = [...favorites];
    
    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(artwork => 
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(artwork => artwork.category === selectedCategory);
    }
    
    setFilteredFavorites(filtered);
  }, [searchQuery, selectedCategory, favorites]);
  
  // Obtener categorías únicas
  const categories = Array.from(new Set(favorites.map(artwork => artwork.category)));
  
  const handleRemoveFavorite = async (artworkId: string) => {
    try {
      if (!user) return;
      
      // En un entorno real, eliminaríamos el documento de Firestore
      // await deleteDoc(doc(db, "favorites", favoriteId));
      
      // Actualizar el estado local
      const updatedFavorites = favorites.filter(artwork => artwork.id !== artworkId);
      setFavorites(updatedFavorites);
      setFilteredFavorites(filteredFavorites.filter(artwork => artwork.id !== artworkId));
      
      setArtworkToRemove(null);
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
    }
  };
  
  const clearSelectedCategory = () => {
    setSelectedCategory(null);
  };

  return (
    <ProfileLayout role="client">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-6">
          {/* Header y búsqueda */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              <h1 className="text-2xl font-bold">Mis Favoritos</h1>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en favoritos..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Categorías */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Categorías:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => 
                      selectedCategory === category 
                        ? clearSelectedCategory() 
                        : setSelectedCategory(category)
                    }
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              {selectedCategory && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearSelectedCategory}
                  className="h-7 px-2"
                >
                  Borrar filtro
                </Button>
              )}
            </div>
          )}
          
          {/* Lista de favoritos */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFavorites.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden h-full flex flex-col">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title} 
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full h-8 w-8"
                          onClick={() => setArtworkToRemove(artwork.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar de favoritos?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará "{artwork.title}" de tu lista de favoritos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleRemoveFavorite(artwork.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <CardContent className="p-4 space-y-2 flex-1">
                    <div className="flex items-center gap-2 justify-between">
                      <Badge variant="outline">{artwork.category}</Badge>
                      <span className="text-lg font-semibold text-primary">
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(artwork.price)}
                      </span>
                    </div>
                    <h3 className="font-semibold truncate">{artwork.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {artwork.description}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={artwork.artist.photoURL} />
                        <AvatarFallback>{artwork.artist.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{artwork.artist.name}</span>
                    </div>
                    {artwork.dateAdded && (
                      <p className="text-xs text-muted-foreground">
                        Añadido el {artwork.dateAdded.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
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
            <div className="text-center py-16 text-muted-foreground">
              <div className="mx-auto mb-4 bg-muted w-16 h-16 rounded-full flex items-center justify-center">
                {searchQuery || selectedCategory ? (
                  <Filter className="text-muted-foreground h-8 w-8" />
                ) : (
                  <Heart className="text-muted-foreground h-8 w-8" />
                )}
              </div>
              <h3 className="text-lg font-medium">
                {searchQuery || selectedCategory 
                  ? "No se encontraron resultados" 
                  : "No tienes favoritos"}
              </h3>
              <p className="mt-1">
                {searchQuery || selectedCategory 
                  ? "Prueba a cambiar los filtros o la búsqueda" 
                  : "Explora obras de arte y marca tus favoritas"}
              </p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
              >
                Explorar obras
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </ProfileLayout>
  );
}
