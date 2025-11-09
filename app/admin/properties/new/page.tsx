import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PropertyForm } from "@/components/property-form"

// Force dynamic rendering to avoid build-time errors
export const dynamic = "force-dynamic"

export default async function NewPropertyPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Property</h1>
            <p className="text-slate-600">Create a new property listing</p>
          </div>

          <PropertyForm />
        </div>
      </div>
    </div>
  )
}
