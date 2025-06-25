"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  User,
  ShoppingBag,
  MessageSquare,
  Settings,
  HelpCircle,
} from "lucide-react"

interface SidebarProps {
  role: "client" | "artist"
  isOpen?: boolean
}

export function Sidebar({ role, isOpen = true }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Mi Perfil",
      icon: User,
      href: "/profile",
      color: "text-sky-500",
    },
    {
      label: "Pedidos",
      icon: ShoppingBag,
      href: role === "client" ? "/orders" : "/sections/artist/orders",
      color: "text-violet-500",
    },
    {
      label: "Chat",
      icon: MessageSquare,
      href: "/chat",
      color: "text-pink-700",
    },
  ]

  const footerRoutes = [
    {
      label: "Configuración",
      icon: Settings,
      href: "/settings",
      color: "text-gray-500",
    },
    {
      label: "Ayuda",
      icon: HelpCircle,
      href: "/help",
      color: "text-gray-500",
    },
  ]

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-full w-64 -translate-x-full border-r bg-background transition-transform md:translate-x-0",
        isOpen && "translate-x-0"
      )}
    >
      <ScrollArea className="h-full py-16">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                >
                  <Button
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <route.icon className={cn("mr-2 h-5 w-5", route.color)} />
                    {route.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <div className="space-y-1">
            {footerRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
              >
                <Button
                  variant={pathname === route.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <route.icon className={cn("mr-2 h-5 w-5", route.color)} />
                  {route.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 