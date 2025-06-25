'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PerfilForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const name = formData.get('name') as string;
      
      await updateUserProfile({ name });
      
      toast({
        title: "Perfil actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.email) return;

    setIsLoading(true);
    try {
      const storageRef = ref(storage, `profile-images/${user.email}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateUserProfile({ photoURL });
      
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar la foto de perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Perfil</CardTitle>
        <CardDescription>
          Actualiza tu información personal
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div 
              onClick={handleImageClick}
              className="cursor-pointer relative group"
            >
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Icons.camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="text-sm text-muted-foreground">
              Haz clic en la imagen para cambiar tu foto de perfil
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user?.displayName || ''}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Guardar Cambios
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 