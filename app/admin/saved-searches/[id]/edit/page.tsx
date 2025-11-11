import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { AdminBackButton } from "@/components/admin-back-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { SavedSearchForm } from "@/components/saved-search-form"

// Force dynamic rendering
export const dynamic = "force-dynamic"

type SavedSearchEditParams = {
  params: Promise<{
    id: string
  }>
}

export default async function EditSavedSearchPage({ params }: SavedSearchEditParams) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/admin/login")
  }

  // Fetch saved search
  const { data: search, error } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !search) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs
            items={[
              { label: "Saved Searches", href: "/admin/saved-searches" },
              { label: search.name || "Search", href: `/admin/saved-searches/${id}` },
              { label: "Edit" },
            ]}
          />
          <AdminBackButton href={`/admin/saved-searches/${id}`} label="Back to Search Details" />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Saved Search</h1>
            <p className="text-slate-600">Update search criteria and settings</p>
          </div>

          <SavedSearchForm initialData={search} isEdit={true} />
        </div>
      </div>
    </div>
  )
}


