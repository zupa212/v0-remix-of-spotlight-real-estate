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

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  // Mock property data - in production, fetch from Supabase using params.id
  const property = {
    id: params.id,
    property_code: "SP25-0001",
    title: "Luxury Villa with Sea View",
    description:
      "Stunning luxury villa perched on the hillside of Mykonos with breathtaking panoramic sea views. This exceptional property combines modern architecture with traditional Cycladic elements, featuring spacious living areas, high-end finishes, and an infinity pool overlooking the Aegean Sea. Perfect for those seeking the ultimate Mediterranean lifestyle.",
    city: "Mykonos",
    region: "Cyclades",
    price: 2500000,
    currency: "EUR",
    type: "villa",
    category: "sale",
    bedrooms: 5,
    bathrooms: 4,
    area_sqm: 350,
    hero_image: "/luxury-villa-sea-view-mykonos.jpg",
    plotSize: 800,
    yearBuilt: 2020,
    status: "available",
    features: [
      "Infinity Pool",
      "Sea View",
      "Private Garden",
      "Parking Space",
      "Air Conditioning",
      "Heating System",
      "Solar Panels",
      "Security System",
      "Smart Home",
      "BBQ Area",
    ],
    amenities: [
      "Fully Furnished",
      "Modern Kitchen",
      "Walk-in Closets",
      "Ensuite Bathrooms",
      "Guest House",
      "Wine Cellar",
    ],
    images: [
      "/luxury-villa-sea-view-mykonos.jpg",
      "/placeholder.svg?key=villa2",
      "/placeholder.svg?key=villa3",
      "/placeholder.svg?key=villa4",
      "/placeholder.svg?key=villa5",
      "/placeholder.svg?key=villa6",
    ],
    tour3dUrl: "https://example.com/3d-tour",
    agent: {
      name: "Maria Papadopoulos",
      email: "maria@spotlight.gr",
      phone: "+30 210 123 4567",
      avatar: "/placeholder.svg?key=agent",
    },
  }

  const similarProperties = [
    {
      id: "2",
      title: "Modern Apartment in City Center",
      location: "Athens, Attica",
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      imageUrl: "/modern-apartment-athens-city.jpg",
      propertyType: "apartment",
      listingType: "sale" as const,
    },
    {
      id: "3",
      title: "Beachfront House",
      location: "Santorini, Cyclades",
      price: 1800000,
      bedrooms: 4,
      bathrooms: 3,
      area: 280,
      imageUrl: "/beachfront-house-santorini.jpg",
      propertyType: "house",
      listingType: "sale" as const,
    },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: property.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-white">
      <PropertyJSONLD property={property} />

      <SiteHeader />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <Badge className="mb-3 bg-sky-100 text-sky-700 hover:bg-sky-200 border-0">
                  {property.property_code}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">{property.title}</h1>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">
                    {property.city}, {property.region}
                  </span>
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
              <div className="text-3xl font-bold text-slate-900">{formatPrice(property.price)}</div>
              <Badge variant="secondary" className="capitalize">
                For {property.category}
              </Badge>
              <Badge
                variant="secondary"
                className={
                  property.status === "available" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }
              >
                {property.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery */}
              <PropertyGallery images={property.images} title={property.title} />

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
                        <div className="text-2xl font-bold text-slate-900">{property.bedrooms}</div>
                        <div className="text-sm text-slate-600">Bedrooms</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
                        <Bath className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">{property.bathrooms}</div>
                        <div className="text-sm text-slate-600">Bathrooms</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
                        <Maximize className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">{property.area_sqm}</div>
                        <div className="text-sm text-slate-600">m² Area</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">{property.yearBuilt}</div>
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
                  <p className="text-slate-600 leading-relaxed">{property.description}</p>
                </CardContent>
              </Card>

              {/* Features & Amenities */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Features & Amenities</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Property Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-slate-600">
                            <Zap className="h-4 w-4 text-sky-600" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center gap-2 text-slate-600">
                            <Home className="h-4 w-4 text-sky-600" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3D Tour */}
              {property.tour3dUrl && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Virtual Tour</h2>
                    <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                      <p className="text-slate-600">3D Tour Embed Placeholder</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Map */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Location</h2>
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                    <p className="text-slate-600">Map Embed Placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Inquiry Form */}
              <InquiryForm propertyId={property.id} propertyTitle={property.title} />

              {/* Agent Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Contact Agent</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{property.agent.name}</div>
                      <div className="text-sm text-slate-600">Real Estate Agent</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      <Phone className="h-4 w-4" />
                      {property.agent.phone}
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      <Mail className="h-4 w-4" />
                      {property.agent.email}
                    </Button>
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
                      <span className="font-medium text-slate-900 capitalize">{property.type}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">Plot Size</span>
                      <span className="font-medium text-slate-900">{property.plotSize} m²</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">Year Built</span>
                      <span className="font-medium text-slate-900">{property.yearBuilt}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">Property ID</span>
                      <span className="font-medium text-slate-900">{property.property_code}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Similar Properties */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop.id} {...prop} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
