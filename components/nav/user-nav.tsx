'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { Bell, Sun, Moon, Laptop, LogOut, Loader2 } from "lucide-react";

interface UserNavProps {
  onMenuClick?: () => void
}

export function UserNav({ onMenuClick }: UserNavProps) {
  const { user, logout, updateUserProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    try {
      await updateUserProfile({ theme });
    } catch (error) {
      console.error('Error al cambiar el tema:', error);
    }
  };

  const handleProfileClick = () => {
    if (pathname && pathname.includes('/sections/artist')) {
      router.push('/sections/artist/profile');
    } 
    // else if (pathname && pathname.includes('/sections/client')) {
    //   router.push('/sections/client');
    // } 
    else {
      router.push('/sections/client');
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.photoURL || ''} alt={user?.email || 'Usuario'} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName || user?.email?.split("@")[0] || 'Usuario'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleProfileClick}>
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span>Tema</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Claro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Oscuro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                      <Laptop className="mr-2 h-4 w-4" />
                      <span>Sistema</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Configuración
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Diálogo de confirmación para cerrar sesión */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Estás seguro que quieres cerrar sesión?</DialogTitle>
            <DialogDescription>
              Tu sesión será cerrada y tendrás que volver a iniciar sesión para acceder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
              disabled={isLoggingOut}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="gap-1"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cerrando sesión...</span>
                </>
              ) : (
                <span>Cerrar sesión</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 