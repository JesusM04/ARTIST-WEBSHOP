"use client"

import { useState, useEffect } from "react";
import { UserNav } from "@/components/nav/user-nav";
import { Sidebar } from "@/components/nav/sidebar";
import { cn } from "@/lib/utils";

interface ProfileLayoutProps {
  children: React.ReactNode;
  role?: "client" | "artist" | "admin" | "guest";
}

export function ProfileLayout({ children, role = "client" }: ProfileLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    // Marcar la página como cargada inmediatamente
    setIsPageLoaded(true);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header con UserNav */}
      <UserNav />

      <div className="flex pt-16">
        {/* Sidebar siempre visible */}
        <Sidebar 
          className="h-[calc(100vh-4rem)] z-40"
          onExpand={setIsExpanded}
        />

        {/* Main Content con skeleton loader */}
        <main
          className={cn(
            "flex-1 h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out overflow-hidden bg-background",
            isExpanded && !isMobile ? "ml-56" : "ml-[60px]",
            "p-0"
          )}
        >
          {!isPageLoaded ? (
            <div className="flex justify-center items-center h-full w-full">
              <div className="animate-pulse flex flex-col gap-3 w-4/5 max-w-2xl">
                <div className="h-8 bg-gray-200 rounded-md dark:bg-gray-700 w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded-md dark:bg-gray-700 w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md dark:bg-gray-700 w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md dark:bg-gray-700 w-3/4"></div>
                <div className="h-64 bg-gray-200 rounded-md dark:bg-gray-700 w-full"></div>
              </div>
            </div>
          ) : (
            <div className="content-container">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 