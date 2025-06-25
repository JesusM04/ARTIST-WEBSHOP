"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ChevronFirst,
  ChevronLast,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  List,
  BarChart,
  MessageSquare,
  Brush,
  Palette,
  Users,
  Star,
  DollarSign,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons"

type Role = "client" | "artist" | "admin" | "directivo"

interface NavigationItem {
  type: "link" | "group"
  name: string
  href?: string
  icon: any
  title?: string
  items?: {
    name: string
    href: string
    icon: any
  }[]
}

interface ProfileSidebarProps {
  role: Role
}

const navigationItems: Record<Role, NavigationItem[]> = {
  client: [
    {
      type: "link",
      name: "Mi Perfil",
      href: "/sections/client",
      icon: LayoutDashboard
    },
    {
      type: "group",
      name: "Pedidos",
      title: "Pedidos",
      icon: Brush,
      items: [
        {
          name: "Hacer un pedido",
          href: "/sections/client/buy",
          icon: ShoppingCart
        },
        {
          name: "Ver mis pedidos",
          href: "/sections/client/orders",
          icon: FileText
        },
        {
          name: "Estadísticas",
          href: "/sections/client/stats",
          icon: BarChart
        }
      ]
    },
    {
      type: "link",
      name: "Chat",
      href: "/sections/client/chat",
      icon: MessageSquare
    },
    {
      type: "link",
      name: "Configuración",
      href: "/sections/client/settings",
      icon: Settings
    }
  ],
  artist: [
    {
      type: "link",
      name: "Mi Perfil",
      href: "/sections/artist",
      icon: LayoutDashboard
    },
    {
      type: "group",
      name: "Gestión de Trabajos",
      title: "Gestión de Trabajos",
      icon: Palette,
      items: [
        {
          name: "Pedidos",
          href: "/sections/artist/orders",
          icon: List
        },
        {
          name: "Mis obras",
          href: "/sections/artist/portfolio",
          icon: ShoppingCart
        },
        {
          name: "Estadísticas",
          href: "/sections/artist/stats",
          icon: Star
        }
      ]
    },
    {
      type: "group",
      name: "Finanzas",
      title: "Finanzas",
      icon: DollarSign,
      items: [
        {
          name: "Ganancias",
          href: "/sections/artist/earnings",
          icon: BarChart
        },
        {
          name: "Facturación",
          href: "/sections/artist/billing",
          icon: DollarSign
        }
      ]
    },
    {
      type: "link",
      name: "Clientes",
      href: "/sections/artist/clients",
      icon: Users
    },
    {
      type: "link",
      name: "Chat",
      href: "/sections/artist/chat",
      icon: MessageSquare
    },
    {
      type: "link",
      name: "Configuración",
      href: "/sections/artist/settings",
      icon: Settings
    }
  ],
  admin: [
    {
      type: "link",
      name: "Perfil",
      href: "/profile",
      icon: "user"
    },
    {
      type: "link",
      name: "Usuarios",
      href: "/users",
      icon: "users"
    },
    {
      type: "link",
      name: "Configuración",
      href: "/settings",
      icon: "settings"
    }
  ],
  directivo: [
    {
      type: "link",
      name: "Perfil",
      href: "/profile",
      icon: "user"
    },
    {
      type: "link",
      name: "Reportes",
      href: "/reports",
      icon: "fileText"
    },
    {
      type: "link",
      name: "Configuración",
      href: "/settings",
      icon: "settings"
    }
  ]
}

export function ProfileSidebar({ role }: ProfileSidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const items = navigationItems[role]

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const renderNavigationItem = (item: NavigationItem, index: number) => {
    if (item.type === "link" && item.href) {
      const button = (
        <Button
          variant={pathname === item.href ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            !expanded && "px-2"
          )}
        >
          {item.icon && <item.icon className={cn("h-4 w-4", expanded && "mr-2")} />}
          {expanded && item.name}
        </Button>
      )

      return expanded ? (
        <Link key={index} href={item.href}>
          {button}
        </Link>
      ) : (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={item.href}>
                {button}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              {item.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (item.type === "group" && item.items) {
      return (
        <Collapsible
          key={index}
          open={openSections[item.title || item.name]}
          onOpenChange={() => toggleSection(item.title || item.name)}
          className="space-y-2"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                !expanded && "px-2"
              )}
            >
              {item.icon && (
                <item.icon className={cn("h-4 w-4", expanded && "mr-2")} />
              )}
              {expanded && (
                <>
                  <span className="flex-1 text-left">{item.title || item.name}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {item.items.map((subItem, subIndex) => {
              const subButton = (
                <Button
                  variant={pathname === subItem.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    expanded ? "pl-8" : "px-2"
                  )}
                >
                  {subItem.icon && (
                    <subItem.icon className={cn("h-4 w-4", expanded && "mr-2")} />
                  )}
                  {expanded && subItem.name}
                </Button>
              )

              return expanded ? (
                <Link key={`${index}-${subIndex}`} href={subItem.href}>
                  {subButton}
                </Link>
              ) : (
                <TooltipProvider key={`${index}-${subIndex}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={subItem.href}>
                        {subButton}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {subItem.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return null
  }

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 border-r transition-all duration-300 bg-white",
        expanded ? "w-64" : "w-16"
      )}
    >
      <nav className="h-full flex flex-col">
        <div className="p-4 pb-2 flex justify-between items-center border-b bg-white">
          {expanded && <span className="text-xl font-semibold">Menú</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8"
          >
            {expanded ? <ChevronFirst className="h-4 w-4" /> : <ChevronLast className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-2">
            <div className="space-y-1">
              {items.map((item, index) => renderNavigationItem(item, index))}
            </div>
          </ScrollArea>
        </div>
      </nav>
    </aside>
  )
}
