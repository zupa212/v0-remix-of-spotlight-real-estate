import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { AdminBackButton } from "@/components/admin-back-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PropertyCard } from "@/components/property-card"
import Link from "next/link"
import { Building2 } from "lucide-react"

// Force dynamic rendering
export const dynamic = "force-dynamic"

type SavedSearchMatchesParams = {
  params: Promise<{
    id: string
  }>
}

export default async function SavedSearchMatchesPage({ params }: SavedSearchMatchesParams) {
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

  // Build query based on filters
  let query = supabase
    .from("properties")
    .select(
      `
      id,
      title_en,
      city_en,
      listing_type,
      property_type,
      price_sale,
      price_rent,
      currency,
      bedrooms,
      bathrooms,
      area_sqm,
      featured,
      main_image_url,
      region:regions(name_en)
    `,
    )
    .eq("published", true)

  const filters = search.filters_json || {}

  // Apply filters
  if (filters.property_type) {
    if (Array.isArray(filters.property_type)) {
      query = query.in("property_type", filters.property_type)
    } else {
      query = query.eq("property_type", filters.property_type)
    }
  }

  if (filters.listing_type) {
    query = query.eq("listing_type", filters.listing_type)
  }

  if (filters.price_min) {
    query = query.gte("price_sale", filters.price_min)
  }

  if (filters.price_max) {
    query = query.lte("price_sale", filters.price_max)
  }

  if (filters.bedrooms_min) {
    query = query.gte("bedrooms", filters.bedrooms_min)
  }

  if (filters.region_id) {
    query = query.eq("region_id", filters.region_id)
  }

  const { data: properties } = await query.order("created_at", { ascending: false }).limit(50)

  const formatLocation = (city?: string | null, region?: { name_en: string } | null) => {
    const parts = [city, region?.name_en].filter(Boolean)
    return parts.join(", ")
  }

  const propertiesList =
    properties?.map((property) => {
      const listingType = property.listing_type ?? "sale"
      const price = listingType === "sale" ? property.price_sale : property.price_rent

      return {
        id: property.id,
        title: property.title_en ?? "Untitled Property",
        location: formatLocation(property.city_en, property.region),
        price: price ? Number(price) : 0,
        currency: property.currency ?? "EUR",
        bedrooms: property.bedrooms ?? undefined,
        bathrooms: property.bathrooms ?? undefined,
        area: property.area_sqm != null ? Number(property.area_sqm) : undefined,
        imageUrl: property.main_image_url || "/placeholder.svg",
        propertyType: property.property_type ?? "property",
        listingType: listingType === "both" ? "sale" : listingType,
        featured: Boolean(property.featured),
      }
    }) || []

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs
            items={[
              { label: "Saved Searches", href: "/admin/saved-searches" },
              { label: search.name || "Search", href: `/admin/saved-searches/${id}` },
              { label: "Matches" },
            ]}
          />
          <AdminBackButton href={`/admin/saved-searches/${id}`} label="Back to Search Details" />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Property Matches</h1>
            <p className="text-slate-600">
              Properties matching "{search.name}" search criteria ({propertiesList.length} found)
            </p>
          </div>

          {propertiesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertiesList.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">No properties match this search criteria</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/admin/properties">Browse All Properties</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


