"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeaderBar } from "@/components/admin-header-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/lib/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {isLoginPage ? (
          <div className="min-h-screen bg-background">
            {children}
            <Toaster />
          </div>
        ) : (
          <div className="min-h-screen bg-background">
            <AdminSidebar />
            <div className="lg:pl-64">
              <AdminHeaderBar />
              <main className="min-h-screen bg-background">
                {children}
              </main>
            </div>
            <Toaster />
          </div>
        )}
      </ThemeProvider>
    </QueryProvider>
  )
}
