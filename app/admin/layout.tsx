import type React from "react"
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
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
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
      </ThemeProvider>
    </QueryProvider>
  )
}
