import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBackButton } from "@/components/admin-back-button"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { ViewingForm } from "@/components/viewing-form"

export const dynamic = "force-dynamic"

type ViewingEditParams = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    status?: string
  }>
}

export default async function EditViewingPage({ params, searchParams }: ViewingEditParams) {
  const { id } = await params
  const { status } = await searchParams
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

  // Fetch viewing data
  const { data: viewing, error } = await supabase
    .from("viewings")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !viewing) {
    notFound()
  }

  // If status query param is provided, update the viewing status
  if (status && status !== viewing.status) {
    const validStatuses = ["scheduled", "confirmed", "completed", "cancelled", "no_show"]
    if (validStatuses.includes(status)) {
      await supabase
        .from("viewings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
      
      // Refresh viewing data
      const { data: updatedViewing } = await supabase
        .from("viewings")
        .select("*")
        .eq("id", id)
        .single()
      
      if (updatedViewing) {
        // Redirect to detail page to show updated status
        redirect(`/admin/viewings/${id}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs items={[
            { label: "Viewings", href: "/admin/viewings" },
            { label: viewing.id.substring(0, 8), href: `/admin/viewings/${viewing.id}` },
            { label: "Edit" }
          ]} />
          <AdminBackButton href={`/admin/viewings/${viewing.id}`} label="Back to Viewing" />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Viewing</h1>
            <p className="text-slate-600">Update viewing details</p>
          </div>

          <ViewingForm initialData={viewing} isEdit={true} />
        </div>
      </div>
    </div>
  )
}

