import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PropertyCard } from "@/components/property-card"
import { PropertyFilters } from "@/components/property-filters"
import { SaveSearchDialog } from "@/components/save-search-dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type PropertyListItem = {
  id: string
  title: string
  location: string
  price: number
  currency: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  imageUrl: string
  propertyType: string
  listingType: "sale" | "rent"
  featured: boolean
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatLocation(city?: string | null, region?: string | null) {
  const parts = [city, region].filter((part) => typeof part === "string" && part.trim().length > 0) as string[]
  if (parts.length === 0) return "Greece"
  if (parts.length === 1) return toTitleCase(parts[0])
  return parts.map((part) => toTitleCase(part)).join(", ")
}

export default async function PropertiesPage() {
  const supabase = await createClient()

  const { data: propertiesData, error } = await supabase
    .from("properties")
    .select(
      `
        id,
        property_code,
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
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load properties", error)
  }

  const properties: PropertyListItem[] = (propertiesData ?? []).map((property) => {
    const listingType = property.listing_type === "rent" ? "rent" : "sale"
    const priceValue =
      listingType === "rent"
        ? Number(property.price_rent ?? 0)
        : Number(property.price_sale ?? property.price_rent ?? 0)

    return {
      id: property.id,
      title: property.title_en ?? "Untitled Property",
      location: formatLocation(property.city_en, property.region?.name_en),
      price: Number.isFinite(priceValue) ? priceValue : 0,
      currency: property.currency ?? "EUR",
      bedrooms: property.bedrooms ?? undefined,
      bathrooms: property.bathrooms ?? undefined,
      area: property.area_sqm != null ? Number(property.area_sqm) : undefined,
      imageUrl: property.main_image_url || "/placeholder.svg",
      propertyType: property.property_type ?? "property",
      listingType,
      featured: Boolean(property.featured),
    }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      {/* Page Header */}
      <section className="pt-32 pb-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-sky-100 text-sky-700 hover:bg-sky-200 border-0">Property Listings</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Find Your Perfect Property</h1>
            <p className="text-lg text-slate-600 text-pretty">
              Browse our extensive collection of premium properties across Greece
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PropertyFilters />

          {/* Results Header */}
          <div className="flex items-center justify-between mt-8 mb-6">
            <p className="text-slate-600">
              Showing <span className="font-semibold text-slate-900">{properties.length}</span> properties
            </p>
            <div className="flex items-center gap-3">
              <SaveSearchDialog filters={{ type: "all", priceRange: "all" }} />
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
                  <SelectItem value="area">Largest Area</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Unable to load the latest property listings right now. Please try again shortly.
            </div>
          )}

          {/* Properties Grid */}
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-600">
              {error
                ? "Unable to display properties at the moment. Please refresh the page or try again later."
                : "No properties are available right now. Check back soon as new listings are added regularly."}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-12 flex justify-center gap-2">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="outline" className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white">
              1
            </Button>
            <Button variant="outline" disabled>
              Next
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
