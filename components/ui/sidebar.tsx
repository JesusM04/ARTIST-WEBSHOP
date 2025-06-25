import { usePathname } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

interface SidebarProps {
  role: "client" | "artist" | "admin"
  isOpen: boolean
}

export function Sidebar({ role, isOpen }: SidebarProps) {
  const pathname = usePathname()

  const clientMenuItems = [
    {
      title: "Dashboard",
      href: "/dashboard/client",
      icon: "HomeIcon"
    },
    {
      title: "Perfil",
      href: "/perfiles/client",
      icon: "UserIcon"
    }
  ]

  const artistMenuItems = [
    {
      title: "Dashboard",
      href: "/dashboard/artist",
      icon: "HomeIcon"
    },
    {
      title: "Perfil",
      href: "/perfiles/artist",
      icon: "UserIcon"
    }
  ]

  const adminMenuItems = [
    {
      title: "Dashboard",
      href: "/dashboard/admin",
      icon: "HomeIcon"
    },
    {
      title: "Perfil",
      href: "/perfiles/admin",
      icon: "UserIcon"
    }
  ]

  const menuItems = role === 'client' 
    ? clientMenuItems 
    : role === 'artist' 
      ? artistMenuItems 
      : adminMenuItems

  return (
    <aside className={`w-64 ${isOpen ? '' : 'hidden'} md:flex flex-col h-screen bg-white border-r`}>
      <div className="flex flex-col flex-1 p-4">
        <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
              className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
                pathname === item.href ? 'bg-gray-100' : ''
              }`}
            >
              <span>{item.title}</span>
              </Link>
            ))}
        </nav>
      </div>
    </aside>
  )
} 