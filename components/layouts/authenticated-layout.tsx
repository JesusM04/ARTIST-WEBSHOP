"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { UserNav } from "@/components/nav/user-nav"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  role: "client" | "artist"
}

export function AuthenticatedLayout({ children, role }: AuthenticatedLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <UserNav onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar role={role} isOpen={isSidebarOpen} />
      <main className="pt-16 md:pl-64">
        {children}
      </main>
    </div>
  )
} 