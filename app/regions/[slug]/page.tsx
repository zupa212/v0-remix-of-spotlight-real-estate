import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PropertyCard } from "@/components/property-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Building2, TrendingUp, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function RegionDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  // Fetch region by slug
  const { data: region, error: regionError } = await supabase
    .from("regions")
    .select("*")
    .eq("slug", params.slug)
    .single()

  if (regionError || !region) {
    notFound()
  }

  // Fetch properties in this region
  const { data: properties } = await supabase
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
    .eq("region_id", region.id)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6)

  // Calculate average price
  const { data: priceData } = await supabase
    .from("properties")
    .select("price_sale")
    .eq("region_id", region.id)
    .eq("published", true)
    .not("price_sale", "is", null)

  const avgPrice =
    priceData && priceData.length > 0
      ? priceData.reduce((sum, p) => sum + Number(p.price_sale || 0), 0) / priceData.length
      : null

  // Get property count
  const { count: propertyCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("region_id", region.id)
    .eq("published", true)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

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
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end overflow-hidden">
        {region.image_url ? (
          <Image
            src={region.image_url}
            alt={region.name_en}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />

        <div className="relative z-10 w-full pb-16">
          <div className="w-full px-6 lg:px-8">
            <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
              Region Guide
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">{region.name_en}</h1>
            {region.name_gr && <p className="text-2xl text-white/90 mb-6">{region.name_gr}</p>}
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span>{propertyCount || 0} Properties</span>
              </div>
              {avgPrice && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Avg {formatPrice(avgPrice)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="w-full px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* About */}
              {(region.description_en || region.description_gr) && (
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">About {region.name_en}</h2>
                  {region.description_en && (
                    <p className="text-lg text-slate-600 leading-relaxed mb-4">{region.description_en}</p>
                  )}
                  {region.description_gr && (
                    <p className="text-lg text-slate-600 leading-relaxed">{region.description_gr}</p>
                  )}
                </div>
              )}

              {/* Properties */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Properties in {region.name_en}
                  </h2>
                  <Button variant="outline" asChild>
                    <a href={`/properties?region=${region.slug}`}>
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
                {propertiesList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {propertiesList.map((property) => (
                      <PropertyCard key={property.id} {...property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600">No properties available in this region yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA */}
              <div className="bg-slate-900 text-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">Interested in {region.name_en}?</h3>
                <p className="text-slate-300 mb-6">
                  Get in touch with our local experts to find your perfect property.
                </p>
                <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-100">
                  <a href="/contact">Contact Us</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
