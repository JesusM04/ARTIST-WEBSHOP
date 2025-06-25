"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/lib/AuthContext"

interface ProfileNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
  }[]
  role: string
}

export function ProfileNav({ className, items, role, ...props }: ProfileNavProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const defaultItems = {
    client: [
      {
        href: "/profile",
        title: "Mi Perfil"
      },
      {
        href: "/orders/new",
        title: "Hacer Pedido"
      },
      {
        href: "/orders/list",
        title: "Mis Pedidos"
      },
      {
        href: "/chat",
        title: "Chat"
      }
    ],
    artist: [
      {
        href: "/artist",
        title: "Panel"
      },
      {
        href: "/artist/orders",
        title: "Pedidos"
      },
      {
        href: "/artist/stats",
        title: "Estadísticas"
      },
      {
        href: "/chat",
        title: "Chat"
      }
    ]
  }

  const navItems = items || defaultItems[role as keyof typeof defaultItems] || []

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
} 