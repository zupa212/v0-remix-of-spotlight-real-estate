import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs"
import { AdminBackButton } from "@/components/admin-back-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"
import { Edit, Building2, MapPin, DollarSign, Bed, Bath, Square, Calendar, User, Eye } from "lucide-react"
import { PropertyGallery } from "@/components/property-gallery"
import { PropertyDocuments } from "@/components/property-documents"

// Force dynamic rendering
export const dynamic = "force-dynamic"

type PropertyDetailParams = {
  params: Promise<{
    id: string
  }>
}

export default async function PropertyDetailPage({ params }: PropertyDetailParams) {
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

  // Fetch property with relations
  const { data: property, error } = await supabase
    .from("properties")
    .select(
      `
      *,
      region:regions(id, name_en, name_gr, slug),
      agent:agents(id, name_en, name_gr, email, phone, avatar_url)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Fetch property images
  const { data: images } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", id)
    .order("display_order", { ascending: true })

  // Fetch property documents
  const { data: documents } = await supabase
    .from("property_documents")
    .select("*")
    .eq("property_id", id)
    .order("created_at", { ascending: false })

  // Fetch related leads count
  const { count: leadsCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("property_id", id)

  // Fetch related viewings count
  const { count: viewingsCount } = await supabase
    .from("viewings")
    .select("*", { count: "exact", head: true })
    .eq("property_id", id)

  // Fetch related offers count
  const { count: offersCount } = await supabase
    .from("offers")
    .select("*", { count: "exact", head: true })
    .eq("property_id", id)

  const statusColors = {
    available: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    sold: "bg-blue-100 text-blue-800",
    rented: "bg-purple-100 text-purple-800",
    "off-market": "bg-gray-100 text-gray-800",
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          <AdminBreadcrumbs
            items={[
              { label: "Properties", href: "/admin/properties" },
              { label: property.title_en || "Property", href: `/properties/${property.id}` },
            ]}
          />
          <AdminBackButton href="/admin/properties" label="Back to Properties" />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{property.title_en}</h1>
                <Badge className={statusColors[property.status as keyof typeof statusColors]}>
                  {property.status}
                </Badge>
                {property.featured && <Badge variant="default">Featured</Badge>}
                {!property.published && <Badge variant="outline">Unpublished</Badge>}
              </div>
              <p className="text-slate-600">{property.property_code}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/properties/${property.id}`} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/admin/properties/${property.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Property
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Image */}
          {property.main_image_url && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <Image
                src={property.main_image_url}
                alt={property.title_en}
                width={1200}
                height={600}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">English</p>
                      <p className="text-sm whitespace-pre-wrap">
                        {property.description_en || "No description available"}
                      </p>
                    </div>
                    {property.description_gr && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Greek</p>
                        <p className="text-sm whitespace-pre-wrap">{property.description_gr}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Bedrooms</p>
                          <p className="font-medium">{property.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Bathrooms</p>
                          <p className="font-medium">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.area_sqm && (
                      <div className="flex items-center gap-2">
                        <Square className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Area</p>
                          <p className="font-medium">{property.area_sqm} m²</p>
                        </div>
                      </div>
                    )}
                    {property.plot_size_sqm && (
                      <div className="flex items-center gap-2">
                        <Square className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Plot Size</p>
                          <p className="font-medium">{property.plot_size_sqm} m²</p>
                        </div>
                      </div>
                    )}
                    {property.year_built && (
                      <div>
                        <p className="text-sm text-muted-foreground">Year Built</p>
                        <p className="font-medium">{property.year_built}</p>
                      </div>
                    )}
                    {property.energy_rating && (
                      <div>
                        <p className="text-sm text-muted-foreground">Energy Rating</p>
                        <p className="font-medium">{property.energy_rating}</p>
                      </div>
                    )}
                    {property.floor_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">Floor</p>
                        <p className="font-medium">
                          {property.floor_number}
                          {property.total_floors ? ` / ${property.total_floors}` : ""}
                        </p>
                      </div>
                    )}
                  </div>

                  {property.features && property.features.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-muted-foreground mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {property.features.map((feature: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {property.amenities && property.amenities.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Images Gallery */}
              {images && images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Property Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PropertyGallery images={images.map((img: any) => img.image_url)} />
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              {documents && documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PropertyDocuments documents={documents} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.price_sale && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sale Price</p>
                      <p className="text-2xl font-bold">
                        {property.currency} {Number(property.price_sale).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {property.price_rent && (
                    <div>
                      <p className="text-sm text-muted-foreground">Rent Price</p>
                      <p className="text-xl font-semibold">
                        {property.currency} {Number(property.price_rent).toLocaleString()}
                        <span className="text-sm font-normal"> / month</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {property.region && (
                    <div>
                      <p className="text-sm text-muted-foreground">Region</p>
                      <p className="font-medium">{property.region.name_en}</p>
                    </div>
                  )}
                  {property.city_en && (
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-medium">{property.city_en}</p>
                    </div>
                  )}
                  {property.address_en && (
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{property.address_en}</p>
                    </div>
                  )}
                  {property.postal_code && (
                    <div>
                      <p className="text-sm text-muted-foreground">Postal Code</p>
                      <p className="font-medium">{property.postal_code}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Agent */}
              {property.agent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Assigned Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      {property.agent.avatar_url && (
                        <Image
                          src={property.agent.avatar_url}
                          alt={property.agent.name_en}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{property.agent.name_en}</p>
                        {property.agent.email && (
                          <p className="text-sm text-muted-foreground">{property.agent.email}</p>
                        )}
                      </div>
                    </div>
                    {property.agent.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{property.agent.phone}</p>
                      </div>
                    )}
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/admin/agents/${property.agent.id}`}>View Agent Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Views</span>
                    <span className="font-medium">{property.views_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Leads</span>
                    <span className="font-medium">{leadsCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Viewings</span>
                    <span className="font-medium">{viewingsCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Offers</span>
                    <span className="font-medium">{offersCount || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{format(new Date(property.created_at), "PPpp")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>{format(new Date(property.updated_at), "PPpp")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


