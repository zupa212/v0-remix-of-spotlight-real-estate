import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PropertyGallery } from "@/components/property-gallery"
import { InquiryForm } from "@/components/inquiry-form"
import { PropertyCard } from "@/components/property-card"
import { PropertyJSONLD } from "@/components/property-seo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Bed, Bath, Maximize, MapPin, Calendar, Home, Zap, Share2, Heart, Phone, Mail, User } from "lucide-react"

type PropertyDetailParams = {
  params: {
    id: string
  }
}

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

const FALLBACK_IMAGE = "/placeholder.svg"

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatLocation(city?: string | null, region?: string | null) {
  const parts = [city, region].filter((part) => typeof part === "string" && part.trim().length > 0) as string[]
  if (parts.length === 0) return "Greece"
  if (parts.length === 1) return toTitleCase(parts[0])
  return parts.map((part) => toTitleCase(part)).join(", ")
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
}

function getPrimaryListingType(listingType: string | null): "sale" | "rent" {
  if (listingType === "rent") return "rent"
  return "sale"
}

function getListingBadgeText(listingType: string | null) {
  if (listingType === "rent") return "For Rent"
  if (listingType === "both") return "For Sale & Rent"
  return "For Sale"
}

function calculatePrice(listingType: string | null, priceSale: unknown, priceRent: unknown) {
  const saleValue = Number(priceSale ?? 0)
  const rentValue = Number(priceRent ?? 0)
  if (listingType === "rent") return Number.isFinite(rentValue) && rentValue > 0 ? rentValue : 0
  if (listingType === "both") {
    if (Number.isFinite(saleValue) && saleValue > 0) return saleValue
    if (Number.isFinite(rentValue) && rentValue > 0) return rentValue
    return 0
  }
  return Number.isFinite(saleValue) && saleValue > 0 ? saleValue : 0
}

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumeric(value: number | null | undefined, options?: Intl.NumberFormatOptions) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—"
  return Number(value).toLocaleString("en-US", options)
}

export default async function PropertyDetailPage({ params }: PropertyDetailParams) {
  const supabase = await createClient()

  const { data: propertyData, error: propertyError } = await supabase
    .from("properties")
    .select(
      `
        id,
        property_code,
        title_en,
        description_en,
        city_en,
        listing_type,
        property_type,
        status,
        price_sale,
        price_rent,
        currency,
        bedrooms,
        bathrooms,
        area_sqm,
        plot_size_sqm,
        year_built,
        features,
        amenities,
        tour_3d_url,
        main_image_url,
        region:regions(name_en),
        agent:agents (
          id,
          name_en,
          email,
          phone,
          avatar_url
        )
      `,
    )
    .eq("id", params.id)
    .eq("published", true)
    .single()

  if (propertyError || !propertyData) {
    console.error("Property not found", propertyError)
    notFound()
  }

  const [imagesResponse, similarResponse] = await Promise.all([
    supabase
      .from("property_images")
      .select("image_url, is_main, display_order")
      .eq("property_id", propertyData.id)
      .order("display_order", { ascending: true }),
    supabase
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
      .neq("id", propertyData.id)
      .eq("property_type", propertyData.property_type)
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  if (imagesResponse.error) {
    console.error("Failed to load property images", imagesResponse.error)
  }

  if (similarResponse.error) {
    console.error("Failed to load similar properties", similarResponse.error)
  }

  const galleryImages = (() => {
    const sortedImages = [...(imagesResponse.data ?? [])].sort((a, b) => {
      if (a.is_main === b.is_main) {
        return (a.display_order ?? 0) - (b.display_order ?? 0)
      }
      return a.is_main ? -1 : 1
    })

    const imageUrls = [propertyData.main_image_url, ...sortedImages.map((image) => image.image_url)].filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    )

    const unique = Array.from(new Set(imageUrls))
    return unique.length > 0 ? unique : [FALLBACK_IMAGE]
  })()

  const listingType = propertyData.listing_type ?? "sale"
  const primaryListingType = getPrimaryListingType(listingType)
  const priceValue = calculatePrice(listingType, propertyData.price_sale, propertyData.price_rent)
  const formattedPrice = priceValue > 0 ? formatPrice(priceValue, propertyData.currency ?? "EUR") : "Price on request"
  const features = normalizeStringArray(propertyData.features)
  const amenities = normalizeStringArray(propertyData.amenities)
  const propertyLocation = formatLocation(propertyData.city_en, propertyData.region?.name_en)

  const similarProperties: PropertyListItem[] = (similarResponse.data ?? []).map((property) => {
    const similarListingType = getPrimaryListingType(property.listing_type ?? "sale")
    const similarPrice = calculatePrice(property.listing_type, property.price_sale, property.price_rent)

    return {
      id: property.id,
      title: property.title_en ?? "Untitled Property",
      location: formatLocation(property.city_en, property.region?.name_en),
      price: Number.isFinite(similarPrice) ? similarPrice : 0,
      currency: property.currency ?? "EUR",
      bedrooms: property.bedrooms ?? undefined,
      bathrooms: property.bathrooms ?? undefined,
      area: property.area_sqm != null ? Number(property.area_sqm) : undefined,
      imageUrl: property.main_image_url || FALLBACK_IMAGE,
      propertyType: property.property_type ?? "property",
      listingType: similarListingType,
      featured: Boolean(property.featured),
    }
  })

  const seoProperty = {
    property_code: propertyData.property_code,
    title: propertyData.title_en ?? "Untitled Property",
    description: propertyData.description_en,
    price: priceValue,
    currency: propertyData.currency ?? "EUR",
    type: propertyData.property_type ?? "property",
    category: listingType,
    city: propertyData.city_en ?? "Greece",
    region: propertyData.region?.name_en ?? "Greece",
    bedrooms: propertyData.bedrooms,
    bathrooms: propertyData.bathrooms,
    area_sqm: propertyData.area_sqm != null ? Number(propertyData.area_sqm) : null,
    hero_image: galleryImages[0] ?? null,
  }

  const agentName = propertyData.agent?.name_en ?? "Spotlight Estate Group"
  const agentEmail = propertyData.agent?.email
  const agentPhone = propertyData.agent?.phone

  return (
    <div className="min-h-screen bg-white">
      <PropertyJSONLD property={seoProperty} />

      <SiteHeader />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <Badge className="mb-3 bg-sky-100 text-sky-700 hover:bg-sky-200 border-0">
                  {propertyData.property_code}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
                  {propertyData.title_en ?? "Untitled Property"}
                </h1>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{propertyLocation}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="text-3xl font-bold text-slate-900">{formattedPrice}</div>
              <Badge variant="secondary" className="capitalize">
                {getListingBadgeText(listingType)}
              </Badge>
              <Badge
                variant="secondary"
                className={
                  propertyData.status === "available"
                    ? "bg-green-100 text-green-700"
                    : propertyData.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-700"
                }
              >
                {propertyData.status ?? "available"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery */}
              <PropertyGallery images={galleryImages} title={propertyData.title_en ?? "Untitled Property"} />

              {/* Key Details */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Property Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
                        <Bed className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">
                          {formatNumeric(propertyData.bedrooms)}
                        </div>
                        <div className="text-sm text-slate-600">Bedrooms</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
                        <Bath className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">
                          {formatNumeric(propertyData.bathrooms)}
                        </div>
                        <div className="text-sm text-slate-600">Bathrooms</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
                        <Maximize className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">
                          {formatNumeric(propertyData.area_sqm, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-sm text-slate-600">m² Area</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">
                          {formatNumeric(propertyData.year_built)}
                        </div>
                        <div className="text-sm text-slate-600">Year Built</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Description</h2>
                  <p className="text-slate-600 leading-relaxed">
                    {propertyData.description_en ?? "Detailed property description will be available soon."}
                  </p>
                </CardContent>
              </Card>

              {/* Features & Amenities */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Features & Amenities</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Property Features</h3>
                      {features.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-slate-600">
                              <Zap className="h-4 w-4 text-sky-600" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600">Feature information will be added soon.</p>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Amenities</h3>
                      {amenities.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {amenities.map((amenity) => (
                            <div key={amenity} className="flex items-center gap-2 text-slate-600">
                              <Home className="h-4 w-4 text-sky-600" />
                              <span className="text-sm">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600">Amenity information will be added soon.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3D Tour */}
              {propertyData.tour_3d_url && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Virtual Tour</h2>
                    <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                      <p className="text-slate-600">A 3D tour will appear here.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Map */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Location</h2>
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                    <p className="text-slate-600">Interactive map integration coming soon.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Inquiry Form */}
              <InquiryForm
                propertyId={propertyData.id}
                propertyTitle={propertyData.title_en ?? "Untitled Property"}
              />

              {/* Agent Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Contact Agent</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{agentName}</div>
                      <div className="text-sm text-slate-600">
                        {agentEmail ?? "Our team will connect you with a dedicated agent."}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {agentPhone ? (
                      <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                        <Phone className="h-4 w-4" />
                        {agentPhone}
                      </Button>
                    ) : (
                      <p className="text-sm text-slate-600">
                        Call our office at <span className="font-medium text-slate-900">+30 210 000 0000</span>
                      </p>
                    )}
                    {agentEmail ? (
                      <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                        <Mail className="h-4 w-4" />
                        {agentEmail}
                      </Button>
                    ) : (
                      <p className="text-sm text-slate-600">
                        Email <span className="font-medium text-slate-900">info@spotlight.gr</span> for more
                        information.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Additional Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Property Type</span>
                      <span className="font-medium text-slate-900 capitalize">
                        {propertyData.property_type ?? "property"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">Plot Size</span>
                      <span className="font-medium text-slate-900">
                        {formatNumeric(propertyData.plot_size_sqm, { maximumFractionDigits: 0 })}
                        {propertyData.plot_size_sqm ? " m²" : ""}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">Year Built</span>
                      <span className="font-medium text-slate-900">{formatNumeric(propertyData.year_built)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">Property ID</span>
                      <span className="font-medium text-slate-900">{propertyData.property_code}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Similar Properties */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Similar Properties</h2>
            {similarProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {similarProperties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
                We don’t have any similar properties to show right now. Explore our listings for more options.
              </div>
            )}
          </section>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
