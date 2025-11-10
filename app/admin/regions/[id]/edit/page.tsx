import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { RegionForm } from "@/components/region-form"

export const dynamic = "force-dynamic"

type RegionEditParams = {
  params: Promise<{
    id: string
  }>
}

export default async function EditRegionPage({ params }: RegionEditParams) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/admin/login")
  }

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  // Fetch region data
  const { data: region, error } = await supabase.from("regions").select("*").eq("id", id).single()

  if (error || !region) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Region</h1>
            <p className="text-slate-600">Update region details</p>
          </div>

          <RegionForm initialData={region} isEdit={true} />
        </div>
      </div>
    </div>
  )
}

