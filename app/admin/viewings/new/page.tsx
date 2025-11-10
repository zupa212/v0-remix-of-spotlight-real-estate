import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBackButton } from "@/components/admin-back-button"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { ViewingForm } from "@/components/viewing-form"

export const dynamic = "force-dynamic"

export default async function NewViewingPage() {
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
          <AdminBreadcrumbs items={[
            { label: "Viewings", href: "/admin/viewings" },
            { label: "Schedule Viewing" }
          ]} />
          <AdminBackButton href="/admin/viewings" label="Back to Viewings" />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Schedule New Viewing</h1>
            <p className="text-slate-600">Create a new property viewing appointment</p>
          </div>

          <ViewingForm />
        </div>
      </div>
    </div>
  )
}

