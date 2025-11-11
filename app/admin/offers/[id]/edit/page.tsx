import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { AdminBackButton } from "@/components/admin-back-button"
import { OfferForm } from "@/components/offer-form"

// Force dynamic rendering
export const dynamic = "force-dynamic"

type OfferEditParams = {
  params: Promise<{
    id: string
  }>
}

export default async function EditOfferPage({ params }: OfferEditParams) {
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

  // Fetch offer data
  const { data: offer, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !offer) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs
            items={[
              { label: "Offers", href: "/admin/offers" },
              { label: `Offer ${id.substring(0, 8)}`, href: `/admin/offers/${id}` },
              { label: "Edit" },
            ]}
          />
          <AdminBackButton href={`/admin/offers/${id}`} label="Back to Offer Details" />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Offer</h1>
            <p className="text-slate-600">Update offer details</p>
          </div>

          <OfferForm initialData={offer} isEdit={true} />
        </div>
      </div>
    </div>
  )
}


