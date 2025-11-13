import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:pl-64 min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
