import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <AdminSidebar />
      <main className="lg:pl-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
