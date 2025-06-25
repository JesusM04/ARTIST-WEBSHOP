'use client';

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { 
  User,
  ShoppingCart,
  MessageSquare,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  ListOrdered,
  BarChart2,
  FileText,
  Paintbrush,
  Home,
  Heart,
  CreditCard,
  LogOut,
  Users,
  Bell
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onExpand?: (expanded: boolean) => void;
}

// Tipos para menús y configuración de navegación
interface MenuItem {
  title: string;
  icon: React.ElementType;
  href: string;
  submenu?: MenuItem[];
  badge?: number | string;
}

interface NavigationConfig {
  [key: string]: {
    mainMenu: MenuItem[];
    footerMenu: MenuItem[];
  };
}

// Configuración de navegación
const navigationConfig: NavigationConfig = {
  client: {
    mainMenu: [
      {
        title: "Dashboard",
        icon: Home,
        href: "/sections/client",
      },
      {
        title: "Explorar Arte",
        icon: Paintbrush,
        href: "/sections/client/explore",
      },
      {
        title: "Pedidos",
        icon: FileText,
        href: "/sections/client/orders",
        submenu: [
          {
            title: "Hacer un pedido",
            icon: PlusCircle,
            href: "/sections/client/buy",
          },
          {
            title: "Mis pedidos",
            icon: ShoppingCart,
            href: "/sections/client/orders",
          },
          {
            title: "Estadísticas",
            icon: BarChart2,
            href: "/sections/client/stats",
          },
        ],
      },
      {
        title: "Favoritos",
        icon: Heart,
        href: "/sections/client/favorites",
      },
      {
        title: "Chat",
        icon: MessageSquare,
        href: "/sections/chat",
      },
    ],
    footerMenu: [
      {
        title: "Notificaciones",
        icon: Bell,
        href: "/notifications",
      },
      {
        title: "Configuración",
        icon: Settings,
        href: "/settings",
      },
      {
        title: "Ayuda",
        icon: HelpCircle,
        href: "/help",
      },
    ],
  },
  artist: {
    mainMenu: [
      {
        title: "Dashboard",
        icon: Home,
        href: "/sections/artist",
      },
      {
        title: "Mi Perfil",
        icon: User,
        href: "/sections/artist/profile",
      },
      {
        title: "Pedidos",
        icon: FileText,
        href: "/sections/artist/orders",
        submenu: [
          {
            title: "Pedidos pendientes",
            icon: ListOrdered,
            href: "/sections/artist/orders",
          },
          {
            title: "Portafolio",
            icon: PlusCircle,
            href: "/sections/artist/portfolio",
          },
          {
            title: "Estadísticas",
            icon: BarChart2,
            href: "/sections/artist/stats",
          },
        ],
      },
      {
        title: "Clientes",
        icon: Users,
        href: "/sections/artist/clients",
      },
      {
        title: "Chat",
        icon: MessageSquare,
        href: "/sections/chat",
      },
    ],
    footerMenu: [
      {
        title: "Notificaciones",
        icon: Bell,
        href: "/notifications",
      },
      {
        title: "Configuración",
        icon: Settings,
        href: "/settings",
      },
      {
        title: "Ayuda",
        icon: HelpCircle,
        href: "/help",
      },
    ],
  },
};

export function Sidebar({ className, onExpand }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Detectar móvil
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // En dispositivos móviles, iniciar colapsado pero permitir expandir después
      if (mobile && !document.documentElement.classList.contains('sidebar-init')) {
        setIsExpanded(false);
        document.documentElement.classList.add('sidebar-init');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
    onExpand?.(expanded);
  };
  
  const toggleCollapsible = (title: string) => {
    setOpenCollapsibles(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Simular proceso de cierre de sesión
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ejecutar función de logout
      if (logout) {
        await logout();
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  };

  if (!user?.role || !navigationConfig[user.role as keyof typeof navigationConfig]) {
    return null;
  }

  const { mainMenu, footerMenu } = navigationConfig[user.role as keyof typeof navigationConfig];
  
  // Extraer iniciales para el avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Función para renderizar items de menú
  const renderMenuItem = (item: MenuItem, isFooterItem = false) => {
    const isActive = pathname ? (pathname === item.href || pathname.startsWith(`${item.href}/`)) : false;
    const hasSubmenu = !!item.submenu?.length;
    
    // Para elementos con submenú cuando está colapsado, mostrar un menú flotante
    if (!isExpanded && hasSubmenu) {
      return (
        <TooltipProvider key={item.href} delayDuration={100}>
          <Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex w-full items-center justify-center py-2.5 px-0",
                    isActive ? "bg-gradient-to-r from-blue-100 to-sky-50 text-blue-600" : "text-gray-600 hover:bg-blue-50"
                  )}
                >
                  <span className="relative">
                    <item.icon size={20} />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="w-48 p-1">
                <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {item.submenu?.map((subItem) => (
                  <DropdownMenuItem key={subItem.href} asChild>
                    <Link
                      href={subItem.href}
                      className={cn(
                        "flex items-center gap-2 w-full",
                        pathname === subItem.href && "bg-accent"
                      )}
                    >
                      <subItem.icon size={14} />
                      <span>{subItem.title}</span>
                      {subItem.badge && (
                        <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipTrigger asChild>
              <div className="sr-only">{item.title}</div>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center">
              {item.title}
              {item.badge && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                  {item.badge}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Original renderMenuItem para casos normales
    return (
      <TooltipProvider key={item.href} delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            {!hasSubmenu ? (
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive 
                    ? "bg-gradient-to-r from-blue-100 to-sky-50 text-blue-600 dark:from-blue-950 dark:to-blue-900 dark:text-blue-300" 
                    : "text-gray-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-950/30",
                  isFooterItem && "text-gray-500",
                  !isExpanded && "justify-center py-2.5 px-0"
                )}
              >
                <span className="relative">
                  <item.icon size={isExpanded ? 16 : 20} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {item.badge}
                    </span>
                  )}
                </span>
                {isExpanded && (
                  <span className="truncate flex-1">
                    {item.title}
                  </span>
                )}
              </Link>
            ) : (
              <Collapsible
                open={openCollapsibles[item.title]}
                onOpenChange={() => toggleCollapsible(item.title)}
                className={cn(
                  "w-full",
                  !isExpanded && "items-center"
                )}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm justify-between transition-colors",
                      isActive 
                        ? "bg-gradient-to-r from-blue-100 to-sky-50 text-blue-600 dark:from-blue-950 dark:to-blue-900 dark:text-blue-300" 
                        : "text-gray-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-950/30",
                      !isExpanded && "justify-center py-2.5 px-0"
                    )}
                  >
                    <div className={cn("flex items-center gap-3", !isExpanded && "justify-center")}>
                      <span className="relative">
                        <item.icon size={isExpanded ? 16 : 20} />
                        {item.badge && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      {isExpanded && (
                        <span className="truncate">
                          {item.title}
                        </span>
                      )}
                    </div>
                    {isExpanded && (
                      <ChevronRight
                        size={16}
                        className={cn(
                          "transition-transform",
                          openCollapsibles[item.title] && "rotate-90"
                        )}
                      />
                    )}
                  </Button>
                </CollapsibleTrigger>
                {isExpanded && (
                  <CollapsibleContent className="pl-6 pt-1">
                    {item.submenu?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          pathname === subItem.href
                            ? "bg-gradient-to-r from-blue-50 to-sky-50 text-blue-600 dark:from-blue-950 dark:to-blue-900 dark:text-blue-300"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        )}
                      >
                        <span className="relative">
                          <subItem.icon size={14} />
                          {subItem.badge && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                              {subItem.badge}
                            </span>
                          )}
                        </span>
                        <span className="truncate">
                          {subItem.title}
                        </span>
                      </Link>
                    ))}
                  </CollapsibleContent>
                )}
              </Collapsible>
            )}
          </TooltipTrigger>
          {!isExpanded && !hasSubmenu && (
            <TooltipContent side="right" className="flex items-center">
              {item.title}
              {item.badge && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                  {item.badge}
                </span>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <aside
        className={cn(
          "fixed top-16 z-40 h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out",
          isExpanded ? "w-56" : "w-[60px]",
          "bg-background border-r shadow-sm",
          className
        )}
      >
        {/* Botón de extender (siempre visible sin importar si es móvil) */}
        <div className="absolute right-1 top-1 z-50">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6 rounded-full bg-background/80 hover:bg-background shadow-sm"
            onClick={() => handleExpand(!isExpanded)}
            aria-label={isExpanded ? "Colapsar menú" : "Expandir menú"}
          >
            {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </Button>
        </div>

        {/* Header con avatar */}
        <div className={cn(
          "p-4 flex items-center border-b",
          isExpanded ? "flex-col gap-2 py-6" : "justify-center"
        )}>
          {user?.photoURL ? (
            <Avatar className="ring-1 ring-primary/10 h-10 w-10">
              <AvatarImage src={user.photoURL} alt={user.email || 'Usuario'} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="ring-1 ring-primary/10 h-10 w-10">
              <AvatarImage src="" alt={user?.email || 'Usuario'} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          
          {isExpanded && (
            <div className="text-center">
              <p className="text-sm font-medium truncate">{user?.displayName || user?.email?.split('@')[0] || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role === 'artist' ? 'Artista' : 'Cliente'}
              </p>
            </div>
          )}
        </div>
        
        <ScrollArea className="flex-1 py-2 px-1">
          <div className="flex flex-col gap-1 px-1">
            {/* Menú principal */}
            {mainMenu.map(item => renderMenuItem(item))}
            
            {/* Separador */}
            <div className={cn(
              "my-2 border-t border-gray-100 dark:border-gray-800",
              !isExpanded && "mx-2"
            )} />
            
            {/* Menú de pie */}
            {footerMenu.map(item => renderMenuItem(item, true))}
          </div>
        </ScrollArea>
        
        {/* Botón de cerrar sesión */}
        <div className={cn(
          "p-3 border-t",
          !isExpanded && "flex justify-center"
        )}>
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors",
              !isExpanded && "justify-center px-0"
            )}
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut size={isExpanded ? 16 : 20} />
            {isExpanded && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      </aside>
      
      {/* Overlay para dispositivos móviles cuando el sidebar está expandido - siempre permitir cierre al dar clic */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => handleExpand(false)}
        />
      )}
      
      {/* Diálogo de confirmación de cierre de sesión */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden border-0 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
            <DialogTitle className="text-xl font-medium">Cerrar Sesión</DialogTitle>
            <DialogDescription className="text-white/90 text-sm mt-1.5">
              Estás a punto de cerrar tu sesión actual
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas cerrar tu sesión? Necesitarás volver a iniciar sesión para acceder a tus datos.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setLogoutDialogOpen(false)}
                className="border-gray-200"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
